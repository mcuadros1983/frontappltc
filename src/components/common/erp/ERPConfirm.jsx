import React from "react";
import { Modal } from "react-bootstrap";
import ERPButton from "./ERPButton";

const ERPConfirm = ({
  show,
  title = "Confirmar",
  message = "¿Desea continuar?",
  onCancel,
  onConfirm,
}) => {

  return (

    <Modal
      show={show}
      centered
      onHide={onCancel}
    >

      <Modal.Header closeButton>

        <Modal.Title>

          {title}

        </Modal.Title>

      </Modal.Header>

      <Modal.Body>

        {message}

      </Modal.Body>

      <Modal.Footer>

        <ERPButton
          type="cancel"
          onClick={onCancel}
        />

        <ERPButton
          type="delete"
          onClick={onConfirm}
        />

      </Modal.Footer>

    </Modal>

  );

};

export default ERPConfirm;