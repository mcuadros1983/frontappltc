import React from 'react';
import { ResponsiveContainer, LineChart as RLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function LineChart({ data, xKey = 'fecha', yKey = 'total' }) {
  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <div className="h6 mb-3">Serie diaria</div>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <RLineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey={yKey} strokeWidth={2} dot={false} />
            </RLineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
