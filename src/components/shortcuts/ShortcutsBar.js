// src/components/shortcuts/ShortcutsBar.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiX, FiArrowLeftCircle, FiArrowRightCircle } from "react-icons/fi";
import Contexts from "../../context/Contexts";
import { getShortcuts, removeShortcut, reorderShortcuts } from "../../utils/shortcutsApi";
import AddShortcutModal from "./AddShortcutModal";
import { getIconByName } from "../../utils/uiIcons";
import "./ShortcutsBar.css";

const ShortcutsBar = () => {
  const navigate = useNavigate();
  const { user } = useContext(Contexts.UserContext) || {};
  const userId = user?.id;

  const [items, setItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  const ordered = useMemo(
    () => [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [items]
  );

  const fetchData = async () => {
    if (!userId) return;
    try {
      const data = await getShortcuts(userId);
      console.log("[FE fetchData] items:", Array.isArray(data) ? data.length : data);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [userId]);

  const onRemove = async (id) => {
    if (!userId) return;
    try {
      const next = await removeShortcut(userId, id); // ← backend devuelve lista completa
      console.log("[FE remove] returned:", Array.isArray(next) ? next.length : next);
      setItems(Array.isArray(next) ? next : []);
    } catch (e) {
      console.error(e);
    }
  };

  const onReorder = async (fromIdx, dir) => {
    const toIdx = dir === "left" ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= ordered.length) return;

    // Construimos el nuevo orden local
    const newOrder = [...ordered];
    const [moved] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, moved);
    const normalized = newOrder.map((s, idx) => ({ ...s, order: idx }));

    // Optimista (opcional)
    setItems(normalized);

    try {
      const next = await reorderShortcuts(userId, normalized.map((x) => x.id));
      console.log("[FE reorder] returned:", Array.isArray(next) ? next.length : next);
      setItems(Array.isArray(next) ? next : normalized); // si algo falla, mantené el optimista
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="sc-wrapper">
      <div
        className="sc-header"
        // Evita que el click “atraviese” a la grilla de tarjetas
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="sc-title">Accesos directos</h2>

        <Button
          size="sm"
          variant="outline-primary"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowAdd(true);
          }}
          style={{ position: "relative", zIndex: 60 }}
        >
          <FiPlus className="me-1" /> Agregar
        </Button>
      </div>

      <div className="sc-grid">
        {ordered.length === 0 && (
          <div className="sc-empty">
            Sin accesos aún. Hacé clic en “Agregar” para elegirlos.
          </div>
        )}

        {ordered.map((s, idx) => {
          const iconNode = getIconByName(s.icon || s.path || s.label, { size: 28 });
          return (
            <div
              key={s.id || s.path}
              className="sc-card"
              // Clic en la tarjeta navega
              onClick={() => navigate(s.path)}
              title={s.path}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate(s.path)}
            >
              {/* Acciones arriba a la derecha */}
              <div className="sc-actions" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="light"
                  onClick={() => onReorder(idx, "left")}
                  title="Mover a la izquierda"
                >
                  <FiArrowLeftCircle />
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  onClick={() => onReorder(idx, "right")}
                  title="Mover a la derecha"
                >
                  <FiArrowRightCircle />
                </Button>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => onRemove(s.id)}
                  title="Quitar"
                >
                  <FiX />
                </Button>
              </div>

              <div className="sc-icon">{iconNode}</div>
              <div className="sc-label">{s.label}</div>
            </div>
          );
        })}
      </div>

      <AddShortcutModal
        show={showAdd}
        onHide={() => setShowAdd(false)}
        onSaved={fetchData}
      />
    </div>
  );
};

export default ShortcutsBar;
