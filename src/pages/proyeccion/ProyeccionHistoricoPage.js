import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Spinner,
  Table,
  Alert,
  Badge,
} from "react-bootstrap";
import { proyeccionApi } from "../../services/proyeccionApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";


export default function ProyeccionHistoricoPage() {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [sucursalId, setSucursalId] = useState("");
  const [loteCalculoId, setLoteCalculoId] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [resultados, setResultados] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [resumen, setResumen] = useState([]);


  async function handleBuscar() {
    setLoading(true);
    setErrorMsg("");
    setResultados([]);

    try {
      const data = await proyeccionApi.getHistorico({
        sucursalId: sucursalId || undefined,
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
        lote_calculo_id: loteCalculoId || undefined,
      });

      setResultados(
        data.sort((a, b) => {
          if (a.fecha < b.fecha) return -1;
          if (a.fecha > b.fecha) return 1;
          return Number(a.sucursal_id) - Number(b.sucursal_id);
        })
      );

      // 🟢 NUEVO: armamos la data para el gráfico
      // Vamos a graficar sólo una sucursal por vez si se filtró `sucursalId`.
      // Si no se filtró, tomamos la primera sucursal que aparezca en resultados
      const sucursalParaGrafico = (() => {
        if (sucursalId) return Number(sucursalId);
        // si no eligió sucursal, elegimos la primera del array
        if (data.length > 0) return data[0].sucursal_id;
        return null;
      })();

      const puntos = data
        .filter((r) => sucursalParaGrafico == null || Number(r.sucursal_id) === Number(sucursalParaGrafico))
        .sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0))
        .map((r) => ({
          fecha: r.fecha,
          proyeccion_final: Number(r.proyeccion_final || 0),
          venta_real: r.venta_real == null ? null : Number(r.venta_real),
        }));

      setChartData(puntos);
      // pedimos el resumen KPI global de ese rango
      try {
        const resumenData = await proyeccionApi.getResumen({
          fechaDesde: fechaDesde || undefined,
          fechaHasta: fechaHasta || undefined,
        });
        setResumen(resumenData);
      } catch (err) {
        console.warn("No se pudo cargar resumen:", err);
        setResumen([]);
      }


    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Error cargando histórico");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="py-3">
      {/* filtros arriba */}
      <Row className="g-3 mb-4 align-items-end">
        <Col md={2}>
          <Form.Label>Fecha desde</Form.Label>
          <Form.Control
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
        </Col>

        <Col md={2}>
          <Form.Label>Fecha hasta</Form.Label>
          <Form.Control
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
        </Col>

        <Col md={3}>
          <Form.Label>Sucursal (ID)</Form.Label>
          <Form.Control
            placeholder="Ej: 1 (opcional)"
            value={sucursalId}
            onChange={(e) => setSucursalId(e.target.value)}
          />
          <div className="text-muted" style={{ fontSize: "0.8rem" }}>
            Si lo dejás vacío, trae todas
          </div>
        </Col>

        <Col md={3}>
          <Form.Label>ID de corrida (lote_calculo_id)</Form.Label>
          <Form.Control
            placeholder="Ej: 1730130456712"
            value={loteCalculoId}
            onChange={(e) => setLoteCalculoId(e.target.value)}
          />
          <div className="text-muted" style={{ fontSize: "0.8rem" }}>
            Dejalo vacío si querés ver todo
          </div>
        </Col>

        <Col md={2} className="text-end">
          <Button
            className="w-100"
            variant="primary"
            disabled={loading}
            onClick={handleBuscar}
          >
            {loading ? (
              <>
                <Spinner size="sm" animation="border" /> Buscando...
              </>
            ) : (
              "Buscar"
            )}
          </Button>
        </Col>
      </Row>

      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
      {!loading && resultados.length === 0 && !errorMsg && (
        <Alert variant="secondary">Sin datos. Ajustá los filtros y buscá.</Alert>
      )}

      {/* 🔥 NUEVO: KPIs por sucursal en el rango */}
      {!loading && resumen.length > 0 && (
        <Row className="mb-4">
          {resumen.map((r, idx) => (
            <Col md={4} key={idx} className="mb-3">
              <div
                style={{
                  border: "1px solid #dee2e6",
                  borderRadius: "0.5rem",
                  padding: "0.75rem 1rem",
                  background: "#fff",
                  minHeight: "140px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    marginBottom: "0.25rem",
                  }}
                >
                  {r.sucursal_nombre} (ID {r.sucursal_id})
                </div>

                <div
                  className="text-muted"
                  style={{ fontSize: "0.75rem", marginBottom: "0.5rem" }}
                >
                  Días analizados: {r.dias_con_dato}
                </div>

                <div style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                  Proyección total:{" "}
                  <strong>
                    {Number(r.proyeccion_total || 0).toLocaleString("es-AR", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </strong>
                </div>

                <div style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                  Venta real total:{" "}
                  <strong>
                    {Number(r.venta_real_total || 0).toLocaleString("es-AR", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </strong>
                </div>

                <div style={{ fontSize: "0.8rem" }}>
                  Desvío promedio:{" "}
                  {r.desvio_promedio_pct == null ? (
                    <span className="text-muted">—</span>
                  ) : (
                    <span
                      style={{
                        color:
                          r.desvio_promedio_pct > 5
                            ? "#0d6efd" // azul si vendió más de lo esperado (> +5%)
                            : r.desvio_promedio_pct < -5
                              ? "#dc3545" // rojo si vendió menos (< -5%)
                              : "#198754", // verde si está cerca
                        fontWeight: 600,
                      }}
                    >
                      {r.desvio_promedio_pct.toFixed(1)} %
                    </span>
                  )}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}


      {/* 🟢 NUEVO: Gráfico comparando Proyección vs Venta Real */}
      {!loading && chartData.length > 0 && (
        <Row className="mb-4">
          <Col>
            <h5 style={{ marginBottom: "0.5rem" }}>
              Proyección vs Venta Real
            </h5>
            <div
              className="text-muted"
              style={{ fontSize: "0.8rem", marginBottom: "0.75rem" }}
            >
              Línea sólida: proyección_final. Línea punteada: venta_real.
            </div>

            <div
              style={{
                width: "100%",
                height: "300px",
                background: "#fff",
                border: "1px solid #dee2e6",
                borderRadius: "0.5rem",
                padding: "0.5rem 1rem",
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      if (typeof value === "number") {
                        return value.toLocaleString("es-AR", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        });
                      }
                      return value;
                    }}
                    labelFormatter={(label) => `Fecha: ${label}`}
                  />
                  <Legend />

                  {/* Línea de proyección */}
                  <Line
                    type="monotone"
                    dataKey="proyeccion_final"
                    name="Proyección final"
                    strokeWidth={2}
                    dot={false}
                  />

                  {/* Línea de venta real (puede tener nulls) */}
                  <Line
                    type="monotone"
                    dataKey="venta_real"
                    name="Venta real"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Col>
        </Row>
      )}

      {!loading && resultados.length > 0 && (
        <Table bordered hover responsive size="sm">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Sucursal</th>
              <th>Proy. base ($)</th>
              <th>Proy. final ($)</th>
              <th>Venta real ($)</th>
              <th>Desvío %</th>
              <th>Ajustes aplicados</th>
              <th>Lote</th>
              <th>Generado</th>
            </tr>
          </thead>
          <tbody>
            {resultados.map((r, idx) => (
              <tr key={idx}>
                <td style={{ whiteSpace: "nowrap" }}>{r.fecha}</td>

                <td style={{ whiteSpace: "nowrap" }}>
                  {r.sucursal_nombre || `Sucursal ${r.sucursal_id}`}
                </td>

                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  {Number(r.proyeccion_base || 0).toLocaleString("es-AR", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </td>

                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <strong>
                    {Number(r.proyeccion_final || 0).toLocaleString("es-AR", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </strong>
                </td>

                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  {r.venta_real == null
                    ? "—"
                    : Number(r.venta_real).toLocaleString("es-AR", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                </td>

                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  {r.desvio_pct == null
                    ? "—"
                    : `${r.desvio_pct.toFixed(1)} %`}
                </td>

                <td>
                  {Array.isArray(r.ajustes_aplicados) &&
                    r.ajustes_aplicados.length > 0 ? (
                    r.ajustes_aplicados.map((aj, j) => (
                      <Badge
                        bg="info"
                        text="dark"
                        key={j}
                        className="me-1 mb-1"
                        style={{ fontWeight: 500 }}
                      >
                        {aj.tipo === "feriado"
                          ? `${aj.descripcion || "Feriado"} x${aj.factor}`
                          : `${aj.nombre || aj.tipo} x${aj.factor}`}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted">Sin ajustes</span>
                  )}
                </td>

                <td style={{ whiteSpace: "nowrap" }}>{r.lote_calculo_id}</td>

                <td style={{ whiteSpace: "nowrap" }}>
                  {r.createdAt
                    ? new Date(r.createdAt).toLocaleString("es-AR")
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}





    </Container>
  );
}
