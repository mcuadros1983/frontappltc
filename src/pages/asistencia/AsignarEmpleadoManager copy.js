import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Spinner,
  Alert,
  Form,
  Card,
  Stack,
  Badge,
} from "react-bootstrap";
import { BsTrash, BsPencil, BsPlusLg, BsArrowClockwise } from "react-icons/bs";
import AsignarEmpleadoModal from "./AsignarEmpleadoModal";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

const diasSemana = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo",
};

const nombreEmpleado = (item) => {
  const ap =
    item?.clientePersona?.apellido ||
    item?.empleado?.apellido ||
    item?.apellido ||
    "";
  const no =
    item?.clientePersona?.nombre ||
    item?.empleado?.nombre ||
    item?.nombre ||
    "";
  const full = `${ap} ${no}`.trim();
  return full || `Empleado #${item?.empleado?.id ?? item?.id ?? ""}`;
};

const dniEmpleado = (item) => {
  return (
    item?.empleado?.cuil ||
    item?.empleado?.numero ||
    item?.empleado?.dni ||
    "—"
  );
};

export default function AsignarEmpleadoManager() {
  const dataContext = useContext(Contexts.DataContext); 
  const empleadosCtx = dataContext?.empleados || [];

  const [datos, setDatos] = useState([]); // filas de datosempleado
  const [sucursales, setSucursales] = useState([]);
  const [jornadas, setJornadas] = useState([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [filtroNombre, setFiltroNombre] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalPayload, setModalPayload] = useState(null); // { empleado_id, ... }

  // Fetch all helper
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      // datosempleado (asignaciones actuales)
      const r1 = await fetch(`${apiUrl}/datosempleado?limit=1000`, {
        credentials: "include",
      });
      const d1 = await r1.json().catch(() => null);
      if (!r1.ok)
        throw new Error(d1?.error || "No se pudo obtener datosempleado.");
      const items = Array.isArray(d1?.items)
        ? d1.items
        : Array.isArray(d1)
        ? d1
        : [];
      setDatos(items);

      // sucursales
      const r2 = await fetch(`${apiUrl}/sucursales?limit=1000`, {
        credentials: "include",
      });
      const d2 = await r2.json().catch(() => null);
      if (!r2.ok)
        throw new Error(d2?.error || "No se pudo obtener sucursales.");
      const sucList = Array.isArray(d2?.rows)
        ? d2.rows
        : Array.isArray(d2?.items)
        ? d2.items
        : Array.isArray(d2)
        ? d2
        : [];
      setSucursales(sucList);

      // jornadas
      const r3 = await fetch(`${apiUrl}/jornadas?limit=1000`, {
        credentials: "include",
      });
      const d3 = await r3.json().catch(() => null);
      if (!r3.ok) throw new Error(d3?.error || "No se pudo obtener jornadas.");
      const jList = Array.isArray(d3?.items)
        ? d3.items
        : Array.isArray(d3)
        ? d3
        : [];
      setJornadas(jList);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error al cargar la información.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Map por empleado_id => DatosEmpleado
  const datosByEmpleadoId = useMemo(() => {
    const map = new Map();
    for (const row of datos || []) {
      map.set(Number(row.empleado_id), row);
    }
    return map;
  }, [datos]);

  // Helper para mostrar nombre de sucursal
  const sucursalNombre = useCallback(
    (id) => {
      if (!id) return "—";
      const s = (sucursales || []).find(
        (x) => Number(x.id) === Number(id)
      );
      return s?.nombre || `Sucursal #${id}`;
    },
    [sucursales]
  );

  // Helper para mostrar nombre de jornada
  const jornadaNombre = useCallback(
    (id) => {
      if (!id) return "—";
      const j = (jornadas || []).find(
        (x) => Number(x.id) === Number(id)
      );
      return j?.nombre || `Jornada #${id}`;
    },
    [jornadas]
  );

  // Lista derivada ordenada por apellido/nombre
  const viewRows = useMemo(() => {
    const list = [...(empleadosCtx || [])];

    // Orden por apellido/nombre
    list.sort((a, b) => {
      const apA =
        (a?.clientePersona?.apellido || a?.empleado?.apellido || "").toLowerCase();
      const apB =
        (b?.clientePersona?.apellido || b?.empleado?.apellido || "").toLowerCase();
      const noA =
        (a?.clientePersona?.nombre || a?.empleado?.nombre || "").toLowerCase();
      const noB =
        (b?.clientePersona?.nombre || b?.empleado?.nombre || "").toLowerCase();
      if (apA !== apB) return apA < apB ? -1 : 1;
      if (noA !== noB) return noA < noB ? -1 : 1;
      return 0;
    });

    return list.map((emp) => {
      const empId = Number(emp?.empleado?.id ?? emp?.id);
      const de = datosByEmpleadoId.get(empId) || null;
      return { emp, empId, de };
    });
  }, [empleadosCtx, datosByEmpleadoId]);

  // Filtrado: solo activos (sin fechabaja) y por texto
  const rowsFiltradas = useMemo(() => {
    const q = filtroNombre.trim().toLowerCase();
    const activos = viewRows.filter(
      ({ emp }) => !emp?.empleado?.fechabaja
    );
    if (!q) return activos;
    return activos.filter(({ emp }) => {
      const ap =
        (emp?.clientePersona?.apellido || emp?.empleado?.apellido || "").toLowerCase();
      const no =
        (emp?.clientePersona?.nombre || emp?.empleado?.nombre || "").toLowerCase();
      const full = `${ap} ${no}`.trim();
      return ap.includes(q) || no.includes(q) || full.includes(q);
    });
  }, [viewRows, filtroNombre]);

  // Abrir modal en modo "nuevo"
  const abrirNuevo = (empId) => {
    setModalPayload({
      empleado_id: empId,
      sucursal_id: null,
      jornada_id: null,
      franco_am: null,
      franco_pm: null,
    });
    setShowModal(true);
  };

  // Abrir modal en modo "editar"
  const abrirEditar = (row) => {
    setModalPayload({
      empleado_id: row.empId,
      sucursal_id: row.de?.sucursal_id ?? null,
      jornada_id: row.de?.jornada_id ?? null,
      franco_am: row.de?.franco_am ?? null,
      franco_pm: row.de?.franco_pm ?? null,
    });
    setShowModal(true);
  };

  // Cerrar modal, refrescar si hubo cambios
  const cerrarModal = (changed = false) => {
    setShowModal(false);
    setModalPayload(null);
    if (changed) fetchAll();
  };

  // Eliminar asignación COMPLETA del empleado
  const eliminarDatos = async (empleadoId) => {
    const ok = window.confirm(
      "¿Eliminar toda la asignación (sucursal/jornada/francos) de este empleado?"
    );
    if (!ok) return;
    try {
      const r = await fetch(`${apiUrl}/empleados/${empleadoId}/datos`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await r.json().catch(() => null);
      if (!r.ok)
        throw new Error(
          data?.error || "No se pudo eliminar la asignación."
        );
      fetchAll();
    } catch (e) {
      console.error(e);
      alert(e.message || "Error al eliminar.");
    }
  };

  // ---------- RENDER ----------
  return (
    <Container className="py-4">
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-center gy-2">
            <Col xs={12} md={8}>
              <div className="d-flex flex-column">
                <h4 className="mb-1 fw-semibold">
                  Asignación de sucursal, jornada y francos
                </h4>
                <div className="text-muted small">
                  Gestioná qué jornada y qué sucursal corresponde a cada
                  empleado activo.
                </div>
              </div>
            </Col>
            <Col
              xs={12}
              md={4}
              className="d-flex justify-content-md-end align-items-start"
            >
              <Button
                variant="outline-secondary"
                onClick={fetchAll}
                disabled={loading}
                className="d-flex align-items-center"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" /> Actualizando…
                  </>
                ) : (
                  <>
                    <BsArrowClockwise className="me-2" />
                    Actualizar
                  </>
                )}
              </Button>
            </Col>
          </Row>

          <Row className="mt-3 gy-2">
            <Col xs={12} md={4}>
              <Form.Label className="fw-semibold small text-uppercase text-muted">
                Buscar empleado
              </Form.Label>
              <Form.Control
                value={filtroNombre}
                onChange={(e) => setFiltroNombre(e.target.value)}
                placeholder="Ej: García"
                size="sm"
              />
            </Col>
            {err && (
              <Col xs={12}>
                <Alert
                  variant="danger"
                  className="py-2 px-3 mb-0 mt-2 small fw-semibold"
                >
                  {err}
                </Alert>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
            <div className="fw-semibold">
              Empleados activos{" "}
              <Badge bg="secondary">{rowsFiltradas.length}</Badge>
            </div>
          </div>

          <div className="table-responsive">
            <Table hover borderless size="sm" className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 80 }}>Legajo</th>
                  <th style={{ width: 140 }}>DNI / CUIL</th>
                  <th>Empleado</th>
                  <th style={{ width: 180 }}>Sucursal</th>
                  <th style={{ width: 180 }}>Jornada</th>
                  <th style={{ width: 140 }}>Franco AM</th>
                  <th style={{ width: 140 }}>Franco PM</th>
                  <th style={{ width: 220 }} className="text-end">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      <Spinner size="sm" className="me-2" /> Cargando…
                    </td>
                  </tr>
                ) : rowsFiltradas.length ? (
                  rowsFiltradas.map(({ emp, empId, de }) => {
                    const am = de?.franco_am
                      ? diasSemana[de.franco_am] || de.franco_am
                      : "—";
                    const pm = de?.franco_pm
                      ? diasSemana[de.franco_pm] || de.franco_pm
                      : "—";

                    return (
                      <tr key={empId} style={{ cursor: "default" }}>
                        <td className="text-muted">{empId}</td>
                        <td className="text-muted">{dniEmpleado(emp)}</td>
                        <td className="fw-medium">{nombreEmpleado(emp)}</td>
                        <td>{de?.sucursal_id ? sucursalNombre(de.sucursal_id) : "—"}</td>
                        <td>{de?.jornada_id ? jornadaNombre(de.jornada_id) : "—"}</td>
                        <td>{am}</td>
                        <td>{pm}</td>
                        <td>
                          <Stack
                            direction="horizontal"
                            gap={2}
                            className="justify-content-end flex-wrap"
                          >
                            {de ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={() =>
                                    abrirEditar({ empId, de })
                                  }
                                >
                                  <BsPencil className="me-1" />
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() =>
                                    eliminarDatos(empId)
                                  }
                                >
                                  <BsTrash className="me-1" />
                                  Quitar
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => abrirNuevo(empId)}
                              >
                                <BsPlusLg className="me-1" />
                                Asignar
                              </Button>
                            )}
                          </Stack>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">
                      Sin resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {showModal && (
        <AsignarEmpleadoModal
          show={showModal}
          onClose={cerrarModal}
          initialData={modalPayload}
          sucursales={sucursales}
          jornadas={jornadas}
        />
      )}
    </Container>
  );
}
