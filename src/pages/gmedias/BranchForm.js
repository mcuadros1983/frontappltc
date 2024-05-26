import React, { useEffect, useState } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
// import { createAuthenticatedRequest } from "../../utils/createAuthenticatedRequest";

export default function BranchForm() {
  const [branch, setBranch] = useState({
    nombre: "",
    codigo:""
  });

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false); //estado para saber si se esta editando o no

  const apiUrl = process.env.REACT_APP_API_URL;
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBranch({
      ...branch,
      [name]: value,
    });
  };

  const navigate = useNavigate();
  const params = useParams();

  const loadBranch = async (id) => {
    const res = await fetch(`${apiUrl}/sucursales/${id}`, {
      credentials: "include",
    });
    const data = await res.json();
    setBranch(data);
    setEditing(true);
  };

  useEffect(() => {
    if (params.id) {
      loadBranch(params.id);
    } else {
      setEditing(false);
      setBranch({
        nombre: "",
        codigo:"",
      });
    }
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault(); //cancela el comportamiento por defecto
    // Aquí puedes manejar la lógica de envío del formulario
    setLoading(true);

    if (editing) {
      //si esta editando
      await fetch(`${apiUrl}/sucursales/${params.id}`, {
        credentials:"include",
        method: "PUT",
        body: JSON.stringify(branch),
        headers: {
          "Content-Type": "application/json",
        },
      });
      setEditing(false);
    } else {
      //si no esta editando
      await fetch(`${apiUrl}/sucursales/`, {
        credentials:"include",
        method: "POST",
        body: JSON.stringify(branch),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    setLoading(false);
    navigate("/branches");
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Sucursal" : "Agregar Sucursal"}
      </h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          {/* <Form.Label>Nombre</Form.Label> */}
          <Form.Control
            type="text"
            name="nombre"
            value={branch.nombre}
            onChange={handleChange}
            placeholder="Ingresa el nombre de la sucursal"
            className="my-input"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          {/* <Form.Label>Nombre</Form.Label> */}
          <Form.Control
            type="text"
            name="codigo"
            value={branch.codigo}
            onChange={handleChange}
            placeholder="Ingresa el codigo de la sucursal"
            className="my-input"
          />
        </Form.Group>
        <Button
          variant="primary"
          type="submit"
          disabled={loading} // Desactiva el botón mientras se carga
          style={{ position: "relative" }} // Añade una posición relativa al botón
        >
          {
            editing ? (
              "Editar"
            ) : loading ? (
              <Spinner
                animation="border"
                size="sm" // Ajusta el tamaño del Spinner a "sm" (pequeño)
                role="status"
                aria-hidden="true"
              />
            ) : (
              "Guardar"
            )
            //"Guardar" // Si está editando muestra "Editar", si no "Guardar"
          }
        </Button>
      </Form>
    </Container>
  );
}
