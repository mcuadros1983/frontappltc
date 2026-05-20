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
import { Link, useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const getEstadoBadge = (estado) => {
  switch (estado) {
    case "activo":
      return "success";
    case "suspendido":
      return "warning";
    case "bloqueado":
      return "danger";
    case "inactivo":
      return "secondary";
    case "pendiente":
      return "info";
    default:
      return "dark";
  }
};

const ComerciosAsociadosList = () => {
  const navigate = useNavigate();

  const [comercios, setComercios] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(false);
  const [accionLoading, setAccionLoading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarComercios();
  }, []);

  const cargarComercios = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/fidelizacion/admin/comercios`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || "Error al cargar comercios");
        return;
      }

      setComercios(data.data || []);
    } catch (err) {
      console.error("[ComerciosAsociadosList cargarComercios]", err);
      setError("Error de conexión al cargar comercios");
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id, accion) => {
    try {
      setAccionLoading(`${accion}-${id}`);
      setError("");

      const response = await fetch(
        `${API_URL}/fidelizacion/admin/comercios/${id}/${accion}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || "No se pudo actualizar el comercio");
        return;
      }

      await cargarComercios();
    } catch (err) {
      console.error("[ComerciosAsociadosList cambiarEstado]", err);
      setError("Error de conexión al actualizar comercio");
    } finally {
      setAccionLoading(null);
    }
  };

  const comerciosFiltrados = comercios.filter((c) => {
    const texto = `${c.nombre_fantasia || ""} ${c.razon_social || ""} ${
      c.documento_numero || ""
    } ${c.domicilio || ""}`.toLowerCase();

    return texto.includes(filtro.toLowerCase());
  });

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold mb-1">Comercios Asociados</h3>
          <p className="text-muted mb-0">
            Alta, edición y administración de comercios con QR de fidelización.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate("/fidelizacion/comercios/nuevo")}
        >
          Nuevo comercio
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm border-0 mb-3">
        <Card.Body>
          <Form.Control
            type="text"
            placeholder="Buscar por nombre, razón social, documento o domicilio..."
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
              <p className="mt-3 mb-0">Cargando comercios...</p>
            </div>
          ) : comerciosFiltrados.length === 0 ? (
            <Alert variant="light" className="border mb-0">
              No hay comercios para mostrar.
            </Alert>
          ) : (
            <Table responsive bordered hover size="sm" className="mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Comercio</th>
                  <th>Documento</th>
                  <th>Domicilio</th>
                  <th>Radio</th>
                  <th>Estado</th>
                  <th>QR</th>
                  <th style={{ minWidth: 260 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {comerciosFiltrados.map((comercio) => {
                  const qrActivo = comercio.qrs?.[0];

                  return (
                    <tr key={comercio.id}>
                      <td>{comercio.id}</td>
                      <td>
                        <strong>{comercio.nombre_fantasia}</strong>
                        <br />
                        <small className="text-muted">
                          {comercio.razon_social || "-"}
                        </small>
                      </td>
                      <td>
                        {comercio.documento_tipo} {comercio.documento_numero}
                      </td>
                      <td>{comercio.domicilio}</td>
                      <td>{comercio.radio_metros} m</td>
                      <td>
                        <Badge bg={getEstadoBadge(comercio.estado)}>
                          {comercio.estado}
                        </Badge>
                        {!comercio.habilitado && (
                          <Badge bg="secondary" className="ms-1">
                            deshabilitado
                          </Badge>
                        )}
                      </td>
                      <td>
                        {qrActivo ? (
                          <Badge bg="success">Activo</Badge>
                        ) : (
                          <Badge bg="warning">Sin QR</Badge>
                        )}
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() =>
                              navigate(
                                `/fidelizacion/comercios/${comercio.id}/editar`
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
                                `/fidelizacion/comercios/${comercio.id}/qr`
                              )
                            }
                          >
                            QR
                          </Button>

                          <Button
                            size="sm"
                            variant="outline-info"
                            onClick={() =>
                              navigate(
                                `/fidelizacion/comercios/${comercio.id}/puntos`
                              )
                            }
                          >
                            Puntos
                          </Button>

                          {comercio.estado === "activo" ? (
                            <Button
                              size="sm"
                              variant="outline-warning"
                              disabled={
                                accionLoading === `suspender-${comercio.id}`
                              }
                              onClick={() =>
                                cambiarEstado(comercio.id, "suspender")
                              }
                            >
                              Suspender
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline-success"
                              disabled={accionLoading === `activar-${comercio.id}`}
                              onClick={() =>
                                cambiarEstado(comercio.id, "activar")
                              }
                            >
                              Activar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ComerciosAsociadosList;