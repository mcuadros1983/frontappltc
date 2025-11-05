// src/components/shortcuts/AddShortcutModal.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Spinner, Badge } from "react-bootstrap";
import Contexts from "../../context/Contexts";
import { useSecurity } from "../../security/SecurityContext"; // 👈 usa SecurityContext
import { addShortcut, getShortcuts } from "../../utils/shortcutsApi";
import { getNavLinks } from "../../utils/navApi";

const AddShortcutModal = ({ show, onHide, onSaved }) => {
  const userCtx = useContext(Contexts.UserContext);
  const { user, ready } = useSecurity();
  const roleId = user?.rol_id;
  const userId = user?.id;

  const [loading, setLoading] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [userShortcuts, setUserShortcuts] = useState([]);
  const [selectedPath, setSelectedPath] = useState("");

  useEffect(() => {
    if (!show) return;
    let mounted = true;
    (async () => {
      try {
        console.log("[AddShortcutModal] open | roleId:", roleId, "| userId:", userId);
        setLoading(true);

        const data = await getNavLinks({ roleId, userId });
        console.log("-----------[AddShortcutModal] getNavLinks raw:", data);
        const links = Array.isArray(data) ? data : (Array.isArray(data?.links) ? data.links : []);
        console.log("[AddShortcutModal] links parsed len:", links.length);

        // const links = Array.isArray(data)
        //   ? data
        //   : (Array.isArray(data?.links) ? data.links : []);

        console.log("[AddShortcutModal] links parsed len:", links.length);
        if (mounted) setCatalog(links);

        // cargar shortcuts del usuario (opcional, si los usás)
        try {
          const us = await getShortcuts(userId);
          console.log("[AddShortcutModal] userShortcuts len:", Array.isArray(us) ? us.length : (us?.length ?? 0), "| raw:", us);
          if (mounted) setUserShortcuts(Array.isArray(us) ? us : []);
        } catch (e) {
          console.warn("[AddShortcutModal] getShortcuts warn:", e?.message);
        }
      } catch (e) {
        console.error("[AddShortcutModal] getNavLinks error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [show, roleId, userId]);

  const takenPaths = useMemo(
    () => new Set(userShortcuts.map((s) => s.path)),
    [userShortcuts]
  );

  const options = useMemo(() => {
    console.log("catalogo", catalog)
    const arr = [...catalog].sort((a, b) =>
      (a.label || "").localeCompare(b.label || "", "es", { sensitivity: "base" })
    );
    console.log("[AddShortcutModal] options (sorted) len:", arr.length);
    return arr;
  }, [catalog]);

  const selectedItem = useMemo(
    () => options.find((o) => o.path === selectedPath),
    [options, selectedPath]
  );

  const isDuplicate = selectedPath && takenPaths.has(selectedPath);

  const handleAdd = async () => {
    if (!userId || !selectedItem || isDuplicate) {
      console.warn("[AddShortcutModal] handleAdd blocked", { userId, selectedItem, isDuplicate });
      return;
    }
    try {
      console.log("[AddShortcutModal] handleAdd", { userId, selectedItem });
      await addShortcut(userId, {
        label: selectedItem.label,
        path: selectedItem.path,
        icon: selectedItem.icon || "",
      });
      onSaved?.();
      onHide?.();
    } catch (e) {
      console.error("[AddShortcutModal] addShortcut error:", e);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Agregar acceso directo</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="d-flex justify-content-center py-4">
            <Spinner />
          </div>
        ) : (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Elegí un enlace disponible (rol+permisos)</Form.Label>
              <Form.Select
                value={selectedPath}
                onChange={(e) => {
                  console.log("[AddShortcutModal] select change:", e.target.value);
                  setSelectedPath(e.target.value);
                }}
                className="form-control my-input"
              >
                {options.length === 0 && (
                  <option value="">(No hay enlaces disponibles para tu rol/permisos)</option>
                )}
                {options.map((opt) => (
                  <option key={opt.path} value={opt.path} disabled={takenPaths.has(opt.path)}>
                    {opt.label} — {opt.path} {takenPaths.has(opt.path) ? " (ya agregado)" : ""}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {selectedItem && (
              <div className="small text-muted">
                Agregarás: <strong>{selectedItem.label}</strong>{" "}
                <Badge bg="light" text="dark">{selectedItem.path}</Badge>
              </div>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button
          variant="primary"
          onClick={handleAdd}
          disabled={loading || !selectedItem || isDuplicate}
        >
          Agregar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddShortcutModal;

