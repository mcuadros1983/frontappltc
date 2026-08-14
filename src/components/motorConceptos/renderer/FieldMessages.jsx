import React from "react";

import {
    Alert,
} from "react-bootstrap";

const MessageList = ({
    items = [],
    variant,
}) => {
    if (
        items.length === 0
    ) {
        return null;
    }

    return (
        <Alert
            variant={variant}
            className="py-2 mt-2 mb-0"
        >
            {
                items.map(
                    (message, index) => (
                        <div
                            key={`${message}-${index}`}
                        >
                            {message}
                        </div>
                    )
                )
            }
        </Alert>
    );
};

const FieldMessages = ({
    errors = [],
    warnings = [],
    info = [],
}) => (
    <>
        <MessageList
            items={errors}
            variant="danger"
        />

        <MessageList
            items={warnings}
            variant="warning"
        />

        <MessageList
            items={info}
            variant="info"
        />
    </>
);

export default FieldMessages;
