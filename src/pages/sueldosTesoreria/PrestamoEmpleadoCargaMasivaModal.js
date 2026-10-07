import {
    useMemo,
    useRef,
    useState,
} from "react";

import {
    Modal,
    Button,
    Alert,
    Spinner,
    Table,
    Badge,
} from "react-bootstrap";

import * as XLSX from "xlsx";

const apiUrl = process.env.REACT_APP_API_URL;


// =====================================================
// FECHAS
// =====================================================

const fechaExcelAISO = (valor) => {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return "";
    }

    // Excel puede devolver una fecha como número serial.
    if (typeof valor === "number") {

        const parsed = XLSX.SSF.parse_date_code(valor);

        if (!parsed) {
            return "";
        }

        const yyyy = String(parsed.y).padStart(4, "0");
        const mm = String(parsed.m).padStart(2, "0");
        const dd = String(parsed.d).padStart(2, "0");

        return `${yyyy}-${mm}-${dd}`;
    }

    const texto = String(valor).trim();

    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
        return texto;
    }

    // DD/MM/YYYY
    const match = texto.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );

    if (match) {

        const dd = match[1].padStart(2, "0");
        const mm = match[2].padStart(2, "0");
        const yyyy = match[3];

        return `${yyyy}-${mm}-${dd}`;
    }

    return "";
};


// =====================================================
// MONTO
// =====================================================

const numeroExcel = (valor) => {

    if (typeof valor === "number") {
        return valor;
    }

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return NaN;
    }

    let texto = String(valor)
        .trim()
        .replace(/\$/g, "")
        .replace(/\s/g, "");

    // Formato argentino:
    // 250.000,50
    if (
        texto.includes(",") &&
        texto.includes(".")
    ) {
        texto = texto
            .replace(/\./g, "")
            .replace(",", ".");
    } else if (texto.includes(",")) {
        texto = texto.replace(",", ".");
    }

    return Number(texto);
};


// =====================================================
// COMPONENTE
// =====================================================

