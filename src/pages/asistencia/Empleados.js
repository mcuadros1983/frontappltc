import React, { useEffect, useState } from 'react';
import { listarEmpleados, crearEmpleado } from '../../services/empleadosApi';
import { sucursalesApi } from '../../services/sucursalesApi';
export default function Empleados() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ nombre: '', apellido: '', doc: '', sucursal_id: '' });
  const [sucursales, setSucursales] = useState([]);

async function load() {
  try {
    setLoading(true);
    const data = await listarEmpleados();
    console.log('data', data);
    setItems(Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []));
  } catch (e) {
    setErr(e.message || 'Error cargando empleados');
  } finally {
    setLoading(false);
  }
}


  useEffect(() => { load(); }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await sucursalesApi.list();
        setSucursales(Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []));
      } catch (e) {
        console.error("Error cargando sucursales", e);
      }
    })();
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    try {
      await crearEmpleado({
        nombre: form.nombre,
        apellido: form.apellido,
        doc: form.doc || null,
        sucursal_id: Number(form.sucursal_id || 1) // por ahora default 1
      });
      setForm({ nombre: '', apellido: '', doc: '', sucursal_id: '' });
      load();
    } catch (e) {
      alert(e.message || 'Error al crear');
    }
  }

  if (loading) return <div>Cargando empleados…</div>;
  if (err) return <div className="alert alert-danger">{err}</div>;

  return (
    <>
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="h6 mb-3">Nuevo empleado</div>
          <form className="row g-2" onSubmit={onCreate}>
            <div className="col-sm-3">
              <input className="form-control" placeholder="Nombre" value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div className="col-sm-3">
              <input className="form-control" placeholder="Apellido" value={form.apellido}
                onChange={e => setForm({ ...form, apellido: e.target.value })} required />
            </div>
            <div className="col-sm-3">
              <input className="form-control" placeholder="Documento" value={form.doc}
                onChange={e => setForm({ ...form, doc: e.target.value })} />
            </div>
            <div className="col-sm-3">
              <select
                className="form-select"
                value={form.sucursal_id}
                onChange={e => setForm({ ...form, sucursal_id: e.target.value })}
                required
              >
                <option value="">Seleccionar sucursal…</option>
                {sucursales.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-sm-1 d-grid">
              <button className="btn btn-primary">Crear</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="h6 mb-3">Listado</div>
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Doc</th>
                  <th>Sucursal</th>
                  <th>Activo</th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={it.id}>
                    <td>{it.id}</td>
                    <td>{it.nombre}</td>
                    <td>{it.apellido}</td>
                    <td>{it.doc || '-'}</td>
                    <td>{sucursales.find(s => s.id === it.sucursal_id)?.nombre || '-'}</td>

                    <td>{it.activo ? 'Sí' : 'No'}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan="6" className="text-center text-muted">Sin registros</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
