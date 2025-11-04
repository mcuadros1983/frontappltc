// src/pages/documentacion/DocumentoSubcategoriaModal.js
import React, { useEffect, useState } from "react";
import { categoriasApi } from "../../services/categoriasApi";
import { rolesApi } from "../../services/rolesApi"; // 👈 nuevo import

export default function DocumentoSubcategoriaModal({
  show,
  onHide,
  modo, // "create" | "edit"
  initialData,
  categoriaId,
  onSaved,
  esAdmin,
}) {
  const isEdit = modo === "edit";

  // estado del formulario
  const [nombre, setNombre] = useState("");

  // en vez de CSV, ahora guardamos directamente array de rol_ids seleccionados
  const [rolesSeleccionados, setRolesSeleccionados] = useState([]); // ej [1,2,3]

  // catálogo de roles para el <select>
  const [rolesDisponibles, setRolesDisponibles] = useState([]);

  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // 1) cargar lista de roles cuando se abre el modal
  useEffect(() => {
    if (!show) return;

    async function cargarRoles() {
      try {
        const data = await rolesApi.getRoles(); // esperamos [{id:1,nombre:"Admin"}, ...]
        setRolesDisponibles(data || []);
      } catch (e) {
        console.error("Error cargando roles:", e);
        setRolesDisponibles([]);
      }
    }

    cargarRoles();
  }, [show]);

  // 2) precargar datos cuando es edición o new
  useEffect(() => {
    if (!show) return;

    if (isEdit && initialData) {
      setNombre(initialData.nombre || "");

      // initialData.roles_permitidos viene del backend como array de números
      if (Array.isArray(initialData.roles_permitidos)) {
        setRolesSeleccionados(
          initialData.roles_permitidos.map((r) => Number(r))
        );
      } else {
        setRolesSeleccionados([]);
      }
    } else {
      // modo create
      setNombre("");
      setRolesSeleccionados([]);
    }

    setSaving(false);
    setErrMsg("");
  }, [show, isEdit, initialData]);

  // handler para seleccionar múltiples roles
  function handleRolesChange(e) {
    // e.target.selectedOptions es una HTMLCollection
    const values = Array.from(e.target.selectedOptions).map((opt) =>
      Number(opt.value)
    );
    setRolesSeleccionados(values);
  }

  // guardar
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
    if (!categoriaId) {
      setErrMsg("Falta categoría");
      return;
    }

    // payload final que espera el backend
    const payload = {
      nombre,
      categoria_id: categoriaId,
      roles_permitidos: rolesSeleccionados, // ej [1,2,5]
    };

    try {
      setSaving(true);
      setErrMsg("");

      if (isEdit && initialData?.id) {
        await categoriasApi.updateSubcategoria(initialData.id, payload);
      } else {
        await categoriasApi.createSubcategoria(payload);
      }

      setSaving(false);
      onHide();
      onSaved && onSaved();
    } catch (err) {
      console.error("error guardando subcategoría:", err);
      setSaving(false);
      setErrMsg(err.message || "Error guardando subcategoría");
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
                {isEdit
                  ? "Editar Subcategoría / Área"
                  : "Nueva Subcategoría / Área"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onHide}
              />
            </div>

            <div className="modal-body">
              {errMsg && <div className="alert alert-danger">{errMsg}</div>}

              {/* Mostrar categoría destino (sólo informativo) */}
              <div className="mb-2">
                <label className="form-label">ID Categoría</label>
                <input
                  className="form-control"
                  value={categoriaId || ""}
                  disabled
                />
                <div className="form-text">
                  Esta subcategoría va dentro de esta categoría.
                </div>
              </div>

              {/* Nombre subcategoría */}
              <div className="mb-3">
                <label className="form-label">
                  Nombre de la subcategoría / área
                </label>
                <input
                  className="form-control"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder='Ej: "RRHH", "CAJAS", "Seguridad"...'
                  required
                />
              </div>

              {/* Roles permitidos */}
              <div className="mb-3">
                <label className="form-label">
                  Roles que pueden ver esta subcategoría
                </label>
                <select
                  multiple
                  className="form-select form-control my-input"
                  value={rolesSeleccionados.map((id) => String(id))}
                  onChange={handleRolesChange}
                >
                  {rolesDisponibles.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {rol.nombre || `Rol ${rol.id}`}
                    </option>
                  ))}
                </select>

                <div className="form-text">
                  Mantené presionada CTRL (o CMD en Mac) para seleccionar más
                  de uno.
                </div>
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
