import React, { useContext, useState } from "react";
import { Table, Form, Button, Row, Col, Container, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Contexts from "../../../context/Contexts"; // o según tu estructura

export default function CalculoRindeGeneral() {
    const [mes, setMes] = useState(1);
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [showIngresosModal, setShowIngresosModal] = useState(false);

    const [novillosIngresos, setNovillosIngresos] = useState(0);
    const [exportacionIngresos, setExportacionIngresos] = useState(0);
    const [cerdosIngresos, setCerdosIngresos] = useState(0);

    const [cantidadMedias, setCantidadMedias] = useState(0);
    const [totalKg, setTotalKg] = useState(0);
    const [mbcerdo, setMbcerdo] = useState(0);
    const [costoprom, setCostoprom] = useState(0);
    const [mgtotal, setMgtotal] = useState(0);
    const [mgporkg, setMgporkg] = useState(0);
    const [totalventa, setTotalventa] = useState(0);
    const [totalVentas, setTotalVentas] = useState(0);
    const [gastos, setGastos] = useState(0);
    const [cajagrande, setCajagrande] = useState(0);
    const [otros, setOtros] = useState(0);
    const [costovacuno, setCostovacuno] = useState(0);
    const [achuras, setAchuras] = useState(0);
    const [difInventario, setDifInventario] = useState(0);
    const [costoporcino, setCostoporcino] = useState(0);
    const [totalKgCerdo, setTotalKgCerdo] = useState(0);
    const [totalKgNovillo, setTotalKgNovillo] = useState(0);
    const [totalKgVaca, setTotalKgVaca] = useState(0);

    const [ingEsperado, setIngEsperado] = useState(0);
    const [ingVendido, setIngVendido] = useState(0);
    const [difEsperado, setDifEsperado] = useState(0);
    const [difVendido, setDifVendido] = useState(0);
    const [rinde, setRinde] = useState(0);
    const [valorRinde, setValorRinde] = useState(0);
    const [eficiencia, setEficiencia] = useState(0);

    const [showOmitirModal, setShowOmitirModal] = useState(false);
    const [rindesDisponibles, setRindesDisponibles] = useState([]);
    const [rindesOmitidosIds, setRindesOmitidosIds] = useState([]);

    const apiUrl = process.env.REACT_APP_API_URL;
    const context = useContext(Contexts.DataContext);

    const round2 = (val) => parseFloat(val).toFixed(2);
    const formatCurrency = (val) => val != null ? `$${Number(val).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : val;

    const navigate = useNavigate();

    const obtenerRindesDisponibles = async () => {
        try {
            const res = await fetch(`${apiUrl}/obtenerrindefiltrado`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mes, anio }),
            });

            if (res.ok) {
                const json = await res.json();
                console.log("rindes disponibles", json)
                setRindesDisponibles(json.rindes);
            } else {
                alert("Error al cargar rindes disponibles.");
            }
        } catch (error) {
            console.error("Error al obtener rindes:", error);
        }
    };

    const handleGuardarRindeGeneral = async () => {
        const confirmar = window.confirm("¿Deseás guardar el rinde consolidado?");
        if (!confirmar) return;

        try {
            const payload = {
                mes,
                anio,
                cantidadMedias,
                totalKg,
                mbcerdo,
                costoprom,
                mgtotal,
                mgporkg,
                totalVentas,
                totalventa,
                gastos,
                cajagrande,
                otros,
                costovacuno,
                achuras,
                difInventario,
                costoporcino,
                totalKgCerdo,
                totalKgNovillo,
                totalKgVaca,
                novillosIngresos,
                exportacionIngresos,
                cerdosIngresos,
                ingEsperado,
                ingVendido,
                difEsperado,
                difVendido,
                rinde,
                valorRinde,
                eficiencia,
            };

            const res = await fetch(`${apiUrl}/general/guardar`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                alert("Rinde general guardado correctamente.");
                navigate("/inventory/performancegenerallist/");
            } else {
                alert("Error al guardar el rinde general.");
            }
        } catch (error) {
            console.error("Error al guardar rinde general", error);
        }
    };


    const handleObtenerRindesGenerales = async () => {
        try {
            const res = await fetch(`${apiUrl}/obtenerrindefiltrado`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ mes, anio }),
            });
            const json = await res.json();
            const data = json.rindes;

            const dataFiltrada = data.filter(r => !rindesOmitidosIds.includes(r.id));

            const sum = campo => dataFiltrada.reduce((acc, r) => acc + (parseFloat(r[campo]) || 0), 0);
            const sumTotalKg = sum("totalKg");


            setCantidadMedias(sum("cantidadMedias"));
            setTotalKg(sumTotalKg);
            setMbcerdo(sum("mbcerdo"));
            setCostoprom((sum("costovacuno") / (sumTotalKg || 1)).toFixed(2));
            setMgtotal(sum("mgtotal").toFixed(2));
            setMgporkg(sum("mgporkg").toFixed(2));
            setTotalventa(sum("totalventa").toFixed(2));
            setTotalVentas(sum("totalVentas").toFixed(2));
            setGastos(sum("gastos").toFixed(2));
            setCajagrande(sum("cajagrande").toFixed(2));
            setOtros(sum("otros").toFixed(2));
            setCostovacuno(sum("costovacuno").toFixed(2));
            setAchuras(sum("achuras").toFixed(2));
            setDifInventario(sum("difInventario").toFixed(2));
            setCostoporcino(sum("costoporcino").toFixed(2));
            setTotalKgCerdo(sum("totalKgCerdo"));
            setTotalKgNovillo(sum("totalKgNovillo"));
            setTotalKgVaca(sum("totalKgVaca"));

            const ingresoEsperado = ((novillosIngresos * sum("totalKgNovillo")) + (exportacionIngresos * sum("totalKgVaca"))) / (sumTotalKg || 1);

            const ingresoVendido = (sum("totalVentas") - sum("mbcerdo") - sum("achuras") + sum("difInventario")) / (sumTotalKg || 1);
            const diferenciaEsperado = ingresoEsperado - (sum("costovacuno") / (sumTotalKg || 1));
            const diferenciaVendido = ingresoVendido - (sum("costovacuno") / (sumTotalKg || 1));
            const porcentajePerdida = (1 - ingresoVendido / (ingresoEsperado || 1))
            const valorPorRinde = ingresoEsperado / 93;
            console.log("porcentajeperdida", porcentajePerdida, "valorporrinde", valorPorRinde, "sumatotalkg", sumTotalKg)
            const eficienciaFinal = (porcentajePerdida) * valorPorRinde * sumTotalKg * 100;

            setIngEsperado(ingresoEsperado.toFixed(2));
            setIngVendido(ingresoVendido.toFixed(2));
            setDifEsperado(diferenciaEsperado.toFixed(2));
            setDifVendido(diferenciaVendido.toFixed(2));
            setRinde(porcentajePerdida);
            setValorRinde(valorPorRinde.toFixed(2));
            setEficiencia(eficienciaFinal.toFixed(2));
        } catch (error) {
            console.error("Error al obtener rindes generales", error);
        }
    };

    return (
        <Container>
            <h2 className="my-4 text-center">Cálculo Rinde Consolidado</h2>
            <Row className="mb-3">
                <Col md={3}>
                    <Form.Label>Mes</Form.Label>
                    <Form.Select className="form-control rounded-0 border-transparent text-center" value={mes} onChange={(e) => setMes(Number(e.target.value))}>
                        {[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('es-AR', { month: 'long' })}</option>)}
                    </Form.Select>
                </Col>
                <Col md={3}>
                    <Form.Label>Año</Form.Label>
                    <Form.Control type="number" className="form-control rounded-0 border-transparent text-center" value={anio} onChange={(e) => setAnio(Number(e.target.value))} />
                </Col>
                {/* <Col md={3}>
                    <Form.Label>Ingresos Esperados</Form.Label>
                    <Button onClick={() => setShowIngresosModal(true)} className="w-100">Ingresos Esperados</Button>
                </Col> */}
                <Col md={3}>
                    <Form.Label className="d-block mb-1 text-center">Acciones</Form.Label>

                    <div className="d-flex">
                        <Button
                            onClick={() => setShowIngresosModal(true)}
                            className="flex-fill mb-2 text-truncate"
                            style={{ whiteSpace: "nowrap" }}
                        >
                            Ingresos Esperados
                        </Button>
                    </div>

                    <div className="d-flex">
                        <Button
                            onClick={() => {
                                obtenerRindesDisponibles();
                                setShowOmitirModal(true);
                            }}
                            className="flex-fill text-truncate"
                            variant="warning"
                            style={{ whiteSpace: "nowrap" }}
                        >
                            Omitir
                        </Button>
                    </div>
                </Col>

            </Row>

            <h5>Resumen Consolidado</h5>
            <Table striped bordered hover size="sm" className="text-center">
                <tbody>
                    {[{ label: "Nº de 1/2 Res", val: cantidadMedias },
                    { label: "Kg. De Carne", val: totalKg },
                    { label: "M.B. estimado del Cerdo", val: formatCurrency(mbcerdo) },
                    { label: "Costo prom. /Kg. De Carne", val: formatCurrency(costoprom) },
                    { label: "Margen Total", val: formatCurrency(mgtotal) },
                    { label: "Margen / Kg Vendido", val: formatCurrency(mgporkg) },
                    { label: "Total de Venta", val: formatCurrency(totalventa) },
                    { label: "Gastos Diarios", val: formatCurrency(gastos) },
                    { label: "Gastos Caja Grande", val: formatCurrency(cajagrande) },
                    { label: "Otros productos", val: formatCurrency(otros) },
                    { label: "1/2 Res Ingresada", val: formatCurrency(costovacuno) },
                    { label: "Achuras y Productos", val: formatCurrency(achuras) },
                    { label: "Diferencia de Inventario", val: formatCurrency(difInventario) },
                    { label: "Compra de Cerdo", val: formatCurrency(costoporcino) },
                    { label: "KG. De Cerdo", val: totalKgCerdo }].map((row, i) => (
                        <tr key={i}><td>{row.label}</td><td>{row.val}</td></tr>
                    ))}
                </tbody>
            </Table>

            <h5>Matriz Ingreso Esperado / Vendido</h5>
            <Table striped bordered hover size="sm" className="text-center">
                <tbody>
                    {[{ label: "Kg Novillo", val: totalKgNovillo },
                    { label: "Kg Exportación", val: totalKgVaca },
                    { label: "Ingreso Esperado / Kg", val: formatCurrency(ingEsperado) },
                    { label: "Ingreso Vendido / Kg", val: formatCurrency(ingVendido) },
                    { label: "Diferencia Esperada", val: formatCurrency(difEsperado) },
                    { label: "Diferencia Vendida", val: formatCurrency(difVendido) },
                    { label: "% Pérdida", val: `${Number(rinde * 100).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%` },
                    { label: "Valor de un 1% Rinde", val: formatCurrency(valorRinde) },
                    { label: "Eficiencia en uso de carne", val: formatCurrency(eficiencia) }].map((row, i) => (
                        <tr key={i}><td>{row.label}</td><td>{row.val}</td></tr>
                    ))}
                </tbody>
            </Table>

            <div className="d-flex justify-content-center my-4">
                <Button variant="primary" size="lg" className="mx-2" onClick={handleObtenerRindesGenerales}>Calcular</Button>
                <Button variant="success" size="lg" className="mx-2" onClick={handleGuardarRindeGeneral}>
                    Guardar
                </Button>
            </div>

            <Modal show={showIngresosModal} onHide={() => setShowIngresosModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Ingresos Esperados</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Novillos</Form.Label>
                        <Form.Control type="number" value={novillosIngresos} onChange={(e) => setNovillosIngresos(Number(e.target.value))} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Exportación</Form.Label>
                        <Form.Control type="number" value={exportacionIngresos} onChange={(e) => setExportacionIngresos(Number(e.target.value))} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Cerdos</Form.Label>
                        <Form.Control type="number" value={cerdosIngresos} onChange={(e) => setCerdosIngresos(Number(e.target.value))} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowIngresosModal(false)}>Cerrar</Button>
                    <Button variant="primary" onClick={() => setShowIngresosModal(false)}>Guardar</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showOmitirModal} onHide={() => setShowOmitirModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Omitir Rindes por Sucursal</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Seleccione los rindes que desea omitir</Form.Label>
                        <Form.Control
                            as="select"
                            multiple
                            value={rindesOmitidosIds}
                            onChange={(e) =>
                                setRindesOmitidosIds(
                                    Array.from(e.target.selectedOptions, (opt) => parseInt(opt.value))
                                )
                            }
                        >
                            {rindesDisponibles.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {context.sucursalesTabla.find(s => s.id === Number(r.sucursal_id))?.nombre || "Sucursal desconocida"} — Rinde: {parseFloat(r.rinde).toFixed(2)}%
                                </option>
                            ))}
                        </Form.Control>
                        <small className="text-muted">Use Ctrl para selección múltiple</small>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowOmitirModal(false)}>Cerrar</Button>
                    <Button variant="primary" onClick={() => setShowOmitirModal(false)}>Aplicar</Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
}
