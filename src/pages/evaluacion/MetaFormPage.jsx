// src/pages/evaluacion/MetaFormPage.jsx

import React, {

    useEffect,
    useState

} from "react";

import {

    useNavigate,
    useParams

} from "react-router-dom";

import {

    ERPPage,
    ERPToolbar

} from "../../components/common/erp";

import {

    metaApi

} from "../../services/evaluacion/metaApi";

const MetaFormPage = () => {

    const navigate = useNavigate();

    const { id } = useParams();

    const esNuevo =

        !id ||

        id === "nuevo";

    /*=========================================================
      ESTADOS
    =========================================================*/

    const [

        loading,

        setLoading

    ] = useState(false);

    const [

        guardando,

        setGuardando

    ] = useState(false);

    const [

        form,

        setForm

    ] = useState({

        codigo: "",

        nombre: "",

        descripcion: "",

        categoria: "FRECUENCIA",

        tipo: "GENERAL",

        prioridad: "MEDIA",

        unidad_medida: "PORCENTAJE",

        capa: "GENERAL",

        comparacion: "",

        frecuencia_unidad: "DIAS",

        valor_objetivo: 0,

        ponderacion: 100,

        estado: "ACTIVA",

        observaciones: ""

    });

    /*=========================================================
      CARGAR META
    =========================================================*/

    const cargarMeta = async () => {

        if (esNuevo) {

            return;

        }

        try {

            setLoading(true);

            const data =

                await metaApi.obtenerMeta(id);

            setForm({

                codigo:

                    data.codigo || "",

                nombre:

                    data.nombre || "",

                descripcion:

                    data.descripcion || "",

                categoria:

                    data.categoria || "FRECUENCIA",

                tipo:

                    data.tipo || "GENERAL",

                prioridad:

                    data.prioridad || "MEDIA",

                unidad_medida:

                    data.unidad_medida || "PORCENTAJE",

                capa:

                    data.capa || "GENERAL",

                comparacion:

                    data.comparacion || "",

                frecuencia_unidad:

                    data.frecuencia_unidad || "DIAS",

                valor_objetivo:

                    data.valor_objetivo || 0,

                ponderacion:

                    data.ponderacion || 100,

                estado:

                    data.estado || "ACTIVA",

                observaciones:

                    data.observaciones || ""

            });

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        cargarMeta();

    }, [id]);

    /*=========================================================
      FORMULARIO
    =========================================================*/

    const handleChange = (e) => {

        const {

            name,

            value

        } = e.target;

        setForm(

            previous => ({

                ...previous,

                [name]: value

            })

        );

    };

    /*=========================================================
      GUARDAR
    =========================================================*/

    const guardar = async () => {

        try {

            setGuardando(true);

            const payload = {

                ...form

            };

            switch (payload.categoria) {

                case "FRECUENCIA":

                    payload.unidad_medida =

                        payload.frecuencia_unidad;

                    break;

                case "CUMPLIMIENTO":

                    payload.unidad_medida =

                        "PORCENTAJE";

                    break;

                case "BRECHA":

                    payload.unidad_medida =

                        "PUNTOS";

                    break;

                default:

                    break;

            }

            if (esNuevo) {

                await metaApi.crearMeta(

                    payload

                );

            }

            else {

                await metaApi.actualizarMeta(

                    id,

                    payload

                );

            }

            navigate(

                "/evaluacion/metas"

            );

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setGuardando(false);

        }

    };

    /*=========================================================
      CANCELAR
    =========================================================*/

    const cancelar = () => {

        navigate(

            "/evaluacion/metas"

        );

    };

    return (

        <ERPPage

            title={

                esNuevo

                    ? "Nueva Meta"

                    : "Editar Meta"

            }

            subtitle="Configuración de metas de desempeño"

        >

            <ERPToolbar />

            <div className="card shadow-sm">

                <div className="card-body">

                    {/*=========================================================
                      INFORMACIÓN GENERAL
                    =========================================================*/}

                    <h5 className="mb-3">

                        Información General

                    </h5>

                    <div className="row">

                        <div className="col-md-3 mb-3">

                            <label className="form-label">

                                Código

                            </label>

                            <input

                                type="text"

                                className="form-control"

                                name="codigo"

                                value={form.codigo}

                                onChange={handleChange}

                            />

                        </div>

                        <div className="col-md-9 mb-3">

                            <label className="form-label">

                                Nombre

                            </label>

                            <input

                                type="text"

                                className="form-control"

                                name="nombre"

                                value={form.nombre}

                                onChange={handleChange}

                            />

                        </div>

                    </div>

                    <div className="mb-4">

                        <label className="form-label">

                            Descripción

                        </label>

                        <textarea

                            className="form-control"

                            rows="3"

                            name="descripcion"

                            value={form.descripcion}

                            onChange={handleChange}

                        />

                    </div>

                    <hr />

                    {/*=========================================================
                      CONFIGURACIÓN
                    =========================================================*/}

                    <h5 className="mb-3">

                        Configuración

                    </h5>

                    <div className="row">

                        <div className="col-md-3 mb-3">

                            <label className="form-label">

                                Categoría

                            </label>

                            <select

                                className="form-control"

                                name="categoria"

                                value={form.categoria}

                                onChange={handleChange}

                            >

                                <option value="FRECUENCIA">

                                    Frecuencia Esperada

                                </option>

                                <option value="CUMPLIMIENTO">

                                    Cumplimiento

                                </option>

                                <option value="BRECHA">

                                    Brechas

                                </option>

                            </select>

                        </div>

                        {
                            form.categoria !== "BRECHA" && (

                                <div className="col-md-3 mb-3">

                                    <label className="form-label">

                                        Tipo

                                    </label>

                                    <select

                                        className="form-control"

                                        name="tipo"

                                        value={form.tipo}

                                        onChange={handleChange}

                                    >

                                        <option value="AUTO">

                                            Autoevaluación

                                        </option>

                                        <option value="SUPERVISOR">

                                            Supervisor

                                        </option>

                                        <option value="MYSTERY">

                                            Mystery Shopper

                                        </option>

                                    </select>

                                </div>

                            )
                        }

                        {
                            form.categoria !== "BRECHA" && (

                                <div className="col-md-3 mb-3">

                                    <label className="form-label">

                                        Capa

                                    </label>

                                    <select

                                        className="form-control"

                                        name="capa"

                                        value={form.capa}

                                        onChange={handleChange}

                                    >

                                        <option value="GENERAL">

                                            General

                                        </option>

                                        <option value="SUPERVISOR">

                                            Supervisor

                                        </option>

                                        <option value="PAR">

                                            Par

                                        </option>

                                        <option value="SUBORDINADO">

                                            Subordinado

                                        </option>

                                        <option value="AUTO">

                                            Autoevaluación

                                        </option>

                                    </select>

                                </div>

                            )
                        }

                        <div className="col-md-3 mb-3">

                            <label className="form-label">

                                Prioridad

                            </label>

                            <select

                                className="form-control"

                                name="prioridad"

                                value={form.prioridad}

                                onChange={handleChange}

                            >

                                <option value="ALTA">

                                    Alta

                                </option>

                                <option value="MEDIA">

                                    Media

                                </option>

                                <option value="BAJA">

                                    Baja

                                </option>

                            </select>

                        </div>

                        <div className="col-md-3 mb-3">

                            <label className="form-label">

                                Unidad

                            </label>

                            <input

                                className="form-control"

                                value={

                                    form.categoria === "FRECUENCIA"

                                        ? form.frecuencia_unidad

                                        : form.categoria === "CUMPLIMIENTO"

                                            ? "Porcentaje"

                                            : "Puntos"

                                }

                                disabled

                            />

                        </div>


                        {

                            form.categoria === "FRECUENCIA" && (

                                <div className="col-md-3 mb-3">

                                    <label className="form-label">

                                        Unidad Frecuencia

                                    </label>

                                    <select

                                        className="form-control"

                                        name="frecuencia_unidad"

                                        value={form.frecuencia_unidad}

                                        onChange={handleChange}

                                    >

                                        <option value="DIAS">

                                            Días

                                        </option>

                                        <option value="SEMANAS">

                                            Semanas

                                        </option>

                                        <option value="MESES">

                                            Meses

                                        </option>

                                    </select>

                                </div>

                            )

                        }

                        {

                            form.categoria === "BRECHA" && (

                                <div className="col-md-6 mb-3">

                                    <label className="form-label">

                                        Comparación

                                    </label>

                                    <input

                                        className="form-control"

                                        name="comparacion"

                                        value={form.comparacion}

                                        onChange={handleChange}

                                        placeholder="Supervisor ↔ Auto"

                                    />

                                </div>

                            )

                        }

                        <div className="col-md-3 mb-3">

                            <label className="form-label">

                                Estado

                            </label>

                            <select

                                className="form-control"

                                name="estado"

                                value={form.estado}

                                onChange={handleChange}

                            >

                                <option value="ACTIVA">

                                    Activa

                                </option>

                                <option value="INACTIVA">

                                    Inactiva

                                </option>

                            </select>

                        </div>

                    </div>

                    <div className="row">

                        <div className="col-md-6 mb-3">

                            <label className="form-label">

                                Valor Objetivo

                            </label>

                            <input

                                type="number"

                                className="form-control"

                                name="valor_objetivo"

                                value={form.valor_objetivo}

                                onChange={handleChange}

                            />
      
                            <small className="text-muted">

                                {

                                    form.categoria === "FRECUENCIA"

                                        ? "Cantidad máxima de días entre evaluaciones."

                                        : form.categoria === "CUMPLIMIENTO"

                                            ? "Porcentaje mínimo requerido para considerar cumplimiento."

                                            : "Brecha máxima permitida entre las capas comparadas."

                                }

                            </small>

                        </div>

                        {

                            form.categoria === "CUMPLIMIENTO" && (

                                <div className="col-md-6 mb-3">

                                    <label className="form-label">

                                        Ponderación (%)

                                    </label>

                                    <input

                                        type="number"

                                        className="form-control"

                                        name="ponderacion"

                                        value={form.ponderacion}

                                        onChange={handleChange}

                                    />

                                </div>

                            )

                        }

                    </div>

                    <div className="mb-4">

                        <label className="form-label">

                            Observaciones

                        </label>

                        <textarea

                            className="form-control"

                            rows="4"

                            name="observaciones"

                            value={form.observaciones}

                            onChange={handleChange}

                        />

                    </div>

                    <hr />

                    <div className="alert alert-info">

                        {

                            form.categoria === "FRECUENCIA" &&

                            "Configure cada cuánto tiempo debe responderse la evaluación."

                        }

                        {

                            form.categoria === "CUMPLIMIENTO" &&

                            "Configure el porcentaje mínimo esperado para el semáforo."

                        }

                        {

                            form.categoria === "BRECHA" &&

                            "Configure la diferencia máxima aceptada entre dos capas."

                        }

                    </div>

                    {/*=========================================================
                      BOTONES
                    =========================================================*/}

                    <div className="d-flex justify-content-end gap-2">

                        <button

                            className="btn btn-secondary"

                            onClick={cancelar}

                        >

                            Cancelar

                        </button>

                        <button

                            className="btn btn-primary"

                            onClick={guardar}

                            disabled={guardando || loading}

                        >

                            {

                                guardando

                                    ? "Guardando..."

                                    : "Guardar"

                            }

                        </button>

                    </div>

                </div>

            </div>

        </ERPPage>

    );

};

export default MetaFormPage;