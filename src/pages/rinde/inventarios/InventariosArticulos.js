import React, { useState, useEffect } from "react";
import { Table, Container, Button, FormControl } from "react-bootstrap";
import { useParams } from "react-router-dom";

const ArticulosInventario = () => {
  const [articulos, setArticulos] = useState([]);
  const [filteredArticulos, setFilteredArticulos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const params = useParams();

  const apiUrl = process.env.REACT_APP_API_URL;

  const loadArticulos = async (inventarioId) => {
    try {
      const res = await fetch(`${apiUrl}/inventario/${inventarioId}/articulos`, {
        credentials: "include",
      });
      const data = await res.json();

      setArticulos(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este artículo?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/articulos/${id}`, {
        credentials: "include",
        method: "DELETE"
      });

      if (res.ok) {
        setArticulos(articulos.filter(articulo => articulo.id !== id));
      } else {
        throw new Error("Error al eliminar el artículo");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = () => {
    const searchTermLower = searchTerm.toLowerCase();

    if (searchTermLower === "") {
      setFilteredArticulos(articulos);
    } else {
      const filtered = articulos.filter((articulo) => {
        return (
          articulo.articulocodigo.toLowerCase().includes(searchTermLower) ||
          articulo.articulodescripcion.toLowerCase().includes(searchTermLower)
        );
      });
      setFilteredArticulos(filtered);
    }
  };

  const handleSort = (columnName) => {
    setSortDirection(
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc"
    );

    setSortColumn(columnName);

    const sortedArticulos = [...filteredArticulos].sort((a, b) => {
      const valueA = a[columnName];
      const valueB = b[columnName];

      if (valueA < valueB) {
        return sortDirection === "asc" ? -1 : 1;
      } else if (valueA > valueB) {
        return sortDirection === "asc" ? 1 : -1;
      } else {
        return 0;
      }
    });

    setFilteredArticulos(sortedArticulos);
  };

  useEffect(() => {
    loadArticulos(params.inventarioId);
  }, [params.inventarioId]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, articulos]);

  return (
    <Container>
      <h1 className="my-list-title dark-text">Artículos de Inventario</h1>
      {/* <div className="mb-3">
        <FormControl
          type="text"
          placeholder="Buscar por código de artículo o descripción"
          className="mr-sm-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div> */}

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
              {/* <td>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(articulo.id)}
                >
                  Eliminar
                </Button>
              </td> */}
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ArticulosInventario;
