import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { Container, Table, Button, FormControl, Spinner, Row, Col, Card } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../context/Contexts";

export default function Cupones() {
  const [cupones, setCupones] = useState([]);
  const [buscarSucursal, setBuscarSucursal] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [cuponesPorPagina] = useState(10);
  const [columnaOrden, setColumnaOrden] = useState(null);
  const [direccionOrden, setDireccionOrden] = useState("asc");
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [cuponesOriginales, setCuponesOriginales] = useState([]);
  const [cargando, setCargando] = useState(false);

  const contexto = useContext(Contexts.DataContext);
  const apiUrl = process.env.REACT_APP_API_URL;

  const manejadorFiltroClienteSeleccionado = useCallback(() => {
    if (cuponesOriginales.length > 0) {
      let cuponesFiltrados = [...cuponesOriginales];

      if (clienteSeleccionado) {
        cuponesFiltrados = cuponesFiltrados.filter(
          (cupon) => parseInt(cupon.cliente_id) === parseInt(clienteSeleccionado)
        );
      }

      setCupones(cuponesFiltrados);
      setPaginaActual(1);
    }
  }, [cuponesOriginales, clienteSeleccionado]);

  useEffect(() => {
    manejadorFiltroClienteSeleccionado();
  }, [clienteSeleccionado, manejadorFiltroClienteSeleccionado]);

  const manejarFiltro = async () => {
    try {
      setCargando(true);
      if (!esFechaValida(fechaDesde) || !esFechaValida(fechaHasta)) {
        alert("Ingrese una fecha válida.");
        setCargando(false);
        return;
      }

      const respuesta = await fetch(`${apiUrl}/caja/cupones_filtrados`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fechaDesde,
          fechaHasta,
          sucursalId: buscarSucursal,
        }),
        credentials: "include",
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        if (datos.length === 0) {
          alert("No existe información para la fecha indicada.");
        } else {
          setCupones(datos);
          setCuponesOriginales(datos);
          setClienteSeleccionado("");
          const clientes = datos.map((cupon) => parseInt(cupon.cliente_id));
          const clientesUnicos = [...new Set(clientes)];
          const _clientesFiltrados = contexto.clientesTabla.filter((cliente) =>
            clientesUnicos.includes(cliente.id)
          );
          setClientesFiltrados(_clientesFiltrados);
        }
      } else {
        throw new Error("Error al obtener los cupones");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const manejarOrden = (nombreColumna) => {
    setDireccionOrden(
      nombreColumna === columnaOrden && direccionOrden === "asc" ? "desc" : "asc"
    );
    setColumnaOrden(nombreColumna);

    const cuponesOrdenados = [...cupones].sort((a, b) => {
      let valorA = a[nombreColumna];
      let valorB = b[nombreColumna];

      if (nombreColumna === "importecupon") {
        valorA = parseFloat(valorA);
        valorB = parseFloat(valorB);
      }

      if (valorA < valorB) return direccionOrden === "asc" ? -1 : 1;
      if (valorA > valorB) return direccionOrden === "asc" ? 1 : -1;
      return 0;
    });

    setCupones(cuponesOrdenados);
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

  // ====== TOTALES (sobre lo filtrado en `cupones`) ======
  const { totalImporte, totalRecargo, totalConRecargo, cantidad } = useMemo(() => {
    let _totalImporte = 0;
    let _totalConRecargo = 0;

    for (const c of cupones) {
      const importe = Number(c?.importecupon) || 0;
      const conRecargo =
        Number(c?.importecuponconrecargo) ||
        importe; // si no viene, tomamos el importe base
      _totalImporte += importe;
      _totalConRecargo += conRecargo;
    }

    const _totalRecargo = _totalConRecargo - _totalImporte;

    return {
      totalImporte: _totalImporte,
      totalConRecargo: _totalConRecargo,
      totalRecargo: _totalRecargo,
      cantidad: cupones.length,
    };
  }, [cupones]);

  const formatMoney = (n) =>
    (Number(n) || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ====== Paginación (se mantiene paginando la vista, no los totales) ======
  const indiceUltimoCupon = paginaActual * cuponesPorPagina;
  const indicePrimerCupon = indiceUltimoCupon - cuponesPorPagina;
  const cuponesActuales = cupones.slice(indicePrimerCupon, indiceUltimoCupon);

  const paginaSiguiente = () => {
    if (paginaActual < Math.ceil(cupones.length / cuponesPorPagina)) {
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
    <h1 className="my-list-title dark-text vt-title">Cupones</h1>

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
        <label className="d-block">Cliente</label>
        <FormControl
          as="select"
          value={clienteSeleccionado}
          onChange={(e) => setClienteSeleccionado(e.target.value)}
          className="vt-input"
          style={{ minWidth: 280 }}
        >
          <option value="">Seleccione un cliente</option>
          {clientesFiltrados.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nombre} {cliente.apellido}
            </option>
          ))}
        </FormControl>
      </div>

      <div className="d-inline-block mx-2">
        <Button onClick={manejarBusqueda} disabled={cargando} className="vt-btn">
          {cargando ? (
            <span>
              Cargando… <Spinner as="span" animation="border" size="sm" />
            </span>
          ) : (
            "Filtrar"
          )}
        </Button>
      </div>
    </div>

    {/* Totales */}
    <Card className="mb-3 vt-card">
      <Card.Body>
        <Row className="gy-2">
          <Col md={3} sm={6} xs={12}>
            <strong>Cantidad:</strong> {cantidad}
          </Col>
          <Col md={3} sm={6} xs={12}>
            <strong>Total Importe:</strong> ${formatMoney(totalImporte)}
          </Col>
          <Col md={3} sm={6} xs={12}>
            <strong>Total Recargo:</strong> ${formatMoney(totalRecargo)}
          </Col>
          <Col md={3} sm={6} xs={12}>
            <strong>Total c/ Recargo:</strong> ${formatMoney(totalConRecargo)}
          </Col>
        </Row>
      </Card.Body>
    </Card>

    {/* Tabla */}
    <div className="vt-tablewrap table-responsive">
      <Table striped bordered hover className="mb-2">
        <thead>
          <tr>
            <th onClick={() => manejarOrden("fecha")} className="vt-th-sort">Fecha</th>
            <th onClick={() => manejarOrden("importecupon")} className="vt-th-sort text-end">Importe</th>
            <th onClick={() => manejarOrden("sucursal_id")} className="vt-th-sort">Sucursal</th>
            <th onClick={() => manejarOrden("cliente_id")} className="vt-th-sort">Cliente</th>
            <th onClick={() => manejarOrden("caja_id")} className="vt-th-sort">Caja</th>
            <th onClick={() => manejarOrden("recargo")} className="vt-th-sort text-end">Recargo</th>
            <th onClick={() => manejarOrden("lote")} className="vt-th-sort">Lote</th>
            <th onClick={() => manejarOrden("cupon")} className="vt-th-sort">Cupon</th>
            <th onClick={() => manejarOrden("plan")} className="vt-th-sort">Plan</th>
          </tr>
        </thead>
        <tbody>
          {cuponesActuales.map((cupon) => (
            <tr key={cupon.id}>
              <td>{cupon.fecha}</td>
              <td className="text-end">{(Number(cupon.importecupon) || 0).toFixed(2)}</td>
              <td>
                {contexto.sucursalesTabla.find((s) => s.id === parseInt(cupon.sucursal_id))?.nombre ||
                  "Desconocido"}
              </td>
              <td>
                {contexto.clientesTabla.find((c) => c.id === parseInt(cupon.cliente_id))?.nombre || ""}{" "}
                {contexto.clientesTabla.find((c) => c.id === parseInt(cupon.cliente_id))?.apellido ||
                  "Desconocido"}
              </td>
              <td>{cupon.caja_id}</td>
              <td className="text-end">
                {(
                  (Number(cupon.importecuponconrecargo) || Number(cupon.importecupon) || 0) -
                  (Number(cupon.importecupon) || 0)
                ).toFixed(2)}
              </td>
              <td>{cupon.lote}</td>
              <td>{cupon.nrocupon}</td>
              <td>
                {contexto.planTarjetaTabla.find((plan) => plan.id === parseInt(cupon.plantarjeta_id))
                  ?.descripcion || "Desconocido"}
              </td>
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
        Página {paginaActual} de {Math.ceil(cupones.length / cuponesPorPagina)}
      </span>
      <Button
        onClick={paginaSiguiente}
        disabled={paginaActual === Math.ceil(cupones.length / cuponesPorPagina)}
        variant="light"
      >
        <BsChevronRight />
      </Button>
    </div>
  </Container>
);

}
