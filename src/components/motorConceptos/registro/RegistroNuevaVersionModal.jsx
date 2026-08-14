import React, {
    useEffect,
    useState,
} from "react";

import {
    Alert,
    Form,
} from "react-bootstrap";

import {
    ERPButton,
    ERPModal,
} from "../../common/erp";

const RegistroNuevaVersionModal = ({
    show,
    saving,
    onHide,
    onSubmit,
    archivoTipos = [],
    onUploadArchivos,
}) => {

    const [
        motivo,
        setMotivo,
    ] = useState("");

    const [
        comentario,
        setComentario,
    ] = useState("");

    const [
        error,
        setError,
    ] = useState("");

    const [
        archivos,
        setArchivos,
    ] = useState({});

    useEffect(() => {
        if (!show) return;

        setMotivo("");
        setComentario("");
        setError("");
        setArchivos({});
    }, [show]);

    const submit =
        async () => {

            if (!motivo.trim()) {
                setError(
                    "El motivo es obligatorio"
                );
                return;
            }

            setError("");

            try {

                const registro =
                    await onSubmit({

                        motivo:
                            motivo.trim(),

                        comentario:
                            comentario.trim() ||
                            null,

                    });

                if (onUploadArchivos) {

                    for (const archivoTipoId of Object.keys(archivos)) {

                        const files =
                            archivos[
                            archivoTipoId
                            ];

                        if (!files.length) {
                            continue;
                        }

                        await onUploadArchivos(

                            Number(
                                archivoTipoId
                            ),

                            files,

                            registro

                        );

                    }

                }

                onHide();

            } catch (error) {

                setError(
                    error.message ||
                    "Ocurrió un error al crear la nueva versión."
                );

            }

        };
    return (
        <ERPModal
            show={show}
            onHide={onHide}
            title="Crear nueva versión"
            footer={
                <>
                    <ERPButton
                        type="cancel"
                        disabled={saving}
                        onClick={onHide}
                    />

                    <ERPButton
                        type="save"
                        disabled={saving}
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

            <Form.Group className="mb-3">
                <Form.Label>
                    Motivo *
                </Form.Label>

                <Form.Control
                    value={motivo}
                    disabled={saving}
                    onChange={(event) =>
                        setMotivo(
                            event.target.value
                        )
                    }
                />
            </Form.Group>

            {
                archivoTipos
                    .filter(
                        (tipo) => tipo.activo !== false
                    )
                    .map((tipo) => (

                        <Form.Group
                            key={tipo.id}
                            className="mb-3"
                        >

                            <Form.Label>
                                {tipo.nombre}
                            </Form.Label>
                            <Form.Control
                                type="file"
                                disabled={saving}
                                multiple={
                                    Boolean(
                                        tipo.permite_multiples
                                    )
                                }
                                onChange={(event) => {

                                    setArchivos((prev) => ({

                                        ...prev,

                                        [tipo.id]:
                                            Array.from(
                                                event.target.files || []
                                            ),

                                    }));

                                }}
                            />

                            {
                                archivos[tipo.id]?.length > 0 && (

                                    <small className="text-success">

                                        {
                                            archivos[tipo.id].length
                                        } archivo(s) seleccionado(s)

                                    </small>

                                )
                            }

                        </Form.Group>

                    ))
            }

            <Form.Group>
                <Form.Label>
                    Comentario
                </Form.Label>

                <Form.Control
                    as="textarea"
                    rows={3}
                    value={comentario}
                    disabled={saving}
                    onChange={(event) =>
                        setComentario(
                            event.target.value
                        )
                    }
                />
            </Form.Group>
        </ERPModal>
    );
};

export default RegistroNuevaVersionModal;
