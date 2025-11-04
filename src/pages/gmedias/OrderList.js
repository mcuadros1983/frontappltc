import React, { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { Table, Container, Button, FormControl } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import Contexts from "../../context/Contexts";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

export default function OrderList() {
  const location = useLocation();
  const initialState = location.state || {};

  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState(initialState.searchTerm || "");
  const [startDate, setStartDate] = useState(initialState.startDate || "");
  const [endDate, setEndDate] = useState(initialState.endDate || "");
  const [selectedBranchId, setSelectedBranchId] = useState(initialState.selectedBranchId || "");
  const [branches, setBranches] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [sortColumn, setSortColumn] = useState(initialState.sortColumn || null);
  const [sortDirection, setSortDirection] = useState(initialState.sortDirection || "asc");
  const [currentPage, setCurrentPage] = useState(initialState.currentPage || 1);
  const [ordersPerPage] = useState(20);
  const [editingBranchId, setEditingBranchId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [originalBranchId, setOriginalBranchId] = useState("");

  const context = useContext(Contexts.UserContext);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/ordenes/`, {
        credentials: "include",
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

  const filteredOrders = useMemo(() => {
    const searchTermLower = searchTerm.toLowerCase();
    const startDateFilter = startDate ? startDate : null;
    const endDateFilter = endDate ? endDate : null;

    return orders.filter((order) => {
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

      return matchesBranchName && matchesDate && matchesBranchId;
    });
  }, [orders, searchTerm, startDate, endDate, selectedBranchId]);

  const sortedOrders = useMemo(() => {
    if (!sortColumn) return filteredOrders;

    return [...filteredOrders].sort((a, b) => {
      const valueA = a[sortColumn] ?? (sortColumn === "Sucursal.nombre" ? a.Sucursal?.nombre ?? "" : "");
      const valueB = b[sortColumn] ?? (sortColumn === "Sucursal.nombre" ? b.Sucursal?.nombre ?? "" : "");

      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      }

      return sortDirection === "asc"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
  }, [filteredOrders, sortColumn, sortDirection]);

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
          sucursal_id: editingBranchId,
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

  const handleEdit = (id, currentBranchId, currentDate) => {
    setIsEditing(true);
    setSelectedDate(currentDate);
    setEditingBranchId(currentBranchId);
    setOriginalBranchId(currentBranchId);
    setEditingOrderId(id);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingBranchId("");
    setEditingOrderId(null);
  };

  const handleSort = (columnName) => {
    const newSortDirection =
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(columnName);
    setSortDirection(newSortDirection);
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = [...sortedOrders]
    .reverse() // Mantiene el reverse si es intencional (parece para orden descendente por defecto)
    .slice(indexOfFirstOrder, indexOfLastOrder);

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
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
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
          {currentOrders.map((order) => (
            <tr
              key={order.id}
              style={{ cursor: "pointer" }}
              onDoubleClick={() => navigate(`/orders/${order.id}/products`, {
                state: {
                  searchTerm,
                  startDate,
                  endDate,
                  selectedBranchId,
                  sortColumn,
                  sortDirection,
                  currentPage,
                },
              })}
            >
              <td>{order.id}</td>
              <td>
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
                    value={editingBranchId}
                    onChange={(e) => setEditingBranchId(e.target.value)}
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
          Página {currentPage} de {Math.ceil(sortedOrders.length / ordersPerPage)}
        </span>
        <Button
          onClick={() =>
            currentPage < Math.ceil(sortedOrders.length / ordersPerPage) &&
            setCurrentPage(currentPage + 1)
          }
          disabled={currentPage === Math.ceil(sortedOrders.length / ordersPerPage)}
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}