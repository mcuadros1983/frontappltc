import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { Container, Row, Col, Table, Button, Form, Spinner, Badge } from "react-bootstrap";
import dayjs from "dayjs";
import Contexts from "../../context/Contexts";
import EmpleadoAdicionalFijoAssignModal from "./EmpleadoAdicionalFijoAssignModal";
import EmpleadoAdicionalFijoCerrarModal from "./EmpleadoAdicionalFijoCerrarModal";

const apiUrl = process.env.REACT_APP_API_URL;

export default function EmpleadoAdicionalFijoManager() {
    const dataContext = useContext(Contexts.DataContext);
    const empleados = dataContext?.empleados || [];
    const empresa_id = dataContext?.empresaSeleccionada?.id ?? null; // disponible si lo necesitás luego

    // filtros
    const firstEmpleadoId = empleados.length ? empleados[0]?.empleado?.id ?? "" : "";
    const [filtroEmpleadoId, setFiltroEmpleadoId] = useState(""); // por defecto TODOS
    const [filtroTipoId, setFiltroTipoId] = useState(""); // por defecto TODOS
    const [fechaRef, setFechaRef] = useState(dayjs().format("YYYY-MM-DD"));

    // datos
    const [tipos, setTipos] = useState([]);     // catálogo de tipos para filtro
    const [rows, setRows] = useState([]);       // asignaciones crudas desde API
    const [valores, setValores] = useState({}); // { asignacionId: { monto, fuente, valor_id } }
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    // modals
    const [showAssign, setShowAssign] = useState(false);
    const [showCerrar, setShowCerrar] = useState(false);
    const [selectedAsignacion, setSelectedAsignacion] = useState(null);

    // empleado seleccionado (para mostrar en modal si querés prefijar algo; ahora no es obligatorio)
    const empleadoSeleccionado = useMemo(
        () => empleados.find((e) => String(e?.empleado?.id) === String(filtroEmpleadoId)) || null,
        [empleados, filtroEmpleadoId]
    );

    // cargar catálogo de tipos para filtro
    const fetchTiposCatalogo = useCallback(async () => {
        try {
            const r = await fetch(`${apiUrl}/adicionalfijotipo`, { credentials: "include" });
            const data = await r.json();
            setTipos(data || []);
        } catch (e) {
            console.error(e);
        }
    }, [apiUrl]);

    // traer TODAS las asignaciones al montar (sin filtrar)
    const fetchAsignaciones = useCallback(async () => {
        setLoading(true);
        setErr(null);
        try {
            // 1) Traer TODAS las asignaciones
            const url = `${apiUrl}/empleadoadicionalfijo`; // sin filtros => todo
            const r = await fetch(url, { credentials: "include" });
            const data = await r.json();

            // 2) Ordenar "lo último primero": por createdAt desc si existe; si no, por id desc
            const sorted = [...(data || [])].sort((a, b) => {
                const ca = a.createdAt ? new Date(a.createdAt).getTime() : null;
                const cb = b.createdAt ? new Date(b.createdAt).getTime() : null;
                if (ca && cb) return cb - ca;
                if (ca && !cb) return -1;
                if (!ca && cb) return 1;
                // fallback al id
                return Number(b.id) - Number(a.id);
            });

            setRows(sorted);

            // 3) Calcular monto efectivo para cada asignación a la fechaRef
            const pairs = await Promise.all(
                sorted.map(async (a) => {
                    if (a.monto_override != null) {
                        return [a.id, { monto: Number(a.monto_override), fuente: "OVERRIDE", valor_id: null }];
                    }
                    // 👇 usar la fecha de inicio de la asignación
                    const fechaConsulta = a.vigencia_desde;
                    const r2 = await fetch(
                        `${apiUrl}/adicionalfijovalor/vigente?adicionalfijotipo_id=${a.adicionalfijotipo_id}&fecha=${fechaConsulta}`
                        , { credentials: "include" });
                    const v = await r2.json();
                    if (v && v.monto != null) {
                        return [a.id, { monto: Number(v.monto), fuente: "GLOBAL", valor_id: v.id }];
                    }
                    return [a.id, { monto: null, fuente: "SIN_VALOR", valor_id: null }];
                })
            );

            const map = {};
            pairs.forEach(([id, info]) => (map[id] = info));
            setValores(map);
        } catch (e) {
            console.error(e);
            setErr("No se pudo cargar la información.");
        } finally {
            setLoading(false);
        }
    }, [apiUrl, fechaRef]);

    useEffect(() => {
        fetchTiposCatalogo();
    }, [fetchTiposCatalogo]);

    useEffect(() => {
        fetchAsignaciones();
    }, [fetchAsignaciones]);

    // si cambia fechaRef, recalcular montos manteniendo filas ya cargadas/ordenadas
    useEffect(() => {
        const recalc = async () => {
            if (!rows.length) return;
            try {
                setLoading(true);
                const pairs = await Promise.all(
                    rows.map(async (a) => {
                        if (a.monto_override != null) {
                            return [a.id, { monto: Number(a.monto_override), fuente: "OVERRIDE", valor_id: null }];
                        }
                        // 👇 usar la fecha de inicio de la asignación
                        const fechaConsulta = a.vigencia_desde;
                        const r2 = await fetch(
                            `${apiUrl}/adicionalfijovalor/vigente?adicionalfijotipo_id=${a.adicionalfijotipo_id}&fecha=${fechaConsulta}`,
                            { credentials: "include" }
                        );
                        const v = await r2.json();
                        if (v && v.monto != null) {
                            return [a.id, { monto: Number(v.monto), fuente: "GLOBAL", valor_id: v.id }];
                        }
                        return [a.id, { monto: null, fuente: "SIN_VALOR", valor_id: null }];
                    })
                );
                const map = {};
                pairs.forEach(([id, info]) => (map[id] = info));
                setValores(map);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        recalc();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows]); // <- podés quitar fechaRef aquí para que no recalcule por ese filtro


    // Filtro combinado en UI (empleado / tipo)
    const rowsFiltradas = useMemo(() => {
        return rows.filter((a) => {
            const okEmp = filtroEmpleadoId ? String(a.empleado_id) === String(filtroEmpleadoId) : true;
            const okTipo = filtroTipoId ? String(a.adicionalfijotipo_id) === String(filtroTipoId) : true;
            return okEmp && okTipo;
        });
    }, [rows, filtroEmpleadoId, filtroTipoId]);

    // Abrir / cerrar modales
    const abrirAsignar = () => setShowAssign(true);
    const cerrarAsignar = (changed) => {
        setShowAssign(false);
        if (changed) fetchAsignaciones();
    };

    const abrirCerrar = (asignacion) => {
        setSelectedAsignacion(asignacion);
        setShowCerrar(true);
    };
    const cerrarCerrar = (changed) => {
        setShowCerrar(false);
        setSelectedAsignacion(null);
        if (changed) fetchAsignaciones();
    };

    return (
        <Container className="py-3">
            <Row className="align-items-end g-3 mb-3">
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
                        <Form.Label>Adicional fijo (tipo)</Form.Label>
                        <Form.Select
                            value={filtroTipoId}
                            onChange={(e) => setFiltroTipoId(e.target.value)}
                            className="form-control my-input"
                        >
                            <option value="">-- Todos --</option>
                            {tipos.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.descripcion}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>

                {/* <Col md={3}>
          <Form.Group>
            <Form.Label>Fecha de referencia</Form.Label>
            <Form.Control
              type="date"
              value={fechaRef}
              onChange={(e) => setFechaRef(e.target.value)}
            />
          </Form.Group>
        </Col> */}

                <Col md="auto">
                    <Button onClick={abrirAsignar}>
                        Asignar adicional fijo
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
                            <th>Adicional</th>
                            <th style={{ width: 130 }}>Vigencia desde</th>
                            <th style={{ width: 130 }}>Vigencia hasta</th>
                            <th style={{ width: 150 }}>Monto efectivo</th>
                            <th style={{ width: 150 }}>Fuente</th>
                            <th style={{ width: 160 }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="text-center">
                                    <Spinner size="sm" className="me-2" />
                                    Cargando…
                                </td>
                            </tr>
                        ) : rowsFiltradas.length ? (
                            rowsFiltradas.map((a) => {
                                const info = valores[a.id];
                                const emp = empleados.find((e) => String(e?.empleado?.id) === String(a.empleado_id));
                                const ap = emp?.clientePersona?.apellido || emp?.empleado?.apellido || "";
                                const no = emp?.clientePersona?.nombre || emp?.empleado?.nombre || "";
                                return (
                                    <tr key={a.id}>
                                        <td>{a.id}</td>
                                        <td>{ap} {no}</td>
                                        <td>{a.AdicionalFijoTipo?.descripcion || `Tipo #${a.adicionalfijotipo_id}`}</td>
                                        <td>{a.vigencia_desde}</td>
                                        <td>{a.vigencia_hasta ?? <span className="text-muted">Abierto</span>}</td>
                                        <td>
                                            {info?.monto != null ? (
                                                <Badge bg="secondary">${info.monto.toFixed(2)}</Badge>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        <td>
                                            {info?.fuente === "OVERRIDE" && <Badge bg="warning">Override</Badge>}
                                            {info?.fuente === "GLOBAL" && <Badge bg="info">Global</Badge>}
                                            {info?.fuente === "SIN_VALOR" && <Badge bg="secondary">Sin valor</Badge>}
                                        </td>
                                        <td>
                                            <div className="d-flex flex-wrap gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    onClick={() => abrirCerrar(a)}
                                                    disabled={!!a.vigencia_hasta}
                                                >
                                                    Cerrar
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={8} className="text-center">Sin resultados</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Modal alta: ahora selecciona empleado y tipo adentro */}
            {showAssign && (
                <EmpleadoAdicionalFijoAssignModal
                    show={showAssign}
                    onClose={cerrarAsignar}
                    empleados={empleados}
                    tipos={tipos}
                />
            )}

            {/* Modal cierre */}
            {showCerrar && selectedAsignacion && (
                <EmpleadoAdicionalFijoCerrarModal
                    show={showCerrar}
                    onClose={cerrarCerrar}
                    asignacion={selectedAsignacion}
                />
            )}
        </Container>
    );
}
