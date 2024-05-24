import React, { useState, useEffect } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

export default function ArticulosPorcentaje() {
  const [articulosPorcentaje, setArticulosPorcentaje] = useState([]);
  const [filteredArticulos, setFilteredArticulos] = useState([]); // Estado para los artículos filtrados
  const [currentPage, setCurrentPage] = useState(1);
  const [articulosPerPage] = useState(10); // Modifiqué a 10 para la paginación
  const [codigoBarrasFilter, setCodigoBarrasFilter] = useState("");
  const [descripcionFilter, setDescripcionFilter] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    obtenerArticulosPorcentaje();
  }, []);

  useEffect(() => {
    filterArticulos(codigoBarrasFilter, descripcionFilter);
  }, [codigoBarrasFilter, descripcionFilter]);

  const obtenerArticulosPorcentaje = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/obtenerarticulosporcentaje`

      );

      // console.log("response",response)
      if (!response.ok) {
        throw new Error("Error al obtener los artículos con porcentaje");
      }
      const data = await response.json();
      setArticulosPorcentaje(data);
      setFilteredArticulos(data); // Inicialmente, los artículos filtrados son iguales a todos los artículos
    } catch (error) {
      console.error(error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCodigoBarrasFilterChange = (e) => {
    setCodigoBarrasFilter(e.target.value);
  };

  const handleDescripcionFilterChange = (e) => {
    setDescripcionFilter(e.target.value);
  };

  const filterArticulos = (codigoBarras, descripcion) => {
    const filtered = articulosPorcentaje.filter((articulo) => {
      const codigoBarrasMatch = articulo.Articulotabla.codigobarra
        .toLowerCase()
        .includes(codigoBarras.toLowerCase());
      const descripcionMatch = articulo.Articulotabla.descripcion
        .toLowerCase()
        .includes(descripcion.toLowerCase());
      return codigoBarrasMatch && descripcionMatch;
    });
    setFilteredArticulos(filtered);
  };

  const handleSort = (columnName) => {
    setSortDirection(
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc"
    );
    setSortColumn(columnName);

    const sortedArticulos = [...filteredArticulos].sort((a, b) => {
      let valueA;
      let valueB;

      if (columnName === "porcentaje") {
        valueA = parseFloat(a[columnName]);
        valueB = parseFloat(b[columnName]);
      } else if (columnName === "codigobarra") {
        valueA = a.Articulotabla.codigobarra;
        valueB = b.Articulotabla.codigobarra;
      } else if (columnName === "descripcion") {
        valueA = a.Articulotabla.descripcion.toLowerCase();
        valueB = b.Articulotabla.descripcion.toLowerCase();
      } else {
        valueA = a[columnName];
        valueB = b[columnName];
      }

      if (typeof valueA === "string" && typeof valueB === "string") {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) {
        return sortDirection === "asc" ? -1 : 1;
      } else if (valueA > valueB) {
        return sortDirection === "asc" ? 1 : -1;
      } else {
        return 0;
      }
    });

    setFilteredArticulos(sortedArticulos); // Actualiza la lista de artículos filtrados después de ordenar
  };

  const indexOfLastArticulo = currentPage * articulosPerPage;
  const indexOfFirstArticulo = indexOfLastArticulo - articulosPerPage;
  const currentArticulos = filteredArticulos.slice(
    indexOfFirstArticulo,
    indexOfLastArticulo
  );

  return (
    <Container>
      <h1>Artículos con Porcentaje</h1>
      <div className="mb-3 d-flex">
        <FormControl
          type="text"
          placeholder="Filtrar por código de barras"
          value={codigoBarrasFilter}
          onChange={handleCodigoBarrasFilterChange}
          className="mr-2"
          style={{ width: "25%" }} // Ajusta el ancho según tu preferencia
        />
        <FormControl
          type="text"
          placeholder="Filtrar por descripción"
          value={descripcionFilter}
          onChange={handleDescripcionFilterChange}
          className="mr-2"
          style={{ width: "25%" }} // Ajusta el ancho según tu preferencia
        />
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th
              onClick={() => handleSort("codigobarra")}
              style={{ cursor: "pointer" }}
            >
              Código de Barras
            </th>
            <th
              onClick={() => handleSort("descripcion")}
              style={{ cursor: "pointer" }}
            >
              Descripción del Artículo
            </th>
            <th
              onClick={() => handleSort("porcentaje")}
              style={{ cursor: "pointer" }}
            >
              Porcentaje
            </th>
            <th
              onClick={() => handleSort("subcategoria")}
              style={{ cursor: "pointer" }}
            >
              Subcategoria
            </th>
          </tr>
        </thead>
        <tbody>
          {currentArticulos.map((articulo) => (
            <tr key={articulo.id}>
              <td>{articulo.Articulotabla.codigobarra}</td>
              <td>{articulo.Articulotabla.descripcion}</td>
              <td>{articulo.porcentaje}</td>
              <td>{articulo.subcategoria}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="d-flex justify-content-center align-items-center">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de{" "}
          {Math.ceil(filteredArticulos.length / articulosPerPage)}
        </span>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={
            currentPage ===
            Math.ceil(filteredArticulos.length / articulosPerPage)
          }
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
