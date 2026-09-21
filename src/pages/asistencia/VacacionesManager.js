import React, {
  useEffect,
  useState,
  useContext,
  useMemo,
} from "react";

import {
  Container,
  Table,
  Alert,
  Button,
  Form,
  Row,
  Col,
  Spinner,
  Card,
  Badge,
  Pagination,
} from "react-bootstrap";

import {
  BsPlusLg,
  BsPencil,
  BsTrash,
  BsPerson,
  BsCalendar3,
  BsGeoAlt,
  BsSearch,
  BsArrowClockwise,
} from "react-icons/bs";

import Contexts from "../../context/Contexts";

import {
  getAllVacaciones,
  eliminarVacacion,
} from "../../services/vacacionesApi";

import { VacacionesModal } from "./VacacionesModal";

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

  return (
    full ||
    `Empleado #${getEmpleadoId(e) || "—"}`
  );
}

function formatearFecha(fecha) {
  if (!fecha) return "—";

  const partes = String(fecha).split("-");

  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  return fecha;
}

export function VacacionesManager() {
  const {
    empleados = [],
    sucursales = [],
  } = useContext(Contexts.DataContext);

  const [vacaciones, setVacaciones] = useState([]);

  const empleadosActivos = useMemo(() => {
    return (empleados || []).filter((item) => {
      const empleado = item?.empleado ?? item;

      return empleado?.fechabaja == null;
    });
  }, [empleados]);

  const [error, setError] = useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editVacacion, setEditVacacion] =
    useState(null);

  const [filtroEmpleado, setFiltroEmpleado] =
    useState("");

  const [filtroSucursal, setFiltroSucursal] =
    useState("");

  // const [filtroPeriodo, setFiltroPeriodo] =
  //   useState("");

  const [filtroPeriodos, setFiltroPeriodos] =
    useState(() => [
      String(new Date().getFullYear()),
    ]);

  const [
    soloSinAsignar,
    setSoloSinAsignar,
  ] = useState(false);
  const [filtroDesde, setFiltroDesde] =
    useState("");

  const [filtroHasta, setFiltroHasta] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // =========================
  // PAGINACIÓN
  // =========================
  const [paginaActual, setPaginaActual] =
    useState(1);

  const [registrosPorPagina, setRegistrosPorPagina] =
    useState(10);

  const [sortConfig, setSortConfig] =
    useState({
      key: "id",
      direction: "descending",
    });

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAllVacaciones();

      const arr = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : [];

      setVacaciones(arr);
    } catch (err) {
      setError(
        "Error al obtener las vacaciones: " +
        err.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const empleadosMap = useMemo(() => {
    const map = new Map();

    empleadosActivos.forEach((e) => {
      const id = getEmpleadoId(e);

      if (id != null) {
        map.set(String(id), e);
      }
    });

    return map;
  }, [empleadosActivos]);

  const sucursalesMap = useMemo(() => {
    const map = new Map();

    sucursales.forEach((s) => {
      map.set(String(s.id), s);
    });

    return map;
  }, [sucursales]);

  const findEmpleadoLabel = (empleadoId) => {
    const emp =
      empleadosMap.get(String(empleadoId));

    return emp
      ? getEmpleadoNombre(emp)
      : `Empleado #${empleadoId ?? "—"}`;
  };

  const findSucursalLabel = (sucursalId) => {
    if (!sucursalId) return "Sin sucursal";

    const suc =
      sucursalesMap.get(String(sucursalId));

    return suc
      ? suc.nombre
      : `Sucursal #${sucursalId}`;
  };

  const calcularDiasTomados = (
    desde,
    hasta
  ) => {
    if (!desde || !hasta) return 0;

    const d1 = new Date(`${desde}T00:00:00`);
    const d2 = new Date(`${hasta}T00:00:00`);

    const diffMs = d2 - d1;

    return (
      Math.ceil(
        diffMs / (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  const requestSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction:
            prev.direction === "ascending"
              ? "descending"
              : "ascending",
        };
      }

      return {
        key,
        direction: "ascending",
      };
    });
  };

  const periodosDisponibles = useMemo(() => {
    return Array.from(
      { length: 10 },
      (_, i) => 2023 + i
    ).sort((a, b) => b - a);
  }, []);

  const vacacionesCompletas = useMemo(() => {
    const resultado = [];

    // Mapa de asignaciones que realmente existen en BD.
    // Clave: empleado_id-periodo
    const vacacionesMap = new Map();

    (vacaciones || []).forEach((v) => {
      const key = `${String(v.empleado_id)}-${String(
        v.periodo
      )}`;

      vacacionesMap.set(key, v);
    });

    // Crear todas las combinaciones:
    // empleado activo × período disponible
    empleadosActivos.forEach((empleado) => {
      const empleadoId = getEmpleadoId(empleado);

      if (empleadoId == null) return;

      periodosDisponibles.forEach((periodo) => {
        const key = `${String(empleadoId)}-${String(
          periodo
        )}`;

        const existente = vacacionesMap.get(key);

        if (existente) {
          // Existe realmente en la BD
          resultado.push({
            ...existente,
            esVirtual: false,
          });
        } else {
          // No existe en BD.
          // Solamente existe visualmente en VacacionesManager.
          resultado.push({
            id: null,
            empleado_id: empleadoId,
            periodo: periodo,
            dias_vacaciones: 0,
            sucursal_id: null,
            fecha_desde: null,
            fecha_hasta: null,
            esVirtual: true,
          });
        }
      });
    });

    return resultado;
  }, [
    vacaciones,
    empleadosActivos,
    periodosDisponibles,
  ]);

  const listaFiltrada = useMemo(() => {
    // La lista ya contiene todas las combinaciones
    // empleado activo × período.
    let lista = [...vacacionesCompletas];

    // 2. Filtro por empleado
    if (filtroEmpleado.trim()) {
      const term = filtroEmpleado
        .trim()
        .toLowerCase();

      lista = lista.filter((v) => {
        const emp = empleadosMap.get(
          String(v.empleado_id)
        );

        if (!emp) return false;

        return getEmpleadoNombre(emp)
          .toLowerCase()
          .includes(term);
      });
    }

    // 3. Filtro por sucursal
    if (filtroSucursal) {
      lista = lista.filter((v) => {
        return (
          String(v.sucursal_id ?? "") ===
          String(filtroSucursal)
        );
      });
    }

    // 4. Filtro por período
    if (filtroPeriodos.length > 0) {
      lista = lista.filter((v) => {
        return filtroPeriodos.includes(
          String(v.periodo)
        );
      });
    }

    // 5. Mostrar solamente períodos
    // sin vacaciones asignadas
    if (soloSinAsignar) {
      lista = lista.filter((v) => {
        return v.esVirtual === true;
      });
    }


    // 5. Fecha DESDE
    if (filtroDesde) {
      lista = lista.filter((v) => {
        if (!v.fecha_desde) return false;

        return v.fecha_desde >= filtroDesde;
      });
    }

    // 6. Fecha HASTA
    if (filtroHasta) {
      lista = lista.filter((v) => {
        if (!v.fecha_hasta) return false;

        return v.fecha_hasta <= filtroHasta;
      });
    }

    return lista;
  }, [
    vacacionesCompletas,
    empleadosMap,
    filtroEmpleado,
    filtroSucursal,
    filtroPeriodos,
    filtroDesde,
    filtroHasta,
    soloSinAsignar
  ]);



  const listaOrdenada = useMemo(() => {
    const sortedList = [...listaFiltrada];

    const { key, direction } = sortConfig;

    sortedList.sort((a, b) => {
      let av;
      let bv;

      // =========================
      // EMPLEADO
      // Orden alfabético por apellido + nombre
      // =========================
      if (key === "empleado") {
        const empA = empleadosMap.get(
          String(a.empleado_id)
        );

        const empB = empleadosMap.get(
          String(b.empleado_id)
        );

        av = empA
          ? getEmpleadoNombre(empA)
          : "";

        bv = empB
          ? getEmpleadoNombre(empB)
          : "";

        const resultado = av.localeCompare(
          bv,
          "es",
          {
            sensitivity: "base",
          }
        );

        return direction === "ascending"
          ? resultado
          : -resultado;
      }

      // =========================
      // SUCURSAL
      // Orden alfabético por nombre
      // =========================
      if (key === "sucursal") {
        av = findSucursalLabel(
          a.sucursal_id
        );

        bv = findSucursalLabel(
          b.sucursal_id
        );

        const resultado = av.localeCompare(
          bv,
          "es",
          {
            sensitivity: "base",
          }
        );

        return direction === "ascending"
          ? resultado
          : -resultado;
      }

      // =========================
      // FECHAS
      // =========================
      if (
        key === "fecha_desde" ||
        key === "fecha_hasta"
      ) {
        const fechaA = a[key]
          ? new Date(`${a[key]}T00:00:00`).getTime()
          : 0;

        const fechaB = b[key]
          ? new Date(`${b[key]}T00:00:00`).getTime()
          : 0;

        return direction === "ascending"
          ? fechaA - fechaB
          : fechaB - fechaA;
      }

      // =========================
      // NUMÉRICOS
      // ID, PERÍODO, DÍAS
      // =========================
      if (
        key === "id" ||
        key === "periodo" ||
        key === "dias_vacaciones"
      ) {
        av = Number(a[key]) || 0;
        bv = Number(b[key]) || 0;

        return direction === "ascending"
          ? av - bv
          : bv - av;
      }

      // =========================
      // FALLBACK
      // =========================
      av = String(a[key] ?? "");
      bv = String(b[key] ?? "");

      const resultado = av.localeCompare(
        bv,
        "es",
        {
          sensitivity: "base",
        }
      );

      return direction === "ascending"
        ? resultado
        : -resultado;
    });

    return sortedList;
  }, [
    listaFiltrada,
    sortConfig,
    empleadosMap,
    sucursalesMap,
  ]);

  // =========================
  // PAGINACIÓN
  // =========================

  const totalRegistros = listaOrdenada.length;

  const totalPaginas = Math.max(
    1,
    Math.ceil(
      totalRegistros / registrosPorPagina
    )
  );

  const indiceInicio =
    (paginaActual - 1) * registrosPorPagina;

  const indiceFin =
    indiceInicio + registrosPorPagina;

  const listaPaginada = useMemo(() => {
    return listaOrdenada.slice(
      indiceInicio,
      indiceFin
    );
  }, [
    listaOrdenada,
    indiceInicio,
    indiceFin,
  ]);

  const desdeRegistro =
    totalRegistros === 0
      ? 0
      : indiceInicio + 1;

  const hastaRegistro = Math.min(
    indiceFin,
    totalRegistros
  );

  useEffect(() => {
    setPaginaActual(1);
  }, [
    filtroEmpleado,
    filtroSucursal,
    filtroPeriodos,
    filtroDesde,
    filtroHasta,
    soloSinAsignar,
    registrosPorPagina,
  ]);

  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }
  }, [
    paginaActual,
    totalPaginas,
  ]);

  const renderSortIndicator = (
    colKey
  ) => {
    if (sortConfig.key !== colKey) {
      return null;
    }

    return sortConfig.direction ===
      "ascending"
      ? " ▲"
      : " ▼";
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "¿Seguro deseas eliminar esta asignación?"
      )
    ) {
      return;
    }

    try {
      await eliminarVacacion(id);
      await fetchData();
    } catch (err) {
      setError(
        "Error al eliminar: " +
        err.message
      );
    }
  };

  const handleEdit = (vacRow) => {
    if (vacRow.esVirtual) {
      // La asignación todavía NO existe.
      // Precargamos empleado y período,
      // pero VacacionesModal deberá CREARLA.
      setEditVacacion({
        empleado_id: vacRow.empleado_id,
        periodo: vacRow.periodo,
        esNuevaAsignacion: true,
      });
    } else {
      // Asignación existente: edición normal.
      setEditVacacion(vacRow);
    }

    setShowModal(true);
  };

  const handleNew = () => {
    setEditVacacion(null);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditVacacion(null);
  };

  const periodoActual =
    String(new Date().getFullYear());

  const hayFiltrosModificados =
    filtroEmpleado ||
    filtroSucursal ||
    soloSinAsignar ||
    filtroDesde ||
    filtroHasta ||
    filtroPeriodos.length !== 1 ||
    filtroPeriodos[0] !== periodoActual;

  const renderPaginacion = () => {
    if (totalRegistros === 0) {
      return null;
    }

    const paginas = [];

    const inicio = Math.max(
      1,
      paginaActual - 2
    );

    const fin = Math.min(
      totalPaginas,
      paginaActual + 2
    );

    for (
      let pagina = inicio;
      pagina <= fin;
      pagina++
    ) {
      paginas.push(
        <Pagination.Item
          key={pagina}
          active={pagina === paginaActual}
          onClick={() =>
            setPaginaActual(pagina)
          }
        >
          {pagina}
        </Pagination.Item>
      );
    }

    return (
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 mt-3">

        {/* INFORMACIÓN */}

        <div className="small text-muted">
          Mostrando{" "}
          <strong>
            {desdeRegistro}
          </strong>
          {" - "}
          <strong>
            {hastaRegistro}
          </strong>
          {" de "}
          <strong>
            {totalRegistros}
          </strong>
          {" registros"}
        </div>


        {/* PAGINACIÓN */}

        <Pagination className="mb-0">

          <Pagination.First
            disabled={
              paginaActual === 1
            }
            onClick={() =>
              setPaginaActual(1)
            }
          />

          <Pagination.Prev
            disabled={
              paginaActual === 1
            }
            onClick={() =>
              setPaginaActual(
                (prev) =>
                  Math.max(1, prev - 1)
              )
            }
          />

          {inicio > 1 && (
            <>
              <Pagination.Item
                onClick={() =>
                  setPaginaActual(1)
                }
              >
                1
              </Pagination.Item>

              {inicio > 2 && (
                <Pagination.Ellipsis
                  disabled
                />
              )}
            </>
          )}

          {paginas}

          {fin < totalPaginas && (
            <>
              {fin <
                totalPaginas - 1 && (
                  <Pagination.Ellipsis
                    disabled
                  />
                )}

              <Pagination.Item
                onClick={() =>
                  setPaginaActual(
                    totalPaginas
                  )
                }
              >
                {totalPaginas}
              </Pagination.Item>
            </>
          )}

          <Pagination.Next
            disabled={
              paginaActual ===
              totalPaginas
            }
            onClick={() =>
              setPaginaActual(
                (prev) =>
                  Math.min(
                    totalPaginas,
                    prev + 1
                  )
              )
            }
          />

          <Pagination.Last
            disabled={
              paginaActual ===
              totalPaginas
            }
            onClick={() =>
              setPaginaActual(
                totalPaginas
              )
            }
          />

        </Pagination>


        {/* CANTIDAD POR PÁGINA */}

        <div className="d-flex align-items-center gap-2">

          <small className="text-muted">
            Mostrar
          </small>

          <Form.Select
            size="sm"
            value={
              registrosPorPagina
            }
            onChange={(e) => {
              setRegistrosPorPagina(
                Number(e.target.value)
              );

              setPaginaActual(1);
            }}
            style={{
              width: 80,
            }}
          >
            <option value={10}>
              10
            </option>

            <option value={20}>
              20
            </option>

            <option value={50}>
              50
            </option>

            <option value={100}>
              100
            </option>
          </Form.Select>

        </div>

      </div>
    );
  };

  return (
    <Container
      fluid="md"
      className="py-2 py-md-4 px-2 px-md-3"
    >
      {/* ENCABEZADO */}

      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h4 className="mb-0">
              Gestión de Vacaciones
            </h4>

            <small className="text-muted">
              {listaOrdenada.length}{" "}
              {listaOrdenada.length === 1
                ? "asignación"
                : "asignaciones"}
            </small>
          </div>

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? (
              <Spinner size="sm" />
            ) : (
              <BsArrowClockwise
                size={18}
              />
            )}
          </Button>
        </div>

        <Button
          onClick={handleNew}
          variant="success"
          className="w-100 py-2 fw-semibold"
        >
          <BsPlusLg className="me-2" />
          Asignar vacaciones
        </Button>
      </div>

      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      {/* BUSCADOR */}

      <Card className="mb-3 border-0 shadow-sm">
        <Card.Body className="p-2 p-md-3">

          <Row className="g-2">

            {/* EMPLEADO */}
            <Col xs={12} md={4}>
              <Form.Label className="small mb-1">
                Empleado
              </Form.Label>

              <div className="position-relative">
                <BsSearch
                  className="position-absolute text-muted"
                  style={{
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 2,
                  }}
                />

                <Form.Control
                  placeholder="Buscar empleado..."
                  value={filtroEmpleado}
                  onChange={(e) =>
                    setFiltroEmpleado(e.target.value)
                  }
                  style={{
                    paddingLeft: 40,
                    minHeight: 46,
                  }}
                />
              </div>
            </Col>

            {/* SUCURSAL */}
            <Col xs={12} md={3}>
              <Form.Label className="small mb-1">
                Sucursal
              </Form.Label>

              <Form.Select
                value={filtroSucursal}
                onChange={(e) =>
                  setFiltroSucursal(e.target.value)
                }
                style={{ minHeight: 46 }}
              >
                <option value="">
                  Todas las sucursales
                </option>

                {sucursales.map((s) => (
                  <option
                    key={s.id}
                    value={s.id}
                  >
                    {s.nombre}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col xs={12} md={2}>
              <Form.Label className="small mb-1">
                Período
              </Form.Label>

              <Form.Select
                multiple
                value={filtroPeriodos}
                onChange={(e) => {
                  const seleccionados = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );

                  setFiltroPeriodos(seleccionados);
                }}
                style={{
                  minHeight: 110,
                }}
              >
                {periodosDisponibles.map((periodo) => (
                  <option
                    key={periodo}
                    value={String(periodo)}
                  >
                    {periodo}
                  </option>
                ))}
              </Form.Select>

              <Form.Text className="text-muted">
                Ctrl + clic para seleccionar varios
              </Form.Text>
            </Col>

            <Col xs={12} md={2}>
              <Form.Label className="small mb-1">
                Estado
              </Form.Label>

              <div
                className="border rounded px-3 d-flex align-items-center"
                style={{
                  minHeight: 46,
                }}
              >
                <Form.Check
                  type="switch"
                  id="solo-sin-asignar"
                  label="Sin asignar"
                  checked={soloSinAsignar}
                  onChange={(e) =>
                    setSoloSinAsignar(
                      e.target.checked
                    )
                  }
                />
              </div>
            </Col>

            {/* RANGO DE FECHAS */}
            <Col xs={12} md={6}>
              <Row className="g-2">

                {/* DESDE */}
                <Col xs={6}>
                  <Form.Label className="small mb-1">
                    Desde
                  </Form.Label>

                  <Form.Control
                    type="date"
                    value={filtroDesde}
                    onChange={(e) =>
                      setFiltroDesde(e.target.value)
                    }
                    style={{ minHeight: 46 }}
                  />
                </Col>

                {/* HASTA */}
                <Col xs={6}>
                  <Form.Label className="small mb-1">
                    Hasta
                  </Form.Label>

                  <Form.Control
                    type="date"
                    value={filtroHasta}
                    onChange={(e) =>
                      setFiltroHasta(e.target.value)
                    }
                    style={{ minHeight: 46 }}
                  />
                </Col>

              </Row>
            </Col>

          </Row>

          {hayFiltrosModificados && (
            <div className="mt-2 text-end">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setFiltroEmpleado("");
                  setFiltroSucursal("");

                  setFiltroPeriodos([
                    String(new Date().getFullYear()),
                  ]);

                  setSoloSinAsignar(false);

                  setFiltroDesde("");
                  setFiltroHasta("");
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}

        </Card.Body>
      </Card>

      {/* LOADING MOBILE */}

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" />

          <div className="text-muted mt-2">
            Cargando vacaciones...
          </div>
        </div>
      )}

      {/* =========================
          MOBILE
          ========================= */}

      {!loading && (
        <div className="d-md-none">
          {listaPaginada.length ? (
            listaPaginada.map((v) => {
              const tomados =
                calcularDiasTomados(
                  v.fecha_desde,
                  v.fecha_hasta
                );

              const pendientes =
                Number(
                  v.dias_vacaciones || 0
                ) - tomados;

              return (
                <Card
                  key={
                    v.id != null
                      ? `vac-${v.id}`
                      : `virtual-${v.empleado_id}-${v.periodo}`
                  }
                  className="mb-3 border-0 shadow-sm"
                >
                  <Card.Body className="p-3">
                    {/* EMPLEADO */}

                    <div className="d-flex justify-content-between align-items-start">
                      <div className="pe-2">
                        <div className="fw-bold">
                          <BsPerson className="me-2 text-muted" />

                          {findEmpleadoLabel(
                            v.empleado_id
                          )}
                        </div>

                        <div className="mt-2">
                          <Badge bg="primary">
                            Período{" "}
                            {v.periodo}
                          </Badge>
                        </div>
                      </div>

                      <small className="text-muted">
                        {v.esVirtual
                          ? "Sin asignar"
                          : `#${v.id}`}
                      </small>
                    </div>

                    <hr className="my-3" />

                    {/* RESUMEN DÍAS */}

                    <Row className="g-2 text-center mb-3">
                      <Col xs={4}>
                        <div className="border rounded py-2">
                          <div className="fw-bold fs-5">
                            {v.esVirtual
                              ? "—"
                              : v.dias_vacaciones}
                          </div>

                          <small className="text-muted">
                            {v.esVirtual
                              ? "Sin asignar"
                              : "Asignados"}
                          </small>
                        </div>
                      </Col>

                      <Col xs={4}>
                        <div className="border rounded py-2">
                          <div className="fw-bold fs-5">
                            {tomados}
                          </div>

                          <small className="text-muted">
                            Tomados
                          </small>
                        </div>
                      </Col>

                      <Col xs={4}>
                        <div className="border rounded py-2">
                          <div
                            className={`fw-bold fs-5 ${pendientes > 0
                              ? "text-success"
                              : "text-muted"
                              }`}
                          >
                            {pendientes}
                          </div>

                          <small className="text-muted">
                            Pendientes
                          </small>
                        </div>
                      </Col>
                    </Row>

                    {/* FECHAS */}

                    <div className="mb-2">
                      <BsCalendar3 className="me-2 text-muted" />

                      {v.fecha_desde &&
                        v.fecha_hasta ? (
                        <>
                          <strong>
                            {formatearFecha(
                              v.fecha_desde
                            )}
                          </strong>

                          {" → "}

                          <strong>
                            {formatearFecha(
                              v.fecha_hasta
                            )}
                          </strong>
                        </>
                      ) : (
                        <span className="text-muted">
                          Sin fechas asignadas
                        </span>
                      )}
                    </div>

                    {/* SUCURSAL */}

                    <div className="mb-3">
                      <BsGeoAlt className="me-2 text-muted" />

                      {findSucursalLabel(
                        v.sucursal_id
                      )}
                    </div>

                    {/* BOTONES */}

                    <div className="d-flex gap-2 justify-content-center">

                      <Button
                        variant={
                          v.esVirtual
                            ? "outline-success"
                            : "outline-primary"
                        }
                        size="sm"
                        onClick={() =>
                          handleEdit(v)
                        }
                      >
                        {v.esVirtual ? (
                          <>
                            <BsPlusLg /> Asignar
                          </>
                        ) : (
                          <>
                            <BsPencil /> Editar
                          </>
                        )}
                      </Button>

                      {!v.esVirtual && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() =>
                            handleDelete(v.id)
                          }
                        >
                          <BsTrash /> Eliminar
                        </Button>
                      )}

                    </div>
                  </Card.Body>
                </Card>
              );
            })
          ) : (
            <Card className="border-0 bg-light">
              <Card.Body className="text-center py-5 text-muted">
                No se encontraron
                resultados.
              </Card.Body>
            </Card>
          )}
        </div>
      )}

      {!loading && (
        <div className="d-md-none mb-4">
          {renderPaginacion()}
        </div>
      )}

      {/* =========================
          DESKTOP
          ========================= */}

      {!loading && (
        <div className="d-none d-md-block">
          <Table
            bordered
            responsive
            hover
            size="sm"
          >
            <thead>
              <tr className="text-center">
                <th
                  style={{
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() =>
                    requestSort("id")
                  }
                >
                  ID
                  {renderSortIndicator(
                    "id"
                  )}
                </th>

                <th
                  style={{
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() =>
                    requestSort("empleado")
                  }
                >
                  Empleado
                  {renderSortIndicator("empleado")}
                </th>

                <th
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    requestSort("periodo")
                  }
                >
                  Período
                  {renderSortIndicator(
                    "periodo"
                  )}
                </th>

                <th>
                  Días Asignados
                </th>

                <th
                  style={{
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() =>
                    requestSort("sucursal")
                  }
                >
                  Sucursal
                  {renderSortIndicator("sucursal")}
                </th>

                <th
                  style={{
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() =>
                    requestSort("fecha_desde")
                  }
                >
                  Desde
                  {renderSortIndicator(
                    "fecha_desde"
                  )}
                </th>

                <th
                  style={{
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() =>
                    requestSort("fecha_hasta")
                  }
                >
                  Hasta
                  {renderSortIndicator(
                    "fecha_hasta"
                  )}
                </th>

                <th>Días Tomados</th>

                <th>Pendientes</th>

                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {listaPaginada.map((v) => {
                const tomados =
                  calcularDiasTomados(
                    v.fecha_desde,
                    v.fecha_hasta
                  );

                const pendientes =
                  Number(
                    v.dias_vacaciones ||
                    0
                  ) - tomados;

                return (
                  <tr
                    key={
                      v.id != null
                        ? `vac-${v.id}`
                        : `virtual-${v.empleado_id}-${v.periodo}`
                    }
                    className="text-center align-middle"
                  >
                    <td>
                      {v.esVirtual ? "—" : v.id}
                    </td>

                    <td className="text-start">
                      {findEmpleadoLabel(
                        v.empleado_id
                      )}
                    </td>

                    <td>
                      {v.periodo}
                    </td>

                    <td>
                      {v.esVirtual ? (
                        <Badge bg="secondary">
                          Sin asignar
                        </Badge>
                      ) : (
                        v.dias_vacaciones
                      )}
                    </td>

                    <td>
                      {findSucursalLabel(
                        v.sucursal_id
                      )}
                    </td>

                    <td>
                      {formatearFecha(
                        v.fecha_desde
                      )}
                    </td>

                    <td>
                      {formatearFecha(
                        v.fecha_hasta
                      )}
                    </td>

                    <td>{tomados}</td>

                    <td>
                      <strong
                        className={
                          pendientes > 0
                            ? "text-success"
                            : ""
                        }
                      >
                        {pendientes}
                      </strong>
                    </td>

                    <td>
                      <div className="d-flex gap-2 justify-content-center">

                        <Button
                          variant={
                            v.esVirtual
                              ? "outline-success"
                              : "outline-primary"
                          }
                          size="sm"
                          onClick={() =>
                            handleEdit(v)
                          }
                        >
                          {v.esVirtual ? (
                            <>
                              <BsPlusLg /> Asignar
                            </>
                          ) : (
                            <>
                              <BsPencil /> Editar
                            </>
                          )}
                        </Button>

                        {!v.esVirtual && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              handleDelete(v.id)
                            }
                          >
                            <BsTrash /> Eliminar
                          </Button>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })}

              {listaOrdenada.length ===
                0 && (
                  <tr>
                    <td
                      colSpan="10"
                      className="text-center py-4"
                    >
                      No se encontraron
                      resultados
                    </td>
                  </tr>
                )}
            </tbody>
          </Table>

          {renderPaginacion()}

        </div>
      )}

      {showModal && (
        <VacacionesModal
          show={showModal}
          onHide={cerrarModal}
          onSuccess={fetchData}
          editVacacion={
            editVacacion
          }
        />
      )}
    </Container>
  );
}