import React, { useMemo } from "react";
import {
  Modal,
  Button,
  Table,
  Alert,
} from "react-bootstrap";

export default function GastosDiaModal({
  show,
  onHide,
  fecha,
  egresos = [],
  proveedores = [],
  categorias = [],
  proyectos = [],
  onNuevoEgreso,
}) {

  const fmtMoney = (n) =>
    `$${Number(n || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const fechaFormateada = useMemo(() => {
    if (!fecha) return "";

    const [anio, mes, dia] = String(fecha).split("-");

    if (!anio || !mes || !dia) return fecha;

    return `${dia}/${mes}/${anio}`;
  }, [fecha]);

  const egresosDelDia = useMemo(() => {
    if (!fecha) return [];

    return (egresos || [])
      .filter(
        (m) =>
          String(m?.fecha || "") === String(fecha) &&
          String(m?.tipo || "").toLowerCase() === "egreso" &&
          !m?.anulado
      )
      .sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
  }, [egresos, fecha]);

  const proveedoresById = useMemo(() => {
    const map = new Map();

    (proveedores || []).forEach((p) => {
      map.set(Number(p.id), p);
    });

    return map;
  }, [proveedores]);

  const categoriasById = useMemo(() => {
    const map = new Map();

    (categorias || []).forEach((c) => {
      map.set(Number(c.id), c);
    });

    return map;
  }, [categorias]);

  const proyectosById = useMemo(() => {
    const map = new Map();

    (proyectos || []).forEach((p) => {
      map.set(Number(p.id), p);
    });

    return map;
  }, [proyectos]);

  const nombreProveedor = (mov) => {
    const embebido =
      mov?.proveedor?.razonsocial ||
      mov?.proveedor?.descripcion ||
      mov?.proveedor?.nombre;

    if (embebido) return embebido;

    const p = proveedoresById.get(
      Number(mov?.proveedor_id)
    );

    return (
      p?.razonsocial ||
      p?.descripcion ||
      p?.nombre ||
      (mov?.proveedor_id
        ? `Proveedor #${mov.proveedor_id}`
        : "—")
    );
  };

  const nombreCategoria = (mov) => {
    const embebida =
      mov?.categoriaegreso?.nombre ||
      mov?.categoriaegreso?.descripcion;

    if (embebida) return embebida;

    const c = categoriasById.get(
      Number(mov?.categoriaegreso_id)
    );

    return (
      c?.nombre ||
      c?.descripcion ||
      (mov?.categoriaegreso_id
        ? `Categoría #${mov.categoriaegreso_id}`
        : "—")
    );
  };

  const nombreProyecto = (mov) => {
    const embebido =
      mov?.proyecto?.descripcion ||
      mov?.proyecto?.nombre;

    if (embebido) return embebido;

    const p = proyectosById.get(
      Number(mov?.proyecto_id)
    );

    return (
      p?.descripcion ||
      p?.nombre ||
      (mov?.proyecto_id
        ? `Proyecto #${mov.proyecto_id}`
        : "—")
    );
  };

  const total = useMemo(
    () =>
      egresosDelDia.reduce(
        (acc, mov) => acc + Number(mov?.monto || 0),
        0
      ),
    [egresosDelDia]
  );

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Gastos del día {fechaFormateada}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {egresosDelDia.length === 0 ? (
          <Alert variant="light" className="mb-0">
            No hay gastos registrados para esta fecha.
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table
              striped
              bordered
              hover
              size="sm"
              className="mb-0"
            >
              <thead>
                <tr>
                  <th style={{ width: 80 }}>
                    #
                  </th>

                  <th>
                    Descripción
                  </th>

                  <th>
                    Proveedor / Entidad
                  </th>

                  <th>
                    Categoría
                  </th>

                  <th>
                    Proyecto
                  </th>

                  <th
                    className="text-end"
                    style={{ width: 150 }}
                  >
                    Importe
                  </th>
                </tr>
              </thead>

              <tbody>
                {egresosDelDia.map((mov) => (
                  <tr key={mov.id}>
                    <td>
                      {mov.id}
                    </td>

                    <td>
                      {mov.descripcion || "—"}
                    </td>

                    <td>
                      {nombreProveedor(mov)}
                    </td>

                    <td>
                      {nombreCategoria(mov)}
                    </td>

                    <td>
                      {nombreProyecto(mov)}
                    </td>

                    <td className="text-end fw-semibold">
                      {fmtMoney(mov.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <td
                    colSpan={5}
                    className="text-end"
                  >
                    <strong>
                      Total gastos del día
                    </strong>
                  </td>

                  <td className="text-end">
                    <strong>
                      {fmtMoney(total)}
                    </strong>
                  </td>
                </tr>
              </tfoot>
            </Table>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="outline-secondary"
          onClick={onHide}
        >
          Cerrar
        </Button>

        <Button
          variant="danger"
          onClick={onNuevoEgreso}
        >
          Nuevo Egreso
        </Button>
      </Modal.Footer>
    </Modal>
  );
}