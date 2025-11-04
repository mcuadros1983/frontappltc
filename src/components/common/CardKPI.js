import React from 'react';

export default function CardKPI({ title, value, subtitle }) {
  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <div className="text-muted text-uppercase small">{title}</div>
        <div className="h3 my-1">{value}</div>
        {subtitle && <div className="text-muted">{subtitle}</div>}
      </div>
    </div>
  );
}
