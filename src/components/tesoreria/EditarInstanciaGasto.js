import {
  useEffect,
  useState,
} from "react";

import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Spinner,
} from "react-bootstrap";


const apiUrl =
  process.env.REACT_APP_API_URL;


// ======================================================
// CAMBIAR MES CONSERVANDO DÍA
// ======================================================

const fechaParaPeriodo = (
  periodo,
  fechaActual
) => {

  if (!periodo) {
    return fechaActual || "";
  }


  let dia = 1;

  if (fechaActual) {
    dia =
      Number(
        String(fechaActual)
          .slice(8, 10)
      ) || 1;
  }


  const [
    anio,
    mes,
  ] =
    periodo
      .split("-")
      .map(Number);


  const ultimoDia =
    new Date(
      anio,
      mes,
      0
    ).getDate();


  const diaFinal =
    Math.min(
      dia,
      ultimoDia
    );


  return (
    `${periodo}-${String(diaFinal).padStart(2, "0")}`
  );
};


// ======================================================
// COMPONENTE
// ======================================================

export default function EditarInstanciaGasto({
  show,
  onHide,
  onUpdated,
  instancia,
  proveedores = [],
  categorias = [],
}) {

  const esImportado =
    String(
      instancia?.created_from || ""
    )
      .trim()
      .toLowerCase() === "importado";

  const [
    periodo,
    setPeriodo,
  ] = useState("");


  const [
    fechaVencimiento,
    setFechaVencimiento,
  ] = useState("");


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState(null);

  const [
    descripcion,
    setDescripcion,
  ] = useState("");


  const [
    proveedorId,
    setProveedorId,
  ] = useState("");


  const [
    categoriaId,
    setCategoriaId,
  ] = useState("");


  const [
    montoEstimado,
    setMontoEstimado,
  ] = useState("");
  // ====================================================
  // PRECARGAR
  // ====================================================

  useEffect(
    () => {

      if (
        !show ||
        !instancia
      ) {
        return;
      }


      setError(null);

      setSaving(false);


      setPeriodo(
        instancia.periodo ||
        String(
          instancia.fecha_vencimiento ||
          ""
        ).slice(0, 7)
      );


      setFechaVencimiento(
        instancia.fecha_vencimiento ||
        ""
      );

      setDescripcion(
        instancia.descripcion ||
        ""
      );


      setProveedorId(
        instancia.proveedor_id
          ? String(
            instancia.proveedor_id
          )
          : ""
      );


      setCategoriaId(
        instancia.categoriaegreso_id
          ? String(
            instancia.categoriaegreso_id
          )
          : ""
      );


      setMontoEstimado(
        instancia.monto_estimado ??
        instancia.monto_base ??
        ""
      );

    },
    [
      show,
      instancia,
    ]
  );


  // ====================================================
  // CAMBIO DE PERÍODO
  // ====================================================

  const handlePeriodoChange = (
    nuevoPeriodo
  ) => {

    setPeriodo(
      nuevoPeriodo
    );


    setFechaVencimiento(
      fechaParaPeriodo(
        nuevoPeriodo,
        fechaVencimiento
      )
    );
  };


  // ====================================================
  // GUARDAR
  // ====================================================

  const handleGuardar =
    async () => {

      try {

        setError(null);


        if (!instancia?.id) {
          throw new Error(
            "No se indicó la instancia"
          );
        }


        if (!periodo) {
          throw new Error(
            "Debe indicar el período"
          );
        }


        if (!fechaVencimiento) {
          throw new Error(
            "Debe indicar la fecha de vencimiento"
          );
        }


        setSaving(true);

        const body =
          esImportado
            ? {
              periodo,

              fecha_vencimiento:
                fechaVencimiento,

              descripcion:
                descripcion.trim(),

              proveedor_id:
                proveedorId
                  ? Number(proveedorId)
                  : null,

              categoriaegreso_id:
                categoriaId
                  ? Number(categoriaId)
                  : null,

              monto_estimado:
                Number(montoEstimado),
            }
            : {
              periodo,

              fecha_vencimiento:
                fechaVencimiento,
            };

        const response =
          await fetch(
            `${apiUrl}/gasto-estimado/instancias/${instancia.id}`,
            {
              method:
                "PUT",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(body),
            }
          );


        const json =
          await response
            .json()
            .catch(
              () => ({})
            );


        if (!response.ok) {

          throw new Error(
            json?.error ||
            "No se pudo actualizar la instancia"
          );
        }


        if (onUpdated) {

          await onUpdated(
            json
          );
        }


      } catch (e) {

        console.error(
          "EditarInstanciaGasto:",
          e
        );


        setError(
          e.message ||
          "No se pudo actualizar la instancia"
        );

      } finally {

        setSaving(false);
      }
    };


  return (

    <Modal
      show={show}
      onHide={
        saving
          ? undefined
          : onHide
      }
      centered
    >

      <Modal.Header
        closeButton={!saving}
      >

        <Modal.Title>
          Editar instancia
        </Modal.Title>

      </Modal.Header>


      <Modal.Body>

        {error && (

          <Alert variant="danger">
            {error}
          </Alert>

        )}


        {instancia && (

          <>

            <Form.Group className="mb-3">

              <Form.Label>
                Concepto
              </Form.Label>

              <Form.Control
                value={
                  esImportado
                    ? descripcion
                    : instancia.descripcion || ""
                }
                disabled={
                  saving ||
                  !esImportado
                }
                onChange={(e) =>
                  setDescripcion(
                    e.target.value
                  )
                }
              />

            </Form.Group>


            <Form.Group className="mb-3">

              <Form.Label>
                Proveedor
              </Form.Label>


              {esImportado ? (

                <Form.Select
                  value={proveedorId}
                  disabled={saving}
                  onChange={(e) =>
                    setProveedorId(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Sin proveedor
                  </option>


                  {(proveedores || []).map(
                    (p) => (

                      <option
                        key={p.id}
                        value={p.id}
                      >
                        {
                          p.nombre ||
                          p.razonsocial ||
                          p.descripcion ||
                          `Proveedor ${p.id}`
                        }
                      </option>

                    )
                  )}

                </Form.Select>

              ) : (

                <Form.Control
                  value={
                    instancia.proveedor_nombre ||
                    ""
                  }
                  disabled
                />

              )}

            </Form.Group>

            {esImportado && (

              <Row className="g-3 mb-3">

                <Col md={6}>

                  <Form.Group>

                    <Form.Label>
                      Categoría
                    </Form.Label>

                    <Form.Select
                      value={categoriaId}
                      disabled={saving}
                      onChange={(e) =>
                        setCategoriaId(
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        Sin categoría
                      </option>


                      {(categorias || []).map(
                        (c) => (

                          <option
                            key={c.id}
                            value={c.id}
                          >
                            {
                              c.nombre ||
                              c.descripcion ||
                              `Categoría ${c.id}`
                            }
                          </option>

                        )
                      )}

                    </Form.Select>

                  </Form.Group>

                </Col>


                <Col md={6}>

                  <Form.Group>

                    <Form.Label>
                      Monto
                    </Form.Label>

                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      value={
                        montoEstimado
                      }
                      disabled={
                        saving
                      }
                      onChange={(e) =>
                        setMontoEstimado(
                          e.target.value
                        )
                      }
                    />

                  </Form.Group>

                </Col>

              </Row>

            )}

            {esImportado && (

              <Alert
                variant="info"
                className="mb-3"
              >
                Este gasto fue importado.
                Los cambios realizados aquí
                afectarán únicamente a esta
                instancia y no a otros gastos
                importados de su clase.
              </Alert>

            )}

            <Row className="g-3">

              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Período
                  </Form.Label>

                  <Form.Control
                    type="month"
                    value={periodo}
                    disabled={saving}
                    onChange={(e) =>
                      handlePeriodoChange(
                        e.target.value
                      )
                    }
                  />

                  <Form.Text muted>
                    Mes al que corresponde
                    este gasto.
                  </Form.Text>

                </Form.Group>

              </Col>


              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Fecha de vencimiento
                  </Form.Label>

                  <Form.Control
                    type="date"
                    value={
                      fechaVencimiento
                    }
                    disabled={saving}
                    onChange={(e) =>
                      setFechaVencimiento(
                        e.target.value
                      )
                    }
                  />

                </Form.Group>

              </Col>

            </Row>


            <Alert
              variant="light"
              className="mt-3 mb-0"
            >

              Al cambiar el período,
              se conserva automáticamente
              el día de vencimiento siempre
              que exista en el nuevo mes.

            </Alert>

          </>

        )}

      </Modal.Body>


      <Modal.Footer>

        <Button
          variant="secondary"
          disabled={saving}
          onClick={onHide}
        >
          Cancelar
        </Button>


        <Button
          variant="primary"
          disabled={
            saving ||
            !instancia
          }
          onClick={
            handleGuardar
          }
        >

          {saving ? (

            <>
              <Spinner
                size="sm"
                animation="border"
                className="me-2"
              />

              Guardando...
            </>

          ) : (

            "Guardar"

          )}

        </Button>

      </Modal.Footer>

    </Modal>
  );
}