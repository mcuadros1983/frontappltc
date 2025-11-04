import React, { useEffect, useState } from 'react';
import { dispositivosApi } from '../../services/dispositivosApi';
import { sucursalesApi } from '../../services/sucursalesApi';

export default function Dispositivos() {
  const [items, setItems] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ nombre: '', device_id: '', api_key: '', sucursal_id: '', enabled: true });

  async function load() {
    try {
      setLoading(true);
      const [d, s] = await Promise.all([dispositivosApi.list(), sucursalesApi.list()]);
      setItems(Array.isArray(d) ? d : []);
      setSucursales(Array.isArray(s) ? s : []);
    } catch (e) {
      setErr(e.message || 'Error cargando dispositivos');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function onCreate(e) {
    e.preventDefault();
    try {
      await dispositivosApi.create({
        nombre: form.nombre,
        device_id: form.device_id,
        api_key: form.api_key,
        sucursal_id: Number(form.sucursal_id),
        enabled: !!form.enabled,
      });
      setForm({ nombre: '', device_id: '', api_key: '', sucursal_id: '', enabled: true });
      load();
    } catch (e) {
      alert(e.message || 'Error al crear dispositivo');
    }
  }

  if (loading) return <div>Cargando dispositivos…</div>;
  if (err) return <div className="alert alert-danger">{err}</div>;

  return (
    <>
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="h6 mb-3">Nuevo dispositivo</div>
          <form className="row g-2" onSubmit={onCreate}>
            <div className="col-sm-3">
              <input className="form-control" placeholder="Nombre" required
                value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="col-sm-3">
              <input className="form-control" placeholder="Device ID" required
                value={form.device_id} onChange={e => setForm({ ...form, device_id: e.target.value })} />
            </div>
            <div className="col-sm-3">
              <input className="form-control" placeholder="API Key" required
                value={form.api_key} onChange={e => setForm({ ...form, api_key: e.target.value })} />
            </div>
            <div className="col-sm-2">
              <select className="form-select" required
                value={form.sucursal_id} onChange={e => setForm({ ...form, sucursal_id: e.target.value })}>
                <option value="">Sucursal…</option>
                {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div className="col-sm-1 d-flex align-items-center">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" checked={form.enabled}
                  onChange={e => setForm({ ...form, enabled: e.target.checked })} id="enabledChk" />
                <label className="form-check-label" htmlFor="enabledChk">Activo</label>
              </div>
            </div>
            <div className="col-12 col-sm-2 d-grid">
              <button className="btn btn-primary">Crear</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="h6 mb-3">Dispositivos</div>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>ID</th><th>Nombre</th><th>Device ID</th><th>Sucursal</th><th>Activo</th><th>Último uso</th>
                </tr>
              </thead>
              <tbody>
                {items.map(d => (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>{d.nombre}</td>
                    <td><code>{d.device_id}</code></td>
                    <td>{d.sucursal_id}</td>
                    <td>{d.enabled ? 'Sí' : 'No'}</td>
                    <td>{d.last_seen ? new Date(d.last_seen).toLocaleString() : '-'}</td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan="6" className="text-center text-muted">Sin dispositivos</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
