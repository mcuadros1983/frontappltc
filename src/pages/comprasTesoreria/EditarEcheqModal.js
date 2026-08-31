import {
  useContext,
  useEffect,
  useMemo,
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

import Contexts from "../../context/Contexts";


const apiUrl =
  process.env.REACT_APP_API_URL;


const N = (value) => {

  const n =
    Number(value);

  return Number.isFinite(n)
    ? n
    : 0;
};


const toMoney = (value) =>
  N(value).toLocaleString(
    "es-AR",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );


// ======================================================
// COMPONENTE
// ======================================================

export default function EditarEcheqModal({
  show,
  onHide,
  row,
  onUpdated,
}) {

  const dataContext =
    useContext(
      Contexts.DataContext
    ) || {};


  const {
    proveedoresTabla = [],
    bancosTabla = [],
    categoriasEgreso = [],
    proyectosTabla = [],
  } =
    dataContext;


  // ======================================================
  // ESTADOS
  // ======================================================

  const [
    echeq,
    setEcheq,
  ] = useState(null);


  const [
    fechaEmision,
    setFechaEmision,
  ] = useState("");


  const [
    fechaVencimiento,
    setFechaVencimiento,
  ] = useState("");


  const [
    numeroEcheq,
    setNumeroEcheq,
  ] = useState("");


  const [
    categoriaId,
    setCategoriaId,
  ] = useState("");


  const [
    proyectoId,
    setProyectoId,
  ] = useState("");


  const [
    proveedorId,
    setProveedorId,
  ] = useState("");


  const [
    importe,
    setImporte,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState(null);


  // ======================================================
  // ID
  // ======================================================

  const echeqId =
    row?.id || null;


  // ======================================================
  // CARGAR ECHEQ COMPLETO
  //
  // No dependemos solamente del objeto normalizado
  // de SitFinanciera.
  // ======================================================

  useEffect(() => {

    if (
      !show ||
      !echeqId
    ) {
      return;
    }


    let cancelado =
      false;


    const cargar =
      async () => {

        try {

          setLoading(true);
          setError(null);
          setEcheq(null);


          const res =
            await fetch(
              `${apiUrl}/echeqs-emitidos/${echeqId}`,
              {
                credentials:
                  "include",
              }
            );


          const json =
            await res
              .json()
              .catch(
                () => ({})
              );


          if (!res.ok) {

            throw new Error(
              json?.error ||
              "No se pudo obtener el eCheq"
            );
          }


          if (cancelado) {
            return;
          }


          setEcheq(
            json
          );


          setFechaEmision(
            json.fecha_emision ||
            ""
          );


          setFechaVencimiento(
            json.fecha_vencimiento ||
            ""
          );


          setNumeroEcheq(
            json.numero_echeq ||
            ""
          );


          setCategoriaId(
            json.categoriaegreso_id
              ? String(
                  json.categoriaegreso_id
                )
              : ""
          );


          setProyectoId(
            json.proyecto_id
              ? String(
                  json.proyecto_id
                )
              : ""
          );


          setProveedorId(
            json.proveedor_id
              ? String(
                  json.proveedor_id
                )
              : ""
          );


          setImporte(
            String(
              N(
                json.importe
              )
            )
          );


        } catch (e) {

          if (!cancelado) {

            setError(
              e.message ||
              "Error cargando eCheq"
            );
          }

        } finally {

          if (!cancelado) {
            setLoading(false);
          }
        }
      };


    cargar();


    return () => {
      cancelado =
        true;
    };

  }, [
    show,
    echeqId,
  ]);


  // ======================================================
  // REGLAS
  // ======================================================

  const tieneComprobante =
    !!echeq?.comprobanteegreso_id;


  const esAnticipo =
    !tieneComprobante &&
    !!echeq?.ordenpago_id;


  const puedeModificarProveedorMonto =
    !!echeq &&
    !tieneComprobante;


  // ======================================================
  // BANCO
  // ======================================================

  const bancoNombre =
    useMemo(() => {

      if (!echeq?.banco_id) {
        return "";
      }


      const banco =
        (bancosTabla || [])
          .find(
            (b) =>
              Number(b.id) ===
              Number(
                echeq.banco_id
              )
          );


      return (
        banco?.descripcion ||
        banco?.nombre ||
        banco?.alias ||
        `Banco ${echeq.banco_id}`
      );

    }, [
      bancosTabla,
      echeq,
    ]);


  // ======================================================
  // VALIDAR
  // ======================================================

  const validar = () => {

    if (!echeq?.id) {
      throw new Error(
        "No se indicó el eCheq"
      );
    }


    if (!fechaEmision) {
      throw new Error(
        "Debe indicar la fecha de emisión"
      );
    }


    if (!fechaVencimiento) {
      throw new Error(
        "Debe indicar la fecha de vencimiento"
      );
    }


    if (
      new Date(
        fechaVencimiento
      ) <
      new Date(
        fechaEmision
      )
    ) {
      throw new Error(
        "La fecha de vencimiento no puede ser anterior a la fecha de emisión"
      );
    }


    if (!categoriaId) {
      throw new Error(
        "Debe seleccionar una categoría de egreso"
      );
    }


    if (
      puedeModificarProveedorMonto &&
      !(N(importe) > 0)
    ) {
      throw new Error(
        "El importe debe ser mayor a cero"
      );
    }


    if (
      esAnticipo &&
      !proveedorId
    ) {
      throw new Error(
        "El anticipo debe tener un proveedor"
      );
    }
  };


  // ======================================================
  // GUARDAR
  // ======================================================

  const guardar =
    async () => {

      try {

        setError(null);

        validar();

        setSaving(true);


        const payload = {

          fecha_emision:
            fechaEmision,

          fecha_vencimiento:
            fechaVencimiento,

          numero_echeq:
            numeroEcheq.trim() ||
            null,

          categoriaegreso_id:
            Number(
              categoriaId
            ),

          proyecto_id:
            proyectoId
              ? Number(
                  proyectoId
                )
              : null,
        };


        // Sólo enviamos proveedor e importe
        // cuando NO existe comprobante.
        if (
          puedeModificarProveedorMonto
        ) {

          payload.proveedor_id =
            proveedorId
              ? Number(
                  proveedorId
                )
              : null;

          payload.importe =
            N(
              importe
            );
        }


        const res =
          await fetch(
            `${apiUrl}/echeqs-emitidos/${echeq.id}`,
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
                JSON.stringify(
                  payload
                ),
            }
          );


        const json =
          await res
            .json()
            .catch(
              () => ({})
            );


        if (!res.ok) {

          throw new Error(
            json?.error ||
            "No se pudo actualizar el eCheq"
          );
        }


        onUpdated?.(
          json
        );


        onHide?.();


      } catch (e) {

        console.error(
          "EditarEcheqModal:",
          e
        );


        setError(
          e.message ||
          "No se pudo actualizar el eCheq"
        );

      } finally {

        setSaving(false);
      }
    };


  // ======================================================
  // CERRAR
  // ======================================================

  const cerrar = () => {

    if (saving) {
      return;
    }

    onHide?.();
  };


  // ======================================================
  // RENDER
  // ======================================================

  return (

    <Modal
      show={show}
      onHide={cerrar}
      centered
      size="lg"
      backdrop={
        saving
          ? "static"
          : true
      }
    >

      <Modal.Header
        closeButton={
          !saving
        }
      >

        <Modal.Title>
          Editar eCheq
        </Modal.Title>

      </Modal.Header>


      <Modal.Body>

        {error && (

          <Alert
            variant="danger"
          >
            {error}
          </Alert>

        )}


        {loading ? (

          <div className="text-center py-4">

            <Spinner
              animation="border"
            />

          </div>

        ) : echeq ? (

          <>

            {tieneComprobante && (

              <Alert
                variant="info"
                className="py-2"
              >
                Este eCheq está asignado a un
                comprobante. El proveedor y el
                importe no pueden modificarse.
              </Alert>

            )}


            {esAnticipo && (

              <Alert
                variant="warning"
                className="py-2"
              >
                Este eCheq corresponde a un anticipo.
                Si modifica el proveedor o el importe,
                también se actualizarán la orden de
                pago y el movimiento de cuenta corriente
                asociado.
              </Alert>

            )}


            <Row className="g-3">

              {/* FECHA EMISIÓN */}

              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Fecha de emisión
                  </Form.Label>

                  <Form.Control
                    type="date"
                    value={
                      fechaEmision
                    }
                    disabled={
                      saving
                    }
                    onChange={(e) =>
                      setFechaEmision(
                        e.target.value
                      )
                    }
                  />

                </Form.Group>

              </Col>


              {/* FECHA VENCIMIENTO */}

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
                    disabled={
                      saving
                    }
                    onChange={(e) =>
                      setFechaVencimiento(
                        e.target.value
                      )
                    }
                  />

                </Form.Group>

              </Col>


              {/* NÚMERO */}

              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Número de eCheq
                  </Form.Label>

                  <Form.Control
                    value={
                      numeroEcheq
                    }
                    disabled={
                      saving
                    }
                    onChange={(e) =>
                      setNumeroEcheq(
                        e.target.value
                      )
                    }
                  />

                </Form.Group>

              </Col>


              {/* BANCO */}

              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Banco
                  </Form.Label>

                  <Form.Control
                    value={
                      bancoNombre
                    }
                    disabled
                  />

                </Form.Group>

              </Col>


              {/* PROVEEDOR */}

              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Proveedor
                  </Form.Label>

                  <Form.Select
                    value={
                      proveedorId
                    }
                    disabled={
                      saving ||
                      !puedeModificarProveedorMonto
                    }
                    onChange={(e) =>
                      setProveedorId(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Sin proveedor
                    </option>

                    {(proveedoresTabla || []).map(
                      (p) => (

                        <option
                          key={p.id}
                          value={p.id}
                        >
                          {
                            p.razonsocial ||
                            p.nombre ||
                            p.descripcion ||
                            `Proveedor ${p.id}`
                          }
                        </option>

                      )
                    )}

                  </Form.Select>

                </Form.Group>

              </Col>


              {/* IMPORTE */}

              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Importe
                  </Form.Label>

                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      importe
                    }
                    disabled={
                      saving ||
                      !puedeModificarProveedorMonto
                    }
                    onChange={(e) =>
                      setImporte(
                        e.target.value
                      )
                    }
                  />

                  {!puedeModificarProveedorMonto && (

                    <Form.Text muted>
                      Importe actual: $
                      {toMoney(
                        echeq.importe
                      )}
                    </Form.Text>

                  )}

                </Form.Group>

              </Col>


              {/* CATEGORÍA */}

              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Categoría de egreso
                  </Form.Label>

                  <Form.Select
                    value={
                      categoriaId
                    }
                    disabled={
                      saving
                    }
                    onChange={(e) =>
                      setCategoriaId(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Seleccionar...
                    </option>

                    {(categoriasEgreso || []).map(
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


              {/* PROYECTO */}

              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Proyecto
                  </Form.Label>

                  <Form.Select
                    value={
                      proyectoId
                    }
                    disabled={
                      saving
                    }
                    onChange={(e) =>
                      setProyectoId(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Sin proyecto
                    </option>

                    {(proyectosTabla || []).map(
                      (p) => (

                        <option
                          key={p.id}
                          value={p.id}
                        >
                          {
                            p.nombre ||
                            p.descripcion ||
                            `Proyecto ${p.id}`
                          }
                        </option>

                      )
                    )}

                  </Form.Select>

                </Form.Group>

              </Col>

            </Row>

          </>

        ) : (

          <Alert
            variant="warning"
          >
            No se pudo cargar el eCheq.
          </Alert>

        )}

      </Modal.Body>


      <Modal.Footer>

        <Button
          variant="secondary"
          disabled={
            saving
          }
          onClick={
            cerrar
          }
        >
          Cancelar
        </Button>


        <Button
          variant="primary"
          disabled={
            saving ||
            loading ||
            !echeq
          }
          onClick={
            guardar
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

            "Guardar cambios"

          )}

        </Button>

      </Modal.Footer>

    </Modal>
  );
}