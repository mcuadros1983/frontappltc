import React from "react";

import BooleanRenderer
    from "./renderers/BooleanRenderer";

import DateRenderer
    from "./renderers/DateRenderer";

import DateTimeRenderer
    from "./renderers/DateTimeRenderer";

import DecimalRenderer
    from "./renderers/DecimalRenderer";

import IntegerRenderer
    from "./renderers/IntegerRenderer";

import SelectRenderer
    from "./renderers/SelectRenderer";

import TextAreaRenderer
    from "./renderers/TextAreaRenderer";

import TextRenderer
    from "./renderers/TextRenderer";

import FieldMessages
    from "./FieldMessages";

const renderers = {
    TEXTO:
        TextRenderer,

    TEXTAREA:
        TextAreaRenderer,

    ENTERO:
        IntegerRenderer,

    DECIMAL:
        DecimalRenderer,

    FECHA:
        DateRenderer,

    DATETIME:
        DateTimeRenderer,

    BOOLEAN:
        BooleanRenderer,

    LISTA:
        SelectRenderer,

    SELECT:
        SelectRenderer,
};


const FieldRenderer = ({
    field,
    runtime,
    onChange,
}) => {



    if (
        !runtime ||
        runtime.visible === false
    ) {
        return null;
    }


    
    const Renderer =
        renderers[
        String(
            field.tipo ||
            "TEXTO"
        ).toUpperCase()
        ] ||
        TextRenderer;

    return (
        <>
            <Renderer
                field={field}

                value={
                    runtime.value
                }

                required={
                    runtime.required
                }

                disabled={
                    !runtime.enabled ||
                    runtime.readOnly
                }

                readOnly={
                    runtime.readOnly
                }

                errors={
                    runtime.errors
                }

                warnings={
                    runtime.warnings
                }

                info={
                    runtime.info
                }

                onChange={(value) =>
                    onChange(
                        field.id,
                        value
                    )
                }
            />

            <FieldMessages
                errors={
                    runtime.errors
                }

                warnings={
                    runtime.warnings
                }

                info={
                    runtime.info
                }
            />
        </>
    );
};

export default FieldRenderer;
