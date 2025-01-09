import { useContext, useEffect, useState, useCallback } from "react";
import { Table, Container, Button, FormControl } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
// import { parse } from "date-fns";
import Contexts from "../../context/Contexts";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

export default function ReceiptList() {
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [searchCategoria, setSearchCategoria] = useState("");

  // paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const [receiptsPerPage] = useState(20);

  const context = useContext(Contexts.UserContext);
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  const loadReceipts = useCallback(async () => {
    const res = await fetch(`${apiUrl}/ingresos/`, {
      credentials: "include",
    });
    const data = await res.json();
    const sortedReceipts = data.sort((a, b) => a.id - b.id);
    setReceipts(sortedReceipts);
    setFilteredReceipts(sortedReceipts); // Inicialmente mostramos todos los recibos
  }, [apiUrl]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este ingreso?"
    );
    if (!confirmDelete) {
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/ingresos/${id}`, {
        credentials: "include",
        method: "DELETE",
      });

      const data = await res.json();

      // Verificar si la respuesta contiene un mensaje de error
      if (res.status === 400) {
        // Mostrar un alert con el mensaje de error
        window.alert(data.mensaje);
      } else {
        // Eliminación exitosa, actualizar la lista de ingresos

        setReceipts(receipts.filter((receipt) => receipt.id !== id));
        setFilteredReceipts(
          filteredReceipts.filter((receipt) => receipt.id !== id)
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Define la función para convertir las fechas al formato deseado
  // const parseDate = (dateString) => {
  //   const [year, month, day] = dateString.split("-");
  //   return parse(`${year}-${month}-${day}`, "yyyy-MM-dd", new Date());
  // };

  const handleFilter = useCallback(() => {
    const startDateFilter = startDate ? startDate : null;
    const endDateFilter = endDate ? endDate : null;

    if (searchCategoria === "" && !startDate && !endDate) {
      // No hay criterios de búsqueda. Mostrar todos los ingresos.
      setFilteredReceipts(receipts);
    } else {
      const filtered = receipts.filter((receipt) => {
        const categoriaMatch = receipt.categoria_ingreso
          .toString()
          .includes(searchCategoria);

        // Convertir la fecha de creación al formato de objeto Date
        const receiptDate = receipt.fecha;
        // Verificar si la fecha de creación está dentro del rango especificado
        const startDateMatch =
          !startDateFilter || receiptDate >= startDateFilter;
        const endDateMatch = !endDateFilter || receiptDate <= endDateFilter;

        return categoriaMatch && startDateMatch && endDateMatch;
      });

      setFilteredReceipts(filtered);
    }
  }, [startDate, endDate, receipts, searchCategoria]);

  useEffect(() => {
    loadReceipts();
  }, [loadReceipts]);

  useEffect(() => {
    handleFilter();
  }, [startDate, endDate, searchCategoria, handleFilter]);

  // Cálculo de la paginación para los productos filtrados
  // const indexOfLastReceipt = currentPage * receiptsPerPage;
  // const indexOfFirstReceipt = indexOfLastReceipt - receiptsPerPage;
  // const currentFilteredReceipts = filteredReceipts.slice(
  //   indexOfFirstReceipt,
  //   indexOfLastReceipt
  // );

  const indexOfLastReceipt = currentPage * receiptsPerPage;
  const indexOfFirstReceipt = indexOfLastReceipt - receiptsPerPage;
  const currentFilteredReceipts = [...filteredReceipts] // Crea una copia para evitar modificar el original
    .reverse() // Invierte el orden de los elementos
    .slice(indexOfFirstReceipt, indexOfLastReceipt); // Aplica la paginación 

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredReceipts.length / receiptsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Calcula el resumen por categoría
  const categorySummary = filteredReceipts.reduce((summary, receipt) => {
    const category = receipt.categoria_ingreso;

    if (!summary[category]) {
      summary[category] = {
        cantidad: 0,
      };
    }

    summary[category].cantidad += receipt.cantidad_total;

    return summary;
  }, {});

  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Ingresos</h1>
      {/* <Table striped bordered hover variant="dark"> */}
      <div className="mb-3">
        <div className="d-inline-block w-auto">
          <label className="mr-2">DESDE: </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-control rounded-0 border-transparent text-center"
          />
        </div>

        <div className="d-inline-block w-auto ml-2">
          <label className="ml-2 mr-2">HASTA:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-control rounded-0 border-transparent text-center"
          />
        </div>
      </div>

      <div
        className="mb-3 d-flex justify-content-center align-items-center"
        style={{ maxWidth: "25%" }}
      >
        <FormControl
          type="text"
          placeholder="Filtrar por Categoria"
          className="mr-2"
          value={searchCategoria}
          onChange={(e) => setSearchCategoria(e.target.value)}
        />
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Cantidad de medias</th>
            <th>Peso total</th>
            <th>Categoria</th>
            {context.user && context.user.usuario === "admin" && (
              <th>Operaciones</th>
            )}
          </tr>
        </thead>
        <tbody>
          {currentFilteredReceipts.map((receipt) => (
            <tr
              key={receipt.id}
              style={{ cursor: "pointer" }}
              onDoubleClick={() => navigate(`/receipts/${receipt.id}/products`)}
            >
              <td>{receipt.id}</td>
              <td>{receipt.fecha}</td>
              <td>{receipt.cantidad_total}</td>
              <td>{receipt.peso_total}</td>
              <td>{receipt.categoria_ingreso}</td>
              {context.user && context.user.usuario === "admin" && (
                <td className="text-center">
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(receipt.id)}
                    className="mx-2"
                  >
                    Eliminar
                  </Button>
                </td>
              )}
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
          {Math.ceil(filteredReceipts.length / receiptsPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={
            currentPage === Math.ceil(filteredReceipts.length / receiptsPerPage)
          }
        >
          <BsChevronRight />
        </Button>
      </div>
      {/* Tabla de resumen por categoría */}
      <div style={{ maxWidth: "25%", marginTop: "20px" }}>
        {" "}
        {/* Añade un estilo inline para limitar el ancho de la tabla */}
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(categorySummary).map(([category, summary]) => (
              <tr key={category}>
                <td>{category}</td>
                <td>{summary.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  );
}
