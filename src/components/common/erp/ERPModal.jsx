import React from "react";
import { Modal } from "react-bootstrap";

const ERPModal = ({
    show = false,
    onHide,
    title,
    size = "lg",
    centered = true,
    scrollable = true,
    children,
    footer,
    className = "",
}) => {

    return (

        <Modal
            show={show}
            onHide={onHide}
            size={size}
            centered={centered}
            scrollable={scrollable}
            backdrop="static"
            keyboard={false}
            className={className}
        >

            {
                title && (

                    <Modal.Header closeButton>

                        <Modal.Title>

                            {title}

                        </Modal.Title>

                    </Modal.Header>

                )
            }

            <Modal.Body>

                {children}

            </Modal.Body>

            {

                footer && (

                    <Modal.Footer>

                        {footer}

                    </Modal.Footer>

                )

            }

        </Modal>

    );

};

export default ERPModal;