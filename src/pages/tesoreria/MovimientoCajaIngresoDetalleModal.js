// src/pages/tesoreria/MovimientoCajaIngresoDetalleModal.jsx
import React, { useContext, useMemo } from "react";
import { Modal, Button } from "react-bootstrap";
import Contexts from "../../context/Contexts";

export default function MovimientoCajaIngresoDetalleModal({
  show,
  onHide,
  movimiento,
  // props opcionales para compatibilidad; si no vienen, se usan los del DataContext
  proyectosTabla: proyectosProp = [],
  categoriasIngreso: categoriasProp = [],
}) {
  const { proyectosTabla: proyectosCtx, categoriasIngreso: categoriasCtx } =
    useContext(Contexts.DataContext) || {};

  // Fuente de verdad: primero contexto; si no hay, usar props
  const proyectosTabla = Array.isArray(proyectosCtx) ? proyectosCtx : proyectosProp;
  const categoriasIngreso = Array.isArray(categoriasCtx) ? categoriasCtx : categoriasProp;

  const fmtMoney = (n) => {
    const num = Number(n);
    if (!Number.isFinite(num)) return "—";
    try {
      return num.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
    } catch {
      return `$${num.toFixed(2)}`;
    }
  };

  // Proyecto (lookup por id del contexto)
  const projById = useMemo(() => {
    const m = new Map();
    (proyectosTabla || []).forEach((p) => m.set(Number(p.id), p));
    return m;
  }, [proyectosTabla]);

  const nombreProyecto = (m) => {
    const desc =
      m?.proyecto?.descripcion ||
      projById.get(Number(m?.proyecto_id))?.descripcion ||
      "";
    return desc || "—";
  };

  // Categoría de ingreso (lookup por id del contexto)
  const catIngById = useMemo(() => {
    const m = new Map();
    (categoriasIngreso || []).forEach((c) => m.set(Number(c.id), c));
    return m;
  }, [categoriasIngreso]);

  const nombreCategoriaIngreso = (m) => {
    const nom =
      m?.categoriaingreso?.nombre ||
      catIngById.get(Number(m?.categoriaingreso_id))?.nombre ||
      "";
    return nom || "—";
  };

  const isIngreso = String(movimiento?.tipo || "").toLowerCase() === "ingreso";
  const canShow = Boolean(movimiento && isIngreso);

  const rows = canShow
    ? [
        ["Tipo", movimiento.tipo || "—"],
        ["Fecha", movimiento.fecha || "—"],
        ["Descripción", movimiento.descripcion || "—"],
        ["Monto", fmtMoney(movimiento.monto)],
        ["Proyecto", nombreProyecto(movimiento)], // ✅ puede ser null sin romper
        ["Categoría de Ingreso", nombreCategoriaIngreso(movimiento)],
        [
          "Referencia",
          movimiento.referencia_tipo
            ? `${movimiento.referencia_tipo} #${movimiento.referencia_id ?? ""}`
            : "—",
        ],
        ["Observaciones", movimiento.observaciones || "—"],
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
                    <td>{String(value ?? "—")}</td>
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
