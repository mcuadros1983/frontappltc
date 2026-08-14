import React, {
    useCallback,
} from "react";

import {
    Row,
    Col,
} from "react-bootstrap";

import {
    useNavigate,
} from "react-router-dom";

import {

    ERPCard,

    ERPButton,

} from "../../../components/common/erp";

const MotorConceptoDashboardActions = ({

    entidadTipoId,

    entidadId,

    entidadNombre,

    entidadTipoNombre,

    onNuevo,

    onExportar,

    onActualizar,

    onHistorial,

}) => {

    const navigate =
        useNavigate();

    const abrirDocumentos =
        useCallback(() => {

            navigate(

                `/motor-conceptos/documentos-faltantes/${entidadTipoId}/${entidadId}`,

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

        }, [

            navigate,

            entidadTipoId,

            entidadId,

            entidadNombre,

            entidadTipoNombre,

        ]);

    const nuevoDocumento =
        useCallback(() => {

            if (onNuevo) {

                onNuevo();

                return;

            }

            navigate(

                "/motor-conceptos/registros/nuevo",

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

        }, [

            navigate,

            entidadTipoId,

            entidadId,

            entidadNombre,

            entidadTipoNombre,

            onNuevo,

        ]);

    const exportar =
        useCallback(() => {

            if (onExportar) {

                onExportar();

            }

        }, [

            onExportar,

        ]);

    const actualizar =
        useCallback(() => {

            if (onActualizar) {

                onActualizar();

            }

        }, [

            onActualizar,

        ]);

    const historial =
        useCallback(() => {

            if (onHistorial) {

                onHistorial();

                return;

            }

            navigate(

                `/motor-conceptos/historial/${entidadTipoId}/${entidadId}`,

                {

                    state: {

                        entidad_tipo_id:
                            entidadTipoId,

                        entidad_id:
                            entidadId,

                    },

                }

            );

        }, [

            navigate,

            entidadTipoId,

            entidadId,

            onHistorial,

        ]);

    return (

        <ERPCard
            title="Acciones"
        >

            <Row>

                <Col
                    xl={2}
                    lg={4}
                    md={6}
                    sm={12}
                    className="mb-2"
                >

                    <ERPButton

                        fullWidth

                        color="primary"

                        icon="description"

                        onClick={
                            abrirDocumentos
                        }

                    >

                        Ver documentos

                    </ERPButton>

                </Col>

                <Col
                    xl={2}
                    lg={4}
                    md={6}
                    sm={12}
                    className="mb-2"
                >

                    <ERPButton

                        fullWidth

                        color="success"

                        icon="add"

                        onClick={
                            nuevoDocumento
                        }

                    >

                        Nuevo documento

                    </ERPButton>

                </Col>

                {/* <Col
                    xl={2}
                    lg={4}
                    md={6}
                    sm={12}
                    className="mb-2"
                >

                    <ERPButton

                        fullWidth

                        color="info"

                        icon="history"

                        onClick={
                            historial
                        }

                    >

                        Historial

                    </ERPButton>

                </Col> */}

                <Col
                    xl={2}
                    lg={4}
                    md={6}
                    sm={12}
                    className="mb-2"
                >

                    <ERPButton

                        fullWidth

                        color="warning"

                        icon="refresh"

                        onClick={
                            actualizar
                        }

                    >

                        Actualizar

                    </ERPButton>

                </Col>

                <Col
                    xl={2}
                    lg={4}
                    md={6}
                    sm={12}
                    className="mb-2"
                >

                    <ERPButton

                        fullWidth

                        color="secondary"

                        icon="download"

                        onClick={
                            exportar
                        }

                    >

                        Exportar

                    </ERPButton>

                </Col>

            </Row>

        </ERPCard>

    );

};

export default React.memo(
    MotorConceptoDashboardActions
);