import React, {
    useContext,
    useState
} from "react";



import {
    Form
} from "react-bootstrap";

import DataContext from "../../../context/DataContext";

import ERPPage from "../../../components/common/erp/ERPPage";
import ERPLoader from "../../../components/common/erp/ERPLoader";

import reporteEvaluacionService from "../../../services/evaluacion/reporteEvaluacionService";

import ReporteHeader from "../../../components/evaluacion/reportes/ReporteHeader";
import ReporteKPIs from "../../../components/evaluacion/reportes/ReporteKPIs";
import ReporteResumen from "../../../components/evaluacion/reportes/ReporteResumen";
import ReporteRadar from "../../../components/evaluacion/reportes/ReporteRadar";
import ReporteCompetencias from "../../../components/evaluacion/reportes/ReporteCompetencias";
import ReporteHistorico from "../../../components/evaluacion/reportes/ReporteHistorico";
import ReporteRanking from "../../../components/evaluacion/reportes/ReporteRanking";
import ReporteComentarios from "../../../components/evaluacion/reportes/ReporteComentarios";

import Contexts from "../../../context/Contexts";

const ReporteEmpleadoPage = () => {

    // const {

    //     empleados,
    //     sucursales,
    //     periodos

    // } = useContext(DataContext);

    const {

        empleados,
        sucursales

    } = useContext(

        Contexts.DataContext

    );

    const [empleadoId, setEmpleadoId] = useState("");

    const [loading, setLoading] = useState(false);

    const [reporte, setReporte] = useState(null);

    const [sinEvaluaciones, setSinEvaluaciones] = useState(false);

    const cargarReporte = async (id) => {

        try {

            setLoading(true);

            setSinEvaluaciones(false);

            const response =
                await reporteEvaluacionService.obtenerReporte({

                    tipo: "EMPLEADO",

                    id

                });

            console.log("response", response)

            if (!response || !response.resumen) {

                setReporte(null);

                setSinEvaluaciones(true);

                return;

            }

            setReporte(response);

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setLoading(false);

        }

    };

    const handleEmpleadoChange = async (event) => {

        const id = event.target.value;

        setEmpleadoId(id);

        if (!id) {

            setReporte(null);

            return;

        }

        await cargarReporte(id);

    };

    const empleado =
        empleados.find(
            item => item.empleado.id === reporte?.resumen?.empleado_id
        );

    const supervisor =
        empleados.find(
            item => item.empleado.id === reporte?.resumen?.evaluador_id
        );


    const sucursal =
        sucursales.find(

            item => item.id === reporte?.resumen?.sucursal_id

        );

    // const periodo =
    //     periodos.find(

    //         item => item.id === reporte?.resumen?.periodo_id

    //     );

    console.log("empleados", empleados)

    return (

        <ERPPage title="Reporte por Empleado">

            <Form.Group className="mb-4">

                <Form.Label>

                    Empleado

                </Form.Label>

                <Form.Select

                    className="form-control"

                    value={empleadoId}

                    onChange={handleEmpleadoChange}

                >

                    <option value="">

                        Seleccione un empleado

                    </option>

                    {

                        empleados.map(item => (

                            <option
                                key={item.empleado.id}
                                value={item.empleado.id}
                            >
                                {`${item.empleado.nombre} ${item.empleado.apellido}`}
                            </option>

                        ))

                    }

                </Form.Select>

            </Form.Group>

            {

                loading && (

                    <ERPLoader />

                )

            }

            {

                !loading && sinEvaluaciones && (

                    <div className="alert alert-info">

                        El empleado seleccionado no tiene evaluaciones registradas.

                    </div>

                )

            }

            {

                !loading && reporte && (

                    <>

                        <ReporteHeader

                            titulo="Reporte de Desempeño"

                            items={[

                                {

                                    label: "Empleado",

                                    value: `${empleado?.empleado?.nombre ?? ""} ${empleado?.empleado?.apellido ?? ""}`

                                },

                                {

                                    label: "Supervisor",

                                    value: supervisor
                                        ? `${supervisor.empleado.nombre} ${supervisor.empleado.apellido}`
                                        : ""

                                },

                                {

                                    label: "Sucursal",

                                    value: sucursal?.nombre

                                },

                                // {

                                //     label: "Período",

                                //     value: periodo?.nombre

                                // }

                            ]}

                        />

                        <ReporteKPIs

                            items={

                                reporte.indicadores

                            }

                        />

                        <ReporteResumen

                            items={[

                                {

                                    label: "Evaluaciones",

                                    value:

                                        reporte.resumen.totalEvaluaciones

                                },

                                {

                                    label: "Última evaluación",

                                    value:

                                        reporte.resumen.ultimaEvaluacion

                                }

                            ]}

                        />

                        <ReporteRadar

                            data={

                                reporte.radar

                            }

                        />

                        <ReporteCompetencias

                            data={

                                reporte.competencias

                            }

                        />

                        <ReporteHistorico

                            data={

                                reporte.historico

                            }

                        />

                        <ReporteRanking

                            data={

                                reporte.ranking

                            }

                        />

                        <ReporteComentarios

                            data={

                                reporte.comentarios

                            }

                        />

                    </>

                )

            }

        </ERPPage>

    );

};

export default ReporteEmpleadoPage;