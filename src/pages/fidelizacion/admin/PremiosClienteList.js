import React, { useEffect, useMemo, useState } from "react";
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
import { useLocation, useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const getEstadoBadge = (estado) => {
  switch (estado) {
    case "activo":
      return "success";
    case "pausado":
      return "warning";
    case "agotado":
      return "danger";
    case "finalizado":
      return "dark";
    case "inactivo":
      return "secondary";
    default:
      return "info";
  }
};

const getTipoBadge = (tipo) => {
  switch (tipo) {
    case "siga_participando":
      return "secondary";
    case "producto":
      return "success";
    case "descuento_porcentaje":
    case "descuento_monto":
      return "primary";
    case "combo":
      return "warning";
    case "beneficio":
      return "info";
    default:
      return "dark";
  }
};

const PremiosClienteList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryCampaniaId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("campania_id") || "";
  }, [location.search]);

  const [premios, setPremios] = useState([]);
  const [campanias, setCampanias] = useState([]);

  const [filtro, setFiltro] = useState("");
  const [campaniaId, setCampaniaId] = useState(queryCampaniaId);
  const [estado, setEstado] = useState("");

  const [loading, setLoading] = useState(false);
  const [accionLoading, setAccionLoading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarCampanias();
  }, []);

  useEffect(() => {
    cargarPremios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaniaId, estado]);

  const cargarCampanias = async () => {
    try {
      const response = await fetch(`${API_URL}/fidelizacion/admin/campanias`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        setCampanias(data.data || []);
      }
    } catch (err) {
      console.error("[PremiosClienteList cargarCampanias]", err);
    }
  };

  const cargarPremios = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (campaniaId) params.append("campania_id", campaniaId);
      if (estado) params.append("estado", estado);

      const response = await fetch(
        `${API_URL}/fidelizacion/admin/premios-clientes?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || "Error al cargar premios");
        return;
      }

      setPremios(data.data || []);
    } catch (err) {
      console.error("[PremiosClienteList cargarPremios]", err);
      setError("Error de conexión al cargar premios");
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id, accion) => {
    try {
      setAccionLoading(`${accion}-${id}`);
      setError("");

      const response = await fetch(
        `${API_URL}/fidelizacion/admin/premios-clientes/${id}/${accion}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || "No se pudo actualizar el premio");
        return;
      }

      await cargarPremios();
    } catch (err) {
      console.error("[PremiosClienteList cambiarEstado]", err);
      setError("Error de conexión al actualizar premio");
    } finally {
      setAccionLoading(null);
    }
  };

  const premiosFiltrados = premios.filter((p) => {
    const texto = `${p.nombre || ""} ${p.descripcion || ""} ${
      p.tipo_premio || ""
    }`.toLowerCase();

    return texto.includes(filtro.toLowerCase());
  });

  const totalProbabilidad = premiosFiltrados.reduce(
    (acc, p) => acc + Number(p.probabilidad || 0),
    0
  );

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold mb-1">Premios de Clientes</h3>
          <p className="text-muted mb-0">
            Configurá los resultados posibles de la ruleta.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() =>
            navigate(
              campaniaId
                ? `/fidelizacion/premios-clientes/nuevo?campania_id=${campaniaId}`
                : "/fidelizacion/premios-clientes/nuevo"
            )
          }
        >
          Nuevo premio
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm border-0 mb-3">
        <Card.Body>
          <div className="row g-2">
            <div className="col-md-5">
              <Form.Control
                type="text"
                placeholder="Buscar premio..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <Form.Select
                value={campaniaId}
                onChange={(e) => setCampaniaId(e.target.value)}
              >
                <option value="">Todas las campañas</option>
                {campanias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Form.Select>
            </div>

            <div className="col-md-3">
              <Form.Select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="pausado">Pausado</option>
                <option value="agotado">Agotado</option>
                <option value="inactivo">Inactivo</option>
                <option value="finalizado">Finalizado</option>
              </Form.Select>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0 mb-3">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <div>
            <strong>Total probabilidad filtrada:</strong>{" "}
            <Badge bg={totalProbabilidad === 100 ? "success" : "warning"}>
              {totalProbabilidad.toFixed(2)}%
            </Badge>
          </div>
          <small className="text-muted">
            Recomendado para campaña: 100% sumando todos los premios activos.
          </small>
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-3 mb-0">Cargando premios...</p>
            </div>
          ) : premiosFiltrados.length === 0 ? (
            <Alert variant="light" className="border mb-0">
              No hay premios para mostrar.
            </Alert>
          ) : (
            <Table responsive bordered hover size="sm" className="mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Premio</th>
                  <th>Campaña</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Prob.</th>
                  <th>Stock</th>
                  <th>Vence</th>
                  <th>Puntos</th>
                  <th>Estado</th>
                  <th style={{ minWidth: 210 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {premiosFiltrados.map((premio) => (
                  <tr key={premio.id}>
                    <td>{premio.id}</td>
                    <td>
                      <strong>{premio.nombre}</strong>
                      <br />
                      <small className="text-muted">
                        {premio.descripcion || "-"}
                      </small>
                    </td>
                    <td>{premio.campania?.nombre || premio.campania_id}</td>
                    <td>
                      <Badge bg={getTipoBadge(premio.tipo_premio)}>
                        {premio.tipo_premio}
                      </Badge>
                    </td>
                    <td>{premio.valor || "-"}</td>
                    <td>{Number(premio.probabilidad || 0).toFixed(2)}%</td>
                    <td>
                      {premio.ilimitado
                        ? "Ilimitado"
                        : `Total: ${premio.stock_total || "-"} / Día: ${
                            premio.stock_diario || "-"
                          }`}
                    </td>
                    <td>
                      {premio.vence_cupon
                        ? `${premio.dias_vencimiento_cupon} días`
                        : "No"}
                    </td>
                    <td>{premio.puntos_otorga_comercio}</td>
                    <td>
                      <Badge bg={getEstadoBadge(premio.estado)}>
                        {premio.estado}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() =>
                            navigate(
                              `/fidelizacion/premios-clientes/${premio.id}/editar`
                            )
                          }
                        >
                          Editar
                        </Button>

                        {premio.estado === "activo" ? (
                          <Button
                            size="sm"
                            variant="outline-warning"
                            disabled={accionLoading === `pausar-${premio.id}`}
                            onClick={() => cambiarEstado(premio.id, "pausar")}
                          >
                            Pausar
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline-success"
                            disabled={accionLoading === `activar-${premio.id}`}
                            onClick={() => cambiarEstado(premio.id, "activar")}
                          >
                            Activar
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

export default PremiosClienteList;