import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Badge,
  Button,
  Col,
  Container,
  Form,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";

import Contexts
  from "../../context/Contexts";

import NuevoPagoProgramado
  from "./NuevoPagoProgramado";


const apiUrl =
  process.env.REACT_APP_API_URL;


const fmtMoney =
  (value) =>
    Number(value || 0)
      .toLocaleString(
        "es-AR",
        {
          style:
            "currency",

          currency:
            "ARS",

          minimumFractionDigits:
            2,
        }
      );


export default function PagosProgramadosPage() {

  const data =
    useContext(Contexts.DataContext) || {};


  const {
    empresaSeleccionada,

    proveedoresTabla = [],

    categoriasEgreso = [],

    bancosTabla = [],
  } = data;


  const empresaId =
    empresaSeleccionada?.id || "";


  // ==========================================================
  // ESTADO
  // ==========================================================

  const [
    items,
    setItems,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState(null);


  const [
    showNuevo,
    setShowNuevo,
  ] = useState(false);


  // ==========================================================
  // FILTROS
  // ==========================================================

  const [
    proveedorFiltro,
    setProveedorFiltro,
  ] = useState("");


  const [
    tipoFiltro,
    setTipoFiltro,
  ] = useState("");


  const [
    medioFiltro,
    setMedioFiltro,
  ] = useState("");


  const [
    estadoFiltro,
    setEstadoFiltro,
  ] = useState("pendiente");


  const [
    fechaDesde,
    setFechaDesde,
  ] = useState("");


  const [
    fechaHasta,
    setFechaHasta,
  ] = useState("");


  // ==========================================================
  // MAPAS
  // ==========================================================

  const proveedorById =
    useMemo(() => {

      const map =
        new Map();

      (proveedoresTabla || [])
        .forEach(
          (p) =>
            map.set(
              Number(p.id),
              p
            )
        );

      return map;

    }, [proveedoresTabla]);


  const categoriaById =
    useMemo(() => {

      const map =
        new Map();

      (categoriasEgreso || [])
        .forEach(
          (c) =>
            map.set(
              Number(c.id),
              c
            )
        );

      return map;

    }, [categoriasEgreso]);


  const bancoById =
    useMemo(() => {

      const map =
        new Map();

      (bancosTabla || [])
        .forEach(
          (b) =>
            map.set(
              Number(b.id),
              b
            )
        );

      return map;

    }, [bancosTabla]);


  // ==========================================================
  // CARGAR
  // ==========================================================

  const loadItems =
    useCallback(
      async () => {

        try {

          setLoading(true);
          setError(null);


          const qs =
            new URLSearchParams();


          if (empresaId) {

            qs.set(
              "empresa_id",
              String(empresaId)
            );
          }


          if (proveedorFiltro) {

            qs.set(
              "proveedor_id",
              proveedorFiltro
            );
          }


          if (tipoFiltro) {

            qs.set(
              "tipo",
              tipoFiltro
            );
          }


          if (medioFiltro) {

            qs.set(
              "medio",
              medioFiltro
            );
          }


          if (estadoFiltro) {

            qs.set(
              "estado",
              estadoFiltro
            );
          }


          if (fechaDesde) {

            qs.set(
              "desde",
              fechaDesde
            );
          }


          if (fechaHasta) {

            qs.set(
              "hasta",
              fechaHasta
            );
          }


          const res =
            await fetch(
              `${apiUrl}/pagos-programados?${qs.toString()}`,
              {
                credentials:
                  "include",
              }
            );


          const json =
            await res
              .json()
              .catch(
                () => []
              );


          if (!res.ok) {

            throw new Error(
              json?.error ||
              "No se pudieron obtener los pagos programados"
            );
          }


          setItems(
            Array.isArray(json)
              ? json
              : []
          );

        } catch (e) {

          setItems([]);

          setError(
            e.message ||
            "Error cargando pagos programados"
          );

        } finally {

          setLoading(
            false
          );
        }
      },

      [
        empresaId,
        proveedorFiltro,
        tipoFiltro,
        medioFiltro,
        estadoFiltro,
        fechaDesde,
        fechaHasta,
      ]
    );


  useEffect(() => {

    loadItems();

  }, [loadItems]);


  // ==========================================================
  // NUEVO
  // ==========================================================

  const onCreated =
    () => {

      setShowNuevo(
        false
      );

      loadItems();
    };


  // ==========================================================
  // ELIMINAR PENDIENTE
  // ==========================================================

  const eliminar =
    async (pago) => {

      if (
        pago.estado !==
        "pendiente"
      ) {
        return;
      }


      const texto =
        pago.tipo === "anticipo"
          ? "¿Eliminar este anticipo programado? También se anulará el anticipo correspondiente en la cuenta corriente."
          : "¿Eliminar este egreso programado?";


      if (
        !window.confirm(
          texto
        )
      ) {
        return;
      }


      try {

        setError(null);


        const res =
          await fetch(
            `${apiUrl}/pagos-programados/${pago.id}`,
            {
              method:
                "DELETE",

              credentials:
                "include",
            }
          );


        const json =
          await res
            .json()
            .catch(
              () => ({})
            );


        if (!res.ok) {

          throw new Error(
            json?.error ||
            "No se pudo eliminar el pago programado"
          );
        }


        await loadItems();

      } catch (e) {

        setError(
          e.message ||
          "Error eliminando pago programado"
        );
      }
    };


  // ==========================================================
  // PRESENTACIÓN
  // ==========================================================

  const nombreProveedor =
    (id) => {

      const p =
        proveedorById.get(
          Number(id)
        );

      return (
        p?.razonsocial ||
        p?.nombre ||
        (
          id
            ? `Proveedor #${id}`
            : "-"
        )
      );
    };


  const nombreCategoria =
    (id) => {

      const c =
        categoriaById.get(
          Number(id)
        );

      return (
        c?.nombre ||
        (
          id
            ? `Categoría #${id}`
            : "-"
        )
      );
    };


  const medioDescripcion =
    (item) => {

      if (
        item.medio ===
        "caja"
      ) {
        return "Caja";
      }


      if (
        item.medio ===
        "banco"
      ) {

        const banco =
          bancoById.get(
            Number(
              item.banco_id
            )
          );


        const nombre =
          banco?.nombre ||
          banco?.descripcion ||
          banco?.alias ||
          (
            item.banco_id
              ? `Banco #${item.banco_id}`
              : "Banco"
          );


        return `Transferencia - ${nombre}`;
      }


      return (
        item.medio ||
        "-"
      );
    };


  const estadoColor =
    (estado) => {

      switch (
        String(
          estado || ""
        ).toLowerCase()
      ) {

        case "pendiente":
          return "warning";

        case "acreditado":
          return "success";

        case "anulado":
          return "secondary";

        default:
          return "secondary";
      }
    };


  const totalVisible =
    useMemo(
      () =>
        items.reduce(
          (acc, p) =>
            acc +
            Number(
              p.monto || 0
            ),
          0
        ),

      [items]
    );


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <Container>

      <h1 className="my-list-title dark-text">
        Pagos Programados
      </h1>


      {error && (

        <Alert
          variant="danger"
          className="py-2"
        >
          {error}
        </Alert>

      )}


      <div className="mb-3">

        <Button
          className="mx-2"
          variant="success"
          onClick={() =>
            setShowNuevo(
              true
            )
          }
          disabled={
            !empresaId
          }
        >
          Nuevo Pago Programado
        </Button>

      </div>


      {!empresaId && (

        <Alert
          variant="info"
          className="py-2"
        >
          Seleccioná una empresa para registrar nuevos pagos programados.
        </Alert>

      )}


      {/* ======================================================
          FILTROS
         ====================================================== */}

      <Form className="mb-3">

        <Row className="g-2">

          <Col md={3}>

            <Form.Label>
              Proveedor
            </Form.Label>

            <Form.Select
              value={
                proveedorFiltro
              }
              onChange={(e) =>
                setProveedorFiltro(
                  e.target.value
                )
              }
              className="form-control my-input"
            >

              <option value="">
                Todos
              </option>

              {(proveedoresTabla || [])
                .map(
                  (p) => (

                    <option
                      key={p.id}
                      value={p.id}
                    >
                      {p.razonsocial ||
                        p.nombre ||
                        `Proveedor ${p.id}`}
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

              <option value="egreso_varios">
                Egresos varios
              </option>

              <option value="anticipo">
                Anticipo proveedor
              </option>

            </Form.Select>

          </Col>


          <Col md={2}>

            <Form.Label>
              Medio
            </Form.Label>

            <Form.Select
              value={
                medioFiltro
              }
              onChange={(e) =>
                setMedioFiltro(
                  e.target.value
                )
              }
              className="form-control my-input"
            >

              <option value="">
                Todos
              </option>

              <option value="banco">
                Transferencia / Banco
              </option>

              <option value="caja">
                Caja
              </option>

            </Form.Select>

          </Col>


          <Col md={2}>

            <Form.Label>
              Estado
            </Form.Label>

            <Form.Select
              value={
                estadoFiltro
              }
              onChange={(e) =>
                setEstadoFiltro(
                  e.target.value
                )
              }
              className="form-control my-input"
            >

              <option value="">
                Todos
              </option>

              <option value="pendiente">
                Pendiente
              </option>

              <option value="acreditado">
                Acreditado
              </option>

              <option value="anulado">
                Anulado
              </option>

            </Form.Select>

          </Col>


          <Col md={3}>

            <Form.Label>
              Desde
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


          <Col md={3}>

            <Form.Label>
              Hasta
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
              variant="outline-secondary"
              onClick={
                loadItems
              }
              disabled={
                loading
              }
            >

              {loading ? (
                <Spinner
                  animation="border"
                  size="sm"
                />
              ) : (
                "Actualizar"
              )}

            </Button>

          </Col>

        </Row>

      </Form>


      {/* ======================================================
          TABLA
         ====================================================== */}

      <Table
        striped
        bordered
        hover
        responsive
      >

        <thead>

          <tr>

            <th>#</th>

            <th>
              Fecha programada
            </th>

            <th>
              Tipo
            </th>

            <th>
              Proveedor / Entidad
            </th>

            <th>
              Descripción
            </th>

            <th>
              Categoría
            </th>

            <th>
              Medio previsto
            </th>

            <th className="text-end">
              Importe
            </th>

            <th>
              Estado
            </th>

            <th className="text-center">
              Acciones
            </th>

          </tr>

        </thead>


        <tbody>

          {loading && (

            <tr>

              <td
                colSpan={10}
                className="text-center"
              >

                <Spinner
                  animation="border"
                  size="sm"
                  className="me-2"
                />

                Cargando…

              </td>

            </tr>

          )}


          {!loading &&
            items.length === 0 && (

              <tr>

                <td
                  colSpan={10}
                  className="text-center text-muted"
                >
                  Sin pagos programados
                </td>

              </tr>

            )}


          {!loading &&
            items.map(
              (pago) => (

                <tr
                  key={pago.id}
                >

                  <td>
                    {pago.id}
                  </td>


                  <td>
                    {pago.fecha_programada ||
                      "-"}
                  </td>


                  <td>
                    {pago.tipo ===
                    "anticipo"
                      ? "Anticipo proveedor"
                      : "Egreso varios"}
                  </td>


                  <td>
                    {nombreProveedor(
                      pago.proveedor_id
                    )}
                  </td>


                  <td>
                    {pago.descripcion ||
                      "-"}
                  </td>


                  <td>
                    {nombreCategoria(
                      pago.categoriaegreso_id
                    )}
                  </td>


                  <td>
                    {medioDescripcion(
                      pago
                    )}
                  </td>


                  <td className="text-end">
                    {fmtMoney(
                      pago.monto
                    )}
                  </td>


                  <td>

                    <Badge
                      bg={
                        estadoColor(
                          pago.estado
                        )
                      }
                    >
                      {pago.estado ||
                        "-"}
                    </Badge>

                  </td>


                  <td className="text-center">

                    {pago.estado ===
                    "pendiente" ? (

                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() =>
                          eliminar(
                            pago
                          )
                        }
                      >
                        Eliminar
                      </Button>

                    ) : (
                      "-"
                    )}

                  </td>

                </tr>

              )
            )}

        </tbody>


        {items.length > 0 && (

          <tfoot>

            <tr>

              <td
                colSpan={7}
              >
                <strong>
                  Total
                </strong>
              </td>

              <td className="text-end">

                <strong>
                  {fmtMoney(
                    totalVisible
                  )}
                </strong>

              </td>

              <td
                colSpan={2}
              />

            </tr>

          </tfoot>

        )}

      </Table>


      {/* ======================================================
          MODAL
         ====================================================== */}

      <NuevoPagoProgramado
        show={
          showNuevo
        }
        onHide={() =>
          setShowNuevo(
            false
          )
        }
        onCreated={
          onCreated
        }
      />

    </Container>
  );
}