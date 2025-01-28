import React, { useState, useContext } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../../context/Contexts";

export default function CantidadTicketPorUsuario() {
  const [cantidadesTicketFiltrados, setCantidadesTicketFiltrados] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sellsPerPage] = useState(20);
  const [selectedSucursal, setSelectedSucursal] = useState("");
  const [selectedUsuario, setSelectedUsuario] = useState("");
  const [filterBy, setFilterBy] = useState("sucursal");

  const context = useContext(Contexts.DataContext);

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleFilter = async () => {
    try {
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        return;
      }

      const body = {
        fechaDesde: startDate,
        fechaHasta: endDate,
      };

    //   if (filterBy === "sucursal" && selectedSucursal) {
    //     body.sucursalId = selectedSucursal;
    //   } else if (filterBy === "usuario" && selectedUsuario) {
    //     body.usuarioId = selectedUsuario;
    //   }

      const response = await fetch(
        `${apiUrl}/ventas/cantidad_ticket_por_usuario`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log("data", data)
        const agrupados = filterBy === "sucursal" ? agruparPorSucursal(data) : agruparPorUsuario(data);
        setCantidadesTicketFiltrados(agrupados);
      } else {
        throw new Error("Error al obtener la cantidad de ticket por usuario filtradas");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const agruparPorSucursal = (data) => {
    const agrupados = data.reduce((acc, venta) => {
      const key = venta.sucursal_id;
      if (!acc[key]) {
        acc[key] = {
          sucursal_id: venta.sucursal_id,
          cantidad: 0,
          total_monto: 0,
        };
      }
      acc[key].cantidad += Number(venta.cantidad);
      acc[key].total_monto += parseFloat(venta.total_monto);
      return acc;
    }, {});
    return Object.values(agrupados);
  };

  const agruparPorUsuario = (data) => {
    const agrupados = data.reduce((acc, venta) => {
      const key = venta.usuario_id;
      if (!acc[key]) {
        acc[key] = {
          usuario_id: venta.usuario_id,
          cantidad: 0,
          total_monto: 0,
        };
      }
      acc[key].cantidad += Number(venta.cantidad);
      acc[key].total_monto += parseFloat(venta.total_monto);
      return acc;
    }, {});
    return Object.values(agrupados);
  };

  const isValidDate = (dateString) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;
    const date = new Date(dateString);
    return date.getTime() && date.toISOString().slice(0, 10) === dateString;
  };

  const handleFilterByChange = (e) => {
    setFilterBy(e.target.value);
    setSelectedSucursal("");
    setSelectedUsuario("");
    setCantidadesTicketFiltrados([]);
  };

  const indexOfLastSell = currentPage * sellsPerPage;
  const indexOfFirstSell = indexOfLastSell - sellsPerPage;
  const currentSells = cantidadesTicketFiltrados.slice(indexOfFirstSell, indexOfLastSell);

  const nextPage = () => {
    if (currentPage < Math.ceil(cantidadesTicketFiltrados.length / sellsPerPage)) {
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
      <h1 className="my-list-title dark-text">Cantidad de Tickets </h1>
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
          as="select"
          className="mr-2"
          value={filterBy}
          onChange={handleFilterByChange}
          style={{ width: "25%" }}
        >
          <option value="sucursal">Filtrar por Sucursal</option>
          <option value="usuario">Filtrar por Usuario</option>
        </FormControl>
      </div>
      <div className="mb-3">
        <Button onClick={handleFilter}>Filtrar</Button>
      </div>

      <h2 className="my-list-title dark-text">Resultados de la Búsqueda</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            {filterBy === "sucursal" ? <th>Sucursal</th> : <th>Usuario</th>}
            <th>Cantidad de Tickets</th>
            <th>Monto Total</th>
          </tr>
        </thead>
        <tbody>
          {currentSells.map((venta, index) => (
            <tr key={`${filterBy === "sucursal" ? venta.sucursal_id : venta.usuario_id}-${index}`}>
              {filterBy === "sucursal" ? (
                <td>
                  {context.sucursalesTabla.find(
                    (sucursal) => sucursal.id === parseInt(venta.sucursal_id)
                  )?.nombre || "Desconocido"}
                </td>
              ) : (
                <td>
                  {context.usuariosTabla.find(
                    (usuario) => usuario.id === parseInt(venta.usuario_id)
                  )?.nombre_completo || "Desconocido"}
                </td>
              )}
              <td>{venta.cantidad}</td>
              <td>{venta.total_monto.toFixed(2)}</td>
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
          {Math.ceil(cantidadesTicketFiltrados.length / sellsPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={
            currentPage === Math.ceil(cantidadesTicketFiltrados.length / sellsPerPage)
          }
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
