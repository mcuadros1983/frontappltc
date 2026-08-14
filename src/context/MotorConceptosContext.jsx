import React, {
    createContext,
    useContext,
} from "react";

import useMotorConceptos
    from "../hooks/useMotorConceptos";

const MotorConceptosContext =
    createContext(null);

export const MotorConceptosProvider = ({
    children,
}) => {

    const value =
        useMotorConceptos();

    return (
        <MotorConceptosContext.Provider
            value={value}
        >
            {children}
        </MotorConceptosContext.Provider>
    );
};

export const useMotorConceptosContext =
    () => {
        const context =
            useContext(
                MotorConceptosContext
            );

        if (!context) {
            throw new Error(
                "useMotorConceptosContext debe utilizarse dentro de MotorConceptosProvider"
            );
        }

        return context;
    };

export default MotorConceptosContext;
