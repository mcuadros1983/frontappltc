// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import FingerprintJS from "@fingerprintjs/fingerprintjs";
// import {
//     Alert,
//     Button,
//     Card,
//     Container,
//     Form,
//     Spinner,
// } from "react-bootstrap";

// const API_URL = process.env.REACT_APP_API_URL;

// const obtenerDeviceId = async () => {
//     const storageKey = "lt_fidelizacion_device_id";

//     const existing = localStorage.getItem(storageKey);

//     if (existing) {
//         return existing;
//     }

//     const fp = await FingerprintJS.load();
//     const result = await fp.get();

//     const deviceId = `${result.visitorId}-${Date.now()}`;

//     localStorage.setItem(storageKey, deviceId);

//     return deviceId;
// };

// const obtenerUbicacion = () => {
//     return new Promise((resolve, reject) => {
//         if (!navigator.geolocation) {
//             reject(new Error("Tu navegador no soporta geolocalización"));
//             return;
//         }

//         navigator.geolocation.getCurrentPosition(
//             (position) => {
//                 resolve({
//                     lat_cliente: position.coords.latitude,
//                     lon_cliente: position.coords.longitude,
//                     precision_gps: position.coords.accuracy,
//                 });
//             },
//             (error) => {
//                 reject(error);
//             },
//             {
//                 enableHighAccuracy: true,
//                 timeout: 12000,
//                 maximumAge: 0,
//             }
//         );
//     });
// };

// const RuletaPage = () => {
//     const { token } = useParams();
//     const location = useLocation();
//     const navigate = useNavigate();

//     const qrDataFromState = location.state?.qrData || null;

//     const [qrData, setQrData] = useState(qrDataFromState);
//     const [loadingQr, setLoadingQr] = useState(!qrDataFromState);

//     const [nombre, setNombre] = useState("");
//     const [telefono, setTelefono] = useState("");

//     const [ubicacion, setUbicacion] = useState(null);
//     const [deviceId, setDeviceId] = useState("");

//     const [loadingLocation, setLoadingLocation] = useState(false);
//     const [loadingDevice, setLoadingDevice] = useState(true);
//     const [submitting, setSubmitting] = useState(false);

//     const [error, setError] = useState("");
//     const [successMessage, setSuccessMessage] = useState("");

//     useEffect(() => {
//         inicializar();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [token]);

//     const inicializar = async () => {
//         try {
//             setError("");

//             if (!qrDataFromState) {
//                 await cargarQr();
//             }

//             const id = await obtenerDeviceId();
//             setDeviceId(id);
//         } catch (err) {
//             console.error("[RuletaPage inicializar]", err);
//             setError("No se pudo inicializar la participación");
//         } finally {
//             setLoadingDevice(false);
//         }
//     };

//     const cargarQr = async () => {
//         try {
//             setLoadingQr(true);

//             const response = await fetch(`${API_URL}/fidelizacion/public/qr/${token}`, {
//                 method: "GET",
//                 credentials: "include",
//             });

//             const data = await response.json();

//             if (!response.ok || !data.ok) {
//                 setError(data.message || "No se pudo validar el QR");
//                 return;
//             }

//             setQrData(data.data);
//         } catch (err) {
//             console.error("[RuletaPage cargarQr]", err);
//             setError("Error de conexión al validar el QR");
//         } finally {
//             setLoadingQr(false);
//         }
//     };

//     const solicitarUbicacion = async () => {
//         try {
//             setError("");
//             setLoadingLocation(true);

//             const locationData = await obtenerUbicacion();

//             setUbicacion(locationData);
//         } catch (err) {
//             console.error("[RuletaPage solicitarUbicacion]", err);

//             let message = "No pudimos obtener tu ubicación.";

//             if (err.code === 1) {
//                 message =
//                     "Debés permitir el acceso a la ubicación para poder participar.";
//             }

//             if (err.code === 2) {
//                 message = "No se pudo determinar tu ubicación actual.";
//             }

//             if (err.code === 3) {
//                 message = "La solicitud de ubicación demoró demasiado.";
//             }

//             setError(message);
//         } finally {
//             setLoadingLocation(false);
//         }
//     };

//     const validarFormulario = () => {
//         if (!nombre.trim()) {
//             setError("Ingresá tu nombre para participar");
//             return false;
//         }

//         if (!telefono.trim()) {
//             setError("Ingresá tu teléfono para participar");
//             return false;
//         }

//         if (!ubicacion) {
//             setError("Primero debés habilitar y validar tu ubicación");
//             return false;
//         }

//         if (!deviceId) {
//             setError("No se pudo identificar el dispositivo");
//             return false;
//         }

