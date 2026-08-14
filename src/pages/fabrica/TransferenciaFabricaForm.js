import React, { useContext, useMemo, useState } from "react";
import Select from "react-select";

import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Card,
  Alert,
} from "react-bootstrap";

import { useNavigate } from "react-router-dom";

import Contexts from "../../context/Contexts";
import { useSecurity } from "../../security/SecurityContext";
import { transferenciaFabricaApi } from "../../services/transferenciaFabricaApi";

export default function TransferenciaFabricaForm() {
  const navigate = useNavigate();

  const dataContext = useContext(Contexts.DataContext);
  const { user } = useSecurity();

  const sucursales = dataContext?.sucursales || [];
  const articulosTabla = dataContext?.articulosTabla || [];

  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [sucursaldestinoId, setSucursaldestinoId] = useState("");
  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState("");
  const [detalles, setDetalles] = useState([]);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const articuloOptions = useMemo(() => {
    return articulosTabla.map((a) => ({
      value: a.id,
      label: `${a.codigobarra || ""} - ${(a.descripcion || "")
        .replace(/^-+\s*/, "")
        .trim()}`,
      articulo: a,
    }));
  }, [articulosTabla]);

  const sucursalOptions = useMemo(() => {
    return sucursales.map((s) => ({
      value: s.id,
      label: s.nombre || s.descripcion || s.sucursal || `Sucursal ${s.id}`,
    }));
  }, [sucursales]);

  const agregarDetalle = () => {
    setError("");

    if (!articuloSeleccionado) {
      setError("Debe seleccionar un artículo.");
      return;
    }

    if (!cantidad || Number(cantidad) <= 0) {
      setError("Debe ingresar una cantidad válida.");
      return;
    }

    const articulo = articuloSeleccionado.articulo;

    const yaExiste = detalles.some(
      (item) => Number(item.articulo_id) === Number(articulo.id)
    );

    if (yaExiste) {
      setError("Ese artículo ya fue agregado a la transferencia.");
      return;
    }

    setDetalles([
      ...detalles,
      {
        articulo_id: articulo.id,
        codigobarra: articulo.codigobarra,
        descripcion: articulo.descripcion,
        cantidad: Number(cantidad),
      },
    ]);

    setArticuloSeleccionado(null);
    setCantidad("");
  };

  const eliminarDetalle = (index) => {
    const nuevos = [...detalles];
    nuevos.splice(index, 1);
    setDetalles(nuevos);
  };

  const guardar = async () => {
    try {
      setError("");

      if (!fecha) {
        setError("Debe ingresar la fecha.");
        return;
      }

      if (!sucursaldestinoId) {
        setError("Debe seleccionar una sucursal destino.");
        return;
      }

      if (detalles.length === 0) {
        setError("Debe agregar al menos un artículo.");
        return;
      }

      setGuardando(true);

      await transferenciaFabricaApi.transferir({
        fecha,
        sucursaldestino_id: Number(sucursaldestinoId),
        usuario_id: user?.id || null,
        articulos: detalles.map((item) => ({
          articulo_id: item.articulo_id,
          cantidad: item.cantidad,
        })),
      });

      alert("Transferencia realizada correctamente.");

      navigate("/fabrica/stock");

    } catch (error) {
      console.error(error);

      let mensaje = "Error al guardar la transferencia.";

      try {
        const parsed = JSON.parse(error.message);
        mensaje = parsed.message || mensaje;
      } catch {
        mensaje = error.message || mensaje;
      }

      setError(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const totalCantidad = detalles.reduce(
    (acc, item) => acc + Number(item.cantidad || 0),
    0
  );

  return (
    <Container fluid>
      <Card>
        <Card.Header>
          <h4>Transferencia desde Fábrica</h4>
        </Card.Header>

        <Card.Body>
          {error && (
            <Alert variant="danger">
              {error}
            </Alert>
          )}

          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Fecha</Form.Label>
                <Form.Control
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={5}>
              <Form.Group>
                <Form.Label>Sucursal Destino</Form.Label>
                <Select
                  placeholder="Buscar sucursal..."
                  options={sucursalOptions}
                  value={
                    sucursalOptions.find(
                      (o) => Number(o.value) === Number(sucursaldestinoId)
                    ) || null
                  }
                  onChange={(selected) =>
                    setSucursaldestinoId(selected?.value || "")
                  }
                  isClearable
                  noOptionsMessage={() => "No se encontraron sucursales"}
                  styles={{
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                />
              </Form.Group>
            </Col>
          </Row>

          <hr />

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Artículo</Form.Label>
              <Select
                placeholder="Buscar artículo..."
                options={articuloOptions}
                value={articuloSeleccionado}
                onChange={setArticuloSeleccionado}
                isClearable
                noOptionsMessage={() => "No se encontraron artículos"}
                styles={{
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />
            </Col>

            <Col md={2}>
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                step="0.001"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
            </Col>

            <Col md={2} className="d-flex align-items-end">
              <Button
                variant="primary"
                onClick={agregarDetalle}
              >
                Agregar
              </Button>
            </Col>
          </Row>

          <Table bordered striped hover responsive>
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th width="100">Acción</th>
              </tr>
            </thead>

            <tbody>
              {detalles.map((item, index) => (
                <tr key={index}>
                  <td>{item.codigobarra}</td>
                  <td>{item.descripcion}</td>
                  <td>{Number(item.cantidad || 0).toFixed(3)}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => eliminarDetalle(index)}
                    >
                      X
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <th></th>
                <th>TOTAL</th>
                <th>{totalCantidad.toFixed(3)}</th>
                <th></th>
              </tr>
            </tfoot>
          </Table>
        </Card.Body>

        <Card.Footer>
          <Button
            variant="success"
            onClick={guardar}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar Transferencia"}
          </Button>

          {" "}

          <Button
            variant="secondary"
            onClick={() => navigate("/fabrica/stock")}
          >
            Volver
          </Button>
        </Card.Footer>
      </Card>
    </Container>
  );
}