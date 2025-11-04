// src/components/hacienda/RegistroHacienda.js
import { useEffect, useMemo, useState, useContext } from "react";
import { Container, Table, Button, Spinner, Alert, Row, Col, Form, Pagination } from "react-bootstrap";
import Contexts from "../../context/Contexts";
import NuevoRegistroHacienda from "./NuevoRegistroHacienda";

const apiUrl = process.env.REACT_APP_API_URL;

const fmtNum = (n, dec = 2) =>
  new Intl.NumberFormat("es-AR", { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(Number(n || 0));

export default function RegistroHacienda() {
  const data = useContext(Contexts.DataContext) || {};
  const {
    proveedoresTabla = [],
    frigorificoTabla = [],
    empresasTabla = [],
  } = data;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNuevo, setShowNuevo] = useState(false);
  const [editItem, setEditItem] = useState(null); // para edición
  const [error, setError] = useState(null);

  // Filtros (frontend)
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [frigorificoId, setFrigorificoId] = useState("");
  const [empresaId, setEmpresaId] = useState("");

  // Paginación
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Maps para mostrar nombres
  const mapProv = useMemo(() => {
    const m = new Map();
    proveedoresTabla.forEach(p => m.set(Number(p.id), (p.nombre ?? p.razonsocial ?? p.descripcion ?? `Proveedor #${p.id}`)));
    return m;
  }, [proveedoresTabla]);

  const mapFrigo = useMemo(() => {
    const m = new Map();
    frigorificoTabla.forEach(f => m.set(Number(f.id), (f.descripcion ?? f.nombre ?? `Frigorífico #${f.id}`)));
    return m;
  }, [frigorificoTabla]);

  const mapEmp = useMemo(() => {
    const m = new Map();
    empresasTabla.forEach(e => m.set(Number(e.id), (e.nombrecorto ?? e.nombre ?? e.fantasia ?? `Empresa #${e.id}`)));
    return m;
  }, [empresasTabla]);

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetch(`${apiUrl}/registrohacienda?includeAnulados=0`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudo listar");
      setItems(Array.isArray(json) ? json : []);
      setPage(1);
    } catch (e) {
      setError(e.message || "Error al cargar");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Filtrado en frontend
  const filtered = useMemo(() => {
    const fd = fechaDesde ? new Date(fechaDesde) : null;
    const fh = fechaHasta ? new Date(fechaHasta) : null;

    return items.filter(r => {
      // fecha
      if (fd || fh) {
        const rf = new Date(r.fecha);
        if (fd && rf < fd) return false;
        if (fh && rf > fh) return false;
      }
      // proveedor
      if (proveedorId && Number(r.proveedor_id) !== Number(proveedorId)) return false;
      // frigorífico
      if (frigorificoId && Number(r.frigorifico_id) !== Number(frigorificoId)) return false;
      // empresa
      if (empresaId && Number(r.empresa_id) !== Number(empresaId)) return false;

      return true;
    });
  }, [items, fechaDesde, fechaHasta, proveedorId, frigorificoId, empresaId]);

  // Totales de la página filtrada (o totales generales? Pediste total al final, lo dejo del conjunto filtrado)
  const total = useMemo(() => filtered.reduce((a, b) => a + Number(b.montototal || 0), 0), [filtered]);

  // Paginación local
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);

  const handleDelete = async (row) => {
    const ok = window.confirm(`¿Eliminar el registro #${row.id}?`);
    if (!ok) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/registrohacienda/${row.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudo eliminar");
      await load();
    } catch (e) {
      setError(e.message || "Error al eliminar");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setEditItem(row);
    setShowNuevo(true);
  };

  const clearFilters = () => {
    setFechaDesde("");
    setFechaHasta("");
    setProveedorId("");
    setFrigorificoId("");
    setEmpresaId("");
    setPage(1);
  };

  return (
    <Container fluid>
      <h1 className="my-list-title dark-text">Registro de Hacienda</h1>

      {/* Filtros */}
      <Form className="mb-3">
        <Row className="g-2">
          <Col md={2}>
            <Form.Label>Fecha desde</Form.Label>
            <Form.Control type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
          </Col>
          <Col md={2}>
            <Form.Label>Fecha hasta</Form.Label>
            <Form.Control type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
          </Col>
          <Col md={2}>
            <Form.Label>Proveedor</Form.Label>
            <Form.Select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} className="form-control my-input">
              <option value="">Todos</option>
              {proveedoresTabla.map(p => (
                <option key={p.id} value={p.id}>{p.nombre ?? p.razonsocial ?? p.descripcion ?? `Proveedor #${p.id}`}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Label>Frigorífico</Form.Label>
            <Form.Select value={frigorificoId} onChange={(e) => setFrigorificoId(e.target.value)} className="form-control my-input">
              <option value="">Todos</option>
              {frigorificoTabla.map(f => (
                <option key={f.id} value={f.id}>{f.descripcion ?? f.nombre ?? `Frigorífico #${f.id}`}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Label>Empresa</Form.Label>
            <Form.Select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)} className="form-control my-input">
              <option value="">Todas</option>
              {empresasTabla.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.descripcion ?? emp.nombre ?? emp.fantasia ?? `Empresa #${emp.id}`}</option>
              ))}
            </Form.Select>
          </Col>
        </Row>
        <Row className="g-2 mt-2">
          <Col md="auto">
            <Button variant="outline-secondary" onClick={() => setPage(1)}>Aplicar</Button>
          </Col>
          <Col md="auto">
            <Button variant="outline-secondary" onClick={clearFilters}>Limpiar</Button>
          </Col>
          <Col md="auto">
            <Button variant="success" onClick={() => { setEditItem(null); setShowNuevo(true); }}>
              Nuevo Registro
            </Button>
          </Col>
          <Col className="ms-auto" md="auto">
            <Form.Label>Por página</Form.Label>
            <Form.Select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
              className="form-control my-input"
            >
              {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </Form.Select>
          </Col>
        </Row>
      </Form>

      {error && <Alert variant="danger" className="py-2">{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Tropa</th>
            <th>Cat. Animal</th>
            <th className="text-end">Cant. Animales</th>
            <th className="text-end">Peso Neto</th>
            <th className="text-end">Precio Kg Vivo</th>
            <th className="text-end">Importe Neto</th>
            <th className="text-end">Flete</th>
            <th className="text-end">Comisión</th>
            <th className="text-end">Viáticos</th>
            <th className="text-end">Imp. Cheque</th>
            <th className="text-end">Gastos Faena</th>
            <th className="text-end">Monto Total</th>
            <th className="text-end">Kgs Romaneo</th>
            <th className="text-end">Rendimiento %</th>
            <th>Proveedor</th>
            <th>Frigorífico</th>
            <th>Empresa</th>
            {/* <th className="text-end">Cant. Medias</th> */}
            <th style={{ width: 120 }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={20} className="text-center text-muted">
              <Spinner animation="border" size="sm" /> Cargando…
            </td></tr>
          )}

          {!loading && pageItems.map((r) => (
            <tr
              key={r.id}
              style={r.hacienda && r.hacienda.comprobante_id == null ? { color: "#b02a37" } : undefined}
            >
              <td>{r.id}</td>
              <td>{r.fecha}</td>
              <td>{r.tropa}</td>
              <td>{r.categoriaanimal_id}</td>
              <td className="text-end">{fmtNum(r.cantidadanimales, 0)}</td>
              <td className="text-end">{fmtNum(r.pesoneto)}</td>
              <td className="text-end">{fmtNum(r.preciokgvivo)}</td>
              <td className="text-end">{fmtNum(r.importeneto)}</td>
              <td className="text-end">{fmtNum(r.flete)}</td>
              <td className="text-end">{fmtNum(r.comsion)}</td>
              <td className="text-end">{fmtNum(r.viaticos)}</td>
              <td className="text-end">{fmtNum(r.imptoalcheque)}</td>
              <td className="text-end">{fmtNum(r.gastosfaena)}</td>
              <td className="text-end"><strong>{fmtNum(r.montototal)}</strong></td>
              <td className="text-end">{fmtNum(r.kgsromaneo)}</td>
              <td className="text-end">{r.rendimiento != null ? fmtNum(r.rendimiento) : ""}</td>
              <td>{mapProv.get(Number(r.proveedor_id)) || r.proveedor_id}</td>
              <td>{mapFrigo.get(Number(r.frigorifico_id)) || r.frigorifico_id}</td>
              <td>{mapEmp.get(Number(r.empresa_id)) || r.empresa_id}</td>
              {/* <td className="text-end">{r.cantidadmedias != null ? fmtNum(r.cantidadmedias, 0) : ""}</td> */}
              <td className="text-center">
                <div className="d-flex justify-content-center gap-2">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    style={{ width: 110 }}
                    onClick={() => handleEdit(r)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    style={{ width: 110 }}
                    onClick={() => handleDelete(r)}
                    className="mx-2"
                  >
                    Eliminar
                  </Button>
                </div>
              </td>

            </tr>
          ))}

          {!loading && pageItems.length === 0 && (
            <tr><td colSpan={20} className="text-center text-muted">
              Sin registros para mostrar.
            </td></tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={13} className="text-end"><strong>Total (filtrado)</strong></td>
            <td className="text-end"><strong>{fmtNum(total)}</strong></td>
            <td colSpan={6}></td>
          </tr>
        </tfoot>
      </Table>

      {/* Paginación */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="text-muted">
          Mostrando {filtered.length === 0 ? 0 : start + 1}–{Math.min(start + perPage, filtered.length)} de {filtered.length}
        </div>
        <Pagination className="mb-0">
          <Pagination.First onClick={() => setPage(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} />
          {[...Array(pageCount)].map((_, i) => {
            const p = i + 1;
            // muestra solo algunas páginas si hay muchas
            if (pageCount > 7) {
              if (p === 1 || p === pageCount || Math.abs(p - currentPage) <= 1) {
                return <Pagination.Item key={p} active={p === currentPage} onClick={() => setPage(p)}>{p}</Pagination.Item>;
              }
              if (p === 2 && currentPage > 3) return <Pagination.Ellipsis key="start-ellipsis" disabled />;
              if (p === pageCount - 1 && currentPage < pageCount - 2) return <Pagination.Ellipsis key="end-ellipsis" disabled />;
              return null;
            }
            return <Pagination.Item key={p} active={p === currentPage} onClick={() => setPage(p)}>{p}</Pagination.Item>;
          })}
          <Pagination.Next onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={currentPage === pageCount} />
          <Pagination.Last onClick={() => setPage(pageCount)} disabled={currentPage === pageCount} />
        </Pagination>
      </div>

      <NuevoRegistroHacienda
        show={showNuevo}
        onHide={() => { setShowNuevo(false); setEditItem(null); }}
        onCreated={() => { setShowNuevo(false); setEditItem(null); load(); }}
        // Modo edición: pasa initialItem (el modal debe soportarlo)
        mode={editItem ? "edit" : "create"}
        initialItem={editItem || undefined}
      />
    </Container>
  );
}
