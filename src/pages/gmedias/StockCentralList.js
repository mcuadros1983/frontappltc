
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Table,
  Container,
  Button,
  FormControl,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import CategorySummaryTable from "../../utils/CategorySummaryTable";
import {
  BsChevronLeft,
  BsChevronRight,
  BsDownload,
} from "react-icons/bs";
import * as XLSX from "xlsx";

export default function StockCentralList() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroUbicacion, setFiltroUbicacion] = useState("todos");
  // Filtros por fecha de faena
  const [fechaFaenaDesde, setFechaFaenaDesde] = useState("");
  const [fechaFaenaHasta, setFechaFaenaHasta] = useState("");

  // Ordenamiento
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);

  const apiUrl = process.env.REACT_APP_API_URL;

  const obtenerUbicacion = (sucursalId) => {
    switch (Number(sucursalId)) {
      case 18:
        return "CENTRAL";

      case 32:
        return "EL HUECO";

      default:
        return "DESCONOCIDA";
    }
  };
  // Formatear fechas sin problemas de zona horaria
  const formatDate = (dateString) => {
    if (!dateString) return "—";

    const fecha = String(dateString).split("T")[0];
    const [anio, mes, dia] = fecha.split("-");

    if (!anio || !mes || !dia) return "—";

    return `${dia}/${mes}/${anio}`;
  };

  // Cargar productos de la sucursal central
  // const loadProducts = useCallback(async () => {
  //   try {
  //     const res = await fetch(`${apiUrl}/sucursales/18/productos`, {
  //       credentials: "include",
  //     });

  //     if (!res.ok) {
  //       throw new Error("Error al obtener los productos");
  //     }

  //     const data = await res.json();

  //     const sortedProducts = Array.isArray(data)
  //       ? [...data].sort((a, b) => Number(a.id) - Number(b.id))
  //       : [];

  //     setProducts(sortedProducts);
  //   } catch (error) {
  //     console.error("Error al cargar productos:", error);
  //   }
  // }, [apiUrl]);
  // Cargar productos de CENTRAL (18) y EL HUECO (32)
  const loadProducts = useCallback(async () => {
    try {
      const [resCentral, resHueco] = await Promise.all([
        fetch(`${apiUrl}/sucursales/18/productos`, {
          credentials: "include",
        }),
        fetch(`${apiUrl}/sucursales/32/productos`, {
          credentials: "include",
        }),
      ]);

      if (!resCentral.ok || !resHueco.ok) {
        throw new Error("Error al obtener los productos");
      }

      const [productosCentral, productosHueco] = await Promise.all([
        resCentral.json(),
        resHueco.json(),
      ]);

      const todosLosProductos = [
        ...productosCentral,
        ...productosHueco,
      ];

      const sortedProducts = todosLosProductos.sort(
        (a, b) => Number(a.id) - Number(b.id)
      );

      setProducts(sortedProducts);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  }, [apiUrl]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Búsqueda + filtros + ordenamiento
  const filteredProducts = useMemo(() => {
    const termino = searchTerm.trim().toLowerCase();

    const filtered = products.filter((product) => {

      const ubicacionMatch =
        filtroUbicacion === "todos" ||
        Number(product.sucursal_id) === Number(filtroUbicacion);

      // Búsqueda por los campos originales
      const searchMatch =
        termino === "" ||
        [
          product.codigo_de_barra,
          product.num_media,
          product.tropa,
          product.ingreso_id,
        ].some((value) =>
          String(value ?? "").toLowerCase() === termino
        );

      // Fecha de faena almacenada como YYYY-MM-DD
      const fechaFaena = product.fecha_faena
        ? String(product.fecha_faena).split("T")[0]
        : "";

      const fechaDesdeMatch =
        !fechaFaenaDesde ||
        (fechaFaena !== "" && fechaFaena >= fechaFaenaDesde);

      const fechaHastaMatch =
        !fechaFaenaHasta ||
        (fechaFaena !== "" && fechaFaena <= fechaFaenaHasta);

      return (
        searchMatch &&
        fechaDesdeMatch &&
        fechaHastaMatch &&
        ubicacionMatch
      );
    });



    // Aplicar ordenamiento
    if (!sortColumn) {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];

      const aVacio =
        valueA === null ||
        valueA === undefined ||
        valueA === "";

      const bVacio =
        valueB === null ||
        valueB === undefined ||
        valueB === "";

      // Fechas vacías siempre al final
      if (aVacio && bVacio) return 0;
      if (aVacio) return 1;
      if (bVacio) return -1;

      let comparacion = 0;

      if (
        sortColumn === "fecha" ||
        sortColumn === "fecha_faena"
      ) {
        comparacion = String(valueA)
          .split("T")[0]
          .localeCompare(String(valueB).split("T")[0]);
      } else if (
        ["id", "ingreso_id", "precio", "kg", "tropa"].includes(
          sortColumn
        )
      ) {
        comparacion = Number(valueA) - Number(valueB);
      } else {
        comparacion = String(valueA).localeCompare(
          String(valueB),
          "es",
          { numeric: true, sensitivity: "base" }
        );
      }

      return sortDirection === "asc"
        ? comparacion
        : -comparacion;
    });
  }, [
    products,
    searchTerm,
    fechaFaenaDesde,
    fechaFaenaHasta,
    filtroUbicacion,
    sortColumn,
    sortDirection,
  ]);

  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      setSortDirection((prev) =>
        prev === "asc" ? "desc" : "asc"
      );
    } else {
      setSortColumn(columnName);
      setSortDirection("asc");
    }

    setCurrentPage(1);
  };

  // Exportar todos los productos filtrados
  const handleExportToExcel = () => {
    const dataToExport = filteredProducts.map((product) => ({
      ID: product.id,
      Ubicación: obtenerUbicacion(product.sucursal_id),
      "Fecha de Ingreso": product.fecha
        ? formatDate(product.fecha)
        : "",
      "Fecha de Faena": product.fecha_faena
        ? formatDate(product.fecha_faena)
        : "",
      "Nº Ingreso": product.ingreso_id ?? "",
      "Código de Barra": product.codigo_de_barra ?? "",
      "Número de Media": product.num_media ?? "",
      Precio: product.precio ?? "",
      Peso: product.kg ?? "",
      Tropa: product.tropa ?? "",
      Categoría: product.categoria_producto ?? "",
      Subcategoría: product.subcategoria ?? "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Ajustar el ancho de las columnas
    worksheet["!cols"] = [
      { wch: 10 }, // ID
      { wch: 18 }, // Ubicación
      { wch: 18 }, // Fecha de Ingreso
      { wch: 18 }, // Fecha de Faena
      { wch: 14 }, // Nº Ingreso
      { wch: 24 }, // Código de Barra
      { wch: 20 }, // Número de Media
      { wch: 15 }, // Precio
      { wch: 15 }, // Peso
      { wch: 15 }, // Tropa
      { wch: 20 }, // Categoría
      { wch: 20 }, // Subcategoría
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Stock Central"
    );

    XLSX.writeFile(
      workbook,
      "stock_central_filtrado.xlsx"
    );
  };

  // Limpiar únicamente los filtros de fecha
  const limpiarFiltrosFecha = () => {
    setFechaFaenaDesde("");
    setFechaFaenaHasta("");
    setCurrentPage(1);
  };

  // Paginación
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / productsPerPage)
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <Container fluid>
      <h1 className="my-list-title dark-text">
        Lista de Productos
      </h1>

      {/* Búsqueda original */}
      <div className="mb-3">
        <FormControl
          type="text"
          placeholder="Buscar por código de barras, número de ingreso, número de media o tropa"
          className="mr-sm-2"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Filtros por fecha de faena */}
      <Row className="g-3 mb-3 align-items-end">
        <Col xs={12} md={3}>
          <Form.Group>
            <Form.Label>Fecha Faena Desde</Form.Label>
            <Form.Control
              type="date"
              value={fechaFaenaDesde}
              max={fechaFaenaHasta || undefined}
              onChange={(e) => {
                setFechaFaenaDesde(e.target.value);
                setCurrentPage(1);
              }}
            />
          </Form.Group>
        </Col>

        <Col xs={12} md={3}>
          <Form.Group>
            <Form.Label>Fecha Faena Hasta</Form.Label>
            <Form.Control
              type="date"
              value={fechaFaenaHasta}
              min={fechaFaenaDesde || undefined}
              onChange={(e) => {
                setFechaFaenaHasta(e.target.value);
                setCurrentPage(1);
              }}
            />
          </Form.Group>
        </Col>

        <Col xs={12} md="auto">
          <Button
            variant="outline-secondary"
            onClick={limpiarFiltrosFecha}
          >
            Limpiar fechas
          </Button>
        </Col>

        <Col xs={12} md="auto" className="ms-md-auto">
          <Button
            variant="success"
            onClick={handleExportToExcel}
            disabled={filteredProducts.length === 0}
          >
            <BsDownload className="me-2" />
            Exportar a Excel
          </Button>
        </Col>
      </Row>

      <Col xs={12} md={3}>
        <Form.Group>
          <Form.Label>Ubicación</Form.Label>

          <Form.Select
            value={filtroUbicacion}
            onChange={(e) => {
              setFiltroUbicacion(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="todos">Todas las ubicaciones</option>
            <option value="18">CENTRAL</option>
            <option value="32">EL HUECO</option>
          </Form.Select>
        </Form.Group>
      </Col>

      <div className="mb-3 text-muted">
        Productos encontrados: {filteredProducts.length}
      </div>

      {/* Tabla */}
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>

              <th
                onClick={() => handleSort("sucursal_id")}
                style={{ cursor: "pointer" }}
              >
                Ubicación
                {sortColumn === "sucursal_id" &&
                  (sortDirection === "asc" ? " ↑" : " ↓")}
              </th>

              <th
                onClick={() => handleSort("fecha")}
                style={{ cursor: "pointer" }}
              >
                Fecha de Ingreso
              </th>

              <th
                onClick={() => handleSort("fecha_faena")}
                style={{ cursor: "pointer" }}
              >
                Fecha de Faena
                {sortColumn === "fecha_faena" &&
                  (sortDirection === "asc" ? " ↑" : " ↓")}
              </th>

              <th
                onClick={() => handleSort("ingreso_id")}
                style={{ cursor: "pointer" }}
              >
                Num Ingreso
              </th>

              <th
                onClick={() => handleSort("codigo_de_barra")}
                style={{ cursor: "pointer" }}
              >
                Código de Barra
              </th>

              <th
                onClick={() => handleSort("num_media")}
                style={{ cursor: "pointer" }}
              >
                Número de Media
              </th>

              <th
                onClick={() => handleSort("precio")}
                style={{ cursor: "pointer" }}
              >
                Precio
              </th>

              <th
                onClick={() => handleSort("kg")}
                style={{ cursor: "pointer" }}
              >
                Peso
              </th>

              <th
                onClick={() => handleSort("tropa")}
                style={{ cursor: "pointer" }}
              >
                Tropa
              </th>

              <th
                onClick={() => handleSort("categoria_producto")}
                style={{ cursor: "pointer" }}
              >
                Categoría
              </th>

              <th
                onClick={() => handleSort("subcategoria")}
                style={{ cursor: "pointer" }}
              >
                Subcategoría
              </th>
            </tr>
          </thead>

          <tbody>
            {currentProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={12}
                  className="text-center text-muted py-4"
                >
                  No hay productos para mostrar.
                </td>
              </tr>
            ) : (
              currentProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>

                  <td className="fw-semibold">
                    {obtenerUbicacion(product.sucursal_id)}
                  </td>

                  <td>
                    {formatDate(product.fecha)}
                  </td>

                  <td>
                    {formatDate(product.fecha_faena)}
                  </td>

                  <td>{product.ingreso_id ?? "—"}</td>
                  <td>{product.codigo_de_barra ?? "—"}</td>
                  <td>{product.num_media ?? "—"}</td>
                  <td>{product.precio ?? "—"}</td>
                  <td>{product.kg ?? "—"}</td>
                  <td>{product.tropa ?? "—"}</td>
                  <td>{product.categoria_producto ?? "—"}</td>
                  <td>{product.subcategoria ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="d-flex justify-content-center align-items-center">
        <Button
          onClick={prevPage}
          disabled={currentPage === 1}
        >
          <BsChevronLeft />
        </Button>

        <span className="mx-2">
          Página {currentPage} de {totalPages}
        </span>

        <Button
          onClick={nextPage}
          disabled={currentPage >= totalPages}
        >
          <BsChevronRight />
        </Button>
      </div>

      {/* Resumen por categoría */}
      <CategorySummaryTable
        filteredProducts={filteredProducts}
      />
    </Container>
  );
}
