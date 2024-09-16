import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import Contexts from "../context/Contexts";

export default function Navigation() {
  const context = useContext(Contexts.UserContext);

  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand>
          <Link to="/" className="navbar-brand">
            <span className="brand-text">LA TRADICION CARNICERIAS</span>
          </Link>
        </Navbar.Brand>
        <Nav className="ml-auto">
          {context.user && (
            <Nav.Item className="text-light">
              <strong className="welcome-text">
                Bienvenido {context.user.usuario.toUpperCase()}
              </strong>
            </Nav.Item>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}