//         return true;
//     };

//     const handleParticipar = async (e) => {
//         e.preventDefault();

//         if (!validarFormulario()) return;

//         try {
//             setSubmitting(true);
//             setError("");
//             setSuccessMessage("");

//             const response = await fetch(`${API_URL}/fidelizacion/public/participar`, {
//                 method: "POST",
//                 credentials: "include",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     token,
//                     nombre,
//                     telefono,
//                     device_id: deviceId,
//                     lat_cliente: ubicacion.lat_cliente,
//                     lon_cliente: ubicacion.lon_cliente,
//                     precision_gps: ubicacion.precision_gps,
//                 }),
//             });

//             const data = await response.json();

//             if (!response.ok || !data.ok) {
//                 setError(data.message || "No se pudo registrar la participación");
//                 return;
//             }

//             setSuccessMessage("Participación validada correctamente.");

//             navigate(`/qr/${token}/ruleta`, {
//                 state: {
//                     qrData,
//                     resultData: data.data,
//                 },
//             });
//         } catch (err) {
//             console.error("[RuletaPage handleParticipar]", err);
//             setError("Error de conexión al registrar la participación");
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     if (loadingQr || loadingDevice) {
//         return (
//             <Container
//                 fluid
//                 className="d-flex align-items-center justify-content-center min-vh-100 bg-light"
//             >
//                 <div className="text-center">
//                     <Spinner animation="border" />
//                     <p className="mt-3 mb-0">Preparando participación...</p>
//                 </div>
//             </Container>
//         );
//     }

//     const comercio = qrData?.comercio;
//     const campania = qrData?.campania;

//     return (
//         <Container
//             fluid
//             className="min-vh-100 d-flex align-items-center justify-content-center px-3 py-4"
//             style={{
//                 background:
//                     "linear-gradient(135deg, #fff7ed 0%, #ffffff 45%, #fee2e2 100%)",
//             }}
//         >
//             <Card
//                 className="shadow border-0"
//                 style={{
//                     maxWidth: 480,
//                     width: "100%",
//                     borderRadius: 22,
//                 }}
//             >
//                 <Card.Body className="p-4">
//                     <div className="text-center mb-4">
//                         <div style={{ fontSize: 46 }}>📍</div>
//                         <h3 className="fw-bold mt-2 mb-1">Validá tu participación</h3>
//                         <p className="text-muted mb-0">
//                             Necesitamos confirmar que estás en el comercio.
//                         </p>
//                     </div>

//                     {comercio && (
//                         <Alert variant="light" className="border">
//                             <strong>{comercio.nombre_fantasia}</strong>
//                             <br />
//                             <span className="text-muted">{comercio.domicilio}</span>
//                         </Alert>
//                     )}

//                     {campania && (
//                         <p className="text-center text-muted small mb-3">
//                             Campaña: <strong>{campania.nombre}</strong>
//                         </p>
//                     )}

//                     {error && <Alert variant="danger">{error}</Alert>}
//                     {successMessage && <Alert variant="success">{successMessage}</Alert>}

//                     <div className="mb-3">
//                         <Button
//                             variant={ubicacion ? "success" : "outline-danger"}
//                             className="w-100 fw-bold"
//                             onClick={solicitarUbicacion}
//                             disabled={loadingLocation || submitting}
//                         >
//                             {loadingLocation
//                                 ? "Obteniendo ubicación..."
//                                 : ubicacion
//                                     ? "Ubicación validada en el celular"
//                                     : "Habilitar ubicación"}
//                         </Button>

//                         {ubicacion && (
//                             <div className="text-center text-muted mt-2" style={{ fontSize: 12 }}>
//                                 Precisión aproximada: {Math.round(ubicacion.precision_gps)} m
//                             </div>
//                         )}
//                     </div>

//                     <Form onSubmit={handleParticipar}>
//                         <Form.Group className="mb-3">
//                             <Form.Label>Nombre</Form.Label>
//                             <Form.Control
//                                 type="text"
//                                 placeholder="Ingresá tu nombre"
//                                 value={nombre}
//                                 onChange={(e) => setNombre(e.target.value)}
//                                 disabled={submitting}
//                             />
//                         </Form.Group>

//                         <Form.Group className="mb-3">
//                             <Form.Label>Teléfono</Form.Label>
//                             <Form.Control
//                                 type="tel"
//                                 placeholder="Ej: 3834XXXXXX"
//                                 value={telefono}
//                                 onChange={(e) => setTelefono(e.target.value)}
//                                 disabled={submitting}
//                             />
//                         </Form.Group>

//                         <Button
//                             type="submit"
//                             variant="danger"
//                             size="lg"
//                             className="w-100 fw-bold"
//                             disabled={submitting || !ubicacion}
//                         >
//                             {submitting ? "Validando..." : "Continuar a la ruleta"}
//                         </Button>
//                     </Form>

//                     <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: 12 }}>
//                         Solo se permite participar según las condiciones configuradas por la
//                         promoción.
//                     </p>
//                 </Card.Body>
//             </Card>
//         </Container>
//     );
// };

// export default RuletaPage;

import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import {
    Alert,
    Button,
    Card,
    Container,
    Form,
    Spinner,
} from "react-bootstrap";

const API_URL = process.env.REACT_APP_API_URL;

const obtenerFechaKey = () => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
};

