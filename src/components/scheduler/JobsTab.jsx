import React, {

    useEffect,
    useState

} from "react";

import {

    Button,
    Card,
    Table,
    Badge

} from "react-bootstrap";

import schedulerApi from "../../services/scheduler/schedulerApi";

import JobFormModal from "./JobFormModal";

const JobsTab = () => {

    const [

        jobs,

        setJobs

    ] = useState([]);

    const [

        loading,

        setLoading

    ] = useState(false);

    const [

        showModal,

        setShowModal

    ] = useState(false);

    const [

        selectedJob,

        setSelectedJob

    ] = useState(null);

    /*=========================================================
      CARGAR JOBS
    =========================================================*/

    const cargarJobs = async () => {

        try {

            setLoading(true);

            const data =
                await schedulerApi.listarJobs();

            setJobs(data);

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        cargarJobs();

    }, []);

    /*=========================================================
      NUEVO
    =========================================================*/

    const nuevo = () => {

        setSelectedJob(null);

        setShowModal(true);

    };

    /*=========================================================
      EDITAR
    =========================================================*/

    const editar = (item) => {

        setSelectedJob(item);

        setShowModal(true);

    };

    /*=========================================================
      ELIMINAR
    =========================================================*/

    const eliminar = async (id) => {

        if (

            !window.confirm(

                "¿Desea eliminar el Job?"

            )

        ) {

            return;

        }

        try {

            await schedulerApi.eliminarJob(id);

            cargarJobs();

        }

        catch (error) {

            console.error(error);

        }

    };

    /*=========================================================
      EJECUTAR
    =========================================================*/

    const ejecutar = async (id) => {

        try {

            await schedulerApi.ejecutarAhora(id);

            alert(

                "Proceso ejecutado correctamente."

            );

        }

        catch (error) {

            console.error(error);

            alert(

                "No fue posible ejecutar el Job."

            );

        }

    };

    return (

        <Card>

            <Card.Header
                className="d-flex justify-content-between align-items-center"
            >

                <span>

                    Jobs

                </span>

                <Button

                    onClick={nuevo}

                >

                    Nuevo Job

                </Button>

            </Card.Header>

            <Card.Body>

                <Table

                    hover

                    responsive

                >

                    <thead>

                        <tr>

                            <th>Código</th>

                            <th>Nombre</th>

                            <th>Módulo</th>

                            <th>Cron</th>

                            <th>Estado</th>

                            <th width="260">

                                Acciones

                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            !loading &&

                            jobs.length === 0 &&

                            (

                                <tr>

                                    <td

                                        colSpan={6}

                                        className="text-center"

                                    >

                                        No existen Jobs.

                                    </td>

                                </tr>

                            )

                        }

                        {

                            jobs.map(

                                (item) => (

                                    <tr key={item.id}>

                                        <td>

                                            {item.codigo}

                                        </td>

                                        <td>

                                            {item.nombre}

                                        </td>

                                        <td>

                                            {item.modulo}

                                        </td>

                                        <td>

                                            {item.cron}

                                        </td>

                                        <td>

                                            <Badge

                                                bg={

                                                    item.activo

                                                        ? "success"

                                                        : "secondary"

                                                }

                                            >

                                                {

                                                    item.activo

                                                        ? "Activo"

                                                        : "Inactivo"

                                                }

                                            </Badge>

                                        </td>

                                        <td>

                                            <Button

                                                size="sm"

                                                variant="success"

                                                className="me-2"

                                                onClick={() =>

                                                    ejecutar(item.id)

                                                }

                                            >

                                                Ejecutar

                                            </Button>

                                            <Button

                                                size="sm"

                                                variant="warning"

                                                className="me-2"

                                                onClick={() =>

                                                    editar(item)

                                                }

                                            >

                                                Editar

                                            </Button>

                                            <Button

                                                size="sm"

                                                variant="danger"

                                                onClick={() =>

                                                    eliminar(item.id)

                                                }

                                            >

                                                Eliminar

                                            </Button>

                                        </td>

                                    </tr>

                                )

                            )

                        }

                    </tbody>

                </Table>

            </Card.Body>

            <JobFormModal

                show={showModal}

                onHide={() => {

                    setShowModal(false);

                    setSelectedJob(null);

                }}

                job={selectedJob}

                onSaved={cargarJobs}

            />

        </Card>

    );

};

export default JobsTab;