import { useEffect, useState, useCallback } from "react";
import { Table, Container, Button, Modal, Form } from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

export default function ClienteTesoreriaList() {
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    nro_doc: "",
    telefono: "",
    email: "",
    observaciones: "",
    margen: 0,
  });

  const loadClientes = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/clientes/`, {
        credentials: "include",
      });
      const data = await res.json();
      setClientes(data.sort((a, b) => a.id - b.id));
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    }
  }, []);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  const handleDoubleClick = (cliente) => {
    setSelectedCliente(cliente);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedCliente(null);
    setShowModal(false);
  };

  const handleChange = (e) => {
    setSelectedCliente({
      ...selectedCliente,
      [e.target.name]: e.target.value,
    });
  };

  const handleNuevoChange = (e) => {
    setNuevoCliente({
      ...nuevoCliente,
      [e.target.name]: e.target.value,
    });
  };

  const handleGuardarCambios = async () => {
    try {
      await fetch(`${apiUrl}/clientes/${selectedCliente.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(selectedCliente),
      });
      await loadClientes();
      handleCloseModal();
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
    }
  };

  const handleCrearCliente = async () => {
    try {
      await fetch(`${apiUrl}/clientes-new/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(nuevoCliente),
      });
      await loadClientes();
      setShowCreateModal(false);
      setNuevoCliente({
        nombre: "",
        nro_doc: "",
        telefono: "",
        email: "",
        observaciones: "",
        margen: 0,
      });
    } catch (error) {
      console.error("Error al crear cliente:", error);
    }
  };

  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Clientes</h1>

      <div className="mb-3">
        <Button
          variant="success"
          className="mx-3"
          onClick={() => setShowCreateModal(true)}
        >
          Agregar nuevo
        </Button>
        {/* <Button variant="success" className="mx-3">
          Consultar Cta Cte
        </Button>
        <Button variant="success" className="mx-3">
          Consultar Saldo
        </Button> */}
    
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Nro Doc</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Margen</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr
              key={cliente.id}
              onDoubleClick={() => handleDoubleClick(cliente)}
              style={{ cursor: "pointer" }}
            >
              <td>{cliente.id}</td>
              <td>{cliente.nombre}</td>
              <td>{cliente.nro_doc}</td>
              <td>{cliente.telefono}</td>
              <td>{cliente.email}</td>
              <td>{cliente.margen}%</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal de edición */}
      <Modal show={showModal} onHide={handleCloseModal} backdrop="static" centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCliente && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  name="nombre"
                  value={selectedCliente.nombre}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nro Documento</Form.Label>
                <Form.Control
                  name="nro_doc"
                  value={selectedCliente.nro_doc || ""}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  name="telefono"
                  value={selectedCliente.telefono || ""}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  name="email"
                  value={selectedCliente.email || ""}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Observaciones</Form.Label>
                <Form.Control
                  as="textarea"
                  name="observaciones"
                  rows={3}
                  value={selectedCliente.observaciones || ""}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Margen (%)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="margen"
                  value={selectedCliente.margen || 0}
                  onChange={handleChange}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleGuardarCambios}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de creación */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} backdrop="static" centered>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                name="nombre"
                value={nuevoCliente.nombre}
                onChange={handleNuevoChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nro Documento</Form.Label>
              <Form.Control
                name="nro_doc"
                value={nuevoCliente.nro_doc}
                onChange={handleNuevoChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                name="telefono"
                value={nuevoCliente.telefono}
                onChange={handleNuevoChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                name="email"
                value={nuevoCliente.email}
                onChange={handleNuevoChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                as="textarea"
                name="observaciones"
                rows={3}
                value={nuevoCliente.observaciones}
                onChange={handleNuevoChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Margen (%)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="margen"
                value={nuevoCliente.margen}
                onChange={handleNuevoChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleCrearCliente}>
            Crear Cliente
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
