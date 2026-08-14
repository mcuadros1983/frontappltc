import React, {

    useEffect,

    useMemo,

    useState

} from "react";

import {

    Row,

    Col,

    Card,

    Table,

    Button

} from "react-bootstrap";

import {

    metaApi

} from "../../services/evaluacion/metaApi";

const ParametrosEvaluacionTab = () => {

    const [

        loading,

        setLoading

    ] = useState(false);

    const [

        metas,

        setMetas

    ] = useState([]);

    const cargar = async () => {

        try {

            setLoading(true);

            const data =

                await metaApi.listarMetas();

            setMetas(

                data || []

            );

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        cargar();

    }, []);

    const frecuencias = useMemo(() =>

        metas.filter(

            x =>

                x.categoria === "FRECUENCIA"

        ),

        [metas]

    );

    const cumplimiento = useMemo(() =>

        metas.filter(

            x =>

                x.categoria === "CUMPLIMIENTO"

        ),

        [metas]

    );

    const brechas = useMemo(() =>

        metas.filter(

            x =>

                x.categoria === "BRECHA"

        ),

        [metas]

    );

    const editar = item => {

        window.location.href =

            `/evaluacion/metas/${item.id}`;

    };

    const columnas = [

        {

            key: "nombre",

            title: "Nombre"

        },

        {

            key: "capa",

            title: "Capa"

        },

        {

            key: "valor_objetivo",

            title: "Valor"

        },

        {

            key: "unidad_medida",

            title: "Unidad"

        }

    ];

    return (

        <div>

            <Row>

                <Col>

                    <Card>

                        <Card.Header>

                            Frecuencia esperada por capa

                        </Card.Header>

                        <Card.Body>

                            <Table hover>

                                <thead>

                                    <tr>

                                        <th>

                                            Nombre

                                        </th>

                                        <th>

                                            Capa

                                        </th>

                                        <th>

                                            Frecuencia

                                        </th>

                                        <th>

                                            Unidad

                                        </th>

                                        <th>

                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {

                                        frecuencias.map(item => (

                                            <tr

                                                key={item.id}

                                            >

                                                <td>

                                                    {item.nombre}

                                                </td>

                                                <td>

                                                    {item.capa}

                                                </td>

                                                <td>

                                                    {item.valor_objetivo}

                                                </td>

                                                <td>

                                                    {item.unidad_medida}

                                                </td>

                                                <td>

                                                    <Button

                                                        size="sm"

                                                        onClick={() =>

                                                            editar(item)

                                                        }

                                                    >

                                                        Editar

                                                    </Button>

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

            <Row className="mt-4">

                <Col>

                    <Card>

                        <Card.Header>

                            Cumplimiento mínimo

                        </Card.Header>

                        <Card.Body>

                            <Table hover>

                                <thead>

                                    <tr>

                                        <th>

                                            Nombre

                                        </th>

                                        <th>

                                            Capa

                                        </th>

                                        <th>

                                            %

                                        </th>

                                        <th>

                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {

                                        cumplimiento.map(item => (

                                            <tr

                                                key={item.id}

                                            >

                                                <td>

                                                    {item.nombre}

                                                </td>

                                                <td>

                                                    {item.capa}

                                                </td>

                                                <td>

                                                    {item.valor_objetivo}

                                                </td>

                                                <td>

                                                    <Button

                                                        size="sm"

                                                        onClick={() =>

                                                            editar(item)

                                                        }

                                                    >

                                                        Editar

                                                    </Button>

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

            <Row className="mt-4">

                <Col>

                    <Card>

                        <Card.Header>

                            Brechas aceptables

                        </Card.Header>

                        <Card.Body>

                            <Table hover>

                                <thead>

                                    <tr>

                                        <th>

                                            Nombre

                                        </th>

                                        <th>

                                            Comparación

                                        </th>

                                        <th>

                                            Máximo

                                        </th>

                                        <th>

                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {

                                        brechas.map(item => (

                                            <tr

                                                key={item.id}

                                            >

                                                <td>

                                                    {item.nombre}

                                                </td>

                                                <td>

                                                    {item.capa}

                                                </td>

                                                <td>

                                                    {item.valor_objetivo}

                                                </td>

                                                <td>

                                                    <Button

                                                        size="sm"

                                                        onClick={() =>

                                                            editar(item)

                                                        }

                                                    >

                                                        Editar

                                                    </Button>

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

        </div>

    );

};

export default ParametrosEvaluacionTab;

