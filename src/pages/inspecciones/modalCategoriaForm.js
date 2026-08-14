import React, {
  useEffect,
  useState,
} from "react";

import {
  Modal,
  Button,
  Form,
} from "react-bootstrap";

const ModalCategoriaForm = ({
  show,
  onHide,
  onSave,
  categoria,
}) => {
  const [form, setForm] =
    useState({
      nombre: "",
      orden: 0,
      activo: true,
    });

  useEffect(() => {
    if (categoria) {
      setForm({
        nombre:
          categoria.nombre ||
          "",

        orden:
          categoria.orden ||
          0,

        activo:
          categoria.activo ??
          true,
      });
    } else {
      setForm({
        nombre: "",
        orden: 0,
        activo: true,
      });
    }
  }, [categoria]);

  const guardar =
    () => {
      onSave(form);
    };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {categoria
            ? "Editar Categoría"
            : "Nueva Categoría"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>
            Nombre
          </Form.Label>

          <Form.Control
            value={form.nombre}
            onChange={(e) =>
              setForm({
                ...form,
                nombre:
                  e.target.value,
              })
            }
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            Orden
          </Form.Label>

          <Form.Control
            type="number"
            value={form.orden}
            onChange={(e) =>
              setForm({
                ...form,
                orden:
                  Number(
                    e.target.value
                  ),
              })
            }
          />
        </Form.Group>

        <Form.Check
          label="Activa"
          checked={form.activo}
          onChange={(e) =>
            setForm({
              ...form,
              activo:
                e.target.checked,
            })
          }
        />
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onHide}
        >
          Cancelar
        </Button>

        <Button
          onClick={guardar}
        >
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalCategoriaForm;