import { useContext, useMemo, useState } from "react";
import { Container, Row, Col, Card, Button, Form, Spinner, Table, Badge, Alert } from "react-bootstrap";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

export default function RecibosImportManager() {
  const dataContext = useContext(Contexts.DataContext);
  const empresa_id = dataContext?.empresaSeleccionada?.id ?? null;

  const [file, setFile] = useState(null);
  const [replace, setReplace] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);
  const [result, setResult] = useState(null); // { totalFilas, creados, actualizados, duplicados, adicionalesInsertados, errores[], detalles[], adicionales[] }

  const onSelectFile = (e) => {
    setFile(e.target.files?.[0] || null);
    setErr(null);
    setResult(null);
  };

  const descargarTemplate = async () => {
    try {
      const r = await fetch(`${apiUrl}/liquidacion/recibos/template`, {
        credentials: "include",
      });
      if (!r.ok) throw new Error("No se pudo descargar el template.");
      const blob = await r.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recibos_template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setErr(e.message || "No se pudo descargar el template.");
    }
  };

  const enviar = async () => {
    try {
      setSubmitting(true);
      setErr(null);
      setResult(null);

      if (!empresa_id) throw new Error("Seleccioná una empresa antes de importar.");
      if (!file) throw new Error("Seleccioná un archivo XLSX.");

      const fd = new FormData();
      fd.append("file", file);

      const qs = new URLSearchParams();
      qs.append("empresa_id", String(empresa_id));
      if (replace) qs.append("replace", "1");

      const r = await fetch(`${apiUrl}/liquidacion/recibos/import?${qs.toString()}`, {
        method: "POST",
        body: fd, credentials: "include",
      });

      if (!r.ok) {
        const x = await r.json().catch(() => ({}));
        throw new Error(x?.error || "No se pudo procesar el archivo.");
      }

      const data = await r.json();
      setResult(data);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error al importar.");
    } finally {
      setSubmitting(false);
    }
  };

  const limpiar = () => {
    setFile(null);
    setResult(null);
    setErr(null);
    setReplace(false);
  };

  // ---- Helpers de presentación de período ----
  const formatPeriodoMMYYYY = (periodoStr) => {
    if (!periodoStr || !/^\d{4}-\d{2}$/.test(periodoStr)) return "—";
    const [y, m] = periodoStr.split("-");
    return `${m}/${y}`;
  };

  // Mapa periodo_id -> periodo (string) a partir de los adicionales creados (si existen)
  // Esto permite mostrar MM/AAAA en "Recibos procesados" sin pedir más datos al backend.
  const periodoMap = useMemo(() => {
    const map = new Map();
    if (result?.adicionales?.length) {
      for (const a of result.adicionales) {
        if (a.periodo_id && a.periodo && !map.has(a.periodo_id)) {
          map.set(a.periodo_id, a.periodo);
        }
      }
    }
    return map;
  }, [result]);

  return (
    <Container className="py-3">
      <Row className="mb-2 align-items-center">
        <Col>
          <h4 className="mb-0">Importar Recibos + Adicionales (Excel)</h4>
        </Col>
        <Col md="auto">
          <Button variant="outline-secondary" onClick={descargarTemplate}>
            Descargar template
          </Button>
        </Col>
      </Row>

      <Alert variant="info" className="mb-3">
        <div><strong>Formato:</strong> columnas base <code>dni, periodo, fecha_desde, fecha_hasta, estado, sueldo, acobrarporbanco</code>.</div>
        <div>Las <strong>columnas extra</strong> se toman como <em>adicionales variables</em>: valores vacíos o 0 no se registran; valores negativos se guardan como descuentos (monto negativo).</div>
      </Alert>

      {!empresa_id && (
        <Alert variant="warning" className="mb-3">
          Debés seleccionar una empresa antes de importar.
        </Alert>
      )}

      <Card className="mb-3">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Archivo XLSX</Form.Label>
                <Form.Control type="file" accept=".xlsx,.xls" onChange={onSelectFile} />
                <Form.Text muted>
                  La primera hoja se procesará. Los títulos adicionales (p. ej. <code>adicional1</code>, <code>viáticos</code>) se usarán como <em>descripción</em> del adicional.
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Check
                type="checkbox"
                id="replace-existing"
                label="Actualizar si ya existe (replace)"
                checked={replace}
                onChange={(e) => setReplace(e.target.checked)}
              />
              <Form.Text muted>
                Si ya existe un recibo del empleado para ese período, se actualizará el <em>estado</em>, y los adicionales se insertarán igualmente.
              </Form.Text>
            </Col>
            <Col md="auto">
              <div className="d-flex gap-2">
                <Button onClick={enviar} disabled={submitting || !file || !empresa_id}>
                  {submitting ? (<><Spinner size="sm" className="me-2" />Importando…</>) : "Importar"}
                </Button>
                <Button variant="outline-secondary" onClick={limpiar} disabled={submitting && !err && !result} className="mx-2">
                  Limpiar
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {err && <div className="alert alert-danger py-2">{err}</div>}

      {result && (
        <>
          <Card className="mb-3">
            <Card.Body>
              <Row className="gy-2">
                <Col md={3}>
                  <div className="d-flex align-items-center gap-2">
                    <span>Total filas:</span>
                    <Badge bg="secondary">{result.totalFilas ?? 0}</Badge>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-flex align-items-center gap-2">
                    <span>Creados:</span>
                    <Badge bg="success">{result.creados ?? 0}</Badge>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-flex align-items-center gap-2">
                    <span>Actualizados:</span>
                    <Badge bg="info">{result.actualizados ?? 0}</Badge>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-flex align-items-center gap-2">
                    <span>Duplicados:</span>
                    <Badge bg="warning">{result.duplicados ?? 0}</Badge>
                  </div>
                </Col>
                <Col md={4} className="mt-2">
                  <div className="d-flex align-items-center gap-2">
                    <span>Adicionales insertados:</span>
                    <Badge bg="primary">{result.adicionalesInsertados ?? 0}</Badge>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {Array.isArray(result.errores) && result.errores.length > 0 && (
            <div className="mb-4">
              <h6 className="mb-2">Errores</h6>
              <div className="table-responsive">
                <Table bordered hover size="sm" striped>
                  <thead>
                    <tr>
                      <th style={{ width: 120 }}>Fila</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errores.map((e, idx) => (
                      <tr key={idx}>
                        <td>{e.row}</td>
                        <td>{e.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          )}

          {Array.isArray(result.detalles) && result.detalles.length > 0 && (
            <div className="mb-4">
              <h6 className="mb-2">Recibos procesados</h6>
              <div className="table-responsive">
                <Table bordered hover size="sm" striped>
                  <thead>
                    <tr>
                      <th style={{ width: 100 }}>Fila</th>
                      <th>Empleado ID</th>
                      <th>Período (MM/AAAA)</th> {/* <- cambiado */}
                      <th>Recibo ID</th>
                      <th>Acción</th>
                      <th>Adicionales creados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.detalles.map((d, idx) => {
                      const periodoStr = periodoMap.get(d.periodo_id) || null;
                      return (
                        <tr key={idx}>
                          <td>{d.row}</td>
                          <td>{d.empleado_id}</td>
                          <td>{periodoStr ? formatPeriodoMMYYYY(periodoStr) : "—"}</td>
                          <td>{d.recibo_id}</td>
                          <td>{d.accion}</td>
                          <td>{d.adicionales_creados ?? 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </div>
          )}

          {Array.isArray(result.adicionales) && result.adicionales.length > 0 && (
            <div className="mb-4">
              <h6 className="mb-2">Adicionales creados</h6>
              <div className="table-responsive">
                <Table bordered hover size="sm" striped>
                  <thead>
                    <tr>
                      <th style={{ width: 80 }}>ID</th>
                      <th style={{ width: 100 }}>Fila</th>
                      <th>Empleado ID</th>
                      <th>Descripción</th>
                      <th>Período (MM/AAAA)</th> {/* <- formateado */}
                      <th>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.adicionales.map((a, idx) => (
                      <tr key={idx}>
                        <td>{a.id}</td>
                        <td>{a.row}</td>
                        <td>{a.empleado_id}</td>
                        <td>{a.descripcion}</td>
                        <td>{formatPeriodoMMYYYY(a.periodo)}</td>
                        <td>{Number(a.monto).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </>
      )}
    </Container>
  );
}
