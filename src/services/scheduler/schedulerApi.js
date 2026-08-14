import { api } from "../apiClient";

/*=========================================================
  LISTAR JOBS
=========================================================*/

const listarJobs = async () => {

    const { data } =

        await api.get(

            "/scheduler/jobs"

        );

    return data;

};

/*=========================================================
  OBTENER JOB
=========================================================*/

const obtenerJob = async (id) => {

    const { data } =

        await api.get(

            `/scheduler/jobs/${id}`

        );

    return data;

};

/*=========================================================
  CREAR JOB
=========================================================*/

const crearJob = async (job) => {

    const { data } =

        await api.post(

            "/scheduler/jobs",

            job

        );

    return data;

};

/*=========================================================
  ACTUALIZAR JOB
=========================================================*/

const actualizarJob = async (

    id,

    job

) => {

    const { data } =

        await api.put(

            `/scheduler/jobs/${id}`,

            job

        );

    return data;

};

/*=========================================================
  ELIMINAR JOB
=========================================================*/

const eliminarJob = async (id) => {

    const { data } =

        await api.delete(

            `/scheduler/jobs/${id}`

        );

    return data;

};

/*=========================================================
  EJECUTAR AHORA
=========================================================*/

const ejecutarAhora = async (id) => {

    const { data } =

        await api.post(

            `/scheduler/jobs/${id}/run`

        );

    return data;

};

export default {

    listarJobs,

    obtenerJob,

    crearJob,

    actualizarJob,

    eliminarJob,

    ejecutarAhora

};