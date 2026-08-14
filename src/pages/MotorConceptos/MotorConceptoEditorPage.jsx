import React, {
    useState,
} from "react";

import {
    Alert,
    Spinner,
    Tab,
    Tabs,
} from "react-bootstrap";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    ERPButton,
    ERPCard,
    ERPPage,
} from "../../components/common/erp";

import ArchivosTab
    from "../../components/motorConceptos/editor/ArchivosTab";

import CamposTab
    from "../../components/motorConceptos/editor/CamposTab";

import GeneralTab
    from "../../components/motorConceptos/editor/GeneralTab";

import ListasTab
    from "../../components/motorConceptos/editor/ListasTab";

import ReglasTab
    from "../../components/motorConceptos/editor/ReglasTab";

import useMotorConceptoEditor
    from "../../hooks/useMotorConceptoEditor";

import {
    useSecurity,
} from "../../security/SecurityContext";

const MotorConceptoEditorPage = () => {

    const {
        id,
    } = useParams();

    const navigate =
        useNavigate();

    const {
        can,
    } = useSecurity();

    const [
        activeTab,
        setActiveTab,
    ] = useState("general");

    const editor =
        useMotorConceptoEditor(id);

    const canConfig =
        can(
            "motorconceptos:config"
        ) ||
        can(
            "motorconceptos:update"
        );

    if (
        editor.loading &&
        !editor.concepto
    ) {
        return (
            <ERPPage
                title="Motor de Conceptos"
            >
                <ERPCard>
                    <div className="text-center p-5">
                        <Spinner />
                    </div>
                </ERPCard>
            </ERPPage>
        );
    }

    return (
        <ERPPage
            title={
                editor.concepto
                    ? editor.concepto.nombre
                    : "Editar concepto"
            }
            subtitle="Configuración del Motor de Conceptos"
            actions={
                <div className="d-flex gap-2">
                    <ERPButton
                        type="refresh"
                        disabled={
                            editor.loading
                        }
                        onClick={
                            editor.reload
                        }
                    />

                    <ERPButton
                        type="back"
                        onClick={() =>
                            navigate(
                                "/motor-conceptos"
                            )
                        }
                    />
                </div>
            }
        >
            {
                editor.error && (
                    <Alert
                        variant="danger"
                        dismissible
                        onClose={
                            editor.clearMessages
                        }
                    >
                        {editor.error}
                    </Alert>
                )
            }

            {
                editor.message && (
                    <Alert
                        variant="success"
                        dismissible
                        onClose={
                            editor.clearMessages
                        }
                    >
                        {editor.message}
                    </Alert>
                )
            }

            <ERPCard>
                <Tabs
                    activeKey={
                        activeTab
                    }
                    onSelect={(key) =>
                        setActiveTab(key)
                    }
                    mountOnEnter
                    unmountOnExit={false}
                    className="mb-4"
                >
                    <Tab
                        eventKey="general"
                        title="General"
                    >
                        <GeneralTab
                            concepto={
                                editor.concepto
                            }
                            entidadTipos={
                                editor.entidadTipos
                            }
                            saving={
                                editor.saving
                            }
                            canConfig={
                                canConfig
                            }
                            onSave={
                                editor.actualizarGeneral
                            }
                        />
                    </Tab>

                    <Tab
                        eventKey="campos"
                        title="Campos"
                    >
                        <CamposTab
                            campos={
                                editor.concepto
                                    ?.campos ||
                                []
                            }
                            saving={
                                editor.saving
                            }
                            canConfig={
                                canConfig
                            }
                            onCreate={
                                editor.crearCampo
                            }
                            onUpdate={
                                editor.actualizarCampo
                            }
                            onDelete={
                                editor.eliminarCampo
                            }
                        />
                    </Tab>

                    <Tab
                        eventKey="listas"
                        title="Listas"
                    >
                        <ListasTab
                            campos={
                                editor.concepto
                                    ?.campos ||
                                []
                            }
                            saving={
                                editor.saving
                            }
                            canConfig={
                                canConfig
                            }
                            onUpdate={
                                editor.actualizarCampo
                            }
                        />
                    </Tab>

                    <Tab
                        eventKey="archivos"
                        title="Archivos"
                    >
                        <ArchivosTab
                            items={
                                editor.concepto
                                    ?.archivosTipos ||
                                []
                            }
                            saving={
                                editor.saving
                            }
                            canConfig={
                                canConfig
                            }
                            onCreate={
                                editor.crearArchivoTipo
                            }
                            onUpdate={
                                editor.actualizarArchivoTipo
                            }
                            onDelete={
                                editor.eliminarArchivoTipo
                            }
                        />
                    </Tab>

                    <Tab
                        eventKey="reglas"
                        title="Reglas"
                    >
                        <ReglasTab
                            reglas={
                                editor.concepto
                                    ?.reglas ||
                                []
                            }
                            campos={
                                editor.concepto
                                    ?.campos ||
                                []
                            }
                            saving={
                                editor.saving
                            }
                            canConfig={
                                canConfig
                            }
                            onCreate={
                                editor.crearRegla
                            }
                            onUpdate={
                                editor.actualizarRegla
                            }
                            onDelete={
                                editor.eliminarRegla
                            }
                        />
                    </Tab>
                </Tabs>
            </ERPCard>
        </ERPPage>
    );
};

export default MotorConceptoEditorPage;
