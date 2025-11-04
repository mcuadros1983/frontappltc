import React, { useEffect, useState, useCallback } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useContext } from "react";
import Contexts from "../../context/Contexts";


const EmpresaForm = () => {
  const { empresasTabla, setEmpresasTabla } = useContext(Contexts.DataContext);

  const [empresa, setEmpresa] = useState({
    descripcion: "",
    cuit: "",
    nombrecorto: "",
  });

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const params = useParams();

  const handleCancel = () => {
    navigate("/empresas");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmpresa({ ...empresa, [name]: value });
  };

  const loadEmpresa = useCallback(async (id) => {
    const res = await fetch(`${apiUrl}/empresas/${id}`, { credentials: "include" });
    const data = await res.json();
    setEmpresa(data);
    setEditing(true);
  }, [apiUrl]);

  useEffect(() => {
    if (params.id) {
      loadEmpresa(params.id);
    } else {
      setEditing(false);
      setEmpresa({ descripcion: "", cuit: "", nombrecorto: "" });
    }
  }, [params.id, loadEmpresa]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `${apiUrl}/empresas/${params.id}`
      : `${apiUrl}/empresas`;

    const res = await fetch(url, {
      credentials: "include",
      method,
      body: JSON.stringify(empresa),
      headers: { "Content-Type": "application/json" },
    });

    const nuevaEmpresa = await res.json();

    if (editing) {
      const actualizadas = empresasTabla.map((e) =>
        e.id === nuevaEmpresa.id ? nuevaEmpresa : e
      );
      setEmpresasTabla(actualizadas);
    } else {
      setEmpresasTabla([...empresasTabla, nuevaEmpresa]);
    }

    setLoading(false);
    navigate("/empresas");
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Empresa" : "Agregar Empresa"}
      </h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            type="text"
            name="descripcion"
            value={empresa.descripcion}
            onChange={handleChange}
            placeholder="Nombre completo de la empresa"
            className="my-input"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>CUIT</Form.Label>
          <Form.Control
            type="text"
            name="cuit"
            value={empresa.cuit}
            onChange={handleChange}
            placeholder="Ej: 30-12345678-9"
            className="my-input"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Nombre Corto</Form.Label>
          <Form.Control
            type="text"
            name="nombrecorto"
            value={empresa.nombrecorto}
            onChange={handleChange}
            placeholder="Opcional (ej. La Tradición)"
            className="my-input"
          />
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          disabled={loading}
          style={{ marginRight: "5px" }}
        >
          {loading ? <Spinner animation="border" size="sm" /> : editing ? "Editar" : "Guardar"}
        </Button>

        {editing && (
          <Button variant="secondary" onClick={handleCancel}>
            Cancelar
          </Button>
        )}
      </Form>
    </Container>
  );
};

export default EmpresaForm;
