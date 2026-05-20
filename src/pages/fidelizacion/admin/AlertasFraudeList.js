import React, { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Form,
  Modal,
  Spinner,
  Table,
} from "react-bootstrap";

const API_URL = process.env.REACT_APP_API_URL;

const getNivelBadge = (nivel) => {
  switch (nivel) {
    case "bajo":
      return "secondary";
    case "medio":
      return "warning";
    case "alto":
      return "danger";
    case "critico":
      return "dark";
    default:
      return "info";
  }
};

const getEstadoBadge = (estado) => {
  switch (estado) {
    case "pendiente":
      return "danger";
    case "en_revision":
      return "warning";
    case "resuelta":
      return "success";
    case "descartada":
      return "secondary";
    default:
      return "info";
  }
};

const formatDate = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AlertasFraudeList = () => {
  const [alertas, setAlertas] = useState([]);

  const [estado, setEstado] = useState("");
  const [nivelRiesgo, setNivelRiesgo] = useState("");
  const [tipoAlerta, setTipoAlerta] = useState("");

  const [loading, setLoading] = useState(false);
  const [accionLoading, setAccionLoading] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    cargarAlertas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarAlertas = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (estado) params.append("estado", estado);
      if (nivelRiesgo) params.append("nivel_riesgo", nivelRiesgo);
      if (tipoAlerta) params.append("tipo_alerta", tipoAlerta);

      const response = await fetch(
        `${API_URL}/fidelizacion/admin/alertas-fraude?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || "No se pudieron cargar alertas");
        return;
      }

      setAlertas(data.data || []);
    } catch (err) {
      console.error("[AlertasFraudeList cargarAlertas]", err);
      setError("Error de conexión al cargar alertas");
    } finally {
      setLoading(false);
    }
  };

  const abrirCambioEstado = (alerta, estadoDestino) => {
    setAlertaSeleccionada(alerta);
    setNuevoEstado(estadoDestino);
    setObservaciones("");
    setShowModal(true);
  };

  const confirmarCambioEstado = async () => {
    if (!alertaSeleccionada || !nuevoEstado) return;

    try {
      setAccionLoading(alertaSeleccionada.id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/fidelizacion/admin/alertas-fraude/${alertaSeleccionada.id}/estado`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            estado: nuevoEstado,
            observaciones_resolucion: observaciones,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || "No se pudo actualizar la alerta");
        return;
      }

      setSuccess("Alerta actualizada correctamente");
      setShowModal(false);
      setAlertaSeleccionada(null);
      await cargarAlertas();
    } catch (err) {
      console.error("[AlertasFraudeList confirmarCambioEstado]", err);
      setError("Error de conexión al actualizar alerta");
    } finally {
      setAccionLoading(null);
    }
  };

  const pendientes = alertas.filter((a) => a.estado === "pendiente").length;
  const altoRiesgo = alertas.filter((a) =>
    ["alto", "critico"].includes(a.nivel_riesgo)
  ).length;

  return (
    <Container fluid className="py-4">
      <div className="mb-3">
        <h3 className="fw-bold mb-1">Alertas Antifraude</h3>
        <p className="text-muted mb-0">
          Revisión de intentos sospechosos, duplicados, GPS inválido y abuso de QR.
        </p>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <small className="text-muted">Alertas cargadas</small>
              <h2 className="fw-bold mb-0">{alertas.length}</h2>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <small className="text-muted">Pendientes</small>
              <h2 className="fw-bold text-danger mb-0">{pendientes}</h2>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <small className="text-muted">Alto / crítico</small>
              <h2 className="fw-bold text-warning mb-0">{altoRiesgo}</h2>
            </Card.Body>
          </Card>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="shadow-sm border-0 mb-3">
        <Card.Body>
          <div className="row g-2 align-items-end">
            <div className="col-md-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_revision">En revisión</option>
                <option value="resuelta">Resuelta</option>
                <option value="descartada">Descartada</option>
              </Form.Select>
            </div>

            <div className="col-md-3">
              <Form.Label>Nivel riesgo</Form.Label>
              <Form.Select
                value={nivelRiesgo}
                onChange={(e) => setNivelRiesgo(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="bajo">Bajo</option>
                <option value="medio">Medio</option>
                <option value="alto">Alto</option>
                <option value="critico">Crítico</option>
              </Form.Select>
            </div>

            <div className="col-md-3">
              <Form.Label>Tipo alerta</Form.Label>
              <Form.Select
                value={tipoAlerta}
                onChange={(e) => setTipoAlerta(e.target.value)}
              >
                <option value="">Todas</option>
                <option value="telefono_repetido">Teléfono repetido</option>
                <option value="device_repetido">Device repetido</option>
                <option value="fuera_de_rango">Fuera de rango</option>
                <option value="gps_invalido">GPS inválido</option>
                <option value="multiples_telefonos_mismo_device">
                  Múltiples teléfonos mismo device
                </option>
                <option value="participacion_bloqueada">
                  Participación bloqueada
                </option>
              </Form.Select>
            </div>

            <div className="col-md-3">
              <Button
                variant="primary"
                className="w-100 fw-bold"
                onClick={cargarAlertas}
                disabled={loading}
              >
                {loading ? "Consultando..." : "Aplicar filtros"}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-3 mb-0">Cargando alertas...</p>
            </div>
          ) : alertas.length === 0 ? (
            <Alert variant="light" className="border mb-0">
              No hay alertas para mostrar.
            </Alert>
          ) : (
            <Table responsive bordered hover size="sm" className="mb-0">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Comercio</th>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Riesgo</th>
                  <th>Estado</th>
                  <th>Descripción</th>
                  <th style={{ minWidth: 220 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {alertas.map((alerta) => (
                  <tr key={alerta.id}>
                    <td>{formatDate(alerta.createdAt)}</td>
                    <td>
                      {alerta.comercio?.nombre_fantasia ||
                        alerta.comercio_id ||
                        "-"}
                    </td>
                    <td>
                      {alerta.cliente?.nombre || "-"}
                      {alerta.cliente?.telefono
                        ? ` (${alerta.cliente.telefono})`
                        : ""}
                    </td>
                    <td>{alerta.tipo_alerta}</td>
                    <td>
                      <Badge bg={getNivelBadge(alerta.nivel_riesgo)}>
                        {alerta.nivel_riesgo}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={getEstadoBadge(alerta.estado)}>
                        {alerta.estado}
                      </Badge>
                    </td>
                    <td>{alerta.descripcion}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {alerta.estado === "pendiente" && (
                          <Button
                            size="sm"
                            variant="outline-warning"
                            disabled={accionLoading === alerta.id}
                            onClick={() =>
                              abrirCambioEstado(alerta, "en_revision")
                            }
                          >
                            Revisar
                          </Button>
                        )}

                        {!["resuelta", "descartada"].includes(alerta.estado) && (
                          <>
                            <Button
                              size="sm"
                              variant="outline-success"
                              disabled={accionLoading === alerta.id}
                              onClick={() =>
                                abrirCambioEstado(alerta, "resuelta")
                              }
                            >
                              Resolver
                            </Button>

                            <Button
                              size="sm"
                              variant="outline-secondary"
                              disabled={accionLoading === alerta.id}
                              onClick={() =>
                                abrirCambioEstado(alerta, "descartada")
                              }
                            >
                              Descartar
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cambiar estado de alerta</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="text-muted">
            Nuevo estado: <strong>{nuevoEstado}</strong>
          </p>

          <Form.Group>
            <Form.Label>Observaciones</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Detalle de la revisión"
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={confirmarCambioEstado}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AlertasFraudeList;