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
  const [soloSinAsignar, setSoloSinAsignar] =
    useState(false);
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
      const s = (sucursales || []).find((x) => Number(x.id) === Number(id));
      return s?.nombre || s?.descripcion || s?.denominacion || `Sucursal #${id}`;
    },
    [sucursales]
  );

  // Helper para mostrar nombre de jornada
  const jornadaNombre = useCallback(
    (id) => {
      if (!id) return "—";
      const j = (jornadas || []).find((x) => Number(x.id) === Number(id));
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
    const q = filtroNombre
      .trim()
      .toLowerCase();

    let lista = viewRows.filter(({ emp }) => {
      const empleado =
        emp?.empleado ?? emp;

      return empleado?.fechabaja == null;
    });

    // Solo empleados que todavía no tienen
    // DatosEmpleado asignado.
    if (soloSinAsignar) {
      lista = lista.filter(({ de }) => !de);
    }

    // Filtro por nombre/apellido.
    if (q) {
      lista = lista.filter(({ emp }) => {
        const nombre =
          nombreEmpleado(emp).toLowerCase();

        return nombre.includes(q);
      });
    }

    return lista;
  }, [
    viewRows,
    filtroNombre,
    soloSinAsignar,
  ]);

  // Abrir modal en modo "nuevo"
  const abrirNuevo = (emp) => {
    const empId = Number(
      emp?.empleado?.id ?? emp?.id
    );

    setModalPayload({
      empleado_id: empId,
      empleado_nombre: nombreEmpleado(emp),
      empleado_dni: dniEmpleado(emp),
      modo: "nuevo",

      sucursal_id: null,
      jornada_id: null,
      franco_am: null,
      franco_pm: null,
      telefono: "",
      tipo: "VENDEDOR",
    });

    setShowModal(true);
  };

  // Abrir modal en modo "editar"
  const abrirEditar = ({
    emp,
    empId,
    de,
  }) => {
    setModalPayload({
      empleado_id: empId,
      empleado_nombre: nombreEmpleado(emp),
      empleado_dni: dniEmpleado(emp),
      modo: "editar",

      sucursal_id: de?.sucursal_id ?? null,
      jornada_id: de?.jornada_id ?? null,
      franco_am: de?.franco_am ?? null,
      franco_pm: de?.franco_pm ?? null,
      telefono: de?.telefono ?? "",
      tipo: de?.tipo ?? "VENDEDOR",
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
        throw new Error(data?.error || "No se pudo eliminar la asignación.");
      fetchAll();
    } catch (e) {
      console.error(e);
      alert(e.message || "Error al eliminar.");
    }
  };

  // ---------- RENDER ----------
  return (
    <Container
      fluid="md"
      className="py-2 py-md-4 px-2 px-md-3"
    >

      {/* =========================
    MOBILE
    ========================= */}

      <div className="d-md-none">

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />

            <div className="text-muted mt-2">
              Cargando empleados...
            </div>
          </div>
        ) : rowsFiltradas.length ? (

          rowsFiltradas.map(
            ({ emp, empId, de }) => {

              const am = de?.franco_am
                ? diasSemana[de.franco_am] ||
                de.franco_am
                : null;

              const pm = de?.franco_pm
                ? diasSemana[de.franco_pm] ||
                de.franco_pm
                : null;

              return (
                <Card
                  key={empId}
                  className="mb-3 border-0 shadow-sm"
                >
                  <Card.Body className="p-3">

                    {/* EMPLEADO */}
                    <div className="d-flex justify-content-between align-items-start mb-2">

                      <div className="pe-2">
                        <div className="fw-bold">
                          {nombreEmpleado(emp)}
                        </div>

                        <small className="text-muted">
                          {dniEmpleado(emp)}
                        </small>
                      </div>

                      <Badge
                        bg={de ? "success" : "secondary"}
                      >
                        {de
                          ? "Asignado"
                          : "Sin asignar"}
                      </Badge>

                    </div>

                    {de ? (
                      <>
                        <hr className="my-3" />

                        {/* SUCURSAL */}
                        <div className="mb-2">
                          <small className="text-muted d-block">
                            Sucursal
                          </small>

                          <strong>
                            {de.sucursal_id
                              ? sucursalNombre(
                                de.sucursal_id
                              )
                              : "Sin asignar"}
                          </strong>
                        </div>

                        {/* JORNADA */}
                        <div className="mb-2">
                          <small className="text-muted d-block">
                            Jornada
                          </small>

                          <strong>
                            {de.jornada_id
                              ? jornadaNombre(
                                de.jornada_id
                              )
                              : "Sin asignar"}
                          </strong>
                        </div>

                        {/* TIPO + TELÉFONO */}
                        <Row className="g-2 mb-2">

                          <Col xs={6}>
                            <small className="text-muted d-block">
                              Tipo
                            </small>

                            <span>
                              {de.tipo || "—"}
                            </span>
                          </Col>

                          <Col xs={6}>
                            <small className="text-muted d-block">
                              Teléfono
                            </small>

                            <span>
                              {de.telefono || "—"}
                            </span>
                          </Col>

                        </Row>

                        {/* FRANCOS */}
                        <div className="mb-3">
                          <small className="text-muted d-block">
                            Francos
                          </small>

                          <span>
                            {am
                              ? `${am} AM`
                              : "—"}

                            {" · "}

                            {pm
                              ? `${pm} PM`
                              : "—"}
                          </span>
                        </div>

                        {/* EDITAR */}
                        <Button
                          variant="primary"
                          className="w-100 py-2 fw-semibold"
                          style={{
                            minHeight: 46,
                          }}
                          onClick={() =>
                            abrirEditar({
                              emp,
                              empId,
                              de,
                            })
                          }
                        >
                          <BsPencil className="me-2" />
                          Editar datos
                        </Button>

                        {/* QUITAR */}
                        <Button
                          variant="link"
                          className="w-100 mt-1 text-danger text-decoration-none"
                          size="sm"
                          onClick={() =>
                            eliminarDatos(empId)
                          }
                        >
                          <BsTrash className="me-1" />
                          Quitar asignación
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-muted small my-3">
                          Este empleado todavía no tiene
                          sucursal, jornada ni datos
                          adicionales asignados.
                        </div>

                        <Button
                          variant="primary"
                          className="w-100 py-2 fw-semibold"
                          style={{
                            minHeight: 48,
                          }}
                          onClick={() =>
                            abrirNuevo(emp)
                          }
                        >
                          <BsPlusLg className="me-2" />
                          Asignar datos
                        </Button>
                      </>
                    )}

                  </Card.Body>
                </Card>
              );
            }
          )

        ) : (
          <Card className="border-0 bg-light">
            <Card.Body className="text-center py-5 text-muted">
              No se encontraron empleados.
            </Card.Body>
          </Card>
        )}

      </div>

      <Card className="shadow-sm mb-3 border-0">
        <Card.Body className="p-3">

          {/* ENCABEZADO */}
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div className="pe-2">
              <h4 className="mb-1 fw-semibold">
                Asignación de empleados
              </h4>

              <div className="text-muted small d-none d-md-block">
                Gestioná sucursal, jornada, francos,
                teléfono y tipo de empleado.
              </div>
            </div>

            <Button
              variant="outline-secondary"
              size="sm"
              onClick={fetchAll}
              disabled={loading}
              className="flex-shrink-0"
              title="Actualizar"
            >
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <BsArrowClockwise size={18} />
              )}
            </Button>
          </div>

          {/* BUSCADOR */}
          <Form.Control
            value={filtroNombre}
            onChange={(e) =>
              setFiltroNombre(e.target.value)
            }
            placeholder="Buscar empleado..."
            style={{
              minHeight: 48,
              fontSize: "1rem",
            }}
          />

          {/* FILTROS RÁPIDOS */}
          <div className="d-flex gap-2 mt-3">

            <Button
              type="button"
              variant={
                !soloSinAsignar
                  ? "primary"
                  : "outline-secondary"
              }
              className="flex-fill"
              onClick={() =>
                setSoloSinAsignar(false)
              }
            >
              Todos
            </Button>

            <Button
              type="button"
              variant={
                soloSinAsignar
                  ? "primary"
                  : "outline-secondary"
              }
              className="flex-fill"
              onClick={() =>
                setSoloSinAsignar(true)
              }
            >
              Sin asignar
            </Button>

          </div>

          <div className="text-muted small mt-2">
            {rowsFiltradas.length}{" "}
            {rowsFiltradas.length === 1
              ? "empleado"
              : "empleados"}
          </div>

          {err && (
            <Alert
              variant="danger"
              className="py-2 px-3 mt-3 mb-0 small"
            >
              {err}
            </Alert>
          )}

        </Card.Body>
      </Card>

      {/* =========================
    DESKTOP
    ========================= */}

      <div className="d-none d-md-block">
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
                    <th style={{ width: 160 }}>Teléfono</th> {/* 🔹 nueva columna */}
                    <th style={{ width: 160 }}>Tipo</th> {/* 🔹 nueva columna */}
                    <th style={{ width: 180 }}>Sucursal</th>
                    <th style={{ width: 180 }}>Jornada</th>
                    <th style={{ width: 140 }}>Franco AM</th>
                    <th style={{ width: 140 }}>Franco PM</th>
                    <th
                      style={{
                        width: 200,
                        minWidth: 200,
                      }}
                      className="text-end"
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center py-4">
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
                          <td>{de?.telefono || "—"}</td> {/* 🔹 muestra teléfono */}
                          <td>{de?.tipo || "—"}</td> {/* 🔹 muestra tipo */}
                          <td>
                            {de?.sucursal_id
                              ? sucursalNombre(de.sucursal_id)
                              : "—"}
                          </td>
                          <td>
                            {de?.jornada_id
                              ? jornadaNombre(de.jornada_id)
                              : "—"}
                          </td>
                          <td>{am}</td>
                          <td>{pm}</td>
                          <td>
                            <Stack
                              direction="horizontal"
                              gap={2}
                              className="justify-content-end flex-nowrap"
                            >
                              {de ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    className="text-nowrap"
                                    onClick={() =>
                                      abrirEditar({
                                        emp,
                                        empId,
                                        de,
                                      })
                                    }
                                  >
                                    <BsPencil className="me-1" />
                                    Editar
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline-danger"
                                    className="text-nowrap"
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
                                  onClick={() =>
                                    abrirNuevo(emp)
                                  }
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
                      <td colSpan={9} className="text-center py-4 text-muted">
                        Sin resultados
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

      </div>

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
