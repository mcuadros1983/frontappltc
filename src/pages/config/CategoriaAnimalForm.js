import React, { useEffect, useState, useCallback } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useContext } from "react";
import Contexts from "../../context/Contexts";


const CategoriaAnimalForm = () => {
  const { categoriaAnimalTabla, setCategoriaAnimalTabla } = useContext(Contexts.DataContext);

  const [categoria, setCategoria] = useState({
    descripcion: "",
  });

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const params = useParams();

  const handleCancel = () => {
    navigate("/categorias-animales");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoria({ ...categoria, [name]: value });
  };

  const loadCategoria = useCallback(async (id) => {
    const res = await fetch(`${apiUrl}/categorias-animales/${id}`, { credentials: "include" });
    const data = await res.json();
    setCategoria(data);
    setEditing(true);
  }, [apiUrl]);

  useEffect(() => {
    if (params.id) {
      loadCategoria(params.id);
    } else {
      setEditing(false);
      setCategoria({ descripcion: "" });
    }
  }, [params.id, loadCategoria]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `${apiUrl}/categorias-animales/${params.id}`
      : `${apiUrl}/categorias-animales`;

    const res = await fetch(url, {
      credentials: "include",
      method,
      body: JSON.stringify(categoria),
      headers: { "Content-Type": "application/json" },
    });

    const nuevaCategoria = await res.json();

    if (editing) {
      const actualizadas = categoriaAnimalTabla.map((c) =>
        c.id === nuevaCategoria.id ? nuevaCategoria : c
      );
      setCategoriaAnimalTabla(actualizadas);
    } else {
      setCategoriaAnimalTabla([...categoriaAnimalTabla, nuevaCategoria]);
    }

    setLoading(false);
    navigate("/categorias-animales");
  };


  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Categoría Animal" : "Agregar Categoría Animal"}
      </h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            type="text"
            name="descripcion"
            value={categoria.descripcion}
            onChange={handleChange}
            placeholder="Ej: Novillo, Vaquillona"
            className="my-input"
            required
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

export default CategoriaAnimalForm;
