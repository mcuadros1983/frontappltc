// src/pages/documentacion/DocumentoCategoriaModal.js
import React, { useEffect, useState } from "react";
import { categoriasApi } from "../../services/categoriasApi";

export default function DocumentoCategoriaModal({
  show,
  onHide,
  modo, // "create" | "edit"
  initialData,
  onSaved,
  esAdmin,
}) {
  const isEdit = modo === "edit";

  const [nombre, setNombre] = useState("");
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (!show) return;

    if (isEdit && initialData) {
      setNombre(initialData.nombre || "");
    } else {
      setNombre("");
    }

    setErrMsg("");
    setSaving(false);
  }, [show, isEdit, initialData]);

  async function handleSave(e) {
    e.preventDefault();
    if (!esAdmin) {
      alert("No tenés permiso para guardar.");
      return;
    }
    if (!nombre.trim()) {
      setErrMsg("El nombre es obligatorio");
      return;
    }

    try {
      setSaving(true);
      setErrMsg("");

      if (isEdit && initialData?.id) {
        await categoriasApi.updateCategoria(initialData.id, {
          nombre,
        });
      } else {
        await categoriasApi.createCategoria({
          nombre,
        });
      }

      setSaving(false);
      onHide();
      onSaved && onSaved();
    } catch (err) {
      console.error("error guardando categoría:", err);
      setSaving(false);
      setErrMsg(err.message || "Error guardando categoría");
    }
  }

  if (!show) return null;

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSave}>
            <div className="modal-header">
              <h5 className="modal-title">
                {isEdit ? "Editar Categoría" : "Nueva Categoría"}
              </h5>
              <button type="button" className="btn-close" onClick={onHide} />
            </div>

            <div className="modal-body">
              {errMsg && (
                <div className="alert alert-danger">{errMsg}</div>
              )}

              <div className="mb-3">
                <label className="form-label">Nombre de la categoría</label>
                <input
                  className="form-control"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder='Ej: "PROCESOS", "MANUALES"...'
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onHide}
                disabled={saving}
              >
                Cancelar
              </button>
              {esAdmin && (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
