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
// import { useNavigate } from "react-router-dom";
import Contexts from "../../../context/Contexts";

export default function Stock() {
  const [articulos, setArticulos] = useState([]);
  const [searchSucursal, setSearchSucursal] = useState("");
  // const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [articulosPerPage] = useState(100);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchDescription, setSearchDescription] = useState(""); // Estado para el término de búsqueda de la descripción
  const [showInventarioModal, setShowInventarioModal] = useState(false);
  const [inventarios, setInventarios] = useState([]);
  const [selectedInventario, setSelectedInventario] = useState(null);

  const context = useContext(Contexts.DataContext);
  // const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Este efecto se activa cada vez que cambia el valor de searchSucursal
  useEffect(() => {
    setSelectedInventario(null); // Resetea el inventario seleccionado cuando cambia la sucursal
  }, [searchSucursal]);
  const fetchInventarios = async () => {
    try {
      const response = await fetch(`${apiUrl}/obtenerinventariosfiltrados`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sucursalId: searchSucursal }),
      });

      if (response.ok) {
        const data = await response.json();
        setInventarios(data);

        // console.log("data", data);
      } else {
        return;
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

    const sortedArticulos = [...articulos].sort((a, b) => {
      let valueA = a[columnName];
      let valueB = b[columnName];

      if (typeof valueA === "undefined" || typeof valueB === "undefined") {
        return 0;
      }

      return sortDirection === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });

    setArticulos(sortedArticulos);
  };

  const isValidDate = (dateString) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;
    const date = new Date(dateString);
    if (!date.getTime()) return false;
    return date.toISOString().slice(0, 10) === dateString;
  };

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

      // Verifica si un inventario ha sido seleccionado
      if (!selectedInventario) {
        alert("Por favor, seleccione un inventario antes de continuar.");
        return;
      }

      const response = await fetch(`${apiUrl}/obtenerstock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fechaDesde: startDate,
          fechaHasta: endDate,
          sucursalId: searchSucursal,
          searchTerm: searchDescription, // Agregar el término de búsqueda de la descripción
          inventarioId: selectedInventario.id, // ID del inventario seleccionado
        }),
      });
      if (response.ok) {
        const data = await response.json();
        // console.log("Filtered data", data);
        setArticulos(data);
        setCurrentPage(1);
      } else {
        throw new Error("Error al filtrar los artículos");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const indexOfLastArticulo = currentPage * articulosPerPage;
  const indexOfFirstArticulo = indexOfLastArticulo - articulosPerPage;
  const filteredArticulos = articulos.filter((articulo) =>
    articulo.descripcion.toLowerCase().includes(searchDescription.toLowerCase())
  );
  const currentArticulos = filteredArticulos.slice(
    indexOfFirstArticulo,
    indexOfLastArticulo
  );

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredArticulos.length / articulosPerPage)) {
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
      <h1 className="my-list-title dark-text">Stock</h1>
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
        <Button
          onClick={() => {
            if (!searchSucursal) {
              alert(
                "Por favor, seleccione una sucursal antes de seleccionar un inventario."
              );
            } else {
              fetchInventarios();
              setShowInventarioModal(true);
            }
          }}
        >
          Seleccionar Inventario
        </Button>
      </div>

      <div className="mb-3">
        {selectedInventario
          ? `Inventario Seleccionado: Mes ${selectedInventario.mes}, Año ${selectedInventario.anio}`
          : "Ningún inventario seleccionado"}
      </div>

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
      <div className="d-inline-block w-auto ml-2 mb-2">
        Desde ( Fecha inicio del nuevo periodo ) / Hasta ( Fecha actual )
      </div>
      <div className="d-inline-block w-auto ml-2 mb-2"></div>

      <div className="mb-3">
        <FormControl
          type="text"
          placeholder="Buscar por descripción"
          value={searchDescription}
          onChange={(e) => setSearchDescription(e.target.value)}
          className="mr-2"
          style={{ width: "25%" }}
        />
      </div>

      <div className="mb-3">
        <Button onClick={handleSearch}>Buscar</Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th
              onClick={() => handleSort("codigo")}
              style={{ cursor: "pointer" }}
            >
              Código
            </th>
            <th
              onClick={() => handleSort("descripcion")}
              style={{ cursor: "pointer" }}
            >
              Descripción
            </th>
            <th
              onClick={() => handleSort("cantidad")}
              style={{ cursor: "pointer" }}
            >
              Cantidad
            </th>
          </tr>
        </thead>
        <tbody>
          {currentArticulos.map((articulo, index) => (
            <tr key={index}>
              <td>{articulo.codigo}</td>
              <td>{articulo.descripcion}</td>
              <td>{articulo.cantidad}</td>
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
          {Math.ceil(filteredArticulos.length / articulosPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={
            currentPage ===
            Math.ceil(filteredArticulos.length / articulosPerPage)
          }
        >
          <BsChevronRight />
        </Button>
      </div>

      <Modal
        show={showInventarioModal}
        onHide={() => setShowInventarioModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Seleccionar Inventario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {inventarios.map((inventario) => (
              <ListGroup.Item
                key={inventario.id}
                action
                onClick={() => {
                  setSelectedInventario(inventario);
                  setShowInventarioModal(false);
                }}
              >
                {`Mes: ${inventario.mes}, Año: ${inventario.anio}`}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
