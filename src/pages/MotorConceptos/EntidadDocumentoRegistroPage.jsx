import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    Alert,
    Spinner,
} from "react-bootstrap";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    ERPButton,
    ERPCard,
    ERPPage,
} from "../../components/common/erp";

import EntidadDocumentoRegistroForm
    from "../../components/motorConceptos/entidad/EntidadDocumentoRegistroForm";

import EntidadDocumentoArchivos
    from "../../components/motorConceptos/entidad/EntidadDocumentoArchivos";

import motorConceptoApi
    from "../../services/motorConceptoApi";

import motorConceptoRegistroApi
    from "../../services/motorConceptoRegistroApi";

import {
    serializeValues,
} from "../../utils/motorConceptos/registroValues";

const getErrorMessage =
    (
        error,
        fallback
    ) =>

        error?.response
            ?.data
            ?.message ||

        error?.message ||

        fallback;


const EntidadDocumentoRegistroPage =
    () => {

        const navigate =
            useNavigate();

        const location =
            useLocation();

        const formRef =
            useRef(null);


        /*
         * =========================================================
         * CONTEXTO DOCUMENTAL
         * =========================================================
         *
         * Este Page solamente se utiliza desde Gestión Documental.
         *
         * La entidad y el concepto ya fueron seleccionados
         * previamente en EntidadDocumentalPage.
         */

        const state =
            location.state ||
            {};


        const conceptoId =
            state.concepto_id;

        const entidadTipoId =
            state.entidad_tipo_id;

        const entidadId =
            state.entidad_id;

        const entidadNombre =
            state.entidad_nombre ||
            "";

        const entidadTipoNombre =
            state.entidad_tipo_nombre ||
            "";

        const volverDocumental =
            () => {

                if (
                    state.documentalPath
                ) {

                    navigate(
                        state.documentalPath,
                        {

                            state: {

                                entidad_tipo_id:
                                    entidadTipoId,

                                entidad_id:
                                    entidadId,

                                entidad_nombre:
                                    entidadNombre,

                                entidad_tipo_nombre:
                                    entidadTipoNombre,

                            },

                        }
                    );

                    return;

                }

                navigate(
                    -1
                );

            };
        /*
         * =========================================================
         * ESTADO
         * =========================================================
         */

        const [
            concepto,
            setConcepto,
        ] = useState(null);


        const [
            values,
            setValues,
        ] = useState({});


        const [
            fechaVencimiento,
            setFechaVencimiento,
        ] = useState("");


        const [
            observaciones,
            setObservaciones,
        ] = useState("");


        /*
         * Archivos seleccionados localmente.
         *
         * Todavía NO existen en backend.
         */
        const [
            archivos,
            setArchivos,
        ] = useState([]);


        const [
            archivosValidation,
            setArchivosValidation,
        ] = useState({
            valid: true,
            faltantes: [],
        });


        const [
            loading,
            setLoading,
        ] = useState(true);


        const [
            saving,
            setSaving,
        ] = useState(false);


        const [
            error,
            setError,
        ] = useState("");


        /*
         * =========================================================
         * CONFIGURACIÓN DEL CONCEPTO
         * =========================================================
         */

        const campos =
            useMemo(
                () =>

                    Array.isArray(
                        concepto?.campos
                    )
                        ? concepto.campos
                        : [],

                [
                    concepto,
                ]
            );


        const reglas =
            useMemo(
                () =>

                    Array.isArray(
                        concepto?.reglas
                    )
                        ? concepto.reglas
                        : [],

                [
                    concepto,
                ]
            );


        const archivoTipos =
            useMemo(
                () =>

                    Array.isArray(
                        concepto?.archivosTipos
                    )
                        ? concepto.archivosTipos
                        : [],

                [
                    concepto,
                ]
            );


        /*
         * =========================================================
         * CARGA DEL CONCEPTO
         * =========================================================
         */

        useEffect(
            () => {

                let mounted =
                    true;


                const cargar =
                    async () => {

                        if (
                            !conceptoId ||
                            !entidadTipoId ||
                            !entidadId
                        ) {

                            if (
                                mounted
                            ) {

                                setError(
                                    "No se recibió la información necesaria para crear el registro documental."
                                );

                                setLoading(
                                    false
                                );

                            }

                            return;

                        }


                        setLoading(
                            true
                        );

                        setError("");


                        try {

                            const response =
                                await motorConceptoApi
                                    .obtener(
                                        conceptoId
                                    );


                            if (
                                !mounted
                            ) {
                                return;
                            }


                            if (
                                !response
                            ) {

                                throw new Error(
                                    "No se pudo obtener el concepto."
                                );

                            }


                            setConcepto(
                                response
                            );


                            /*
                             * Inicializamos los valores dinámicos.
                             *
                             * No inventamos valores por defecto.
                             * El RuleEngine/FormRenderer será quien
                             * procese las reglas existentes.
                             */
                            setValues({});


                            setFechaVencimiento("");


                            setObservaciones("");


                            setArchivos([]);


                        } catch (
                        err
                        ) {

                            if (
                                !mounted
                            ) {
                                return;
                            }


                            setError(
                                getErrorMessage(
                                    err,
                                    "No se pudo cargar la configuración del concepto."
                                )
                            );

                        } finally {

                            if (
                                mounted
                            ) {

                                setLoading(
                                    false
                                );

                            }

                        }

                    };


                cargar();


                return () => {

                    mounted =
                        false;

                };

            },
            [
                conceptoId,
                entidadTipoId,
                entidadId,
            ]
        );


        /*
         * =========================================================
         * CAMBIO DE VALORES DINÁMICOS
         * =========================================================
         *
         * FormRenderer informa:
         *
         * onChange(fieldId, value)
         */

        const handleValueChange =
            useCallback(
                (
                    fieldId,
                    value
                ) => {

                    setValues(
                        (current) => ({

                            ...current,

                            [fieldId]:
                                value,

                        })
                    );

                },
                []
            );


        /*
         * =========================================================
         * VOLVER
         * =========================================================
         */
        const handleCancel =
            () => {

                if (
                    saving
                ) {
                    return;
                }

                volverDocumental();

            };

        /*
         * =========================================================
         * VALIDACIÓN DE ARCHIVOS
         * =========================================================
         */

        const handleArchivosValidation =
            useCallback(
                (
                    validation
                ) => {

                    setArchivosValidation(
                        validation
                    );

                },
                []
            );


        /*
         * =========================================================
         * GUARDAR
         * =========================================================
         */
        // const handleCancel =
        //     () => {

        //         if (
        //             saving
        //         ) {
        //             return;
        //         }

        //         volverDocumental();

        //     };

        const handleSave =
            async () => {

                if (
                    saving
                ) {
                    return;
                }


                setError("");


                /*
                 * -------------------------------------------------
                 * 1. Validar contexto
                 * -------------------------------------------------
                 */

                if (
                    !concepto ||
                    !conceptoId ||
                    !entidadTipoId ||
                    !entidadId
                ) {

                    setError(
                        "No se dispone de la información necesaria para crear el registro."
                    );

                    return;

                }
                let valoresPreparados =
                    values;

                if (
                    formRef.current
                ) {

                    try {

                        const prepared =
                            formRef.current
                                .prepareSave();

                        if (
                            !prepared.valid
                        ) {

                            setError(
                                "Debe completar correctamente todos los campos obligatorios."
                            );

                            return;

                        }

                        valoresPreparados =
                            prepared.values ||
                            {};

                    } catch (
                    err
                    ) {

                        setError(
                            getErrorMessage(
                                err,
                                "No se pudieron validar los datos del formulario."
                            )
                        );

                        return;

                    }

                }

                /*
                 * -------------------------------------------------
                 * 4. Vencimiento
                 * -------------------------------------------------
                 */

                const valoresSerializados =
                    serializeValues(
                        campos,
                        valoresPreparados
                    );

                if (
                    concepto
                        .usa_vencimiento &&
                    !fechaVencimiento
                ) {

                    setError(
                        "Debe ingresar la fecha de vencimiento."
                    );

                    return;

                }


                /*
                 * -------------------------------------------------
                 * 5. Archivos obligatorios
                 * -------------------------------------------------
                 */

                if (
                    !archivosValidation
                        .valid
                ) {

                    const nombres =
                        archivosValidation
                            .faltantes
                            ?.map(
                                (item) =>
                                    item
                                        ?.tipo
                                        ?.nombre
                            )
                            .filter(
                                Boolean
                            ) ||
                        [];


                    setError(

                        nombres.length > 0

                            ? `Debe agregar los archivos obligatorios: ${nombres.join(", ")}.`

                            : "Debe agregar todos los archivos obligatorios."

                    );

                    return;

                }


                /*
                 * -------------------------------------------------
                 * A partir de este punto comienza la persistencia.
                 * -------------------------------------------------
                 */

                setSaving(
                    true
                );


                try {

                    /*
                     * -------------------------------------------------
                     * 6. Crear registro
                     * -------------------------------------------------
                     *
                     * El backend crea:
                     *
                     * MotorConceptoRegistro
                     * MotorConceptoRegistroVersion #1
                     * valores
                     */

                    const registroCreado =
                        await motorConceptoRegistroApi
                            .crearConArchivos(
                                {
                                    concepto_id:
                                        Number(
                                            conceptoId
                                        ),

                                    entidad_tipo_id:
                                        Number(
                                            entidadTipoId
                                        ),

                                    entidad_id:
                                        Number(
                                            entidadId
                                        ),

                                    observaciones:
                                        observaciones
                                            .trim() ||
                                        null,

                                    fecha_vencimiento:
                                        concepto
                                            .usa_vencimiento
                                            ? fechaVencimiento
                                            : null,

                                    valores:
                                        valoresSerializados,
                                },

                                archivos
                            );

                    const registroId =
                        registroCreado?.id;

                    if (
                        !registroId
                    ) {
                        throw new Error(
                            "No se pudo obtener el identificador del registro creado"
                        );
                    }


                    /*
                     * -------------------------------------------------
                     * 7. Subir archivos
                     * -------------------------------------------------
                     */

                    // for (
                    //     const archivo
                    //     of archivos
                    // ) {

                    //     await motorConceptoRegistroApi
                    //         .subirArchivo(
                    //             registroId,
                    //             {
                    //                 file:
                    //                     archivo.file,

                    //                 archivo_tipo_id:
                    //                     Number(
                    //                         archivo
                    //                             .archivo_tipo_id
                    //                     ),

                    //                 nombre_logico:
                    //                     archivo
                    //                         .nombre_logico,
                    //             }
                    //         );

                    // }


                    /*
                     * -------------------------------------------------
                     * 8. Validación backend
                     * -------------------------------------------------
                     *
                     * Aunque el frontend ya verificó los archivos,
                     * mantenemos la validación del servidor.
                     */

                    /* await motorConceptoRegistroApi
                        .validarArchivosObligatorios(
                            registroId
                        );    */


                    /*
                     * -------------------------------------------------
                     * 9. Estado definitivo
                     * -------------------------------------------------
                     */

                    // await motorConceptoRegistroApi
                    //     .cambiarEstado(
                    //         registroId,
                    //         "VIGENTE"
                    //     );


                    volverDocumental();

                    /*
                     * -------------------------------------------------
                     * 10. Volver a Gestión Documental
                     * -------------------------------------------------
                     */




                } catch (
                err
                ) {

                    setError(
                        getErrorMessage(
                            err,
                            "No se pudo crear el registro documental."
                        )
                    );

                } finally {

                    setSaving(
                        false
                    );

                }

            };


        /*
         * =========================================================
         * LOADING
         * =========================================================
         */

        if (
            loading
        ) {

            return (

                <ERPPage

                    title="Nuevo registro documental"

                    subtitle={
                        entidadNombre
                    }

                >

                    <ERPCard>

                        <div
                            className="text-center p-5"
                        >

                            <Spinner />

                            <div
                                className="mt-3"
                            >

                                Cargando concepto...

                            </div>

                        </div>

                    </ERPCard>

                </ERPPage>

            );

        }


        /*
         * =========================================================
         * RENDER
         * =========================================================
         */

        return (

            <ERPPage

                title="Nuevo registro documental"

                subtitle={
                    entidadNombre
                }

            >

                {
                    error && (

                        <Alert
                            variant="danger"
                            className="mb-3"
                        >

                            {error}

                        </Alert>

                    )
                }


                {/*
     * =========================================================
     * FORMULARIO
     * =========================================================
     */}

                <ERPCard>

                    <EntidadDocumentoRegistroForm

                        ref={
                            formRef
                        }

                        concepto={
                            concepto
                        }

                        entidadNombre={
                            entidadNombre
                        }

                        entidadTipoNombre={
                            entidadTipoNombre
                        }

                        fields={
                            campos
                        }

                        rules={
                            reglas
                        }

                        values={
                            values
                        }

                        fechaVencimiento={
                            fechaVencimiento
                        }

                        observaciones={
                            observaciones
                        }

                        disabled={
                            saving
                        }

                        onValueChange={
                            handleValueChange
                        }

                        onFechaVencimientoChange={
                            setFechaVencimiento
                        }

                        onObservacionesChange={
                            setObservaciones
                        }

                    />

                </ERPCard>


                {/*
     * =========================================================
     * ARCHIVOS
     * =========================================================
     */}

                {
                    archivoTipos.length >
                    0 && (

                        <ERPCard
                            className="mt-3"
                        >

                            <div
                                className="
                        d-flex
                        flex-column
                        flex-sm-row
                        justify-content-sm-between
                        align-items-sm-center
                        gap-1
                        mb-3
                    "
                            >

                                <div>

                                    <h5
                                        className="mb-1"
                                    >
                                        Archivos
                                    </h5>

                                    <div
                                        className="small text-muted"
                                    >
                                        Adjunte la documentación requerida.
                                    </div>

                                </div>

                            </div>


                            <EntidadDocumentoArchivos

                                archivoTipos={
                                    archivoTipos
                                }

                                archivos={
                                    archivos
                                }

                                disabled={
                                    saving
                                }

                                onChange={
                                    setArchivos
                                }

                                onValidationChange={
                                    handleArchivosValidation
                                }

                            />

                        </ERPCard>

                    )
                }


                {/*
     * =========================================================
     * ACCIONES
     * =========================================================
     *
     * Mobile:
     * botones de ancho completo.
     *
     * Desktop:
     * botones alineados a la derecha.
     * =========================================================
     */}

                <div
                    className="
            d-flex
            flex-column-reverse
            flex-sm-row
            justify-content-sm-end
            gap-2
            mt-3
            mb-3
        "
                >

                    <div
                        className="
                d-grid
                d-sm-block
            "
                    >

                        <ERPButton

                            type="cancel"

                            disabled={
                                saving
                            }

                            onClick={
                                handleCancel
                            }

                        />

                    </div>


                    <div
                        className="
                d-grid
                d-sm-block
            "
                    >

                        <ERPButton

                            type="save"

                            label={
                                saving
                                    ? "Guardando..."
                                    : "Guardar"
                            }

                            disabled={
                                saving ||
                                !concepto
                            }

                            onClick={
                                handleSave
                            }

                        />

                    </div>

                </div>

            </ERPPage>

            // <ERPPage

            //     title="Nuevo registro documental"

            //     subtitle={
            //         entidadNombre
            //     }

            // >

            //     {
            //         error && (

            //             <Alert
            //                 variant="danger"
            //             >

            //                 {error}

            //             </Alert>

            //         )
            //     }


            //     <ERPCard>

            //         <EntidadDocumentoRegistroForm

            //             ref={
            //                 formRef
            //             }

            //             concepto={
            //                 concepto
            //             }

            //             entidadNombre={
            //                 entidadNombre
            //             }

            //             entidadTipoNombre={
            //                 entidadTipoNombre
            //             }

            //             fields={
            //                 campos
            //             }

            //             rules={
            //                 reglas
            //             }

            //             values={
            //                 values
            //             }

            //             fechaVencimiento={
            //                 fechaVencimiento
            //             }

            //             observaciones={
            //                 observaciones
            //             }

            //             disabled={
            //                 saving
            //             }

            //             onValueChange={
            //                 handleValueChange
            //             }

            //             onFechaVencimientoChange={
            //                 setFechaVencimiento
            //             }

            //             onObservacionesChange={
            //                 setObservaciones
            //             }

            //         />

            //     </ERPCard>


            //     {
            //         archivoTipos.length >
            //         0 && (

            //             <ERPCard
            //                 className="mt-3"
            //             >

            //                 <h5
            //                     className="mb-3"
            //                 >

            //                     Archivos

            //                 </h5>


            //                 <EntidadDocumentoArchivos

            //                     archivoTipos={
            //                         archivoTipos
            //                     }

            //                     archivos={
            //                         archivos
            //                     }

            //                     disabled={
            //                         saving
            //                     }

            //                     onChange={
            //                         setArchivos
            //                     }

            //                     onValidationChange={
            //                         handleArchivosValidation
            //                     }

            //                 />

            //             </ERPCard>

            //         )
            //     }


            //     <div
            //         className="d-flex justify-content-end gap-2 mt-3"
            //     >

            //         <ERPButton

            //             type="cancel"

            //             disabled={
            //                 saving
            //             }

            //             onClick={
            //                 handleCancel
            //             }

            //         />


            //         <ERPButton

            //             type="save"

            //             label={
            //                 saving
            //                     ? "Guardando..."
            //                     : "Guardar"
            //             }

            //             disabled={
            //                 saving ||
            //                 !concepto
            //             }

            //             onClick={
            //                 handleSave
            //             }

            //         />

            //     </div>

            // </ERPPage>

        );

    };


export default EntidadDocumentoRegistroPage;