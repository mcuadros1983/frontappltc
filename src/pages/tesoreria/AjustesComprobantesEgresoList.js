import {
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from "react";

import {
  Table,
  Container,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Spinner,
} from "react-bootstrap";

import Contexts from "../../context/Contexts";

const apiUrl =
  process.env.REACT_APP_API_URL;


export default function AjustesComprobantesEgresoList() {

  const dataContext =
    useContext(Contexts.DataContext);

  const {
    proveedoresTabla = [],
    empresaSeleccionada,
  } = dataContext || {};


  /*
   * ============================================================
   * ESTADO
   * ============================================================
   */

  const [ajustes, setAjustes] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [loadError, setLoadError] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);

  const [deleteError, setDeleteError] =
    useState(null);


  /*
   * ============================================================
   * FILTROS
   * ============================================================
   */

  const [proveedorIdFiltro, setProveedorIdFiltro] =
    useState("");

  const [tipoFiltro, setTipoFiltro] =
    useState("");

  const [comprobanteFiltro, setComprobanteFiltro] =
    useState("");

  const [fechaDesde, setFechaDesde] =
    useState("");

  const [fechaHasta, setFechaHasta] =
    useState("");


  /*
   * ============================================================
   * HELPERS
   * ============================================================
   */

  const fmtMoney = (n) =>
    `$${Number(n || 0).toLocaleString(
      "es-AR",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;


  const nombreProveedor = (ajuste) => {

    const proveedorId =
      ajuste?.proveedor_id;

    if (!proveedorId) {
      return "";
    }

    const proveedor =
      proveedoresTabla.find(
        (p) =>
          Number(p.id) ===
          Number(proveedorId)
      );

    if (!proveedor) {
      return `Proveedor #${proveedorId}`;
    }

    return (
      proveedor.razonsocial ||
      proveedor.nombre ||
      `Proveedor #${proveedor.id}`
    );
  };


  /*
   * ============================================================
   * CARGAR AJUSTES
   * ============================================================
   */

  const loadAjustes =
    useCallback(async () => {

      try {

        setLoading(true);
        setLoadError(null);

        const qs =
          new URLSearchParams();

        /*
         * Si hay empresa seleccionada,
         * filtramos desde backend.
         */

        if (empresaSeleccionada?.id) {

          qs.set(
            "empresa_id",
            String(
              empresaSeleccionada.id
            )
          );
        }


        /*
         * Proveedor también está soportado
         * actualmente por backend.
         */

        if (proveedorIdFiltro) {

          qs.set(
            "proveedor_id",
            String(
              proveedorIdFiltro
            )
          );
        }


        qs.set(
          "includeAnulados",
          "0"
        );


        const res =
          await fetch(
            `${apiUrl}/ajustes-comprobante-egreso?${qs.toString()}`,
            {
              credentials:
                "include",
            }
          );


        const data =
          await res
            .json()
            .catch(() => ([]));


        if (!res.ok) {

          throw new Error(
            data?.error ||
            "No se pudieron cargar los ajustes"
          );
        }


        const list =
          Array.isArray(data)
            ? data
            : [];


        list.sort(
          (a, b) => {

            if (
              a.fecha ===
              b.fecha
            ) {

              return (
                Number(a.id) -
                Number(b.id)
              );
            }

            return String(
              a.fecha || ""
            ).localeCompare(
              String(
                b.fecha || ""
              )
            );
          }
        );


        setAjustes(
          list
        );

      } catch (error) {

        console.error(
          "❌ Error al cargar ajustes:",
          error
        );

        setAjustes([]);

        setLoadError(
          error.message ||
          "No se pudieron cargar los ajustes."
        );

      } finally {

        setLoading(false);

      }

    }, [
      empresaSeleccionada?.id,
      proveedorIdFiltro,
    ]);


  useEffect(() => {

    loadAjustes();

  }, [loadAjustes]);


  /*
   * ============================================================
   * FILTROS LOCALES
   * ============================================================
   */

  const ajustesFiltrados =
    useMemo(() => {

      let list =
        [...ajustes];


      /*
       * Tipo
       */

      if (tipoFiltro) {

        list =
          list.filter(
            (a) =>
              String(
                a.tipo || ""
              ).toLowerCase() ===
              tipoFiltro
          );
      }


      /*
       * Comprobante
       *
       * Permite buscar por ID.
       */

      if (
        String(
          comprobanteFiltro || ""
        ).trim()
      ) {

        const texto =
          String(
            comprobanteFiltro
          ).trim();

        list =
          list.filter(
            (a) =>
              String(
                a.comprobanteegreso_id ||
                ""
              ).includes(
                texto
              )
          );
      }


      /*
       * Fechas
       */

      if (fechaDesde) {

        list =
          list.filter(
            (a) =>
              String(
                a.fecha || ""
              ) >=
              fechaDesde
          );
      }


      if (fechaHasta) {

        list =
          list.filter(
            (a) =>
              String(
                a.fecha || ""
              ) <=
              fechaHasta
          );
      }


      return list;

    }, [
      ajustes,
      tipoFiltro,
      comprobanteFiltro,
      fechaDesde,
      fechaHasta,
    ]);


  /*
   * ============================================================
   * TOTALES
   * ============================================================
   */

  const totales =
    useMemo(() => {

      let aumenta = 0;
      let disminuye = 0;

      for (
        const ajuste of
        ajustesFiltrados
      ) {

        const importe =
          Number(
            ajuste.importe || 0
          );

        const tipo =
          String(
            ajuste.tipo || ""
          ).toLowerCase();


        if (
          tipo === "aumenta"
        ) {

          aumenta +=
            importe;

        } else if (
          tipo === "disminuye"
        ) {

          disminuye +=
            importe;
        }
      }


      return {
        aumenta,
        disminuye,

        neto:
          aumenta -
          disminuye,
      };

    }, [
      ajustesFiltrados,
    ]);


  /*
   * ============================================================
   * LIMPIAR FILTROS
   * ============================================================
   */

  const limpiarFiltros = () => {

    setProveedorIdFiltro("");
    setTipoFiltro("");
    setComprobanteFiltro("");
    setFechaDesde("");
    setFechaHasta("");

  };


  /*
   * ============================================================
   * ELIMINAR
   * ============================================================
   */

  const eliminarAjuste =
    async (ajuste) => {

      if (
        !ajuste?.id
      ) {
        return;
      }


      const signo =
        String(
          ajuste.tipo
        ).toLowerCase() ===
        "aumenta"
          ? "+"
          : "-";


      const confirmar =
        window.confirm(
          `¿Eliminar el ajuste #${ajuste.id}?\n\n` +
          `Comprobante: #${ajuste.comprobanteegreso_id}\n` +
          `Tipo: ${ajuste.tipo}\n` +
          `Concepto: ${ajuste.concepto || "-"}\n` +
          `Importe: ${signo}${fmtMoney(ajuste.importe)}\n\n` +
          `La situación financiera del comprobante y la cuenta corriente del proveedor serán recalculadas.`
        );


      if (!confirmar) {
        return;
      }


      try {

        setDeleteError(null);

        setDeletingId(
          ajuste.id
        );


        const res =
          await fetch(
            `${apiUrl}/ajustes-comprobante-egreso/${ajuste.id}`,
            {
              method:
                "DELETE",

              credentials:
                "include",
            }
          );


        const data =
          await res
            .json()
            .catch(() => ({}));


        if (!res.ok) {

          throw new Error(
            data?.error ||
            "No se pudo eliminar el ajuste"
          );
        }


        /*
         * Recargamos desde backend.
         *
         * No modificamos solamente el array local
         * porque la eliminación produce efectos
         * financieros relacionados.
         */

        await loadAjustes();


      } catch (error) {

        console.error(
          "❌ Error eliminando ajuste:",
          error
        );


        setDeleteError(
          error.message ||
          "No se pudo eliminar el ajuste."
        );

      } finally {

        setDeletingId(
          null
        );

      }
    };


  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (

    <Container>

      <h1 className="my-list-title dark-text">
        Ajustes de Comprobantes
      </h1>


      {loadError && (

        <Alert
          variant="danger"
          className="py-2"
        >
          {loadError}
        </Alert>

      )}


      {deleteError && (

        <Alert
          variant="danger"
          className="py-2"
        >
          {deleteError}
        </Alert>

      )}


      {/* =====================================================
          FILTROS
          ===================================================== */}

      <Form className="mb-3">

        <Row className="g-2">


          <Col md={3}>

            <Form.Label>
              Proveedor
            </Form.Label>

            <Form.Select
              value={
                proveedorIdFiltro
              }
              onChange={(e) =>
                setProveedorIdFiltro(
                  e.target.value
                )
              }
              className="form-control my-input"
            >

              <option value="">
                Todos
              </option>

              {proveedoresTabla.map(
                (p) => (

                  <option
                    key={p.id}
                    value={p.id}
                  >
                    {
                      p.razonsocial ||
                      p.nombre ||
                      `Proveedor ${p.id}`
                    }
                  </option>

                )
              )}

            </Form.Select>

          </Col>


          <Col md={2}>

            <Form.Label>
              Tipo
            </Form.Label>

            <Form.Select
              value={
                tipoFiltro
              }
              onChange={(e) =>
                setTipoFiltro(
                  e.target.value
                )
              }
              className="form-control my-input"
            >

              <option value="">
                Todos
              </option>

              <option value="aumenta">
                Aumenta
              </option>

              <option value="disminuye">
                Disminuye
              </option>

            </Form.Select>

          </Col>


          <Col md={2}>

            <Form.Label>
              Comprobante
            </Form.Label>

            <Form.Control
              value={
                comprobanteFiltro
              }
              onChange={(e) =>
                setComprobanteFiltro(
                  e.target.value
                )
              }
              placeholder="ID"
            />

          </Col>


          <Col md={2}>

            <Form.Label>
              Fecha desde
            </Form.Label>

            <Form.Control
              type="date"
              value={
                fechaDesde
              }
              onChange={(e) =>
                setFechaDesde(
                  e.target.value
                )
              }
            />

          </Col>


          <Col md={2}>

            <Form.Label>
              Fecha hasta
            </Form.Label>

            <Form.Control
              type="date"
              value={
                fechaHasta
              }
              onChange={(e) =>
                setFechaHasta(
                  e.target.value
                )
              }
            />

          </Col>


          <Col
            md="auto"
            className="d-flex align-items-end"
          >

            <Button
              variant="outline-dark"
              onClick={
                limpiarFiltros
              }
              disabled={
                loading
              }
            >
              Limpiar
            </Button>

          </Col>

        </Row>

      </Form>


      {/* =====================================================
          RESUMEN
          ===================================================== */}

      <div className="mb-2 text-muted">

        {ajustesFiltrados.length}
        {" "}ajuste(s)

        {" · "}

        Aumenta:{" "}
        <strong>
          {fmtMoney(
            totales.aumenta
          )}
        </strong>

        {" · "}

        Disminuye:{" "}
        <strong>
          {fmtMoney(
            totales.disminuye
          )}
        </strong>

        {" · "}

        Neto:{" "}
        <strong>
          {fmtMoney(
            totales.neto
          )}
        </strong>

      </div>


      {/* =====================================================
          TABLA
          ===================================================== */}

      <Table
        striped
        bordered
        hover
      >

        <thead>

          <tr>

            <th>#</th>

            <th>
              Fecha
            </th>

            <th>
              Comprobante
            </th>

            <th>
              Proveedor
            </th>

            <th>
              Tipo
            </th>

            <th>
              Concepto
            </th>

            <th>
              Detalle
            </th>

            <th className="text-end">
              Importe
            </th>

            <th>
              Acciones
            </th>

          </tr>

        </thead>


        <tbody>


          {loading && (

            <tr>

              <td
                colSpan={9}
                className="text-center text-muted"
              >

                <Spinner
                  size="sm"
                  animation="border"
                  className="me-2"
                />

                Cargando ajustes...

              </td>

            </tr>

          )}


          {!loading &&
            ajustesFiltrados.map(
              (ajuste) => {

                const aumenta =
                  String(
                    ajuste.tipo || ""
                  ).toLowerCase() ===
                  "aumenta";


                return (

                  <tr
                    key={
                      ajuste.id
                    }
                  >

                    <td>
                      {ajuste.id}
                    </td>

                    <td>
                      {ajuste.fecha || ""}
                    </td>

                    <td>
                      #
                      {
                        ajuste.comprobanteegreso_id
                      }
                    </td>

                    <td>
                      {
                        nombreProveedor(
                          ajuste
                        )
                      }
                    </td>

                    <td>

                      {aumenta
                        ? "Aumenta"
                        : "Disminuye"}

                    </td>

                    <td>
                      {
                        ajuste.concepto ||
                        ""
                      }
                    </td>

                    <td>
                      {
                        ajuste.detalle ||
                        ""
                      }
                    </td>

                    <td className="text-end">

                      {aumenta
                        ? "+"
                        : "-"}

                      {
                        fmtMoney(
                          ajuste.importe
                        )
                      }

                    </td>

                    <td>

                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() =>
                          eliminarAjuste(
                            ajuste
                          )
                        }
                        disabled={
                          deletingId ===
                          ajuste.id
                        }
                        title="Eliminar ajuste"
                      >

                        {deletingId ===
                        ajuste.id ? (

                          <Spinner
                            size="sm"
                            animation="border"
                          />

                        ) : (

                          "Eliminar"

                        )}

                      </Button>

                    </td>

                  </tr>

                );

              }
            )}


          {!loading &&
            ajustesFiltrados.length ===
              0 && (

              <tr>

                <td
                  colSpan={9}
                  className="text-center text-muted"
                >

                  No hay ajustes para mostrar.

                </td>

              </tr>

            )}

        </tbody>


        <tfoot>

          <tr>

            <td
              colSpan={7}
              className="text-end"
            >
              <strong>
                Aumentos
              </strong>
            </td>

            <td
              className="text-end"
            >
              <strong>
                {fmtMoney(
                  totales.aumenta
                )}
              </strong>
            </td>

            <td />

          </tr>


          <tr>

            <td
              colSpan={7}
              className="text-end"
            >
              <strong>
                Disminuciones
              </strong>
            </td>

            <td
              className="text-end"
            >
              <strong>
                {fmtMoney(
                  totales.disminuye
                )}
              </strong>
            </td>

            <td />

          </tr>


          <tr>

            <td
              colSpan={7}
              className="text-end"
            >
              <strong>
                Efecto neto
              </strong>
            </td>

            <td
              className="text-end"
            >
              <strong>
                {fmtMoney(
                  totales.neto
                )}
              </strong>
            </td>

            <td />

          </tr>

        </tfoot>

      </Table>

    </Container>

  );
}