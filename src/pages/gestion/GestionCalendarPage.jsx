import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
} from "react-bootstrap";
import Contexts from "../../context/Contexts";
import gestionService from "../../services/gestionService";
import {
  EstadoBadge,
  PrioridadBadge,
} from "../../components/gestion/shared/GestionBadges";
import TaskDetailModal from "../../components/gestion/tasks/TaskDetailModal";
import getApiErrorMessage from "../../utils/getApiErrorMessage";

const PAGE_SIZE_OPTIONS = [
  10,
  20,
  50,
  100,
];

const getProyectoIdFromItem = (item) =>
  item.proyecto_id ||
  item.proyecto?.id ||
  item.proyectoId ||
  null;

const getProyectoCodigoFromItem = (item) =>
  item.proyecto_codigo ||
  item.proyecto?.codigo ||
  item.proyectoCodigo ||
  "";

const getProyectoNombreFromItem = (item) =>
  item.proyecto_nombre ||
  item.proyecto?.nombre ||
  item.proyectoNombre ||
  "";

const getResponsableIdFromItem = (item) =>
  item.responsable_id ||
  item.responsable?.id ||
  item.responsableId ||
  null;

const getResponsableNombreFromItem = (item) => {

  if (
    item.responsable &&
    typeof item.responsable === "object"
  ) {
    return (
      item.responsable.nombre_completo ||
      item.responsable.usuario ||
      "Sin responsable"
    );
  }

  return (
    item.responsable ||
    item.responsable_nombre ||
    item.responsable?.usuario ||
    item.responsable?.nombre_completo ||
    "Sin responsable"
  );

};

const diasHasta = (fecha) => {

  if (!fecha) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const vencimiento = new Date(fecha);
  vencimiento.setHours(0, 0, 0, 0);

  return Math.ceil(
    (vencimiento - hoy) /
      (1000 * 60 * 60 * 24)
  );

};

