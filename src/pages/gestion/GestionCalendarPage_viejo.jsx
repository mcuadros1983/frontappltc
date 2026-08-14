import React, { useEffect, useState } from "react";
import { Card, Container, ListGroup } from "react-bootstrap";
import gestionService from "../../services/gestionService";
import { EstadoBadge } from "../../components/gestion/shared/GestionBadges";

const GestionCalendarPage = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    gestionService.getCalendar().then(setItems);
  }, []);

  return (
    <Container fluid className="py-3">
      <h3>Calendario Gestión</h3>
      <Card>
        <Card.Header>Vencimientos</Card.Header>
        <ListGroup variant="flush">
          {items.map((e) => (
            <ListGroup.Item key={`${e.tipo}-${e.id}`} className="d-flex justify-content-between">
              <div>
                <strong>{e.titulo}</strong>
                <div className="text-muted small">{e.fecha} · {e.responsable || "Sin responsable"}</div>
              </div>
              <EstadoBadge estado={e.estado} />
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card>
    </Container>
  );
};

export default GestionCalendarPage;
