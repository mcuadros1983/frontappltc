import React from "react";
import { Button, Card } from "react-bootstrap";
import {
  EstadoBadge,
  PrioridadBadge
} from "../shared/GestionBadges";

const transitions = {
  PENDIENTE: [
    {
      estado: "EN_CURSO",
      label: "Iniciar"
    }
  ],
  EN_CURSO: [
    {
      estado: "EN_REVISION",
      label: "Revisión"
    }
  ],
  EN_REVISION: [
    {
      estado: "FINALIZADA",
      label: "Finalizar"
    },
    {
      estado: "EN_CURSO",
      label: "Reabrir"
    }
  ],
  FINALIZADA: [],
};

const estados = [
  "PENDIENTE",
  "EN_CURSO",
  "EN_REVISION",
  "FINALIZADA"
];

const KanbanBoard = ({
  columns,
  expandedTasks,
  onExpandTask,
  onTaskClick,
  onMoveTask,
}) => (

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, minmax(250px,1fr))",
      gap: "1rem",
    }}
  >

    {estados.map((estado) => (

      <Card
        key={estado}
        className="shadow-sm"
      >

        <Card.Header className="fw-bold d-flex justify-content-between">

          <span>{estado}</span>

          <span>
            {columns?.[estado]?.length || 0}
          </span>

        </Card.Header>

        <Card.Body
          style={{
            minHeight: "65vh",
            background: "#f8f9fa",
          }}
        >

          {(columns?.[estado] || []).map((task) => {

            const hoy =
              new Date();

            const vencida =
              task.fecha_vencimiento &&
              new Date(task.fecha_vencimiento) < hoy &&
              task.estado !== "FINALIZADA";

            const expanded =
              expandedTasks?.has(
                task.id
              );

            return (

              <Card
                key={task.id}
                role="button"
                className={`mb-2 shadow-sm ${vencida ? "border-danger" : ""}`}
                onClick={() =>
                  onExpandTask(
                    task.id
                  )
                }
                onDoubleClick={() =>
                  onTaskClick?.(
                    task
                  )
                }
              >

                <Card.Body
                  className="p-2"
                  style={{
                    transition:
                      "all .2s ease",
                  }}
                >

                  <div className="d-flex justify-content-between align-items-center">

                    <small className="fw-bold">
                      {task.codigo}
                    </small>

                    <PrioridadBadge
                      prioridad={
                        task.prioridad
                      }
                    />

                  </div>

                  {
                    task.proyecto && (

                      <small
                        className="text-primary d-block"
                        title={
                          task.proyecto.nombre
                        }
                      >
                        📁 {task.proyecto.codigo}
                      </small>

                    )
                  }

                  <div className="mt-2">
                    <EstadoBadge
                      estado={
                        task.estado
                      }
                    />
                  </div>

                  {
                    expanded && (

                      <>

                        <hr className="my-2" />

                        <div className="fw-semibold">
                          {task.titulo}
                        </div>

                        <small className="text-muted d-block">

                          👤 {
                            task.responsable?.usuario ||
                            "Sin responsable"
                          }

                        </small>

                        <small
                          className={
                            vencida
                              ? "text-danger fw-bold d-block mt-1"
                              : "text-muted d-block mt-1"
                          }
                        >
                          📅 Vence: {
                            task.fecha_vencimiento ||
                            "Sin fecha"
                          }
                        </small>

                        <div className="mt-2">

                          {(transitions[estado] || []).map((tr) => (

                            <Button
                              key={tr.estado}
                              size="sm"
                              className="me-1 mb-1"
                              variant="outline-primary"
                              onClick={(e) => {

                                e.stopPropagation();

                                onMoveTask?.(
                                  task,
                                  tr.estado
                                );

                              }}
                            >
                              {tr.label}
                            </Button>

                          ))}

                        </div>

                      </>

                    )
                  }

                </Card.Body>

              </Card>

            );

          })}

        </Card.Body>

      </Card>

    ))}

  </div>

);

export default KanbanBoard;