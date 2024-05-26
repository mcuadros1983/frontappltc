import React, { useState, useEffect, useContext,useCallback } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../context/Contexts";

export default function Sueldos() {
  const [sueldos, setSueldos] = useState([]);
  const [buscarSucursal, setBuscarSucursal] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [sueldosPorPagina] = useState(10);
  const [columnaOrden, setColumnaOrden] = useState(null);
  const [direccionOrden, setDireccionOrden] = useState("asc");
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("");
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
  const [sueldosOriginales, setSueldosOriginales] = useState([]);

  const apiUrl = process.env.REACT_APP_API_URL;

  const contexto = useContext(Contexts.DataContext);

    // Envolver la lógica del filtro en useCallback
    const manejadorFiltroEmpleadoSeleccionado = useCallback(() => {
      let sueldosFiltrados = [...sueldosOriginales];
      if (empleadoSeleccionado) {
        sueldosFiltrados = sueldosFiltrados.filter(
          (sueldo) => parseInt(sueldo.empleado_id) === parseInt(empleadoSeleccionado)
        );
      }
      setSueldos(sueldosFiltrados);
      setPaginaActual(1);
    }, [empleadoSeleccionado, sueldosOriginales]);
  
    useEffect(() => {
      manejadorFiltroEmpleadoSeleccionado();
    }, [manejadorFiltroEmpleadoSeleccionado]);

  const manejarFiltro = async () => {
    try {
      if (!esFechaValida(fechaDesde) || !esFechaValida(fechaHasta)) {
        alert("Ingrese una fecha válida.");
        return;
      }

      const respuesta = await fetch(
        `${apiUrl}/caja/sueldos_filtrados`,
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

        // console.log("sueldos", datos)
        setSueldos(datos);
        setSueldosOriginales(datos);
        setPaginaActual(1);
        setEmpleadoSeleccionado("");

        const empleados = datos.map((sueldo) => parseInt(sueldo.empleado_id));
        const empleadosUnicos = [...new Set(empleados)];
        const empleadosFiltrados = contexto.empleados.filter((empleado) =>
          empleadosUnicos.includes(empleado.id)
        );

        setEmpleadosFiltrados(empleadosFiltrados);
      } else {
        throw new Error("Error al obtener los sueldos");
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

    const sueldosOrdenados = [...sueldos].sort((a, b) => {
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

    setSueldos(sueldosOrdenados);
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

  const indiceUltimoSueldo = paginaActual * sueldosPorPagina;
  const indicePrimerSueldo = indiceUltimoSueldo - sueldosPorPagina;
  const sueldosActuales = sueldos.slice(indicePrimerSueldo, indiceUltimoSueldo);

  // const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);

  const paginaSiguiente = () => {
    if (paginaActual < Math.ceil(sueldos.length / sueldosPorPagina)) {
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
      <h1 className="my-list-title dark-text">Sueldos</h1>

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
          value={empleadoSeleccionado}
          onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
          className="mr-2 mb-3"
          style={{ width: "25%" }}
        >
          <option value="">Seleccione un empleado</option>
          {empleadosFiltrados.map((empleado) => (
            <option key={empleado.id} value={empleado.id}>
              {empleado.nombre} {empleado.apellido}
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
              onClick={() => manejarOrden("sucursal_id")}
              style={{ cursor: "pointer" }}
            >
              Sucursal
            </th>
            <th
              onClick={() => manejarOrden("empleado_id")}
              style={{ cursor: "pointer" }}
            >
              Empleado
            </th>
            <th
              onClick={() => manejarOrden("descripcion")}
              style={{ cursor: "pointer" }}
            >
              Descripción
            </th>
          </tr>
        </thead>
        <tbody>
          {sueldosActuales.map((sueldo) => {
            const empleadoInfo = contexto.empleados.find(
              (empleado) => empleado.empleado.id === parseInt(sueldo.empleado_id)
            );

            // const fecha = new Date(sueldo.fecha);
            // const dia = fecha.getDate();
            // const mes = fecha.getMonth() + 1;
            // const anio = fecha.getFullYear();
            // const fechaFormateada = `${dia}/${mes}/${anio}`;

            return (
              <tr key={sueldo.id}>
                <td>{sueldo.fecha}</td>
                <td>{parseFloat(sueldo.importe).toFixed(2)}</td>
                <td>
                  {contexto.sucursalesTabla.find(
                    (sucursal) => sucursal.id === parseInt(sueldo.sucursal_id)
                  )?.nombre || "Desconocido"}
                </td>
                <td>
                  {empleadoInfo?.empleado.nombre || ""} &nbsp;
                  {empleadoInfo?.empleado.apellido || "Desconocido"}
                </td>
                <td>{sueldo.descripcion}</td>
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
          {Math.ceil(sueldos.length / sueldosPorPagina)}
        </span>
        <Button
          onClick={paginaSiguiente}
          disabled={
            paginaActual === Math.ceil(sueldos.length / sueldosPorPagina)
          }
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
