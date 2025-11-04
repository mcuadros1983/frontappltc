import React, { useState, useEffect, useContext, useCallback } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../context/Contexts";
import * as XLSX from 'xlsx';

export default function Sueldos() {
  const [sueldos, setSueldos] = useState([]);
  const [buscarSucursal, setBuscarSucursal] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [sueldosPorPagina, setSueldosPorPagina] = useState(10);
  const [columnaOrden, setColumnaOrden] = useState(null);
  const [direccionOrden, setDireccionOrden] = useState("asc");
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("");
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
  const [sueldosOriginales, setSueldosOriginales] = useState([]);

  const apiUrl = process.env.REACT_APP_API_URL;
  const contexto = useContext(Contexts.DataContext);

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
          credentials: "include",
        }
      );

      if (respuesta.ok) {
        const datos = await respuesta.json();
        if (datos.length === 0) {
          alert("No existe información para la fecha indicada.");
          return;
        }
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

  const exportarExcel = () => {
    const sueldosParaExportar = sueldos.map((sueldo) => {
      console.log("sueldo", sueldo)
      const sucursalNombre = contexto.sucursalesTabla.find(
        (sucursal) => sucursal.id === parseInt(sueldo.sucursal_id)
      )?.nombre || "Desconocido";

      const empleadoInfo = contexto.empleados.find(
        (empleado) => empleado.empleado.id === parseInt(sueldo.empleado_id)
      );

      // console.log("empleadoinfo", empleadoInfo)
      const empleadoCompleto = empleadoInfo
        ? `${empleadoInfo.empleado.nombre} ${empleadoInfo.empleado.apellido}`
        : "Desconocido";

      // console.log("empleadocompleto", empleadoCompleto)

      return {
        Fecha: sueldo.fecha,
        Importe: parseFloat(sueldo.importe).toFixed(2),
        Sucursal: sucursalNombre,
        Empleado: empleadoCompleto,
        Descripción: sueldo.descripcion,
      };
    });

    const ws = XLSX.utils.json_to_sheet(sueldosParaExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sueldos");
    XLSX.writeFile(wb, "sueldos.xlsx");
  };

 return (
  <Container className="vt-page">
    <h1 className="my-list-title dark-text vt-title">Sueldos</h1>

    {/* Filtros */}
    <div className="vt-toolbar mb-3 d-flex flex-wrap align-items-end gap-3">
      <div className="d-inline-block w-auto mx-2">
        <label className="mr-2">DESDE:</label>
        <input
          type="date"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
          className="form-control rounded-0 text-center vt-input"
        />
      </div>

      <div className="d-inline-block w-auto mx-2">
        <label className="ml-2 mr-2">HASTA:</label>
        <input
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
          className="form-control rounded-0 text-center vt-input"
        />
      </div>

      <div className="d-inline-block">
        <label className="d-block">Sucursal</label>
        <FormControl
          as="select"
          value={buscarSucursal}
          onChange={(e) => setBuscarSucursal(e.target.value)}
          className="vt-input"
          style={{ minWidth: 240 }}
        >
          <option value="">Seleccione una sucursal</option>
          {contexto.sucursalesTabla.map((sucursal) => (
            <option key={sucursal.id} value={sucursal.id}>
              {sucursal.nombre}
            </option>
          ))}
        </FormControl>
      </div>

      <div className="d-inline-block">
        <label className="d-block">Empleado</label>
        <FormControl
          as="select"
          value={empleadoSeleccionado}
          onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
          className="vt-input"
          style={{ minWidth: 280 }}
        >
          <option value="">Seleccione un empleado</option>
          {empleadosFiltrados.map((empleado) => (
            <option key={empleado.id} value={empleado.id}>
              {empleado.nombre} {empleado.apellido}
            </option>
          ))}
        </FormControl>
      </div>

      <div className="d-inline-block mx-2">
        <Button onClick={manejarBusqueda} className="vt-btn">Filtrar</Button>
        <Button onClick={exportarExcel} disabled={sueldos.length === 0} className="vt-btn ms-2">
          Exportar a Excel
        </Button>
      </div>

      <div className="d-inline-block">
        <label className="d-block">Registros por página</label>
        <FormControl
          as="select"
          value={sueldosPorPagina}
          onChange={(e) => setSueldosPorPagina(parseInt(e.target.value))}
          className="vt-input"
          style={{ minWidth: 120 }}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </FormControl>
      </div>
    </div>

    {/* Tabla */}
    <div className="vt-tablewrap table-responsive">
      <Table striped bordered hover className="mb-2">
        <thead>
          <tr>
            <th onClick={() => manejarOrden("fecha")} className="vt-th-sort">Fecha</th>
            <th onClick={() => manejarOrden("importe")} className="vt-th-sort text-end">Importe</th>
            <th onClick={() => manejarOrden("sucursal_id")} className="vt-th-sort">Sucursal</th>
            <th onClick={() => manejarOrden("empleado_id")} className="vt-th-sort">Empleado</th>
            <th onClick={() => manejarOrden("descripcion")} className="vt-th-sort">Descripción</th>
          </tr>
        </thead>
        <tbody>
          {sueldosActuales.map((sueldo) => {
            const empleadoInfo = contexto.empleados.find(
              (empleado) => empleado.empleado.id === parseInt(sueldo.empleado_id)
            );

            return (
              <tr key={sueldo.id}>
                <td>{sueldo.fecha}</td>
                <td className="text-end">{parseFloat(sueldo.importe).toFixed(2)}</td>
                <td>
                  {contexto.sucursalesTabla.find(
                    (sucursal) => sucursal.id === parseInt(sueldo.sucursal_id)
                  )?.nombre || "Desconocido"}
                </td>
                <td>
                  {empleadoInfo?.empleado.nombre || ""}{" "}
                  {empleadoInfo?.empleado.apellido || "Desconocido"}
                </td>
                <td>{sueldo.descripcion}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>

    {/* Paginación */}
    <div className="d-flex justify-content-center align-items-center vt-pager">
      <Button onClick={paginaAnterior} disabled={paginaActual === 1} variant="light">
        <BsChevronLeft />
      </Button>
      <span className="mx-2">
        Página {paginaActual} de {Math.ceil(sueldos.length / sueldosPorPagina)}
      </span>
      <Button
        onClick={paginaSiguiente}
        disabled={paginaActual === Math.ceil(sueldos.length / sueldosPorPagina)}
        variant="light"
      >
        <BsChevronRight />
      </Button>
    </div>
  </Container>
);

}
