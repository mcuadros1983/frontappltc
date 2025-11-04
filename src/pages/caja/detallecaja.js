import React, { useState, useContext } from "react";
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

  const context = useContext(Contexts.DataContext);
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
        }), credentials: "include"
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
        }), credentials: "include"
      });

      const dataDetalles = await responseDetalles.json();
      const dataVentas = await responseVentas.json();

      if (dataDetalles.length === 0) {
        alert("No existe informacion de caja para la fecha seleccionada.");
      }

      // console.log("data detalles", dataDetalles[1]);
      // console.log("data ventas", dataVentas);
      setDetalles(dataDetalles);
      setVentas(dataVentas);
      setCurrentPage(1); // Reiniciar a la primera página después de cada búsqueda
    } catch (error) {
      console.error(error);
      setError(
        "No existe información para la sucursal en la fecha seleccionada."
      );
    } finally {
      setLoading(false);
    }
  };

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

  // const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

    // const totalVentas =
    //   ventas.find(
    //     (venta) => venta.fecha === detalle.caja.fechainicio.split("T")[0]
    //   )?.monto || 0;

    // ventas.find(
    //   (venta) => venta.fecha === detalle.caja.fechainicio.split("T")[0]
    // )?.monto || 0;

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
  <Container className="vt-page">
    <h1 className="my-list-title dark-text vt-title">Detalles de Caja</h1>

    {/* Filtros */}
    <div className="vt-toolbar mb-3 d-flex flex-wrap align-items-end gap-3">
      <div className="d-inline-block w-auto mx-2">
        <label className="mr-2">DESDE: </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="form-control rounded-0 text-center vt-input"
          disabled={loading}
        />
      </div>

      <div className="d-inline-block w-auto mx-2">
        <label className="ml-2 mr-2">HASTA:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="form-control rounded-0 text-center vt-input"
          disabled={loading}
        />
      </div>

      <div className="d-inline-block w-auto mx-2">
        <label className="d-block">Sucursal</label>
        <FormControl
          as="select"
          value={searchSucursal}
          onChange={(e) => setSearchSucursal(e.target.value)}
          className="vt-input"
          style={{ minWidth: 280 }}
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

      <div className="d-inline-block mx-2">
        <Button onClick={handleSearchClick} disabled={loading} className="vt-btn">
          {loading ? <Spinner animation="border" size="sm" /> : "Filtrar"}
        </Button>
      </div>
    </div>

    {/* Error */}
    {error && <div className="alert alert-danger my-2">{error}</div>}

    {/* Tabla */}
    <div className="vt-tablewrap table-responsive">
      <Table striped bordered hover className="mb-2">
        <thead>
          <tr>
            <th onClick={() => handleSort("fechainicio", true)} className="vt-th-sort">
              Fecha
            </th>
            <th onClick={() => handleSort("cajainicial")} className="vt-th-sort text-end">
              Caja Inicial
            </th>
            <th onClick={() => handleSort("cajafinal")} className="vt-th-sort text-end">
              Caja Final
            </th>
            <th onClick={() => handleSort("totalRetiros")} className="vt-th-sort text-end">
              Retiros
            </th>
            <th onClick={() => handleSort("totalCobranzas")} className="vt-th-sort text-end">
              Cobranzas
            </th>
            <th onClick={() => handleSort("totalCupones")} className="vt-th-sort text-end">
              Tarjetas
            </th>
            <th onClick={() => handleSort("totalGastos")} className="vt-th-sort text-end">
              Gastos
            </th>
            <th onClick={() => handleSort("totalIngresos")} className="vt-th-sort text-end">
              Ingresos
            </th>
            <th onClick={() => handleSort("totalSueldos")} className="vt-th-sort text-end">
              Sueldos
            </th>
            <th onClick={() => handleSort("totalVales")} className="vt-th-sort text-end">
              Vales
            </th>
            <th onClick={() => handleSort("totalVtactactes")} className="vt-th-sort text-end">
              Vta Cta Cte
            </th>
            <th onClick={() => handleSort("ventas")} className="vt-th-sort text-end">
              Ventas
            </th>
            <th onClick={() => handleSort("difcaja")} className="vt-th-sort text-end">
              Dif Caja
            </th>
          </tr>
        </thead>
        <tbody>
          {currentDetalles.map((detalle, index) => (
            <tr key={index}>
              <td>{detalle.caja.fechainicio || "0"}</td>
              <td className="text-end">{detalle.caja.cajainicial || "0"}</td>
              <td className="text-end">{detalle.caja.cajafinal || "0"}</td>
              <td className="text-end">{detalle.totalRetiros || "0"}</td>
              <td className="text-end">{detalle.totalCobranzas || "0"}</td>
              <td className="text-end">{detalle.totalCupones || "0"}</td>
              <td className="text-end">{detalle.totalGastos || "0"}</td>
              <td className="text-end">{detalle.totalIngresos || "0"}</td>
              <td className="text-end">{detalle.totalSueldos || "0"}</td>
              <td className="text-end">{detalle.totalVales || "0"}</td>
              <td className="text-end">{detalle.totalVtactactes || "0"}</td>
              <td className="text-end">
                {ventas.find(
                  (venta) => venta.fecha === (detalle.caja.fechainicio || "").split("T")[0]
                )?.monto || "0"}
              </td>
              <td className="text-end">
                {parseFloat(calcularDiferenciaCaja(detalle, ventas).toFixed(2))}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>

    {/* Paginación */}
    <div className="d-flex justify-content-center align-items-center vt-pager">
      <Button onClick={prevPage} disabled={currentPage === 1 || loading} variant="light">
        <BsChevronLeft />
      </Button>
      <span className="mx-2">
        Página {currentPage} de {Math.ceil(detalles.length / detallesPerPage) || 1}
      </span>
      <Button
        onClick={nextPage}
        disabled={currentPage === Math.ceil(detalles.length / detallesPerPage) || loading}
        variant="light"
      >
        <BsChevronRight />
      </Button>
    </div>
  </Container>
);

}
