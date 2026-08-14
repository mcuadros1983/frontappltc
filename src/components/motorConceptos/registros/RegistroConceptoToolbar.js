import React from "react";

import {
    FiDownload,
    FiRefreshCw,
} from "react-icons/fi";

import {
    ERPButton,
} from "../../common/erp";

const RegistroConceptoToolbar = ({
    canCreate = false,
    canExport = false,
    loading = false,
    onNew,
    onExport,
    onRefresh,
}) => {
    return (
        <div className="d-flex flex-wrap gap-2">
{/* 
            {
                canExport && (
                    <ERPButton
                        type="refresh"
                        label="Exportar"
                        icon={
                            <FiDownload />
                        }
                        disabled={loading}
                        onClick={onExport}
                    />
                )
            } */}

            <ERPButton
                type="refresh"
                label="Actualizar"
                icon={
                    <FiRefreshCw />
                }
                disabled={loading}
                onClick={onRefresh}
            />

            {
                canCreate && (
                    <ERPButton
                        type="new"
                        label="Nuevo registro"
                        disabled={loading}
                        onClick={onNew}
                    />
                )
            }

        </div>
    );
};

export default RegistroConceptoToolbar;