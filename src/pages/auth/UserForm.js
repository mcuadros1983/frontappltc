

import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
// import { createAuthenticatedRequest } from "../../utils/createAuthenticatedRequest";

const UserForm = () => {
  const [user, setUser] = useState({
    usuario: "",
    password: "",
    nombreRol: "",
  });

  const [rolesList, setRolesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  
  const navigate = useNavigate();
  const params = useParams();

  // Nuevo controlador de eventos para manejar el clic en "Cancelar"
  const handleCancel = () => {
    navigate("/users");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  // Nuevo controlador de eventos para manejar los cambios en el select de roles
  const handleRolesChange = (e) => {
    const selectedRole = e.target.value;
    setUser({
      ...user,
      nombreRol: selectedRole,
    });
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setUser({
      ...user,
      password: newPassword,
    });
  };

  // Nuevo controlador de eventos para manejar el clic en "Cambiar Contraseña"
  const handlePasswordToggle = () => {
    setChangePassword(true);

    // Si deseas que el campo de contraseña esté vacío visualmente
    if (!user.password) {
      setUser({
        ...user,
        password: "", // Establecer la contraseña en blanco solo si es nula o vacía
      });
    }
  };

  const loadUser = useCallback(async (id) => {
    const res = await fetch(`${apiUrl}/usuarios/${id}`, {
      credentials: "include",
    });
    const data = await res.json();
    setUser(data);
    setEditing(true);
  }, [apiUrl]); // Agregar `apiUrl` como dependencia aquí

  useEffect(() => {
    const fetchRoles = async () => {
      const res = await fetch(`${apiUrl}/roles`, {
        credentials: "include",
      });
      const data = await res.json();
      setRolesList(data);
    };

    fetchRoles();

    if (params.id) {
      loadUser(params.id);
    } else {
      setEditing(false);
      setUser({
        usuario: "",
        password: "",
        nombreRol: "",
      });
    }
  }, [params.id, loadUser, apiUrl]); // Añadir `loadUser` y `apiUrl` a las dependencias


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (editing) {
      await fetch(`${apiUrl}/usuarios/${params.id}`, {
        credentials: "include",
        method: "PUT",
        body: JSON.stringify(user),
        headers: {
          "Content-Type": "application/json",
        },
      });
      setEditing(false);
    } else {
      // console.log("user front", user)
      await fetch(`${apiUrl}/usuarios/`, { 
        credentials: "include",
        method: "POST",
        body: JSON.stringify(user),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    setLoading(false);
    navigate("/users");
  };

  return (
  <Container fluid className="mt-3 rpm-page px-3">
    <Row className="justify-content-center">
      <Col lg={6} md={8}>
        <Card className="rpm-card">
          <Card.Header className="rpm-header text-center">
            <strong>
              {editing ? "Editar Usuario" : "Agregar Usuario"}
            </strong>
          </Card.Header>

          <Card.Body className="rpm-body">
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col xs={12}>
                  <Form.Label>Nombre de Usuario</Form.Label>
                  <Form.Control
                    type="text"
                    name="usuario"
                    value={user.usuario}
                    onChange={handleChange}
                    placeholder="Ingresa el nombre de usuario"
                    className="form-control my-input rpm-input"
                    required
                  />
                </Col>

                <Col xs={12}>
                  <Form.Label>Contraseña</Form.Label>
                  {!editing || (editing && changePassword) ? (
                    <Form.Control
                      type="password"
                      name="password"
                      value={user.password}
                      onChange={handlePasswordChange}
                      placeholder="Ingresa la contraseña"
                      className="form-control my-input rpm-input"
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-between p-2 border rounded bg-light">
                      <span className="text-muted">*********</span>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={handlePasswordToggle}
                        className="text-decoration-none"
                      >
                        Cambiar contraseña
                      </Button>
                    </div>
                  )}
                </Col>

                <Col xs={12}>
                  <Form.Label>Rol</Form.Label>
                  <Form.Select
                    value={user.nombreRol}
                    onChange={handleRolesChange}
                    name="nombreRol"
                    className="form-control my-input rpm-input"
                    required
                  >
                    <option value="">Selecciona un rol</option>
                    {rolesList.map((role) => (
                      <option key={role.id} value={role.nombre}>
                        {role.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col xs={12} className="d-flex gap-2 justify-content-end">
                  {editing && (
                    <Button
                      variant="outline-secondary"
                      onClick={handleCancel}
                      className="rpm-btn-outline"
                    >
                      Cancelar
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="rpm-btn"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-1" />
                        Guardando...
                      </>
                    ) : editing ? (
                      "Guardar Cambios"
                    ) : (
                      "Crear Usuario"
                    )}
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);
};

export default UserForm;
