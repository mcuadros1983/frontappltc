import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Button,
  Form,
  Modal,
  Table,
} from "react-bootstrap";

import TaskDetailModal
  from "../../components/gestion/tasks/TaskDetailModal";

import {
  EstadoBadge,
  PrioridadBadge,
} from "../../components/gestion/shared/GestionBadges";

const DashboardTasksModal = ({
  show,
  title,
  tasks = [],
  onHide,
  onUpdated,
}) => {

  const [selectedTask, setSelectedTask] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [pageSize, setPageSize] =
    useState(10);

  const [currentPage, setCurrentPage] =
    useState(1);

  useEffect(() => {

    if (show) {

      setSearch("");

      setCurrentPage(1);

      setSelectedTask(null);

    }

  }, [
    show
  ]);
  const filteredItems =
    useMemo(() => {

      return tasks.filter((t) => {

        if (!search)
          return true;

        const texto =
          search.toLowerCase();

        return (

          t.codigo
            ?.toLowerCase()
            .includes(texto)

          ||

          t.titulo
            ?.toLowerCase()
            .includes(texto)

          ||

          t.proyecto?.codigo
            ?.toLowerCase()
            .includes(texto)

          ||

          t.proyecto?.nombre
            ?.toLowerCase()
            .includes(texto)

          ||

          t.responsable?.usuario
            ?.toLowerCase()
            .includes(texto)

        );

      });

    }, [
      tasks,
      search
    ]);

  const totalPages =
    Math.max(

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

  return (

    <>

      <Modal
        show={show}
        onHide={onHide}
        size="xl"
      >

        <Modal.Header closeButton>

          <Modal.Title>

            {title}

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

              <option value={100}>
                100 registros
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

                <th style={{ width: 120 }}>
                  Código
                </th>

                <th style={{ width: 220 }}>
                  Proyecto
                </th>

                <th>
                  Título
                </th>

                <th style={{ width: 180 }}>
                  Responsable
                </th>

                <th style={{ width: 120 }}>
                  Vence
                </th>

                <th style={{ width: 140 }}>
                  Estado
                </th>

                <th style={{ width: 120 }}>
                  Prioridad
                </th>

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

                      No existen tareas para mostrar.

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
                      onDoubleClick={() => {

                        console.log(
                          "DOBLE CLICK",
                          t
                        );

                        setSelectedTask(t);

                      }}
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

                                <div className="fw-semibold text-primary">

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

                          "Sin responsable"

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

              <span className="align-self-center">

                Página {currentPage} de {totalPages}

              </span>

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
        onUpdated={onUpdated}
      />

    </>

  );

};

export default DashboardTasksModal;