import React, {

    useEffect,
    useState

} from "react";

import {

    Modal,
    Spinner,
    Alert

} from "react-bootstrap";

import {

    ERPButton

} from "../common/erp";

import {

    evaluacionApi

} from "../../services/evaluacion/evaluacionApi";

const ReporteDetalleModal = ({

    show,

    evaluacionId,

    onHide

}) => {

    /*=========================================
      ESTADOS
    =========================================*/

    const [

        loading,

        setLoading

    ] = useState(false);

    const [

        evaluacion,

        setEvaluacion

    ] = useState(null);

    const [

        error,

        setError

    ] = useState("");

    /*=========================================
      CARGAR EVALUACION
    =========================================*/

    const cargar = async () => {

        if (

            !evaluacionId ||

            !show

        ) {

            return;

        }

        try {

            setLoading(true);

            setError("");

            const data =

                await evaluacionApi.obtenerFormulario(

                    evaluacionId

                );

            setEvaluacion(

                data

            );

        } catch (err) {

            console.error(err);

            setError(

                err?.response?.data?.message ||

                err?.message ||

                "Error cargando la evaluación."

            );

        } finally {

            setLoading(false);

        }

    };

    /*=========================================
      EFECTO
    =========================================*/

    useEffect(() => {

        cargar();

    }, [

        evaluacionId,

        show

    ]);

    /*=========================================
      PDF
    =========================================*/

    const descargarPdf = () => {

        if (!evaluacionId) {

            return;

        }

        window.open(

            `${process.env.REACT_APP_API_URL}/evaluacion/${evaluacionId}/pdf`,

            "_blank"

        );

    };

    /*=========================================
      CERRAR
    =========================================*/

    const cerrar = () => {

        setEvaluacion(null);

        setError("");

        onHide();

    };

        return (

        <Modal

            show={show}

            onHide={cerrar}

            size="xl"

            centered

        >

            <Modal.Header closeButton>

                <Modal.Title>

                    Detalle de Evaluación

                </Modal.Title>

            </Modal.Header>

            <Modal.Body>

                {

                    loading && (

                        <div className="text-center py-5">

                            <Spinner animation="border" />

                        </div>

                    )

                }

                {

                    error && (

                        <Alert variant="danger">

                            {error}

                        </Alert>

                    )

                }

                {

                    !loading &&

                    !error &&

                    evaluacion && (

                        <>

                            {/*=====================================
                              CABECERA
                            =====================================*/}

                            <div className="row mb-4">

                                <div className="col-md-6">

                                    <table className="table table-sm">

                                        <tbody>

                                            <tr>

                                                <th style={{ width: 180 }}>

                                                    Número

                                                </th>

                                                <td>

                                                    {evaluacion.numero}

                                                </td>

                                            </tr>

                                            <tr>

                                                <th>

                                                    Fecha

                                                </th>

                                                <td>

                                                    {evaluacion.fecha}

                                                </td>

                                            </tr>

                                            <tr>

                                                <th>

                                                    Estado

                                                </th>

                                                <td>

                                                    {evaluacion.estado}

                                                </td>

                                            </tr>

                                            <tr>

                                                <th>

                                                    Resultado

                                                </th>

                                                <td>

                                                    <strong>

                                                        {

                                                            Number(

                                                                evaluacion.porcentaje ||

                                                                0

                                                            ).toFixed(2)

                                                        } %

                                                    </strong>

                                                </td>

                                            </tr>

                                        </tbody>

                                    </table>

                                </div>

                                <div className="col-md-6">

                                    <table className="table table-sm">

                                        <tbody>

                                            <tr>

                                                <th style={{ width: 180 }}>

                                                    Empleado

                                                </th>

                                                <td>

                                                    {

                                                        evaluacion.empleado?.apellido

                                                    }

                                                    {" "}

                                                    {

                                                        evaluacion.empleado?.nombre

                                                    }

                                                </td>

                                            </tr>

                                            <tr>

                                                <th>

                                                    Evaluador

                                                </th>

                                                <td>

                                                    {

                                                        evaluacion.evaluador?.usuario

                                                    }

                                                </td>

                                            </tr>

                                            <tr>

                                                <th>

                                                    Tipo

                                                </th>

                                                <td>

                                                    {

                                                        evaluacion.tipo?.descripcion

                                                    }

                                                </td>

                                            </tr>

                                            <tr>

                                                <th>

                                                    Período

                                                </th>

                                                <td>

                                                    {

                                                        evaluacion.periodo?.descripcion

                                                    }

                                                </td>

                                            </tr>

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                            {/*=====================================
                              CRITERIOS
                            =====================================*/}

                            <div className="table-responsive">

                                <table className="table table-bordered table-hover">

                                    <thead className="table-light">

                                        <tr>

                                            <th style={{ width: 70 }}>

                                                Código

                                            </th>

                                            <th>

                                                Criterio

                                            </th>

                                            <th style={{ width: 120 }}>

                                                Puntaje

                                            </th>

                                            <th>

                                                Comentario

                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {

                                            evaluacion.criterios?.map(

                                                criterio => (

                                                    <tr

                                                        key={

                                                            criterio.criterio_id

                                                        }

                                                    >

                                                        <td>

                                                            {

                                                                criterio.codigo

                                                            }

                                                        </td>

                                                        <td>

                                                            {

                                                                criterio.descripcion

                                                            }

                                                        </td>

                                                        <td className="text-center">

                                                            {

                                                                criterio.puntaje

                                                            }

                                                            {" / "}

                                                            {

                                                                criterio.puntaje_maximo

                                                            }

                                                        </td>

                                                        <td>

                                                            {

                                                                criterio.comentario ||

                                                                "-"

                                                            }

                                                        </td>

                                                    </tr>

                                                )

                                            )

                                        }

                                    </tbody>

                                </table>

                            </div>

                        </>

                    )

                }

            </Modal.Body>

            <Modal.Footer>

                <ERPButton

                    variant="outline-success"

                    onClick={descargarPdf}

                >

                    Descargar PDF

                </ERPButton>

                <ERPButton

                    variant="secondary"

                    onClick={cerrar}

                >

                    Cerrar

                </ERPButton>

            </Modal.Footer>

        </Modal>

    );

};

export default ReporteDetalleModal;