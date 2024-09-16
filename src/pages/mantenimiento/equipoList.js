import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Container, FormControl, Row, Col } from 'react-bootstrap';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import Contexts from '../../context/Contexts';

export default function EquipoList() {
  const [equipos, setEquipos] = useState([]);
  const [filteredEquipos, setFilteredEquipos] = useState([]); // Equipos filtrados por sucursal
  const [buscarSucursal, setBuscarSucursal] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [equiposPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const context = useContext(Contexts.DataContext);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const response = await fetch(`${apiUrl}/equipos`);
        const data = await response.json();
        setEquipos(Array.isArray(data) ? data : []);
        setFilteredEquipos(Array.isArray(data) ? data : []); // Inicialmente, mostrar todos los equipos
      } catch (error) {
        console.error('Error al obtener los equipos:', error);
        setEquipos([]); // Manejo seguro en caso de error
      }
    };

    fetchEquipos();
  }, [apiUrl]);

  // Filtra los equipos cada vez que se cambia la sucursal seleccionada
  useEffect(() => {
    if (buscarSucursal) {
      setFilteredEquipos(equipos.filter((equipo) => equipo.sucursal_id === parseInt(buscarSucursal)));
    } else {
      setFilteredEquipos(equipos); // Mostrar todos los equipos si no se selecciona una sucursal
    }
  }, [buscarSucursal, equipos]);

  const handleSort = (columnName) => {
    setSortDirection(
      columnName === sortColumn && sortDirection === 'asc' ? 'desc' : 'asc'
    );
    setSortColumn(columnName);

    const sortedEquipos = [...filteredEquipos].sort((a, b) => {
      let valueA = a[columnName];
      let valueB = b[columnName];

      if (columnName === 'nombre' || columnName === 'marca') {
        valueA = valueA.toUpperCase();
        valueB = valueB.toUpperCase();
      }

      if (valueA < valueB) {
        return sortDirection === 'asc' ? -1 : 1;
      } else if (valueA > valueB) {
        return sortDirection === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });

    setFilteredEquipos(sortedEquipos);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("¿Está seguro que desea eliminar este equipo?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${apiUrl}/equipos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.status === 400 && result.error) {
        alert(result.error); // Mostrar el mensaje de que no se puede eliminar si está asociado
      } else if (response.ok) {
        setEquipos((prevEquipos) => prevEquipos.filter((equipo) => equipo.id !== id));
        setFilteredEquipos((prevFiltered) => prevFiltered.filter((equipo) => equipo.id !== id));
      } else {
        throw new Error('Error al eliminar el equipo');
      }
    } catch (error) {
      console.error('Error al eliminar el equipo:', error);
      alert('Hubo un problema al eliminar el equipo. Por favor, intente nuevamente.');
    }
  };

  const indexOfLastEquipo = currentPage * equiposPerPage;
  const indexOfFirstEquipo = indexOfLastEquipo - equiposPerPage;
  const currentEquipos = filteredEquipos.slice(indexOfFirstEquipo, indexOfLastEquipo);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredEquipos.length / equiposPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Container fluid>
      <h1 className="my-list-title dark-text text-center">Lista de Equipos</h1>

      <Row className="mb-3 d-flex align-items-center justify-content-start">
  <Col xs={12} md={8} className="d-flex align-items-center">
    <FormControl
      as="select"
      value={buscarSucursal}
      onChange={(e) => setBuscarSucursal(e.target.value)}
      className="mr-2"
      style={{ fontSize: "14px", maxWidth: "200px" }} // Ajuste para pantallas grandes y pequeñas
    >
      <option value="">Seleccione una sucursal</option>
      {context.sucursalesTabla.map((sucursal) => (
        <option key={sucursal.id} value={sucursal.id}>
          {sucursal.nombre}
        </option>
      ))}
    </FormControl>
    <Link
      to="/equipos/new"
      className="btn btn-primary"
      style={{ fontSize: "14px", maxWidth: "150px" }} // Ajuste para pantallas grandes y pequeñas
    >
      Crear Equipo
    </Link>
  </Col>
</Row>


      <Table striped bordered hover responsive="sm" className="table-sm">
        <thead>
          <tr>
            <th onClick={() => handleSort('nombre')} style={{ cursor: 'pointer', fontSize: '12px' }}>
              Nombre
            </th>
            <th onClick={() => handleSort('marca')} style={{ cursor: 'pointer', fontSize: '12px' }}>
              Marca
            </th>
            <th onClick={() => handleSort('numero_serie')} style={{ cursor: 'pointer', fontSize: '12px' }}>
              Número de Serie
            </th>
            <th onClick={() => handleSort('fecha_compra')} style={{ cursor: 'pointer', fontSize: '12px' }}>
              Fecha de Compra
            </th>
            <th onClick={() => handleSort('sucursal_id')} style={{ cursor: 'pointer', fontSize: '12px' }}>
              Sucursal
            </th>
            <th style={{ fontSize: '12px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentEquipos.length > 0 ? (
            currentEquipos.map((equipo) => (
              <tr key={equipo.id}>
                <td>{equipo.nombre}</td>
                <td>{equipo.marca}</td>
                <td>{equipo.numero_serie}</td>
                <td>{equipo.fecha_compra}</td>
                <td>
                  {context.sucursalesTabla.find(
                    (sucursal) => sucursal.id === equipo.sucursal_id
                  )?.nombre || 'Desconocido'}
                </td>
                <td>
                  <div className="d-flex flex-column flex-md-row">
                    <Link
                      to={`/equipos/${equipo.id}/edit`}
                      className="btn btn-warning btn-sm mr-md-2 mb-2 mb-md-0"
                    >
                      Editar
                    </Link>
                    <Button
                      variant="danger"
                      className="btn-sm"
                      onClick={() => handleDelete(equipo.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No se encontraron equipos.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <div className="d-flex justify-content-center align-items-center mt-3">
        <Button onClick={prevPage} disabled={currentPage === 1} className="btn-sm">
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de {Math.ceil(filteredEquipos.length / equiposPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={currentPage === Math.ceil(filteredEquipos.length / equiposPerPage)}
          className="btn-sm"
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
