import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Container,
  Button,
  FormControl,
  Modal,
  Form,
} from "react-bootstrap";
// import { createAuthenticatedRequest } from "../../utils/createAuthenticatedRequest";
import { useNavigate } from "react-router-dom";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

export default function AccountForm() {
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [saldoActual, setSaldoActual] = useState(0);
  const [showModal, setShowModal] = useState(false); // Nuevo estado para controlar la visibilidad del modal
  const [montoCobranza, setMontoCobranza] = useState(""); // Nuevo estado para el monto de la cobranza
  const [descripcionCobranza, setDescripcionCobranza] = useState(""); // Nuevo estado para el monto de la cobranza
  const [formaCobro, setFormaCobro] = useState(""); // Nuevo estado para el monto de la cobranza
  const [currentPage, setCurrentPage] = useState(1);
  const [movimientosPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  // Nuevo estado para la fecha de la cobranza
  const [fechaCobranza, setFechaCobranza] = useState("");

  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  const obtenerClientes = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/clientes/`, {
        credentials: "include",
      }); // Ajusta la ruta de la API
      const data = await response.json();
      // Ordenar los clientes alfabéticamente por el nombre
      const sortedClientes = [...data].sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      );
      setClientes(sortedClientes);
      // setClientes(data);

      // setLoaded(true);
    } catch (error) {
      console.error("Error al obtener clientes", error);
    }
  }, [apiUrl]);

  useEffect(() => {
    // Obtener lista de clientes al cargar el componente
    obtenerClientes();
  }, [obtenerClientes]);

  const obtenerCliente = async (clienteId) => {
    try {
      const response = await fetch(`${apiUrl}/clientes/${clienteId}/`, {
        credentials: "include",
      });
      const cliente = await response.json();
      return cliente;
    } catch (error) {
      console.error("Error al obtener datos del cliente", error);
      return null;
    }
  };
  const handleClienteChange = async (clienteId) => {
    try {
      // Obtener datos del cliente y operaciones de cuenta corriente
      const [cliente, operaciones] = await Promise.all([
        obtenerCliente(clienteId),
        fetch(`${apiUrl}/cuentas-corrientes/${clienteId}/operaciones`, {
          credentials: "include",
        }).then((response) => response.json()),
      ]);

      // Verificar si el cliente tiene cuenta corriente
      if (cliente && cliente.cuentaCorriente) {
        // Verificar si el cliente seleccionado es diferente al cliente anterior
        if (cliente.id !== selectedCliente?.id) {
          // Restablecer movimientos y saldo actual

          // setMovimientos([...operaciones.ventas, ...operaciones.cobranzas]);
          const allMovimientos = [...operaciones.ventas, ...operaciones.cobranzas]
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
          setMovimientos(allMovimientos);
          setSaldoActual(operaciones.saldoActual);
          setCurrentPage(1); // Reinicia la página al cambiar de cliente
        }
        setSelectedCliente(cliente);
      } else {
        // Cliente no tiene cuenta corriente, restablecer valores
        setMovimientos([]);
        setSaldoActual(0);
        setSelectedCliente(null);
      }
    } catch (error) {
      console.error("Error al obtener movimientos y saldo", error);
    }
  };

  const handleRegistrarCobranza = () => {
    // Limpiar los campos antes de abrir el modal
    setMontoCobranza("");
    setDescripcionCobranza("");
    setFormaCobro("");
    setShowModal(true);
  };

  const handleSort = (columnName) => {
    const newSortDirection =
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(columnName);
    setSortDirection(newSortDirection);

    const sortedMovimientos = [...movimientos].sort((a, b) => {
      const valueA = a[columnName] ?? "";
      const valueB = b[columnName] ?? "";

      if (typeof valueA === "number" && typeof valueB === "number") {
        return newSortDirection === "asc" ? valueA - valueB : valueB - valueA;
      }

      return newSortDirection === "asc"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });

    setMovimientos(sortedMovimientos);
  };

  const handleCloseModal = () => {
    // Cierra el formulario modal
    setShowModal(false);
  };

  const handleGuardarCobranza = async () => {
    // Validación: Verificar que el monto de la cobranza no sea vacío
    if (!montoCobranza.trim()) {
      alert("Por favor, ingrese un monto de cobranza válido.");
      return;
    }

    // Validación: Verificar que el monto de la cobranza sea un número
    if (isNaN(parseFloat(montoCobranza))) {
      alert(
        "Por favor, ingrese un valor numérico para el monto de la cobranza."
      );
      return;
    }

    const confirmGuardarCobranza = window.confirm(
      "¿Seguro que desea grabar esta cobranza?"
    );

    if (!confirmGuardarCobranza) {
      return;
    }

    try {
      // Lógica para guardar la cobranza, puedes implementarla según tu necesidad
      // Aquí puedes realizar la lógica para enviar el monto de la cobranza al servidor, por ejemplo
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
        headers: {
          "Content-Type": "application/json",
        },
      });
      // Obtén nuevamente las operaciones de cuenta corriente para el cliente
      const response = await fetch(
        `${apiUrl}/cuentas-corrientes/${selectedCliente.id}/operaciones`,
        {
          credentials: "include",
        }
      );
      const operaciones = await response.json();

      // Actualiza los movimientos en el estado
      // setMovimientos([...operaciones.ventas, ...operaciones.cobranzas]);
      const allMovimientos = [...operaciones.ventas, ...operaciones.cobranzas]
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setMovimientos(allMovimientos);
      setSaldoActual(operaciones.saldoActual);
      setCurrentPage(1); // Reinicia la página luego de actualizar movimientos
    } catch (error) {
      console.error(
        "Error al guardar la cobranza o al obtener movimientos y saldo después de la cobranza",
        error
      );
      // Puedes manejar el error de alguna manera, como mostrar un mensaje al usuario
      alert("Error al guardar la cobranza o al obtener movimientos y saldo.");
    }
    // Resto de la lógica (limpiar campos, cerrar modal, etc.)
    setMontoCobranza("");
    handleCloseModal();
  };

  // *** LÓGICA DE PAGINACIÓN ***
  // Calcular el índice del último movimiento y del primero según la página actual
  const indexOfLastMovimiento = currentPage * movimientosPerPage;
  const indexOfFirstMovimiento = indexOfLastMovimiento - movimientosPerPage;
  // Obtener el subconjunto de movimientos a mostrar
  const currentMovimientos = movimientos.slice(
    indexOfFirstMovimiento,
    indexOfLastMovimiento
  );

  const handleNextPage = () => {
    if (currentPage < Math.ceil(movimientos.length / movimientosPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Container>
      <h1 className="my-list-title dark-text">
        Registros de Cuentas Corrientes
      </h1>

      <div className="mb-3" style={{ width: "30%", float: "left" }}>
        <label>Filtrar por Cliente:</label>
        <select
          onChange={(e) => handleClienteChange(e.target.value)}
          className="form-control rounded-0 border-transparent text-center"
          style={{ width: "100%" }}
        >
          <option value="">Seleccione un cliente</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nombre}
            </option>
          ))}
        </select>
      </div>

      {selectedCliente ? (
        <div style={{ clear: "both", marginTop: "20px" }}>
          <div className="mb-3" style={{ width: "30%", float: "right" }}>
            <Button
              variant="primary"
              onClick={handleRegistrarCobranza}
              disabled={!selectedCliente.cuentaCorriente} // Deshabilitar el botón si el cliente no tiene cuenta corriente
            >
              Registrar Cobranza
            </Button>
          </div>

          {/* Movimientos de Cuenta Corriente */}
          <h2>Movimientos de Cuenta Corriente</h2>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th
                  onClick={() => handleSort("fecha")}
                  style={{ cursor: "pointer" }}
                >
                  Fecha
                </th>
                <th
                  onClick={() => handleSort("descripcion")}
                  style={{ cursor: "pointer" }}
                >
                  Descripción
                </th>
                <th
                  onClick={() => handleSort("monto_total")}
                  style={{ cursor: "pointer" }}
                >
                  Monto
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Iterar sobre los movimientos y mostrarlos en la tabla */}
              {currentMovimientos.map((movimiento, index) => (
                <tr
                  key={index}
                  onDoubleClick={() => {
                    if (movimiento.productos) {
                      navigate(`/sells/${movimiento.id}/products`);
                    } else {
                      navigate(`/debts/${movimiento.id}/edit`);
                    }
                  }}
                >
                  <td>{movimiento.fecha}</td>
                  <td>{movimiento.productos ? "Venta" : "Cobranza"}</td>
                  <td>
                    {movimiento.monto_total != null
                      ? movimiento.monto_total.toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                        minimumFractionDigits: 2,
                      })
                      : "$0,00"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="d-flex justify-content-center align-items-center">
            <Button onClick={handlePrevPage} disabled={currentPage === 1}>
              <BsChevronLeft />
            </Button>
            <span className="mx-2">
              Página {currentPage} de{" "}
              {Math.ceil(movimientos.length / movimientosPerPage)}
            </span>
            <Button
              onClick={handleNextPage}
              disabled={
                currentPage ===
                Math.ceil(movimientos.length / movimientosPerPage)
              }
            >
              <BsChevronRight />
            </Button>
          </div>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "20px",
            }}
          >
            {/* Aquí puedes mostrar el saldo actual o cualquier otra información */}
            <tr>
              <td>Saldo Actual: </td>
              <td>
                {saldoActual != null
                  ? saldoActual.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                    minimumFractionDigits: 2,
                  })
                  : "$0,00"}
              </td>
            </tr>
          </div>
        </div>
      ) : (
        <div style={{ clear: "both", marginTop: "20px" }}>
          {/* Movimientos de Cuenta Corriente */}
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

      {/* Formulario Modal para Registrar Cobranza */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Registrar Cobranza</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label>Fecha:</label>
          <FormControl
            type="date"
            value={fechaCobranza}
            onChange={(e) => setFechaCobranza(e.target.value)}
          />
          <label>Monto:</label>
          <label>Monto:</label>
          <FormControl
            type="number"
            value={montoCobranza}
            onChange={(e) => setMontoCobranza(e.target.value)}
            min="0" // Establecer el valor mínimo como 0
          />
          <label>Descripción:</label>
          <FormControl
            type="text"
            value={descripcionCobranza}
            onChange={(e) => setDescripcionCobranza(e.target.value)}
          // min="0" // Establecer el valor mínimo como 0
          />
          <Form.Label>Forma de pago:</Form.Label>
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
