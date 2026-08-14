import React, { useEffect, useState } from "react";
import { Button, Form, ListGroup, Modal, Tab, Tabs } from "react-bootstrap";
import gestionService from "../../../services/gestionService";
import getApiErrorMessage from "../../../utils/getApiErrorMessage";
import { EstadoBadge, PrioridadBadge } from "../shared/GestionBadges";
import { useSecurity } from "../../../security/SecurityContext"; // 👈 NUEVO

const TaskDetailModal = ({ show, taskId, onHide, onUpdated }) => {
  const [task, setTask] = useState(null);
  const [comentario, setComentario] = useState("");
  const [check, setCheck] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [editingChecklist, setEditingChecklist] =
    useState(null);

  const [editingDescripcion, setEditingDescripcion] =
    useState("");
  const { user } = useSecurity();


  const puedeEditarTarea = () => {

    if (!task) {
      return false;
    }

    // Administrador ERP
    if (user?.rol_id === 1) {
      return true;
    }

    if (task.creado_por_id === user.id) {
      return true;
    }

    if (task.responsable_id === user.id) {
      return true;
    }

    if (task.supervisor_id === user.id) {
      return true;
    }

    return (
      task.participantes?.some(
        (p) =>
          p.usuario_id === user.id &&
          p.activo &&
          p.rol === "SUPERVISOR"
      ) || false
    );

  };

  const load = async () => {

    if (!taskId) return;

    try {

      const data =
        await gestionService.getTarea(
          taskId
        );

      setTask(data);

    } catch (error) {

      alert(
        getApiErrorMessage(
          error
        )
      );

      onHide?.();

    }

  };

  useEffect(() => {
    if (show) load();
  }, [show, taskId]);

  const refresh = async () => {
    await load();
    onUpdated?.();
  };

  const addComentario = async () => {

    if (!comentario.trim()) return;

    try {

      await gestionService.addComentario(
        task.id,
        comentario
      );

      setComentario("");

      await refresh();

    } catch (error) {

      alert(
        getApiErrorMessage(
          error
        )
      );

    }

  };

  const addChecklist = async () => {

    if (!check.trim()) return;

    try {

      await gestionService.addChecklist(
        task.id,
        {
          descripcion: check
        }
      );

      setCheck("");

      await refresh();

    } catch (error) {

      alert(
        getApiErrorMessage(
          error
        )
      );

    }

  };

  const completeChecklist = async (
    item
  ) => {

    try {

      await gestionService.completeChecklist(
        item.id,
        !item.completado
      );

      await refresh();

    } catch (error) {

      alert(
        getApiErrorMessage(
          error
        )
      );

    }

  };

  const uploadArchivo = async () => {

    if (!archivo) return;

    const formData = new FormData();

    formData.append(
      "archivo",
      archivo
    );

    try {

      await gestionService.uploadArchivo(
        task.id,
        formData
      );

      setArchivo(null);

      await refresh();

    } catch (error) {

      alert(
        getApiErrorMessage(
          error
        )
      );

    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>{task?.codigo} · {task?.titulo}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!task ? (
          <div>Cargando...</div>
        ) : (
          <Tabs defaultActiveKey="info">
            <Tab eventKey="info" title="Información" className="pt-3">
              <div className="d-flex gap-2 mb-3">
                <EstadoBadge estado={task.estado} />
                <PrioridadBadge prioridad={task.prioridad} />
              </div>
              <p>{task.descripcion || "Sin descripción"}</p>
              <div>Responsable: {task.responsable?.usuario || "-"}</div>
              <div>Vencimiento: {task.fecha_vencimiento || "-"}</div>
            </Tab>

            <Tab eventKey="checklist" title="Checklist" className="pt-3">
              <ListGroup className="mb-3">
                {(task.checklist || []).map((item) => (
                  <ListGroup.Item
                    key={item.id}
                    className="d-flex justify-content-between align-items-center"
                  >

                    <div className="d-flex align-items-center gap-2 flex-grow-1">

                      <Form.Check
                        checked={!!item.completado}
                        disabled={!puedeEditarTarea}
                        onChange={() =>
                          completeChecklist(item)
                        }
                      />

                      {
                        editingChecklist === item.id
                          ? (
                            <Form.Control
                              value={editingDescripcion}
                              onChange={(e) =>
                                setEditingDescripcion(
                                  e.target.value
                                )
                              }
                            />
                          )
                          : (
                            <span
                              className={
                                item.completado
                                  ? "text-decoration-line-through text-muted"
                                  : ""
                              }
                            >
                              {item.descripcion}
                            </span>
                          )
                      }

                    </div>

                    {
                      puedeEditarTarea && (

                        <div className="d-flex gap-2">

                          {
                            editingChecklist === item.id
                              ? (
                                <>

                                  <Button
                                    size="sm"
                                    onClick={async () => {

                                      try {

                                        await gestionService.updateChecklist(
                                          item.id,
                                          {
                                            descripcion:
                                              editingDescripcion
                                          }
                                        );

                                        setEditingChecklist(null);

                                        setEditingDescripcion("");

                                        await refresh();

                                      } catch (error) {

                                        alert(
                                          getApiErrorMessage(
                                            error
                                          )
                                        );

                                      }

                                    }}
                                  >
                                    Guardar
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => {

                                      setEditingChecklist(null);

                                      setEditingDescripcion("");

                                    }}
                                  >
                                    Cancelar
                                  </Button>

                                </>
                              )
                              : (
                                <>

                                  <Button
                                    size="sm"
                                    variant="outline-warning"
                                    onClick={() => {

                                      setEditingChecklist(
                                        item.id
                                      );

                                      setEditingDescripcion(
                                        item.descripcion
                                      );

                                    }}
                                  >
                                    ✏
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline-danger"
                                    onClick={async () => {

                                      if (
                                        !window.confirm(
                                          "¿Eliminar checklist?"
                                        )
                                      ) return;

                                      try {

                                        await gestionService.deleteChecklist(
                                          item.id
                                        );

                                        await refresh();

                                      } catch (error) {

                                        alert(
                                          getApiErrorMessage(
                                            error
                                          )
                                        );

                                      }

                                    }}
                                  >
                                    🗑
                                  </Button>

                                </>
                              )
                          }

                        </div>

                      )
                    }

                  </ListGroup.Item>
                ))}
              </ListGroup>
              <div className="d-flex gap-2">
                <Form.Control value={check} onChange={(e) => setCheck(e.target.value)} placeholder="Nuevo checklist" />
                {puedeEditarTarea() && (

                  <Button
                    onClick={addChecklist}
                  >
                    Agregar
                  </Button>

                )}
              </div>
            </Tab>

            <Tab eventKey="actividad" title="Actividad" className="pt-3">
              <div className="d-flex gap-2 mb-3">
                <Form.Control value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Comentario" />
                <Button onClick={addComentario}>Comentar</Button>
              </div>
              <ListGroup>
                {(task.actividades || []).map((act) => (
                  <ListGroup.Item key={act.id}>
                    <small className="text-muted">{act.usuario?.usuario || "Sistema"} · {act.created_at}</small>
                    <div>{act.comentario || act.tipo}</div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Tab>

            <Tab
              eventKey="archivos"
              title={`Archivos (${task.archivos?.length || 0})`}
              className="pt-3"
            >

              <div className="d-flex gap-2 mb-3">

                <Form.Control
                  type="file"
                  onChange={(e) =>
                    setArchivo(
                      e.target.files?.[0] || null
                    )
                  }
                />

                <Button
                  onClick={uploadArchivo}
                  disabled={!archivo}
                >
                  Subir
                </Button>

              </div>

              <ListGroup>

                {(task.archivos || []).map(
                  (archivo) => (

                    <ListGroup.Item
                      key={archivo.id}
                      className="d-flex justify-content-between align-items-center"
                    >

                      <div>

                        <div>
                          {archivo.nombre_original}
                        </div>

                        <small className="text-muted">
                          {archivo.usuario?.usuario || "-"}
                        </small>

                      </div>

                      <Button
                        size="sm"
                        variant="outline-primary"
                        href={archivo.drive_url}
                        target="_blank"
                      >
                        Abrir
                      </Button>

                    </ListGroup.Item>

                  )
                )}

              </ListGroup>

            </Tab>

          </Tabs>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default TaskDetailModal;
