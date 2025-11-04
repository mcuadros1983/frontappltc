import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Form,
  Button,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import { proyeccionApi } from "../../services/proyeccionApi";

// helper pequeña para mostrar array de días de semana
// Recordá: estamos guardando 0=lunes ... 6=domingo para alinear con Python
const NOMBRES_DIA = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

function formatDiasSemana(diasArr) {
  if (!Array.isArray(diasArr) || !diasArr.length) return "—";
  return diasArr.map((d) => NOMBRES_DIA[d] || d).join(", ");
}

export default function ProyeccionConfigPage() {
  // FACTORES
  const [factores, setFactores] = useState([]);
  const [loadingFactores, setLoadingFactores] = useState(false);

  // campos para crear/editar factor
  const [editFactorId, setEditFactorId] = useState(null);
  const [factorNombre, setFactorNombre] = useState("");
  const [factorDescripcion, setFactorDescripcion] = useState("");
  const [factorDiaInicio, setFactorDiaInicio] = useState("");
  const [factorDiaFin, setFactorDiaFin] = useState("");
  const [factorDiasSemana, setFactorDiasSemana] = useState([]); // array of numbers
  const [factorMultiplicador, setFactorMultiplicador] = useState("1.00");
  const [factorSucursalId, setFactorSucursalId] = useState("");
  const [factorActivo, setFactorActivo] = useState(true);

  // FERIADOS
  const [feriados, setFeriados] = useState([]);
  const [loadingFeriados, setLoadingFeriados] = useState(false);

  // campos para crear/editar feriado
  const [editFeriadoId, setEditFeriadoId] = useState(null);
  const [feriadoFecha, setFeriadoFecha] = useState("");
  const [feriadoDescripcion, setFeriadoDescripcion] = useState("");
  const [feriadoMultiplicador, setFeriadoMultiplicador] = useState("1.00");
  const [feriadoSucursalId, setFeriadoSucursalId] = useState("");
  const [feriadoActivo, setFeriadoActivo] = useState(true);

  const [errorMsg, setErrorMsg] = useState("");

  // TODO: igual que antes, reemplazar por tu data real de sucursales
  const SUCURSALES_DUMMY = [
    { id: 1, nombre: "Sucursal Centro" },
    { id: 2, nombre: "Sucursal Norte" },
    { id: 3, nombre: "Sucursal Sur" },
  ];

  // CARGA INICIAL
  useEffect(() => {
    cargarFactores();
    cargarFeriados();
  }, []);

  async function cargarFactores() {
    try {
      setLoadingFactores(true);
      const data = await proyeccionApi.getFactores();
      setFactores(data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error cargando factores");
    } finally {
      setLoadingFactores(false);
    }
  }

  async function cargarFeriados() {
    try {
      setLoadingFeriados(true);
      const data = await proyeccionApi.getFeriados();
      setFeriados(data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error cargando feriados");
    } finally {
      setLoadingFeriados(false);
    }
  }

  // --- FACTORES: crear/actualizar/eliminar ---
  function limpiarFormFactor() {
    setEditFactorId(null);
    setFactorNombre("");
    setFactorDescripcion("");
    setFactorDiaInicio("");
    setFactorDiaFin("");
    setFactorDiasSemana([]);
    setFactorMultiplicador("1.00");
    setFactorSucursalId("");
    setFactorActivo(true);
  }

  function toggleDiaSemana(diaIdx) {
    setFactorDiasSemana((prev) => {
      const num = Number(diaIdx);
      if (prev.includes(num)) {
        return prev.filter((d) => d !== num);
      } else {
        return [...prev, num];
      }
    });
  }

  function prepararPayloadFactor() {
    return {
      nombre: factorNombre,
      descripcion: factorDescripcion,
      dia_inicio_mes: factorDiaInicio ? Number(factorDiaInicio) : null,
      dia_fin_mes: factorDiaFin ? Number(factorDiaFin) : null,
      dias_semana: factorDiasSemana.length ? factorDiasSemana : null,
      factor_multiplicador: Number(factorMultiplicador),
      sucursal_id: factorSucursalId ? Number(factorSucursalId) : null,
      activo: !!factorActivo,
    };
  }

  async function handleGuardarFactor() {
    try {
      const payload = prepararPayloadFactor();
      if (editFactorId) {
        await proyeccionApi.updateFactor(editFactorId, payload);
      } else {
        await proyeccionApi.createFactor(payload);
      }
      limpiarFormFactor();
      cargarFactores();
    } catch (err) {
      console.error(err);
      setErrorMsg("Error guardando factor");
    }
  }

  async function handleEditarFactor(f) {
    setEditFactorId(f.id);
    setFactorNombre(f.nombre || "");
    setFactorDescripcion(f.descripcion || "");
    setFactorDiaInicio(f.dia_inicio_mes || "");
    setFactorDiaFin(f.dia_fin_mes || "");
    setFactorDiasSemana(Array.isArray(f.dias_semana) ? f.dias_semana : []);
    setFactorMultiplicador(String(f.factor_multiplicador || "1.00"));
    setFactorSucursalId(f.sucursal_id || "");
    setFactorActivo(!!f.activo);
  }

  async function handleEliminarFactor(id) {
    if (!window.confirm("¿Eliminar este factor?")) return;
    try {
      await proyeccionApi.deleteFactor(id);
      if (editFactorId === id) limpiarFormFactor();
      cargarFactores();
    } catch (err) {
      console.error(err);
      setErrorMsg("Error eliminando factor");
    }
  }

  // --- FERIADOS: crear/actualizar/eliminar ---
  function limpiarFormFeriado() {
    setEditFeriadoId(null);
    setFeriadoFecha("");
    setFeriadoDescripcion("");
    setFeriadoMultiplicador("1.00");
    setFeriadoSucursalId("");
    setFeriadoActivo(true);
  }

  function prepararPayloadFeriado() {
    return {
      fecha: feriadoFecha,
      descripcion: feriadoDescripcion,
      factor_multiplicador: Number(feriadoMultiplicador),
      sucursal_id: feriadoSucursalId ? Number(feriadoSucursalId) : null,
      activo: !!feriadoActivo,
    };
  }

  async function handleGuardarFeriado() {
    try {
      const payload = prepararPayloadFeriado();
      if (editFeriadoId) {
        await proyeccionApi.updateFeriado(editFeriadoId, payload);
      } else {
        await proyeccionApi.createFeriado(payload);
      }
      limpiarFormFeriado();
      cargarFeriados();
    } catch (err) {
      console.error(err);
      setErrorMsg("Error guardando feriado");
    }
  }

  async function handleEditarFeriado(f) {
    setEditFeriadoId(f.id);
    setFeriadoFecha(f.fecha || "");
    setFeriadoDescripcion(f.descripcion || "");
    setFeriadoMultiplicador(String(f.factor_multiplicador || "1.00"));
    setFeriadoSucursalId(f.sucursal_id || "");
    setFeriadoActivo(!!f.activo);
  }

  async function handleEliminarFeriado(id) {
    if (!window.confirm("¿Eliminar este feriado especial?")) return;
    try {
      await proyeccionApi.deleteFeriado(id);
      if (editFeriadoId === id) limpiarFormFeriado();
      cargarFeriados();
    } catch (err) {
      console.error(err);
      setErrorMsg("Error eliminando feriado");
    }
  }

  return (
    <Container className="py-3">
      <Row className="mb-3">
        <Col>
          <h3 className="mb-0">Configuración de Proyección</h3>
          <div className="text-muted" style={{ fontSize: "0.9rem" }}>
            Ajustes comerciales que modifican la proyección base del modelo
          </div>
        </Col>
      </Row>

      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

      {/* ======================== FACTORES GENERALES ======================== */}
      <Row className="mb-4">
        <Col>
          <h5>Factores generales (quincena, finde, lunes/martes, etc.)</h5>

          <Row className="g-3 align-items-end mb-3">
            <Col md={3}>
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                value={factorNombre}
                onChange={(e) => setFactorNombre(e.target.value)}
                placeholder="Ej: Finde primera quincena"
              />
            </Col>

            <Col md={3}>
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                value={factorDescripcion}
                onChange={(e) => setFactorDescripcion(e.target.value)}
                placeholder="Aumenta ventas sábado/domingo 1-14"
              />
            </Col>

            <Col md={2}>
              <Form.Label>Día inicio mes</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="31"
                value={factorDiaInicio}
                onChange={(e) => setFactorDiaInicio(e.target.value)}
              />
            </Col>

            <Col md={2}>
              <Form.Label>Día fin mes</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="31"
                value={factorDiaFin}
                onChange={(e) => setFactorDiaFin(e.target.value)}
              />
            </Col>

            <Col md={2}>
              <Form.Label>Multiplicador</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                value={factorMultiplicador}
                onChange={(e) => setFactorMultiplicador(e.target.value)}
              />
              <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                1.30 = +30%, 0.70 = -30%
              </div>
            </Col>
          </Row>

          <Row className="g-3 align-items-end mb-3">
            <Col md={3}>
              <Form.Label>Días de la semana</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {NOMBRES_DIA.map((lbl, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant={
                      factorDiasSemana.includes(idx) ? "primary" : "outline-secondary"
                    }
                    onClick={() => toggleDiaSemana(idx)}
                  >
                    {lbl}
                  </Button>
                ))}
              </div>
              <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                Dejá vacío si no depende del día de la semana.
              </div>
            </Col>

            <Col md={3}>
              <Form.Label>Sucursal específica</Form.Label>
              <Form.Select
                value={factorSucursalId}
                onChange={(e) => setFactorSucursalId(e.target.value)}
              >
                <option value="">(todas)</option>
                {SUCURSALES_DUMMY.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Label>Activo</Form.Label>
              <Form.Check
                type="switch"
                checked={factorActivo}
                onChange={(e) => setFactorActivo(e.target.checked)}
                label={factorActivo ? "Sí" : "No"}
              />
            </Col>

            <Col md={4} className="text-end">
              <Button
                variant="success"
                className="me-2"
                onClick={handleGuardarFactor}
              >
                {editFactorId ? "Guardar Cambios" : "Agregar Factor"}
              </Button>
              {editFactorId && (
                <Button variant="outline-secondary" onClick={limpiarFormFactor}>
                  Cancelar
                </Button>
              )}
            </Col>
          </Row>

          {loadingFactores ? (
            <Spinner animation="border" />
          ) : (
            <Table bordered hover responsive size="sm">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Días mes</th>
                  <th>Días semana</th>
                  <th>Multiplicador</th>
                  <th>Sucursal</th>
                  <th>Activo</th>
                  <th style={{ width: 120 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {factores.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted">
                      Sin factores definidos
                    </td>
                  </tr>
                ) : (
                  factores.map((f) => (
                    <tr key={f.id}>
                      <td>
                        <div className="fw-bold">{f.nombre}</div>
                        <div style={{ fontSize: "0.8rem" }}>{f.descripcion}</div>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {f.dia_inicio_mes || f.dia_fin_mes
                          ? `${f.dia_inicio_mes || "?"}–${
                              f.dia_fin_mes || "?"
                            }`
                          : "—"}
                      </td>
                      <td>{formatDiasSemana(f.dias_semana)}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        x{Number(f.factor_multiplicador).toFixed(2)}
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {f.sucursal_id
                          ? SUCURSALES_DUMMY.find(
                              (s) => String(s.id) === String(f.sucursal_id)
                            )?.nombre || `Suc ${f.sucursal_id}`
                          : "Todas"}
                      </td>
                      <td>
                        {f.activo ? (
                          <Badge bg="success">Activo</Badge>
                        ) : (
                          <Badge bg="secondary">Inactivo</Badge>
                        )}
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleEditarFactor(f)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleEliminarFactor(f.id)}
                          >
                            Borrar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>

      {/* ======================== FERIADOS ESPECIALES ======================== */}
      <Row>
        <Col>
          <h5>Feriados / Días pico especiales</h5>

          <Row className="g-3 align-items-end mb-3">
            <Col md={3}>
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                value={feriadoFecha}
                onChange={(e) => setFeriadoFecha(e.target.value)}
              />
            </Col>

            <Col md={3}>
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                value={feriadoDescripcion}
                onChange={(e) => setFeriadoDescripcion(e.target.value)}
                placeholder="Asado Día del Padre, finde largo turismo..."
              />
            </Col>

            <Col md={2}>
              <Form.Label>Multiplicador</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                value={feriadoMultiplicador}
                onChange={(e) => setFeriadoMultiplicador(e.target.value)}
              />
              <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                2.00 = +100%
              </div>
            </Col>

            <Col md={2}>
              <Form.Label>Sucursal</Form.Label>
              <Form.Select
                value={feriadoSucursalId}
                onChange={(e) => setFeriadoSucursalId(e.target.value)}
              >
                <option value="">(todas)</option>
                {SUCURSALES_DUMMY.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Label>Activo</Form.Label>
              <Form.Check
                type="switch"
                checked={feriadoActivo}
                onChange={(e) => setFeriadoActivo(e.target.checked)}
                label={feriadoActivo ? "Sí" : "No"}
              />
            </Col>
          </Row>

          <Row className="g-3 align-items-end mb-3">
            <Col className="text-end">
              <Button
                variant="success"
                className="me-2"
                onClick={handleGuardarFeriado}
              >
                {editFeriadoId ? "Guardar Cambios" : "Agregar Feriado"}
              </Button>
              {editFeriadoId && (
                <Button variant="outline-secondary" onClick={limpiarFormFeriado}>
                  Cancelar
                </Button>
              )}
            </Col>
          </Row>

          {loadingFeriados ? (
            <Spinner animation="border" />
          ) : (
            <Table bordered hover responsive size="sm">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Multiplicador</th>
                  <th>Sucursal</th>
                  <th>Activo</th>
                  <th style={{ width: 120 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {feriados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted">
                      Sin feriados especiales
                    </td>
                  </tr>
                ) : (
                  feriados.map((f) => (
                    <tr key={f.id}>
                      <td style={{ whiteSpace: "nowrap" }}>{f.fecha}</td>
                      <td>
                        <div className="fw-bold">{f.descripcion || "-"}</div>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        x{Number(f.factor_multiplicador).toFixed(2)}
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {f.sucursal_id
                          ? SUCURSALES_DUMMY.find(
                              (s) => String(s.id) === String(f.sucursal_id)
                            )?.nombre || `Suc ${f.sucursal_id}`
                          : "Todas"}
                      </td>
                      <td>
                        {f.activo ? (
                          <Badge bg="success">Activo</Badge>
                        ) : (
                          <Badge bg="secondary">Inactivo</Badge>
                        )}
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleEditarFeriado(f)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleEliminarFeriado(f.id)}
                          >
                            Borrar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
    </Container>
  );
}
