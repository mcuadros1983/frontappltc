import React, {
    useEffect,
    useMemo,
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
                <>

                    <ERPButton

                        type="cancel"

                        onClick={
                            onHide
                        }

                    />

                    <ERPButton

                        type="save"

                        label="Agregar"

                        onClick={
                            submit
                        }

                    />

                </>
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
                            (event) => {

                                setArchivoTipoId(
                                    event.target.value
                                );

                                setError("");

                            }
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


                <Col
                    xs={12}
                >

                    <Form.Label>

                        Archivo *

                    </Form.Label>

                    <Form.Control

                        type="file"

                        accept={

                            selectedType
                                ?.mime_types_permitidos
                                ?.join(",") ||

                            selectedType
                                ?.extensiones_permitidas
                                ?.join(",") ||

                            undefined

                        }

                        onChange={
                            (event) => {

                                setFile(
                                    event.target
                                        .files?.[0] ||
                                    null
                                );

                                setError("");

                            }
                        }

                    />


                    {
                        selectedType
                            ?.tamanio_maximo_mb && (

                            <Form.Text
                                className="text-muted"
                            >

                                Tamaño máximo: {
                                    selectedType
                                        .tamanio_maximo_mb
                                } MB

                            </Form.Text>

                        )
                    }

                </Col>

            </Row>

        </ERPModal>

    );

};


export default EntidadDocumentoArchivoModal;