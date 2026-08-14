import React, {
  useEffect,
  useState,
  useContext
} from "react";
import { Button, Container, Form, Modal, Table } from "react-bootstrap";
import gestionService from "../../services/gestionService";
import Contexts from "../../context/Contexts";
import TaskDetailModal from "../../components/gestion/tasks/TaskDetailModal";


const GestionProjectsPage = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  const [filtroEstado, setFiltroEstado] = useState("");

  const [filtroPrioridad, setFiltroPrioridad] = useState("");

  const [filtroResponsable, setFiltroResponsable] = useState("");

  const [orden, setOrden] = useState("NOMBRE");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [nuevoMiembro, setNuevoMiembro] = useState("");
  const [nuevoRol, setNuevoRol] = useState("COLABORADOR");
  const [form, setForm] = useState({ nombre: "", descripcion: "", prioridad: "NORMAL" });
  const [tareaForm, setTareaForm] = useState({
    titulo: "",
    descripcion: "",
    prioridad: "NORMAL",
    fecha_vencimiento: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(20);
  const [selectedTask, setSelectedTask] = useState(null);
  const responsables = React.useMemo(() => {

    const map = new Map();

    items.forEach((p) => {

      if (
        p.responsable?.id &&
        !map.has(p.responsable.id)
      ) {

        map.set(
          p.responsable.id,
          p.responsable
        );

      }

    });

    return [
      ...map.values()
    ];

  }, [
    items
  ]);

  const context =
    useContext(
      Contexts.DataContext
    );

  const getErrorMessage = (
    error
  ) => {

    try {

      const parsed =
        JSON.parse(
          error?.message
        );

      return (
        parsed?.message ||
        error?.message
      );

    } catch {

      return (
        error?.message ||
        "Error inesperado"
      );

    }

  };

  const openDetail = async (id) => {

    try {

      const data =
        await gestionService.getProyecto(id);

      setSelected(data);

      setShowDetail(true);

    } catch (error) {

      console.error(error);

      alert(
        getErrorMessage(error)
      );

    }

  };

  const load = async () => setItems(await gestionService.getProyectos());
  useEffect(() => { load(); }, []);

  const addMember = async () => {

    if (!selected?.id) return;

    if (!nuevoMiembro) {
      alert(
        "Seleccione un usuario"
      );
      return;
    }

    try {

      await gestionService
        .addMiembroProyecto(
          selected.id,
          {
            usuario_id:
              nuevoMiembro,
            rol:
              nuevoRol,
          }
        );

      const proyecto =
        await gestionService
          .getProyecto(
            selected.id
          );

      setSelected(
        proyecto
      );

      setNuevoMiembro("");

      setNuevoRol(
        "COLABORADOR"
      );

    } catch (error) {

      console.error(error);

      alert(
        getErrorMessage(error)
      );

    }

  };

  const createTareaProyecto = async () => {
    if (!selected?.id) return;

    if (!tareaForm.titulo.trim()) {
      alert("Debe ingresar un título");
      return;
    }

    try {
      await gestionService.createTarea({
        ...tareaForm,
        proyecto_id: selected.id,
      });

      const proyecto = await gestionService.getProyecto(selected.id);

      setSelected(proyecto);

      setTareaForm({
        titulo: "",
        descripcion: "",
        prioridad: "NORMAL",
        fecha_vencimiento: "",
      });

      await load();
    } catch (error) {
      console.error(error);
      alert(getErrorMessage(error));
    }
  };

  const updateProyecto = async () => {

    try {

      await gestionService.updateProyecto(
        selected.id,
        form
      );

      const proyecto =
        await gestionService.getProyecto(
          selected.id
        );

      setSelected(
        proyecto
      );

      setShowCreate(false);
      setEditing(false);

      await load();

    } catch (error) {

      console.error(
        "Error actualizando proyecto:",
        error
      );

      alert(
        getErrorMessage(error)
      );

    }

  };

  // const totalPages = Math.max(
  //   1,
  //   Math.ceil(
  //     items.length / pageSize
  //   )
  // );

  // const itemsPaginados =
  //   items.slice(
  //     (currentPage - 1) * pageSize,
  //     currentPage * pageSize
  //   );

  const create = async () => {

    try {

      await gestionService.createProyecto(
        form
      );

      setShowCreate(false);

      setForm({
        nombre: "",
        descripcion: "",
        prioridad: "NORMAL",
      });

      await load();

    } catch (error) {

      console.error(error);

      alert(
        getErrorMessage(error)
      );

    }

  };

  const itemsFiltrados =
    React.useMemo(() => {

      let data = [...items];

      if (search) {

        const texto =
          search.toLowerCase();

        data = data.filter((p) =>

          p.codigo?.toLowerCase().includes(texto) ||

          p.nombre?.toLowerCase().includes(texto) ||

          p.descripcion?.toLowerCase().includes(texto)

        );

      }

      if (filtroEstado) {

        data = data.filter(
          (p) =>
            p.estado ===
            filtroEstado
        );

      }

      if (filtroPrioridad) {

        data = data.filter(
          (p) =>
            p.prioridad ===
            filtroPrioridad
        );

      }

      if (filtroResponsable) {

        data = data.filter(
          (p) =>
            String(
              p.responsable?.id
            ) ===
            String(
              filtroResponsable
            )
        );

      }

      switch (orden) {

        case "NOMBRE":

          data.sort((a, b) =>
            a.nombre.localeCompare(
              b.nombre
            )
          );

          break;

        case "CODIGO":

          data.sort((a, b) =>
            a.codigo.localeCompare(
              b.codigo
            )
          );

          break;

        case "FECHA":

          data.sort(
            (a, b) =>
              new Date(
                b.created_at
              ) -
              new Date(
                a.created_at
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
      filtroEstado,
      filtroPrioridad,
      filtroResponsable,
      orden
    ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      itemsFiltrados.length / pageSize
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
    filtroEstado,
    filtroPrioridad,
    filtroResponsable,
    orden,
    pageSize,
  ]);

  return (
    <Container fluid className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">

        <h3>
          Proyectos Gestión
        </h3>

        <div className="d-flex gap-2">

          <Form.Select
            className="form-control"
            style={{ width: 170 }}
            value={pageSize}
            onChange={(e) => {

              setPageSize(
                Number(
                  e.target.value
                )
              );

              setCurrentPage(1);

            }}
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
            onClick={() => {

              setEditing(false);

              setForm({
                nombre: "",
                descripcion: "",
                prioridad: "NORMAL",
              });

              setShowCreate(true);

            }}
          >
            Nuevo proyecto
          </Button>

        </div>

      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">

        <Form.Control
          style={{ width: 250 }}
          placeholder="Buscar proyecto..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

        <Form.Select
          className="form-control"
          style={{ width: 180 }}
          value={filtroEstado}
          onChange={(e) =>
            setFiltroEstado(
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

          <option value="FINALIZADA">
            Finalizado
          </option>

        </Form.Select>

        <Form.Select
          className="form-control"
          style={{ width: 180 }}
          value={filtroPrioridad}
          onChange={(e) =>
            setFiltroPrioridad(
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

        <Form.Select
          className="form-control"
          style={{ width: 220 }}
          value={filtroResponsable}
          onChange={(e) =>
            setFiltroResponsable(
              e.target.value
            )
          }
        >

          <option value="">
            Todos los responsables
          </option>

          {

            responsables.map((u) => (

              <option
                key={u.id}
                value={u.id}
              >

                {
                  u.usuario ||
                  u.nombre_completo
                }

              </option>

            ))

          }

        </Form.Select>

        <Form.Select
          className="form-control"
          style={{ width: 180 }}
          value={orden}
          onChange={(e) =>
            setOrden(
              e.target.value
            )
          }
        >

          <option value="NOMBRE">
            Ordenar por nombre
          </option>

          <option value="CODIGO">
            Ordenar por código
          </option>

          <option value="FECHA">
            Más recientes
          </option>

        </Form.Select>

      </div>

      <Table hover responsive>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Responsable</th>
            <th>Estado</th>
            <th>Avance</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {itemsPaginados.map((p) => (
            <tr key={p.id}>
              <td>{p.codigo}</td>
              <td>{p.nombre}</td>
              <td>{p.responsable?.usuario || "-"}</td>
              <td>{p.estado}</td>
              <td>
                <Button size="sm" onClick={() => openDetail(p.id)}>
                  Ver
                </Button>
              </td>
            </tr>
          ))}
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

      <Modal show={showCreate} onHide={() => setShowCreate(false)}>
        <Modal.Header closeButton><Modal.Title>
          {
            editing
              ? "Editar proyecto"
              : "Nuevo proyecto"
          }
        </Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Control className="mb-2" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <Form.Control className="mb-2" as="textarea" placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          <Form.Select className="form-control" value={form.prioridad} onChange={(e) => setForm({ ...form, prioridad: e.target.value })}>
            <option value="BAJA">Baja</option><option value="NORMAL">Normal</option><option value="ALTA">Alta</option><option value="CRITICA">Crítica</option>
          </Form.Select>
        </Modal.Body>
        <Modal.Footer><Button
          onClick={
            editing
              ? updateProyecto
              : create
          }
        >
          Guardar
        </Button></Modal.Footer>
      </Modal>

      <Modal show={showDetail} onHide={() => setShowDetail(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            {selected?.codigo} · {selected?.nombre}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {!selected ? (
            <div>Cargando...</div>
          ) : (
            <>
              <h5>Resumen</h5>
              <div className="mb-3 d-flex gap-2">

                <Button
                  variant="warning"
                  onClick={() => {

                    setForm({
                      nombre:
                        selected.nombre || "",
                      descripcion:
                        selected.descripcion || "",
                      prioridad:
                        selected.prioridad || "NORMAL",
                    });

                    setEditing(true);
                    setShowCreate(true);

                  }}
                >
                  Editar
                </Button>

                <Button
                  variant="danger"
                  onClick={async () => {

                    if (
                      !window.confirm(
                        "¿Eliminar proyecto?"
                      )
                    ) return;

                    try {

                      await gestionService.deleteProyecto(
                        selected.id
                      );

                      setShowDetail(false);

                      await load();

                    } catch (error) {

                      console.error(error);

                      alert(
                        getErrorMessage(error)
                      );

                    }

                  }}
                >
                  Eliminar
                </Button>

              </div>
              <p>{selected.descripcion || "Sin descripción"}</p>

              <hr />


              <h5>Miembros</h5>
              <div className="row mb-3">

                <div className="col-md-6">

                  <Form.Select
                    className="form-control"
                    value={nuevoMiembro}
                    onChange={(e) =>
                      setNuevoMiembro(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Seleccionar usuario
                    </option>

                    {context.usuariosSistema.map(
                      (usuario) => (

                        <option
                          key={usuario.id}
                          value={usuario.id}
                        >
                          {
                            usuario.nombre_completo ||
                            usuario.usuario
                          }
                        </option>

                      )
                    )}

                  </Form.Select>

                </div>

                <div className="col-md-3">

                  <Form.Select
                    className="form-control"
                    value={nuevoRol}
                    onChange={(e) =>
                      setNuevoRol(
                        e.target.value
                      )
                    }
                  >

                    <option value="COLABORADOR">
                      Colaborador
                    </option>

                    <option value="OBSERVADOR">
                      Observador
                    </option>

                    <option value="SUPERVISOR">
                      Supervisor
                    </option>

                  </Form.Select>

                </div>

                <div className="col-md-3">

                  <Button
                    className="w-100"
                    onClick={addMember}
                  >
                    Agregar
                  </Button>

                </div>

              </div>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(selected.miembros || []).map((m) => (
                    <tr key={m.id}>
                      <td>{m.usuario?.usuario || m.usuario_id}</td>
                      <td>{m.rol}</td>
                      <td>

                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={async () => {

                            if (
                              !window.confirm(
                                "¿Quitar miembro?"
                              )
                            ) return;

                            try {

                              console.log(
                                "QUITAR MIEMBRO",
                                selected.id,
                                m.id
                              );

                              await gestionService
                                .removeMiembroProyecto(
                                  selected.id,
                                  m.id
                                );

                              const proyecto =
                                await gestionService
                                  .getProyecto(
                                    selected.id
                                  );

                              console.log(
                                JSON.stringify(
                                  proyecto.miembros,
                                  null,
                                  2
                                )
                              );

                              setSelected(
                                proyecto
                              );

                            } catch (error) {

                              console.error(
                                "Error quitando miembro:",
                                error
                              );

                              alert(
                                getErrorMessage(error)
                              );

                            }

                          }}
                        >
                          Quitar
                        </Button>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <hr />

              <h5>Tareas del proyecto</h5>

              <div className="row mb-3">
                <div className="col-md-3">
                  <Form.Control
                    placeholder="Título"
                    value={tareaForm.titulo}
                    onChange={(e) =>
                      setTareaForm({
                        ...tareaForm,
                        titulo: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-md-3">
                  <Form.Control
                    placeholder="Descripción"
                    value={tareaForm.descripcion}
                    onChange={(e) =>
                      setTareaForm({
                        ...tareaForm,
                        descripcion: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-md-2">
                  <Form.Select
                    className="form-control"
                    value={tareaForm.prioridad}
                    onChange={(e) =>
                      setTareaForm({
                        ...tareaForm,
                        prioridad: e.target.value,
                      })
                    }
                  >
                    <option value="BAJA">Baja</option>
                    <option value="NORMAL">Normal</option>
                    <option value="ALTA">Alta</option>
                    <option value="CRITICA">Crítica</option>
                  </Form.Select>
                </div>

                <div className="col-md-2">
                  <Form.Control
                    type="date"
                    value={tareaForm.fecha_vencimiento}
                    onChange={(e) =>
                      setTareaForm({
                        ...tareaForm,
                        fecha_vencimiento: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-md-2">
                  <Button
                    className="w-100"
                    onClick={createTareaProyecto}
                  >
                    Crear tarea
                  </Button>
                </div>
              </div>

              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Título</th>
                    <th>Responsable</th>
                    <th>Estado</th>
                    <th>Prioridad</th>
                    <th>Vencimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {(selected.tareas || []).map((t) => (
                    <tr
                      key={t.id}
                      style={{ cursor: "pointer" }}
                      onDoubleClick={() => {

                        setShowDetail(false);

                        setSelectedTask(t);

                      }}
                    >
                      <td>{t.codigo}</td>
                      <td>{t.titulo}</td>
                      <td>{t.responsable?.usuario || "-"}</td>
                      <td>{t.estado}</td>
                      <td>{t.prioridad}</td>
                      <td>{t.fecha_vencimiento || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <hr />
              {/* 
              <pre>
                {JSON.stringify(selected, null, 2)}
              </pre> */}

              <h5>Actividad</h5>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Usuario</th>
                    <th>Tipo</th>
                    <th>Comentario</th>
                  </tr>
                </thead>

                <tbody>
                  {(selected.actividades || []).map((a) => (
                    <tr key={a.id}>
                      <td>{a.created_at || a.createdAt}</td>
                      <td>
                        {a.usuario?.nombre_completo ||
                          a.usuario?.usuario ||
                          a.usuario_id}
                      </td>
                      <td>{a.tipo}</td>
                      <td>{a.comentario}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
      </Modal>
      <TaskDetailModal
        show={!!selectedTask}
        taskId={selectedTask?.id}

        onHide={async () => {

          setSelectedTask(null);

          if (selected?.id) {

            const proyecto =
              await gestionService.getProyecto(
                selected.id
              );

            setSelected(
              proyecto
            );

            setShowDetail(true);

          }

          await load();

        }}

        onUpdated={async () => {

          await load();

          if (selected?.id) {

            const proyecto =
              await gestionService.getProyecto(
                selected.id
              );

            setSelected(
              proyecto
            );

          }

        }}
      />

    </Container>
  );
};

export default GestionProjectsPage;
