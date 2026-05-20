// import React, { useEffect, useRef, useState } from "react";
// import {
//     Alert,
//     Button,
//     Card,
//     Col,
//     Container,
//     Row,
//     Spinner,
// } from "react-bootstrap";
// import { QRCodeCanvas } from "qrcode.react";
// import { useNavigate, useParams } from "react-router-dom";

// const API_URL = process.env.REACT_APP_API_URL;

// const ComercioQrView = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const qrRef = useRef(null);

//     const [comercio, setComercio] = useState(null);
//     const [qr, setQr] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [generating, setGenerating] = useState(false);
//     const [error, setError] = useState("");
//     const [success, setSuccess] = useState("");

//     useEffect(() => {
//         cargarDatos();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [id]);

//     const cargarDatos = async () => {
//         try {
//             setLoading(true);
//             setError("");

//             const comercioRes = await fetch(
//                 `${API_URL}/fidelizacion/admin/comercios/${id}`,
//                 {
//                     method: "GET",
//                     credentials: "include",
//                 }
//             );

//             const comercioData = await comercioRes.json();

//             if (!comercioRes.ok || !comercioData.ok) {
//                 setError(comercioData.message || "No se pudo cargar el comercio");
//                 return;
//             }

//             setComercio(comercioData.data);

//             const qrRes = await fetch(
//                 `${API_URL}/fidelizacion/admin/comercios/${id}/qr`,
//                 {
//                     method: "GET",
//                     credentials: "include",
//                 }
//             );

//             const qrData = await qrRes.json();

//             if (qrRes.ok && qrData.ok) {
//                 setQr(qrData.data);
//             } else {
//                 setQr(null);
//             }
//         } catch (err) {
//             console.error("[ComercioQrView cargarDatos]", err);
//             setError("Error de conexión al cargar datos");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const generarQr = async () => {
//         try {
//             setGenerating(true);
//             setError("");
//             setSuccess("");

//             const response = await fetch(
//                 `${API_URL}/fidelizacion/admin/comercios/${id}/generar-qr`,
//                 {
//                     method: "POST",
//                     credentials: "include",
//                 }
//             );

//             const data = await response.json();

//             if (!response.ok || !data.ok) {
//                 setError(data.message || "No se pudo generar el QR");
//                 return;
//             }

//             setQr(data.data);
//             setSuccess("QR generado correctamente");
//         } catch (err) {
//             console.error("[ComercioQrView generarQr]", err);
//             setError("Error de conexión al generar QR");
//         } finally {
//             setGenerating(false);
//         }
//     };

//     const copiarUrl = async () => {
//         if (!qr?.url) return;

//         try {
//             await navigator.clipboard.writeText(qr.url);
//             setSuccess("URL copiada al portapapeles");
//         } catch {
//             setError("No se pudo copiar la URL");
//         }
//     };

//     const descargarQr = () => {
//         const canvas = qrRef.current?.querySelector("canvas");

//         if (!canvas) return;

//         const pngUrl = canvas
//             .toDataURL("image/png")
//             .replace("image/png", "image/octet-stream");

//         const link = document.createElement("a");
//         link.href = pngUrl;
//         link.download = `qr-comercio-${id}.png`;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     };

//     const imprimirQr = () => {
//         if (!qr?.url) return;

//         const printWindow = window.open("", "_blank");

