import React, { useState, useContext, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Form,
  Spinner,
  Modal,
  Row,
  Col,
  Card
} from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../../context/Contexts";
import * as XLSX from "xlsx";


export default function MovimientosOtros() {
  const [movimientos, setMovimientos] = useState([]);
  const [searchSucursal, setSearchSucursal] = useState("");
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [movimientosPerPage] = useState(100);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [fechasUnicas, setFechasUnicas] = useState([]);
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState([]);

  // NUEVO: sucursales por fetch (no por context)
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const userContext = useContext(Contexts.UserContext);

  useEffect(() => {
    setMovimientos([]);
    setNoResults(false);
    setCurrentPage(1);
  }, [startDate, endDate, searchSucursal, tipoSeleccionado]);

  // ========= Fetch de sucursales =========
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        const res = await fetch(`${apiUrl}/sucursales`, { credentials: "include" });
        const data = await res.json();
        setBranches(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error obteniendo sucursales:", err);
        setBranches([]);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, [apiUrl]);

  const exportToExcel = (rows, filename) => {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      "MovimientosOtros"
    );
    XLSX.writeFile(wb, filename);
  };

  const exportarExcel = () => {
    try {

      if (
        !movimientosFiltrados ||
        movimientosFiltrados.length === 0
      ) {
        alert("No hay datos para exportar.");
        return;
      }

      const rows =
        movimientosFiltrados.map((mov) => ({
          fecha: mov.fecha,
          lote: mov.numerolote,
          codigo: mov.articulocodigo,
          descripcion: mov.articulodescripcion,
          cantidad: mov.cantidad,
          tipo: mov.tipo,
          sucursalDestino:
            sucursalNombreById(
              mov.sucursaldestino_id
            ),
        }));

      exportToExcel(
        rows,
        `movimientos_otros_${new Date()
          .toISOString()
          .slice(0, 10)
        }.xlsx`
      );

    } catch (error) {

      console.error(
        "Error al exportar:",
        error
      );

      alert(
        "Error al exportar Excel."
      );

    }
  };

  const obtenerFechasUnicas = async () => {
    try {
      const res = await fetch(`${apiUrl}/movimientos-otro/fechas-unicas`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      setFechasUnicas(data || []);
    } catch (err) {
      console.error("Error obteniendo fechas únicas", err);
    }
  };

  const handleEliminarMasivo = async () => {
    if (fechasSeleccionadas.length === 0) return;
    if (!window.confirm("¿Seguro que deseas eliminar los movimientos seleccionados?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/movimientos-otro/eliminar-por-fechas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fechas: fechasSeleccionadas }),
      });
      const data = await res.json();
      alert(data?.mensaje || "Operación realizada");
      setShowModal(false);
      handleFilter();
    } catch (err) {
      console.error("Error al eliminar masivamente:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    try {
      setLoading(true);
      setNoResults(false);

      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/movimientos-otro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fechaDesde: startDate,
          fechaHasta: endDate,
          sucursalId: searchSucursal,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (!data || data.length === 0) {
          setNoResults(true);
          setMovimientos([]);
        } else {
          setMovimientos(data);
          setCurrentPage(1);
        }
      } else {
        throw new Error("Error al obtener los movimientos internos");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (columnName) => {
    setSortDirection(
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc"
    );
    setSortColumn(columnName);

    const sortedMovimientos = [...movimientos].sort((a, b) => {
      let valueA = a[columnName];
      let valueB = b[columnName];

      if (columnName === "fecha") {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
      }

      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setMovimientos(sortedMovimientos);
  };

  const isValidDate = (dateString) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;
    const date = new Date(dateString);
    if (!date.getTime()) return false;
    return date.toISOString().slice(0, 10) === dateString;
  };

  const handleEliminarMovimiento = async (movimientoId) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este movimiento?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${apiUrl}/movimientos-otro/${movimientoId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        await response.json();
        setMovimientos((prev) => prev.filter((m) => m.id !== movimientoId));
      } else {
        throw new Error("Error al eliminar el movimiento interno");
      }
    } catch (error) {
      console.error("Error al eliminar el movimiento interno:", error);
    }
  };

  const nextPage = () => {
    if (currentPage < Math.ceil(movimientosFiltrados.length / movimientosPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const indexOfLastMovimiento = currentPage * movimientosPerPage;
  const indexOfFirstMovimiento = indexOfLastMovimiento - movimientosPerPage;

  const movimientosFiltrados = tipoSeleccionado
    ? movimientos.filter((m) => m.tipo === tipoSeleccionado)
    : movimientos;

  const currentMovimientos = movimientosFiltrados.slice(
    indexOfFirstMovimiento,
    indexOfLastMovimiento
  );

  const tiposDisponibles = [...new Set(movimientos.map((m) => m.tipo))];

  const sucursalNombreById = (id) => {
    const s = branches.find((b) => Number(b.id) === Number(id));
    return s?.nombre || "Desconocido";
    // si usás sucursaldestino_id, asegurate de pasar ese ID aquí
  };
  return (

    <Container fluid>

      <Card>

        {/* =====================================================
                ENCABEZADO
            ===================================================== */}

        <Card.Header>

          <h3 className="mb-0">
            Movimientos Fábrica, Achuras y otros
          </h3>

        </Card.Header>


        <Card.Body>

          {/* =====================================================
                    FILTROS
                ===================================================== */}

          <Row className="mb-3">

            <Col md={2}>

              <Form.Label>
                Fecha Desde
              </Form.Label>

              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(
                    e.target.value
                  )
                }
                disabled={loading}
              />

            </Col>


            <Col md={2}>

              <Form.Label>
                Fecha Hasta
              </Form.Label>

              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) =>
                  setEndDate(
                    e.target.value
                  )
                }
                disabled={loading}
              />

            </Col>


            <Col md={3}>

              <Form.Label>
                Sucursal
              </Form.Label>

              <Form.Select
                value={searchSucursal}
                onChange={(e) => {

                  setSearchSucursal(
                    e.target.value
                  );

                  setTipoSeleccionado("");

                }}
                disabled={
                  loading ||
                  loadingBranches
                }
              >

                <option value="">

                  {
                    loadingBranches
                      ? "Cargando sucursales..."
                      : "Todas las sucursales"
                  }

                </option>


                {branches.map(
                  (sucursal) => (

                    <option
                      key={sucursal.id}
                      value={sucursal.id}
                    >
                      {sucursal.nombre}
                    </option>

                  )
                )}

              </Form.Select>

            </Col>


            <Col md={2}>

              <Form.Label>
                Tipo
              </Form.Label>

              <Form.Select
                value={tipoSeleccionado}
                onChange={(e) => {

                  setTipoSeleccionado(
                    e.target.value
                  );

                  setCurrentPage(1);

                }}
                disabled={
                  loading ||
                  movimientos.length === 0
                }
              >

                <option value="">
                  Todos
                </option>

                {tiposDisponibles.map(
                  (tipo, i) => (

                    <option
                      key={i}
                      value={tipo}
                    >
                      {tipo}
                    </option>

                  )
                )}

              </Form.Select>

            </Col>


            <Col
              md={3}
              className="d-flex align-items-end"
            >

              <Button
                variant="primary"
                onClick={
                  handleFilter
                }
                disabled={loading}
              >
                Buscar
              </Button>


              <Button
                variant="success"
                className="ms-2"
                onClick={
                  exportarExcel
                }
                disabled={
                  loading ||
                  movimientosFiltrados.length === 0
                }
              >
                Exportar Excel
              </Button>

            </Col>

          </Row>


          {/* =====================================================
                    SEGUNDA FILA
                ===================================================== */}

          <div
            className="d-flex justify-content-between align-items-center mb-2"
          >

            <strong>
              Registros:{" "}
              {movimientosFiltrados.length}
            </strong>


            {userContext.user?.rol_id !== 4 && (

              <Button
                variant="danger"
                size="sm"
                onClick={() => {

                  obtenerFechasUnicas();

                  setShowModal(true);

                }}
                disabled={loading}
              >
                Eliminación Masiva
              </Button>

            )}

          </div>


          {/* =====================================================
                    LOADING
                ===================================================== */}

          {loading && (

            <div className="mb-3">

              <Spinner
                animation="border"
                size="sm"
              />

              <span className="ms-2">
                Cargando...
              </span>

            </div>

          )}


          {noResults && (

            <div className="alert alert-warning">

              No se encontraron movimientos
              para las fechas especificadas.

            </div>

          )}


          {movimientos.length === 0 &&
            !loading &&
            !noResults && (

              <div className="text-muted mb-3">

                Modificaste los filtros.
                Presioná "Buscar" para ver
                los resultados actualizados.

              </div>

            )}


          {/* =====================================================
                    TABLA
                ===================================================== */}

          <Table
            striped
            bordered
            hover
            responsive
          >

            <thead>

              <tr>

                <th
                  onClick={() =>
                    handleSort(
                      "fecha"
                    )
                  }
                  style={{
                    cursor: "pointer"
                  }}
                >
                  Fecha
                </th>


                <th
                  onClick={() =>
                    handleSort(
                      "numerolote"
                    )
                  }
                  style={{
                    cursor: "pointer"
                  }}
                >
                  Lote
                </th>


                <th
                  onClick={() =>
                    handleSort(
                      "articulocodigo"
                    )
                  }
                  style={{
                    cursor: "pointer"
                  }}
                >
                  Código de Artículo
                </th>


                <th
                  onClick={() =>
                    handleSort(
                      "articulodescripcion"
                    )
                  }
                  style={{
                    cursor: "pointer"
                  }}
                >
                  Descripción de Artículo
                </th>


                <th
                  onClick={() =>
                    handleSort(
                      "cantidad"
                    )
                  }
                  className="text-end"
                  style={{
                    cursor: "pointer"
                  }}
                >
                  Cantidad
                </th>


                <th
                  onClick={() =>
                    handleSort(
                      "tipo"
                    )
                  }
                  style={{
                    cursor: "pointer"
                  }}
                >
                  Tipo
                </th>


                <th
                  onClick={() =>
                    handleSort(
                      "sucursaldestino_id"
                    )
                  }
                  style={{
                    cursor: "pointer"
                  }}
                >
                  Sucursal
                </th>


                {userContext.user?.rol_id !== 4 && (

                  <th className="text-center">
                    Operaciones
                  </th>

                )}

              </tr>

            </thead>


            <tbody>

              {currentMovimientos.map(
                (movimiento) => (

                  <tr
                    key={
                      movimiento.id
                    }
                  >

                    <td>
                      {movimiento.fecha}
                    </td>


                    <td>

                      <strong>
                        {
                          movimiento.numerolote
                        }
                      </strong>

                    </td>


                    <td>
                      {
                        movimiento.articulocodigo
                      }
                    </td>


                    <td>
                      {
                        movimiento.articulodescripcion
                      }
                    </td>


                    <td className="text-end">

                      {
                        Number(
                          movimiento.cantidad ||
                          0
                        ).toFixed(3)
                      }

                    </td>


                    <td>
                      {
                        movimiento.tipo
                      }
                    </td>


                    <td>

                      {
                        sucursalNombreById(
                          movimiento.sucursaldestino_id
                        )
                      }

                    </td>


                    {userContext.user?.rol_id !== 4 && (

                      <td className="text-center">

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            handleEliminarMovimiento(
                              movimiento.id
                            )
                          }
                          disabled={
                            loading
                          }
                        >
                          Eliminar
                        </Button>

                      </td>

                    )}

                  </tr>

                )
              )}

            </tbody>

          </Table>


          {/* =====================================================
                    PAGINACIÓN
                ===================================================== */}

          <div
            className="d-flex justify-content-center mt-3"
          >

            <Button
              variant="outline-primary"
              disabled={
                currentPage === 1 ||
                loading
              }
              onClick={
                prevPage
              }
            >
              Anterior
            </Button>


            <span
              className="mx-3 align-self-center"
            >

              Página{" "}
              {currentPage}
              {" "}de{" "}

              {
                Math.max(
                  1,
                  Math.ceil(
                    movimientosFiltrados.length /
                    movimientosPerPage
                  )
                )
              }

            </span>


            <Button
              variant="outline-primary"
              disabled={
                currentPage >=
                Math.max(
                  1,
                  Math.ceil(
                    movimientosFiltrados.length /
                    movimientosPerPage
                  )
                ) ||
                loading
              }
              onClick={
                nextPage
              }
            >
              Siguiente
            </Button>

          </div>

        </Card.Body>

      </Card>


      {/* ============================================================
            MODAL ELIMINACIÓN MASIVA
        ============================================================ */}

      <Modal
        show={showModal}
        onHide={() =>
          setShowModal(false)
        }
        size="lg"
      >

        <Modal.Header closeButton>

          <Modal.Title>
            Eliminar movimientos por fecha de carga
          </Modal.Title>

        </Modal.Header>


        <Modal.Body>

          <Form.Label>
            Fechas de carga
          </Form.Label>

          <Form.Select
            multiple
            size={10}
            value={fechasSeleccionadas}
            onChange={(e) => {

              const options =
                Array.from(
                  e.target.selectedOptions
                ).map(
                  (o) =>
                    o.value
                );

              setFechasSeleccionadas(
                options
              );

            }}
            style={{
              minHeight: 260
            }}
          >

            {fechasUnicas.map(
              (fecha) => (

                <option
                  key={fecha}
                  value={fecha}
                >

                  {
                    new Date(
                      fecha
                    ).toLocaleString(
                      "es-AR",
                      {
                        timeZone:
                          "America/Argentina/Buenos_Aires"
                      }
                    )
                  }

                </option>

              )
            )}

          </Form.Select>

          <Form.Text muted>

            Puede seleccionar varias fechas
            manteniendo presionada la tecla
            Ctrl.

          </Form.Text>

        </Modal.Body>


        <Modal.Footer>

          <Button
            variant="secondary"
            onClick={() =>
              setShowModal(false)
            }
          >
            Cancelar
          </Button>


          <Button
            variant="danger"
            onClick={
              handleEliminarMasivo
            }
            disabled={
              fechasSeleccionadas.length ===
              0
            }
          >
            Eliminar
          </Button>

        </Modal.Footer>

      </Modal>

    </Container>

  );
}
