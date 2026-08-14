import React from "react";
import {
  Button,
  ButtonGroup,
} from "react-bootstrap";

const bytes = (
  value
) => {
  const number =
    Number(value || 0);

  if (
    number <
    1024
  ) {
    return `${number} B`;
  }

  if (
    number <
    1024 *
    1024
  ) {
    return `${(
      number /
      1024
    ).toFixed(1)} KB`;
  }

  return `${(
    number /
    1024 /
    1024
  ).toFixed(1)} MB`;
};

const PREVIEW_EXTENSIONS = [
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "txt",
];

const canPreview = (archivo) => {
  const name =
    (
      archivo.nombre ||
      archivo.nombre_logico ||
      ""
    ).toLowerCase();

  const extension =
    name.split(".").pop();

  return PREVIEW_EXTENSIONS.includes(
    extension
  );
};

const MotorConceptoRegistroArchivoItem = ({
  archivo,
  readOnly,
  downloading,
  disabled,
  onDownload,
  onReplace,
  onHistory,
  onRemove,
  onPreview
}) => (
  <div className="d-flex justify-content-between align-items-center gap-3 py-2 border-bottom">
    <div className="min-width-0">
      <div className="fw-semibold text-break">
        {
          archivo.nombre_logico ||
          archivo.nombre
        }
      </div>

      <small className="text-muted">
        {
          archivo.mime_type ||
          "Archivo"
        }
        {" · "}
        {
          bytes(
            archivo.peso_bytes
          )
        }
      </small>
    </div>

    <ButtonGroup size="sm">

      {
        canPreview(
          archivo
        ) && (
          <Button
            variant="outline-info"
            disabled={
              disabled
            }
            onClick={() =>
              onPreview(
                archivo
              )
            }
          >
            Vista previa
          </Button>
        )
      }

      <Button
        variant="outline-primary"
        disabled={
          disabled ||
          downloading
        }
        onClick={() =>
          onDownload(
            archivo
          )
        }
      >
        {
          downloading
            ? "Descargando..."
            : "Descargar"
        }
      </Button>

      {/* <Button
        variant="outline-secondary"
        disabled={
          disabled
        }
        onClick={() =>
          onHistory(
            archivo
          )
        }
      >
        Historial
      </Button> */}

      {
        !readOnly && (
          <>
            <Button
              variant="outline-warning"
              disabled={
                disabled
              }
              onClick={() =>
                onReplace(
                  archivo
                )
              }
            >
              Reemplazar
            </Button>

            <Button
              variant="outline-danger"
              disabled={
                disabled
              }
              onClick={() =>
                onRemove(
                  archivo
                )
              }
            >
              Eliminar
            </Button>
          </>
        )
      }
    </ButtonGroup>
  </div>
);

export default MotorConceptoRegistroArchivoItem;
