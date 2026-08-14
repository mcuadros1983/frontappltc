import React from "react";

import {
  Button,
  Modal,
  Spinner,
} from "react-bootstrap";

import {
  getConceptoNombre,
} from "../../../utils/motorConceptos/registroConceptoHelpers";

const RegistroConceptoDeleteModal = ({
  show,
  registro,
  deleting,
  onHide,
  onConfirm,
}) => (
  <Modal
    show={show}
    centered
    backdrop={
      deleting
        ? "static"
        : true
    }
    keyboard={
      !deleting
    }
    onHide={onHide}
  >
    <Modal.Header closeButton={!deleting}>
      <Modal.Title>
        Eliminar registro
      </Modal.Title>
    </Modal.Header>

    <Modal.Body>
      <p className="mb-2">
        ¿Deseas eliminar el registro{" "}
        <strong>
          #{registro?.id}
        </strong>
        ?
      </p>

      <p className="mb-0 text-muted">
        {
          registro
            ? getConceptoNombre(
                registro
              )
            : ""
        }
      </p>

      <p className="mt-3 mb-0 text-danger">
        La eliminación será lógica.
      </p>
    </Modal.Body>

    <Modal.Footer>
      <Button
        variant="outline-secondary"
        disabled={deleting}
        onClick={onHide}
      >
        Cancelar
      </Button>

      <Button
        variant="danger"
        disabled={deleting}
        onClick={onConfirm}
      >
        {
          deleting && (
            <Spinner
              animation="border"
              size="sm"
              className="me-2"
            />
          )
        }

        Eliminar
      </Button>
    </Modal.Footer>
  </Modal>
);

export default RegistroConceptoDeleteModal;