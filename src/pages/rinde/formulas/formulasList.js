import React, { useState, useEffect, useCallback } from "react";
// import { useParams } from "react-router-dom";
import { Container, Table, Button } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

export default function Formulas() {
  // const { formulaId } = useParams();
  const [formulas, setFormulas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [formulasPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const apiUrl = process.env.REACT_APP_API_URL;

  const navigate = useNavigate();



  const obtenerFormulas = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/obtenerformulas`, { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setFormulas(data);
      } else {
        throw new Error("Error al obtener las fórmulas");
      }
    } catch (error) {
      console.error(error);
    }
  }, [apiUrl]);

  useEffect(() => {
    obtenerFormulas();
  }, [obtenerFormulas]);


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
        credentials: "include",
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
  <Container className="vt-page">
    <h1 className="my-list-title dark-text vt-title">Fórmulas</h1>

    <div className="vt-tablewrap table-responsive">
      <Table striped bordered hover className="mb-2">
        <thead>
          <tr>
            <th onClick={() => handleSort("id")} className="vt-th-sort">ID</th>
            <th onClick={() => handleSort("codigobarraformula")} className="vt-th-sort">
              Código Artículo
            </th>
            <th onClick={() => handleSort("descripcionformula")} className="vt-th-sort">
              Descripción
            </th>
            <th className="text-center">Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {formulas.map((formula) => (
            <tr
              key={formula.id}
              onDoubleClick={() => handleRowDoubleClick(formula.id)}
              className="vt-row"
            >
              <td>{formula.id}</td>
              <td>{formula.codigobarraformula}</td>
              <td>{formula.descripcionformula}</td>
              <td className="text-center">
                <Button
                  variant="danger"
                  size="sm"
                  className="vt-btn-danger"
                  onClick={() => handleEliminarFormula(formula.id)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>

    <div className="d-flex justify-content-center align-items-center vt-pager">
      <Button onClick={prevPage} disabled={currentPage === 1} variant="light">
        <BsChevronLeft />
      </Button>
      <span className="mx-2">
        Página {currentPage} de {Math.ceil(formulas.length / formulasPerPage) || 1}
      </span>
      <Button
        onClick={nextPage}
        disabled={currentPage === Math.ceil(formulas.length / formulasPerPage)}
        variant="light"
      >
        <BsChevronRight />
      </Button>
    </div>
  </Container>
);
}
