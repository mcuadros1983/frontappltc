import React, {
    useEffect,
} from "react";

import {
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    ERPButton,
    ERPCard,
    ERPPage,
} from "../../components/common/erp";

import {
    MotorConceptoDocumentosFaltantesProvider,
    useMotorConceptoDocumentosFaltantes,
} from "../../context/MotorConceptoDocumentosFaltantesContext";

import MotorConceptoDocumentosFaltantesToolbar from "../../components/motorConceptos/MotorConceptoDocumentosFaltantesToolbar";
import MotorConceptoDocumentosFaltantesResumen from "../../components/motorConceptos/MotorConceptoDocumentosFaltantesResumen";
import MotorConceptoDocumentosFaltantesTable from "../../components/motorConceptos/MotorConceptoDocumentosFaltantesTable";

const Content = () => {

    const navigate = useNavigate();

    const location = useLocation();

    const {
        entidadTipoId,
        entidadId,
    } = useParams();

    const {

        loading,

        documentos,

        resumen,

        filtros,

        cargar,

        refresh,

    } = useMotorConceptoDocumentosFaltantes();

    useEffect(() => {

        if (
            entidadTipoId &&
            entidadId
        ) {

            cargar({

                entidad_tipo_id:
                    Number(entidadTipoId),

                entidad_id:
                    Number(entidadId),

            });

        }

    }, [
        entidadTipoId,
        entidadId,
    ]);

    const handleBack = () => {

        if (
            location.state?.fromLegajo &&
            location.state?.legajoPath
        ) {

            navigate(
                location.state.legajoPath,
                {
                    state:
                        location.state,
                }
            );

            return;

        }

        navigate(-1);

    };

    const handleOpen = (
        documento
    ) => {

        if (
            documento.registro_id
        ) {

            navigate(

                `/motor-conceptos/registros/${documento.registro_id}`,

                {

                    state: {

                        ...location.state,

                        fromDocumentosFaltantes: true,

                        documentosFaltantesPath:
                            location.pathname,

                    },

                }

            );

            return;

        }

        navigate(

            "/motor-conceptos/registros/nuevo",

            {

                state: {

                    ...location.state,

                    concepto_id:
                        documento.concepto_id,

                    entidad_tipo_id:
                        Number(entidadTipoId),

                    entidad_id:
                        Number(entidadId),

                    fromDocumentosFaltantes: true,

                    documentosFaltantesPath:
                        location.pathname,

                },

            }

        );

    };

    return (

        <ERPPage

            title="Documentos Faltantes"

            actions={

                <ERPButton.Group>

                    <MotorConceptoDocumentosFaltantesToolbar

                        loading={loading}

                        onRefresh={
                            refresh
                        }

                        onBack={
                            handleBack
                        }

                    />

                </ERPButton.Group>

            }

        >

            <MotorConceptoDocumentosFaltantesResumen

                resumen={
                    resumen
                }

            />

            <ERPCard>

                <MotorConceptoDocumentosFaltantesTable

                    loading={
                        loading
                    }

                    documentos={
                        documentos
                    }

                    onOpen={
                        handleOpen
                    }

                />

            </ERPCard>

        </ERPPage>

    );

};

const MotorConceptoDocumentosFaltantesPage =
    () => (

        <MotorConceptoDocumentosFaltantesProvider>

            <Content />

        </MotorConceptoDocumentosFaltantesProvider>

    );

export default MotorConceptoDocumentosFaltantesPage;