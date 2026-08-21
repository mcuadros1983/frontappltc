import { useEffect, useState, useCallback } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  BsChevronLeft,
  BsChevronRight,
  BsDownload,
  BsPencil,
  BsSearch,
  BsTrash,
} from "react-icons/bs";
import * as XLSX from "xlsx"; // Importar la biblioteca xlsx

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchBarra, setSearchBarra] = useState("");
  const [searchMedia, setSearchMedia] = useState("");
  const [searchPeso, setSearchPeso] = useState("");
  const [searchTropa, setSearchTropa] = useState("");
  const [searchCategoria, setSearchCategoria] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);
  const [branches, setBranches] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchSucursal, setSearchSucursal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBranches, setSelectedBranches] = useState([]);
  // ordenamiento
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  // Función para cargar sucursales
  const loadBranches = useCallback(async () => {
    const res = await fetch(`${apiUrl}/sucursales/`, {
      credentials: "include",
    });
    const data = await res.json();
    setBranches(data);
  }, [apiUrl]);

  // Función para cargar clientes
  const loadCustomers = useCallback(async () => {
    const res = await fetch(`${apiUrl}/clientes/`, {
      credentials: "include",
    });
    const data = await res.json();
    setCustomers(data);
  }, [apiUrl]);

  // Función para cargar todos los productos
  const loadAllProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/productos/`, {
        credentials: "include",
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []); // Establece los productos
      setFilteredProducts(Array.isArray(data) ? data : []); // También los productos filtrados
    } catch (error) {
      console.error("Error al cargar todos los productos:", error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const loadProductsByDate = useCallback(async () => {
    if (!startDate || !endDate) {
      alert("Por favor, selecciona ambas fechas antes de buscar.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/productos/fecha`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fechaDesde: startDate, fechaHasta: endDate }),
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
      setFilteredProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar productos por fecha:", error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, startDate, endDate]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este producto?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/productos/${id}`, {
        credentials: "include",
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.mensaje);
      } else {
        setProducts(products.filter((product) => product.id !== id));
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleSearch = useCallback(() => {
    const searchTermLower = searchBarra.toLowerCase();
    const startDateFilter = startDate ? new Date(startDate) : null;
    const endDateFilter = endDate ? new Date(endDate) : null;

    if (
      searchTermLower === "" &&
      searchMedia === "" &&
      searchPeso === "" &&
      searchTropa === "" &&
      searchCategoria === "" &&
      searchSucursal === "" &&
      selectedBranches.length === 0 &&
      !startDate &&
      !endDate
    ) {
      // No hay criterios de búsqueda. Mostrar todos los productos.
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) => {
        const codigoMatch = product.codigo_de_barra
          ? product.codigo_de_barra.toLowerCase().includes(searchTermLower)
          : true; // Si es null, lo consideramos como coincidencia

        const mediaMatch = product.num_media
          ? product.num_media.toString().includes(searchMedia)
          : true;

        const pesoMatch = product.kg
          ? product.kg.toString().includes(searchPeso)
          : true;

        const tropaMatch = product.tropa
          ? product.tropa.toString().includes(searchTropa)
          : true;

        const categoriaMatch = product.categoria_producto
          ? product.categoria_producto.toString().includes(searchCategoria)
          : true;

        const branchMatch =
          selectedBranches.length === 0 ||
          selectedBranches.includes(String(product.sucursal_id));

        const productDate = product.fecha ? new Date(product.fecha) : null;
        const startDateMatch =
          !startDateFilter || (productDate && productDate >= startDateFilter);
        const endDateMatch =
          !endDateFilter || (productDate && productDate <= endDateFilter);

        return (
          codigoMatch &&
          mediaMatch &&
          pesoMatch &&
          tropaMatch &&
          categoriaMatch &&
          branchMatch &&
          startDateMatch &&
          endDateMatch
        );
      });

      setFilteredProducts(filtered);
    }
  }, [
    searchBarra,
    searchMedia,
    searchPeso,
    searchTropa,
    searchCategoria,
    searchSucursal,
    selectedBranches,
    startDate,
    endDate,
    products,
  ]);

  const handleSort = (columnName) => {
    // Cambiar la dirección de orden si la columna es la misma que la columna actualmente ordenada
    setSortDirection(
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc"
    );

    // Actualizar la columna actualmente ordenada
    setSortColumn(columnName);

    const sortedProducts = [...filteredProducts].sort((a, b) => {
      const valueA = a[columnName];
      const valueB = b[columnName];

      if (valueA < valueB) {
        return sortDirection === "asc" ? -1 : 1;
      } else if (valueA > valueB) {
        return sortDirection === "asc" ? 1 : -1;
      } else {
        return 0;
      }
    });

    setFilteredProducts(sortedProducts);
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredProducts.length / productsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    loadBranches();
    loadCustomers();
  }, [loadBranches, loadCustomers]);

  useEffect(() => {
    handleSearch();
  }, [
    searchBarra,
    searchMedia,
    searchPeso,
    searchTropa,
    searchCategoria,
    searchSucursal,
    startDate,
    endDate,
    handleSearch,
  ]);

  const categorySummary = filteredProducts.reduce((summary, product) => {
    const category = product.categoria_producto;
    const peso = parseFloat(product.kg);
    const costo = parseFloat(product.costo);

    if (!summary[category]) {
      summary[category] = {
        cantidad: 0,
        pesoTotal: 0,
        costoTotal: 0, // Agregamos el costo total inicialmente como cero
      };
    }

    summary[category].cantidad += 1;
    summary[category].pesoTotal += Number(peso);

    // Verificar si el peso y el costo son válidos antes de sumarlos
    if (!isNaN(peso) && !isNaN(costo) && peso !== 0 && costo !== 0) {
      summary[category].costoTotal += Number(peso) * Number(costo); // Sumamos el costo total
    }

    return summary;
  }, {});

  // Función para exportar los productos filtrados a Excel
  const handleExportToExcel = () => {
    const dataToExport = filteredProducts.map((product) => ({
      ID: product.id,
      Fecha: product.fecha,
      Categoría: product.categoria_producto,
      Subcategoría: product.subcategoria,
      "Número de Media": product.num_media,
      Garrón: product.garron,
      Precio: product.precio,
      Costo: product.costo,
      Peso: product.kg,
      Tropa: product.tropa,
      Sucursal:
        branches.find((branch) => branch.id === product.sucursal_id)?.nombre ||
        "Sucursal Desconocida",
      Cliente:
        customers.find((customer) => customer.id === product.cliente_id)
          ?.nombre || "Cliente Desconocido",
      Orden: product.orden_id || "",
      Venta: product.venta_id || "",
      Ingreso: product.ingreso_id || "",
      Mov: product.createdAt
        ? new Date(product.createdAt).toISOString().split("T")[0]
        : "", // Convertir a YYYY-MM-DD
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");

    // Descargar el archivo Excel
    XLSX.writeFile(workbook, "productos_filtrados.xlsx");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length /
      productsPerPage
    )
  );


  const totalKg =
    filteredProducts.reduce(
      (total, product) => {

        const kg =
          Number(product.kg);

        return (
          total +
          (
            Number.isFinite(kg)
              ? kg
              : 0
          )
        );

      },
      0
    );


  const formatNumber = (value) => {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    const numero =
      Number(value);

    if (!Number.isFinite(numero)) {
      return value;
    }

    return numero.toLocaleString(
      "es-AR",
      {
        maximumFractionDigits: 2,
      }
    );

  };

  return (

    <div className="container-fluid px-3 px-lg-4 py-3">

      {/* =====================================================
        CABECERA
    ====================================================== */}

      <div
        className="
        d-flex
        flex-column
        flex-lg-row
        justify-content-between
        align-items-lg-center
        gap-3
        mb-4
      "
      >

        <div>

          <h2 className="mb-1 fw-semibold">
            Lista de productos
          </h2>

          <div className="text-muted">
            Consulta, filtro y control de medias y productos.
          </div>

        </div>


        <Button
          variant="outline-success"
          onClick={handleExportToExcel}
          disabled={
            filteredProducts.length === 0
          }
        >

          <BsDownload className="me-2" />

          Exportar a Excel

        </Button>

      </div>


      {
        error && (

          <Alert
            variant="danger"
            dismissible
            onClose={() =>
              setError("")
            }
          >
            {error}
          </Alert>

        )
      }


      {/* =====================================================
        INDICADORES
    ====================================================== */}

      <Row className="g-3 mb-4">

        <Col
          sm={6}
          xl={3}
        >

          <Card className="h-100 border-0 shadow-sm">

            <Card.Body>

              <div className="small text-muted">
                Productos encontrados
              </div>

              <div className="fs-3 fw-semibold">

                {
                  filteredProducts.length
                    .toLocaleString(
                      "es-AR"
                    )
                }

              </div>

            </Card.Body>

          </Card>

        </Col>


        <Col
          sm={6}
          xl={3}
        >

          <Card className="h-100 border-0 shadow-sm">

            <Card.Body>

              <div className="small text-muted">
                Peso total
              </div>

              <div className="fs-3 fw-semibold">

                {
                  totalKg.toLocaleString(
                    "es-AR",
                    {
                      maximumFractionDigits: 2,
                    }
                  )
                } kg

              </div>

            </Card.Body>

          </Card>

        </Col>


        <Col
          sm={6}
          xl={3}
        >

          <Card className="h-100 border-0 shadow-sm">

            <Card.Body>

              <div className="small text-muted">
                Categorías
              </div>

              <div className="fs-3 fw-semibold">

                {
                  Object.keys(
                    categorySummary
                  ).length
                }

              </div>

            </Card.Body>

          </Card>

        </Col>


        <Col
          sm={6}
          xl={3}
        >

          <Card className="h-100 border-0 shadow-sm">

            <Card.Body>

              <div className="small text-muted">
                Página
              </div>

              <div className="fs-3 fw-semibold">
                {currentPage} / {totalPages}
              </div>

            </Card.Body>

          </Card>

        </Col>

      </Row>


      {/* =====================================================
        FILTROS
    ====================================================== */}

      <Card className="border-0 shadow-sm mb-4">

        <Card.Header className="bg-white py-3">

          <div className="fw-semibold">
            Filtros de búsqueda
          </div>

          <div className="small text-muted">
            Filtra los productos por período, media, tropa,
            peso, categoría o sucursal.
          </div>

        </Card.Header>


        <Card.Body>

          <Row className="g-3 mb-3">

            <Col
              md={3}
              lg={2}
            >

              <Form.Group>

                <Form.Label className="small text-muted">
                  Desde
                </Form.Label>

                <Form.Control

                  type="date"

                  value={
                    startDate
                  }

                  onChange={
                    (e) =>
                      setStartDate(
                        e.target.value
                      )
                  }

                />

              </Form.Group>

            </Col>


            <Col
              md={3}
              lg={2}
            >

              <Form.Group>

                <Form.Label className="small text-muted">
                  Hasta
                </Form.Label>

                <Form.Control

                  type="date"

                  value={
                    endDate
                  }

                  onChange={
                    (e) =>
                      setEndDate(
                        e.target.value
                      )
                  }

                />

              </Form.Group>

            </Col>


            <Col
              md={6}
              lg={8}
              className="
              d-flex
              align-items-end
              gap-2
              flex-wrap
            "
            >

              <Button

                variant="primary"

                onClick={
                  loadProductsByDate
                }

                disabled={
                  loading
                }

              >

                <BsSearch className="me-2" />

                Buscar período

              </Button>


              <Button

                variant="outline-secondary"

                onClick={
                  loadAllProducts
                }

                disabled={
                  loading
                }

              >
                Listar todos
              </Button>

            </Col>

          </Row>


          <Row className="g-3">

            <Col
              md={6}
              xl={3}
            >

              <Form.Group>

                <Form.Label className="small text-muted">
                  Código de barras
                </Form.Label>

                <Form.Control

                  type="text"

                  placeholder="Buscar código..."

                  value={
                    searchBarra
                  }

                  onChange={
                    (e) =>
                      setSearchBarra(
                        e.target.value
                      )
                  }

                />

              </Form.Group>

            </Col>


            <Col
              md={6}
              xl={2}
            >

              <Form.Group>

                <Form.Label className="small text-muted">
                  Número de media
                </Form.Label>

                <Form.Control

                  type="text"

                  placeholder="Media..."

                  value={
                    searchMedia
                  }

                  onChange={
                    (e) =>
                      setSearchMedia(
                        e.target.value
                      )
                  }

                />

              </Form.Group>

            </Col>


            <Col
              md={4}
              xl={2}
            >

              <Form.Group>

                <Form.Label className="small text-muted">
                  Peso
                </Form.Label>

                <Form.Control

                  type="text"

                  placeholder="Kg..."

                  value={
                    searchPeso
                  }

                  onChange={
                    (e) =>
                      setSearchPeso(
                        e.target.value
                      )
                  }

                />

              </Form.Group>

            </Col>


            <Col
              md={4}
              xl={2}
            >

              <Form.Group>

                <Form.Label className="small text-muted">
                  Tropa
                </Form.Label>

                <Form.Control

                  type="text"

                  placeholder="Tropa..."

                  value={
                    searchTropa
                  }

                  onChange={
                    (e) =>
                      setSearchTropa(
                        e.target.value
                      )
                  }

                />

              </Form.Group>

            </Col>


            <Col
              md={4}
              xl={3}
            >

              <Form.Group>

                <Form.Label className="small text-muted">
                  Categoría
                </Form.Label>

                <Form.Control

                  type="text"

                  placeholder="Categoría..."

                  value={
                    searchCategoria
                  }

                  onChange={
                    (e) =>
                      setSearchCategoria(
                        e.target.value
                      )
                  }

                />

              </Form.Group>

            </Col>


            <Col xs={12}>

              <Form.Group>

                <div
                  className="
                  d-flex
                  justify-content-between
                  align-items-center
                  mb-2
                "
                >

                  <Form.Label className="small text-muted mb-0">
                    Sucursales
                  </Form.Label>


                  {
                    selectedBranches.length > 0 && (

                      <Button

                        variant="link"

                        size="sm"

                        className="
                        text-decoration-none
                        p-0
                      "

                        onClick={() =>
                          setSelectedBranches([])
                        }

                      >
                        Limpiar selección
                      </Button>

                    )
                  }

                </div>


                <Form.Select

                  multiple

                  value={
                    selectedBranches
                  }

                  onChange={
                    (e) => {

                      const options =
                        Array.from(
                          e.target.selectedOptions,
                          (option) =>
                            option.value
                        );

                      setSelectedBranches(
                        options
                      );

                    }
                  }

                  style={{
                    minHeight: "110px",
                  }}

                >

                  {
                    branches.map(
                      (branch) => (

                        <option

                          key={
                            branch.id
                          }

                          value={
                            branch.id
                          }

                        >
                          {branch.nombre}
                        </option>

                      )
                    )
                  }

                </Form.Select>


                <Form.Text muted>
                  Ctrl + clic para seleccionar varias sucursales.
                </Form.Text>

              </Form.Group>

            </Col>

          </Row>

        </Card.Body>

      </Card>


      {/* =====================================================
        PRODUCTOS
    ====================================================== */}

      <Card className="border-0 shadow-sm mb-4">

        <Card.Header
          className="
          bg-white
          py-3
          d-flex
          justify-content-between
          align-items-center
          flex-wrap
          gap-2
        "
        >

          <div>

            <div className="fw-semibold">
              Productos
            </div>

            <div className="small text-muted">
              Mostrando {currentProducts.length} de{" "}
              {filteredProducts.length} registros.
            </div>

          </div>


          {
            loading && (

              <div className="small text-muted">

                <Spinner
                  animation="border"
                  size="sm"
                  className="me-2"
                />

                Cargando...

              </div>

            )
          }

        </Card.Header>


        <Card.Body className="p-0">

          <div className="table-responsive">

            <Table

              hover

              size="sm"

              className="
              mb-0
              align-middle
            "

            >

              <thead className="table-light">

                <tr>

                  <th className="ps-3">
                    ID
                  </th>

                  <th
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      handleSort("fecha")
                    }
                  >
                    Fecha
                  </th>

                  <th
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      handleSort(
                        "categoria_producto"
                      )
                    }
                  >
                    Categoría
                  </th>

                  <th>
                    Subcategoría
                  </th>

                  <th
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      handleSort(
                        "num_media"
                      )
                    }
                  >
                    Nº Media
                  </th>

                  <th>
                    Garrón
                  </th>

                  <th className="text-end">
                    Precio
                  </th>

                  <th className="text-end">
                    Costo
                  </th>

                  <th className="text-end">
                    Peso
                  </th>

                  <th>
                    Tropa
                  </th>

                  <th>
                    Sucursal
                  </th>

                  <th>
                    Cliente
                  </th>

                  <th>
                    Ingreso
                  </th>

                  <th>
                    Orden
                  </th>

                  <th>
                    Venta
                  </th>

                  <th className="text-center">
                    Secuencia
                  </th>

                  <th className="text-end pe-3">
                    Operaciones
                  </th>

                </tr>

              </thead>


              <tbody>

                {
                  currentProducts.length === 0 &&
                    !loading
                    ? (

                      <tr>

                        <td
                          colSpan={17}
                          className="
                          text-center
                          text-muted
                          py-5
                        "
                        >
                          No hay productos para mostrar.
                        </td>

                      </tr>

                    )
                    : currentProducts.map(
                      (
                        product,
                        index
                      ) => {

                        const previousMedia =
                          index > 0
                            ? parseInt(
                              currentProducts[
                                index - 1
                              ].num_media,
                              10
                            )
                            : null;


                        const currentMedia =
                          parseInt(
                            product.num_media,
                            10
                          );


                        const isCorrelative =
                          previousMedia !== null &&
                          !isNaN(previousMedia) &&
                          !isNaN(currentMedia) &&
                          currentMedia ===
                          previousMedia + 1;


                        return (

                          <tr
                            key={
                              product.id
                            }
                          >

                            <td className="ps-3 text-muted">
                              {product.id}
                            </td>


                            <td className="text-nowrap">
                              {
                                product.fecha ||
                                "—"
                              }
                            </td>


                            <td>

                              <Badge
                                bg="light"
                                text="dark"
                                className="
                                border
                                fw-normal
                              "
                              >
                                {
                                  product.categoria_producto ||
                                  "Sin categoría"
                                }
                              </Badge>

                            </td>


                            <td>
                              {
                                product.subcategoria ||
                                "—"
                              }
                            </td>


                            <td className="fw-semibold">
                              {
                                product.num_media ||
                                "—"
                              }
                            </td>


                            <td>
                              {
                                product.garron ||
                                "—"
                              }
                            </td>


                            <td className="text-end">
                              {
                                formatNumber(
                                  product.precio
                                )
                              }
                            </td>


                            <td className="text-end">
                              {
                                formatNumber(
                                  product.costo
                                )
                              }
                            </td>


                            <td className="text-end text-nowrap">
                              {
                                formatNumber(
                                  product.kg
                                )
                              }
                            </td>


                            <td>
                              {
                                product.tropa ||
                                "—"
                              }
                            </td>


                            <td>

                              {
                                branches.find(
                                  (branch) =>
                                    branch.id ===
                                    product.sucursal_id
                                )?.nombre ||
                                "Sucursal desconocida"
                              }

                            </td>


                            <td>

                              {
                                customers.find(
                                  (customer) =>
                                    customer.id ===
                                    product.cliente_id
                                )?.nombre ||
                                "Cliente desconocido"
                              }

                            </td>


                            <td>
                              {
                                product.ingreso_id ||
                                "—"
                              }
                            </td>


                            <td>
                              {
                                product.orden_id ||
                                "—"
                              }
                            </td>


                            <td>
                              {
                                product.venta_id ||
                                "—"
                              }
                            </td>


                            <td className="text-center">

                              {
                                isCorrelative
                                  ? (

                                    <Badge bg="success">
                                      OK
                                    </Badge>

                                  )
                                  : (

                                    <Badge
                                      bg="warning"
                                      text="dark"
                                    >
                                      Revisar
                                    </Badge>

                                  )
                              }

                            </td>


                            <td className="text-end pe-3">

                              <div
                                className="
                                d-flex
                                justify-content-end
                                gap-2
                                flex-nowrap
                              "
                              >

                                <Button

                                  variant="outline-primary"

                                  size="sm"

                                  title="Editar"

                                  onClick={() =>
                                    navigate(
                                      `/products/${product.id}/edit`
                                    )
                                  }

                                >
                                  <BsPencil />
                                </Button>


                                <Button

                                  variant="outline-danger"

                                  size="sm"

                                  title="Eliminar"

                                  onClick={() =>
                                    handleDelete(
                                      product.id
                                    )
                                  }

                                >
                                  <BsTrash />
                                </Button>

                              </div>

                            </td>

                          </tr>

                        );

                      }
                    )
                }

              </tbody>

            </Table>

          </div>

        </Card.Body>


        <Card.Footer className="bg-white py-3">

          <div
            className="
            d-flex
            justify-content-between
            align-items-center
            flex-wrap
            gap-3
          "
          >

            <div className="small text-muted">

              {
                filteredProducts.length
              } registros encontrados

            </div>


            <div
              className="
              d-flex
              align-items-center
              gap-2
            "
            >

              <Button

                variant="outline-secondary"

                size="sm"

                onClick={
                  prevPage
                }

                disabled={
                  currentPage === 1
                }

              >
                <BsChevronLeft />
              </Button>


              <span className="small fw-semibold px-2">

                Página {currentPage} de {totalPages}

              </span>


              <Button

                variant="outline-secondary"

                size="sm"

                onClick={
                  nextPage
                }

                disabled={
                  currentPage >=
                  totalPages
                }

              >
                <BsChevronRight />
              </Button>

            </div>

          </div>

        </Card.Footer>

      </Card>


      {/* =====================================================
        RESUMEN
    ====================================================== */}

      <Card className="border-0 shadow-sm">

        <Card.Header className="bg-white py-3">

          <div className="fw-semibold">
            Resumen por categoría
          </div>

          <div className="small text-muted">
            Totales calculados sobre los productos actualmente filtrados.
          </div>

        </Card.Header>


        <Card.Body className="p-0">

          <div className="table-responsive">

            <Table
              hover
              size="sm"
              className="mb-0 align-middle"
            >

              <thead className="table-light">

                <tr>

                  <th className="ps-3">
                    Categoría
                  </th>

                  <th className="text-end">
                    Cantidad
                  </th>

                  <th className="text-end">
                    Kg
                  </th>

                  <th className="text-end pe-3">
                    Costo total
                  </th>

                </tr>

              </thead>


              <tbody>

                {
                  Object.keys(
                    categorySummary
                  ).map(
                    (category) => (

                      <tr
                        key={
                          category
                        }
                      >

                        <td className="ps-3 fw-semibold">
                          {category}
                        </td>

                        <td className="text-end">

                          {
                            categorySummary[
                              category
                            ].cantidad
                          }

                        </td>

                        <td className="text-end">

                          {
                            categorySummary[
                              category
                            ].pesoTotal
                              .toLocaleString(
                                "es-AR",
                                {
                                  maximumFractionDigits:
                                    2,
                                }
                              )
                          }

                        </td>

                        <td className="text-end pe-3">

                          {
                            categorySummary[
                              category
                            ].costoTotal !== 0
                              ? categorySummary[
                                category
                              ].costoTotal
                                .toLocaleString(
                                  "es-AR",
                                  {
                                    maximumFractionDigits:
                                      2,
                                  }
                                )
                              : "N/A"
                          }

                        </td>

                      </tr>

                    )
                  )
                }

              </tbody>

            </Table>

          </div>

        </Card.Body>

      </Card>

    </div>

  );
}