import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Button, Container, Form, Offcanvas, Table } from "react-bootstrap";
import gestionService from "../../services/gestionService";
import { EstadoBadge, PrioridadBadge } from "../../components/gestion/shared/GestionBadges";
import TaskDetailModal from "../../components/gestion/tasks/TaskDetailModal";
import getApiErrorMessage from "../../utils/getApiErrorMessage";
import Contexts from "../../context/Contexts";

const initialForm = {
  titulo: "",
  descripcion: "",
  prioridad: "NORMAL",
  fecha_vencimiento: "",
  proyecto_id: "",
};

const GestionTasksPage = () => {
  const context = useContext(Contexts.DataContext);

  const usuarios = context?.usuariosTabla || [];

  const [items, setItems] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [filtroProyecto, setFiltroProyecto] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroPrioridad, setFiltroPrioridad] = useState("");
  const [filtroResponsable, setFiltroResponsable] = useState("");

  const load = useCallback(async () => {
    const data = await gestionService.getTareas({
      search: search || undefined,
      proyecto_id: filtroProyecto || undefined,
      estado: filtroEstado || undefined,
      responsable_id: filtroResponsable || undefined,
    });

    setItems(data);
  }, [search, filtroProyecto, filtroEstado, filtroResponsable]);

  const itemsFiltrados = useMemo(() => {
    return items.filter((t) => {
      if (filtroPrioridad && t.prioridad !== filtroPrioridad) {
        return false;
      }

      return true;
    });
  }, [items, filtroPrioridad]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      itemsFiltrados.length /
      pageSize
    )
  );

  const itemsPaginados =
    itemsFiltrados.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );

  useEffect(() => {

    setCurrentPage(1);

  }, [
    search,
    filtroProyecto,
    filtroEstado,
    filtroPrioridad,
    filtroResponsable,
    pageSize,
  ]);

  const resetForm = () => {
    setForm(initialForm);
    setEditing(false);
    setEditingTask(null);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const editTask = (t) => {
    setEditing(true);
    setEditingTask(t);

    setForm({
      titulo: t.titulo || "",
      descripcion: t.descripcion || "",
      prioridad: t.prioridad || "NORMAL",
      fecha_vencimiento: t.fecha_vencimiento || "",
      proyecto_id: t.proyecto_id || "",
    });

    setShowForm(true);
  };

  const limpiarFiltros = () => {
    setSearch("");
    setFiltroProyecto("");
    setFiltroEstado("");
    setFiltroPrioridad("");
    setFiltroResponsable("");
  };

  useEffect(() => {
    gestionService.getProyectos().then(setProyectos);
  }, []);

  useEffect(() => {
    return () => {
      setShowForm(false);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 300);

    return () => clearTimeout(timer);
  }, [load]);

  const create = async () => {
    if (!form.titulo?.trim()) {
      alert("Debe ingresar un título");
      return;
    }

    if (!form.prioridad) {
      alert("Debe seleccionar una prioridad");
      return;
    }

    try {
      await gestionService.createTarea(form);
      closeForm();
      await load();
    } catch (error) {
      alert(getApiErrorMessage(error));
    }
  };

  const updateTask = async () => {
    if (!editingTask?.id) {
      alert("No se encontró la tarea a editar");
      return;
    }

    if (!form.titulo?.trim()) {
      alert("Debe ingresar un título");
      return;
    }

    if (!form.prioridad) {
      alert("Debe seleccionar una prioridad");
      return;
    }

    try {
      await gestionService.updateTarea(editingTask.id, form);
      closeForm();
      await load();
    } catch (error) {
      alert(getApiErrorMessage(error));
    }
  };

  const deleteTask = async (t) => {
    if (!window.confirm("¿Eliminar tarea?")) return;

    try {
      await gestionService.deleteTarea(t.id);
      await load();
    } catch (error) {
      alert(getApiErrorMessage(error));
    }
  };

  const save = () => {
    if (editing) {
      updateTask();
    } else {
      create();
    }
  };

  return (
    <Container fluid className="py-3">
      <div className="d-flex justify-content-between mb-3">
        <h3>Tareas</h3>

        <Button onClick={openCreate}>
          Nueva tarea
        </Button>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <Form.Control
          style={{ maxWidth: 260 }}
          placeholder="Buscar tarea..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Form.Select
          className="form-control"
          style={{ maxWidth: 260 }}
          value={filtroProyecto}
          onChange={(e) => setFiltroProyecto(e.target.value)}
        >
          <option value="">Todos los proyectos</option>
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.codigo ? `${p.codigo} · ${p.nombre}` : p.nombre}
            </option>
          ))}
        </Form.Select>

        <Form.Select
          className="form-control"
          style={{ maxWidth: 190 }}
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_CURSO">En curso</option>
          <option value="EN_REVISION">En revisión</option>
          <option value="FINALIZADA">Finalizada</option>
          <option value="CANCELADA">Cancelada</option>
        </Form.Select>

        <Form.Select
          className="form-control"
          style={{ maxWidth: 190 }}
          value={filtroPrioridad}
          onChange={(e) => setFiltroPrioridad(e.target.value)}
        >
          <option value="">Todas las prioridades</option>
          <option value="CRITICA">Crítica</option>
          <option value="ALTA">Alta</option>
          <option value="NORMAL">Normal</option>
          <option value="BAJA">Baja</option>
        </Form.Select>

        <Form.Select
          className="form-control"
          style={{ maxWidth: 240 }}
          value={filtroResponsable}
          onChange={(e) => setFiltroResponsable(e.target.value)}
        >
          <option value="">Todos los responsables</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre_completo || u.usuario}
            </option>
          ))}
        </Form.Select>

        <Form.Select
          className="form-control"
          style={{ maxWidth: 170 }}
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
            10 por página
          </option>

          <option value={20}>
            20 por página
          </option>

          <option value={50}>
            50 por página
          </option>

          <option value={100}>
            100 por página
          </option>

        </Form.Select>

        <Button
          variant="outline-secondary"
          onClick={limpiarFiltros}
        >
          Limpiar
        </Button>

        <Button
          variant="outline-primary"
          onClick={load}
        >
          Actualizar
        </Button>
      </div>

      <Table hover responsive>
        <thead>
          <tr>
            <th>Código</th>
            <th>Proyecto</th>
            <th>Título</th>
            <th>Responsable</th>
            <th>Vencimiento</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {itemsPaginados.map((t) => {
            const vencida =
              t.fecha_vencimiento &&
              new Date(t.fecha_vencimiento) < new Date() &&
              t.estado !== "FINALIZADA";

            return (
              <tr
                key={t.id}
                onDoubleClick={() => setSelected(t)}
                style={{
                  cursor: "pointer",
                }}
              >
                <td>{t.codigo}</td>

                <td>
                  {t.proyecto
                    ? `${t.proyecto.codigo || ""} ${t.proyecto.nombre || ""}`
                    : "-"}
                </td>

                <td>{t.titulo}</td>

                <td>{t.responsable?.usuario || "-"}</td>

                <td className={vencida ? "text-danger fw-bold" : ""}>
                  {t.fecha_vencimiento || "-"}
                </td>

                <td>
                  <EstadoBadge estado={t.estado} />
                </td>

                <td>
                  <PrioridadBadge prioridad={t.prioridad} />
                </td>

                <td>
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setSelected(t)}
                    >
                      Ver
                    </Button>

                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => editTask(t)}
                    >
                      Editar
                    </Button>

                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => deleteTask(t)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center mt-3">

        <div className="text-muted">

          Mostrando

          {" "}

          {
            itemsFiltrados.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1
          }

          {" - "}

          {
            Math.min(
              currentPage * pageSize,
              itemsFiltrados.length
            )
          }

          {" de "}

          {itemsFiltrados.length}

        </div>

        <div className="d-flex gap-2">

          <Button
            variant="outline-secondary"
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage(
                currentPage - 1
              )
            }
          >
            Anterior
          </Button>

          <span className="align-self-center">

            Página

            {" "}

            {currentPage}

            {" de "}

            {totalPages}

          </span>

          <Button
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

      <Offcanvas
        show={showForm}
        onHide={closeForm}
        placement="end"
        backdrop
        scroll={false}
        style={{
          width: "min(700px, 100vw)",
        }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            {editing ? "Editar tarea" : "Nueva tarea"}
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>
          <Form.Group className="mb-3">
            <Form.Label>Título</Form.Label>

            <Form.Control
              value={form.titulo}
              onChange={(e) =>
                setForm({
                  ...form,
                  titulo: e.target.value,
                })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>

            <Form.Control
              as="textarea"
              rows={4}
              value={form.descripcion}
              onChange={(e) =>
                setForm({
                  ...form,
                  descripcion: e.target.value,
                })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Proyecto</Form.Label>

            <Form.Select
              className="form-control"
              value={form.proyecto_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  proyecto_id: e.target.value,
                })
              }
            >
              <option value="">Sin proyecto</option>

              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.codigo ? `${p.codigo} · ${p.nombre}` : p.nombre}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Prioridad</Form.Label>

            <Form.Select
              className="form-control"
              value={form.prioridad}
              onChange={(e) =>
                setForm({
                  ...form,
                  prioridad: e.target.value,
                })
              }
            >
              <option value="BAJA">Baja</option>
              <option value="NORMAL">Normal</option>
              <option value="ALTA">Alta</option>
              <option value="CRITICA">Crítica</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Fecha de vencimiento</Form.Label>

            <Form.Control
              type="date"
              value={form.fecha_vencimiento}
              onChange={(e) =>
                setForm({
                  ...form,
                  fecha_vencimiento: e.target.value,
                })
              }
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 border-top pt-3">
            <Button
              variant="secondary"
              onClick={closeForm}
            >
              Cancelar
            </Button>

            <Button onClick={save}>
              Guardar
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      <TaskDetailModal
        show={!!selected}
        taskId={selected?.id}
        onHide={() => setSelected(null)}
        onUpdated={load}
      />
    </Container>
  );
};

export default GestionTasksPage;