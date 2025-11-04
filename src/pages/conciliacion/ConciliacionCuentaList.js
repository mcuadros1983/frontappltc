import { useEffect, useState, useCallback } from "react";
import { Table, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function ConciliacionCuentaList() {
  const [cuentas, setCuentas] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const loadCuentas = useCallback(async () => {
    const res = await fetch(`${apiUrl}/conciliacion-cuentas`, {
      credentials: "include",
    });
    const data = await res.json();
    setCuentas(Array.isArray(data) ? data.sort((a, b) => a.id - b.id) : []);
  }, [apiUrl]);

  const handleDelete = async (id) => {
    const confirm = window.confirm("¿Deseás eliminar esta cuenta?");
    if (!confirm) return;

    await fetch(`${apiUrl}/conciliacion-cuentas/${id}`, {
      credentials: "include",
      method: "DELETE",
    });

    setCuentas((prev) => prev.filter((c) => c.id !== id));
  };

  useEffect(() => {
    loadCuentas();
  }, [loadCuentas]);

  return (
    <Container>
      <h1 className="my-list-title dark-text">Cuentas de Conciliación</h1>
      <Button
        variant="success"
        className="mb-3"
        onClick={() => navigate("/conciliacion-cuentas/new")}
      >
        Nueva Cuenta
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
          {cuentas.map((cuenta) => (
            <tr key={cuenta.id}>
              <td>{cuenta.id}</td>
              <td>{cuenta.descripcion}</td>
              <td className="text-center">
                <Button
                  variant="danger"
                  className="mx-2"
                  onClick={() => handleDelete(cuenta.id)}
                >
                  Eliminar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/conciliacion-cuentas/${cuenta.id}/edit`)}
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
