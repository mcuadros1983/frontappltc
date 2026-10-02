import {
  useContext,
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
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );


// ======================================================
// COMPONENTE
// ======================================================

export default function AcreditarEcheqModal({
  show,
  onHide,
  row,
  onAcreditar,
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
    fechaAcreditacion,
    setFechaAcreditacion,
  ] = useState("");


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
    bancoId,
    setBancoId,
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


          setFechaAcreditacion(
            new Date()
              .toISOString()
              .slice(0, 10)
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


          setBancoId(
            json.banco_id
              ? String(
                  json.banco_id
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
  // VALIDAR
  // ======================================================

  const validar = () => {

    if (!echeq?.id) {

      throw new Error(
        "No se indicó el eCheq"
      );

    }


    if (!fechaAcreditacion) {

      throw new Error(
        "Debe indicar la fecha de acreditación"
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


    if (!bancoId) {

      throw new Error(
        "Debe seleccionar un banco"
      );

    }


    if (!categoriaId) {

      throw new Error(
        "Debe seleccionar una categoría de egreso"
      );

    }

  };


  // ======================================================
  // ACREDITAR
  // ======================================================

  const acreditar =
    async () => {

      try {

        setError(null);


        validar();


        setSaving(true);


        // ==================================================
        // 1. ACTUALIZAR DATOS EDITABLES DEL ECHEQ
        //
        // IMPORTANTE:
        // NO enviamos proveedor_id.
        // NO enviamos importe.
        // ==================================================

        const payload = {

          fecha_emision:
            fechaEmision,

          fecha_vencimiento:
            fechaVencimiento,

          numero_echeq:
            numeroEcheq.trim() ||
            null,

          banco_id:
            Number(
              bancoId
            ),

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


        // ==================================================
        // 2. ACREDITAR ECHEQ
        //
        // La acreditación real sigue siendo realizada
        // por SitFinanciera mediante acreditarEcheqApi.
        // ==================================================

        if (
          typeof onAcreditar !==
          "function"
        ) {

          throw new Error(
            "No se configuró la función de acreditación"
          );

        }


        await onAcreditar(
          echeq.id,
          {
            fecha_acreditacion:
              fechaAcreditacion,
          }
        );


        onHide?.();


      } catch (e) {

        console.error(
          "AcreditarEcheqModal:",
          e
        );


        setError(
          e.message ||
          "No se pudo acreditar el eCheq"
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
          Acreditar eCheq
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

            <Alert
              variant="info"
              className="py-2"
            >
              Puede modificar los datos del eCheq
              antes de acreditarlo. El proveedor y
              el importe no pueden modificarse.
            </Alert>


            <Row className="g-3">


              {/* FECHA ACREDITACIÓN */}

              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Fecha de acreditación
                  </Form.Label>

                  <Form.Control
                    type="date"
                    value={
                      fechaAcreditacion
                    }
                    disabled={
                      saving
                    }
                    onChange={(e) =>
                      setFechaAcreditacion(
                        e.target.value
                      )
                    }
                  />

                </Form.Group>

              </Col>


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
                    Número de eCheq / Descripción
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

                  <Form.Select
                    value={
                      bancoId
                    }
                    disabled={
                      saving
                    }
                    onChange={(e) =>
                      setBancoId(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Seleccionar...
                    </option>


                    {(bancosTabla || []).map(
                      (b) => (

                        <option
                          key={
                            b.id
                          }
                          value={
                            b.id
                          }
                        >
                          {
                            b.nombre ||
                            b.descripcion ||
                            b.alias ||
                            `Banco ${b.id}`
                          }
                        </option>

                      )
                    )}

                  </Form.Select>

                </Form.Group>

              </Col>


              {/* PROVEEDOR - SOLO LECTURA */}

              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Proveedor
                  </Form.Label>

                  <Form.Select
                    value={
                      proveedorId
                    }
                    disabled
                  >

                    <option value="">
                      Sin proveedor
                    </option>


                    {(proveedoresTabla || []).map(
                      (p) => (

                        <option
                          key={
                            p.id
                          }
                          value={
                            p.id
                          }
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


                  <Form.Text muted>
                    El proveedor no puede modificarse
                    durante la acreditación.
                  </Form.Text>

                </Form.Group>

              </Col>


              {/* IMPORTE - SOLO LECTURA */}

              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Importe
                  </Form.Label>

                  <Form.Control
                    type="number"
                    value={
                      importe
                    }
                    disabled
                  />


                  <Form.Text muted>
                    Importe del eCheq:{" "}
                    <strong>
                      {toMoney(
                        echeq.importe
                      )}
                    </strong>
                  </Form.Text>

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
                          key={
                            c.id
                          }
                          value={
                            c.id
                          }
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
                          key={
                            p.id
                          }
                          value={
                            p.id
                          }
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
          variant="success"
          disabled={
            saving ||
            loading ||
            !echeq
          }
          onClick={
            acreditar
          }
        >

          {saving ? (

            <>

              <Spinner
                size="sm"
                animation="border"
                className="me-2"
              />

              Acreditando...

            </>

          ) : (

            "Acreditar eCheq"

          )}

        </Button>

      </Modal.Footer>

    </Modal>

  );

}