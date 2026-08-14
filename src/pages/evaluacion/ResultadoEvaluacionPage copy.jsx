// src/pages/evaluacion/ResultadoEvaluacionPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    ERPPage,
    ERPCard,
    ERPToolbar,
    ERPButton,
    ERPBadge,
} from "../../components/common/erp";

import { evaluacionApi }
    from "../../services/evaluacion/evaluacionApi";

const ResultadoEvaluacionPage = () => {

    const { id } = useParams();

    const navigate =
        useNavigate();

    const [loading, setLoading] =
        useState(true);

    const [evaluacion, setEvaluacion] =
        useState(null);

    const [criterios, setCriterios] =
        useState([]);





    /*=========================================
      CARGAR
    =========================================*/

    const cargar = async () => {

        try {

            setLoading(true);

            const data =
                await evaluacionApi.obtenerFormulario(
                    id
                );

            setEvaluacion(data);

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





    /*=========================================
      CALCULOS
    =========================================*/

    const puntajeObtenido =
        useMemo(() => {

            return criterios.reduce(

                (total, criterio) =>

                    total +

                    Number(
                        criterio.puntaje || 0
                    ),

                0

            );

        }, [criterios]);



    const puntajeMaximo =
        useMemo(() => {

            return criterios.reduce(

                (total, criterio) =>

                    total +

                    Number(
                        criterio.puntaje_maximo || 0
                    ),

                0

            );

        }, [criterios]);



    const porcentaje =
        useMemo(() => {

            if (puntajeMaximo === 0)
                return 0;

            return (

                puntajeObtenido * 100

            ) / puntajeMaximo;

        }, [

            puntajeObtenido,

            puntajeMaximo

        ]);





    if (loading) {

        return (

            <ERPPage

                title="Resultado"

            >

                Cargando...

            </ERPPage>

        );

    }

    return (

        <ERPPage

            title={`Resultado ${evaluacion.numero}`}

            subtitle="Resultado de la Evaluación"

        >

            <ERPToolbar

                right={

                    <ERPButton

                        variant="secondary"

                        onClick={() =>

                            navigate("/evaluaciones")

                        }

                    >

                        Volver

                    </ERPButton>

                }

            />

            <ERPCard className="mb-4">

                <div className="row">

                    <div className="col-md-6">

                        <h5>

                            {evaluacion.empleado?.apellido}{" "}

                            {evaluacion.empleado?.nombre}

                        </h5>

                    </div>

                    <div className="col-md-3">

                        <strong>Tipo</strong>

                        <div>

                            {evaluacion.tipo?.descripcion}

                        </div>

                    </div>

                    <div className="col-md-3">

                        <strong>Período</strong>

                        <div>

                            {evaluacion.periodo?.descripcion}

                        </div>

                    </div>

                </div>

                <hr />

                <div className="row">

                    <div className="col-md-3">

                        <strong>Puntaje</strong>

                        <h3>

                            {puntajeObtenido.toFixed(2)}

                        </h3>

                    </div>

                    <div className="col-md-3">

                        <strong>Máximo</strong>

                        <h3>

                            {puntajeMaximo.toFixed(2)}

                        </h3>

                    </div>

                    <div className="col-md-3">

                        <strong>Resultado</strong>

                        <h2>

                            {porcentaje.toFixed(2)} %

                        </h2>

                    </div>

                    <div className="col-md-3">

                        <strong>Estado</strong>

                        <div className="mt-2">

                            <ERPBadge

                                status={

                                    evaluacion.estado

                                }

                            />

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

                        <div className="row">

                            <div className="col-md-8">

                                <h5>

                                    {criterio.descripcion}

                                </h5>

                            </div>

                            <div className="col-md-4 text-end">

                                <strong>

                                    {Number(

                                        criterio.puntaje || 0

                                    ).toFixed(2)}

                                    {" / "}

                                    {Number(

                                        criterio.puntaje_maximo || 0

                                    ).toFixed(2)}

                                </strong>

                            </div>

                        </div>

                        {

                            criterio.comentario && (

                                <div className="mt-3">

                                    <label className="form-label">

                                        Comentario

                                    </label>

                                    <div

                                        className="border rounded p-3 bg-light"

                                    >

                                        {

                                            criterio.comentario

                                        }

                                    </div>

                                </div>

                            )

                        }

                    </ERPCard>

                ))

            }

        </ERPPage>

    );

};

export default ResultadoEvaluacionPage;