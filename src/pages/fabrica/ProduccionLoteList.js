import React, {
    useEffect,
    useState
} from "react";

import {
    Table,
    Button,
    Container,
    Form,
    Row,
    Col,
    Card
} from "react-bootstrap";

import {
    useNavigate
} from "react-router-dom";

import {
    produccionLoteApi
} from "../../services/produccionLoteApi";


export default function ProduccionLoteList() {

    const navigate = useNavigate();

    const [rows, setRows] =
        useState([]);

    const [rowsFiltrados, setRowsFiltrados] =
        useState([]);

    const [filtroLote, setFiltroLote] =
        useState("");

    const [fechaDesde, setFechaDesde] =
        useState("");

    const [fechaHasta, setFechaHasta] =
        useState("");

    const [paginaActual, setPaginaActual] =
        useState(1);

    const registrosPorPagina = 20;


    // ============================================================
    // CARGAR LOTES
    // ============================================================

    const cargar = async () => {

        try {

            const data =
                await produccionLoteApi.list();

            const lista =
                Array.isArray(data)
                    ? data
                    : [];

            setRows(lista);

            setRowsFiltrados(lista);

        } catch (error) {

            console.error(error);

            setRows([]);
            setRowsFiltrados([]);

        }

    };


    // ============================================================
    // FILTROS
    // ============================================================

    const filtrar = () => {

        let resultado =
            [...rows];


        if (filtroLote) {

            resultado =
                resultado.filter(
                    (row) =>
                        String(
                            row.numero_lote || ""
                        )
                            .toLowerCase()
                            .includes(
                                filtroLote
                                    .toLowerCase()
                            )
                );

        }


        if (fechaDesde) {

            resultado =
                resultado.filter(
                    (row) =>
                        row.fecha_produccion >=
                        fechaDesde
                );

        }


        if (fechaHasta) {

            resultado =
                resultado.filter(
                    (row) =>
                        row.fecha_produccion <=
                        fechaHasta
                );

        }


        setRowsFiltrados(
            resultado
        );

        setPaginaActual(1);

    };


    const limpiarFiltros = () => {

        setFiltroLote("");

        setFechaDesde("");

        setFechaHasta("");

        setRowsFiltrados(
            rows
        );

        setPaginaActual(1);

    };


    // ============================================================
    // EFECTOS
    // ============================================================

    useEffect(() => {

        cargar();

    }, []);


    useEffect(() => {

        filtrar();

    }, [
        filtroLote,
        fechaDesde,
        fechaHasta,
        rows
    ]);


    // ============================================================
    // PAGINACIÓN
    // ============================================================

    const indiceUltimo =
        paginaActual *
        registrosPorPagina;

    const indicePrimero =
        indiceUltimo -
        registrosPorPagina;


    const registrosPagina =
        rowsFiltrados.slice(
            indicePrimero,
            indiceUltimo
        );


    const totalPaginas =
        Math.max(
            1,
            Math.ceil(
                rowsFiltrados.length /
                registrosPorPagina
            )
        );


    // ============================================================
    // ELIMINAR
    // ============================================================

    const eliminar = async (id) => {

        if (
            !window.confirm(
                "¿Eliminar lote?"
            )
        ) {
            return;
        }


        try {

            await produccionLoteApi.remove(
                id
            );

            await cargar();

        } catch (error) {

            console.error(error);

            alert(
                "Error al eliminar el lote"
            );

        }

    };


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <Container fluid>

            <Card>

                {/* ====================================================
                    ENCABEZADO
                ==================================================== */}

                <Card.Header>

                    <div
                        className="d-flex justify-content-between align-items-center"
                    >

                        <h3 className="mb-0">
                            Producción Fábrica
                        </h3>


                        <Button
                            variant="primary"
                            onClick={() =>
                                navigate(
                                    "/fabrica/produccion-lotes/nuevo"
                                )
                            }
                        >
                            Nuevo
                        </Button>

                    </div>

                </Card.Header>


                <Card.Body>

                    {/* ====================================================
                        FILTROS
                    ==================================================== */}

                    <Row className="mb-3">

                        <Col md={3}>

                            <Form.Label>
                                Número de lote
                            </Form.Label>

                            <Form.Control
                                placeholder="Número de lote"
                                value={filtroLote}
                                onChange={(e) =>
                                    setFiltroLote(
                                        e.target.value
                                    )
                                }
                            />

                        </Col>


                        <Col md={2}>

                            <Form.Label>
                                Fecha Desde
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

                        </Col>


                        <Col md={2}>

                            <Form.Label>
                                Fecha Hasta
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

                        </Col>


                        <Col
                            md={3}
                            className="d-flex align-items-end"
                        >

                            <Button
                                variant="secondary"
                                onClick={
                                    limpiarFiltros
                                }
                            >
                                Limpiar
                            </Button>

                        </Col>

                    </Row>


                    {/* ====================================================
                        CONTADOR
                    ==================================================== */}

                    <div className="mb-2">

                        <strong>
                            Registros:{" "}
                            {rowsFiltrados.length}
                        </strong>

                    </div>


                    {/* ====================================================
                        TABLA
                    ==================================================== */}

                    <Table
                        striped
                        bordered
                        hover
                        responsive
                    >

                        <thead>

                            <tr>

                                <th>
                                    Lote
                                </th>

                                <th>
                                    Cant. Productos
                                </th>

                                <th>
                                    Total Kg
                                </th>

                                <th>
                                    Fecha Producción
                                </th>

                                <th>
                                    Estado
                                </th>

                                <th>
                                    Acciones
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {registrosPagina.map(
                                (row) => (

                                    <tr
                                        key={row.id}
                                    >

                                        {/* LOTE */}

                                        <td>

                                            <strong>
                                                {
                                                    row.numero_lote
                                                }
                                            </strong>

                                        </td>


                                        {/* CANTIDAD PRODUCTOS */}

                                        <td>

                                            {
                                                row.detalles
                                                    ?.length ||
                                                0
                                            }

                                        </td>


                                        {/* TOTAL KG */}

                                        <td>

                                            <strong>

                                                {
                                                    (
                                                        row.detalles
                                                            ?.reduce(
                                                                (
                                                                    total,
                                                                    item
                                                                ) =>
                                                                    total +
                                                                    Number(
                                                                        item.cantidad ||
                                                                        0
                                                                    ),
                                                                0
                                                            ) ||
                                                        0
                                                    ).toFixed(
                                                        3
                                                    )
                                                }

                                            </strong>

                                        </td>


                                        {/* FECHA */}

                                        <td>

                                            {
                                                row.fecha_produccion
                                            }

                                        </td>


                                        {/* ESTADO */}

                                        <td>

                                            {
                                                row.estado
                                            }

                                        </td>


                                        {/* ACCIONES */}

                                        <td>

                                            <Button
                                                size="sm"
                                                variant="warning"
                                                className="me-1"
                                                onClick={() =>
                                                    navigate(
                                                        `/fabrica/produccion-lotes/editar/${row.id}`
                                                    )
                                                }
                                            >
                                                Editar
                                            </Button>


                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() =>
                                                    eliminar(
                                                        row.id
                                                    )
                                                }
                                            >
                                                Eliminar
                                            </Button>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </Table>


                    {/* ====================================================
                        PAGINACIÓN
                    ==================================================== */}

                    <div
                        className="d-flex justify-content-center mt-3"
                    >

                        <Button
                            variant="outline-primary"
                            disabled={
                                paginaActual === 1
                            }
                            onClick={() =>
                                setPaginaActual(
                                    (pagina) =>
                                        pagina - 1
                                )
                            }
                        >
                            Anterior
                        </Button>


                        <span
                            className="mx-3 align-self-center"
                        >

                            Página{" "}
                            {paginaActual}
                            {" "}de{" "}
                            {totalPaginas}

                        </span>


                        <Button
                            variant="outline-primary"
                            disabled={
                                paginaActual >=
                                totalPaginas
                            }
                            onClick={() =>
                                setPaginaActual(
                                    (pagina) =>
                                        pagina + 1
                                )
                            }
                        >
                            Siguiente
                        </Button>

                    </div>

                </Card.Body>

            </Card>

        </Container>

    );

}