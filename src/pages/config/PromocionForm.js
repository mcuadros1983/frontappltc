import { useEffect, useState, useContext, useMemo } from "react";
import { Form, Button, Row, Col, Card, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Contexts from "../../context/Contexts";

import {
    createPromocion,
    getPromocion,
    updatePromocion,
} from "../../services/promocionesApi";

const diasSemana = [
    { id: 1, label: "Lunes" },
    { id: 2, label: "Martes" },
    { id: 3, label: "Miércoles" },
    { id: 4, label: "Jueves" },
    { id: 5, label: "Viernes" },
    { id: 6, label: "Sábado" },
    { id: 7, label: "Domingo" },
];

const PromocionForm = () => {
    const { articulosTabla } = useContext(Contexts.DataContext);
    const { id } = useParams();
    const navigate = useNavigate();



    const [form, setForm] = useState({
        descripcion: "",
        tipo_promocion: "precio_fijo",
        fecha_desde: "",
        fecha_hasta: "",
        aplica_todos: false,
        activa: true,
        prioridad: 0,
        dias: [],
        articulos: [],
    });

    const [busqueda, setBusqueda] = useState("");
    const [preview, setPreview] = useState(null);

    useEffect(() => {
            console.log("articulospreciotabla", articulosTabla)
        if (id) loadData();
    }, [id]);

    const loadData = async () => {
        const res = await getPromocion(id);
        if (res.ok) {
            const p = res.promocion;

            setForm({
                descripcion: p.descripcion || "",
                tipo_promocion: p.tipo_promocion || "precio_fijo",
                fecha_desde: p.fecha_desde || "",
                fecha_hasta: p.fecha_hasta || "",
                aplica_todos: !!p.aplica_todos,
                activa: !!p.activa,
                prioridad: p.prioridad || 0,
                dias: p.PromocionDiaTablas?.map((d) => d.dia_semana) || [],
                articulos:
                    p.PromocionArticuloTablas?.map((a) => ({
                        articulo_id: a.articulo_id,
                        valor: a.valor ?? "",
                    })) || [],
            });
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === "tipo_promocion") {
            setForm((prev) => ({
                ...prev,
                tipo_promocion: value,
                articulos: [],
            }));
            setPreview(null);
            setBusqueda("");
            return;
        }

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const agregarArticulo = (articulo) => {
        const existe = form.articulos.some(
            (item) => Number(item.articulo_id) === Number(articulo.id)
        );
        if (existe) return;

        setForm((prev) => ({
            ...prev,
            articulos: [
                ...prev.articulos,
                {
                    articulo_id: articulo.id,
                    valor: "",
                },
            ],
        }));

        setBusqueda("");
    };

    const quitarArticulo = (articuloId) => {
        setForm((prev) => ({
            ...prev,
            articulos: prev.articulos.filter(
                (item) => Number(item.articulo_id) !== Number(articuloId)
            ),
        }));
    };

    const actualizarValorArticulo = (articuloId, valor) => {
        setForm((prev) => ({
            ...prev,
            articulos: prev.articulos.map((item) =>
                Number(item.articulo_id) === Number(articuloId)
                    ? { ...item, valor }
                    : item
            ),
        }));
    };

    const handleDiaToggle = (dia) => {
        const exists = form.dias.includes(dia);
        setForm((prev) => ({
            ...prev,
            dias: exists
                ? prev.dias.filter((d) => d !== dia)
                : [...prev.dias, dia],
        }));
    };

    const articulosFiltrados = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();

        if (!texto) return [];

        return (articulosTabla || [])
            .filter((a) => {
                const yaAgregado = form.articulos.some(
                    (item) => Number(item.articulo_id) === Number(a.id)
                );
                if (yaAgregado) return false;

                return (
                    String(a.descripcion || "").toLowerCase().includes(texto) ||
                    String(a.codigobarra || "").toLowerCase().includes(texto)
                );
            })
            .slice(0, 15);
    }, [busqueda, articulosTabla, form.articulos]);

    const handlePreview = async () => {
        if (form.articulos.length === 0) {
            setPreview([]);
            return;
        }

        const resultados = form.articulos.map((item) => {
            const art = (articulosTabla || []).find(
                (a) => Number(a.id) === Number(item.articulo_id)
            );

            const precioNormal = Number(
                art?.ArticuloPreciotablas?.[0]?.precio ||
                art?.precio ||
                0
            );

            const valorPromocion = Number(item.valor || 0);

            let precioFinal = precioNormal;

            if (form.tipo_promocion === "precio_fijo") {
                precioFinal = valorPromocion;
            }

            if (form.tipo_promocion === "porcentaje") {
                precioFinal =
                    precioNormal - (precioNormal * valorPromocion) / 100;
            }

            return {
                articulo_id: item.articulo_id,
                precio_normal: precioNormal,
                precio_final: precioFinal,
            };
        });

        setPreview(resultados);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...form,
            prioridad: Number(form.prioridad || 0),
            articulos: form.articulos.map((item) => ({
                articulo_id: Number(item.articulo_id),
                valor: Number(item.valor || 0),
            })),
        };

        if (id) {
            await updatePromocion(id, payload);
        } else {
            await createPromocion(payload);
        }

        navigate("/promociones");
    };

    return (
        <div className="container mt-4">
            <h3 className="mb-3">{id ? "Editar Promoción" : "Nueva Promoción"}</h3>

            <Form onSubmit={handleSubmit}>
                <Card className="shadow-sm border-0">
                    <Card.Body className="p-4">
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Descripción</Form.Label>
                                    <Form.Control
                                        name="descripcion"
                                        value={form.descripcion}
                                        onChange={handleChange}
                                        size="lg"
                                        style={{ borderRadius: "10px" }}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Tipo</Form.Label>
                                    <Form.Select
                                        name="tipo_promocion"
                                        value={form.tipo_promocion}
                                        onChange={handleChange}
                                        size="lg"
                                        style={{ borderRadius: "10px" }}
                                    >
                                        <option value="precio_fijo">Precio fijo</option>
                                        <option value="porcentaje">Porcentaje</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Prioridad</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="prioridad"
                                        value={form.prioridad}
                                        onChange={handleChange}
                                        size="lg"
                                        style={{ borderRadius: "10px" }}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Fecha desde</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="fecha_desde"
                                        value={form.fecha_desde}
                                        onChange={handleChange}
                                        size="lg"
                                        style={{ borderRadius: "10px" }}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Fecha hasta</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="fecha_hasta"
                                        value={form.fecha_hasta}
                                        onChange={handleChange}
                                        size="lg"
                                        style={{ borderRadius: "10px" }}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={3} className="d-flex align-items-end">
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="Aplica a todos los artículos"
                                        name="aplica_todos"
                                        checked={form.aplica_todos}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={3} className="d-flex align-items-end">
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="Activa"
                                        name="activa"
                                        checked={form.activa}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mt-3">
                            <Form.Label className="fw-semibold">Días de la semana</Form.Label>
                            <div className="d-flex flex-wrap gap-3 mt-2">
                                {diasSemana.map((d) => (
                                    <Form.Check
                                        key={d.id}
                                        inline
                                        label={d.label}
                                        checked={form.dias.includes(d.id)}
                                        onChange={() => handleDiaToggle(d.id)}
                                    />
                                ))}
                            </div>
                        </Form.Group>

                        {!form.aplica_todos && (
                            <>
                                <hr className="my-4" />

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Buscar artículos</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Buscar por descripción o código..."
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        size="lg"
                                        style={{ borderRadius: "10px" }}
                                    />
                                </Form.Group>

                                {busqueda && (
                                    <div
                                        style={{
                                            maxHeight: "220px",
                                            overflowY: "auto",
                                            border: "1px solid #dee2e6",
                                            borderRadius: "10px",
                                            background: "#fff",
                                            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                                            marginBottom: "20px",
                                        }}
                                    >
                                        {articulosFiltrados.length === 0 ? (
                                            <div className="p-3 text-muted">Sin resultados</div>
                                        ) : (
                                            articulosFiltrados.map((a) => (
                                                <div
                                                    key={a.id}
                                                    style={{
                                                        padding: "10px 14px",
                                                        cursor: "pointer",
                                                        borderBottom: "1px solid #f1f1f1",
                                                    }}
                                                    onClick={() => agregarArticulo(a)}
                                                >
                                                    <div className="fw-semibold">{a.descripcion}</div>
                                                    <small className="text-muted">
                                                        Código: {a.codigobarra || "-"}
                                                    </small>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                <Form.Group className="mt-3">
                                    <Form.Label className="fw-semibold">
                                        Artículos cargados
                                    </Form.Label>

                                    <div className="table-responsive mt-2">
                                        <Table bordered hover className="mb-0">
                                            <thead>
                                                <tr>
                                                    <th style={{ minWidth: "380px" }}>Artículo</th>
                                                    <th style={{ minWidth: "180px" }}>
                                                        {form.tipo_promocion === "precio_fijo"
                                                            ? "Precio promocional"
                                                            : "Porcentaje"}
                                                    </th>
                                                    <th style={{ width: "120px" }}>Quitar</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {form.articulos.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={3} className="text-center text-muted py-4">
                                                            No hay artículos cargados
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    form.articulos.map((item) => {
                                                        const art = (articulosTabla || []).find(
                                                            (a) =>
                                                                Number(a.id) === Number(item.articulo_id)
                                                        );

                                                        return (
                                                            <tr key={item.articulo_id}>
                                                                <td>
                                                                    <div className="fw-semibold">
                                                                        {art?.descripcion || item.articulo_id}
                                                                    </div>
                                                                    <small className="text-muted">
                                                                        Código: {art?.codigobarra || "-"}
                                                                    </small>
                                                                </td>
                                                                <td>
                                                                    <Form.Control
                                                                        type="number"
                                                                        value={item.valor}
                                                                        onChange={(e) =>
                                                                            actualizarValorArticulo(
                                                                                item.articulo_id,
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        placeholder={
                                                                            form.tipo_promocion === "precio_fijo"
                                                                                ? "Ej: 9900"
                                                                                : "Ej: 15"
                                                                        }
                                                                        size="lg"
                                                                        style={{ borderRadius: "10px" }}
                                                                    />
                                                                </td>
                                                                <td className="text-center">
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            quitarArticulo(item.articulo_id)
                                                                        }
                                                                    >
                                                                        Quitar
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Form.Group>
                            </>
                        )}

                        <div className="d-flex gap-2 mt-4">
                            <Button
                                type="button"
                                variant="outline-primary"
                                onClick={handlePreview}
                                style={{
                                    borderRadius: "10px",
                                    padding: "10px 18px",
                                    fontWeight: "600",
                                }}
                            >
                                Ver preview
                            </Button>

                            <Button
                                type="submit"
                                style={{
                                    borderRadius: "10px",
                                    padding: "10px 18px",
                                    fontWeight: "600",
                                }}
                            >
                                Guardar
                            </Button>
                        </div>

                        {preview && (
                            <div className="mt-4">
                                <h5 className="fw-semibold">Preview actual</h5>
                                <div className="table-responsive">
                                    <Table bordered hover>
                                        <thead>
                                            <tr>
                                                <th>Artículo</th>
                                                <th>Precio normal</th>
                                                <th>Precio final</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {preview.map((p) => {
                                                const art = (articulosTabla || []).find(
                                                    (a) => Number(a.id) === Number(p.articulo_id)
                                                );

                                                return (
                                                    <tr key={p.articulo_id}>
                                                        <td>{art?.descripcion || p.articulo_id}</td>
                                                        <td>{p.precio_normal}</td>
                                                        <td>{p.precio_final}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Form>
        </div>
    );
};

export default PromocionForm;