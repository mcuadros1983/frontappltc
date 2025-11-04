import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table, Button, Spinner, Alert, Form } from "react-bootstrap";
import { BsTrash, BsPencil, BsPlusLg, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import EventoModal from "./EventoModal";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

const nombreEmpleado = (item) => {
  // Soporta varias formas que vimos en tu app
  const ap = item?.clientePersona?.apellido || item?.empleado?.apellido || item?.apellido || "";
  const no = item?.clientePersona?.nombre || item?.empleado?.nombre || item?.nombre || "";
  const full = `${ap} ${no}`.trim();
  return full || `Empleado #${item?.empleado?.id ?? item?.id ?? ""}`;
};

export default function EventoManager() {
  // Empleados desde tu DataContext (como en otros componentes)
  const dataContext = useContext(Contexts.DataContext);
  const empleadosCtx = dataContext?.empleados || [];

  const [rows, setRows] = useState([]);           // eventos
  const [conceptos, setConceptos] = useState([]); // opciones
  const [sucursales, setSucursales] = useState([]); // opciones

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // filtros
  const [filter, setFilter] = useState({
    fromDate: "",
    toDate: "",
    empleado_id: "",
    sucursal_id: "",
    concepto_id: "",
  });

  // orden y paginación
  const [sortConfig, setSortConfig] = useState({ key: "fecha_desde", direction: "DESC" });
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null); // { id?, fecha_desde, fecha_hasta, concepto_id, empleado_id, sucursal_id, observaciones }

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      // eventos
      const r1 = await fetch(`${apiUrl}/eventos?limit=1000&order=fecha_desde&dir=DESC`, { credentials: "include" });
      const d1 = await r1.json().catch(() => null);
      if (!r1.ok) throw new Error(d1?.error || "No se pudo obtener eventos.");
      const itemsEv = Array.isArray(d1?.items) ? d1.items : (Array.isArray(d1) ? d1 : []);
      setRows(itemsEv);

      // conceptos
      const r2 = await fetch(`${apiUrl}/conceptos?limit=1000&order=nombre&dir=ASC`, { credentials: "include" });
      const d2 = await r2.json().catch(() => null);
      if (!r2.ok) throw new Error(d2?.error || "No se pudo obtener conceptos.");
      const itemsCo = Array.isArray(d2?.items) ? d2.items : (Array.isArray(d2) ? d2 : []);
      setConceptos(itemsCo);

      // sucursales
      const r3 = await fetch(`${apiUrl}/sucursales?limit=1000&order=nombre&dir=ASC`, { credentials: "include" });
      const d3 = await r3.json().catch(() => null);
      if (!r3.ok) throw new Error(d3?.error || "No se pudo obtener sucursales.");
      const itemsSu = Array.isArray(d3?.rows) ? d3.rows : (Array.isArray(d3?.items) ? d3.items : (Array.isArray(d3) ? d3 : []));
      setSucursales(itemsSu);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error al cargar la información.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const conceptosMap = useMemo(() => {
    const m = new Map();
    for (const c of conceptos || []) m.set(Number(c.id), c);
    return m;
  }, [conceptos]);

  const sucursalesMap = useMemo(() => {
    const m = new Map();
    for (const s of sucursales || []) m.set(Number(s.id), s);
    return m;
  }, [sucursales]);

  const empleadosMap = useMemo(() => {
    const m = new Map();
    for (const e of empleadosCtx || []) {
      const id = Number(e?.empleado?.id ?? e?.id);
      if (!id) continue;
      m.set(id, e);
    }
    return m;
  }, [empleadosCtx]);

  const findConceptName = (id) => conceptosMap.get(Number(id))?.nombre || `Concepto #${id ?? "—"}`;
  const findSucursalName = (id) => sucursalesMap.get(Number(id))?.nombre || `Sucursal #${id ?? "—"}`;
  const findEmpleadoName = (id) => {
    const emp = empleadosMap.get(Number(id));
    return emp ? nombreEmpleado(emp) : `Empleado #${id ?? "—"}`;
  };

  // filtrar
  const filtered = useMemo(() => {
    let arr = [...(rows || [])];
    const { fromDate, toDate, empleado_id, sucursal_id, concepto_id } = filter;

    if (fromDate) {
      const d = new Date(fromDate);
      arr = arr.filter(ev => new Date(ev.fecha_desde) >= d);
    }
    if (toDate) {
      const d = new Date(toDate);
      arr = arr.filter(ev => new Date(ev.fecha_desde) <= d);
    }
    if (empleado_id) arr = arr.filter(ev => Number(ev.empleado_id ?? ev.empleado) === Number(empleado_id));
    if (sucursal_id) arr = arr.filter(ev => Number(ev.sucursal_id ?? ev.sucursal) === Number(sucursal_id));
    if (concepto_id) arr = arr.filter(ev => Number(ev.concepto_id ?? ev.concepto) === Number(concepto_id));

    // ordenar
    const { key, direction } = sortConfig;
    arr.sort((a, b) => {
      const va = a[key] ?? a[`${key}`];
      const vb = b[key] ?? b[`${key}`];

      // fechas
      if (key === "fecha_desde" || key === "fecha_hasta") {
        const da = new Date(va);
        const db = new Date(vb);
        return direction === "ASC" ? da - db : db - da;
      }
      // numéricos
      if (["concepto_id", "empleado_id", "sucursal_id", "id"].includes(key)) {
        const na = Number(va);
        const nb = Number(vb);
        return direction === "ASC" ? na - nb : nb - na;
      }
      // texto genérico
      const sa = String(va ?? "").toLowerCase();
      const sb = String(vb ?? "").toLowerCase();
      if (sa < sb) return direction === "ASC" ? -1 : 1;
      if (sa > sb) return direction === "ASC" ? 1 : -1;
      return 0;
    });

    return arr;
  }, [rows, filter, sortConfig]);

  // paginar
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * perPage;
  const currentRows = filtered.slice(start, start + perPage);

  const requestSort = (key) => {
    setPage(1);
    setSortConfig((prev) => {
      const dir = prev.key === key && prev.direction === "ASC" ? "DESC" : "ASC";
      return { key, direction: dir };
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setPage(1);
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const abrirNuevo = () => { setEditItem(null); setShowModal(true); };
  const abrirEditar = (row) => {
    setEditItem({
      id: row.id,
      fecha_desde: row.fecha_desde || "",
      fecha_hasta: row.fecha_hasta || "",
      concepto_id: Number(row.concepto_id ?? row.concepto),
      empleado_id: Number(row.empleado_id ?? row.empleado),
      sucursal_id: Number(row.sucursal_id ?? row.sucursal),
      observaciones: row.observaciones || "",
    });
    setShowModal(true);
  };
  const cerrarModal = (changed = false) => {
    setShowModal(false);
    setEditItem(null);
    if (changed) fetchAll();
  };

  const eliminarEvento = async (id) => {
    const ok = window.confirm("¿Eliminar este evento? Esta acción no se puede deshacer.");
    if (!ok) return;
    try {
      const r = await fetch(`${apiUrl}/eventos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await r.json().catch(() => null);
      if (!r.ok) throw new Error(data?.error || "No se pudo eliminar el evento.");
      fetchAll();
    } catch (e) {
      console.error(e);
      alert(e.message || "Error al eliminar.");
    }
  };

  return (
    <Container className="py-3">
      <Row className="align-items-center mb-2">
        <Col><h4 className="mb-0">Eventos</h4></Col>
        <Col md="auto" className="d-flex gap-2">
          <Button onClick={abrirNuevo}><BsPlusLg className="me-2" />Nuevo</Button>
          <Button variant="outline-secondary" onClick={fetchAll} disabled={loading}>
            {loading ? (<><Spinner size="sm" className="me-2" />Actualizando…</>) : "Actualizar"}
          </Button>
        </Col>
      </Row>

      {/* Filtros */}
      <Form className="mb-3">
        <Row className="g-3">
          <Col md={3}>
            <Form.Group controlId="fromDate">
              <Form.Label>Desde</Form.Label>
              <Form.Control type="date" name="fromDate" value={filter.fromDate} onChange={handleFilterChange} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="toDate">
              <Form.Label>Hasta</Form.Label>
              <Form.Control type="date" name="toDate" value={filter.toDate} onChange={handleFilterChange} />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="concepto_id">
              <Form.Label>Concepto</Form.Label>
              <Form.Select name="concepto_id" value={filter.concepto_id} onChange={handleFilterChange} className="my-input form-control">
                <option value="">Todos</option>
                {conceptos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="empleado_id">
              <Form.Label>Empleado</Form.Label>
              <Form.Select name="empleado_id" value={filter.empleado_id} onChange={handleFilterChange} className="my-input form-control">
                <option value="">Todos</option>
                {empleadosCtx.map((e) => {
                  const id = e?.empleado?.id ?? e?.id;
                  return <option key={id} value={id}>{nombreEmpleado(e)}</option>;
                })}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="sucursal_id">
              <Form.Label>Sucursal</Form.Label>
              <Form.Select name="sucursal_id" value={filter.sucursal_id} onChange={handleFilterChange} className="my-input form-control">
                <option value="">Todas</option>
                {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Form>

      {err && <Alert variant="danger">{err}</Alert>}

      <div className="table-responsive">
        <Table bordered hover striped size="sm">
          <thead>
            <tr>
              <th style={{ width: 80 }} onClick={() => requestSort("id")}>#</th>
              <th onClick={() => requestSort("fecha_desde")}>Fecha Desde</th>
              <th onClick={() => requestSort("fecha_hasta")}>Fecha Hasta</th>
              <th onClick={() => requestSort("concepto_id")}>Concepto</th>
              <th onClick={() => requestSort("empleado_id")}>Empleado</th>
              <th onClick={() => requestSort("sucursal_id")}>Sucursal</th>
              <th>Observaciones</th>
              <th style={{ width: 200 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center"><Spinner size="sm" className="me-2" /> Cargando…</td></tr>
            ) : currentRows.length ? (
              currentRows.map((ev, idx) => (
                <tr key={ev.id} onDoubleClick={() => abrirEditar(ev)} style={{ cursor: "pointer" }}>
                  <td>{start + idx + 1}</td>
                  <td>{ev.fecha_desde}</td>
                  <td>{ev.fecha_hasta}</td>
                  <td>{findConceptName(ev.concepto_id ?? ev.concepto)}</td>
                  <td>{findEmpleadoName(ev.empleado_id ?? ev.empleado)}</td>
                  <td>{findSucursalName(ev.sucursal_id ?? ev.sucursal)}</td>
                  <td className="text-truncate" style={{ maxWidth: 280 }}>{ev.observaciones || "—"}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="outline-primary" onClick={() => abrirEditar(ev)}>
                        <BsPencil /> Editar
                      </Button>
                      <Button size="sm" variant="outline-danger" className="mx-2" onClick={() => eliminarEvento(ev.id)}>
                        <BsTrash /> Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={8} className="text-center">Sin resultados</td></tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="d-flex justify-content-center align-items-center mt-3">
        <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
          <BsChevronLeft />
        </Button>
        <span className="mx-2">Página {currentPage} de {totalPages}</span>
        <Button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
          <BsChevronRight />
        </Button>
      </div>

      {showModal && (
        <EventoModal
          show={showModal}
          onClose={cerrarModal}
          initialData={editItem}
          conceptos={conceptos}
          sucursales={sucursales}
          empleados={empleadosCtx}
        />
      )}
    </Container>
  );
}
