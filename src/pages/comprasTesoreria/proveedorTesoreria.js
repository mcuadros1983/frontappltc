import { useEffect, useState, useCallback, useContext } from "react";
import { Table, Container, Button, Modal, Form } from "react-bootstrap";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

export default function ProveedorTesoreriaList() {
    const { imputacionContableTabla, formasPagoTesoreria } = useContext(Contexts.DataContext);

    const [proveedores, setProveedores] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedProveedor, setSelectedProveedor] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [nuevoProveedor, setNuevoProveedor] = useState({
        nombre: "",
        direccion: "",
        telefono: "",
        email: "",
        cuit: "",
        dni: "",
        imputacioncontable_id: "",
        formapago_id: "",
    });

    const loadProveedores = useCallback(async () => {
        try {
            const res = await fetch(`${apiUrl}/proveedores/`, { credentials: "include" });
            const data = await res.json();
            setProveedores(data.sort((a, b) => a.id - b.id));
        } catch (error) {
            console.error("Error al cargar proveedores:", error);
        }
    }, []);

    useEffect(() => {
        loadProveedores();
    }, [loadProveedores]);

    const handleDoubleClick = (proveedor) => {
        setSelectedProveedor(proveedor);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setSelectedProveedor(null);
        setShowModal(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelectedProveedor((prev) => ({
            ...prev,
            [name]: name.endsWith("_id") ? (value === "" ? "" : Number(value)) : value,
        }));
    };

    const handleNuevoChange = (e) => {
        const { name, value } = e.target;
        setNuevoProveedor((prev) => ({
            ...prev,
            [name]: name.endsWith("_id") ? (value === "" ? "" : Number(value)) : value,
        }));
    };

    const handleGuardarCambios = async () => {
        try {
            await fetch(`${apiUrl}/proveedores/${selectedProveedor.id}/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(selectedProveedor),
            });
            await loadProveedores();
            handleCloseModal();
        } catch (error) {
            console.error("Error al actualizar proveedor:", error);
        }
    };

    const handleCrearProveedor = async () => {
        try {
            await fetch(`${apiUrl}/proveedores/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(nuevoProveedor),
            });
            await loadProveedores();
            setShowCreateModal(false);
            setNuevoProveedor({
                nombre: "",
                direccion: "",
                telefono: "",
                email: "",
                cuit: "",
                dni: "",
                imputacioncontable_id: "",
                formapago_id: "",
            });
        } catch (error) {
            console.error("Error al crear proveedor:", error);
        }
    };

    const descImputacion = (id) =>
        imputacionContableTabla.find((i) => i.id === id)?.descripcion || (id ?? "");

    const descFormaPago = (id) =>
        formasPagoTesoreria.find((f) => f.id === id)?.descripcion || (id ?? "");

    return (
        <Container>
            <h1 className="my-list-title dark-text">Lista de Proveedores</h1>

            <div className="mb-3">
                <Button variant="success" className="mx-3" onClick={() => setShowCreateModal(true)}>
                    Agregar nuevo
                </Button>
            </div>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>CUIT</th>
                        <th>DNI</th>
                        <th>Dirección</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Imputación Contable</th>
                        <th>Forma de Pago</th>
                    </tr>
                </thead>
                <tbody>
                    {proveedores.map((p) => (
                        <tr
                            key={p.id}
                            onDoubleClick={() => handleDoubleClick(p)}
                            style={{ cursor: "pointer" }}
                        >
                            <td>{p.id}</td>
                            <td>{p.nombre}</td>
                            <td>{p.cuit || ""}</td>
                            <td>{p.dni || ""}</td>
                            <td>{p.direccion || ""}</td>
                            <td>{p.telefono || ""}</td>
                            <td>{p.email || ""}</td>
                            <td>{descImputacion(p.imputacioncontable_id)}</td>
                            <td>{descFormaPago(p.formapago_id)}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal de edición */}
            <Modal show={showModal} onHide={handleCloseModal} backdrop="static" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Proveedor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedProveedor && (
                        <Form>
                            <div className="row">
                                <Form.Group className="mb-3 col-md-6">
                                    <Form.Label>Nombre</Form.Label>
                                    <Form.Control
                                        name="nombre"
                                        value={selectedProveedor.nombre}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3 col-md-6">
                                    <Form.Label>Teléfono</Form.Label>
                                    <Form.Control
                                        name="telefono"
                                        value={selectedProveedor.telefono || ""}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </div>

                            <div className="row">
                                <Form.Group className="mb-3 col-md-6">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        name="email"
                                        value={selectedProveedor.email || ""}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3 col-md-6">
                                    <Form.Label>Dirección</Form.Label>
                                    <Form.Control
                                        name="direccion"
                                        value={selectedProveedor.direccion || ""}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </div>

                            <div className="row">
                                <Form.Group className="mb-3 col-md-6">
                                    <Form.Label>CUIT</Form.Label>
                                    <Form.Control
                                        name="cuit"
                                        value={selectedProveedor.cuit || ""}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3 col-md-6">
                                    <Form.Label>DNI</Form.Label>
                                    <Form.Control
                                        name="dni"
                                        value={selectedProveedor.dni || ""}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </div>

                            <div className="row">
                                <Form.Group className="mb-3 col-md-6">
                                    <Form.Label>Imputación Contable</Form.Label>
                                    <Form.Select
                                        name="imputacioncontable_id"
                                        value={selectedProveedor.imputacioncontable_id || ""}
                                        onChange={handleChange}
                                        className="form-control my-input"
                                    >
                                        <option value="">Seleccione...</option>
                                        {imputacionContableTabla.map((i) => (
                                            <option key={i.id} value={i.id}>
                                                {i.descripcion}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3 col-md-6">
                                    <Form.Label>Forma de Pago</Form.Label>
                                    <Form.Select
                                        name="formapago_id"
                                        value={selectedProveedor.formapago_id || ""}
                                        onChange={handleChange}
                                        className="form-control my-input"
                                    >
                                        <option value="">Seleccione...</option>
                                        {formasPagoTesoreria.map((f) => (
                                            <option key={f.id} value={f.id}>
                                                {f.descripcion}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>
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
            <Modal
                show={showCreateModal}
                onHide={() => setShowCreateModal(false)}
                backdrop="static"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Nuevo Proveedor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <div className="row">
                            <Form.Group className="mb-3 col-md-6">
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control
                                    name="nombre"
                                    value={nuevoProveedor.nombre}
                                    onChange={handleNuevoChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3 col-md-6">
                                <Form.Label>Teléfono</Form.Label>
                                <Form.Control
                                    name="telefono"
                                    value={nuevoProveedor.telefono}
                                    onChange={handleNuevoChange}
                                />
                            </Form.Group>
                        </div>

                        <div className="row">
                            <Form.Group className="mb-3 col-md-6">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    name="email"
                                    value={nuevoProveedor.email}
                                    onChange={handleNuevoChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3 col-md-6">
                                <Form.Label>Dirección</Form.Label>
                                <Form.Control
                                    name="direccion"
                                    value={nuevoProveedor.direccion}
                                    onChange={handleNuevoChange}
                                />
                            </Form.Group>
                        </div>

                        <div className="row">
                            <Form.Group className="mb-3 col-md-6">
                                <Form.Label>CUIT</Form.Label>
                                <Form.Control
                                    name="cuit"
                                    value={nuevoProveedor.cuit}
                                    onChange={handleNuevoChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3 col-md-6">
                                <Form.Label>DNI</Form.Label>
                                <Form.Control
                                    name="dni"
                                    value={nuevoProveedor.dni}
                                    onChange={handleNuevoChange}
                                />
                            </Form.Group>
                        </div>

                        <div className="row">
                            <Form.Group className="mb-3 col-md-6">
                                <Form.Label>Imputación Contable</Form.Label>
                                <Form.Select
                                    name="imputacioncontable_id"
                                    value={nuevoProveedor.imputacioncontable_id}
                                    onChange={handleNuevoChange}
                                    className="form-control my-input"
                                >
                                    <option value="">Seleccione...</option>
                                    {imputacionContableTabla.map((i) => (
                                        <option key={i.id} value={i.id}>
                                            {i.descripcion}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3 col-md-6">
                                <Form.Label>Forma de Pago</Form.Label>
                                <Form.Select
                                    name="formapago_id"
                                    value={nuevoProveedor.formapago_id}
                                    onChange={handleNuevoChange}
                                    className="form-control my-input"
                                >
                                    <option value="">Seleccione...</option>
                                    {formasPagoTesoreria.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.descripcion}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </div>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="success" onClick={handleCrearProveedor}>
                        Crear Proveedor
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
