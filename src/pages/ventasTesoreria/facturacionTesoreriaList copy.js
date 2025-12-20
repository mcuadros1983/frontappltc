import { useState, useEffect, useCallback, useContext, useMemo } from "react";
import { Table, Container, Button, Modal, Form } from "react-bootstrap";
import Contexts from "../../context/Contexts"; // ajustá según tu estructura

const apiUrl = process.env.REACT_APP_API_URL;

export default function FacturacionTesoreriaList() {
  const dataContext = useContext(Contexts.DataContext);

  const {
    clientes,
    clientesTabla,
    formasPagoTesoreria,
    librosIvaTabla,
    ptosVentaTabla,
    tiposComprobanteTabla,
    imputacionContableTabla,
    empresaSeleccionada,
  } = dataContext;

  const [customers, setCustomers] = useState([]);
  const [comprobantes, setComprobantes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedComprobante, setSelectedComprobante] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [empresas, setEmpresas] = useState([]);


  const hoy = new Date().toISOString().split("T")[0];

  const getNuevoComprobanteInicial = () => ({
    nrocomprobante: "",
    iva105: 0,
    iva21: 0,
    neto: 0,
    total: 0,
    tipocomprobante_id: "",
    ptoventa_id: "",
    libroiva_id: "",
    cliente_id: "",
    fechacomprobante: hoy,
    fechavencimiento: hoy,
    imputacioncontable_id: "",
    observaciones: "",
    ctactecliente_id: "",
    formapago_id: "",
    estadoPago: "pendiente",
    conFactura: true,
  });



  const [nuevoComprobante, setNuevoComprobante] = useState(getNuevoComprobanteInicial);

  

  const fmtMoney = (n) =>
    (Number(n) || 0).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const toNumber2 = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? Number(n.toFixed(2)) : 0;
  };

  const clienteLabel = (c) => {
    if (!c) return "";

    // si el endpoint devuelve algo anidado, lo contemplamos
    const persona = c?.ClientePersonatabla || c?.clientePersona || c;
    const cliBase = c?.ClienteTabla || c?.cliente || c;

    const apellido = persona?.apellido || "";
    const nombre = persona?.nombre || "";
    const doc = persona?.numero || persona?.cuil || "";
    const razonSocial = cliBase?.razonsocial || cliBase?.nombre || cliBase?.descripcion || "";

    // 1) Persona: "APELLIDO, Nombre (DNI/CUIL)"
    const personaTxt =
      (apellido || nombre)
        ? `${apellido ? apellido + ", " : ""}${nombre}${doc ? ` (${doc})` : ""}`
        : "";

    // 2) Empresa/Razón social si existiera
    const baseTxt = razonSocial ? `${razonSocial}${doc ? ` (${doc})` : ""}` : "";

    // priorizamos personaTxt, si no existe usamos baseTxt, sino ID
    return (personaTxt || baseTxt || `ID ${c.id}`).trim();
  };

  const customersMap = useMemo(
    () => Object.fromEntries((customers || []).map((c) => [Number(c.id), c])),
    [customers]
  );


  const derivedTotal =
    Number(nuevoComprobante.neto || 0) +
    Number(nuevoComprobante.iva105 || 0) +
    Number(nuevoComprobante.iva21 || 0);




  // Filtra libros IVA y puntos de venta por empresa seleccionada
  const librosIVAFiltrados = librosIvaTabla.filter(
    (l) => l.empresa_id === empresaSeleccionada?.id
  );

  const ptosVtaFiltrados = ptosVentaTabla.filter(
    (l) => l.empresa_id === empresaSeleccionada?.id
  );

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`${apiUrl}/obtenerclientestabla`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("No se pudieron cargar los clientes");

        const data = await response.json();
        const arr = Array.isArray(data) ? data : [];

        // Orden: CENTRAL primero (si existiera por label) y luego alfabético por label
        const sorted = arr.sort((a, b) => {
          const la = clienteLabel(a).toUpperCase();
          const lb = clienteLabel(b).toUpperCase();

          if (la.includes("CENTRAL")) return -1;
          if (lb.includes("CENTRAL")) return 1;
          return la.localeCompare(lb, "es");
        });

        setCustomers(sorted);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const res = await fetch(`${apiUrl}/empresas`, { credentials: "include" });
        if (!res.ok) throw new Error("No se pudieron cargar las empresas");
        const data = await res.json();
        setEmpresas(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching empresas:", error);
      }
    };
    fetchEmpresas();
  }, []);

  const empresasMap = useMemo(
    () => Object.fromEntries(empresas.map((e) => [e.id, e])),
    [empresas]
  );

  // Cargar comprobantes (con filtro empresa si corresponde)
  const loadComprobantes = useCallback(async () => {
    try {
      let url = `${apiUrl}/comprobantes-ingreso`;

      if (dataContext.empresaSeleccionada) {
        url += `?empresa_id=${dataContext.empresaSeleccionada.id}`;
      }

      const res = await fetch(url, {
        credentials: "include",
      });

      const data = await res.json();
      setComprobantes(data.sort((a, b) => a.id - b.id));
    } catch (error) {
      console.error("❌ Error al cargar comprobantes:", error);
    }
  }, [dataContext.empresaSeleccionada]);

  // ... dentro del componente FacturacionTesoreriaList

  const handleEliminarComprobante = async (id) => {
    if (!window.confirm("¿Está seguro que desea eliminar este comprobante?")) return;

    try {
      const res = await fetch(`${apiUrl}/comprobantes-ingreso/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "No se pudo eliminar el comprobante");
      }

      await loadComprobantes();
    } catch (error) {
      console.error("❌ Error al eliminar comprobante:", error);
      alert(error.message);
    }
  };


  // Handlers de formulario de creación de comprobante
  const handleNuevoChange = (e) => {
    const { name, value, type, checked } = e.target;
    const numeric = new Set(["neto", "iva105", "iva21"]);
    const v = type === "checkbox" ? checked : value;

    setNuevoComprobante((prev) => ({
      ...prev,
      [name]: numeric.has(name) ? (v === "" ? "" : Number(v)) : v,
    }));
  };

  useEffect(() => {
    loadComprobantes();
  }, [loadComprobantes]);

  // Abrir modal de edición
  const handleDoubleClick = (comprobante) => {
    if (!empresaSeleccionada) {
      alert("Debe seleccionar una empresa para editar comprobantes.");
      return;
    }
    setSelectedComprobante(comprobante);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedComprobante(null);
    setShowModal(false);
  };

  const handleChange = (e) => {
    setSelectedComprobante({
      ...selectedComprobante,
      [e.target.name]: e.target.value,
    });
  };

  const handleGuardarCambios = async () => {
    try {
      await fetch(`${apiUrl}/comprobantes-ingreso/${selectedComprobante.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(selectedComprobante),
      });
      await loadComprobantes();
      handleCloseModal();
    } catch (error) {
      console.error("Error al actualizar comprobante:", error);
    }
  };

  // Crear Comprobante y, si forma de pago es Tarjeta, abrir Modal Tarjeta
  const handleCrearComprobante = async () => {
    try {
      const comprobanteConEmpresa = {
        ...nuevoComprobante,
        total: toNumber2(derivedTotal),
        empresa_id: dataContext.empresaSeleccionada
          ? dataContext.empresaSeleccionada.id
          : null,
      };
      const res = await fetch(`${apiUrl}/comprobantes-ingreso`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(comprobanteConEmpresa),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "No se pudo crear el comprobante");
      }

      const creado = await res.json();
      await loadComprobantes();
      setShowCreateModal(false);
      setNuevoComprobante({
        nrocomprobante: "",
        iva105: 0,
        iva21: 0,
        neto: 0,
        total: 0,
        tipocomprobante_id: "",
        ptoventa_id: "",
        libroiva_id: "",
        cliente_id: "",
        fechacomprobante: "",
        fechavencimiento: "",
        imputacioncontable_id: "",
        observaciones: "",
        ctactecliente_id: "",
        formapago_id: "",
        estadoPago: "pendiente",
        conFactura: true,
      });


    } catch (error) {
      console.error("❌ Error al crear comprobante:", error);
      alert(error.message);
    }
  };

  const derivedTotalEdit =
    Number(selectedComprobante?.neto || 0) +
    Number(selectedComprobante?.iva105 || 0) +
    Number(selectedComprobante?.iva21 || 0);


  return (
    <Container>
      <h1 className="my-list-title dark-text">Facturación</h1>

      <div className="mb-3">
        <Button
          className="mx-3"
          variant="success"
          disabled={!empresaSeleccionada}
          onClick={() => {
            if (!empresaSeleccionada) {
              alert("Debe seleccionar una empresa para emitir comprobantes.");
              return;
            }
            setNuevoComprobante(getNuevoComprobanteInicial()); // ← reset
            setShowCreateModal(true);
          }}
        >
          Nuevo Comprobante
        </Button>


      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Comprobante</th>
            <th>Total</th>
            <th>Cliente</th>
            <th>Forma de Pago (solo informativo)</th>
            <th>Empresa</th>
            <th>Acciones</th> {/* Nueva columna */}
          </tr>
        </thead>
        <tbody>
          {comprobantes.map((comp) => (
            <tr
              key={comp.id}
              onDoubleClick={() => {
                if (!empresaSeleccionada) {
                  alert("Debe seleccionar una empresa para editar comprobantes.");
                } else {
                  handleDoubleClick(comp);
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <td>{comp.id}</td>
              <td>{comp.nrocomprobante}</td>
              <td className="text-end">{fmtMoney(comp.total)}</td>
              <td>
                {customersMap[Number(comp.cliente_id)]
                  ? clienteLabel(customersMap[Number(comp.cliente_id)])
                  : comp.cliente_id}
              </td>
              <td>
                {formasPagoTesoreria.find((fp) => fp.id === comp.formapago_id)
                  ?.descripcion || comp.formapago_id}
              </td>
              <td>
                {empresasMap[comp.empresa_id]?.nombrecorto ||
                  empresasMap[comp.empresa_id]?.nombre ||
                  `ID ${comp.empresa_id}`}
              </td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation(); // evitar que abra modal con doble click
                    handleEliminarComprobante(comp.id);
                  }}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* ===== Modal de edición ===== */}
      <Modal show={showModal} onHide={handleCloseModal} backdrop="static" centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar Comprobante</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedComprobante && (
            <Form>
              <div className="row">
                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>N° Comprobante</Form.Label>
                  <Form.Control
                    name="nrocomprobante"
                    value={selectedComprobante.nrocomprobante || ""}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Cliente</Form.Label>
                  <Form.Select
                    name="cliente_id"
                    value={selectedComprobante.cliente_id || ""}
                    onChange={handleChange}
                    className="form-control my-input"
                  >
                    <option value="">Seleccione...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {clienteLabel(c)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="row">
                <Form.Group className="mb-3 col-md-4">
                  <Form.Label>Neto</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="neto"
                    value={selectedComprobante.neto || 0}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3 col-md-4">
                  <Form.Label>IVA 10.5%</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="iva105"
                    value={selectedComprobante.iva105 || 0}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3 col-md-4">
                  <Form.Label>IVA 21%</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="iva21"
                    value={selectedComprobante.iva21 || 0}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>

              <div className="row">
                {/* 🔁 TOTAL (auto) en modal de edicion */}
                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Total (auto)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="total"
                    value={toNumber2(derivedTotal).toFixed(2)}
                    readOnly
                  />
                </Form.Group>

                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Forma de Pago (solo informativo)</Form.Label>
                  <Form.Select
                    name="formapago_id"
                    value={selectedComprobante.formapago_id || ""}
                    onChange={handleChange}
                    className="form-control my-input"
                  >
                    <option value="">Seleccione...</option>
                    {formasPagoTesoreria.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.descripcion}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="row">
                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Tipo Comprobante</Form.Label>
                  <Form.Select
                    name="tipocomprobante_id"
                    value={selectedComprobante.tipocomprobante_id || ""}
                    onChange={handleChange}
                    className="form-control my-input"
                  >
                    <option value="">Seleccione...</option>
                    {tiposComprobanteTabla.map((tc) => (
                      <option key={tc.id} value={tc.id}>
                        {tc.descripcion}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Punto de Venta</Form.Label>
                  <Form.Select
                    name="ptoventa_id"
                    value={selectedComprobante.ptoventa_id || ""}
                    onChange={handleChange}
                    className="form-control my-input"
                  >
                    <option value="">Seleccione...</option>
                    {ptosVtaFiltrados.map((pv) => (
                      <option key={pv.id} value={pv.id}>
                        {pv.descripcion}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="row">
                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Libro IVA</Form.Label>
                  <Form.Select
                    name="libroiva_id"
                    value={selectedComprobante?.libroiva_id || ""}
                    onChange={handleChange}
                    className="form-control my-input"
                  >
                    <option value="">Seleccione...</option>
                    {librosIVAFiltrados.map((l) => (
                      <option key={l.id} value={l.id}>
                        {`${l.mes} / ${l.anio}`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Imputación Contable</Form.Label>
                  <Form.Select
                    name="imputacioncontable_id"
                    value={selectedComprobante.imputacioncontable_id || ""}
                    onChange={handleChange}
                    className="form-control my-input"
                  >
                    <option value="">Seleccione...</option>
                    {imputacionContableTabla.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.descripcion}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="row">
                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Fecha Comprobante</Form.Label>
                  <Form.Control
                    type="date"
                    name="fechacomprobante"
                    value={selectedComprobante.fechacomprobante || ""}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Fecha Vencimiento</Form.Label>
                  <Form.Control
                    type="date"
                    name="fechavencimiento"
                    value={selectedComprobante.fechavencimiento || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Observaciones</Form.Label>
                <Form.Control
                  as="textarea"
                  name="observaciones"
                  rows={2}
                  value={selectedComprobante.observaciones || ""}
                  onChange={handleChange}
                />
              </Form.Group>

              <div className="row">
                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Estado Pago</Form.Label>
                  <Form.Select
                    name="estadoPago"
                    value={selectedComprobante.estadoPago || "pendiente"}
                    onChange={handleChange}
                    className="form-control my-input"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="parcial">Parcial</option>
                    <option value="pagado">Pagado</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3 col-md-6 d-flex align-items-end">
                  <Form.Check
                    label="Con Factura"
                    name="conFactura"
                    checked={!!selectedComprobante.conFactura}
                    onChange={(e) =>
                      setSelectedComprobante({
                        ...selectedComprobante,
                        conFactura: e.target.checked,
                      })
                    }
                  />
                </Form.Group>
              </div>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleGuardarCambios}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===== Modal de creación ===== */}
      <Modal
        show={showCreateModal}
        onHide={() => {
          setShowCreateModal(false);
          setNuevoComprobante(getNuevoComprobanteInicial()); // ← reset
        }}
        backdrop="static"
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Comprobante</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>N° Comprobante</Form.Label>
                <Form.Control
                  name="nrocomprobante"
                  value={nuevoComprobante.nrocomprobante}
                  onChange={handleNuevoChange}
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Cliente</Form.Label>
                <Form.Select
                  name="cliente_id"
                  value={nuevoComprobante.cliente_id}
                  onChange={handleNuevoChange}
                  className="form-control my-input"
                >
                  <option value="">Seleccione...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {clienteLabel(c)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            <div className="row">
              <Form.Group className="mb-3 col-md-4">
                <Form.Label>Neto</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="neto"
                  value={nuevoComprobante.neto}
                  onChange={handleNuevoChange}
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-4">
                <Form.Label>IVA 10.5%</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="iva105"
                  value={nuevoComprobante.iva105}
                  onChange={handleNuevoChange}
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-4">
                <Form.Label>IVA 21%</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="iva21"
                  value={nuevoComprobante.iva21}
                  onChange={handleNuevoChange}
                />
              </Form.Group>
            </div>

            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Total (auto)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="total"
                  value={toNumber2(derivedTotalEdit).toFixed(2)}
                  readOnly
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Forma de Pago (solo informativo)</Form.Label>
                <Form.Select
                  name="formapago_id"
                  value={nuevoComprobante.formapago_id}
                  onChange={handleNuevoChange}
                  className="form-control my-input"
                >
                  <option value="">Seleccione...</option>
                  {formasPagoTesoreria.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.descripcion}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Tipo Comprobante</Form.Label>
                <Form.Select
                  name="tipocomprobante_id"
                  value={nuevoComprobante.tipocomprobante_id}
                  onChange={handleNuevoChange}
                  className="form-control my-input"
                >
                  <option value="">Seleccione...</option>
                  {tiposComprobanteTabla.map((tc) => (
                    <option key={tc.id} value={tc.id}>
                      {tc.descripcion}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Punto de Venta</Form.Label>
                <Form.Select
                  name="ptoventa_id"
                  value={nuevoComprobante.ptoventa_id}
                  onChange={handleNuevoChange}
                  className="form-control my-input"
                >
                  <option value="">Seleccione...</option>
                  {ptosVtaFiltrados.map((pv) => (
                    <option key={pv.id} value={pv.id}>
                      {pv.descripcion}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Libro IVA</Form.Label>
                <Form.Select
                  name="libroiva_id"
                  value={nuevoComprobante.libroiva_id || ""}
                  onChange={handleNuevoChange}
                  className="form-control my-input"
                >
                  <option value="">Seleccione...</option>
                  {librosIVAFiltrados.map((l) => (
                    <option key={l.id} value={l.id}>
                      {`${l.mes} / ${l.anio}`}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Imputación Contable</Form.Label>
                <Form.Select
                  name="imputacioncontable_id"
                  value={nuevoComprobante.imputacioncontable_id}
                  onChange={handleNuevoChange}
                  className="form-control my-input"
                >
                  <option value="">Seleccione...</option>
                  {imputacionContableTabla.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.descripcion}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Fecha Comprobante</Form.Label>
                <Form.Control
                  type="date"
                  name="fechacomprobante"
                  value={nuevoComprobante.fechacomprobante}
                  onChange={handleNuevoChange}
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Fecha Vencimiento</Form.Label>
                <Form.Control
                  type="date"
                  name="fechavencimiento"
                  value={nuevoComprobante.fechavencimiento}
                  onChange={handleNuevoChange}
                />
              </Form.Group>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                as="textarea"
                name="observaciones"
                rows={2}
                value={nuevoComprobante.observaciones}
                onChange={handleNuevoChange}
              />
            </Form.Group>

            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Estado Pago</Form.Label>
                <Form.Select
                  name="estadoPago"
                  value={nuevoComprobante.estadoPago}
                  onChange={handleNuevoChange}
                  className="form-control my-input"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="parcial">Parcial</option>
                  <option value="pagado">Pagado</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3 col-md-6 d-flex align-items-end">
                <Form.Check
                  label="Con Factura"
                  name="conFactura"
                  checked={nuevoComprobante.conFactura}
                  onChange={handleNuevoChange}
                />
              </Form.Group>
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowCreateModal(false);
            setNuevoComprobante(getNuevoComprobanteInicial()); // ← reset
          }}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleCrearComprobante}>
            Crear Comprobante
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
