import React, {
    useState,
    useEffect,
    useContext
} from "react";

import {
    Container,
    Card,
    Table,
    Button,
    Modal,
    Row,
    Col,
    Form
} from "react-bootstrap";

import {
    useNavigate
} from "react-router-dom";

import Contexts from "../../context/Contexts";

import {
    transferenciaFabricaListApi
} from "../../services/transferenciaFabricaListApi";

export default function TransferenciaFabricaList() {

    const navigate = useNavigate();

    const context =
        useContext(
            Contexts.DataContext
        );

    const sucursales =
        context?.sucursales || [];

    const [rows, setRows] =
        useState([]);

    const [detalle, setDetalle] =
        useState([]);

    const [showModal,
        setShowModal] =
        useState(false);

    const [fechaDesde,
        setFechaDesde] =
        useState("");

    const [fechaHasta,
        setFechaHasta] =
        useState("");

    const [sucursalDestino,
        setSucursalDestino] =
        useState("");

    const [paginaActual,
        setPaginaActual] =
        useState(1);

    const registrosPorPagina = 20;

    const cargar =
        async () => {

            try {

                const data =
                    await transferenciaFabricaListApi.listar({

                        fechaDesde,

                        fechaHasta,

                        sucursalDestino

                    });

                setRows(data);

            } catch (error) {

                console.error(error);

            }

        };

    useEffect(() => {

        cargar();

    }, []);

    const verDetalle =
        async (
            fecha,
            sucursal
        ) => {

            try {

                const data =
                    await transferenciaFabricaListApi.obtenerDetalle(

                        fecha,

                        sucursal

                    );

                setDetalle(data);

                setShowModal(true);

            } catch (error) {

                console.error(error);

            }

        };

    const indiceUltimo =
        paginaActual *
        registrosPorPagina;

    const indicePrimero =
        indiceUltimo -
        registrosPorPagina;

    const registrosPagina =
        rows.slice(
            indicePrimero,
            indiceUltimo
        );

    const totalPaginas =
        Math.max(
            1,
            Math.ceil(
                rows.length /
                registrosPorPagina
            )
        );

    const totalKg =
        rows.reduce(
            (
                acc,
                item
            ) =>
                acc +
                Number(
                    item.totalKg || 0
                ),
            0
        );

    return (

        <Container fluid>

            <Card>

                <Card.Header>

                    <Row>

                        <Col>

                            <h4>

                                Transferencias de Fábrica

                            </h4>

                        </Col>

                        <Col
                            className="text-end"
                        >

                            <Button
                                onClick={() =>
                                    navigate(
                                        "/fabrica/transferir"
                                    )
                                }
                            >
                                Nueva Transferencia
                            </Button>

                        </Col>

                    </Row>

                </Card.Header>

                <Card.Body>

                    <Row
                        className="mb-3"
                    >

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

                        <Col md={3}>

                            <Form.Label>

                                Sucursal

                            </Form.Label>

                            <Form.Select
                                className="form-control"
                                value={sucursalDestino}
                                onChange={(e) =>
                                    setSucursalDestino(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="">
                                    Todas
                                </option>

                                {
                                    sucursales.map(
                                        suc => (

                                            <option
                                                key={suc.id}
                                                value={suc.id}
                                            >

                                                {suc.nombre}

                                            </option>

                                        )
                                    )
                                }

                            </Form.Select>

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

                    </Row>

                    <Row
                        className="mb-3"
                    >

                        <Col>

                            <strong>

                                Transferencias:

                                {" "}

                                {rows.length}

                            </strong>

                        </Col>

                        <Col
                            className="text-end"
                        >

                            <strong>

                                Total Kg:

                                {" "}

                                {totalKg.toFixed(3)}

                            </strong>

                        </Col>

                    </Row>

                    <Table
                        striped
                        bordered
                        hover
                        responsive
                    >

                        <thead>

                            <tr>

                                <th>
                                    Fecha
                                </th>

                                <th>
                                    Sucursal
                                </th>

                                <th>
                                    Artículos
                                </th>

                                <th>
                                    Total Kg
                                </th>

                                <th>
                                    Acción
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {
                                registrosPagina.map(
                                    (
                                        row,
                                        index
                                    ) => (

                                        <tr
                                            key={index}
                                        >

                                            <td>
                                                {row.fecha}
                                            </td>

                                            <td>
                                                {row.sucursal}
                                            </td>

                                            <td>
                                                {
                                                    row.cantidadArticulos
                                                }
                                            </td>

                                            <td>

                                                {
                                                    Number(
                                                        row.totalKg || 0
                                                    ).toFixed(3)
                                                }

                                            </td>

                                            <td>

                                                <Button
                                                    size="sm"
                                                    variant="info"
                                                    onClick={() =>
                                                        verDetalle(

                                                            row.fecha,

                                                            row.sucursaldestino_id

                                                        )
                                                    }
                                                >

                                                    Ver Detalle

                                                </Button>

                                            </td>

                                        </tr>

                                    )
                                )
                            }

                        </tbody>

                    </Table>

                    <div className="d-flex justify-content-center mt-3">

                        <Button
                            variant="outline-primary"
                            disabled={
                                paginaActual === 1
                            }
                            onClick={() =>
                                setPaginaActual(
                                    paginaActual - 1
                                )
                            }
                        >
                            Anterior
                        </Button>

                        <span
                            className="mx-3 align-self-center"
                        >

                            Página

                            {" "}

                            {paginaActual}

                            {" "}

                            de

                            {" "}

                            {totalPaginas}

                        </span>

                        <Button
                            variant="outline-primary"
                            disabled={
                                paginaActual ===
                                totalPaginas
                            }
                            onClick={() =>
                                setPaginaActual(
                                    paginaActual + 1
                                )
                            }
                        >
                            Siguiente
                        </Button>

                    </div>

                </Card.Body>

            </Card>

            <Modal
                size="lg"
                show={showModal}
                onHide={() =>
                    setShowModal(false)
                }
            >

                <Modal.Header closeButton>

                    <Modal.Title>

                        Detalle Transferencia

                    </Modal.Title>

                </Modal.Header>

                <Modal.Body>

                    <Table
                        bordered
                        striped
                    >

                        <thead>

                            <tr>

                                <th>
                                    Código
                                </th>

                                <th>
                                    Descripción
                                </th>

                                <th>
                                    Cantidad
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {
                                detalle.map(
                                    (
                                        item,
                                        index
                                    ) => (

                                        <tr
                                            key={index}
                                        >

                                            <td>
                                                {
                                                    item.codigo
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.descripcion
                                                }
                                            </td>

                                            <td>

                                                {
                                                    Number(
                                                        item.cantidad || 0
                                                    ).toFixed(3)
                                                }

                                            </td>

                                        </tr>

                                    )
                                )
                            }

                        </tbody>

                    </Table>

                </Modal.Body>

            </Modal>

        </Container>

    );

}