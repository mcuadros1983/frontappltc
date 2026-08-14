import React, {
  useEffect,
  useState,
} from "react";

import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Accordion,
  Badge,
  Spinner,
} from "react-bootstrap";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  inspeccionPlantillaApi,
} from "../../services/inspeccionPlantillaApi";

import ModalCategoriaForm from "./modalCategoriaForm";
import ModalItemForm from "./modalItemForm";

const PlantillaForm = () => {
  const navigate =
    useNavigate();

  const { id } =
    useParams();

  const editing =
    Boolean(id);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    plantilla,
    setPlantilla,
  ] = useState({
    nombre: "",
    descripcion: "",
    version: 1,
    activo: true,
  });

  const [
    categorias,
    setCategorias,
  ] = useState([]);

  const [showCategoriaModal, setShowCategoriaModal] =
    useState(false);

  const [showItemModal, setShowItemModal] =
    useState(false);

  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState(null);

  const [itemSeleccionado, setItemSeleccionado] =
    useState(null);

  const [categoriaActual, setCategoriaActual] =
    useState(null);

  useEffect(() => {
    if (editing) {
      cargar();
    }
  }, [id]);

  const cargar =
    async () => {
      try {
        setLoading(true);

        const data =
          await inspeccionPlantillaApi.obtenerCompleta(
            id
          );

        setPlantilla({
          nombre:
            data.nombre ||
            "",

          descripcion:
            data.descripcion ||
            "",

          version:
            data.version ||
            1,

          activo:
            data.activo,
        });

        setCategorias(
          data.categorias ||
          []
        );
      } catch (error) {
        console.error(
          error
        );
      } finally {
        setLoading(false);
      }
    };

  const guardarPlantilla =
    async () => {
      try {
        if (
          !plantilla.nombre
        ) {
          alert(
            "Debe ingresar un nombre"
          );
          return;
        }

        if (
          editing
        ) {
          await inspeccionPlantillaApi.actualizar(
            id,
            plantilla
          );
        } else {
          const nueva =
            await inspeccionPlantillaApi.crear(
              plantilla
            );

          navigate(
            `/inspecciones/plantillas/${nueva.id}`
          );
        }

        alert(
          "Plantilla guardada"
        );
      } catch (error) {
        console.error(
          error
        );
      }
    };

  const nuevaCategoria = () => {
    setCategoriaSeleccionada(null);
    setShowCategoriaModal(true);
  };

  const editarCategoria = (categoria) => {
    setCategoriaSeleccionada(categoria);
    setShowCategoriaModal(true);
  };

  const desactivarCategoria =
    async (
      categoria
    ) => {
      if (
        !window.confirm(
          "¿Desactivar categoría?"
        )
      )
        return;

      try {
        await inspeccionPlantillaApi.desactivarCategoria(
          categoria.id
        );

        cargar();
      } catch (error) {
        console.error(
          error
        );
      }
    };

  const nuevoItem = (
    categoria
  ) => {
    setCategoriaActual(
      categoria
    );

    setItemSeleccionado(
      null
    );

    setShowItemModal(
      true
    );
  };

  const editarItem = (
    item,
    categoria
  ) => {
    setCategoriaActual(
      categoria
    );

    setItemSeleccionado(
      item
    );

    setShowItemModal(
      true
    );
  };

  const desactivarItem =
    async (item) => {
      if (
        !window.confirm(
          "¿Desactivar item?"
        )
      )
        return;

      try {
        await inspeccionPlantillaApi.desactivarItem(
          item.id
        );

        cargar();
      } catch (error) {
        console.error(
          error
        );
      }
    };

  const actualizarCampoItem =
    async (
      item,
      campo,
      valor
    ) => {
      try {
        await inspeccionPlantillaApi.actualizarItem(
          item.id,
          {
            [campo]:
              valor,
          }
        );

        cargar();
      } catch (error) {
        console.error(
          error
        );
      }
    };

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

  const guardarCategoria =
    async (data) => {
      try {
        if (
          categoriaSeleccionada
        ) {
          await inspeccionPlantillaApi.actualizarCategoria(
            categoriaSeleccionada.id,
            data
          );
        } else {
          await inspeccionPlantillaApi.crearCategoria(
            {
              ...data,
              plantilla_id:
                id,
            }
          );
        }

        setShowCategoriaModal(
          false
        );

        cargar();
      } catch (error) {
        console.error(
          error
        );
      }
    };

  const guardarItem =
    async (data) => {
      try {
        if (
          itemSeleccionado
        ) {
          await inspeccionPlantillaApi.actualizarItem(
            itemSeleccionado.id,
            data
          );
        } else {
          await inspeccionPlantillaApi.crearItem(
            {
              ...data,
              categoria_id:
                categoriaActual.id,
            }
          );
        }

        setShowItemModal(
          false
        );

        cargar();
      } catch (error) {
        console.error(
          error
        );
      }
    };


  return (
    <Container
      fluid
      className="mt-3"
    >
      <Row>
        <Col>
          <Card className="mb-3">
            <Card.Header>
              <strong>
                {editing
                  ? "Editar Plantilla"
                  : "Nueva Plantilla"}
              </strong>
            </Card.Header>

            <Card.Body>
              <Row>
                <Col
                  xs={12}
                  md={6}
                  className="mb-3"
                >
                  <Form.Label>
                    Nombre
                  </Form.Label>

                  <Form.Control
                    value={
                      plantilla.nombre
                    }
                    onChange={(
                      e
                    ) =>
                      setPlantilla(
                        {
                          ...plantilla,
                          nombre:
                            e
                              .target
                              .value,
                        }
                      )
                    }
                  />
                </Col>

                <Col
                  xs={12}
                  md={3}
                >
                  <Form.Label>
                    Versión
                  </Form.Label>

                  <Form.Control
                    type="number"
                    value={
                      plantilla.version
                    }
                    onChange={(
                      e
                    ) =>
                      setPlantilla(
                        {
                          ...plantilla,
                          version:
                            Number(
                              e
                                .target
                                .value
                            ),
                        }
                      )
                    }
                  />
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>
                  Descripción
                </Form.Label>

                <Form.Control
                  as="textarea"
                  rows={3}
                  value={
                    plantilla.descripcion
                  }
                  onChange={(
                    e
                  ) =>
                    setPlantilla(
                      {
                        ...plantilla,
                        descripcion:
                          e
                            .target
                            .value,
                      }
                    )
                  }
                />
              </Form.Group>

              <div className="d-flex gap-2">
                <Button
                  onClick={
                    guardarPlantilla
                  }
                >
                  Guardar
                </Button>

                <Button
                  variant="secondary"
                  onClick={() =>
                    navigate(
                      "/inspecciones/plantillas"
                    )
                  }
                >
                  Volver
                </Button>
              </div>
            </Card.Body>
          </Card>

          {editing && (
            <Card>
              <Card.Header className="d-flex justify-content-between">
                <strong>
                  Categorías e
                  Ítems
                </strong>

                <Button
                  size="sm"
                  onClick={
                    nuevaCategoria
                  }
                >
                  +
                  Categoría
                </Button>
              </Card.Header>

              <Card.Body>
                <Accordion>
                  {categorias.map(
                    (
                      categoria,
                      index
                    ) => (
                      <Accordion.Item
                        eventKey={String(
                          index
                        )}
                        key={
                          categoria.id
                        }
                      >
                        <Accordion.Header>
                          {
                            categoria.nombre
                          }
                        </Accordion.Header>

                        <Accordion.Body>
                          <div className="mb-3 d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() =>
                                editarCategoria(
                                  categoria
                                )
                              }
                            >
                              Editar
                            </Button>

                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() =>
                                desactivarCategoria(
                                  categoria
                                )
                              }
                            >
                              Desactivar
                            </Button>

                            <Button
                              size="sm"
                              onClick={() =>
                                nuevoItem(
                                  categoria
                                )
                              }
                            >
                              +
                              Item
                            </Button>
                          </div>

                          {categoria.items?.map(
                            (
                              item
                            ) => (
                              <Card
                                key={
                                  item.id
                                }
                                className="mb-3"
                              >
                                <Card.Body>
                                  <div className="d-flex justify-content-between">
                                    <strong>
                                      {
                                        item.descripcion
                                      }
                                    </strong>

                                    <Badge bg="secondary">
                                      {
                                        item.criticidad
                                      }
                                    </Badge>
                                  </div>

                                  <Row className="mt-3">
                                    <Col
                                      md={
                                        2
                                      }
                                    >
                                      <Form.Label>
                                        Peso
                                      </Form.Label>

                                      <Form.Control
                                        type="number"
                                        value={
                                          item.peso
                                        }
                                        onChange={(
                                          e
                                        ) =>
                                          actualizarCampoItem(
                                            item,
                                            "peso",
                                            Number(
                                              e
                                                .target
                                                .value
                                            )
                                          )
                                        }
                                      />
                                    </Col>

                                    <Col
                                      md={
                                        3
                                      }
                                    >
                                      <Form.Label>
                                        Criticidad
                                      </Form.Label>

                                      <Form.Select
                                        className="form-control my-input"
                                        value={
                                          item.criticidad
                                        }
                                        onChange={(
                                          e
                                        ) =>
                                          actualizarCampoItem(
                                            item,
                                            "criticidad",
                                            e
                                              .target
                                              .value
                                          )
                                        }
                                      >
                                        <option value="BAJA">
                                          BAJA
                                        </option>

                                        <option value="MEDIA">
                                          MEDIA
                                        </option>

                                        <option value="ALTA">
                                          ALTA
                                        </option>

                                        <option value="CRITICA">
                                          CRITICA
                                        </option>
                                      </Form.Select>
                                    </Col>
                                  </Row>

                                  <div className="mt-3">
                                    <Form.Check
                                      label="Requiere comentario"
                                      checked={
                                        item.requiere_comentario
                                      }
                                      onChange={(
                                        e
                                      ) =>
                                        actualizarCampoItem(
                                          item,
                                          "requiere_comentario",
                                          e
                                            .target
                                            .checked
                                        )
                                      }
                                    />

                                    <Form.Check
                                      label="Requiere foto"
                                      checked={
                                        item.requiere_foto_default
                                      }
                                      onChange={(
                                        e
                                      ) =>
                                        actualizarCampoItem(
                                          item,
                                          "requiere_foto_default",
                                          e
                                            .target
                                            .checked
                                        )
                                      }
                                    />
                                  </div>

                                  <div className="mt-3 d-flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline-primary"
                                      onClick={() =>
                                        editarItem(
                                          item,
                                          categoria
                                        )
                                      }
                                    >
                                      Editar
                                    </Button>

                                    <Button
                                      size="sm"
                                      variant="outline-danger"
                                      onClick={() =>
                                        desactivarItem(
                                          item
                                        )
                                      }
                                    >
                                      Desactivar
                                    </Button>
                                  </div>
                                </Card.Body>
                              </Card>
                            )
                          )}
                        </Accordion.Body>
                      </Accordion.Item>
                    )
                  )}
                </Accordion>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      <ModalCategoriaForm
        show={
          showCategoriaModal
        }
        onHide={() =>
          setShowCategoriaModal(
            false
          )
        }
        onSave={
          guardarCategoria
        }
        categoria={
          categoriaSeleccionada
        }
      />

      <ModalItemForm
        show={
          showItemModal
        }
        onHide={() =>
          setShowItemModal(
            false
          )
        }
        onSave={
          guardarItem
        }
        item={
          itemSeleccionado
        }
      />

    </Container>
  );
};

export default PlantillaForm;