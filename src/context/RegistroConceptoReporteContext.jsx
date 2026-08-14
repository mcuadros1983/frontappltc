import React, {
    createContext,
    useContext,
} from "react";

import useRegistroConceptoReporte
    from "../hooks/useRegistroConceptoReporte";

const RegistroConceptoReporteContext =
    createContext(null);

export const RegistroConceptoReporteProvider = ({
    children,
}) => {

    const value =
        useRegistroConceptoReporte();

    return (
        <RegistroConceptoReporteContext.Provider
            value={value}
        >
            {children}
        </RegistroConceptoReporteContext.Provider>
    );

};

export const useRegistroConceptoReporteContext =
    () => {

        const context =
            useContext(
                RegistroConceptoReporteContext
            );

        if (!context) {

            throw new Error(
                "useRegistroConceptoReporteContext debe utilizarse dentro de RegistroConceptoReporteProvider"
            );

        }

        return context;

    };

export default RegistroConceptoReporteContext;