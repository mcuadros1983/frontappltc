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

const getEstadoBadge = (estado) => {
  switch (estado) {
    case "solicitado":
      return "info";
    case "pendiente":
      return "warning";
    case "aprobado":
      return "primary";
    case "rechazado":
      return "danger";
    case "entregado":
      return "success";
    case "cancelado":
      return "secondary";
    default:
      return "dark";
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

const CanjesComerciosList = () => {
  const [canjes, setCanjes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [loading, setLoading] = useState(false);
  const [accionLoading, setAccionLoading] = useState(null);

  const [showRechazo, setShowRechazo] = useState(false);
  const [canjeSeleccionado, setCanjeSeleccionado] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    cargarCanjes();
  }, []);

  const cargarCanjes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/fidelizacion/admin/canjes-comercios`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || "No se pudieron cargar los canjes");
        return;
      }

      setCanjes(data.data || []);
    } catch (err) {
      console.error("[CanjesComerciosList cargarCanjes]", err);
      setError("Error de conexión al cargar canjes");
    } finally {
      setLoading(false);
    }
  };

  const ejecutarAccion = async (id, accion, body = {}) => {
    try {
      setAccionLoading(`${accion}-${id}`);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/fidelizacion/admin/canjes-comercios/${id}/${accion}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || "No se pudo ejecutar la acción");
        return;
      }

      setSuccess(data.message || "Acción realizada correctamente");
      await cargarCanjes();
    } catch (err) {
      console.error("[CanjesComerciosList ejecutarAccion]", err);
      setError("Error de conexión al ejecutar acción");
    } finally {
      setAccionLoading(null);
    }
  };

  const abrirRechazo = (canje) => {
    setCanjeSeleccionado(canje);
    setMotivoRechazo("");
    setShowRechazo(true);
  };

  const confirmarRechazo = async () => {
    if (!canjeSeleccionado) return;

    await ejecutarAccion(canjeSeleccionado.id, "rechazar", {
      motivo_rechazo: motivoRechazo || "Rechazado por administración",
    });

    setShowRechazo(false);
    setCanjeSeleccionado(null);
    setMotivoRechazo("");
  };

  const canjesFiltrados = canjes.filter((c) => {
    const texto = `${c.id || ""} ${c.comercio_id || ""} ${
      c.premio?.nombre || ""
    } ${c.estado || ""}`.toLowerCase();

    const matchTexto = texto.includes(filtro.toLowerCase());
    const matchEstado = estadoFiltro ? c.estado === estadoFiltro : true;

    return matchTexto && matchEstado;
  });

  return (
    <Container fluid className="py-4">
      <div className="mb-3">
        <h3 className="fw-bold mb-1">Canjes de Comercios</h3>
        <p className="text-muted mb-0">
          Gestioná solicitudes de premios realizadas por comercios asociados.
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="shadow-sm border-0 mb-3">
        <Card.Body>
          <div className="row g-2">
            <div className="col-md-8">
              <Form.Control
                type="text"
                placeholder="Buscar por comercio, premio, estado..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <Form.Select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="solicitado">Solicitado</option>
                <option value="pendiente">Pendiente</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </Form.Select>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-3 mb-0">Cargando canjes...</p>
            </div>
          ) : canjesFiltrados.length === 0 ? (
            <Alert variant="light" className="border mb-0">
              No hay canjes para mostrar.
            </Alert>
          ) : (
            <Table responsive bordered hover size="sm" className="mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Comercio</th>
                  <th>Premio</th>
                  <th>Puntos</th>
                  <th>Estado</th>
                  <th>Observaciones</th>
                  <th style={{ minWidth: 260 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {canjesFiltrados.map((canje) => (
                  <tr key={canje.id}>
                    <td>{canje.id}</td>
                    <td>{formatDate(canje.fecha_solicitud)}</td>
                    <td>{canje.comercio_id}</td>
                    <td>{canje.premio?.nombre || "-"}</td>
                    <td>{canje.puntos_requeridos}</td>
                    <td>
                      <Badge bg={getEstadoBadge(canje.estado)}>
                        {canje.estado}
                      </Badge>
                    </td>
                    <td>{canje.observaciones || canje.motivo_rechazo || "-"}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {["solicitado", "pendiente"].includes(canje.estado) && (
                          <>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              disabled={
                                accionLoading === `aprobar-${canje.id}`
                              }
                              onClick={() =>
                                ejecutarAccion(canje.id, "aprobar")
                              }
                            >
                              Aprobar
                            </Button>

                            <Button
                              size="sm"
                              variant="outline-danger"
                              disabled={
                                accionLoading === `rechazar-${canje.id}`
                              }
                              onClick={() => abrirRechazo(canje)}
                            >
                              Rechazar
                            </Button>
                          </>
                        )}

                        {canje.estado === "aprobado" && (
                          <Button
                            size="sm"
                            variant="outline-success"
                            disabled={
                              accionLoading === `entregar-${canje.id}`
                            }
                            onClick={() => ejecutarAccion(canje.id, "entregar")}
                          >
                            Entregar
                          </Button>
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

      <Modal show={showRechazo} onHide={() => setShowRechazo(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Rechazar canje</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="text-muted">
            Indicá el motivo del rechazo. Los puntos serán devueltos al comercio.
          </p>

          <Form.Control
            as="textarea"
            rows={4}
            value={motivoRechazo}
            onChange={(e) => setMotivoRechazo(e.target.value)}
            placeholder="Motivo del rechazo"
          />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowRechazo(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarRechazo}>
            Rechazar y devolver puntos
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CanjesComerciosList;