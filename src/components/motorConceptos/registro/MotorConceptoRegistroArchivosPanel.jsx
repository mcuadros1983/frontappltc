import React, {
  useState,
} from "react";

import {
  Alert,
  Button,
  Card,
  Form,
  Spinner,
} from "react-bootstrap";

import ERPConfirm from "../../common/erp/ERPConfirm";

import useMotorConceptoRegistroArchivos from "../../../hooks/useMotorConceptoRegistroArchivos";

import MotorConceptoRegistroArchivoItem from "./MotorConceptoRegistroArchivoItem";
import MotorConceptoRegistroArchivoReplaceModal from "./MotorConceptoRegistroArchivoReplaceModal";
import MotorConceptoRegistroArchivoHistoryModal from "./MotorConceptoRegistroArchivoHistoryModal";

const MotorConceptoRegistroArchivosPanel = ({
  registroId,
  archivoTipos = [],
  readOnly = false,
}) => {
  const state =
    useMotorConceptoRegistroArchivos({
      registroId,
    });

  const [
    replaceTarget,
    setReplaceTarget,
  ] = useState(null);

  const [
    historyTarget,
    setHistoryTarget,
  ] = useState(null);

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  const selectFiles =
    async (
      archivoTipo,
      event
    ) => {
      const files =
        Array.from(
          event.target.files ||
          []
        );

      event.target.value =
        "";

      if (
        files.length
      ) {
        await state.uploadMultiple(
          archivoTipo,
          files
        );
      }
    };

  if (
    state.loading
  ) {
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      {
        state.error && (
          <Alert
            variant="danger"
            dismissible
            onClose={
              state.clearError
            }
          >
            {
              state.error
            }
          </Alert>
        )
      }

      {
        archivoTipos
          .filter(
            (type) =>
              type.activo !==
              false
          )
          .sort(
            (left, right) =>
              Number(
                left.orden ||
                0
              ) -
              Number(
                right.orden ||
                0
              )
          )
          .map(
            (type) => {
              const rows =
                state.grouped[
                  String(
                    type.id
                  )
                ] ||
                [];

              const canUpload =
                type.permite_multiples ||
                rows.length ===
                  0;

              return (
                <Card
                  key={type.id}
                  className="shadow-sm mb-3"
                >
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                      <div>
                        <h6 className="mb-1">
                          {
                            type.nombre
                          }
                        </h6>

                        <small className="text-muted">
                          {
                            rows.length
                          }{" "}
                          archivo(s)
                        </small>
                      </div>

                      {
                        !readOnly &&
                        canUpload && (
                          <Form.Group>
                            <Form.Control
                              type="file"
                              multiple={
                                Boolean(
                                  type.permite_multiples
                                )
                              }
                              disabled={
                                state.saving
                              }
                              onChange={(event) =>
                                selectFiles(
                                  type,
                                  event
                                )
                              }
                            />
                          </Form.Group>
                        )
                      }
                    </div>

                    {
                      rows.length ===
                      0 ? (
                        <div className="text-center text-muted border rounded py-4">
                          No hay archivos cargados.
                        </div>
                      ) : (
                        <div className="border rounded px-3">
                          {
                            rows.map(
                              (row) => (
                                <MotorConceptoRegistroArchivoItem
                                  key={row.id}
                                  archivo={row}
                                  readOnly={readOnly}
                                  disabled={state.saving}
                                  downloading={
                                    state.downloadingId ===
                                    row.id
                                  }
                                  onDownload={state.download}
                                  onPreview={state.preview}
                                  onReplace={setReplaceTarget}
                                  onHistory={setHistoryTarget}
                                  onRemove={setDeleteTarget}
                                />
                              )
                            )
                          }
                        </div>
                      )
                    }
                  </Card.Body>
                </Card>
              );
            }
          )
      }

      <MotorConceptoRegistroArchivoReplaceModal
        show={
          Boolean(
            replaceTarget
          )
        }
        archivo={
          replaceTarget
        }
        loading={
          state.saving
        }
        onHide={() =>
          setReplaceTarget(
            null
          )
        }
        onConfirm={async (
          file
        ) => {
          await state.replace(
            replaceTarget,
            file
          );

          setReplaceTarget(
            null
          );
        }}
      />

      <MotorConceptoRegistroArchivoHistoryModal
        show={
          Boolean(
            historyTarget
          )
        }
        archivo={
          historyTarget
        }
        loadHistory={
          state.history
        }
        onDownload={
          state.download
        }
        onHide={() =>
          setHistoryTarget(
            null
          )
        }
      />

      <ERPConfirm
        show={
          Boolean(
            deleteTarget
          )
        }
        title="Eliminar archivo"
        message={
          deleteTarget
            ? `¿Desea eliminar ${deleteTarget.nombre_logico || deleteTarget.nombre}?`
            : ""
        }
        loading={
          state.saving
        }
        onCancel={() =>
          setDeleteTarget(
            null
          )
        }
        onConfirm={async () => {
          await state.remove(
            deleteTarget.id
          );

          setDeleteTarget(
            null
          );
        }}
      />
    </>
  );
};

export default MotorConceptoRegistroArchivosPanel;