const obtenerDeviceId = async () => {
    const storageKey = "lt_fidelizacion_device_id";

    const existing = localStorage.getItem(storageKey);

    if (existing) {
        return existing;
    }

    const fp = await FingerprintJS.load();
    const result = await fp.get();

    const deviceId = `${result.visitorId}-${Date.now()}`;

    localStorage.setItem(storageKey, deviceId);

    return deviceId;
};

const obtenerUbicacion = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Tu navegador no soporta geolocalización"));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat_cliente: position.coords.latitude,
                    lon_cliente: position.coords.longitude,
                    precision_gps: position.coords.accuracy,
                });
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 12000,
                maximumAge: 0,
            }
        );
    });
};

const RuletaPage = () => {
    const { token } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const qrDataFromState = location.state?.qrData || null;

    const storageParticipacionKey = useMemo(() => {
        return `lt_fidelizacion_participacion_${token}_${obtenerFechaKey()}`;
    }, [token]);

    const [qrData, setQrData] = useState(qrDataFromState);
    const [loadingQr, setLoadingQr] = useState(!qrDataFromState);

    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");

    const [ubicacion, setUbicacion] = useState(null);
    const [deviceId, setDeviceId] = useState("");

    const [loadingLocation, setLoadingLocation] = useState(false);
    const [loadingDevice, setLoadingDevice] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [participacionBloqueadaLocal, setParticipacionBloqueadaLocal] =
        useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        inicializar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    useEffect(() => {
        const yaParticipoLocal = sessionStorage.getItem(storageParticipacionKey);

        if (yaParticipoLocal === "1") {
            setParticipacionBloqueadaLocal(true);
            setError(
                "Ya registraste una participación en esta sesión. Si ya participaste hoy, el sistema no permitirá volver a girar."
            );
        }
    }, [storageParticipacionKey]);

    const inicializar = async () => {
        try {
            setError("");

            if (!qrDataFromState) {
                await cargarQr();
            }

            const id = await obtenerDeviceId();
            setDeviceId(id);
        } catch (err) {
            console.error("[RuletaPage inicializar]", err);
            setError("No se pudo inicializar la participación");
        } finally {
            setLoadingDevice(false);
        }
    };

    const cargarQr = async () => {
        try {
            setLoadingQr(true);

            const response = await fetch(`${API_URL}/fidelizacion/public/qr/${token}`, {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });

            const data = await response.json();

            if (!response.ok || !data.ok) {
                setError(data.message || "No se pudo validar el QR");
                return;
            }

            setQrData(data.data);
        } catch (err) {
            console.error("[RuletaPage cargarQr]", err);
            setError("Error de conexión al validar el QR");
        } finally {
            setLoadingQr(false);
        }
    };

    const solicitarUbicacion = async () => {
        try {
            setError("");
            setLoadingLocation(true);

            const locationData = await obtenerUbicacion();

            setUbicacion(locationData);
        } catch (err) {
            console.error("[RuletaPage solicitarUbicacion]", err);

            let message = "No pudimos obtener tu ubicación.";

            if (err.code === 1) {
                message =
                    "Debés permitir el acceso a la ubicación para poder participar.";
            }

            if (err.code === 2) {
                message = "No se pudo determinar tu ubicación actual.";
            }

            if (err.code === 3) {
                message = "La solicitud de ubicación demoró demasiado.";
            }

            setError(message);
        } finally {
            setLoadingLocation(false);
        }
    };

    const validarFormulario = () => {
        if (participacionBloqueadaLocal) {
            setError(
                "Esta participación ya fue procesada en esta sesión. Volvé a escanear el QR si necesitás iniciar nuevamente."
            );
            return false;
        }

        if (!qrData) {
            setError("No se pudo validar el QR de participación");
            return false;
        }

        if (!nombre.trim()) {
            setError("Ingresá tu nombre para participar");
            return false;
        }

        if (!telefono.trim()) {
            setError("Ingresá tu teléfono para participar");
            return false;
        }

        if (!ubicacion) {
            setError("Primero debés habilitar y validar tu ubicación");
            return false;
        }

        if (!deviceId) {
            setError("No se pudo identificar el dispositivo");
            return false;
        }

        return true;
    };

    const handleParticipar = async (e) => {
        e.preventDefault();

        if (submitting) return;
        if (!validarFormulario()) return;

        try {
            setSubmitting(true);
            setError("");
            setSuccessMessage("");

            const response = await fetch(`${API_URL}/fidelizacion/public/participar`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-store",
                body: JSON.stringify({
                    token,
                    nombre: nombre.trim(),
                    telefono: telefono.trim(),
                    device_id: deviceId,
                    lat_cliente: ubicacion.lat_cliente,
                    lon_cliente: ubicacion.lon_cliente,
                    precision_gps: ubicacion.precision_gps,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.ok) {
                setError(data.message || "No se pudo registrar la participación");
                return;
            }

            sessionStorage.setItem(storageParticipacionKey, "1");
            setParticipacionBloqueadaLocal(true);

            setSuccessMessage("Participación validada correctamente.");

            navigate(`/qr/${token}/ruleta`, {
                replace: true,
                state: {
                    qrData,
                    resultData: data.data,
                    participacionProcesada: true,
                },
            });
        } catch (err) {
            console.error("[RuletaPage handleParticipar]", err);
            setError("Error de conexión al registrar la participación");
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingQr || loadingDevice) {
        return (
            <Container
                fluid
                className="d-flex align-items-center justify-content-center min-vh-100 bg-light"
            >
                <div className="text-center">
                    <Spinner animation="border" />
                    <p className="mt-3 mb-0">Preparando participación...</p>
                </div>
            </Container>
        );
    }

    const comercio = qrData?.comercio;
    const campania = qrData?.campania;

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
                style={{
                    maxWidth: 480,
                    width: "100%",
                    borderRadius: 22,
                }}
            >
                <Card.Body className="p-4">
                    <div className="text-center mb-4">
                        <div style={{ fontSize: 46 }}>📍</div>
                        <h3 className="fw-bold mt-2 mb-1">Validá tu participación</h3>
                        <p className="text-muted mb-0">
                            Necesitamos confirmar que estás en el comercio.
                        </p>
                    </div>

                    {comercio && (
                        <Alert variant="light" className="border">
                            <strong>{comercio.nombre_fantasia}</strong>
                            <br />
                            <span className="text-muted">{comercio.domicilio}</span>
                        </Alert>
                    )}

                    {campania && (
                        <p className="text-center text-muted small mb-3">
                            Campaña: <strong>{campania.nombre}</strong>
                        </p>
                    )}

                    {error && <Alert variant="danger">{error}</Alert>}
                    {successMessage && <Alert variant="success">{successMessage}</Alert>}

                    <div className="mb-3">
                        <Button
                            variant={ubicacion ? "success" : "outline-danger"}
                            className="w-100 fw-bold"
                            onClick={solicitarUbicacion}
                            disabled={
                                loadingLocation ||
                                submitting ||
                                participacionBloqueadaLocal
                            }
                        >
                            {loadingLocation
                                ? "Obteniendo ubicación..."
                                : ubicacion
                                    ? "Ubicación validada en el celular"
                                    : "Habilitar ubicación"}
                        </Button>

                        {ubicacion && (
                            <div
                                className="text-center text-muted mt-2"
                                style={{ fontSize: 12 }}
                            >
                                Precisión aproximada:{" "}
                                {Math.round(ubicacion.precision_gps)} m
                            </div>
                        )}
                    </div>

                    <Form onSubmit={handleParticipar}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ingresá tu nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                disabled={submitting || participacionBloqueadaLocal}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Teléfono</Form.Label>
                            <Form.Control
                                type="tel"
                                placeholder="Ej: 3834XXXXXX"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                disabled={submitting || participacionBloqueadaLocal}
                            />
                        </Form.Group>

                        <Button
                            type="submit"
                            variant="danger"
                            size="lg"
                            className="w-100 fw-bold"
                            disabled={
                                submitting ||
                                !ubicacion ||
                                participacionBloqueadaLocal
                            }
                        >
                            {submitting ? "Validando..." : "Continuar a la ruleta"}
                        </Button>
                    </Form>

                    <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: 12 }}>
                        Solo se permite participar según las condiciones configuradas por la
                        promoción.
                    </p>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default RuletaPage;