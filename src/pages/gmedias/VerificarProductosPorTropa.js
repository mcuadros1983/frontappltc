import React, { useEffect, useState, useMemo } from "react";
import { Container, Table, Spinner, FormControl, Button, Form } from "react-bootstrap";

export default function VerificarProductosPorTropa() {
  const [productos, setProductos] = useState([]);
  const [agrupadosPorTropa, setAgrupadosPorTropa] = useState([]);
  const [categoriaFilter, setCategoriaFilter] = useState("");
  const [tropaFilter, setTropaFilter] = useState("");
  const [selectedTropas, setSelectedTropas] = useState([]);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [tropasDisponibles, setTropasDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [tropasPerPage] = useState(20);
  const [sortDirection, setSortDirection] = useState("asc");

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/productos`, {
          credentials: "include",
        });
        const data = await res.json();
        setProductos(data);

        const categorias = new Set();
        const tropas = new Set();
        data.forEach((producto) => {
          if (producto.categoria_producto) categorias.add(producto.categoria_producto);
          if (producto.tropa) tropas.add(producto.tropa);
        });
        setCategoriasDisponibles(Array.from(categorias).sort());
        setTropasDisponibles(Array.from(tropas).sort());
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [apiUrl]);

  useEffect(() => {
    const agrupados = {};

    productos.forEach((producto) => {
      const { tropa, categoria_producto, subcategoria, costo } = producto;
      if (!tropa) return;

      if (!agrupados[tropa]) {
        agrupados[tropa] = {
          total: 0,
          completosCategoria: true,
          completosSubcategoria: true,
          completosCosto: true,
          categorias: new Set(),
        };
      }

      agrupados[tropa].total += 1;
      if (!categoria_producto || categoria_producto === "") {
        agrupados[tropa].completosCategoria = false;
      } else {
        agrupados[tropa].categorias.add(categoria_producto);
      }

      if (!subcategoria || subcategoria === "") {
        agrupados[tropa].completosSubcategoria = false;
      }

      if (costo === null || costo === undefined || costo === "" || isNaN(costo)) {
        agrupados[tropa].completosCosto = false;
      }
    });

    const resultado = Object.entries(agrupados).map(([tropa, data]) => ({
      tropa,
      ...data,
      categorias: Array.from(data.categorias).join(", ")
    }));

    setAgrupadosPorTropa(resultado);
    setCurrentPage(1);
  }, [productos]);

  const handleSort = () => {
    const direction = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(direction);
    setAgrupadosPorTropa((prev) =>
      [...prev].sort((a, b) =>
        direction === "asc" ? a.tropa.localeCompare(b.tropa) : b.tropa.localeCompare(a.tropa)
      )
    );
  };

  const filteredData = useMemo(() => {
    return agrupadosPorTropa.filter((row) => {
      const matchesCategoria = categoriaFilter === "" || row.categorias.includes(categoriaFilter);
      const matchesTropa = tropaFilter === "" || row.tropa.includes(tropaFilter);
      const matchesSelectedTropas = selectedTropas.length === 0 || selectedTropas.includes(row.tropa);
      return matchesCategoria && matchesTropa && matchesSelectedTropas;
    });
  }, [agrupadosPorTropa, categoriaFilter, tropaFilter, selectedTropas]);

  const indexOfLast = currentPage * tropasPerPage;
  const indexOfFirst = indexOfLast - tropasPerPage;
  const currentRows = filteredData.slice(indexOfFirst, indexOfLast);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredData.length / tropasPerPage)) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const renderCheck = (cond) => (cond ? "✅" : "❌");

  return (
    <Container>
      <h2 className="my-4">Verificación de Productos por Tropa</h2>
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
        <div className="mb-3">FILTRAR POR CATEGORIA</div>
          <div className="mb-3">
            <Form.Select
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categoriasDisponibles.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </Form.Select>
          </div>


              <div className="mb-3">FILTRAR POR NUMERO DE TROPA</div>
          <div className="mb-3">
            <FormControl
              type="text"
              placeholder="Ingrese el número de tropa"
              value={tropaFilter}
              onChange={(e) => setTropaFilter(e.target.value)}
            />
          </div>

<div className="mb-3">SELECCIONE UNA O VARIAS TROPAS</div>
          <div className="mb-3">
            <Form.Select
              multiple
              value={selectedTropas}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions, (opt) => opt.value);
                setSelectedTropas(options);
              }}
            >
              {tropasDisponibles.map((tropa, idx) => (
                <option key={idx} value={tropa}>{tropa}</option>
              ))}
            </Form.Select>
          </div>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th style={{ cursor: "pointer" }} onClick={handleSort}>Tropa</th>
                <th>Cantidad de Productos</th>
                <th>Categoría</th>
                <th>Subcategoría</th>
                <th>Costo</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row) => (
                <tr key={row.tropa}>
                  <td>{row.tropa}</td>
                  <td>{row.total}</td>
                  <td>{renderCheck(row.completosCategoria)}</td>
                  <td>{renderCheck(row.completosSubcategoria)}</td>
                  <td>{renderCheck(row.completosCosto)}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-center align-items-center">
            <Button onClick={prevPage} disabled={currentPage === 1}>
              Anterior
            </Button>
            <span className="mx-3">
              Página {currentPage} de {Math.ceil(filteredData.length / tropasPerPage)}
            </span>
            <Button
              onClick={nextPage}
              disabled={currentPage === Math.ceil(filteredData.length / tropasPerPage)}
            >
              Siguiente
            </Button>
          </div>
        </>
      )}
    </Container>
  );
}
