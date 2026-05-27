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
           const descargarCupon = () => {
        if (!cupon) return;

        const premio = cupon?.premio;
        const cliente = cupon?.cliente;
        const comercio = cupon?.comercio;

        const fechaEmision = cupon?.fecha_emision
            ? new Date(cupon.fecha_emision).toLocaleDateString("es-AR")
            : "-";

        const fechaVencimiento = cupon?.fecha_vencimiento
            ? new Date(cupon.fecha_vencimiento).toLocaleDateString("es-AR")
            : "Sin vencimiento";

        const printWindow = window.open("", "_blank");

        printWindow.document.write(`
    <html>
      <head>
        <title>Cupón ${cupon.numero_cupon}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm;
          }

          body {
            font-family: Arial, Helvetica, sans-serif;
            background: #f8f8f8;
            margin: 0;
            padding: 30px;
            color: #222;
          }

          .coupon {
            max-width: 620px;
            margin: 0 auto;
            background: #fff;
            border: 4px solid #9f1717;
            border-radius: 24px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          }

          .logo {
            width: 260px;
            max-width: 80%;
            margin-bottom: 20px;
          }

          .title {
            background: #9f1717;
            color: #fff;
            padding: 16px;
            border-radius: 14px;
            font-size: 28px;
            font-weight: 900;
            margin-bottom: 20px;
          }

          .premio {
            font-size: 26px;
            font-weight: 900;
            color: #9f1717;
            margin: 18px 0;
          }

          .numero {
            font-size: 22px;
            font-weight: 900;
            border: 2px dashed #9f1717;
            padding: 14px;
            border-radius: 14px;
            margin: 18px 0;
          }

          .info {
            text-align: left;
            margin-top: 22px;
            font-size: 16px;
            line-height: 1.7;
          }

          .info strong {
            color: #9f1717;
          }

          .estado {
            display: inline-block;
            margin-top: 18px;
            padding: 10px 18px;
            border-radius: 999px;
            background: #fef3c7;
            color: #92400e;
            font-weight: 800;
            text-transform: uppercase;
          }

          .footer {
            margin-top: 28px;
            font-size: 13px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 14px;
          }

          @media print {
            body {
              background: #fff;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .coupon {
              box-shadow: none;
              max-width: 100%;
            }
          }
        </style>
      </head>

      <body>
        <div class="coupon">
          <img class="logo" src="/ltc.png" alt="La Tradición Carnicerías" />

          <div class="title">CUPÓN DE PREMIO</div>

          <div class="premio">
            ${premio?.nombre || "Premio"}
          </div>

          ${premio?.descripcion ? `<p>${premio.descripcion}</p>` : ""}

          <div class="numero">
            ${cupon.numero_cupon}
          </div>

          <div class="estado">
            Estado: ${cupon.estado}
          </div>

          <div class="info">
            <p><strong>Cliente:</strong> ${cliente?.nombre || "-"}</p>
            <p><strong>Teléfono:</strong> ${cliente?.telefono || "-"}</p>
            <p><strong>Comercio origen:</strong> ${comercio?.nombre_fantasia || "-"}</p>
            <p><strong>Fecha de emisión:</strong> ${fechaEmision}</p>
            <p><strong>Válido hasta:</strong> ${fechaVencimiento}</p>
            <p><strong>Código de validación:</strong> ${cupon.codigo_validacion || "-"}</p>
          </div>

          <div class="footer">
            Este cupón debe ser validado en sistema antes de ser canjeado.
            <br />
            Promoción válida según condiciones vigentes.
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `);

        printWindow.document.close();
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
