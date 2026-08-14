import React, {
    useEffect,
    useState
} from "react";

import {
    Container,
    Card,
    Table,
    Button,
    Row,
    Col
} from "react-bootstrap";

import {
    useNavigate,
    useParams,
    useSearchParams

} from "react-router-dom";

import {
    stockFabricaApi
} from "../../services/stockFabricaApi";

export default function StockFabricaDetalle() {

    const navigate =
        useNavigate();

    const [searchParams] =
        useSearchParams();

    const { codigobarra } =
        useParams();

    const inventarioId =
        searchParams.get(
            "inventarioId"
        );

    const fechaDesde =
        searchParams.get(
            "fechaDesde"
        );

    const fechaHasta =
        searchParams.get(
            "fechaHasta"
        );

    // const { codigobarra, inventarioId, fechaDesde, fechaHasta } =
    //     useParams();

    // const [fecha,
    //     setFecha] =
    //     useState(
    //         new Date()
    //             .toISOString()
    //             .split("T")[0]
    //     );

    const [data,
        setData] =
        useState(null);

    const [tipoFiltro, setTipoFiltro] =
        useState("");

    const cargar =
        async () => {

            try {

                const resp =
                    await stockFabricaApi.obtenerDetalle(
                        codigobarra,
                        inventarioId,
                        fechaDesde,
                        fechaHasta
                    )

                let saldo = 0;

                const movimientos =
                    resp.movimientos.map(
                        mov => {

                            saldo +=
                                Number(
                                    mov.cantidad || 0
                                );

                            return {
                                ...mov,
                                saldo
                            };

                        }
                    );

                setData({
                    ...resp,
                    movimientos
                });

            } catch (error) {

                console.error(error);

            }

        };

    useEffect(() => {

        cargar();

    }, [
        codigobarra,
        inventarioId,
        fechaDesde,
        fechaHasta
    ]);

    const movimientosFiltrados =
        data?.movimientos?.filter(
            mov =>
                !tipoFiltro ||
                mov.tipo === tipoFiltro
        ) || [];

    return (

        <Container fluid>

            <Card>

                <Card.Header>

                    <Row>

                        <Col>

                            <h4>
                                Auditoría Stock Fabrica
                            </h4>

                        </Col>

                        <Col
                            className="text-end"
                        >

                            <Button
                                variant="secondary"
                                onClick={() =>
                                    navigate(
                                        "/fabrica/stock"
                                    )
                                }
                            >
                                Volver
                            </Button>

                        </Col>

                    </Row>

                </Card.Header>

                <Card.Body>

                    <Row
                        className="mb-3"
                    >

                        <Col md={3}>

                            <label>
                                Fecha Desde
                            </label>

                            <input
                                type="date"
                                className="form-control"
                                value={fechaDesde || ""}
                                disabled
                            />

                        </Col>

                        <Col md={3}>

                            <label>
                                Fecha Hasta
                            </label>

                            <input
                                type="date"
                                className="form-control"
                                value={fechaHasta || ""}
                                disabled
                            />

                        </Col>

                        <Col md={3}>

                            <label>
                                Tipo Movimiento
                            </label>

                            <select
                                className="form-control"
                                value={tipoFiltro}
                                onChange={(e) =>
                                    setTipoFiltro(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="">
                                    Todos
                                </option>

                                <option value="PRODUCCION">
                                    Producción
                                </option>

                                <option value="ENTRADA">
                                    Entrada
                                </option>

                                <option value="EGRESO">
                                    Egreso
                                </option>

                                <option value="INVENTARIO INICIAL">
                                    Inventario Inicial
                                </option>

                            </select>

                        </Col>

                        <Col
                            md={2}
                            className="d-flex align-items-end"
                        >

                            <Button
                                onClick={
                                    cargar
                                }
                            >
                                Buscar
                            </Button>

                        </Col>

                        <Col
                            md={2}
                            className="d-flex align-items-end"
                        >

                            <strong>

                                Movimientos:

                                {" "}

                                {
                                    movimientosFiltrados.length
                                }

                            </strong>

                        </Col>

                    </Row>

                    {data && (

                        <>

                            <Card
                                className="mb-3"
                            >

                                <Card.Body>

                                    <Row>

                                        <Col md={2}>

                                            <strong>
                                                Código
                                            </strong>

                                            <div>
                                                {
                                                    data.codigobarra
                                                }
                                            </div>

                                        </Col>

                                        <Col md={4}>

                                            <strong>
                                                Descripción
                                            </strong>

                                            <div>
                                                {
                                                    data.descripcion
                                                }
                                            </div>

                                        </Col>

                                        <Col md={2}>

                                            <strong>
                                                Inv. Inicial
                                            </strong>

                                            <div>
                                                {
                                                    Number(
                                                        data.stockInicial || 0
                                                    ).toFixed(3)
                                                }
                                            </div>

                                        </Col>

                                        <Col md={2}>

                                            <strong>
                                                Producción
                                            </strong>

                                            <div>
                                                {
                                                    Number(
                                                        data.produccion || 0
                                                    ).toFixed(3)
                                                }
                                            </div>

                                        </Col>

                                        <Col md={2}>

                                            <strong>
                                                Entradas
                                            </strong>

                                            <div>
                                                {
                                                    Number(
                                                        data.entradas || 0
                                                    ).toFixed(3)
                                                }
                                            </div>

                                        </Col>

                                        <Col md={2}>

                                            <strong>
                                                Egresos
                                            </strong>

                                            <div>
                                                {
                                                    Number(
                                                        data.egresos || 0
                                                    ).toFixed(3)
                                                }
                                            </div>

                                        </Col>

                                    </Row>

                                </Card.Body>

                            </Card>

                            <Card
                                className="mb-3"
                            >

                                <Card.Body>

                                    <h5>

                                        Stock Actual:

                                        {" "}

                                        {
                                            Number(
                                                data.stock || 0
                                            ).toFixed(3)
                                        }

                                    </h5>

                                    <Row className="mt-3">

                                        <Col md={3}>

                                            <Card
                                                bg="success"
                                                text="white"
                                            >

                                                <Card.Body>

                                                    <strong>
                                                        Producción
                                                    </strong>

                                                    <div>

                                                        {
                                                            Number(
                                                                data.produccion || 0
                                                            ).toFixed(3)
                                                        }

                                                    </div>

                                                </Card.Body>

                                            </Card>

                                        </Col>

                                        <Col md={3}>

                                            <Card
                                                bg="primary"
                                                text="white"
                                            >

                                                <Card.Body>

                                                    <strong>
                                                        Entradas
                                                    </strong>

                                                    <div>

                                                        {
                                                            Number(
                                                                data.entradas || 0
                                                            ).toFixed(3)
                                                        }

                                                    </div>

                                                </Card.Body>

                                            </Card>

                                        </Col>

                                        <Col md={3}>

                                            <Card
                                                bg="danger"
                                                text="white"
                                            >

                                                <Card.Body>

                                                    <strong>
                                                        Egresos
                                                    </strong>

                                                    <div>

                                                        {
                                                            Number(
                                                                data.egresos || 0
                                                            ).toFixed(3)
                                                        }

                                                    </div>

                                                </Card.Body>

                                            </Card>

                                        </Col>

                                        <Col md={3}>

                                            <Card
                                                bg="dark"
                                                text="white"
                                            >

                                                <Card.Body>

                                                    <strong>
                                                        Stock
                                                    </strong>

                                                    <div>

                                                        {
                                                            Number(
                                                                data.stock || 0
                                                            ).toFixed(3)
                                                        }

                                                    </div>

                                                </Card.Body>

                                            </Card>

                                        </Col>

                                    </Row>

                                </Card.Body>

                            </Card>

                            <Table
                                striped
                                bordered
                                hover
                                responsive
                            >

                                <thead>

                                    <tr>

                                        <th>Fecha</th>

                                        <th>Tipo</th>

                                        <th>Lote</th>

                                        <th>Sucursal</th>

                                        <th>Referencia</th>

                                        <th>Cantidad</th>

                                        <th>Saldo</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {
                                        movimientosFiltrados.map(
                                            (
                                                mov,
                                                index
                                            ) => {

                                                let colorTipo =
                                                    "";

                                                if (
                                                    mov.tipo ===
                                                    "PRODUCCION"
                                                ) {

                                                    colorTipo =
                                                        "#198754";

                                                }

                                                if (
                                                    mov.tipo ===
                                                    "ENTRADA"
                                                ) {

                                                    colorTipo =
                                                        "#0d6efd";

                                                }

                                                if (
                                                    mov.tipo ===
                                                    "EGRESO"
                                                ) {

                                                    colorTipo =
                                                        "#dc3545";

                                                }

                                                return (

                                                    <tr
                                                        key={index}
                                                    >

                                                        <td>
                                                            {mov.fecha}
                                                        </td>

                                                        <td>

                                                            <span
                                                                style={{
                                                                    color:
                                                                        colorTipo,
                                                                    fontWeight:
                                                                        "bold"
                                                                }}
                                                            >

                                                                {mov.tipo}

                                                            </span>

                                                        </td>

                                                        <td>

                                                            {
                                                                mov.lote ||
                                                                "-"
                                                            }

                                                        </td>

                                                        <td>

                                                            {
                                                                mov.sucursal_destino ||
                                                                "-"
                                                            }

                                                        </td>

                                                        <td>

                                                            {
                                                                mov.referencia
                                                            }

                                                        </td>

                                                        <td>

                                                            {
                                                                Number(
                                                                    mov.cantidad || 0
                                                                ).toFixed(3)
                                                            }

                                                        </td>

                                                        <td>

                                                            {
                                                                Number(
                                                                    mov.saldo || 0
                                                                ).toFixed(3)
                                                            }

                                                        </td>

                                                    </tr>

                                                );

                                            }
                                        )
                                    }

                                </tbody>

                            </Table>

                        </>

                    )}

                </Card.Body>

            </Card>

        </Container>

    );

}