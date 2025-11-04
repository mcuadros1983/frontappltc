// src/components/comprasTesoreria/OrdenPagoDetalleModal.jsx
import React, { useEffect, useMemo, useState, useContext } from "react";
import { Modal, Button, Spinner, Alert, Table } from "react-bootstrap";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

export default function OrdenPagoDetalleModal({ show, onHide, movimiento, ordenId, orden: ordenProp }) {
  const { proveedoresTabla = [] } = useContext(Contexts.DataContext) || {};
  const [loading, setLoading] = useState(false);
  const [orden, setOrden] = useState(ordenProp || movimiento?.ordenpago || null);
  const [error, setError] = useState(null);

  // sincronizar cuando cambian props
  useEffect(() => {
    setOrden(ordenProp || movimiento?.ordenpago || null);
  }, [ordenProp, movimiento]);

  useEffect(() => {
    console.log("mov", movimiento, orden, ordenId)
    if (!show) return;
    setError(null);

    const id = ordenId || movimiento?.ordenpago_id || movimiento?.ordenpago?.id;
    if (!id || orden) return; // ya tengo la orden o no hay qué buscar

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/ordenes-pago/${id}`, { credentials: "include" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || `No se pudo obtener la orden #${id}`);
        setOrden(json);
      } catch (err) {
        setError(err.message || "Error cargando orden de pago");
      } finally {
        setLoading(false);
      }
    })();
  }, [show, ordenId, movimiento, orden]);

  const proveedorNombre = useMemo(() => {
    const emb = orden?.proveedor?.razonsocial || orden?.proveedor?.nombre || null;
    if (emb) return emb;
    const provId = orden?.proveedor_id;
    if (provId) {
      const p = proveedoresTabla.find((x) => Number(x.id) === Number(provId));
      return p ? (p.razonsocial || p.nombre || `Proveedor #${p.id}`) : `Proveedor #${provId}`;
    }
    return "-";
  }, [orden, proveedoresTabla]);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Detalle de Orden de Pago</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading && <div className="d-flex align-items-center gap-2"><Spinner size="sm" animation="border" /> Cargando…</div>}
        {error && <Alert variant="danger" className="py-2">{error}</Alert>}

        {orden ? (
          <>
            {/* Cabecera orden */}
            <div className="mb-2">
              <div><strong>Orden #</strong>{orden.id}</div>
              <div><strong>Fecha:</strong> {orden.fecha}</div>
              <div><strong>Estado:</strong> {orden.estado}</div>
              <div><strong>Total:</strong> ${Number(orden.total || 0).toFixed(2)}</div>
              <div><strong>Proveedor:</strong> {proveedorNombre}</div>
              {orden.numero ? <div><strong>Número interno:</strong> {orden.numero}</div> : null}
              {orden.origen ? <div><strong>Origen:</strong> {orden.origen}</div> : null}
              {orden.observaciones ? <div><strong>Obs.:</strong> {orden.observaciones}</div> : null}
            </div>

            {/* Pagos asociados: si tu backend devuelve pagos, listalos;
               mientras tanto, mostramos el movimiento que abrió el modal (si está) */}
            {movimiento && (
              <>
                <h6 className="mt-3">Pagos asociados</h6>
                <Table size="sm" bordered hover>
                  <thead>
                    <tr>
                      <th>Medio</th>
                      <th>Fecha</th>
                      <th className="text-end">Importe</th>
                      <th>Ref.</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        {movimiento?.banco_id ? "Banco / Transferencia"
                          : movimiento?.caja_id ? "Caja / Efectivo"
                            : "—"}
                      </td>
                      <td>{movimiento.fecha}</td>
                      <td className="text-end">${Number(movimiento.monto ?? movimiento.importe ?? 0).toFixed(2)}</td>

                      <td>Mov #{movimiento.id}</td>
                    </tr>
                  </tbody>
                </Table>
              </>
            )}
          </>
        ) : (
          !loading && !error && <Alert variant="warning" className="py-2">No se encontró información de la Orden de Pago.</Alert>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={onHide}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
}
