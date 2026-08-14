import React, {
  useEffect,
  useState,
} from "react";

import {
  Button,
  Form,
  Modal,
} from "react-bootstrap";

const MotorConceptoRegistroArchivoReplaceModal = ({
  show,
  archivo,
  loading,
  onHide,
  onConfirm,
}) => {
  const [
    file,
    setFile,
  ] = useState(null);

  useEffect(() => {
    if (!show) {
      setFile(null);
    }
  }, [show]);

  const submit =
    async () => {
      if (!file) {
        return;
      }

      await onConfirm(
        file
      );
    };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Reemplazar archivo
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="text-muted">
          El archivo anterior se conservará en el historial.
        </p>

        <div className="mb-3">
          <strong>
            {
              archivo?.nombre_logico ||
              archivo?.nombre
            }
          </strong>
        </div>

        <Form.Control
          type="file"
          disabled={loading}
          onChange={(event) =>
            setFile(
              event.target.files?.[0] ||
              null
            )
          }
        />
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          disabled={loading}
          onClick={onHide}
        >
          Cancelar
        </Button>

        <Button
          variant="primary"
          disabled={
            loading ||
            !file
          }
          onClick={submit}
        >
          Reemplazar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MotorConceptoRegistroArchivoReplaceModal;
