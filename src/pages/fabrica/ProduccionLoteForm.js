import React, {
    useEffect,
    useState
} from "react";
import Select from "react-select";
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    Table,
    Card
} from "react-bootstrap";
import {
    useNavigate,
    useParams
} from "react-router-dom";
import {
    produccionLoteApi
} from "../../services/produccionLoteApi";

export default function ProduccionLoteForm() {

    const navigate = useNavigate();
    const { id } = useParams();
    const [articulos, setArticulos] = useState([]);
    const [form, setForm] = useState({
        fecha_produccion: "",
        fecha_vencimiento: "",
        observaciones: "",
        detalles: []
    });

    const articuloOptions = articulos.map((a) => ({
        value: a.id,
        label: `${(a.articulodescripcion || a.descripcion || "")
            .replace(/^-+\s*/, "")
            .trim()}`
    }));

    useEffect(() => {
        cargarArticulos();

        if (id) {
            cargarLote();
        }
    }, [id]);

    const cargarArticulos = async () => {
        try {
            const data =
                await produccionLoteApi.obtenerArticulos();
            setArticulos(data);
        } catch (error) {
            console.error(error);
        }
    };

    const cargarLote = async () => {
        try {
            const data =
                await produccionLoteApi.getById(id);
            setForm({
                fecha_produccion:
                    data.fecha_produccion || "",
                fecha_vencimiento:
                    data.fecha_vencimiento || "",
                observaciones:
                    data.observaciones || "",
                detalles:
                    data.detalles || []
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]:
                e.target.value
        });
    };

    const agregarDetalle = () => {
        setForm({
            ...form,
            detalles: [
                ...form.detalles,
                {
                    articulo_id: "",
                    cantidad: ""
                }
            ]
        });
    };

    const actualizarDetalle = (
        index,
        campo,
        valor
    ) => {
        const nuevos =
            [...form.detalles];
        nuevos[index][campo] =
            valor;
        setForm({
            ...form,
            detalles: nuevos
        });
    };

    const eliminarDetalle = (
        index
    ) => {
        const nuevos =
            [...form.detalles];

        nuevos.splice(index, 1);
        setForm({
            ...form,
            detalles: nuevos
        });
    };

    const guardar = async () => {
        try {
            if (
                form.detalles.length === 0
            ) {
                alert(
                    "Debe agregar al menos un producto"
                );
                return;
            }
            if (!form.fecha_produccion) {
                alert("Debe ingresar fecha de producción");
                return;
            }
            if (!form.fecha_vencimiento) {
                alert("Debe ingresar fecha de vencimiento");
                return;
            }
            if (id) {
                await produccionLoteApi.update(
                    id,
                    form
                );
            } else {
                await produccionLoteApi.create(
                    form
                );
            }

            navigate(
                "/fabrica/produccion-lotes"
            );

        } catch (error) {
            console.error(error);
            alert(
                "Error al guardar"
            );
        }
    };

    return (
        <Container fluid>
            <Card>
                <Card.Header>
                    <h4>
                        {
                            id
                                ? "Editar Lote"
                                : "Nuevo Lote"
                        }
                    </h4>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>
                                    Fecha Producción
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    name="fecha_produccion"
                                    value={
                                        form.fecha_produccion
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>
                                    Fecha Vencimiento
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    name="fecha_vencimiento"
                                    value={
                                        form.fecha_vencimiento
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col>
                            <Form.Group>
                                <Form.Label>
                                    Observaciones
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="observaciones"
                                    value={
                                        form.observaciones
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <hr />
                    <div className="d-flex justify-content-between mb-3">
                        <h5>
                            Productos del lote
                        </h5>
                        <Button
                            onClick={
                                agregarDetalle
                            }
                        >
                            Agregar Producto
                        </Button>
                    </div>
                    <Table
                        bordered
                        striped
                        hover
                    >
                        <thead>
                            <tr>
                                <th>
                                    Artículo
                                </th>
                                <th width="180">
                                    Cantidad
                                </th>
                                <th width="100">
                                    Acción
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                form.detalles.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <tr
                                            key={index}
                                        >
                                            <td>
                                                <Select
                                                    placeholder="Buscar artículo..."

                                                    value={
                                                        articuloOptions.find(
                                                            (o) =>
                                                                Number(o.value) ===
                                                                Number(item.articulo_id)
                                                        ) || null
                                                    }
                                                    options={articuloOptions}
                                                    onChange={(selected) =>
                                                        actualizarDetalle(
                                                            index,
                                                            "articulo_id",
                                                            selected?.value || ""
                                                        )
                                                    }
                                                    isClearable
                                                    noOptionsMessage={() =>
                                                        "No se encontraron artículos"
                                                    }
                                                    styles={{
                                                        menu: (base) => ({
                                                            ...base,
                                                            zIndex: 9999
                                                        })
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <Form.Control
                                                    type="number"
                                                    step="0.001"
                                                    value={
                                                        item.cantidad
                                                    }
                                                    onChange={(e) =>
                                                        actualizarDetalle(
                                                            index,
                                                            "cantidad",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <Button
                                                    variant="danger"
                                                    onClick={() =>
                                                        eliminarDetalle(
                                                            index
                                                        )
                                                    }
                                                >
                                                    X
                                                </Button>
                                            </td>
                                        </tr>
                                    )
                                )
                            }
                        </tbody>
                    </Table>
                </Card.Body>
                <Card.Footer>
                    <Button
                        variant="success"
                        onClick={
                            guardar
                        }
                    >
                        Guardar
                    </Button>
                    {" "}
                    <Button
                        variant="secondary"
                        onClick={() =>
                            navigate(
                                "/fabrica/produccion-lotes"
                            )
                        }
                    >
                        Volver
                    </Button>
                </Card.Footer>
            </Card>
        </Container>
    );
}