import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Table, Button } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

export default function Formulas() {
  const { formulaId } = useParams();
  const [formulas, setFormulas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [formulasPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const apiUrl = process.env.REACT_APP_API_URL;

  const navigate = useNavigate();

  useEffect(() => {
    obtenerFormulas();
  }, []);

  const obtenerFormulas = async () => {
    try {
      const response = await fetch(`${apiUrl}/obtenerformulas`);
      if (response.ok) {
        const data = await response.json();
        setFormulas(data);
      } else {
        throw new Error("Error al obtener las fórmulas");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSort = (columnName) => {
    setSortDirection(
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc"
    );
    setSortColumn(columnName);

    const sortedFormulas = [...formulas].sort((a, b) => {
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

    setFormulas(sortedFormulas);
  };

  const nextPage = () => {
    if (currentPage < Math.ceil(formulas.length / formulasPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleEliminarFormula = async (formulaId) => {
    try {

      
    const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar esta fórmula?");
    if (!confirmacion) return; // Si el usuario cancela, no procedemos con la eliminación
    
      const response = await fetch(`${apiUrl}/eliminarformula/${formulaId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        // Eliminar la fórmula de la lista
        setFormulas(formulas.filter(formula => formula.id !== formulaId));
        // console.log("Fórmula eliminada con éxito");
      } else {
        throw new Error("Error al eliminar la fórmula");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Función para redireccionar al hacer doble clic en la fila
  const handleRowDoubleClick = (formulaId) => {
    navigate(`/formulas/${formulaId}`);
  };

  return (
    <Container>
      <h1 className="my-list-title dark-text">Fórmulas</h1>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>
              ID
            </th>
            <th
              onClick={() => handleSort("codigobarraformula")}
              style={{ cursor: "pointer" }}
            >
              Codigo Articulo
            </th>
            <th
              onClick={() => handleSort("descripcionformula")}
              style={{ cursor: "pointer" }}
            >
              Descripción
            </th>
            <th>Operaciones</th> {/* Nueva columna para las operaciones */}
          </tr>
        </thead>
        <tbody>
          {formulas.map((formula) => (
            <tr key={formula.id} onDoubleClick={() => handleRowDoubleClick(formula.id)}>
              <td>{formula.id}</td>
              <td>{formula.codigobarraformula}</td>
              <td>{formula.descripcionformula}</td>
              <td>
                <Button variant="danger" onClick={() => handleEliminarFormula(formula.id)}>
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
          Página {currentPage} de {Math.ceil(formulas.length / formulasPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={
            currentPage === Math.ceil(formulas.length / formulasPerPage)
          }
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
