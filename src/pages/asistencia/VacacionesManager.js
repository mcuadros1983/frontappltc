import React, { useEffect, useState, useContext, useMemo } from "react";
import {
  Container,
  Table,
  Alert,
  Button,
  Form,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import Contexts from "../../context/Contexts";
import {
  getAllVacaciones,
  eliminarVacacion,
} from "../../services/vacacionesApi";
import { VacacionesModal } from "./VacacionesModal";

// Helpers para interpretar la estructura real de empleados
function getEmpleadoId(e) {
  return e?.empleado?.id ?? e?.id ?? e?.empleado_id ?? null;
}

function getEmpleadoNombre(e) {
  const ap = e?.clientePersona?.apellido || e?.empleado?.apellido || "";
  const no = e?.clientePersona?.nombre || e?.empleado?.nombre || "";
  const full = `${ap} ${no}`.trim();
  return full || `Empleado #${getEmpleadoId(e) || "—"}`;
}

export function VacacionesManager() {
  const { empleados, sucursales } = useContext(Contexts.DataContext);

  const [vacaciones, setVacaciones] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editVacacion, setEditVacacion] = useState(null);
  const [filtroEmpleado, setFiltroEmpleado] = useState("");
  const [loading, setLoading] = useState(false);

  // Estado para ordenamiento
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "descending", // 'ascending' | 'descending'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllVacaciones();
      const arr = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : [];
      // orden inicial por id ascendente/descendente da igual,
      // porque luego listaOrdenada vuelve a ordenar usando sortConfig
      arr.sort((a, b) => Number(a.id) - Number(b.id));
      setVacaciones(arr);
    } catch (err) {
      setError("Error al obtener las vacaciones: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Buscar empleado por ID que viene en la vacación
  const findEmpleadoLabel = (empleadoId) => {
    const emp = empleados.find(
      (e) => String(getEmpleadoId(e)) === String(empleadoId)
    );
    return emp ? getEmpleadoNombre(emp) : "N/A";
  };

  // Nombre sucursal
  const findSucursalLabel = (sucursalId) => {
    const suc = sucursales.find(
      (s) => String(s.id) === String(sucursalId)
    );
    return suc ? suc.nombre : "N/A";
  };

  // Calcular días tomados entre fecha_desde y fecha_hasta (inclusive)
  const calcularDiasTomados = (desde, hasta) => {
    if (!desde || !hasta) return 0;
    const d1 = new Date(desde);
    const d2 = new Date(hasta);
    const diffMs = d2 - d1;
    const diffDays =
      Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Función para manejar el clic en la cabecera y ordenar
  const requestSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        const nextDir =
          prev.direction === "ascending"
            ? "descending"
            : "ascending";
        return { key, direction: nextDir };
      }
      return { key, direction: "ascending" };
    });
  };

  // 1. Aplicar filtro por empleado
  const listaFiltrada = useMemo(() => {
    if (!filtroEmpleado) return vacaciones;
    const term = filtroEmpleado.toLowerCase();
    return vacaciones.filter((v) => {
      const label = findEmpleadoLabel(v.empleado_id).toLowerCase();
      return label.includes(term);
    });
  }, [vacaciones, filtroEmpleado]);

  // 2. Ordenar la lista filtrada según sortConfig
  const listaOrdenada = useMemo(() => {
    const sortedList = [...listaFiltrada];
    const { key, direction } = sortConfig;

    sortedList.sort((a, b) => {
      let av = a[key];
      let bv = b[key];

      // Normalizar número para 'id'
      if (key === "id") {
        av = Number(av) || 0;
        bv = Number(bv) || 0;
      }

      // Si alguna otra columna en el futuro fuese string, por ejemplo:
      // if (typeof av === "string") av = av.toLowerCase();
      // if (typeof bv === "string") bv = bv.toLowerCase();

      if (av < bv) return direction === "ascending" ? -1 : 1;
      if (av > bv) return direction === "ascending" ? 1 : -1;
      return 0;
    });

    return sortedList;
  }, [listaFiltrada, sortConfig]);

  // indicador visual de orden en la cabecera
  const renderSortIndicator = (colKey) => {
    if (sortConfig.key !== colKey) return null;
    return sortConfig.direction === "ascending" ? " ▲" : " ▼";
  };

  // Borrar una asignación
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "¿Seguro deseas eliminar esta asignación?"
      )
    )
      return;
    try {
      await eliminarVacacion(id);
      fetchData();
    } catch (err) {
      setError("Error al eliminar: " + err.message);
    }
  };

  // Abrir modal en modo edición
  const handleEdit = (vacRow) => {
    setEditVacacion(vacRow);
    setShowModal(true);
  };

  // Abrir modal en modo alta
  const handleNew = () => {
    setEditVacacion(null);
    setShowModal(true);
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-3">Gestión de Vacaciones</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            placeholder="Buscar por empleado..."
            value={filtroEmpleado}
            onChange={(e) =>
              setFiltroEmpleado(e.target.value)
            }
          />
        </Col>
        <Col className="text-end">
          <Button onClick={handleNew} variant="success">
            + Asignar Vacaciones
          </Button>
        </Col>
      </Row>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table bordered responsive>
          <thead>
            <tr className="text-center">
              <th
                style={{
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
                onClick={() => requestSort("id")}
              >
                ID
                {renderSortIndicator("id")}
              </th>

              <th>Empleado</th>
              <th>Período</th>
              <th>Días Asignados</th>
              <th>Sucursal</th>
              <th>Desde</th>
              <th>Hasta</th>
              <th>Días Tomados</th>
              <th>Pendientes</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {listaOrdenada.map((v) => {
              const tomados = calcularDiasTomados(
                v.fecha_desde,
                v.fecha_hasta
              );
              const pendientes =
                (v.dias_vacaciones || 0) - tomados;

              return (
                <tr
                  key={v.id}
                  className="text-center"
                >
                  <td>{v.id}</td>
                  <td>{findEmpleadoLabel(v.empleado_id)}</td>
                  <td>{v.periodo}</td>
                  <td>{v.dias_vacaciones}</td>
                  <td>{findSucursalLabel(v.sucursal_id)}</td>
                  <td>{v.fecha_desde || "—"}</td>
                  <td>{v.fecha_hasta || "—"}</td>
                  <td>{tomados}</td>
                  <td>{pendientes}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(v)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(v.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              );
            })}

            {listaOrdenada.length === 0 && (
              <tr>
                <td
                  colSpan="10"
                  className="text-center py-4"
                >
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {showModal && (
        <VacacionesModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onSuccess={fetchData}
          editVacacion={editVacacion}
        />
      )}
    </Container>
  );
}
