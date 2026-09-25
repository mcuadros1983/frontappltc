import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Alert,
} from "react-bootstrap";

import {
    ERPCard,
    ERPPage,
} from "../../components/common/erp";

import ConceptoDeleteModal
    from "../../components/motorConceptos/ConceptoDeleteModal";

import ConceptoModal
    from "../../components/motorConceptos/ConceptoModal";

import MotorConceptosFilters
    from "../../components/motorConceptos/MotorConceptosFilters";

import MotorConceptosPagination
    from "../../components/motorConceptos/MotorConceptosPagination";

import MotorConceptosTable
    from "../../components/motorConceptos/MotorConceptosTable";

import MotorConceptosToolbar
    from "../../components/motorConceptos/MotorConceptosToolbar";

import {
    MotorConceptosProvider,
    useMotorConceptosContext,
} from "../../context/MotorConceptosContext";

import {
    useSecurity,
} from "../../security/SecurityContext";

import exportarConceptosExcel
    from "../../utils/motorConceptos/exportarConceptosExcel";

import {
    useNavigate,
} from "react-router-dom";
import MotorConceptoImportModal
    from "../../components/motorConceptos/MotorConceptoImportModal";

import motorConceptoApi
    from "../../services/motorConceptoApi";

/*
Dentro de MotorConceptosContent:
*/

// const navigate = useNavigate();

// const obtenerEntidades = (concepto) => {

//     if (!Array.isArray(concepto?.entidades)) {
//         return [];
//     }

//     return concepto.entidades
//         .map((relacion) => relacion.entidadTipo)
//         .filter(Boolean);

// };

// const obtenerEntidad = (row) => {

//     console.log("Fila recibida:", row);

//     if (row?.entidad) {
//         console.log("Usando entidad:", row.entidad);
//         return row.entidad;
//     }

//     if (row?.entidad_tipo?.nombre) {
//         console.log("Usando entidad_tipo:", row.entidad_tipo.nombre);
//         return row.entidad_tipo.nombre;
//     }

//     if (row?.entidadTipo?.nombre) {
//         console.log("Usando entidadTipo:", row.entidadTipo.nombre);
//         return row.entidadTipo.nombre;
//     }

//     console.log(JSON.stringify(row, null, 2));

//     console.warn("No se encontró entidad para:", row);

//     return null;
// };

// const obtenerEntidades = (concepto) => {
//     if (!Array.isArray(concepto?.entidades)) {
//         return [];
//     }

//     return concepto.entidades
//         .map((relacion) => relacion?.entidadTipo)
//         .filter(Boolean);
// };




