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

const RegistroArchivoUploadModal = ({
    show,
    archivoTipos = [],
    uploading,
    onHide,
    onSubmit,
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

    useEffect(() => {
        if (!show) return;

        setArchivoTipoId("");
        setNombreLogico("");
        setFile(null);
        setError("");
    }, [show]);

    const selectedType =
        useMemo(
            () =>
                archivoTipos.find(
                    (item) =>
                        Number(
                            item.id
                        ) ===
                        Number(
                            archivoTipoId
                        )
                ),
            [
                archivoTipos,
                archivoTipoId,
            ]
        );

    const validateFile = () => {
        if (!archivoTipoId) {
            return "Debe seleccionar un tipo de archivo";
        }

        if (!file) {
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
            selectedType
                ?.mime_types_permitidos ||
            [];

        if (
            mimeTypes.length > 0 &&
            !mimeTypes.includes(
                file.type
            )
        ) {
            return "El tipo MIME no está permitido";
        }

        const extensions =
            selectedType
                ?.extensiones_permitidas ||
            [];

        if (
            extensions.length > 0
        ) {
            const lowerName =
                file.name.toLowerCase();

            const valid =
                extensions.some(
                    (extension) =>
                        lowerName.endsWith(
                            String(extension)
                                .toLowerCase()
                        )
                );

            if (!valid) {
                return "La extensión del archivo no está permitida";
            }
        }

        return "";
    };

    const submit =
        async () => {
            const validation =
                validateFile();

            if (validation) {
                setError(
                    validation
                );
                return;
            }

            await onSubmit({
                file,
                archivo_tipo_id:
                    Number(
                        archivoTipoId
                    ),
                nombre_logico:
                    nombreLogico.trim() ||
                    selectedType?.nombre ||
                    file.name,
            });

            onHide();
        };

    return (
        <ERPModal
            show={show}
            onHide={onHide}
            title="Subir archivo"
            footer={
                <>
                    <ERPButton
                        type="cancel"
                        disabled={uploading}
                        onClick={onHide}
                    />

                    <ERPButton
                        type="save"
                        label={
                            uploading
                                ? "Subiendo..."
                                : "Subir"
                        }
                        disabled={uploading}
                        onClick={submit}
                    />
                </>
            }
        >
            {
                error && (
                    <Alert variant="danger">
                        {error}
                    </Alert>
                )
            }

            <Row className="g-3">

                <Col xs={12}>
                    <Form.Label>
                        Tipo de archivo *
                    </Form.Label>

                    <Form.Select
                    className="form-control"
                        value={
                            archivoTipoId
                        }
                        disabled={uploading}
                        onChange={(event) =>
                            setArchivoTipoId(
                                event.target.value
                            )
                        }
                    >
                        <option value="">
                            Seleccionar
                        </option>

                        {
                            archivoTipos
                                .filter(
                                    (item) =>
                                        item.activo !== false
                                )
                                .map(
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

                <Col xs={12}>
                    <Form.Label>
                        Nombre lógico
                    </Form.Label>

                    <Form.Control
                        value={
                            nombreLogico
                        }
                        disabled={uploading}
                        placeholder={
                            selectedType
                                ?.nombre ||
                            "Ej. Contrato firmado"
                        }
                        onChange={(event) =>
                            setNombreLogico(
                                event.target.value
                            )
                        }
                    />
                </Col>

                <Col xs={12}>
                    <Form.Label>
                        Archivo *
                    </Form.Label>

                    <Form.Control
                        type="file"
                        disabled={uploading}
                        accept={
                            selectedType
                                ?.mime_types_permitidos
                                ?.join(",") ||
                            selectedType
                                ?.extensiones_permitidas
                                ?.join(",") ||
                            undefined
                        }
                        onChange={(event) =>
                            setFile(
                                event.target.files
                                    ?.[0] ||
                                null
                            )
                        }
                    />

                    {
                        selectedType
                            ?.tamanio_maximo_mb && (
                            <Form.Text className="text-muted">
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

export default RegistroArchivoUploadModal;
