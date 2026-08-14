import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import service from "../services/motorConceptoRegistroArchivoService";

import getApiErrorMessage from "../utils/getApiErrorMessage";

const groupByType = (
  rows
) =>
  rows.reduce(
    (
      result,
      row
    ) => {
      const key =
        String(
          row.archivo_tipo_id
        );

      result[key] =
        result[key] ||
        [];

      result[key].push(
        row
      );

      return result;
    },
    {}
  );

const useMotorConceptoRegistroArchivos = ({
  registroId,
}) => {
  const [
    items,
    setItems,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    downloadingId,
    setDownloadingId,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  const grouped =
    useMemo(
      () =>
        groupByType(
          items
        ),
      [items]
    );

  const refresh =
    useCallback(
      async () => {
        if (!registroId) {
          setItems([]);
          return;
        }

        setLoading(true);
        setError("");

        try {
          const data =
            await service.listByRegistro(
              registroId
            );

          setItems(
            Array.isArray(data)
              ? data
              : []
          );
        } catch (requestError) {
          setError(
            getApiErrorMessage(
              requestError
            )
          );
        } finally {
          setLoading(false);
        }
      },
      [registroId]
    );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const uploadMultiple =
    useCallback(
      async (
        archivoTipo,
        files
      ) => {
        setSaving(true);
        setError("");

        try {
          await service.uploadMultiple(
            registroId,
            archivoTipo.id,
            files
          );

          await refresh();
        } catch (requestError) {
          setError(
            getApiErrorMessage(
              requestError
            )
          );

          throw requestError;
        } finally {
          setSaving(false);
        }
      },
      [
        refresh,
        registroId,
      ]
    );

  const download =
    useCallback(
      async (archivo) => {

        setDownloadingId(
          archivo.id
        );

        setError("");

        try {

          service.download(
            archivo.id
          );

        } catch (requestError) {

          setError(
            getApiErrorMessage(
              requestError
            )
          );

          throw requestError;

        } finally {

          setDownloadingId(
            null
          );

        }

      },
      []
    );


  const preview =
    useCallback(
      (archivo) => {
        service.preview(
          archivo.id
        );
      },
      []
    );

  const replace =
    useCallback(
      async (
        archivo,
        file
      ) => {
        setSaving(true);
        setError("");

        try {
          await service.replace(
            archivo.id,
            file
          );

          await refresh();
        } catch (requestError) {
          setError(
            getApiErrorMessage(
              requestError
            )
          );

          throw requestError;
        } finally {
          setSaving(false);
        }
      },
      [refresh]
    );

  const history =
    useCallback(
      async (
        archivoId
      ) =>
        service.history(
          archivoId
        ),
      []
    );

  const remove =
    useCallback(
      async (
        archivoId
      ) => {
        setSaving(true);
        setError("");

        try {
          await service.remove(
            archivoId
          );

          await refresh();
        } catch (requestError) {
          setError(
            getApiErrorMessage(
              requestError
            )
          );

          throw requestError;
        } finally {
          setSaving(false);
        }
      },
      [refresh]
    );

  return {
    items,
    grouped,
    loading,
    saving,
    downloadingId,
    error,
    refresh,
    uploadMultiple,
    download,
    replace,
    history,
    remove,
    download,
    preview,
    clearError:
      () =>
        setError(""),
  };
};

export default useMotorConceptoRegistroArchivos;
