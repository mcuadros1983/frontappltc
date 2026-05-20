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
    case "activo":
      return "success";
    case "pausado":
      return "warning";
    case "agotado":
      return "danger";
    case "inactivo":
      return "secondary";
    default:
      return "dark";
  }
};

const PremiosComercioList = () => {
  const navigate = useNavigate();

  const [premios, setPremios] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarPremios();
  }, []);

  const cargarPremios = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/fidelizacion/admin/premios-comercios`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || "No se pudieron cargar los premios");
        return;
      }

      setPremios(data.data || []);
    } catch (err) {
      console.error("[PremiosComercioList cargarPremios]", err);
      setError("Error de conexión al cargar premios");
    } finally {
      setLoading(false);
    }
  };

  const premiosFiltrados = premios.filter((p) => {
    const texto = `${p.nombre || ""} ${p.descripcion || ""} ${
      p.tipo_premio || ""
    }`.toLowerCase();

    return texto.includes(filtro.toLowerCase());
  });

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold mb-1">Premios para Comercios</h3>
          <p className="text-muted mb-0">
            Premios que los comercios asociados pueden canjear con puntos.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate("/fidelizacion/premios-comercios/nuevo")}
        >
          Nuevo premio
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm border-0 mb-3">
        <Card.Body>
          <Form.Control
            type="text"
            placeholder="Buscar premio..."
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
                  <th>Tipo</th>
                  <th>Costo</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th style={{ minWidth: 120 }}>Acciones</th>
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
                    <td>{premio.tipo_premio}</td>
                    <td>
                      <strong>{premio.costo_puntos}</strong> pts
                    </td>
                    <td>
                      {premio.ilimitado
                        ? "Ilimitado"
                        : premio.stock_total || 0}
                    </td>
                    <td>
                      <Badge bg={getEstadoBadge(premio.estado)}>
                        {premio.estado}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() =>
                          navigate(
                            `/fidelizacion/premios-comercios/${premio.id}/editar`
                          )
                        }
                      >
                        Editar
                      </Button>
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

export default PremiosComercioList;