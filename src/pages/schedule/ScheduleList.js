import { useEffect, useState, useCallback } from "react";
import { Table, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

export default function ScheduleList() {
  const [schedules, setSchedules] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [schedulesPerPage] = useState(10); // Número de horarios por página

  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Función para cargar los horarios desde la API
  const loadSchedules = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/schedules/`, {
        credentials: "include",
      });
      const data = await res.json();
      setSchedules(data);
    } catch (error) {
      console.error("Error al cargar los horarios:", error);
      setSchedules([]);
    }
  }, [apiUrl]);

  // Función para eliminar un horario
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este horario?"
    );
    if (!confirmDelete) {
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/schedules/${id}`, {
        credentials: "include",
        method: "DELETE",
      });

      setSchedules(schedules.filter((schedule) => schedule.id !== id));
    } catch (error) {
      console.error("Error al eliminar el horario:", error);
      alert("Error desconocido al eliminar el horario");
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  // Paginación
  const indexOfLastSchedule = currentPage * schedulesPerPage;
  const indexOfFirstSchedule = indexOfLastSchedule - schedulesPerPage;
  const currentSchedules = schedules.slice(
    indexOfFirstSchedule,
    indexOfLastSchedule
  );

  const nextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const prevPage = () => {
    setCurrentPage((prev) => prev - 1);
  };

  return (
    <Container>
      <h1 className="my-list-title dark-text">
        Lista de Horarios de Sincronización
      </h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Hora</th>
            <th>Minuto</th>
            <th>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {currentSchedules.map((schedule, index) => (
            <tr key={schedule.id}>
              <td>{index + 1}</td>
              <td>{schedule.hour}</td>
              <td>{schedule.minute}</td>
              <td className="text-center">
                <Button
                  variant="danger"
                  onClick={() => handleDelete(schedule.id)}
                  className="mx-2"
                >
                  Eliminar
                </Button>
                <Button
                  color="inherit"
                  onClick={() => navigate(`/schedules/${schedule.id}/edit`)}
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
          {Math.ceil(schedules.length / schedulesPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={
            currentPage === Math.ceil(schedules.length / schedulesPerPage)
          }
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
