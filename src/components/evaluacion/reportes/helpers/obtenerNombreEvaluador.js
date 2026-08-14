const obtenerNombreEvaluador = (empleados = [], row = {}) => {

    if (row.tipo_respuesta === "AUTO") {

        return "Autoevaluación";

    }

    if (row.tipo_respuesta === "MYSTERY") {

        return "Mystery Shopper";

    }

    const empleado = empleados.find(item => {

        const id =

            item?.empleado?.id ??

            item?.empleado_id ??

            item?.id;

        return Number(id) === Number(row.evaluador_id);

    });

    if (!empleado) {

        return "-";

    }

    const nombre =

        empleado?.empleado?.nombre ??

        empleado?.nombre ??

        "";

    const apellido =

        empleado?.empleado?.apellido ??

        empleado?.apellido ??

        "";

    return `${nombre} ${apellido}`.trim();

};

export default obtenerNombreEvaluador;