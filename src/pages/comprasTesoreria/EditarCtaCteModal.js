import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Alert,
    Button,
    Col,
    Form,
    Modal,
    Row,
    Spinner,
} from "react-bootstrap";

const apiUrl =
    process.env.REACT_APP_API_URL;


const moneyAR = (value) => {
    const n = Number(value || 0);

    return n.toLocaleString(
        "es-AR",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    );
};


const toInputDate = (value) => {
    if (!value) return "";

    return String(value).slice(0, 10);
};


export default function EditarCtaCteModal({
    show,
    onHide,
    cargo,

    empresas = [],
    categorias = [],
    sucursales = [],
    formasPago = [],

    onActualizado,
}) {

    const [
        empresaId,
        setEmpresaId,
    ] = useState("");


    const [
        descripcion,
        setDescripcion,
    ] = useState("");


    const [
        categoriaId,
        setCategoriaId,
    ] = useState("");


    const [
        sucursalId,
        setSucursalId,
    ] = useState("");


    const [
        vencimiento,
        setVencimiento,
    ] = useState("");


    const [
        formaPagoId,
        setFormaPagoId,
    ] = useState("");


    const [
        saving,
        setSaving,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    // ============================================================
    // CARGAR DATOS DEL CARGO
    // ============================================================

    useEffect(() => {

        if (
            !show ||
            !cargo
        ) {
            return;
        }


        setEmpresaId(
            cargo.empresa_id != null
                ? String(cargo.empresa_id)
                : ""
        );


        setDescripcion(
            cargo.descripcion || ""
        );


        setCategoriaId(
            cargo.categoriaegreso_id != null
                ? String(
                    cargo.categoriaegreso_id
                )
                : (
                    cargo.categoria_id != null
                        ? String(cargo.categoria_id)
                        : ""
                )
        );


        setSucursalId(
            cargo.sucursal_id != null
                ? String(cargo.sucursal_id)
                : ""
        );


        setVencimiento(
            toInputDate(
                cargo.fecha_vencimiento ||
                cargo.fecha_pago
            )
        );


        setFormaPagoId(
            cargo.formapago_id != null
                ? String(cargo.formapago_id)
                : ""
        );


        setError("");

    }, [
        show,
        cargo,
    ]);


    // ============================================================
    // DATOS SOLO LECTURA
    // ============================================================

    const proveedorNombre =
        useMemo(
            () =>
                cargo?.proveedor_nombre ||
                cargo?.proveedor ||
                (
                    cargo?.proveedor_id
                        ? `Proveedor #${cargo.proveedor_id}`
                        : ""
                ),
            [
                cargo,
            ]
        );


    const comprobanteTexto =
        useMemo(
            () =>
                cargo?.comprobante_nro ||
                cargo?.nrocomprobante ||
                (
                    cargo?.comprobanteegreso_id
                        ? `#${cargo.comprobanteegreso_id}`
                        : "Sin comprobante"
                ),
            [
                cargo,
            ]
        );


    // ============================================================
    // GUARDAR
    // ============================================================

    const handleGuardar =
        async () => {

            if (!cargo?.id) {
                setError(
                    "No se pudo identificar el movimiento de cuenta corriente."
                );

                return;
            }


            setSaving(true);
            setError("");


            try {

                const body = {

                    empresa_id:
                        empresaId
                            ? Number(empresaId)
                            : null,

                    descripcion:
                        descripcion.trim() ||
                        null,

                    categoriaegreso_id:
                        categoriaId
                            ? Number(categoriaId)
                            : null,

                    sucursal_id:
                        sucursalId
                            ? Number(sucursalId)
                            : null,

                    fecha_pago:
                        vencimiento ||
                        null,

                    formapago_id:
                        formaPagoId
                            ? Number(formaPagoId)
                            : null,
                };

                const response =
                    await fetch(
                        `${apiUrl}/movimientos-cta-cte-proveedor/${cargo.id}`,
                        {
                            method: "PUT",

                            credentials:
                                "include",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body:
                                JSON.stringify(
                                    body
                                ),
                        }
                    );


                const json =
                    await response
                        .json()
                        .catch(() => ({}));


                if (!response.ok) {

                    throw new Error(
                        json?.error ||
                        json?.detalle ||
                        "No se pudo actualizar la cuenta corriente."
                    );
                }


                if (onActualizado) {

                    await onActualizado(
                        json?.movimiento ||
                        json
                    );
                }

                onHide?.();

            } catch (err) {

                console.error(
                    "Error editando cuenta corriente:",
                    err
                );


                setError(
                    err?.response?.data?.error ||
                    err?.response?.data?.detalle ||
                    err?.message ||
                    "No se pudo actualizar la cuenta corriente."
                );

            } finally {

                setSaving(false);

            }
        };


    if (!cargo) {
        return null;
    }


    return (

        <Modal
            show={show}
            onHide={
                saving
                    ? undefined
                    : onHide
            }
            centered
            size="lg"
            backdrop={
                saving
                    ? "static"
                    : true
            }
        >

            <Modal.Header closeButton={!saving}>

                <Modal.Title>
                    Editar cuenta corriente
                </Modal.Title>

            </Modal.Header>


            <Modal.Body>

                {
                    error && (

                        <Alert variant="danger">

                            {error}

                        </Alert>

                    )
                }


                {/* =====================================================
            DATOS NO EDITABLES
           ===================================================== */}

                <div className="mb-3">

                    <div className="fw-semibold mb-2">
                        Datos del movimiento
                    </div>


                    <Row className="g-3">

                        <Col md={6}>

                            <Form.Group>

                                <Form.Label>
                                    Proveedor
                                </Form.Label>

                                <Form.Control
                                    value={proveedorNombre}
                                    disabled
                                    readOnly
                                />

                            </Form.Group>

                        </Col>


                        <Col md={3}>

                            <Form.Group>

                                <Form.Label>
                                    Monto
                                </Form.Label>

                                <Form.Control
                                    value={
                                        `$ ${moneyAR(
                                            cargo.monto_base ??
                                            cargo.importe ??
                                            0
                                        )}`
                                    }
                                    disabled
                                    readOnly
                                />

                            </Form.Group>

                        </Col>


                        <Col md={3}>

                            <Form.Group>

                                <Form.Label>
                                    Saldo
                                </Form.Label>

                                <Form.Control
                                    value={
                                        `$ ${moneyAR(
                                            cargo.saldo ??
                                            cargo.monto_base ??
                                            cargo.importe ??
                                            0
                                        )}`
                                    }
                                    disabled
                                    readOnly
                                />

                            </Form.Group>

                        </Col>


                        <Col md={4}>

                            <Form.Group>

                                <Form.Label>
                                    Fecha original
                                </Form.Label>

                                <Form.Control
                                    type="date"
                                    value={
                                        toInputDate(
                                            cargo.fecha
                                        )
                                    }
                                    disabled
                                    readOnly
                                />

                            </Form.Group>

                        </Col>


                        <Col md={8}>

                            <Form.Group>

                                <Form.Label>
                                    Comprobante
                                </Form.Label>

                                <Form.Control
                                    value={comprobanteTexto}
                                    disabled
                                    readOnly
                                />

                            </Form.Group>

                        </Col>

                    </Row>

                </div>


                <hr />


                {/* =====================================================
            DATOS EDITABLES
           ===================================================== */}

                <div>

                    <div className="fw-semibold mb-2">
                        Datos editables
                    </div>


                    <Row className="g-3">

                        {/* EMPRESA */}

                        <Col md={6}>

                            <Form.Group>

                                <Form.Label>
                                    Empresa
                                </Form.Label>

                                <Form.Select
                                    value={empresaId}
                                    disabled={saving}
                                    onChange={
                                        (e) =>
                                            setEmpresaId(
                                                e.target.value
                                            )
                                    }
                                >

                                    <option value="">
                                        Sin empresa
                                    </option>

                                    {
                                        empresas.map(
                                            (empresa) => (

                                                <option
                                                    key={empresa.id}
                                                    value={empresa.id}
                                                >
                                                    {
                                                        empresa.nombrecorto ||
                                                        empresa.razon_social ||
                                                        empresa.nombre ||
                                                        `Empresa ${empresa.id}`
                                                    }
                                                </option>

                                            )
                                        )
                                    }

                                </Form.Select>

                            </Form.Group>

                        </Col>


                        {/* VENCIMIENTO */}

                        <Col md={6}>

                            <Form.Group>

                                <Form.Label>
                                    Vencimiento
                                </Form.Label>

                                <Form.Control
                                    type="date"
                                    value={vencimiento}
                                    disabled={saving}
                                    onChange={
                                        (e) =>
                                            setVencimiento(
                                                e.target.value
                                            )
                                    }
                                />

                            </Form.Group>

                        </Col>


                        {/* CATEGORÍA */}

                        <Col md={6}>

                            <Form.Group>

                                <Form.Label>
                                    Categoría
                                </Form.Label>

                                <Form.Select
                                    value={categoriaId}
                                    disabled={saving}
                                    onChange={
                                        (e) =>
                                            setCategoriaId(
                                                e.target.value
                                            )
                                    }
                                >

                                    <option value="">
                                        Sin categoría
                                    </option>

                                    {
                                        categorias.map(
                                            (categoria) => (

                                                <option
                                                    key={categoria.id}
                                                    value={categoria.id}
                                                >
                                                    {
                                                        categoria.descripcion ||
                                                        categoria.nombre ||
                                                        `Categoría ${categoria.id}`
                                                    }
                                                </option>

                                            )
                                        )
                                    }

                                </Form.Select>

                            </Form.Group>

                        </Col>


                        {/* SUCURSAL */}

                        <Col md={6}>

                            <Form.Group>

                                <Form.Label>
                                    Sucursal
                                </Form.Label>

                                <Form.Select
                                    value={sucursalId}
                                    disabled={saving}
                                    onChange={
                                        (e) =>
                                            setSucursalId(
                                                e.target.value
                                            )
                                    }
                                >

                                    <option value="">
                                        Sin sucursal
                                    </option>

                                    {
                                        sucursales.map(
                                            (sucursal) => (

                                                <option
                                                    key={sucursal.id}
                                                    value={sucursal.id}
                                                >
                                                    {
                                                        sucursal.nombre ||
                                                        sucursal.descripcion ||
                                                        `Sucursal ${sucursal.id}`
                                                    }
                                                </option>

                                            )
                                        )
                                    }

                                </Form.Select>

                            </Form.Group>

                        </Col>


                        {/* FP ACORDADA */}

                        <Col md={6}>

                            <Form.Group>

                                <Form.Label>
                                    FP acordada
                                </Form.Label>

                                <Form.Select
                                    value={formaPagoId}
                                    disabled={saving}
                                    onChange={
                                        (e) =>
                                            setFormaPagoId(
                                                e.target.value
                                            )
                                    }
                                >

                                    <option value="">
                                        Sin forma de pago
                                    </option>

                                    {
                                        formasPago.map(
                                            (fp) => (

                                                <option
                                                    key={fp.id}
                                                    value={fp.id}
                                                >
                                                    {
                                                        fp.descripcion ||
                                                        fp.nombre ||
                                                        `Forma de pago ${fp.id}`
                                                    }
                                                </option>

                                            )
                                        )
                                    }

                                </Form.Select>

                            </Form.Group>

                        </Col>


                        {/* DESCRIPCIÓN */}

                        <Col md={12}>

                            <Form.Group>

                                <Form.Label>
                                    Descripción
                                </Form.Label>

                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={descripcion}
                                    disabled={saving}
                                    onChange={
                                        (e) =>
                                            setDescripcion(
                                                e.target.value
                                            )
                                    }
                                />

                            </Form.Group>

                        </Col>

                    </Row>

                </div>

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
                    disabled={saving}
                    onClick={handleGuardar}
                >

                    {
                        saving ? (
                            <>
                                <Spinner
                                    size="sm"
                                    className="me-2"
                                />

                                Guardando...
                            </>
                        ) : (
                            "Guardar cambios"
                        )
                    }

                </Button>

            </Modal.Footer>

        </Modal>

    );
}