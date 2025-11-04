import { useEffect, useState, useCallback } from "react";
import { Table, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function ConciliacionCriterioList() {
  const [criterios, setCriterios] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const loadCriterios = useCallback(async () => {
    const res = await fetch(`${apiUrl}/conciliacion-criterios`, {
      credentials: "include",
    });
    const data = await res.json();
    if (Array.isArray(data)) setCriterios(data.sort((a, b) => a.id - b.id));
  }, [apiUrl]);

  const handleDelete = async (id) => {
    const confirm = window.confirm("¿Deseás eliminar este criterio?");
    if (!confirm) return;

    await fetch(`${apiUrl}/conciliacion-criterios/${id}`, {
      credentials: "include",
      method: "DELETE",
    });

    setCriterios((prev) => prev.filter((cr) => cr.id !== id));
  };

  useEffect(() => {
    loadCriterios();
  }, [loadCriterios]);

  return (
    <Container>
      <h1 className="my-list-title dark-text">Criterios de Conciliación</h1>
      <Button
        variant="success"
        className="mb-3"
        onClick={() => navigate("/conciliacion-criterios/new")}
      >
        Nuevo Criterio
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Operación</th>
            <th>Criterio</th>
            <th>Rubro ID</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {criterios.map((cr) => (
            <tr key={cr.id}>
              <td>{cr.id}</td>
              <td>{cr.operacion}</td>
              <td>{cr.criterio}</td>
              <td>{cr.rubro_id}</td>
              <td className="text-center">
                <Button 
                  variant="danger"
                  className="mx-2"
                  onClick={() => handleDelete(cr.id)}
                >
                  Eliminar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/conciliacion-criterios/${cr.id}/edit`)}
                >
                  Editar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
