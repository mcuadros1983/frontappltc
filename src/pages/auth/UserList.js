import { useEffect, useState, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function BranchList() {
  const [users, setUsers] = useState([]);

  const apiUrl = process.env.REACT_APP_API_URL;

  const navigate = useNavigate();

  const loadUsers = useCallback(async () => {
    const res = await fetch(`${apiUrl}/usuarios/`, {
      credentials: "include",
    });
    const data = await res.json();
    const sortedUsers = data.sort((a, b) => a.id - b.id);
    setUsers(sortedUsers);
    // console.log("storagebranchlist", localStorage.token);
  },[apiUrl]);

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
  }, [loadUsers]);

  return (
  <Container fluid className="mt-3 rpm-page px-3">
    <Row>
      <Col>
        <Card className="rpm-card">
          <Card.Header className="d-flex justify-content-between align-items-center rpm-header">
            <strong>Lista de Usuarios</strong>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/users/new")}
              className="rpm-btn"
            >
              Nuevo Usuario
            </Button>
          </Card.Header>

          <Card.Body className="rpm-body">
            <div className="table-responsive rpm-tablewrap">
              <Table bordered hover size="sm" className="rpm-table">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}># ID</th>
                    <th>Nombre Usuario</th>
                    <th>Roles</th>
                    <th>Operaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-4">
                        Sin usuarios registrados
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td className="fw-medium">{user.usuario}</td>
                        <td>
                          {user.roles && user.roles.length > 0
                            ? user.roles.map((rol) => (
                                <Badge key={rol.id} bg="secondary" className="me-1 rpm-badge">
                                  {rol.nombre}
                                </Badge>
                              ))
                            : "—"}
                        </td>
                        <td className="text-center text-nowrap">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            className="me-2 rpm-btn-outline"
                            onClick={() => navigate(`/users/${user.id}/edit`)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            className="rpm-btn-outline"
                            onClick={() => handleDelete(user.id)}
                          >
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>

            {/* Paginación opcional (si la tenés) */}
            {/* <div className="d-flex justify-content-between align-items-center rpm-pager mt-3">
              <div className="text-muted">Total: {users.length} usuarios</div>
            </div> */}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);
}
