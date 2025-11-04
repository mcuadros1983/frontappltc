// Stock.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Table,
  Button,
  FormControl,
  Modal,
  ListGroup,
} from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../../context/Contexts";
import "../../../components/css/Stock.css"; // ⬅️ NUEVO

export default function Stock() {
  const [articulos, setArticulos] = useState([]);
  const [searchSucursal, setSearchSucursal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [articulosPerPage] = useState(100);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchDescription, setSearchDescription] = useState("");
  const [showInventarioModal, setShowInventarioModal] = useState(false);
  const [inventarios, setInventarios] = useState([]);
  const [selectedInventario, setSelectedInventario] = useState(null);

  const context = useContext(Contexts.DataContext);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    setSelectedInventario(null);
  }, [searchSucursal]);

  const fetchInventarios = async () => {
    try {
      const response = await fetch(`${apiUrl}/obtenerinventariosfiltrados`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sucursalId: searchSucursal }),
      });
      if (response.ok) {
        const data = await response.json();
        setInventarios(data);
      }
    } catch (error) {
      alert("Error al obtener los inventarios: " + error.message);
    }
  };

  const handleSort = (columnName) => {
    setSortDirection(
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc"
    );
    setSortColumn(columnName);

    const sorted = [...articulos].sort((a, b) => {
      let A = a[columnName];
      let B = b[columnName];
      if (typeof A === "undefined" || typeof B === "undefined") return 0;
      return sortDirection === "asc"
        ? String(A).localeCompare(String(B))
        : String(B).localeCompare(String(A));
    });

    setArticulos(sorted);
  };

  const isValidDate = (s) =>
    /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(s).toISOString().slice(0, 10) === s;

  const handleSearch = async () => {
    try {
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        return;
      }
      if (!searchSucursal) {
        alert("Por favor, seleccione una sucursal antes de buscar.");
        return;
      }
      if (!selectedInventario) {
        alert("Por favor, seleccione un inventario antes de continuar.");
        return;
      }

      const response = await fetch(`${apiUrl}/obtenerstock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fechaDesde: startDate,
          fechaHasta: endDate,
          sucursalId: searchSucursal,
          searchTerm: searchDescription,
          inventarioId: selectedInventario.id,
        }),
      });
      if (!response.ok) throw new Error("Error al filtrar los artículos");

      const data = await response.json();
      setArticulos(data);
      setCurrentPage(1);
    } catch (e) {
      console.error(e);
    }
  };

  const indexOfLast = currentPage * articulosPerPage;
  const indexOfFirst = indexOfLast - articulosPerPage;
  const filtered = articulos.filter((a) =>
    (a.descripcion || "").toLowerCase().includes(searchDescription.toLowerCase())
  );
  const current = filtered.slice(indexOfFirst, indexOfLast);

  const nextPage = () => {
    if (currentPage < Math.ceil(filtered.length / articulosPerPage)) {
      setCurrentPage((p) => p + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  return (
    <Container className="stock-page">
      <h1 className="stock-title">Stock</h1>

      {/* Filtros principales */}
      <div className="stock-toolbar d-flex flex-wrap align-items-end gap-3 mb-3">
        <div className="mx-2 my-2">
          <label className="d-block">Sucursal</label>
          <FormControl
            as="select"
            value={searchSucursal}
            onChange={(e) => setSearchSucursal(e.target.value)}
            className="form-control my-input"
            style={{ minWidth: 260 }}
          >
            <option value="">Seleccione una sucursal</option>
            {context.sucursalesTabla.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </FormControl>
        </div>

        <div className="mx-2 my-2">
          <label className="d-block">DESDE</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-control my-input text-center"
          />
        </div>

        <div className="mx-2 my-2">
          <label className="d-block">HASTA</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-control my-input text-center"
          />
        </div>

        <div className="mx-2 my-2">
          <label className="d-block">&nbsp;</label>
          <Button
            onClick={() => {
              if (!searchSucursal) {
                alert("Seleccione una sucursal antes de elegir inventario.");
              } else {
                fetchInventarios();
                setShowInventarioModal(true);
              }
            }}
            className="stock-btn"
          >
            Seleccionar Inventario
          </Button>
        </div>
      </div>

      {/* Inventario seleccionado + hint */}
      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
        <div className="stock-selected mx-2 my-2">
          {selectedInventario
            ? `Inventario: Mes ${selectedInventario.mes}, Año ${selectedInventario.anio}`
            : "Ningún inventario seleccionado"}
        </div>
        <div className="text-muted small mx-2 my-2">
          Desde (inicio del período) / Hasta (fecha actual)
        </div>
      </div>

      {/* Buscador por descripción */}
      <div className="d-flex flex-wrap align-items-end gap-3 mb-3">
        <div className="mx-2 my-2">
          <label className="d-block">Descripción</label>
          <FormControl
            type="text"
            placeholder="Buscar por descripción"
            value={searchDescription}
            onChange={(e) => setSearchDescription(e.target.value)}
            className="form-control my-input"
            style={{ minWidth: 260 }}
          />
        </div>
        <div className="mx-2 my-2">
          <label className="d-block">&nbsp;</label>
          <Button onClick={handleSearch} className="stock-btn">
            Buscar
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="stock-tablewrap table-responsive">
        <Table striped bordered hover className="mb-2 stock-table">
          <thead>
            <tr>
              <th className="st-th-sort" onClick={() => handleSort("codigo")}>
                Código
              </th>
              <th className="st-th-sort" onClick={() => handleSort("descripcion")}>
                Descripción
              </th>
              <th className="st-th-sort text-end" onClick={() => handleSort("cantidad")}>
                Cantidad
              </th>
            </tr>
          </thead>
          <tbody>
            {current.map((art, idx) => (
              <tr key={`${art.codigo}-${idx}`}>
                <td>{art.codigo}</td>
                <td>{art.descripcion}</td>
                <td className="text-end">{art.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="d-flex justify-content-center align-items-center stock-pager">
        <Button onClick={prevPage} disabled={currentPage === 1} variant="light">
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de {Math.ceil(filtered.length / articulosPerPage) || 1}
        </span>
        <Button
          onClick={nextPage}
          disabled={
            currentPage === Math.ceil(filtered.length / articulosPerPage) || filtered.length === 0
          }
          variant="light"
        >
          <BsChevronRight />
        </Button>
      </div>

      {/* Modal de Inventarios */}
      <Modal show={showInventarioModal} onHide={() => setShowInventarioModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Seleccionar Inventario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {inventarios.map((inv) => (
              <ListGroup.Item
                key={inv.id}
                action
                className="stock-inv-item"
                onClick={() => {
                  setSelectedInventario(inv);
                  setShowInventarioModal(false);
                }}
              >
                {`Mes: ${inv.mes}, Año: ${inv.anio}`}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
