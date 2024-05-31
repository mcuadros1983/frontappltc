import React, { useState, useEffect, useContext, useCallback } from "react";
import {
    Container,
    Table,
    Button,
    FormControl,
    Spinner,
    
} from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../context/Contexts";

const DetalleCtaCte = () => {
    const [ventas, setVentas] = useState([]);
    const [cobranzas, setCobranzas] = useState([]);
    const [buscarSucursal, setBuscarSucursal] = useState("");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [operacionesPorPagina] = useState(2000);
    const [columnaOrden, setColumnaOrden] = useState(null);
    const [direccionOrden, setDireccionOrden] = useState("asc");
    const [clienteSeleccionado, setClienteSeleccionado] = useState("");
    const [clientesFiltrados, setClientesFiltrados] = useState([]);
    const [ventasOriginales, setVentasOriginales] = useState([]);
    const [cobranzasOriginales, setCobranzasOriginales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [totalImporteVentas, setTotalImporteVentas] = useState(0);
    const [totalImporteCobranzas, setTotalImporteCobranzas] = useState(0);

    const contexto = useContext(Contexts.DataContext);
    const apiUrl = process.env.REACT_APP_API_URL;

    const manejadorFiltroClienteSeleccionado = useCallback(() => {
        if (ventasOriginales.length > 0) {
            let ventasFiltradas = [...ventasOriginales];
            if (clienteSeleccionado) {
                ventasFiltradas = ventasFiltradas.filter(
                    (venta) => parseInt(venta.cliente_id) === parseInt(clienteSeleccionado)
                );
            }
            setVentas(ventasFiltradas);
            setPaginaActual(1);
        }
        if (cobranzasOriginales.length > 0) {
            let cobranzasFiltradas = [...cobranzasOriginales];
            if (clienteSeleccionado) {
                cobranzasFiltradas = cobranzasFiltradas.filter(
                    (cobranza) => parseInt(cobranza.cliente_id) === parseInt(clienteSeleccionado)
                );
            }
            setCobranzas(cobranzasFiltradas);
            setPaginaActual(1);
        }
    }, [ventasOriginales, cobranzasOriginales, clienteSeleccionado]);

    const calcularTotalImporte = useCallback(() => {
        const totalVentas = ventas.reduce(
            (acc, venta) => acc + parseFloat(venta.importe),
            0
        );
        setTotalImporteVentas(totalVentas);

        const totalCobranzas = cobranzas.reduce(
            (acc, cobranza) => acc + parseFloat(cobranza.importe),
            0
        );
        setTotalImporteCobranzas(totalCobranzas);
    }, [ventas, cobranzas]);

    useEffect(() => {
        manejadorFiltroClienteSeleccionado();
    }, [manejadorFiltroClienteSeleccionado]);

    useEffect(() => {
        calcularTotalImporte();
    }, [calcularTotalImporte]);

    const manejarFiltro = async () => {
        try {
            setLoading(true);
            setError("");

            if (!esFechaValida(fechaDesde) || !esFechaValida(fechaHasta)) {
                alert("Ingrese una fecha válida.");
                return;
            }

            const respuestaVentas = await fetch(`${apiUrl}/caja/vtasctacte_filtrados`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fechaDesde,
                    fechaHasta,
                    sucursalId: buscarSucursal,
                }),
            });

            const respuestaCobranzas = await fetch(`${apiUrl}/caja/cobranzasctacte_filtrados`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fechaDesde,
                    fechaHasta,
                    sucursalId: buscarSucursal,
                }),
            });

            if (respuestaVentas.ok && respuestaCobranzas.ok) {
                const datosVentas = await respuestaVentas.json();
                const datosCobranzas = await respuestaCobranzas.json();

                if (datosVentas.length === 0 && datosCobranzas.length === 0) {
                    alert("No existe informacion para la fecha indicada.");
                    return;
                }
                console.log("ventas", datosVentas, "cobranzas", datosCobranzas)

                setVentas(datosVentas);
                setVentasOriginales(datosVentas);
                setCobranzas(datosCobranzas);
                setCobranzasOriginales(datosCobranzas);
                setPaginaActual(1);
                setClienteSeleccionado("");

                const clientes = datosVentas.map((venta) => parseInt(venta.cliente_id)).concat(
                    datosCobranzas.map((cobranza) => parseInt(cobranza.cliente_id))
                );
                const clientesUnicos = [...new Set(clientes)];
                const clientesFiltrados = contexto.clientesTabla
                    .filter((cliente) => clientesUnicos.includes(cliente.id))
                    .sort((a, b) => a.nombre.localeCompare(b.nombre));

                setClientesFiltrados(clientesFiltrados);
            } else {
                throw new Error(
                    "No se encontraron ventas o cobranzas para la sucursal en la fecha especificada"
                );
            }
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const manejarOrden = (nombreColumna) => {
        setDireccionOrden(
            nombreColumna === columnaOrden && direccionOrden === "asc"
                ? "desc"
                : "asc"
        );
        setColumnaOrden(nombreColumna);

        const ventasOrdenadas = [...ventas].sort((a, b) => {
            let valorA = a[nombreColumna];
            let valorB = b[nombreColumna];

            if (nombreColumna === "importe" || nombreColumna === "saldo") {
                valorA = parseFloat(valorA);
                valorB = parseFloat(valorB);
            }

            if (valorA < valorB) {
                return direccionOrden === "asc" ? -1 : 1;
            } else if (valorA > valorB) {
                return direccionOrden === "asc" ? 1 : -1;
            } else {
                return 0;
            }
        });

        setVentas(ventasOrdenadas);
    };

    const esFechaValida = (cadenaFecha) => {
        const regEx = /^\d{4}-\d{2}-\d{2}$/;
        if (!cadenaFecha.match(regEx)) return false;
        const fecha = new Date(cadenaFecha);
        if (!fecha.getTime()) return false;
        return fecha.toISOString().slice(0, 10) === cadenaFecha;
    };

    const manejarBusqueda = () => {
        manejarFiltro();
    };

    const indiceUltimaOperacion = paginaActual * operacionesPorPagina;
    const indicePrimeraOperacion = indiceUltimaOperacion - operacionesPorPagina;
    const operacionesActuales = [...ventas, ...cobranzas].slice(indicePrimeraOperacion, indiceUltimaOperacion);

    const paginaSiguiente = () => {
        if (paginaActual < Math.ceil([...ventas, ...cobranzas].length / operacionesPorPagina)) {
            setPaginaActual(paginaActual + 1);
        }
    };

    const paginaAnterior = () => {
        if (paginaActual > 1) {
            setPaginaActual(paginaActual - 1);
        }
    };

    return (
        <Container>
            <h1 className="my-list-title dark-text">Detalle de Cuenta Corriente</h1>

            <div className="mb-3">

                <div className="d-inline-block w-auto">
                    <label className="mr-2">DESDE: </label>
                    <input
                        type="date"
                        value={fechaDesde}
                        onChange={(e) => setFechaDesde(e.target.value)}
                        className="form-control rounded-0 border-transparent text-center"
                    />
                </div>

                <div className="d-inline-block w-auto ml-2">
                    <label className="ml-2 mr-2">HASTA:</label>
                    <input
                        type="date"
                        value={fechaHasta}
                        onChange={(e) => setFechaHasta(e.target.value)}
                        className="form-control rounded-0 border-transparent text-center"
                    />
                </div>
            </div>
            <div className="mb-3">
                <FormControl
                    as="select"
                    value={buscarSucursal}
                    onChange={(e) => setBuscarSucursal(e.target.value)}
                    className="mr-2"
                    style={{ width: "25%" }}
                >
                    <option value="">Seleccione una sucursal</option>
                    {contexto.sucursalesTabla.map((sucursal) => (
                        <option key={sucursal.id} value={sucursal.id}>
                            {sucursal.nombre}
                        </option>
                    ))}
                </FormControl>
            </div>

            <div className="mb-3">
                <FormControl
                    as="select"
                    value={clienteSeleccionado}
                    onChange={(e) => setClienteSeleccionado(e.target.value)}
                    className="mr-2 mb-3"
                    style={{ width: "25%" }}
                >
                    <option value="">Seleccione un cliente</option>
                    {clientesFiltrados.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                            {cliente.nombre} {cliente.apellido}
                        </option>
                    ))}
                </FormControl>
            </div>

            <div className="mb-3 d-flex">
                <Button onClick={manejarBusqueda} disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" /> : "Filtrar"}
                </Button>
            </div>

            {error && <div>{error}</div>}

            {ventas.length === 0 && cobranzas.length === 0 && !loading && !error && (
                <div>
                    No se encontraron ventas o cobranzas para la sucursal en la fecha especificada
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    Página {paginaActual} de {Math.ceil([...ventas, ...cobranzas].length / operacionesPorPagina)}
                </div>
                <div>Total Ventas: {totalImporteVentas.toFixed(3)}</div>
                <div>Total Cobranzas: {totalImporteCobranzas.toFixed(3)}</div>
                <div>Saldo: {(totalImporteVentas.toFixed(3)-totalImporteCobranzas.toFixed(3)).toFixed(3)}</div>
            </div>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th onClick={() => manejarOrden("fecha")} style={{ cursor: "pointer" }}>Fecha</th>
                        <th onClick={() => manejarOrden("importe")} style={{ cursor: "pointer" }}>Importe</th>
                        <th onClick={() => manejarOrden("tipo")} style={{ cursor: "pointer" }}>Tipo</th>
                        <th onClick={() => manejarOrden("sucursal_id")} style={{ cursor: "pointer" }}>Sucursal</th>
                        <th onClick={() => manejarOrden("cliente_id")} style={{ cursor: "pointer" }}>Cliente</th>
                        <th onClick={() => manejarOrden("observaciones")} style={{ cursor: "pointer" }}>Observaciones</th>
                    </tr>
                </thead>
                <tbody>
                    {operacionesActuales.map((operacion, index) => {
                        const tipo = operacion.vtactacteId ? "Venta" : operacion.cobranzaId ? "Cobranza" : "Desconocido";
                        return (
                            <tr key={index}>
                                <td>{operacion.fecha}</td>
                                <td>{parseFloat(operacion.importe).toFixed(3)}</td>
                                <td>{tipo}</td>
                                <td>
                                    {contexto.sucursalesTabla.find(
                                        (sucursal) => sucursal.id === parseInt(operacion.sucursal_id)
                                    )?.nombre || "Desconocido"}
                                </td>
                                <td>
                                    {clientesFiltrados.find(
                                        (cliente) => cliente.id === parseInt(operacion.cliente_id)
                                    )
                                        ? `${clientesFiltrados.find(
                                            (cliente) => cliente.id === parseInt(operacion.cliente_id)
                                        ).nombre
                                        } ${clientesFiltrados.find(
                                            (cliente) => cliente.id === parseInt(operacion.cliente_id)
                                        ).apellido
                                        }`
                                        : "Desconocido"}
                                </td>
                                <td>{operacion.observaciones}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>

            <div className="d-flex justify-content-center align-items-center">
                <Button onClick={paginaAnterior} disabled={paginaActual === 1}>
                    <BsChevronLeft />
                </Button>
                <span className="mx-2">
                    Página {paginaActual} de {Math.ceil([...ventas, ...cobranzas].length / operacionesPorPagina)}
                </span>
                <Button onClick={paginaSiguiente} disabled={paginaActual === Math.ceil([...ventas, ...cobranzas].length / operacionesPorPagina)}>
                    <BsChevronRight />
                </Button>
            </div>
        </Container>
    );
};

export default DetalleCtaCte;