import { useEffect, useState, useCallback } from "react";
import { Table, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function ConciliacionRubroList() {
  const [rubros, setRubros] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const loadRubros = useCallback(async () => {
    const res = await fetch(`${apiUrl}/conciliacion-rubros`, {
      credentials: "include",
    });
    const data = await res.json();
    setRubros(Array.isArray(data) ? data.sort((a, b) => a.id - b.id) : []);
  }, [apiUrl]);

  const handleDelete = async (id) => {
    const confirm = window.confirm("¿Deseás eliminar este rubro?");
    if (!confirm) return;

    await fetch(`${apiUrl}/conciliacion-rubros/${id}`, {
      credentials: "include",
      method: "DELETE",
    });

    setRubros((prev) => prev.filter((r) => r.id !== id));
  };

  useEffect(() => {
    loadRubros();
  }, [loadRubros]);

  return (
    <Container>
      <h1 className="my-list-title dark-text">Rubros de Conciliación</h1>
      <Button variant="success" className="mb-3" onClick={() => navigate("/conciliacion-rubros/new")}>
        Nuevo Rubro
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Descripción</th>
            <th>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {rubros.map((rubro) => (
            <tr key={rubro.id}>
              <td>{rubro.id}</td>
              <td>{rubro.descripcion}</td>
              <td className="text-center">
                <Button variant="danger" className="mx-2" onClick={() => handleDelete(rubro.id)}>
                  Eliminar
                </Button>
                <Button variant="primary" onClick={() => navigate(`/conciliacion-rubros/${rubro.id}/edit`)}>
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
