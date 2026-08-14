// services/notification/notificationApi.js

import { api } from "../apiClient";

export const notificationApi = {

    /*=========================================================
      CONFIGURACIÓN SMTP
    =========================================================*/

    obtenerConfiguracion: () =>

        api.get(

            "/notification/config"

        ),

    guardarConfiguracion: (data) =>

        api.put(

            "/notification/config",

            data

        ),

    probarConexion: () =>

        api.post(

            "/notification/config/test"

        ),

    /*=========================================================
      PLANTILLAS
    =========================================================*/

    listarPlantillas: () =>

        api.get(

            "/notification/templates"

        ),

    obtenerPlantilla: (id) =>

        api.get(

            `/notification/templates/${id}`

        ),

    crearPlantilla: (data) =>

        api.post(

            "/notification/templates",

            data

        ),

    actualizarPlantilla: (id, data) =>

        api.put(

            `/notification/templates/${id}`,

            data

        ),

    eliminarPlantilla: (id) =>

        api.del(

            `/notification/templates/${id}`

        ),

    /*=========================================================
      NOTIFICACIONES
    =========================================================*/

    enviar: (data) =>

        api.post(

            "/notification/send",

            data

        ),

    listarHistorial: () =>

        api.get(

            "/notification/history"

        ),

    obtenerHistorial: (id) =>

        api.get(

            `/notification/history/${id}`

        ),

    /*=========================================================
EVENTOS
=========================================================*/

    listarEventos: () =>

        api.get(

            "/notification/events"

        ),

    obtenerEvento: (id) =>

        api.get(

            `/notification/events/${id}`

        ),

    crearEvento: (data) =>

        api.post(

            "/notification/events",

            data

        ),

    actualizarEvento: (id, data) =>

        api.put(

            `/notification/events/${id}`,

            data

        ),

    eliminarEvento: (id) =>

        api.del(

            `/notification/events/${id}`

        ),

    /*=========================================================
DESTINATARIOS
=========================================================*/

    listarDestinatarios: () =>

        api.get(

            "/notification/recipients"

        ),

    guardarDestinatarios: (id, destinatarios) =>

        api.put(

            `/notification/events/${id}/recipients`,

            {
                destinatarios
            }

        ),

    obtenerDestinatario: (id) =>

        api.get(

            `/notification/recipients/${id}`

        ),

    crearDestinatario: (data) =>

        api.post(

            "/notification/recipients",

            data

        ),

    actualizarDestinatario: (id, data) =>

        api.put(

            `/notification/recipients/${id}`,

            data

        ),

    eliminarDestinatario: (id) =>

        api.del(

            `/notification/recipients/${id}`

        ),




};