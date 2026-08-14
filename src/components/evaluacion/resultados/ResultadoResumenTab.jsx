
import {

    Row,

    Col,

    Card,

    Table

} from "react-bootstrap";

import React, { useContext, useMemo } from "react";
import Contexts from "../../../context/Contexts";

const ResultadoResumenTab = ({

    resultado

}) => {

    const { empleados } = useContext(
        Contexts.DataContext
    );

    const empleadosMap = useMemo(() => {

        const map = new Map();

        empleados.forEach(emp => {

            const id =

                emp?.empleado?.id ??

                emp?.id;

            if (!id) return;

            const apellido =

                emp?.clientePersona?.apellido ||

                emp?.empleado?.apellido ||

                "";

            const nombre =

                emp?.clientePersona?.nombre ||

                emp?.empleado?.nombre ||

                "";

            map.set(

                Number(id),

                `${apellido} ${nombre}`.trim()

            );

        });

        return map;

    }, [empleados]);

    const obtenerNombreEmpleado = (empleadoId) => {

        return (

            empleadosMap.get(

                Number(empleadoId)

            ) ||

            `Empleado #${empleadoId}`

        );

    };

    if (!resultado) {

        return null;

    }

    const ranking =

        resultado.ranking || [];

    const competencias =

        resultado.competencias || [];

    const participantes =

        resultado.participantes || [];

    return (

        <>

            <Row>

                <Col lg={6}>

                    <Card className="mb-4">

                        <Card.Header>

                            Top 5 Ranking

                        </Card.Header>

                        <Card.Body>

                            <Table

                                hover

                                responsive

                                size="sm"

                            >

                                <thead>

                                    <tr>

                                        <th>Empleado</th>

                                        <th>Promedio</th>

                                        <th>Evaluaciones</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {

                                        ranking

                                            .slice(0, 5)

                                            .map(item => (

                                                <tr

                                                    key={

                                                        item.empleado_id

                                                    }

                                                >

                                                    <td>

                                                        {

                                                            obtenerNombreEmpleado(

                                                                item.empleado_id

                                                            )

                                                        }

                                                    </td>

                                                    <td>

                                                        {

                                                            Number(

                                                                item.promedio

                                                            ).toFixed(2)

                                                        }

                                                        %

                                                    </td>

                                                    <td>

                                                        {

                                                            item.cantidad

                                                        }

                                                    </td>

                                                </tr>

                                            ))

                                    }

                                </tbody>

                            </Table>

                        </Card.Body>

                    </Card>

                </Col>

                <Col lg={6}>

                    <Card className="mb-4">

                        <Card.Header>

                            Mejores Competencias

                        </Card.Header>

                        <Card.Body>

                            <Table

                                hover

                                responsive

                                size="sm"

                            >

                                <thead>

                                    <tr>

                                        <th>Competencia</th>

                                        <th>Promedio</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {

                                        competencias

                                            .slice(0, 5)

                                            .map(item => (

                                                <tr

                                                    key={

                                                        item.criterio.id

                                                    }

                                                >

                                                    <td>

                                                        {

                                                            item.criterio.descripcion

                                                        }

                                                    </td>

                                                    <td>

                                                        {

                                                            Number(

                                                                item.get

                                                                    ? item.get("promedio")

                                                                    : item.promedio

                                                            ).toFixed(2)

                                                        }

                                                    </td>

                                                </tr>

                                            ))

                                    }

                                </tbody>

                            </Table>

                        </Card.Body>

                    </Card>

                </Col>

            </Row>

            <Row>

                <Col lg={6}>

                    <Card>

                        <Card.Header>

                            Competencias a Mejorar

                        </Card.Header>

                        <Card.Body>

                            <Table

                                hover

                                responsive

                                size="sm"

                            >

                                <thead>

                                    <tr>

                                        <th>Competencia</th>

                                        <th>Promedio</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {

                                        [...competencias]

                                            .sort(

                                                (a, b) =>

                                                    Number(

                                                        a.get

                                                            ? a.get("promedio")

                                                            : a.promedio

                                                    )

                                                    -

                                                    Number(

                                                        b.get

                                                            ? b.get("promedio")

                                                            : b.promedio

                                                    )

                                            )

                                            .slice(0, 5)

                                            .map(item => (

                                                <tr

                                                    key={

                                                        item.criterio.id

                                                    }

                                                >

                                                    <td>

                                                        {

                                                            item.criterio.descripcion

                                                        }

                                                    </td>

                                                    <td>

                                                        {

                                                            Number(

                                                                item.get

                                                                    ? item.get("promedio")

                                                                    : item.promedio

                                                            ).toFixed(2)

                                                        }

                                                    </td>

                                                </tr>

                                            ))

                                    }

                                </tbody>

                            </Table>

                        </Card.Body>

                    </Card>

                </Col>

                <Col lg={6}>

                    <Card>

                        <Card.Header>

                            Participación

                        </Card.Header>

                        <Card.Body>

                            <Table

                                hover

                                responsive

                                size="sm"

                            >

                                <thead>

                                    <tr>

                                        <th>Tipo</th>

                                        <th>Cantidad</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    <tr>

                                        <td>Autoevaluación</td>

                                        <td>

                                            {

                                                resultado.indicadores.auto

                                            }

                                        </td>

                                    </tr>

                                    <tr>

                                        <td>Supervisor</td>

                                        <td>

                                            {

                                                resultado.indicadores.supervisor

                                            }

                                        </td>

                                    </tr>

                                    <tr>

                                        <td>Mystery</td>

                                        <td>

                                            {

                                                resultado.indicadores.mystery

                                            }

                                        </td>

                                    </tr>

                                    <tr>

                                        <td>

                                            Total Respuestas

                                        </td>

                                        <td>

                                            {

                                                participantes.length

                                            }

                                        </td>

                                    </tr>

                                </tbody>

                            </Table>

                        </Card.Body>

                    </Card>

                </Col>

            </Row>

        </>

    );

};

export default ResultadoResumenTab;