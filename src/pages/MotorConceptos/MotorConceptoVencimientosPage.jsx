import React from "react";

import { ERPPage } from "../../components/common/erp";

import {
    MotorConceptoVencimientosToolbar,
    MotorConceptoVencimientosSummary,
    MotorConceptoVencimientosFilters,
    MotorConceptoVencimientosTable,
    MotorConceptoVencimientosLoading,
    MotorConceptoVencimientosEmpty,
} from "../../components/motorConceptos/vencimientos";

import useMotorConceptoVencimientos
    from "../../hooks/useMotorConceptoVencimientos";

const MotorConceptoVencimientosPage = () => {

    const {

        loading,

        documentos,

        resumen,

        filters,

        setFilters,

        pagination,

        refresh,

    } = useMotorConceptoVencimientos();

    const handleExport = () => {

        // Pendiente

    };

    const handleView = (row) => {

        // Pendiente

    };

    const handleRenew = (row) => {

        // Pendiente

    };

    const handleDownload = (row) => {

        // Pendiente

    };

    const handleLegajo = (row) => {

        // Pendiente

    };

    const handleClearFilters = () => {

        setFilters({

            empresa_id: "",

            sucursal_id: "",

            entidad_tipo_id: "",

            entidad_id: "",

            concepto_id: "",

            estado: "",

            dias: "",

            desde: "",

            hasta: "",

            search: "",

            page: 1,

            limit: pagination?.limit || 20,

        });

    };

    return (

        <ERPPage>

            <MotorConceptoVencimientosToolbar

                refresh={refresh}

                onExport={handleExport}

            />

            <MotorConceptoVencimientosSummary

                resumen={resumen}

                loading={loading}

            />

            <MotorConceptoVencimientosFilters

                filters={filters}

                setFilters={setFilters}

                refresh={refresh}

            />

            {

                loading ? (

                    <MotorConceptoVencimientosLoading />

                ) : documentos.length === 0 ? (

                    <MotorConceptoVencimientosEmpty

                        onRefresh={refresh}

                        onClearFilters={handleClearFilters}

                    />

                ) : (

                    <MotorConceptoVencimientosTable

                        documentos={documentos}

                        pagination={pagination}

                        onPageChange={(page) =>

                            setFilters((prev) => ({

                                ...prev,

                                page,

                            }))

                        }

                        onView={handleView}

                        onRenew={handleRenew}

                        onDownload={handleDownload}

                        onLegajo={handleLegajo}

                    />

                )

            }

        </ERPPage>

    );

};

export default MotorConceptoVencimientosPage;