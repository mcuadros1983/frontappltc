import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Table,
  Button,
  Spinner,
  Modal,
  FormControl,
} from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import { createAuthenticatedRequest } from "../../utils/createAuthenticatedRequest";
// import { parse } from "date-fns";
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

  // const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [debtsPerPage] = useState(10);

  // const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchDebts = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/clientes/`, {
        credentials: "include",
      });
      const data = await response.json();

      // Filtrar clientes que tienen cuenta corriente
      const clientsWithDebts = data.filter(
        (client) =>
          client.cuentaCorriente && client.cuentaCorriente.cobranzas.length > 0
      );

      // Obtener las cobranzas de los clientes filtrados y mapearlas
      clientsWithDebts.flatMap((client) =>
        client.cuentaCorriente.cobranzas.map((cobranza) => ({
          ...cobranza,
          cliente: client, // Agregar la referencia al cliente en cada cobranza
        }))
      );

      // Actualizar el estado con la estructura deseada

      setDebts(clientsWithDebts);
      setFilteredDebts(clientsWithDebts);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener cobranzas", error);
    }
  }, [apiUrl]);

  useEffect(() => {
    // Obtener la lista de cobranzas al cargar el componente
    fetchDebts();
  }, [fetchDebts]);

  const handleDelete = async (cobranzaId) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar esta cobranza?"
    );
    if (!confirmDelete) {
      return;
    }

    try {
      // Eliminar la cobranza con el ID cobranzaId
      await fetch(`${apiUrl}/cobranzas/${cobranzaId}`, {
        credentials: "include",
        method: "DELETE",
      });

      // Actualizar el estado después de eliminar la cobranza
      setDebts((prevDebts) =>
        prevDebts.map((client) => ({
          ...client,
          cuentaCorriente: {
            ...client.cuentaCorriente,
            cobranzas: client.cuentaCorriente.cobranzas.filter(
              (cobranza) => cobranza.id !== cobranzaId
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
    if (!confirmGuardar) {
      return;
    }
    try {
      // Actualizar la cobranza con el ID cobranzaId

      await fetch(`${apiUrl}/cobranzas/${cobranzaIdToUpdate}`, {
        credentials: "include",
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          monto_total: montoCobranza,
        }),
      });

      // Actualizar el estado después de editar la cobranza
      setDebts((prevDebts) =>
        prevDebts.map((client) => ({
          ...client,
          cuentaCorriente: {
            ...client.cuentaCorriente,
            cobranzas: client.cuentaCorriente.cobranzas.map((cobranza) => {
              if (cobranza.id === cobranzaIdToUpdate) {
                return {
                  ...cobranza,
                  monto_total: montoCobranza,
                };
              }
              return cobranza;
            }),
          },
        }))
      );

      // Cerrar el modal después de editar la cobranza
      setShowModal(false);
      // Volver a aplicar el filtro de búsqueda después de editar la cobranza
      fetchDebts();
    } catch (error) {
      console.error("Error al editar cobranza", error);
    }
  };

  const handleSearch = useCallback(() => {
    const searchTerm = searchCliente.toLowerCase();
    const startDateFilter = startDate ? new Date(startDate) : null;
    const endDateFilter = endDate ? new Date(endDate) : null;

    const filtered = debts.map((client) => {
      const filteredCobranzas = client.cuentaCorriente.cobranzas.filter(
        (cobranza) => {
          const montoMatch = cobranza.monto_total
            .toString()
            .toLowerCase()
            .includes(searchMonto.toLowerCase());
          const clienteMatch = client.nombre
            .toString()
            .toLowerCase()
            .includes(searchTerm);

          const cobranzaDate = new Date(cobranza.fecha);

          const matchesDate =
            (!startDateFilter || cobranzaDate >= startDateFilter) &&
            (!endDateFilter || cobranzaDate <= endDateFilter);

          return montoMatch && clienteMatch && matchesDate;
        }
      );

      return {
        ...client,
        cuentaCorriente: {
          ...client.cuentaCorriente,
          cobranzas: filteredCobranzas,
        },
      };
    });

    setFilteredDebts(filtered);
  }, [startDate, endDate, debts, searchMonto, searchCliente]);

  // Pagination logic
  const indexOfLastDebt = currentPage * debtsPerPage;
  const indexOfFirstDebt = indexOfLastDebt - debtsPerPage;
  const currentDebts = filteredDebts.slice(indexOfFirstDebt, indexOfLastDebt);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredDebts.length / debtsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  // const parseDate = (dateString) => {
  //   const [day, month, year] = dateString.split("/");
  //   return new Date(`${year}-${month}-${day}`);
  // };

  useEffect(() => {
    handleSearch();
  }, [searchMonto, searchCliente, startDate, endDate,handleSearch]);

  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Cobranzas</h1>
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

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Monto Total</th>
            <th>Cliente</th>
            <th>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4" className="text-center">
                <Spinner animation="border" role="status" aria-hidden="true" />
              </td>
            </tr>
          ) : (
            currentDebts.map((client) =>
              client.cuentaCorriente.cobranzas.map((cobranza) => (
                <tr key={cobranza.id}>
                  <td>{cobranza.id}</td>
                  <td>{cobranza.fecha}</td>
                  <td>{cobranza.monto_total}</td>
                  <td>{client.nombre}</td>
                  <td className="text-center">
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(cobranza.id)}
                      className="mx-2"
                    >
                      Eliminar
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() =>
                        handleEdit(cobranza.id, cobranza.monto_total)
                      }
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              ))
            )
          )}
        </tbody>
      </Table>
      <div className="d-flex justify-content-center">
        <Button onClick={prevPage} disabled={currentPage === 1}>
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de{" "}
          {Math.ceil(filteredDebts.length / debtsPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={
            currentPage === Math.ceil(filteredDebts.length / debtsPerPage)
          }
        >
          <BsChevronRight />
        </Button>
      </div>
      {/* Modal para editar cobranza */}
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
            min="0" // Establecer el valor mínimo como 0
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
