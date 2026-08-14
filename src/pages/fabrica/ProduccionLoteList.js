import React, {
    useEffect,
    useState
} from "react";

import {
    Table,
    Button,
    Container
} from "react-bootstrap";

import {
    useNavigate
} from "react-router-dom";

import {
    produccionLoteApi
} from "../../services/produccionLoteApi";

export default function ProduccionLoteList() {

    const navigate = useNavigate();

    const [rows, setRows] = useState([]);
    const [rowsFiltrados, setRowsFiltrados] = useState([]);

    const [filtroLote, setFiltroLote] = useState("");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");

    const [paginaActual, setPaginaActual] = useState(1);
    const registrosPorPagina = 20;

    const cargar = async () => {

        try {

            const data =
                await produccionLoteApi.list();

            setRows(data);
            setRowsFiltrados(data);

        } catch (error) {
            console.error(error);
        }

    };

    const filtrar = () => {

        let resultado = [...rows];

        if (filtroLote) {

            resultado = resultado.filter(
                row =>
                    row.numero_lote
                        ?.toLowerCase()
                        .includes(
                            filtroLote.toLowerCase()
                        )
            );

        }

        if (fechaDesde) {

            resultado = resultado.filter(
                row =>
                    row.fecha_produccion >=
                    fechaDesde
            );

        }

        if (fechaHasta) {

            resultado = resultado.filter(
                row =>
                    row.fecha_produccion <=
                    fechaHasta
            );

        }

        setPaginaActual(1);

        setRowsFiltrados(resultado);

    };

    const limpiarFiltros = () => {

        setFiltroLote("");
        setFechaDesde("");
        setFechaHasta("");

        setRowsFiltrados(rows);

        setPaginaActual(1);

    };

    useEffect(() => {

        filtrar();

    }, [
        filtroLote,
        fechaDesde,
        fechaHasta
    ]);


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
        Math.ceil(
            rowsFiltrados.length /
            registrosPorPagina
        );


    useEffect(() => {
        cargar();
    }, []);

    const eliminar = async (id) => {

        if (
            !window.confirm(
                "¿Eliminar lote?"
            )
        )
            return;

        await produccionLoteApi.remove(id);

        cargar();
    };

    return (
        <Container fluid>

            <div className="d-flex justify-content-between mb-3">

                <h3>
                    Producción Fábrica
                </h3>

                <div className="row mb-3">

                    <div className="col-md-3">

                        <input
                            className="form-control"
                            placeholder="Número de lote"
                            value={filtroLote}
                            onChange={(e) =>
                                setFiltroLote(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    <div className="col-md-2">

                        <input
                            type="date"
                            className="form-control"
                            value={fechaDesde}
                            onChange={(e) =>
                                setFechaDesde(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    <div className="col-md-2">

                        <input
                            type="date"
                            className="form-control"
                            value={fechaHasta}
                            onChange={(e) =>
                                setFechaHasta(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    <div className="col-md-2">

                        <Button
                            variant="secondary"
                            onClick={
                                limpiarFiltros
                            }
                        >
                            Limpiar
                        </Button>

                    </div>

                    <div className="col-md-3 text-end">

                        <strong>

                            Registros:
                            {" "}
                            {rowsFiltrados.length}

                        </strong>

                    </div>

                </div>


                <Button
                    onClick={() =>
                        navigate(
                            "/fabrica/produccion-lotes/nuevo"
                        )
                    }
                >
                    Nuevo
                </Button>

            </div>

            <Table
                striped
                bordered
                hover
            >

                <thead>

                    <tr>
                        <th>Lote</th>
                        <th>Cant. Productos</th>
                        <th>Total Kg</th>
                        <th>Fecha</th>
                        <th>Estado</th>

                        <th>Acciones</th>
                    </tr>

                </thead>

                <tbody>

                    {registrosPagina.map((row) => (

                        <tr key={row.id}>

                            <td>
                                {row.numero_lote}
                            </td>

                            <td>
                                {row.detalles?.length || 0}
                            </td>

                            <td>
                                {
                                    (
                                        row.detalles?.reduce(
                                            (total, item) =>
                                                total +
                                                Number(item.cantidad || 0),
                                            0
                                        ) || 0
                                    ).toFixed(3)
                                }
                            </td>

                            <td>
                                {row.fecha_produccion}
                            </td>

                            <td>
                                {row.estado}
                            </td>

                            <td>

                                <Button
                                    size="sm"
                                    variant="warning"
                                    onClick={() =>
                                        navigate(
                                            `/fabrica/produccion-lotes/editar/${row.id}`
                                        )
                                    }
                                >
                                    Editar
                                </Button>

                                {" "}

                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() =>
                                        eliminar(row.id)
                                    }
                                >
                                    Eliminar
                                </Button>

                            </td>

                        </tr>

                    ))}

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

        </Container>
    );
}