import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    Alert,
    Badge,
    Form,
    Table,
} from "react-bootstrap";

import {
    ERPButton,
    ERPModal,
} from "../common/erp";

import motorConceptoApi
    from "../../services/motorConceptoApi";


const initialState = {
    archivo: null,
    resultado: null,
    acciones: {},
};


const MotorConceptoImportModal = ({
    show,
    onHide,
    onImported,
}) => {

    const inputRef =
        useRef(null);

    const [
        archivo,
        setArchivo,
    ] = useState(
        initialState.archivo
    );

    const [
        resultado,
        setResultado,
    ] = useState(
        initialState.resultado
    );

    const [
        acciones,
        setAcciones,
    ] = useState(
        initialState.acciones
    );

    const [
        validating,
        setValidating,
    ] = useState(false);

    const [
        importing,
        setImporting,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");


    const busy =
        validating ||
        importing;


    useEffect(() => {

        if (!show) {
            return;
        }

        setArchivo(null);
        setResultado(null);
        setAcciones({});
        setError("");

        if (
            inputRef.current
        ) {
            inputRef.current.value =
                "";
        }

    }, [show]);


    const conceptos =
        useMemo(
            () =>
                Array.isArray(
                    resultado?.conceptos
                )
                    ? resultado.conceptos
                    : [],
            [resultado]
        );


    const errores =
        useMemo(
            () =>
                Array.isArray(
                    resultado?.errores
                )
                    ? resultado.errores
                    : [],
            [resultado]
        );


    const canImport =
        Boolean(
            archivo &&
            resultado?.valido &&
            errores.length === 0
        );


    const getAction = (
        concepto
    ) => {

        if (
            acciones[
                concepto.codigo
            ]
        ) {
            return acciones[
                concepto.codigo
            ];
        }

        return (
            concepto.accion_default ||
            (
                concepto.estado ===
                "NUEVO"
                    ? "CREAR"
                    : "OMITIR"
            )
        );

    };


    const handleFileChange = (
        event
    ) => {

        const selected =
            event.target.files?.[0] ||
            null;


        setError("");
        setResultado(null);
        setAcciones({});


        if (!selected) {
            setArchivo(null);
            return;
        }


        const fileName =
            selected.name
                .toLowerCase();


        if (
            !fileName.endsWith(
                ".xlsx"
            )
        ) {

            setArchivo(null);

            setError(
                "Debe seleccionar un archivo Excel .xlsx"
            );

            event.target.value =
                "";

            return;
        }


        setArchivo(
            selected
        );

    };


    const handleValidate =
        async () => {

            if (!archivo) {

                setError(
                    "Seleccione un archivo Excel"
                );

                return;
            }


            setValidating(true);
            setError("");
            setResultado(null);
            setAcciones({});


            try {

                const data =
                    await motorConceptoApi
                        .validarImportacion(
                            archivo
                        );


                setResultado(
                    data
                );


                const defaults = {};


                (
                    data?.conceptos ||
                    []
                ).forEach(
                    (concepto) => {

                        defaults[
                            concepto.codigo
                        ] =
                            concepto
                                .accion_default ||
                            (
                                concepto.estado ===
                                    "NUEVO"
                                    ? "CREAR"
                                    : "OMITIR"
                            );

                    }
                );


                setAcciones(
                    defaults
                );

            } catch (e) {

                setError(
                    e?.message ||
                    "No se pudo validar el archivo"
                );

            } finally {

                setValidating(false);

            }

        };


    const handleActionChange = (
        codigo,
        value
    ) => {

        setAcciones(
            (current) => ({
                ...current,
                [codigo]: value,
            })
        );

    };


    const handleImport =
        async () => {

            if (!canImport) {
                return;
            }


            setImporting(true);
            setError("");


            try {

                const data =
                    await motorConceptoApi
                        .importarExcel(
                            archivo,
                            acciones
                        );


                if (onImported) {
                    await onImported(
                        data
                    );
                }


                onHide();

            } catch (e) {

                setError(
                    e?.message ||
                    "No se pudo realizar la importación"
                );

            } finally {

                setImporting(false);

            }

        };


    const estadoVariant = (
        estado
    ) => {

        switch (estado) {

            case "NUEVO":
                return "success";

            case "EXISTENTE":
                return "warning";

            case "ELIMINADO":
                return "secondary";

            default:
                return "secondary";

        }

    };


    return (
        <ERPModal
            show={show}
            onHide={
                busy
                    ? undefined
                    : onHide
            }
            title="Importar conceptos desde Excel"
            size="xl"
            footer={
                <>
                    <ERPButton
                        type="cancel"
                        disabled={busy}
                        onClick={onHide}
                    />

                    {
                        !resultado && (
                            <ERPButton
                                type="save"
                                disabled={
                                    busy ||
                                    !archivo
                                }
                                onClick={
                                    handleValidate
                                }
                            >
                                {
                                    validating
                                        ? "Validando..."
                                        : "Validar archivo"
                                }
                            </ERPButton>
                        )
                    }

                    {
                        resultado && (
                            <>
                                <ERPButton
                                    type="refresh"
                                    disabled={busy}
                                    onClick={
                                        handleValidate
                                    }
                                >
                                    Validar nuevamente
                                </ERPButton>

                                <ERPButton
                                    type="save"
                                    disabled={
                                        busy ||
                                        !canImport
                                    }
                                    onClick={
                                        handleImport
                                    }
                                >
                                    {
                                        importing
                                            ? "Importando..."
                                            : "Confirmar importación"
                                    }
                                </ERPButton>
                            </>
                        )
                    }
                </>
            }
        >

            {
                error && (
                    <Alert variant="danger">
                        {error}
                    </Alert>
                )
            }


            <Alert variant="info">
                La importación primero valida
                el archivo. Los conceptos
                existentes se omiten por
                defecto y solamente se
                actualizan si selecciona
                explícitamente
                <strong> ACTUALIZAR</strong>.
            </Alert>


            <Form.Group className="mb-3">

                <Form.Label>
                    Archivo Excel *
                </Form.Label>

                <Form.Control
                    ref={inputRef}
                    type="file"
                    accept=".xlsx"
                    disabled={busy}
                    onChange={
                        handleFileChange
                    }
                />

                <Form.Text muted>
                    Formato permitido: .xlsx
                </Form.Text>

            </Form.Group>


            {
                resultado?.resumen && (
                    <div className="d-flex flex-wrap gap-2 mb-3">

                        <Badge bg="secondary">
                            Conceptos:{" "}
                            {
                                resultado
                                    .resumen
                                    .conceptos ??
                                0
                            }
                        </Badge>

                        <Badge bg="success">
                            Nuevos:{" "}
                            {
                                resultado
                                    .resumen
                                    .nuevos ??
                                0
                            }
                        </Badge>

                        <Badge bg="warning">
                            Existentes:{" "}
                            {
                                resultado
                                    .resumen
                                    .existentes ??
                                0
                            }
                        </Badge>

                        <Badge bg="secondary">
                            Eliminados:{" "}
                            {
                                resultado
                                    .resumen
                                    .eliminados ??
                                0
                            }
                        </Badge>

                        <Badge
                            bg={
                                (
                                    resultado
                                        .resumen
                                        .errores ??
                                    0
                                ) > 0
                                    ? "danger"
                                    : "success"
                            }
                        >
                            Errores:{" "}
                            {
                                resultado
                                    .resumen
                                    .errores ??
                                0
                            }
                        </Badge>

                    </div>
                )
            }


            {
                errores.length > 0 && (
                    <Alert variant="danger">

                        <Alert.Heading>
                            El archivo contiene errores
                        </Alert.Heading>

                        <div
                            style={{
                                maxHeight: "250px",
                                overflowY: "auto",
                            }}
                        >

                            <Table
                                responsive
                                size="sm"
                                className="mb-0"
                            >
                                <thead>
                                    <tr>
                                        <th>
                                            Hoja
                                        </th>
                                        <th>
                                            Fila
                                        </th>
                                        <th>
                                            Campo
                                        </th>
                                        <th>
                                            Código
                                        </th>
                                        <th>
                                            Error
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {
                                        errores.map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <tr
                                                    key={
                                                        `${item.hoja}-${item.fila}-${item.campo}-${index}`
                                                    }
                                                >
                                                    <td>
                                                        {
                                                            item.hoja
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item.fila
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item.campo
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item.codigo ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item.mensaje
                                                        }
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    }
                                </tbody>
                            </Table>

                        </div>

                    </Alert>
                )
            }


            {
                conceptos.length > 0 && (
                    <div
                        style={{
                            maxHeight: "420px",
                            overflowY: "auto",
                        }}
                    >

                        <Table
                            responsive
                            hover
                            size="sm"
                        >

                            <thead>
                                <tr>
                                    <th>
                                        Código
                                    </th>

                                    <th>
                                        Nombre
                                    </th>

                                    <th>
                                        Entidad
                                    </th>

                                    <th>
                                        Estado
                                    </th>

                                    <th
                                        style={{
                                            minWidth:
                                                "170px",
                                        }}
                                    >
                                        Acción
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {
                                    conceptos.map(
                                        (
                                            concepto
                                        ) => {

                                            const action =
                                                getAction(
                                                    concepto
                                                );


                                            return (
                                                <tr
                                                    key={
                                                        concepto.codigo
                                                    }
                                                >

                                                    <td>
                                                        <strong>
                                                            {
                                                                concepto.codigo
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {
                                                            concepto.nombre
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            concepto.entidad_tipo ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>
                                                        <Badge
                                                            bg={
                                                                estadoVariant(
                                                                    concepto.estado
                                                                )
                                                            }
                                                        >
                                                            {
                                                                concepto.estado
                                                            }
                                                        </Badge>
                                                    </td>

                                                    <td>

                                                        {
                                                            concepto.estado ===
                                                                "NUEVO" && (
                                                                <Form.Select
                                                                    className="form-control"
                                                                    size="sm"
                                                                    value="CREAR"
                                                                    disabled
                                                                >
                                                                    <option value="CREAR">
                                                                        Crear
                                                                    </option>
                                                                </Form.Select>
                                                            )
                                                        }


                                                        {
                                                            concepto.estado ===
                                                                "EXISTENTE" && (
                                                                <Form.Select
                                                                    className="form-control"
                                                                    size="sm"
                                                                    value={
                                                                        action
                                                                    }
                                                                    disabled={
                                                                        busy
                                                                    }
                                                                    onChange={
                                                                        (
                                                                            event
                                                                        ) =>
                                                                            handleActionChange(
                                                                                concepto.codigo,
                                                                                event.target.value
                                                                            )
                                                                    }
                                                                >
                                                                    <option value="OMITIR">
                                                                        Omitir
                                                                    </option>

                                                                    <option value="ACTUALIZAR">
                                                                        Actualizar
                                                                    </option>
                                                                </Form.Select>
                                                            )
                                                        }


                                                        {
                                                            concepto.estado ===
                                                                "ELIMINADO" && (
                                                                <Form.Select
                                                                    className="form-control"
                                                                    size="sm"
                                                                    value="OMITIR"
                                                                    disabled
                                                                >
                                                                    <option value="OMITIR">
                                                                        Omitir
                                                                    </option>
                                                                </Form.Select>
                                                            )
                                                        }

                                                    </td>

                                                </tr>
                                            );

                                        }
                                    )
                                }

                            </tbody>

                        </Table>

                    </div>
                )
            }


            {
                resultado &&
                conceptos.length === 0 &&
                errores.length === 0 && (
                    <Alert variant="warning">
                        El archivo no contiene
                        conceptos para importar.
                    </Alert>
                )
            }

        </ERPModal>
    );
};


export default MotorConceptoImportModal;