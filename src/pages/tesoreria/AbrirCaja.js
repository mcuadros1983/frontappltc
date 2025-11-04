import React, { useState, useEffect, useContext, useRef } from "react";
import Contexts from "../../context/Contexts";
import { useNavigate } from "react-router-dom";
import { Button, Card, Form, Alert } from "react-bootstrap";

const AbrirCaja = () => {
  const context = useContext(Contexts.UserContext);
  const dataContext = useContext(Contexts.DataContext);
  const navigate = useNavigate();

  const { cajaAbierta, setCajaAbierta } = dataContext;
  const [cajaInicial, setCajaInicial] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [ultimoCierre, setUltimoCierre] = useState(null);
  const [editable, setEditable] = useState(true); // Controla si el input puede escribirse

  const inputRef = useRef(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  const obtenerCajaActual = async () => {
    try {
      const res = await fetch(`${apiUrl}/caja-tesoreria/actual`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.abierta) {
        setCajaAbierta(data);
      } else {
        setCajaAbierta(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const obtenerUltimaCajaCerrada = async () => {
    try {
      const res = await fetch(`${apiUrl}/caja-tesoreria/ultima-cerrada`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.existe) {
        setCajaInicial(data.saldoFinal);
        setEditable(false);
      } else {
        setCajaInicial("");
        setEditable(true);
      }
    } catch (err) {
      console.error("Error al obtener última caja cerrada", err);
    }
  };

  const abrirCaja = async () => {
    try {
      const res = await fetch(`${apiUrl}/caja-tesoreria/abrir`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: context.user.id,
          sucursal_id: context.user.sucursal_id,
          caja_inicial: parseFloat(cajaInicial),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al abrir la caja.");
      }

      const data = await res.json();
      setCajaAbierta({
        abierta: true,
        caja: {
          id: data.id,
          caja_inicial: data.caja_inicial,
        },
        ingresos: 0,
        egresos: 0,
        saldo: parseFloat(data.caja_inicial),
      });

      setMensaje("Caja abierta correctamente.");
      setError("");
    } catch (err) {
      setError(err.message);
      setMensaje("");
    }
  };

  const cerrarCaja = async () => {
    try {
      const res = await fetch(`${apiUrl}/caja-tesoreria/cerrar`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id: context.user.id }),
      });

      if (!res.ok) throw new Error("Error al cerrar la caja.");

      const ahora = new Date();
      setUltimoCierre({
        montoFinal: cajaAbierta.saldo,
        hora: ahora.toLocaleTimeString(),
      });

      setCajaAbierta(null);
      setCajaInicial("");
      setEditable(true);
      setMensaje("Caja cerrada correctamente.");
      setError("");
    } catch (err) {
      setError(err.message);
      setMensaje("");
    }
  };

  useEffect(() => {
    obtenerCajaActual();
  }, []);

  useEffect(() => {
    if (!cajaAbierta) {
      obtenerUltimaCajaCerrada();
    }
  }, [cajaAbierta]);

  useEffect(() => {
    if (!cajaAbierta && inputRef.current) {
      inputRef.current.focus();
    }
  }, [cajaAbierta]);

  return (
    <div className="container mt-4">
      <Card>
        <Card.Body>
          <Card.Title>Apertura de Caja</Card.Title>

          {mensaje && <Alert variant="success">{mensaje}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          {ultimoCierre && (
            <Alert variant="info">
              Último cierre: ${parseFloat(ultimoCierre.montoFinal).toFixed(2)} a las {ultimoCierre.hora}
            </Alert>
          )}

          {cajaAbierta?.abierta ? (
            <>
              <p><strong>La caja ya está abierta.</strong></p>
              <p><strong>Saldo inicial:</strong> ${parseFloat(cajaAbierta.caja?.caja_inicial || 0).toFixed(2)}</p>
    

              <div className="d-flex">
                <Button
                  variant="primary"
                  className="mx-3"
                  onClick={() => navigate("/tesoreria/movimientos-caja-tesoreria")}
                >
                  Ir a Movimientos
                </Button>
                <Button variant="danger" onClick={cerrarCaja}>
                  Cerrar Caja
                </Button>
              </div>

            </>
          ) : (
            <>
              <Form.Group>
                <Form.Label>Saldo Inicial</Form.Label>
                <Form.Control
                  ref={inputRef}
                  type="number"
                  value={cajaInicial}
                  onChange={(e) => setCajaInicial(e.target.value)}
                  placeholder="Ingrese monto inicial"
                  disabled={!editable}
                />
              </Form.Group>
              <Button
                variant="success"
                className="mt-3"
                onClick={abrirCaja}
                disabled={!cajaInicial}
              >
                Abrir Caja
              </Button>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AbrirCaja;
