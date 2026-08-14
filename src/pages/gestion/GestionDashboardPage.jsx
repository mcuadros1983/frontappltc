import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Table,
} from "react-bootstrap";
import gestionService from "../../services/gestionService";
import TaskDetailModal from "../../components/gestion/tasks/TaskDetailModal";
import { useSecurity } from "../../security/SecurityContext";
import {
  EstadoBadge,
  PrioridadBadge,
} from "../../components/gestion/shared/GestionBadges";


const GestionDashboardPage = () => {
  const [data, setData] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [modalItems, setModalItems] =
    useState([]);

  const [modalTitle, setModalTitle] =
    useState("");

  const [showTasks, setShowTasks] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [pageSize, setPageSize] =
    useState(10);

  const [currentPage, setCurrentPage] =
    useState(1);
  const { user } = useSecurity();

  const load = async () => {

    const [
      dashboard,
      tareas,
    ] = await Promise.all([

      gestionService.getDashboard(),

      gestionService.getTareas(),

    ]);

    console.log(
      "DASHBOARD =>",
      dashboard
    );

    console.log(
      "PRIMERA TAREA",
      tareas[0]
    );

    console.log(
      "SEGUNDA TAREA",
      tareas[1]
    );

    setData(
      dashboard
    );

    setTasks(
      tareas
    );

  };

  useEffect(() => {

    load();

  }, []);

  const filteredItems =
    modalItems.filter((t) => {

      if (!search)
        return true;

      const texto =
        search.toLowerCase();

      return (

        t.codigo?.toLowerCase().includes(texto) ||

        t.titulo?.toLowerCase().includes(texto) ||

        t.proyecto?.codigo
          ?.toLowerCase()
          .includes(texto) ||

        t.proyecto?.nombre
          ?.toLowerCase()
          .includes(texto) ||

        t.responsable?.usuario
          ?.toLowerCase()
          .includes(texto)

      );

    });

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredItems.length /
      pageSize
    )
  );

  const paginatedItems =
    filteredItems.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );

  const cards = [
    {
      key: "MIS",
      label: "Mis tareas",
      value: data?.mis_tareas || 0,
    },
    {
      key: "VENCIDAS",
      label: "Vencidas",
      value: data?.vencidas || 0,
    },
    {
      key: "REVISION",
      label: "En revisión",
      value: data?.en_revision || 0,
    },
    {
      key: "FINALIZADAS",
      label: "Finalizadas",
      value: data?.finalizadas_mes || 0,
    },
  ];

  const openCard = (tipo) => {

    const hoy = new Date();

    let data = [];

    switch (tipo) {

      case "MIS":

        data = tasks.filter(
          (t) =>
            t.responsable_id ===
            user?.id
        );

        setModalTitle(
          "Mis tareas"
        );

        break;

      case "VENCIDAS":

        data = tasks.filter(
          (t) =>
            t.estado !== "FINALIZADA" &&
            t.fecha_vencimiento &&
            new Date(
              t.fecha_vencimiento
            ) < hoy
        );

        setModalTitle(
          "Tareas vencidas"
        );

        break;

      case "REVISION":

        data = tasks.filter(
          (t) =>
            t.estado ===
            "EN_REVISION"
        );

        setModalTitle(
          "Tareas en revisión"
        );

        break;

      case "FINALIZADAS":

        data = tasks.filter(
          (t) =>
            t.estado ===
            "FINALIZADA"
        );

        setModalTitle(
          "Tareas finalizadas"
        );

        break;

      default:

        break;

    }

    setSearch("");

    setCurrentPage(1);

    setModalItems(
      data
    );

    setShowTasks(
      true
    );

  };

  const getPreview = (tipo) => {

    const hoy = new Date();

    switch (tipo) {

      case "MIS":

        return tasks.find(
          (t) =>
            t.responsable_id === user?.id
        );

      case "VENCIDAS":

        return tasks.find(
          (t) =>
            t.estado !== "FINALIZADA" &&
            t.fecha_vencimiento &&
            new Date(t.fecha_vencimiento) < hoy
        );

      case "REVISION":

        return tasks.find(
          (t) =>
            t.estado === "EN_REVISION"
        );

      case "FINALIZADAS":

        return tasks.find(
          (t) =>
            t.estado === "FINALIZADA"
        );

      default:

        return null;

    }

  };

  return (
    <Container fluid className="py-3">
      <h3>Gestión</h3>
      <Row className="g-3">
        {cards.map((card) => {

          const preview =
            getPreview(card.key);

          const vencida =

            preview &&

            preview.fecha_vencimiento &&

            preview.estado !==
            "FINALIZADA" &&

            new Date(
              preview.fecha_vencimiento
            ) < new Date();

          return (

            <Col
              md={3}
              key={card.key}
            >

              <Card
                className={`shadow-sm h-100 ${vencida
                  ? "border-danger"
                  : ""
                  }`}
                role="button"
                style={{
                  cursor: "pointer",
                  transition: "all .2s",
                }}
                onDoubleClick={() =>
                  openCard(card.key)
                }
              >

                <Card.Body>

                  <div className="text-muted">
                    {card.label}
                  </div>

                  <div className="fs-2 fw-bold">
                    {card.value}
                  </div>

                  <hr />

                  {

                    preview
                      ? (

                        <>
                          <div className="fw-semibold">

                            {preview.codigo}

                          </div>

                          <div
                            className="small fw-semibold mt-1"
                          >

                            {preview.titulo}

                          </div>

                          {

                            preview.proyecto && (

                              <small className="text-primary d-block">

                                📁 {preview.proyecto.codigo}

                              </small>

                            )

                          }

                          <small className="text-muted d-block">

                            👤 {
                              preview.responsable?.usuario
                            }

                          </small>

                          <div className="mt-2">

                            <EstadoBadge
                              estado={
                                preview.estado
                              }
                            />

                          </div>

                        </>

                      )

                      : (

                        <small className="text-muted">

                          Sin tareas

                        </small>

                      )

                  }

                  <div className="mt-3 text-primary small">

                    Doble clic para ver

                  </div>

                </Card.Body>

              </Card>

            </Col>

          );

        })}
      </Row>

      <Modal
        show={showTasks}
        onHide={() =>
          setShowTasks(false)
        }
        size="xl"
      >

        <Modal.Header closeButton>

          <Modal.Title>

            {modalTitle}

          </Modal.Title>

        </Modal.Header>

        <Modal.Body>

          <div className="d-flex justify-content-between align-items-center mb-3">

            <Form.Control
              placeholder="Buscar tarea..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              style={{
                maxWidth: 350
              }}
            />

            <Form.Select
              className="form-control"
              style={{
                width: 180
              }}
              value={pageSize}
              onChange={(e) =>
                setPageSize(
                  Number(
                    e.target.value
                  )
                )
              }
            >

              <option value={10}>
                10 registros
              </option>

              <option value={20}>
                20 registros
              </option>

              <option value={50}>
                50 registros
              </option>

            </Form.Select>

          </div>

          <Table
            hover
            responsive
            bordered
            size="sm"
          >

            <thead>

              <tr>

                <th>Código</th>

                <th>Proyecto</th>

                <th>Título</th>

                <th>Responsable</th>

                <th>Vence</th>

                <th>Estado</th>

                <th>Prioridad</th>

              </tr>

            </thead>

            <tbody>

              {

                paginatedItems.length === 0 && (

                  <tr>

                    <td
                      colSpan={7}
                      className="text-center text-muted"
                    >

                      No existen tareas.

                    </td>

                  </tr>

                )

              }

              {

                paginatedItems.map((t) => {

                  const vencida =

                    t.fecha_vencimiento &&

                    t.estado !== "FINALIZADA" &&

                    new Date(
                      t.fecha_vencimiento
                    ) < new Date();

                  return (

                    <tr
                      key={t.id}
                      style={{
                        cursor: "pointer"
                      }}
                      onDoubleClick={() =>
                        setSelectedTask(t)
                      }
                    >

                      <td>

                        <strong>

                          {t.codigo}

                        </strong>

                      </td>

                      <td>

                        {

                          t.proyecto
                            ? (

                              <>

                                <div className="fw-semibold">

                                  {t.proyecto.codigo}

                                </div>

                                <small className="text-muted">

                                  {t.proyecto.nombre}

                                </small>

                              </>

                            )

                            : "-"

                        }

                      </td>

                      <td>

                        {t.titulo}

                      </td>

                      <td>

                        {

                          t.responsable?.usuario ||

                          "-"

                        }

                      </td>

                      <td>

                        <span
                          className={
                            vencida
                              ? "text-danger fw-bold"
                              : ""
                          }
                        >

                          {

                            t.fecha_vencimiento ||

                            "-"

                          }

                        </span>

                      </td>

                      <td>

                        <EstadoBadge
                          estado={t.estado}
                        />

                      </td>

                      <td>

                        <PrioridadBadge
                          prioridad={t.prioridad}
                        />

                      </td>

                    </tr>

                  );

                })

              }

            </tbody>

          </Table>

          <div className="d-flex justify-content-between align-items-center">

            <small className="text-muted">

              Mostrando

              {" "}

              {

                filteredItems.length === 0

                  ? 0

                  : (currentPage - 1) * pageSize + 1

              }

              {" - "}

              {

                Math.min(

                  currentPage * pageSize,

                  filteredItems.length

                )

              }

              {" de "}

              {filteredItems.length}

            </small>

            <div className="d-flex gap-2">

              <Button
                size="sm"
                variant="outline-secondary"
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  setCurrentPage(
                    currentPage - 1
                  )
                }
              >

                Anterior

              </Button>

              <Button
                size="sm"
                variant="outline-secondary"
                disabled={
                  currentPage >= totalPages
                }
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

        </Modal.Body>

      </Modal>

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

export default GestionDashboardPage;
