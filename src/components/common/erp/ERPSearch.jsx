import React from "react";
import { InputGroup, Form } from "react-bootstrap";
import { FiSearch, FiX } from "react-icons/fi";

const ERPSearch = ({
    value,
    onChange,
    placeholder = "Buscar...",
    width = 300,
}) => {

    return (

        <InputGroup
            style={{
                width
            }}
        >

            <InputGroup.Text>

                <FiSearch />

            </InputGroup.Text>

            <Form.Control

                value={value}

                placeholder={placeholder}

                onChange={(e) =>
                    onChange(e.target.value)
                }

            />

            {

                value && (

                    <InputGroup.Text

                        role="button"

                        onClick={() =>
                            onChange("")
                        }

                    >

                        <FiX />

                    </InputGroup.Text>

                )

            }

        </InputGroup>

    );

};

export default ERPSearch;