import React from "react";

import { Placeholder } from "react-bootstrap";

import {
    ERPCard,
} from "../../common/erp";

const MotorConceptoVencimientosLoading = () => {

    return (

        <>

            <ERPCard className="mb-4">

                <div className="row g-3">

                    {

                        Array.from({ length: 5 }).map((_, index) => (

                            <div
                                key={index}
                                className="col-xl-2 col-lg-4 col-md-6"
                            >

                                <Placeholder animation="glow">

                                    <Placeholder
                                        xs={12}
                                        style={{ height: 90 }}
                                    />

                                </Placeholder>

                            </div>

                        ))

                    }

                </div>

            </ERPCard>

            <ERPCard className="mb-4">

                <Placeholder animation="glow">

                    <Placeholder
                        xs={12}
                        style={{ height: 180 }}
                    />

                </Placeholder>

            </ERPCard>

            <ERPCard>

                <Placeholder animation="glow">

                    {

                        Array.from({ length: 10 }).map((_, index) => (

                            <Placeholder
                                key={index}
                                xs={12}
                                className="mb-3"
                            />

                        ))

                    }

                </Placeholder>

            </ERPCard>

        </>

    );

};

export default MotorConceptoVencimientosLoading;