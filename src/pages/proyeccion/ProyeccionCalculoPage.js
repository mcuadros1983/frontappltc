import React, { useState, useContext, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Spinner,
  Table,
  Alert,
  Badge,
} from "react-bootstrap";

import { proyeccionApi } from "../../services/proyeccionApi";
import Contexts from "../../context/Contexts";

export default function ProyeccionCalculoPage() {
  // ✅ tomamos sucursales reales del contexto global
  const dataCtx = useContext(Contexts.DataContext);
  const { sucursalesTabla = [] } = dataCtx || {};

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [sucursalIds, setSucursalIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [resultados, setResultados] = useState([]);

  // ✅ Autoseleccionar automáticamente si hay una sola sucursal disponible
  useEffect(() => {
    if (sucursalIds.length === 0 && sucursalesTabla.length === 1) {
      const unica = sucursalesTabla[0];
      if (unica && unica.id != null) {
        setSucursalIds([Number(unica.id)]);
      }
    }
  }, [sucursalesTabla, sucursalIds]);

  // ✅ Selección múltiple de sucursales
  const handleSucursalChange = (e) => {
    const sel = Array.from(e.target.options)
      .filter((opt) => opt.selected)
      .map((opt) => opt.value)
      .filter((v) => v !== "" && v !== null && v !== undefined)
      .map((v) => Number(v))
      .filter((v) => !Number.isNaN(v));

    setSucursalIds(sel);
  };

  // ✅ Click en "Calcular"
  const handleCalcular = async () => {
    setLoading(true);
    setErrorMsg("");
    setResultados([]);

    try {
      console.log("DEBUG >>> fechaInicio:", fechaInicio);
      console.log("DEBUG >>> fechaFin:", fechaFin);
      console.log("DEBUG >>> sucursalIds:", sucursalIds);

      // si el usuario no puso fechaFin, asumimos mismo día que fechaInicio
      const fechaFinEfectiva = fechaFin || fechaInicio;

      if (!fechaInicio || !fechaFinEfectiva || !sucursalIds.length) {
        throw new Error("Seleccioná fechas y al menos una sucursal");
      }

      // llamamos API de proyección
      const data = await proyeccionApi.calcularProyeccion({
        sucursalIds,
        fechaInicio,
        fechaFin: fechaFinEfectiva,
      });

      // backend devuelve cada fila con sucursal_nombre y proyecciones
      setResultados(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Error calculando proyección");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Nombre legible de sucursal en la tabla de resultados
  const getSucursalNombre = (fila) => {
    // Preferimos lo que viene del backend (persistido en ProyeccionResultado)
    if (fila.sucursal_nombre) return fila.sucursal_nombre;

    // Fallback al contexto vivo por ID
    const found = sucursalesTabla.find(
      (s) => String(s.id) === String(fila.sucursal_id)
    );
    return found ? found.nombre : `Sucursal ${fila.sucursal_id}`;
  };

  return (
    <Container className="py-3">
      {/* Encabezado */}
      <Row className="mb-3">
        <Col>
          <h3 className="mb-0">Proyección de Ventas</h3>
          <div className="text-muted">
            Estimación diaria por sucursal + factores comerciales aplicados
          </div>
        </Col>
      </Row>

      {/* Filtros */}
      <Row className="g-3 mb-4">
        {/* Fecha inicio */}
        <Col md={3}>
          {/* extra: form-group con controlId distinto para evitar colisiones */}
          <Form.Group controlId="fecha-inicio">
            <Form.Label>Fecha inicio</Form.Label>
            <Form.Control
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </Form.Group>
        </Col>

        {/* Fecha fin */}
        <Col md={3}>
          <Form.Group controlId="fecha-fin">
            <Form.Label>Fecha fin</Form.Label>
            <Form.Control
              type="date"
              value={fechaFin}
              onChange={(e) => {
                console.log(
                  "DEBUG >>> setFechaFin called with",
                  e.target.value
                );
                setFechaFin(e.target.value);
              }}
            />
            <div style={{ fontSize: "0.75rem" }} className="text-muted mt-1">
              Si la dejás vacía, se usa sólo la fecha inicio
            </div>
          </Form.Group>
        </Col>

        {/* Sucursales */}
        <Col md={4}>
          <Form.Label>Sucursales</Form.Label>
          <Form.Select
            multiple
            value={sucursalIds.map(String)}
            onChange={handleSucursalChange}
            style={{ minHeight: "100px" }}
          >
            {sucursalesTabla.map((suc) => (
              <option key={suc.id} value={suc.id}>
                {suc.nombre}
              </option>
            ))}
          </Form.Select>
          <div style={{ fontSize: "0.8rem" }} className="text-muted">
            Ctrl+Click para seleccionar varias
          </div>
        </Col>

        {/* Botón Calcular */}
        <Col md={2} className="d-flex align-items-end">
          <Button
            className="w-100"
            variant="primary"
            onClick={handleCalcular}
            disabled={loading || sucursalesTabla.length === 0}
          >
            {loading ? (
              <>
                <Spinner size="sm" animation="border" /> Calculando...
              </>
            ) : (
              "Calcular"
            )}
          </Button>
        </Col>
      </Row>

      {/* Errores arriba de la tabla */}
      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

      {/* Mensaje inicial si no hay nada aún */}
      {!loading && resultados.length === 0 && !errorMsg && (
        <Alert variant="secondary">
          No hay resultados todavía. Elegí un rango y sucursales y presioná
          Calcular.
        </Alert>
      )}

      {/* Tabla de resultados */}
      {!loading && resultados.length > 0 && (
        <Table bordered hover responsive size="sm">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Sucursal</th>
              <th>Base ($)</th>
              <th>Final ($)</th>
              <th>Ajustes aplicados</th>
            </tr>
          </thead>
          <tbody>
            {resultados.map((r, idx) => (
              <tr key={idx}>
                {/* Fecha */}
                <td style={{ whiteSpace: "nowrap" }}>{r.fecha}</td>

                {/* Sucursal */}
                <td style={{ whiteSpace: "nowrap" }}>
                  {getSucursalNombre(r)}
                </td>

                {/* Proyección base */}
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  {Number(r.proyeccion_base || 0).toLocaleString("es-AR", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </td>

                {/* Proyección final */}
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <strong>
                    {Number(r.proyeccion_final || 0).toLocaleString("es-AR", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </strong>
                </td>

                {/* Ajustes aplicados */}
                <td>
                  {r.ajustes_aplicados?.length ? (
                    r.ajustes_aplicados.map((aj, i) => (
                      <Badge
                        bg="info"
                        text="dark"
                        key={i}
                        className="me-1 mb-1"
                        style={{ fontWeight: 500 }}
                      >
                        {aj.tipo === "feriado"
                          ? `${aj.descripcion || "Feriado"} x${aj.factor}`
                          : `${aj.nombre || aj.tipo} x${aj.factor}`}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted">Sin ajustes</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
