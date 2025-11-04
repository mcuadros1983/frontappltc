// VentasEntreRangos.jsx
import React, { useMemo, useState, useContext } from "react";
import { Container, Row, Col, Button, Form, Table, Badge } from "react-bootstrap";
import Contexts from "../../../context/Contexts";
import "../../../components/css/VentasEntreRangos.css"; // ⬅️ NUEVO

const apiUrl = process.env.REACT_APP_API_URL;

export default function VentasEntreRangos() {
  const ctx = useContext(Contexts.DataContext);
  const sucursalesTabla = ctx?.sucursalesTabla || [];

  // RANGOS dinámicos
  const [ranges, setRanges] = useState([{ id: 1, desde: "", hasta: "" }]);
  const [nextId, setNextId] = useState(2);

  // Modo y tipo de métrica
  const [modo, setModo] = useState("totales"); // 'totales' | 'sucursal'
  const [tipo, setTipo] = useState("monto");   // 'monto' | 'kg'

  // Config y UI
  const [selectedSucursales, setSelectedSucursales] = useState([]); // ids
  const [detallePorRango, setDetallePorRango] = useState(true);     // true: columnas por rango; false: solo total combinado
  const [soloConDatos, setSoloConDatos] = useState(true);           // oculta sucursales 0 si está ON
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Resultado calculado
  const [rows, setRows] = useState([]);
  const [rangeCols, setRangeCols] = useState([]); // [{id,label}]

  // ===== Helpers =====
  const isValidDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

  const nombreSucursal = (id) =>
    sucursalesTabla.find((s) => Number(s.id) === Number(id))?.nombre || `Suc ${id}`;

  // color consistente por sucursal
  const colorScale = [
    "#3366CC","#DC3912","#FF9900","#109618","#990099","#0099C6",
    "#DD4477","#66AA00","#B82E2E","#316395","#994499","#22AA99",
  ];
  const colorBySucursal = (sid) => {
    const n = Number(sid) || 0;
    return colorScale[Math.abs(n) % colorScale.length];
  };

  const handleAddRange = () => {
    setRanges((prev) => [...prev, { id: nextId, desde: "", hasta: "" }]);
    setNextId((n) => n + 1);
  };

  const handleRemoveRange = (id) => {
    setRanges((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRangeChange = (id, field, value) => {
    setRanges((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleChangeSucursales = (e) => {
    const opts = Array.from(e.target.selectedOptions).map((o) => o.value);
    setSelectedSucursales(opts);
  };

  // ===== Fetch por rango según tipo =====
  async function fetchMonto(desde, hasta) {
    const res = await fetch(`${apiUrl}/ventas/filtradas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fechaDesde: desde, fechaHasta: hasta }),
    });
    if (!res.ok) throw new Error("Error al obtener ventas por monto");
    return res.json(); // [{fecha,sucursal_id,monto},...]
  }

  async function fetchKg(desde, hasta) {
    const res = await fetch(`${apiUrl}/ventas/kg_por_sucursal_filtradas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fechaDesde: desde, fechaHasta: hasta }),
    });
    if (!res.ok) throw new Error("Error al obtener ventas por kg");
    const data = await res.json();
    return data?.ventasAgrupadas || []; // [{fecha,sucursal_id,total_kg},...]
  }

  // ===== Procesamiento principal =====
  const handleProcesar = async () => {
    setError("");
    setRows([]);
    setRangeCols([]);

    const rangosValidos = ranges.filter(
      (r) => isValidDate(r.desde) && isValidDate(r.hasta)
    );
    if (rangosValidos.length === 0) {
      setError("Cargá al menos un rango con ambas fechas (YYYY-MM-DD).");
      return;
    }

    setLoading(true);
    try {
      const fetchers = rangosValidos.map((r) =>
        (tipo === "monto" ? fetchMonto(r.desde, r.hasta) : fetchKg(r.desde, r.hasta)).then((data) => ({
          id: r.id,
          desde: r.desde,
          hasta: r.hasta,
          data,
        }))
      );
      const resultados = await Promise.all(fetchers);

      const cols = resultados.map((r, idx) => ({
        id: r.id,
        label: `R${idx + 1} ${r.desde}→${r.hasta}`,
      }));
      setRangeCols(cols);

      const sel = (modo === "sucursal")
        ? (selectedSucursales.length
            ? selectedSucursales.map((s) => Number(s))
            : sucursalesTabla.map((s) => Number(s.id)))
        : [];

      if (modo === "totales") {
        const totalPorRango = {};
        let totalCombinado = 0;

        for (const r of resultados) {
          if (tipo === "monto") {
            const t = r.data.reduce((acc, it) => acc + Number(it.monto || 0), 0);
            totalPorRango[r.id] = t;
            totalCombinado += t;
          } else {
            const t = r.data.reduce((acc, it) => acc + Number(it.total_kg || it.total_cantidadpeso || 0), 0);
            totalPorRango[r.id] = t;
            totalCombinado += t;
          }
        }

        setRows([{ key: "TOTAL", totalPorRango, totalCombinado }]);
      } else {
        const rowsBySuc = new Map();

        for (const sid of sel) {
          rowsBySuc.set(sid, {
            sucursal_id: sid,
            nombre: nombreSucursal(sid),
            color: colorBySucursal(sid),
            totalPorRango: {},
            totalCombinado: 0,
          });
        }

        for (const r of resultados) {
          if (tipo === "monto") {
            const sumBySuc = r.data.reduce((acc, it) => {
              const sid = Number(it.sucursal_id);
              acc[sid] = (acc[sid] || 0) + Number(it.monto || 0);
              return acc;
            }, {});
            for (const sid of sel) {
              const v = sumBySuc[sid] || 0;
              const row = rowsBySuc.get(sid);
              row.totalPorRango[r.id] = v;
              row.totalCombinado += v;
            }
          } else {
            const sumBySuc = r.data.reduce((acc, it) => {
              const sid = Number(it.sucursal_id);
              const val = Number(it.total_kg || it.total_cantidadpeso || 0);
              acc[sid] = (acc[sid] || 0) + val;
              return acc;
            }, {});
            for (const sid of sel) {
              const v = sumBySuc[sid] || 0;
              const row = rowsBySuc.get(sid);
              row.totalPorRango[r.id] = v;
              row.totalCombinado += v;
            }
          }
        }

        let out = Array.from(rowsBySuc.values());
        if (soloConDatos) out = out.filter((r) => r.totalCombinado !== 0);
        out.sort((a, b) => b.totalCombinado - a.totalCombinado);
        setRows(out);
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al procesar");
    } finally {
      setLoading(false);
    }
  };

  // ===== Tabla =====
  const unidad = tipo === "monto" ? "Monto" : "Kg";
  const formato = (v) =>
    tipo === "monto"
      ? Number(v || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : Number(v || 0).toLocaleString("es-AR", { maximumFractionDigits: 3 });

  const rangoHeaders = detallePorRango ? rangeCols : [];

  const totalesPorColumna = useMemo(() => {
    if (!rows.length) return {};
    const acc = {};
    if (modo === "totales") {
      const r = rows[0];
      for (const c of rangoHeaders) acc[c.id] = r.totalPorRango[c.id] || 0;
      acc.__total__ = r.totalCombinado || 0;
    } else {
      for (const c of rangoHeaders) {
        acc[c.id] = rows.reduce((sum, r) => sum + Number(r.totalPorRango[c.id] || 0), 0);
      }
      acc.__total__ = rows.reduce((sum, r) => sum + Number(r.totalCombinado || 0), 0);
    }
    return acc;
  }, [rows, rangoHeaders, modo]);

  return (
    <Container fluid className="px-3 ver-page">
      <h2 className="mb-3 ver-title">Ventas entre Rangos</h2>

      {/* RANGOS */}
      <Row className="g-3">
        {ranges.map((r, idx) => (
          <Col md={6} lg={4} key={r.id}>
            <div className="ver-rangeCard">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <strong>Rango {idx + 1}</strong>
                {ranges.length > 1 && (
                  <Button size="sm" variant="outline-danger" onClick={() => handleRemoveRange(r.id)} className="ver-btn-outline">
                    Quitar
                  </Button>
                )}
              </div>
              <Form.Label>Desde</Form.Label>
              <Form.Control
                type="date"
                value={r.desde}
                onChange={(e) => handleRangeChange(r.id, "desde", e.target.value)}
                className="form-control my-input ver-input"
              />
              <Form.Label className="mt-2">Hasta</Form.Label>
              <Form.Control
                type="date"
                value={r.hasta}
                onChange={(e) => handleRangeChange(r.id, "hasta", e.target.value)}
                className="form-control my-input ver-input"
              />
            </div>
          </Col>
        ))}
        <Col xs="12">
          <Button variant="outline-primary" onClick={handleAddRange} className="mt-1 ver-btn-outline">
            + Agregar rango
          </Button>
        </Col>
      </Row>

      {/* CONTROLES */}
      <Row className="g-3 mt-2 ver-toolbar">
        <Col md={3}>
          <Form.Label>Ver por</Form.Label>
          <Form.Select value={tipo} onChange={(e) => setTipo(e.target.value)} className="form-control my-input ver-input">
            <option value="monto">Monto</option>
            <option value="kg">Kg</option>
          </Form.Select>
        </Col>

        <Col md={3}>
          <Form.Label>Modo</Form.Label>
          <Form.Select value={modo} onChange={(e) => setModo(e.target.value)} className="form-control my-input ver-input">
            <option value="totales">Totales</option>
            <option value="sucursal">Por sucursal</option>
          </Form.Select>
        </Col>

        {modo === "sucursal" && (
          <Col md={6}>
            <Form.Label>Seleccionar sucursales (Ctrl/Cmd para múltiple)</Form.Label>
            <Form.Select
              multiple
              value={selectedSucursales}
              onChange={handleChangeSucursales}
              className="form-control my-input ver-input"
              style={{ minHeight: 140 }}
            >
              {sucursalesTabla.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </Form.Select>
          </Col>
        )}
      </Row>

      <Row className="g-3 mt-2">
        <Col md={3} className="d-flex flex-column justify-content-end">
          <Form.Check
            type="switch"
            id="detalle-por-rango"
            label="Detalle por rango"
            checked={detallePorRango}
            onChange={(e) => setDetallePorRango(e.target.checked)}
          />
          {modo === "sucursal" && (
            <Form.Check
              type="switch"
              id="solo-con-datos"
              label="Ocultar sucursales sin datos"
              checked={soloConDatos}
              onChange={(e) => setSoloConDatos(e.target.checked)}
            />
          )}
        </Col>
      </Row>

      {/* ACCIÓN */}
      <div className="mt-3 d-flex gap-2">
        <Button onClick={handleProcesar} disabled={loading} className="ver-btn">
          {loading ? "Procesando…" : "Procesar"}
        </Button>
        {error && <Badge bg="danger" className="ms-2">{error}</Badge>}
      </div>

      {/* TABLA */}
      <div className="mt-4 ver-tablewrap table-responsive">
        <Table striped bordered hover responsive className="ver-table">
          <thead>
            <tr>
              {modo === "totales" ? (
                <>
                  <th>Concepto</th>
                  {detallePorRango && rangoHeaders.map((c) => (
                    <th key={c.id}>{c.label} ({unidad})</th>
                  ))}
                  <th>Total combinado ({unidad})</th>
                </>
              ) : (
                <>
                  <th style={{ minWidth: 220 }}>Sucursal</th>
                  {detallePorRango && rangoHeaders.map((c) => (
                    <th key={c.id}>{c.label} ({unidad})</th>
                  ))}
                  <th>Total combinado ({unidad})</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {modo === "totales" ? (
              rows.map((r) => (
                <tr key="TOTAL">
                  <td><strong>Total</strong></td>
                  {detallePorRango && rangoHeaders.map((c) => (
                    <td key={c.id} className="text-end">{formato(r.totalPorRango[c.id])}</td>
                  ))}
                  <td className="text-end fw-bold">{formato(r.totalCombinado)}</td>
                </tr>
              ))
            ) : (
              rows.map((r) => (
                <tr key={r.sucursal_id}>
                  <td>
                    <span
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 10,
                        backgroundColor: r.color,
                        borderRadius: 2,
                        marginRight: 8,
                      }}
                    />
                    {r.nombre}
                  </td>
                  {detallePorRango && rangoHeaders.map((c) => (
                    <td key={c.id} className="text-end">
                      {formato(r.totalPorRango[c.id])}
                    </td>
                  ))}
                  <td className="text-end fw-bold">{formato(r.totalCombinado)}</td>
                </tr>
              ))
            )}
          </tbody>

          {(rows.length > 0) && (
            <tfoot>
              <tr>
                <td className="fw-bold">Totales</td>
                {detallePorRango && rangoHeaders.map((c) => (
                  <td key={c.id} className="text-end fw-bold">
                    {formato(totalesPorColumna[c.id])}
                  </td>
                ))}
                <td className="text-end fw-bold">{formato(totalesPorColumna.__total__)}</td>
              </tr>
            </tfoot>
          )}
        </Table>
      </div>
    </Container>
  );
}
