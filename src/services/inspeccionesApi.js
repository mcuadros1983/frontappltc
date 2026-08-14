import { api } from "./apiClient";

const unwrap = (res) =>
    res && res.data !== undefined
        ? res.data
        : res;

export const inspeccionesApi = {

    actualizarRespuesta: async (
        id,
        payload
    ) =>
        unwrap(
            await api.put(
                `/inspecciones/respuestas/${id}`,
                payload
            )
        ),

    trabajarRespuesta: async (
        id,
        payload
    ) =>
        unwrap(
            await api.put(
                `/inspecciones/respuestas/${id}/trabajar`,
                payload
            )
        ),

    enviarRevision: async (id) =>
        unwrap(
            await api.post(
                `/inspecciones/respuestas/${id}/enviar-revision`
            )
        ),

    aprobarRespuesta: async (id) =>
        unwrap(
            await api.post(
                `/inspecciones/respuestas/${id}/aprobar`
            )
        ),

    rechazarRespuesta: async (
        id,
        payload
    ) =>
        unwrap(
            await api.post(
                `/inspecciones/respuestas/${id}/rechazar`,
                payload
            )
        ),

    reabrirRespuesta: async (
        id,
        payload
    ) =>
        unwrap(
            await api.post(
                `/inspecciones/respuestas/${id}/reabrir`,
                payload
            )
        ),

    guardarChecklist:
        async (
            inspeccionId,
            respuestas
        ) =>
            unwrap(
                await api.put(
                    `/inspecciones/${inspeccionId}/respuestas`,
                    {
                        respuestas,
                    }
                )
            ),
    dashboard: async () =>
        unwrap(
            await api.get(
                "/inspecciones/dashboard"
            )
        ),

    ranking: async () =>
        unwrap(
            await api.get(
                "/inspecciones/ranking"
            )
        ),

    topProblemas: async () =>
        unwrap(
            await api.get(
                "/inspecciones/top-problemas"
            )
        ),

    reincidencias: async () =>
        unwrap(
            await api.get(
                "/inspecciones/reincidencias"
            )
        ),

    resumenCategorias: async () =>
        unwrap(
            await api.get(
                "/inspecciones/resumen-categorias"
            )
        ),

    vencidas: async () =>
        unwrap(
            await api.get(
                "/inspecciones/vencidas"
            )
        ),

    listar: async () =>
        unwrap(
            await api.get(
                "/inspecciones"
            )
        ),

    obtener: async (id) =>
        unwrap(
            await api.get(
                `/inspecciones/${id}`
            )
        ),

    crear: async (payload) =>
        unwrap(
            await api.post(
                "/inspecciones",
                payload
            )
        ),

    anular: async (
        id,
        motivo_anulacion
    ) =>
        unwrap(
            await api.put(
                `/inspecciones/${id}/anular`,
                {
                    motivo_anulacion,
                }
            )
        ),

    listarPlantillas:
        async () =>
            unwrap(
                await api.get(
                    "/inspecciones/plantillas"
                )
            ),

    obtenerPlantilla:
        async (id) =>
            unwrap(
                await api.get(
                    `/inspecciones/plantillas/${id}/completa`
                )
            ),

    notificaciones:
        async () =>
            unwrap(
                await api.get(
                    "/inspecciones/notificacion"
                )
            ),

    marcarLeida:
        async (id) =>
            unwrap(
                await api.put(
                    `/inspecciones/notificacion/${id}/leida`,
                    {}
                )
            ),

    subirEvidencia: async (id, formData) => {
        const res = await fetch(
            `${process.env.REACT_APP_API_URL}/inspecciones/respuestas/${id}/evidencias`,
            {
                method: "POST",
                credentials: "include",
                body: formData,
            }
        );

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || "Error subiendo evidencia");
        }

        return res.json();
    },

    eliminarEvidencia: (
        evidenciaId
    ) =>
        api.del(
            `/inspecciones/evidencias/${evidenciaId}`
        ),
};

