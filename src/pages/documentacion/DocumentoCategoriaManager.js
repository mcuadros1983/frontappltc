// src/pages/documentacion/DocumentoCategoriaManager.js
import React, { useEffect, useState, useContext } from "react";
import Contexts from "../../context/Contexts";
import { categoriasApi } from "../../services/categoriasApi";
import DocumentoCategoriaModal from "./DocumentoCategoriaModal";
import {
  Container,
  Card,
  Button,
  Form,
  Row,
  Col,
  Table,
  Pagination,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useSecurity } from "../../security/SecurityContext"; // 👈 usa SecurityContext

export default function DocumentoCategoriaManager() {
  const { user, ready } = useSecurity();
  // const dataContext = useContext(Contexts.UserContext);
  const userRolId = user?.rol_id;
  const esAdmin = String(userRolId) === "1";

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modoModal, setModoModal] = useState("create"); // "create" | "edit"
  const [editCategoria, setEditCategoria] = useState(null);

  // cargar categorias
  async function loadCategorias() {
    try {
      setLoading(true);
      const data = await categoriasApi.getCategorias();
      setCategorias(data || []);
      setErr("");
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Error cargando categorías");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategorias();
  }, []);

  function abrirNueva() {
    setModoModal("create");
    setEditCategoria(null);
    setShowModal(true);
  }

  function abrirEditar(cat) {
    setModoModal("edit");
    setEditCategoria(cat);
    setShowModal(true);
  }

  async function eliminar(cat) {
    if (!esAdmin) return;
    if (!window.confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return;
    try {
      await categoriasApi.deleteCategoria(cat.id);
      loadCategorias();
    } catch (e) {
      alert(e?.message || "Error eliminando categoría");
    }
  }

  function handleSaved() {
    setShowModal(false);
    loadCategorias();
  }

  if (loading && categorias.length === 0) {
    return <div className="p-3">Cargando categorías…</div>;
  }

  return (
    <Container fluid className="mt-3">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <strong className="d-block">Categorías de Documentos</strong>
                <small className="text-muted">
                  (Por ejemplo: "PROCESOS", "MANUALES", etc.)
                </small>
              </div>
              {esAdmin && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={abrirNueva}
                >
                  Nueva Categoría
                </Button>
              )}
            </Card.Header>

            <Card.Body>
              {err && <Alert variant="danger">{err}</Alert>}

              <div className="table-responsive">
                <Table bordered hover size="sm" className="mb-2">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Creado</th>
                      <th>Actualizado</th>
                      {esAdmin && <th>Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map((cat) => (
                      <tr key={cat.id}>
                        <td>{cat.id}</td>
                        <td>{cat.nombre}</td>
                        <td>
                          {cat.createdAt
                            ? new Date(cat.createdAt).toLocaleString("es-AR")
                            : "—"}
                        </td>
                        <td>
                          {cat.updatedAt
                            ? new Date(cat.updatedAt).toLocaleString("es-AR")
                            : "—"}
                        </td>
                        {esAdmin && (
                          <td className="text-nowrap">
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              className="me-2"
                              onClick={() => abrirEditar(cat)}
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => eliminar(cat)}
                            >
                              Eliminar
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}

                    {categorias.length === 0 && (
                      <tr>
                        <td colSpan={esAdmin ? 5 : 4} className="text-center text-muted py-4">
                          Sin categorías
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {showModal && (
                <DocumentoCategoriaModal
                  show={showModal}
                  onHide={() => setShowModal(false)}
                  modo={modoModal}
                  initialData={editCategoria}
                  onSaved={handleSaved}
                  esAdmin={esAdmin}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
