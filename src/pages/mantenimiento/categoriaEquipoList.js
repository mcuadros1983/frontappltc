// pages/mantenimiento/CategoriaEquipoList.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Row, Col } from 'react-bootstrap';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { Link } from 'react-router-dom';

export default function CategoriaEquipoList() {
  const [categorias, setCategorias] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriasPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/categorias-equipos`);
        const data = await response.json();
        setCategorias(data);
      } catch (error) {
        console.error('Error al obtener las categorías:', error);
      }
    };

    fetchCategorias();
  }, []);

  const handleSort = (columnName) => {
    setSortDirection(
      columnName === sortColumn && sortDirection === 'asc' ? 'desc' : 'asc'
    );
    setSortColumn(columnName);

    const sortedCategorias = [...categorias].sort((a, b) => {
      let valueA = a[columnName].toUpperCase();
      let valueB = b[columnName].toUpperCase();

      if (valueA < valueB) {
        return sortDirection === 'asc' ? -1 : 1;
      } else if (valueA > valueB) {
        return sortDirection === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });

    setCategorias(sortedCategorias);
  };

  const indexOfLastCategoria = currentPage * categoriasPerPage;
  const indexOfFirstCategoria = indexOfLastCategoria - categoriasPerPage;
  const currentCategorias = categorias.slice(indexOfFirstCategoria, indexOfLastCategoria);

  const nextPage = () => {
    if (currentPage < Math.ceil(categorias.length / categoriasPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Categorías de Equipos</h1>

      <Link to="/categorias-equipos/new" className="btn btn-primary mb-3">
        Crear Categoría
      </Link>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th onClick={() => handleSort('nombre')} style={{ cursor: 'pointer' }}>
              Nombre
            </th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentCategorias.map((categoria) => (
            <tr key={categoria.id}>
              <td>{categoria.nombre}</td>
              <td>
                <Link to={`/categorias-equipos/${categoria.id}/edit`} className="btn btn-warning mr-2">
                  Editar
                </Link>
                <Button
                  variant="danger"
                  onClick={async () => {
                    if (window.confirm('¿Está seguro de que desea eliminar esta categoría?')) {
                      try {
                        const response = await fetch(`${process.env.REACT_APP_API_URL}/categorias-equipos/${categoria.id}`, {
                          method: 'DELETE',
                        });
                        if (response.ok) {
                          setCategorias(categorias.filter((cat) => cat.id !== categoria.id));
                        } else {
                          console.error('Error al eliminar la categoría');
                        }
                      } catch (error) {
                        console.error('Error al eliminar la categoría:', error);
                      }
                    }
                  }}
                >
                  Eliminar
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
          Página {currentPage} de {Math.ceil(categorias.length / categoriasPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={currentPage === Math.ceil(categorias.length / categoriasPerPage)}
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
