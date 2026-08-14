// src/pages/evaluacion/EvaluacionFormPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    ERPPage,
    ERPCard,
    ERPToolbar,
    ERPButton,
    ERPBadge,
} from "../../components/common/erp";

import { evaluacionApi } from "../../services/evaluacion/evaluacionApi";

const EvaluacionFormPage = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [formulario, setFormulario] =
        useState(null);

    const [criterios, setCriterios] =
        useState([]);





    /*==================================================
      CARGAR FORMULARIO
    ==================================================*/

    const cargar = async () => {

        try {

            setLoading(true);

            const data =
                await evaluacionApi.obtenerFormulario(
                    id
                );

            setFormulario(data);

            setCriterios(
                data.criterios || []
            );

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    };



    useEffect(() => {

        cargar();

    }, [id]);





    /*==================================================
      CAMBIAR PUNTAJE
    ==================================================*/

    const cambiarPuntaje = (

        criterioId,

        puntaje

    ) => {

        setCriterios(

            criterios.map(c =>

                c.criterio_id === criterioId

                    ? {

                        ...c,

                        puntaje

                    }

                    : c

            )

        );

    };





    /*==================================================
      CAMBIAR COMENTARIO
    ==================================================*/

    const cambiarComentario = (

        criterioId,

        comentario

    ) => {

        setCriterios(

            criterios.map(c =>

                c.criterio_id === criterioId

                    ? {

                        ...c,

                        comentario

                    }

                    : c

            )

        );

    };





    /*==================================================
      GUARDAR
    ==================================================*/

    const guardar = async () => {

        try {

            setSaving(true);

            await evaluacionApi.guardarRespuestas(

                id,

                {

                    respuestas:

                        criterios.map(c => ({

                            criterio_id:
                                c.criterio_id,

                            puntaje:
                                c.puntaje,

                            comentario:
                                c.comentario

                        }))

                }

            );

            alert(
                "Evaluación guardada."
            );

        } catch (error) {

            console.error(error);

            alert(
                "Error al guardar."
            );

        } finally {

            setSaving(false);

        }

    };





    /*==================================================
      FINALIZAR
    ==================================================*/

    const finalizar = async () => {

        try {

            setSaving(true);

            await guardar();

            await evaluacionApi.finalizar(
                id
            );

            alert(
                "Evaluación finalizada."
            );

            navigate(
                "/evaluaciones"
            );

        } catch (error) {

            console.error(error);

            alert(
                "No fue posible finalizar."
            );

        } finally {

            setSaving(false);

        }

    };





    if (loading) {

        return (

            <ERPPage
                title="Evaluación"
            >

                Cargando...

            </ERPPage>

        );

    }

    return (

        <ERPPage

            title={`Evaluación ${formulario.numero}`}

            subtitle="Formulario de Evaluación"

        >

            <ERPToolbar

                right={

                    <ERPBadge

                        status={formulario.estado}

                    />

                }

            />

            <ERPCard className="mb-4">

                <div className="row">

                    <div className="col-md-6 mb-3">

                        <strong>Empleado</strong>

                        <div>

                            {formulario.empleado?.apellido}{" "}

                            {formulario.empleado?.nombre}

                        </div>

                    </div>

                    <div className="col-md-3 mb-3">

                        <strong>Tipo</strong>

                        <div>

                            {formulario.tipo?.descripcion}

                        </div>

                    </div>

                    <div className="col-md-3 mb-3">

                        <strong>Período</strong>

                        <div>

                            {formulario.periodo?.descripcion}

                        </div>

                    </div>

                </div>

            </ERPCard>

            {

                criterios.map((criterio) => (

                    <ERPCard

                        key={criterio.criterio_id}

                        className="mb-3"

                    >

                        <div className="mb-3">

                            <h5>

                                {criterio.descripcion}

                            </h5>

                        </div>

                        <div className="mb-3">

                            <div className="d-flex flex-wrap gap-2">

                                {

                                    Array.from(

                                        {

                                            length:

                                                Number(

                                                    criterio.puntaje_maximo

                                                )

                                        },

                                        (_, i) => i + 1

                                    ).map(numero => (

                                        <button

                                            key={numero}

                                            type="button"

                                            className={

                                                criterio.puntaje === numero

                                                    ? "btn btn-primary"

                                                    : "btn btn-outline-secondary"

                                            }

                                            onClick={() =>

                                                cambiarPuntaje(

                                                    criterio.criterio_id,

                                                    numero

                                                )

                                            }

                                        >

                                            {numero}

                                        </button>

                                    ))

                                }

                            </div>

                        </div>

                        {

                            criterio.permite_comentario && (

                                <div>

                                    <label

                                        className="form-label"

                                    >

                                        Comentario

                                    </label>

                                    <textarea

                                        className="form-control"

                                        rows={3}

                                        value={

                                            criterio.comentario || ""

                                        }

                                        onChange={(e) =>

                                            cambiarComentario(

                                                criterio.criterio_id,

                                                e.target.value

                                            )

                                        }

                                    />

                                </div>

                            )

                        }

                    </ERPCard>

                ))

            }

            <ERPToolbar

                right={

                    <>

                        <ERPButton

                            type="save"

                            onClick={guardar}

                            disabled={saving}

                        >

                            Guardar

                        </ERPButton>

                        <ERPButton
                            variant="success"
                            onClick={finalizar}
                            disabled={saving}
                        >

                            Finalizar Evaluación

                        </ERPButton>

                    </>

                }

            />

        </ERPPage>

    );

};

export default EvaluacionFormPage;