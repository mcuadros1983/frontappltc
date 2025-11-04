// src/components/common/PhonePickerModal.js
import React from "react";
import { Modal, Button, ListGroup } from "react-bootstrap";

export default function PhonePickerModal({ show, onHide, phones, onSelect }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Elegí un teléfono</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!phones?.length ? (
          <div className="text-muted">Sin teléfonos disponibles.</div>
        ) : (
          <ListGroup>
            {phones.map((p, idx) => (
              <ListGroup.Item key={idx} action onClick={() => onSelect?.(p)}>
                {p.descripcion ? `${p.descripcion}: ` : ""}
                {p.numero || p.telefono || p.celular}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
      </Modal.Footer>
    </Modal>
  );
}
