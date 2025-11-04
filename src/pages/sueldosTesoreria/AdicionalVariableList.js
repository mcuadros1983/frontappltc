import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table, Button, Form, Spinner, Badge } from "react-bootstrap";
import dayjs from "dayjs";
import Contexts from "../../context/Contexts";
import AdicionalVariableEditModal from "./AdicionalVariableEditModal";

const apiUrl = process.env.REACT_APP_API_URL;

export default function AdicionalVariableList() {
  const dataContext = useContext(Contexts.DataContext);
  const empleadosCtx = dataContext?.empleados || [];

  // helpers para nombre empleado desde contexto (clientePersona > empleado)
  const nombreDeEmpleado = useCallback(
    (empleadoId, empleadoIncluido) => {
      const ctx = empleadosCtx.find((e) => String(e?.empleado?.id) === String(empleadoId));
      if (ctx) {
        const ap = ctx?.clientePersona?.apellido || ctx?.empleado?.apellido || "";
        const no = ctx?.clientePersona?.nombre || ctx?.empleado?.nombre || "";
        return `${ap} ${no}`.trim();
      }
      if (empleadoIncluido) {
        const ap = empleadoIncluido.apellido || "";
        const no = empleadoIncluido.nombre || "";
        return `${ap} ${no}`.trim();
      }
      return `Empleado #${empleadoId}`;
    },
    [empleadosCtx]
  );

  // filtros
  const [usePeriodo, setUsePeriodo] = useState(false); // filtro por período opcional
  const [periodo, setPeriodo] = useState(dayjs().format("YYYY-MM"));
  const [empleadoId, setEmpleadoId] = useState("");
  const [q, setQ] = useState("");

  // datos
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // modal
  const [showEdit, setShowEdit] = useState(false);
  const [editItem, setEditItem] = useState(null); // null => crear

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (usePeriodo && periodo) p.set("periodo", periodo);
    if (empleadoId) p.set("empleado_id", empleadoId);
    if (q.trim()) p.set("q", q.trim());
    p.set("order", "createdAt");
    p.set("dir", "DESC");
    p.set("limit", "200");
    return p.toString();
  }, [usePeriodo, periodo, empleadoId, q]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`${apiUrl}/adicionalvariable?${qs}`, { credentials: "include" });
      if (!r.ok) {
        const x = await r.json().catch(() => ({}));
        throw new Error(x?.error || "No se pudo obtener la lista.");
      }
      const data = await r.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  }, [qs]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const abrirCrear = () => {
    setEditItem(null);
    setShowEdit(true);
  };
  const abrirEditar = (item) => {
    setEditItem(item);
    setShowEdit(true);
  };
  const cerrarModal = (changed) => {
    setShowEdit(false);
    setEditItem(null);
    if (changed) fetchData();
  };

  const eliminar = async (item) => {
    if (!window.confirm(`¿Eliminar el adicional "${item.descripcion ?? "(sin descripción)"}" de ${nombreDeEmpleado(item.empleado_id, item.Empleado)}?`)) return;
    try {
      setLoading(true);
      const r = await fetch(`${apiUrl}/adicionalvariable/${item.id}`, { method: "DELETE", credentials: "include" });
      if (!r.ok) {
        const x = await r.json().catch(() => ({}));
        throw new Error(x?.error || "No se pudo eliminar.");
      }
      fetchData();
    } catch (e) {
      console.error(e);
      setErr(e.message || "No se pudo eliminar.");
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setUsePeriodo(false);
    setPeriodo(dayjs().format("YYYY-MM"));
    setEmpleadoId("");
    setQ("");
  };

  const renderPeriodo = (row) => {
    if (row?.Periodo && typeof row.Periodo.mes === "number" && typeof row.Periodo.anio === "number") {
      return `${String(row.Periodo.mes).padStart(2, "0")}/${row.Periodo.anio}`;
    }
    // fallback al string original si el include no llegó
    return row?.periodo ?? "—";
  };

  return (
    <Container className="py-3">
      <Row className="align-items-end g-2 mb-3">
        <Col md={3}>
          <Form.Group>
            <Form.Check
              type="checkbox"
              id="use-periodo"
              label="Filtrar por período"
              checked={usePeriodo}
              onChange={(e) => setUsePeriodo(e.target.checked)}
            />
            <Form.Control
              type="month"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              disabled={!usePeriodo}
              className="mt-1"
            />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>Empleado</Form.Label>
            <Form.Select
              value={empleadoId}
              onChange={(e) => setEmpleadoId(e.target.value)}
              className="form-control my-input"
            >
              <option value="">— Todos —</option>
              {empleadosCtx.map((item) => {
                const id = item?.empleado?.id;
                const ap = item?.clientePersona?.apellido || item?.empleado?.apellido || "";
                const no = item?.clientePersona?.nombre || item?.empleado?.nombre || "";
                return (
                  <option key={id} value={id}>
                    {ap} {no}
                  </option>
                );
              })}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group>
            <Form.Label>Buscar</Form.Label>
            <Form.Control
              placeholder="Descripción"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchData()}
            />
          </Form.Group>
        </Col>

        <Col md="auto" className="d-flex gap-2">
          <Button onClick={fetchData} disabled={loading} className="my-2 mx-2">
            {loading ? <><Spinner size="sm" className="me-2" />Buscando…</> : "Buscar"}
          </Button>
          <Button variant="outline-secondary" onClick={limpiarFiltros} className="my-2">
            Limpiar
          </Button>
          <Button variant="success" onClick={abrirCrear} className="my-2 mx-2">
            Nuevo adicional
          </Button>
        </Col>
      </Row>

      {err && <div className="alert alert-danger py-2">{err}</div>}

      <div className="table-responsive">
        <Table bordered hover size="sm" striped>
          <thead>
            <tr>
              <th style={{ width: 80 }}>ID</th>
              <th>Empleado</th>
              <th>Descripción</th>
              <th style={{ width: 110 }}>Período</th>
              <th style={{ width: 140 }}>Monto</th>
              <th>Fecha</th>
              <th>Observaciones</th>
              <th style={{ width: 200 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center">
                  <Spinner size="sm" className="me-2" />
                  Cargando…
                </td>
              </tr>
            ) : rows.length ? (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{nombreDeEmpleado(row.empleado_id, row.Empleado)}</td>
                  <td>{row.descripcion || <span className="text-muted">—</span>}</td>
                  <td>{renderPeriodo(row)}</td>
                  <td>
                    <Badge bg={Number(row.monto) < 0 ? "danger" : "secondary"}>
                      ${Number(row.monto).toFixed(2)}
                    </Badge>
                  </td>
                  <td>{row.fecha || <span className="text-muted">—</span>}</td>
                  <td>{row.observaciones || <span className="text-muted">—</span>}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => abrirEditar(row)}
                        className="mx-2"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => eliminar(row)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7} className="text-center">Sin resultados</td></tr>
            )}
          </tbody>
        </Table>
      </div>

      {showEdit && (
        <AdicionalVariableEditModal
          show={showEdit}
          onClose={cerrarModal}
          editItem={editItem}            // null => crear
          empleados={empleadosCtx}
        />
      )}
    </Container>
  );
}
