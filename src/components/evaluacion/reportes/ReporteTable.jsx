import React from "react";
import { ERPCard, ERPTable } from "../../common/erp";

const ReporteTable = ({
    title,
    columns = [],
    data = []
}) => {

    return (
        <ERPCard className="mb-4">

            {title && (
                <>
                    <h5>{title}</h5>
                    <hr />
                </>
            )}

            <ERPTable
                columns={columns}
                data={data}
            />

        </ERPCard>
    );

};

export default ReporteTable;