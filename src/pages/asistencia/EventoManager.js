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
  Collapse,
  Badge,
} from "react-bootstrap";
import {
  BsTrash,
  BsPencil,
  BsPlusLg,
  BsChevronLeft,
  BsChevronRight,
  BsFunnel,
  BsArrowClockwise,
  BsCalendar3,
  BsGeoAlt,
  BsPerson,
  BsXCircle,
} from "react-icons/bs";

import EventoModal from "./EventoModal";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

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

const formatearFecha = (fecha) => {
  if (!fecha) return "—";

  const partes = String(fecha).split("-");

  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  return fecha;
};

export default function EventoManager() {
  const dataContext = useContext(Contexts.DataContext);
  const empleadosCtx = dataContext?.empleados || [];

  const empleadosActivos = useMemo(() => {
    return (empleadosCtx || []).filter((item) => {
      const empleado = item?.empleado ?? item;

      return empleado?.fechabaja == null;
    });
  }, [empleadosCtx]);

  const [rows, setRows] = useState([]);
  const [conceptos, setConceptos] = useState([]);
  const [sucursales, setSucursales] = useState([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [filter, setFilter] = useState({
    fromDate: "",
    toDate: "",
    empleado_id: "",
    sucursal_id: "",
    concepto_id: "",
  });

  const [sortConfig, setSortConfig] = useState({
    key: "fecha_desde",
    direction: "DESC",
  });

  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setErr(null);

    try {
      // EVENTOS
      const r1 = await fetch(
        `${apiUrl}/eventos?limit=1000&order=fecha_desde&dir=DESC`,
        {
          credentials: "include",
        }
      );

      const d1 = await r1.json().catch(() => null);

      if (!r1.ok) {
        throw new Error(d1?.error || "No se pudo obtener eventos.");
      }

      const itemsEv = Array.isArray(d1?.items)
        ? d1.items
        : Array.isArray(d1)
          ? d1
          : [];

      setRows(itemsEv);

      // CONCEPTOS
      const r2 = await fetch(
        `${apiUrl}/conceptos?limit=1000&order=nombre&dir=ASC`,
        {
          credentials: "include",
        }
      );

      const d2 = await r2.json().catch(() => null);

      if (!r2.ok) {
        throw new Error(d2?.error || "No se pudo obtener conceptos.");
      }

      const itemsCo = Array.isArray(d2?.items)
        ? d2.items
        : Array.isArray(d2)
          ? d2
          : [];

      setConceptos(itemsCo);

      // SUCURSALES
      const r3 = await fetch(
        `${apiUrl}/sucursales?limit=1000&order=nombre&dir=ASC`,
        {
          credentials: "include",
        }
      );

      const d3 = await r3.json().catch(() => null);

      if (!r3.ok) {
        throw new Error(d3?.error || "No se pudo obtener sucursales.");
      }

      const itemsSu = Array.isArray(d3?.rows)
        ? d3.rows
        : Array.isArray(d3?.items)
          ? d3.items
          : Array.isArray(d3)
            ? d3
            : [];

      setSucursales(itemsSu);
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

  const conceptosMap = useMemo(() => {
    const m = new Map();

    for (const c of conceptos || []) {
      m.set(Number(c.id), c);
    }

    return m;
  }, [conceptos]);

  const sucursalesMap = useMemo(() => {
    const m = new Map();

    for (const s of sucursales || []) {
      m.set(Number(s.id), s);
    }

    return m;
  }, [sucursales]);

  const empleadosMap = useMemo(() => {
    const m = new Map();

    for (const e of empleadosActivos || []) {
      const id = Number(e?.empleado?.id ?? e?.id);

      if (!id) continue;

      m.set(id, e);
    }

    return m;
  }, [empleadosActivos]);

  const findConceptName = (id) =>
    conceptosMap.get(Number(id))?.nombre || `Concepto #${id ?? "—"}`;

  const findSucursalName = (id) =>
    sucursalesMap.get(Number(id))?.nombre || `Sucursal #${id ?? "—"}`;

  const findEmpleadoName = (id) => {
    const emp = empleadosMap.get(Number(id));

    return emp ? nombreEmpleado(emp) : `Empleado #${id ?? "—"}`;
  };

  const filtered = useMemo(() => {
    // PRIMERO: dejar solamente eventos de empleados activos.
    // empleadosMap ya contiene exclusivamente empleados con fechabaja == null.
    let arr = (rows || []).filter((ev) => {
      const empleadoId = Number(
        ev.empleado_id ?? ev.empleado
      );

      return empleadosMap.has(empleadoId);
    });

    const {
      fromDate,
      toDate,
      empleado_id,
      sucursal_id,
      concepto_id,
    } = filter;
    
    if (fromDate) {
      const d = new Date(`${fromDate}T00:00:00`);

      arr = arr.filter(
        (ev) => new Date(`${ev.fecha_desde}T00:00:00`) >= d
      );
    }

    if (toDate) {
      const d = new Date(`${toDate}T00:00:00`);

      arr = arr.filter(
        (ev) => new Date(`${ev.fecha_desde}T00:00:00`) <= d
      );
    }

    if (empleado_id) {
      arr = arr.filter(
        (ev) =>
          Number(ev.empleado_id ?? ev.empleado) === Number(empleado_id)
      );
    }

    if (sucursal_id) {
      arr = arr.filter(
        (ev) =>
          Number(ev.sucursal_id ?? ev.sucursal) === Number(sucursal_id)
      );
    }

    if (concepto_id) {
      arr = arr.filter(
        (ev) =>
          Number(ev.concepto_id ?? ev.concepto) === Number(concepto_id)
      );
    }

    const { key, direction } = sortConfig;

    arr.sort((a, b) => {
      const va = a[key];
      const vb = b[key];

      if (key === "fecha_desde" || key === "fecha_hasta") {
        const da = new Date(`${va}T00:00:00`);
        const db = new Date(`${vb}T00:00:00`);

        return direction === "ASC" ? da - db : db - da;
      }

      if (
        ["concepto_id", "empleado_id", "sucursal_id", "id"].includes(key)
      ) {
        const na = Number(va);
        const nb = Number(vb);

        return direction === "ASC" ? na - nb : nb - na;
      }

      const sa = String(va ?? "").toLowerCase();
      const sb = String(vb ?? "").toLowerCase();

      if (sa < sb) return direction === "ASC" ? -1 : 1;
      if (sa > sb) return direction === "ASC" ? 1 : -1;

      return 0;
    });

    return arr;
  }, [rows, filter, sortConfig, empleadosMap]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / perPage)
  );

  const currentPage = Math.min(page, totalPages);

  const start = (currentPage - 1) * perPage;

  const currentRows = filtered.slice(
    start,
    start + perPage
  );

  const requestSort = (key) => {
    setPage(1);

    setSortConfig((prev) => {
      const direction =
        prev.key === key && prev.direction === "ASC"
          ? "DESC"
          : "ASC";

      return {
        key,
        direction,
      };
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setPage(1);

    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const limpiarFiltros = () => {
    setFilter({
      fromDate: "",
      toDate: "",
      empleado_id: "",
      sucursal_id: "",
      concepto_id: "",
    });

    setPage(1);
  };

  const filtrosActivos = Object.values(filter).some(
    (value) => value !== ""
  );

  const abrirNuevo = () => {
    setEditItem(null);
    setShowModal(true);
  };

  const abrirEditar = (row) => {
    setEditItem({
      id: row.id,
      fecha_desde: row.fecha_desde || "",
      fecha_hasta: row.fecha_hasta || "",
      concepto_id: Number(row.concepto_id ?? row.concepto),
      empleado_id: Number(row.empleado_id ?? row.empleado),
      sucursal_id: Number(row.sucursal_id ?? row.sucursal),
      observaciones: row.observaciones || "",
    });

    setShowModal(true);
  };

  const cerrarModal = (changed = false) => {
    setShowModal(false);
    setEditItem(null);

    if (changed) {
      fetchAll();
    }
  };

  const eliminarEvento = async (id) => {
    const ok = window.confirm(
      "¿Eliminar este evento? Esta acción no se puede deshacer."
    );

    if (!ok) return;

    try {
      const r = await fetch(`${apiUrl}/eventos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await r.json().catch(() => null);

      if (!r.ok) {
        throw new Error(
          data?.error || "No se pudo eliminar el evento."
        );
      }

      fetchAll();
    } catch (e) {
      console.error(e);
      alert(e.message || "Error al eliminar.");
    }
  };

  return (
    <Container fluid="md" className="py-2 py-md-3 px-2 px-md-3">

      {/* ENCABEZADO */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <h4 className="mb-0">Eventos</h4>

            <small className="text-muted">
              {filtered.length}{" "}
              {filtered.length === 1 ? "evento" : "eventos"}
            </small>
          </div>

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={fetchAll}
            disabled={loading}
            title="Actualizar"
          >
            {loading ? (
              <Spinner size="sm" />
            ) : (
              <BsArrowClockwise size={18} />
            )}
          </Button>
        </div>

        <Button
          variant="primary"
          className="w-100 py-2 fw-semibold"
          onClick={abrirNuevo}
        >
          <BsPlusLg className="me-2" />
          Nuevo evento
        </Button>
      </div>

      {/* BOTÓN FILTROS EN MOBILE */}
      <div className="d-md-none mb-3">
        <Button
          variant={filtrosActivos ? "primary" : "outline-secondary"}
          className="w-100 d-flex justify-content-between align-items-center"
          onClick={() => setMostrarFiltros((v) => !v)}
        >
          <span>
            <BsFunnel className="me-2" />
            Filtros
          </span>

          {filtrosActivos && (
            <Badge bg="light" text="dark">
              Activos
            </Badge>
          )}
        </Button>
      </div>

      {/* FILTROS MOBILE */}
      <div className="d-md-none">
        <Collapse in={mostrarFiltros}>
          <div>
            <Card className="mb-3 shadow-sm">
              <Card.Body>
                <Form>
                  <Row className="g-2">
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className="small mb-1">
                          Desde
                        </Form.Label>

                        <Form.Control
                          type="date"
                          name="fromDate"
                          value={filter.fromDate}
                          onChange={handleFilterChange}
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className="small mb-1">
                          Hasta
                        </Form.Label>

                        <Form.Control
                          type="date"
                          name="toDate"
                          value={filter.toDate}
                          onChange={handleFilterChange}
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label className="small mb-1">
                          Concepto
                        </Form.Label>

                        <Form.Select
                          name="concepto_id"
                          value={filter.concepto_id}
                          onChange={handleFilterChange}
                        >
                          <option value="">Todos</option>

                          {conceptos.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nombre}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label className="small mb-1">
                          Empleado
                        </Form.Label>

                        <Form.Select
                          name="empleado_id"
                          value={filter.empleado_id}
                          onChange={handleFilterChange}
                        >
                          <option value="">Todos</option>

                          {empleadosActivos.map((e) => {
                            const id =
                              e?.empleado?.id ?? e?.id;

                            return (
                              <option key={id} value={id}>
                                {nombreEmpleado(e)}
                              </option>
                            );
                          })}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label className="small mb-1">
                          Sucursal
                        </Form.Label>

                        <Form.Select
                          name="sucursal_id"
                          value={filter.sucursal_id}
                          onChange={handleFilterChange}
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
                  </Row>

                  {filtrosActivos && (
                    <Button
                      variant="outline-danger"
                      className="w-100 mt-3"
                      onClick={limpiarFiltros}
                    >
                      <BsXCircle className="me-2" />
                      Limpiar filtros
                    </Button>
                  )}
                </Form>
              </Card.Body>
            </Card>
          </div>
        </Collapse>
      </div>

      {/* FILTROS DESKTOP */}
      <Card className="mb-3 d-none d-md-block">
        <Card.Body>
          <Form>
            <Row className="g-2 align-items-end">

              <Col md={2}>
                <Form.Label>Desde</Form.Label>

                <Form.Control
                  type="date"
                  name="fromDate"
                  value={filter.fromDate}
                  onChange={handleFilterChange}
                />
              </Col>

              <Col md={2}>
                <Form.Label>Hasta</Form.Label>

                <Form.Control
                  type="date"
                  name="toDate"
                  value={filter.toDate}
                  onChange={handleFilterChange}
                />
              </Col>

              <Col md={2}>
                <Form.Label>Concepto</Form.Label>

                <Form.Select
                  name="concepto_id"
                  value={filter.concepto_id}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>

                  {conceptos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={2}>
                <Form.Label>Empleado</Form.Label>

                <Form.Select
                  name="empleado_id"
                  value={filter.empleado_id}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>

                  {empleadosActivos.map((e) => {
                    const id =
                      e?.empleado?.id ?? e?.id;

                    return (
                      <option key={id} value={id}>
                        {nombreEmpleado(e)}
                      </option>
                    );
                  })}
                </Form.Select>
              </Col>

              <Col md={2}>
                <Form.Label>Sucursal</Form.Label>

                <Form.Select
                  name="sucursal_id"
                  value={filter.sucursal_id}
                  onChange={handleFilterChange}
                >
                  <option value="">Todas</option>

                  {sucursales.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={2}>
                <Button
                  variant="outline-secondary"
                  className="w-100"
                  onClick={limpiarFiltros}
                  disabled={!filtrosActivos}
                >
                  Limpiar
                </Button>
              </Col>

            </Row>
          </Form>
        </Card.Body>
      </Card>

      {err && (
        <Alert variant="danger">
          {err}
        </Alert>
      )}

      {/* CARGANDO MOBILE */}
      {loading && (
        <div className="d-md-none text-center py-5">
          <Spinner animation="border" />
          <div className="mt-2 text-muted">
            Cargando eventos...
          </div>
        </div>
      )}

      {/* TARJETAS MOBILE */}
      {!loading && (
        <div className="d-md-none">

          {currentRows.length ? (
            currentRows.map((ev) => (
              <Card
                key={ev.id}
                className="mb-3 shadow-sm border-0"
              >
                <Card.Body className="p-3">

                  <div className="d-flex justify-content-between align-items-start mb-2">

                    <div className="pe-2">

                      <div className="fw-bold fs-6">
                        <BsPerson className="me-2 text-muted" />

                        {findEmpleadoName(
                          ev.empleado_id ?? ev.empleado
                        )}
                      </div>

                      <div className="mt-2">
                        <Badge bg="primary">
                          {findConceptName(
                            ev.concepto_id ?? ev.concepto
                          )}
                        </Badge>
                      </div>

                    </div>

                    <small className="text-muted">
                      #{ev.id}
                    </small>

                  </div>

                  <hr className="my-2" />

                  <div className="mb-2">
                    <BsCalendar3 className="me-2 text-muted" />

                    <strong>
                      {formatearFecha(ev.fecha_desde)}
                    </strong>

                    {ev.fecha_hasta &&
                      ev.fecha_hasta !== ev.fecha_desde && (
                        <>
                          {" → "}
                          <strong>
                            {formatearFecha(ev.fecha_hasta)}
                          </strong>
                        </>
                      )}
                  </div>

                  <div className="mb-2">
                    <BsGeoAlt className="me-2 text-muted" />

                    {findSucursalName(
                      ev.sucursal_id ?? ev.sucursal
                    )}
                  </div>

                  {ev.observaciones && (
                    <div
                      className="bg-light rounded p-2 mt-2 small"
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {ev.observaciones}
                    </div>
                  )}

                  <div className="d-flex gap-2 mt-3">

                    <Button
                      variant="outline-primary"
                      className="flex-fill py-2"
                      onClick={() => abrirEditar(ev)}
                    >
                      <BsPencil className="me-2" />
                      Editar
                    </Button>

                    <Button
                      variant="outline-danger"
                      className="flex-fill py-2"
                      onClick={() =>
                        eliminarEvento(ev.id)
                      }
                    >
                      <BsTrash className="me-2" />
                      Eliminar
                    </Button>

                  </div>

                </Card.Body>
              </Card>
            ))
          ) : (
            <Card className="border-0 bg-light">
              <Card.Body className="text-center py-5">
                <div className="text-muted">
                  No hay eventos para mostrar.
                </div>
              </Card.Body>
            </Card>
          )}

        </div>
      )}

      {/* TABLA DESKTOP */}
      <div className="d-none d-md-block table-responsive">

        <Table bordered hover striped size="sm">

          <thead>
            <tr>
              <th
                style={{ width: 80, cursor: "pointer" }}
                onClick={() => requestSort("id")}
              >
                #
              </th>

              <th
                style={{ cursor: "pointer" }}
                onClick={() =>
                  requestSort("fecha_desde")
                }
              >
                Fecha Desde
              </th>

              <th
                style={{ cursor: "pointer" }}
                onClick={() =>
                  requestSort("fecha_hasta")
                }
              >
                Fecha Hasta
              </th>

              <th
                style={{ cursor: "pointer" }}
                onClick={() =>
                  requestSort("concepto_id")
                }
              >
                Concepto
              </th>

              <th
                style={{ cursor: "pointer" }}
                onClick={() =>
                  requestSort("empleado_id")
                }
              >
                Empleado
              </th>

              <th
                style={{ cursor: "pointer" }}
                onClick={() =>
                  requestSort("sucursal_id")
                }
              >
                Sucursal
              </th>

              <th>
                Observaciones
              </th>

              <th style={{ width: 200 }}>
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-4"
                >
                  <Spinner
                    size="sm"
                    className="me-2"
                  />
                  Cargando…
                </td>
              </tr>
            ) : currentRows.length ? (
              currentRows.map((ev, idx) => (
                <tr
                  key={ev.id}
                  onDoubleClick={() =>
                    abrirEditar(ev)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    {start + idx + 1}
                  </td>

                  <td>
                    {formatearFecha(
                      ev.fecha_desde
                    )}
                  </td>

                  <td>
                    {formatearFecha(
                      ev.fecha_hasta
                    )}
                  </td>

                  <td>
                    {findConceptName(
                      ev.concepto_id ??
                      ev.concepto
                    )}
                  </td>

                  <td>
                    {findEmpleadoName(
                      ev.empleado_id ??
                      ev.empleado
                    )}
                  </td>

                  <td>
                    {findSucursalName(
                      ev.sucursal_id ??
                      ev.sucursal
                    )}
                  </td>

                  <td
                    className="text-truncate"
                    style={{ maxWidth: 280 }}
                  >
                    {ev.observaciones || "—"}
                  </td>

                  <td>
                    <div className="d-flex gap-2">

                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() =>
                          abrirEditar(ev)
                        }
                      >
                        <BsPencil /> Editar
                      </Button>

                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() =>
                          eliminarEvento(ev.id)
                        }
                      >
                        <BsTrash /> Eliminar
                      </Button>

                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-4"
                >
                  Sin resultados
                </td>
              </tr>
            )}

          </tbody>
        </Table>

      </div>

      {/* PAGINACIÓN */}
      {!loading && filtered.length > 0 && (
        <div className="d-flex justify-content-between justify-content-md-center align-items-center mt-3 mb-3">

          <Button
            variant="outline-primary"
            className="px-3"
            onClick={() =>
              setPage((p) =>
                Math.max(1, p - 1)
              )
            }
            disabled={currentPage === 1}
          >
            <BsChevronLeft />
            <span className="d-none d-sm-inline ms-1">
              Anterior
            </span>
          </Button>

          <div className="mx-2 text-center">
            <div className="fw-semibold">
              {currentPage} / {totalPages}
            </div>

            <small className="text-muted">
              {filtered.length} registros
            </small>
          </div>

          <Button
            variant="outline-primary"
            className="px-3"
            onClick={() =>
              setPage((p) =>
                Math.min(totalPages, p + 1)
              )
            }
            disabled={
              currentPage === totalPages
            }
          >
            <span className="d-none d-sm-inline me-1">
              Siguiente
            </span>

            <BsChevronRight />
          </Button>

        </div>
      )}

      {showModal && (
        <EventoModal
          show={showModal}
          onClose={cerrarModal}
          initialData={editItem}
          conceptos={conceptos}
          sucursales={sucursales}
          empleados={empleadosActivos}
        />
      )}

    </Container>
  );
}