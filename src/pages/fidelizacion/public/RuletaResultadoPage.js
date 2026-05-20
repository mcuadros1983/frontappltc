// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { Alert, Button, Card, Container, Spinner } from "react-bootstrap";

// const RuletaResultadoPage = () => {
//   const { token } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const resultData = location.state?.resultData || null;

//   const [girando, setGirando] = useState(true);
//   const [mostrarResultado, setMostrarResultado] = useState(false);

//   useEffect(() => {
//     const timer1 = setTimeout(() => {
//       setGirando(false);
//     }, 2200);

//     const timer2 = setTimeout(() => {
//       setMostrarResultado(true);
//     }, 2500);

//     return () => {
//       clearTimeout(timer1);
//       clearTimeout(timer2);
//     };
//   }, []);

//   if (!resultData) {
//     return (
//       <Container
//         fluid
//         className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3"
//       >
//         <Card className="shadow-sm border-0" style={{ maxWidth: 420 }}>
//           <Card.Body className="text-center p-4">
//             <h4>No hay resultado disponible</h4>
//             <p className="text-muted">
//               Volvé a escanear el QR para participar.
//             </p>
//             <Button variant="danger" onClick={() => navigate(`/qr/${token}`)}>
//               Volver al inicio
//             </Button>
//           </Card.Body>
//         </Card>
//       </Container>
//     );
//   }

//   const premio = resultData?.premio;
//   const cupon = resultData?.cupon;
//   const gano = resultData?.participacion?.resultado === "gano";

//   return (
//     <Container
//       fluid
//       className="min-vh-100 d-flex align-items-center justify-content-center px-3 py-4"
//       style={{
//         background:
//           "linear-gradient(135deg, #fff7ed 0%, #ffffff 45%, #fee2e2 100%)",
//       }}
//     >
//       <Card
//         className="shadow border-0 overflow-hidden"
//         style={{ maxWidth: 480, width: "100%", borderRadius: 22 }}
//       >
//         <Card.Body className="p-4 text-center">
//           {girando && (
//             <>
//               <div
//                 className="mx-auto mb-4 d-flex align-items-center justify-content-center"
//                 style={{
//                   width: 180,
//                   height: 180,
//                   borderRadius: "50%",
//                   border: "10px solid #dc2626",
//                   animation: "spin 0.45s linear infinite",
//                   fontSize: 64,
//                 }}
//               >
//                 🎡
//               </div>

//               <h3 className="fw-bold">Girando ruleta...</h3>
//               <p className="text-muted mb-0">Estamos calculando tu resultado</p>

//               <style>
//                 {`
//                   @keyframes spin {
//                     from { transform: rotate(0deg); }
//                     to { transform: rotate(360deg); }
//                   }
//                 `}
//               </style>
//             </>
//           )}

//           {!girando && !mostrarResultado && (
//             <>
//               <Spinner animation="border" variant="danger" />
//               <p className="mt-3 mb-0">Preparando resultado...</p>
//             </>
//           )}

//           {mostrarResultado && (
//             <>
//               <div style={{ fontSize: 64 }}>{gano ? "🎉" : "🙌"}</div>

//               <h2 className="fw-bold mt-3">
//                 {gano ? "¡Felicitaciones!" : "Seguí participando"}
//               </h2>

//               {gano ? (
//                 <>
//                   <Alert variant="success" className="mt-3">
//                     Ganaste: <strong>{premio?.nombre}</strong>
//                   </Alert>

//                   {premio?.descripcion && (
//                     <p className="text-muted">{premio.descripcion}</p>
//                   )}

//                   <Button
//                     variant="danger"
//                     size="lg"
//                     className="w-100 fw-bold mt-2"
//                     onClick={() => navigate(`/cupon/${cupon.token}`)}
//                   >
//                     Ver mi cupón
//                   </Button>
//                 </>
//               ) : (
//                 <>
//                   <Alert variant="warning" className="mt-3">
//                     Esta vez no ganaste premio.
//                   </Alert>

//                   <p className="text-muted">
//                     Gracias por participar. Podés volver a intentar según las
//                     condiciones de la promoción.
//                   </p>

//                   <Button
//                     variant="outline-danger"
//                     className="w-100 fw-bold"
//                     onClick={() => navigate(`/qr/${token}`)}
//                   >
//                     Volver
//                   </Button>
//                 </>
//               )}
//             </>
//           )}
//         </Card.Body>
//       </Card>
//     </Container>
//   );
// };

