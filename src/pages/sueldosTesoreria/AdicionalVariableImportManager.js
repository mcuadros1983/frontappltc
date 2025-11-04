import { useState } from "react";
import { Container, Row, Col, Card, Button, Form, Spinner, Table, Badge, Alert } from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

export default function AdicionalVariableImportManager() {
  const [file, setFile] = useState(null);
  const [createMissing, setCreateMissing] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);
  const [result, setResult] = useState(null); // { totalFilas, insertados, errores[], detalles[] }

  const onSelectFile = (e) => {
    setFile(e.target.files?.[0] || null);
    setErr(null);
    setResult(null);
  };

  const descargarTemplate = async () => {
    try {
      const r = await fetch(`${apiUrl}/adicionalvariableimportitems/template`, {
        credentials: "include",
      });
      if (!r.ok) throw new Error("No se pudo descargar el template.");
      const blob = await r.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "adicionales_variables_items_template.xlsx";
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

      if (!file) throw new Error("Seleccioná un archivo XLSX.");

      const fd = new FormData();
      fd.append("file", file);

      const qs = new URLSearchParams();
      if (createMissing) qs.append("create_missing_tipos", "1");

      const r = await fetch(`${apiUrl}/adicionalvariableimportitems/import?${qs.toString()}`, {
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
    setCreateMissing(false);
  };

  return (
    <Container className="py-3">
      <Row className="mb-3 align-items-center">
        <Col>
          <h4 className="mb-0">Importar Vales y Adelantos (Items Variables)</h4>
        </Col>
        <Col md="auto">
          <Button variant="outline-secondary" onClick={descargarTemplate}>
            Descargar template
          </Button>
        </Col>
      </Row>

      <Alert variant="info" className="mb-3">
        <div>
          <strong>Formato esperado:</strong> columnas{" "}
          <code>dni</code>, <code>periodo</code> (<em>YYYY-MM</em>),{" "}
          <code>tipo</code> (id o descripción), <code>fecha</code> (<em>YYYY-MM-DD</em>, opcional),{" "}
          <code>monto</code> y <code>observaciones</code> (opcional).
        </div>
        <div className="mt-1">
          <strong>Nota sobre montos:</strong> el sistema guarda los valores{" "}
          <u>siempre como negativos</u>. Si cargás un monto positivo en el Excel, se invertirá al guardar.
        </div>
        <div className="mt-1">
          <strong>Sobre “tipo”:</strong> el template incluye una lista sugerida, pero podés escribir un valor nuevo. Activá <em>“Crear tipos faltantes”</em> para que se genere automáticamente si no existe.
        </div>
      </Alert>

      <Card className="mb-3">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Archivo XLSX</Form.Label>
                <Form.Control type="file" accept=".xlsx,.xls" onChange={onSelectFile} />
                <Form.Text muted>
                  La primera hoja se procesará. El campo <code>tipo</code> acepta un ID existente o la descripción (con desplegable en el template).
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Check
                type="checkbox"
                id="create-missing"
                label="Crear tipos faltantes"
                checked={createMissing}
                onChange={(e) => setCreateMissing(e.target.checked)}
              />
              <Form.Text muted>
                Si el <em>tipo</em> no existe, se creará automáticamente (categoría <code>null</code>).
              </Form.Text>
            </Col>

            <Col md="auto">
              <div className="d-flex gap-2">
                <Button onClick={enviar} disabled={submitting || !file}>
                  {submitting ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Importando…
                    </>
                  ) : (
                    "Importar"
                  )}
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={limpiar}
                  disabled={submitting}
                  className="mx-2"
                >
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
              <Row>
                <Col md={3}>
                  <div className="d-flex align-items-center gap-2">
                    <span>Total filas:</span>
                    <Badge bg="secondary">{result.totalFilas ?? 0}</Badge>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-flex align-items-center gap-2">
                    <span>Insertados:</span>
                    <Badge bg="success">{result.insertados ?? 0}</Badge>
                  </div>
                </Col>
                <Col md={6}>
                  {Array.isArray(result.errores) && result.errores.length > 0 ? (
                    <Badge bg="danger">{result.errores.length} errores</Badge>
                  ) : (
                    <Badge bg="success">Sin errores</Badge>
                  )}
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
              <h6 className="mb-2">Detalles insertados</h6>
              <div className="table-responsive">
                <Table bordered hover size="sm" striped>
                  <thead>
                    <tr>
                      <th style={{ width: 80 }}>ID</th>
                      <th style={{ width: 100 }}>Fila</th>
                      <th>Empleado ID</th>
                      <th>Tipo ID</th>
                      <th>Período</th>
                      <th>Periodo ID</th>
                      <th>Fecha</th>
                      <th>Monto (negativo)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.detalles.map((d, idx) => (
                      <tr key={idx}>
                        <td>{d.id}</td>
                        <td>{d.row}</td>
                        <td>{d.empleado_id}</td>
                        <td>{d.adicionalvariabletipo_id}</td>
                        <td>{d.periodo}</td>
                        <td>{d.periodo_id ?? "—"}</td>
                        <td>{d.fecha || "—"}</td>
                        <td>{Number(d.monto).toFixed(2)}</td>
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
