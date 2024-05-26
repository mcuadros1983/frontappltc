

import React, { useEffect, useState, useCallback } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
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
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Usuario" : "Agregar Usuario"}
      </h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Nombre de Usuario</Form.Label>
          <Form.Control
            type="text"
            name="usuario"
            value={user.usuario}
            onChange={handleChange}
            placeholder="Ingresa el nombre de usuario"
            className="my-input"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          {!editing || (editing && changePassword) ? (
            <Form.Control
              type="password"
              name="password"
              value={user.password}
              onChange={handlePasswordChange}
              placeholder="Ingresa la contraseña"
              className="my-input"
            />
          ) : (
            <div className="d-flex align-items-center">
              <span>*********</span>
              <Button variant="link" onClick={handlePasswordToggle}>
                Cambiar Contraseña
              </Button>
            </div>
          )}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Rol</Form.Label>
          <select
            value={user.nombreRol}
            onChange={handleRolesChange}
            name="nombreRol"
            className="form-control my-input"
          >
            <option value="">Selecciona un rol</option>
            {rolesList.map((role) => (
              <option key={role.id} value={role.nombre}>
                {role.nombre}
              </option>
            ))}
          </select>
        </Form.Group>
        <Button
          variant="primary"
          type="submit"
          disabled={loading}
          style={{ position: "relative", marginRight: "5px" }}
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
        {/* Nuevo botón de Cancelar */}
        {editing && (
          <Button variant="secondary" onClick={handleCancel}>
            Cancelar
          </Button>
        )}
      </Form>
    </Container>
  );
};

export default UserForm;
