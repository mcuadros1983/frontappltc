import React, { useEffect, useState } from "react";
import {
    Alert,
    Badge,
    Button,
    Card,
    Col,
    Container,
    Row,
    Spinner,
    Table,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const formatDate = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getTipoBadge = (tipo) => {
    switch (tipo) {
        case "acreditacion":
            return "success";
        case "debito_canje":
            return "danger";
        case "devolucion":
            return "info";
        case "vencimiento":
            return "warning";
        case "ajuste_manual":
            return "primary";
        case "reversion":
            return "secondary";
        default:
            return "dark";
    }
};

const ComercioDashboard = () => {
    const navigate = useNavigate();

    const [comercio, setComercio] = useState(null);
    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("lt_comercio_portal_token");

    useEffect(() => {
        const comercioStorage = localStorage.getItem("lt_comercio_portal_data");

        if (comercioStorage) {
            setComercio(JSON.parse(comercioStorage));
        }

        if (!token) {
            navigate("/comercio/login");
            return;
        }

        cargarPuntos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const logout = () => {
        localStorage.removeItem("lt_comercio_portal_token");
        localStorage.removeItem("lt_comercio_portal_data");
        navigate("/comercio/login");
    };

    const cargarPuntos = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/fidelizacion/comercio/puntos`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (!response.ok || !result.ok) {
                if (response.status === 401) {
                    logout();
                    return;
                }

                setError(result.message || "No se pudieron obtener los puntos");
                return;
            }

            setData(result.data);
        } catch (err) {
            console.error("[ComercioDashboard cargarPuntos]", err);
            setError("Error de conexión al cargar puntos");
        } finally {
            setLoading(false);
        }
    };

    const movimientos = data?.movimientos || [];
    const saldo = data?.saldo || 0;

    const totalAcreditado = movimientos
        .filter((m) => m.tipo_movimiento === "acreditacion")
        .reduce((acc, m) => acc + Number(m.puntos || 0), 0);

    return (
        <Container
            fluid
            className="min-vh-100 py-4"
            style={{
                background:
                    "linear-gradient(135deg, #fff7ed 0%, #ffffff 45%, #fee2e2 100%)",
            }}
        >
            <Container>
                <Row className="mb-3 align-items-center">
                    <Col>
                        <h3 className="fw-bold mb-1">Portal Comercio</h3>
                        <p className="text-muted mb-0">
                            {comercio?.nombre_fantasia || "Comercio asociado"}
                        </p>
                    </Col>

                    <Col xs="auto">
                        <Button variant="outline-danger" onClick={logout}>
                            Salir
                        </Button>
                    </Col>
                </Row>

                {error && <Alert variant="danger">{error}</Alert>}

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" />
                        <p className="mt-3">Cargando puntos...</p>
                    </div>
                ) : (
                    <>
                        <Row className="mb-3 g-3">
                            <Col md={4}>
                                <Card className="shadow-sm border-0 h-100">
                                    <Card.Body>
                                        <small className="text-muted">Puntos disponibles</small>
                                        <h1 className="fw-bold text-success mb-0">{saldo}</h1>
                                        <p className="text-muted mb-0">saldo actual</p>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={4}>
                                <Card className="shadow-sm border-0 h-100">
                                    <Card.Body>
                                        <small className="text-muted">Total generado</small>
                                        <h1 className="fw-bold mb-0">{totalAcreditado}</h1>
                                        <p className="text-muted mb-0">puntos por canjes</p>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={4}>
                                <Card className="shadow-sm border-0 h-100">
                                    <Card.Body>
                                        <small className="text-muted">Movimientos</small>
                                        <h1 className="fw-bold mb-0">{movimientos.length}</h1>
                                        <p className="text-muted mb-0">registros históricos</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        <Card className="shadow-sm border-0 mb-3">
                            <Card.Body>
                                <h5 className="fw-bold mb-2">Datos del comercio</h5>

                                <p className="mb-1">
                                    <strong>Razón social:</strong>{" "}
                                    {comercio?.razon_social || "-"}
                                </p>
                                <p className="mb-1">
                                    <strong>Documento:</strong> {comercio?.documento_tipo}{" "}
                                    {comercio?.documento_numero}
                                </p>
                                <p className="mb-1">
                                    <strong>Domicilio:</strong> {comercio?.domicilio || "-"}
                                </p>
                                <p className="mb-0">
                                    <strong>Teléfono:</strong> {comercio?.telefono || "-"}
                                </p>
                            </Card.Body>
                        </Card>

                        <Card className="shadow-sm border-0">
                            <Card.Body>

                                <Button
                                    variant="success"
                                    className="me-2"
                                    onClick={() => navigate("/comercio/premios")}
                                >
                                    Ver premios
                                </Button>

                                <Button
                                    variant="outline-primary"
                                    className="me-2"
                                    onClick={() => navigate("/comercio/canjes")}
                                >
                                    Mis canjes
                                </Button>


                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <h5 className="fw-bold mb-0">Historial de puntos</h5>
                                        <small className="text-muted">
                                            Los puntos se acreditan cuando un cliente canjea un cupón
                                            generado desde tu QR.
                                        </small>
                                    </div>

                                    <Button variant="outline-primary" size="sm" onClick={cargarPuntos}>
                                        Actualizar
                                    </Button>
                                </div>

                                {movimientos.length === 0 ? (
                                    <Alert variant="light" className="border mb-0">
                                        Todavía no tenés movimientos de puntos.
                                    </Alert>
                                ) : (
                                    <Table responsive bordered hover size="sm" className="mb-0">
                                        <thead>
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Tipo</th>
                                                <th>Puntos</th>
                                                <th>Estado</th>
                                                <th>Motivo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {movimientos.map((mov) => (
                                                <tr key={mov.id}>
                                                    <td>{formatDate(mov.fecha_movimiento)}</td>
                                                    <td>
                                                        <Badge bg={getTipoBadge(mov.tipo_movimiento)}>
                                                            {mov.tipo_movimiento}
                                                        </Badge>
                                                    </td>
                                                    <td className="fw-bold">{mov.puntos}</td>
                                                    <td>{mov.estado}</td>
                                                    <td>{mov.motivo || "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )}
                            </Card.Body>
                        </Card>
                    </>
                )}
            </Container>
        </Container>
    );
};

export default ComercioDashboard;