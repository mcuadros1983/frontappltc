import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Table,
  Button,
  FormControl,
  Spinner,
} from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../context/Contexts";

export default function DetalleDeCaja() {
  const [detalles, setDetalles] = useState([]);
  const [searchSucursal, setSearchSucursal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [detallesPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ventas, setVentas] = useState([]);

  const context = useContext(Contexts.dataContext);
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleFilter = async () => {
    try {
      // Validación de fechas
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        return;
      }

      // Validar selección de sucursal
      if (searchSucursal === "") {
        alert("Debe seleccionar una sucursal.");
        return;
      }

      setLoading(true);
      setError("");

      const responseDetalles = await fetch(`${apiUrl}/caja/detalledecaja`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fechaDesde: startDate,
          fechaHasta: endDate,
          sucursalId: searchSucursal,
        }),
      });

      // console.log("cupones", await responseDetalles.json())

      const responseVentas = await fetch(`${apiUrl}/ventas/filtradas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fechaDesde: startDate,
          fechaHasta: endDate,
          sucursalId: searchSucursal,
        }),
      });

      const dataDetalles = await responseDetalles.json();
      const dataVentas = await responseVentas.json();
      // console.log("data detalles", dataDetalles[1]);
      // console.log("data ventas", dataVentas);
      setDetalles(dataDetalles);
      setVentas(dataVentas);
      setCurrentPage(1); // Reiniciar a la primera página después de cada búsqueda

      // if (responseDetalles.ok && responseVentas.ok) {
      //   const dataDetalles = await responseDetalles.json();
      //   const dataVentas = await responseVentas.json();
      //   // console.log("data detalles", dataDetalles[1]);
      //   // console.log("data ventas", dataVentas);
      //   setDetalles(dataDetalles);
      //   setVentas(dataVentas);
      //   setCurrentPage(1); // Reiniciar a la primera página después de cada búsqueda
      // } else {
      //   throw new Error("Error al obtener los detalles de caja");
      // }
    } catch (error) {
      console.error(error);
      setError(
        "No existe información para la sucursal en la fecha seleccionada."
      );
    } finally {
      setLoading(false);
    }
  };

  // const handleSort = (columnName) => {
  //   const newSortDirection = columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc";
  //   setSortDirection(newSortDirection);
  //   setSortColumn(columnName);

  //   const sortedDetalles = [...detalles].sort((a, b) => {
  //     let valueA = a[columnName];
  //     let valueB = b[columnName];

  //     // Conversión de fecha para comparación
  //     if (columnName === "fechainicio") {
  //       valueA = Date.parse(valueA);
  //       valueB = Date.parse(valueB);
  //     } else if (columnName === "importe") {
  //       valueA = parseFloat(valueA);
  //       valueB = parseFloat(valueB);
  //     }

  //     // Determinar el orden basado en la dirección actualizada
  //     if (valueA < valueB) {
  //       return newSortDirection === "asc" ? -1 : 1;
  //     } else if (valueA > valueB) {
  //       return newSortDirection === "asc" ? 1 : -1;
  //     } else {
  //       return 0;
  //     }
  //   });

  //   setDetalles(sortedDetalles);
  // };
  const handleSort = (columnName, nested = false) => {
    // Calcula la nueva dirección del ordenamiento antes de cambiar el estado
    const newSortDirection =
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc";

    // Actualizar el estado de sortColumn y sortDirection
    setSortColumn(columnName);
    setSortDirection(newSortDirection);

    // Ordenar los detalles
    const sortedDetalles = [...detalles].sort((a, b) => {
      let valueA = nested ? a.caja[columnName] : a[columnName]; // Acceso a datos anidados si es necesario
      let valueB = nested ? b.caja[columnName] : b[columnName];

      // Manejo específico para importes
      if (columnName === "importe") {
        valueA = parseFloat(valueA);
        valueB = parseFloat(valueB);
      } else if (columnName === "fechainicio") {
        // Asumiendo que se puede necesitar para fechas
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }

      // Comparación general con la nueva dirección del ordenamiento
      if (valueA < valueB) {
        return newSortDirection === "asc" ? -1 : 1;
      } else if (valueA > valueB) {
        return newSortDirection === "asc" ? 1 : -1;
      } else {
        return 0;
      }
    });

    // Establecer los detalles ordenados en el estado
    setDetalles(sortedDetalles);
  };
  const isValidDate = (dateString) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false; // Formato incorrecto
    const date = new Date(dateString);
    if (!date.getTime()) return false; // Fecha inválida (por ejemplo, 31/04/2024)
    return date.toISOString().slice(0, 10) === dateString;
  };

  const handleSearchClick = () => {
    handleFilter();
  };

  const indexOfLastDetalle = currentPage * detallesPerPage;
  const indexOfFirstDetalle = indexOfLastDetalle - detallesPerPage;
  const currentDetalles = detalles.slice(
    indexOfFirstDetalle,
    indexOfLastDetalle
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < Math.ceil(detalles.length / detallesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // const formatDate = (dateString) => {
  //   const date = new Date(dateString);
  //   const day = String(date.getDate()).padStart(2, "0");
  //   const month = String(date.getMonth() + 1).padStart(2, "0");
  //   const year = date.getFullYear();
  //   return `${day}/${month}/${year}`;
  // };

  const calcularDiferenciaCaja = (detalle, ventas) => {
    let totalRetiros = parseFloat(detalle.totalRetiros) || 0;
    let totalGastos = parseFloat(detalle.totalGastos) || 0;
    let totalSueldos = parseFloat(detalle.totalSueldos) || 0;
    let totalVales = parseFloat(detalle.totalVales) || 0;
    let totalVtactactes = parseFloat(detalle.totalVtactactes) || 0;
    let cajaFinal = parseFloat(detalle.caja.cajafinal) || 0;
    let totalCupones = parseFloat(detalle.totalCupones) || 0;

    let totalIngresos =
      (parseFloat(detalle.totalIngresos) || 0) +
      (parseFloat(detalle.caja.cajainicial) || 0) +
      (parseFloat(detalle.totalCobranzas) || 0);

    const totalVentas =
      ventas.find(
        (venta) => venta.fecha === detalle.caja.fechainicio.split("T")[0]
      )?.monto || 0;

    let egresos =
      totalRetiros +
      totalGastos +
      totalSueldos +
      totalVales +
      totalVtactactes +
      cajaFinal +
      totalCupones;

    return (
      egresos -
      totalIngresos -
      parseFloat(
        ventas.find(
          (venta) => venta.fecha === detalle.caja.fechainicio.split("T")[0]
        )?.monto || 0
      )
    );
  };

  return (
    <Container>
      <h1 className="my-list-title dark-text">Detalles de Caja</h1>

      <div className="mb-3">
        <div className="d-inline-block w-auto">
          <label className="mr-2">DESDE: </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-control rounded-0 border-transparent text-center"
            disabled={loading}
          />
        </div>

        <div className="d-inline-block w-auto ml-2">
          <label className="ml-2 mr-2">HASTA:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-control rounded-0 border-transparent text-center"
            disabled={loading}
          />
        </div>
      </div>
      <div className="mb-3">
        <FormControl
          as="select"
          value={searchSucursal}
          onChange={(e) => setSearchSucursal(e.target.value)}
          className="mr-2"
          style={{ width: "25%" }}
          disabled={loading}
        >
          <option value="">Seleccione una sucursal</option>
          {context.sucursalesTabla.map((sucursal) => (
            <option key={sucursal.id} value={sucursal.id}>
              {sucursal.nombre}
            </option>
          ))}
        </FormControl>
      </div>

      <div className="mb-3">
        <Button onClick={handleSearchClick} disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : "Filtrar"}
        </Button>
      </div>

      {error && <p>{error}</p>}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th
              onClick={() => handleSort("fechainicio", true)}
              style={{ cursor: "pointer" }}
            >
              Fecha
            </th>
            <th
              onClick={() => handleSort("cajainicial")}
              style={{ cursor: "pointer" }}
            >
              Caja Inicial
            </th>
            <th
              onClick={() => handleSort("cajafinal")}
              style={{ cursor: "pointer" }}
            >
              Caja Final
            </th>
            <th
              onClick={() => handleSort("totalRetiros")}
              style={{ cursor: "pointer" }}
            >
              Retiros
            </th>
            <th
              onClick={() => handleSort("totalCobranzas")}
              style={{ cursor: "pointer" }}
            >
              Cobranzas
            </th>
            <th
              onClick={() => handleSort("totalCupones")}
              style={{ cursor: "pointer" }}
            >
              Tarjetas
            </th>
            <th
              onClick={() => handleSort("totalGastos")}
              style={{ cursor: "pointer" }}
            >
              Gastos
            </th>
            <th
              onClick={() => handleSort("totalIngresos")}
              style={{ cursor: "pointer" }}
            >
              Ingresos
            </th>
            <th
              onClick={() => handleSort("totalSueldos")}
              style={{ cursor: "pointer" }}
            >
              Sueldos
            </th>
            <th
              onClick={() => handleSort("totalVales")}
              style={{ cursor: "pointer" }}
            >
              Vales
            </th>
            <th
              onClick={() => handleSort("totalVtactactes")}
              style={{ cursor: "pointer" }}
            >
              Vta Cta Cte
            </th>
            <th
              onClick={() => handleSort("ventas")}
              style={{ cursor: "pointer" }}
            >
              Ventas
            </th>
            <th
              onClick={() => handleSort("difcaja")}
              style={{ cursor: "pointer" }}
            >
              Dif Caja
            </th>
          </tr>
        </thead>
        <tbody>
          {currentDetalles.map((detalle, index) => (
            <tr key={index}>
              <td>{detalle.caja.fechainicio || "0"}</td>
              <td>{detalle.caja.cajainicial || "0"}</td>
              <td>{detalle.caja.cajafinal || "0"}</td>
              <td>{detalle.totalRetiros || "0"}</td>
              <td>{detalle.totalCobranzas || "0"}</td>
              <td>{detalle.totalCupones || "0"}</td>
              <td>{detalle.totalGastos || "0"}</td>
              <td>{detalle.totalIngresos || "0"}</td>
              <td>{detalle.totalSueldos || "0"}</td>
              <td>{detalle.totalVales || "0"}</td>
              <td>{detalle.totalVtactactes || "0"}</td>
              <td>
                {ventas.find(
                  (venta) =>
                    venta.fecha === detalle.caja.fechainicio.split("T")[0]
                )?.monto || "0"}
              </td>
              <td>
                {parseFloat(calcularDiferenciaCaja(detalle, ventas).toFixed(2))}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="d-flex justify-content-center align-items-center">
        <Button onClick={prevPage} disabled={currentPage === 1 || loading}>
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de {Math.ceil(detalles.length / detallesPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={
            currentPage === Math.ceil(detalles.length / detallesPerPage) ||
            loading
          }
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
