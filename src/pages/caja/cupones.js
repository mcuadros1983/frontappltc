import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { Container, Table, Button, FormControl, Spinner, Row, Col, Card } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import * as XLSX from "xlsx";
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

  const esFechaValida = (cadenaFecha) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!cadenaFecha.match(regEx)) return false;
    const fecha = new Date(cadenaFecha);
    if (!fecha.getTime()) return false;
    return fecha.toISOString().slice(0, 10) === cadenaFecha;
  };

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
          const _clientesFiltrados = (contexto?.clientesTabla || []).filter((cliente) =>
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
    const nuevaDireccion =
      nombreColumna === columnaOrden && direccionOrden === "asc" ? "desc" : "asc";
    setDireccionOrden(nuevaDireccion);
    setColumnaOrden(nombreColumna);

    const cuponesOrdenados = [...cupones].sort((a, b) => {
      let valorA = a[nombreColumna];
      let valorB = b[nombreColumna];

      if (nombreColumna === "importecupon") {
        valorA = parseFloat(valorA);
        valorB = parseFloat(valorB);
      }

      if (valorA < valorB) return nuevaDireccion === "asc" ? -1 : 1;
      if (valorA > valorB) return nuevaDireccion === "asc" ? 1 : -1;
      return 0;
    });

    setCupones(cuponesOrdenados);
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
      const conRecargo = Number(c?.importecuponconrecargo) || importe;
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

  // ====== Exportar a Excel (xlsx) ======
  const exportarExcel = () => {
    if (!cupones || cupones.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const headers = [
      "Fecha",
      "Importe",
      "Sucursal",
      "Cliente",
      "Caja",
      "Recargo",
      "Lote",
      "Cupon",
      "Plan",
    ];

    const rows = cupones.map((cupon) => {
      const sucursalNombre =
        (contexto?.sucursalesTabla || []).find(
          (s) => s.id === parseInt(cupon.sucursal_id)
        )?.nombre || "Desconocido";

      const clienteObj = (contexto?.clientesTabla || []).find(
        (c) => c.id === parseInt(cupon.cliente_id)
      );
      const clienteNombre = `${clienteObj?.nombre || ""} ${clienteObj?.apellido || "Desconocido"}`.trim();

      const recargo =
        (Number(cupon.importecuponconrecargo) || Number(cupon.importecupon) || 0) -
        (Number(cupon.importecupon) || 0);

      const planDesc =
        (contexto?.planTarjetaTabla || []).find(
          (p) => p.id === parseInt(cupon.plantarjeta_id)
        )?.descripcion || "Desconocido";

      return [
        cupon.fecha,
        Number(cupon.importecupon) || 0,
        sucursalNombre,
        clienteNombre,
        cupon.caja_id ?? "",
        Number(recargo) || 0,
        cupon.lote ?? "",
        cupon.nrocupon ?? "",
        planDesc,
      ];
    });

    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Auto-filtro y anchos
    const lastRow = data.length;
    const lastCol = headers.length - 1;
    const colLetter = (n) => {
      let s = "";
      while (n >= 0) {
        s = String.fromCharCode((n % 26) + 65) + s;
        n = Math.floor(n / 26) - 1;
      }
      return s;
    };
    ws["!autofilter"] = { ref: `A1:${colLetter(lastCol)}${lastRow}` };
    ws["!cols"] = [
      { wch: 12 }, // Fecha
      { wch: 12 }, // Importe
      { wch: 18 }, // Sucursal
      { wch: 24 }, // Cliente
      { wch: 8 },  // Caja
      { wch: 12 }, // Recargo
      { wch: 12 }, // Lote
      { wch: 14 }, // Cupon
      { wch: 20 }, // Plan
    ];

    // Tipos numéricos (para que Excel los trate como números)
    for (let r = 2; r <= lastRow; r++) {
      if (ws[`B${r}`]) ws[`B${r}`].t = "n"; // Importe
      if (ws[`F${r}`]) ws[`F${r}`].t = "n"; // Recargo
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cupones");

    const rango =
      fechaDesde && fechaHasta
        ? `_${fechaDesde}_a_${fechaHasta}`
        : `_${new Date().toISOString().slice(0, 10)}`;
    XLSX.writeFile(wb, `cupones_filtrados${rango}.xlsx`);
  };

  return (
    <Container>
      <h1 className="my-list-title dark-text">Cupones</h1>

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
          {(contexto?.sucursalesTabla || []).map((sucursal) => (
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

      <div className="mb-3 d-flex align-items-center gap-2">
        <Button onClick={manejarBusqueda} disabled={cargando} className="me-2">
          {cargando ? (
            <span>
              Cargando... <Spinner as="span" animation="border" size="sm" />
            </span>
          ) : (
            "Filtrar"
          )}
        </Button>

        <Button
          variant="success"
          onClick={exportarExcel}
          disabled={cargando || cupones.length === 0}
        >
          Exportar a Excel
        </Button>
      </div>

      {/* ====== BLOQUE DE TOTALES (Arriba de la tabla) ====== */}
      <Card className="mb-3">
        <Card.Body>
          <Row>
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

      <Table striped bordered hover>
        <thead>
          <tr>
            <th onClick={() => manejarOrden("fecha")} style={{ cursor: "pointer" }}>
              Fecha
            </th>
            <th onClick={() => manejarOrden("importecupon")} style={{ cursor: "pointer" }}>
              Importe
            </th>
            <th onClick={() => manejarOrden("sucursal_id")} style={{ cursor: "pointer" }}>
              Sucursal
            </th>
            <th onClick={() => manejarOrden("cliente_id")} style={{ cursor: "pointer" }}>
              Cliente
            </th>
            <th onClick={() => manejarOrden("caja_id")} style={{ cursor: "pointer" }}>
              Caja
            </th>
            <th onClick={() => manejarOrden("recargo")} style={{ cursor: "pointer" }}>
              Recargo
            </th>
            <th onClick={() => manejarOrden("lote")} style={{ cursor: "pointer" }}>
              Lote
            </th>
            <th onClick={() => manejarOrden("cupon")} style={{ cursor: "pointer" }}>
              Cupon
            </th>
            <th onClick={() => manejarOrden("plan")} style={{ cursor: "pointer" }}>
              Plan
            </th>
          </tr>
        </thead>
        <tbody>
          {cuponesActuales.map((cupon) => (
            <tr key={cupon.id}>
              <td>{cupon.fecha}</td>
              <td>{(Number(cupon.importecupon) || 0).toFixed(2)}</td>
              <td>
                {(contexto?.sucursalesTabla || []).find(
                  (sucursal) => sucursal.id === parseInt(cupon.sucursal_id)
                )?.nombre || "Desconocido"}
              </td>
              <td>
                {(contexto?.clientesTabla || []).find(
                  (cliente) => cliente.id === parseInt(cupon.cliente_id)
                )?.nombre || ""}{" "}
                {(contexto?.clientesTabla || []).find(
                  (cliente) => cliente.id === parseInt(cupon.cliente_id)
                )?.apellido || "Desconocido"}
              </td>
              <td>{cupon.caja_id}</td>
              <td>
                {(
                  (Number(cupon.importecuponconrecargo) || Number(cupon.importecupon) || 0) -
                  (Number(cupon.importecupon) || 0)
                ).toFixed(2)}
              </td>
              <td>{cupon.lote}</td>
              <td>{cupon.nrocupon}</td>
              <td>
                {(contexto?.planTarjetaTabla || []).find(
                  (plan) => plan.id === parseInt(cupon.plantarjeta_id)
                )?.descripcion || "Desconocido"}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-center align-items-center">
        <Button onClick={paginaAnterior} disabled={paginaActual === 1}>
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {paginaActual} de {Math.ceil(cupones.length / cuponesPorPagina)}
        </span>
        <Button
          onClick={paginaSiguiente}
          disabled={paginaActual === Math.ceil(cupones.length / cuponesPorPagina)}
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
