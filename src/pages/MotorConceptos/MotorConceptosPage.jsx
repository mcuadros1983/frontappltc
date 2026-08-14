import React, {
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

/*
Dentro de MotorConceptosContent:
*/

// const navigate = useNavigate();

const obtenerEntidades = (concepto) => {

    if (!Array.isArray(concepto?.entidades)) {
        return [];
    }

    return concepto.entidades
        .map((relacion) => relacion.entidadTipo)
        .filter(Boolean);

};



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

    const entidades = useMemo(() => {

        const mapa = new Map();

        conceptos
            .flatMap(obtenerEntidades)
            .forEach((entidadTipo) => {

                if (!mapa.has(entidadTipo.id)) {

                    mapa.set(entidadTipo.id, {
                        id: entidadTipo.id,
                        codigo: entidadTipo.codigo,
                        nombre: entidadTipo.nombre,
                    });

                }

            });

        return Array
            .from(mapa.values())
            .sort((a, b) =>
                a.nombre.localeCompare(b.nombre)
            );

    }, [conceptos]);

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

    // const [conceptos, setConceptos] = useState([]);

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
                    loading={
                        loading
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
