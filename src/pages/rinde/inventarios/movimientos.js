import React, { useState, useContext, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Form,
  Spinner,
  Row,
  Col,
  Card
} from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../../context/Contexts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


export default function MovimientosInternos() {
  const [movimientos, setMovimientos] = useState([]);
  const [searchSucursal, setSearchSucursal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [movimientosPerPage] = useState(100);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");

  // NUEVO: sucursales por fetch (no por context)
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const userContext = useContext(Contexts.UserContext);

  // ========= Fetch de sucursales =========
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        const response = await fetch(`${apiUrl}/sucursales`, {
          credentials: "include",
        });
        const data = await response.json();
        setBranches(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching branches:", error);
        setBranches([]);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, [apiUrl]);

  const handleFilter = async () => {
    try {
      setLoading(true);
      setNoResults(false);
      setTipoSeleccionado("");

      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/obtenermovimientosfiltrados`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
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

  const handleSearchClick = () => handleFilter();

  const handleEliminarMovimiento = async (movimientoId) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este movimiento?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${apiUrl}/eliminarmovimientos/${movimientoId}`, {
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

  const movimientosFiltradosPorTipo = tipoSeleccionado
    ? movimientos.filter((m) => m.tipo === tipoSeleccionado)
    : movimientos;

  const nextPage = () => {
    if (
      currentPage <
      Math.ceil(movimientosFiltradosPorTipo.length / movimientosPerPage)
    ) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const indexOfLastMovimiento = currentPage * movimientosPerPage;
  const indexOfFirstMovimiento = indexOfLastMovimiento - movimientosPerPage;
  const currentMovimientos = movimientosFiltradosPorTipo.slice(
    indexOfFirstMovimiento,
    indexOfLastMovimiento
  );

  const sucursalNombreById = (id) => {
    const s = branches.find((b) => Number(b.id) === Number(id));
    return s?.nombre || "Desconocido";
  };

  const exportarExcel = () => {
    if (!movimientosFiltradosPorTipo || movimientosFiltradosPorTipo.length === 0) {
      alert("No hay datos para exportar. Filtrá primero.");
      return;
    }

    const toNumber = (v) => {
      if (v === null || v === undefined) return 0;
      if (typeof v === "number") return Number.isFinite(v) ? v : 0;
      const cleaned = String(v).replace(/[^\d.-]/g, "");
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : 0;
    };

    const data = movimientosFiltradosPorTipo.map((m) => ({
      "Fecha": m.fecha,
      "Lote": m.numerolote,
      "Código Artículo": m.articulocodigo,
      "Descripción": m.articulodescripcion,
      "Cantidad": toNumber(m.cantidad),
      "Tipo": m.tipo,
      "Sucursal": sucursalNombreById(m.sucursal_id),
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    ws["!cols"] = [
      { wch: 12 }, // Fecha
      { wch: 12 }, // Lote
      { wch: 16 }, // Código
      { wch: 45 }, // Descripción
      { wch: 12 }, // Cantidad
      { wch: 18 }, // Tipo
      { wch: 22 }, // Sucursal
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Movimientos");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const nombreArchivo =
      `movimientos_internos_${startDate || "desde"}_${endDate || "hasta"}` +
      (searchSucursal ? `_sucursal_${searchSucursal}` : "") +
      (tipoSeleccionado ? `_tipo_${tipoSeleccionado}` : "") +
      ".xlsx";

    saveAs(blob, nombreArchivo);
  };

  return (

    <Container fluid>

      <Card>

        {/* =====================================================
                ENCABEZADO
            ===================================================== */}

        <Card.Header>

          <h3 className="mb-0">
            Movimientos Internos
          </h3>

        </Card.Header>


        <Card.Body>

          {/* =====================================================
                    FILTROS PRINCIPALES
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
                onChange={(e) =>
                  setSearchSucursal(
                    e.target.value
                  )
                }
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


            {/* TIPO */}

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

                {[
                  ...new Set(
                    movimientos.map(
                      (m) =>
                        m.tipo
                    )
                  )
                ].map(
                  (tipo, idx) => (

                    <option
                      key={idx}
                      value={tipo}
                    >
                      {tipo}
                    </option>

                  )
                )}

              </Form.Select>

            </Col>


            {/* BOTONES */}

            <Col
              md={3}
              className="d-flex align-items-end"
            >

              <Button
                variant="primary"
                onClick={
                  handleSearchClick
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
                  movimientosFiltradosPorTipo
                    .length === 0
                }
              >
                Exportar Excel
              </Button>

            </Col>

          </Row>


          {/* =====================================================
                    REGISTROS
                ===================================================== */}

          <div className="mb-2">

            <strong>

              Registros:{" "}

              {
                movimientosFiltradosPorTipo
                  .length
              }

            </strong>

          </div>


          {/* =====================================================
                    LOADING / SIN RESULTADOS
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

            <div
              className="alert alert-warning"
            >
              No se encontraron movimientos
              para las fechas especificadas.
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
                  className="text-end"
                  onClick={() =>
                    handleSort(
                      "cantidad"
                    )
                  }
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
                      "sucursal_id"
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
                      {
                        movimiento.fecha
                      }
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
                          movimiento.sucursal_id
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
                    movimientosFiltradosPorTipo
                      .length /
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
                    movimientosFiltradosPorTipo
                      .length /
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

    </Container>

  );
}
