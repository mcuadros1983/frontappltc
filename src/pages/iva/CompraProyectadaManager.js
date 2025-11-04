// CompraProyectadaManager.jsx
import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { Container, Row, Col, Card, Table, Button, Form, Spinner, Alert, Badge } from "react-bootstrap";
import CompraProyectadaModal from "./CompraProyectadaModal";
import Contexts from "../../context/Contexts";
import "../../components/css/CompraProyectadaManager.css"; // ⬅️ nuevo

const apiUrl = process.env.REACT_APP_API_URL;

export default function CompraProyectadaManager() {
  const dataContext = useContext(Contexts.DataContext);

  // contexto
  const empresaSeleccionada = dataContext?.empresaSeleccionada || null;
  const empresas = dataContext?.empresas || [];
  const librosIvaTabla = dataContext?.librosIvaTabla || dataContext?.librosIva || [];
  const proveedoresTabla = dataContext?.proveedoresTabla || [];

  // Períodos (SIEMPRE desde backend)
  const [periodos, setPeriodos] = useState([]);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);
  const [errPeriodos, setErrPeriodos] = useState(null);

  // Filtros
  const [fPeriodoId, setFPeriodoId] = useState("");
  const [fOcultarInformadas, setFOcultarInformadas] = useState(false);

  // Estado listado
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const empresaBloqueada = !empresaSeleccionada;
  const empresaIdEfectiva = useMemo(() => empresaSeleccionada?.id || "", [empresaSeleccionada]);

  // Helper para mostrar período como MM/YYYY
  const formatPeriodo = useCallback((p) => {
    if (!p) return "";
    const mm = String(p.mes).padStart(2, "0");
    return `${mm}/${p.anio}`;
  }, []);

  // nombre corto de la empresa para el modal
  const empresaNombreCorto = useMemo(() => {
    if (empresaSeleccionada?.nombrecorto) return empresaSeleccionada.nombrecorto;
    const e = empresas?.find((x) => Number(x.id) === Number(empresaIdEfectiva));
    return e?.nombrecorto || "";
  }, [empresaSeleccionada, empresas, empresaIdEfectiva]);

  // Cargar períodos desde backend
  const fetchPeriodos = useCallback(async () => {
    try {
      setLoadingPeriodos(true);
      setErrPeriodos(null);
      const r = await fetch(`${apiUrl}/periodoliquidacion`, { credentials: "include" });
      if (!r.ok) throw new Error("No se pudieron obtener los períodos.");
      const data = await r.json(); // [{id, anio, mes}, ...]
      setPeriodos(Array.isArray(data) ? data : []);
    } catch (e) {
      setErrPeriodos(e.message || "Error cargando períodos.");
      setPeriodos([]);
    } finally {
      setLoadingPeriodos(false);
    }
  }, []);

  useEffect(() => {
    fetchPeriodos();
  }, [fetchPeriodos]);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      if (empresaBloqueada) {
        setItems([]);
        return;
      }

      const qs = new URLSearchParams();
      if (empresaIdEfectiva) qs.append("empresa_id", empresaIdEfectiva);
      if (fPeriodoId) qs.append("periodo_id", fPeriodoId);
      if (fOcultarInformadas) qs.append("informada", "false");

      const r = await fetch(`${apiUrl}/compraproyectada?${qs.toString()}`, {
        credentials: "include",
      });
      if (!r.ok) throw new Error("No se pudo obtener el listado.");
      const data = await r.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Error cargando datos.");
    } finally {
      setLoading(false);
    }
  }, [empresaBloqueada, empresaIdEfectiva, fPeriodoId, fOcultarInformadas]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const onNueva = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const onEditar = (it) => {
    setEditingItem(it);
    setShowModal(true);
  };

  const onEliminar = async (it) => {
    if (!window.confirm("¿Eliminar compra proyectada?")) return;
    try {
      setLoading(true);
      const r = await fetch(`${apiUrl}/compraproyectada/${it.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!r.ok) throw new Error("No se pudo eliminar.");
      await fetchItems();
    } catch (e) {
      setErr(e.message || "Error eliminando.");
    } finally {
      setLoading(false);
    }
  };

  const onCloseModal = (ok) => {
    setShowModal(false);
    setEditingItem(null);
    if (ok) fetchItems();
  };

  const disabledUI = empresaBloqueada;

  return (
    <Container fluid className="mt-3 cpm-page">
      <Row>
        <Col>
          <Card className="cpm-card">
            <Card.Header className="d-flex align-items-center justify-content-between cpm-header">
              <div>
                <strong>Compras Proyectadas</strong>
              </div>
              <div className="d-flex gap-2">
                <Button onClick={onNueva} disabled={disabledUI} className="cpm-btn">
                  Nueva Compra
                </Button>
              </div>
            </Card.Header>

            <Card.Body>
              {empresaBloqueada && (
                <Alert variant="warning" className="mb-3">
                  Debes seleccionar una empresa para ver/crear compras proyectadas.
                </Alert>
              )}

              {errPeriodos && (
                <Alert variant="warning" className="mb-3">
                  {errPeriodos}
                </Alert>
              )}

              {/* Filtros */}
              <Form className="mb-3 cpm-filters">
                <Row className="g-2">
                  <Col md={3}>
                    <Form.Label>Período</Form.Label>
                    <Form.Select
                      value={fPeriodoId}
                      onChange={(e) => setFPeriodoId(e.target.value)}
                      disabled={disabledUI || loadingPeriodos}
                      className="form-control my-input"
                    >
                      <option value="">{loadingPeriodos ? "Cargando..." : "Todos"}</option>
                      {periodos.map((p) => (
                        <option key={p.id} value={String(p.id)}>
                          {formatPeriodo(p)}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>

                  <Col md={3} className="d-flex align-items-end">
                    <Form.Check
                      type="switch"
                      id="filtro-informadas"
                      label="Ocultar informadas"
                      checked={fOcultarInformadas}
                      onChange={(e) => setFOcultarInformadas(e.target.checked)}
                      disabled={disabledUI}
                    />
                  </Col>

                  <Col md={3} className="d-flex align-items-end">
                    <Button onClick={fetchItems} disabled={disabledUI} className="cpm-btn">
                      Aplicar filtros
                    </Button>
                  </Col>
                </Row>
              </Form>

              {/* Mensajes/Loading */}
              {err && <Alert variant="danger">{err}</Alert>}
              {loading && (
                <div className="my-2">
                  <Spinner animation="border" size="sm" /> Cargando...
                </div>
              )}

              {/* Tabla */}
              <div className="table-responsive">
                <Table striped bordered hover size="sm" className="mb-0 cpm-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Proveedor</th>
                      <th>Libro IVA</th>
                      <th>Período</th>
                      <th className="text-end">Cant</th>
                      <th className="text-end">Kg</th>
                      <th className="text-end">Precio</th>
                      <th className="text-end">Bruto</th>
                      <th className="text-end">IVA</th>
                      <th className="text-end">Neto</th>
                      <th>Informada</th>
                      <th style={{ width: 140 }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="text-center text-muted">
                          {disabledUI ? "Seleccione una empresa" : "Sin datos"}
                        </td>
                      </tr>
                    ) : (
                      items.map((it) => (
                        <tr key={it.id}>
                          <td>{it.fecha}</td>
                          <td>{it.proveedor?.razonsocial || it.proveedor?.nombre || it.proveedor_id}</td>
                          <td>{it.libroiva?.descripcion || it.libroiva_id}</td>
                          <td>{it.periodo ? formatPeriodo(it.periodo) : it.periodo_id}</td>
                          <td className="text-end">{it.cantidad ?? ""}</td>
                          <td className="text-end">{it.kg ?? ""}</td>
                          <td className="text-end">{it.precio ?? ""}</td>
                          <td className="text-end">{it.bruto}</td>
                          <td className="text-end">{it.iva}</td>
                          <td className="text-end">{it.neto}</td>
                          <td>{it.informada ? <Badge bg="success">Sí</Badge> : <Badge bg="secondary">No</Badge>}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button size="sm" variant="outline-primary" onClick={() => onEditar(it)} className="cpm-btn-light mx-2">
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => onEliminar(it)}
                                disabled={loading}
                                className="cpm-btn-light"
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
        </Col>
      </Row>

      {/* Modal alta/edición */}
      <CompraProyectadaModal
        show={showModal}
        onClose={onCloseModal}
        initialItem={editingItem}
        empresaId={empresaIdEfectiva || empresaSeleccionada?.id || null}
        empresaNombreCorto={empresaNombreCorto}
        librosIva={librosIvaTabla}
        proveedores={proveedoresTabla}
        periodos={periodos}
        disabledGlobal={empresaBloqueada}
      />
    </Container>
  );
}
