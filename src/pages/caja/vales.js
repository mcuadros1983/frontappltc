import React, { useState, useEffect, useContext } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../context/Contexts";

export default function Vales() {
  const [vales, setVales] = useState([]);
  const [buscarSucursal, setBuscarSucursal] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [valesPorPagina] = useState(10);
  const [columnaOrden, setColumnaOrden] = useState(null);
  const [direccionOrden, setDireccionOrden] = useState("asc");
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [valesOriginales, setValesOriginales] = useState([]);

  const contexto = useContext(Contexts.dataContext);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    manejadorFiltroClienteSeleccionado();
  }, [clienteSeleccionado]);

  const manejadorFiltroClienteSeleccionado = () => {
    // Filter gastos based on selectedTipoGasto
    if (vales.length > 0) {
      let valesFiltrados = [...valesOriginales];
      // console.log("valesOriginales", valesFiltrados)

      if (clienteSeleccionado) {
        valesFiltrados = valesFiltrados.filter(
          (vale) => parseInt(vale.cliente_id) === parseInt(clienteSeleccionado)
        );
      }

      setVales(valesFiltrados);
      setPaginaActual(1);
    }
  };


  const manejarFiltro = async () => {
    try {
      // Validación de fechas
      if (!esFechaValida(fechaDesde) || !esFechaValida(fechaHasta)) {
        alert("Ingrese una fecha válida.");
        return;
      }

      const respuesta = await fetch(
        `${apiUrl}/caja/vales_filtrados`,
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
          ;
          return;
        }
        setVales(datos);
        setValesOriginales(datos); // Actualizar valesOriginales
        setPaginaActual(1); // Reiniciar a la primera página después de cada búsqueda
        setClienteSeleccionado("")
        // console.log("datos", datos)

        // Filtrar los clientes relacionados con los vales obtenidos
        const clientes = datos.map((vale) => parseInt(vale.cliente_id));
        const clientesUnicos = [...new Set(clientes)];

        // console.log("datos2", clientesUnicos)
        // console.log("datos3", contexto.clientesTabla)
        const clientesFiltrados = contexto.clientesTabla.filter((cliente) =>
          clientesUnicos.includes(cliente.id)
        );

        // console.log("datos4", clientesFiltrados)
        setClientesFiltrados(clientesFiltrados);
      } else {
        throw new Error("Error al obtener los vales");
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

    const valesOrdenados = [...vales].sort((a, b) => {
      let valorA = a[nombreColumna];
      let valorB = b[nombreColumna];

      if (nombreColumna === "importe") {
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

    setVales(valesOrdenados);
  };

  const esFechaValida = (cadenaFecha) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!cadenaFecha.match(regEx)) return false; // Formato incorrecto
    const fecha = new Date(cadenaFecha);
    if (!fecha.getTime()) return false; // Fecha inválida (por ejemplo, 31/04/2024)
    return fecha.toISOString().slice(0, 10) === cadenaFecha;
  };

  const manejarBusqueda = () => {
    manejarFiltro();
  };

  const indiceUltimoVale = paginaActual * valesPorPagina;
  const indicePrimerVale = indiceUltimoVale - valesPorPagina;
  const valesActuales = vales.slice(indicePrimerVale, indiceUltimoVale);

  const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);

  const paginaSiguiente = () => {
    if (paginaActual < Math.ceil(vales.length / valesPorPagina)) {
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
      <h1 className="my-list-title dark-text">Vales</h1>

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
              onClick={() => manejarOrden("importecupon")}
              style={{ cursor: "pointer" }}
            >
              Importe
            </th>
            <th
              onClick={() => manejarOrden("sucursal_id")}
              style={{ cursor: "pointer" }}
            >
              Sucursal
            </th>
            <th
              onClick={() => manejarOrden("cliente_id")}
              style={{ cursor: "pointer" }}
            >
              Cliente
            </th>
          </tr>
        </thead>
        <tbody>
          {valesActuales.map((vale) => {
            // const fecha = new Date(vale.fecha);
            // const dia = fecha.getDate();
            // const mes = fecha.getMonth() + 1;
            // const anio = fecha.getFullYear();
            // const fechaFormateada = `${dia}/${mes}/${anio}`;

            return (
              <tr key={vale.id}>
                <td>{vale.fecha}</td>
                <td>{vale.importecupon}</td>
                <td>
                  {contexto.sucursalesTabla.find(
                    (sucursal) => sucursal.id === parseInt(vale.sucursal_id)
                  )?.nombre || "Desconocido"}
                </td>
                <td>
                  {contexto.clientesTabla.find(
                    (cliente) => cliente.id === parseInt(vale.cliente_id)
                  )?.nombre || ""}
                  &nbsp;
                  {contexto.clientesTabla.find(
                    (cliente) => cliente.id === parseInt(vale.cliente_id)
                  )?.apellido || "Desconocido"}
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
          Página {paginaActual} de {Math.ceil(vales.length / valesPorPagina)}
        </span>
        <Button
          onClick={paginaSiguiente}
          disabled={paginaActual === Math.ceil(vales.length / valesPorPagina)}
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
