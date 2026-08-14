import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Alert,
    Badge,
} from "react-bootstrap";

import {
    FiEye,
    FiTrash2,
} from "react-icons/fi";

import {
    ERPPage,
    ERPCard,
    ERPToolbar,
    ERPSearch,
    ERPTable,
    ERPButton,
} from "../../../components/common/erp";

import inteligenciaSnapshotApi
    from "../../../services/inteligencia/inteligenciaSnapshotService";

import InteligenciaSnapshotModal
    from "./InteligenciaSnapshotModal";

import InteligenciaSnapshotDetalleModal
    from "./InteligenciaSnapshotDetalleModal";

const InteligenciaSnapshotsPage = () => {

    /*
    |--------------------------------------------------------------------------
    | ESTADO
    |--------------------------------------------------------------------------
    */

    const [snapshots, setSnapshots] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [buscar, setBuscar] =
        useState("");


    /*
    |--------------------------------------------------------------------------
    | MODALES
    |--------------------------------------------------------------------------
    */

    const [showNuevoModal, setShowNuevoModal] =
        useState(false);

    const [showDetalleModal, setShowDetalleModal] =
        useState(false);

    const [
        snapshotSeleccionado,
        setSnapshotSeleccionado,
    ] = useState(null);


    /*
    |--------------------------------------------------------------------------
    | NORMALIZAR RESPUESTA
    |--------------------------------------------------------------------------
    */

    const normalizarSnapshots =
        (data) => {

            if (Array.isArray(data)) {
                return data;
            }


            if (
                data &&
                Array.isArray(
                    data.snapshots
                )
            ) {
                return data.snapshots;
            }


            if (
                data &&
                Array.isArray(
                    data.rows
                )
            ) {
                return data.rows;
            }


            return [];

        };


    /*
    |--------------------------------------------------------------------------
    | CARGAR
    |--------------------------------------------------------------------------
    */

    const cargarSnapshots =
        useCallback(
            async () => {

                setLoading(true);
                setError("");


                try {

                    const data =
                        await inteligenciaSnapshotApi
                            .listar();


                    setSnapshots(
                        normalizarSnapshots(
                            data
                        )
                    );

                }
                catch (err) {

                    console.error(
                        "Error cargando snapshots:",
                        err
                    );


                    setSnapshots([]);


                    setError(
                        obtenerMensajeError(
                            err
                        )
                    );

                }
                finally {

                    setLoading(false);

                }

            },
            []
        );


    /*
    |--------------------------------------------------------------------------
    | CARGA INICIAL
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        cargarSnapshots();

    }, [
        cargarSnapshots,
    ]);


    /*
    |--------------------------------------------------------------------------
    | FILTRADO LOCAL
    |--------------------------------------------------------------------------
    |
    | Por ahora el volumen de snapshots será pequeño:
    | normalmente uno por fecha.
    |
    |--------------------------------------------------------------------------
    */

    const snapshotsFiltrados =
        useMemo(
            () => {

                const search =
                    buscar
                        .trim()
                        .toLowerCase();


                if (!search) {
                    return snapshots;
                }


                return snapshots.filter(
                    (item) => {

                        const texto = [
                            item.fecha,
                            item.observaciones,
                            item.usuario_id,
                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();


                        return texto.includes(
                            search
                        );

                    }
                );

            },
            [
                snapshots,
                buscar,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | NUEVO
    |--------------------------------------------------------------------------
    */

    const handleNuevo =
        () => {

            setSnapshotSeleccionado(
                null
            );

            setShowNuevoModal(
                true
            );

        };


    /*
    |--------------------------------------------------------------------------
    | VER
    |--------------------------------------------------------------------------
    */

    const handleVer =
        (snapshot) => {

            setSnapshotSeleccionado(
                snapshot
            );

            setShowDetalleModal(
                true
            );

        };


    /*
    |--------------------------------------------------------------------------
    | ELIMINAR
    |--------------------------------------------------------------------------
    */

    const handleEliminar =
        async (snapshot) => {

            const confirmar =
                window.confirm(
                    `¿Eliminar la instantánea comercial del ${formatearFecha(
                        snapshot.fecha
                    )}?`
                );


            if (!confirmar) {
                return;
            }


            try {

                setError("");


                await inteligenciaSnapshotApi
                    .eliminar(
                        snapshot.id
                    );


                await cargarSnapshots();

            }
            catch (err) {

                console.error(
                    "Error eliminando snapshot:",
                    err
                );


                setError(
                    obtenerMensajeError(
                        err
                    )
                );

            }

        };


    /*
    |--------------------------------------------------------------------------
    | GUARDADO
    |--------------------------------------------------------------------------
    */

    const handleGuardado =
        async () => {

            setShowNuevoModal(
                false
            );

            setSnapshotSeleccionado(
                null
            );

            await cargarSnapshots();

        };


    /*
    |--------------------------------------------------------------------------
    | COLUMNAS
    |--------------------------------------------------------------------------
    */

    const columns =
        useMemo(
            () => [

                {
                    key:
                        "fecha",

                    title:
                        "Fecha",

                    render:
                        (row) => (

                            <strong>
                                {
                                    formatearFecha(
                                        row.fecha
                                    )
                                }
                            </strong>

                        ),
                },

                {
                    key:
                        "precios",

                    title:
                        "Precios",

                    render:
                        (row) => (

                            <Badge
                                bg="light"
                                text="dark"
                                className="border"
                            >
                                {
                                    contarRelacion(
                                        row.precios
                                    )
                                }
                            </Badge>

                        ),
                },

                {
                    key:
                        "promociones",

                    title:
                        "Promociones",

                    render:
                        (row) => (

                            <Badge
                                bg={
                                    contarRelacion(
                                        row.promociones
                                    ) > 0
                                        ? "success"
                                        : "secondary"
                                }
                            >
                                {
                                    contarRelacion(
                                        row.promociones
                                    )
                                }
                            </Badge>

                        ),
                },

                {
                    key:
                        "observaciones",

                    title:
                        "Observaciones",

                    render:
                        (row) =>
                            row.observaciones ||
                            "-",
                },

            ],
            []
        );


    /*
    |--------------------------------------------------------------------------
    | ACCIONES
    |--------------------------------------------------------------------------
    */

    const actions =
        useMemo(
            () => [

                {
                    icon:
                        <FiEye />,

                    variant:
                        "outline-primary",

                    onClick:
                        handleVer,
                },

                {
                    icon:
                        <FiTrash2 />,

                    variant:
                        "outline-danger",

                    onClick:
                        handleEliminar,
                },

            ],
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [
                cargarSnapshots,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <ERPPage

            title="Instantáneas comerciales"

            subtitle={
                "Histórico de precios y promociones"
            }

            actions={

                <ERPButton

                    type="new"

                    onClick={
                        handleNuevo
                    }

                >
                    Nueva instantánea
                </ERPButton>

            }

        >

            {
                error && (

                    <Alert

                        variant="danger"

                        dismissible

                        onClose={() =>
                            setError("")
                        }

                    >
                        {error}
                    </Alert>

                )
            }


            <ERPCard>

                <ERPToolbar

                    left={

                        <ERPSearch

                            value={
                                buscar
                            }

                            onChange={
                                setBuscar
                            }

                            placeholder={
                                "Buscar instantánea..."
                            }

                            width={
                                320
                            }

                        />

                    }

                    right={

                        <ERPButton

                            type="refresh"

                            onClick={
                                cargarSnapshots
                            }

                            disabled={
                                loading
                            }

                        >
                            Actualizar
                        </ERPButton>

                    }

                />


                <ERPTable

                    columns={
                        columns
                    }

                    data={
                        snapshotsFiltrados
                    }

                    loading={
                        loading
                    }

                    actions={
                        actions
                    }

                />

            </ERPCard>


            {/*
            |--------------------------------------------------------------------------
            | SIGUIENTE PASO
            |--------------------------------------------------------------------------
            |
            | <InteligenciaSnapshotModal ... />
            |
            | <InteligenciaSnapshotDetalleModal ... />
            |--------------------------------------------------------------------------
            */}


            {/*
            | Temporal hasta conectar los modales.
            */}

            <InteligenciaSnapshotModal

                show={
                    showNuevoModal
                }

                onHide={() => {

                    setShowNuevoModal(
                        false
                    );

                    setSnapshotSeleccionado(
                        null
                    );

                }}

                onSaved={
                    handleGuardado
                }

            />

            <InteligenciaSnapshotDetalleModal

                show={
                    showDetalleModal
                }

                snapshot={
                    snapshotSeleccionado
                }

                onHide={() => {

                    setShowDetalleModal(
                        false
                    );

                    setSnapshotSeleccionado(
                        null
                    );

                }}

            />

        </ERPPage>

    );

};


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const formatearFecha =
    (fecha) => {

        if (!fecha) {
            return "-";
        }


        const partes =
            String(fecha)
                .slice(0, 10)
                .split("-");


        if (
            partes.length !== 3
        ) {
            return fecha;
        }


        return (
            `${partes[2]}/` +
            `${partes[1]}/` +
            `${partes[0]}`
        );

    };


const contarRelacion =
    (relacion) => {

        if (
            Array.isArray(relacion)
        ) {
            return relacion.length;
        }


        if (
            typeof relacion ===
            "number"
        ) {
            return relacion;
        }


        return 0;

    };


const obtenerMensajeError =
    (error) => {

        const mensaje =
            error?.message ||
            "Ocurrió un error.";


        try {

            const parsed =
                JSON.parse(
                    mensaje
                );


            return (
                parsed?.error ||
                parsed?.message ||
                mensaje
            );

        }
        catch {

            return mensaje;

        }

    };


export default InteligenciaSnapshotsPage;