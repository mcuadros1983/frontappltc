import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Table, Container, Button, FormControl, Modal, Form, Alert, Row, Col } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

export default function AccountForm() {
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [saldoActual, setSaldoActual] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [montoCobranza, setMontoCobranza] = useState("");
  const [descripcionCobranza, setDescripcionCobranza] = useState("");
  const [formaCobro, setFormaCobro] = useState("");
  const [fechaCobranza, setFechaCobranza] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [movimientosPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // 🔎 Filtros nuevos
  const [filterDesde, setFilterDesde] = useState("");
  const [filterHasta, setFilterHasta] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos"); // "todos" | "venta" | "cobranza"

  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Preselección (state o query)
  const preselectedFromState = location.state?.preselectedClientId;
  const preselectedFromQuery = new URLSearchParams(location.search).get("clienteId");
  const preselectedClientId = preselectedFromState ?? (preselectedFromQuery ? Number(preselectedFromQuery) : undefined);

  // Bloqueo por “Saldos”
  const lockedByState = Boolean(location.state?.lockClient);
  const lockedByQuery = Boolean(preselectedFromQuery) && true;
  const isClientLocked = lockedByState || lockedByQuery;

  const alreadyAppliedPreselectRef = useRef(false);

  const obtenerClientes = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/clientes/`, { credentials: "include" });
      const data = await response.json();
      const sortedClientes = [...data].sort((a, b) => String(a.nombre).localeCompare(String(b.nombre)));
      setClientes(sortedClientes);
    } catch (error) {
      console.error("Error al obtener clientes", error);
    }
  }, [apiUrl]);

  useEffect(() => {
    obtenerClientes();
  }, [obtenerClientes]);

  const obtenerCliente = async (clienteId) => {
    try {
      const response = await fetch(`${apiUrl}/clientes/${clienteId}/`, { credentials: "include" });
      const cliente = await response.json();
      return cliente;
    } catch (error) {
      console.error("Error al obtener datos del cliente", error);
      return null;
    }
  };

  const obtenerOperaciones = async (clienteId) => {
    const response = await fetch(`${apiUrl}/cuentas-corrientes/${clienteId}/operaciones`, {
      credentials: "include",
    });
    return response.json();
  };

  const handleClienteChange = async (clienteIdRaw) => {
    const clienteId = Number(clienteIdRaw);
    if (!clienteId) {
      setSelectedCliente(null);
      setMovimientos([]);
      setSaldoActual(0);
      return;
    }

    try {
      const [cliente, operaciones] = await Promise.all([obtenerCliente(clienteId), obtenerOperaciones(clienteId)]);

      if (cliente && cliente.cuentaCorriente) {
        const allMovs = [...(operaciones.ventas || []), ...(operaciones.cobranzas || [])].sort(
          (a, b) => new Date(b.fecha) - new Date(a.fecha)
        );
        setMovimientos(allMovs);
        setSaldoActual(operaciones.saldoActual);
        setCurrentPage(1);
        setSelectedCliente(cliente);
      } else {
        setMovimientos([]);
        setSaldoActual(0);
        setSelectedCliente(cliente || null);
      }
    } catch (error) {
      console.error("Error al obtener movimientos y saldo", error);
    }
  };

  // Aplicar preselección cuando haya clientes cargados
  useEffect(() => {
    const hasClients = Array.isArray(clientes) && clientes.length > 0;
    const hasPreselected = preselectedClientId !== undefined && preselectedClientId !== null && preselectedClientId !== "";
    if (!alreadyAppliedPreselectRef.current && hasClients && hasPreselected) {
      alreadyAppliedPreselectRef.current = true;
      handleClienteChange(preselectedClientId);
    }
  }, [clientes, preselectedClientId]);

  // Si está bloqueado y hay preselección pero aún no cargó el cliente, cargarlo
  useEffect(() => {
    const hasPreselected = preselectedClientId !== undefined && preselectedClientId !== null && preselectedClientId !== "";
    if (isClientLocked && hasPreselected && !selectedCliente) {
      handleClienteChange(preselectedClientId);
    }
  }, [isClientLocked, preselectedClientId, selectedCliente]);

  // onChange defensivo: no cambiar si está bloqueado
  const handleClienteSelectChange = (e) => {
    if (isClientLocked) return;
    handleClienteChange(e.target.value);
  };

  const hasMissingPrice = (mov) => {
    if (!Array.isArray(mov?.productos)) return false;
    return mov.productos.some((p) => {
      const val = Number(p?.precio);
      return p?.precio === null || p?.precio === undefined || Number.isNaN(val) || val <= 0;
    });
  };

  const calcCantidadItemsFromMov = (mov) => {
    const prods = mov?.productos;
    return Array.isArray(prods) ? prods.length : 0;
  };

  const calcPesoTotalFromMov = (mov) => {
    const prods = mov?.productos;
    if (!Array.isArray(prods)) return 0;
    return prods.reduce((acc, p) => acc + (Number(p?.kg) || 0), 0);
  };

  const deriveCategoriaFromMov = (mov) => {
    const prods = mov?.productos;
    if (!Array.isArray(prods) || prods.length === 0) return "";

    const setCats = new Set(
      prods
        .map((p) => p?.categoria_producto)
        .filter((x) => typeof x === "string" && x.trim() !== "")
        .map((x) => x.trim().toLowerCase())
    );

    if (setCats.size === 0) return "";
    if (setCats.size === 1) return [...setCats][0];
    return "Mixta";
  };


  const handleRegistrarCobranza = () => {
    setMontoCobranza("");
    setDescripcionCobranza("");
    setFormaCobro("");
    setFechaCobranza("");
    setShowModal(true);
  };

  const handleSort = (columnName) => {
    const newSortDirection = columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(columnName);
    setSortDirection(newSortDirection);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleGuardarCobranza = async () => {
    if (!String(montoCobranza).trim()) {
      alert("Por favor, ingrese un monto de cobranza válido.");
      return;
    }
    if (isNaN(parseFloat(montoCobranza))) {
      alert("Por favor, ingrese un valor numérico para el monto de la cobranza.");
      return;
    }
    if (!selectedCliente?.id) {
      alert("Debe haber un cliente seleccionado.");
      return;
    }

    const confirmGuardar = window.confirm("¿Seguro que desea grabar esta cobranza?");
    if (!confirmGuardar) return;

    try {
      await fetch(`${apiUrl}/cobranzas`, {
        credentials: "include",
        method: "POST",
        body: JSON.stringify({
          clienteId: selectedCliente.id,
          detallesCobranza: montoCobranza,
          descripcionCobranza,
          formaCobro,
          montoTotal: montoCobranza,
          fecha: fechaCobranza,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const operaciones = await obtenerOperaciones(selectedCliente.id);
      const allMovs = [...(operaciones.ventas || []), ...(operaciones.cobranzas || [])].sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      );
      setMovimientos(allMovs);
      setSaldoActual(operaciones.saldoActual);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error al guardar cobranza/recargar movimientos", error);
      alert("Error al guardar la cobranza o al obtener movimientos y saldo.");
    }

    setMontoCobranza("");
    handleCloseModal();
  };

  // === Filtro + Orden + Paginación ===
  const filteredAndSortedMovs = useMemo(() => {
    const desde = filterDesde ? new Date(filterDesde) : null;
    const hasta = filterHasta ? new Date(filterHasta) : null;

    const movsFiltrados = (movimientos || []).filter((m) => {
      const fecha = new Date(m.fecha);
      const isVenta = Boolean(m.productos);
      const tipoOK =
        filterTipo === "todos" ? true : filterTipo === "venta" ? isVenta : !isVenta;

      const fechaOK =
        (!desde || fecha >= desde) &&
        (!hasta || fecha <= hasta);

      return tipoOK && fechaOK;
    });

    // Ordenar
    const arr = [...movsFiltrados];
    if (sortColumn) {
      arr.sort((a, b) => {
        let va = a[sortColumn];
        let vb = b[sortColumn];

        if (sortColumn === "fecha") {
          va = new Date(a.fecha);
          vb = new Date(b.fecha);
        } else if (sortColumn === "monto_total") {
          va = Number(a.monto_total) || 0;
          vb = Number(b.monto_total) || 0;
        } else {
          va = String(va ?? "");
          vb = String(vb ?? "");
        }

        if (va < vb) return sortDirection === "asc" ? -1 : 1;
        if (va > vb) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return arr;
  }, [movimientos, filterDesde, filterHasta, filterTipo, sortColumn, sortDirection]);

  const indexOfLastMovimiento = currentPage * movimientosPerPage;
  const indexOfFirstMovimiento = indexOfLastMovimiento - movimientosPerPage;
  const currentMovimientos = filteredAndSortedMovs.slice(indexOfFirstMovimiento, indexOfLastMovimiento);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredAndSortedMovs.length / movimientosPerPage)) {
      setCurrentPage((p) => p + 1);
    }
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  // Indicador en headers
  const sortIndicator = (col) =>
    sortColumn === col ? (sortDirection === "asc" ? " ▲" : " ▼") : "";

  return (
    <Container>
      <h1 className="my-list-title dark-text">Registros de Cuentas Corrientes</h1>

      {/* Aviso opcional de bloqueo */}
      {isClientLocked && (
        <Alert variant="info" className="py-2">
          Cliente fijado desde Saldos. Para ver otro cliente, volvé a la lista de saldos y elegí con doble clic.
        </Alert>
      )}

      {/* Selector de Cliente */}
      <div className="mb-3" style={{ width: "30%", float: "left" }}>
        <label>Cliente:</label>
        <select
          value={Number(selectedCliente?.id ?? preselectedClientId ?? "") || ""}
          onChange={handleClienteSelectChange}
          className="form-control rounded-0 border-transparent text-center"
          style={{ width: "100%" }}
          disabled={isClientLocked}
          title={isClientLocked ? "Cliente bloqueado: cambialo desde Saldos" : "Seleccionar cliente"}
        >
          <option value="">Seleccione un cliente</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Filtros: Fecha y Tipo */}
      <div style={{ clear: "both" }} />
      <Row className="mb-3" xs={1} md={3}>
        <Col>
          <label>Desde:</label>
          <FormControl
            type="date"
            value={filterDesde}
            onChange={(e) => {
              setFilterDesde(e.target.value);
              setCurrentPage(1);
            }}
          />
        </Col>
        <Col>
          <label>Hasta:</label>
          <FormControl
            type="date"
            value={filterHasta}
            onChange={(e) => {
              setFilterHasta(e.target.value);
              setCurrentPage(1);
            }}
          />
        </Col>
        <Col>
          <label>Tipo de operación:</label>
          <Form.Select
            value={filterTipo}
            onChange={(e) => {
              setFilterTipo(e.target.value);
              setCurrentPage(1);
            }}
            className="form-control"
          >
            <option value="todos">Todos</option>
            <option value="venta">Venta</option>
            <option value="cobranza">Cobranza</option>
          </Form.Select>
        </Col>
      </Row>

      {selectedCliente ? (
        <div style={{ clear: "both", marginTop: "10px" }}>
          <div className="mb-3" style={{ width: "30%", float: "right" }}>
            <Button
              variant="primary"
              onClick={handleRegistrarCobranza}
              disabled={!selectedCliente.cuentaCorriente}
            >
              Registrar Cobranza
            </Button>
          </div>

          <h2>Movimientos de Cuenta Corriente</h2>

          <div className="mb-2 small text-muted">
            <span style={{ backgroundColor: "#ffe5e5", padding: "2px 6px", borderRadius: 4 }} />
            {" "}Fila en rojo: venta con productos sin precio.
          </div>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th onClick={() => handleSort("fecha")} style={{ cursor: "pointer" }}>Fecha{sortIndicator("fecha")}</th>
                <th onClick={() => handleSort("descripcion")} style={{ cursor: "pointer" }}>
                  Descripción{sortIndicator("descripcion")}
                </th>


                {/* NUEVAS COLUMNAS */}
                <th>Cantidad</th>
                <th>Peso</th>
                <th>Categoría</th>

                <th onClick={() => handleSort("monto_total")} style={{ cursor: "pointer" }}>
                  Monto{sortIndicator("monto_total")}
                </th>
              </tr>
            </thead>
            <tbody>
              {currentMovimientos.map((movimiento, index) => {
                const isVenta = Boolean(movimiento.productos);
                const faltaPrecio = isVenta && hasMissingPrice(movimiento);

                return (
                  <tr
                    key={`${movimiento.id}-${index}`}
                    onDoubleClick={() => {
                      if (isVenta) {
                        navigate(`/sells/${movimiento.id}/products`);
                      } else {
                        navigate(`/debts/${movimiento.id}/edit`, {
                          state: { preselectedClientId: selectedCliente?.id, lockClient: true },
                        });
                      }
                    }}
                    style={{
                      cursor: "pointer",
                      backgroundColor: faltaPrecio ? "#ffe5e5" : undefined,
                    }}
                    title={
                      faltaPrecio
                        ? "Esta venta tiene productos sin precio"
                        : isVenta
                          ? "Doble clic para ver productos"
                          : "Doble clic para editar cobranza"
                    }
                  >
                    <td>{movimiento.fecha}</td>
                    <td>{isVenta ? "Venta" : "Cobranza"}</td>
                    <td>{isVenta ? calcCantidadItemsFromMov(movimiento) : ""}</td>
                    <td>{isVenta ? calcPesoTotalFromMov(movimiento).toFixed(2) : ""}</td>
                    <td>{isVenta ? deriveCategoriaFromMov(movimiento) : ""}</td>
                    <td>
                      {movimiento.monto_total != null
                        ? Number(movimiento.monto_total).toLocaleString("es-AR", {
                          style: "currency",
                          currency: "ARS",
                          minimumFractionDigits: 2,
                        })
                        : "$0,00"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <div className="d-flex justify-content-center align-items-center">
            <Button onClick={handlePrevPage} disabled={currentPage === 1}>
              <BsChevronLeft />
            </Button>
            <span className="mx-2">
              Página {currentPage} de {Math.ceil(filteredAndSortedMovs.length / movimientosPerPage) || 1}
            </span>
            <Button
              onClick={handleNextPage}
              disabled={currentPage === Math.ceil(filteredAndSortedMovs.length / movimientosPerPage) || filteredAndSortedMovs.length === 0}
            >
              <BsChevronRight />
            </Button>
          </div>

          <div style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "20px" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <strong>Saldo Actual:</strong>
              <span>
                {saldoActual != null
                  ? Number(saldoActual).toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                    minimumFractionDigits: 2,
                  })
                  : "$0,00"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ clear: "both", marginTop: "20px" }}>
          <h2>Movimientos de Cuenta Corriente</h2>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody></tbody>
          </Table>
        </div>
      )}

      {/* Modal Cobranza */}
      <Modal show={showModal} onHide={handleCloseModal} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Registrar Cobranza</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label>Fecha:</Form.Label>
          <FormControl type="date" value={fechaCobranza} onChange={(e) => setFechaCobranza(e.target.value)} />
          <Form.Label className="mt-2">Monto:</Form.Label>
          <FormControl
            type="number"
            value={montoCobranza}
            onChange={(e) => setMontoCobranza(e.target.value)}
            min="0"
          />
          <Form.Label className="mt-2">Descripción:</Form.Label>
          <FormControl
            type="text"
            value={descripcionCobranza}
            onChange={(e) => setDescripcionCobranza(e.target.value)}
          />
          <Form.Label className="mt-2">Forma de pago:</Form.Label>
          <Form.Select
            value={formaCobro}
            onChange={(e) => setFormaCobro(e.target.value)}
            className="form-control rounded-0 border-transparent text-center"
          >
            <option value="">Seleccionar forma de pago</option>
            <option value="Efectivo">EFECTIVO</option>
            <option value="Transferencia">TRANSFERENCIA</option>
            <option value="Tarjeta">TARJETA</option>
            <option value="Compensacion">COMPENSACION</option>
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleGuardarCobranza}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
