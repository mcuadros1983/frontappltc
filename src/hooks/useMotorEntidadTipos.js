import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import motorConceptoApi
    from "../services/motorConceptoApi";

const normalizarListado = (
    response
) => {

    if (
        Array.isArray(response)
    ) {
        return response;
    }

    if (
        Array.isArray(response?.rows)
    ) {
        return response.rows;
    }

    if (
        Array.isArray(response?.items)
    ) {
        return response.items;
    }

    if (
        Array.isArray(response?.data)
    ) {
        return response.data;
    }

    return [];

};

const useMotorEntidadTipos = () => {

    const [
        entidadTipos,
        setEntidadTipos,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState(null);

    const cargar =
        useCallback(
            async () => {

                try {

                    setLoading(
                        true
                    );

                    setError(
                        null
                    );

                    const response =
                        await motorConceptoApi
                            .listarEntidadTipos();

                    setEntidadTipos(

                        normalizarListado(
                            response
                        )

                    );

                } catch (err) {

                    setError(
                        err
                    );

                    setEntidadTipos(
                        []
                    );

                } finally {

                    setLoading(
                        false
                    );

                }

            },
            []
        );

    useEffect(
        () => {

            cargar();

        },
        [
            cargar,
        ]
    );

    const buscarPorCodigo =
        useCallback(
            (
                codigo
            ) => {

                return entidadTipos.find(
                    item =>

                        String(
                            item.codigo
                        )
                            .toUpperCase()

                        ===

                        String(
                            codigo
                        )
                            .toUpperCase()

                );

            },
            [
                entidadTipos,
            ]
        );

    const buscarPorId =
        useCallback(
            (
                id
            ) => {

                return entidadTipos.find(
                    item =>

                        Number(
                            item.id
                        )

                        ===

                        Number(
                            id
                        )

                );

            },
            [
                entidadTipos,
            ]
        );

    const opciones =
        useMemo(
            () =>

                entidadTipos.map(
                    item => ({

                        value:
                            item.id,

                        label:
                            item.nombre,

                        codigo:
                            item.codigo,

                    })
                ),

            [
                entidadTipos,
            ]
        );

    return {

        entidadTipos,

        opciones,

        loading,

        error,

        recargar:
            cargar,

        buscarPorCodigo,

        buscarPorId,

    };

};

export default useMotorEntidadTipos;