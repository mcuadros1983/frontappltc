import React from 'react';
import { ResponsiveContainer, BarChart as RBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function BarChart({ data, xKey, yKey, title }) {
  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <div className="h6 mb-3">{title}</div>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <RBarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={yKey} />
            </RBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