const GestionCalendarPage = () => {

  const context =
    useContext(
      Contexts.DataContext
    );

  const usuariosTabla =
    context?.usuariosTabla || [];

  const [items, setItems] =
    useState([]);

  const [proyectos, setProyectos] =
    useState([]);

  const [selectedTask, setSelectedTask] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [proyectoId, setProyectoId] =
    useState("");

  const [responsableId, setResponsableId] =
    useState("");

  const [estado, setEstado] =
    useState("");

  const [prioridad, setPrioridad] =
    useState("");

  const [orden, setOrden] =
    useState("VENCIMIENTO_ASC");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(20);

  const load = async () => {

    try {

      const [
        calendario,
        tareas,
        proyectosData,
      ] =
        await Promise.all([
          gestionService.getCalendar(),
          gestionService.getTareas(),
          gestionService.getProyectos(),
        ]);

      const tareasPorId =
        new Map(
          (tareas || []).map(
            (tarea) => [
              String(tarea.id),
              tarea,
            ]
          )
        );

      const calendarioEnriquecido =
        (calendario || []).map((item) => {

          const tarea =
            tareasPorId.get(
              String(item.id)
            );

          if (!tarea) {
            return item;
          }

          return {
            ...item,

            codigo:
              item.codigo ||
              tarea.codigo,

            prioridad:
              item.prioridad ||
              tarea.prioridad,

            responsable_id:
              item.responsable_id ||
              tarea.responsable_id,

            responsable:
              item.responsable ||
              tarea.responsable,

            proyecto_id:
              item.proyecto_id ||
              tarea.proyecto_id ||
              tarea.proyecto?.id,

            proyecto:
              item.proyecto ||
              tarea.proyecto,

            proyecto_codigo:
              item.proyecto_codigo ||
              tarea.proyecto?.codigo,

            proyecto_nombre:
              item.proyecto_nombre ||
              tarea.proyecto?.nombre,
          };

        });

      setItems(
        calendarioEnriquecido
      );

      setProyectos(
        proyectosData || []
      );

    } catch (error) {

      alert(
        getApiErrorMessage(
          error
        )
      );

    }

  };

  useEffect(() => {

    load();

  }, []);

  const filtrados =
    useMemo(() => {

      let data =
        [...items];

      data =
        data.filter((item) => {

          const proyectoItemId =
            getProyectoIdFromItem(
              item
            );

          const responsableItemId =
            getResponsableIdFromItem(
              item
            );

          const proyectoCodigo =
            getProyectoCodigoFromItem(
              item
            );

          const proyectoNombre =
            getProyectoNombreFromItem(
              item
            );

          const responsableNombre =
            getResponsableNombreFromItem(
              item
            );

          const textoBusqueda =
            [
              item.codigo,
              item.titulo,
              proyectoCodigo,
              proyectoNombre,
              responsableNombre,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          if (
            search &&
            !textoBusqueda.includes(
              search.toLowerCase()
            )
          ) {
            return false;
          }

          if (
            proyectoId &&
            String(proyectoItemId) !== String(proyectoId)
          ) {
            return false;
          }

          if (
            responsableId &&
            String(responsableItemId) !== String(responsableId)
          ) {
            return false;
          }

          if (
            estado &&
            item.estado !== estado
          ) {
            return false;
          }

          if (
            prioridad &&
            item.prioridad !== prioridad
          ) {
            return false;
          }

          return true;

        });

      switch (orden) {

        case "VENCIMIENTO_ASC":
          data.sort(
            (a, b) =>
              new Date(a.fecha || "9999-12-31") -
              new Date(b.fecha || "9999-12-31")
          );
          break;

        case "VENCIMIENTO_DESC":
          data.sort(
            (a, b) =>
              new Date(b.fecha || "0001-01-01") -
              new Date(a.fecha || "0001-01-01")
          );
          break;

        case "PRIORIDAD": {

          const ordenPrioridad = {
            CRITICA: 1,
            ALTA: 2,
            NORMAL: 3,
            BAJA: 4,
          };

          data.sort(
            (a, b) =>
              (ordenPrioridad[a.prioridad] || 9) -
              (ordenPrioridad[b.prioridad] || 9)
          );

          break;

        }

        case "PROYECTO":
          data.sort(
            (a, b) =>
              getProyectoCodigoFromItem(a)
                .localeCompare(
                  getProyectoCodigoFromItem(b)
                )
          );
          break;

        case "RESPONSABLE":
          data.sort(
            (a, b) =>
              getResponsableNombreFromItem(a)
                .localeCompare(
                  getResponsableNombreFromItem(b)
                )
          );
          break;

        default:
          break;
      }

      return data;

    }, [
      items,
      search,
      proyectoId,
      responsableId,
      estado,
      prioridad,
      orden,
    ]);

  useEffect(() => {

    setCurrentPage(1);

  }, [
    search,
    proyectoId,
    responsableId,
    estado,
    prioridad,
    orden,
    pageSize,
  ]);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filtrados.length / pageSize
      )
    );

  const paginados =
    filtrados.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );

  const resumen = {
    total:
      filtrados.length,

    vencidas:
      filtrados.filter((item) =>
        diasHasta(item.fecha) < 0 &&
        item.estado !== "FINALIZADA"
      ).length,

    hoy:
      filtrados.filter((item) =>
        diasHasta(item.fecha) === 0
      ).length,

    semana:
      filtrados.filter((item) => {

        const dias =
          diasHasta(
            item.fecha
          );

        return (
          dias !== null &&
          dias >= 0 &&
          dias <= 7
        );

      }).length,
  };

  const limpiarFiltros = () => {

    setSearch("");
    setProyectoId("");
    setResponsableId("");
    setEstado("");
    setPrioridad("");
    setOrden("VENCIMIENTO_ASC");
    setCurrentPage(1);

  };

  return (
    <Container
      fluid
      className="py-3"
    >

      <div className="d-flex justify-content-between align-items-center mb-3">

        <h3 className="mb-0">
          Calendario Gestión
        </h3>

        <Button
          variant="outline-primary"
          onClick={load}
        >
          Actualizar
        </Button>

      </div>

      <Row className="mb-3 g-3">

        <Col md={3}>
          <Card
            body
            className="shadow-sm"
          >
            <strong>{resumen.total}</strong>
            <div className="text-muted">
              Total
            </div>
          </Card>
        </Col>

        <Col md={3}>
          <Card
            body
            className="shadow-sm"
          >
            <strong>{resumen.hoy}</strong>
            <div className="text-muted">
              Vencen hoy
            </div>
          </Card>
        </Col>

        <Col md={3}>
          <Card
            body
            className="shadow-sm"
          >
            <strong>{resumen.semana}</strong>
            <div className="text-muted">
              Próximos 7 días
            </div>
          </Card>
        </Col>

        <Col md={3}>
          <Card
            body
            className="shadow-sm"
          >
            <strong className="text-danger">
              {resumen.vencidas}
            </strong>
            <div className="text-muted">
              Vencidas
            </div>
          </Card>
        </Col>

      </Row>

      <Card className="mb-3 shadow-sm">
        <Card.Body>

          <Row className="g-2">

            <Col md={3}>
              <Form.Control
                placeholder="Buscar tarea, proyecto o responsable..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />
            </Col>

            <Col md={3}>
              <Form.Select
                className="form-control"
                value={proyectoId}
                onChange={(e) =>
                  setProyectoId(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Todos los proyectos
                </option>

                {proyectos.map((p) => (
                  <option
                    key={p.id}
                    value={p.id}
                  >
                    {p.codigo} · {p.nombre}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Select
                className="form-control"
                value={responsableId}
                onChange={(e) =>
                  setResponsableId(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Todos los responsables
                </option>

                {usuariosTabla.map((u) => (
                  <option
                    key={u.id}
                    value={u.id}
                  >
                    {u.nombre_completo || u.usuario}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Select
                className="form-control"
                value={estado}
                onChange={(e) =>
                  setEstado(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Todos los estados
                </option>
                <option value="PENDIENTE">
                  Pendiente
                </option>
                <option value="EN_CURSO">
                  En curso
                </option>
                <option value="EN_REVISION">
                  En revisión
                </option>
                <option value="FINALIZADA">
                  Finalizada
                </option>
                <option value="CANCELADA">
                  Cancelada
                </option>
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Select
                className="form-control"
                value={prioridad}
                onChange={(e) =>
                  setPrioridad(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Todas las prioridades
                </option>
                <option value="CRITICA">
                  Crítica
                </option>
                <option value="ALTA">
                  Alta
                </option>
                <option value="NORMAL">
                  Normal
                </option>
                <option value="BAJA">
                  Baja
                </option>
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Select
                className="form-control"
                value={orden}
                onChange={(e) =>
                  setOrden(
                    e.target.value
                  )
                }
              >
                <option value="VENCIMIENTO_ASC">
                  Vence primero
                </option>
                <option value="VENCIMIENTO_DESC">
                  Vence último
                </option>
                <option value="PRIORIDAD">
                  Prioridad
                </option>
                <option value="PROYECTO">
                  Proyecto
                </option>
                <option value="RESPONSABLE">
                  Responsable
                </option>
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Select
                className="form-control"
                value={pageSize}
                onChange={(e) =>
                  setPageSize(
                    Number(
                      e.target.value
                    )
                  )
                }
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option
                    key={size}
                    value={size}
                  >
                    {size} por página
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={2}>
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={limpiarFiltros}
              >
                Limpiar
              </Button>
            </Col>

          </Row>

        </Card.Body>
      </Card>

      {paginados.map((item) => {

        const dias =
          diasHasta(
            item.fecha
          );

        const proyectoCodigo =
          getProyectoCodigoFromItem(
            item
          );

        const proyectoNombre =
          getProyectoNombreFromItem(
            item
          );

        const responsableNombre =
          getResponsableNombreFromItem(
            item
          );

        const vencida =
          dias < 0 &&
          item.estado !== "FINALIZADA";

        return (
          <Card
            className={`mb-3 shadow-sm ${vencida ? "border-danger" : ""}`}
            key={`${item.tipo}-${item.id}`}
            role="button"
            onDoubleClick={() =>
              setSelectedTask(
                item
              )
            }
          >
            <Card.Body>

              <div className="d-flex justify-content-between gap-3">

                <div>

                  <div className="fw-bold">
                    {item.codigo || `Tarea ${item.id}`}
                  </div>

                  {
                    proyectoCodigo || proyectoNombre ? (
                      <div className="text-primary small">
                        📁 {proyectoCodigo}
                        {proyectoNombre ? ` · ${proyectoNombre}` : ""}
                      </div>
                    ) : (
                      <div className="text-muted small">
                        Sin proyecto
                      </div>
                    )
                  }

                  <div className="fs-5 mt-1">
                    {item.titulo}
                  </div>

                  <div className="text-muted small">
                    👤 {responsableNombre}
                  </div>

                  <div
                    className={
                      vencida
                        ? "text-danger fw-bold small"
                        : "text-muted small"
                    }
                  >
                    📅 {item.fecha || "-"}
                  </div>

                </div>

                <div className="text-end">

                  <EstadoBadge
                    estado={item.estado}
                  />

                  {
                    item.prioridad && (
                      <div className="mt-2">
                        <PrioridadBadge
                          prioridad={item.prioridad}
                        />
                      </div>
                    )
                  }

                  <div className="mt-2">

                    {
                      dias !== null &&
                      dias < 0 &&
                      item.estado !== "FINALIZADA" && (
                        <Badge bg="danger">
                          Vencida hace {Math.abs(dias)} días
                        </Badge>
                      )
                    }

                    {
                      dias === 0 && (
                        <Badge bg="warning">
                          Vence hoy
                        </Badge>
                      )
                    }

                    {
                      dias > 0 &&
                      dias <= 3 && (
                        <Badge bg="warning">
                          Vence en {dias} días
                        </Badge>
                      )
                    }

                    {
                      dias > 3 && (
                        <Badge bg="success">
                          {dias} días restantes
                        </Badge>
                      )
                    }

                  </div>

                </div>

              </div>

            </Card.Body>
          </Card>
        );

      })}

      <div className="d-flex justify-content-between align-items-center mt-3">

        <div className="text-muted">
          Mostrando{" "}
          {filtrados.length === 0
            ? 0
            : (currentPage - 1) * pageSize + 1}
          {" "}
          -
          {" "}
          {Math.min(
            currentPage * pageSize,
            filtrados.length
          )}
          {" "}
          de
          {" "}
          {filtrados.length}
        </div>

        <div className="d-flex gap-2">

          <Button
            variant="outline-secondary"
            disabled={currentPage <= 1}
            onClick={() =>
              setCurrentPage(
                currentPage - 1
              )
            }
          >
            Anterior
          </Button>

          <span className="align-self-center">
            Página {currentPage} de {totalPages}
          </span>

          <Button
            variant="outline-secondary"
            disabled={currentPage >= totalPages}
            onClick={() =>
              setCurrentPage(
                currentPage + 1
              )
            }
          >
            Siguiente
          </Button>

        </div>

      </div>

      <TaskDetailModal
        show={!!selectedTask}
        taskId={selectedTask?.id}
        onHide={() =>
          setSelectedTask(null)
        }
        onUpdated={load}
      />

    </Container>
  );

};

export default GestionCalendarPage;
