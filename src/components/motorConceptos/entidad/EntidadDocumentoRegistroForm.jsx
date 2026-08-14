import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
} from "react";

import {
    Alert,
    Col,
    Form,
    Row,
} from "react-bootstrap";

import FormRenderer
    from "../renderer/FormRenderer";


const EntidadDocumentoRegistroForm =
    forwardRef(
        (
            {

                concepto,

                entidadNombre,

                entidadTipoNombre,

                fields = [],

                rules = [],

                values = {},

                fechaVencimiento = "",

                observaciones = "",

                disabled = false,

                onValueChange,

                onFechaVencimientoChange,

                onObservacionesChange,

            },
            ref
        ) => {

            const formRendererRef =
                useRef(null);


            /*
             * Exponemos al Page únicamente
             * las operaciones que necesita
             * para validar y preparar
             * el registro.
             */
            useImperativeHandle(
                ref,
                () => ({

                    validate:
                        () => {

                            if (
                                !formRendererRef
                                    .current
                            ) {

                                return {
                                    valid: true,
                                    errors: {},
                                };

                            }

                            return formRendererRef
                                .current
                                .validate();

                        },


                    prepareSave:
                        () => {

                            if (
                                !formRendererRef
                                    .current
                            ) {

                                return values;

                            }

                            return formRendererRef
                                .current
                                .prepareSave();

                        },


                    getValues:
                        () => {

                            if (
                                !formRendererRef
                                    .current
                            ) {

                                return values;

                            }

                            return formRendererRef
                                .current
                                .getValues();

                        },


                    runEvent:
                        (
                            eventName,
                            context
                        ) => {

                            if (
                                !formRendererRef
                                    .current
                            ) {
                                return null;
                            }

                            return formRendererRef
                                .current
                                .runEvent(
                                    eventName,
                                    context
                                );

                        },

                }),
                [
                    values,
                ]
            );


            if (
                !concepto
            ) {

                return (

                    <Alert
                        variant="warning"
                    >

                        No se pudo cargar
                        la configuración del concepto.

                    </Alert>

                );

            }


            // return (

            //     <>

            //         <Row
            //             className="g-3 mb-4"
            //         >

            //             <Col
            //                 xs={12}
            //                 md={6}
            //             >

            //                 <Form.Group>

            //                     <Form.Label>
            //                         Entidad
            //                     </Form.Label>

            //                     <Form.Control

            //                         value={
            //                             entidadNombre ||
            //                             "-"
            //                         }

            //                         disabled

            //                         readOnly

            //                     />

            //                 </Form.Group>

            //             </Col>


            //             <Col
            //                 xs={12}
            //                 md={6}
            //             >

            //                 <Form.Group>

            //                     <Form.Label>
            //                         Tipo de entidad
            //                     </Form.Label>

            //                     <Form.Control

            //                         value={
            //                             entidadTipoNombre ||
            //                             "-"
            //                         }

            //                         disabled

            //                         readOnly

            //                     />

            //                 </Form.Group>

            //             </Col>


            //             <Col
            //                 xs={12}
            //                 md={6}
            //             >

            //                 <Form.Group>

            //                     <Form.Label>
            //                         Concepto
            //                     </Form.Label>

            //                     <Form.Control

            //                         value={
            //                             concepto.nombre ||
            //                             "-"
            //                         }

            //                         disabled

            //                         readOnly

            //                     />

            //                 </Form.Group>

            //             </Col>


            //             <Col
            //                 xs={12}
            //                 md={6}
            //             >

            //                 <Form.Group>

            //                     <Form.Label>
            //                         Código
            //                     </Form.Label>

            //                     <Form.Control

            //                         value={
            //                             concepto.codigo ||
            //                             "-"
            //                         }

            //                         disabled

            //                         readOnly

            //                     />

            //                 </Form.Group>

            //             </Col>

            //         </Row>


            //         {
            //             concepto.descripcion && (

            //                 <Alert
            //                     variant="info"
            //                 >

            //                     {
            //                         concepto.descripcion
            //                     }

            //                 </Alert>

            //             )
            //         }


            //         {
            //             fields.length > 0 && (

            //                 <div
            //                     className="mb-4"
            //                 >

            //                     <h5
            //                         className="mb-3"
            //                     >
            //                         Datos
            //                     </h5>

            //                     <FormRenderer

            //                         ref={
            //                             formRendererRef
            //                         }

            //                         fields={
            //                             fields
            //                         }

            //                         rules={
            //                             rules
            //                         }

            //                         values={
            //                             values
            //                         }

            //                         disabled={
            //                             disabled
            //                         }

            //                         onChange={
            //                             onValueChange
            //                         }

            //                     />

            //                 </div>

            //             )
            //         }


            //         {
            //             concepto
            //                 .usa_vencimiento && (

            //                 <Row
            //                     className="g-3 mb-4"
            //                 >

            //                     <Col
            //                         xs={12}
            //                         md={6}
            //                     >

            //                         <Form.Group>

            //                             <Form.Label>
            //                                 Fecha de vencimiento *
            //                             </Form.Label>

            //                             <Form.Control

            //                                 type="date"

            //                                 value={
            //                                     fechaVencimiento ||
            //                                     ""
            //                                 }

            //                                 disabled={
            //                                     disabled
            //                                 }

            //                                 onChange={
            //                                     (
            //                                         event
            //                                     ) =>
            //                                         onFechaVencimientoChange?.(
            //                                             event.target.value
            //                                         )
            //                                 }

            //                             />

            //                         </Form.Group>

            //                     </Col>

            //                 </Row>

            //             )
            //         }


            //         <Row
            //             className="g-3"
            //         >

            //             <Col
            //                 xs={12}
            //             >

            //                 <Form.Group>

            //                     <Form.Label>
            //                         Observaciones
            //                     </Form.Label>

            //                     <Form.Control

            //                         as="textarea"

            //                         rows={3}

            //                         value={
            //                             observaciones ||
            //                             ""
            //                         }

            //                         disabled={
            //                             disabled
            //                         }

            //                         onChange={
            //                             (
            //                                 event
            //                             ) =>
            //                                 onObservacionesChange?.(
            //                                     event.target.value
            //                                 )
            //                         }

            //                     />

            //                 </Form.Group>

            //             </Col>

            //         </Row>

            //     </>

            // );

            return (

                <div className="entidad-documento-registro-form">

                    {/*
         * =====================================================
         * INFORMACIÓN DEL DOCUMENTO
         * =====================================================
         *
         * Mobile:
         * una columna.
         *
         * Desktop:
         * dos columnas.
         */}

                    <div
                        className="
                border
                rounded
                p-3
                mb-4
                bg-light
            "
                    >

                        <div
                            className="
                    fw-semibold
                    mb-3
                "
                        >
                            Información
                        </div>

                        <Row
                            className="g-3"
                        >

                            <Col
                                xs={12}
                                md={6}
                            >

                                <Form.Group>

                                    <Form.Label
                                        className="
                                small
                                text-muted
                                mb-1
                            "
                                    >
                                        Entidad
                                    </Form.Label>

                                    <Form.Control
                                        value={
                                            entidadNombre ||
                                            "-"
                                        }
                                        disabled
                                        readOnly
                                    />

                                </Form.Group>

                            </Col>


                            <Col
                                xs={12}
                                md={6}
                            >

                                <Form.Group>

                                    <Form.Label
                                        className="
                                small
                                text-muted
                                mb-1
                            "
                                    >
                                        Tipo de entidad
                                    </Form.Label>

                                    <Form.Control
                                        value={
                                            entidadTipoNombre ||
                                            "-"
                                        }
                                        disabled
                                        readOnly
                                    />

                                </Form.Group>

                            </Col>


                            <Col
                                xs={12}
                                md={6}
                            >

                                <Form.Group>

                                    <Form.Label
                                        className="
                                small
                                text-muted
                                mb-1
                            "
                                    >
                                        Concepto
                                    </Form.Label>

                                    <Form.Control
                                        value={
                                            concepto.nombre ||
                                            "-"
                                        }
                                        disabled
                                        readOnly
                                    />

                                </Form.Group>

                            </Col>


                            <Col
                                xs={12}
                                md={6}
                            >

                                <Form.Group>

                                    <Form.Label
                                        className="
                                small
                                text-muted
                                mb-1
                            "
                                    >
                                        Código
                                    </Form.Label>

                                    <Form.Control
                                        value={
                                            concepto.codigo ||
                                            "-"
                                        }
                                        disabled
                                        readOnly
                                    />

                                </Form.Group>

                            </Col>

                        </Row>

                    </div>


                    {/*
         * =====================================================
         * DESCRIPCIÓN
         * =====================================================
         */}

                    {
                        concepto.descripcion && (

                            <Alert
                                variant="info"
                                className="mb-4"
                            >

                                {
                                    concepto.descripcion
                                }

                            </Alert>

                        )
                    }


                    {/*
         * =====================================================
         * CAMPOS DINÁMICOS
         * =====================================================
         *
         * No modificamos FormRenderer.
         *
         * Esto protege:
         * - reglas
         * - validaciones
         * - visibilidad
         * - obligatoriedad
         * - eventos
         * - valores
         */}

                    {
                        fields.length > 0 && (

                            <div
                                className="mb-4"
                            >

                                <div
                                    className="
                            fw-semibold
                            fs-5
                            mb-3
                        "
                                >
                                    Datos
                                </div>

                                <FormRenderer

                                    ref={
                                        formRendererRef
                                    }

                                    fields={
                                        fields
                                    }

                                    rules={
                                        rules
                                    }

                                    values={
                                        values
                                    }

                                    disabled={
                                        disabled
                                    }

                                    onChange={
                                        onValueChange
                                    }

                                />

                            </div>

                        )
                    }


                    {/*
         * =====================================================
         * VENCIMIENTO
         * =====================================================
         */}

                    {
                        concepto
                            .usa_vencimiento && (

                            <div
                                className="
                        border
                        rounded
                        p-3
                        mb-4
                    "
                            >

                                <div
                                    className="
                            fw-semibold
                            mb-3
                        "
                                >
                                    Vencimiento
                                </div>

                                <Row
                                    className="g-3"
                                >

                                    <Col
                                        xs={12}
                                        md={6}
                                    >

                                        <Form.Group>

                                            <Form.Label>
                                                Fecha de vencimiento *
                                            </Form.Label>

                                            <Form.Control

                                                type="date"

                                                value={
                                                    fechaVencimiento ||
                                                    ""
                                                }

                                                disabled={
                                                    disabled
                                                }

                                                onChange={
                                                    (
                                                        event
                                                    ) =>
                                                        onFechaVencimientoChange?.(
                                                            event.target.value
                                                        )
                                                }

                                            />

                                        </Form.Group>

                                    </Col>

                                </Row>

                            </div>

                        )
                    }


                    {/*
         * =====================================================
         * OBSERVACIONES
         * =====================================================
         */}

                    <div
                        className="
                border
                rounded
                p-3
            "
                    >

                        <Form.Group>

                            <Form.Label
                                className="fw-semibold"
                            >
                                Observaciones
                            </Form.Label>

                            <Form.Control

                                as="textarea"

                                rows={4}

                                value={
                                    observaciones ||
                                    ""
                                }

                                disabled={
                                    disabled
                                }

                                placeholder="Ingrese una observación si corresponde"

                                onChange={
                                    (
                                        event
                                    ) =>
                                        onObservacionesChange?.(
                                            event.target.value
                                        )
                                }

                            />

                        </Form.Group>

                    </div>

                </div>

            );
        }
    );


EntidadDocumentoRegistroForm.displayName =
    "EntidadDocumentoRegistroForm";


export default EntidadDocumentoRegistroForm;