const MotorConceptosContent = () => {

    const navigate = useNavigate();

    const {
        can,
    } = useSecurity();

    const {
        conceptos,
        total,
        totalPages,
        loading,
        saving,
        deleting,
        error,
        message,
        filters,
        limpiarMensajes,
        actualizarFiltros,
        limpiarFiltros,
        cargar,
        crear,
        actualizar,
        eliminar,
    } =
        useMotorConceptosContext();

    // const entidades = useMemo(() => {

    //     const mapa = new Map();

    //     conceptos
    //         .flatMap(obtenerEntidades)
    //         .forEach((entidadTipo) => {

    //             if (!mapa.has(entidadTipo.id)) {

    //                 mapa.set(entidadTipo.id, {
    //                     id: entidadTipo.id,
    //                     codigo: entidadTipo.codigo,
    //                     nombre: entidadTipo.nombre,
    //                 });

    //             }

    //         });

    //     return Array
    //         .from(mapa.values())
    //         .sort((a, b) =>
    //             a.nombre.localeCompare(b.nombre)
    //         );

    // }, [conceptos]);

    // console.group("MotorConceptosContent");

    // console.log("Conceptos:", conceptos);
    // console.log("Total:", total);
    // console.log("Loading:", loading);
    // console.log("Filters:", filters);

    console.groupEnd();

    const [
        showForm,
        setShowForm,
    ] = useState(false);

    const [
        selected,
        setSelected,
    ] = useState(null);

    const [
        showDelete,
        setShowDelete,
    ] = useState(false);

    const [
        showImport,
        setShowImport,
    ] = useState(false);

    const [
        downloadingTemplate,
        setDownloadingTemplate,
    ] = useState(false);

    const [
        importMessage,
        setImportMessage,
    ] = useState("");

    const [
        importError,
        setImportError,
    ] = useState("");

    const [
        entidades,
        setEntidades,
    ] = useState([]);

    // const [conceptos, setConceptos] = useState([]);

    useEffect(() => {

        let mounted = true;

        const cargarEntidades =
            async () => {

                try {

                    const response =
                        await motorConceptoApi
                            .listarEntidadTipos();

                    if (!mounted) {
                        return;
                    }

                    const items =
                        Array.isArray(response)
                            ? response
                            : response?.items ||
                            response?.rows ||
                            [];

                    setEntidades(
                        [...items].sort(
                            (a, b) =>
                                String(
                                    a.nombre || ""
                                ).localeCompare(
                                    String(
                                        b.nombre || ""
                                    )
                                )
                        )
                    );

                } catch (error) {

                    if (!mounted) {
                        return;
                    }

                    console.error(
                        "No se pudieron cargar los tipos de entidad",
                        error
                    );

                    setEntidades([]);

                }

            };

        cargarEntidades();

        return () => {
            mounted = false;
        };

    }, []);

    const canDownloadTemplate =
        can(
            "motorconceptos:view"
        );

    const canImport =
        can(
            "motorconceptos:config"
        );

    const canCreate =
        can(
            "motorconceptos:create"
        );

    const canUpdate =
        can(
            "motorconceptos:update"
        );

    const canDelete =
        can(
            "motorconceptos:delete"
        );

    const canExport =
        can(
            "motorconceptos:view"
        ) ||
        can(
            "motorconceptos:config"
        );

    // const entidades =
    //     useMemo(
    //         () =>
    //             Array.from(
    //                 new Set(
    //                     conceptos
    //                         .map(
    //                             obtenerEntidad
    //                         )
    //                         .filter(Boolean)
    //                 )
    //             ).sort(),
    //         [conceptos]
    //     );

    // console.log("Entidades calculadas:", entidades);

    // const openNew = () => {
    //     limpiarMensajes();
    //     setSelected(null);
    //     setShowForm(true);
    // };

    const openNew = () => {

        // console.group("Nuevo concepto");

        // console.log("Abriendo modal");

        // console.groupEnd();

        limpiarMensajes();
        setSelected(null);
        setShowForm(true);
    };

    // const openEdit = (
    //     concepto
    // ) => {
    //     limpiarMensajes();
    //     setSelected(concepto);
    //     setShowForm(true);
    // };

    const openEdit = (concepto) => {

        // console.group("Editar concepto");

        // console.log("Concepto:", concepto);
        // console.log("ID:", concepto.id);

        // console.groupEnd();

        navigate(
            `/motor-conceptos/${concepto.id}`
        );
    };

    const closeForm = () => {
        if (saving) return;

        setShowForm(false);
        setSelected(null);
    };

    // const handleSave =
    //     async (payload) => {
    //         if (selected?.id) {
    //             await actualizar(
    //                 selected.id,
    //                 payload
    //             );
    //         } else {
    //             await crear(payload);
    //         }

    //         closeForm();
    //     };

    const handleDownloadTemplate =
        async () => {

            setDownloadingTemplate(
                true
            );

            setImportError("");
            setImportMessage("");


            try {

                const blob =
                    await motorConceptoApi
                        .descargarPlantilla();


                const url =
                    window.URL
                        .createObjectURL(
                            blob
                        );


                const link =
                    document.createElement(
                        "a"
                    );


                link.href = url;

                link.download =
                    "Plantilla_Motor_Conceptos.xlsx";


                document.body
                    .appendChild(
                        link
                    );


                link.click();

                link.remove();


                window.URL
                    .revokeObjectURL(
                        url
                    );


                setImportMessage(
                    "Plantilla descargada correctamente"
                );

            } catch (e) {

                setImportError(
                    e?.message ||
                    "No se pudo descargar la plantilla"
                );

            } finally {

                setDownloadingTemplate(
                    false
                );

            }

        };
    const handleImported =
        async (result) => {

            setImportError("");

            setImportMessage(
                `Importación finalizada. Creados: ${result?.creados ?? 0
                }, actualizados: ${result?.actualizados ?? 0
                }, omitidos: ${result?.omitidos ?? 0
                }.`
            );

            actualizarFiltros({
                buscar: "",
                activo: "",
                entidad_tipo_id: "",
                page: 1,
            });

        };

    const handleSave = async (payload) => {

        // console.group("Guardar concepto");

        // console.log("Selected:", selected);
        // console.log("Payload:", payload);

        console.groupEnd();

        if (selected?.id) {
            await actualizar(selected.id, payload);
        } else {
            await crear(payload);
        }

        closeForm();
    };


    const openDelete = (
        concepto
    ) => {
        limpiarMensajes();
        setSelected(concepto);
        setShowDelete(true);
    };

    const closeDelete = () => {
        if (deleting) return;

        setShowDelete(false);
        setSelected(null);
    };

    // const handleDelete =
    //     async () => {
    //         if (!selected?.id) return;

    //         await eliminar(
    //             selected.id
    //         );

    //         closeDelete();
    //     };

    const handleDelete = async () => {

        // console.group("Eliminar concepto");

        // console.log("Selected:", selected);

        // console.groupEnd();

        if (!selected?.id) return;

        await eliminar(selected.id);

        closeDelete();
    };

    const handleExport = () => {
        exportarConceptosExcel(
            conceptos
        );
    };

    return (
        <ERPPage
            title="Motor de Conceptos"
            subtitle="Administración de conceptos configurables"
            actions={
                <MotorConceptosToolbar
                    canCreate={
                        canCreate
                    }

                    canExport={
                        canExport
                    }

                    canImport={
                        canImport
                    }

                    canDownloadTemplate={
                        canDownloadTemplate
                    }

                    loading={
                        loading
                    }

                    importing={
                        downloadingTemplate
                    }

                    onNew={
                        openNew
                    }

                    onExport={
                        handleExport
                    }

                    onRefresh={
                        cargar
                    }

                    onImport={
                        () => {
                            setImportError("");
                            setImportMessage("");
                            setShowImport(true);
                        }
                    }

                    onDownloadTemplate={
                        handleDownloadTemplate
                    }
                />
            }
        >

            {
                error && (
                    <Alert
                        variant="danger"
                        dismissible
                        onClose={
                            limpiarMensajes
                        }
                    >
                        {error}
                    </Alert>
                )
            }

            {
                message && (
                    <Alert
                        variant="success"
                        dismissible
                        onClose={
                            limpiarMensajes
                        }
                    >
                        {message}
                    </Alert>
                )
            }

            {
                importError && (
                    <Alert variant="danger">
                        {importError}
                    </Alert>
                )
            }

            {
                importMessage && (
                    <Alert variant="success">
                        {importMessage}
                    </Alert>
                )
            }

            <MotorConceptosFilters
                filters={filters}
                entidades={entidades}
                disabled={loading}
                onChange={
                    actualizarFiltros
                }
                onSearch={
                    cargar
                }
                onClear={
                    limpiarFiltros
                }
            />

            <ERPCard>

                <MotorConceptosTable
                    conceptos={
                        conceptos
                    }
                    loading={
                        loading
                    }
                    canUpdate={
                        canUpdate
                    }
                    canDelete={
                        canDelete
                    }
                    onEdit={
                        openEdit
                    }
                    onDelete={
                        openDelete
                    }
                />

                <MotorConceptosPagination
                    page={
                        filters.page
                    }
                    limit={
                        filters.limit
                    }
                    total={total}
                    totalPages={
                        totalPages
                    }
                    disabled={
                        loading
                    }
                    onPageChange={
                        (page) =>
                            actualizarFiltros({
                                page,
                            })
                    }
                    onLimitChange={
                        (limit) =>
                            actualizarFiltros({
                                limit,
                                page: 1,
                            })
                    }
                />

            </ERPCard>

            <ConceptoModal
                show={showForm}
                concepto={selected}
                saving={saving}
                onHide={closeForm}
                onSubmit={
                    handleSave
                }
            />

            <MotorConceptoImportModal
                show={
                    showImport
                }

                onHide={
                    () =>
                        setShowImport(
                            false
                        )
                }

                onImported={
                    handleImported
                }
            />

            <ConceptoDeleteModal
                show={showDelete}
                concepto={selected}
                deleting={deleting}
                onHide={closeDelete}
                onConfirm={
                    handleDelete
                }
            />

        </ERPPage>
    );
};

const MotorConceptosPage = () => (
    <MotorConceptosProvider>
        <MotorConceptosContent />
    </MotorConceptosProvider>
);

export default MotorConceptosPage;
