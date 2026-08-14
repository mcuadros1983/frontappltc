import React, {
    useContext,
} from "react";

import {
    Alert,
    Container,
} from "react-bootstrap";

import RegistroConceptoReporteContext, {
    RegistroConceptoReporteProvider,
} from "../../context/RegistroConceptoReporteContext";

import RegistroConceptoReporteToolbar
    from "../../components/motorConceptos/registros/RegistroConceptoReporteToolbar";

import RegistroConceptoReporteFilters
    from "../../components/motorConceptos/registros/RegistroConceptoReporteFilters";

import RegistroConceptoReporteTable
    from "../../components/motorConceptos/registros/RegistroConceptoReporteTable";

import RegistroConceptoReportePagination
    from "../../components/motorConceptos/registros/RegistroConceptoReportePagination";

const RegistroConceptoReporteContent = () => {

    const {

        registros,

        conceptos,

        entidadTipos,

        sucursales,

        filters,

        pagination,

        loading,

        error,

        message,

        refresh,

        exportExcel,

        search,

        clearFilters,

        changeFilters,

        changePage,

        changeLimit,

    } = useContext(
        RegistroConceptoReporteContext
    );

    return (

        <Container fluid>

            <RegistroConceptoReporteToolbar

                loading={loading}

                onRefresh={refresh}

                onExport={exportExcel}

            />

            {

                error && (

                    <Alert
                        variant="danger"
                    >

                        {error}

                    </Alert>

                )

            }

            {

                message && (

                    <Alert
                        variant="success"
                    >

                        {message}

                    </Alert>

                )

            }

            <RegistroConceptoReporteFilters

                filters={filters}

                conceptos={conceptos}

                entidadTipos={entidadTipos}

                sucursales={sucursales}

                disabled={loading}

                onSearch={search}

                onClear={clearFilters}

                onChange={changeFilters}

            />

            <RegistroConceptoReporteTable

                registros={registros}

                loading={loading}

            />

            <RegistroConceptoReportePagination

                pagination={pagination}

                loading={loading}

                onChangePage={changePage}

                onChangeLimit={changeLimit}

            />

        </Container>

    );

};

const RegistroConceptoReportePage = () => (

    <RegistroConceptoReporteProvider>

        <RegistroConceptoReporteContent />

    </RegistroConceptoReporteProvider>

);

export default RegistroConceptoReportePage;