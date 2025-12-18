// src/components/tesoreria/ctasCtesList.js
import { useState, useEffect, useCallback, useContext, useMemo } from "react";
import { Table, Container, Button, Modal, Form, Spinner } from "react-bootstrap";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

export default function CtasCtesList() {
  const dataContext = useContext(Contexts.DataContext);
  const { proveedoresTabla = [], empresaSeleccionada } = dataContext || {};

  const [saldos, setSaldos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [onlyConSaldo, setOnlyConSaldo] = useState(false); // incluye saldos 0 si está en false
  const [totalGeneral, setTotalGeneral] = useState(0);

  // Modal detalle
  const [showDetalle, setShowDetalle] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [proveedorSel, setProveedorSel] = useState(null);
  const [movs, setMovs] = useState([]);
  const [totalesMovs, setTotalesMovs] = useState({ cargos: 0, abonos: 0, saldo: 0 });

  const proveedorNombre = useCallback(
    (id) => proveedoresTabla.find((p) => Number(p.id) === Number(id))?.nombre || `Prov. ${id}`,
    [proveedoresTabla]
  );

  const saldosOrdenados = useMemo(() => {
    const withName = (saldos || []).map((it) => ({
      ...it,
      _nombre: proveedorNombre(it.proveedor_id),
    }));
    return withName.sort((a, b) => a._nombre.localeCompare(b._nombre));
  }, [saldos, proveedorNombre]);

  const fmtMoney = (n) =>
  `$${Number(n || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  const colorSaldo = (n) => (Number(n) < 0 ? { color: "crimson" } : undefined);

  const buildQS = (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.set(k, v);
    });
    return qs.toString();
  };

  const loadSaldos = useCallback(async () => {
    try {
      setLoading(true);
      const qs = buildQS({
        empresa_id: empresaSeleccionada?.id || "",
        onlyConSaldo: onlyConSaldo ? "1" : "",
      });
      const res = await fetch(`${apiUrl}/movimientos-cta-cte-proveedor/saldos?${qs}`, {
        credentials: "include",
      });
      const data = await res.json();
      const rawItems = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
      const items = rawItems.map(it => ({
        ...it,
        cargos: Number(it.cargos || 0),
        abonos: Number(it.abonos || 0),
        saldo: Number(it.abonos || 0) - Number(it.cargos || 0), // 👈 saldo firmado
      }));
      const total = items.reduce((acc, it) => acc + Number(it.saldo || 0), 0);
      setSaldos(items);
      setTotalGeneral(total);

    } catch (err) {
      console.error("❌ Error al cargar saldos Cta Cte:", err);
      setSaldos([]);
      setTotalGeneral(0);
    } finally {
      setLoading(false);
    }
  }, [empresaSeleccionada?.id, onlyConSaldo]);

  useEffect(() => {
    loadSaldos();
  }, [loadSaldos]);

  const openDetalle = async (provId) => {
    setProveedorSel({ id: provId, nombre: proveedorNombre(provId) });
    setShowDetalle(true);
    setLoadingDetalle(true);
    try {
      const qs = buildQS({ empresa_id: empresaSeleccionada?.id || "" });
      const res = await fetch(
        `${apiUrl}/movimientos-cta-cte-proveedor/${provId}/movimientos?${qs}`,
        { credentials: "include" }
      );
      const data = await res.json();
      const movimientos = Array.isArray(data.movimientos) ? data.movimientos : [];
      const tot = data.totales || {
        cargos: movimientos.filter(m => (m.tipo || "").toLowerCase() === "cargo")
          .reduce((a, b) => a + Number(b.importe || 0), 0),
        abonos: movimientos.filter(m => (m.tipo || "").toLowerCase() === "abono")
          .reduce((a, b) => a + Number(b.importe || 0), 0),
      };
      tot.cargos = Number(tot.cargos || 0);
      tot.abonos = Number(tot.abonos || 0);
      tot.saldo = tot.abonos - tot.cargos; // 👈 firmado

      setMovs(movimientos);
      setTotalesMovs(tot);
    } catch (err) {
      console.error("❌ Error al cargar movimientos del proveedor:", err);
      setMovs([]);
      setTotalesMovs({ cargos: 0, abonos: 0, saldo: 0 });
    } finally {
      setLoadingDetalle(false);
    }
  };

  const closeDetalle = () => {
    setShowDetalle(false);
    setProveedorSel(null);
    setMovs([]);
    setTotalesMovs({ cargos: 0, abonos: 0, saldo: 0 });
  };

  const importeFirmado = (m) =>
    ((m.tipo || "").toLowerCase() === "cargo" ? -Number(m.importe || 0) : Number(m.importe || 0));

  return (
    <Container>
      <h1 className="my-list-title dark-text">Cuentas Corrientes — Proveedores</h1>

      <div className="d-flex align-items-center mb-3" style={{ gap: 12 }}>
        <Form.Check
          type="switch"
          id="only-con-saldo"
          label="Sólo con saldo ≠ 0"
          checked={onlyConSaldo}
          onChange={(e) => setOnlyConSaldo(e.target.checked)}
        />
        <Button size="sm" variant="outline-secondary" onClick={loadSaldos} disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : "Actualizar"}
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Proveedor</th>
            <th className="text-end">Cargos</th>
            <th className="text-end">Abonos</th>
            <th className="text-end">Saldo</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={5} className="text-center text-muted">
                Cargando...
              </td>
            </tr>
          )}

          {!loading &&
            saldosOrdenados.map((row) => (
              <tr
                key={row.proveedor_id}
                style={{ cursor: "pointer" }}
                onDoubleClick={() => openDetalle(row.proveedor_id)}
                title="Doble click para ver movimientos"
              >
                <td>{row.proveedor_id}</td>
                <td>{row._nombre}</td>
                <td className="text-end">{fmtMoney(row.cargos)}</td>
                <td className="text-end">{fmtMoney(row.abonos)}</td>
                <td className="text-end" style={colorSaldo(row.saldo)}>
                  {fmtMoney(row.saldo)}
                </td>
              </tr>
            ))}

          {!loading && saldosOrdenados.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-muted">
                No hay saldos para mostrar.
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="text-end"><strong>Total</strong></td>
            <td className="text-end" style={colorSaldo(totalGeneral)}>
              <strong>{fmtMoney(totalGeneral)}</strong>
            </td>
          </tr>
        </tfoot>
      </Table>

      {/* ===== Modal Detalle de Movimientos ===== */}
      <Modal show={showDetalle} onHide={closeDetalle} backdrop="static" centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Movimientos — {proveedorSel ? `${proveedorSel.nombre} (ID ${proveedorSel.id})` : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetalle ? (
            <div className="text-center text-muted">Cargando movimientos...</div>
          ) : (
            <>
              <div className="mb-2">
                <small className="text-muted">
                  Doble click en la lista principal para cambiar de proveedor.
                </small>
              </div>

              <Table size="sm" bordered hover>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Fecha Pago</th>
                    <th>Tipo</th>
                    <th className="text-end">Importe</th>
                    <th>Descripción</th>
                    <th>Origen</th>
                    <th>Comp.</th>
                    <th>O/Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {movs.map((m) => (
                    <tr key={m.id}>
                      <td>{m.fecha || ""}</td>
                      <td>{m.fecha_pago || ""}</td>
                      <td>{m.tipo || ""}</td>
                      <td className="text-end" style={importeFirmado(m) < 0 ? { color: "crimson" } : undefined}>
                        {fmtMoney(importeFirmado(m))}
                      </td>

                      <td>{m.descripcion || ""}</td>
                      <td>{m.origen_tipo ? `${m.origen_tipo} #${m.origen_id}` : ""}</td>
                      <td>{m.comprobanteegreso_id || ""}</td>
                      <td>{m.ordenpago_id || ""}</td>
                    </tr>
                  ))}
                  {movs.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center text-muted">
                        Sin movimientos.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="text-end"><strong>Total cargos</strong></td>
                    <td className="text-end"><strong>{fmtMoney(totalesMovs.cargos)}</strong></td>
                    <td colSpan={4}></td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="text-end"><strong>Total abonos</strong></td>
                    <td className="text-end"><strong>{fmtMoney(totalesMovs.abonos)}</strong></td>
                    <td colSpan={4}></td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="text-end"><strong>Saldo</strong></td>
                    <td className="text-end" style={colorSaldo(totalesMovs.saldo)}>
                      <strong>{fmtMoney(totalesMovs.saldo)}</strong>
                    </td>
                    <td colSpan={4}></td>
                  </tr>
                </tfoot>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDetalle}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
