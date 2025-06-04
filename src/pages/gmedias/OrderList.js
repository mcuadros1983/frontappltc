import React, { useContext, useEffect, useState, useCallback } from "react";
import { Table, Container, Button, FormControl } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Contexts from "../../context/Contexts";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
// import { parse } from "  date-fns";
// import Pagination from "../../utils/Pagination";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [originalBranchId, setOriginalBranchId] = useState("");
  const [branches, setBranches] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null); // Nuevo estado para el ID de la orden que se está editando
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(20);

  const context = useContext(Contexts.UserContext);

  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/ordenes/`, {
        credentials: "include",
        include: {
          model: "Sucursal",
          attributes: ["nombre"],
        },
      });

      const data = await res.json();

      const sortedOrders = data.sort((a, b) => a.id - b.id);
      setOrders(sortedOrders);
    } catch (error) {
      console.error(error);
    }
  }, [apiUrl]);

  const loadBranches = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/sucursales`, {
        credentials: "include",
      });
      const data = await response.json();
      setBranches(data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  }, [apiUrl]);

  useEffect(() => {
    loadOrders();
    loadBranches();
  }, [loadOrders, loadBranches]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar esta orden?"
    );
    if (!confirmDelete) {
      return;
    }

    try {
      await fetch(`${apiUrl}/ordenes/${id}`, {
        credentials: "include",
        method: "DELETE",
      });
      setOrders(orders.filter((order) => order.id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async () => {
    try {
      await fetch(`${apiUrl}/ordenes/${editingOrderId}`, {
        credentials: "include",
        method: "PUT",
        body: JSON.stringify({
          sucursal_id: selectedBranchId,
          fecha: selectedDate,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      setEditingOrderId(null);
      loadOrders();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = useCallback(() => {
    const searchTermLower = searchTerm.toLowerCase();
    const startDateFilter = startDate ? startDate : null;
    const endDateFilter = endDate ? endDate : null;

    const filtered = orders.filter((order) => {
      const matchesBranchName =
        order.Sucursal &&
        order.Sucursal.nombre.toLowerCase().includes(searchTermLower);

      const matchesBranchId = selectedBranchId
        ? order.sucursal_id === Number(selectedBranchId)
        : true;

      const orderDate = order.fecha;
      const matchesDate =
        (!startDateFilter || orderDate >= startDateFilter) &&
        (!endDateFilter || orderDate <= endDateFilter);

      return matchesBranchName && matchesDate && matchesBranchId; // 🔄 NUEVO
    });

    setFilteredOrders(filtered);
  }, [searchTerm, startDate, endDate, selectedBranchId, orders]); // 🔄 NUEVO

  useEffect(() => {
    handleSearch();
  }, [searchTerm, orders, startDate, endDate, selectedBranchId, handleSearch]); // 🔄 NUEVO

  useEffect(() => {
    loadOrders();
    loadBranches();
  }, [loadOrders, loadBranches]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, orders, startDate, endDate, handleSearch]);

  const handleEdit = (id, currentBranchId, currentDate) => {
    setIsEditing(true);
    setSelectedDate(currentDate);
    setSelectedBranchId(currentBranchId);
    setOriginalBranchId(currentBranchId);
    setEditingOrderId(id); // Establecer el ID de la orden que se está editando
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedBranchId(originalBranchId);
    setEditingOrderId(null); // Restablecer el ID de la orden que se está editando
  };

  const handleSort = (columnName) => {
    const newSortDirection =
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(columnName);
    setSortDirection(newSortDirection);

    const sortedOrders = [...filteredOrders].sort((a, b) => {
      const valueA = a[columnName] ?? "";
      const valueB = b[columnName] ?? "";

      if (typeof valueA === "number" && typeof valueB === "number") {
        return newSortDirection === "asc" ? valueA - valueB : valueB - valueA;
      }

      return newSortDirection === "asc"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });

    setFilteredOrders(sortedOrders);
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentFilteredOrders = [...filteredOrders] // Crea una copia para evitar modificar el estado original
    .reverse() // Invierte el orden de los elementos
    .slice(indexOfFirstOrder, indexOfLastOrder); // Aplica la paginación

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredOrders.length / ordersPerPage); i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Ordenes</h1>
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

      <div className="mb-3">
        <label className="mr-2">Sucursal:</label>
        <FormControl
          as="select"
          value={selectedBranchId}
          onChange={(e) => setSelectedBranchId(e.target.value)}
          className="w-25 d-inline-block"
        >
          <option value="">Todas las sucursales</option>
          {[...branches]
            .sort((a, b) => a.nombre.localeCompare(b.nombre)) // ✅ Orden alfabético
            .map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.nombre}
              </option>
            ))}
        </FormControl>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>#</th>
            <th onClick={() => handleSort("fecha")} style={{ cursor: "pointer" }}>Fecha de ingreso</th>
            <th onClick={() => handleSort("cantidad_total")} style={{ cursor: "pointer" }}>Cantidad de medias</th>
            <th onClick={() => handleSort("peso_total")} style={{ cursor: "pointer" }}>Peso total</th>
            <th onClick={() => handleSort("Sucursal.nombre")} style={{ cursor: "pointer" }}>Sucursal</th>
            {!(context.user && context.user.rol_id === 4) && <th>Operaciones</th>}
          </tr>
        </thead>

        <tbody>
          {currentFilteredOrders.map((order) => (
            <tr
              key={order.id}
              style={{ cursor: "pointer" }}
              onDoubleClick={() => navigate(`/orders/${order.id}/products`)}
            >
              <td>{order.id}</td>
              <td>
                {" "}
                {isEditing && order.id === editingOrderId ? (
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="form-control"
                  />
                ) : (
                  order.fecha
                )}
              </td>
              <td>{order.cantidad_total}</td>
              <td>{order.peso_total}</td>
              <td>
                {isEditing && order.id === editingOrderId ? (
                  <FormControl
                    as="select"
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                  >
                    <option value="">Seleccione una sucursal</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.nombre}
                      </option>
                    ))}
                  </FormControl>
                ) : order.Sucursal ? (
                  order.Sucursal.nombre
                ) : (
                  "Sucursal Desconocida"
                )}
              </td>
              {!(context.user && context.user.rol_id === 4) && (
                <td className="text-center">
                  {!isEditing || order.id !== editingOrderId ? (
                    <>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(order.id)}
                        className="mx-2"
                      >
                        Eliminar
                      </Button>
                      <Button
                        color="inherit"
                        onClick={() =>
                          handleEdit(order.id, order.sucursal_id, order.fecha)
                        }
                      >
                        Editar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="primary"
                        onClick={() => handleSave(order.id)}
                        className="mx-2"
                      >
                        Guardar
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleCancel}
                        className="mx-2"
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="d-flex justify-content-center align-items-center mt-3">
        <Button onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de {Math.ceil(filteredOrders.length / ordersPerPage)}
        </span>
        <Button
          onClick={() =>
            currentPage < Math.ceil(filteredOrders.length / ordersPerPage) &&
            setCurrentPage(currentPage + 1)
          }
          disabled={currentPage === Math.ceil(filteredOrders.length / ordersPerPage)}
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
