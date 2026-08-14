// src/pages/evaluacion/EvaluacionesPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FiEdit2,
    FiTrash2,
    FiClipboard,
    FiCopy
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
    Button

} from "react-bootstrap";

import { evaluacionApi }
    from "../../services/evaluacion/evaluacionApi";

import { evaluacionConfiguracionApi }
    from "../../services/evaluacion/configuracionApi";

// import { api }
//     from "../../services/apiClient";

// const initialForm = {

//     empleado_id: "",

//     evaluador_usuario_id: "",

//     tipo_id: "",

//     plantilla_id: "",

//     periodo_id: "",

//     fecha:
//         new Date()
//             .toISOString()
//             .substring(0, 10),

//     observaciones: ""

// };

const initialForm = {

    tipo_id: "",

    plantilla_id: "",

    periodo_id: "",

    fecha_inicio:
        new Date()
            .toISOString()
            .substring(0, 10),

    fecha_fin:
        new Date()
            .toISOString()
            .substring(0, 10),

    estado: "ACTIVA",

    observaciones: ""

};

const EvaluacionesPage = () => {

    const navigate =
        useNavigate();

    const [rows, setRows] =
        useState([]);

    // const [empleados, setEmpleados] =
    //     useState([]);

    const [tipos, setTipos] =
        useState([]);

    const [plantillas, setPlantillas] = useState([]);

    const [periodos, setPeriodos] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [search, setSearch] =
        useState("");

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

    // const [usuarios, setUsuarios] = useState([]);

    // const [plantillas, setPlantillas] = useState([]);

    /*=========================================
      CARGA INICIAL
    =========================================*/

    const cargar = async () => {

        try {

            setLoading(true);

            const [

                evaluaciones,

                tiposData,

                periodosData,

                plantillasData,

                // empleadosData,

                // usuariosData

            ] = await Promise.all([

                evaluacionApi.listar(),

                evaluacionConfiguracionApi.listarTipos(),

                evaluacionConfiguracionApi.listarPeriodos(),

                evaluacionConfiguracionApi.listarPlantillas(),

                // api.get("/empleados"),

                // api.get("/usuarios")

            ]);

            setRows(
                evaluaciones || []
            );

            setTipos(
                tiposData || []
            );

            setPeriodos(
                periodosData || []
            );


            // setEmpleados(
            //     empleadosData || []
            // );

            setPlantillas(
                plantillasData || []
            );

            // setUsuarios(
            //     usuariosData || []
            // );

            // console.log("datos", evaluaciones, tiposData, periodosData, plantillasData);
        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        cargar();

    }, []);




    /*=========================================
      BUSCADOR
    =========================================*/

const datos = useMemo(() => {

    if (!search.trim()) {

        return rows;

    }

    const s =

        search.toLowerCase();

    return rows.filter(x =>

        String(

            x.numero || ""

        ).toLowerCase().includes(s)

        ||

        String(

            x.tipo?.descripcion || ""

        ).toLowerCase().includes(s)

        ||

        String(

            x.periodo?.descripcion || ""

        ).toLowerCase().includes(s)

        ||

        String(

            x.estado || ""

        ).toLowerCase().includes(s)

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

    // const editar = (row) => {

    //     setSelected(row);

    //     setForm({

    //         // empleado_id:
    //         //     row.empleado_id,

    //         tipo_id:
    //             row.tipo_id,

    //         periodo_id:
    //             row.periodo_id,

    //         fecha:
    //             row.fecha,

    //         observaciones:
    //             row.observaciones || "",

    //         // evaluador_usuario_id:
    //         //     row.evaluador_usuario_id,

    //         plantilla_id:
    //             row.plantilla_id,

    //     });

    //     setShowModal(true);

    // };

    const editar = (row) => {

        setSelected(row);

        setForm({

            tipo_id:
                row.tipo_id ?? "",

            plantilla_id:
                row.plantilla_id ?? "",

            periodo_id:
                row.periodo_id ?? "",

            fecha_inicio:
                row.fecha_inicio
                    ? String(row.fecha_inicio).substring(0, 10)
                    : "",

            fecha_fin:
                row.fecha_fin
                    ? String(row.fecha_fin).substring(0, 10)
                    : "",

            estado:
                row.estado || "ACTIVA",

            observaciones:
                row.observaciones || ""

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


    const guardar = async () => {

        if (!form.tipo_id) {

            return alert(
                "Seleccione el tipo de evaluación."
            );

        }

        if (!form.plantilla_id) {

            return alert(
                "Seleccione la plantilla."
            );

        }

        if (!form.periodo_id) {

            return alert(
                "Seleccione el período."
            );

        }

        if (!form.fecha_inicio) {

            return alert(
                "Ingrese la fecha de inicio."
            );

        }

        if (!form.fecha_fin) {

            return alert(
                "Ingrese la fecha de fin."
            );

        }

        if (

            new Date(form.fecha_fin) <

            new Date(form.fecha_inicio)

        ) {

            return alert(
                "La fecha de fin no puede ser anterior a la fecha de inicio."
            );

        }

        if (!form.estado) {

            return alert(
                "Seleccione el estado."
            );

        }

        try {

            setSaving(true);

            const payload = {

                tipo_id:
                    Number(form.tipo_id),

                plantilla_id:
                    Number(form.plantilla_id),

                periodo_id:
                    Number(form.periodo_id),

                fecha_inicio:
                    form.fecha_inicio,

                fecha_fin:
                    form.fecha_fin,

                estado:
                    form.estado,

                observaciones:
                    form.observaciones || ""

            };

            if (selected) {

                await evaluacionApi.actualizar(

                    selected.id,

                    payload

                );

            }
            else {

                await evaluacionApi.crear(

                    payload

                );

            }

            cerrar();

            await cargar();

        }
        catch (error) {

            console.error(error);

            alert(
                "Error al guardar la campaña de evaluación."
            );

        }
        finally {

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



    const confirmarEliminar =
        async () => {

            try {

                await evaluacionApi.eliminar(

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
      RESPONDER
    =========================================*/

    // const responder = (row) => {

    //     navigate(

    //         `/evaluacion/${row.id}`

    //     );

    // };



    /*=========================================
      DUPLICAR
    =========================================*/

    const duplicar = async (row) => {

        try {

            await evaluacionApi.duplicar(
                row.id
            );

            cargar();

        } catch (error) {

            console.error(error);

        }

    };



    const columns = [

        {

            key: "numero",

            title: "Código"

        },

        {

            key: "tipo",

            title: "Tipo",

            render: row =>

                row.tipo?.descripcion || "-"

        },

        {

            key: "plantilla",

            title: "Plantilla",

            render: row =>

                row.plantilla?.descripcion || "-"

        },

        {

            key: "periodo",

            title: "Período",

            render: row =>

                row.periodo?.descripcion || "-"

        },

        {

            key: "fecha_inicio",

            title: "Inicio"

        },

        {

            key: "fecha_fin",

            title: "Fin"

        },

        {

            key: "estado",

            title: "Estado",

            render: row => (

                <ERPBadge

                    status={row.estado}

                />

            )

        },

        {

            key: "token_publico",

            title: "Formulario",

            render: row => (

                <div className="d-flex gap-1">

                    <Button

                        size="sm"

                        variant="outline-primary"

                        onClick={() =>

                            window.open(

                                `/evaluacion/form/${row.token_publico}`,

                                "_blank"

                            )

                        }

                    >

                        Abrir

                    </Button>

                    <Button

                        size="sm"

                        variant="outline-secondary"

                        onClick={() => {

                            navigator.clipboard.writeText(

                                `${window.location.origin}/evaluacion/form/${row.token_publico}`

                            );

                            alert(

                                "Enlace copiado al portapapeles."

                            );

                        }}

                    >

                        Copiar

                    </Button>

                </div>

            )

        }

    ];
    /*=========================================
  ACCIONES
=========================================*/

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

            name: "tipo_id",

            label: "Tipo de Evaluación",

            type: "select",

            md: 6,

            options: tipos.map(item => ({

                value: item.id,

                label: item.descripcion

            }))

        },

        {

            name: "plantilla_id",

            label: "Plantilla",

            type: "select",

            md: 6,

            options: plantillas.map(item => ({

                value: item.id,

                label: item.descripcion

            }))

        },

        {

            name: "periodo_id",

            label: "Período",

            type: "select",

            md: 6,

            options: periodos.map(item => ({

                value: item.id,

                label: item.descripcion

            }))

        },

        {

            name: "fecha_inicio",

            label: "Fecha Inicio",

            type: "date",

            md: 6

        },

        {

            name: "fecha_fin",

            label: "Fecha Fin",

            type: "date",

            md: 6

        },

        {

            name: "estado",

            label: "Estado",

            type: "select",

            md: 6,

            options: [

                {

                    value: "ACTIVA",

                    label: "Activa"

                },

                {

                    value: "INACTIVA",

                    label: "Inactiva"

                },

                {

                    value: "CERRADA",

                    label: "Cerrada"

                }

            ]

        },

        {

            name: "observaciones",

            label: "Observaciones",

            type: "textarea",

            rows: 4,

            md: 12

        }

    ];

    /*=========================================
      RENDER
    =========================================*/

    return (

        <ERPPage

            title="Evaluaciones"

            subtitle="Gestión de Evaluaciones"

        >

            <ERPCard>

                <ERPToolbar

                    left={

                        <ERPSearch

                            value={search}

                            onChange={setSearch}

                            placeholder="Buscar evaluación..."

                        />

                    }

                    right={

                        <ERPButton

                            type="new"

                            onClick={nuevo}

                        >

                            Nueva Evaluación

                        </ERPButton>

                    }

                />

                <ERPTable

                    columns={columns}

                    data={datos}

                    loading={loading}

                    actions={actions}

                />

            </ERPCard>



            <ERPModal

                show={showModal}

                onHide={cerrar}

                title={

                    selected

                        ? "Editar Evaluación"

                        : "Nueva Evaluación"

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

                title="Eliminar Evaluación"

                message={`¿Desea eliminar la evaluación ${deleteRow?.numero || ""}?`}

                onCancel={() => {

                    setDeleteRow(null);

                    setShowConfirm(false);

                }}

                onConfirm={confirmarEliminar}

            />

        </ERPPage>

    );

};

export default EvaluacionesPage;