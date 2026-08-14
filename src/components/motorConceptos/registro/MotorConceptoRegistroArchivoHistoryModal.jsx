import React, {
  useEffect,
  useState,
} from "react";

import {
  Button,
  Modal,
  Spinner,
  Table,
} from "react-bootstrap";

const MotorConceptoRegistroArchivoHistoryModal = ({
  show,
  archivo,
  loadHistory,
  onHide,
  onDownload,
}) => {
  const [
    rows,
    setRows,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  useEffect(() => {
    if (
      !show ||
      !archivo
    ) {
      return;
    }

    let active =
      true;

    setLoading(true);

    loadHistory(
      archivo.id
    )
      .then((data) => {
        if (active) {
          setRows(
            Array.isArray(data)
              ? data
              : []
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active =
        false;
    };
  }, [
    archivo,
    loadHistory,
    show,
  ]);

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Historial del archivo
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {
          loading ? (
            <div className="text-center py-4">
              <Spinner />
            </div>
          ) : (
            <Table
              responsive
              hover
            >
              <thead>
                <tr>
                  <th>
                    Archivo
                  </th>
                  <th>
                    Fecha
                  </th>
                  <th>
                    Estado
                  </th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {
                  rows.map(
                    (row) => (
                      <tr key={row.id}>
                        <td>
                          {
                            row.nombre
                          }
                        </td>

                        <td>
                          {
                            row.created_at
                              ? new Date(
                                  row.created_at
                                ).toLocaleString()
                              : "-"
                          }
                        </td>

                        <td>
                          {
                            row.activo
                              ? "Actual"
                              : "Anterior"
                          }
                        </td>

                        <td className="text-end">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() =>
                              onDownload(
                                row
                              )
                            }
                          >
                            Descargar
                          </Button>
                        </td>
                      </tr>
                    )
                  )
                }
              </tbody>
            </Table>
          )
        }
      </Modal.Body>
    </Modal>
  );
};

export default MotorConceptoRegistroArchivoHistoryModal;
