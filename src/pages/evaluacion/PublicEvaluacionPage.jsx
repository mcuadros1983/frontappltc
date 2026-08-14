import React, {
    useContext,
    useEffect,
    useState
} from "react";

import Contexts from "../../context/Contexts";

import {
    useParams
} from "react-router-dom";

import {
    Spinner,
    Alert
} from "react-bootstrap";

import PublicInicio from "../../components/evaluacion/public/PublicInicio";
import PublicFormulario from "../../components/evaluacion/public/PublicFormulario";

import {
    evaluacionPublicApi
} from "../../services/evaluacion/evaluacionPublicApi";

const apiUrl = process.env.REACT_APP_API_URL;

const PublicEvaluacionPage = () => {

    const { token } = useParams();

    const { empleados } = useContext(
        Contexts.DataContext
    );

    const [loading, setLoading] = useState(true);

    const [formulario, setFormulario] = useState(null);

    const [iniciado, setIniciado] = useState(false);

    const [error, setError] = useState("");

    const [datosEmpleado, setDatosEmpleado] = useState([]);

    useEffect(() => {

        cargarDatos();

    }, [token]);

    function getEmpleadoId(e) {

        return (
            e?.empleado?.id ??
            e?.id ??
            e?.empleado_id ??
            null
        );

    }

    function getEmpleadoNombre(item) {

        const empleadoId = item?.empleado_id;

        console.log("Buscando empleado:", empleadoId);
        console.log("empleados:", empleados);

        const encontrado = empleados.find(e => {

            // console.log(
            //     "Comparando",
            //     e?.empleado?.id,
            //     "con",
            //     empleadoId
            // );

            return Number(e?.empleado?.id) === Number(empleadoId);

        });

        // console.log("Encontrado:", encontrado);

        if (!encontrado) {

            return `Empleado #${empleadoId}`;

        }

        return `${encontrado.empleado.apellido} ${encontrado.empleado.nombre}`;

    }

    const buscarEmpleado = (empleadoId) => {

        return empleados.find(

            e => getEmpleadoId(e) === empleadoId

        );

    };

    const nombreEmpleadoPorId = (empleadoId) => {

        const emp = buscarEmpleado(empleadoId);

        return emp

            ? getEmpleadoNombre(emp)

            : `Empleado #${empleadoId}`;

    };

    const vendedores = datosEmpleado
        .filter(x => x.tipo === "VENDEDOR")
        .map(x => {

            const empleado = empleados.find(

                e => getEmpleadoId(e) === x.empleado_id

            );

            return {

                ...x,

                nombreCompleto: empleado

                    ? getEmpleadoNombre(empleado)

                    : `Empleado #${x.empleado_id}`

            };

        });

    const encargados = datosEmpleado
        .filter(x => x.tipo === "ENCARGADO")
        .map(x => {

            const empleado = empleados.find(

                e => getEmpleadoId(e) === x.empleado_id

            );

            return {

                ...x,

                nombreCompleto: empleado

                    ? getEmpleadoNombre(empleado)

                    : `Empleado #${x.empleado_id}`

            };

        });

    const cargarDatos = async () => {

        try {

            setLoading(true);

            const [

                formularioData

            ] = await Promise.all([

                evaluacionPublicApi.obtenerFormulario(token)

            ]);

            const r = await fetch(

                `${apiUrl}/datosempleado?limit=1000`,

                {

                    credentials: "include"

                }

            );

            const d = await r.json().catch(() => null);

            if (!r.ok) {

                throw new Error(

                    d?.error ||

                    "No se pudieron obtener los datos de empleados."

                );

            }

            const items = Array.isArray(d?.items)

                ? d.items

                : Array.isArray(d)

                    ? d

                    : [];

            setFormulario(formularioData);

            setDatosEmpleado(items);

        }

        catch (e) {

            console.error(e);

            setError(

                e.message ||

                "No fue posible abrir el formulario."

            );

        }

        finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (

            <div className="vh-100 d-flex justify-content-center align-items-center">

                <Spinner />

            </div>

        );

    }

    if (error) {

        return (

            <Alert

                variant="danger"

                className="m-4"

            >

                {error}

            </Alert>

        );

    }

    return iniciado ? (

        <PublicFormulario

            formulario={formulario}

        />

    ) : (

        <PublicInicio

            formulario={formulario}

            onComenzar={() =>

                setIniciado(true)

            }

        />

    );

};

export default PublicEvaluacionPage;