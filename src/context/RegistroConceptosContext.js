import React, {
    createContext,
    useContext,
} from "react";

import useRegistroConceptos
    from "../hooks/useRegistroConceptos";

const RegistroConceptosContext =
    createContext(null);

export const RegistroConceptosProvider = ({
    children,
}) => {

  
    const value =
        useRegistroConceptos();

    return (
        <RegistroConceptosContext.Provider
            value={value}
        >
            {children}
        </RegistroConceptosContext.Provider>
    );
};

export const useRegistroConceptosContext =
    () => {
        const context =
            useContext(
                RegistroConceptosContext
            );

        if (!context) {
            throw new Error(
                "useRegistroConceptosContext debe utilizarse dentro de RegistroConceptosProvider"
            );
        }

        return context;
    };

export default RegistroConceptosContext;