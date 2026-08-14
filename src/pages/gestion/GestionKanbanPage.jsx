import React, { useEffect, useState } from "react";
import { Container, Form } from "react-bootstrap";
import gestionService from "../../services/gestionService";
import KanbanBoard from "../../components/gestion/kanban/KanbanBoard";
import TaskDetailModal from "../../components/gestion/tasks/TaskDetailModal";
import getApiErrorMessage from "../../utils/getApiErrorMessage";

const GestionKanbanPage = () => {

  const [columns, setColumns] = useState({});
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState("");

  const [proyectos, setProyectos] = useState([]);
  const [proyectoId, setProyectoId] = useState("");

  const [expandedTasks, setExpandedTasks] =
    useState(new Set());

  const load = async () => {

    setColumns(
      await gestionService.getKanban({
        search,
        proyecto_id:
          proyectoId || undefined,
      })
    );

  };

  const toggleExpandedTask = (
    taskId
  ) => {

    setExpandedTasks((prev) => {

      const next =
        new Set(prev);

      if (
        next.has(taskId)
      ) {

        next.delete(taskId);

      } else {

        next.add(taskId);

      }

      return next;

    });

  };

  useEffect(() => {

    load();

  }, []);

  useEffect(() => {

    gestionService
      .getProyectos()
      .then(setProyectos);

  }, []);

  useEffect(() => {

    const timer =
      setTimeout(() => {

        load();

      }, 300);

    return () =>
      clearTimeout(timer);

  }, [
    search,
    proyectoId
  ]);

  const move = async (
    task,
    estado
  ) => {

    try {

      await gestionService.changeEstado(
        task.id,
        {
          estado,
          comentario:
            `Cambio desde Kanban a ${estado}`,
        }
      );

      await load();

    } catch (error) {

      alert(
        getApiErrorMessage(
          error
        )
      );

    }

  };

  return (

    <Container
      fluid
      className="py-3"
    >

      <div className="d-flex justify-content-between align-items-center mb-3">

        <h3 className="mb-0">
          Kanban Gestión
        </h3>

      </div>

      <div className="d-flex gap-2 mb-3">

        <Form.Select
          className="form-control"
          style={{
            maxWidth: 350
          }}
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

          {
            proyectos.map((p) => (

              <option
                key={p.id}
                value={p.id}
              >
                {p.codigo} · {p.nombre}
              </option>

            ))
          }

        </Form.Select>

        <Form.Control
          placeholder="Buscar tarea..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>

      <KanbanBoard
        columns={columns}
        expandedTasks={expandedTasks}
        onExpandTask={toggleExpandedTask}
        onTaskClick={setSelected}
        onMoveTask={move}
      />

      <TaskDetailModal
        show={!!selected}
        taskId={selected?.id}
        onHide={() =>
          setSelected(null)
        }
        onUpdated={load}
      />

    </Container>

  );

};

export default GestionKanbanPage;