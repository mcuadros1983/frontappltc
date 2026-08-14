import { api } from "../apiClient";

const BASE_URL = "/evaluaciones/public";

export const evaluacionPublicApi = {

    obtenerFormulario: (token) =>

        api.get(
            `${BASE_URL}/${token}`
        ),

    responder: (token, payload) =>
        

        api.post(
            `${BASE_URL}/${token}/responder`,
            payload
        )

};

export default evaluacionPublicApi;