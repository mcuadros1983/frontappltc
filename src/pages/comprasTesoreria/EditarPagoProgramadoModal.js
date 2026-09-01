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


// ======================================================
// HELPERS
// ======================================================

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

export default function EditarPagoProgramadoModal({
    show,
    onHide,
    row,
    onConfirm,
}) {

    const dataContext =
        useContext(
            Contexts.DataContext
        );


    const {
        empresaSeleccionada,
        cajaAbierta,
        bancosTabla = [],
        formasPagoTesoreria = [],
        proyectosTabla = [],
        categoriasEgreso = [],
    } =
        dataContext || {};


    // ======================================================
    // ESTADOS
    // ======================================================

    const [
        fechaProgramada,
        setFechaProgramada,
    ] = useState("");


    const [
        medio,
        setMedio,
    ] = useState("caja");


    // const [
    //     formaPagoId,
    //     setFormaPagoId,
    // ] = useState("");


    const [
        bancoId,
        setBancoId,
    ] = useState("");


    const [
        monto,
        setMonto,
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
        descripcion,
        setDescripcion,
    ] = useState("");


    const [
        observaciones,
        setObservaciones,
    ] = useState("");


    const [
        saving,
        setSaving,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState(null);


    // ======================================================
    // DATOS DERIVADOS
    // ======================================================

    const empresaId =
        row?.empresa_id ||
        empresaSeleccionada?.id ||
        null;


    const esAnticipo =
        row?.pago_programado_tipo ===
        "anticipo";

    // ======================================================
    // FORMAS DE PAGO SEGÚN MEDIO
    // ======================================================

    const formaPagoEfectivo =
        useMemo(
            () =>
                (formasPagoTesoreria || []).find(
                    (fp) => {

                        const texto =
                            String(
                                fp.descripcion ||
                                fp.nombre ||
                                ""
                            )
                                .trim()
                                .toLowerCase();

                        return (
                            texto.includes("efectivo") ||
                            texto.includes("caja")
                        );
                    }
                ) || null,
            [
                formasPagoTesoreria,
            ]
        );


    const formaPagoTransferencia =
        useMemo(
            () =>
                (formasPagoTesoreria || []).find(
                    (fp) => {

                        const texto =
                            String(
                                fp.descripcion ||
                                fp.nombre ||
                                ""
                            )
                                .trim()
                                .toLowerCase();

                        return (
                            texto.includes("transferencia") ||
                            texto.includes("banco")
                        );
                    }
                ) || null,
            [
                formasPagoTesoreria,
            ]
        );


    const formaPagoSeleccionada =
        medio === "caja"
            ? formaPagoEfectivo
            : formaPagoTransferencia;

    // ======================================================
    // BANCOS EMPRESA
    // ======================================================

    // const bancosEmpresa =
    //     useMemo(
    //         () =>
    //             (bancosTabla || []).filter(
    //                 (b) =>
    //                     !empresaId ||
    //                     Number(b.empresa_id) ===
    //                     Number(empresaId)
    //             ),
    //         [
    //             bancosTabla,
    //             empresaId,
    //         ]
    //     );

    const bancosDisponibles =
        useMemo(() => {

            return bancosTabla || [];

        }, [
            bancosTabla,
        ]);


    // ======================================================
    // PRECARGAR PAGO PROGRAMADO
    // ======================================================

    useEffect(
        () => {

            if (
                !show ||
                !row
            ) {
                return;
            }


            setError(null);
            setSaving(false);


            setFechaProgramada(
                row.fecha_programada ||
                row.fecha_vencimiento ||
                ""
            );


            setMonto(
                String(
                    N(row.monto_base)
                )
            );


            setDescripcion(
                row.descripcion ||
                ""
            );


            setObservaciones(
                row.observaciones ||
                ""
            );


            setCategoriaId(
                row.categoria_id
                    ? String(
                        row.categoria_id
                    )
                    : ""
            );


            setProyectoId(
                row.proyecto_id
                    ? String(
                        row.proyecto_id
                    )
                    : ""
            );


            // setFormaPagoId(
            //     row.formapago_id
            //         ? String(
            //             row.formapago_id
            //         )
            //         : ""
            // );


            setBancoId(
                row.banco_id
                    ? String(
                        row.banco_id
                    )
                    : ""
            );


            //   setCajaId(
            //     row.caja_id
            //       ? String(
            //           row.caja_id
            //         )
            //       : ""
            //   );


            if (
                row.medio === "banco"
            ) {

                setMedio(
                    "banco"
                );

            } else {

                setMedio(
                    "caja"
                );
            }

        },
        [
            show,
            row,
        ]
    );


    // ======================================================
    // AUTOSELECCIONAR BANCO SI HAY UNO SOLO
    // ======================================================

    useEffect(
        () => {

            if (
                medio === "banco" &&
                !bancoId &&
                bancosDisponibles.length === 1
            ) {

                setBancoId(
                    String(
                        bancosDisponibles[0].id
                    )
                );
            }

        },
        [
            medio,
            bancoId,
            bancosDisponibles,
        ]
    );




    // ======================================================
    // VALIDAR
    // ======================================================

    const validar = () => {

        if (!row?.id) {
            throw new Error(
                "No se indicó el pago programado"
            );
        }


        if (!fechaProgramada) {
            throw new Error(
                "Debe indicar la fecha programada"
            );
        }


        if (
            !(N(monto) > 0)
        ) {
            throw new Error(
                "El monto debe ser mayor a cero"
            );
        }


        if (
            !descripcion.trim()
        ) {
            throw new Error(
                "Debe indicar una descripción"
            );
        }


        if (!categoriaId) {
            throw new Error(
                "Debe seleccionar una categoría"
            );
        }

        if (
            !["caja", "banco"].includes(
                medio
            )
        ) {
            throw new Error(
                "Debe seleccionar un medio de pago"
            );
        }


        if (
            !formaPagoSeleccionada?.id
        ) {
            throw new Error(
                medio === "caja"
                    ? "No se encontró la forma de pago Efectivo"
                    : "No se encontró la forma de pago Transferencia"
            );
        }


        if (
            medio === "caja" &&
            (
                cajaAbierta?.abierta !== true ||
                !cajaAbierta?.caja?.id
            )
        ) {
            throw new Error(
                "No hay una caja abierta disponible"
            );
        }


        if (
            medio === "banco" &&
            !bancoId
        ) {
            throw new Error(
                "Debe seleccionar un banco"
            );
        }
    };


    // ======================================================
    // CONFIRMAR
    // ======================================================

    const confirmar =
        async () => {

            try {

                setError(null);

                validar();

                setSaving(true);


                const payload = {

                    fecha_programada:
                        fechaProgramada,

                    medio,

                    formapago_id:
                        Number(
                            formaPagoSeleccionada.id
                        ),

                    caja_id:
                        medio === "caja"
                            ? Number(
                                cajaAbierta.caja.id
                            )
                            : null,

                    banco_id:
                        medio === "banco"
                            ? Number(
                                bancoId
                            )
                            : null,

                    monto:
                        N(monto),

                    descripcion:
                        descripcion.trim(),

                    observaciones:
                        observaciones.trim() ||
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


                console.log(
                    "EditarPagoProgramado payload:",
                    payload
                );


                await onConfirm?.(
                    payload
                );


            } catch (e) {

                console.error(
                    "EditarPagoProgramadoModal:",
                    e
                );


                setError(
                    e.message ||
                    "No se pudo actualizar el pago programado"
                );

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
                    Editar pago programado
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


                {!row ? (

                    <Alert
                        variant="warning"
                    >
                        No se indicó el pago programado.
                    </Alert>

                ) : (

                    <>

                        {/* ======================================= */}
                        {/* DATOS NO MODIFICABLES                  */}
                        {/* ======================================= */}

                        <Row
                            className="g-3 mb-3"
                        >

                            <Col md={6}>

                                <Form.Group>

                                    <Form.Label>
                                        Proveedor
                                    </Form.Label>

                                    <Form.Control
                                        value={
                                            row.proveedor_nombre ||
                                            ""
                                        }
                                        disabled
                                    />

                                </Form.Group>

                            </Col>


                            <Col md={6}>

                                <Form.Group>

                                    <Form.Label>
                                        Tipo
                                    </Form.Label>

                                    <Form.Control
                                        value={
                                            esAnticipo
                                                ? "Anticipo"
                                                : "Egreso varios"
                                        }
                                        disabled
                                    />

                                </Form.Group>

                            </Col>

                        </Row>


                        {esAnticipo && (

                            <Alert
                                variant="light"
                            >
                                Este pago es un anticipo. Al modificar
                                fecha, monto o forma de pago también se
                                actualizará el abono pendiente asociado
                                en la cuenta corriente del proveedor.
                            </Alert>

                        )}


                        <hr />


                        {/* ======================================= */}
                        {/* DATOS EDITABLES                        */}
                        {/* ======================================= */}

                        <Row
                            className="g-3"
                        >

                            {/* FECHA */}

                            <Col md={6}>

                                <Form.Group>

                                    <Form.Label>
                                        Fecha programada
                                    </Form.Label>

                                    <Form.Control
                                        type="date"
                                        value={
                                            fechaProgramada
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(e) =>
                                            setFechaProgramada(
                                                e.target.value
                                            )
                                        }
                                    />

                                </Form.Group>

                            </Col>


                            {/* MONTO */}

                            <Col md={6}>

                                <Form.Group>

                                    <Form.Label>
                                        Monto programado
                                    </Form.Label>

                                    <Form.Control
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            monto
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(e) =>
                                            setMonto(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <Form.Text muted>
                                        Actual: $
                                        {toMoney(
                                            row.monto_base
                                        )}
                                    </Form.Text>

                                </Form.Group>

                            </Col>


                            {/* CATEGORÍA */}

                            <Col md={6}>

                                <Form.Group>

                                    <Form.Label>
                                        Categoría
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

                                    <Form.Text muted>
                                        La imputación contable se actualizará
                                        automáticamente según la categoría.
                                    </Form.Text>

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


                            {/* MEDIO */}

                            <Col md={12}>

                                <Form.Group>

                                    <Form.Label>
                                        Medio de pago
                                    </Form.Label>

                                    <div>

                                        <Form.Check
                                            inline
                                            type="radio"
                                            name="medio-editar-programado"
                                            id="editar-programado-medio-caja"
                                            label="Caja / Efectivo"
                                            checked={
                                                medio === "caja"
                                            }
                                            disabled={
                                                saving
                                            }
                                            onChange={() =>
                                                setMedio(
                                                    "caja"
                                                )
                                            }
                                        />


                                        <Form.Check
                                            inline
                                            type="radio"
                                            name="medio-editar-programado"
                                            id="editar-programado-medio-banco"
                                            label="Banco / Transferencia"
                                            checked={
                                                medio === "banco"
                                            }
                                            disabled={
                                                saving
                                            }
                                            onChange={() =>
                                                setMedio(
                                                    "banco"
                                                )
                                            }
                                        />

                                    </div>

                                </Form.Group>

                            </Col>

                            {/* CAJA */}

                            {medio === "caja" && (

                                <Col md={6}>

                                    <Form.Group>

                                        <Form.Label>
                                            Caja
                                        </Form.Label>

                                        <Form.Control
                                            value={
                                                cajaAbierta?.caja?.id
                                                    ? `Caja abierta #${cajaAbierta.caja.id}`
                                                    : "No hay caja abierta"
                                            }
                                            disabled
                                        />


                                        {cajaAbierta?.caja?.id && (

                                            <Form.Text muted>
                                                Saldo actual: $
                                                {toMoney(
                                                    cajaAbierta.saldo
                                                )}
                                            </Form.Text>

                                        )}

                                    </Form.Group>

                                </Col>

                            )}

                            {/* BANCO */}

                            {medio === "banco" && (

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


                                            {bancosDisponibles.map(
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
                                                            b.descripcion ||
                                                            b.nombre ||
                                                            `Banco ${b.id}`
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </Form.Select>

                                    </Form.Group>

                                </Col>

                            )}


                            {/* DESCRIPCIÓN */}

                            <Col md={12}>

                                <Form.Group>

                                    <Form.Label>
                                        Descripción
                                    </Form.Label>

                                    <Form.Control
                                        value={
                                            descripcion
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(e) =>
                                            setDescripcion(
                                                e.target.value
                                            )
                                        }
                                    />

                                </Form.Group>

                            </Col>


                            {/* OBSERVACIONES */}

                            <Col md={12}>

                                <Form.Group>

                                    <Form.Label>
                                        Observaciones
                                    </Form.Label>

                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={
                                            observaciones
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(e) =>
                                            setObservaciones(
                                                e.target.value
                                            )
                                        }
                                    />

                                </Form.Group>

                            </Col>

                        </Row>

                    </>

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
                        !row
                    }
                    onClick={
                        confirmar
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