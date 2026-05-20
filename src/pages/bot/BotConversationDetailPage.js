import { useEffect, useRef, useState } from "react";
import { Alert, Badge, Button, Card, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { getBotConversationById } from "../../services/botApi";

const BotConversationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getBotConversationById(id);

      if (!res.ok) {
        throw new Error(res.error || "No se pudo cargar la conversación");
      }

      setConversation(res.data);
    } catch (err) {
      console.error(err);
      setError("Error al cargar la conversación");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatDateTime = (value) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isInbound = (msg) => msg.direction === "inbound";

  if (loading) {
    return (
      <div className="container mt-4">
        <Card className="shadow-sm border-0">
          <Card.Body className="text-center p-4">
            <Spinner animation="border" size="sm" className="me-2" />
            Cargando conversación...
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  if (!conversation) return null;

  return (
    <div className="container mt-4">
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          {/* HEADER */}
          <div
            className="p-3 border-bottom d-flex justify-content-between align-items-center"
            style={{ background: "#f8fafc" }}
          >
            <div>
              <div className="fw-bold">
                {conversation.nombre_cliente || "Cliente WhatsApp"}
              </div>
              <small className="text-muted">
                {conversation.telefono_cliente}
              </small>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Badge bg="success">{conversation.estado || "abierta"}</Badge>

              <Button
                size="sm"
                variant="outline-secondary"
                onClick={() => navigate("/bot/conversations")}
                style={{ borderRadius: "8px" }}
              >
                Volver
              </Button>
            </div>
          </div>

          {/* MENSAJES */}
          <div
            style={{
              height: "500px",
              overflowY: "auto",
              background: "#eef2f7",
              padding: "15px",
            }}
          >
            {conversation.messages?.length === 0 ? (
              <div className="text-center text-muted">
                No hay mensajes en esta conversación.
              </div>
            ) : (
              conversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`d-flex mb-2 ${
                    isInbound(msg)
                      ? "justify-content-start"
                      : "justify-content-end"
                  }`}
                >
                  <div
                    style={{
                      maxWidth: "70%",
                      background: isInbound(msg)
                        ? "#ffffff"
                        : "#d1e7ff",
                      padding: "10px 12px",
                      borderRadius: "12px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div style={{ fontSize: "14px" }}>
                      {msg.text || "-"}
                    </div>

                    <div
                      className="text-end text-muted"
                      style={{ fontSize: "11px" }}
                    >
                      {formatDateTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}

            <div ref={messagesEndRef} />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BotConversationDetailPage;