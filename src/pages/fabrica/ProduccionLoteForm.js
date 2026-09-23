import React, {
    useEffect,
    useState
} from "react";
import Select from "react-select";
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    Table,
    Card
} from "react-bootstrap";
import {
    useNavigate,
    useParams
} from "react-router-dom";
import {
    produccionLoteApi
} from "../../services/produccionLoteApi";
import * as XLSX from "xlsx";

const fechaLocalISO = (fecha) => {

    const anio =
        fecha.getFullYear();

    const mes =
        String(
            fecha.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            fecha.getDate()
        ).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
};


const obtenerFechaActual = () => {

    return fechaLocalISO(
        new Date()
    );

};


const sumarDias = (
    fechaISO,
    dias
) => {

    if (!fechaISO) {
        return "";
    }

    const [
        anio,
        mes,
        dia
    ] = fechaISO
        .split("-")
        .map(Number);

    const fecha =
        new Date(
            anio,
            mes - 1,
            dia
        );

    fecha.setDate(
        fecha.getDate() + dias
    );

    return fechaLocalISO(fecha);
};

export default function ProduccionLoteForm() {

    const navigate = useNavigate();
    const { id } = useParams();
    const [articulos, setArticulos] = useState([]);
    const [textoPegado, setTextoPegado] = useState("");
    const [modoPegado, setModoPegado] = useState(false);
    const [form, setForm] =
        useState(() => {

            const fechaProduccion =
                obtenerFechaActual();

            return {

                fecha_produccion:
                    fechaProduccion,

                fecha_vencimiento:
                    sumarDias(
                        fechaProduccion,
                        60
                    ),

                observaciones: "",

                detalles: []

            };

        });



    const articuloOptions = articulos.map((a) => ({
        value: a.id,
        label: `${(a.articulodescripcion || a.descripcion || "")
            .replace(/^-+\s*/, "")
            .trim()}`
    }));

    useEffect(() => {
        cargarArticulos();

        if (id) {
            cargarLote();
        }
    }, [id]);

    const cargarArticulos = async () => {
        try {
            const data =
                await produccionLoteApi.obtenerArticulos();
            setArticulos(data);
        } catch (error) {
            console.error(error);
        }
    };

    const cargarLote = async () => {
        try {
            const data =
                await produccionLoteApi.getById(id);
            setForm({
                fecha_produccion:
                    data.fecha_produccion || "",
                fecha_vencimiento:
                    data.fecha_vencimiento || "",
                observaciones:
                    data.observaciones || "",
                detalles:
                    data.detalles || []
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        /*
         * Si cambia la fecha de producción,
         * recalculamos automáticamente
         * el vencimiento a 60 días.
         */
        if (
            name ===
            "fecha_produccion"
        ) {

            setForm(
                (prev) => ({
                    ...prev,

                    fecha_produccion:
                        value,

                    fecha_vencimiento:
                        value
                            ? sumarDias(
                                value,
                                60
                            )
                            : ""
                })
            );

            return;
        }


        setForm(
            (prev) => ({
                ...prev,
                [name]: value
            })
        );

    };

    const agregarDetalle = () => {
        setForm({
            ...form,
            detalles: [
                ...form.detalles,
                {
                    articulo_id: "",
                    cantidad: ""
                }
            ]
        });
    };

    const actualizarDetalle = (
        index,
        campo,
        valor
    ) => {
        const nuevos =
            [...form.detalles];
        nuevos[index][campo] =
            valor;
        setForm({
            ...form,
            detalles: nuevos
        });
    };

    const eliminarDetalle = (
        index
    ) => {
        const nuevos =
            [...form.detalles];

        nuevos.splice(index, 1);
        setForm({
            ...form,
            detalles: nuevos
        });
    };

    const handlePaste = (e) => {

        e.preventDefault();

        const texto =
            e.clipboardData.getData(
                "text/plain"
            );

        if (!texto) {
            return;
        }


        /*
         * Excel copia:
         *
         * columnas -> TAB
         * filas    -> salto de línea
         */
        const lineas =
            String(texto)
                .replace(/\r\n/g, "\n")
                .replace(/\r/g, "\n")
                .split("\n");


        /*
         * Excel normalmente agrega
         * un salto de línea al final.
         */
        while (
            lineas.length > 0 &&
            !lineas[
                lineas.length - 1
            ].trim()
        ) {
            lineas.pop();
        }


        const nuevosDetalles = [];


        lineas.forEach(
            (linea) => {

                if (!linea.trim()) {
                    return;
                }


                /*
                 * Deben venir exactamente:
                 *
                 * codigo | cantidad
                 */
                const columnas =
                    linea.split("\t");

                if (columnas.length !== 2) {

                    nuevosDetalles.push({

                        articulo_id: "",

                        codigoPegado:
                            String(
                                columnas[0] || ""
                            ).trim(),

                        descripcion: "",

                        cantidad:
                            String(
                                columnas[1] || ""
                            ).trim(),

                        errorCodigo: true,

                        errorCantidad: true,

                        errorEstructura: true

                    });

                    return;
                }


                const codigo =
                    String(
                        columnas[0] || ""
                    ).trim();


                const cantidadOriginal =
                    String(
                        columnas[1] || ""
                    ).trim();


                const cantidadNumero =
                    Number(
                        cantidadOriginal
                            .replace(",", ".")
                    );


                /*
                 * Buscar inmediatamente
                 * el código en ArticuloTabla
                 */
                const articulo =
                    articulos.find(
                        (a) =>
                            String(
                                a.codigobarra || ""
                            ).trim() ===
                            codigo
                    ) || null;


                const errorCodigo =
                    !articulo;


                const errorCantidad =
                    !Number.isFinite(
                        cantidadNumero
                    ) ||
                    cantidadNumero <= 0;


                nuevosDetalles.push({

                    articulo_id:
                        articulo?.id || "",

                    codigoPegado:
                        codigo,

                    descripcion:
                        articulo?.descripcion ||
                        "",

                    cantidad:
                        cantidadOriginal,

                    errorCodigo,

                    errorCantidad

                });

            }
        );


        /*
         * Reemplazamos la grilla
         * por lo recién pegado.
         */
        setForm(
            (prev) => ({
                ...prev,
                detalles:
                    nuevosDetalles
            })
        );


        /*
         * El textarea solamente sirve
         * como zona para pegar.
         */
        setTextoPegado("");

    };

    const buscarArticuloPorCodigo = (codigo) => {

        const codigoNormalizado =
            String(codigo || "").trim();

        return articulos.find(
            (a) =>
                String(a.codigobarra || "").trim() ===
                codigoNormalizado
        ) || null;
    };


    const actualizarCodigoPegado = (
        index,
        codigo
    ) => {

        const codigoLimpio =
            String(codigo || "").trim();


        const articulo =
            articulos.find(
                (a) =>
                    String(
                        a.codigobarra || ""
                    ).trim() ===
                    codigoLimpio
            ) || null;


        setForm(
            (prev) => ({

                ...prev,

                detalles:
                    prev.detalles.map(
                        (item, i) => {

                            if (i !== index) {
                                return item;
                            }

                            return {

                                ...item,

                                codigoPegado:
                                    codigo,

                                articulo_id:
                                    articulo?.id ||
                                    "",

                                descripcion:
                                    articulo?.descripcion ||
                                    "",

                                errorCodigo:
                                    !articulo

                            };

                        }
                    )

            })
        );

    };


    const actualizarCantidadPegada = (
        index,
        valor
    ) => {

        const cantidadNumero =
            Number(
                String(valor)
                    .trim()
                    .replace(",", ".")
            );


        setForm(
            (prev) => ({

                ...prev,

                detalles:
                    prev.detalles.map(
                        (item, i) => {

                            if (i !== index) {
                                return item;
                            }

                            return {

                                ...item,

                                cantidad:
                                    valor,

                                errorCantidad:
                                    !Number.isFinite(
                                        cantidadNumero
                                    ) ||
                                    cantidadNumero <= 0

                            };

                        }
                    )

            })
        );

    };

    const descargarPlantilla = () => {

        const workbook =
            XLSX.utils.book_new();


        // ==============================
        // HOJA DE CARGA
        // ==============================

        const datosCarga = [
            {
                codigo: "",
                cantidad: ""
            }
        ];

        const hojaCarga =
            XLSX.utils.json_to_sheet(
                datosCarga,
                {
                    header: [
                        "codigo",
                        "cantidad"
                    ]
                }
            );

        hojaCarga["!cols"] = [
            { wch: 18 },
            { wch: 18 }
        ];

        XLSX.utils.book_append_sheet(
            workbook,
            hojaCarga,
            "Carga"
        );


        // ==============================
        // HOJA DE ARTÍCULOS
        // ==============================

        const datosArticulos =
            articulos.map(
                (articulo) => ({
                    codigo:
                        articulo.codigobarra || "",

                    descripcion:
                        articulo.descripcion || ""
                })
            );

        const hojaArticulos =
            XLSX.utils.json_to_sheet(
                datosArticulos
            );

        hojaArticulos["!cols"] = [
            { wch: 18 },
            { wch: 50 }
        ];

        XLSX.utils.book_append_sheet(
            workbook,
            hojaArticulos,
            "Articulos"
        );


        XLSX.writeFile(
            workbook,
            "Plantilla_Produccion_Lote.xlsx"
        );
    };

    const guardar = async () => {

        try {

            if (
                form.detalles.length === 0
            ) {
                alert(
                    "Debe agregar al menos un producto"
                );

                return;
            }


            if (hayErrores) {

                alert(
                    "Hay productos con errores. Corrija los códigos o cantidades antes de guardar."
                );

                return;
            }


            if (!form.fecha_produccion) {

                alert(
                    "Debe ingresar fecha de producción"
                );

                return;
            }


            if (!form.fecha_vencimiento) {

                alert(
                    "Debe ingresar fecha de vencimiento"
                );

                return;
            }


            /*
             * Limpiamos los campos auxiliares
             * utilizados por la carga desde Excel.
             */
            const payload = {

                ...form,

                detalles:
                    form.detalles.map(
                        (item) => ({

                            articulo_id:
                                Number(
                                    item.articulo_id
                                ),

                            cantidad:
                                Number(
                                    String(
                                        item.cantidad
                                    )
                                        .replace(
                                            ",",
                                            "."
                                        )
                                )

                        })
                    )

            };


            if (id) {

                await produccionLoteApi.update(
                    id,
                    payload
                );

            } else {

                await produccionLoteApi.create(
                    payload
                );

            }


            navigate(
                "/fabrica/produccion-lotes"
            );


        } catch (error) {

            console.error(error);

            alert(
                "Error al guardar"
            );

        }

    };
    const hayErrores = form.detalles.some(
        (item) => {

            const cantidad =
                Number(
                    String(
                        item.cantidad ?? ""
                    )
                        .trim()
                        .replace(",", ".")
                );

            return (
                item.errorCodigo ||
                item.errorCantidad ||
                !item.articulo_id ||
                !Number.isFinite(cantidad) ||
                cantidad <= 0
            );
        }
    );

    return (
        <Container fluid>
            <Card>
                <Card.Header>
                    <h4>
                        {
                            id
                                ? "Editar Lote"
                                : "Nuevo Lote"
                        }
                    </h4>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>
                                    Fecha Producción
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    name="fecha_produccion"
                                    value={
                                        form.fecha_produccion
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>
                                    Fecha Vencimiento
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    name="fecha_vencimiento"
                                    value={
                                        form.fecha_vencimiento
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col>
                            <Form.Group>
                                <Form.Label>
                                    Observaciones
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="observaciones"
                                    value={
                                        form.observaciones
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <hr />
                    <div className="d-flex justify-content-between align-items-center mb-3">

                        <h5 className="mb-0">
                            Productos del lote
                        </h5>

                        <div className="d-flex gap-2">

                            <Button
                                variant="outline-success"
                                onClick={descargarPlantilla}
                            >
                                Descargar plantilla
                            </Button>

                            <Button
                                variant="outline-primary"
                                onClick={() => {

                                    setModoPegado(
                                        !modoPegado
                                    );

                                    setTextoPegado("");

                                }}
                            >
                                {modoPegado
                                    ? "Carga manual"
                                    : "Pegar desde Excel"}
                            </Button>

                            {!modoPegado && (

                                <Button
                                    onClick={
                                        agregarDetalle
                                    }
                                >
                                    Agregar Producto
                                </Button>

                            )}

                        </div>

                    </div>


                    {modoPegado && (

                        <Card className="mb-3">

                            <Card.Body>

                                <Form.Label>
                                    Copiar desde Excel
                                </Form.Label>

                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={textoPegado}
                                    placeholder={
                                        "Haga clic aquí y presione Ctrl+V después de copiar código y cantidad desde Excel"
                                    }
                                    onChange={(e) =>
                                        setTextoPegado(
                                            e.target.value
                                        )
                                    }
                                    onPaste={
                                        handlePaste
                                    }
                                />

                                <Form.Text muted>
                                    Copie exactamente dos columnas desde Excel:
                                    código del artículo y cantidad.
                                </Form.Text>

                            </Card.Body>

                        </Card>

                    )}


                    <Table
                        bordered
                        striped
                        hover
                        responsive
                    >

                        <thead>

                            {modoPegado ? (

                                <tr>

                                    <th width="180">
                                        Código
                                    </th>

                                    <th>
                                        Artículo reconocido
                                    </th>

                                    <th width="180">
                                        Cantidad
                                    </th>

                                    <th width="130">
                                        Estado
                                    </th>

                                    <th width="100">
                                        Acción
                                    </th>

                                </tr>

                            ) : (

                                <tr>

                                    <th>
                                        Artículo
                                    </th>

                                    <th width="180">
                                        Cantidad
                                    </th>

                                    <th width="100">
                                        Acción
                                    </th>

                                </tr>

                            )}

                        </thead>


                        <tbody>

                            {form.detalles.map(
                                (item, index) => (

                                    modoPegado ? (

                                        /*
                                         * ==========================
                                         * CARGA DESDE EXCEL
                                         * ==========================
                                         */

                                        <tr
                                            key={index}
                                            className={
                                                item.errorCodigo ||
                                                    item.errorCantidad
                                                    ? "table-danger"
                                                    : ""
                                            }
                                        >

                                            <td>

                                                <Form.Control
                                                    type="text"
                                                    value={
                                                        item.codigoPegado ||
                                                        ""
                                                    }
                                                    isInvalid={
                                                        item.errorCodigo
                                                    }
                                                    onChange={(e) =>
                                                        actualizarCodigoPegado(
                                                            index,
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                            </td>


                                            <td>

                                                {item.errorCodigo ? (

                                                    <span className="text-danger fw-bold">
                                                        Código no encontrado
                                                    </span>

                                                ) : (

                                                    <span className="text-success">
                                                        {item.descripcion}
                                                    </span>

                                                )}

                                            </td>


                                            <td>

                                                <Form.Control
                                                    type="text"
                                                    value={
                                                        item.cantidad
                                                    }
                                                    isInvalid={
                                                        item.errorCantidad
                                                    }
                                                    onChange={(e) =>
                                                        actualizarCantidadPegada(
                                                            index,
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                            </td>


                                            <td>

                                                {item.errorEstructura ? (

                                                    <span className="text-danger fw-bold">
                                                        Formato incorrecto
                                                    </span>

                                                ) : item.errorCodigo ? (

                                                    <span className="text-danger fw-bold">
                                                        Código inexistente
                                                    </span>

                                                ) : item.errorCantidad ? (

                                                    <span className="text-danger fw-bold">
                                                        Cantidad inválida
                                                    </span>

                                                ) : (

                                                    <span className="text-success fw-bold">
                                                        OK
                                                    </span>

                                                )}

                                            </td>


                                            <td>

                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() =>
                                                        eliminarDetalle(
                                                            index
                                                        )
                                                    }
                                                >
                                                    X
                                                </Button>

                                            </td>

                                        </tr>

                                    ) : (

                                        /*
                                         * ==========================
                                         * CARGA MANUAL
                                         * ==========================
                                         */

                                        <tr key={index}>

                                            <td>

                                                <Select
                                                    placeholder="Buscar artículo..."

                                                    value={
                                                        articuloOptions.find(
                                                            (o) =>
                                                                Number(o.value) ===
                                                                Number(
                                                                    item.articulo_id
                                                                )
                                                        ) || null
                                                    }

                                                    options={
                                                        articuloOptions
                                                    }

                                                    onChange={(selected) =>
                                                        actualizarDetalle(
                                                            index,
                                                            "articulo_id",
                                                            selected?.value ||
                                                            ""
                                                        )
                                                    }

                                                    isClearable

                                                    noOptionsMessage={() =>
                                                        "No se encontraron artículos"
                                                    }

                                                    styles={{
                                                        menu: (base) => ({
                                                            ...base,
                                                            zIndex: 9999
                                                        })
                                                    }}
                                                />

                                            </td>


                                            <td>

                                                <Form.Control
                                                    type="number"
                                                    step="0.001"
                                                    value={
                                                        item.cantidad
                                                    }
                                                    onChange={(e) =>
                                                        actualizarDetalle(
                                                            index,
                                                            "cantidad",
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                            </td>


                                            <td>

                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() =>
                                                        eliminarDetalle(
                                                            index
                                                        )
                                                    }
                                                >
                                                    X
                                                </Button>

                                            </td>

                                        </tr>

                                    )

                                )
                            )}

                        </tbody>

                    </Table>
                </Card.Body>
                <Card.Footer>
                    <Button
                        variant="success"
                        onClick={guardar}
                        disabled={
                            form.detalles.length === 0 ||
                            hayErrores ||
                            !form.fecha_produccion ||
                            !form.fecha_vencimiento
                        }
                    >
                        Guardar
                    </Button>
                    {" "}
                    <Button
                        variant="secondary"
                        onClick={() =>
                            navigate(
                                "/fabrica/produccion-lotes"
                            )
                        }
                    >
                        Volver
                    </Button>
                </Card.Footer>
            </Card>
        </Container>
    );
}