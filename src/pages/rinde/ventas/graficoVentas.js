// GraficoVentasComparativo.jsx
import React, { useMemo, useState, useContext } from "react";
import { Container, Row, Col, Button, Form, Spinner, Badge } from "react-bootstrap";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import Contexts from "../../../context/Contexts";
import "../../../components/css/GraficoVentasComparativo.css"; // ⬅️ NUEVO

const apiUrl = process.env.REACT_APP_API_URL;

export default function GraficoVentasComparativo() {
  const ctx = useContext(Contexts.DataContext);
  const sucursalesTabla = ctx?.sucursalesTabla || [];

  // Rangos de fecha
  const [r1Desde, setR1Desde] = useState("");
  const [r1Hasta, setR1Hasta] = useState("");
  const [r2Desde, setR2Desde] = useState("");
  const [r2Hasta, setR2Hasta] = useState("");

  // Modo
  const [modo, setModo] = useState("totales"); // "totales" | "sucursal"
  const [selectedSucursales, setSelectedSucursales] = useState([]); // ids
  const [topN, setTopN] = useState(6); // máximo de sucursales visibles
  const [alinearPorDia, setAlinearPorDia] = useState(true); // alinear por índice de día
  const [indice100, setIndice100] = useState(false); // normalizar a 100
  const [loading, setLoading] = useState(false);
  const [series, setSeries] = useState([]); // [{name, data: [{x, y}], color, rango: 'R1'|'R2'}]
  const [error, setError] = useState("");

  const nombreSucursal = (id) =>
    sucursalesTabla.find((s) => Number(s.id) === Number(id))?.nombre || `Suc ${id}`;

  // === Helpers ===
  const isValidDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

  const tieneRango2 = useMemo(
    () => isValidDate(r2Desde) && isValidDate(r2Hasta),
    [r2Desde, r2Hasta]
  );

  const diasEntre = (d0, d1) => {
    const a = new Date(d0 + "T00:00:00");
    const b = new Date(d1 + "T00:00:00");
    return Math.max(0, Math.round((b - a) / 86400000));
  };

  const rangoAIndices = (desde, hasta) => {
    const out = [];
    const D = new Date(desde + "T00:00:00");
    const n = diasEntre(desde, hasta) + 1;
    for (let i = 0; i < n; i++) {
      const d = new Date(D);
      d.setDate(D.getDate() + i);
      out.push(d.toISOString().slice(0, 10));
    }
    return out;
  };

  const fetchVentas = async (desde, hasta) => {
    const res = await fetch(`${apiUrl}/ventas/filtradas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fechaDesde: desde, fechaHasta: hasta }),
    });
    if (!res.ok) throw new Error("Error al obtener ventas");
    const data = await res.json();
    return data; // [{fecha, sucursal_id, monto}, ...]
  };

  const agruparPorFecha = (arr) => {
    const map = new Map();
    arr.forEach(({ fecha, monto }) => {
      const k = fecha;
      map.set(k, (map.get(k) || 0) + Number(monto || 0));
    });
    return map;
  };

  const agruparPorFechaYSucursal = (arr) => {
    const map = new Map();
    arr.forEach(({ fecha, sucursal_id, monto }) => {
      const sid = Number(sucursal_id);
      if (!map.has(sid)) map.set(sid, new Map());
      const m = map.get(sid);
      m.set(fecha, (m.get(fecha) || 0) + Number(monto || 0));
    });
    return map;
  };

  const normalizarIndice100 = (serie) => {
    const first = serie.find((p) => p.y !== 0)?.y || 0;
    if (!first) return serie.map((p) => ({ ...p, y: 0 }));
    return serie.map((p) => ({ ...p, y: (p.y / first) * 100 }));
  };

  const colorScale = [
    "#3366CC", "#DC3912", "#FF9900", "#109618", "#990099", "#0099C6",
    "#DD4477", "#66AA00", "#B82E2E", "#316395", "#994499", "#22AA99",
  ];

  const handleProcesar = async () => {
    setError("");
    if (!(isValidDate(r1Desde) && isValidDate(r1Hasta))) {
      setError("Completá correctamente el Rango 1 (YYYY-MM-DD).");
      return;
    }
    if ((r2Desde || r2Hasta) && !tieneRango2) {
      setError("Si vas a usar el Rango 2, completá ambas fechas (YYYY-MM-DD).");
      return;
    }

    setLoading(true);
    try {
      const dataR1 = await fetchVentas(r1Desde, r1Hasta);
      const dataR2 = tieneRango2 ? await fetchVentas(r2Desde, r2Hasta) : null;
      let outSeries = [];

      if (modo === "totales") {
        const mapR1 = agruparPorFecha(dataR1);
        const idxFechasR1 = rangoAIndices(r1Desde, r1Hasta);
        const serieR1 = (alinearPorDia ? idxFechasR1 : Array.from(mapR1.keys()))
          .map((fecha, i) => ({
            x: alinearPorDia ? `Día ${i + 1}` : fecha,
            y: mapR1.get(fecha) || 0,
            _fecha: fecha,
          }));

        outSeries.push({
          name: tieneRango2 ? `R1 ${r1Desde}→${r1Hasta}` : `Ventas ${r1Desde}→${r1Hasta}`,
          rango: "R1",
          color: colorScale[0],
          data: indice100 ? normalizarIndice100(serieR1) : serieR1,
        });

        if (dataR2) {
          const mapR2 = agruparPorFecha(dataR2);
          const idxFechasR2 = rangoAIndices(r2Desde, r2Hasta);
          const serieR2 = (alinearPorDia ? idxFechasR2 : Array.from(mapR2.keys()))
            .map((fecha, i) => ({
              x: alinearPorDia ? `Día ${i + 1}` : fecha,
              y: mapR2.get(fecha) || 0,
              _fecha: fecha,
            }));
          outSeries.push({
            name: `R2 ${r2Desde}→${r2Hasta}`,
            rango: "R2",
            color: colorScale[1],
            data: indice100 ? normalizarIndice100(serieR2) : serieR2,
          });
        }
      } else {
        const sel = selectedSucursales.length
          ? selectedSucursales.map((s) => Number(s))
          : sucursalesTabla.map((s) => Number(s.id));

        const mapR1 = agruparPorFechaYSucursal(
          dataR1.filter((v) => sel.includes(Number(v.sucursal_id)))
        );

        const mapR2 = dataR2
          ? agruparPorFechaYSucursal(
              dataR2.filter((v) => sel.includes(Number(v.sucursal_id)))
            )
          : null;

        const vol = new Map();
        sel.forEach((sid) => {
          const tot1 = Array.from(mapR1.get(sid)?.values() || []).reduce((a, b) => a + b, 0);
          const tot2 = mapR2
            ? Array.from(mapR2.get(sid)?.values() || []).reduce((a, b) => a + b, 0)
            : 0;
          vol.set(sid, tot1 + tot2);
        });

        const sorted = Array.from(vol.entries()).sort((a, b) => b[1] - a[1]);
        const top = sorted.slice(0, topN).map(([sid]) => sid);
        const otros = sorted.slice(topN).map(([sid]) => sid);

        const idxFechasR1 = rangoAIndices(r1Desde, r1Hasta);
        const idxFechasR2 = dataR2 ? rangoAIndices(r2Desde, r2Hasta) : [];

        top.forEach((sid, i) => {
          const m1 = mapR1.get(sid) || new Map();
          const serieR1 = (alinearPorDia ? idxFechasR1 : Array.from(m1.keys())).map((fecha, ix) => ({
            x: alinearPorDia ? `Día ${ix + 1}` : fecha,
            y: m1.get(fecha) || 0,
            _fecha: fecha,
          }));

          outSeries.push({
            name: dataR2 ? `${nombreSucursal(sid)} (R1)` : `${nombreSucursal(sid)}`,
            rango: "R1",
            color: colorScale[(i * 2) % colorScale.length],
            data: indice100 ? normalizarIndice100(serieR1) : serieR1,
          });

          if (mapR2) {
            const m2 = mapR2.get(sid) || new Map();
            const serieR2 = (alinearPorDia ? idxFechasR2 : Array.from(m2.keys())).map((fecha, ix) => ({
              x: alinearPorDia ? `Día ${ix + 1}` : fecha,
              y: m2.get(fecha) || 0,
              _fecha: fecha,
            }));

            outSeries.push({
              name: `${nombreSucursal(sid)} (R2)`,
              rango: "R2",
              color: colorScale[(i * 2 + 1) % colorScale.length],
              data: indice100 ? normalizarIndice100(serieR2) : serieR2,
            });
          }
        });

        if (otros.length > 0) {
          const acumMap = (baseMap, sids) => {
            const out = new Map();
            sids.forEach((sid) => {
              const m = baseMap.get(sid) || new Map();
              for (const [fecha, val] of m.entries()) {
                out.set(fecha, (out.get(fecha) || 0) + val);
              }
            });
            return out;
          };

          const m1Otros = acumMap(mapR1, otros);
          const serieR1Otros = (alinearPorDia ? idxFechasR1 : Array.from(m1Otros.keys())).map((fecha, ix) => ({
            x: alinearPorDia ? `Día ${ix + 1}` : fecha,
            y: m1Otros.get(fecha) || 0,
            _fecha: fecha,
          }));

          outSeries.push({
            name: dataR2 ? `Otros (R1)` : `Otros`,
            rango: "R1",
            color: "#777777",
            data: indice100 ? normalizarIndice100(serieR1Otros) : serieR1Otros,
          });

          if (mapR2) {
            const m2Otros = acumMap(mapR2, otros);
            const serieR2Otros = (alinearPorDia ? idxFechasR2 : Array.from(m2Otros.keys())).map((fecha, ix) => ({
              x: alinearPorDia ? `Día ${ix + 1}` : fecha,
              y: m2Otros.get(fecha) || 0,
              _fecha: fecha,
            }));
            outSeries.push({
              name: `Otros (R2)`,
              rango: "R2",
              color: "#BBBBBB",
              data: indice100 ? normalizarIndice100(serieR2Otros) : serieR2Otros,
            });
          }
        }
      }

      setSeries(outSeries);
    } catch (e) {
      console.error(e);
      setSeries([]);
      setError(e.message || "Error al procesar");
    } finally {
      setLoading(false);
    }
  };

  const xDomain = useMemo(() => {
    const s0 = series[0]?.data || [];
    return s0.map((p) => p.x);
  }, [series]);

  const chartData = useMemo(() => {
    if (!series.length) return [];
    const map = new Map(); // x -> { x, [serieName]: y }
    series.forEach((s) => {
      s.data.forEach((p) => {
        if (!map.has(p.x)) map.set(p.x, { x: p.x });
        map.get(p.x)[s.name] = p.y;
      });
    });
    return (xDomain.length ? xDomain : Array.from(map.keys())).map((x) => map.get(x));
  }, [series, xDomain]);

  const handleChangeSucursales = (e) => {
    const opts = Array.from(e.target.selectedOptions).map((o) => o.value);
    setSelectedSucursales(opts);
  };

  return (
    <Container fluid className="px-3 gvc-page">
      <h2 className="mb-3 gvc-title">Gráfico de Ventas: Comparativo entre dos rangos</h2>

      <Row className="g-3">
        <Col md={3}>
          <Form.Label>Rango 1 - Desde</Form.Label>
          <Form.Control type="date" value={r1Desde} onChange={(e) => setR1Desde(e.target.value)} className="gvc-input" />
        </Col>
        <Col md={3}>
          <Form.Label>Rango 1 - Hasta</Form.Label>
          <Form.Control type="date" value={r1Hasta} onChange={(e) => setR1Hasta(e.target.value)} className="gvc-input" />
        </Col>
        <Col md={3}>
          <Form.Label>Rango 2 - Desde</Form.Label>
          <Form.Control type="date" value={r2Desde} onChange={(e) => setR2Desde(e.target.value)} className="gvc-input" />
        </Col>
        <Col md={3}>
          <Form.Label>Rango 2 - Hasta</Form.Label>
          <Form.Control type="date" value={r2Hasta} onChange={(e) => setR2Hasta(e.target.value)} className="gvc-input" />
        </Col>
      </Row>

      <Row className="g-3 mt-2 gvc-toolbar">
        <Col md={3}>
          <Form.Label>Modo</Form.Label>
          <Form.Select value={modo} onChange={(e) => setModo(e.target.value)} className="form-control my-input gvc-input">
            <option value="totales">Totales</option>
            <option value="sucursal">Por sucursal</option>
          </Form.Select>
        </Col>

        {modo === "sucursal" && (
          <>
            <Col md={5}>
              <Form.Label>Seleccionar sucursales (Ctrl/Cmd para múltiple)</Form.Label>
              <Form.Select
                multiple
                value={selectedSucursales}
                onChange={handleChangeSucursales}
                style={{ minHeight: 140 }}
                className="form-control my-input gvc-input"
              >
                {sucursalesTabla.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label>Top N sucursales</Form.Label>
              <Form.Control
                type="number"
                min={1}
                max={20}
                value={topN}
                onChange={(e) => setTopN(Number(e.target.value || 1))}
                className="gvc-input"
              />
              <div className="text-muted mt-1" style={{ fontSize: 12 }}>
                El resto se agrupa en “Otros”.
              </div>
            </Col>
          </>
        )}

        <Col md={2} className="d-flex flex-column justify-content-end">
          <Form.Check
            type="switch"
            id="alinear-por-dia"
            label="Alinear por día"
            checked={alinearPorDia}
            onChange={(e) => setAlinearPorDia(e.target.checked)}
          />
          <Form.Check
            type="switch"
            id="indice-100"
            label="Índice 100"
            checked={indice100}
            onChange={(e) => setIndice100(e.target.checked)}
          />
        </Col>
      </Row>

      <div className="mt-3 d-flex gap-2">
        <Button onClick={handleProcesar} disabled={loading} className="gvc-btn">
          {loading ? <><Spinner size="sm" className="me-2" /> Procesando…</> : "Procesar"}
        </Button>
        {error && <Badge bg="danger" className="ms-2">{error}</Badge>}
      </div>

      <div className="mt-4 gvc-chartwrap" style={{ width: "100%", height: 440 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 16, right: 24, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" />
            <YAxis tickFormatter={(v) => (indice100 ? `${Number(v).toFixed(0)}` : Number(v).toLocaleString("es-AR"))} />
            <Tooltip />
            <Legend />
            {series.map((s, i) => (
              <Line
                key={s.name}
                type="monotone"
                dataKey={s.name}
                stroke={s.color || colorScale[i % colorScale.length]}
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Container>
  );
}

