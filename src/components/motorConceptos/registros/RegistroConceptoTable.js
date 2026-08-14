import React from "react";

import {
  useContext,
  useMemo,
} from "react";

import Contexts
  from "../../../context/Contexts";

import {
  Badge,
  Button,
  ButtonGroup,
  Spinner,
  Table,
} from "react-bootstrap";

import {
  formatDate,
  formatDateTime,
  getConceptoNombre,
  getEntidadDescripcion,
  getEntidadTipoNombre,
  getEstadoVariant,
  getVersionNumero,
} from "../../../utils/motorConceptos/registroConceptoHelpers";

const RegistroConceptoTable = ({
  registros,
  loading,
  canUpdate,
  canDelete,
  onEdit,
  onHistory,
  onDelete,
  onSort,
}) => {

  const {
    empleados = [],
    sucursales = [],
    empresasTabla = [],
  } = useContext(
    Contexts.DataContext
  );

  const empleadosMap =
    useMemo(() => {

      const map =
        new Map();

      empleados.forEach(emp => {

        const id =
          emp?.empleado?.id ??
          emp?.id;

        if (!id) {
          return;
        }

        const apellido =
          emp?.clientePersona?.apellido ||
          emp?.empleado?.apellido ||
          "";

        const nombre =
          emp?.clientePersona?.nombre ||
          emp?.empleado?.nombre ||
          "";

        map.set(
          Number(id),
          `${apellido} ${nombre}`.trim()
        );

      });

      return map;

    }, [
      empleados,
    ]);

  const sucursalesMap =
    useMemo(() => {

      const map =
        new Map();

      sucursales.forEach(item => {

        map.set(
          Number(item.id),
          item.nombre
        );

      });

      return map;

    }, [
      sucursales,
    ]);

  const empresasMap =
    useMemo(() => {

      const map =
        new Map();

      empresasTabla.forEach(item => {

        map.set(
          Number(item.id),
          item.descripcion
        );

      });

      return map;

    }, [
      empresasTabla,
    ]);

  const getEntidadNombre = (
    registro
  ) => {

    const tipo =
      registro?.entidadTipo?.codigo;

    const id =
      Number(
        registro?.entidad_id
      );

    switch (tipo) {

      case "EMPLEADO":

        return (
          empleadosMap.get(id) ||
          `Empleado #${id}`
        );

      case "SUCURSAL":

        return (
          sucursalesMap.get(id) ||
          `Sucursal #${id}`
        );

      case "EMPRESA":

        return (
          empresasMap.get(id) ||
          `Empresa #${id}`
        );

      default:

        return `Entidad #${id}`;

    }

  };

  if (loading) {
    return (
      <div className="py-5 text-center">
        <Spinner
          animation="border"
          size="sm"
          className="me-2"
        />

        Cargando registros...
      </div>
    );
  }

  if (
    !registros ||
    registros.length === 0
  ) {
    return (
      <div className="py-5 text-center text-muted">
        No se encontraron registros.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table
        hover
        responsive
        className="align-middle mb-0"
      >
        <thead>
          <tr>
            <th>
              <Button
                variant="link"
                className="p-0 text-decoration-none"
                onClick={
                  () =>
                    onSort(
                      "id"
                    )
                }
              >
                ID
              </Button>
            </th>

            <th>
              Concepto
            </th>

            <th>
              Entidad
            </th>

            <th>
              Estado
            </th>

            <th>
              Versión
            </th>

            <th>
              Sucursal
            </th>

            <th>
              <Button
                variant="link"
                className="p-0 text-decoration-none"
                onClick={
                  () =>
                    onSort(
                      "fecha_vencimiento"
                    )
                }
              >
                Vencimiento
              </Button>
            </th>

            <th>
              <Button
                variant="link"
                className="p-0 text-decoration-none"
                onClick={
                  () =>
                    onSort(
                      "ultimo_movimiento"
                    )
                }
              >
                Último movimiento
              </Button>
            </th>

            <th className="text-end">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody>
          {
            registros.map(
              (registro) => (
                <tr
                  key={
                    registro.id
                  }
                >
                  <td>
                    {registro.id}
                  </td>

                  <td>
                    <strong>
                      {
                        getConceptoNombre(
                          registro
                        )
                      }
                    </strong>
                  </td>

                  <td>
                    <div>
                      {
                        getEntidadNombre(
                          registro
                        )
                      }
                    </div>

                    <small className="text-muted">
                      {
                        getEntidadTipoNombre(
                          registro
                        )
                      }
                    </small>
                  </td>

                  <td>
                    <Badge
                      bg={
                        getEstadoVariant(
                          registro.estado_visual ||
                          registro.estado
                        )
                      }
                    >
                      {
                        registro.estado_visual ||
                        registro.estado
                      }
                    </Badge>
                  </td>

                  <td>
                    {
                      getVersionNumero(
                        registro
                      )
                    }
                  </td>

                  <td>
                    {
                      registro.sucursal?.nombre ||
                      registro.sucursal?.descripcion ||
                      registro.sucursal_id ||
                      "-"
                    }
                  </td>

                  <td>
                    {
                      formatDate(
                        registro.fecha_vencimiento
                      )
                    }

                    {
                      registro.dias_restantes !== null &&
                      (
                        <div className="small text-muted">

                          {
                            registro.dias_restantes >= 0
                              ? `${registro.dias_restantes} día(s)`
                              : `${Math.abs(registro.dias_restantes)} día(s) vencido`
                          }

                        </div>
                      )
                    }
                  </td>

                  <td>
                    {
                      formatDateTime(
                        registro.ultimo_movimiento
                      )
                    }
                  </td>

                  <td className="text-end">
                    <ButtonGroup size="sm">
                      {
                        canUpdate &&
                        !registro.esPendiente && (
                          <Button
                            variant="outline-primary"
                            onClick={
                              () =>
                                onEdit(
                                  registro
                                )
                            }
                          >
                            Editar
                          </Button>
                        )
                      }

                      {/* <Button
                        variant="outline-secondary"
                        onClick={
                          () =>
                            onHistory(
                              registro
                            )
                        }
                      >
                        Historial
                      </Button> */}

                      {
                        canDelete &&
                        !registro.esPendiente && (
                          <Button
                            variant="outline-danger"
                            onClick={
                              () =>
                                onDelete(
                                  registro
                                )
                            }
                          >
                            Eliminar
                          </Button>
                        )
                      }
                    </ButtonGroup>
                  </td>
                </tr>
              )
            )
          }
        </tbody>
      </Table>
    </div>
  );
};

export default RegistroConceptoTable; 