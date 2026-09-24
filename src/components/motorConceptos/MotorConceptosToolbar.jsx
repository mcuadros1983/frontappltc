import React from "react";

import {
    FiDownload,
    FiUpload,
    FiFileText,
} from "react-icons/fi";

import {
    ERPButton,
} from "../common/erp";


const MotorConceptosToolbar = ({
    canCreate,
    canExport,
    canImport,
    canDownloadTemplate,

    loading = false,
    importing = false,

    onNew,
    onExport,
    onRefresh,
    onImport,
    onDownloadTemplate,
}) => {

    const disabled =
        loading ||
        importing;


    return (
        <div className="d-flex flex-wrap gap-2">

            {
                canDownloadTemplate && (
                    <ERPButton
                        type="refresh"
                        label="Plantilla Excel"
                        icon={
                            <FiFileText />
                        }
                        disabled={disabled}
                        onClick={
                            onDownloadTemplate
                        }
                    />
                )
            }


            {
                canImport && (
                    <ERPButton
                        type="refresh"
                        label="Importar Excel"
                        icon={
                            <FiUpload />
                        }
                        disabled={disabled}
                        onClick={
                            onImport
                        }
                    />
                )
            }


            {
                canExport && (
                    <ERPButton
                        type="refresh"
                        label="Exportar"
                        icon={
                            <FiDownload />
                        }
                        disabled={disabled}
                        onClick={
                            onExport
                        }
                    />
                )
            }


            <ERPButton
                type="refresh"
                disabled={disabled}
                onClick={onRefresh}
            />


            {
                canCreate && (
                    <ERPButton
                        type="new"
                        disabled={disabled}
                        onClick={onNew}
                    />
                )
            }

        </div>
    );
};


export default MotorConceptosToolbar;