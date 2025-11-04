import React, { useState, useEffect, useCallback } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

export default function ArticulosPrecios() {
  const [articulosConPrecios, setArticulosConPrecios] = useState([]);
  const [filteredArticulos, setFilteredArticulos] = useState([]); // Estado para los artículos filtrados
  const [currentPage, setCurrentPage] = useState(1);
  const [articulosPerPage] = useState(1000);
  const [codigoBarrasFilter, setCodigoBarrasFilter] = useState("");
  const [descripcionFilter, setDescripcionFilter] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const apiUrl = process.env.REACT_APP_API_URL;

  const obtenerArticulosPrecios = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/obtenerarticulosprecios`,{ credentials: "include" });
      if (!response.ok) {
        throw new Error("Error al obtener los artículos con precios");
      }
      const data = await response.json();
      setArticulosConPrecios(data);
      setFilteredArticulos(data); // Inicialmente, los artículos filtrados son iguales a todos los artículos
    } catch (error) {
      console.error(error);
    }
  }, [apiUrl]);

  useEffect(() => {
    obtenerArticulosPrecios();
  }, [obtenerArticulosPrecios]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCodigoBarrasFilterChange = (e) => {
    setCodigoBarrasFilter(e.target.value);
    filterArticulos(e.target.value, descripcionFilter);
  };

  const handleDescripcionFilterChange = (e) => {
    setDescripcionFilter(e.target.value);
    filterArticulos(codigoBarrasFilter, e.target.value);
  };

  const filterArticulos = (codigoBarras, descripcion) => {
    const filtered = articulosConPrecios.filter((articulo) => {
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

      if (columnName === "precio") {
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
  <Container className="vt-page">
    <h1 className="my-list-title dark-text vt-title">Artículos con Precios</h1>

    {/* Filtros */}
    <div className="vt-toolbar mb-3 d-flex flex-wrap align-items-end gap-3">
      <div className="d-inline-block w-auto mx-2">
        <label className="vt-label d-block">Código de barras</label>
        <FormControl
          type="text"
          placeholder="Filtrar por código de barras"
          value={codigoBarrasFilter}
          onChange={handleCodigoBarrasFilterChange}
          className="vt-input"
          style={{ minWidth: 250 }}
        />
      </div>

      <div className="d-inline-block w-auto mx-2">
        <label className="vt-label d-block">Descripción</label>
        <FormControl
          type="text"
          placeholder="Filtrar por descripción"
          value={descripcionFilter}
          onChange={handleDescripcionFilterChange}
          className="vt-input"
          style={{ minWidth: 250 }}
        />
      </div>
    </div>

    {/* Tabla */}
    <div className="vt-tablewrap table-responsive">
      <Table striped bordered hover className="mb-2">
        <thead>
          <tr>
            <th onClick={() => handleSort("codigobarra")} className="vt-th-sort">
              Código de Barras
            </th>
            <th onClick={() => handleSort("descripcion")} className="vt-th-sort">
              Descripción del Artículo
            </th>
            <th onClick={() => handleSort("precio")} className="vt-th-sort text-end">
              Precio
            </th>
          </tr>
        </thead>
        <tbody>
          {currentArticulos.map((articulo) => (
            <tr key={articulo.id}>
              <td>{articulo.Articulotabla.codigobarra}</td>
              <td>{articulo.Articulotabla.descripcion}</td>
              <td className="text-end">{articulo.precio}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>

    {/* Paginación */}
    <div className="d-flex justify-content-center align-items-center vt-pager">
      <Button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="light"
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
          currentPage === Math.ceil(filteredArticulos.length / articulosPerPage)
        }
        variant="light"
      >
        <BsChevronRight />
      </Button>
    </div>
  </Container>
);

}
