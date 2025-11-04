// ReciboPrint.jsx
import React from "react";

/**
 * Componente sólo para IMPRESIÓN.
 * Recibe: detalle, helpers nombreEmpleado, nombrePeriodo, fmtAr.
 */
export default function ReciboPrint({ detalle, nombreEmpleado, nombrePeriodo, fmtAr }) {
  if (!detalle) return null;

  // Agregamos orden: positivos primero
  const itemsFijos = (detalle.Items || []).filter(it => it.tipo === "FIJO");
  const itemsNoFijos = (detalle.Items || [])
    .filter(it => it.tipo !== "FIJO")
    .sort((a, b) => {
      const ma = Number(a.monto_total || 0);
      const mb = Number(b.monto_total || 0);
      if (ma >= 0 && mb < 0) return -1;
      if (ma < 0 && mb >= 0) return 1;
      return 0;
    });

  return (
    <div className="print-root">
      <h5 className="mb-0">Recibo de Sueldo</h5>
      <small className="muted">
        ID #{detalle.id} • {detalle?.Periodo
          ? `${detalle.Periodo.anio}-${String(detalle.Periodo.mes).padStart(2, "0")}`
          : nombrePeriodo(detalle.periodo_id)}
      </small>
      <hr className="sep" />

      {/* Cabecera */}
      <div className="row no-break">
        <div className="col-6">
          <div className="label">Empleado</div>
          <div className="field">{nombreEmpleado(detalle.empleado_id, detalle.Empleado)}</div>
          <div className="muted small">Estado: <b className="up">{detalle.estado}</b></div>
        </div>

        <div className="col-6">
          <div className="label">Período</div>
          <div className="field">
            {detalle?.Periodo
              ? `${detalle.Periodo.anio}-${String(detalle.Periodo.mes).padStart(2, "0")}`
              : nombrePeriodo(detalle.periodo_id)}
          </div>
          <div className="muted small">ID Recibo: #{detalle.id}</div>
        </div>
      </div>

      <hr className="sep" />

      {/* Totales */}
      <div className="row no-break">
        <div className="col-4">
          <div className="label">Sueldo</div>
          <div className="field white">${fmtAr(detalle.sueldo)}</div>
        </div>
        <div className="col-4">
          <div className="label">A cobrar por banco</div>
          <div className="field white">${fmtAr(detalle.acobrarporbanco)}</div>
        </div>
        <div className="col-4">
          <div className="summary">
            <div className="line">
              <span>Total Haberes</span>
              <b>${fmtAr(detalle.totalhaberes)}</b>
            </div>
            <div className="line">
              <span>Descuentos</span>
              <b>${fmtAr(detalle.descuentos)}</b>
            </div>
            <hr className="sep-compact" />
            <div className="line strong">
              <span>A cobrar en sucursal</span>
              <b>${fmtAr(detalle.acobrarporsucursal)}</b>
            </div>
          </div>
        </div>
      </div>

      <hr className="sep" />

      {/* Fijos */}
      <h6 className="section-title">Adicionales fijos vigentes</h6>
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: "80px" }}>ID</th>
            <th>Descripción</th>
            <th className="right" style={{ width: "160px" }}>Monto</th>
          </tr>
        </thead>
        <tbody>
          {itemsFijos.length ? itemsFijos.map(it => (
            <tr key={it.id}>
              <td>{it.id}</td>
              <td>{it.descripcion || "—"}</td>
              <td className="right">${fmtAr(it.monto_total)}</td>
            </tr>
          )) : (
            <tr><td colSpan={3} className="center muted">Sin fijos vigentes para este período/empleado</td></tr>
          )}
        </tbody>
      </table>

      {/* Variables + Adelantos */}
      <h6 className="section-title">Adicionales y Descuentos del período</h6>
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: "80px" }}>ID</th>
            <th>Descripción</th>
            <th className="right" style={{ width: "160px" }}>Monto</th>
          </tr>
        </thead>
        <tbody>
          {itemsNoFijos.length ? itemsNoFijos.map(it => (
            <tr key={it.id}>
              <td>{it.id}</td>
              <td>{it.descripcion || "—"}</td>
              <td className="right">${fmtAr(it.monto_total)}</td>
            </tr>
          )) : (
            <tr><td colSpan={4} className="center muted">Sin adicionales para este período/empleado</td></tr>
          )}
        </tbody>
      </table>

      <div className="muted note">
        Los montos positivos se suman a <b>Total Haberes</b>. Los montos negativos y los adelantos alimentan <b>Descuentos</b>.
      </div>
    </div>
  );
}
