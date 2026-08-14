import React, {
  useState,
  useEffect
} from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  Container,
  Table,
  Button,
  Form,
  Row,
  Col,
  Card
} from "react-bootstrap";

import {
  stockFabricaApi
} from "../../services/stockFabricaApi";



export default function StockFabrica() {

  const [inventarios,
    setInventarios] =
    useState([]);

  const [inventarioId,
    setInventarioId] =
    useState("");

  const [fechaDesde,
    setFechaDesde] =
    useState("");

  const [fechaHasta,
    setFechaHasta] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [rows, setRows] =
    useState([]);

  const [rowsFiltrados,
    setRowsFiltrados] =
    useState([]);

  const [codigoFiltro,
    setCodigoFiltro] =
    useState("");

  const [descripcionFiltro,
    setDescripcionFiltro] =
    useState("");

  const [soloPositivos,
    setSoloPositivos] =
    useState(false);

  const [paginaActual,
    setPaginaActual] =
    useState(1);

  const navigate = useNavigate();

  const registrosPorPagina = 20;

  const cargarInventarios =
    async () => {

      try {


        const data =
          await stockFabricaApi
            .obtenerInventarios();
        // console.log("data", data)

        setInventarios(
          Array.isArray(data)
            ? data
            : []
        );
        if (
          data &&
          data.length > 0
        ) {

          const ultimo =
            data[0];

          setInventarioId(
            ultimo.id
          );

          const fechaInv =
            new Date(
              ultimo.fecha
            );

          fechaInv.setDate(
            fechaInv.getDate() + 1
          );

          setFechaDesde(
            fechaInv
              .toISOString()
              .split("T")[0]
          );

        }

      } catch (error) {

        console.error(
          error
        );

      }

    };


  const cargar = async () => {

    try {

      const data =
        await stockFabricaApi.obtener(
          inventarioId,
          fechaDesde,
          fechaHasta
        );

      console.log("rows", data)

      setRows(data);
      setRowsFiltrados(data);

    } catch (error) {

      console.error(error);

    }

  };

  useEffect(() => {

    let resultado =
      [...rows];

    if (codigoFiltro) {

      resultado =
        resultado.filter(
          x =>
            x.codigobarra
              ?.toLowerCase()
              .includes(
                codigoFiltro.toLowerCase()
              )
        );

    }

    if (descripcionFiltro) {

      resultado =
        resultado.filter(
          x =>
            x.descripcion
              ?.toLowerCase()
              .includes(
                descripcionFiltro.toLowerCase()
              )
        );

    }

    if (soloPositivos) {

      resultado =
        resultado.filter(
          x =>
            Number(x.stock) > 0
        );

    }

    setRowsFiltrados(resultado);

    setPaginaActual(1);

  }, [
    rows,
    codigoFiltro,
    descripcionFiltro,
    soloPositivos
  ]);

  useEffect(() => {

    cargarInventarios();
  }, []);

  const cambiarInventario =
    (id) => {

      setInventarioId(id);

      const inventario =
        inventarios.find(
          x =>
            Number(x.id) ===
            Number(id)
        );

      if (inventario) {

        const fechaInv =
          new Date(
            `${inventario.fecha}T00:00:00`
          );

        fechaInv.setDate(
          fechaInv.getDate() + 1
        );

        setFechaDesde(
          fechaInv
            .toISOString()
            .split("T")[0]
        );

        setFechaHasta(
          new Date()
            .toISOString()
            .split("T")[0]
        );

      }

    };

  const buscar = async () => {

    await cargar();

  };

  const limpiarFiltros = () => {

    setCodigoFiltro("");
    setDescripcionFiltro("");
    setSoloPositivos(false);

  };

  const indiceUltimo =
    paginaActual *
    registrosPorPagina;

  const indicePrimero =
    indiceUltimo -
    registrosPorPagina;

  console.log("slice", rowsFiltrados);

  const registrosPagina =
    rowsFiltrados?.slice(
      indicePrimero,
      indiceUltimo
    ) || [];

  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        rowsFiltrados.length /
        registrosPorPagina
      )
    );

  const totalProduccion =
    rowsFiltrados.reduce(
      (a, b) =>
        a +
        Number(
          b.produccion || 0
        ),
      0
    );

  const totalEntradas =
    rowsFiltrados.reduce(
      (a, b) =>
        a +
        Number(
          b.entradas || 0
        ),
      0
    );

  const totalEgresos =
    rowsFiltrados.reduce(
      (a, b) =>
        a +
        Number(
          b.egresos || 0
        ),
      0
    );

  const totalStock =
    rowsFiltrados.reduce(
      (a, b) =>
        a +
        Number(
          b.stock || 0
        ),
      0
    );

  return (

    <Container fluid>

      <Card>

        <Card.Header>

          <h3>
            Stock de Fábrica
          </h3>

        </Card.Header>

        <Card.Body>

          <Row className="mb-3">

            <Col md={3}>

              <Form.Label>
                Inventario Inicial
              </Form.Label>

              <Form.Select
                className="form-control"
                value={inventarioId}
                onChange={(e) =>
                  cambiarInventario(
                    e.target.value
                  )

                }
              >

                <option value="">
                  Seleccione...
                </option>

                {
                  Array.isArray(inventarios) &&
                  inventarios.map(
                    (inv) => (

                      <option
                        key={inv.id}
                        value={inv.id}
                      >

                        {inv.fecha}

                      </option>

                    )
                  )
                }

              </Form.Select>

            </Col>

            <Col md={2}>

              <Form.Label>
                Fecha Desde
              </Form.Label>

              <Form.Control
                type="date"
                value={fechaDesde}
                onChange={(e) =>
                  setFechaDesde(
                    e.target.value
                  )
                }
              />

            </Col>

            <Col md={2}>

              <Form.Label>
                Fecha Hasta
              </Form.Label>

              <Form.Control
                type="date"
                value={fechaHasta}
                onChange={(e) =>
                  setFechaHasta(
                    e.target.value
                  )
                }
              />

            </Col>

            <Col md={2}>

              <Form.Label>
                Código
              </Form.Label>

              <Form.Control
                placeholder="Código"
                value={codigoFiltro}
                onChange={(e) =>
                  setCodigoFiltro(
                    e.target.value
                  )
                }
              />

            </Col>

            <Col md={3}>

              <Form.Label>
                Descripción
              </Form.Label>

              <Form.Control
                placeholder="Descripción"
                value={descripcionFiltro}
                onChange={(e) =>
                  setDescripcionFiltro(
                    e.target.value
                  )
                }
              />

            </Col>

            <Col md={2}>

              <Form.Label>
                Opciones
              </Form.Label>

              <Form.Check
                label="Solo stock > 0"
                checked={soloPositivos}
                onChange={(e) =>
                  setSoloPositivos(
                    e.target.checked
                  )
                }
              />

            </Col>

            <Col
              md={3}
              className="d-flex align-items-end"
            >

              <Button
                variant="primary"
                onClick={buscar}
              >
                Buscar
              </Button>

              {" "}

              <Button
                variant="secondary"
                className="ms-2"
                onClick={
                  limpiarFiltros
                }
              >
                Limpiar
              </Button>

            </Col>

          </Row>

          <div className="mb-2">

            <strong>

              Registros:
              {" "}
              {rowsFiltrados.length}

            </strong>

          </div>

          <Table
            striped
            bordered
            hover
            responsive
          >

            <thead>

              <tr>

                <th>
                  Código
                </th>

                <th>
                  Descripción
                </th>

                <th>
                  Producción
                </th>

                <th>
                  Entradas
                </th>

                <th>
                  Egresos
                </th>

                <th>
                  Stock
                </th>

                <th>
                  Último Movimiento
                </th>

                {/* <th>
                  Acciones
                </th> */}

                <th>
                  Detalle
                </th>



              </tr>

            </thead>

            <tbody>

              {
                registrosPagina.map(
                  (row) => (

                    <tr
                      key={
                        row.codigobarra
                      }
                    >

                      <td>
                        {
                          row.codigobarra
                        }
                      </td>

                      <td>
                        {
                          row.descripcion
                        }
                      </td>

                      <td>
                        {
                          Number(
                            row.produccion || 0
                          ).toFixed(3)
                        }
                      </td>

                      <td>
                        {
                          Number(
                            row.entradas || 0
                          ).toFixed(3)
                        }
                      </td>

                      <td>
                        {
                          Number(
                            row.egresos || 0
                          ).toFixed(3)
                        }
                      </td>

                      <td>

                        <span
                          style={{
                            fontWeight: "bold",
                            color:
                              Number(
                                row.stock
                              ) > 0
                                ? "green"
                                : "red"
                          }}
                        >

                          {
                            Number(
                              row.stock || 0
                            ).toFixed(3)
                          }

                        </span>

                      </td>

                      <td>
                        {
                          row.ultimoMovimiento || "-"
                        }
                      </td>

                      <td>

                        <Button
                          size="sm"
                          variant="info"
                          className="me-1"
                          onClick={() =>
                            navigate(
                              `/fabrica/stock/detalle/${row.codigobarra}` +
                              `?inventarioId=${inventarioId}` +
                              `&fechaDesde=${fechaDesde}` +
                              `&fechaHasta=${fechaHasta}`
                            )
                          }
                        >
                          Detalle
                        </Button>

                        <Button
                          size="sm"
                          variant="success"
                          onClick={() =>
                            navigate(
                              `/fabrica/transferir?articulo=${row.codigobarra}`
                            )
                          }
                        >
                          Transferir
                        </Button>

                      </td>


                      {/* <td>

                        <Button
                          size="sm"
                          variant="info"
                          onClick={() =>
                            navigate(
                              `/fabrica/stock/detalle/${row.codigobarra}` +
                              `?inventarioId=${inventarioId}` +
                              `&fechaDesde=${fechaDesde}` +
                              `&fechaHasta=${fechaHasta}`
                            )
                          }
                        >
                          Ver
                        </Button>

                      </td> */}



                    </tr>

                  )
                )
              }

            </tbody>

            <tfoot>

              <tr>

                <th></th>

                <th>
                  TOTALES
                </th>

                <th>
                  {
                    totalProduccion.toFixed(
                      3
                    )
                  }
                </th>

                <th>
                  {
                    totalEntradas.toFixed(
                      3
                    )
                  }
                </th>

                <th>
                  {
                    totalEgresos.toFixed(
                      3
                    )
                  }
                </th>

                <th>
                  {
                    totalStock.toFixed(
                      3
                    )
                  }
                </th>

              </tr>

            </tfoot>

          </Table>

          <div className="d-flex justify-content-center mt-3">

            <Button
              variant="outline-primary"
              disabled={
                paginaActual === 1
              }
              onClick={() =>
                setPaginaActual(
                  paginaActual - 1
                )
              }
            >
              Anterior
            </Button>

            <span
              className="mx-3 align-self-center"
            >
              Página
              {" "}
              {paginaActual}
              {" "}
              de
              {" "}
              {totalPaginas}
            </span>

            <Button
              variant="outline-primary"
              disabled={
                paginaActual ===
                totalPaginas
              }
              onClick={() =>
                setPaginaActual(
                  paginaActual + 1
                )
              }
            >
              Siguiente
            </Button>

          </div>

        </Card.Body>

      </Card>

    </Container>

  );

}