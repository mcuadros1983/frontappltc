// src/pages/Jornadas.js
import React, { useEffect, useState } from 'react';
import { jornadasApi } from '../../services/jornadasApi';

// helpers para campos vacíos de turno nuevo
function emptyTurnoForm() {
  return {
    nombre: '',
    hora_entrada: '08:00',
    hora_salida: '17:00',
    tolerancia_min: 0,
  };
}

export default function Jornadas() {
  // ----- modo pantalla -----
  // null  => vista lista
  // {id, nombre} => vista detalle de esa jornada
  const [selectedJornada, setSelectedJornada] = useState(null);

  // ----- LISTA DE JORNADAS -----
  const [jornadas, setJornadas] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [errList, setErrList] = useState('');

  // form para crear jornada nueva
  const [newJornadaName, setNewJornadaName] = useState('');

  // ----- DETALLE DE JORNADA -----
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [detalleErr, setDetalleErr] = useState('');
  const [detalleNombre, setDetalleNombre] = useState(''); // nombre editable de la jornada
  const [detalleTurnos, setDetalleTurnos] = useState([]); // turnos actuales

  // form para agregar turno a la jornada seleccionada
  const [nuevoTurno, setNuevoTurno] = useState(emptyTurnoForm());
  const [savingTurno, setSavingTurno] = useState(false);
  const [savingNombre, setSavingNombre] = useState(false);

  // ----------------------
  // 1. Cargar TODAS las jornadas (vista lista)
  // ----------------------
  async function loadJornadas() {
    try {
      setLoadingList(true);
      setErrList('');
      const data = await jornadasApi.list({ limit: 500 });
      // data = { items:[{id,nombre,turnos:[...]}], page,... }
      const arr = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      setJornadas(arr);
    } catch (e) {
      setErrList(e.message || 'Error cargando jornadas');
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    // arranca cargando listado
    loadJornadas();
  }, []);

  // ----------------------
  // 2. Crear jornada nueva
  // ----------------------
  async function handleCreateJornada(e) {
    e.preventDefault();
    if (!newJornadaName.trim()) return;

    try {
      // creamos jornada sin turnos al principio -> turnos: []
      await jornadasApi.create({
        nombre: newJornadaName.trim(),
        turnos: []
      });
      setNewJornadaName('');
      loadJornadas();
    } catch (e) {
      alert(e.message || 'Error creando jornada');
    }
  }

  // ----------------------
  // 3. Entrar al detalle de una jornada
  // ----------------------
  async function openDetalle(j) {
    setSelectedJornada({ id: j.id, nombre: j.nombre });
    setDetalleLoading(true);
    setDetalleErr('');
    setDetalleTurnos([]);
    setDetalleNombre(j.nombre);
    setNuevoTurno(emptyTurnoForm());

    try {
      // traemos la jornada completa (incluye turnos con through)
      const full = await jornadasApi.getById(j.id);

      // set nombre editable y lista de turnos actuales
      setDetalleNombre(full.nombre || '');
      // full.turnos: [{ id, nombre, hora_entrada, ...,
      //   JornadaTurno: { dia_semana, vigente_desde, ... } }]
      setDetalleTurnos(Array.isArray(full.turnos) ? full.turnos : []);

    } catch (e) {
      setDetalleErr(e.message || 'Error cargando detalle');
    } finally {
      setDetalleLoading(false);
    }
  }

  // ----------------------
  // 4. Guardar cambio de nombre de la jornada actual
  // ----------------------
  async function handleSaveNombre() {
    if (!selectedJornada) return;
    try {
      setSavingNombre(true);
      await jornadasApi.update(selectedJornada.id, {
        nombre: detalleNombre,
        // NO mandamos turnos acá, así no pisamos nada
      });
      // refrescamos el header local
      setSelectedJornada({
        ...selectedJornada,
        nombre: detalleNombre,
      });
      // también refrescamos la lista global (para que el nombre cambie ahí)
      loadJornadas();
    } catch (e) {
      alert(e.message || 'Error guardando nombre');
    } finally {
      setSavingNombre(false);
    }
  }

  // ----------------------
  // 5. Agregar un turno NUEVO a la jornada actual
  // ----------------------
  async function handleAddTurno(e) {
    e.preventDefault();
    if (!selectedJornada) return;

    const payload = {
      // acá NO pasamos turno_id porque queremos crear uno nuevo
      turno: {
        nombre: nuevoTurno.nombre,
        hora_entrada: nuevoTurno.hora_entrada,
        hora_salida: nuevoTurno.hora_salida,
        tolerancia_min: Number(nuevoTurno.tolerancia_min || 0),
      },

      // Campos extras que backend acepta, pero que ocultamos en el UI:
      dia_semana: null,
      vigente_desde: null,
      vigente_hasta: null,
      activo: true,
      orden: 0,
    };

    try {
      setSavingTurno(true);
      await jornadasApi.addTurno(selectedJornada.id, payload);

      // reload turnos de esa jornada
      const fresh = await jornadasApi.getById(selectedJornada.id);
      setDetalleTurnos(Array.isArray(fresh.turnos) ? fresh.turnos : []);

      // limpio el form
      setNuevoTurno(emptyTurnoForm());
    } catch (e) {
      alert(e.message || 'Error agregando turno a la jornada');
    } finally {
      setSavingTurno(false);
    }
  }

  // ----------------------
  // 6. Eliminar la jornada
  // ----------------------
  async function handleDeleteJornada(id) {
    const ok = window.confirm('¿Eliminar esta jornada y todos sus vínculos de turnos?');
    if (!ok) return;
    try {
      await jornadasApi.remove(id);
      // si estabas mirando justamente esa jornada, salís
      if (selectedJornada && selectedJornada.id === id) {
        setSelectedJornada(null);
      }
      loadJornadas();
    } catch (e) {
      alert(e.message || 'Error eliminando jornada');
    }
  }

  // ----------------------
  // 7. Quitar un turno de la jornada actual
  // ----------------------
  async function handleRemoveTurno(turnoId) {
    if (!selectedJornada) return;
    const ok = window.confirm('¿Quitar este turno de la jornada?');
    if (!ok) return;
    try {
      await jornadasApi.removeTurno(selectedJornada.id, turnoId);

      // recargar listado de turnos
      const fresh = await jornadasApi.getById(selectedJornada.id);
      setDetalleTurnos(Array.isArray(fresh.turnos) ? fresh.turnos : []);
    } catch (e) {
      alert(e.message || 'Error quitando turno');
    }
  }

  // ----------------------
  // 8. Volver a la lista completa
  // ----------------------
  function volverAlListado() {
    setSelectedJornada(null);
    setDetalleTurnos([]);
    setDetalleNombre('');
    setNuevoTurno(emptyTurnoForm());
    // recargar lista en caso de cambios
    loadJornadas();
  }

  // =========================================================
  // VISTA LISTA DE JORNADAS (cuando selectedJornada === null)
  // =========================================================
  if (!selectedJornada) {
    if (loadingList) return <div className="p-3">Cargando jornadas…</div>;
    if (errList) return <div className="alert alert-danger m-3">{errList}</div>;

    return (
      <div className="container py-3">
        <h3 className="mb-3">Jornadas</h3>

        {/* Crear nueva jornada */}
        <div className="card shadow-sm mb-3">
          <div className="card-body">
            <div className="h6 mb-3">Nueva jornada</div>
            <form className="row g-2" onSubmit={handleCreateJornada}>
              <div className="col-sm-8">
                <input
                  className="form-control"
                  placeholder="Nombre de la jornada (ej. Jornada Mañana)"
                  required
                  value={newJornadaName}
                  onChange={(e) => setNewJornadaName(e.target.value)}
                />
              </div>
              <div className="col-sm-4 d-grid">
                <button className="btn btn-primary">Crear jornada</button>
              </div>
            </form>
            <small className="text-muted">
              Luego podés agregarle turnos específicos.
            </small>
          </div>
        </div>

        {/* Listado de jornadas */}
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="h6 mb-3">Listado ({jornadas.length})</div>
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th style={{width:60}}>ID</th>
                    <th>Nombre</th>
                    <th style={{width:180}}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {jornadas.map(j => (
                    <tr key={j.id}>
                      <td>{j.id}</td>
                      <td>{j.nombre}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openDetalle(j)}
                          >
                            Editar / Turnos
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteJornada(j.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {jornadas.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center text-muted">
                        Sin jornadas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // =========================================================
  // VISTA DETALLE DE UNA JORNADA (cuando selectedJornada != null)
  // =========================================================

  if (detalleLoading) {
    return (
      <div className="container py-3">
        <button className="btn btn-link mb-3" onClick={volverAlListado}>
          ← Volver al listado
        </button>
        <div>Cargando detalle…</div>
      </div>
    );
  }
  if (detalleErr) {
    return (
      <div className="container py-3">
        <button className="btn btn-link mb-3" onClick={volverAlListado}>
          ← Volver al listado
        </button>
        <div className="alert alert-danger">{detalleErr}</div>
      </div>
    );
  }

  return (
    <div className="container py-3">
      <button className="btn btn-link mb-3" onClick={volverAlListado}>
        ← Volver al listado
      </button>

      <h4 className="mb-3">Jornada #{selectedJornada.id}</h4>

      {/* Editar nombre de la jornada */}
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="h6 mb-3">Nombre de la jornada</div>
          <div className="row g-2 align-items-end">
            <div className="col-sm-8">
              <input
                className="form-control"
                value={detalleNombre}
                onChange={(e) => setDetalleNombre(e.target.value)}
              />
            </div>
            <div className="col-sm-4 d-grid">
              <button
                className="btn btn-primary"
                disabled={savingNombre}
                onClick={handleSaveNombre}
              >
                {savingNombre ? 'Guardando…' : 'Guardar nombre'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Turnos asociados */}
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="h6 mb-3">Turnos actuales ({detalleTurnos.length})</div>
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th style={{width:60}}>ID</th>
                  <th>Nombre</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th>Tolerancia (min)</th>
                  <th style={{width:120}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {detalleTurnos.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.nombre}</td>
                    <td>{t.hora_entrada}</td>
                    <td>{t.hora_salida}</td>
                    <td>{t.tolerancia_min}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveTurno(t.id)}
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
                {detalleTurnos.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      Esta jornada no tiene turnos asignados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <small className="text-muted">
            (No mostramos día de la semana ni vigencias acá, pero internamente se guardan con valores por defecto.)
          </small>
        </div>
      </div>

      {/* Agregar turno nuevo a esta jornada */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="h6 mb-3">Agregar turno a esta jornada</div>
          <form className="row g-2 align-items-end" onSubmit={handleAddTurno}>
            <div className="col-sm-3">
              <label className="form-label">Nombre turno</label>
              <input
                className="form-control"
                required
                value={nuevoTurno.nombre}
                onChange={(e) => setNuevoTurno({ ...nuevoTurno, nombre: e.target.value })}
              />
            </div>
            <div className="col-sm-2">
              <label className="form-label">Entrada</label>
              <input
                className="form-control"
                type="time"
                required
                value={nuevoTurno.hora_entrada}
                onChange={(e) => setNuevoTurno({ ...nuevoTurno, hora_entrada: e.target.value })}
              />
            </div>
            <div className="col-sm-2">
              <label className="form-label">Salida</label>
              <input
                className="form-control"
                type="time"
                required
                value={nuevoTurno.hora_salida}
                onChange={(e) => setNuevoTurno({ ...nuevoTurno, hora_salida: e.target.value })}
              />
            </div>
            <div className="col-sm-2">
              <label className="form-label">Tol. (min)</label>
              <input
                className="form-control"
                type="number"
                value={nuevoTurno.tolerancia_min}
                onChange={(e) => setNuevoTurno({ ...nuevoTurno, tolerancia_min: e.target.value })}
              />
            </div>
            <div className="col-sm-3 d-grid">
              <button
                type="submit"
                className="btn btn-success"
                disabled={savingTurno}
              >
                {savingTurno ? 'Agregando…' : 'Agregar turno'}
              </button>
            </div>
          </form>
          <small className="text-muted">
            Al agregarlo, se crea automáticamente el turno y se vincula a la jornada.
          </small>
        </div>
      </div>

    </div>
  );
}
