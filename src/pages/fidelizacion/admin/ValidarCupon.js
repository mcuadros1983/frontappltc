import React, { useContext, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
// import * as Contexts from "../../../context/Contexts";
import Contexts from "../../../context/Contexts";

const API_URL = process.env.REACT_APP_API_URL;

const formatDate = (value) => {
  if (!value) return "Sin vencimiento";

  return new Date(value).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getEstadoBadge = (estado) => {
  switch (estado) {
    case "disponible":
      return "success";
    case "usado":
      return "secondary";
    case "vencido":
      return "warning";
    case "anulado":
    case "cancelado":
      return "danger";
    default:
      return "info";
  }
};

const ValidarCupon = () => {
  const context = useContext(Contexts.DataContext);

  const sucursales = context?.sucursales || [];
  const user = context?.user || context?.usuario || null;

  const [codigo, setCodigo] = useState("");
  const [cupon, setCupon] = useState(null);
  const [validacion, setValidacion] = useState(null);

  const [sucursalId, setSucursalId] = useState(
    user?.sucursal_id || user?.sucursalId || ""
  );
  const [observaciones, setObservaciones] = useState("");

  const [loadingValidar, setLoadingValidar] = useState(false);
  const [loadingCanjear, setLoadingCanjear] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const limpiarResultado = () => {
    setCupon(null);
    setValidacion(null);
    setObservaciones("");
    setError("");
    setSuccess("");
  };

  const handleValidarCupon = async (e) => {
    e.preventDefault();

    if (!codigo.trim()) {
      setError("Ingresá número de cupón, token o código de validación");
      return;
    }

    try {
      setLoadingValidar(true);
      limpiarResultado();

      const response = await fetch(
        `${API_URL}/fidelizacion/admin/cupones/validar`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            codigo: codigo.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setCupon(data.data || null);
        setValidacion({
          ok: false,
          code: data.code,
          message: data.message || "Cupón no válido",
        });
        setError(data.message || "Cupón no válido");
        return;
      }

      setCupon(data.data);
      setValidacion({
        ok: true,
        code: data.code,
        message: data.message,
      });
      setSuccess(data.message || "Cupón válido para canjear");
    } catch (err) {
      console.error("[ValidarCupon handleValidarCupon]", err);
      setError("Error de conexión al validar cupón");
    } finally {
      setLoadingValidar(false);
    }
  };

  const handleCanjearCupon = async () => {
    if (!cupon?.id) {
      setError("Primero debés validar un cupón");
      return;
    }

    if (!sucursalId) {
      setError("Seleccioná la sucursal donde se realiza el canje");
      return;
    }

    if (cupon.estado !== "disponible" && cupon.estado !== "generado") {
      setError("Este cupón no está disponible para canjear");
      return;
    }

    try {
      setLoadingCanjear(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/fidelizacion/admin/cupones/${cupon.id}/canjear`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sucursal_id: sucursalId,
            observaciones,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || "No se pudo canjear el cupón");
        return;
      }

      setSuccess(
        `Cupón canjeado correctamente. Puntos acreditados: ${
          data.data?.puntos_acreditados || 0
        }`
      );

      setCupon((prev) => ({
        ...prev,
        estado: "usado",
      }));

      setValidacion({
        ok: false,
        code: "CUPON_USADO",
        message: "Cupón canjeado correctamente",
      });
    } catch (err) {
      console.error("[ValidarCupon handleCanjearCupon]", err);
      setError("Error de conexión al canjear cupón");
    } finally {
      setLoadingCanjear(false);
    }
  };

  const puedeCanjear =
    cupon &&
    validacion?.ok &&
    (cupon.estado === "disponible" || cupon.estado === "generado");

  return (
    <Container fluid className="py-4">
      <Row className="mb-3">
        <Col>
          <h3 className="fw-bold mb-1">Validar Cupón</h3>
          <p className="text-muted mb-0">
            Validá y registrá el canje de cupones generados por la ruleta.
          </p>
        </Col>
      </Row>

      <Row>
        <Col lg={5} className="mb-3">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="fw-bold mb-3">Buscar cupón</h5>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleValidarCupon}>
                <Form.Group className="mb-3">
                  <Form.Label>Número / Token / Código</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej: LT-2026-000001"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    disabled={loadingValidar || loadingCanjear}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 fw-bold"
                  disabled={loadingValidar || loadingCanjear}
                >
                  {loadingValidar ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" />
                      Validando...
                    </>
                  ) : (
                    "Validar cupón"
                  )}
                </Button>
              </Form>

              <hr />

              <Form.Group className="mb-3">
                <Form.Label>Sucursal de canje</Form.Label>
                <Form.Select
                  value={sucursalId}
                  onChange={(e) => setSucursalId(e.target.value)}
                  disabled={loadingCanjear}
                >
                  <option value="">Seleccionar sucursal</option>
                  {sucursales.map((sucursal) => (
                    <option key={sucursal.id} value={sucursal.id}>
                      {sucursal.nombre || sucursal.descripcion || sucursal.codigo}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Observaciones</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Opcional"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  disabled={loadingCanjear}
                />
              </Form.Group>

              <Button
                variant="success"
                className="w-100 fw-bold"
                disabled={!puedeCanjear || loadingCanjear}
                onClick={handleCanjearCupon}
              >
                {loadingCanjear ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Canjeando...
                  </>
                ) : (
                  "Confirmar canje"
                )}
              </Button>

              <Button
                variant="outline-secondary"
                className="w-100 mt-2"
                disabled={loadingValidar || loadingCanjear}
                onClick={() => {
                  setCodigo("");
                  limpiarResultado();
                }}
              >
                Limpiar
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="fw-bold mb-3">Datos del cupón</h5>

              {!cupon ? (
                <Alert variant="light" className="border mb-0">
                  Ingresá un código para ver los datos del cupón.
                </Alert>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <small className="text-muted d-block">
                        Número de cupón
                      </small>
                      <h4 className="fw-bold mb-0">{cupon.numero_cupon}</h4>
                    </div>

                    <Badge bg={getEstadoBadge(cupon.estado)} className="p-2">
                      {cupon.estado}
                    </Badge>
                  </div>

                  {validacion && (
                    <Alert variant={validacion.ok ? "success" : "warning"}>
                      {validacion.message}
                    </Alert>
                  )}

                  <Table bordered responsive size="sm">
                    <tbody>
                      <tr>
                        <th style={{ width: "35%" }}>Premio</th>
                        <td>{cupon.premio?.nombre || "-"}</td>
                      </tr>
                      <tr>
                        <th>Descripción</th>
                        <td>{cupon.premio?.descripcion || "-"}</td>
                      </tr>
                      <tr>
                        <th>Cliente</th>
                        <td>
                          {cupon.cliente?.nombre || "-"}{" "}
                          {cupon.cliente?.telefono
                            ? `(${cupon.cliente.telefono})`
                            : ""}
                        </td>
                      </tr>
                      <tr>
                        <th>Comercio origen</th>
                        <td>{cupon.comercio?.nombre_fantasia || "-"}</td>
                      </tr>
                      <tr>
                        <th>Campaña</th>
                        <td>{cupon.campania?.nombre || "-"}</td>
                      </tr>
                      <tr>
                        <th>Fecha emisión</th>
                        <td>{formatDate(cupon.fecha_emision)}</td>
                      </tr>
                      <tr>
                        <th>Vencimiento</th>
                        <td>{formatDate(cupon.fecha_vencimiento)}</td>
                      </tr>
                      <tr>
                        <th>Código validación</th>
                        <td>{cupon.codigo_validacion || "-"}</td>
                      </tr>
                      <tr>
                        <th>Puntos comercio</th>
                        <td>{cupon.premio?.puntos_otorga_comercio || 0}</td>
                      </tr>
                    </tbody>
                  </Table>

                  {!puedeCanjear && (
                    <Alert variant="secondary" className="mb-0">
                      Este cupón no está habilitado para confirmar canje.
                    </Alert>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ValidarCupon;