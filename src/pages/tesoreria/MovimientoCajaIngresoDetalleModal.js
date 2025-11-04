import React, { useMemo } from "react";
import { Modal, Button } from "react-bootstrap";

export default function MovimientoCajaIngresoDetalleModal({
  show,
  onHide,
  movimiento,
  proyectosTabla = [],
  categoriasIngreso = [],
}) {
  const fmtMoney = (n) => `$${Number(n || 0).toFixed(2)}`;

  // Proyecto
  const projById = useMemo(() => {
    const m = new Map();
    (proyectosTabla || []).forEach((p) => m.set(Number(p.id), p));
    return m;
  }, [proyectosTabla]);

  const nombreProyecto = (m) =>
    m?.proyecto?.descripcion ||
    projById.get(Number(m?.proyecto_id))?.descripcion ||
    "";

  // Categoría de ingreso
  const catIngById = useMemo(() => {
    const m = new Map();
    (categoriasIngreso || []).forEach((c) => m.set(Number(c.id), c));
    return m;
  }, [categoriasIngreso]);

  const nombreCategoriaIngreso = (m) =>
    m?.categoriaingreso?.nombre ||
    catIngById.get(Number(m?.categoriaingreso_id))?.nombre ||
    "";

  const isIngreso =
    String(movimiento?.tipo || "").toLowerCase() === "ingreso";
  const canShow = Boolean(movimiento && isIngreso);

  const rows = canShow
    ? [
        ["Tipo", movimiento.tipo],
        ["Fecha", movimiento.fecha || ""],
        ["Descripción", movimiento.descripcion || ""],
        ["Monto", fmtMoney(movimiento.monto)],
        ["Proyecto", nombreProyecto(movimiento)],
        ["Categoría de Ingreso", nombreCategoriaIngreso(movimiento)],
        [
          "Referencia",
          movimiento.referencia_tipo
            ? `${movimiento.referencia_tipo} #${movimiento.referencia_id ?? ""}`
            : "",
        ],
        ["Observaciones", movimiento.observaciones || ""],
      ]
    : [];

  return (
    <Modal show={show} onHide={onHide} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title>Detalle del Ingreso de Caja</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!canShow ? (
          <div className="text-muted">No hay datos para mostrar.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-striped mb-0">
              <tbody>
                {rows.map(([label, value]) => (
                  <tr key={label}>
                    <th style={{ width: 220 }}>{label}</th>
                    <td>{String(value ?? "")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
