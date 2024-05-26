import { useEffect, useState } from "react";
import { Table, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function BranchList() {
  const [users, setUsers] = useState([]);

  const apiUrl = process.env.REACT_APP_API_URL;

  const navigate = useNavigate();

  const loadUsers = async () => {
    const res = await fetch(`${apiUrl}/usuarios/`, {
      credentials: "include",
    });
    const data = await res.json();
    const sortedUsers = data.sort((a, b) => a.id - b.id);
    setUsers(sortedUsers);
    // console.log("storagebranchlist", localStorage.token);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este usuario?"
    );
    if (!confirmDelete) {
      return;
    }
    try {
      await fetch(`${apiUrl}/usuarios/${id}`, {
        credentials: "include",
        method: "DELETE",
      });

      setUsers(users.filter((user) => user.id !== id));
      // loadProducts() ////este metodo funciona pero no es el mas optimo ya que vuelve a cargar todos los productos de la base de datos y no solo el que se elimino;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Usuarios</h1>
      {/* <Table striped bordered hover variant="dark"> */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre Usuario</th>
            <th>Roles</th>
            <th>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.usuario}</td>
              <td>{user.roles.map((rol) => rol.nombre).join(", ")}</td>
              <td className="text-center">
                <Button
                  variant="danger"
                  onClick={() => handleDelete(user.id)}
                  className="mx-2"
                >
                  Eliminar
                </Button>
                <Button
                  color="inherit"
                  onClick={() => navigate(`/users/${user.id}/edit`)}
                >
                  Editar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
