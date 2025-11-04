// src/pages/Asistencia/VacacionesSchedule.js
import React, { useState, useContext, useEffect, useMemo } from "react";
import {
  Container,
  Table,
  Alert,
  Form,
  Button,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";

import Contexts from "../../context/Contexts";
import { getVacacionesEnIntervalo } from "../../services/vacacionesApi";
import "./VacacionesSchedule.css";

const apiUrl = process.env.REACT_APP_API_URL;

// ----------------- Helpers empleado -----------------
function getEmpleadoId(e) {
  return (
    e?.empleado?.id ??
    e?.id ??
    e?.empleado_id ??
    null
  );
}

function getEmpleadoNombre(e) {
  const ap =
    e?.clientePersona?.apellido ||
    e?.empleado?.apellido ||
    "";
  const no =
    e?.clientePersona?.nombre ||
    e?.empleado?.nombre ||
    "";
  const full = `${ap} ${no}`.trim();
  return full || `Empleado #${getEmpleadoId(e) || "—"}`;
}

// ----------------- Componente -----------------
export function VacacionesSchedule() {
  const { empleados = [], sucursales = [] } = useContext(
    Contexts.DataContext
  );

  // vacaciones asignadas devueltas por el back en el rango buscado
  const [vacaciones, setVacaciones] = useState([]);

  // datosEmpleado (sucursal_id, franco_am, franco_pm, etc.)
  const [datosEmpleadoList, setDatosEmpleadoList] = useState([]);

  // filtros
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sucursalId, setSucursalId] = useState("");

  // rango de fechas expandido día a día
  const [dateRange, setDateRange] = useState([]);

  // ui state
  const [loading, setLoading] = useState(false);
  const [loadingDatosEmpleado, setLoadingDatosEmpleado] = useState(false);
  const [error, setError] = useState("");

  // Cargamos datosempleado una sola vez al montar el componente,
  // similar a lo que hacés en otros componentes.
  useEffect(() => {
    let abort = false;

    async function fetchDatosEmpleado() {
      setLoadingDatosEmpleado(true);
      try {
        const r = await fetch(
          `${apiUrl}/datosempleado?limit=1000`,
          { credentials: "include" }
        );
        const d = await r.json().catch(() => null);

        if (!r.ok) {
          throw new Error(
            d?.error || "No se pudo obtener datosempleado."
          );
        }

        // el controller .listar responde { items, page, ...} ó rows directas.
        const items = Array.isArray(d?.items)
          ? d.items
          : Array.isArray(d)
          ? d
          : [];

        if (!abort) {
          setDatosEmpleadoList(items);
        }
      } catch (err) {
        if (!abort) {
          console.error("❌ Error cargando datosempleado:", err);
          setDatosEmpleadoList([]);
        }
      } finally {
        if (!abort) {
          setLoadingDatosEmpleado(false);
        }
      }
    }

    fetchDatosEmpleado();
    return () => {
      abort = true;
    };
  }, []);

  // Armamos un Map para lookup rápido:
  // empleado_id -> { sucursal_id, franco_am, franco_pm, ... }
  const datosEmpleadoPorId = useMemo(() => {
    const map = new Map();
    for (const row of datosEmpleadoList) {
      const empId = Number(row.empleado_id);
      if (!empId) continue;
      map.set(empId, row);
    }
    return map;
  }, [datosEmpleadoList]);

  function buildDateRange(start, end) {
    const out = [];
    let cur = new Date(start);
    const fin = new Date(end);
    while (cur <= fin) {
      out.push(cur.toISOString().split("T")[0]);
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }

  async function handleSearch(e) {
    e.preventDefault();

    if (!startDate || !endDate) {
      setError("Debe seleccionar el rango de fechas");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("La fecha final no puede ser menor a la fecha de inicio");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Llamamos tu endpoint nuevo que creamos en vacacionesApi.js
      const data = await getVacacionesEnIntervalo(
        startDate,
        endDate,
        sucursalId
      );

      const arr = Array.isArray(data) ? data : [];
      setVacaciones(arr);

      setDateRange(buildDateRange(startDate, endDate));
    } catch (err) {
      console.error("❌ Error getVacacionesEnIntervalo:", err);
      setError("Error al obtener las vacaciones: " + err.message);
      setVacaciones([]);
      setDateRange([]);
    } finally {
      setLoading(false);
    }
  }

  // Dado un empleado, construimos las celdas día a día
  function renderEmpleadoRow(emp) {
    const empId = Number(getEmpleadoId(emp));

    // 1. mapear días de vacaciones de este empleado
    const vacationDays = new Set();
    for (const v of vacaciones) {
      if (Number(v.empleado_id) === empId) {
        if (v.fecha_desde && v.fecha_hasta) {
          let cur = new Date(v.fecha_desde);
          const fin = new Date(v.fecha_hasta);
          while (cur <= fin) {
            vacationDays.add(cur.toISOString().split("T")[0]);
            cur.setDate(cur.getDate() + 1);
          }
        }
      }
    }

    // 2. buscar info extendida (sucursal, francos) en datosEmpleadoPorId
    const ext = datosEmpleadoPorId.get(empId) || {};
    const francoAm = ext.franco_am ?? null;
    const francoPm = ext.franco_pm ?? null;

    return (
      <tr key={empId} className="text-center">
        <td className="fixed-column">{getEmpleadoNombre(emp)}</td>

        {dateRange.map((date) => {
          // find weekend
          const dow = new Date(date).getDay(); // 0 dom..6 sab
          const isWeekend = dow === 0 || dow === 6;

          // adaptar franco: en tu data original 1=lun..7=dom
          const dow1to7 = dow === 0 ? 7 : dow; // domingo ->7
          const isFrancoAM = Number(francoAm) === dow1to7;
          const isFrancoPM = Number(francoPm) === dow1to7;

          // prioridad de color:
          // 1) vacaciones rojo
          // 2) franco azul
          // 3) finde amarillo
          const isVacation = vacationDays.has(date);

          let bg = "";
          if (isVacation) {
            bg = "red";
          } else if (isFrancoAM || isFrancoPM) {
            bg = "blue";
          } else if (isWeekend) {
            bg = "yellow";
          }

          // texto dentro de la celda (solo para franco AM/PM)
          let text = "";
          if (!isVacation && (isFrancoAM || isFrancoPM)) {
            if (isFrancoAM && isFrancoPM) text = "AM/PM";
            else if (isFrancoAM) text = "AM";
            else if (isFrancoPM) text = "PM";
          }

          return (
            <td
              key={date}
              style={{
                backgroundColor: bg,
              }}
            >
              {text}
            </td>
          );
        })}
      </tr>
    );
  }

  // Renderizamos tabla por sucursal
  function renderSucursalSection(suc) {
    const sid = Number(suc.id);

    // empleados asignados a ESTA sucursal según datosEmpleado
    const empleadosDeEstaSucursal = empleados.filter((emp) => {
      const empId = Number(getEmpleadoId(emp));
      const ext = datosEmpleadoPorId.get(empId);
      const empSucursalId = Number(ext?.sucursal_id ?? 0);
      return empSucursalId === sid;
    });

    if (!empleadosDeEstaSucursal.length) {
      return (
        <div key={sid} className="mb-4">
          <h4>{suc.nombre}</h4>
          <Alert variant="secondary" className="py-2">
            No hay empleados asignados a esta sucursal.
          </Alert>
        </div>
      );
    }

    // orden alfabético por apellido/nombre para que quede prolijo
    empleadosDeEstaSucursal.sort((a, b) =>
      getEmpleadoNombre(a).localeCompare(getEmpleadoNombre(b))
    );

    return (
      <div key={sid} className="table-wrapper mb-4">
        <h4>{suc.nombre}</h4>

        <div className="table-responsive">
          <Table bordered className="vacation-schedule-table">
            <thead>
              <tr className="text-center">
                <th className="fixed-column">Empleado</th> 
                {dateRange.map((d) => {
                  const dow = new Date(d).getDay(); // 0..6
                  const isWeekend = dow === 0 || dow === 6;
                  return (
                    <th
                      key={d}
                      style={{
                        backgroundColor: isWeekend ? "yellow" : "",
                      }}
                    >
                      {d}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {empleadosDeEstaSucursal.map((emp) =>
                renderEmpleadoRow(emp)
              )}
            </tbody>
          </Table>
        </div>
      </div>
    );
  }

  const stillLoading = loading || loadingDatosEmpleado;

  return (
    <Container className="mt-4">
      <h2 className="mb-3">Planificación de Vacaciones</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSearch} className="mb-3">
        <Row className="g-2 align-items-end">
          <Col md={3}>
            <Form.Group controlId="startDate" className="w-100">
              <Form.Label>Desde</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group controlId="endDate" className="w-100">
              <Form.Label>Hasta</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group controlId="sucursalId" className="w-100">
              <Form.Label>Sucursal</Form.Label>
              <Form.Select
                value={sucursalId}
                onChange={(e) => setSucursalId(e.target.value)}
              >
                <option value="">Todas</option>
                {sucursales.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3} className="d-flex align-items-end">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <Spinner size="sm" animation="border" />
              ) : (
                "Buscar"
              )}
            </Button>
          </Col>
        </Row>
      </Form>

      {stillLoading && (
        <div className="text-center my-4">
          <Spinner animation="border" />
        </div>
      )}

      {!stillLoading && dateRange.length > 0 && (
        <div>
          {sucursalId
            ? // si eligió una sucursal, mostramos sólo esa
              sucursales
                .filter((s) => String(s.id) === String(sucursalId))
                .map(renderSucursalSection)
            : // si no eligió sucursal, mostramos todas
              sucursales.map(renderSucursalSection)}
        </div>
      )}
    </Container>
  );
}
