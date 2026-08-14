import React from "react";
import { Card } from "react-bootstrap";
import RadarChart from "./RadarChart";

const ReporteRadar = ({ data = [] }) => {

    return (

        <Card className="mb-3">

            <Card.Header>

                Competencias

            </Card.Header>

            <Card.Body>

                <RadarChart

                    data={data}

                />

            </Card.Body>

        </Card>

    );

};

export default ReporteRadar;