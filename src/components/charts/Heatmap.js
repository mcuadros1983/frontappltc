import React from 'react';

export default function Heatmap({ data }) {
  // Placeholder visual muy simple (podemos cambiar a una lib de heatmap más adelante)
  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <div className="h6 mb-3">Heatmap por hora</div>
        <div className="d-grid" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: 6 }}>
          {Array.from({ length: 24 }).map((_, h) => {
            const item = data.find(d => Number(d.hora) === h) || { total: 0 };
            const intensity = Math.min(1, item.total / 10); // escala simple
            const bg = `rgba(13,110,253,${intensity})`; // usa color bootstrap primario
            return (
              <div key={h} className="text-center small py-3 rounded" style={{ background: bg, color: '#fff' }}>
                {h}:00
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
