import React, { useState, useEffect } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";

const ActualizarPorTropa = () => {
    const [tropas, setTropas] = useState([]);
    const [tropaSeleccionada, setTropaSeleccionada] = useState("");
    const [categoria, setCategoria] = useState("");
    const [subcategoria, setSubcategoria] = useState("");
    const [costo, setCosto] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [exito, setExito] = useState(false);

    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        fetch(`${apiUrl}/productos`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                const tropasUnicas = [...new Set(data.map((p) => p.tropa).filter(Boolean))];
                const tropasOrdenadas = tropasUnicas.sort((a, b) => {
                    const numA = isNaN(a) ? a : Number(a);
                    const numB = isNaN(b) ? b : Number(b);
                    return numA - numB;
                });
                setTropas(tropasOrdenadas);
            })
            .catch((err) => console.error("Error al obtener tropas:", err));
    }, [apiUrl]);

    const limpiarFormulario = () => {
        setTropaSeleccionada("");
        setCategoria("");
        setSubcategoria("");
        setCosto("");
    };

    const handleActualizar = async () => {
        if (!tropaSeleccionada) {
            setExito(false);
            setMensaje("Debe seleccionar una tropa.");
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/productos/actualizar-por-tropa`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    tropa: tropaSeleccionada,
                    categoria_producto: categoria,
                    subcategoria: subcategoria,
                    costo: costo,
                }),
            });

            const data = await response.json();
            setExito(response.ok);
            setMensaje(data.mensaje || "Actualización completada.");
            if (response.ok) limpiarFormulario(); // Limpiar campos si fue exitoso
        } catch (error) {
            setExito(false);
            setMensaje("Error al actualizar productos.");
        }
    };

    // Cada vez que se modifique algún campo, limpiar mensaje
    const handleFieldChange = (setter) => (e) => {
        setter(e.target.value);
        setMensaje("");
        setExito(false);
    };

    return (
        <Container className="mt-4">
            <h4 className="my-list-title dark-text mb-4 text-center">
                Actualizar productos por Tropa
            </h4>

            {mensaje && (
                <Alert variant={exito ? "success" : "danger"} className="text-center">
                    {mensaje}
                </Alert>
            )}

            <div style={{ maxWidth: "400px", margin: "auto" }}>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Tropa</Form.Label>
                        <Form.Select
                            value={tropaSeleccionada}
                            onChange={handleFieldChange(setTropaSeleccionada)}
                            className="my-input custom-style-select"
                            size="lg"
                        >
                            <option value="">Seleccione una tropa</option>
                            {tropas.map((tropa, i) => (
                                <option key={i} value={tropa}>
                                    {tropa}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Categoría</Form.Label>
                        <Form.Select
                            value={categoria}
                            onChange={handleFieldChange(setCategoria)}
                            className="my-input custom-style-select"
                            size="lg"
                        >
                            <option value="">Seleccione una categoría</option>
                            <option value="bovino">bovino</option>
                            <option value="porcino">porcino</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Subcategoría</Form.Label>
                        <Form.Select
                            value={subcategoria}
                            onChange={handleFieldChange(setSubcategoria)}
                            className="my-input custom-style-select"
                            size="lg"
                        >
                            <option value="">Seleccione una subcategoría</option>
                            <option value="nt">nt</option>
                            <option value="va">va</option>
                            <option value="cerdo">cerdo</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Costo</Form.Label>
                        <Form.Control
                            type="text"
                            inputMode="decimal"
                            pattern="^\d*(\.\d{0,2})?$"
                            value={costo}
                            onChange={(e) => {
                                const input = e.target.value.replace(",", "."); // Reemplaza coma por punto
                                // Permite solo números con hasta 2 decimales
                                if (/^\d*(\.\d{0,2})?$/.test(input) || input === "") {
                                    setCosto(input);
                                    setMensaje("");
                                    setExito(false);
                                }
                            }}
                            className="my-input custom-style-select"
                            size="lg"
                            placeholder="Ej: 123.45"
                        />
                    </Form.Group>

                    <div className="text-center">
                        <Button variant="primary" onClick={handleActualizar}>
                            Actualizar Productos
                        </Button>
                    </div>
                </Form>
            </div>
        </Container>
    );
};

export default ActualizarPorTropa;
