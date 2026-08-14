import React from "react";

import {
    ERPButton,
} from "../../common/erp";

const EntidadDocumentalToolbar = ({

    loading = false,

    onRefresh,

    onExport,

}) => {

    return (

        <div className="d-flex justify-content-end gap-2 mb-3">

            <ERPButton
                type="refresh"
                disabled={loading}
                onClick={onRefresh}
            />

            <ERPButton
                type="excel"
                disabled={loading}
                onClick={onExport}
            />

        </div>

    );

};

export default EntidadDocumentalToolbar;