import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Button,
  Badge,
  Spinner,
} from "react-bootstrap";

import {
  Link,
} from "react-router-dom";

import {
  inspeccionesApi,
} from "../../services/inspeccionesApi";

import { useSecurity } from "../../security/SecurityContext";

const estadoColor = (
  estado
) => {
  switch (estado) {
    case "ABIERTA":
      return "warning";

    case "PARCIAL":
      return "info";

    case "EN_REVISION":
      return "primary";

    case "CERRADA":
      return "success";

    case "ANULADA":
      return "dark";

    default:
      return "secondary";
  }
};

const InspeccionesList =

  () => {

    const { can } = useSecurity();

    const [
      rows,
      setRows,
    ] = useState([]);

    const [
      loading,
      setLoading,
    ] = useState(true);

    const [
      estadoFiltro,
      setEstadoFiltro,
    ] = useState("");

    const [
      sucursalFiltro,
      setSucursalFiltro,
    ] = useState("");

    const [
      textoFiltro,
      setTextoFiltro,
    ] = useState("");

    const [
      inspectorFiltro,
      setInspectorFiltro,
    ] = useState("");

    const [
      plantillaFiltro,
      setPlantillaFiltro,
    ] = useState("");

    const [
      fechaDesde,
      setFechaDesde,
    ] = useState("");

    const [
      fechaHasta,
      setFechaHasta,
    ] = useState("");


    const cargar =
      async () => {
        try {
          setLoading(true);

          const data =
            await inspeccionesApi.listar();

          setRows(
            Array.isArray(
              data
            )
              ? data
              : []
          );
        } catch (error) {
          console.error(
            error
          );
        } finally {
          setLoading(false);
        }
      };

    useEffect(() => {
      cargar();
    }, []);

    const anularInspeccion =
      async (id) => {

        const motivo =
          window.prompt(
            "Motivo de anulación:"
          );

        if (
          motivo === null
        ) {
          return;
        }

        try {

          await inspeccionesApi.anular(
            id,
            motivo
          );

          await cargar();

        } catch (
        error
        ) {

          console.error(
            error
          );

          alert(
            "Error anulando inspección"
          );

        }
      };

    const sucursales =
      useMemo(() => {
        return [
          ...new Map(
            rows.map((r) => [
              r.sucursal?.id,
              r.sucursal,
            ])
          ).values(),
        ];
      }, [rows]);

    const inspectores =
      useMemo(() => {
        return [
          ...new Map(
            rows.map((r) => [
              r.inspector?.id,
              r.inspector,
            ])
          ).values(),
        ].filter(Boolean);
      }, [rows]);

    const plantillas =
      useMemo(() => {
        return [
          ...new Map(
            rows.map((r) => [
              r.plantilla?.id,
              r.plantilla,
            ])
          ).values(),
        ].filter(Boolean);
      }, [rows]);

    const rowsFiltrados =
      useMemo(() => {
        return rows.filter(
          (r) => {
            const cumpleEstado =
              !estadoFiltro ||
              r.estado ===
              estadoFiltro;

            const cumpleSucursal =
              !sucursalFiltro ||
              String(
                r.sucursal_id
              ) ===
              String(
                sucursalFiltro
              );

            const texto =
              `${r.id}
              ${r.sucursal?.nombre || ""}
              ${r.inspector?.usuario || ""}
              ${r.plantilla?.nombre || ""}`
                .toLowerCase();

            const cumpleTexto =
              !textoFiltro ||
              texto.includes(
                textoFiltro.toLowerCase()
              );

            const cumpleInspector =
              !inspectorFiltro ||
              String(
                r.inspector?.id
              ) ===
              String(
                inspectorFiltro
              );

            const cumplePlantilla =
              !plantillaFiltro ||
              String(
                r.plantilla?.id
              ) ===
              String(
                plantillaFiltro
              );

            const fecha =
              r.fecha_inspeccion
                ? new Date(
                  r.fecha_inspeccion
                )
                : null;

            const cumpleDesde =
              !fechaDesde ||
              (
                fecha &&
                fecha >=
                new Date(
                  fechaDesde
                )
              );

            const cumpleHasta =
              !fechaHasta ||
              (
                fecha &&
                fecha <=
                new Date(
                  fechaHasta +
                  "T23:59:59"
                )
              );

            return (
              cumpleEstado &&
              cumpleSucursal &&
              cumpleTexto &&
              cumpleInspector &&
              cumplePlantilla &&
              cumpleDesde &&
              cumpleHasta
            );
          }
        );
      }, [
        rows,
        estadoFiltro,
        sucursalFiltro,
        textoFiltro,
      ]);

    if (loading) {
      return (
        <Container
          fluid
          className="mt-3 text-center"
        >
          <Spinner animation="border" />
        </Container>
      );
    }

    return (
      <Container
        fluid
        className="mt-3 rpm-page px-3"
      >
        <Row className="mb-3">
          <Col>
            <div className="d-flex flex-column flex-md-row justify-content-between gap-2">
              <h4>
                {can("inspecciones:admin")
                  ? "Todas las Inspecciones"
                  : "Mis Inspecciones"}
              </h4>
              {can(
                "inspecciones:create"
              ) && (
                  <Link
                    to="/inspecciones/nueva"
                    className="btn btn-primary"
                  >
                    Nueva Inspección
                  </Link>
                )}
            </div>
          </Col>
        </Row>

        <Card className="mb-3">
          <Card.Body>
            <Row>
              <Col
                xs={12}
                md={4}
                className="mb-2"
              >
                <Form.Control
                  placeholder="Buscar..."
                  value={
                    textoFiltro
                  }
                  onChange={(
                    e
                  ) =>
                    setTextoFiltro(
                      e.target
                        .value
                    )
                  }
                />
              </Col>

              <Col
                xs={12}
                md={4}
                className="mb-2"
              >
                <Form.Select
                  className="form-control my-input"
                  value={
                    sucursalFiltro
                  }
                  onChange={(
                    e
                  ) =>
                    setSucursalFiltro(
                      e.target
                        .value
                    )
                  }
                >
                  <option value="">
                    Todas las
                    sucursales
                  </option>

                  {sucursales.map(
                    (
                      s
                    ) => (
                      <option
                        key={
                          s.id
                        }
                        value={
                          s.id
                        }
                      >
                        {
                          s.nombre
                        }
                      </option>
                    )
                  )}
                </Form.Select>
              </Col>

              <Col
                xs={12}
                md={4}
              >
                <Form.Select
                  className="form-control my-input"
                  value={
                    estadoFiltro
                  }
                  onChange={(
                    e
                  ) =>
                    setEstadoFiltro(
                      e.target
                        .value
                    )
                  }
                >
                  <option value="">
                    Todos los
                    estados
                  </option>

                  <option value="ABIERTA">
                    ABIERTA
                  </option>

                  <option value="PARCIAL">
                    PARCIAL
                  </option>

                  <option value="EN_REVISION">
                    EN REVISION
                  </option>

                  <option value="CERRADA">
                    CERRADA
                  </option>

                  <option value="ANULADA">
                    ANULADA
                  </option>
                </Form.Select>
              </Col>

              <Col
                xs={12}
                md={3}
                className="mb-2"
              >
                <Form.Select className="form-control my-input"
                  value={
                    inspectorFiltro
                  }
                  onChange={(e) =>
                    setInspectorFiltro(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Todos los inspectores
                  </option>

                  {inspectores.map(
                    (i) => (
                      <option
                        key={i.id}
                        value={i.id}
                      >
                        {i.usuario}
                      </option>
                    )
                  )}
                </Form.Select>
              </Col>

              <Col
                xs={12}
                md={3}
                className="mb-2"
              >
                <Form.Select  className="form-control my-input"
                  value={
                    plantillaFiltro
                  }
                  onChange={(e) =>
                    setPlantillaFiltro(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Todas las plantillas
                  </option>

                  {plantillas.map(
                    (p) => (
                      <option
                        key={p.id}
                        value={p.id}
                      >
                        {p.nombre}
                      </option>
                    )
                  )}
                </Form.Select>
              </Col>

              <Col
                xs={12}
                md={3}
                className="mb-2"
              >
                <Form.Control
                  type="date"
                  value={
                    fechaDesde
                  }
                  onChange={(e) =>
                    setFechaDesde(
                      e.target.value
                    )
                  }
                />
              </Col>

              <Col
                xs={12}
                md={3}
                className="mb-2"
              >
                <Form.Control
                  type="date"
                  value={
                    fechaHasta
                  }
                  onChange={(e) =>
                    setFechaHasta(
                      e.target.value
                    )
                  }
                />
              </Col>

              <Col
                xs={12}
                className="mt-2"
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setTextoFiltro("");
                    setEstadoFiltro("");
                    setSucursalFiltro("");
                    setInspectorFiltro("");
                    setPlantillaFiltro("");
                    setFechaDesde("");
                    setFechaHasta("");
                  }}
                >
                  Limpiar filtros
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* MOBILE */}

        <div className="d-md-none">
          {rowsFiltrados.map(
            (
              row
            ) => (
              <Card
                key={row.id}
                className="mb-3"
              >
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <strong>
                      #
                      {
                        row.id
                      }
                    </strong>

                    <Badge
                      bg={estadoColor(
                        row.estado
                      )}
                    >
                      {
                        row.estado
                      }
                    </Badge>
                  </div>

                  <hr />

                  <div>
                    <strong>
                      Sucursal:
                    </strong>{" "}
                    {
                      row
                        .sucursal
                        ?.nombre
                    }
                  </div>

                  <div>
                    <strong>
                      Inspector:
                    </strong>{" "}
                    {
                      row
                        .inspector
                        ?.usuario
                    }
                  </div>

                  <div>
                    <strong>
                      Plantilla:
                    </strong>{" "}
                    {
                      row
                        .plantilla
                        ?.nombre
                    }
                  </div>

                  <div>
                    <strong>
                      Fecha:
                    </strong>{" "}
                    {
                      row.fecha_inspeccion
                    }
                  </div>

                  <div className="mt-3 d-flex gap-2">

                    <Link
                      className="btn btn-primary btn-sm flex-fill"
                      to={`/inspecciones/${row.id}`}
                    >
                      Ver
                    </Link>

                    {can(
                      "inspecciones:admin"
                    ) &&
                      row.estado !==
                      "ANULADA" && (

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            anularInspeccion(
                              row.id
                            )
                          }
                        >
                          Anular
                        </Button>

                      )}

                  </div>
                </Card.Body>
              </Card>
            )
          )}
        </div>

        {/* DESKTOP */}

        <Card className="d-none d-md-block">
          <Card.Body>
            <Table
              striped
              hover
              responsive
            >
              <thead>
                <tr>
                  <th>ID</th>

                  <th>
                    Fecha
                  </th>

                  <th>
                    Sucursal
                  </th>

                  <th>
                    Inspector
                  </th>

                  <th>
                    Plantilla
                  </th>

                  <th>
                    Estado
                  </th>

                  <th>
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody>
                {rowsFiltrados.map(
                  (
                    row
                  ) => (
                    <tr
                      key={
                        row.id
                      }
                    >
                      <td>
                        {
                          row.id
                        }
                      </td>

                      <td>
                        {
                          row.fecha_inspeccion
                        }
                      </td>

                      <td>
                        {
                          row
                            .sucursal
                            ?.nombre
                        }
                      </td>

                      <td>
                        {
                          row
                            .inspector
                            ?.usuario
                        }
                      </td>

                      <td>
                        {
                          row
                            .plantilla
                            ?.nombre
                        }
                      </td>

                      <td>
                        <Badge
                          bg={estadoColor(
                            row.estado
                          )}
                        >
                          {
                            row.estado
                          }
                        </Badge>
                      </td>

                      <td>

                        <div className="d-flex gap-2">

                          <Link
                            to={`/inspecciones/${row.id}`}
                            className="btn btn-sm btn-primary"
                          >
                            Ver
                          </Link>

                          {can(
                            "inspecciones:admin"
                          ) &&
                            row.estado !==
                            "ANULADA" && (

                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() =>
                                  anularInspeccion(
                                    row.id
                                  )
                                }
                              >
                                Anular
                              </Button>

                            )}

                        </div>

                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    );
  };

export default InspeccionesList;