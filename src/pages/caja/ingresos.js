import React, { useState, useEffect, useContext,useCallback  } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../context/Contexts";

export default function Ingresos() {
  const [ingresos, setIngresos] = useState([]);
  const [buscarSucursal, setBuscarSucursal] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [ingresosPorPagina] = useState(10);
  const [columnaOrden, setColumnaOrden] = useState(null);
  const [direccionOrden, setDireccionOrden] = useState("asc");
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");
  const [tiposFiltrados, setTiposFiltrados] = useState([]);
  const [ingresosOriginales, setIngresosOriginales] = useState([]);

  const contexto = useContext(Contexts.DataContext);

  const apiUrl = process.env.REACT_APP_API_URL;

  const manejadorFiltroTipoSeleccionado = useCallback(() => {
    if (ingresosOriginales.length > 0) {
      let ingresosFiltrados = [...ingresosOriginales];

      if (tipoSeleccionado) {
        ingresosFiltrados = ingresosFiltrados.filter(
          (ingreso) => parseInt(ingreso.tipodeingreso_id) === parseInt(tipoSeleccionado)
        );
      }

      setIngresos(ingresosFiltrados);
      setPaginaActual(1);
    }
  }, [ingresosOriginales, tipoSeleccionado]);  // Incluir todas las dependencias relevantes

  useEffect(() => {
    manejadorFiltroTipoSeleccionado();
  }, [tipoSeleccionado, manejadorFiltroTipoSeleccionado]);  // Ahora incluye manejadorFiltroTipoSeleccionado en las dependencias


  const manejarFiltro = async () => {
    // console.log("tipodeingreso", contexto.tipoDeIngresoTabla)
    
    try {
      if (!esFechaValida(fechaDesde) || !esFechaValida(fechaHasta)) {
        alert("Ingrese una fecha válida.");
        return;
      }

      const respuesta = await fetch(
        `${apiUrl}/caja/ingresos_filtrados`,
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
          alert("No existe informacion para la fecha indicada.");
          ;
          return;
        }
        setIngresos(datos);
        setIngresosOriginales(datos);
        setPaginaActual(1);
        setTipoSeleccionado("");

        const tipos = datos.map((ingreso) => parseInt(ingreso.tipodeingreso_id));
        const tiposUnicos = [...new Set(tipos)];
        const tiposFiltrados = contexto.tipoDeIngresoTabla.filter((tipo) =>
          tiposUnicos.includes(tipo.id)
        );

        setTiposFiltrados(tiposFiltrados);
      } else {
        throw new Error("Error al obtener los ingresos");
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

    const ingresosOrdenados = [...ingresos].sort((a, b) => {
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

    setIngresos(ingresosOrdenados);
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

  const indiceUltimoIngreso = paginaActual * ingresosPorPagina;
  const indicePrimerIngreso = indiceUltimoIngreso - ingresosPorPagina;
  const ingresosActuales = ingresos.slice(indicePrimerIngreso, indiceUltimoIngreso);

  // const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);

  const paginaSiguiente = () => {
    if (paginaActual < Math.ceil(ingresos.length / ingresosPorPagina)) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

 return (
  <Container className="vt-page">
    <h1 className="my-list-title dark-text vt-title">Ingresos</h1>

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
        <label className="d-block">Tipo</label>
        <FormControl
          as="select"
          value={tipoSeleccionado}
          onChange={(e) => setTipoSeleccionado(e.target.value)}
          className="vt-input"
          style={{ minWidth: 240 }}
        >
          <option value="">Seleccione un tipo</option>
          {tiposFiltrados.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.descripcion}
            </option>
          ))}
        </FormControl>
      </div>

      <div className="d-inline-block mx-2">
        <Button onClick={manejarBusqueda} className="vt-btn">
          Filtrar
        </Button>
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
            <th onClick={() => manejarOrden("tipodeingreso_id")} className="vt-th-sort">Tipo</th>
            <th onClick={() => manejarOrden("descripcion")} className="vt-th-sort">Descripción</th>
          </tr>
        </thead>
        <tbody>
          {ingresosActuales.map((ingreso) => (
            <tr key={ingreso.id}>
              <td>{ingreso.fecha}</td>
              <td className="text-end">{parseFloat(ingreso.importe).toFixed(2)}</td>
              <td>
                {contexto.sucursalesTabla.find(
                  (sucursal) => sucursal.id === parseInt(ingreso.sucursal_id)
                )?.nombre || "Desconocido"}
              </td>
              <td>
                {contexto.tipoDeIngresoTabla.find(
                  (tipo) => parseInt(tipo.id) === parseInt(ingreso.tipodeingreso_id)
                )?.descripcion || "Desconocido"}
              </td>
              <td>{ingreso.descripcion}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>

    {/* Paginación */}
    <div className="d-flex justify-content-center align-items-center vt-pager">
      <Button onClick={paginaAnterior} disabled={paginaActual === 1} variant="light">
        <BsChevronLeft />
      </Button>
      <span className="mx-2">
        Página {paginaActual} de {Math.ceil(ingresos.length / ingresosPorPagina)}
      </span>
      <Button
        onClick={paginaSiguiente}
        disabled={paginaActual === Math.ceil(ingresos.length / ingresosPorPagina)}
        variant="light"
      >
        <BsChevronRight />
      </Button>
    </div>
  </Container>
);

}
