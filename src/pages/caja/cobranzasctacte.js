import React, { useState, useEffect, useContext,useCallback } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../context/Contexts";

export default function CobranzasCtaCte() {
  const [cobranzas, setCobranzas] = useState([]);
  const [buscarSucursal, setBuscarSucursal] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [cobranzasPorPagina] = useState(10);
  const [columnaOrden, setColumnaOrden] = useState(null);
  const [direccionOrden, setDireccionOrden] = useState("asc");
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [cobranzasOriginales, setCobranzasOriginales] = useState([]);

  const contexto = useContext(Contexts.dataContext);
  const apiUrl = process.env.REACT_APP_API_URL;

  const manejadorFiltroClienteSeleccionado = useCallback(() => {
    if (cobranzasOriginales.length > 0) {
      let cobranzasFiltradas = [...cobranzasOriginales];

      if (clienteSeleccionado) {
        cobranzasFiltradas = cobranzasFiltradas.filter(
          (cobranza) =>
            parseInt(cobranza.cliente_id) === parseInt(clienteSeleccionado)
        );
      }

      setCobranzas(cobranzasFiltradas);
      setPaginaActual(1);
    }
  }, [cobranzasOriginales, clienteSeleccionado]);

  useEffect(() => {
    manejadorFiltroClienteSeleccionado();
  }, [clienteSeleccionado, manejadorFiltroClienteSeleccionado]);
  
  const manejarFiltro = async () => {
    try {
      if (!esFechaValida(fechaDesde) || !esFechaValida(fechaHasta)) {
        alert("Ingrese una fecha válida.");
        return;
      }

      const respuesta = await fetch(
        `${apiUrl}/caja/cobranzasctacte_filtrados`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fechaDesde,
            fechaHasta,
            sucursalId: buscarSucursal,
          }),
        }
      );

      if (respuesta.ok) {
        const datos = await respuesta.json();
        if (datos.length === 0) {
          alert("No existe informacion para la fecha indicada.");
          return;
        }
        setCobranzas(datos);
        setCobranzasOriginales(datos);
        setPaginaActual(1);
        setClienteSeleccionado("");

        const clientes = datos.map((cobranza) => parseInt(cobranza.cliente_id));
        const clientesUnicos = [...new Set(clientes)];
        const clientesFiltrados = contexto.clientesTabla
          .filter((cliente) => clientesUnicos.includes(cliente.id))
          // Ordenar los clientes filtrados alfabéticamente por nombre
          .sort((a, b) => a.nombre.localeCompare(b.nombre));

        setClientesFiltrados(clientesFiltrados);
      } else {
        throw new Error("Error al obtener las cobranzas");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const manejarOrden = (nombreColumna) => {
    setDireccionOrden(
      nombreColumna === columnaOrden && direccionOrden === "asc"
        ? "desc"
        : "asc"
    );
    setColumnaOrden(nombreColumna);

    const cobranzasOrdenadas = [...cobranzas].sort((a, b) => {
      let valorA = a[nombreColumna];
      let valorB = b[nombreColumna];

      if (nombreColumna === "importe" || nombreColumna === "saldocobranza") {
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

    setCobranzas(cobranzasOrdenadas);
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

  const indiceUltimaCobranza = paginaActual * cobranzasPorPagina;
  const indicePrimeraCobranza = indiceUltimaCobranza - cobranzasPorPagina;
  const cobranzasActuales = cobranzas.slice(
    indicePrimeraCobranza,
    indiceUltimaCobranza
  );

  // const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);

  const paginaSiguiente = () => {
    if (paginaActual < Math.ceil(cobranzas.length / cobranzasPorPagina)) {
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
      <h1 className="my-list-title dark-text">Cobranzas Cuenta Corriente</h1>

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

      <div className="mb-3">
        <Button onClick={manejarBusqueda}>Filtrar</Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th
              onClick={() => manejarOrden("fecha")}
              style={{ cursor: "pointer" }}
            >
              Fecha
            </th>
            <th
              onClick={() => manejarOrden("importe")}
              style={{ cursor: "pointer" }}
            >
              Importe
            </th>
            <th
              onClick={() => manejarOrden("cliente_id")}
              style={{ cursor: "pointer" }}
            >
              Cliente
            </th>
            <th
              onClick={() => manejarOrden("sucursal_id")}
              style={{ cursor: "pointer" }}
            >
              Sucursal
            </th>
          </tr>
        </thead>
        <tbody>
          {cobranzasActuales.map((cobranza) => {
            // const fecha = new Date(cobranza.fecha);
            // const dia = fecha.getDate();
            // const mes = fecha.getMonth() + 1;
            // const anio = fecha.getFullYear();
            // const fechaFormateada = `${dia}/${mes}/${anio}`;

            return (
              <tr key={cobranza.id}>
                <td>{cobranza.fecha}</td>
                <td>{parseFloat(cobranza.importe).toFixed(2)}</td>
                <td>
                  {contexto.clientesTabla.find(
                    (cliente) => cliente.id === parseInt(cobranza.cliente_id)
                  )?.nombre || "Desconocido"}
                </td>
                <td>
                  {contexto.sucursalesTabla.find(
                    (sucursal) => sucursal.id === parseInt(cobranza.sucursal_id)
                  )?.nombre || "Desconocido"}
                </td>
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
          Página {paginaActual} de{" "}
          {Math.ceil(cobranzas.length / cobranzasPorPagina)}
        </span>
        <Button
          onClick={paginaSiguiente}
          disabled={
            paginaActual === Math.ceil(cobranzas.length / cobranzasPorPagina)
          }
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
