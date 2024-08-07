import React, { useState, useEffect, useContext, useCallback } from "react";
import { Container, Table, Button, FormControl, Form } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../context/Contexts";
import * as XLSX from 'xlsx';

export default function Vales() {
  const [vales, setVales] = useState([]);
  const [buscarSucursal, setBuscarSucursal] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [valesPorPagina, setValesPorPagina] = useState(10);
  const [columnaOrden, setColumnaOrden] = useState(null);
  const [direccionOrden, setDireccionOrden] = useState("asc");
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [valesOriginales, setValesOriginales] = useState([]);

  const contexto = useContext(Contexts.DataContext);

  const apiUrl = process.env.REACT_APP_API_URL;

  const manejadorFiltroClienteSeleccionado = useCallback(() => {
    let valesFiltrados = [...valesOriginales];
    if (clienteSeleccionado) {
      valesFiltrados = valesFiltrados.filter(
        (vale) => parseInt(vale.cliente_id) === parseInt(clienteSeleccionado)
      );
    }
    setVales(valesFiltrados);
    setPaginaActual(1);
  }, [clienteSeleccionado, valesOriginales]);

  useEffect(() => {
    manejadorFiltroClienteSeleccionado();
  }, [manejadorFiltroClienteSeleccionado]);

  const manejarFiltro = async () => {
    try {
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
          alert("No existe información para la fecha indicada.");
          return;
        }
        setVales(datos);
        setValesOriginales(datos);
        setPaginaActual(1);
        setClienteSeleccionado("");

        const clientes = datos.map((vale) => parseInt(vale.cliente_id));
        const clientesUnicos = [...new Set(clientes)];

        const clientesFiltrados = contexto.clientesTabla.filter((cliente) =>
          clientesUnicos.includes(cliente.id)
        );

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
    if (!cadenaFecha.match(regEx)) return false;
    const fecha = new Date(cadenaFecha);
    if (!fecha.getTime()) return false;
    return fecha.toISOString().slice(0, 10) === cadenaFecha;
  };

  const manejarBusqueda = () => {
    manejarFiltro();
  };

  const indiceUltimoVale = paginaActual * valesPorPagina;
  const indicePrimerVale = indiceUltimoVale - valesPorPagina;
  const valesActuales = vales.slice(indicePrimerVale, indiceUltimoVale);

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

  const exportarExcel = () => {
    const valesParaExportar = vales.map((vale) => {
      const sucursalNombre = contexto.sucursalesTabla.find(
        (sucursal) => sucursal.id === parseInt(vale.sucursal_id)
      )?.nombre || "Desconocido";

      const clienteNombre = contexto.clientesTabla.find(
        (cliente) => cliente.id === parseInt(vale.cliente_id)
      );
      const clienteCompleto = clienteNombre
        ? `${clienteNombre.nombre} ${clienteNombre.apellido}`
        : "Desconocido";

      return {
        Fecha: vale.fecha,
        Importe: vale.importecupon,
        Sucursal: sucursalNombre,
        Cliente: clienteCompleto,
      };
    });

    const ws = XLSX.utils.json_to_sheet(valesParaExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vales");
    XLSX.writeFile(wb, "vales.xlsx");
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
        <Button onClick={manejarBusqueda} className="mr-2">Filtrar</Button>
        <Button onClick={exportarExcel} disabled={vales.length === 0}>Exportar a Excel</Button>
      </div>

      <div className="mb-3">
        <FormControl
          as="select"
          value={valesPorPagina}
          onChange={(e) => setValesPorPagina(parseInt(e.target.value))}
          className="mr-2"
          style={{ width: "10%" }}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </FormControl>
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
            const sucursalNombre = contexto.sucursalesTabla.find(
              (sucursal) => sucursal.id === parseInt(vale.sucursal_id)
            )?.nombre || "Desconocido";

            const clienteNombre = contexto.clientesTabla.find(
              (cliente) => cliente.id === parseInt(vale.cliente_id)
            );
            const clienteCompleto = clienteNombre
              ? `${clienteNombre.nombre} ${clienteNombre.apellido}`
              : "Desconocido";

            return (
              <tr key={vale.id}>
                <td>{vale.fecha}</td>
                <td>{vale.importecupon}</td>
                <td>{sucursalNombre}</td>
                <td>{clienteCompleto}</td>
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

