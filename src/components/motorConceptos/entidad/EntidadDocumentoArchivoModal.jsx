import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    Alert,
    Col,
    Form,
    Row,
} from "react-bootstrap";

import {
    ERPButton,
    ERPModal,
} from "../../common/erp";


const IMAGE_EXTENSIONS = [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
    "bmp",
];


const EntidadDocumentoArchivoModal = ({

    show,

    archivoTipos = [],

    archivos = [],

    onHide,

    onAdd,

}) => {

    const [
        archivoTipoId,
        setArchivoTipoId,
    ] = useState("");

    const [
        nombreLogico,
        setNombreLogico,
    ] = useState("");

    const [
        file,
        setFile,
    ] = useState(null);

    const [
        error,
        setError,
    ] = useState("");


    /*
     * =========================================================
     * INPUTS DE ARCHIVO
     * =========================================================
     */

    const cameraInputRef =
        useRef(null);

    const fileInputRef =
        useRef(null);


    useEffect(
        () => {

            if (
                !show
            ) {
                return;
            }

            setArchivoTipoId("");
            setNombreLogico("");
            setFile(null);
            setError("");

        },
        [
            show,
        ]
    );


    const tiposActivos =
        useMemo(
            () =>

                archivoTipos.filter(
                    (item) =>
                        item.activo !== false
                ),

            [
                archivoTipos,
            ]
        );


    const selectedType =
        useMemo(
            () =>

                tiposActivos.find(
                    (item) =>

                        Number(
                            item.id
                        ) ===
                        Number(
                            archivoTipoId
                        )
                ),

            [
                tiposActivos,
                archivoTipoId,
            ]
        );


    /*
     * =========================================================
     * ACCEPT DEL SELECTOR NORMAL
     * =========================================================
     */

    const accept =
        useMemo(
            () => {

                if (
                    !selectedType
                ) {
                    return undefined;
                }


                const mimeTypes =
                    Array.isArray(
                        selectedType
                            .mime_types_permitidos
                    )
                        ? selectedType
                            .mime_types_permitidos
                        : [];


                if (
                    mimeTypes.length > 0
                ) {

                    return mimeTypes
                        .join(",");

                }


                const extensions =
                    Array.isArray(
                        selectedType
                            .extensiones_permitidas
                    )
                        ? selectedType
                            .extensiones_permitidas
                        : [];


                if (
                    extensions.length === 0
                ) {
                    return undefined;
                }


                return extensions
                    .map(
                        (extension) => {

                            const value =
                                String(
                                    extension
                                )
                                    .trim()
                                    .toLowerCase();


                            if (
                                !value
                            ) {
                                return null;
                            }


                            return value.startsWith(
                                "."
                            )
                                ? value
                                : `.${value}`;

                        }
                    )
                    .filter(
                        Boolean
                    )
                    .join(",");

            },
            [
                selectedType,
            ]
        );


    /*
     * =========================================================
     * DETERMINAR SI ADMITE IMÁGENES
     * =========================================================
     */

    const permiteImagen =
        useMemo(
            () => {

                if (
                    !selectedType
                ) {
                    return false;
                }


                const mimeTypes =
                    Array.isArray(
                        selectedType
                            .mime_types_permitidos
                    )
                        ? selectedType
                            .mime_types_permitidos
                        : [];


                const permiteMimeImagen =
                    mimeTypes.some(
                        (mimeType) =>
                            String(
                                mimeType
                            )
                                .toLowerCase()
                                .startsWith(
                                    "image/"
                                )
                    );


                if (
                    permiteMimeImagen
                ) {
                    return true;
                }


                const extensions =
                    Array.isArray(
                        selectedType
                            .extensiones_permitidas
                    )
                        ? selectedType
                            .extensiones_permitidas
                        : [];


                return extensions.some(
                    (extension) => {

                        const normalized =
                            String(
                                extension
                            )
                                .trim()
                                .toLowerCase()
                                .replace(
                                    /^\./,
                                    ""
                                );


                        return IMAGE_EXTENSIONS
                            .includes(
                                normalized
                            );

                    }
                );

            },
            [
                selectedType,
            ]
        );


    /*
     * =========================================================
     * SELECCIONAR ARCHIVO
     * =========================================================
     */

    const handleFileSelected =
        (
            event
        ) => {

            const selectedFile =
                event.target
                    .files?.[0] ||
                null;


            setFile(
                selectedFile
            );

            setError("");

        };


    /*
     * =========================================================
     * CAMBIO DE TIPO
     * =========================================================
     *
     * Si cambia el tipo documental eliminamos el archivo
     * previamente seleccionado porque podría no ser válido
     * para el nuevo tipo.
     */

    const handleTipoChange =
        (
            event
        ) => {

            setArchivoTipoId(
                event.target.value
            );

            setFile(
                null
            );

            setError("");


            if (
                cameraInputRef.current
            ) {

                cameraInputRef
                    .current
                    .value =
                    "";

            }


            if (
                fileInputRef.current
            ) {

                fileInputRef
                    .current
                    .value =
                    "";

            }

        };


    /*
     * =========================================================
     * VALIDACIÓN
     * =========================================================
     */

    const validateFile =
        () => {

            if (
                !archivoTipoId
            ) {

                return "Debe seleccionar un tipo de archivo";

            }

            if (
                !selectedType
            ) {

                return "El tipo de archivo seleccionado no es válido";

            }

            if (
                !file
            ) {

                return "Debe seleccionar un archivo";

            }


            if (
                selectedType
                    ?.tamanio_maximo_mb &&
                file.size >
                Number(
                    selectedType
                        .tamanio_maximo_mb
                ) *
                1024 *
                1024
            ) {

                return `El archivo supera ${selectedType.tamanio_maximo_mb} MB`;

            }


            const mimeTypes =
                Array.isArray(
                    selectedType
                        ?.mime_types_permitidos
                )
                    ? selectedType
                        .mime_types_permitidos
                    : [];


            if (
                mimeTypes.length > 0 &&
                !mimeTypes.includes(
                    file.type
                )
            ) {

                return "El tipo MIME no está permitido";

            }


            const extensions =
                Array.isArray(
                    selectedType
                        ?.extensiones_permitidas
                )
                    ? selectedType
                        .extensiones_permitidas
                    : [];


            if (
                extensions.length > 0
            ) {

                const lowerName =
                    file.name
                        .toLowerCase();


                const valid =
                    extensions.some(
                        (extension) => {

                            const normalized =
                                String(
                                    extension
                                )
                                    .trim()
                                    .toLowerCase();


                            if (
                                !normalized
                            ) {
                                return false;
                            }


                            const extensionValue =
                                normalized.startsWith(
                                    "."
                                )
                                    ? normalized
                                    : `.${normalized}`;


                            return lowerName
                                .endsWith(
                                    extensionValue
                                );

                        }
                    );


                if (
                    !valid
                ) {

                    return "La extensión del archivo no está permitida";

                }

            }


            return "";

        };


    /*
     * =========================================================
     * AGREGAR
     * =========================================================
     */

    const submit =
        () => {

            const validation =
                validateFile();


            if (
                validation
            ) {

                setError(
                    validation
                );

                return;

            }


            onAdd?.({

                file,

                archivo_tipo_id:
                    Number(
                        archivoTipoId
                    ),

                nombre_logico:
                    nombreLogico
                        .trim() ||
                    selectedType
                        ?.nombre ||
                    file.name,

                archivo_tipo:
                    selectedType,

            });


            onHide?.();

        };


    return (

        <ERPModal

            show={
                show
            }

            onHide={
                onHide
            }

            title="Agregar archivo"

            footer={
                <div
                    className="
                        d-flex
                        flex-column-reverse
                        flex-sm-row
                        justify-content-sm-end
                        gap-2
                        w-100
                    "
                >

                    <ERPButton

                        type="cancel"

                        className="w-100"

                        onClick={
                            onHide
                        }

                    />

                    <ERPButton

                        type="save"

                        label="Agregar"

                        className="w-100"

                        onClick={
                            submit
                        }

                    />

                </div>
            }

        >

            {
                error && (

                    <Alert
                        variant="danger"
                    >

                        {error}

                    </Alert>

                )
            }


            <Row
                className="g-3"
            >

                <Col
                    xs={12}
                >

                    <Form.Label>

                        Tipo de archivo *

                    </Form.Label>

                    <Form.Select

                        className="form-control"

                        value={
                            archivoTipoId
                        }

                        onChange={
                            handleTipoChange
                        }

                    >

                        <option
                            value=""
                        >

                            Seleccionar

                        </option>

                        {
                            tiposActivos.map(
                                (item) => (

                                    <option

                                        key={
                                            item.id
                                        }

                                        value={
                                            item.id
                                        }

                                    >

                                        {
                                            item.nombre
                                        }

                                        {
                                            item.obligatorio
                                                ? " *"
                                                : ""
                                        }

                                    </option>

                                )
                            )
                        }

                    </Form.Select>

                </Col>


                <Col
                    xs={12}
                >

                    <Form.Label>

                        Nombre lógico

                    </Form.Label>

                    <Form.Control

                        value={
                            nombreLogico
                        }

                        placeholder={
                            selectedType
                                ?.nombre ||
                            "Ej. Contrato firmado"
                        }

                        onChange={
                            (event) =>
                                setNombreLogico(
                                    event.target.value
                                )
                        }

                    />

                </Col>


                {
                    selectedType && (

                        <Col
                            xs={12}
                        >

                            <Form.Label>

                                Archivo *

                            </Form.Label>


                            {/*
                             * INPUT PARA CÁMARA
                             *
                             * Solamente existe cuando el tipo
                             * documental admite imágenes.
                             */}

                            {
                                permiteImagen && (

                                    <input

                                        ref={
                                            cameraInputRef
                                        }

                                        type="file"

                                        accept="image/*"

                                        capture="environment"

                                        className="d-none"

                                        onChange={
                                            handleFileSelected
                                        }

                                    />

                                )
                            }


                            {/*
                             * INPUT NORMAL
                             *
                             * Permite galería / explorador de archivos.
                             */}

                            <input

                                ref={
                                    fileInputRef
                                }

                                type="file"

                                accept={
                                    accept
                                }

                                className="d-none"

                                onChange={
                                    handleFileSelected
                                }

                            />


                            <div
                                className="
                                    d-grid
                                    gap-2
                                "
                            >

                                {
                                    permiteImagen && (

                                        <ERPButton

                                            type="button"

                                            label="Tomar foto"

                                            className="w-100"

                                            onClick={
                                                () =>
                                                    cameraInputRef
                                                        .current
                                                        ?.click()
                                            }

                                        />

                                    )
                                }


                                <ERPButton

                                    type="button"

                                    label={
                                        permiteImagen
                                            ? "Elegir imagen o archivo"
                                            : "Seleccionar archivo"
                                    }

                                    className="w-100"

                                    onClick={
                                        () =>
                                            fileInputRef
                                                .current
                                                ?.click()
                                    }

                                />

                            </div>


                            {
                                file && (

                                    <div
                                        className="
                                            border
                                            rounded
                                            p-3
                                            mt-3
                                            bg-light
                                        "
                                    >

                                        <div
                                            className="
                                                fw-semibold
                                                text-break
                                            "
                                        >

                                            {
                                                file.name
                                            }

                                        </div>


                                        <div
                                            className="
                                                small
                                                text-muted
                                                mt-1
                                            "
                                        >

                                            {
                                                file.type ||
                                                "Tipo desconocido"
                                            }

                                            {" · "}

                                            {
                                                (
                                                    file.size /
                                                    1024 /
                                                    1024
                                                )
                                                    .toFixed(
                                                        2
                                                    )
                                            } MB

                                        </div>

                                    </div>

                                )
                            }


                            {
                                selectedType
                                    ?.tamanio_maximo_mb && (

                                    <Form.Text
                                        className="
                                            text-muted
                                            d-block
                                            mt-2
                                        "
                                    >

                                        Tamaño máximo: {
                                            selectedType
                                                .tamanio_maximo_mb
                                        } MB

                                    </Form.Text>

                                )
                            }

                        </Col>

                    )
                }

            </Row>

        </ERPModal>

    );

};


export default EntidadDocumentoArchivoModal;