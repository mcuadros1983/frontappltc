import React, { useEffect, useState, useCallback } from "react";
import { Table, Container, Button, FormControl } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
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

  // paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(4);

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
  },[apiUrl]);

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
  },[apiUrl]);

  useEffect(() => {
    loadOrders();
    loadBranches();
  }, [loadOrders,loadBranches]);

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

  // const parseDate = (dateString) => {
  //   const [day, month, year] = dateString.split("/");
  //   return parse(`${year}-${month}-${day}`, "yyyy-MM-dd", new Date());
  // };

  const handleSearch = useCallback(() => {
    const searchTermLower = searchTerm.toLowerCase();
    const startDateFilter = startDate ? startDate : null;
    const endDateFilter = endDate ? endDate : null;

    if (searchTermLower === "" && !startDate && !endDate) {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((order) => {
        const matchesBranch =
          order.Sucursal &&
          order.Sucursal.nombre.toLowerCase().includes(searchTermLower);
        const orderDate = order.fecha;

        const matchesDate =
          (!startDateFilter || orderDate >= startDateFilter) &&
          (!endDateFilter || orderDate <= endDateFilter);

        return matchesBranch && matchesDate;
      });
      setFilteredOrders(filtered);
    }
  },[searchTerm,startDate,endDate,orders]);

  useEffect(() => {
    loadOrders();
    loadBranches();
  }, [loadOrders,loadBranches]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, orders, startDate, endDate,handleSearch]);

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

  // Cálculo de la paginación para los productos filtrados
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentFilteredOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
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
        <FormControl
          type="text"
          placeholder="Buscar por sucursal"
          className="mr-sm-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha de ingreso</th>
            <th>Cantidad de medias</th>
            <th>Peso total</th>
            <th>Sucursal</th>
            <th>Operaciones</th>
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
            </tr>
          ))}
        </tbody>
      </Table>
      <div>
        {pageNumbers.map((number) => (
          <Button
            key={number}
            onClick={() => paginate(number)}
            className="mx-1"
          >
            {number}
          </Button>
        ))}
      </div>
    </Container>
  );
}
