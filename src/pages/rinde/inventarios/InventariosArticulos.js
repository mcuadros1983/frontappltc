import React, { useState, useEffect, useCallback } from "react";
import { Button, Table, Container, FormControl } from "react-bootstrap";
import { useParams } from "react-router-dom";

const ArticulosInventario = () => {
  const [articulos, setArticulos] = useState([]);
  const [filteredArticulos, setFilteredArticulos] = useState([]);
  const [nuevoCodigo, setNuevoCodigo] = useState("");
  const [nuevoPeso, setNuevoPeso] = useState("");
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

  const handleAgregarArticulo = async () => {
    if (!nuevoCodigo || !nuevoPeso) {
      alert("Completa el código y el peso.");
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/inventario/${params.inventarioId}/articulo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articulocodigo: nuevoCodigo.trim(),
          cantidadpeso: parseFloat(nuevoPeso),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setArticulos([...articulos, data.articulo]);
        setFilteredArticulos([...filteredArticulos, data.articulo]);
        setNuevoCodigo("");
        setNuevoPeso("");
      } else {
        alert("Error al agregar artículo.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

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

  const handleDeleteArticulo = async (articuloId) => {
    const confirmDelete = window.confirm("¿Estás seguro de eliminar este artículo?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `${apiUrl}/inventario/${params.inventarioId}/articulo/${articuloId}`,
        {
          method: "DELETE",
        }
      );
      if (res.ok) {
        setArticulos((prev) => prev.filter((a) => a.id !== articuloId));
        setFilteredArticulos((prev) => prev.filter((a) => a.id !== articuloId));
      } else {
        alert("Error al eliminar el artículo.");
      }
    } catch (error) {
      console.error("Error al eliminar artículo:", error);
    }
  };

  const handleEditArticulo = async (articulo) => {
    const nuevaCantidad = prompt(
      "Nueva cantidad/peso:",
      articulo.cantidadpeso
    );
    const nuevoPrecio = prompt("Nuevo precio:", articulo.precio);

    if (nuevaCantidad === null || nuevoPrecio === null) return;

    try {
      const res = await fetch(
        `${apiUrl}/inventario/articulo/${articulo.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cantidadpeso: parseFloat(nuevaCantidad),
            precio: parseFloat(nuevoPrecio),
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const actualizado = data.articulo;

        const nuevosArticulos = articulos.map((a) =>
          a.id === articulo.id ? actualizado : a
        );
        setArticulos(nuevosArticulos);
        setFilteredArticulos(nuevosArticulos);
      } else {
        alert("Error al editar el artículo.");
      }
    } catch (error) {
      console.error("Error al editar artículo:", error);
    }
  };


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

      <div className="mb-3">
        <FormControl
          placeholder="Código de artículo"
          className="mb-2"
          value={nuevoCodigo}
          onChange={(e) => setNuevoCodigo(e.target.value)}
        />
        <FormControl
          placeholder="Cantidad/Peso"
          type="number"
          step="0.01"
          className="mb-2"
          value={nuevoPeso}
          onChange={(e) => setNuevoPeso(e.target.value)}
        />
        <Button onClick={handleAgregarArticulo}>Agregar Artículo</Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Código de Artículo</th>
            <th>Descripción</th>
            <th>Cantidad/Peso</th>
            <th>Precio</th>
            <th>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredArticulos.map((articulo) => (
            <tr key={articulo.id}>
              <td>{articulo.articulocodigo}</td>
              <td>{articulo.articulodescripcion}</td>
              <td>{articulo.cantidadpeso}</td>
              <td>{articulo.precio}</td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => handleEditArticulo(articulo)}
                  className="mr-2"
                >
                  Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteArticulo(articulo.id)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ArticulosInventario;
