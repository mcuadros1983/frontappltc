import React, {
  useEffect,
  useState,
} from "react";

import {
  Modal,
  Button,
  Form,
  Row,
  Col,
} from "react-bootstrap";

const ModalItemForm = ({
  show,
  onHide,
  onSave,
  item,
}) => {
  const [form, setForm] =
    useState({
      descripcion: "",
      peso: 1,
      criticidad:
        "MEDIA",
      requiere_comentario:
        false,
      requiere_foto_default:
        false,
      orden: 0,
      activo: true,
    });

  useEffect(() => {
    if (item) {
      setForm({
        descripcion:
          item.descripcion ||
          "",

        peso:
          item.peso || 1,

        criticidad:
          item.criticidad ||
          "MEDIA",

        requiere_comentario:
          item.requiere_comentario ||
          false,

        requiere_foto_default:
          item.requiere_foto_default ||
          false,

        orden:
          item.orden || 0,

        activo:
          item.activo ??
          true,
      });
    }
  }, [item]);

  const guardar =
    () => {
      onSave(form);
    };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {item
            ? "Editar Item"
            : "Nuevo Item"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>
            Descripción
          </Form.Label>

          <Form.Control
            value={
              form.descripcion
            }
            onChange={(e) =>
              setForm({
                ...form,
                descripcion:
                  e.target.value,
              })
            }
          />
        </Form.Group>

        <Row>
          <Col md={4}>
            <Form.Label>
              Peso
            </Form.Label>

            <Form.Control
              type="number"
              value={form.peso}
              onChange={(e) =>
                setForm({
                  ...form,
                  peso:
                    Number(
                      e.target.value
                    ),
                })
              }
            />
          </Col>

          <Col md={4}>
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
          </Col>

          <Col md={4}>
            <Form.Label>
              Criticidad
            </Form.Label>

            <Form.Select
              className="form-control my-input"
              value={
                form.criticidad
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  criticidad:
                    e.target.value,
                })
              }
            >
              <option value="BAJA">
                BAJA
              </option>

              <option value="MEDIA">
                MEDIA
              </option>

              <option value="ALTA">
                ALTA
              </option>

              <option value="CRITICA">
                CRITICA
              </option>
            </Form.Select>
          </Col>
        </Row>

        <hr />

        <Form.Check
          className="mb-2"
          label="Requiere comentario"
          checked={
            form.requiere_comentario
          }
          onChange={(e) =>
            setForm({
              ...form,
              requiere_comentario:
                e.target.checked,
            })
          }
        />

        <Form.Check
          className="mb-2"
          label="Requiere foto"
          checked={
            form.requiere_foto_default
          }
          onChange={(e) =>
            setForm({
              ...form,
              requiere_foto_default:
                e.target.checked,
            })
          }
        />

        <Form.Check
          label="Activo"
          checked={
            form.activo
          }
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

export default ModalItemForm;