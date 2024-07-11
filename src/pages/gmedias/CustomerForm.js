import React, { useEffect, useState, useCallback } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
// import { createAuthenticatedRequest } from "../../utils/createAuthenticatedRequest";

export default function CustomerForm() {
  const [customer, setCustomer] = useState({
    nombre: "",
    margen: "", // Asegúrate de incluir todos los campos necesarios aquí
  });

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false); //estado para saber si se esta editando o no

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer({
      ...customer,
      [name]: value,
    });
  };

  const navigate = useNavigate();
  const params = useParams();

  const loadCustomer = useCallback(async (id) => {
    const res = await fetch(`${apiUrl}/clientes/${id}/`, {
      credentials: "include",
    });
    const data = await res.json();
    setCustomer(data);
    setEditing(true);
  }, [apiUrl]);

  useEffect(() => {
    if (params.id) {
      loadCustomer(params.id);
    } else {
      setEditing(false);
      setCustomer({
        nombre: "",
      });
    }
  }, [params.id, loadCustomer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validar el formato del margen
    const regex = /^\d+(\.\d{1,2})?$/;
    // Validar el formato del margen solo si el campo no está vacío
    if (customer.margen && !regex.test(customer.margen)) {
      // Si el formato no es correcto y el campo no está vacío, muestra un mensaje de error y detén el envío del formulario
      alert(
        "El formato del margen no es válido. Debe ser un número con hasta dos decimales."
      );
      setLoading(false);
      return;
    }

    try {
      if (editing) {
        await fetch(`${apiUrl}/clientes/${params.id}/`, {
          credentials: "include",
          method: "PUT",
          body: JSON.stringify(customer),
          headers: {
            "Content-Type": "application/json",
          },
        });
        setEditing(false);
      } else {
        // Obtener todos los clientes
        const response = await fetch(`${apiUrl}/clientes/`, {
          credentials: "include",
        });
        console.log("lista", response)
        // if (!response.ok) {
        //   throw new Error("Error al obtener la lista de clientes");
        // }
        const existingCustomers = await response.json();

        if (Array.isArray(existingCustomers)) {
          // Verificar si el nombre del cliente ya existe
          const customerNames = existingCustomers.map(
            (customer) => customer.nombre
          );
          if (customerNames.includes(customer.nombre)) {
            alert(
              "El nombre del cliente ya existe. Por favor, ingresa un nombre diferente."
            );
            setLoading(false);
            return;
          }
        }
        console.log("datos", customer, apiUrl)
        const nuevoCliente = await fetch(`${apiUrl}/clientes-new/`, {
          credentials: "include",
          method: "POST",
          body: JSON.stringify(customer),
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("nuevoCliente", nuevoCliente)
      }
      setLoading(false);
      navigate("/customers");
    } catch (error) {
      // Manejar errores de la solicitud fetch
      console.error("Error al enviar los datos al backend:", error);
      setLoading(false);
      // Aquí podrías mostrar un mensaje de error al usuario si lo deseas
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Cliente" : "Agregar Cliente"}
      </h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          {/* <Form.Label>Nombre</Form.Label> */}
          <Form.Control
            type="text"
            name="nombre"
            value={customer.nombre}
            onChange={handleChange}
            placeholder="Ingresa el nombre del cliente"
            className="my-input"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            name="margen"
            value={customer.margen}
            onChange={handleChange}
            placeholder="Ingresa el margen de costo ej 5 para 5%"
            className="my-input"
          />
        </Form.Group>
        <Button
          variant="primary"
          type="submit"
          disabled={loading} // Desactiva el botón mientras se carga
          style={{ position: "relative" }} // Añade una posición relativa al botón
        >
          {editing ? (
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
          )}
        </Button>
      </Form>
    </Container>
  );
}
