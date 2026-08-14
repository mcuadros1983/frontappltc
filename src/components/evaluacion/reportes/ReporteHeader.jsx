import React from "react";

import {

    ERPCard

} from "../../common/erp";

const ReporteHeader = ({

    titulo,

    items = []

}) => {

    return (

        <ERPCard className="mb-4">

            <h3>

                {titulo}

            </h3>

            <hr />

            <div className="row">

                {

                    items.map((item, index) => (

                        <div
                            className="col-md-4 mb-3"
                            key={index}
                        >

                            <strong>

                                {item.label}

                            </strong>

                            <div>

                                {item.value}

                            </div>

                        </div>

                    ))

                }

            </div>

        </ERPCard>

    );

};

export default ReporteHeader;