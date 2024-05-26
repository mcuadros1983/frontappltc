import React, { useState, useEffect, useCallback } from "react";
import { Table, Container, FormControl } from "react-bootstrap";
import { useParams } from "react-router-dom";

const ArticulosInventario = () => {
  const [articulos, setArticulos] = useState([]);
  const [filteredArticulos, setFilteredArticulos] = useState([]);
  // const [searchTerm, setSearchTerm] = useState("");
  // const [sortColumn, setSortColumn] = useState(null);
  // const [sortDirection, setSortDirection] = useState("asc");

  const params = useParams();

  const apiUrl = process.env.REACT_APP_API_URL;

  const loadArticulos = useCallback(async (inventarioId) => {
    try {
      const res = await fetch(`${apiUrl}/inventario/${inventarioId}/articulos`, {
        credentials: "include",
      });
      const data = await res.json();
      setArticulos(data);
      setFilteredArticulos(data); // Set initial filtered <state> </state>
    } catch (error) {
      console.error(error);
    }
  }, [apiUrl]); // Asumiendo que apiUrl podría cambiar, lo cual es poco común
  
  const handleSearch = (searchTerm) => {
    const searchTermLower = searchTerm.toLowerCase();
    if (searchTermLower === "") {
      setFilteredArticulos(articulos);
    } else {
      const filtered = articulos.filter((articulo) =>
        articulo.articulocodigo.toLowerCase().includes(searchTermLower) ||
        articulo.articulodescripcion.toLowerCase().includes(searchTermLower)
      );
      setFilteredArticulos(filtered);
    }
  }; 

  useEffect(() => {
    loadArticulos(params.inventarioId);
  }, [params.inventarioId, loadArticulos]);
  
  // const handleDelete = async (id) => {
  //   const confirmDelete = window.confirm(
  //     "¿Estás seguro de que deseas eliminar este artículo?"
  //   );

  //   if (!confirmDelete) {
  //     return;
  //   }

  //   try {
  //     const res = await fetch(`${apiUrl}/articulos/${id}`, {
  //       credentials: "include",
  //       method: "DELETE"
  //     });

  //     if (res.ok) {
  //       setArticulos(articulos.filter(articulo => articulo.id !== id));
  //     } else {
  //       throw new Error("Error al eliminar el artículo");
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

 

  // const handleSort = (columnName) => {
  //   setSortDirection(
  //     columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc"
  //   );

  //   setSortColumn(columnName);

  //   const sortedArticulos = [...filteredArticulos].sort((a, b) => {
  //     const valueA = a[columnName];
  //     const valueB = b[columnName];

  //     if (valueA < valueB) {
  //       return sortDirection === "asc" ? -1 : 1;
  //     } else if (valueA > valueB) {
  //       return sortDirection === "asc" ? 1 : -1;
  //     } else {
  //       return 0;
  //     }
  //   });

  //   setFilteredArticulos(sortedArticulos);
  // };



  return (
    <Container>
      <h1 className="my-list-title dark-text">Artículos de Inventario</h1>
      <div className="mb-3">
        <FormControl
          type="text"
          placeholder="Buscar por código o descripción"
          onChange={(e) => handleSearch(e.target.value)}
          className="mb-3"
        />
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Código de Artículo</th>
            <th>Descripción</th>
            <th>Cantidad/Peso</th>
            <th>Precio</th>
            {/* <th>Operaciones</th> */}
          </tr>
        </thead>
        <tbody>
          {filteredArticulos.map((articulo) => (
            <tr key={articulo.id}>
              <td>{articulo.articulocodigo}</td>
              <td>{articulo.articulodescripcion}</td>
              <td>{articulo.cantidadpeso}</td>
              <td>{articulo.precio}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ArticulosInventario;
