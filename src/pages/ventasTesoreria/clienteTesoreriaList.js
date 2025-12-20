import { useContext, useMemo, useState } from "react";
import { Table, Container, Form, Row, Col, Button } from "react-bootstrap";
import Contexts from "../../context/Contexts";

export default function ClienteTesoreriaList() {
  const dataContext = useContext(Contexts.DataContext) || {};
  const { clientesTabla = [] } = dataContext;

  // ===== filtros + paginado (client-side) =====
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1); // 1-based
  const [limit, setLimit] = useState(25);

  const filtered = useMemo(() => {
    const query = String(q || "").trim().toLowerCase();
    if (!query) return clientesTabla;

    return clientesTabla.filter((c) => {
      const nombre = (c?.nombre || "").toLowerCase();
      const doc = (c?.nro_doc || c?.numero || c?.cuil || "").toString().toLowerCase();
      const tel = (c?.telefono || "").toString().toLowerCase();
      const email = (c?.email || "").toLowerCase();
      const obs = (c?.observaciones || "").toLowerCase();

      return (
        nombre.includes(query) ||
        doc.includes(query) ||
        tel.includes(query) ||
        email.includes(query) ||
        obs.includes(query)
      );
    });
  }, [clientesTabla, q]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const pageSafe = Math.min(Math.max(1, page), totalPages);

  const paged = useMemo(() => {
    const start = (pageSafe - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, pageSafe, limit]);

  const canPrev = pageSafe > 1;
  const canNext = pageSafe < totalPages;

  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Clientes</h1>

      {/* Filtros + paginado */}
      <Row className="align-items-end mb-3">
        <Col md={6}>
          <Form.Label>Buscar</Form.Label>
          <Form.Control
            placeholder="Nombre, documento, teléfono, email, observaciones..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1); // al cambiar filtro, volvemos a página 1
            }}
          />
          <small className="text-muted">
            Resultados: {total} — Página {pageSafe} / {totalPages}
          </small>
        </Col>

        <Col md={3}>
          <Form.Label>Por página</Form.Label>
          <Form.Select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Form.Select>
        </Col>

        <Col md={3} className="d-flex gap-2 justify-content-md-end mt-3 mt-md-0">
          <Button variant="secondary" disabled={!canPrev} onClick={() => setPage(pageSafe - 1)}>
            ◀ Anterior
          </Button>
          <Button variant="secondary" disabled={!canNext} onClick={() => setPage(pageSafe + 1)}>
            Siguiente ▶
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>DNI</th>
            {/* <th>Email</th>
            <th>Margen</th> */}
          </tr>
        </thead>

        <tbody>
          {paged.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-4 text-muted">
                Sin resultados
              </td>
            </tr>
          ) : (
            paged.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.nombre}</td>
                <td>{c.apellido}</td>
                <td>{c.numero}</td>
                {/* <td>{c.email}</td>
                <td>{c.margen}%</td> */}
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Container>
  );
}
