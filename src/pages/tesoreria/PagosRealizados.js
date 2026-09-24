import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Alert,
    Badge,
    Button,
    Card,
    Col,
    Container,
    Form,
    Pagination,
    Row,
    Spinner,
    Table,
} from "react-bootstrap";

import {
    BsArrowDown,
    BsArrowUp,
    BsArrowDownUp,
    BsPencil,
    BsSearch,
    BsTrash,
    BsXCircle,
} from "react-icons/bs";

import Contexts from "../../context/Contexts";



export default function PagosRealizados() {

    const DataContext =
        useContext(Contexts.DataContext) || {};

    const {
        empresaSeleccionada,

        bancosTabla = [],
        formasPagoTesoreria = [],
        proveedoresTabla = [],
        proyectosTabla = [],
        categoriasEgreso = [],

    } = DataContext;

    const apiUrl = process.env.REACT_APP_API_URL;

    /*
     * ============================================================
     * DATOS
     * ============================================================
     */

    const [rows, setRows] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    /*
     * ============================================================
     * PAGINACIÓN
     * ============================================================
     */

    const [page, setPage] =
        useState(1);

    const [limit, setLimit] =
        useState(20);

    const [total, setTotal] =
        useState(0);

    const [totalPages, setTotalPages] =
        useState(1);


    /*
     * ============================================================
     * ORDENAMIENTO
     * ============================================================
     */

    const [order, setOrder] =
        useState("fecha");

    const [dir, setDir] =
        useState("DESC");


    /*
     * ============================================================
     * FILTROS
     * ============================================================
     */

    const [tipoPago, setTipoPago] =
        useState("todos");

    const [proveedorId, setProveedorId] =
        useState("");

    const [bancoId, setBancoId] =
        useState("");

    const [cajaId, setCajaId] =
        useState("");

    const [formaPagoId, setFormaPagoId] =
        useState("");

    const [proyectoId, setProyectoId] =
        useState("");

    const [categoriaId, setCategoriaId] =
        useState("");

    const [fechaDesde, setFechaDesde] =
        useState("");

    const [fechaHasta, setFechaHasta] =
        useState("");

    const [montoDesde, setMontoDesde] =
        useState("");

    const [montoHasta, setMontoHasta] =
        useState("");

    const [numeroEcheq, setNumeroEcheq] =
        useState("");

    const [ordenPagoId, setOrdenPagoId] =
        useState("");

    const [
        comprobanteEgresoId,
        setComprobanteEgresoId,
    ] = useState("");

    const [busqueda, setBusqueda] =
        useState("");


    /*
     * ============================================================
     * AUXILIARES
     * ============================================================
     */

    const empresaId =
        empresaSeleccionada?.id ||
        empresaSeleccionada ||
        "";


    const moneda = (valor) => {

        const numero =
            Number(valor || 0);

        return numero.toLocaleString(
            "es-AR",
            {
                style: "currency",
                currency: "ARS",
                minimumFractionDigits: 2,
            }
        );

    };


    const fechaAR = (fecha) => {

        if (!fecha) {
            return "";
        }

        const partes =
            String(fecha)
                .slice(0, 10)
                .split("-");

        if (partes.length !== 3) {
            return fecha;
        }

        return `${partes[2]}/${partes[1]}/${partes[0]}`;

    };


    /*
     * ============================================================
     * MAPAS
     * ============================================================
     */

    const proveedoresMap =
        useMemo(() => {

            const map =
                new Map();

            for (
                const proveedor
                of proveedoresTabla || []
            ) {

                map.set(
                    Number(proveedor.id),
                    proveedor.razonsocial ||
                    proveedor.nombre ||
                    proveedor.descripcion ||
                    `Proveedor #${proveedor.id}`
                );

            }

            return map;

        }, [proveedoresTabla]);


    const bancosMap =
        useMemo(() => {

            const map =
                new Map();

            for (
                const banco
                of bancosTabla || []
            ) {

                map.set(
                    Number(banco.id),
                    banco.descripcion ||
                    banco.nombre ||
                    `Banco #${banco.id}`
                );

            }

            return map;

        }, [bancosTabla]);


    const formasPagoMap =
        useMemo(() => {

            const map =
                new Map();

            for (
                const forma
                of formasPagoTesoreria || []
            ) {

                map.set(
                    Number(forma.id),
                    forma.descripcion ||
                    forma.nombre ||
                    `Forma #${forma.id}`
                );

            }

            return map;

        }, [formasPagoTesoreria]);


    const proyectosMap =
        useMemo(() => {

            const map =
                new Map();

            for (
                const proyecto
                of proyectosTabla || []
            ) {

                map.set(
                    Number(proyecto.id),
                    proyecto.descripcion ||
                    proyecto.nombre ||
                    `Proyecto #${proyecto.id}`
                );

            }

            return map;

        }, [proyectosTabla]);


    const categoriasMap =
        useMemo(() => {

            const map =
                new Map();

            for (
                const categoria
                of categoriasEgreso || []
            ) {

                map.set(
                    Number(categoria.id),
                    categoria.descripcion ||
                    categoria.nombre ||
                    `Categoría #${categoria.id}`
                );

            }

            return map;

        }, [categoriasEgreso]);


    /*
     * ============================================================
     * CARGAR DATOS
     * ============================================================
     */

    const cargarPagos =
        useCallback(async () => {

            try {

                setLoading(true);
                setError("");


                const qs =
                    new URLSearchParams();


                if (empresaId) {
                    qs.set(
                        "empresa_id",
                        String(empresaId)
                    );
                }


                if (
                    tipoPago &&
                    tipoPago !== "todos"
                ) {
                    qs.set(
                        "tipo_pago",
                        tipoPago
                    );
                }


                if (proveedorId) {
                    qs.set(
                        "proveedor_id",
                        proveedorId
                    );
                }


                if (bancoId) {
                    qs.set(
                        "banco_id",
                        bancoId
                    );
                }


                if (cajaId) {
                    qs.set(
                        "caja_id",
                        cajaId
                    );
                }


                if (formaPagoId) {
                    qs.set(
                        "formapago_id",
                        formaPagoId
                    );
                }


                if (proyectoId) {
                    qs.set(
                        "proyecto_id",
                        proyectoId
                    );
                }


                if (categoriaId) {
                    qs.set(
                        "categoriaegreso_id",
                        categoriaId
                    );
                }


                if (fechaDesde) {
                    qs.set(
                        "fecha_desde",
                        fechaDesde
                    );
                }


                if (fechaHasta) {
                    qs.set(
                        "fecha_hasta",
                        fechaHasta
                    );
                }


                if (montoDesde) {
                    qs.set(
                        "monto_desde",
                        montoDesde
                    );
                }


                if (montoHasta) {
                    qs.set(
                        "monto_hasta",
                        montoHasta
                    );
                }


                if (numeroEcheq) {
                    qs.set(
                        "numero_echeq",
                        numeroEcheq
                    );
                }


                if (ordenPagoId) {
                    qs.set(
                        "ordenpago_id",
                        ordenPagoId
                    );
                }


                if (comprobanteEgresoId) {
                    qs.set(
                        "comprobanteegreso_id",
                        comprobanteEgresoId
                    );
                }


                if (busqueda.trim()) {
                    qs.set(
                        "q",
                        busqueda.trim()
                    );
                }


                qs.set(
                    "page",
                    String(page)
                );

                qs.set(
                    "limit",
                    String(limit)
                );

                qs.set(
                    "order",
                    order
                );

                qs.set(
                    "dir",
                    dir
                );


                const response =
                    await fetch(
                        `${apiUrl}/tesoreria/pagos-realizados?${qs.toString()}`,
                        {
                            credentials:
                                "include",
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data?.detalle ||
                        data?.error ||
                        "No se pudieron obtener los pagos realizados."
                    );

                }


                setRows(
                    Array.isArray(data?.rows)
                        ? data.rows
                        : []
                );

                setTotal(
                    Number(data?.total || 0)
                );

                setTotalPages(
                    Math.max(
                        1,
                        Number(
                            data?.totalPages || 1
                        )
                    )
                );


            } catch (err) {

                console.error(
                    "Error cargando pagos realizados:",
                    err
                );

                setRows([]);

                setTotal(0);

                setTotalPages(1);

                setError(
                    err.message ||
                    "Error al cargar los pagos realizados."
                );


            } finally {

                setLoading(false);

            }

        }, [
            apiUrl,
            empresaId,

            tipoPago,
            proveedorId,
            bancoId,
            cajaId,
            formaPagoId,
            proyectoId,
            categoriaId,

            fechaDesde,
            fechaHasta,

            montoDesde,
            montoHasta,

            numeroEcheq,
            ordenPagoId,
            comprobanteEgresoId,

            busqueda,

            page,
            limit,
            order,
            dir,
        ]);


    useEffect(() => {

        cargarPagos();

    }, [cargarPagos]);


    /*
     * ============================================================
     * FILTRAR
     * ============================================================
     */

    const aplicarFiltros = () => {

        if (page !== 1) {
            setPage(1);
            return;
        }

        cargarPagos();

    };


    /*
     * ============================================================
     * LIMPIAR FILTROS
     * ============================================================
     */

    const limpiarFiltros = () => {

        setTipoPago("todos");

        setProveedorId("");

        setBancoId("");

        setCajaId("");

        setFormaPagoId("");

        setProyectoId("");

        setCategoriaId("");

        setFechaDesde("");

        setFechaHasta("");

        setMontoDesde("");

        setMontoHasta("");

        setNumeroEcheq("");

        setOrdenPagoId("");

        setComprobanteEgresoId("");

        setBusqueda("");

        setOrder("fecha");

        setDir("DESC");

        setPage(1);

    };


    /*
     * ============================================================
     * ORDENAR
     * ============================================================
     */

    const ordenarPor = (campo) => {

        if (order === campo) {

            setDir(
                dir === "ASC"
                    ? "DESC"
                    : "ASC"
            );

        } else {

            setOrder(campo);

            setDir("ASC");

        }

        setPage(1);

    };


    const iconoOrden = (campo) => {

        if (order !== campo) {
            return (
                <BsArrowDownUp
                    className="ms-1"
                    size={12}
                />
            );
        }

        return dir === "ASC"
            ? (
                <BsArrowUp
                    className="ms-1"
                />
            )
            : (
                <BsArrowDown
                    className="ms-1"
                />
            );

    };


    /*
     * ============================================================
     * DESCRIPCIONES
     * ============================================================
     */

    const nombreProveedor = (id) => {

        if (!id) {
            return "—";
        }

        return (
            proveedoresMap.get(Number(id)) ||
            `#${id}`
        );

    };


    const nombreBancoCaja = (row) => {

        if (
            row.tipo_pago === "banco" ||
            row.tipo_pago === "echeq"
        ) {

            if (!row.banco_id) {
                return "—";
            }

            return (
                bancosMap.get(
                    Number(row.banco_id)
                ) ||
                `Banco #${row.banco_id}`
            );

        }


        if (row.tipo_pago === "caja") {

            return row.caja_id
                ? `Caja #${row.caja_id}`
                : "—";

        }


        return "—";

    };


    const nombreFormaPago = (row) => {

        if (row.tipo_pago === "echeq") {
            return "eCheq";
        }

        if (!row.formapago_id) {
            return "—";
        }

        return (
            formasPagoMap.get(
                Number(row.formapago_id)
            ) ||
            `#${row.formapago_id}`
        );

    };


    const badgeTipo = (tipo) => {

        switch (tipo) {

            case "caja":

                return (
                    <Badge bg="success">
                        Caja
                    </Badge>
                );


            case "banco":

                return (
                    <Badge bg="primary">
                        Banco
                    </Badge>
                );


            case "echeq":

                return (
                    <Badge bg="warning" text="dark">
                        eCheq
                    </Badge>
                );


            default:

                return (
                    <Badge bg="secondary">
                        {tipo || "—"}
                    </Badge>
                );

        }

    };


    /*
     * ============================================================
     * ACCIONES
     *
     * En el siguiente paso conectaremos los modales/endpoints
     * existentes.
     * ============================================================
     */

    const editarPago = (row) => {

        console.log(
            "Editar pago:",
            row
        );

    };


    const eliminarPago = (row) => {

        console.log(
            "Eliminar pago:",
            row
        );

    };


    /*
     * ============================================================
     * PAGINACIÓN VISUAL
     * ============================================================
     */

    const paginasVisibles =
        useMemo(() => {

            const paginas = [];

            const desde =
                Math.max(
                    1,
                    page - 2
                );

            const hasta =
                Math.min(
                    totalPages,
                    page + 2
                );

            for (
                let i = desde;
                i <= hasta;
                i += 1
            ) {
                paginas.push(i);
            }

            return paginas;

        }, [
            page,
            totalPages,
        ]);


    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (

        <Container
            fluid
            className="py-3"
        >

            <div
                className="d-flex justify-content-between align-items-center mb-3"
            >

                <div>

                    <h4 className="mb-0">
                        Pagos realizados
                    </h4>

                    <small className="text-muted">
                        Consulta unificada de pagos de Caja, Banco y eCheq
                    </small>

                </div>


                <div
                    className="text-end"
                >

                    <div
                        className="text-muted small"
                    >
                        Total
                    </div>

                    <div
                        className="fs-5 fw-bold"
                    >
                        {total.toLocaleString("es-AR")}
                    </div>

                </div>

            </div>


            {/* ======================================================
          FILTROS
          ====================================================== */}

            <Card className="mb-3 shadow-sm">

                <Card.Body>

                    <Row className="g-2">


                        <Col
                            xs={12}
                            md={2}
                        >

                            <Form.Label>
                                Tipo
                            </Form.Label>

                            <Form.Select
                                value={tipoPago}
                                onChange={(e) => {
                                    setTipoPago(
                                        e.target.value
                                    );
                                    setPage(1);
                                }}
                            >

                                <option value="todos">
                                    Todos
                                </option>

                                <option value="caja">
                                    Caja
                                </option>

                                <option value="banco">
                                    Banco
                                </option>

                                <option value="echeq">
                                    eCheq
                                </option>

                            </Form.Select>

                        </Col>


                        <Col
                            xs={12}
                            md={4}
                        >

                            <Form.Label>
                                Proveedor
                            </Form.Label>

                            <Form.Select
                                value={proveedorId}
                                onChange={(e) => {
                                    setProveedorId(
                                        e.target.value
                                    );
                                    setPage(1);
                                }}
                            >

                                <option value="">
                                    Todos
                                </option>

                                {(proveedoresTabla || [])
                                    .slice()
                                    .sort((a, b) =>
                                        String(
                                            a.razonsocial ||
                                            a.nombre ||
                                            ""
                                        ).localeCompare(
                                            String(
                                                b.razonsocial ||
                                                b.nombre ||
                                                ""
                                            ),
                                            "es"
                                        )
                                    )
                                    .map((proveedor) => (

                                        <option
                                            key={proveedor.id}
                                            value={proveedor.id}
                                        >
                                            {
                                                proveedor.razonsocial ||
                                                proveedor.nombre ||
                                                `Proveedor #${proveedor.id}`
                                            }
                                        </option>

                                    ))}

                            </Form.Select>

                        </Col>


                        <Col
                            xs={12}
                            md={3}
                        >

                            <Form.Label>
                                Desde
                            </Form.Label>

                            <Form.Control
                                type="date"
                                value={fechaDesde}
                                onChange={(e) => {
                                    setFechaDesde(
                                        e.target.value
                                    );
                                    setPage(1);
                                }}
                            />

                        </Col>


                        <Col
                            xs={12}
                            md={3}
                        >

                            <Form.Label>
                                Hasta
                            </Form.Label>

                            <Form.Control
                                type="date"
                                value={fechaHasta}
                                onChange={(e) => {
                                    setFechaHasta(
                                        e.target.value
                                    );
                                    setPage(1);
                                }}
                            />

                        </Col>


                        <Col
                            xs={12}
                            md={3}
                        >

                            <Form.Label>
                                Banco
                            </Form.Label>

                            <Form.Select
                                value={bancoId}
                                onChange={(e) => {
                                    setBancoId(
                                        e.target.value
                                    );
                                    setPage(1);
                                }}
                            >

                                <option value="">
                                    Todos
                                </option>

                                {(bancosTabla || [])
                                    .map((banco) => (

                                        <option
                                            key={banco.id}
                                            value={banco.id}
                                        >
                                            {
                                                banco.descripcion ||
                                                banco.nombre ||
                                                `Banco #${banco.id}`
                                            }
                                        </option>

                                    ))}

                            </Form.Select>

                        </Col>


                        <Col
                            xs={12}
                            md={3}
                        >

                            <Form.Label>
                                Forma de pago
                            </Form.Label>

                            <Form.Select
                                value={formaPagoId}
                                onChange={(e) => {
                                    setFormaPagoId(
                                        e.target.value
                                    );
                                    setPage(1);
                                }}
                            >

                                <option value="">
                                    Todas
                                </option>

                                {(formasPagoTesoreria || [])
                                    .map((forma) => (

                                        <option
                                            key={forma.id}
                                            value={forma.id}
                                        >
                                            {
                                                forma.descripcion ||
                                                forma.nombre ||
                                                `#${forma.id}`
                                            }
                                        </option>

                                    ))}

                            </Form.Select>

                        </Col>


                        <Col
                            xs={12}
                            md={3}
                        >

                            <Form.Label>
                                Proyecto
                            </Form.Label>

                            <Form.Select
                                value={proyectoId}
                                onChange={(e) => {
                                    setProyectoId(
                                        e.target.value
                                    );
                                    setPage(1);
                                }}
                            >

                                <option value="">
                                    Todos
                                </option>

                                {(proyectosTabla || [])
                                    .map((proyecto) => (

                                        <option
                                            key={proyecto.id}
                                            value={proyecto.id}
                                        >
                                            {
                                                proyecto.descripcion ||
                                                proyecto.nombre ||
                                                `#${proyecto.id}`
                                            }
                                        </option>

                                    ))}

                            </Form.Select>

                        </Col>


                        <Col
                            xs={12}
                            md={3}
                        >

                            <Form.Label>
                                Categoría
                            </Form.Label>

                            <Form.Select
                                value={categoriaId}
                                onChange={(e) => {
                                    setCategoriaId(
                                        e.target.value
                                    );
                                    setPage(1);
                                }}
                            >

                                <option value="">
                                    Todas
                                </option>

                                {(categoriasEgreso || [])
                                    .map((categoria) => (

                                        <option
                                            key={categoria.id}
                                            value={categoria.id}
                                        >
                                            {
                                                categoria.descripcion ||
                                                categoria.nombre ||
                                                `#${categoria.id}`
                                            }
                                        </option>

                                    ))}

                            </Form.Select>

                        </Col>


                        <Col
                            xs={12}
                            md={3}
                        >

                            <Form.Label>
                                Monto desde
                            </Form.Label>

                            <Form.Control
                                type="number"
                                min="0"
                                step="0.01"
                                value={montoDesde}
                                onChange={(e) => {
                                    setMontoDesde(
                                        e.target.value
                                    );
                                    setPage(1);
                                }}
                            />

                        </Col>


                        <Col
                            xs={12}
                            md={3}
                        >

                            <Form.Label>
                                Monto hasta
                            </Form.Label>

                            <Form.Control
                                type="number"
                                min="0"
                                step="0.01"
                                value={montoHasta}
                                onChange={(e) => {
                                    setMontoHasta(
                                        e.target.value
                                    );
                                    setPage(1);
                                }}
                            />

                        </Col>


                        <Col
                            xs={12}
                            md={3}
                        >

                            <Form.Label>
                                Nº eCheq
                            </Form.Label>

                            <Form.Control
                                value={numeroEcheq}
                                onChange={(e) => {
                                    setNumeroEcheq(
                                        e.target.value
                                    );
                                    setPage(1);
                                }}
                                placeholder="Número de eCheq"
                            />

                        </Col>


                        <Col
                            xs={12}
                            md={3}
                        >

                            <Form.Label>
                                Orden de pago
                            </Form.Label>

                            <Form.Control
                                type="number"
                                min="1"
                                value={ordenPagoId}
                                onChange={(e) => {
                                    setOrdenPagoId(
                                        e.target.value
                                    );
                                    setPage(1);
                                }}
                                placeholder="ID OP"
                            />

                        </Col>


                        <Col
                            xs={12}
                            md={3}
                        >

                            <Form.Label>
                                Comprobante
                            </Form.Label>

                            <Form.Control
                                type="number"
                                min="1"
                                value={comprobanteEgresoId}
                                onChange={(e) => {
                                    setComprobanteEgresoId(
                                        e.target.value
                                    );
                                    setPage(1);
                                }}
                                placeholder="ID comprobante"
                            />

                        </Col>


                        <Col
                            xs={12}
                            md={6}
                        >

                            <Form.Label>
                                Buscar
                            </Form.Label>

                            <Form.Control
                                value={busqueda}
                                onChange={(e) => {
                                    setBusqueda(
                                        e.target.value
                                    );
                                    setPage(1);
                                }}
                                onKeyDown={(e) => {

                                    if (
                                        e.key === "Enter"
                                    ) {

                                        e.preventDefault();

                                        aplicarFiltros();

                                    }

                                }}
                                placeholder="Descripción o número de eCheq"
                            />

                        </Col>


                        <Col
                            xs={12}
                            md={6}
                            className="d-flex align-items-end gap-2"
                        >

                            <Button
                                variant="primary"
                                onClick={aplicarFiltros}
                                disabled={loading}
                            >

                                <BsSearch className="me-1" />

                                Buscar

                            </Button>


                            <Button
                                variant="outline-secondary"
                                onClick={limpiarFiltros}
                                disabled={loading}
                            >

                                <BsXCircle className="me-1" />

                                Limpiar

                            </Button>

                        </Col>

                    </Row>

                </Card.Body>

            </Card>


            {error && (

                <Alert variant="danger">
                    {error}
                </Alert>

            )}


            {/* ======================================================
          TABLA
          ====================================================== */}

            <Card className="shadow-sm">

                <Card.Body className="p-0">

                    <div className="table-responsive">

                        <Table
                            hover
                            striped
                            bordered
                            className="mb-0 align-middle"
                        >

                            <thead className="table-light">

                                <tr>

                                    <th
                                        role="button"
                                        onClick={() =>
                                            ordenarPor("fecha")
                                        }
                                    >
                                        Fecha
                                        {iconoOrden("fecha")}
                                    </th>


                                    <th
                                        role="button"
                                        onClick={() =>
                                            ordenarPor("tipo_pago")
                                        }
                                    >
                                        Medio
                                        {iconoOrden("tipo_pago")}
                                    </th>


                                    <th>
                                        Proveedor
                                    </th>


                                    <th
                                        role="button"
                                        onClick={() =>
                                            ordenarPor("descripcion")
                                        }
                                    >
                                        Descripción
                                        {iconoOrden("descripcion")}
                                    </th>


                                    <th>
                                        Banco / Caja
                                    </th>


                                    <th>
                                        Forma pago
                                    </th>


                                    <th>
                                        Nº eCheq
                                    </th>


                                    <th>
                                        Vencimiento
                                    </th>


                                    <th
                                        className="text-end"
                                        role="button"
                                        onClick={() =>
                                            ordenarPor("monto")
                                        }
                                    >
                                        Monto
                                        {iconoOrden("monto")}
                                    </th>


                                    <th className="text-center">
                                        Acciones
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {loading ? (

                                    <tr>

                                        <td
                                            colSpan={10}
                                            className="text-center py-5"
                                        >

                                            <Spinner
                                                animation="border"
                                                size="sm"
                                                className="me-2"
                                            />

                                            Cargando pagos...

                                        </td>

                                    </tr>

                                ) : rows.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan={10}
                                            className="text-center text-muted py-5"
                                        >
                                            No se encontraron pagos.
                                        </td>

                                    </tr>

                                ) : (

                                    rows.map((row) => (

                                        <tr
                                            key={`${row.tipo_pago}-${row.id}`}
                                        >

                                            <td
                                                style={{
                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                            >
                                                {fechaAR(row.fecha)}
                                            </td>


                                            <td>
                                                {badgeTipo(
                                                    row.tipo_pago
                                                )}
                                            </td>


                                            <td>
                                                {nombreProveedor(
                                                    row.proveedor_id
                                                )}
                                            </td>


                                            <td
                                                style={{
                                                    minWidth:
                                                        "220px",
                                                }}
                                            >
                                                {row.descripcion || "—"}
                                            </td>


                                            <td>
                                                {nombreBancoCaja(row)}
                                            </td>


                                            <td>
                                                {nombreFormaPago(row)}
                                            </td>


                                            <td>
                                                {
                                                    row.numero_echeq ||
                                                    "—"
                                                }
                                            </td>


                                            <td>
                                                {
                                                    fechaAR(
                                                        row.fecha_vencimiento
                                                    ) ||
                                                    "—"
                                                }
                                            </td>


                                            <td
                                                className="text-end fw-semibold"
                                                style={{
                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                            >
                                                {moneda(row.monto)}
                                            </td>


                                            <td
                                                className="text-center"
                                                style={{
                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                            >

                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    className="me-1"
                                                    title="Editar"
                                                    onClick={() =>
                                                        editarPago(row)
                                                    }
                                                >
                                                    <BsPencil />
                                                </Button>


                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    title="Eliminar"
                                                    onClick={() =>
                                                        eliminarPago(row)
                                                    }
                                                >
                                                    <BsTrash />
                                                </Button>

                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </Table>

                    </div>

                </Card.Body>

            </Card>


            {/* ======================================================
          PIE / PAGINACIÓN
          ====================================================== */}

            <div
                className="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2"
            >

                <div
                    className="d-flex align-items-center gap-2"
                >

                    <span className="text-muted">
                        Registros:
                        {" "}
                        <strong>
                            {total.toLocaleString("es-AR")}
                        </strong>
                    </span>


                    <Form.Select
                        size="sm"
                        style={{
                            width: "90px",
                        }}
                        value={limit}
                        onChange={(e) => {

                            setLimit(
                                Number(
                                    e.target.value
                                )
                            );

                            setPage(1);

                        }}
                    >

                        <option value={10}>
                            10
                        </option>

                        <option value={20}>
                            20
                        </option>

                        <option value={50}>
                            50
                        </option>

                        <option value={100}>
                            100
                        </option>

                    </Form.Select>

                </div>


                <Pagination
                    className="mb-0"
                >

                    <Pagination.First
                        disabled={
                            page <= 1 ||
                            loading
                        }
                        onClick={() =>
                            setPage(1)
                        }
                    />


                    <Pagination.Prev
                        disabled={
                            page <= 1 ||
                            loading
                        }
                        onClick={() =>
                            setPage(
                                Math.max(
                                    1,
                                    page - 1
                                )
                            )
                        }
                    />


                    {paginasVisibles.map(
                        (numero) => (

                            <Pagination.Item
                                key={numero}
                                active={
                                    numero === page
                                }
                                disabled={loading}
                                onClick={() =>
                                    setPage(numero)
                                }
                            >
                                {numero}
                            </Pagination.Item>

                        )
                    )}


                    <Pagination.Next
                        disabled={
                            page >= totalPages ||
                            loading
                        }
                        onClick={() =>
                            setPage(
                                Math.min(
                                    totalPages,
                                    page + 1
                                )
                            )
                        }
                    />


                    <Pagination.Last
                        disabled={
                            page >= totalPages ||
                            loading
                        }
                        onClick={() =>
                            setPage(totalPages)
                        }
                    />

                </Pagination>

            </div>


            <div
                className="text-end text-muted small mt-2"
            >
                Página {page} de {totalPages}
            </div>

        </Container>

    );

}