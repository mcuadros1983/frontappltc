import React, {
  useEffect,
  useState,
  useContext,
} from "react";

import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";

import {
  useNavigate,
} from "react-router-dom";

import Contexts from "../../context/Contexts";

import {
  inspeccionesApi,
} from "../../services/inspeccionesApi";

import {
  sucursalesApi,
} from "../../services/sucursalesApi";


const InspeccionForm = () => {
  const navigate =
    useNavigate();


  const userContext = useContext(
    Contexts.UserContext
  );

  const user =
    userContext?.user ||
    userContext ||
    {};



  const [
    sucursales,
    setSucursales,
  ] = useState([]);

  const [
    plantillas,
    setPlantillas,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    form,
    setForm,
  ] = useState({
    sucursal_id: "",
    plantilla_id: "",
    fecha_inspeccion:
      new Date()
        .toISOString()
        .split("T")[0],

    observacion_general: "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos =
    async () => {
      try {
        setCargando(true);

        const [
          sucursalesResponse,
          plantillasResponse,
        ] =
          await Promise.all([
            sucursalesApi.list(),
            inspeccionesApi.listarPlantillas(),
          ]);

        const sucursalesData =
          Array.isArray(sucursalesResponse)
            ? sucursalesResponse
            : [];

        setSucursales(
          Array.isArray(
            sucursalesData
          )
            ? sucursalesData
            : []
        );

        setPlantillas(
          Array.isArray(
            plantillasResponse
          )
            ? plantillasResponse
            : []
        );

        if (
          user?.sucursal_id
        ) {
          setForm(
            (prev) => ({
              ...prev,
              sucursal_id:
                user.sucursal_id,
            })
          );
        }
      } catch (err) {
        console.error(err);

        setError(
          "Error cargando datos."
        );
      } finally {
        setCargando(false);
      }
    };

  const handleChange =
    (e) => {
      const {
        name,
        value,
      } = e.target;

      setForm({
        ...form,
        [name]: value,
      });
    };

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      try {
        setLoading(true);
        setError("");

        const nueva =
          await inspeccionesApi.crear(
            form
          );

        navigate(
          `/inspecciones/${nueva.inspeccion_id}`
        );
      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data
            ?.message ||
          err.message ||
          "Error creando inspección."
        );
      } finally {
        setLoading(false);
      }
    };

  if (cargando) {
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
      <Row className="justify-content-center">
        <Col
          xs={12}
          lg={8}
        >
          <Card className="rpm-card">
            <Card.Header className="rpm-header">
              <strong>
                Nueva Inspección
              </strong>
            </Card.Header>

            <Card.Body>
              {error && (
                <Alert variant="danger">
                  {error}
                </Alert>
              )}

              <Form
                onSubmit={
                  handleSubmit
                }
              >
                <Row>
                  <Col
                    xs={12}
                    md={6}
                    className="mb-3"
                  >
                    <Form.Label>
                      Sucursal
                    </Form.Label>

                    <Form.Select
                      className="form-control my-input"
                      name="sucursal_id"
                      value={
                        form.sucursal_id
                      }
                      onChange={
                        handleChange
                      }
                      required
                      disabled={
                        !!user?.sucursal_id
                      }
                    >
                      <option value="">
                        Seleccione una sucursal
                      </option>

                      {sucursales.map(
                        (
                          sucursal
                        ) => (
                          <option
                            key={
                              sucursal.id
                            }
                            value={
                              sucursal.id
                            }
                          >
                            {
                              sucursal.nombre
                            }
                          </option>
                        )
                      )}
                    </Form.Select>
                  </Col>

                  <Col
                    xs={12}
                    md={6}
                    className="mb-3"
                  >
                    <Form.Label>
                      Plantilla
                    </Form.Label>

                    <Form.Select className="form-control my-input"
                      name="plantilla_id"
                      value={
                        form.plantilla_id
                      }
                      onChange={
                        handleChange
                      }
                      required
                    >
                      <option value="">
                        Seleccione una plantilla
                      </option>

                      {plantillas.map(
                        (
                          plantilla
                        ) => (
                          <option
                            key={
                              plantilla.id
                            }
                            value={
                              plantilla.id
                            }
                          >
                            {
                              plantilla.nombre
                            }
                            {" "}
                            (v
                            {
                              plantilla.version
                            }
                            )
                          </option>
                        )
                      )}
                    </Form.Select>
                  </Col>

                  <Col
                    xs={12}
                    md={6}
                    className="mb-3"
                  >
                    <Form.Label>
                      Fecha de Inspección
                    </Form.Label>

                    <Form.Control
                      type="date"
                      name="fecha_inspeccion"
                      value={
                        form.fecha_inspeccion
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </Col>

                  <Col
                    xs={12}
                    className="mb-3"
                  >
                    <Form.Label>
                      Observación General
                    </Form.Label>

                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="observacion_general"
                      value={
                        form.observacion_general
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Observaciones generales de la inspección..."
                    />
                  </Col>
                </Row>

                <div className="d-flex flex-column flex-md-row gap-2 justify-content-end">
                  <Button
                    variant="outline-secondary"
                    onClick={() =>
                      navigate(
                        "/inspecciones"
                      )
                    }
                  >
                    Cancelar
                  </Button>

                  <Button
                    variant="primary"
                    type="submit"
                    disabled={
                      loading
                    }
                  >
                    {loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Guardando...
                      </>
                    ) : (
                      "Crear Inspección"
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default InspeccionForm;