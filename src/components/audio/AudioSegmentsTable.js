import React from "react";
import { Badge, Button, Spinner, Table } from "react-bootstrap";
import { Link } from "react-router-dom";

function BoolBadge({ value }) {
  if (value === true) return <Badge bg="success">Sí</Badge>;
  if (value === false) return <Badge bg="secondary">No</Badge>;
  return <Badge bg="light" text="dark">-</Badge>;
}

export default function AudioSegmentsTable({ rows = [], loading = false }) {
  if (loading) {
    return (
      <div className="d-flex justify-content-center py-4">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!rows.length) {
    return <div className="text-muted">No hay segmentos para mostrar.</div>;
  }

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>ID</th>
          <th>Sucursal</th>
          <th>Fecha</th>
          <th>Archivo</th>
          <th>Texto</th>
          <th>Pregunta</th>
          <th>Recomendación</th>
          <th>Venta sugerida</th>
          <th>Estado</th>
          <th>Atención</th>
          <th>Venta</th>
          <th>Oport. perdida</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.id}</td>
            <td>{row.sucursalCodigo || "-"}</td>
            <td>{row.fecha || "-"}</td>
            <td>{row.fileName || "-"}</td>
            <td style={{ maxWidth: 350 }}>
              <div className="text-truncate">
                {row.transcriptionText || "-"}
              </div>
            </td>
            <td><BoolBadge value={row.hasQuestion} /></td>
            <td><BoolBadge value={row.hasRecommendation} /></td>
            <td><BoolBadge value={row.hasSuggestedSale} /></td>
            <td>{row.analysisStatus || "-"}</td>
            <td>{row.scoreAttention ?? "-"}</td>
            <td>{row.scoreSales ?? "-"}</td>
            <td><BoolBadge value={row.missedOpportunity} /></td>
            <td>
              <Link to={`/audio/segments/${row.id}`}>
                <Button size="sm" variant="primary">
                  Ver
                </Button>
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}