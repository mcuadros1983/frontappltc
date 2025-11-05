// src/pages/documentacion/DocumentoSubcategoriaManager.js
import React, { useEffect, useState, useContext } from "react";
import Contexts from "../../context/Contexts";
import { categoriasApi } from "../../services/categoriasApi";
import DocumentoSubcategoriaModal from "./DocumentoSubcategoriaModal";
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

export default function DocumentoSubcategoriaManager() {
  const { user, ready } = useSecurity();
  // const dataContext = useContext(Contexts.UserContext);
  const userRolId = user?.rol_id;
  const esAdmin = String(userRolId) === "1";

  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState("");

  const [subcategorias, setSubcategorias] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  const [err, setErr] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modoModal, setModoModal] = useState("create"); // "create" | "edit"
  const [editSubcat, setEditSubcat] = useState(null);

  // cargar todas las categorias al inicio
  useEffect(() => {
    categoriasApi
      .getCategorias()
      .then((cats) => setCategorias(cats || []))
      .catch((e) => {
        console.error(e);
        setErr(e?.message || "Error cargando categorías");
      });
  }, []);

  // cada vez que cambia la categoría elegida, traemos sus subcategorías
  useEffect(() => {
    async function loadSubs() {
      if (!categoriaId) {
        setSubcategorias([]);
        return;
      }
      try {
        setLoadingSubs(true);
        const subs = await categoriasApi.getSubcategorias(categoriaId);
        setSubcategorias(subs || []);
        setErr("");
      } catch (e) {
        console.error(e);
        setErr(e?.message || "Error cargando subcategorías");
      } finally {
        setLoadingSubs(false);
      }
    }
    loadSubs();
  }, [categoriaId]);

  function abrirNueva() {
    if (!categoriaId) {
      alert("Elegí primero una categoría");
      return;
    }
    setModoModal("create");
    setEditSubcat(null);
    setShowModal(true);
  }

  function abrirEditar(subcat) {
    setModoModal("edit");
    setEditSubcat(subcat);
    setShowModal(true);
  }

  async function eliminar(subcat) {
    if (!esAdmin) return;
    if (
      !window.confirm(
        `¿Eliminar la subcategoría "${subcat.nombre}" de esta categoría?`
      )
    )
      return;
    try {
      await categoriasApi.deleteSubcategoria(subcat.id);
      // reload
      const subs = await categoriasApi.getSubcategorias(categoriaId);
      setSubcategorias(subs || []);
    } catch (e) {
      alert(e?.message || "Error eliminando subcategoría");
    }
  }

  async function handleSaved() {
    setShowModal(false);
    if (categoriaId) {
      const subs = await categoriasApi.getSubcategorias(categoriaId);
      setSubcategorias(subs || []);
    }
  }

  return (
    <Container fluid className="mt-3">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-start flex-wrap">
              <div>
                <strong className="d-block">Subcategorías / Áreas</strong>
                <small className="text-muted">
                  Definí áreas internas (ej: RRHH, CAJAS, Seguridad) y qué roles pueden ver documentos de esa área.
                </small>
              </div>

              <div className="text-end">
                <div className="mb-2">
                  <Form.Label className="me-2 d-inline ">Categoría</Form.Label>
                  <Form.Select
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    className="form-control my-input  w-auto"
                  >
                    <option value="">Seleccionar...</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </div>

                {esAdmin && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={abrirNueva}
                    disabled={!categoriaId}
                  >
                    Nueva Subcategoría
                  </Button>
                )}
              </div>
            </Card.Header>

            <Card.Body>
              {err && <Alert variant="danger">{err}</Alert>}

              {!categoriaId && (
                <Alert variant="info">
                  Elegí una categoría para ver sus subcategorías.
                </Alert>
              )}

              {categoriaId && (
                <div className="table-responsive">
                  <Table bordered hover size="sm" className="mb-2">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre subcategoría</th>
                        <th>Roles permitidos</th>
                        <th>Creado</th>
                        <th>Actualizado</th>
                        {esAdmin && <th>Acciones</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {loadingSubs ? (
                        <tr>
                          <td colSpan={esAdmin ? 6 : 5} className="text-center py-4">
                            Cargando subcategorías…
                          </td>
                        </tr>
                      ) : subcategorias.length === 0 ? (
                        <tr>
                          <td colSpan={esAdmin ? 6 : 5} className="text-center text-muted py-4">
                            Sin subcategorías
                          </td>
                        </tr>
                      ) : (
                        subcategorias.map((sc) => (
                          <tr key={sc.id}>
                            <td>{sc.id}</td>
                            <td>{sc.nombre}</td>
                            <td>
                              {Array.isArray(sc.roles_permitidos)
                                ? sc.roles_permitidos.join(", ")
                                : "—"}
                            </td>
                            <td>
                              {sc.createdAt
                                ? new Date(sc.createdAt).toLocaleString("es-AR")
                                : "—"}
                            </td>
                            <td>
                              {sc.updatedAt
                                ? new Date(sc.updatedAt).toLocaleString("es-AR")
                                : "—"}
                            </td>

                            {esAdmin && (
                              <td className="text-nowrap">
                                <Button
                                  size="sm"
                                  variant="outline-secondary"
                                  className="me-2"
                                  onClick={() => abrirEditar(sc)}
                                >
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => eliminar(sc)}
                                >
                                  Eliminar
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              )}

              {showModal && (
                <DocumentoSubcategoriaModal
                  show={showModal}
                  onHide={() => setShowModal(false)}
                  modo={modoModal}
                  initialData={editSubcat}
                  categoriaId={categoriaId}
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