//         printWindow.document.write(`
//   <html>
//     <head>
//       <title>QR Comercio</title>
//       <style>
//         body {
//           font-family: Arial, sans-serif;
//           text-align: center;
//           padding: 30px;
//           background: #f8f8f8;
//         }
//         .box {
//           background: white;
//           border: 4px solid #991b1b;
//           border-radius: 24px;
//           padding: 28px;
//           display: inline-block;
//           max-width: 440px;
//           box-shadow: 0 8px 22px rgba(0,0,0,0.18);
//         }
//         .brand {
//           color: #991b1b;
//           font-size: 34px;
//           font-weight: bold;
//           margin-bottom: 4px;
//         }
//         .subtitle {
//           font-size: 22px;
//           font-weight: bold;
//           margin-bottom: 8px;
//         }
//         .commerce {
//           font-size: 18px;
//           margin-bottom: 18px;
//           color: #444;
//         }
//         .qr {
//           width: 270px;
//           height: 270px;
//           margin: 14px 0;
//         }
//         .instructions {
//           font-size: 18px;
//           font-weight: bold;
//           margin-top: 14px;
//         }
//         .small {
//           color: #666;
//           font-size: 13px;
//           margin-top: 12px;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="box">
//         <div class="brand">La Tradición</div>
//         <div class="subtitle">Escaneá, girá y ganá</div>
//         <div class="commerce">${comercio?.nombre_fantasia || ""}</div>

//         <img class="qr" src="${qrRef.current
//                 ?.querySelector("canvas")
//                 ?.toDataURL("image/png")}" />

//         <div class="instructions">
//           Apuntá la cámara de tu celular al QR
//         </div>

//         <div class="small">
//           Promoción válida según condiciones vigentes. Debés estar en el comercio para participar.
//         </div>
//       </div>

//       <script>
//         window.onload = function() {
//           window.print();
//         }
//       </script>
//     </body>
//   </html>
// `);

//         printWindow.document.close();
//     };

//     if (loading) {
//         return (
//             <Container fluid className="py-5 text-center">
//                 <Spinner animation="border" />
//                 <p className="mt-3">Cargando QR...</p>
//             </Container>
//         );
//     }

//     return (
//         <Container fluid className="py-4">
//             <h3 className="fw-bold mb-1">QR del Comercio</h3>
//             <p className="text-muted">
//                 Visualizá, descargá o regenerá el QR exclusivo del comercio.
//             </p>

//             {error && <Alert variant="danger">{error}</Alert>}
//             {success && <Alert variant="success">{success}</Alert>}

//             <Row>
//                 <Col lg={5} className="mb-3">
//                     <Card className="shadow-sm border-0">
//                         <Card.Body>
//                             <h5 className="fw-bold">{comercio?.nombre_fantasia}</h5>
//                             <p className="text-muted mb-1">{comercio?.domicilio}</p>
//                             <p className="mb-1">
//                                 <strong>Documento:</strong> {comercio?.documento_tipo}{" "}
//                                 {comercio?.documento_numero}
//                             </p>
//                             <p className="mb-1">
//                                 <strong>Estado:</strong> {comercio?.estado}
//                             </p>
//                             <p className="mb-0">
//                                 <strong>Radio GPS:</strong> {comercio?.radio_metros} m
//                             </p>

//                             <hr />

//                             <div className="d-flex flex-wrap gap-2">
//                                 <Button
//                                     variant="primary"
//                                     disabled={generating}
//                                     onClick={generarQr}
//                                 >
//                                     {generating
//                                         ? "Generando..."
//                                         : qr
//                                             ? "Regenerar QR"
//                                             : "Generar QR"}
//                                 </Button>

//                                 <Button
//                                     variant="outline-secondary"
//                                     onClick={() => navigate("/fidelizacion/comercios")}
//                                 >
//                                     Volver
//                                 </Button>
//                             </div>
//                         </Card.Body>
//                     </Card>
//                 </Col>

//                 <Col lg={7}>
//                     <Card className="shadow-sm border-0">
//                         <Card.Body className="text-center">
//                             {!qr ? (
//                                 <Alert variant="warning" className="mb-0">
//                                     Este comercio todavía no tiene QR activo.
//                                 </Alert>
//                             ) : (
//                                 <>
//                                     <div ref={qrRef} className="d-inline-block p-3 bg-white border rounded">
//                                         <QRCodeCanvas value={qr.url} size={260} includeMargin />
//                                     </div>

