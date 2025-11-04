import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table, Button, Form, Spinner } from "react-bootstrap";
import dayjs from "dayjs";
import Contexts from "../../context/Contexts";
import AdicionalVariableCreateModal from "./AdicionalVariableCreateModal";

const apiUrl = process.env.REACT_APP_API_URL;

export default function AdicionalVariableManager() {
  const dataContext = useContext(Contexts.DataContext);
  const empleados = dataContext?.empleados || [];

  const [tipos, setTipos] = useState([]);
  const [periodo, setPeriodo] = useState(dayjs().format("YYYY-MM"));
  const [filtroEmpleadoId, setFiltroEmpleadoId] = useState("");
  const [filtroTipoId, setFiltroTipoId] = useState("");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // modal de creación manual
  const [showCreate, setShowCreate] = useState(false);
  const openCreate = () => setShowCreate(true);
  const closeCreate = (changed) => {
    setShowCreate(false);
    if (changed) fetchVariables(); // refrescar lista
  };

  const fetchTipos = useCallback(async () => {
    try {
      const r = await fetch(`${apiUrl}/adicionalvariabletipo`, { credentials: "include" });
      const data = await r.json();
      setTipos(data || []);
    } catch (e) {
      console.error(e);
    }
  }, [apiUrl]);

  const fetchVariables = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams();
      if (periodo) params.append("periodo", periodo);
      if (filtroEmpleadoId) params.append("empleado_id", filtroEmpleadoId);
      const url = `${apiUrl}/adicionalvariable?${params.toString()}`;
      const r = await fetch(url, { credentials: "include" });
      const data = await r.json();

      const sorted = [...(data || [])].sort((a, b) => {
        const ca = a.createdAt ? new Date(a.createdAt).getTime() : null;
        const cb = b.createdAt ? new Date(b.createdAt).getTime() : null;
        if (ca && cb) return cb - ca;
        if (ca && !cb) return -1;
        if (!ca && cb) return 1;
        return Number(b.id) - Number(a.id);
      });

      setRows(sorted);
    } catch (e) {
      console.error(e);
      setErr("No se pudo cargar la lista.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, periodo, filtroEmpleadoId]);

  useEffect(() => {
    fetchTipos();
  }, [fetchTipos]);

  useEffect(() => {
    fetchVariables();
  }, [fetchVariables]);

  const rowsFiltradas = useMemo(() => {
    return rows.filter((v) =>
      filtroTipoId ? String(v.adicionalvariabletipo_id) === String(filtroTipoId) : true
    );
  }, [rows, filtroTipoId]);

  return (
    <Container className="py-3">
      <Row className="align-items-end g-3 mb-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Período</Form.Label>
            <Form.Control
              type="month"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
            />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>Empleado</Form.Label>
            <Form.Select
              value={filtroEmpleadoId}
              onChange={(e) => setFiltroEmpleadoId(e.target.value)}
              className="form-control my-input"
            >
              <option value="">-- Todos --</option>
              {empleados.map((item) => {
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

        <Col md={4}>
          <Form.Group>
            <Form.Label>Tipo</Form.Label>
            <Form.Select
              value={filtroTipoId}
              onChange={(e) => setFiltroTipoId(e.target.value)}
              className="form-control my-input"
            >
              <option value="">-- Todos --</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>{t.descripcion}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md="auto">
          <Button onClick={openCreate} className="my-2">Cargar manual</Button>
        </Col>
      </Row>

      {err && <div className="alert alert-danger py-2">{err}</div>}

      <div className="table-responsive">
        <Table bordered hover striped size="sm">
          <thead>
            <tr>
              <th style={{width:80}}>ID</th>
              <th>Empleado</th>
              <th>Tipo</th>
              <th style={{width:120}}>Período</th>
              <th style={{width:140}}>Monto</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center"><Spinner size="sm" className="me-2" />Cargando…</td></tr>
            ) : rowsFiltradas.length ? (
              rowsFiltradas.map((v) => {
                const emp = empleados.find((e) => String(e?.empleado?.id) === String(v.empleado_id));
                const ap = emp?.clientePersona?.apellido || emp?.empleado?.apellido || "";
                const no = emp?.clientePersona?.nombre || emp?.empleado?.nombre || "";
                return (
                  <tr key={v.id}>
                    <td>{v.id}</td>
                    <td>{ap} {no}</td>
                    <td>{v.AdicionalVariableTipo?.descripcion || `Tipo #${v.adicionalvariabletipo_id}`}</td>
                    <td>{v.periodo}</td>
                    <td>{Number(v.monto).toFixed(2)}</td>
                    <td>{v.observaciones || "-"}</td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={6} className="text-center">Sin resultados</td></tr>
            )}
          </tbody>
        </Table>
      </div>

      {showCreate && (
        <AdicionalVariableCreateModal
          show={showCreate}
          onClose={closeCreate}
          empleados={empleados}
          tipos={tipos}
          defaultPeriodo={periodo}
        />
      )}
    </Container>
  );
}
