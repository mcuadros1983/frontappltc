import { api } from "./apiClient";

const unwrap = (res) =>
    res && res.data !== undefined
        ? res.data
        : res;

const toQuery = (params = {}) => {
    const clean = Object.entries(params)
        .filter(([, value]) =>
            value !== undefined &&
            value !== null &&
            value !== ""
        )
        .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});

    const query = new URLSearchParams(clean).toString();

    return query ? `?${query}` : "";
};

export const motorConceptoRegistroApi = {

    listar: async (params = {}) =>
        unwrap(
            await api.get(
                `/motorconceptos/registros${toQuery(params)}`
            )
        ),

    obtener: async (registroId) =>
        unwrap(
            await api.get(
                `/motorconceptos/registros/${registroId}`
            )
        ),

    obtenerResumenEntidades:
        async (
            entidadTipoId
        ) =>
            unwrap(
                await api.get(
                    `/motorconceptos/registros/resumen-entidades${toQuery({
                        entidad_tipo_id:
                            entidadTipoId,
                    })}`
                )
            ),

    crear: async (payload) =>
        unwrap(
            await api.post(
                "/motorconceptos/registros",
                payload
            )
        ),

    crearConArchivos: async (
        payload,
        archivos = []
    ) => {

        const formData =
            new FormData();

        /*
         * Datos simples del registro
         */
        formData.append(
            "concepto_id",
            payload.concepto_id
        );

        formData.append(
            "entidad_tipo_id",
            payload.entidad_tipo_id
        );

        formData.append(
            "entidad_id",
            payload.entidad_id
        );

        if (
            payload.observaciones !==
            undefined &&
            payload.observaciones !==
            null
        ) {

            formData.append(
                "observaciones",
                payload.observaciones
            );

        }

        if (
            payload.fecha_vencimiento
        ) {

            formData.append(
                "fecha_vencimiento",
                payload.fecha_vencimiento
            );

        }

        /*
         * valores es un objeto.
         * En multipart debe enviarse serializado.
         */
        formData.append(
            "valores",
            JSON.stringify(
                payload.valores ||
                {}
            )
        );

        /*
         * Los archivos físicos utilizan todos
         * el mismo field "files", porque el
         * middleware backend utiliza:
         *
         * upload.array("files", ...)
         */
        archivos.forEach(
            (archivo) => {

                formData.append(
                    "files",
                    archivo.file
                );

            }
        );

        /*
         * Metadata en el MISMO orden que files.
         */
        formData.append(
            "metadata_archivos",
            JSON.stringify(
                archivos.map(
                    (archivo) => ({
                        archivo_tipo_id:
                            Number(
                                archivo
                                    .archivo_tipo_id
                            ),

                        nombre_logico:
                            archivo
                                .nombre_logico ||
                            archivo
                                .file
                                ?.name ||
                            null,
                    })
                )
            )
        );

        return unwrap(
            await api.postFormData(
                "/motorconceptos/registros",
                formData
            )
        );
    },

    actualizar: async (
        registroId,
        payload
    ) =>
        unwrap(
            await api.put(
                `/motorconceptos/registros/${registroId}`,
                payload
            )
        ),

    eliminar: async (registroId) =>
        unwrap(
            await api.del(
                `/motorconceptos/registros/${registroId}`
            )
        ),

    guardarValores: async (
        registroId,
        payload
    ) =>
        unwrap(
            await api.put(
                `/motorconceptos/registros/${registroId}/valores`,
                payload
            )
        ),

    actualizar: async (
        registroId,
        payload
    ) =>
        unwrap(
            await api.put(
                `/motorconceptos/registros/${registroId}`,
                payload
            )
        ),

    crearVersion: async (
        registroId,
        payload = {}
    ) =>
        unwrap(
            await api.post(
                `/motorconceptos/registros/${registroId}/versiones`,
                payload
            )
        ),

    obtenerVersiones: async (
        registroId
    ) =>
        unwrap(
            await api.get(
                `/motorconceptos/registros/${registroId}/versiones`
            )
        ),

    obtenerVersion: async (
        registroId,
        versionId
    ) =>
        unwrap(
            await api.get(
                `/motorconceptos/registros/${registroId}/versiones/${versionId}`
            )
        ),

    compararVersiones: async (
        registroId,
        versionAId,
        versionBId
    ) =>
        unwrap(
            await api.get(
                `/motorconceptos/registros/${registroId}/versiones/comparar${toQuery({
                    version_a_id: versionAId,
                    version_b_id: versionBId,
                })}`
            )
        ),

    cambiarEstado: async (
        registroId,
        estado,
        payload = {}
    ) =>
        unwrap(
            await api.put(
                `/motorconceptos/registros/${registroId}/estado`,
                {
                    estado,
                    ...payload,
                }
            )
        ),

    listarArchivos: async (
        registroId
    ) =>
        unwrap(
            await api.get(
                `/motorconceptos/registros/${registroId}/archivos`
            )
        ),

    validarArchivosObligatorios:
        async (registroId) =>
            unwrap(
                await api.get(
                    `/motorconceptos/registros/${registroId}/archivos/validar-obligatorios`
                )
            ),

    subirArchivo: async (
        registroId,
        {
            file,
            archivo_tipo_id,
            nombre_logico,
        }
    ) => {

        const formData =
            new FormData();

        /*
         * IMPORTANTE:
         *
         * El middleware backend utiliza:
         *
         * upload.array("files", ...)
         *
         * Por lo tanto el nombre del campo
         * multipart debe ser "files".
         */

        formData.append(
            "files",
            file
        );

        formData.append(
            "archivo_tipo_id",
            archivo_tipo_id
        );

        if (
            nombre_logico
        ) {

            formData.append(
                "nombre_logico",
                nombre_logico
            );

        }

        /*
         * Ruta real del backend:
         *
         * POST
         * /registros/:registroId/archivos
         */

        return unwrap(
            await api.postFormData(
                `/motorconceptos/registros/${registroId}/archivos`,
                formData
            )
        );

    },

    obtenerArchivo: async (
        archivoId
    ) =>
        unwrap(
            await api.get(
                `/motorconceptos/registros/archivos/${archivoId}`
            )
        ),

    eliminarArchivo: async (
        archivoId
    ) =>
        unwrap(
            await api.del(
                `/motorconceptos/registros/archivos/${archivoId}`
            )
        ),

    renovar: async (
        id,
        payload
    ) =>
        unwrap(
            await api.put(
                `/motorconceptos/registros/${id}/renovar`,
                payload
            )
        ),
};

export default motorConceptoRegistroApi;