export default function PrestamoEmpleadoCargaMasivaModal({
    show,
    onClose,
    empleados = [],
}) {

    const inputRef = useRef(null);

    const [archivo, setArchivo] = useState(null);

    const [filas, setFilas] = useState([]);

    const [erroresLectura, setErroresLectura] =
        useState([]);

    const [errorGeneral, setErrorGeneral] =
        useState("");

    const [importando, setImportando] =
        useState(false);


    // =====================================================
    // EMPLEADOS
    // =====================================================

    const empleadosNormalizados = useMemo(() => {

        return (empleados || [])
            .map((item) => {

                const empleado =
                    item?.empleado ?? item;

                const persona =
                    item?.clientePersona ?? empleado;

                const id = Number(
                    empleado?.id
                );

                if (!id) {
                    return null;
                }

                const apellido =
                    persona?.apellido ||
                    empleado?.apellido ||
                    "";

                const nombre =
                    persona?.nombre ||
                    empleado?.nombre ||
                    "";

                const dni =
                    empleado?.numero ||
                    persona?.numero ||
                    "";

                return {
                    id,
                    dni: String(dni || ""),
                    apellido:
                        String(apellido || "").trim(),
                    nombre:
                        String(nombre || "").trim(),
                };
            })
            .filter(Boolean)
            .sort((a, b) => {

                const nombreA =
                    `${a.apellido} ${a.nombre}`;

                const nombreB =
                    `${b.apellido} ${b.nombre}`;

                return nombreA.localeCompare(
                    nombreB,
                    "es",
                    {
                        sensitivity: "base",
                    }
                );
            });

    }, [empleados]);


    const empleadosMap = useMemo(() => {

        return new Map(
            empleadosNormalizados.map(
                (e) => [Number(e.id), e]
            )
        );

    }, [empleadosNormalizados]);


    // =====================================================
    // DESCARGAR PLANTILLA
    // =====================================================

    const descargarPlantilla = () => {

        if (!empleadosNormalizados.length) {

            setErrorGeneral(
                "No hay empleados disponibles para generar la plantilla."
            );

            return;
        }

        setErrorGeneral("");

        const wb = XLSX.utils.book_new();


        // =================================================
        // HOJA EMPLEADOS
        // =================================================

        const empleadosData = [
            [
                "empleado_id",
                "DNI",
                "Apellido",
                "Nombre",
                "Seleccion",
            ],
            ...empleadosNormalizados.map((e) => [
                e.id,
                e.dni,
                e.apellido,
                e.nombre,
                `${e.id} - ${e.apellido} ${e.nombre} - DNI ${e.dni}`,
            ]),
        ];

        const wsEmpleados =
            XLSX.utils.aoa_to_sheet(
                empleadosData
            );

        wsEmpleados["!cols"] = [
            { wch: 14 },
            { wch: 16 },
            { wch: 25 },
            { wch: 25 },
            { wch: 55 },
        ];

        XLSX.utils.book_append_sheet(
            wb,
            wsEmpleados,
            "Empleados"
        );


        // =================================================
        // HOJA PRÉSTAMOS
        // =================================================

        const prestamosData = [
            [
                "Empleado",
                "empleado_id",
                "numero",
                "monto_original",
                "fecha_otorgamiento",
                "fecha_primer_descuento",
                "observaciones",
            ],
        ];

        // Dejamos 200 filas preparadas.
        for (let i = 0; i < 200; i++) {

            prestamosData.push([
                "",
                "",
                "",
                "",
                "",
                "",
                "",
            ]);
        }

        const wsPrestamos =
            XLSX.utils.aoa_to_sheet(
                prestamosData
            );

        wsPrestamos["!cols"] = [
            { wch: 55 },
            { wch: 14 },
            { wch: 18 },
            { wch: 18 },
            { wch: 22 },
            { wch: 24 },
            { wch: 45 },
        ];


        // =================================================
        // FÓRMULA empleado_id
        //
        // A = selección
        // B = empleado_id
        //
        // Extraemos todo lo que está antes de " - "
        // =================================================

        for (let fila = 2; fila <= 201; fila++) {

            wsPrestamos[`B${fila}`] = {
                t: "n",
                f:
                    `IFERROR(VALUE(LEFT(A${fila},FIND(" - ",A${fila})-1)),"")`,
            };
        }


        // =================================================
        // DESPLEGABLE EMPLEADOS
        // =================================================
        //
        // SheetJS Community no garantiza escribir
        // validaciones de datos de Excel en todos los
        // formatos/versiones.
        //
        // Dejamos registrada la validación para versiones
        // que la respeten.
        // =================================================

        const ultimaFilaEmpleados =
            empleadosNormalizados.length + 1;

        wsPrestamos["!dataValidation"] = [];

        for (let fila = 2; fila <= 201; fila++) {

            wsPrestamos["!dataValidation"].push({
                sqref: `A${fila}`,
                type: "list",
                allowBlank: true,
                formula1:
                    `'Empleados'!$E$2:$E$${ultimaFilaEmpleados}`,
            });
        }


        XLSX.utils.book_append_sheet(
            wb,
            wsPrestamos,
            "Prestamos"
        );


        // Abrimos directamente en Prestamos.
        wb.Workbook = wb.Workbook || {};

        wb.Workbook.Views = [
            {
                activeTab: 1,
            },
        ];


        XLSX.writeFile(
            wb,
            "Plantilla_Prestamos_Empleados.xlsx"
        );
    };


    // =====================================================
    // LEER EXCEL
    // =====================================================

    const leerArchivo = async (file) => {

        setArchivo(file);
        setFilas([]);
        setErroresLectura([]);
        setErrorGeneral("");

        if (!file) {
            return;
        }

        try {

            const buffer =
                await file.arrayBuffer();

            const workbook =
                XLSX.read(buffer, {
                    type: "array",
                    cellDates: false,
                });

            const worksheet =
                workbook.Sheets["Prestamos"];

            if (!worksheet) {

                throw new Error(
                    'El archivo debe contener una hoja llamada "Prestamos".'
                );
            }

            const data =
                XLSX.utils.sheet_to_json(
                    worksheet,
                    {
                        defval: "",
                        raw: true,
                    }
                );


            const nuevasFilas = [];
            const nuevosErrores = [];


            data.forEach((row, index) => {

                const filaExcel =
                    index + 2;

                // -----------------------------------------
                // Ignorar filas completamente vacías
                // -----------------------------------------

                const tieneDatos =
                    Object.values(row).some(
                        (valor) =>
                            String(
                                valor ?? ""
                            ).trim() !== ""
                    );

                if (!tieneDatos) {
                    return;
                }


                // -----------------------------------------
                // EMPLEADO ID
                // -----------------------------------------

                let empleadoId =
                    Number(row.empleado_id);


                // Si Excel no recalculó la fórmula,
                // recuperamos el ID desde la selección.
                if (
                    !Number.isInteger(empleadoId) ||
                    empleadoId <= 0
                ) {

                    const seleccion =
                        String(
                            row.Empleado || ""
                        ).trim();

                    const match =
                        seleccion.match(
                            /^(\d+)\s+-/
                        );

                    if (match) {
                        empleadoId =
                            Number(match[1]);
                    }
                }


                // -----------------------------------------
                // MONTO
                // -----------------------------------------

                const monto =
                    numeroExcel(
                        row.monto_original
                    );


                // -----------------------------------------
                // FECHAS
                // -----------------------------------------

                const fechaOtorgamiento =
                    fechaExcelAISO(
                        row.fecha_otorgamiento
                    );

                const fechaPrimerDescuento =
                    fechaExcelAISO(
                        row.fecha_primer_descuento
                    );


                // -----------------------------------------
                // VALIDACIONES FRONTEND
                // -----------------------------------------

                const erroresFila = [];


                if (
                    !Number.isInteger(empleadoId) ||
                    empleadoId <= 0
                ) {

                    erroresFila.push(
                        "Empleado inválido."
                    );

                } else if (
                    !empleadosMap.has(
                        empleadoId
                    )
                ) {

                    erroresFila.push(
                        `No existe el empleado ID ${empleadoId}.`
                    );
                }


                if (
                    !Number.isFinite(monto) ||
                    monto <= 0
                ) {

                    erroresFila.push(
                        "Monto inválido."
                    );
                }


                if (!fechaOtorgamiento) {

                    erroresFila.push(
                        "Fecha de otorgamiento inválida."
                    );
                }


                if (
                    row.fecha_primer_descuento &&
                    !fechaPrimerDescuento
                ) {

                    erroresFila.push(
                        "Fecha del primer descuento inválida."
                    );
                }


                if (
                    fechaOtorgamiento &&
                    fechaPrimerDescuento &&
                    fechaPrimerDescuento <
                        fechaOtorgamiento
                ) {

                    erroresFila.push(
                        "El primer descuento es anterior al otorgamiento."
                    );
                }


                const empleado =
                    empleadosMap.get(
                        empleadoId
                    );


                const item = {

                    fila_excel:
                        filaExcel,

                    empleado_id:
                        empleadoId,

                    empleado_nombre:
                        empleado
                            ? `${empleado.apellido} ${empleado.nombre}`.trim()
                            : "",

                    numero:
                        String(
                            row.numero ?? ""
                        ).trim(),

                    monto_original:
                        monto,

                    fecha_otorgamiento:
                        fechaOtorgamiento,

                    fecha_primer_descuento:
                        fechaPrimerDescuento,

                    observaciones:
                        String(
                            row.observaciones ?? ""
                        ).trim(),

                    errores:
                        erroresFila,
                };


                nuevasFilas.push(item);


                if (erroresFila.length) {

                    nuevosErrores.push({
                        fila:
                            filaExcel,

                        error:
                            erroresFila.join(" "),
                    });
                }
            });


            if (!nuevasFilas.length) {

                throw new Error(
                    "La hoja Prestamos no contiene datos para importar."
                );
            }


            setFilas(nuevasFilas);
            setErroresLectura(
                nuevosErrores
            );

        } catch (e) {

            console.error(e);

            setArchivo(null);
            setFilas([]);
            setErroresLectura([]);

            setErrorGeneral(
                e.message ||
                "No se pudo leer el archivo."
            );
        }
    };


    // =====================================================
    // IMPORTAR
    // =====================================================

    const importar = async () => {

        if (!filas.length) {
            return;
        }

        if (erroresLectura.length) {

            setErrorGeneral(
                "Corregí los errores del archivo antes de importar."
            );

            return;
        }

        try {

            setImportando(true);
            setErrorGeneral("");

            const prestamos =
                filas.map((fila) => ({

                    fila_excel:
                        fila.fila_excel,

                    empleado_id:
                        fila.empleado_id,

                    numero:
                        fila.numero || null,

                    monto_original:
                        fila.monto_original,

                    fecha_otorgamiento:
                        fila.fecha_otorgamiento,

                    fecha_primer_descuento:
                        fila.fecha_primer_descuento ||
                        null,

                    observaciones:
                        fila.observaciones ||
                        null,
                }));


            const response = await fetch(
                `${apiUrl}/prestamosempleado/importar-masivo`,
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        prestamos,
                    }),
                }
            );


            const data =
                await response
                    .json()
                    .catch(() => null);


            if (!response.ok) {

                if (
                    Array.isArray(
                        data?.errores
                    ) &&
                    data.errores.length
                ) {

                    const detalle =
                        data.errores
                            .map(
                                (e) =>
                                    `Fila ${e.fila}: ${e.error}`
                            )
                            .join("\n");

                    throw new Error(
                        `${
                            data?.error ||
                            "No se pudo realizar la importación."
                        }\n\n${detalle}`
                    );
                }

                throw new Error(
                    data?.error ||
                    "No se pudo realizar la importación."
                );
            }


            window.alert(
                `${data?.cantidad ?? filas.length} préstamos importados correctamente.`
            );


            onClose(true);

        } catch (e) {

            console.error(e);

            setErrorGeneral(
                e.message ||
                "Error importando préstamos."
            );

        } finally {

            setImportando(false);
        }
    };


    // =====================================================
    // CERRAR
    // =====================================================

    const cerrar = () => {

        if (importando) {
            return;
        }

        setArchivo(null);
        setFilas([]);
        setErroresLectura([]);
        setErrorGeneral("");

        if (inputRef.current) {
            inputRef.current.value = "";
        }

        onClose(false);
    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <Modal
            show={show}
            onHide={cerrar}
            size="xl"
            centered
        >

            <Modal.Header closeButton>

                <Modal.Title>
                    Carga Masiva de Préstamos
                </Modal.Title>

            </Modal.Header>


            <Modal.Body>

                {errorGeneral && (

                    <Alert
                        variant="danger"
                        style={{
                            whiteSpace: "pre-line",
                        }}
                    >
                        {errorGeneral}
                    </Alert>

                )}


                <Alert variant="info">

                    <div className="fw-semibold mb-1">
                        Procedimiento
                    </div>

                    <div>
                        1. Descargá la plantilla.
                    </div>

                    <div>
                        2. Completá los préstamos.
                    </div>

                    <div>
                        3. Seleccioná el archivo completo.
                    </div>

                    <div>
                        4. Revisá la previsualización.
                    </div>

                    <div>
                        5. Confirmá la importación.
                    </div>

                </Alert>


                <div className="d-flex flex-wrap gap-2 mb-3">

                    <Button
                        variant="outline-success"
                        onClick={
                            descargarPlantilla
                        }
                        disabled={
                            importando ||
                            !empleadosNormalizados.length
                        }
                    >
                        Descargar plantilla Excel
                    </Button>


                    <Button
                        variant="outline-primary"
                        onClick={() =>
                            inputRef.current?.click()
                        }
                        disabled={importando}
                    >
                        Seleccionar Excel
                    </Button>


                    <input
                        ref={inputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        style={{
                            display: "none",
                        }}
                        onChange={(e) =>
                            leerArchivo(
                                e.target.files?.[0] ||
                                null
                            )
                        }
                    />

                </div>


                {archivo && (

                    <div className="mb-3">

                        <strong>
                            Archivo:
                        </strong>{" "}

                        {archivo.name}

                    </div>

                )}


                {filas.length > 0 && (

                    <>

                        <div className="d-flex gap-2 mb-2">

                            <Badge bg="secondary">
                                {filas.length} filas
                            </Badge>

                            {erroresLectura.length ? (

                                <Badge bg="danger">
                                    {
                                        erroresLectura.length
                                    }{" "}
                                    con errores
                                </Badge>

                            ) : (

                                <Badge bg="success">
                                    Archivo válido
                                </Badge>

                            )}

                        </div>


                        <div
                            className="table-responsive"
                            style={{
                                maxHeight: 420,
                            }}
                        >

                            <Table
                                bordered
                                hover
                                size="sm"
                            >

                                <thead>

                                    <tr>

                                        <th>
                                            Fila
                                        </th>

                                        <th>
                                            Empleado
                                        </th>

                                        <th>
                                            Nº
                                        </th>

                                        <th className="text-end">
                                            Monto
                                        </th>

                                        <th>
                                            Otorgamiento
                                        </th>

                                        <th>
                                            1º descuento
                                        </th>

                                        <th>
                                            Estado
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filas.map(
                                        (fila) => (

                                            <tr
                                                key={
                                                    fila.fila_excel
                                                }
                                            >

                                                <td>
                                                    {
                                                        fila.fila_excel
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        fila.empleado_nombre ||
                                                        `ID ${fila.empleado_id}`
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        fila.numero ||
                                                        "—"
                                                    }
                                                </td>

                                                <td className="text-end">
                                                    {Number.isFinite(
                                                        fila.monto_original
                                                    )
                                                        ? fila.monto_original.toLocaleString(
                                                              "es-AR",
                                                              {
                                                                  minimumFractionDigits: 2,
                                                                  maximumFractionDigits: 2,
                                                              }
                                                          )
                                                        : "—"}
                                                </td>

                                                <td>
                                                    {
                                                        fila.fecha_otorgamiento ||
                                                        "—"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        fila.fecha_primer_descuento ||
                                                        "—"
                                                    }
                                                </td>

                                                <td>

                                                    {fila.errores.length ? (

                                                        <span className="text-danger">

                                                            {fila.errores.join(
                                                                " "
                                                            )}

                                                        </span>

                                                    ) : (

                                                        <Badge bg="success">
                                                            Válido
                                                        </Badge>

                                                    )}

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </Table>

                        </div>

                    </>

                )}

            </Modal.Body>


            <Modal.Footer>

                <Button
                    variant="secondary"
                    onClick={cerrar}
                    disabled={importando}
                >
                    Cerrar
                </Button>


                <Button
                    variant="success"
                    onClick={importar}
                    disabled={
                        importando ||
                        !filas.length ||
                        erroresLectura.length > 0
                    }
                >

                    {importando ? (

                        <>
                            <Spinner
                                size="sm"
                                className="me-2"
                            />

                            Importando…
                        </>

                    ) : (

                        `Importar ${
                            filas.length || ""
                        } préstamos`

                    )}

                </Button>

            </Modal.Footer>

        </Modal>
    );
}