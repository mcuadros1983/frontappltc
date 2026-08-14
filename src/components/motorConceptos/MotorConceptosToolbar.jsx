import React from "react";

import {
    FiDownload,
} from "react-icons/fi";

import {
    ERPButton,
} from "../common/erp";

const MotorConceptosToolbar = ({
    canCreate,
    canExport,
    loading = false,
    onNew,
    onExport,
    onRefresh,
}) => {

    return (
        <div className="d-flex flex-wrap gap-2">

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
            }

            <ERPButton
                type="refresh"
                disabled={loading}
                onClick={onRefresh}
            />

            {
                canCreate && (
                    <ERPButton
                        type="new"
                        disabled={loading}
                        onClick={onNew}
                    />
                )
            }

        </div>
    );
};

export default MotorConceptosToolbar;
