import React, { useEffect, useState } from 'react';
import { turnosApi } from '../../services/turnosApi';

export default function Turnos() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 100, total: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ nombre: '', hora_entrada: '08:00', hora_salida: '17:00', tolerancia_min: 0 });

  // edición inline
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: '', hora_entrada: '08:00', hora_salida: '17:00', tolerancia_min: 0 });
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const data = await turnosApi.list(); 
      const arr = Array.isArray(data) ? data : [];
      setItems(arr);
      setMeta({ page: 1, limit: arr.length || 100, total: arr.length });
    } catch (e) {
      setErr(e.message || 'Error cargando turnos');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function onCreate(e) {
    e.preventDefault();
    try {
      await turnosApi.create({
        nombre: form.nombre,
        hora_entrada: form.hora_entrada,
        hora_salida: form.hora_salida,
        tolerancia_min: Number(form.tolerancia_min || 0),
      });
      setForm({ nombre: '', hora_entrada: '08:00', hora_salida: '17:00', tolerancia_min: 0 });
      load();
    } catch (e) {
      alert(e.message || 'Error al crear turno');
    }
  }

  function startEdit(t) {
    setEditId(t.id);
    setEditForm({
      nombre: t.nombre || '',
      hora_entrada: t.hora_entrada || '08:00',
      hora_salida: t.hora_salida || '17:00',
      tolerancia_min: Number.isFinite(t.tolerancia_min) ? t.tolerancia_min : 0,
    });
  }

  function cancelEdit() {
    setEditId(null);
    setEditForm({ nombre: '', hora_entrada: '08:00', hora_salida: '17:00', tolerancia_min: 0 });
  }

  async function saveEdit(id) {
    try {
      setSaving(true);
      await turnosApi.update(id, {
        nombre: editForm.nombre,
        hora_entrada: editForm.hora_entrada,
        hora_salida: editForm.hora_salida,
        tolerancia_min: Number(editForm.tolerancia_min || 0),
      });
      cancelEdit();
      load();
    } catch (e) {
      alert(e.message || 'Error al actualizar turno');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    const ok = window.confirm('¿Eliminar este turno?');
    if (!ok) return;
    try {
      await turnosApi.remove(id);
      load();
    } catch (e) {
      alert(e.message || 'Error al eliminar turno');
    }
  }

  if (loading) return <div>Cargando turnos…</div>;
  if (err) return <div className="alert alert-danger">{err}</div>;

  return (
    <>
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="h6 mb-3">Nuevo turno</div>
          <form className="row g-2" onSubmit={onCreate}>
            <div className="col-sm-4">
              <input className="form-control" placeholder="Nombre" required
                value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="col-sm-2">
              <input className="form-control" type="time" required
                value={form.hora_entrada} onChange={e => setForm({ ...form, hora_entrada: e.target.value })} />
            </div>
            <div className="col-sm-2">
              <input className="form-control" type="time" required
                value={form.hora_salida} onChange={e => setForm({ ...form, hora_salida: e.target.value })} />
            </div>
            <div className="col-sm-2">
              <input className="form-control" placeholder="Tolerancia (min)" type="number"
                value={form.tolerancia_min} onChange={e => setForm({ ...form, tolerancia_min: e.target.value })} />
            </div>
            <div className="col-sm-2 d-grid">
              <button className="btn btn-primary">Crear</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="h6 mb-3">Turnos <small className="text-muted">({meta.total})</small></div>
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th>Tolerancia (min)</th>
                  <th style={{width: 160}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map(t => (
                  <tr key={t.id}>
                    <td>{t.id}</td>

                    {/* Nombre */}
                    <td>
                      {editId === t.id ? (
                        <input className="form-control form-control-sm"
                          value={editForm.nombre}
                          onChange={e => setEditForm({ ...editForm, nombre: e.target.value })} />
                      ) : t.nombre}
                    </td>

                    {/* Entrada */}
                    <td>
                      {editId === t.id ? (
                        <input className="form-control form-control-sm" type="time"
                          value={editForm.hora_entrada}
                          onChange={e => setEditForm({ ...editForm, hora_entrada: e.target.value })} />
                      ) : t.hora_entrada}
                    </td>

                    {/* Salida */}
                    <td>
                      {editId === t.id ? (
                        <input className="form-control form-control-sm" type="time"
                          value={editForm.hora_salida}
                          onChange={e => setEditForm({ ...editForm, hora_salida: e.target.value })} />
                      ) : t.hora_salida}
                    </td>

                    {/* Tolerancia */}
                    <td>
                      {editId === t.id ? (
                        <input className="form-control form-control-sm" type="number"
                          value={editForm.tolerancia_min}
                          onChange={e => setEditForm({ ...editForm, tolerancia_min: e.target.value })} />
                      ) : t.tolerancia_min}
                    </td>

                    {/* Acciones */}
                    <td>
                      {editId === t.id ? (
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-success" disabled={saving} onClick={() => saveEdit(t.id)}>
                            {saving ? 'Guardando…' : 'Guardar'}
                          </button>
                          <button className="btn btn-sm btn-outline-secondary" onClick={cancelEdit}>Cancelar</button>
                        </div>
                      ) : (
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(t)}>Editar</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(t.id)}>Eliminar</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan="6" className="text-center text-muted">Sin turnos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
