import { useEffect, useState, useCallback } from "react";
import { Table, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import "../../styles/styles.css"

export default function MessageList() {
  const [messages, setMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [messagesPerPage] = useState(10); // Número de mensajes por página

  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Función para cargar los mensajes desde la API
  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/messages`, {
        credentials: "include",
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const sortedMessages = data.sort((a, b) => 
          new Date(b.scheduleTime) - new Date(a.scheduleTime)
        );
        setMessages(sortedMessages);
      } else {
        setMessages([]); // Set to empty array if data is empty or not an array
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      setMessages([]); // Handle error by setting messages to empty array
    }
  }, [apiUrl]);

  // Función para manejar la eliminación de mensajes
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este mensaje?"
    );
    if (!confirmDelete) {
      return;
    }
  
    try {
      const res = await fetch(`${apiUrl}/messages/${id}`, {
        credentials: "include",
        method: "DELETE",
      });
  
      await loadMessages();  // Recarga los mensajes después de la eliminación
    } catch (error) {
      console.log(error);
      alert("Error desconocido al eliminar el mensaje");
    }
  };

  // Cargar mensajes cuando el componente se monta
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Lógica para paginación
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = messages.slice(
    indexOfFirstMessage,
    indexOfLastMessage
  );

  const nextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const prevPage = () => {
    setCurrentPage((prev) => prev - 1);
  };

  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Mensajes</h1>
      <Button
        onClick={() => navigate("/messages/new")}
        variant="primary"
        className="mb-3"
      >
        Crear Nuevo Mensaje
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Mensaje</th>
            <th>Hora Programada</th>
            <th>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {currentMessages.map((message, index) => (
            <tr key={message.id}>
              <td>{index + 1}</td>
              {/* Aplica la clase 'truncated-text' para truncar el texto largo */}
              <td className="truncated-text">{message.text}</td>
              <td>{new Date(message.scheduleTime).toLocaleString()}</td>
              <td className="text-center">
                <Button
                  variant="danger"
                  onClick={() => handleDelete(message.id)}
                  className="mx-2"
                >
                  Eliminar
                </Button>
                <Button
                  color="inherit"
                  onClick={() => navigate(`/messages/${message.id}/edit`)}
                >
                  Editar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="d-flex justify-content-center align-items-center">
        <Button onClick={prevPage} disabled={currentPage === 1}>
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de{" "}
          {Math.ceil(messages.length / messagesPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={currentPage === Math.ceil(messages.length / messagesPerPage)}
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}