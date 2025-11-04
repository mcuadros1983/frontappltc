import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { asistenciasApi } from '../../services/asistenciasApi';
import Contexts from '../../context/Contexts';
import {
  Container,
  Card,
  Form,
  Row,
  Col,
  Table,
  Button,
} from "react-bootstrap";

// ----------------- helpers de TZ fija (Argentina UTC-3) -----------------

function toLocalAR(dateUtc) {
  const MS_OFFSET = 3 * 60 * 60 * 1000;
  return new Date(dateUtc.getTime());
}

function buildExpectedLocalAR(markLocalAR, hhmm) {
  if (!hhmm) return null;
  const [hhStr, mmStr] = hhmm.split(':');
  const hh = parseInt(hhStr, 10);
  const mm = parseInt(mmStr, 10);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;

  const d = new Date(markLocalAR.getTime());
  d.setHours(hh, mm, 0, 0);
  return d;
}

function formatLocalAR(isoUtcString) {
  if (!isoUtcString) return '—';
  try {
    const utcDate = new Date(isoUtcString);
    if (isNaN(utcDate.getTime())) return isoUtcString;

    const localAR = toLocalAR(utcDate);

    const dd   = String(localAR.getDate()).padStart(2, '0');
    const mo   = String(localAR.getMonth() + 1).padStart(2, '0');
    const yyyy = String(localAR.getFullYear());

    const HH   = String(localAR.getHours()).padStart(2, '0');
    const MM   = String(localAR.getMinutes()).padStart(2, '0');
    const SS   = String(localAR.getSeconds()).padStart(2, '0');

    return `${dd}/${mo}/${yyyy}, ${HH}:${MM}:${SS}`;
  } catch {
    return isoUtcString;
  }
}

function diffSignedInfo(row) {
  const concept = row.operation_concept; // 'INGRESO' | 'EGRESO'
  const expectedHHMM = row.expected_time; // ej "08:30" o null
  const tsUtc = row.ts_utc;

  if (!concept || !expectedHHMM || !tsUtc) {
    return { text: row.delta_hhmmss ?? '-', isBad: false };
  }

  const markUtc = new Date(tsUtc);
  if (isNaN(markUtc.getTime())) {
    return { text: row.delta_hhmmss ?? '-', isBad: false };
  }
  const markLocal = toLocalAR(markUtc);

  const expLocal = buildExpectedLocalAR(markLocal, expectedHHMM);
  if (!expLocal) {
    return { text: row.delta_hhmmss ?? '-', isBad: false };
  }

  const diffMs = markLocal.getTime() - expLocal.getTime();
  const diffMin = diffMs / 60000;

  let isBad = false;
  if (concept === 'INGRESO' && diffMin > 0.5) {
    isBad = true;
  } else if (concept === 'EGRESO' && diffMin < -0.5) {
    isBad = true;
  }

  const absMs = Math.abs(diffMs);
  const totalSec = Math.floor(absMs / 1000);
  const hh = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  const text = `${hh}:${mm}:${ss}`;

  return { text, isBad };
}

// -----------------------------------------------------------------------

