import React, { useEffect, useState, useCallback, useContext } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Contexts from "../../context/Contexts"; // Importar el contexto

  // Función para obtener la fecha local sin la parte horaria
  const getLocalDate = () => {
    // const today = new Date();
    // console.log("today", today)
    // return today.toISOString().split('T')[0]; // Solo la parte de la fecha en formato YYYY-MM-DD
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Sumar 1 porque los meses son 0-indexados
    const day = today.getDate().toString().padStart(2, '0'); // Obtener el día
    return `${year}-${month}-${day}`; // Retorna en formato YYYY-MM-DD
  };

export default function CustomerOneShotForm() {
  const [customerOneShot, setCustomerOneShot] = useState({
    apellido: "",
    nombre: "",
    dni: "",
    domicilio: "",
    telefono: "",
    mail: "", // Nuevo campo de correo electrónico
    monto: "",
    fecha: getLocalDate(), // Usar la función para obtener la fecha local sin hora
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false); // Estado para saber si se está editando o no
  const userContext = useContext(Contexts.UserContext); // Context para obtener el usuario actual
  const apiUrl = process.env.REACT_APP_API_URL;

  const navigate = useNavigate();
  const params = useParams();



  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerOneShot({
      ...customerOneShot,
      [name]: value,
    });
  };

  const loadCustomerOneShot = useCallback(async (id) => {
    const res = await fetch(`${apiUrl}/caja/clientesoneshot/${id}/`, {
      credentials: "include",
    });
    const data = await res.json();
    setCustomerOneShot(data);
    setEditing(true);
   
  }, [apiUrl]);

  useEffect(() => {
    if (params.id) {
      loadCustomerOneShot(params.id);
    } else {
      setEditing(false);
      setCustomerOneShot({
        apellido: "",
        nombre: "",
        dni: "",
        domicilio: "",
        telefono: "",
        mail: "", // Reiniciar el campo de correo
        monto: "",
        fecha: getLocalDate(), // Fecha actual por defecto
      });
      // console.log("fecha", customerOneShot.fecha )
    }
  }, [params.id, loadCustomerOneShot]);

  // Función para validar los campos
  const validateFields = () => {
    const newErrors = {};

    if (!customerOneShot.apellido.match(/^[A-Za-z\s]+$/)) {
      newErrors.apellido = "El apellido solo puede contener letras.";
    }

    if (!customerOneShot.nombre.match(/^[A-Za-z\s]+$/)) {
      newErrors.nombre = "El nombre solo puede contener letras.";
    }

    if (!customerOneShot.dni.match(/^\d{1,8}$/)) {
      newErrors.dni = "El DNI debe ser un número de hasta 8 dígitos.";
    }

    if (!customerOneShot.mail.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      newErrors.mail = "El formato del correo no es válido.";
    }

    if (!customerOneShot.telefono.match(/^\d+$/)) {
      newErrors.telefono = "El teléfono solo puede contener números.";
    }

    if (!customerOneShot.monto.match(/^\d+(\.\d{1,2})?$/)) {
      newErrors.monto = "El monto solo puede contener números y hasta dos decimales.";
    }

    if (!customerOneShot.apellido || !customerOneShot.nombre || !customerOneShot.dni || !customerOneShot.telefono || !customerOneShot.mail || !customerOneShot.monto || !customerOneShot.domicilio) {
      newErrors.general = "Todos los campos son obligatorios.";
    }

    return newErrors;
  };

  const checkCustomerExists = async (dni) => {
    try {
      const res = await fetch(`${apiUrl}/clientespersonatabla/${dni}`, {
        credentials: "include",
      });
      if (res.status === 200) {
        const data = await res.json();
        if (data && data.numero) {
          return true; // Cliente encontrado
        }
      }
      return false;
    } catch (error) {
      console.error("Error al verificar el cliente:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newErrors = validateFields();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const customerExists = await checkCustomerExists(customerOneShot.dni);
    if (customerExists) {
      setErrors({ dni: "Cliente ya existe en el sistema" });
      setLoading(false);
      return;
    }

    try {
      customerOneShot.usuario_id = userContext.user.id; // Asignar el ID del usuario del contexto

      // Convertir todos los campos de texto a mayúsculas
      const customerOneShotUpperCase = {
        ...customerOneShot,
        apellido: customerOneShot.apellido.toUpperCase(),
        nombre: customerOneShot.nombre.toUpperCase(),
        dni: customerOneShot.dni.toUpperCase(),
        domicilio: customerOneShot.domicilio.toUpperCase(),
        telefono: customerOneShot.telefono.toUpperCase(),
        mail: customerOneShot.mail.toUpperCase(), // También convertir el correo
        monto: customerOneShot.monto, // El monto no necesita conversión a mayúsculas
        fecha: customerOneShot.fecha,
      };

      if (editing) {
        await fetch(`${apiUrl}/caja/clientesoneshot/${params.id}/`, {
          credentials: "include",
          method: "PUT",
          body: JSON.stringify(customerOneShotUpperCase),
          headers: {
            "Content-Type": "application/json",
          },
        });
        setEditing(false);
      } else {
        await fetch(`${apiUrl}/caja/clientesoneshot/`, {
          credentials: "include",
          method: "POST",
          body: JSON.stringify(customerOneShotUpperCase),
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      setLoading(false);
      navigate("/clientesoneshot");
    } catch (error) {
      console.error("Error al enviar los datos al backend:", error);
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Cliente OneShot" : "Agregar Cliente OneShot"}
      </h1>
      <Form onSubmit={handleSubmit} className="w-50">
        {errors.general && <p className="text-danger">{errors.general}</p>}

        <Form.Group className="mb-3">
          <Form.Label>Apellido</Form.Label>
          <Form.Control
            type="text"
            name="apellido"
            value={customerOneShot.apellido}
            onChange={handleChange}
            placeholder="Ingresa el apellido del cliente"
            className="my-input"
            isInvalid={!!errors.apellido}
          />
          <Form.Control.Feedback type="invalid">{errors.apellido}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            name="nombre"
            value={customerOneShot.nombre}
            onChange={handleChange}
            placeholder="Ingresa el nombre del cliente"
            className="my-input"
            isInvalid={!!errors.nombre}
          />
          <Form.Control.Feedback type="invalid">{errors.nombre}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>DNI</Form.Label>
          <Form.Control
            type="text"
            name="dni"
            value={customerOneShot.dni}
            onChange={handleChange}
            placeholder="Ingresa el DNI del cliente"
            className="my-input"
            isInvalid={!!errors.dni}
          />
          <Form.Control.Feedback type="invalid">{errors.dni}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Domicilio</Form.Label>
          <Form.Control
            type="text"
            name="domicilio"
            value={customerOneShot.domicilio}
            onChange={handleChange}
            placeholder="Ingresa el domicilio del cliente"
            className="my-input"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control
            type="text"
            name="telefono"
            value={customerOneShot.telefono}
            onChange={handleChange}
            placeholder="Ingresa el teléfono del cliente"
            className="my-input"
            isInvalid={!!errors.telefono}
          />
          <Form.Control.Feedback type="invalid">{errors.telefono}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Correo Electrónico</Form.Label>
          <Form.Control
            type="email"
            name="mail"
            value={customerOneShot.mail}
            onChange={handleChange}
            placeholder="Ingresa el correo electrónico del cliente"
            className="my-input"
            isInvalid={!!errors.mail}
          />
          <Form.Control.Feedback type="invalid">{errors.mail}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Monto</Form.Label>
          <Form.Control
            type="text"
            name="monto"
            value={customerOneShot.monto}
            onChange={handleChange}
            placeholder="Ingresa el monto del cliente"
            className="my-input"
            isInvalid={!!errors.monto}
          />
          <Form.Control.Feedback type="invalid">{errors.monto}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Fecha de caja</Form.Label>
          <Form.Control
            type="date"
            name="fecha"
            value={customerOneShot.fecha}
            onChange={handleChange}
            className="my-input"
          />
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          disabled={loading}
          style={{ position: "relative" }}
        >
          {editing ? (
            "Editar"
          ) : loading ? (
            <Spinner
              animation="border"
              size="sm"
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
