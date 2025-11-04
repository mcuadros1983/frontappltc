// PeriodosManager.js
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Alert,
  Spinner,Badge
} from "react-bootstrap";
import LiquidacionModal from "./PeriodoModal";

const apiUrl = process.env.REACT_APP_API_URL;

// ✅ Muestra correctamente dd/mm/aaaa tomando solo la parte de fecha
function formatDateAR(input) {
    if (!input) return "";
    const s = String(input).slice(0, 10); // garantiza 'YYYY-MM-DD' aunque venga con 'T...Z'
    const [y, m, d] = s.split("-");
    if (!y || !m || !d) return s;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
}

// Helper seguro para mostrar fechas YYYY-MM-DD sin desfases de zona horaria
function formatISODate(iso) {
    if (!iso || typeof iso !== "string") return "";
    const [y, m, d] = iso.split("-").map((n) => Number(n));
    if (!y || !m || !d) return iso;
    return String(d).padStart(2, "0") + "/" + String(m).padStart(2, "0") + "/" + y;
}

export default function PeriodosManager() {
    const [items, setItems] = useState([]); // periodos
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [submittingId, setSubmittingId] = useState(null); // id en cierre

    const fetchPeriodos = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const r = await fetch(`${apiUrl}/periodoliquidacion`, { credentials: "include" });
            if (!r.ok) throw new Error("No se pudieron cargar los períodos");
            const data = await r.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message || "Error inesperado");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPeriodos();
    }, [fetchPeriodos]);

    const itemsOrdenados = useMemo(() => {
        return [...items].sort((a, b) => {
            if (Number(b.anio) !== Number(a.anio)) return Number(b.anio) - Number(a.anio);
            if (Number(b.mes) !== Number(a.mes)) return Number(b.mes) - Number(a.mes);
            const fa = (a?.fecha_desde || "").slice(0, 10);
            const fb = (b?.fecha_desde || "").slice(0, 10);
            return fb.localeCompare(fa); // más reciente primero
        });
    }, [items]);

    const onCreated = useCallback((nuevo) => {
        // agregar al listado sin refetch para sensación de inmediatez
        setItems((prev) => [nuevo, ...prev]);
    }, []);

    const cerrarPeriodo = useCallback(async (it) => {
        if (!it || it.estado !== "abierto") return;
        const ok = window.confirm(`¿Cerrar el período ${it.mes.toString().padStart(2, "0")}/${it.anio}?`);
        if (!ok) return;
        try {
            setSubmittingId(it.id);
            setError(null);
            const r = await fetch(`${apiUrl}/periodoliquidacion/${it.id}/cerrar`, {
                method: "PUT",
                credentials: "include",
            });
            if (!r.ok) throw new Error("No se pudo cerrar el período");
            const upd = await r.json();
            setItems((prev) => prev.map((p) => (p.id === it.id ? upd : p)));
        } catch (e) {
            setError(e.message || "Error al cerrar el período");
        } finally {
            setSubmittingId(null);
        }
    }, []);

    const estadoBadge = (estado) => {
        const variant = estado === "abierto" ? "success" : estado === "cerrado" ? "secondary" : "dark";
        return <Badge bg={variant} className="px-3 py-2 text-uppercase">{estado}</Badge>;
    };

    const mesNombre = (m) => new Date(2000, (m ?? 1) - 1, 1).toLocaleString("es-AR", { month: "long" });

    return (
  <Container fluid className="mt-3 rpm-page px-3">
    <Row>
      <Col>
        <Card className="rpm-card">
          <Card.Header className="d-flex align-items-center justify-content-between rpm-header">
            <div>
              <strong>Períodos de Liquidación</strong>
              <div className="text-muted small">Listado desde el más actual al más viejo</div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowModal(true)}
              className="rpm-btn"
            >
              Nuevo período
            </Button>
          </Card.Header>

          <Card.Body className="rpm-body">
            {error && (
              <Alert variant="danger" className="rpm-alert mb-3">
                {error}
              </Alert>
            )}

            {loading ? (
              <div className="d-flex align-items-center justify-content-center gap-2 py-4">
                <Spinner animation="border" size="sm" />
                <span>Cargando períodos...</span>
              </div>
            ) : (
              <div className="table-responsive rpm-tablewrap">
                <Table bordered hover size="sm" className="rpm-table align-middle">
                  <thead>
                    <tr>
                      <th style={{ width: 160 }}>Período</th>
                      <th>Desde</th>
                      <th>Hasta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsOrdenados.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center text-muted py-4">
                          No hay períodos cargados.
                        </td>
                      </tr>
                    ) : (
                      itemsOrdenados.map((it) => (
                        <tr key={it.id}>
                          <td className="text-nowrap text-capitalize fw-medium">
                            {mesNombre(it.mes)} {it.anio}
                          </td>
                          <td>{formatDateAR(it.fecha_desde)}</td>
                          <td>{formatDateAR(it.fecha_hasta)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>

    {showModal && (
      <LiquidacionModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onCreated={onCreated}
        existingPeriods={items}
      />
    )}
  </Container>
);
}