export default function Asistencias() {
  const dataContext = useContext(Contexts.DataContext);

  // empleados desde contexto global (todos)
  const empleadosCtx = dataContext?.empleados || [];

  // solo empleados activos (sin fechabaja)
  const empleadosActivosCtx = useMemo(() => {
    return empleadosCtx.filter((e) => !e?.empleado?.fechabaja);
  }, [empleadosCtx]);

  // sucursales desde contexto global
  const sucursalesCtx =
    dataContext?.deSucursalesTabla ||
    dataContext?.sucursales ||
    [];

  // estado de tabla/paginación backend
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // filtros UI
  const [filtro, setFiltro] = useState({
    desde: '',
    hasta: '',
    sucursal_id: '',
    empleado_id: '',
  });

  // --------- ORDENAMIENTO EN CABECERA ---------
  // sortConfig guarda qué columna estamos ordenando y en qué dirección
  const [sortConfig, setSortConfig] = useState({
    key: 'ts_utc',
    direction: 'descending', // 'ascending' | 'descending'
  });

  const requestSort = (key) => {
    setSortConfig((prev) => {
      // si clickeás la misma columna, alterna asc/desc
      if (prev.key === key) {
        const nextDir = prev.direction === 'ascending' ? 'descending' : 'ascending';
        return { key, direction: nextDir };
      }
      // si es otra columna, arranca en ascending
      return { key, direction: 'ascending' };
    });
  };

  // itemsOrdenados = copia de items ordenada en memoria según sortConfig
  const itemsOrdenados = useMemo(() => {
    const arr = [...items];
    arr.sort((a, b) => {
      const { key, direction } = sortConfig;
      let av = a[key];
      let bv = b[key];

      // caso especial: fechas (ts_utc). Vamos a ordenarlas por valor Date real
      if (key === 'ts_utc') {
        const ad = new Date(av || 0).getTime();
        const bd = new Date(bv || 0).getTime();
        if (ad < bd) return direction === 'ascending' ? -1 : 1;
        if (ad > bd) return direction === 'ascending' ? 1 : -1;
        return 0;
      }

      // normalizamos a string o número para comparar
      // (por si son undefined / null)
      if (av === undefined || av === null) av = '';
      if (bv === undefined || bv === null) bv = '';

      if (av < bv) return direction === 'ascending' ? -1 : 1;
      if (av > bv) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [items, sortConfig]);
  // -------------------------------------------

  // helper: nombre legible de empleado
  const labelEmpleado = useCallback(
    (row) => {
      const empId = row.empleado_id;
      if (!empId) return '—';

      // Buscamos en todos (aunque esté dado de baja), para poder mostrar históricos
      const ctxEmp = empleadosCtx.find(
        (e) => String(e?.empleado?.id ?? e?.id) === String(empId)
      );

      if (ctxEmp) {
        const ap =
          ctxEmp?.clientePersona?.apellido ||
          ctxEmp?.empleado?.apellido ||
          '';
        const no =
          ctxEmp?.clientePersona?.nombre ||
          ctxEmp?.empleado?.nombre ||
          '';
        const full = `${ap} ${no}`.trim();
        if (full) return full.toUpperCase();
      }

      // fallback: usar lo que vino del backend
      if (row.empleado_apellido || row.empleado_nombre) {
        const ap = row.empleado_apellido || '';
        const no = row.empleado_nombre || '';
        const full = `${ap} ${no}`.trim();
        if (full) return full.toUpperCase();
      }

      return `EMPLEADO #${empId}`;
    },
    [empleadosCtx]
  );

  // helper: nombre legible de sucursal
  const labelSucursal = useCallback(
    (row) => {
      const sid = row.sucursal_id;
      if (!sid && !row.sucursal_nombre) {
        return '—';
      }

      const ctxSuc = sucursalesCtx.find(
        (s) => String(s?.id) === String(sid)
      );

      if (ctxSuc && ctxSuc.nombre) {
        return `[${ctxSuc.id}] ${ctxSuc.nombre}`.toUpperCase();
      }

      if (row.sucursal_nombre) {
        if (sid) {
          return `[${sid}] ${row.sucursal_nombre}`.toUpperCase();
        }
        return row.sucursal_nombre.toUpperCase();
      }

      if (sid) {
        return `SUCURSAL ${sid}`;
      }

      return '—';
    },
    [sucursalesCtx]
  );

  // carga tabla desde backend con filtros/paginación
  const load = useCallback(
    async (p = 1) => {
      try {
        setLoading(true);
        setErr('');

        const data = await asistenciasApi.listDetallado({
          ...filtro,
          page: p,
          limit,
        });

        setItems(data.items || []);
        setTotal(data.total || 0);
        setPage(data.page || p);
      } catch (e) {
        setErr(e?.message || 'Error cargando asistencias');
      } finally {
        setLoading(false);
      }
    },
    [filtro, limit]
  );

  // primera carga
  useEffect(() => {
    load(1);
  }, [load]);

  // total de páginas
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit]
  );

  // onChange genérico de filtros
  function onChangeFiltro(e) {
    const { name, value } = e.target;
    setFiltro((prev) => ({ ...prev, [name]: value }));
  }

  // submit buscar
  function onSubmit(e) {
    e.preventDefault();
    load(1);
  }

  // limpiar filtros
  function onLimpiar() {
    setFiltro({
      desde: '',
      hasta: '',
      sucursal_id: '',
      empleado_id: '',
    });
    setTimeout(() => load(1), 0);
  }

  // opciones de empleado SOLO activos
  const empleadoOptions = useMemo(() => {
    return empleadosActivosCtx
      .map((ctxEmp) => {
        const id = ctxEmp?.empleado?.id ?? ctxEmp?.id;
        const ap =
          ctxEmp?.clientePersona?.apellido ||
          ctxEmp?.empleado?.apellido ||
          '';
        const no =
          ctxEmp?.clientePersona?.nombre ||
          ctxEmp?.empleado?.nombre ||
          '';
        const label = `${ap} ${no}`.trim() || `Empleado #${id}`;
        return {
          id,
          label: label.toUpperCase(),
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [empleadosActivosCtx]);

  // opciones de sucursal
  const sucursalOptions = useMemo(() => {
    return [...sucursalesCtx]
      .map((s) => {
        const label = s?.nombre
          ? `[${s.id}] ${s.nombre}`
          : `Sucursal ${s?.id || ''}`;
        return {
          id: s?.id,
          label: label.toUpperCase(),
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [sucursalesCtx]);

  // estados visuales
  if (loading && items.length === 0) {
    return <div className="p-3">Cargando asistencias…</div>;
  }
  if (err) {
    return <div className="alert alert-danger m-3">{err}</div>;
  }

 return (
  <Container fluid className="mt-3 cpm-page">
    <Card className="cpm-card">
      <Card.Header className="cpm-header">
        <strong>Asistencias</strong>
      </Card.Header>

      <Card.Body>
        {/* Filtros */}
        <Form onSubmit={onSubmit} className="mb-3 cpm-filters">
          <Row className="g-2 align-items-end">
            <Col sm={3}>
              <Form.Label className="mb-1">Desde</Form.Label>
              <Form.Control
                type="date"
                name="desde"
                value={filtro.desde}
                onChange={onChangeFiltro}
                className="form-control my-input"
              />
            </Col>

            <Col sm={3}>
              <Form.Label className="mb-1">Hasta</Form.Label>
              <Form.Control
                type="date"
                name="hasta"
                value={filtro.hasta}
                onChange={onChangeFiltro}
                className="form-control my-input"
              />
            </Col>

            <Col sm={3}>
              <Form.Label className="mb-1">Sucursal</Form.Label>
              <Form.Select
                name="sucursal_id"
                value={filtro.sucursal_id}
                onChange={onChangeFiltro}
                className="form-control my-input"
              >
                <option value="">TODAS</option>
                {sucursalOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col sm={3}>
              <Form.Label className="mb-1">Empleado</Form.Label>
              <Form.Select
                name="empleado_id"
                value={filtro.empleado_id}
                onChange={onChangeFiltro}
                className="form-control my-input"
              >
                <option value="">TODOS</option>
                {empleadoOptions.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col xs={12} className="d-flex gap-2">
              <Button type="submit" className="cpm-btn">
                Buscar
              </Button>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={onLimpiar}
                className="cpm-btn-light"
              >
                Limpiar
              </Button>
            </Col>
          </Row>
        </Form>

        {/* Tabla */}
        <div className="table-responsive">
          <Table size="sm" striped bordered hover className="cpm-table align-middle">
            <thead>
              <tr>
                <th
                  style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                  onClick={() => requestSort("id")}
                >
                  #
                </th>
                <th
                  style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                  onClick={() => requestSort("ts_utc")}
                >
                  Fecha (local)
                </th>
                <th
                  style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                  onClick={() => requestSort("empleado_id")}
                >
                  Empleado
                </th>
                <th
                  style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                  onClick={() => requestSort("sucursal_id")}
                >
                  Sucursal
                </th>
                <th
                  style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                  onClick={() => requestSort("operation_concept")}
                >
                  Concepto
                </th>
                <th style={{ whiteSpace: "nowrap" }}>Jornada</th>
                <th style={{ whiteSpace: "nowrap" }}>Turno</th>
                <th style={{ whiteSpace: "nowrap" }}>Hora esperada</th>
                <th style={{ whiteSpace: "nowrap" }}>Delta</th>
              </tr>
            </thead>
            <tbody>
              {itemsOrdenados.map((a, i) => {
                const empleadoStr = labelEmpleado(a);
                const sucursalStr = labelSucursal(a);
                const { text: deltaText, isBad } = diffSignedInfo(a);

                return (
                  <tr key={a.id ?? `${a.empleado_id}-${i}`}>
                    <td>{a.id}</td>
                    <td>{formatLocalAR(a.ts_utc)}</td>
                    <td>{empleadoStr}</td>
                    <td>{sucursalStr}</td>
                    <td>{a.operation_concept || "-"}</td>
                    <td>{a.jornada_nombre || "-"}</td>
                    <td>{a.turno_nombre || "-"}</td>
                    <td>{a.expected_time || "-"}</td>
                    <td
                      style={{
                        fontWeight: isBad ? "600" : "400",
                        color: isBad ? "#dc3545" : "inherit",
                      }}
                    >
                      {deltaText || "-"}
                    </td>
                  </tr>
                );
              })}

              {itemsOrdenados.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-muted py-4">
                    Sin resultados
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Paginación */}
        <div className="d-flex justify-content-between align-items-center cpm-pager mt-3">
          <small className="text-muted">
            Página {page} de {totalPages} — {total} resultados
          </small>
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => load(page - 1)}
                  disabled={page <= 1}
                >
                  Anterior
                </button>
              </li>
              <li className="page-item active">
                <span className="page-link">{page}</span>
              </li>
              <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => load(page + 1)}
                  disabled={page >= totalPages}
                >
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </Card.Body>
    </Card>
  </Container>
);
}
