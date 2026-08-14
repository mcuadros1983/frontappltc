import React, {
    useMemo,
    useState,
    useEffect,
} from "react";

import {
    Alert,
    Badge,
} from "react-bootstrap";

import {
    FiTrash2,
} from "react-icons/fi";

import {
    ERPButton,
    ERPTable,
} from "../../common/erp";

import EntidadDocumentoArchivoModal
    from "./EntidadDocumentoArchivoModal";


const EntidadDocumentoArchivos = ({

    archivoTipos = [],

    archivos = [],

    disabled = false,

    onChange,

    onValidationChange,
}) => {

    const [
        showModal,
        setShowModal,
    ] = useState(false);


    /*
     * Tipos de archivo activos configurados
     * para el concepto.
     */
    const tiposActivos =
        useMemo(
            () =>

                archivoTipos.filter(
                    (item) =>
                        item.activo !== false
                ),

            [
                archivoTipos,
            ]
        );


    /*
     * Mapa para resolver rápidamente
     * la información del tipo de archivo.
     */
    const tiposMap =
        useMemo(
            () =>

                new Map(
                    tiposActivos.map(
                        (item) => [

                            Number(
                                item.id
                            ),

                            item,

                        ]
                    )
                ),

            [
                tiposActivos,
            ]
        );


    /*
     * Estado de cumplimiento de cada
     * tipo de archivo configurado.
     *
     * Conservamos la misma regla utilizada
     * actualmente por useRegistroArchivos:
     *
     * - tipo no obligatorio => completo
     * - tipo obligatorio => debe existir
     *   al menos un archivo.
     */
    const estadoObligatorios =
        useMemo(
            () =>

                tiposActivos.map(
                    (tipo) => {

                        const encontrados =
                            archivos.filter(
                                (archivo) =>

                                    Number(
                                        archivo
                                            .archivo_tipo_id
                                    ) ===
                                    Number(
                                        tipo.id
                                    )
                            );

                        return {

                            tipo,

                            archivos:
                                encontrados,

                            completo:

                                !tipo.obligatorio ||

                                encontrados.length > 0,

                        };

                    }
                ),

            [
                tiposActivos,
                archivos,
            ]
        );


    /*
     * Tipos obligatorios que todavía
     * no tienen ningún archivo preparado.
     */
    const faltantes =
        useMemo(
            () =>

                estadoObligatorios.filter(
                    (item) =>
                        !item.completo
                ),

            [
                estadoObligatorios,
            ]
        );

    useEffect(
        () => {

            onValidationChange?.({

                valid:
                    faltantes.length === 0,

                faltantes,

            });

        },
        [
            faltantes,
            onValidationChange,
        ]
    );

    /*
     * Agrega el archivo únicamente al
     * estado local administrado por el padre.
     *
     * NO se realiza ninguna llamada HTTP.
     */
    const handleAdd =
        (archivo) => {

            if (
                disabled
            ) {
                return;
            }

            onChange?.([
                ...archivos,
                archivo,
            ]);

        };


    /*
     * Elimina un archivo pendiente.
     *
     * Como todavía no existe registro,
     * tampoco existe nada para eliminar
     * en backend.
     */
    const handleRemove =
        (index) => {

            if (
                disabled
            ) {
                return;
            }

            const next =
                archivos.filter(
                    (
                        item,
                        itemIndex
                    ) =>
                        itemIndex !== index
                );

            onChange?.(
                next
            );

        };


    const columns =
        useMemo(
            () => [

                {
                    key:
                        "nombre_logico",

                    title:
                        "Nombre lógico",

                    render:
                        (row) =>

                            row
                                .nombre_logico ||

                            row
                                ?.file
                                ?.name ||

                            "-",
                },

                {
                    key:
                        "archivo_tipo_id",

                    title:
                        "Tipo",

                    render:
                        (row) => {

                            const tipo =
                                tiposMap.get(
                                    Number(
                                        row
                                            .archivo_tipo_id
                                    )
                                );

                            return (

                                <div className="d-flex align-items-center gap-2">

                                    <span>

                                        {
                                            tipo
                                                ?.nombre ||
                                            row
                                                ?.archivo_tipo
                                                ?.nombre ||
                                            "-"
                                        }

                                    </span>

                                    {
                                        tipo
                                            ?.obligatorio && (

                                            <Badge
                                                bg="warning"
                                                text="dark"
                                            >

                                                Obligatorio

                                            </Badge>

                                        )
                                    }

                                </div>

                            );

                        },
                },

                {
                    key:
                        "archivo",

                    title:
                        "Archivo",

                    render:
                        (row) =>

                            row
                                ?.file
                                ?.name ||

                            "-",
                },

                {
                    key:
                        "mime",

                    title:
                        "MIME",

                    render:
                        (row) =>

                            row
                                ?.file
                                ?.type ||

                            "-",
                },

                {
                    key:
                        "peso",

                    title:
                        "Tamaño",

                    render:
                        (row) => {

                            const size =
                                Number(
                                    row
                                        ?.file
                                        ?.size ||
                                    0
                                );

                            if (
                                !size
                            ) {
                                return "-";
                            }

                            return `${(
                                size /
                                1024 /
                                1024
                            ).toFixed(
                                2
                            )} MB`;

                        },
                },

                {
                    key:
                        "acciones",

                    title:
                        "Acciones",

                    render:
                        (
                            row,
                            index
                        ) => (

                            <ERPButton

                                type="delete"

                                size="sm"

                                disabled={
                                    disabled
                                }

                                onClick={() =>
                                    handleRemove(
                                        index
                                    )
                                }

                            >
                                <FiTrash2 />
                            </ERPButton>

                        ),
                },

            ],
            [
                tiposMap,
                disabled,
            ]
        );


    /*
     * Si el concepto no tiene ningún
     * tipo de archivo configurado,
     * no mostramos una sección vacía.
     */
    if (
        tiposActivos.length === 0
    ) {

        return null;

    }


    return (

        <>

            {
                faltantes.length > 0 && (

                    <Alert
                        variant="warning"
                    >

                        <strong>
                            Archivos obligatorios pendientes:
                        </strong>

                        <div className="mt-2 d-flex flex-wrap gap-2">

                            {
                                faltantes.map(
                                    (item) => (

                                        <Badge

                                            key={
                                                item.tipo.id
                                            }

                                            bg="warning"

                                            text="dark"

                                        >

                                            {
                                                item
                                                    .tipo
                                                    .nombre
                                            }

                                        </Badge>

                                    )
                                )
                            }

                        </div>

                    </Alert>

                )
            }


            {
                faltantes.length === 0 &&
                tiposActivos.some(
                    (item) =>
                        item.obligatorio
                ) && (

                    <Alert
                        variant="success"
                    >

                        Todos los archivos obligatorios
                        fueron seleccionados.

                    </Alert>

                )
            }


            {
                !disabled && (

                    <div className="d-grid d-sm-block mb-3">

                        <ERPButton
                            type="new"
                            label="Agregar archivo"
                            onClick={() =>
                                setShowModal(
                                    true
                                )
                            }
                        />

                    </div>

                )
            }

            <div className="d-md-none">

                {
                    archivos.length === 0 ? (

                        <div
                            className="
                    border
                    rounded
                    p-4
                    text-center
                    text-muted
                    mb-3
                "
                        >
                            No hay archivos seleccionados.
                        </div>

                    ) : (

                        archivos.map(
                            (
                                archivo,
                                index
                            ) => {

                                const tipo =
                                    tiposMap.get(
                                        Number(
                                            archivo.archivo_tipo_id
                                        )
                                    );

                                const size =
                                    Number(
                                        archivo?.file?.size ||
                                        0
                                    );

                                return (

                                    <div
                                        key={
                                            `${archivo.archivo_tipo_id}-${index}`
                                        }
                                        className="
                                border
                                rounded
                                p-3
                                mb-3
                                bg-white
                            "
                                    >

                                        <div
                                            className="
                                    d-flex
                                    justify-content-between
                                    align-items-start
                                    gap-3
                                "
                                        >

                                            <div
                                                className="flex-grow-1"
                                                style={{
                                                    minWidth: 0,
                                                }}
                                            >

                                                <div className="fw-semibold">

                                                    {
                                                        tipo?.nombre ||
                                                        "Archivo"
                                                    }

                                                </div>

                                                {
                                                    tipo?.obligatorio && (

                                                        <Badge
                                                            bg="warning"
                                                            text="dark"
                                                            className="mt-1"
                                                        >
                                                            Obligatorio
                                                        </Badge>

                                                    )
                                                }

                                            </div>


                                            {
                                                !disabled && (

                                                    <ERPButton
                                                        type="delete"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleRemove(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        <FiTrash2 />
                                                    </ERPButton>

                                                )
                                            }

                                        </div>


                                        <hr className="my-3" />


                                        <div className="small">

                                            <div className="mb-2">

                                                <span className="text-muted">
                                                    Archivo:
                                                </span>

                                                <div
                                                    className="fw-medium text-break"
                                                >
                                                    {
                                                        archivo?.file?.name ||
                                                        "-"
                                                    }
                                                </div>

                                            </div>


                                            {
                                                archivo.nombre_logico && (

                                                    <div className="mb-2">

                                                        <span className="text-muted">
                                                            Nombre:
                                                        </span>

                                                        <div>
                                                            {
                                                                archivo.nombre_logico
                                                            }
                                                        </div>

                                                    </div>

                                                )
                                            }


                                            <div
                                                className="
                                        d-flex
                                        justify-content-between
                                        gap-3
                                    "
                                            >

                                                <div>

                                                    <span className="text-muted">
                                                        Tipo
                                                    </span>

                                                    <div>
                                                        {
                                                            archivo?.file?.type ||
                                                            "-"
                                                        }
                                                    </div>

                                                </div>


                                                <div className="text-end">

                                                    <span className="text-muted">
                                                        Tamaño
                                                    </span>

                                                    <div>

                                                        {
                                                            size
                                                                ? `${(
                                                                    size /
                                                                    1024 /
                                                                    1024
                                                                ).toFixed(2)} MB`
                                                                : "-"
                                                        }

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                );

                            }
                        )

                    )
                }

            </div>

            <div className="d-none d-md-block">
                <ERPTable

                    columns={
                        columns
                    }

                    data={
                        archivos
                    }

                    loading={
                        false
                    }

                />

            </div>


            <EntidadDocumentoArchivoModal

                show={
                    showModal
                }

                archivoTipos={
                    tiposActivos
                }

                archivos={
                    archivos
                }

                onHide={() =>
                    setShowModal(
                        false
                    )
                }

                onAdd={
                    handleAdd
                }

            />

        </>

    );

};


export default EntidadDocumentoArchivos;