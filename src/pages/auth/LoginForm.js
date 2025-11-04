// LoginForm.jsx (cambios marcados)
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button } from "react-bootstrap";
import Contexts from "../../context/Contexts";
import { useSecurity } from "../../security/SecurityContext"; // 👈 NUEVO

const LoginForm = () => {
  const [credentials, setCredentials] = useState({ usuario: "", password: "" });
  const navigate = useNavigate();
  const context = useContext(Contexts.UserContext);
  const { setUser: setSecUser } = useSecurity();            // 👈 NUEVO

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1) hace login vía UserContext (devuelve el user)
      const loggedUser = await context.login(credentials);

      // 2) sincroniza SecurityContext (el que mira ProtectedRoute)
      setSecUser(loggedUser);

      // 3) navega a dashboard (replace para que no quede /login en el historial)
      navigate("/dashboard", { replace: true });

      // (opcional) refresco duro si algo raro queda cacheado:
      // window.location.replace('/dashboard');
    } catch (error) {
      alert(error.message || "Error al iniciar sesión. Verifica tus datos.");
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <h1 className="text-center mb-4">Sistema de Gestión</h1>
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
