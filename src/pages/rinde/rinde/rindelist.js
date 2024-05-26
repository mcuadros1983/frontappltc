import React, { useState, useEffect, useContext, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../../context/Contexts";

export default function ListaRindes() {
  const [rindes, setRindes] = useState([]);
  const [searchSucursal, setSearchSucursal] = useState("");
  const [searchMes, setSearchMes] = useState("");
  const [searchAnio, setSearchAnio] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rindesPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const context = useContext(Contexts.dataContext);
  // const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  const obtenerRindes = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/obtenerrindes`);
      if (response.ok) {
        const data = await response.json();
        // console.log("data", data);
        setRindes(data.rindes);
      } else {
        throw new Error("Error al obtener los rindes");
      }
    } catch (error) {
      console.error("Error al obtener los rindes:", error);
    }
  },[apiUrl]);

  useEffect(() => {
    obtenerRindes();
  }, [obtenerRindes]);

  const handleSort = (columnName) => {
    setSortDirection(
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc"
    );
    setSortColumn(columnName);

    const sortedRindes = [...rindes].sort((a, b) => {
      let valueA = a[columnName];
      let valueB = b[columnName];

      if (columnName === "total") {
        valueA = parseFloat(valueA);
        valueB = parseFloat(valueB);
      }

      if (valueA < valueB) {
        return sortDirection === "asc" ? -1 : 1;
      } else if (valueA > valueB) {
        return sortDirection === "asc" ? 1 : -1;
      } else {
        return 0;
      }
    });

    setRindes(sortedRindes);
  };

  const handleFilter = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/obtenerrindesfiltrados`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mes: searchMes,
            anio: searchAnio,
            sucursalId: searchSucursal,
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setRindes(data.rindes);
        setCurrentPage(1);
      } else {
        throw new Error("Error al obtener los rindes");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEliminarRinde = async (rindeId) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este rinde?"
    );
    if (!confirmDelete) {
      return;
    }
    try {
      const response = await fetch(
        `${apiUrl}/eliminarrinde/${rindeId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        await response.json();
        // console.log(data.message);
        setRindes(rindes.filter((rinde) => rinde.id !== rindeId));
      } else {
        throw new Error("Error al eliminar el rinde");
      }
    } catch (error) {
      console.error("Error al eliminar el rinde:", error);
    }
  };

  const handleSearchClick = () => {
    handleFilter();
  };

  const nextPage = () => {
    if (currentPage < Math.ceil(rindes.length / rindesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const indexOfLastRinde = currentPage * rindesPerPage;
  const indexOfFirstRinde = indexOfLastRinde - rindesPerPage;
  const currentRindes = rindes.slice(indexOfFirstRinde, indexOfLastRinde);

  return (
    <Container>
      <h1 className="my-list-title dark-text">Rindes</h1>

      <div className="mb-3">
        <FormControl
          type="number"
          placeholder="Mes"
          value={searchMes}
          onChange={(e) => setSearchMes(e.target.value)}
          className="mr-2"
          style={{ width: "25%" }}
        />
      </div>
      <div className="mb-3">
        <FormControl
          type="number"
          placeholder="Año"
          value={searchAnio}
          onChange={(e) => setSearchAnio(e.target.value)}
          className="mr-2"
          style={{ width: "25%" }}
        />
      </div>
      <div className="mb-3">
        <FormControl
          as="select"
          value={searchSucursal}
          onChange={(e) => setSearchSucursal(e.target.value)}
          className="mr-2"
          style={{ width: "25%" }}
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
        <Button onClick={handleSearchClick}>Filtrar</Button>
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th onClick={() => handleSort("mes")} style={{ cursor: "pointer" }}>
              Mes
            </th>
            <th
              onClick={() => handleSort("anio")}
              style={{ cursor: "pointer" }}
            >
              Año
            </th>
            <th
              onClick={() => handleSort("totalVentas")}
              style={{ cursor: "pointer" }}
            >
              Ventas
            </th>
            <th
              onClick={() => handleSort("rinde")}
              style={{ cursor: "pointer" }}
            >
              Rinde
            </th>
            <th
              onClick={() => handleSort("sucursal_id")}
              style={{ cursor: "pointer" }}
            >
              Sucursal
            </th>
            <th
              onClick={() => handleSort("ingresoEsperadoCerdo")}
              style={{ cursor: "pointer" }}
            >
              IE CE
            </th>
            <th
              onClick={() => handleSort("ingresoEsperadoNovillo")}
              style={{ cursor: "pointer" }}
            >
              IE NT
            </th>
            <th
              onClick={() => handleSort("ingresoEsperadoVaca")}
              style={{ cursor: "pointer" }}
            >
              IE EX
            </th>
            <th
              onClick={() => handleSort("totalInventarioFinal")}
              style={{ cursor: "pointer" }}
            >
              Inv. Final
            </th>
            <th
              onClick={() => handleSort("totalInventarioInicial")}
              style={{ cursor: "pointer" }}
            >
              Inv. Inicial
            </th>
            <th
              onClick={() => handleSort("totalKgCerdo")}
              style={{ cursor: "pointer" }}
            >
              KG CE
            </th>
            <th
              onClick={() => handleSort("totalKgNovillo")}
              style={{ cursor: "pointer" }}
            >
              KG NT
            </th>
            <th
              onClick={() => handleSort("totalKgVaca")}
              style={{ cursor: "pointer" }}
            >
              KG EX
            </th>
            <th
              onClick={() => handleSort("totalMovimientos")}
              style={{ cursor: "pointer" }}
            >
              Mov.
            </th>
            <th>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {currentRindes.map((rinde) => (
            <tr key={rinde.id}>
              <td>{rinde.mes}</td>
              <td>{rinde.anio}</td>
              <td>{rinde.totalVentas}</td>
              <td>{rinde.rinde}%</td>
              <td>
                {" "}
                {context.sucursalesTabla.find(
                  (sucursal) => sucursal.id === parseInt(rinde.sucursal_id)
                )?.nombre || "Desconocido"}
              </td>
              <td>{rinde.ingresoEsperadoCerdo}</td>
              <td>{rinde.ingresoEsperadoNovillo}</td>
              <td>{rinde.ingresoEsperadoVaca}</td>
              <td>{rinde.totalInventarioFinal}</td>
              <td>{rinde.totalInventarioInicial}</td>
              <td>{rinde.totalKgCerdo}</td>
              <td>{rinde.totalKgNovillo}</td>
              <td>{rinde.totalKgVaca}</td>
              <td>{rinde.totalMovimientos}</td>
              <td>
                <Button
                  variant="danger"
                  onClick={() => handleEliminarRinde(rinde.id)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="d-flex justify-content-center align-items-center">
        <Button onClick={prevPage} disabled={currentPage === 1}>
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de {Math.ceil(rindes.length / rindesPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={currentPage === Math.ceil(rindes.length / rindesPerPage)}
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
