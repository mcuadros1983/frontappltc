import React, { useEffect, useState } from 'react';
import { sucursalesApi } from '../../services/sucursalesApi';

export default function Sucursales() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ nombre: '', lat: '', lon: '', geofence_m: 80 });

  async function load() {
    try {
      setLoading(true);
      const data = await sucursalesApi.list();
      console.log('data', data);
  setItems(Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []));
    } catch (e) {
      setErr(e.message || 'Error cargando sucursales');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function onCreate(e) {
    e.preventDefault();
    try {
      await sucursalesApi.create({
        nombre: form.nombre,
        lat: form.lat ? Number(form.lat) : null,
        lon: form.lon ? Number(form.lon) : null,
        geofence_m: Number(form.geofence_m || 80),
      });
      setForm({ nombre: '', lat: '', lon: '', geofence_m: 80 });
      load();
    } catch (e) {
      alert(e.message || 'Error al crear sucursal');
    }
  }

  if (loading) return <div>Cargando sucursales…</div>;
  if (err) return <div className="alert alert-danger">{err}</div>;

  return (
    <>
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="h6 mb-3">Nueva sucursal</div>
          <form className="row g-2" onSubmit={onCreate}>
            <div className="col-sm-4">
              <input className="form-control" placeholder="Nombre" required
                value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="col-sm-2">
              <input className="form-control" placeholder="Latitud" type="number" step="any"
                value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })} />
            </div>
            <div className="col-sm-2">
              <input className="form-control" placeholder="Longitud" type="number" step="any"
                value={form.lon} onChange={e => setForm({ ...form, lon: e.target.value })} />
            </div>
            <div className="col-sm-2">
              <input className="form-control" placeholder="Geocerca (m)" type="number"
                value={form.geofence_m} onChange={e => setForm({ ...form, geofence_m: e.target.value })} />
            </div>
            <div className="col-sm-2 d-grid">
              <button className="btn btn-primary">Crear</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="h6 mb-3">Sucursales</div>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>ID</th><th>Nombre</th><th>Lat</th><th>Lon</th><th>Geocerca (m)</th>
                </tr>
              </thead>
              <tbody>
                {items.map(s => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.nombre}</td>
                    <td>{s.lat ?? '-'}</td>
                    <td>{s.lon ?? '-'}</td>
                    <td>{s.geofence_m}</td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan="5" className="text-center text-muted">Sin sucursales</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
