import React from "react";

import {
    ERPButton,
} from "../../common/erp";

const RegistroToolbar = ({
    saving,
    readOnly,
    hasErrors,
    onSave,
    onSaveDraft,
    onFinish,
    onNewVersion,
    onHistory,
}) => (
    <div className="d-flex flex-wrap gap-2">
        {
            !readOnly && (
                <>
                    <ERPButton
                        type="save"
                        label="Guardar"
                        disabled={saving}
                        onClick={onSave}
                    />
{/* 
                    <ERPButton
                        type="save"
                        label="Guardar borrador"
                        disabled={saving}
                        onClick={
                            onSaveDraft
                        }
                    />

                    <ERPButton
                        type="save"
                        label="Finalizar"
                        disabled={
                            saving ||
                            hasErrors
                        }
                        onClick={
                            onFinish
                        }
                    />

                    <ERPButton
                        type="new"
                        label="Nueva versión"
                        disabled={saving}
                        onClick={
                            onNewVersion
                        }
                    /> */}
                </>
            )
        }

        {/* <ERPButton
            type="refresh"
            label="Historial"
            onClick={onHistory}
        /> */}
    </div>
);

export default RegistroToolbar;
