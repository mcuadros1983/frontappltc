import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Table,
  Button,
  FormControl,
  Spinner,
  Modal,
} from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../context/Contexts";

export default function VentasCtaCte() {
  const [ventas, setVentas] = useState([]);
  const [buscarSucursal, setBuscarSucursal] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [ventasPorPagina] = useState(2000);
  const [columnaOrden, setColumnaOrden] = useState(null);
  const [direccionOrden, setDireccionOrden] = useState("asc");
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [ventasOriginales, setVentasOriginales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalImporte, setTotalImporte] = useState(0);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevaVenta, setNuevaVenta] = useState({
    sucursal_id: "",
    fecha: "",
    importe: "",
    observaciones: "",
  });

  const contexto = useContext(Contexts.dataContext);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    manejadorFiltroClienteSeleccionado();
  }, [clienteSeleccionado]);

  useEffect(() => {
    calcularTotalImporte();
  }, [ventas]);

  const manejadorFiltroClienteSeleccionado = () => {
    if (ventasOriginales.length > 0) {
      let ventasFiltradas = [...ventasOriginales];

      if (clienteSeleccionado) {
        ventasFiltradas = ventasFiltradas.filter(
          (venta) =>
            parseInt(venta.cliente_id) === parseInt(clienteSeleccionado)
        );
      }

      setVentas(ventasFiltradas);
      setPaginaActual(1);
    }
  };

  const manejarFiltro = async () => {
    try {
      setLoading(true);
      setError("");

      if (!esFechaValida(fechaDesde) || !esFechaValida(fechaHasta)) {
        alert("Ingrese una fecha válida.");
        return;
      }

      const respuesta = await fetch(`${apiUrl}/caja/vtasctacte_filtrados`, {
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

      if (respuesta.ok) {
        const datos = await respuesta.json();
        if (datos.length === 0) {
          alert("No existe informacion para la fecha indicada.");
          ;
          return;
        }
        setVentas(datos);
        setVentasOriginales(datos);
        setPaginaActual(1);
        setClienteSeleccionado("");

        const clientes = datos.map((venta) => parseInt(venta.cliente_id));
        const clientesUnicos = [...new Set(clientes)];
        const clientesFiltrados = contexto.clientesTabla
          .filter((cliente) => clientesUnicos.includes(cliente.id))
          .sort((a, b) => a.nombre.localeCompare(b.nombre));

        setClientesFiltrados(clientesFiltrados);
      } else {
        throw new Error(
          "No se encontraron ventas para la sucursal en la fecha especificada"
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

  const calcularTotalImporte = () => {
    const total = ventas.reduce(
      (acc, venta) => acc + parseFloat(venta.importe),
      0
    );
    setTotalImporte(total);
  };

  const indiceUltimaVenta = paginaActual * ventasPorPagina;
  const indicePrimeraVenta = indiceUltimaVenta - ventasPorPagina;
  const ventasActuales = ventas.slice(indicePrimeraVenta, indiceUltimaVenta);

  // const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);

  const paginaSiguiente = () => {
    if (paginaActual < Math.ceil(ventas.length / ventasPorPagina)) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  const manejarCambioNuevaVenta = (e) => {
    const { name, value } = e.target;
    setNuevaVenta({ ...nuevaVenta, [name]: value });
  };

  const manejarCerrarModal = () => {
    setMostrarModal(false);
    setNuevaVenta({
      sucursal_id: "",
      fecha: "",
      importe: "",
      observaciones: "",
    });
  };

  const manejarAjuste = async () => {
    try {
      setLoading(true);
      setError("");

      const respuesta = await fetch(`${apiUrl}/caja/vtasctacte`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            ...nuevaVenta,
            cliente_id: clienteSeleccionado,
            // vtactacteId:null,
          },
        ]),
      });

      if (respuesta.ok) {
        const ventaCreada = await respuesta.json();
        setVentasOriginales([...ventasOriginales, ...ventaCreada]);
        setVentas([...ventas, ...ventaCreada]);
        manejarCerrarModal();
        calcularTotalImporte();
        setClienteSeleccionado(clienteSeleccionado);
        // manejadorFiltroClienteSeleccionado();
      } else {
        throw new Error("Error al crear la venta");
        
      }
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h1 className="my-list-title dark-text">Ventas Cuenta Corriente</h1>

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
        <Button
          onClick={() => setMostrarModal(true)}
          disabled={!clienteSeleccionado}
          className="ml-2"
        >
          Ajuste
        </Button>
      </div>

      {error && <div>{error}</div>}

      {ventas.length === 0 && !loading && !error && (
        <div>
          No se encontraron ventas para la sucursal en la fecha especificada
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          Página {paginaActual} de {Math.ceil(ventas.length / ventasPorPagina)}
        </div>
        <div>Total Importe: {totalImporte.toFixed(3)}</div>
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
              onClick={() => manejarOrden("cliente_id")}
              style={{ cursor: "pointer" }}
            >
              Cliente
            </th>
            <th
              onClick={() => manejarOrden("observaciones")}
              style={{ cursor: "pointer" }}
            >
              Observaciones
            </th>
          </tr>
        </thead>
        <tbody>
          {ventasActuales.map((venta) => {
            return (
              <tr key={venta.id}>
                <td>{venta.fecha}</td>
                <td>{parseFloat(venta.importe).toFixed(3)}</td>
                <td>
                  {contexto.sucursalesTabla.find(
                    (sucursal) => sucursal.id === parseInt(venta.sucursal_id)
                  )?.nombre || "Desconocido"}
                </td>
                <td>
                  {clientesFiltrados.find(
                    (cliente) => cliente.id === parseInt(venta.cliente_id)
                  )
                    ? `${
                        clientesFiltrados.find(
                          (cliente) => cliente.id === parseInt(venta.cliente_id)
                        ).nombre
                      } ${
                        clientesFiltrados.find(
                          (cliente) => cliente.id === parseInt(venta.cliente_id)
                        ).apellido
                      }`
                    : "Desconocido"}
                </td>
                <td>{venta.observaciones}</td>
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
          Página {paginaActual} de {Math.ceil(ventas.length / ventasPorPagina)}
        </span>
        <Button
          onClick={paginaSiguiente}
          disabled={paginaActual === Math.ceil(ventas.length / ventasPorPagina)}
        >
          <BsChevronRight />
        </Button>
      </div>

      <Modal show={mostrarModal} onHide={manejarCerrarModal}>
        <Modal.Header closeButton>
          <Modal.Title>Ajuste de Venta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormControl
            as="select"
            name="sucursal_id"
            value={nuevaVenta.sucursal_id}
            onChange={manejarCambioNuevaVenta}
            className="mb-3"
          >
            <option value="">Seleccione una sucursal</option>
            {contexto.sucursalesTabla.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>
                {sucursal.nombre}
              </option>
            ))}
          </FormControl>
          <input
            type="date"
            name="fecha"
            value={nuevaVenta.fecha}
            onChange={manejarCambioNuevaVenta}
            className="form-control mb-3"
          />
          <input
            type="number"
            name="importe"
            placeholder="Importe"
            value={nuevaVenta.importe}
            onChange={manejarCambioNuevaVenta}
            className="form-control mb-3"
          />
          <input
            type="text"
            name="observaciones"
            placeholder="Observaciones"
            value={nuevaVenta.observaciones}
            onChange={manejarCambioNuevaVenta}
            className="form-control mb-3"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={manejarCerrarModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={manejarAjuste}>
            Grabar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
