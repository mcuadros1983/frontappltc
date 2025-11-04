// LibroIVAList.jsx
import React, { useEffect, useState, useContext } from "react";
import { Table, Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Contexts from "../../context/Contexts";
import "../../components/css/LibroIVAList.css"; // ⬅️ nuevo

const LibroIVAList = () => {
  const [libros, setLibros] = useState([]);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  const { empresasTabla } = useContext(Contexts.DataContext);

  useEffect(() => {
    fetch(`${apiUrl}/librosiva`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setLibros(data));
  }, [apiUrl]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este libro?")) return;
    await fetch(`${apiUrl}/librosiva/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setLibros((prev) => prev.filter((libro) => libro.id !== id));
  };

  const getEmpresaNombre = (id) => {
    const emp = empresasTabla.find((e) => e.id === id);
    return emp ? emp.descripcion : "—";
  };

  return (
    <Container className="iva-page">
      <div className="iva-header d-flex justify-content-between align-items-center my-3">
        <h2 className="iva-title">Libros IVA</h2>
        <Button className="iva-btn" onClick={() => navigate("/librosiva/new")}>
          Nuevo
        </Button>
      </div>

      <div className="iva-tablewrap table-responsive">
        <Table striped bordered hover responsive className="iva-table mb-2">
          <thead>
            <tr>
              <th className="text-nowrap">ID</th>
              <th className="text-nowrap">Mes</th>
              <th className="text-nowrap">Año</th>
              <th className="text-nowrap">Empresa</th>
              <th className="text-center text-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {libros.map((libro) => (
              <tr key={libro.id}>
                <td>{libro.id}</td>
                <td>{libro.mes}</td>
                <td>{libro.anio}</td>
                <td>{getEmpresaNombre(libro.empresa_id)}</td>
                <td className="text-center">
                  <Button
                    variant="outline-danger"
                    className="mx-2 iva-btn-danger"
                    onClick={() => handleDelete(libro.id)}
                  >
                    Eliminar
                  </Button>
                  <Button
                    variant="outline-primary"
                    className="iva-btn-primary"
                    onClick={() => navigate(`/librosiva/${libro.id}/edit`)}
                  >
                    Editar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default LibroIVAList;
