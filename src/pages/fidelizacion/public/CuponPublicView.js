import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Badge, Button, Card, Container, Spinner } from "react-bootstrap";
import { QRCodeCanvas } from "qrcode.react";

const API_URL = process.env.REACT_APP_API_URL;

const formatDate = (value) => {
    if (!value) return "Sin vencimiento";

    return new Date(value).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const CuponPublicView = () => {
    const { token } = useParams();

    const [cupon, setCupon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        cargarCupon();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const cargarCupon = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/fidelizacion/public/cupon/${token}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.ok) {
                setError(data.message || "No se pudo obtener el cupón");
                return;
            }

            setCupon(data.data);
        } catch (err) {
            console.error("[CuponPublicView cargarCupon]", err);
            setError("Error de conexión al obtener cupón");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container
                fluid
                className="min-vh-100 d-flex align-items-center justify-content-center bg-light"
            >
                <div className="text-center">
                    <Spinner animation="border" />
                    <p className="mt-3">Cargando cupón...</p>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container
                fluid
                className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3"
            >
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    const premio = cupon?.premio;
    const comercio = cupon?.comercio;
    const cliente = cupon?.cliente;

    const descargarCupon = () => {
        const contenido = `
Cupón La Tradición

Premio: ${premio?.nombre || "-"}
Cliente: ${cliente?.nombre || "-"}
Comercio: ${comercio?.nombre_fantasia || "-"}
Número: ${cupon.numero_cupon}
Código: ${cupon.codigo_validacion}
Emitido: ${formatDate(cupon.fecha_emision)}
Vence: ${formatDate(cupon.fecha_vencimiento)}
Estado: ${cupon.estado}
`;

        const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${cupon.numero_cupon}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    return (
        <Container
            fluid
            className="min-vh-100 d-flex align-items-center justify-content-center px-3 py-4"
            style={{
                background:
                    "linear-gradient(135deg, #fff7ed 0%, #ffffff 45%, #fee2e2 100%)",
            }}
        >
            <Card
                className="shadow border-0"
                style={{ maxWidth: 480, width: "100%", borderRadius: 22 }}
            >
                <Card.Body className="p-4 text-center">
                    <div style={{ fontSize: 58 }}>🎟️</div>

                    <h3 className="fw-bold mt-2">Cupón La Tradición</h3>

                    <Badge bg={cupon.estado === "disponible" ? "success" : "secondary"}>
                        {cupon.estado}
                    </Badge>

                    <hr />

                    <h4 className="fw-bold text-danger">{premio?.nombre}</h4>

                    {premio?.descripcion && (
                        <p className="text-muted">{premio.descripcion}</p>
                    )}

                    <div className="border rounded p-3 my-3 bg-light">
                        <small className="text-muted d-block">Número de cupón</small>
                        <h4 className="fw-bold mb-0">{cupon.numero_cupon}</h4>
                    </div>

                    <div className="my-3 d-flex justify-content-center">
                        <div className="p-3 bg-white border rounded">
                            <QRCodeCanvas value={cupon.qr_url || window.location.href} size={220} includeMargin />
                        </div>
                    </div>

                    <div className="text-start">
                        <p className="mb-1">
                            <strong>Cliente:</strong> {cliente?.nombre}
                        </p>
                        <p className="mb-1">
                            <strong>Comercio donde se generó:</strong>{" "}
                            {comercio?.nombre_fantasia}
                        </p>
                        <p className="mb-1">
                            <strong>Fecha emisión:</strong> {formatDate(cupon.fecha_emision)}
                        </p>
                        <p className="mb-1">
                            <strong>Vence:</strong> {formatDate(cupon.fecha_vencimiento)}
                        </p>
                        <p className="mb-0">
                            <strong>Código:</strong> {cupon.codigo_validacion}
                        </p>
                    </div>

                    <Alert variant="warning" className="mt-4 mb-0">
                        Presentá este cupón en una sucursal para canjearlo.
                    </Alert>

                    <Button
                        variant="outline-danger"
                        className="w-100 mt-3 fw-bold"
                        onClick={descargarCupon}
                    >
                        Descargar datos del cupón
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CuponPublicView;