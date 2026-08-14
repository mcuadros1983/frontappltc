import {
  api,
} from "./apiClient";

const unwrap = (
  response
) =>
  response?.data?.data ??
  response?.data ??
  response;

const parseFileName = (
  disposition
) => {
  if (!disposition) {
    return null;
  }

  const utf8 =
    disposition.match(
      /filename\*=UTF-8''([^;]+)/
    );

  if (utf8?.[1]) {
    return decodeURIComponent(
      utf8[1]
    );
  }

  const simple =
    disposition.match(
      /filename="?([^"]+)"?/
    );

  return simple?.[1] ||
    null;
};

const service = {
  listByRegistro:
    async (
      registroId
    ) =>
      unwrap(
        await api.get(
          `/motorconceptos/registros/${registroId}/archivos`
        )
      ),

  uploadMultiple:
    async (
      registroId,
      archivoTipoId,
      files
    ) => {
      const form =
        new FormData();

      form.append(
        "archivo_tipo_id",
        archivoTipoId
      );

      Array.from(
        files || []
      ).forEach(
        (file) =>
          form.append(
            "files",
            file
          )
      );

      return unwrap(
        await api.post(
          `/motorconceptos/registros/${registroId}/archivos`,
          form,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        )
      );
    },

  download: (archivoId) => {
    window.open(
      `${process.env.REACT_APP_API_URL}/motorconceptos/archivos/${archivoId}/download`,
      "_blank",
      "noopener,noreferrer"
    );
  },
  replace:
    async (
      archivoId,
      file
    ) => {
      const form =
        new FormData();

      form.append(
        "file",
        file
      );

      return unwrap(
        await api.put(
          `/motorconceptos/archivos/${archivoId}/reemplazar`,
          form,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        )
      );
    },

  history:
    async (
      archivoId
    ) =>
      unwrap(
        await api.get(
          `/motorconceptos/archivos/${archivoId}/historial`
        )
      ),

  remove:
    async (
      archivoId
    ) =>
      unwrap(
        await api.del(
          `/motorconceptos/archivos/${archivoId}`
        )
      ),

  preview: (archivoId) => {
    window.open(
      `${process.env.REACT_APP_API_URL}/motorconceptos/archivos/${archivoId}/download?preview=true`,
      "_blank",
      "noopener,noreferrer"
    );
  },
};

export default service;
