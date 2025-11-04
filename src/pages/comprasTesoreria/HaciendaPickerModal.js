// HaciendaPickerModal.jsx
import { useEffect, useMemo, useState } from "react";
import { Modal, Button, Table, Form, Row, Col, InputGroup } from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

export default function HaciendaPickerModal({
  show,
  onHide,
  empresaId,
  proveedorId,
  comprobanteId = null,   // ⬅️ nuevo (opcional)
  onSelect,       // onSelect({ id, ...row })
}) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const canQuery = useMemo(() => show && !!empresaId && !!proveedorId, [show, empresaId, proveedorId]);

  const fetchDisponibles = async () => {
    if (!canQuery) { setRows([]); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("empresa_id", empresaId);
      params.set("proveedor_id", proveedorId);
      if (comprobanteId) params.set("comprobante_id", comprobanteId); // ⬅️ clave
      if (q.trim() !== "") params.set("q", q.trim());
      if (fechaDesde) params.set("fecha_desde", fechaDesde);
      if (fechaHasta) params.set("fecha_hasta", fechaHasta);

      const res = await fetch(`${apiUrl}/hacienda/disponibles?${params.toString()}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo listar Hacienda disponibles");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("❌ HaciendaPickerModal.fetchDisponibles:", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!show) return;
    fetchDisponibles();
  }, [show, empresaId, proveedorId, comprobanteId, q, fechaDesde, fechaHasta]); // ⬅️ añadido

  const handleSelect = (row) => {
    onSelect?.(row);
    onHide?.();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Seleccionar Hacienda disponible del proveedor</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row className="g-2 mb-3">
          <Col md={4}>
            <Form.Label>Desde</Form.Label>
            <Form.Control type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />
          </Col>
          <Col md={4}>
            <Form.Label>Hasta</Form.Label>
            <Form.Control type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
          </Col>
          <Col md={4}>
            <Form.Label>Buscar</Form.Label>
            <InputGroup>
              <Form.Control placeholder="Observaciones…" value={q} onChange={e => setQ(e.target.value)} />
              <Button variant="outline-secondary" onClick={fetchDisponibles}>Buscar</Button>
            </InputGroup>
          </Col>
        </Row>

        {(!empresaId || !proveedorId) && (
          <div className="text-muted">Seleccioná Empresa y Proveedor para buscar.</div>
        )}

        {loading ? (
          <div className="text-muted">Cargando…</div>
        ) : rows.length === 0 ? (
          <div className="text-muted">No hay Hacienda disponibles para este proveedor.</div>
        ) : (
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Obs.</th>
                <th>Ítems activos</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((h) => (
                <tr key={h.id} onDoubleClick={() => handleSelect(h)} style={{ cursor: "pointer" }}>
                  <td>{h.id}</td>
                  <td>{h.fecha || "-"}</td>
                  <td>${Number(h.monto || 0).toFixed(2)}</td>
                  <td>{h.observaciones || "-"}</td>
                  <td>{h.items_activos ?? "-"}</td>
                  <td>
                    <Button size="sm" onClick={() => handleSelect(h)}>Elegir</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
}