// export default RuletaResultadoPage;
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Card, Container, Spinner } from "react-bootstrap";

const obtenerFechaKey = () => {
  const now = new Date();
  return now.toISOString().slice(0, 10);
};

const RuletaResultadoPage = () => {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const resultData = location.state?.resultData || null;

  const resultadoKey = useMemo(
    () => `lt_fidelizacion_resultado_${token}_${obtenerFechaKey()}`,
    [token]
  );

  const [girando, setGirando] = useState(true);
  const [mostrarResultado, setMostrarResultado] = useState(false);

  useEffect(() => {
    const cuponTokenGuardado = sessionStorage.getItem(resultadoKey);

    if (cuponTokenGuardado) {
      navigate(`/cupon/${cuponTokenGuardado}`, { replace: true });
      return;
    }

    if (!resultData) {
      return;
    }

    const timer1 = setTimeout(() => {
      setGirando(false);
    }, 2200);

    const timer2 = setTimeout(() => {
      setMostrarResultado(true);
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [navigate, resultadoKey, resultData]);

  if (!resultData) {
    return (
      <Container
        fluid
        className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3"
      >
        <Card className="shadow-sm border-0" style={{ maxWidth: 420 }}>
          <Card.Body className="text-center p-4">
            <h4>No hay resultado disponible</h4>
            <p className="text-muted">Volvé a escanear el QR para participar.</p>
            <Button
              variant="danger"
              onClick={() => navigate(`/qr/${token}`, { replace: true })}
            >
              Volver al inicio
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const premio = resultData?.premio;
  const cupon = resultData?.cupon;
  const gano = resultData?.participacion?.resultado === "gano";

  const cuponToken =
    cupon?.token ||
    resultData?.cupon_cliente?.token ||
    resultData?.token_cupon;

  const irAlCupon = () => {
    if (!cuponToken) return;

    sessionStorage.setItem(resultadoKey, cuponToken);

    navigate(`/cupon/${cuponToken}`, {
      replace: true,
    });
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
        className="shadow border-0 overflow-hidden"
        style={{ maxWidth: 480, width: "100%", borderRadius: 22 }}
      >
        <Card.Body className="p-4 text-center">
          {girando && (
            <>
              <div
                className="mx-auto mb-4 d-flex align-items-center justify-content-center"
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  border: "10px solid #dc2626",
                  animation: "spin 0.45s linear infinite",
                  fontSize: 64,
                }}
              >
                🎡
              </div>

              <h3 className="fw-bold">Girando ruleta...</h3>
              <p className="text-muted mb-0">Estamos calculando tu resultado</p>

              <style>
                {`
                  @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                `}
              </style>
            </>
          )}

          {!girando && !mostrarResultado && (
            <>
              <Spinner animation="border" variant="danger" />
              <p className="mt-3 mb-0">Preparando resultado...</p>
            </>
          )}

          {mostrarResultado && (
            <>
              <div style={{ fontSize: 64 }}>{gano ? "🎉" : "🙌"}</div>

              <h2 className="fw-bold mt-3">
                {gano ? "¡Felicitaciones!" : "Seguí participando"}
              </h2>

              {gano ? (
                <>
                  <Alert variant="success" className="mt-3">
                    Ganaste: <strong>{premio?.nombre}</strong>
                  </Alert>

                  {premio?.descripcion && (
                    <p className="text-muted">{premio.descripcion}</p>
                  )}

                  <Button
                    variant="danger"
                    size="lg"
                    className="w-100 fw-bold mt-2"
                    onClick={irAlCupon}
                    disabled={!cuponToken}
                  >
                    Ver mi cupón
                  </Button>
                </>
              ) : (
                <>
                  <Alert variant="warning" className="mt-3">
                    Esta vez no ganaste premio.
                  </Alert>

                  <p className="text-muted">
                    Gracias por participar. Podés volver a intentar según las
                    condiciones de la promoción.
                  </p>

                  <Button
                    variant="outline-danger"
                    className="w-100 fw-bold"
                    onClick={() => navigate(`/qr/${token}`, { replace: true })}
                  >
                    Volver
                  </Button>
                </>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RuletaResultadoPage;