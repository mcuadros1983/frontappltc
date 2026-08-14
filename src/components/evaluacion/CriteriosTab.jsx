// src/components/evaluacion/CriteriosTab.jsx

import React, { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

import {
    ERPToolbar,
    ERPSearch,
    ERPButton,
    ERPTable,
    ERPModal,
    ERPForm,
    ERPConfirm,
    ERPBadge,
} from "../common/erp";

import { evaluacionConfiguracionApi } from "../../services/evaluacion/configuracionApi";

const initialForm = {

    codigo: "",

    descripcion: "",

    pregunta: "",

    tipo_respuesta: "ESCALA",

    puntaje_maximo: 5,

    orden: 1,

    activo: true,

};

const CriteriosTab = () => {

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
                await evaluacionConfiguracionApi.listarCriterios();

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

            (x.codigo || "")
                .toLowerCase()
                .includes(s)

            ||

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

            codigo: row.codigo,
            descripcion: row.descripcion,
            puntaje_maximo: row.puntaje_maximo,
            orden: row.orden,
            activo: row.activo,
            pregunta: row.pregunta,
            tipo_respuesta: row.tipo_respuesta,

        });

        setShowModal(true);

    };

    const cerrar = () => {

        setSelected(null);

        setForm(initialForm);

        setShowModal(false);

    };

    const guardar = async () => {

        if (!form.codigo.trim())
            return alert("Ingrese el código.");

        if (!form.descripcion.trim())
            return alert("Ingrese la descripción.");

        try {

            setSaving(true);

            if (selected) {

                await evaluacionConfiguracionApi.actualizarCriterio(

                    selected.id,

                    form

                );

            } else {

                await evaluacionConfiguracionApi.crearCriterio(

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

            await evaluacionConfiguracionApi.eliminarCriterio(

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
            key: "codigo",
            title: "Código",
        },

        {
            key: "descripcion",
            title: "Descripción",
        },
        {
            key: "pregunta",
            title: "Pregunta",
        },

        {
            key: "puntaje_maximo",
            title: "Puntaje",
        },
        {
            key: "tipo_respuesta",
            title: "Tipo",
        },

        {
            key: "orden",
            title: "Orden",
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
            name: "codigo",
            label: "Código",
            type: "text",
            md: 3,
        },

        {
            name: "descripcion",
            label: "Descripción",
            type: "text",
            md: 9,
        },
        {
            name: "pregunta",
            label: "Pregunta de la evaluación",
            type: "textarea",
            rows: 3,
            md: 12,
        },

        {
            name: "tipo_respuesta",
            label: "Tipo de respuesta",
            type: "select",
            md: 6,

            options: [

                {
                    value: "ESCALA",
                    label: "Escala 1 a 5"
                },

                {
                    value: "SI_NO",
                    label: "Sí / No"
                },

                {
                    value: "TEXTO",
                    label: "Texto libre"
                }

            ]

        },

        {
            name: "puntaje_maximo",
            label: "Puntaje Máximo",
            type: "number",
            md: 6,
        },

        {
            name: "orden",
            label: "Orden",
            type: "number",
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

                        ? "Editar Criterio"

                        : "Nuevo Criterio"

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

                <ERPForm

                    fields={fields}

                    values={form}

                    onChange={setForm}

                />

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

export default CriteriosTab;