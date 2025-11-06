import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Container,
  Table,
  Button,
  Spinner,
  Modal,
  FormControl,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

const DebtList = () => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [montoCobranza, setMontoCobranza] = useState(0);
  const [cobranzaIdToUpdate, setCobranzaIdToUpdate] = useState(null);

  const [filteredDebts, setFilteredDebts] = useState([]);
  const [searchMonto, setSearchMonto] = useState("");
  const [searchCliente, setSearchCliente] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [debtsPerPage] = useState(10);

  // Ordenamiento
  const [sortColumn, setSortColumn] = useState("fecha");
  const [sortDirection, setSortDirection] = useState("desc");

  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  // ===== Helpers
  const handleSortBy = (col) => {
    setCurrentPage(1);
    if (sortColumn === col) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection(col === "fecha" ? "desc" : "asc");
    }
  };

  const sortIndicator = (col) =>
    sortColumn === col ? (sortDirection === "asc" ? " ▲" : " ▼") : "";

  const getFormaPagoNombre = (row) => {
    // intenta varios posibles nombres/estructuras
    return (
      row?.forma_cobro ||
      row?.formaCobro ||
      row?.forma_pago ||
      row?.formapago?.descripcion ||
      row?.formaPago?.descripcion ||
      row?.formacobro?.descripcion ||
      row?.formaCobroNombre ||
      "—"
    );
  };

  // ===== Data loading
  const fetchDebts = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/clientes/`, {
        credentials: "include",
      });
      const data = await response.json();

      // Filtrar clientes que tienen cuenta corriente con cobranzas
      const clientsWithDebts = (data || []).filter(
        (client) =>
          client?.cuentaCorriente &&
          Array.isArray(client?.cuentaCorriente?.cobranzas) &&
          client.cuentaCorriente.cobranzas.length > 0
      );

      setDebts(clientsWithDebts);
      setFilteredDebts(clientsWithDebts);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener cobranzas", error);
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  // ===== Filtros
  const handleSearch = useCallback(() => {
    const searchTerm = (searchCliente || "").toLowerCase();
    const startDateFilter = startDate ? new Date(startDate) : null;
    const endDateFilter = endDate ? new Date(endDate) : null;

    const filtered = (debts || []).map((client) => {
      const filteredCobranzas = (client?.cuentaCorriente?.cobranzas || []).filter(
        (cobranza) => {
          const montoMatch = String(cobranza?.monto_total ?? "")
            .toLowerCase()
            .includes((searchMonto || "").toLowerCase());

          const nombreCliente =
            client?.nombre ??
            client?.razonsocial ??
            (client?.id ? `Cliente #${client.id}` : "");
          const clienteMatch = String(nombreCliente || "")
            .toLowerCase()
            .includes(searchTerm);

          const cobranzaDate = new Date(cobranza?.fecha);
          const matchesDate =
            (!startDateFilter || cobranzaDate >= startDateFilter) &&
            (!endDateFilter || cobranzaDate <= endDateFilter);

          return montoMatch && clienteMatch && matchesDate;
        }
      );

      return {
        ...client,
        cuentaCorriente: {
          ...(client?.cuentaCorriente || {}),
          cobranzas: filteredCobranzas,
        },
      };
    });

    setFilteredDebts(filtered);
    setCurrentPage(1);
  }, [startDate, endDate, debts, searchMonto, searchCliente]);

  useEffect(() => {
    handleSearch();
  }, [searchMonto, searchCliente, startDate, endDate, handleSearch]);

  // ===== Aplanado + Orden
  const flatCobranzas = useMemo(() => {
    const arr = [];
    for (const client of filteredDebts || []) {
      const nombre =
        client?.nombre ??
        client?.razonsocial ??
        (client?.id ? `Cliente #${client.id}` : "");
      const cobranzas = client?.cuentaCorriente?.cobranzas ?? [];
      for (const c of cobranzas) {
        arr.push({
          ...c,
          clienteNombre: nombre,
          clienteId: client?.id,
        });
      }
    }
    return arr;
  }, [filteredDebts]);

  const sortedCobranzas = useMemo(() => {
    const list = [...flatCobranzas];
    list.sort((a, b) => {
      let va, vb;
      switch (sortColumn) {
        case "fecha":
          va = new Date(a.fecha);
          vb = new Date(b.fecha);
          break;
        case "monto_total":
          va = Number(a.monto_total) || 0;
          vb = Number(b.monto_total) || 0;
          break;
        case "cliente":
          va = String(a.clienteNombre || "").toLowerCase();
          vb = String(b.clienteNombre || "").toLowerCase();
          break;
        default:
          va = a[sortColumn];
          vb = b[sortColumn];
      }
      if (va < vb) return sortDirection === "asc" ? -1 : 1;
      if (va > vb) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [flatCobranzas, sortColumn, sortDirection]);

  // ===== Paginación (sobre lista ordenada)
  const indexOfLastDebt = currentPage * debtsPerPage;
  const indexOfFirstDebt = indexOfLastDebt - debtsPerPage;
  const pageRows = sortedCobranzas.slice(indexOfFirstDebt, indexOfLastDebt);

  const nextPage = () => {
    if (currentPage < Math.ceil(sortedCobranzas.length / debtsPerPage)) {
      setCurrentPage((p) => p + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  // ===== CRUD acciones mínimas (editar/eliminar)
  const handleDelete = async (cobranzaId) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar esta cobranza?"
    );
    if (!confirmDelete) return;

    try {
      await fetch(`${apiUrl}/cobranzas/${cobranzaId}`, {
        credentials: "include",
        method: "DELETE",
      });

      // Actualiza localmente
      setDebts((prevDebts) =>
        prevDebts.map((client) => ({
          ...client,
          cuentaCorriente: {
            ...(client?.cuentaCorriente || {}),
            cobranzas: (client?.cuentaCorriente?.cobranzas || []).filter(
              (c) => c.id !== cobranzaId
            ),
          },
        }))
      );
    } catch (error) {
      console.error("Error al eliminar cobranza", error);
    }
  };

  const handleEdit = (cobranzaId, monto) => {
    setMontoCobranza(monto);
    setCobranzaIdToUpdate(cobranzaId);
    setShowModal(true);
  };

  const handleGuardarCobranza = async () => {
    const confirmGuardar = window.confirm(
      "¿Estás seguro de que deseas editar esta cobranza?"
    );
    if (!confirmGuardar) return;

    try {
      await fetch(`${apiUrl}/cobranzas/${cobranzaIdToUpdate}`, {
        credentials: "include",
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monto_total: montoCobranza }),
      });

      // Update local
      setDebts((prevDebts) =>
        prevDebts.map((client) => ({
          ...client,
          cuentaCorriente: {
            ...(client?.cuentaCorriente || {}),
            cobranzas: (client?.cuentaCorriente?.cobranzas || []).map((c) =>
              c.id === cobranzaIdToUpdate ? { ...c, monto_total: montoCobranza } : c
            ),
          },
        }))
      );

      setShowModal(false);
      fetchDebts(); // refresca filtros
    } catch (error) {
      console.error("Error al editar cobranza", error);
    }
  };

  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Cobranzas</h1>

      {/* Filtros */}
      <div className="mb-3">
        <div className="d-inline-block w-auto">
          <label className="mr-2">DESDE: </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-control rounded-0 border-transparent text-center"
          />
        </div>
        <div className="d-inline-block w-auto ml-2">
          <label className="ml-2 mr-2">HASTA:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-control rounded-0 border-transparent text-center"
          />
        </div>
      </div>

      <div className="mb-3 d-flex justify-content-center align-items-center w-50">
        <FormControl
          type="text"
          placeholder="Filtrar por monto"
          className="mr-2"
          value={searchMonto}
          onChange={(e) => setSearchMonto(e.target.value)}
        />
        <FormControl
          type="text"
          placeholder="Filtrar por cliente"
          className="mr-2"
          value={searchCliente}
          onChange={(e) => setSearchCliente(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th style={{ cursor: "pointer" }} onClick={() => handleSortBy("fecha")}>
              Fecha{sortIndicator("fecha")}
            </th>
            <th style={{ cursor: "pointer" }} onClick={() => handleSortBy("monto_total")}>
              Monto Total{sortIndicator("monto_total")}
            </th>
            <th style={{ cursor: "pointer" }} onClick={() => handleSortBy("cliente")}>
              Cliente{sortIndicator("cliente")}
            </th>
            <th>Forma de pago</th>
            <th>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="text-center">
                <Spinner animation="border" role="status" aria-hidden="true" />
              </td>
            </tr>
          ) : pageRows.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center text-muted">
                Sin resultados
              </td>
            </tr>
          ) : (
            pageRows.map((row) => (
              <tr
                key={row.id}
                style={{ cursor: "pointer" }}
                onDoubleClick={() => navigate(`/debts/${row.id}/edit`)}
                title="Doble clic para ver/editar detalle"
              >
                <td>{row.id}</td>
                <td>{row.fecha}</td>
                <td>
                  {Number(row.monto_total).toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td>{row.clienteNombre}</td>
                <td>{getFormaPagoNombre(row)}</td>
                <td className="text-center">
                  <Button
                    variant="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(row.id);
                    }}
                    className="mx-2"
                  >
                    Eliminar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(row.id, row.monto_total);
                    }}
                  >
                    Editar
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Paginación */}
      <div className="d-flex justify-content-center">
        <Button onClick={prevPage} disabled={currentPage === 1}>
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de {Math.ceil(sortedCobranzas.length / debtsPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={currentPage === Math.ceil(sortedCobranzas.length / debtsPerPage)}
        >
          <BsChevronRight />
        </Button>
      </div>

      {/* Modal editar monto */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Editar Cobranza</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label>Monto:</label>
          <FormControl
            type="number"
            value={montoCobranza}
            onChange={(e) => setMontoCobranza(e.target.value)}
            min="0"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleGuardarCobranza}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DebtList;
