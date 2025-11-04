import React, { useState, useEffect } from 'react';
import { Table, Button, Container, FormControl, Row, Col } from 'react-bootstrap';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { Link } from 'react-router-dom';

export default function EquipoList() {
  const [equipos, setEquipos] = useState([]);
  const [filteredEquipos, setFilteredEquipos] = useState([]);
  const [buscarSucursal, setBuscarSucursal] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [equiposPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // NUEVO: sucursales por fetch (no context)
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  // Fetch sucursales
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        const res = await fetch(`${apiUrl}/sucursales`, { credentials: 'include' });
        const data = await res.json();
        setBranches(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error al obtener sucursales:', err);
        setBranches([]);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, [apiUrl]);

  // Fetch equipos
  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const response = await fetch(`${apiUrl}/equipos`, { credentials: 'include' });
        const data = await response.json();
        setEquipos(Array.isArray(data) ? data : []);
        setFilteredEquipos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al obtener los equipos:', error);
        setEquipos([]);
        setFilteredEquipos([]);
      }
    };
    fetchEquipos();
  }, [apiUrl]);

  // Filtra por sucursal
  useEffect(() => {
    if (buscarSucursal) {
      setFilteredEquipos(
        equipos.filter((equipo) => Number(equipo.sucursal_id) === Number(buscarSucursal))
      );
    } else {
      setFilteredEquipos(equipos);
    }
    setCurrentPage(1);
  }, [buscarSucursal, equipos]);

  const handleSort = (columnName) => {
    setSortDirection(columnName === sortColumn && sortDirection === 'asc' ? 'desc' : 'asc');
    setSortColumn(columnName);

    const sortedEquipos = [...filteredEquipos].sort((a, b) => {
      let valueA = a[columnName];
      let valueB = b[columnName];

      if (columnName === 'nombre' || columnName === 'marca') {
        valueA = (valueA ?? '').toString().toUpperCase();
        valueB = (valueB ?? '').toString().toUpperCase();
      }

      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredEquipos(sortedEquipos);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('¿Está seguro que desea eliminar este equipo?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${apiUrl}/equipos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.status === 400 && result.error) {
        alert(result.error);
      } else if (response.ok) {
        setEquipos((prev) => prev.filter((e) => e.id !== id));
        setFilteredEquipos((prev) => prev.filter((e) => e.id !== id));
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

  const sucursalNombreById = (id) => {
    const s = branches.find((b) => Number(b.id) === Number(id));
    return s?.nombre || 'Desconocido';
  };

  return (
    <Container fluid className="vt-page">
      <h1 className="my-list-title dark-text vt-title text-center">
        Lista de Equipos
      </h1>

      {/* TOOLBAR - IGUAL QUE EN INVENTARIO */}
      <div className="vt-toolbar mb-3 d-flex flex-wrap align-items-end gap-3">
        {/* Sucursal */}
        <div className="d-inline-block w-auto">
          <label className="vt-label d-block mb-1">Sucursal</label>
          <FormControl
            as="select"
            value={buscarSucursal}
            onChange={(e) => setBuscarSucursal(e.target.value)}
            className="vt-input"
            style={{ minWidth: 240 }}
            disabled={loadingBranches}
          >
            <option value="">
              {loadingBranches ? 'Cargando sucursales...' : 'Seleccione una sucursal'}
            </option>
            {branches.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>
                {sucursal.nombre}
              </option>
            ))}
          </FormControl>
        </div>

        {/* Botón Crear */}
        <div className="d-inline-block">
          <Link
            to="/equipos/new"
            className="btn btn-primary shadow-sm d-inline-flex align-items-center justify-content-center"
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.2s ease-in-out',
              height: '40px', // altura consistente
              whiteSpace: 'nowrap',
              marginLeft: "12px", // 👈 fuerza el espacio
            }}
          >
            <i className="bi bi-plus-lg me-2"></i> Crear Equipo
          </Link>
        </div>
      </div>

      {/* TABLA */}
      <div className="vt-tablewrap table-responsive">
        <Table striped bordered hover responsive="sm" className="mb-2 table-sm">
          <thead>
            <tr>
              <th onClick={() => handleSort('nombre')} className="vt-th-sort">
                Nombre
              </th>
              <th onClick={() => handleSort('marca')} className="vt-th-sort">
                Marca
              </th>
              <th onClick={() => handleSort('numero_serie')} className="vt-th-sort">
                Número de Serie
              </th>
              <th onClick={() => handleSort('fecha_compra')} className="vt-th-sort">
                Fecha de Compra
              </th>
              <th onClick={() => handleSort('sucursal_id')} className="vt-th-sort">
                Sucursal
              </th>
              <th className="text-center">Acciones</th>
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
                  <td>{sucursalNombreById(equipo.sucursal_id)}</td>
                  <td className="text-center">
                    <div className="d-inline-flex gap-2">
                      <Link
                        to={`/equipos/${equipo.id}/edit`}
                        className="btn btn-warning vt-btn-sm"
                      >
                        <i className="bi bi-pencil-square me-1"></i>
                        Editar
                      </Link>

                      <Button
                        variant="danger"
                        size="sm"
                        className="vt-btn-danger"
                        onClick={() => handleDelete(equipo.id)}
                      >
                        <i className="bi bi-trash me-1"></i>
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No se encontraron equipos.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* PAGINACIÓN */}
      <div className="d-flex justify-content-center align-items-center vt-pager">
        <Button
          onClick={prevPage}
          disabled={currentPage === 1}
          variant="light"
          className="vt-btn-sm"
        >
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de {Math.ceil(filteredEquipos.length / equiposPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={currentPage === Math.ceil(filteredEquipos.length / equiposPerPage)}
          variant="light"
          className="vt-btn-sm"
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
