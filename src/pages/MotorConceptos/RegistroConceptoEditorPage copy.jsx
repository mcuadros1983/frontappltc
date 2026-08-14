import React, {
    useRef,
    useState,
} from "react";

import {
    Alert,
    Form,
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

import FormRenderer
    from "../../components/motorConceptos/renderer/FormRenderer";

import RegistroArchivosPanel
    from "../../components/motorConceptos/registro/RegistroArchivosPanel";

import RegistroAutosaveStatus
    from "../../components/motorConceptos/registro/RegistroAutosaveStatus";

import RegistroHeader
    from "../../components/motorConceptos/registro/RegistroHeader";

import RegistroNuevaVersionModal
    from "../../components/motorConceptos/registro/RegistroNuevaVersionModal";

import RegistroToolbar
    from "../../components/motorConceptos/registro/RegistroToolbar";

import useRegistroAutosave
    from "../../hooks/useRegistroAutosave";

import useRegistroConcepto
    from "../../hooks/useRegistroConcepto";

import {
    useSecurity,
} from "../../security/SecurityContext";

const RegistroConceptoEditorPage = () => {
    const {
        registroId,
    } = useParams();

    const navigate =
        useNavigate();


    const isNew =
        registroId === "nuevo";

    const formRef =
        useRef(null);

    const {
        can,
    } = useSecurity();


    const registro =
        useRegistroConcepto(
            isNew
                ? null
                : registroId
        );

    const {
        datosIniciales,
        setDatosIniciales,
    } = registro;

    const handleDatoInicial =
        (field) =>
            (event) => {

                setDatosIniciales({
                    ...datosIniciales,
                    [field]:
                        event.target.value,
                });

            };

    const [
        activeTab,
        setActiveTab,
    ] = useState("datos");

    const [
        validationErrors,
        setValidationErrors,
    ] = useState({});

    const [
        ruleError,
        setRuleError,
    ] = useState("");

    const [
        autosaveEnabled,
        setAutosaveEnabled,
    ] = useState(false);

    const [
        showVersionModal,
        setShowVersionModal,
    ] = useState(false);

    const canUpdate =
        can(
            "motorconceptos:registros.update"
        );

    const readOnly =
        !isNew &&
        (
            !canUpdate ||
            [
                "ANULADO",
                "VENCIDO",
            ].includes(
                registro.registro?.estado
            )
        );
    const prepareAction =
        () => {
            setRuleError("");

            const result =
                formRef.current
                    ?.prepareSave();

            if (
                result &&
                !result.valid
            ) {
                setValidationErrors(
                    result.errors ||
                    {}
                );

                setRuleError(
                    "El formulario contiene errores y no puede guardarse."
                );

                setActiveTab(
                    "datos"
                );

                return false;
            }

            return true;
        };

    const handleSave =
        async () => {

            if (
                !prepareAction()
            ) {
                return;
            }

            const response =
                await registro.guardar();

            if (
                isNew &&
                response?.id
            ) {

                navigate(
                    `/motor-conceptos/registros/${response.id}`,
                    {
                        replace: true,
                    }
                );

            }

        };

    const handleSaveDraft =
        async () => {

            formRef.current
                ?.runEvent(
                    "ON_SAVE",
                    {
                        validate: false,
                    }
                );

            const response =
                await registro.guardarBorrador();

            if (
                isNew &&
                response?.id
            ) {

                navigate(
                    `/motor-conceptos/registros/${response.id}`,
                    {
                        replace: true,
                    }
                );

            }

        };

    const handleFinish =
        async () => {
            if (
                !prepareAction()
            ) {
                return;
            }

            await registro.finalizar();
        };

    const autosaveStatus =
        useRegistroAutosave({
            enabled:
                autosaveEnabled &&
                !readOnly &&
                !registro.loading,

            values:
                registro.valores,

            save:
                async () => {
                    formRef.current
                        ?.runEvent(
                            "ON_SAVE",
                            {
                                validate:
                                    false,
                            }
                        );

                    await registro.guardar({
                        silencioso:
                            true,
                    });
                },
        });

    if (
        registro.loading &&
        !registro.registro
    ) {
        return (
            <ERPPage title="Registro">
                <ERPCard>
                    <div className="p-5 text-center">
                        <Spinner />
                    </div>
                </ERPCard>
            </ERPPage>
        );
    }

    const archivoTipos =
        registro.concepto
            ?.archivosTipos ||
        registro.concepto
            ?.archivoTipos ||
        registro.concepto
            ?.archivo_tipos ||
        [];

    return (
        <ERPPage
            title={
                isNew
                    ? "Nuevo registro"
                    : (
                        registro.concepto?.nombre ||
                        "Registro de concepto"
                    )
            }

            subtitle={
                isNew
                    ? "Creación de registro"
                    : "Formulario dinámico"
            }

            actions={
                <div className="d-flex gap-2 align-items-center">
                    <RegistroAutosaveStatus
                        status={
                            autosaveStatus
                        }
                    />

                    <ERPButton
                        type="refresh"
                        onClick={
                            registro.cargar
                        }
                    />

                    <ERPButton
                        type="back"
                        onClick={() =>
                            navigate(
                                "/motor-conceptos/registros"
                            )
                        }
                    />
                </div>
            }
        >
            {
                (
                    registro.error ||
                    ruleError
                ) && (
                    <Alert
                        variant="danger"
                        dismissible
                        onClose={() => {
                            registro.clearMessages();
                            setRuleError("");
                        }}
                    >
                        {
                            registro.error ||
                            ruleError
                        }
                    </Alert>
                )
            }

            {
                registro.message && (
                    <Alert
                        variant="success"
                        dismissible
                        onClose={
                            registro.clearMessages
                        }
                    >
                        {
                            registro.message
                        }
                    </Alert>
                )
            }

            <ERPCard>
                <RegistroHeader
                    registro={
                        registro.registro
                    }
                />
            </ERPCard>

            <ERPCard>
                <div className="d-flex justify-content-end mb-3">
                    <Form.Check
                        type="switch"
                        label="Autoguardado"
                        checked={
                            autosaveEnabled
                        }
                        disabled={
                            readOnly
                        }
                        onChange={(event) =>
                            setAutosaveEnabled(
                                event.target.checked
                            )
                        }
                    />
                </div>

                <Tabs
                    activeKey={
                        activeTab
                    }
                    onSelect={(key) =>
                        setActiveTab(key)
                    }
                    mountOnEnter
                    unmountOnExit={false}
                >
                    <Tab
                        eventKey="datos"
                        title="Datos"
                    >
                        <div className="pt-4">

                            
                            <FormRenderer
                                ref={
                                    formRef
                                }

                                fields={
                                    registro.campos
                                }

                                rules={
                                    registro.reglas
                                }

                                values={
                                    registro.valores
                                }

                                disabled={
                                    readOnly ||
                                    registro.saving
                                }

                                onChange={
                                    registro.setValor
                                }

                                onValidationChange={
                                    setValidationErrors
                                }
                            />
                        </div>
                    </Tab>

                    <Tab
                        eventKey="archivos"
                        title="Archivos"
                    >
                        <div className="pt-4">
                            <RegistroArchivosPanel
                                registroId={
                                    registroId
                                }

                                archivoTipos={
                                    archivoTipos
                                }

                                readOnly={
                                    readOnly
                                }
                            />
                        </div>
                    </Tab>
                </Tabs>
            </ERPCard>

            <ERPCard>
                <RegistroToolbar
                    saving={
                        registro.saving
                    }

                    readOnly={
                        readOnly
                    }

                    hasErrors={
                        Object.keys(
                            validationErrors
                        ).length > 0
                    }

                    onSave={
                        handleSave
                    }

                    onSaveDraft={
                        handleSaveDraft
                    }

                    onFinish={
                        handleFinish
                    }

                    onNewVersion={() =>
                        setShowVersionModal(
                            true
                        )
                    }

                    onHistory={() =>
                        navigate(
                            `/motor-conceptos/registros/${registroId}/historial`
                        )
                    }
                />
            </ERPCard>

            <RegistroNuevaVersionModal
                show={
                    showVersionModal
                }

                saving={
                    registro.saving
                }

                onHide={() =>
                    !registro.saving &&
                    setShowVersionModal(
                        false
                    )
                }

                onSubmit={
                    registro.crearVersion
                }
            />
        </ERPPage>
    );
};

export default RegistroConceptoEditorPage;
