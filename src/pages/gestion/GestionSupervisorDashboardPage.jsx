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

import DashboardTasksModal
  from "./DashboardTasksModal";

const GestionSupervisorDashboardPage = () => {
  const [tareas, setTareas] = useState([]);
  const [proyectos, setProyectos] = useState([]);

  const [modalItems, setModalItems] = useState([]);

  const [search, setSearch] = useState("");

  const [proyectoId, setProyectoId] = useState("");

  const [responsableId, setResponsableId] = useState("");

  const [estado, setEstado] = useState("");

  const [prioridad, setPrioridad] = useState("");
  const [pageSize, setPageSize] = useState(10);

  const [currentPage, setCurrentPage] = useState(1);

  // const [modalItems, setModalItems] = useState([]);

  const [modalTitle, setModalTitle] = useState("");

  const [showTasks, setShowTasks] = useState(false);

  // const [selectedTask, setSelectedTask] = useState(null);

  const [taskSearch, setTaskSearch] = useState("");

  const [taskPage, setTaskPage] = useState(1);

  const [taskPageSize, setTaskPageSize] = useState(10);

  useEffect(() => {

    Promise.all([

      gestionService.getTareas(),

      gestionService.getProyectos(),

    ]).then(([

      tareas,

      proyectos,

    ]) => {

      setTareas(
        tareas
      );

      setProyectos(
        proyectos
      );

    });

  }, []);

  useEffect(() => {

    setCurrentPage(1);

  }, [
    search,
    proyectoId,
    responsableId,
    estado,
    prioridad,
  ]);

  const responsables = [

    ...new Map(

      tareas

        .filter(
          (t) =>
            t.responsable
        )

        .map((t) => [

          t.responsable.id,

          t.responsable,

        ])

    ).values()

  ];


  const tareasFiltradas =

    tareas.filter((t) => {

      if (

        proyectoId &&

        String(
          t.proyecto_id
        ) !==
        proyectoId

      )

        return false;

      if (

        responsableId &&

        String(
          t.responsable_id
        ) !==
        responsableId

      )

        return false;

      if (

        estado &&

        t.estado !==
        estado

      )

        return false;

      if (

        prioridad &&

        t.prioridad !==
        prioridad

      )

        return false;

      if (search) {

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

        );

      }

      return true;

    });

  const resumen = {};

  tareasFiltradas.forEach((t) => {

    const key =
      t.responsable_id ||
      "SIN_RESPONSABLE";

    if (!resumen[key]) {

      resumen[key] = {

        responsable_id:
          t.responsable_id,

        usuario:
          t.responsable?.usuario ||
          "Sin responsable",

        total: 0,

        pendientes: 0,

        revision: 0,

        finalizadas: 0,

      };

    }

    resumen[key].total += 1;

    if (
      t.estado ===
      "PENDIENTE"
    ) {

      resumen[key].pendientes++;

    }

    if (
      t.estado ===
      "EN_REVISION"
    ) {

      resumen[key].revision++;

    }

    if (
      t.estado ===
      "FINALIZADA"
    ) {

      resumen[key].finalizadas++;

    }

  });

  const resumenArray =
    Object.values(resumen);

  const totalPages = Math.max(
    1,
    Math.ceil(
      resumenArray.length /
      pageSize
    )
  );

  const resumenPaginado =
    resumenArray.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );

  const vencidas =

    tareas.filter(

      t =>

        t.estado !== "FINALIZADA" &&

        t.fecha_vencimiento &&

        new Date(
          t.fecha_vencimiento
        ) < new Date()

    ).length;

  const usuarios =

    new Set(

      tareas.map(

        t =>

          t.responsable?.usuario

      )

    ).size;

  const cards = [

    {

      titulo: "Usuarios",

      valor: usuarios

    },

    {

      titulo: "Proyectos",

      valor: proyectos.length

    },

    {

      titulo: "Tareas",

      valor: tareas.length

    },

    {

      titulo: "Vencidas",

      valor: vencidas

    }

  ];

  const openUserTasks = (
    responsableId,
    tipo
  ) => {

    console.log(
      "ABRIENDO MODAL",
      responsableId,
      tipo
    );

    let data =
      tareasFiltradas.filter(
        (t) =>
          t.responsable_id ===
          responsableId
      );

    switch (tipo) {

      case "PENDIENTES":

        data = data.filter(
          (t) =>
            t.estado ===
            "PENDIENTE"
        );

        break;

      case "REVISION":

        data = data.filter(
          (t) =>
            t.estado ===
            "EN_REVISION"
        );

        break;

      case "FINALIZADAS":

        data = data.filter(
          (t) =>
            t.estado ===
            "FINALIZADA"
        );

        break;

      default:

        break;

    }

    const responsable =

      tareasFiltradas.find(
        (t) =>
          t.responsable_id ===
          responsableId
      );

    setModalTitle(

      `${responsable?.responsable?.usuario || "Sin responsable"} - ${tipo}`

    );

    setModalItems(
      data
    );

    console.log(
      "TAREAS DEL MODAL",
      data
    );

    setShowTasks(
      true
    );

  };

  return (
    <Container fluid className="py-3">
      <h3>Dashboard Supervisor Gestión</h3>

      <Row className="mb-4">

        {

          cards.map((c) => (

            <Col
              md={3}
              key={c.titulo}
            >

              <Card className="shadow-sm">

                <Card.Body>

                  <div className="text-muted">

                    {c.titulo}

                  </div>

                  <div className="display-6 fw-bold">

                    {c.valor}

                  </div>

                </Card.Body>

              </Card>

            </Col>

          ))

        }

      </Row>

      <div className="d-flex flex-wrap gap-2 mb-3">

        <Form.Control
          style={{
            width: 250
          }}
          placeholder="Buscar..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

        <Form.Select
          className="form-control"
          style={{
            width: 220
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

        <Form.Select
          className="form-control"
          style={{
            width: 220
          }}
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

          {

            responsables.map((u) => (

              <option
                key={u.id}
                value={u.id}
              >

                {u.usuario}

              </option>

            ))

          }

        </Form.Select>

        <Form.Select
          className="form-control"
          style={{
            width: 170
          }}
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

        </Form.Select>

        <Form.Select
          className="form-control"
          style={{
            width: 170
          }}
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

      </div>

      <div className="d-flex justify-content-end mb-2">

        <Form.Select
          className="form-control"
          style={{
            width: 170
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

      <Table hover responsive>
        <thead><tr><th>Usuario</th><th>Total</th><th>Pendientes</th><th>En revisión</th><th>Finalizadas</th></tr></thead>
        <tbody>
          {resumenPaginado.map((r) => (
            <tr key={r.usuario}>
              <td>{r.usuario}</td><td
                role="button"
                className="text-primary"
                onDoubleClick={() =>
                  openUserTasks(
                    r.responsable_id,
                    "TOTAL"
                  )
                }
              >
                {r.total}
              </td><td
                role="button"
                className="text-warning"
                onDoubleClick={() =>
                  openUserTasks(
                    r.responsable_id,
                    "PENDIENTES"
                  )
                }
              >
                {r.pendientes}
              </td><td
                role="button"
                className="text-info"
                onDoubleClick={() =>
                  openUserTasks(
                    r.responsable_id,
                    "REVISION"
                  )
                }
              >
                {r.revision}
              </td><td
                role="button"
                className="text-success"
                onDoubleClick={() =>
                  openUserTasks(
                    r.responsable_id,
                    "FINALIZADAS"
                  )
                }
              >
                {r.finalizadas}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center mt-3">

        <small className="text-muted">

          Mostrando

          {" "}

          {

            resumenArray.length === 0

              ? 0

              : (currentPage - 1) * pageSize + 1

          }

          {" - "}

          {

            Math.min(

              currentPage * pageSize,

              resumenArray.length

            )

          }

          {" de "}

          {resumenArray.length}

          {" usuarios"}

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

            Página

            {" "}

            {currentPage}

            {" de "}

            {totalPages}

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

      <DashboardTasksModal

        show={showTasks}

        title={modalTitle}

        tasks={modalItems}

        onHide={() =>
          setShowTasks(false)
        }

        onUpdated={async () => {

          const [
            tareas,
            proyectos,
          ] = await Promise.all([

            gestionService.getTareas(),

            gestionService.getProyectos(),

          ]);

          setTareas(
            tareas
          );

          setProyectos(
            proyectos
          );

        }}

      />

    </Container>


  );
};

export default GestionSupervisorDashboardPage;
