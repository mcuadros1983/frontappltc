import { useEffect, useState, useContext, useCallback } from "react";
import { Container, Row, Col, Table, Button, Form, Spinner, Badge } from "react-bootstrap";
import Contexts from "../../context/Contexts";
import AdicionalFijoEditorModal from "./AdicionalFijoEditorModal";

const apiUrl = process.env.REACT_APP_API_URL;

export default function AdicionalFijoManager() {
  const dataContext = useContext(Contexts.DataContext);
  const empresa_id = dataContext?.empresaSeleccionada?.id ?? null;

  const [tipos, setTipos] = useState([]);
  // { [tipoId]: { id, monto, vigencia_desde, vigencia_hasta } } -> siempre el ÚLTIMO creado (max vigencia_desde)
  const [ultimos, setUltimos] = useState({});
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editTipo, setEditTipo] = useState(null); // null => crear; objeto => editar
  const [mode, setMode] = useState("create");    // "create" | "edit" | "valor" | "edit_valor"

  // nueva función
  const openEditarValor = (tipo) => {
    setEditTipo(tipo);
    setMode("edit_valor");
    setShowModal(true);
  };

  const fetchTipos = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      // 1) Traer tipos
      const r = await fetch(`${apiUrl}/adicionalfijotipo`, { credentials: "include" });
      const data = await r.json();

      // 2) Filtrar búsqueda y empresa
      const filtered = data
        .filter((x) => (x.descripcion || "").toLowerCase().includes(q.toLowerCase()))
        .filter((x) => (empresa_id ? (x.empresa_id == null || x.empresa_id === empresa_id) : true));

      setTipos(filtered);

      // 3) Para cada tipo, traer TODOS los valores y elegir el ÚLTIMO (max vigencia_desde)
      const pairs = await Promise.all(
        filtered.map(async (t) => {
          const rr = await fetch(`${apiUrl}/adicionalfijovalor?adicionalfijotipo_id=${t.id}`, { credentials: "include" });
          const lista = await rr.json();
          if (!Array.isArray(lista) || lista.length === 0) return [t.id, null];

          // Elegimos el que tenga la mayor vigencia_desde
          const ultimo = lista.reduce((acc, cur) => {
            if (!acc) return cur;
            const dAcc = new Date(acc.vigencia_desde);
            const dCur = new Date(cur.vigencia_desde);
            return dCur > dAcc ? cur : acc;
          }, null);

          return [t.id, ultimo];
        })
      );

      const map = {};
      pairs.forEach(([id, v]) => {
        if (v) {
          map[id] = {
            id: v.id,
            monto: Number(v.monto),
            vigencia_desde: v.vigencia_desde,
            vigencia_hasta: v.vigencia_hasta,
          };
        }
      });
      setUltimos(map);
    } catch (e) {
      console.error(e);
      setErr("No se pudo cargar la lista.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, q, empresa_id]);

  useEffect(() => {
    fetchTipos();
  }, [fetchTipos]);

  const openCreate = () => {
    setEditTipo(null);
    setMode("create");
    setShowModal(true);
  };

  const openEditTipo = (tipo) => {
    setEditTipo(tipo);
    setMode("edit");
    setShowModal(true);
  };

  const openNuevoValor = (tipo) => {
    setEditTipo(tipo);
    setMode("valor");
    setShowModal(true);
  };

  const onCloseModal = (changed) => {
    setShowModal(false);
    setEditTipo(null);
    if (changed) fetchTipos();
  };

  const eliminarTipo = async (tipo) => {
    if (!window.confirm(`¿Eliminar el adicional "${tipo.descripcion}"?`)) return;
    try {
      setLoading(true);
      await fetch(`${apiUrl}/adicionalfijotipo/${tipo.id}`, { method: "DELETE", credentials: "include" });
      await fetchTipos();
    } catch (e) {
      console.error(e);
      setErr("No se pudo eliminar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-3">
      <Row className="align-items-center mb-3">
        <Col>
          <h4 className="mb-0">Adicionales Fijos (Tipo + Último valor cargado)</h4>
        </Col>
        <Col md="auto">
          <Button onClick={openCreate}>Crear adicional</Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            placeholder="Buscar por descripción…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </Col>
      </Row>

      {err && <div className="alert alert-danger py-2">{err}</div>}

      <div className="table-responsive">
        <Table bordered hover size="sm" striped>
          <thead>
            <tr>
              <th style={{ width: 80 }}>ID</th>
              <th>Descripción</th>
              <th style={{ width: 160 }}>Último valor</th>
              <th style={{ width: 220 }}>Última vigencia desde</th>
              <th style={{ width: 260 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center">
                  <Spinner size="sm" className="me-2" />
                  Cargando…
                </td>
              </tr>
            ) : tipos.length ? (
              tipos.map((t) => {
                const v = ultimos[t.id];
                return (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.descripcion}</td>
                    <td>
                      {v ? (
                        <Badge bg="secondary">${v.monto.toFixed(2)}</Badge>
                      ) : (
                        <span className="text-muted">Sin valores</span>
                      )}
                    </td>
                    <td>{v ? v.vigencia_desde : "-"}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => openEditTipo(t)}
                          className="mx-2"
                        >
                          Editar
                        </Button>



                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => openNuevoValor(t)}
                          className="mx-2"
                        >
                          Nuevo
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center">
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {showModal && (
        <AdicionalFijoEditorModal
          show={showModal}
          onClose={onCloseModal}
          mode={mode}                 // "create" | "edit" | "valor"
          tipo={editTipo}             // null en "create"
          empresa_id={empresa_id}
          vigente={editTipo ? ultimos[editTipo.id] : null} // pasamos el último registro
        />
      )}
    </Container>
  );
}
