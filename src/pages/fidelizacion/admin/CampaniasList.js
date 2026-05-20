import React, { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Form,
  Spinner,
  Table,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const getEstadoBadge = (estado) => {
  switch (estado) {
    case "activa":
      return "success";
    case "borrador":
      return "secondary";
    case "pausada":
      return "warning";
    case "finalizada":
      return "dark";
    case "cancelada":
      return "danger";
    default:
      return "info";
  }
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("es-AR");
};

const CampaniasList = () => {
  const navigate = useNavigate();

  const [campanias, setCampanias] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(false);
  const [accionLoading, setAccionLoading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarCampanias();
  }, []);

  const cargarCampanias = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/fidelizacion/admin/campanias`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || "Error al cargar campañas");
        return;
      }

      setCampanias(data.data || []);
    } catch (err) {
      console.error("[CampaniasList cargarCampanias]", err);
      setError("Error de conexión al cargar campañas");
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id, accion) => {
    try {
      setAccionLoading(`${accion}-${id}`);
      setError("");

      const response = await fetch(
        `${API_URL}/fidelizacion/admin/campanias/${id}/${accion}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || "No se pudo actualizar la campaña");
        return;
      }

      await cargarCampanias();
    } catch (err) {
      console.error("[CampaniasList cambiarEstado]", err);
      setError("Error de conexión al actualizar campaña");
    } finally {
      setAccionLoading(null);
    }
  };

  const campaniasFiltradas = campanias.filter((c) => {
    const texto = `${c.nombre || ""} ${c.descripcion || ""} ${
      c.estado || ""
    }`.toLowerCase();

    return texto.includes(filtro.toLowerCase());
  });

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold mb-1">Campañas de Fidelización</h3>
          <p className="text-muted mb-0">
            Administrá las campañas activas de la ruleta y sus fechas.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate("/fidelizacion/campanias/nueva")}
        >
          Nueva campaña
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm border-0 mb-3">
        <Card.Body>
          <Form.Control
            type="text"
            placeholder="Buscar campaña..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-3 mb-0">Cargando campañas...</p>
            </div>
          ) : campaniasFiltradas.length === 0 ? (
            <Alert variant="light" className="border mb-0">
              No hay campañas para mostrar.
            </Alert>
          ) : (
            <Table responsive bordered hover size="sm" className="mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Campaña</th>
                  <th>Vigencia</th>
                  <th>Tipo</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Premios</th>
                  <th style={{ minWidth: 260 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {campaniasFiltradas.map((campania) => (
                  <tr key={campania.id}>
                    <td>{campania.id}</td>
                    <td>
                      <strong>{campania.nombre}</strong>
                      <br />
                      <small className="text-muted">
                        {campania.descripcion || "-"}
                      </small>
                    </td>
                    <td>
                      {formatDate(campania.fecha_inicio)} al{" "}
                      {formatDate(campania.fecha_fin)}
                    </td>
                    <td>{campania.tipo}</td>
                    <td>{campania.prioridad}</td>
                    <td>
                      <Badge bg={getEstadoBadge(campania.estado)}>
                        {campania.estado}
                      </Badge>
                    </td>
                    <td>{campania.premios?.length || 0}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() =>
                            navigate(
                              `/fidelizacion/campanias/${campania.id}/editar`
                            )
                          }
                        >
                          Editar
                        </Button>

                        <Button
                          size="sm"
                          variant="outline-dark"
                          onClick={() =>
                            navigate(
                              `/fidelizacion/premios-clientes?campania_id=${campania.id}`
                            )
                          }
                        >
                          Premios
                        </Button>

                        {campania.estado !== "activa" && (
                          <Button
                            size="sm"
                            variant="outline-success"
                            disabled={
                              accionLoading === `activar-${campania.id}`
                            }
                            onClick={() =>
                              cambiarEstado(campania.id, "activar")
                            }
                          >
                            Activar
                          </Button>
                        )}

                        {campania.estado === "activa" && (
                          <Button
                            size="sm"
                            variant="outline-warning"
                            disabled={accionLoading === `pausar-${campania.id}`}
                            onClick={() => cambiarEstado(campania.id, "pausar")}
                          >
                            Pausar
                          </Button>
                        )}

                        {campania.estado !== "finalizada" && (
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            disabled={
                              accionLoading === `finalizar-${campania.id}`
                            }
                            onClick={() =>
                              cambiarEstado(campania.id, "finalizar")
                            }
                          >
                            Finalizar
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
    </Container>
  );
};

export default CampaniasList;