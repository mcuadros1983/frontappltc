import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Form, InputGroup, Button, ListGroup, Badge, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Contexts from "../../context/Contexts";
import { searchNav } from "../../utils/navApi";
import { addShortcut } from "../../utils/shortcutsApi";
import { FiSearch, FiPlus } from "react-icons/fi";
import "./GlobalSearch.css"; // <-- 🔹 importante

const GlobalSearch = () => {
  const navigate = useNavigate();
  const userCtx = useContext(Contexts.UserContext);

  const roleId = userCtx?.user?.rol_id;
  const userId = userCtx?.user?.id; // si no existe, seguirá funcionando sin shortcuts

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ catalog: [], shortcuts: [] });
  const [open, setOpen] = useState(false);

  const boxRef = useRef(null);
  const controllerRef = useRef(null);

  // Cerrar dropdown al click afuera
  useEffect(() => {
    const handler = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounce search
  useEffect(() => {
    if (controllerRef.current) controllerRef.current.abort();
    const ac = new AbortController();
    controllerRef.current = ac;

    const t = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await searchNav({ q, roleId, userId, signal: ac.signal });
        setResults(res?.results || { catalog: [], shortcuts: [] });
        setLoading(false);
        setOpen(true);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setLoading(false);
        }
      }
    }, 220);

    return () => clearTimeout(t);
  }, [q, roleId, userId]);

  const onSubmit = (e) => {
    e.preventDefault();
    const first = [...(results.shortcuts || []), ...(results.catalog || [])][0];
    if (first?.path) {
      navigate(first.path);
      setOpen(false);
      setQ("");
    }
  };

  const handleAddShortcut = async (item) => {
    if (!userId) return;
    try {
      await addShortcut(userId, {
        label: item.label,
        path: item.path,
        // icon opcional: podés mapear por keyword si querés
      });
      // feedback simple:
      setQ("");
      setOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const list = useMemo(() => {
    // mezcla: primero coincide en shortcuts del usuario, luego catálogo
    return [
      ...(results.shortcuts || []).map((r) => ({ ...r, _source: "shortcut" })),
      ...(results.catalog || []).map((r) => ({ ...r, _source: "catalog" })),
    ];
  }, [results]);

  return (
    <div className="gs-wrapper" ref={boxRef}>
      <Form onSubmit={onSubmit}>
        <InputGroup>
          <InputGroup.Text>
            <FiSearch />
          </InputGroup.Text>
          <Form.Control
            placeholder="Buscar (rutas, módulos, acciones)..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setOpen(true)}
          />
          <Button type="submit" variant="primary" disabled={loading} className="mx-2">
            {loading ? <Spinner size="sm" /> : "Buscar"}
          </Button>
        </InputGroup>
      </Form>

      {open && (q || list.length > 0) && (
        <div className="gs-dropdown">
          <ListGroup variant="flush">
            {list.length === 0 && (
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <span>Sin resultados</span>
              </ListGroup.Item>
            )}

            {list.map((it) => (
              <ListGroup.Item
                key={`${it._source}-${it.path}-${it.label}`}
                action
                className="d-flex justify-content-between align-items-center"
                onClick={() => {
                  navigate(it.path);
                  setOpen(false);
                  setQ("");
                }}
              >
                <span className="text-truncate">
                  <strong>{it.label}</strong>
                  <span className="text-muted ms-2">{it.path}</span>
                </span>
                <span className="d-flex align-items-center gap-2">
                  <Badge bg={it._source === "shortcut" ? "success" : "secondary"}>
                    {it._source === "shortcut" ? "Acceso" : "Catálogo"}
                  </Badge>
                  {it._source === "catalog" && userId && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddShortcut(it);
                      }}
                      title="Agregar a accesos directos"
                    >
                      <FiPlus />
                    </Button>
                  )}
                </span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
