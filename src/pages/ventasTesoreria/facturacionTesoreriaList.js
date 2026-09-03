import { useState, useEffect, useCallback, useContext, useMemo } from "react";
import { Table, Container, Button, Modal, Form } from "react-bootstrap";
import Contexts from "../../context/Contexts"; // ajustá según tu estructura

const apiUrl = process.env.REACT_APP_API_URL;

export default function FacturacionTesoreriaList() {
  const dataContext = useContext(Contexts.DataContext);

  const {
    formasPagoTesoreria,
    librosIvaTabla,
    ptosVentaTabla,
    tiposComprobanteTabla,
    imputacionContableTabla,
    empresaSeleccionada,
  } = dataContext;

  // =========================
  // CLIENTES: AUTOCOMPLETE + CACHE (sin traer todos)
  // =========================
  const [clientesCache, setClientesCache] = useState({}); // { [id]: clienteObj }
  const [comprobantes, setComprobantes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedComprobante, setSelectedComprobante] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [empresas, setEmpresas] = useState([]);


  const hoy = new Date().toISOString().split("T")[0];

  const getClienteCachedLabel = (id) => {
    const c = clientesCache[Number(id)];
    return c ? clienteLabel(c) : `ID ${id}`;
  };

  const fetchClienteById = useCallback(
    async (id) => {
      const key = Number(id);
      if (!key || clientesCache[key]) return;

      try {
        const res = await fetch(`${apiUrl}/clientespersonatabla/id/${key}`, {
          credentials: "include",
        });
        if (!res.ok) return;

        const data = await res.json();
        setClientesCache((prev) => ({ ...prev, [key]: data }));
      } catch (e) {
        // silencioso
      }
    },
    [apiUrl, clientesCache]
  );

  const buscarClientesPersona = useCallback(
    async (q) => {
      const query = String(q || "").trim();
      if (query.length < 2) return [];

      const res = await fetch(
        `${apiUrl}/clientespersonatabla/buscar?q=${encodeURIComponent(query)}&limit=20`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("No se pudo buscar clientes");
      const data = await res.json();
      return Array.isArray(data?.rows) ? data.rows : [];
    },
    [apiUrl]
  );

  // ====== Estado AUTOCOMPLETE CREATE ======
  const [clienteQueryCreate, setClienteQueryCreate] = useState("");
  const [clienteResultadosCreate, setClienteResultadosCreate] = useState([]);
  const [clienteLoadingCreate, setClienteLoadingCreate] = useState(false);
  const [clienteErrorCreate, setClienteErrorCreate] = useState("");

  // ====== Estado AUTOCOMPLETE EDIT ======
  const [clienteQueryEdit, setClienteQueryEdit] = useState("");
  const [clienteResultadosEdit, setClienteResultadosEdit] = useState([]);
  const [clienteLoadingEdit, setClienteLoadingEdit] = useState(false);
  const [clienteErrorEdit, setClienteErrorEdit] = useState("");


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

  const calcIVA105 = () => {
    const neto = Number(nuevoComprobante.neto || 0);
    setNuevoComprobante((p) => ({ ...p, iva105: toNumber2(neto * 0.105) }));
  };

  const calcIVA21 = () => {
    const neto = Number(nuevoComprobante.neto || 0);
    setNuevoComprobante((p) => ({ ...p, iva21: toNumber2(neto * 0.21) }));
  };

  // =========================
  // CALC IVA - EDICIÓN
  // =========================
  const calcIVA105Edit = () => {
    const neto = Number(selectedComprobante?.neto || 0);
    setSelectedComprobante((p) => ({ ...p, iva105: toNumber2(neto * 0.105) }));
  };

  const calcIVA21Edit = () => {
    const neto = Number(selectedComprobante?.neto || 0);
    setSelectedComprobante((p) => ({ ...p, iva21: toNumber2(neto * 0.21) }));
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

  const derivedTotal =
    Number(nuevoComprobante.neto || 0) +
    Number(nuevoComprobante.iva105 || 0) +
    Number(nuevoComprobante.iva21 || 0);

  // =========================
  // VALIDACIÓN MODAL CREACIÓN
  // =========================
  const canCrearComprobante = useMemo(() => {
    if (!empresaSeleccionada?.id) return false;

    const req = nuevoComprobante || {};

    // requeridos (los IVA y observaciones NO)
    const requiredText = [
      "nrocomprobante",
      "tipocomprobante_id",
      "ptoventa_id",
      "libroiva_id",
      "cliente_id",
      "fechacomprobante",
      "fechavencimiento",
      "imputacioncontable_id",
      "formapago_id",
      "estadoPago",
    ];

    for (const k of requiredText) {
      if (req[k] === null || req[k] === undefined || String(req[k]).trim() === "") return false;
    }

    // neto requerido (puede ser 0, pero debe ser número válido)
    const netoNum = Number(req.neto);
    if (!Number.isFinite(netoNum)) return false;

    return true;
  }, [nuevoComprobante, empresaSeleccionada]);

  // =========================
  // VALIDACIÓN MODAL EDICIÓN
  // =========================
  const canGuardarCambios = useMemo(() => {
    if (!empresaSeleccionada?.id) return false;
    if (!selectedComprobante?.id) return false;

    const req = selectedComprobante || {};

    // requeridos (los IVA y observaciones NO)
    const requiredText = [
      "nrocomprobante",
      "tipocomprobante_id",
      "ptoventa_id",
      "libroiva_id",
      "cliente_id",
      "fechacomprobante",
      "fechavencimiento",
      "imputacioncontable_id",
      "formapago_id",
      "estadoPago",
    ];

    for (const k of requiredText) {
      if (req[k] === null || req[k] === undefined || String(req[k]).trim() === "") return false;
    }

    // neto requerido (puede ser 0, pero debe ser número válido)
    const netoNum = Number(req.neto);
    if (!Number.isFinite(netoNum)) return false;

    return true;
  }, [selectedComprobante, empresaSeleccionada]);


  // Filtra libros IVA y puntos de venta por empresa seleccionada
  const librosIVAFiltrados = librosIvaTabla.filter(
    (l) => l.empresa_id === empresaSeleccionada?.id
  );

  const ptosVtaFiltrados = ptosVentaTabla.filter(
    (l) => l.empresa_id === empresaSeleccionada?.id
  );



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

  useEffect(() => {
    // precargar clientes de los comprobantes visibles
    const ids = Array.from(
      new Set((comprobantes || []).map((c) => Number(c.cliente_id)).filter(Boolean))
    );

    ids.forEach((id) => {
      if (!clientesCache[id]) fetchClienteById(id);
    });
  }, [comprobantes, clientesCache, fetchClienteById]);

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


  // ===== Debounce CREATE =====
  useEffect(() => {
    if (!showCreateModal) return;

    let cancel = false;
    const t = setTimeout(async () => {
      if (cancel) return;

      const q = clienteQueryCreate.trim();
      if (q.length < 2) {
        setClienteResultadosCreate([]);
        setClienteErrorCreate("");
        return;
      }

      setClienteLoadingCreate(true);
      setClienteErrorCreate("");

      try {
        const rows = await buscarClientesPersona(q);
        setClienteResultadosCreate(rows);
      } catch (e) {
        setClienteErrorCreate(e.message || "Error buscando clientes");
        setClienteResultadosCreate([]);
      } finally {
        setClienteLoadingCreate(false);
      }
    }, 300);

    return () => {
      cancel = true;
      clearTimeout(t);
    };
  }, [clienteQueryCreate, showCreateModal, buscarClientesPersona]);

  // ===== Debounce EDIT =====
  useEffect(() => {
    if (!showModal) return;

    let cancel = false;
    const t = setTimeout(async () => {
      if (cancel) return;

      const q = clienteQueryEdit.trim();
      if (q.length < 2) {
        setClienteResultadosEdit([]);
        setClienteErrorEdit("");
        return;
      }

      setClienteLoadingEdit(true);
      setClienteErrorEdit("");

      try {
        const rows = await buscarClientesPersona(q);
        setClienteResultadosEdit(rows);
      } catch (e) {
        setClienteErrorEdit(e.message || "Error buscando clientes");
        setClienteResultadosEdit([]);
      } finally {
        setClienteLoadingEdit(false);
      }
    }, 300);

    return () => {
      cancel = true;
      clearTimeout(t);
    };
  }, [clienteQueryEdit, showModal, buscarClientesPersona]);
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

    setNuevoComprobante((prev) => {
      const next = {
        ...prev,
        [name]: numeric.has(name) ? (v === "" ? "" : Number(v)) : v,
      };

      // ✅ si cambia neto: reset IVA
      if (name === "neto") {
        next.iva105 = 0;
        next.iva21 = 0;
      }

      return next;
    });
  };

  useEffect(() => {
    loadComprobantes();
  }, [loadComprobantes]);

  // Abrir modal de edición
const handleDoubleClick = async (comprobante) => {

  if (!empresaSeleccionada) {
    alert(
      "Debe seleccionar una empresa para editar comprobantes."
    );
    return;
  }

  try {

    /*
     * Primero consultamos el detalle.
     * NO abrimos el modal todavía.
     */
    const res = await fetch(
      `${apiUrl}/comprobantes-egreso/${comprobante.id}/detalle`,
      {
        credentials: "include",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data?.error ||
        "No se pudo obtener el detalle del comprobante"
      );
    }

    /*
     * ============================================================
     * REGLA DE EDICIÓN
     * ============================================================
     *
     * El backend determina si el comprobante puede modificarse.
     * Sólo los comprobantes cuya situación financiera permitida
     * sea Cuenta Corriente podrán abrir el modal de edición.
     * ============================================================
     */

    if (data.puede_editar !== true) {

      alert(
        data.motivo_no_editar ||
        "Este comprobante no puede modificarse porque posee una forma de pago distinta de Cuenta Corriente."
      );

      setSelectedComprobante(null);
      setShowModal(false);

      return;
    }

    /*
     * El backend confirmó que puede editarse.
     */

    setSelectedComprobante(
      data.comprobante || comprobante
    );

    setShowModal(true);

  } catch (err) {

    console.error(
      "❌ Error al verificar edición del comprobante:",
      err
    );

    alert(
      err.message ||
      "No se pudo verificar si el comprobante puede modificarse."
    );
  }
};

  const handleCloseModal = () => {
    setSelectedComprobante(null);
    setShowModal(false);

    setClienteQueryEdit("");
    setClienteResultadosEdit([]);
    setClienteErrorEdit("");
    setClienteLoadingEdit(false);

  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const numeric = new Set(["neto", "iva105", "iva21", "total"]);
    const v = type === "checkbox" ? checked : value;

    setSelectedComprobante((prev) => {
      const next = {
        ...prev,
        [name]: numeric.has(name) ? (v === "" ? "" : Number(v)) : v,
      };

      // ✅ si cambia neto: reset IVA
      if (name === "neto") {
        next.iva105 = 0;
        next.iva21 = 0;
      }

      return next;
    });
  };


  const handleGuardarCambios = async () => {
    if (!canGuardarCambios) {
      alert("Faltan completar campos obligatorios antes de guardar.");
      return;
    }
    try {
      const payload = {
        ...selectedComprobante,
        total: toNumber2(derivedTotalEdit),
      };

      await fetch(`${apiUrl}/comprobantes-ingreso/${selectedComprobante.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
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
      setClienteQueryCreate("");
      setClienteResultadosCreate([]);
      setClienteErrorCreate("");
      setClienteLoadingCreate(false);

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

            setClienteQueryCreate("");
            setClienteResultadosCreate([]);
            setClienteErrorCreate("");
            setClienteLoadingCreate(false);

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
                {comp.cliente_id
                  ? (clientesCache[Number(comp.cliente_id)]
                    ? clienteLabel(clientesCache[Number(comp.cliente_id)])
                    : "Cargando...")
                  : "-"}
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

                  <Form.Control
                    className="form-control my-input"
                    placeholder="Buscar por apellido, nombre, DNI/CUIL..."
                    value={clienteQueryEdit}
                    onChange={(e) => setClienteQueryEdit(e.target.value)}
                  />

                  {selectedComprobante?.cliente_id ? (
                    <div className="mt-2 d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        Seleccionado: <strong>{getClienteCachedLabel(selectedComprobante.cliente_id)}</strong>
                      </small>

                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => {
                          setSelectedComprobante((p) => ({ ...p, cliente_id: "" }));
                          setClienteQueryEdit("");
                          setClienteResultadosEdit([]);
                        }}
                      >
                        Quitar
                      </Button>
                    </div>
                  ) : (
                    <small className="text-muted">Escribí al menos 2 caracteres para buscar.</small>
                  )}

                  {(clienteLoadingEdit || clienteErrorEdit || clienteResultadosEdit.length > 0) && (
                    <div className="list-group mt-2" style={{ maxHeight: 220, overflowY: "auto" }}>
                      {clienteLoadingEdit && <div className="list-group-item">Buscando...</div>}

                      {!clienteLoadingEdit && clienteErrorEdit && (
                        <div className="list-group-item text-danger">{clienteErrorEdit}</div>
                      )}

                      {!clienteLoadingEdit &&
                        !clienteErrorEdit &&
                        clienteResultadosEdit.map((c) => (
                          <button
                            type="button"
                            key={c.id}
                            className="list-group-item list-group-item-action"
                            onClick={() => {
                              setSelectedComprobante((p) => ({ ...p, cliente_id: c.id }));
                              setClientesCache((prev) => ({ ...prev, [Number(c.id)]: c }));
                              setClienteQueryEdit(clienteLabel(c));
                              setClienteResultadosEdit([]);
                            }}
                          >
                            {clienteLabel(c)}
                          </button>
                        ))}
                    </div>
                  )}
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

                  <div className="d-flex gap-2">
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="iva105"
                      value={selectedComprobante.iva105 || 0}
                      onChange={handleChange}
                    />
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={calcIVA105Edit}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Calc
                    </Button>
                  </div>
                </Form.Group>

                <Form.Group className="mb-3 col-md-4">
                  <Form.Label>IVA 21%</Form.Label>

                  <div className="d-flex gap-2">
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="iva21"
                      value={selectedComprobante.iva21 || 0}
                      onChange={handleChange}
                    />
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={calcIVA21Edit}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Calc
                    </Button>
                  </div>
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
                    value={toNumber2(derivedTotalEdit).toFixed(2)}
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
          <Button
            variant="success"
            onClick={handleGuardarCambios}
            disabled={!canGuardarCambios}
          >
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

          setClienteQueryCreate("");
          setClienteResultadosCreate([]);
          setClienteErrorCreate("");
          setClienteLoadingCreate(false);
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

                <Form.Control
                  className="form-control my-input"
                  placeholder="Buscar por apellido, nombre, DNI/CUIL..."
                  value={clienteQueryCreate}
                  onChange={(e) => setClienteQueryCreate(e.target.value)}
                />

                {nuevoComprobante.cliente_id ? (
                  <div className="mt-2 d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      Seleccionado: <strong>{getClienteCachedLabel(nuevoComprobante.cliente_id)}</strong>
                    </small>

                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => {
                        setNuevoComprobante((p) => ({ ...p, cliente_id: "" }));
                        setClienteQueryCreate("");
                        setClienteResultadosCreate([]);
                      }}
                    >
                      Quitar
                    </Button>
                  </div>
                ) : (
                  <small className="text-muted">Escribí al menos 2 caracteres para buscar.</small>
                )}

                {(clienteLoadingCreate || clienteErrorCreate || clienteResultadosCreate.length > 0) && (
                  <div className="list-group mt-2" style={{ maxHeight: 220, overflowY: "auto" }}>
                    {clienteLoadingCreate && <div className="list-group-item">Buscando...</div>}

                    {!clienteLoadingCreate && clienteErrorCreate && (
                      <div className="list-group-item text-danger">{clienteErrorCreate}</div>
                    )}

                    {!clienteLoadingCreate &&
                      !clienteErrorCreate &&
                      clienteResultadosCreate.map((c) => (
                        <button
                          type="button"
                          key={c.id}
                          className="list-group-item list-group-item-action"
                          onClick={() => {
                            setNuevoComprobante((p) => ({ ...p, cliente_id: c.id }));
                            setClientesCache((prev) => ({ ...prev, [Number(c.id)]: c })); // cache
                            setClienteQueryCreate(clienteLabel(c));
                            setClienteResultadosCreate([]);
                          }}
                        >
                          {clienteLabel(c)}
                        </button>
                      ))}
                  </div>
                )}
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

                <div className="d-flex gap-2">
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="iva105"
                    value={nuevoComprobante.iva105}
                    onChange={handleNuevoChange}
                  />
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={calcIVA105}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Calc
                  </Button>
                </div>
              </Form.Group>



              <Form.Group className="mb-3 col-md-4">
                <Form.Label>IVA 21%</Form.Label>

                <div className="d-flex gap-2">
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="iva21"
                    value={nuevoComprobante.iva21}
                    onChange={handleNuevoChange}
                  />
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={calcIVA21}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Calc
                  </Button>
                </div>
              </Form.Group>


            </div>

            <div className="row">
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
            setClienteQueryCreate("");
            setClienteResultadosCreate([]);
            setClienteErrorCreate("");
            setClienteLoadingCreate(false);
          }}>
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={handleCrearComprobante}
            disabled={!canCrearComprobante}
          >
            Crear Comprobante
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
