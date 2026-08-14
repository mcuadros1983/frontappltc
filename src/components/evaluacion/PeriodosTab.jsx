// src/components/evaluacion/PeriodosTab.jsx

// import React, { useEffect, useMemo, useState } from "react";
import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Form } from "react-bootstrap";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

import {
    ERPToolbar,
    ERPSearch,
    ERPButton,
    ERPTable,
    ERPModal,
    // ERPForm,
    ERPConfirm,
    ERPBadge,
} from "../common/erp";

import { evaluacionConfiguracionApi } from "../../services/evaluacion/configuracionApi";

const initialForm = {
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    activo: true,
};

const PeriodosTab = () => {

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [selected, setSelected] = useState(null);
    const [deleteRow, setDeleteRow] = useState(null);

    const [form, setForm] = useState(initialForm);

    const cargar = async () => {

        try {

            setLoading(true);

            const data =
                await evaluacionConfiguracionApi.listarPeriodos();

            setRows(data || []);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        cargar();

    }, []);

    const datos = useMemo(() => {

        if (!search.trim())
            return rows;

        const s = search.toLowerCase();

        return rows.filter((x) =>

            (x.descripcion || "")
                .toLowerCase()
                .includes(s)

        );

    }, [rows, search]);

    const nuevo = () => {

        setSelected(null);

        setForm(initialForm);

        setShowModal(true);

    };

    const editar = (row) => {

        setSelected(row);

        setForm({

            descripcion: row.descripcion,
            fecha_inicio: row.fecha_inicio,
            fecha_fin: row.fecha_fin,
            activo: row.activo,

        });

        setShowModal(true);

    };

    const cerrar = () => {

        setSelected(null);

        setForm(initialForm);

        setShowModal(false);

    };

    const guardar = async () => {

        if (!form.descripcion.trim())
            return alert("Ingrese la descripción.");

        if (!form.fecha_inicio)
            return alert("Ingrese la fecha de inicio.");

        if (!form.fecha_fin)
            return alert("Ingrese la fecha de finalización.");

        try {

            setSaving(true);

            if (selected) {

                await evaluacionConfiguracionApi.actualizarPeriodo(

                    selected.id,

                    form

                );

            } else {

                await evaluacionConfiguracionApi.crearPeriodo(

                    form

                );

            }

            cerrar();

            cargar();

        } catch (error) {

            console.error(error);

            alert("Error al guardar.");

        } finally {

            setSaving(false);

        }

    };

    const eliminar = (row) => {

        setDeleteRow(row);

        setShowConfirm(true);

    };

    const confirmarEliminar = async () => {

        try {

            await evaluacionConfiguracionApi.eliminarPeriodo(

                deleteRow.id

            );

            setDeleteRow(null);

            setShowConfirm(false);

            cargar();

        } catch (error) {

            console.error(error);

        }

    };

    const columns = [

        {
            key: "descripcion",
            title: "Descripción",
        },

        {
            key: "fecha_inicio",
            title: "Fecha Inicio",
        },

        {
            key: "fecha_fin",
            title: "Fecha Fin",
        },

        {
            key: "activo",
            title: "Estado",
            render: (row) => (

                <ERPBadge
                    status={
                        row.activo
                            ? "ACTIVO"
                            : "INACTIVO"
                    }
                />

            ),
        },

    ];

    const actions = [

        {
            icon: <FiEdit2 />,
            variant: "outline-primary",
            onClick: editar,
        },

        {
            icon: <FiTrash2 />,
            variant: "outline-danger",
            onClick: eliminar,
        },

    ];

    const fields = [

        {
            name: "descripcion",
            label: "Descripción",
            type: "text",
            md: 12,
        },

        {
            name: "fecha_inicio",
            label: "Fecha Inicio",
            type: "date",
            md: 6,
        },

        {
            name: "fecha_fin",
            label: "Fecha Fin",
            type: "date",
            md: 6,
        },

        {
            name: "activo",
            label: "Activo",
            type: "checkbox",
            md: 12,
        },

    ];

    return (

        <>

            <ERPToolbar

                left={

                    <ERPSearch

                        value={search}

                        onChange={setSearch}

                        placeholder="Buscar..."

                    />

                }

                right={

                    <ERPButton

                        type="new"

                        onClick={nuevo}

                    >

                        Nuevo

                    </ERPButton>

                }

            />

            <ERPTable

                columns={columns}

                data={datos}

                loading={loading}

                actions={actions}

            />

            <ERPModal

                show={showModal}

                onHide={cerrar}

                title={

                    selected

                        ? "Editar Período"

                        : "Nuevo Período"

                }

                footer={

                    <>

                        <ERPButton

                            type="cancel"

                            onClick={cerrar}

                        />

                        <ERPButton

                            type="save"

                            onClick={guardar}

                            disabled={saving}

                        />

                    </>

                }

            >
                {/* 
                <ERPForm

                    fields={fields}

                    values={form}

                    onChange={setForm}

                /> */}

                <Row>

                    <Col md={12}>

                        <Form.Group className="mb-3">

                            <Form.Label>
                                Descripción
                            </Form.Label>

                            <Form.Control
                                type="text"
                                name="descripcion"
                                value={form.descripcion}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        descripcion: e.target.value
                                    })
                                }
                            />

                        </Form.Group>

                    </Col>

                    <Col md={6}>

                        <Form.Group className="mb-3">

                            <Form.Label>
                                Fecha Inicio
                            </Form.Label>

                            <Form.Control
                                type="date"
                                name="fecha_inicio"
                                value={form.fecha_inicio}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        fecha_inicio: e.target.value
                                    })
                                }
                            />

                        </Form.Group>

                    </Col>

                    <Col md={6}>

                        <Form.Group className="mb-3">

                            <Form.Label>
                                Fecha Fin
                            </Form.Label>

                            <Form.Control
                                type="date"
                                name="fecha_fin"
                                value={form.fecha_fin}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        fecha_fin: e.target.value
                                    })
                                }
                            />

                        </Form.Group>

                    </Col>

                    <Col md={12}>

                        <Form.Check
                            type="switch"
                            label="Activo"
                            name="activo"
                            checked={form.activo}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    activo: e.target.checked
                                })
                            }
                        />

                    </Col>

                </Row>

            </ERPModal>

            <ERPConfirm

                show={showConfirm}

                title="Eliminar"

                message={`¿Eliminar "${deleteRow?.descripcion || ""}"?`}

                onCancel={() => {

                    setDeleteRow(null);

                    setShowConfirm(false);

                }}

                onConfirm={confirmarEliminar}

            />

        </>

    );

};

export default PeriodosTab;