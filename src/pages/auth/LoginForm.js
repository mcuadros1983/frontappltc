import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button } from "react-bootstrap";
import Contexts from "../../context/Contexts";
import { createAuthenticatedRequest } from "../../utils/createAuthenticatedRequest";

const LoginForm = () => {
  const [credentials, setCredentials] = useState({ usuario: "", password: "" });
  // const { login } = useUser();
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  const context = useContext(Contexts.userContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prevCredentials) => ({
      ...prevCredentials,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await context.login(credentials); // Llamada a la función de inicio de sesión del contexto


      // Redirige a la página de inicio o dashboard después de iniciar sesión
      navigate("/dashboard");

    } catch (error) {
      alert(
        error.message ||
          "Error al iniciar sesión. Verifica tu usuario y contraseña."
      );
    }
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <h2 className="text-center mb-4">Iniciar Sesión</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formUsername">
            <Form.Label>Usuario</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingrese su usuario"
              name="usuario"
              value={credentials.usuario}
              onChange={handleChange}
              required
              className="mb-3"
            />
          </Form.Group>

          <Form.Group controlId="formPassword">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Ingrese su contraseña"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              className="mb-3"
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100 mt-3">
            Iniciar Sesión
          </Button>
        </Form>
      </div>
    </Container>
  );
};

export default LoginForm;
