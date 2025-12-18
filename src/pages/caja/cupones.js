import React, { useState, useEffect, useContext, useCallback, useMemo, useRef } from "react";
import { Container, Table, Button, FormControl, Spinner, Row, Col, Card, Dropdown, FormCheck } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Contexts from "../../context/Contexts";

/** --------- Dropdown compacto con checkboxes que luce como un select --------- */
function MultiSelectPlanes({ options, value = [], onChange, placeholder = "Planes" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Cierra al clickear fuera
  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const toggle = () => setOpen((o) => !o);

  const allSelected = value.length === options.length && options.length > 0;

  const handleToggleItem = (id) => {
    const strId = String(id);
    if (value.includes(strId)) {
      onChange(value.filter((v) => v !== strId));
    } else {
      onChange([...value, strId]);
    }
  };

  const handleSelectAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(options.map((o) => String(o.id)));
    }
  };

  // Texto compacto
  let label = placeholder;
  if (value.length === 1) {
    const sel = options.find((o) => String(o.id) === value[0]);
    label = sel?.descripcion || placeholder;
  } else if (value.length > 1) {
    label = `${value.length} seleccionados`;
  }

  return (
    <div ref={ref} style={{ position: "relative", minWidth: 280 }}>
      {/* Toggle con estilo de form-select para que luzca igual a los otros */}
      <button
        type="button"
        className="form-select vt-input d-flex align-items-center justify-content-between"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{ height: 38, paddingRight: 30 }}
      >
        <span className="text-truncate">{label}</span>
        <span style={{ position: "absolute", right: 10, pointerEvents: "none" }}>▾</span>
      </button>

      {/* Menu */}
      {open && (
        <div
          role="listbox"
          className="dropdown-menu show p-2"
          style={{
            width: "100%",
            maxHeight: 260,
            overflow: "auto",
            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2 px-1">
            <strong style={{ fontSize: 13 }}>Planes</strong>
            <Button
              size="sm"
              variant={allSelected ? "outline-secondary" : "outline-primary"}
              onClick={handleSelectAll}
            >
              {allSelected ? "Limpiar" : "Seleccionar todos"}
            </Button>
          </div>

          {options.length === 0 ? (
            <div className="text-muted px-1" style={{ fontSize: 13 }}>
              No hay planes disponibles
            </div>
          ) : (
            options.map((opt) => {
              const checked = value.includes(String(opt.id));
              return (
                <button
                  key={opt.id}
                  type="button"
                  className="dropdown-item d-flex align-items-center"
                  onClick={() => handleToggleItem(opt.id)}
                  style={{ gap: 8 }}
                >
                  <FormCheck checked={checked} readOnly />
                  <span className="text-truncate">{opt.descripcion}</span>
                </button>
              );
            })
          )}

          <div className="d-flex justify-content-end mt-2">
            <Button size="sm" variant="primary" onClick={() => setOpen(false)}>
              Listo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [planesFiltrados, setPlanesFiltrados] = useState([]);
  const [planesSeleccionados, setPlanesSeleccionados] = useState([]); // multiselección compacta
  const [cuponesOriginales, setCuponesOriginales] = useState([]);
  const [cargando, setCargando] = useState(false);

  const fmtMoney = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";
  try {
    return num.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
  } catch {
    return `$${num.toFixed(2)}`;
  }
};

  const contexto = useContext(Contexts.DataContext);
  const apiUrl = process.env.REACT_APP_API_URL;

  const esFechaValida = (cadenaFecha) =>
    /^\d{4}-\d{2}-\d{2}$/.test(cadenaFecha) &&
    new Date(cadenaFecha).toISOString().slice(0, 10) === cadenaFecha;

  // Filtros en frontend (cliente + planes)
  const aplicarFiltrosFront = useCallback(() => {
    if (!cuponesOriginales.length) return;

    let lista = [...cuponesOriginales];

    if (clienteSeleccionado) {
      const selId = parseInt(clienteSeleccionado, 10);
      lista = lista.filter((c) => parseInt(c.cliente_id, 10) === selId);
    }

    if (planesSeleccionados.length > 0) {
      const planesInt = planesSeleccionados.map((v) => parseInt(v, 10));
      lista = lista.filter((c) => planesInt.includes(parseInt(c.plantarjeta_id, 10)));
    }

    setCupones(lista);
    setPaginaActual(1);
  }, [cuponesOriginales, clienteSeleccionado, planesSeleccionados]);

  useEffect(() => {
    aplicarFiltrosFront();
  }, [clienteSeleccionado, planesSeleccionados, aplicarFiltrosFront]);

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
        body: JSON.stringify({ fechaDesde, fechaHasta, sucursalId: buscarSucursal }),
        credentials: "include",
      });

      if (!respuesta.ok) throw new Error("Error al obtener los cupones");

      const datos = await respuesta.json();
      if (!Array.isArray(datos) || datos.length === 0) {
        alert("No existe información para la fecha indicada.");
        setCupones([]);
        setCuponesOriginales([]);
        setClientesFiltrados([]);
        setPlanesFiltrados([]);
        setClienteSeleccionado("");
        setPlanesSeleccionados([]);
        return;
      }

      setCupones(datos);
      setCuponesOriginales(datos);
      setClienteSeleccionado("");
      setPlanesSeleccionados([]);

      // clientes presentes en la data
      const clientesUnicos = [...new Set(datos.map((c) => parseInt(c.cliente_id, 10)))];
      setClientesFiltrados(
        contexto.clientesTabla.filter((cl) => clientesUnicos.includes(cl.id))
      );

      // planes presentes en la data
      const planesUnicos = [...new Set(datos.map((c) => parseInt(c.plantarjeta_id, 10)))];
      setPlanesFiltrados(
        contexto.planTarjetaTabla
          .filter((pl) => planesUnicos.includes(pl.id))
          .sort((a, b) => (a.descripcion || "").localeCompare(b.descripcion || ""))
      );
    } catch (e) {
      console.error(e);
      alert("Ocurrió un error al obtener los cupones.");
    } finally {
      setCargando(false);
    }
  };

  const manejarOrden = (nombreColumna) => {
    const nextDirection =
      nombreColumna === columnaOrden && direccionOrden === "asc" ? "desc" : "asc";
    setDireccionOrden(nextDirection);
    setColumnaOrden(nombreColumna);

    const cuponesOrdenados = [...cupones].sort((a, b) => {
      let valorA = a[nombreColumna];
      let valorB = b[nombreColumna];
      if (nombreColumna === "importecupon" || nombreColumna === "importecuponconrecargo") {
        valorA = parseFloat(valorA);
        valorB = parseFloat(valorB);
      }
      if (valorA < valorB) return nextDirection === "asc" ? -1 : 1;
      if (valorA > valorB) return nextDirection === "asc" ? 1 : -1;
      return 0;
    });

    setCupones(cuponesOrdenados);
  };

  const { totalImporte, totalRecargo, totalConRecargo, cantidad } = useMemo(() => {
    let _totalImporte = 0;
    let _totalConRecargo = 0;
    for (const c of cupones) {
      const importe = Number(c?.importecupon) || 0;
      const conRecargo = Number(c?.importecuponconrecargo) || importe;
      _totalImporte += importe;
      _totalConRecargo += conRecargo;
    }
    return {
      totalImporte: _totalImporte,
      totalConRecargo: _totalConRecargo,
      totalRecargo: _totalConRecargo - _totalImporte,
      cantidad: cupones.length,
    };
  }, [cupones]);

  const formatMoney = (n) =>
    (Number(n) || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Export Excel
  const handleExportExcel = () => {
    if (!cupones || cupones.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const exportData = cupones.map((c) => {
      const sucursalNombre =
        contexto.sucursalesTabla.find((s) => s.id === parseInt(c.sucursal_id))?.nombre || "Desconocido";
      const clienteObj = contexto.clientesTabla.find((cli) => cli.id === parseInt(c.cliente_id));
      const clienteNombre = clienteObj ? `${clienteObj.nombre || ""} ${clienteObj.apellido || ""}`.trim() : "Desconocido";
      const planDesc =
        contexto.planTarjetaTabla.find((p) => p.id === parseInt(c.plantarjeta_id))?.descripcion || "Desconocido";

      const importe = Number(c.importecupon) || 0;
      const conRecargo = Number(c.importecuponconrecargo) || importe;
      const recargo = conRecargo - importe;

      return {
        Fecha: c.fecha,
        Importe: fmtMoney(importe),
        Recargo: fmtMoney(recargo),
        "Importe c/ Recargo": fmtMoney(conRecargo),
        Sucursal: sucursalNombre,
        Cliente: clienteNombre,
        Caja: c.caja_id,
        Lote: c.lote,
        Cupón: c.nrocupon,
        Plan: planDesc,
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = Object.keys(exportData[0]).map((key) => {
      const maxLen = Math.max(key.length, ...exportData.map((r) => (r[key] ? String(r[key]).length : 0)));
      return { wch: Math.min(Math.max(maxLen + 2, 10), 50) };
    });

    const wsTotals = XLSX.utils.json_to_sheet([
      { Métrica: "Cantidad", Valor: cantidad },
      { Métrica: "Total Importe", Valor: fmtMoney(totalImporte) },
      { Métrica: "Total Recargo", Valor: fmtMoney(totalConRecargo - totalImporte) },
      { Métrica: "Total c/ Recargo", Valor: fmtMoney(totalConRecargo) },
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cupones");
    XLSX.utils.book_append_sheet(wb, wsTotals, "Totales");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const nombre = `cupones_${fechaDesde || "sin-desde"}_a_${fechaHasta || "sin-hasta"}.xlsx`.replaceAll("/", "-");
    saveAs(fileData, nombre);
  };

  // Paginación (vista)
  const indiceUltimoCupon = paginaActual * cuponesPorPagina;
  const indicePrimerCupon = indiceUltimoCupon - cuponesPorPagina;
  const cuponesActuales = cupones.slice(indicePrimerCupon, indiceUltimoCupon);

  const paginaSiguiente = () => {
    if (paginaActual < Math.ceil(cupones.length / cuponesPorPagina)) setPaginaActual(paginaActual + 1);
  };
  const paginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual(paginaActual - 1);
  };

  return (
    <Container className="vt-page">
      <h1 className="my-list-title dark-text vt-title">Cupones</h1>

      {/* Filtros */}
      <div className="vt-toolbar mb-2">
        <Row className="g-3 align-items-end">
          <Col xs="12" md="auto">
            <label className="mr-2">DESDE:</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="form-control rounded-0 text-center vt-input"
            />
          </Col>

          <Col xs="12" md="auto">
            <label className="ml-2 mr-2">HASTA:</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="form-control rounded-0 text-center vt-input"
            />
          </Col>

          <Col xs="12" md="auto">
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
          </Col>
        </Row>

        <Row className="g-3 align-items-end mt-1">
          <Col xs="12" md="auto">
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
          </Col>

          <Col xs="12" md="auto">
            <label className="d-block">Planes</label>
            <MultiSelectPlanes
              options={planesFiltrados}
              value={planesSeleccionados}
              onChange={setPlanesSeleccionados}
              placeholder="Planes (multi)"
            />
          </Col>
        </Row>

        {/* Botones debajo de los filtros */}
        <Row className="g-2 mt-3">
          <Col xs="12" md="auto">
            <Button onClick={manejarFiltro} disabled={cargando} className="vt-btn">
              {cargando ? (
                <span>
                  Cargando… <Spinner as="span" animation="border" size="sm" />
                </span>
              ) : (
                "Filtrar"
              )}
            </Button>
          </Col>
          <Col xs="12" md="auto">
            <Button
              onClick={handleExportExcel}
              className="vt-btn"
              style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
              disabled={cargando || cupones.length === 0}
            >
              Exportar
            </Button>
          </Col>
        </Row>
      </div>

      {/* Totales */}
      <Card className="mb-3 vt-card">
        <Card.Body>
          <Row className="gy-2">
            <Col md={3} sm={6} xs={12}><strong>Cantidad:</strong> {cantidad}</Col>
            <Col md={3} sm={6} xs={12}><strong>Total Importe:</strong> {fmtMoney(totalImporte)}</Col>
            <Col md={3} sm={6} xs={12}><strong>Total Recargo:</strong> {fmtMoney(totalConRecargo - totalImporte)}</Col>
            <Col md={3} sm={6} xs={12}><strong>Total c/ Recargo:</strong> {fmtMoney(totalConRecargo)}</Col>
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
            {cuponesActuales.map((cupon) => {
              const importe = Number(cupon.importecupon) || 0;
              const conRecargo = Number(cupon.importecuponconrecargo) || importe;
              const recargo = conRecargo - importe;

              const sucursalNombre =
                contexto.sucursalesTabla.find((s) => s.id === parseInt(cupon.sucursal_id))?.nombre || "Desconocido";

              const clienteObj = contexto.clientesTabla.find((c) => c.id === parseInt(cupon.cliente_id));
              const clienteNombre = clienteObj ? `${clienteObj.nombre || ""} ${clienteObj.apellido || ""}`.trim() : "Desconocido";

              const planDesc =
                contexto.planTarjetaTabla.find((plan) => plan.id === parseInt(cupon.plantarjeta_id))?.descripcion || "Desconocido";

              return (
                <tr key={cupon.id}>
                  <td>{cupon.fecha}</td>
                  <td className="text-end">{fmtMoney(importe)}</td>
                  <td>{sucursalNombre}</td>
                  <td>{clienteNombre}</td>
                  <td>{cupon.caja_id}</td>
                  <td className="text-end">{fmtMoney(recargo)}</td>
                  <td>{cupon.lote}</td>
                  <td>{cupon.nrocupon}</td>
                  <td>{planDesc}</td>
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
          Página {paginaActual} de {Math.ceil(cupones.length / cuponesPorPagina) || 1}
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
