// src/pages/evaluacion/PlantillaDetallePage.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import {
    FiEdit2,
    FiTrash2,
    FiPlus
} from "react-icons/fi";

import {

    ERPPage,
    ERPCard,
    ERPToolbar,
    ERPTable,
    ERPModal,
    ERPForm,
    ERPConfirm,
    ERPButton,
    ERPSearch,
    ERPBadge,

} from "../../components/common/erp";

import {
    evaluacionConfiguracionApi
} from "../../services/evaluacion/configuracionApi";

const initialForm = {

    criterio_id: "",

    orden: 1,

    peso: 1,

    obligatorio: true,

    permite_comentario: true,

    permite_evidencia: false,

};

const PlantillaDetallePage = () => {

    const { id } = useParams();

    const [loading, setLoading] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [plantilla, setPlantilla] =
        useState(null);

    const [criterios, setCriterios] =
        useState([]);

    const [rows, setRows] =
        useState([]);

    const [showModal, setShowModal] =
        useState(false);

    const [showConfirm, setShowConfirm] =
        useState(false);

    const [selected, setSelected] =
        useState(null);

    const [deleteRow, setDeleteRow] =
        useState(null);

    const [form, setForm] =
        useState(initialForm);





    /*=========================================
      CARGAR
    =========================================*/

    const cargar = async () => {

        try {

            setLoading(true);

            const [

                detalle,

                criteriosData

            ] = await Promise.all([

                evaluacionConfiguracionApi.obtenerDetallePlantilla(
                    id
                ),

                evaluacionConfiguracionApi.listarCriterios()

            ]);

            setPlantilla(detalle);

            setRows(
                detalle.detalles || []
            );

            setCriterios(
                criteriosData || []
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
      BUSCADOR
    =========================================*/

    const datos =
        useMemo(() => {

            if (!search.trim())
                return rows;

            const s =
                search.toLowerCase();

            return rows.filter(

                x =>

                    x.criterio.descripcion
                        .toLowerCase()
                        .includes(s)

            );

        }, [

            rows,

            search

        ]);





    /*=========================================
      NUEVO
    =========================================*/

    const nuevo = () => {

        setSelected(null);

        setForm(initialForm);

        setShowModal(true);

    };





    /*=========================================
      EDITAR
    =========================================*/

    const editar = (row) => {

        setSelected(row);

        setForm({

            criterio_id:
                row.criterio_id,

            orden:
                row.orden,

            peso:
                row.peso,

            obligatorio:
                row.obligatorio,

            permite_comentario:
                row.permite_comentario,

            permite_evidencia:
                row.permite_evidencia,

        });

        setShowModal(true);

    };





    /*=========================================
      CERRAR
    =========================================*/

    const cerrar = () => {

        setSelected(null);

        setForm(initialForm);

        setShowModal(false);

    };





    /*=========================================
      GUARDAR
    =========================================*/

    const guardar = async () => {

        try {

            setSaving(true);

            if (selected) {

                await evaluacionConfiguracionApi.actualizarDetallePlantilla(

                    selected.id,

                    form

                );

            } else {

                await evaluacionConfiguracionApi.agregarDetallePlantilla(

                    id,

                    form

                );

            }

            cerrar();

            cargar();

        } catch (error) {

            console.error(error);

        } finally {

            setSaving(false);

        }

    };





    /*=========================================
      ELIMINAR
    =========================================*/

    const eliminar = (row) => {

        setDeleteRow(row);

        setShowConfirm(true);

    };



    const confirmarEliminar = async () => {

        try {

            await evaluacionConfiguracionApi.eliminarDetallePlantilla(

                deleteRow.id

            );

            setDeleteRow(null);

            setShowConfirm(false);

            cargar();

        } catch (error) {

            console.error(error);

        }

    };





    /*=========================================
      COLUMNAS
    =========================================*/

    const columns = [

        {

            key: "orden",

            title: "Orden"

        },

        {

            key: "criterio",

            title: "Criterio",

            render: row =>

                row.criterio.descripcion

        },

        {

            key: "peso",

            title: "Peso"

        },

        {

            key: "obligatorio",

            title: "Obligatorio",

            render: row =>

                <ERPBadge
                    status={
                        row.obligatorio
                            ? "SI"
                            : "NO"
                    }
                />

        },

        {

            key: "permite_comentario",

            title: "Comentario",

            render: row =>

                <ERPBadge
                    status={
                        row.permite_comentario
                            ? "SI"
                            : "NO"
                    }
                />

        },

        {

            key: "permite_evidencia",

            title: "Evidencia",

            render: row =>

                <ERPBadge
                    status={
                        row.permite_evidencia
                            ? "SI"
                            : "NO"
                    }
                />

        }

    ];





    /*=========================================
      ACCIONES
    =========================================*/

    const actions = [

        {

            icon: <FiEdit2 />,

            variant: "outline-primary",

            onClick: editar

        },

        {

            icon: <FiTrash2 />,

            variant: "outline-danger",

            onClick: eliminar

        }

    ];

        /*=========================================
      FORMULARIO
    =========================================*/

    const fields = [

        {
            name: "criterio_id",
            label: "Criterio",
            type: "select",
            md: 12,

            options: criterios.map(item => ({

                value: item.id,

                label: item.descripcion

            }))
        },

        {
            name: "orden",
            label: "Orden",
            type: "number",
            md: 4,
        },

        {
            name: "peso",
            label: "Peso",
            type: "number",
            md: 4,
        },

        {
            name: "obligatorio",
            label: "Obligatorio",
            type: "checkbox",
            md: 4,
        },

        {
            name: "permite_comentario",
            label: "Permite comentario",
            type: "checkbox",
            md: 6,
        },

        {
            name: "permite_evidencia",
            label: "Permite evidencia",
            type: "checkbox",
            md: 6,
        },

    ];





    /*=========================================
      RENDER
    =========================================*/

    return (

        <ERPPage

            title="Detalle de Plantilla"

            subtitle={plantilla?.descripcion || ""}

        >

            <ERPCard className="mb-3">

                <div className="row">

                    <div className="col-md-6">

                        <strong>Plantilla</strong>

                        <div>

                            {plantilla?.descripcion}

                        </div>

                    </div>

                    <div className="col-md-6">

                        <strong>Tipo</strong>

                        <div>

                            {plantilla?.tipo?.descripcion}

                        </div>

                    </div>

                </div>

            </ERPCard>

            <ERPCard>

                <ERPToolbar

                    left={

                        <ERPSearch

                            value={search}

                            onChange={setSearch}

                            placeholder="Buscar criterio..."

                        />

                    }

                    right={

                        <ERPButton

                            type="new"

                            icon={<FiPlus />}

                            onClick={nuevo}

                        >

                            Agregar Criterio

                        </ERPButton>

                    }

                />

                <ERPTable

                    columns={columns}

                    data={datos}

                    actions={actions}

                    loading={loading}

                />

            </ERPCard>

            <ERPModal

                show={showModal}

                onHide={cerrar}

                title={

                    selected

                        ? "Editar Criterio"

                        : "Agregar Criterio"

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

                        >

                            Guardar

                        </ERPButton>

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

                message={`¿Desea eliminar el criterio "${deleteRow?.criterio?.descripcion || ""}"?`}

                onCancel={() => {

                    setDeleteRow(null);

                    setShowConfirm(false);

                }}

                onConfirm={confirmarEliminar}

            />

        </ERPPage>

    );

};

export default PlantillaDetallePage;