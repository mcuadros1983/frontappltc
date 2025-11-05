import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Form, InputGroup, Button, ListGroup } from "react-bootstrap";
import { FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";
import Contexts from "../../context/Contexts";
import { getNavLinks } from "../../utils/navApi";
import { getIconByName } from "../../utils/uiIcons";
import "./HeroSearch.css";
import { useSecurity } from "../../security/SecurityContext"; // 👈 NUEVO

const norm = (s = "") =>
  s.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function HeroSearch() {

  const { user } = useSecurity();
  const roleId = user?.rol_id;
  const userId = user?.id; // ✅ faltaba

  const [q, setQ] = useState("");
  const [catalog, setCatalog] = useState([]);
  const [open, setOpen] = useState(false);

  const boxRef = useRef(null);
  const acRef = useRef(null);

  // Cargar catálogo desde backend (filtrado por rol + permisos del usuario)
  useEffect(() => {
    let mounted = true;
    if (acRef.current) acRef.current.abort();
    const ac = new AbortController();
    acRef.current = ac;

    (async () => {
      try {
        console.log("[HeroSearch] fetching links", { roleId, userId });
        const data = await getNavLinks({ roleId, userId });
        console.log("[HeroSearch] links received:", Array.isArray(data?.links) ? data.links.length : 0);
        const links = Array.isArray(data) ? data : data?.links || [];
        console.log("[HeroSearch] links received:", links.length);
        if (mounted) setCatalog(links);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("HeroSearch getNavLinks error:", e);
        }
      }
    })();

    return () => {
      mounted = false;
      ac.abort();
    };
  }, [roleId, userId]); // ✅ incluí userId por si cambia el usuario

  // Cerrar dropdown al click afuera
  useEffect(() => {
    const handler = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!q) return catalog;
    const s = norm(q);
    return catalog.filter(
      (x) =>
        norm(x.label).includes(s) ||
        norm(x.path).includes(s) ||
        (x.keywords || []).some((k) => norm(k).includes(s))
    );
  }, [catalog, q]);

  return (
    <div className="hs-band">
      <div className="hs-inner" ref={boxRef}>
        <div className="hs-title">¿Qué estás buscando?</div>

        <Form
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
        >
          <InputGroup className="hs-input">
            <InputGroup.Text className="hs-prepend">
              <FiSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Buscar rutas, módulos, acciones..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setOpen(true)}
            />
            <Button className="hs-btn" type="submit">
              Buscar
            </Button>
          </InputGroup>
        </Form>

        {open && (
          <div className="hs-dropdown">
            <ListGroup variant="flush">
              {filtered.length === 0 && (
                <ListGroup.Item className="text-muted">
                  Sin coincidencias.
                </ListGroup.Item>
              )}
              {filtered.map((it) => (
                <Link
                  key={it.path}
                  to={it.path}
                  className="list-group-item list-group-item-action d-flex align-items-center gap-2"
                  onClick={() => setOpen(false)}
                >
                  <span className="hs-result-icon">
                    {getIconByName(it.icon || it.path || it.label, { size: 18 })}
                  </span>
                  <strong className="me-2">{it.label}</strong>
                  <span className="text-muted small">{it.path}</span>
                </Link>
              ))}
            </ListGroup>
          </div>
        )}
      </div>
    </div>
  );
}