//                                     <div className="mt-3">
//                                         <small className="text-muted d-block">URL pública</small>
//                                         <code style={{ wordBreak: "break-all" }}>{qr.url}</code>
//                                     </div>

//                                     <div className="d-flex justify-content-center flex-wrap gap-2 mt-4">
//                                         <Button variant="outline-primary" onClick={copiarUrl}>
//                                             Copiar URL
//                                         </Button>

//                                         <Button variant="outline-success" onClick={descargarQr}>
//                                             Descargar PNG
//                                         </Button>

//                                         <Button variant="outline-dark" onClick={imprimirQr}>
//                                             Imprimir
//                                         </Button>

//                                         <Button
//                                             variant="danger"
//                                             onClick={() => window.open(qr.url, "_blank")}
//                                         >
//                                             Probar QR
//                                         </Button>
//                                     </div>
//                                 </>
//                             )}
//                         </Card.Body>
//                     </Card>
//                 </Col>
//             </Row>
//         </Container>
//     );
// };

// export default ComercioQrView;

import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Row,
  Spinner,
} from "react-bootstrap";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const ComercioQrView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qrRef = useRef(null);

  const [comercio, setComercio] = useState(null);
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");

      const comercioRes = await fetch(
        `${API_URL}/fidelizacion/admin/comercios/${id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const comercioData = await comercioRes.json();

      if (!comercioRes.ok || !comercioData.ok) {
        setError(comercioData.message || "No se pudo cargar el comercio");
        return;
      }

      setComercio(comercioData.data);

      const qrRes = await fetch(
        `${API_URL}/fidelizacion/admin/comercios/${id}/qr`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const qrData = await qrRes.json();

      if (qrRes.ok && qrData.ok) {
        setQr(qrData.data);
      } else {
        setQr(null);
      }
    } catch (err) {
      console.error("[ComercioQrView cargarDatos]", err);
      setError("Error de conexión al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const generarQr = async () => {
    try {
      setGenerating(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/fidelizacion/admin/comercios/${id}/generar-qr`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || "No se pudo generar el QR");
        return;
      }

      setQr(data.data);
      setSuccess("QR generado correctamente");
    } catch (err) {
      console.error("[ComercioQrView generarQr]", err);
      setError("Error de conexión al generar QR");
    } finally {
      setGenerating(false);
    }
  };

  const copiarUrl = async () => {
    if (!qr?.url) return;

    try {
      await navigator.clipboard.writeText(qr.url);
      setSuccess("URL copiada al portapapeles");
    } catch {
      setError("No se pudo copiar la URL");
    }
  };

  const descargarQr = () => {
    const canvas = qrRef.current?.querySelector("canvas");

    if (!canvas) return;

    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `qr-comercio-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const imprimirQr = () => {
    if (!qr?.url) return;

    const qrImage = qrRef.current?.querySelector("canvas")?.toDataURL("image/png");
    const nombreComercio = comercio?.nombre_fantasia || "Comercio asociado";

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
<html>
  <head>
    <title>QR Comercio - ${nombreComercio}</title>
    <style>
      @page {
        size: A4 portrait;
        margin: 8mm;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: #ffffff;
        font-family: Arial, Helvetica, sans-serif;
        color: #1f1f1f;
      }

      .page {
        width: 100%;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .poster {
        width: 190mm;
        min-height: 275mm;
        background: linear-gradient(180deg, #ffffff 0%, #fff8f0 100%);
        border: 8px solid #9f1717;
        border-radius: 28px;
        padding: 22px 24px;
        text-align: center;
        position: relative;
        overflow: hidden;
      }

      .poster::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at top left, rgba(255,193,7,0.20), transparent 30%),
          radial-gradient(circle at bottom right, rgba(159,23,23,0.20), transparent 35%);
        pointer-events: none;
      }

      .content {
        position: relative;
        z-index: 2;
      }

      .logo {
        width: 250px;
        max-width: 72%;
        margin: 2px auto 12px;
        display: block;
      }

      .band {
        background: linear-gradient(90deg, #9f1717, #d11f1f, #9f1717);
        color: #ffffff;
        font-size: 35px;
        font-weight: 900;
        padding: 15px 12px;
        border-radius: 12px;
        letter-spacing: 1px;
        box-shadow: 0 8px 18px rgba(159,23,23,0.35);
        margin-bottom: 12px;
      }

      .commerce-label {
        font-size: 18px;
        font-weight: 700;
        color: #9f1717;
        margin-bottom: 2px;
      }

      .commerce-name {
        font-size: 28px;
        font-weight: 900;
        text-transform: uppercase;
        color: #111111;
        margin-bottom: 16px;
      }

      .qr-box {
        background: #ffffff;
        border: 4px solid #9f1717;
        border-radius: 24px;
        padding: 18px;
        display: inline-block;
        box-shadow: 0 8px 24px rgba(0,0,0,0.20);
        margin-bottom: 14px;
      }

      .qr-box img {
        width: 290px;
        height: 290px;
        display: block;
      }

      .main-text {
        font-size: 28px;
        font-weight: 900;
        margin: 10px 0 18px;
        color: #222;
      }

      .main-text span {
        color: #9f1717;
      }

      .steps {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        margin: 0 0 20px;
      }

      .step {
        padding: 0 8px;
        border-right: 2px dashed #d4a0a0;
      }

      .step:last-child {
        border-right: none;
      }

      .step-number {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        background: #ffc107;
        color: #9f1717;
        border-radius: 50%;
        font-weight: 900;
        font-size: 18px;
        margin-bottom: 6px;
      }

      .step-icon {
        font-size: 30px;
        margin-bottom: 5px;
      }

      .step-title {
        display: block;
        color: #9f1717;
        font-size: 15px;
        font-weight: 900;
      }

      .step p {
        font-size: 13px;
        line-height: 1.2;
        margin: 4px 0 0;
      }

      .free-box {
        background: linear-gradient(90deg, #ffc107, #ffdd57);
        color: #9f1717;
        font-size: 25px;
        font-weight: 900;
        padding: 15px;
        border-radius: 16px;
        margin: 16px 0;
        box-shadow: 0 6px 14px rgba(0,0,0,0.16);
      }

      .footer {
        background: #9f1717;
        color: #ffffff;
        padding: 16px;
        border-radius: 16px;
        font-size: 17px;
        font-weight: 700;
        line-height: 1.35;
      }

      .wheel {
        position: absolute;
        left: -65px;
        bottom: -65px;
        width: 170px;
        height: 170px;
        border-radius: 50%;
        background:
          conic-gradient(
            #9f1717 0deg 45deg,
            #ffd966 45deg 90deg,
            #b91c1c 90deg 135deg,
            #fff1b8 135deg 180deg,
            #9f1717 180deg 225deg,
            #ffd966 225deg 270deg,
            #b91c1c 270deg 315deg,
            #fff1b8 315deg 360deg
          );
        border: 8px solid #7f1d1d;
        box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        z-index: 1;
      }

      .spark {
        position: absolute;
        color: #ffc107;
        font-size: 26px;
        font-weight: 900;
        z-index: 1;
      }

      .spark.s1 { top: 125px; left: 42px; }
      .spark.s2 { top: 350px; right: 45px; color: #9f1717; }
      .spark.s3 { bottom: 260px; left: 70px; }

      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .page {
          align-items: flex-start;
        }

        .poster {
          box-shadow: none;
        }
      }
    </style>
  </head>

  <body>
    <div class="page">
      <div class="poster">
        <div class="wheel"></div>
        <div class="spark s1">★</div>
        <div class="spark s2">★</div>
        <div class="spark s3">★</div>

        <div class="content">
          <img class="logo" src="/ltc.png" alt="La Tradición Carnicerías" />

          <div class="band">ESCANEÁ, GIRÁ Y GANÁ</div>

          <div class="commerce-label">EN</div>
          <div class="commerce-name">${nombreComercio}</div>

          <div class="qr-box">
            <img src="${qrImage}" alt="QR de participación" />
          </div>

          <div class="main-text">
            ¡MUCHOS <span>PREMIOS</span> TE ESPERAN!
          </div>

          <div class="steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-icon">📱</div>
              <span class="step-title">ESCANEÁ</span>
              <p>el código QR con tu celular</p>
            </div>

            <div class="step">
              <div class="step-number">2</div>
              <div class="step-icon">📍</div>
              <span class="step-title">VALIDÁ</span>
              <p>tu ubicación en el comercio</p>
            </div>

            <div class="step">
              <div class="step-number">3</div>
              <div class="step-icon">👤</div>
              <span class="step-title">COMPLETÁ</span>
              <p>tus datos y participá</p>
            </div>

            <div class="step">
              <div class="step-number">4</div>
              <div class="step-icon">🎁</div>
              <span class="step-title">GIRÁ</span>
              <p>la ruleta y descubrí si ganaste</p>
            </div>
          </div>

          <div class="free-box">
            🎁 ¡ES RÁPIDO, FÁCIL Y TOTALMENTE GRATIS!
          </div>

          <div class="footer">
            Promoción válida según condiciones vigentes.<br />
            Debés estar en el comercio para participar.
          </div>
        </div>
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

  if (loading) {
    return (
      <Container fluid className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Cargando QR...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <h3 className="fw-bold mb-1">QR del Comercio</h3>
      <p className="text-muted">
        Visualizá, descargá o regenerá el QR exclusivo del comercio.
      </p>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row>
        <Col lg={5} className="mb-3">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="fw-bold">{comercio?.nombre_fantasia}</h5>
              <p className="text-muted mb-1">{comercio?.domicilio}</p>
              <p className="mb-1">
                <strong>Documento:</strong> {comercio?.documento_tipo}{" "}
                {comercio?.documento_numero}
              </p>
              <p className="mb-1">
                <strong>Estado:</strong> {comercio?.estado}
              </p>
              <p className="mb-0">
                <strong>Radio GPS:</strong> {comercio?.radio_metros} m
              </p>

              <hr />

              <div className="d-flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  disabled={generating}
                  onClick={generarQr}
                >
                  {generating
                    ? "Generando..."
                    : qr
                    ? "Regenerar QR"
                    : "Generar QR"}
                </Button>

                <Button
                  variant="outline-secondary"
                  onClick={() => navigate("/fidelizacion/comercios")}
                >
                  Volver
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center">
              {!qr ? (
                <Alert variant="warning" className="mb-0">
                  Este comercio todavía no tiene QR activo.
                </Alert>
              ) : (
                <>
                  <div
                    ref={qrRef}
                    className="d-inline-block p-3 bg-white border rounded"
                  >
                    <QRCodeCanvas value={qr.url} size={260} includeMargin />
                  </div>

                  <div className="mt-3">
                    <small className="text-muted d-block">URL pública</small>
                    <code style={{ wordBreak: "break-all" }}>{qr.url}</code>
                  </div>

                  <div className="d-flex justify-content-center flex-wrap gap-2 mt-4">
                    <Button variant="outline-primary" onClick={copiarUrl}>
                      Copiar URL
                    </Button>

                    <Button variant="outline-success" onClick={descargarQr}>
                      Descargar PNG
                    </Button>

                    <Button variant="outline-dark" onClick={imprimirQr}>
                      Imprimir afiche
                    </Button>

                    <Button
                      variant="danger"
                      onClick={() => window.open(qr.url, "_blank")}
                    >
                      Probar QR
                    </Button>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ComercioQrView;