import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Card,
  Row,
  Col,
  Form,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import {
  getPromociones,
  deletePromocion,
} from "../../services/promocionesApi";

const PromocionList = () => {
  const [promociones, setPromociones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  const loadData = async () => {
    const res = await getPromociones();
    if (res.ok) {
      setPromociones(res.promociones || []);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    const ok = window.confirm("¿Eliminar promoción?");
    if (!ok) return;

    await deletePromocion(id);
    loadData();
  };

  const promocionesFiltradas = promociones.filter((p) => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return true;

    return (
      String(p.descripcion || "").toLowerCase().includes(texto) ||
      String(p.tipo_promocion || "").toLowerCase().includes(texto) ||
      String(p.id || "").includes(texto)
    );
  });

  const formatTipo = (tipo) => {
    if (tipo === "precio_fijo") return "Precio fijo";
    if (tipo === "porcentaje") return "Porcentaje";
    return tipo || "-";
  };

  const getCantidadArticulos = (promocion) => {
    if (promocion.aplica_todos) return "Todos";
    return promocion.PromocionArticuloTablas?.length || 0;
  };

  const getDiasTexto = (promocion) => {
    const dias = promocion.PromocionDiaTablas || [];
    if (dias.length === 0) return "-";

    const nombres = {
      1: "Lun",
      2: "Mar",
      3: "Mié",
      4: "Jue",
      5: "Vie",
      6: "Sáb",
      7: "Dom",
    };

    return dias
      .map((d) => nombres[d.dia_semana] || d.dia_semana)
      .join(", ");
  };

  return (
    <div className="container mt-4">
      <Card className="shadow-sm border-0">
        <Card.Body className="p-4">
          <Row className="align-items-center mb-3 g-3">
            <Col md={6}>
              <h3 className="mb-0">Promociones</h3>
            </Col>

            <Col md={3}>
              <Form.Control
                type="text"
                placeholder="Buscar promoción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                size="lg"
                style={{ borderRadius: "10px" }}
              />
            </Col>

            <Col md={3} className="text-md-end">
              <Button
                onClick={() => navigate("/promociones/new")}
                style={{
                  borderRadius: "10px",
                  padding: "10px 18px",
                  fontWeight: "600",
                }}
              >
                Nueva Promoción
              </Button>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table bordered hover alignMiddle className="mb-0">
              <thead>
                <tr>
                  <th style={{ minWidth: "80px" }}>ID</th>
                  <th style={{ minWidth: "240px" }}>Descripción</th>
                  <th style={{ minWidth: "140px" }}>Tipo</th>
                  <th style={{ minWidth: "120px" }}>Prioridad</th>
                  <th style={{ minWidth: "130px" }}>Desde</th>
                  <th style={{ minWidth: "130px" }}>Hasta</th>
                  <th style={{ minWidth: "150px" }}>Días</th>
                  <th style={{ minWidth: "120px" }}>Artículos</th>
                  <th style={{ minWidth: "100px" }}>Estado</th>
                  <th style={{ minWidth: "180px" }}>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {promocionesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center text-muted py-4">
                      No hay promociones para mostrar
                    </td>
                  </tr>
                ) : (
                  promocionesFiltradas.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>

                      <td>
                        <div className="fw-semibold">{p.descripcion}</div>
                      </td>

                      <td>{formatTipo(p.tipo_promocion)}</td>

                      <td>{p.prioridad ?? 0}</td>

                      <td>{p.fecha_desde || "-"}</td>

                      <td>{p.fecha_hasta || "-"}</td>

                      <td>{getDiasTexto(p)}</td>

                      <td>{getCantidadArticulos(p)}</td>

                      <td>
                        {p.activa ? (
                          <Badge bg="success">Activa</Badge>
                        ) : (
                          <Badge bg="secondary">Inactiva</Badge>
                        )}
                      </td>

                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() =>
                              navigate(`/promociones/${p.id}/edit`)
                            }
                          >
                            Editar
                          </Button>

                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(p.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PromocionList;