import React, { useEffect, useState, useCallback } from "react";
import { Table, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
// import { parse } from "date-fns";
// import { createAuthenticatedRequest } from "../../utils/createAuthenticatedRequest";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

export default function StockList() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  // const [ setSearchTerm] = useState("");
  // const [sortColumn, setSortColumn] = useState(null);
  // const [sortDirection, setSortDirection] = useState("asc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // const [products, setProducts] = useState([]); //agregado para el doble clickf
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(14);

  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/ordenes/`, {
        credentials: "include",
        include: [
          {
            model: "Sucursal",
            attributes: ["id", "nombre"],
          },
          {
            model: "Producto",
            attributes: [
              "id",
              "codigo_de_barra",
              "num_media",
              "precio",
              "kg",
              "tropa",
            ],
          },
        ],
      });

      const data = await res.json();
      const sortedOrders = data.sort((a, b) => a.id - b.id);
      setOrders(sortedOrders);
    } catch (error) {
      console.error(error);
    }
  }, [apiUrl]);

  // Define la función para convertir las fechas al formato deseado
  // const parseDate = (dateString) => {
  //   const [year, month, day] = dateString.split("-");
  //   return parse(`${year}-${month}-${day}`, "yyyy-MM-dd", new Date());
  // };

  const handleSearch = useCallback(() => {
    const startDateFilter = startDate ? startDate : null;
    const endDateFilter = endDate ? endDate : null;

    // if (startDateFilter) startDateFilter.setHours(0, 0, 0, 0);
    // if (endDateFilter) endDateFilter.setHours(0, 0, 0, 0);

    if (!startDate && !endDate) {
      const totalsByBranch = calculateTotalsByBranch(orders);
      setFilteredOrders(totalsByBranch);
    } else {
      const filtered = orders.filter((order) => {
        const orderDate = order.fecha;
        const matchesDate =
          (!startDateFilter || orderDate >= startDateFilter) &&
          (!endDateFilter || orderDate <= endDateFilter);

        return matchesDate;
      });

      const totalsByBranch = calculateTotalsByBranch(filtered);
      setFilteredOrders(totalsByBranch);
    }
  }, [orders,  startDate, endDate]);

  const calculateTotalsByBranch = (orders) => {
    const totalsByBranch = {};

    orders.forEach((order) => {
      const branchId = order.Sucursal ? order.Sucursal.id : null; // Obtener el id del branch
      const branchName = order.Sucursal
        ? order.Sucursal.nombre
        : "Sin Sucursal";
      console.log();

      if (!totalsByBranch[branchId]) {
        totalsByBranch[branchId] = {
          cantidad_total: 0,
          peso_total: 0,
          nombre: branchName,
        };
      }

      totalsByBranch[branchId].cantidad_total += order.cantidad_total;
      totalsByBranch[branchId].peso_total += order.peso_total;

      // console.log("data", totalsByBranch);
      // console.log("test2", orders);
    });

    return Object.entries(totalsByBranch).map(([branchId, totals]) => ({
      branch: {
        id: branchId, // Incluir el id del branch en el resultado
        nombre: totals.nombre,
      },
      ...totals,
    }));
  };

  // const handleSort = (columnName) => {
  //   setSortDirection(
  //     columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc"
  //   );

  //   setSortColumn(columnName);

  //   const sortedOrders = [...filteredOrders].sort((a, b) => {
  //     const valueA =
  //       columnName === "Sucursal.nombre"
  //         ? a.Sucursal && a.Sucursal.nombre
  //         : a[columnName];
  //     const valueB =
  //       columnName === "Sucursal.nombre"
  //         ? b.Sucursal && b.Sucursal.nombre
  //         : b[columnName];

  //     if (columnName === "fecha") {
  //       return sortDirection === "asc"
  //         ? new Date(a.fecha) - new Date(b.fecha)
  //         : new Date(b.fecha) - new Date(a.fecha);
  //     } else {
  //       if (valueA < valueB) {
  //         return sortDirection === "asc" ? -1 : 1;
  //       } else if (valueA > valueB) {
  //         return sortDirection === "asc" ? 1 : -1;
  //       } else {
  //         return 0;
  //       }
  //     }
  //   });

  //   setFilteredOrders(sortedOrders);
  // };

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    handleSearch();
  }, [ orders, startDate, endDate, handleSearch]);

  const handleDoubleClick = async (order) => {
    try {
      const branchId = order.branch ? order.branch.id : null;

      // Construye la URL con o sin fechas dependiendo de su disponibilidad
      let url = `${apiUrl}/productos/filteredProducts/${branchId}`;

      if (startDate && endDate) {
        url += `/${startDate}/${endDate}`;
      }

      const response = await fetch(url, {
        credentials: "include",
      });
      // router.get("/productos/filteredProducts", productosController.obtenerProductosFiltradosSucursalFecha);

      if (!response.ok) {
        console.error("La solicitud no fue exitosa:", response.status);
        return;
      }

      const data = await response.json();

      // console.log("Datos de productos:", data);
      navigate(`/stock/products`, { state: { products: data } });
    } catch (error) {
      console.error("Error al procesar la doble pulsación", error);
    }
  };

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredOrders.length / ordersPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Stock</h1>
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

      <Table striped bordered hover>
        <thead>
          <tr>
            <th
            // onClick={() => handleSort("cantidad_total")}
            // style={{ cursor: "pointer" }}
            >
              Cantidad de medias
            </th>
            <th
            // onClick={() => handleSort("peso_total")}
            // style={{ cursor: "pointer" }}
            >
              Peso total
            </th>
            <th
            // onClick={() => handleSort("sucursal.nombre")}
            // style={{ cursor: "pointer" }}
            >
              Sucursal
            </th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.map((order, index) => (
            <tr
              key={index}
              style={{ cursor: "pointer" }}
              onDoubleClick={() => handleDoubleClick(order)}
            >
              <td>{order.cantidad_total}</td>
              <td>{order.peso_total}</td>
              {/* <td>{order.branch ? order.branch.nombre : "Sin Sucursal"}</td> */}
              <td>{order.nombre}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-center align-items-center">
        <Button onClick={prevPage} disabled={currentPage === 1}>
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de{" "}
          {Math.ceil(filteredOrders.length / ordersPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={
            currentPage === Math.ceil(filteredOrders.length / ordersPerPage)
          }
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
