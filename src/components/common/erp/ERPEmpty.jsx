import React from "react";
import { Alert } from "react-bootstrap";

const ERPEmpty = ({
    message = "No existen registros."
}) => {

    return (

        <Alert
            variant="light"
            className="text-center"
        >

            {message}

        </Alert>

    );

};

export default ERPEmpty;