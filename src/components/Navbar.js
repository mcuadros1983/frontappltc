import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
// import UserContext from "../path-to-your-user-context/UserContext"; // Actualiza la ruta según tu estructura de carpetas
import Contexts from "../context/Contexts";

export default function Navigation() {
  const context = useContext(Contexts.userContext);

  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand>
          <Link to="/" className="navbar-brand">
            LA TRADICION CARNICERIAS
          </Link>
        </Navbar.Brand>
        <Nav className="ml-auto">
          {context.user && (
            <Nav.Item className="text-light">
              <strong>Bienvenido {context.user.usuario.toUpperCase()}</strong>
            </Nav.Item>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}
