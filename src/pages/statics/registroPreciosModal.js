import React, { useEffect, useMemo, useState } from "react";
import {
  Modal, Button, Row, Col, Form, Table, Spinner, Alert, InputGroup
} from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

// -------- API helpers ----------
async function fetchArticulosPrecios() {
  const r = await fetch(`${apiUrl}/obtenerarticulosprecios`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudieron obtener artículos y precios");
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

async function crearRegistroPrecio(payload) {
  const r = await fetch(`${apiUrl}/registro-precios`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const msg = await r.text().catch(() => "");
    throw new Error(msg || "No se pudo crear el registro");
  }
  return r.json();
}

/**
 * Modal para registrar precios históricos por fecha.
 * Props:
 * - show
 * - onHide
 * - onSaved
 * - articulosConPrecios: mismo arreglo crudo que usás en el manager (articulosSrc)
 * - articulosTabla (opcional): catálogo del contexto [{ id, descripcion, codigobarra }]
 */
export default function RegistroPrecioModal({
  show,
  onHide,
  onSaved,
  articulosConPrecios = [],
  articulosTabla, // opcional; si viene, tiene prioridad para descripcion/codigo
}) {
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState([]); // { articulo_id, codigobarra, descripcion, precio }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const [q, setQ] = useState("");

  // 1) Map por ID desde el contexto (si lo pasás): prioridad más alta
  const ctxById = useMemo(() => {
    const m = new Map();
    (articulosTabla || []).forEach(a => {
      const id = Number(a.id);
      if (!id) return;
      m.set(id, {
        descripcion: a.descripcion || `Artículo ${id}`,
        codigobarra: a.codigobarra || "",
      });
    });
    return m;
  }, [articulosTabla]);

  // 2) Map por ID desde articulosConPrecios (misma fuente que el manager)
  //    Sirve para cuando no hay `articulosTabla` o para rellenar faltantes.
  const srcById = useMemo(() => {
    const m = new Map();
    (articulosConPrecios || []).forEach(item => {
      const a = item.ArticuloTabla || item.Articulotabla || item.articulo || {};
      const id = Number(a.id ?? item.articulo_id);
      if (!id) return;
      if (!m.has(id)) {
        m.set(id, {
          descripcion: a.descripcion || `Artículo ${id}`,
          codigobarra: a.codigobarra || "",
        });
      }
    });
    return m;
  }, [articulosConPrecios]);

  useEffect(() => {
    if (!show) return;
    let cancel = false;
    (async () => {
      setLoading(true); setErr(null);
      try {
        // Si NO te pasaron articulosConPrecios, los traemos (fallback).
        const base = (articulosConPrecios && articulosConPrecios.length > 0)
          ? articulosConPrecios
          : await fetchArticulosPrecios();

        if (cancel) return;

        // Normalizamos a un solo precio por artículo (tomamos el mayor)
        const byArt = new Map();
        base.forEach(row => {
          const a = row.ArticuloTabla || row.Articulotabla || row.articulo || {};
          const aid = Number(row.articulo_id ?? a.id);
          if (!aid) return;

          const precio = Number(row.precio || 0);

          // Resolver descripción/código:
          // prioridad articulosTabla (ctxById) > include (srcById)
          const fromCtx = ctxById.get(aid);
          const fromSrc = srcById.get(aid);
          const descripcion = (fromCtx?.descripcion ?? fromSrc?.descripcion ?? `Artículo ${aid}`);
          const codigobarra = (fromCtx?.codigobarra ?? fromSrc?.codigobarra ?? "");

          const prev = byArt.get(aid);
          if (!prev || precio > prev.precio) {
            byArt.set(aid, {
              articulo_id: aid,
              codigobarra,
              descripcion,
              precio,
            });
          } else {
            // actualizamos desc/código si llegó mejor fuente
            byArt.set(aid, {
              ...prev,
              descripcion,
              codigobarra,
            });
          }
        });

        const list = Array.from(byArt.values());
        // Orden alfabético por descripción (igual que en el manager)
        list.sort((x, y) => (x.descripcion || "").localeCompare(y.descripcion || ""));
        setItems(list);
      } catch (e) {
        setErr(e.message || "Error cargando artículos y precios");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [show, articulosConPrecios, ctxById, srcById]);

  const filtered = useMemo(() => {
    if (!q) return items;
    const t = q.toLowerCase();
    return items.filter(it =>
      String(it.codigobarra || "").toLowerCase().includes(t) ||
      String(it.descripcion || "").toLowerCase().includes(t) ||
      String(it.articulo_id || "").toLowerCase().includes(t)
    );
  }, [items, q]);

  const guardar = async () => {
    try {
      setSaving(true); setErr(null);

      if (!fecha) throw new Error("Debe indicar una fecha");
      if (filtered.length === 0) throw new Error("No hay artículos para guardar (revise el filtro)");

      const results = await Promise.allSettled(
        filtered.map(it =>
          crearRegistroPrecio({
            fecha,
            precio: Number(it.precio || 0),
            articulo_id: Number(it.articulo_id),
            codigobarra: it.codigobarra || null,
          })
        )
      );

      const ok = results.filter(r => r.status === "fulfilled").length;
      const fail = results.length - ok;

      if (fail > 0) {
        const firstErr = results.find(r => r.status === "rejected")?.reason?.message || "Algunos registros fallaron";
        setErr(`Guardados: ${ok}. Fallidos: ${fail}. Detalle: ${firstErr}`);
      } else {
        onSaved?.();
      }
    } catch (e) {
      setErr(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Nuevo registro de precios por fecha</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {err && <Alert variant="danger">{err}</Alert>}

        <Row className="mb-3 g-3">
          <Col md={3}>
            <Form.Label>Fecha a registrar</Form.Label>
            <Form.Control
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="form-control my-input"
            />
          </Col>
          <Col md={9}>
            <Form.Label>Buscar</Form.Label>
            <InputGroup>
              <Form.Control
                placeholder="Código / Descripción / ID"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Button variant="outline-secondary" onClick={() => setQ("")} className="mx-2">
                Limpiar
              </Button>
            </InputGroup>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-4"><Spinner animation="border" /></div>
        ) : (
          <div className="table-responsive" style={{ maxHeight: 520, overflowY: "auto" }}>
            <Table bordered hover size="sm" className="mb-0">
              <thead>
                <tr>
                  <th style={{ width: 100 }}>Artículo ID</th>
                  <th style={{ width: 160 }}>Código</th>
                  <th>Descripción</th>
                  <th style={{ width: 160 }} className="text-end">Precio</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="text-center text-muted">Sin resultados</td></tr>
                )}
                {filtered.map((it, idx) => (
                  <tr key={`${it.articulo_id}-${idx}`}>
                    <td>{it.articulo_id}</td>
                    <td>{it.codigobarra || "-"}</td>
                    <td>{it.descripcion || "-"}</td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
                        className="text-end"
                        value={it.precio}
                        onChange={(e) => {
                          const v = e.target.value;
                          setItems(prev => prev.map(p =>
                            p.articulo_id === it.articulo_id ? { ...p, precio: v } : p
                          ));
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={saving}>Cerrar</Button>
        <Button variant="primary" onClick={guardar} disabled={saving || loading}>
          {saving ? <Spinner size="sm" animation="border" /> : "Guardar registros"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
