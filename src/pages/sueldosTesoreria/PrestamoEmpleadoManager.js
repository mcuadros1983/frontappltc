import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Container,
    Row,
    Col,
    Table,
    Button,
    Form,
    Spinner,
    Alert,
    Modal,
} from "react-bootstrap";

import Contexts from "../../context/Contexts";
import PrestamoEmpleadoModal from "./PrestamoEmpleadoModal";
const apiUrl = process.env.REACT_APP_API_URL;

export default function PrestamoEmpleadoManager() {
    const dataContext = useContext(Contexts.DataContext);

    const empleadosCtx = dataContext?.empleados || [];

    // =====================================================
    // DATOS
    // =====================================================

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    // =====================================================
    // FILTROS
    // =====================================================

    const [empleadoId, setEmpleadoId] = useState("");
    const [estado, setEstado] = useState("");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [buscar, setBuscar] = useState("");

    // =====================================================
    // ORDENAMIENTO
    // =====================================================

    const [sort, setSort] = useState({
        campo: "fecha_otorgamiento",
        dir: "desc",
    });

    // =====================================================
    // MODAL NUEVO / EDITAR
    //
    // Lo conectaremos en el siguiente paso.
    // =====================================================

    const [showModal, setShowModal] = useState(false);
    const [prestamoEditar, setPrestamoEditar] = useState(null);

    // =====================================================
    // DETALLE
    // =====================================================

    const [showDetalle, setShowDetalle] = useState(false);
    const [detalle, setDetalle] = useState(null);
    const [detalleLoading, setDetalleLoading] = useState(false);
    const [detalleErr, setDetalleErr] = useState(null);

    // =====================================================
    // FORMATOS
    // =====================================================

    const formatMonto = (valor) =>
        new Intl.NumberFormat("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(Number(valor) || 0);

    const formatFecha = (fecha) => {
        if (!fecha) return "—";

        const partes = String(fecha).split("-");

        if (partes.length !== 3) {
            return fecha;
        }

        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    };

    // =====================================================
    // EMPLEADO
    // =====================================================

    const nombreEmpleado = useCallback(
        (id) => {
            const item = empleadosCtx.find(
                (e) =>
                    String(e?.empleado?.id) === String(id)
            );

            if (!item) {
                return `Empleado #${id}`;
            }

            const apellido =
                item?.clientePersona?.apellido ||
                item?.empleado?.apellido ||
                "";

            const nombre =
                item?.clientePersona?.nombre ||
                item?.empleado?.nombre ||
                "";

            return `${apellido} ${nombre}`.trim() ||
                `Empleado #${id}`;
        },
        [empleadosCtx]
    );

    // =====================================================
    // CARGAR PRÉSTAMOS
    // =====================================================

    const fetchPrestamos = useCallback(async () => {
        setLoading(true);
        setErr(null);

        try {
            const r = await fetch(
                `${apiUrl}/prestamosempleado`,
                {
                    credentials: "include",
                }
            );

            const data = await r.json().catch(() => null);

            if (!r.ok) {
                throw new Error(
                    data?.error ||
                    "No se pudieron obtener los préstamos."
                );
            }

            setRows(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (e) {
            console.error(e);

            setErr(
                e.message ||
                "Error cargando préstamos."
            );

        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPrestamos();
    }, [fetchPrestamos]);

    // =====================================================
    // LIMPIAR FILTROS
    // =====================================================

    const limpiarFiltros = () => {
        setEmpleadoId("");
        setEstado("");
        setFechaDesde("");
        setFechaHasta("");
        setBuscar("");
    };

    // =====================================================
    // ORDENAMIENTO
    // =====================================================

    const cambiarOrden = (campo) => {
        setSort((prev) => {
            if (prev.campo === campo) {
                return {
                    campo,
                    dir:
                        prev.dir === "asc"
                            ? "desc"
                            : "asc",
                };
            }

            return {
                campo,
                dir: "asc",
            };
        });
    };

    const indicadorOrden = (campo) => {
        if (sort.campo !== campo) {
            return "";
        }

        return sort.dir === "asc"
            ? " ▲"
            : " ▼";
    };

    // =====================================================
    // FILTRAR + ORDENAR
    // =====================================================

    const rowsFiltradas = useMemo(() => {
        let resultado = [...(rows || [])];

        // -------------------------------
        // Empleado
        // -------------------------------

        if (empleadoId) {
            resultado = resultado.filter(
                (p) =>
                    String(p.empleado_id) ===
                    String(empleadoId)
            );
        }

        // -------------------------------
        // Estado
        // -------------------------------

        if (estado) {
            resultado = resultado.filter(
                (p) =>
                    String(p.estado) ===
                    String(estado)
            );
        }

        // -------------------------------
        // Fecha desde
        // -------------------------------

        if (fechaDesde) {
            resultado = resultado.filter(
                (p) =>
                    p.fecha_otorgamiento &&
                    String(p.fecha_otorgamiento) >=
                    String(fechaDesde)
            );
        }

        // -------------------------------
        // Fecha hasta
        // -------------------------------

        if (fechaHasta) {
            resultado = resultado.filter(
                (p) =>
                    p.fecha_otorgamiento &&
                    String(p.fecha_otorgamiento) <=
                    String(fechaHasta)
            );
        }

        // -------------------------------
        // Búsqueda
        // -------------------------------

        const term = buscar
            .trim()
            .toLowerCase();

        if (term) {
            resultado = resultado.filter((p) => {
                const numero =
                    String(p.numero || "")
                        .toLowerCase();

                const empleado =
                    nombreEmpleado(p.empleado_id)
                        .toLowerCase();

                const id =
                    String(p.id || "");

                return (
                    numero.includes(term) ||
                    empleado.includes(term) ||
                    id.includes(term)
                );
            });
        }

        // -------------------------------
        // Ordenamiento
        // -------------------------------

        resultado.sort((a, b) => {
            let va;
            let vb;

            switch (sort.campo) {

                case "numero":
                    va = String(a.numero || "");
                    vb = String(b.numero || "");
                    break;

                case "empleado":
                    va = nombreEmpleado(
                        a.empleado_id
                    ).toLowerCase();

                    vb = nombreEmpleado(
                        b.empleado_id
                    ).toLowerCase();
                    break;

                case "monto_original":
                    va = Number(
                        a.monto_original || 0
                    );

                    vb = Number(
                        b.monto_original || 0
                    );
                    break;

                case "saldo":
                    va = Number(a.saldo || 0);
                    vb = Number(b.saldo || 0);
                    break;

                case "fecha_primer_descuento":
                    va =
                        a.fecha_primer_descuento ||
                        "";

                    vb =
                        b.fecha_primer_descuento ||
                        "";
                    break;

                case "estado":
                    va = String(
                        a.estado || ""
                    ).toLowerCase();

                    vb = String(
                        b.estado || ""
                    ).toLowerCase();
                    break;

                case "fecha_otorgamiento":
                default:
                    va =
                        a.fecha_otorgamiento ||
                        "";

                    vb =
                        b.fecha_otorgamiento ||
                        "";
                    break;
            }

            let comparacion = 0;

            if (typeof va === "number") {
                comparacion = va - vb;
            } else {
                comparacion = String(va).localeCompare(
                    String(vb),
                    "es",
                    {
                        numeric: true,
                        sensitivity: "base",
                    }
                );
            }

            return sort.dir === "asc"
                ? comparacion
                : -comparacion;
        });

        return resultado;

    }, [
        rows,
        empleadoId,
        estado,
        fechaDesde,
        fechaHasta,
        buscar,
        sort,
        nombreEmpleado,
    ]);

    // =====================================================
    // NUEVO PRÉSTAMO
    // =====================================================

    const abrirNuevo = () => {
        setPrestamoEditar(null);
        setShowModal(true);
    };

    // =====================================================
    // DETALLE
    // =====================================================

    const abrirDetalle = async (prestamoId) => {
        setDetalle(null);
        setDetalleErr(null);
        setShowDetalle(true);
        setDetalleLoading(true);

        try {
            const r = await fetch(
                `${apiUrl}/prestamosempleado/${prestamoId}`,
                {
                    credentials: "include",
                }
            );

            const data = await r.json().catch(() => null);

            if (!r.ok) {
                throw new Error(
                    data?.error ||
                    "No se pudo obtener el detalle del préstamo."
                );
            }

            setDetalle(data);

        } catch (e) {
            console.error(e);

            setDetalleErr(
                e.message ||
                "Error cargando detalle del préstamo."
            );

        } finally {
            setDetalleLoading(false);
        }
    };

    const cerrarDetalle = () => {
        setShowDetalle(false);
        setDetalle(null);
        setDetalleErr(null);
    };

    // =====================================================
    // EDITAR
    // =====================================================

    const editarDetalle = () => {
        if (!detalle) return;

        setPrestamoEditar(detalle);
        setShowDetalle(false);
        setShowModal(true);
    };

    // =====================================================
    // ANULAR
    // =====================================================

    const anularPrestamo = async () => {
        if (!detalle?.id) return;

        const cuotas =
            Array.isArray(detalle.Cuotas)
                ? detalle.Cuotas
                : [];

        if (cuotas.length > 0) {
            alert(
                "El préstamo tiene pagos aplicados y no puede anularse."
            );

            return;
        }

        const ok = window.confirm(
            "¿Anular este préstamo?"
        );

        if (!ok) return;

        try {
            const r = await fetch(
                `${apiUrl}/prestamosempleado/${detalle.id}/anular`,
                {
                    method: "PUT",
                    credentials: "include",
                }
            );

            const data = await r.json().catch(() => null);

            if (!r.ok) {
                throw new Error(
                    data?.error ||
                    "No se pudo anular el préstamo."
                );
            }

            cerrarDetalle();

            await fetchPrestamos();

        } catch (e) {
            console.error(e);

            alert(
                e.message ||
                "Error anulando préstamo."
            );
        }
    };

    // =====================================================
    // CUOTAS / PAGOS
    // =====================================================

    const cuotasDetalle = useMemo(() => {
        if (!Array.isArray(detalle?.Cuotas)) {
            return [];
        }

        return [...detalle.Cuotas].sort(
            (a, b) => {
                const fechaA =
                    a.fecha ||
                    a.periodo ||
                    "";

                const fechaB =
                    b.fecha ||
                    b.periodo ||
                    "";

                return String(fechaA).localeCompare(
                    String(fechaB)
                );
            }
        );
    }, [detalle]);

    const totalAplicado = useMemo(() => {
        return cuotasDetalle.reduce(
            (total, cuota) => {
                const monto =
                    Number(cuota.monto || 0);

                if (monto >= 0) {
                    return total;
                }

                return total +
                    Math.abs(monto);
            },
            0
        );
    }, [cuotasDetalle]);

    const tienePagos =
        cuotasDetalle.length > 0;

    // =====================================================
    // CIERRE DEL MODAL CREAR / EDITAR
    // =====================================================

    const cerrarModal = async (changed) => {
        setShowModal(false);
        setPrestamoEditar(null);

        if (changed) {
            await fetchPrestamos();
        }
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <Container className="py-3">

            {/* ================================================
          ENCABEZADO
      ================================================= */}

            <Row className="align-items-center mb-2">

                <Col>
                    <h4 className="mb-0">
                        Préstamos a Empleados
                    </h4>
                </Col>

                <Col md="auto">
                    <Button onClick={abrirNuevo}>
                        Nuevo Préstamo
                    </Button>
                </Col>

            </Row>

            {/* ================================================
          FILTROS
      ================================================= */}

            <Row className="align-items-end g-3 mb-3">

                <Col md={3}>
                    <Form.Group>

                        <Form.Label>
                            Empleado
                        </Form.Label>

                        <Form.Select
                            value={empleadoId}
                            onChange={(e) =>
                                setEmpleadoId(
                                    e.target.value
                                )
                            }
                            className="form-control my-input"
                        >

                            <option value="">
                                — Todos —
                            </option>

                            {empleadosCtx.map((item) => {
                                const id =
                                    item?.empleado?.id;

                                const apellido =
                                    item?.clientePersona?.apellido ||
                                    item?.empleado?.apellido ||
                                    "";

                                const nombre =
                                    item?.clientePersona?.nombre ||
                                    item?.empleado?.nombre ||
                                    "";

                                return (
                                    <option
                                        key={id}
                                        value={id}
                                    >
                                        {apellido} {nombre}
                                    </option>
                                );
                            })}

                        </Form.Select>

                    </Form.Group>
                </Col>

                <Col md={2}>
                    <Form.Group>

                        <Form.Label>
                            Estado
                        </Form.Label>

                        <Form.Select
                            value={estado}
                            onChange={(e) =>
                                setEstado(
                                    e.target.value
                                )
                            }
                            className="form-control my-input"
                        >

                            <option value="">
                                — Todos —
                            </option>

                            <option value="pendiente">
                                Pendiente
                            </option>

                            <option value="activo">
                                Activo
                            </option>

                            <option value="cancelado">
                                Cancelado
                            </option>

                            <option value="anulado">
                                Anulado
                            </option>

                        </Form.Select>

                    </Form.Group>
                </Col>

                <Col md={2}>
                    <Form.Group>

                        <Form.Label>
                            Desde
                        </Form.Label>

                        <Form.Control
                            type="date"
                            value={fechaDesde}
                            onChange={(e) =>
                                setFechaDesde(
                                    e.target.value
                                )
                            }
                        />

                    </Form.Group>
                </Col>

                <Col md={2}>
                    <Form.Group>

                        <Form.Label>
                            Hasta
                        </Form.Label>

                        <Form.Control
                            type="date"
                            value={fechaHasta}
                            onChange={(e) =>
                                setFechaHasta(
                                    e.target.value
                                )
                            }
                        />

                    </Form.Group>
                </Col>

                <Col md={3}>
                    <Form.Group>

                        <Form.Label>
                            Buscar
                        </Form.Label>

                        <Form.Control
                            type="text"
                            value={buscar}
                            onChange={(e) =>
                                setBuscar(
                                    e.target.value
                                )
                            }
                            placeholder="Nº o empleado..."
                        />

                    </Form.Group>
                </Col>

            </Row>

            <Row className="mb-3">

                <Col className="d-flex gap-2">

                    <Button
                        onClick={fetchPrestamos}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Spinner
                                    size="sm"
                                    className="me-2"
                                />
                                Buscando…
                            </>
                        ) : (
                            "Buscar"
                        )}
                    </Button>

                    <Button
                        variant="outline-secondary"
                        onClick={limpiarFiltros}
                    >
                        Limpiar
                    </Button>

                </Col>

            </Row>

            {/* ================================================
          ERRORES
      ================================================= */}

            {err && (
                <Alert
                    variant="danger"
                    className="py-2"
                >
                    {err}
                </Alert>
            )}

            {/* ================================================
          TABLA
      ================================================= */}

            <div className="table-responsive">

                <Table
                    bordered
                    hover
                    striped
                    size="sm"
                >

                    <thead>
                        <tr>

                            <th
                                style={{
                                    width: 100,
                                    cursor: "pointer",
                                }}
                                onClick={() =>
                                    cambiarOrden("numero")
                                }
                            >
                                Nº
                                {indicadorOrden("numero")}
                            </th>

                            <th
                                style={{
                                    width: 130,
                                    cursor: "pointer",
                                }}
                                onClick={() =>
                                    cambiarOrden(
                                        "fecha_otorgamiento"
                                    )
                                }
                            >
                                Fecha
                                {indicadorOrden(
                                    "fecha_otorgamiento"
                                )}
                            </th>

                            <th
                                style={{
                                    cursor: "pointer",
                                }}
                                onClick={() =>
                                    cambiarOrden("empleado")
                                }
                            >
                                Empleado
                                {indicadorOrden("empleado")}
                            </th>

                            <th
                                className="text-end"
                                style={{
                                    width: 150,
                                    cursor: "pointer",
                                }}
                                onClick={() =>
                                    cambiarOrden(
                                        "monto_original"
                                    )
                                }
                            >
                                Monto original
                                {indicadorOrden(
                                    "monto_original"
                                )}
                            </th>

                            <th
                                className="text-end"
                                style={{
                                    width: 150,
                                    cursor: "pointer",
                                }}
                                onClick={() =>
                                    cambiarOrden("saldo")
                                }
                            >
                                Saldo
                                {indicadorOrden("saldo")}
                            </th>

                            <th
                                style={{
                                    width: 150,
                                    cursor: "pointer",
                                }}
                                onClick={() =>
                                    cambiarOrden(
                                        "fecha_primer_descuento"
                                    )
                                }
                            >
                                1º descuento
                                {indicadorOrden(
                                    "fecha_primer_descuento"
                                )}
                            </th>

                            <th
                                style={{
                                    width: 120,
                                    cursor: "pointer",
                                }}
                                onClick={() =>
                                    cambiarOrden("estado")
                                }
                            >
                                Estado
                                {indicadorOrden("estado")}
                            </th>

                        </tr>
                    </thead>

                    <tbody>

                        {loading ? (

                            <tr>
                                <td
                                    colSpan={7}
                                    className="text-center"
                                >
                                    <Spinner
                                        size="sm"
                                        className="me-2"
                                    />
                                    Cargando…
                                </td>
                            </tr>

                        ) : rowsFiltradas.length ? (

                            rowsFiltradas.map((p) => (

                                <tr
                                    key={p.id}
                                    onDoubleClick={() =>
                                        abrirDetalle(p.id)
                                    }
                                    style={{
                                        cursor: "pointer",
                                    }}
                                    title="Doble clic para ver detalle y pagos"
                                >

                                    <td>
                                        {p.numero || p.id}
                                    </td>

                                    <td>
                                        {formatFecha(
                                            p.fecha_otorgamiento
                                        )}
                                    </td>

                                    <td>
                                        {nombreEmpleado(
                                            p.empleado_id
                                        )}
                                    </td>

                                    <td className="text-end">
                                        $
                                        {formatMonto(
                                            p.monto_original
                                        )}
                                    </td>

                                    <td className="text-end fw-semibold">
                                        $
                                        {formatMonto(
                                            p.saldo
                                        )}
                                    </td>

                                    <td>
                                        {formatFecha(
                                            p.fecha_primer_descuento
                                        )}
                                    </td>

                                    <td className="text-uppercase">
                                        {p.estado}
                                    </td>

                                </tr>
                            ))

                        ) : (

                            <tr>
                                <td
                                    colSpan={7}
                                    className="text-center"
                                >
                                    Sin resultados
                                </td>
                            </tr>

                        )}

                    </tbody>

                </Table>

            </div>

            <small className="text-muted">
                Doble clic sobre un préstamo para consultar
                el detalle y los pagos aplicados.
            </small>

            {/* ================================================
          DETALLE DEL PRÉSTAMO
      ================================================= */}

            <Modal
                show={showDetalle}
                onHide={cerrarDetalle}
                size="lg"
                centered
            >

                <Modal.Header closeButton>

                    <Modal.Title>
                        Detalle del préstamo
                    </Modal.Title>

                </Modal.Header>

                <Modal.Body>

                    {detalleErr && (
                        <Alert
                            variant="danger"
                            className="py-2"
                        >
                            {detalleErr}
                        </Alert>
                    )}

                    {detalleLoading ? (

                        <div className="py-3 text-center">

                            <Spinner
                                size="sm"
                                className="me-2"
                            />

                            Cargando detalle…

                        </div>

                    ) : !detalle ? (

                        <div className="text-muted">
                            Sin datos.
                        </div>

                    ) : (

                        <>

                            {/* DATOS PRINCIPALES */}

                            <Row className="g-3">

                                <Col md={4}>
                                    <Form.Group>

                                        <Form.Label>
                                            Nº préstamo
                                        </Form.Label>

                                        <div className="form-control bg-light">
                                            {detalle.numero ||
                                                detalle.id}
                                        </div>

                                    </Form.Group>
                                </Col>

                                <Col md={8}>
                                    <Form.Group>

                                        <Form.Label>
                                            Empleado
                                        </Form.Label>

                                        <div className="form-control bg-light">
                                            {nombreEmpleado(
                                                detalle.empleado_id
                                            )}
                                        </div>

                                    </Form.Group>
                                </Col>

                            </Row>

                            <Row className="g-3 mt-1">

                                <Col md={4}>
                                    <Form.Group>

                                        <Form.Label>
                                            Monto original
                                        </Form.Label>

                                        <div className="form-control bg-white">
                                            $
                                            {formatMonto(
                                                detalle.monto_original
                                            )}
                                        </div>

                                    </Form.Group>
                                </Col>

                                <Col md={4}>
                                    <Form.Group>

                                        <Form.Label>
                                            Total aplicado
                                        </Form.Label>

                                        <div className="form-control bg-white">
                                            $
                                            {formatMonto(
                                                totalAplicado
                                            )}
                                        </div>

                                    </Form.Group>
                                </Col>

                                <Col md={4}>
                                    <Form.Group>

                                        <Form.Label>
                                            Saldo
                                        </Form.Label>

                                        <div className="form-control bg-light fw-semibold">
                                            $
                                            {formatMonto(
                                                detalle.saldo
                                            )}
                                        </div>

                                    </Form.Group>
                                </Col>

                            </Row>

                            <Row className="g-3 mt-1">

                                <Col md={4}>
                                    <Form.Group>

                                        <Form.Label>
                                            Fecha otorgamiento
                                        </Form.Label>

                                        <div className="form-control bg-light">
                                            {formatFecha(
                                                detalle.fecha_otorgamiento
                                            )}
                                        </div>

                                    </Form.Group>
                                </Col>

                                <Col md={4}>
                                    <Form.Group>

                                        <Form.Label>
                                            Primer descuento
                                        </Form.Label>

                                        <div className="form-control bg-light">
                                            {formatFecha(
                                                detalle.fecha_primer_descuento
                                            )}
                                        </div>

                                    </Form.Group>
                                </Col>

                                <Col md={4}>
                                    <Form.Group>

                                        <Form.Label>
                                            Estado
                                        </Form.Label>

                                        <div className="form-control bg-light text-uppercase">
                                            {detalle.estado}
                                        </div>

                                    </Form.Group>
                                </Col>

                            </Row>

                            {detalle.observaciones && (
                                <Row className="mt-3">

                                    <Col>
                                        <Form.Group>

                                            <Form.Label>
                                                Observaciones
                                            </Form.Label>

                                            <div className="form-control bg-light">
                                                {detalle.observaciones}
                                            </div>

                                        </Form.Group>
                                    </Col>

                                </Row>
                            )}

                            <hr />

                            {/* PAGOS */}

                            <h6 className="mb-2">
                                Pagos aplicados
                            </h6>

                            <div className="table-responsive">

                                <Table
                                    bordered
                                    hover
                                    striped
                                    size="sm"
                                >

                                    <thead>
                                        <tr>

                                            <th
                                                style={{
                                                    width: 120,
                                                }}
                                            >
                                                Fecha
                                            </th>

                                            <th
                                                style={{
                                                    width: 110,
                                                }}
                                            >
                                                Período
                                            </th>

                                            <th>
                                                Descripción
                                            </th>

                                            <th>
                                                Observaciones
                                            </th>

                                            <th
                                                style={{
                                                    width: 150,
                                                }}
                                                className="text-end"
                                            >
                                                Importe
                                            </th>

                                        </tr>
                                    </thead>

                                    <tbody>

                                        {cuotasDetalle.length ? (

                                            cuotasDetalle.map(
                                                (c) => (

                                                    <tr key={c.id}>

                                                        <td>
                                                            {formatFecha(
                                                                c.fecha
                                                            )}
                                                        </td>

                                                        <td>
                                                            {c.periodo ||
                                                                "—"}
                                                        </td>

                                                        <td>
                                                            {c.descripcion ||
                                                                "—"}
                                                        </td>

                                                        <td>
                                                            {c.observaciones ||
                                                                "—"}
                                                        </td>

                                                        <td className="text-end">
                                                            $
                                                            {formatMonto(
                                                                Math.abs(
                                                                    Number(
                                                                        c.monto ||
                                                                        0
                                                                    )
                                                                )
                                                            )}
                                                        </td>

                                                    </tr>

                                                )
                                            )

                                        ) : (

                                            <tr>

                                                <td
                                                    colSpan={5}
                                                    className="text-center"
                                                >
                                                    Sin pagos aplicados
                                                </td>

                                            </tr>

                                        )}

                                    </tbody>

                                </Table>

                            </div>

                            {tienePagos && (
                                <div className="d-flex justify-content-end">

                                    <div
                                        style={{
                                            minWidth: 260,
                                        }}
                                    >

                                        <div className="d-flex justify-content-between">

                                            <span>
                                                Total aplicado
                                            </span>

                                            <strong>
                                                $
                                                {formatMonto(
                                                    totalAplicado
                                                )}
                                            </strong>

                                        </div>

                                        <div className="d-flex justify-content-between">

                                            <span>
                                                Saldo
                                            </span>

                                            <strong>
                                                $
                                                {formatMonto(
                                                    detalle.saldo
                                                )}
                                            </strong>

                                        </div>

                                    </div>

                                </div>
                            )}

                            {tienePagos && (
                                <Alert
                                    variant="light"
                                    className="mt-3 mb-0"
                                >
                                    Este préstamo posee pagos aplicados y
                                    no puede ser anulado.
                                </Alert>
                            )}

                        </>

                    )}

                </Modal.Body>

                <Modal.Footer>

                    {detalle && (
                        <>
                            <Button
                                variant="primary"
                                onClick={editarDetalle}
                            >
                                Editar préstamo
                            </Button>

                            {!tienePagos &&
                                detalle.estado !== "anulado" && (
                                    <Button
                                        variant="danger"
                                        onClick={
                                            anularPrestamo
                                        }
                                    >
                                        Anular préstamo
                                    </Button>
                                )}
                        </>
                    )}

                    <Button
                        variant="secondary"
                        onClick={cerrarDetalle}
                    >
                        Cerrar
                    </Button>

                </Modal.Footer>

            </Modal>
            {showModal && (
                <PrestamoEmpleadoModal
                    show={showModal}
                    onClose={cerrarModal}
                    empleados={empleadosCtx}
                    prestamo={prestamoEditar}
                />
            )}

        </Container>
    );
}