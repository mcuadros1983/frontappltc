import React, {
  useEffect,
  useState,
} from "react";

import {
  Modal,
  Button,
  Form,
  Alert,
} from "react-bootstrap";


export default function AcreditarPagoProgramadoModal({
  show,
  onHide,
  row,
  onConfirm,
}) {

  const [
    aplicarVariasFacturas,
    setAplicarVariasFacturas,
  ] = useState(false);


  useEffect(() => {

    if (show) {
      setAplicarVariasFacturas(false);
    }

  }, [show, row?.id]);


  if (!row) {
    return null;
  }


  const esAnticipo =
    row.pago_programado_tipo ===
    "anticipo";


  const confirmar = () => {

    onConfirm?.({
      generar_abono_ctacte:
        esAnticipo
          ? false
          : aplicarVariasFacturas,
    });
  };


  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
    >

      <Modal.Header closeButton>
        <Modal.Title>
          Acreditar pago programado
        </Modal.Title>
      </Modal.Header>


      <Modal.Body>

        <p>
          {row.descripcion}
        </p>

        {!esAnticipo && (
          <Form.Check
            type="checkbox"
            id="varias-facturas-programado"
            label="Este pago se aplicará a varias facturas"
            checked={
              aplicarVariasFacturas
            }
            onChange={(e) =>
              setAplicarVariasFacturas(
                e.target.checked
              )
            }
          />
        )}


        {aplicarVariasFacturas &&
          !esAnticipo && (

          <Alert
            variant="light"
            className="mt-3 mb-0"
          >
            Se generará un abono en la
            cuenta corriente del proveedor
            para distribuir posteriormente
            este pago entre varias facturas.
          </Alert>

        )}


        {esAnticipo && (

          <Alert
            variant="light"
            className="mb-0"
          >
            Este pago ya es un anticipo y
            posee un abono en la cuenta
            corriente del proveedor.
          </Alert>

        )}

      </Modal.Body>


      <Modal.Footer>

        <Button
          variant="secondary"
          onClick={onHide}
        >
          Cancelar
        </Button>

        <Button
          variant="success"
          onClick={confirmar}
        >
          Acreditar
        </Button>

      </Modal.Footer>

    </Modal>
  );
}