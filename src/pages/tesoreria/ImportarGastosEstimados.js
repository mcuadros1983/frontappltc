// src/components/tesoreria/ImportarGastosEstimadosUnicos.jsx
import React, { useContext, useState } from "react";
import {
  Card, Container, Row, Col, Button, Form, Alert, Spinner, Table, Badge
} from "react-bootstrap";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

export default function ImportarGastosEstimadosUnicos() {
  const data = useContext(Contexts.DataContext) || {};
  const empresaCtx = data?.empresaSeleccionada || null;
  const empresaCtxId = empresaCtx?.id || null;
  const hasEmpresa = Boolean(empresaCtxId);

  const [file, setFile] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [downloadingTpl, setDownloadingTpl] = useState(false);
  const [resumen, setResumen] = useState(null);
  const [err, setErr] = useState(null);

  const onFile = (e) => {
    setFile(e.target.files?.[0] || null);
    setResumen(null);
    setErr(null);
  };

  const descargarPlantillaXLSX = async () => {
    if (!hasEmpresa) return;
    try {
      setErr(null);
      setDownloadingTpl(true);
      const r = await fetch(
        `${apiUrl}/gasto-estimado/unicos/template.xlsx?empresa_id=${empresaCtxId}`,
        { method: "GET", credentials: "include" }
      );
      if (!r.ok) {
        const msg = await r.text().catch(() => "");
        throw new Error(msg || "No se pudo descargar el template");
      }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gastos_unicos_template.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErr(e.message || "Error descargando template");
    } finally {
      setDownloadingTpl(false);
    }
  };

  const subir = async () => {
    try {
      setErr(null);
      setResumen(null);

      if (!hasEmpresa) {
        setErr("Debés seleccionar una empresa para importar.");
        return;
      }
      if (!file) {
        setErr("Seleccioná un archivo .xlsx o .csv");
        return;
      }

      setSubiendo(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("empresa_id", String(empresaCtxId)); // el backend lo toma de acá

      const r = await fetch(`${apiUrl}/gasto-estimado/importar-unicos`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });

      const json = await r.json().catch(() => null);
      if (!r.ok) throw new Error(json?.error || "No se pudo importar el archivo");

      setResumen(json);
    } catch (e) {
      setErr(e.message || "Error subiendo archivo");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <Container className="mt-3">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <strong>Importar Gastos Estimados (Únicos)</strong>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  onClick={descargarPlantillaXLSX}
                  disabled={downloadingTpl || !hasEmpresa}
                >
                  {downloadingTpl ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" />
                      Generando…
                    </>
                  ) : (
                    "Descargar template (XLSX)"
                  )}
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {!hasEmpresa && (
                <Alert variant="warning" className="py-2">
                  Debés seleccionar una empresa para habilitar la descarga del template y la importación.
                </Alert>
              )}

              {hasEmpresa && (
                <div className="mb-2">
                  <span className="me-2 text-muted">Empresa seleccionada:</span>
                  <Badge bg="info">
                    #{empresaCtx.id} {empresaCtx.nombrecorto || empresaCtx.descripcion || ""}
                  </Badge>
                </div>
              )}

              <p className="text-muted mb-2">
                El template contiene sólo estas columnas:&nbsp;
                <code>descripcion</code>, <code>proveedor</code>, <code>categoria</code>, <code>fecha_vencimiento</code> (YYYY-MM-DD), <code>monto</code>.
                <br />
                <em>Nota:</em> La empresa no se completa en el archivo: se toma de la empresa seleccionada arriba.
              </p>

              {err && <Alert variant="danger">{err}</Alert>}

              <Form>
                <Row className="g-3 align-items-end">
                  <Col md={6}>
                    <Form.Label>Archivo</Form.Label>
                    <Form.Control
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={onFile}
                      disabled={subiendo || !hasEmpresa}
                    />
                    <Form.Text className="text-muted">
                      Usá el template descargado: incluye listas desplegables de proveedores y categorías.
                    </Form.Text>
                  </Col>
                  <Col md="auto">
                    <Button onClick={subir} disabled={subiendo || !file || !hasEmpresa}>
                      {subiendo ? (
                        <>
                          <Spinner size="sm" animation="border" className="me-2" /> Importando…
                        </>
                      ) : (
                        "Importar"
                      )}
                    </Button>
                  </Col>
                </Row>
              </Form>

              {resumen && (
                <>
                  <hr />
                  <h6>Resultado</h6>
                  <div className="mb-2">
                    <strong>Total:</strong> {resumen.total} &nbsp;·&nbsp;
                    <strong>Creados:</strong> {resumen.created} &nbsp;·&nbsp;
                    <strong>Fallidos:</strong> {resumen.failed}
                  </div>
                  {resumen.hint && (
                    <div className="text-muted small mb-2">{resumen.hint}</div>
                  )}

                  <div className="table-responsive">
                    <Table bordered size="sm">
                      <thead>
                        <tr>
                          <th>Fila</th>
                          <th>OK</th>
                          <th>Plantilla ID</th>
                          <th>Instancia ID</th>
                          <th>Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(resumen.results || []).map((r, idx) => (
                          <tr key={idx}>
                            <td>{r.row}</td>
                            <td>{r.ok ? "✔️" : "❌"}</td>
                            <td>{r.plantilla_id || "-"}</td>
                            <td>{r.instancia_id || "-"}</td>
                            <td className="text-danger">{r.error || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
