import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Contexts from "../../context/Contexts";
import {
  BsChevronLeft,
  BsChevronRight,
  BsDownload,
  BsPencil,
  BsTrash,
} from "react-icons/bs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function SellList() {
  const [sells, setSells] = useState([]);
  const [filteredSells, setFilteredSells] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingSellId, setEditingSellId] = useState(null);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [clients, setClients] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sellsPerPage] = useState(20);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  // cache: { [sellId]: "bovino" | "porcino" | "Mixta" | "" }
  const [categoriaCache, setCategoriaCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Si alguno de los productos de la venta no tiene precio válido, marcamos la venta
  const hasMissingPrice = (sell) => {
    if (!Array.isArray(sell?.productos)) return false;
    return sell.productos.some((p) => {
      const val = Number(p?.precio);
      // Consideramos "faltante" si es NaN, null, undefined o <= 0 (ajustá la regla si querés permitir 0)
      return p?.precio === null || p?.precio === undefined || Number.isNaN(val) || val <= 0;
    });
  };


  const context = useContext(Contexts.UserContext);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  console.log("info")

  // --- helpers derivados desde productos de la venta ---
  const getSellProductos = (sell) =>
    sell?.productos || sell?.Productos || sell?.producto || sell?.Producto || [];

  const deriveCategoriaFromProducts = (products) => {
    if (!Array.isArray(products) || products.length === 0) return "";

    const setCats = new Set(
      products
        .map((p) => p?.categoria_producto)
        .filter((x) => typeof x === "string" && x.trim() !== "")
        .map((x) => x.trim())
    );

    if (setCats.size === 0) return "";
    if (setCats.size === 1) return [...setCats][0];
    return "Mixta";
  };


  const deriveCategoriaFromSell = (sell) => {
    const productos = getSellProductos(sell);
    if (!Array.isArray(productos) || productos.length === 0) return "";

    const setCats = new Set(
      productos
        .map((p) => p?.categoria_producto)
        .filter((x) => typeof x === "string" && x.trim() !== "")
        .map((x) => x.trim())
    );

    if (setCats.size === 0) return "";
    if (setCats.size === 1) return [...setCats][0];
    return "Mixta";
  };

  const calcPesoTotal = (sell) => {
    const productos = getSellProductos(sell);
    if (!Array.isArray(productos)) return 0;
    return productos.reduce((acc, p) => acc + (Number(p?.kg) || 0), 0);
  };

  // "Cantidad de medias" = cantidad de productos (items) en la venta
  const calcCantidadItems = (sell) => {
    const productos = getSellProductos(sell);
    return Array.isArray(productos) ? productos.length : 0;
  };

  // helper para sort con rutas tipo "Cliente.nombre"
  const getByPath = (obj, path) => {
    if (!path) return "";
    if (!path.includes(".")) return obj?.[path];
    return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  };


  const loadSells = useCallback(async () => {

    try {

      setLoading(true);
      setError("");

      const res =
        await fetch(
          `${apiUrl}/ventas/`,
          {
            credentials: "include",
          }
        );

      if (!res.ok) {
        throw new Error(
          `HTTP ${res.status}`
        );
      }

      const data =
        await res.json();

      const rows =
        Array.isArray(data)
          ? data
          : [];

      const withDerived =
        rows.map(
          (s) => ({
            ...s,
            cantidad_total:
              calcCantidadItems(s),
            peso_total:
              calcPesoTotal(s),
          })
        );

      const sortedSells =
        withDerived.sort(
          (a, b) =>
            b.id - a.id
        );

      setSells(
        sortedSells
      );

    }
    catch (error) {

      console.error(error);

      setError(
        "No se pudieron cargar las ventas."
      );

    }
    finally {

      setLoading(false);

    }

  }, [apiUrl]);


  const loadClients = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/clientes/`, {
        credentials: "include",
      });
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error(error);
    }
  }, [apiUrl]);

  const loadPaymentMethods = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/formas-pago`, {
        credentials: "include",
      });
      const data = await res.json();
      setPaymentMethods(data);
    } catch (error) {
      console.error(error);
    }
  }, [apiUrl]);

  const fetchCategoriasForVisibleSells = useCallback(
    async (visibleSells) => {
      if (!Array.isArray(visibleSells) || visibleSells.length === 0) return;

      // solo ids que no están en cache
      const pending = visibleSells
        .map((s) => s.id)
        .filter((id) => categoriaCache[id] === undefined);

      if (pending.length === 0) return;

      // límite de concurrencia para no saturar el server
      const concurrency = 6;
      const ids = [...pending];
      const updates = {};

      const worker = async () => {
        while (ids.length) {
          const id = ids.shift();
          try {
            const res = await fetch(`${apiUrl}/ventas/${id}/productos/`, {
              credentials: "include",
            });
            const products = await res.json();
            updates[id] = deriveCategoriaFromProducts(products);
          } catch (e) {
            updates[id] = "";
          }
        }
      };

      await Promise.all(Array.from({ length: concurrency }, worker));

      // merge al cache
      setCategoriaCache((prev) => ({ ...prev, ...updates }));
    },
    [apiUrl, categoriaCache]
  );


  const handleSearch = useCallback(() => {
    const startDateFilter = startDate ? startDate : null;
    const endDateFilter = endDate ? endDate : null;

    const filtered = sells.filter((sell) => {
      const matchesCustomer =
        !searchTerm || (sell.Cliente && sell.Cliente.nombre === searchTerm);

      const sellDate = sell.fecha;
      const matchesDate =
        (!startDateFilter || sellDate >= startDateFilter) &&
        (!endDateFilter || sellDate <= endDateFilter);

      return matchesCustomer && matchesDate;
    });

    setFilteredSells(filtered);
  }, [searchTerm, startDate, endDate, sells]);

  useEffect(() => {
    loadSells();
    loadClients();
    loadPaymentMethods();
  }, [loadSells, loadClients, loadPaymentMethods]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch, startDate, endDate]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta venta?");
    if (!confirmDelete) return;

    try {
      await fetch(`${apiUrl}/ventas/${id}`, {
        credentials: "include",
        method: "DELETE",
      });
      setSells(sells.filter((sell) => sell.id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditClient = (sellId) => {
    const sell = sells.find((s) => s.id === sellId);
    if (sell && sell.Cliente) {
      setSelectedClient(sell.Cliente);
    } else {
      setSelectedClient(null);
    }
    setEditingSellId({ id: sellId, type: "client" });
  };

  const handleEditPaymentMethod = (sellId) => {
    const sell = sells.find((s) => s.id === sellId);
    if (sell && sell.FormaPago) {
      setSelectedPaymentMethod(sell.FormaPago);
      setSelectedClient(sell.Cliente);
    }
    setEditingSellId({ id: sellId, type: "paymentMethod" });
  };

  const handleChangeClient = (eventKey) => {
    const selected = clients.find((client) => client.nombre === eventKey);
    setSelectedClient(selected);
  };

  const handleChangePaymentMethod = (eventKey) => {
    const selected = paymentMethods.find((method) => method.tipo === eventKey);
    setSelectedPaymentMethod(selected);
  };

  const handleCancelEdit = () => {
    setSelectedClient("");
    setSelectedPaymentMethod("");
    setEditingSellId(null);
  };

  const handleSaveEdit = async () => {
    try {
      let requestBody = {};
      if (selectedClient !== "") requestBody.clienteId = selectedClient.id;
      if (selectedPaymentMethod !== "") requestBody.formaPagoId = selectedPaymentMethod.id;

      await fetch(`${apiUrl}/ventas/${editingSellId.id}`, {
        credentials: "include",
        method: "PUT",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      });

      setEditingSellId(null);
      loadSells();
    } catch (error) {
      console.error("Error al guardar la edición:", error);
    }
  };

  const handleSort = (columnName) => {
    const newSortDirection =
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc";

    setSortColumn(columnName);
    setSortDirection(newSortDirection);

    const sorted = [...filteredSells].sort((a, b) => {
      const valueA = getByPath(a, columnName) ?? "";
      const valueB = getByPath(b, columnName) ?? "";

      const numA = Number(valueA);
      const numB = Number(valueB);
      const bothNumeric = Number.isFinite(numA) && Number.isFinite(numB);

      if (bothNumeric) {
        return newSortDirection === "asc" ? numA - numB : numB - numA;
      }

      return newSortDirection === "asc"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });

    setFilteredSells(sorted);
  };

  const indexOfLastSell = currentPage * sellsPerPage;
  const indexOfFirstSell = indexOfLastSell - sellsPerPage;
  const currentSells = [...filteredSells].slice(indexOfFirstSell, indexOfLastSell);

  useEffect(() => {
    fetchCategoriasForVisibleSells(currentSells);
  }, [currentSells, fetchCategoriasForVisibleSells]);

  const nextPage = () => {

  if (
    currentPage <
    totalPages
  ) {
    setCurrentPage(
      (prev) =>
        prev + 1
    );
  }

};
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);


  const exportarExcel = () => {
    if (!filteredSells || filteredSells.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const toNumber = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const getMontoVenta = (sell) => {
      if (!Array.isArray(sell?.productos)) return 0;
      return sell.productos.reduce((total, p) => {
        const precio = toNumber(p?.precio);
        const kg = toNumber(p?.kg);
        return total + precio * kg;
      }, 0);
    };

    const data = filteredSells.map((sell) => ({
      "ID": sell.id,
      "Fecha": sell.fecha,
      "Cliente": sell?.Cliente?.nombre || "Cliente Desconocido",
      "Forma de Pago": sell?.FormaPago?.tipo || "Forma de pago desconocida",
      "Monto": getMontoVenta(sell),              // numérico en Excel
      "Falta Precio": hasMissingPrice(sell) ? "SI" : "NO",
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    ws["!cols"] = [
      { wch: 10 }, // ID
      { wch: 12 }, // Fecha
      { wch: 30 }, // Cliente
      { wch: 20 }, // Forma de pago
      { wch: 18 }, // Monto
      { wch: 12 }, // Falta precio
    ];

    // (Opcional) Total Monto al final
    const totalMonto = filteredSells.reduce((acc, s) => acc + getMontoVenta(s), 0);
    const lastRow = data.length + 2;
    XLSX.utils.sheet_add_aoa(ws, [["", "", "", "TOTAL", totalMonto]], { origin: `A${lastRow}` });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ventas");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const nombreArchivo =
      `ventas_${startDate || "desde"}_${endDate || "hasta"}` +
      (searchTerm ? `_cliente_${searchTerm}` : "") +
      ".xlsx";

    saveAs(blob, nombreArchivo);
  };

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredSells.length /
        sellsPerPage
      )
    );


  const totalKg =
    filteredSells.reduce(
      (total, sell) =>
        total +
        Number(
          sell.peso_total || 0
        ),
      0
    );


  const totalMonto =
    filteredSells.reduce(
      (total, sell) => {

        const productos =
          Array.isArray(
            sell?.productos
          )
            ? sell.productos
            : [];

        return (
          total +
          productos.reduce(
            (subtotal, p) =>
              subtotal +
              (
                Number(p?.precio) || 0
              ) *
              (
                Number(p?.kg) || 0
              ),
            0
          )
        );

      },
      0
    );


  const ventasSinPrecio =
    filteredSells.filter(
      hasMissingPrice
    ).length;


  const formatCurrency =
    (value) =>
      Number(value || 0)
        .toLocaleString(
          "es-AR",
          {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 2,
          }
        );

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
            Lista de ventas
          </h2>

          <div className="text-muted">
            Consulta y administración de ventas registradas.
          </div>

        </div>


        <Button

          variant="outline-success"

          onClick={
            exportarExcel
          }

          disabled={
            filteredSells.length ===
            0
          }

        >

          <BsDownload className="me-2" />

          Exportar Excel

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
                Ventas encontradas
              </div>

              <div className="fs-3 fw-semibold">
                {
                  filteredSells.length
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
                Monto total
              </div>

              <div className="fs-4 fw-semibold">
                {
                  formatCurrency(
                    totalMonto
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

          <Card
            className={`
            h-100
            border-0
            shadow-sm
            ${ventasSinPrecio > 0
                ? "border-start border-danger border-4"
                : ""
              }
          `}
          >

            <Card.Body>

              <div className="small text-muted">
                Ventas con precios faltantes
              </div>

              <div
                className={`
                fs-3
                fw-semibold
                ${ventasSinPrecio > 0
                    ? "text-danger"
                    : ""
                  }
              `}
              >
                {ventasSinPrecio}
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
            Filtros
          </div>

          <div className="small text-muted">
            Filtra las ventas por período y cliente.
          </div>

        </Card.Header>


        <Card.Body>

          <Row className="g-3">

            <Col
              md={4}
              lg={3}
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
              md={4}
              lg={3}
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
              md={4}
              lg={6}
            >

              <Form.Group>

                <Form.Label className="small text-muted">
                  Cliente
                </Form.Label>

                <Form.Select

                  value={
                    searchTerm
                  }

                  onChange={
                    (e) =>
                      setSearchTerm(
                        e.target.value
                      )
                  }

                >

                  <option value="">
                    Todos los clientes
                  </option>

                  {
                    [...clients]
                      .sort(
                        (a, b) =>
                          a.nombre.localeCompare(
                            b.nombre
                          )
                      )
                      .map(
                        (client) => (

                          <option
                            key={
                              client.id
                            }
                            value={
                              client.nombre
                            }
                          >
                            {client.nombre}
                          </option>

                        )
                      )
                  }

                </Form.Select>

              </Form.Group>

            </Col>

          </Row>

        </Card.Body>

      </Card>


      {/* =====================================================
        ALERTA PRECIOS
    ====================================================== */}

      {
        ventasSinPrecio > 0 && (

          <Alert
            variant="warning"
            className="
            d-flex
            align-items-center
            gap-2
            mb-4
          "
          >

            <Badge bg="danger">
              {ventasSinPrecio}
            </Badge>

            <span>
              Hay ventas con uno o más productos sin precio válido.
              Estas filas aparecen resaltadas.
            </span>

          </Alert>

        )
      }


      {/* =====================================================
        TABLA
    ====================================================== */}

      <Card className="border-0 shadow-sm">

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
              Ventas
            </div>

            <div className="small text-muted">
              Mostrando {currentSells.length} de{" "}
              {filteredSells.length} registros.
              Doble clic sobre una fila para abrir sus productos.
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
              className="mb-0 align-middle"
            >

              <thead className="table-light">

                <tr>

                  <th
                    className="ps-3"
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      handleSort(
                        "id"
                      )
                    }
                  >
                    ID
                  </th>


                  <th
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      handleSort(
                        "fecha"
                      )
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
                        "Cliente.nombre"
                      )
                    }
                  >
                    Cliente
                  </th>


                  <th
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      handleSort(
                        "FormaPago.tipo"
                      )
                    }
                  >
                    Forma de pago
                  </th>


                  <th
                    className="text-end"
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      handleSort(
                        "cantidad_total"
                      )
                    }
                  >
                    Medias
                  </th>


                  <th
                    className="text-end"
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      handleSort(
                        "peso_total"
                      )
                    }
                  >
                    Peso
                  </th>


                  <th>
                    Categoría
                  </th>


                  <th className="text-end">
                    Monto
                  </th>


                  <th className="text-end pe-3">
                    Operaciones
                  </th>

                </tr>

              </thead>


              <tbody>

                {
                  currentSells.length ===
                    0 &&
                    !loading
                    ? (

                      <tr>

                        <td
                          colSpan={9}
                          className="
                          text-center
                          text-muted
                          py-5
                        "
                        >
                          No hay ventas para mostrar.
                        </td>

                      </tr>

                    )
                    : currentSells.map(
                      (sell) => {

                        const missingPrice =
                          hasMissingPrice(
                            sell
                          );


                        const monto =
                          Array.isArray(
                            sell?.productos
                          )
                            ? sell.productos.reduce(
                              (
                                total,
                                p
                              ) =>
                                total +
                                (
                                  Number(
                                    p?.precio
                                  ) || 0
                                ) *
                                (
                                  Number(
                                    p?.kg
                                  ) || 0
                                ),
                              0
                            )
                            : 0;


                        return (

                          <tr

                            key={
                              sell.id
                            }

                            className={
                              missingPrice
                                ? "table-danger"
                                : ""
                            }

                            style={{
                              cursor: "pointer",
                            }}

                            title={
                              missingPrice
                                ? "Esta venta tiene productos sin precio"
                                : "Doble clic para ver productos"
                            }

                            onDoubleClick={
                              () =>
                                navigate(
                                  `/sells/${sell.id}/products`
                                )
                            }

                          >

                            <td className="ps-3 text-muted">
                              {sell.id}
                            </td>


                            <td className="text-nowrap">
                              {
                                sell.fecha ||
                                "—"
                              }
                            </td>


                            <td>

                              {
                                editingSellId &&
                                  editingSellId.id ===
                                  sell.id &&
                                  editingSellId.type ===
                                  "client"
                                  ? (

                                    <Dropdown
                                      onSelect={
                                        handleChangeClient
                                      }
                                    >

                                      <Dropdown.Toggle
                                        size="sm"
                                        variant="outline-primary"
                                      >

                                        {
                                          selectedClient?.nombre ||
                                          "Seleccionar cliente"
                                        }

                                      </Dropdown.Toggle>


                                      <Dropdown.Menu>

                                        {
                                          [...clients]
                                            .sort(
                                              (a, b) =>
                                                a.nombre.localeCompare(
                                                  b.nombre
                                                )
                                            )
                                            .map(
                                              (client) => (

                                                <Dropdown.Item

                                                  key={
                                                    client.id
                                                  }

                                                  eventKey={
                                                    client.nombre
                                                  }

                                                >
                                                  {client.nombre}
                                                </Dropdown.Item>

                                              )
                                            )
                                        }

                                      </Dropdown.Menu>

                                    </Dropdown>

                                  )
                                  : (
                                    sell?.Cliente?.nombre ||
                                    "Cliente desconocido"
                                  )
                              }

                            </td>


                            <td>

                              {
                                editingSellId &&
                                  editingSellId.id ===
                                  sell.id &&
                                  editingSellId.type ===
                                  "paymentMethod"
                                  ? (

                                    <Dropdown
                                      onSelect={
                                        handleChangePaymentMethod
                                      }
                                    >

                                      <Dropdown.Toggle
                                        size="sm"
                                        variant="outline-primary"
                                      >

                                        {
                                          selectedPaymentMethod?.tipo ||
                                          "Seleccionar forma de pago"
                                        }

                                      </Dropdown.Toggle>


                                      <Dropdown.Menu>

                                        {
                                          [...paymentMethods]
                                            .sort(
                                              (a, b) =>
                                                a.tipo.localeCompare(
                                                  b.tipo
                                                )
                                            )
                                            .map(
                                              (method) => (

                                                <Dropdown.Item

                                                  key={
                                                    method.id
                                                  }

                                                  eventKey={
                                                    method.tipo
                                                  }

                                                >
                                                  {method.tipo}
                                                </Dropdown.Item>

                                              )
                                            )
                                        }

                                      </Dropdown.Menu>

                                    </Dropdown>

                                  )
                                  : (

                                    <Badge
                                      bg="light"
                                      text="dark"
                                      className="border fw-normal"
                                    >

                                      {
                                        sell?.FormaPago?.tipo ||
                                        "Sin forma de pago"
                                      }

                                    </Badge>

                                  )
                              }

                            </td>


                            <td className="text-end fw-semibold">
                              {
                                sell.cantidad_total ??
                                0
                              }
                            </td>


                            <td className="text-end text-nowrap">
                              {
                                Number(
                                  sell.peso_total ??
                                  0
                                ).toLocaleString(
                                  "es-AR",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )
                              } kg
                            </td>


                            <td>

                              {
                                categoriaCache[
                                  sell.id
                                ]
                                  ? (

                                    <Badge
                                      bg="secondary"
                                    >
                                      {
                                        categoriaCache[
                                        sell.id
                                        ]
                                      }
                                    </Badge>

                                  )
                                  : "—"
                              }

                            </td>


                            <td className="text-end fw-semibold text-nowrap">

                              {
                                formatCurrency(
                                  monto
                                )
                              }

                              {
                                missingPrice && (

                                  <div className="small text-danger">
                                    Precio incompleto
                                  </div>

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

                                {
                                  editingSellId &&
                                    editingSellId.id ===
                                    sell.id
                                    ? (

                                      <>

                                        <Button

                                          variant="primary"

                                          size="sm"

                                          onClick={
                                            handleSaveEdit
                                          }

                                        >
                                          Guardar
                                        </Button>


                                        <Button

                                          variant="outline-secondary"

                                          size="sm"

                                          onClick={
                                            handleCancelEdit
                                          }

                                        >
                                          Cancelar
                                        </Button>

                                      </>

                                    )
                                    : (

                                      <>

                                        <Button

                                          variant="outline-primary"

                                          size="sm"

                                          title="Editar cliente"

                                          onClick={
                                            () =>
                                              handleEditClient(
                                                sell.id
                                              )
                                          }

                                        >
                                          <BsPencil />
                                        </Button>


                                        <Button

                                          variant="outline-secondary"

                                          size="sm"

                                          title="Editar forma de pago"

                                          onClick={
                                            () =>
                                              handleEditPaymentMethod(
                                                sell.id
                                              )
                                          }

                                        >
                                          FP
                                        </Button>

                                      </>

                                    )
                                }


                                {
                                  context.user?.usuario ===
                                  "admin" && (

                                    <Button

                                      variant="outline-danger"

                                      size="sm"

                                      title="Eliminar venta"

                                      onClick={
                                        () =>
                                          handleDelete(
                                            sell.id
                                          )
                                      }

                                    >
                                      <BsTrash />
                                    </Button>

                                  )
                                }

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


        {/* =====================================================
          PAGINACIÓN
      ====================================================== */}

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

              Registros {
                filteredSells.length ===
                  0
                  ? 0
                  : indexOfFirstSell +
                  1
              }–{
                Math.min(
                  indexOfLastSell,
                  filteredSells.length
                )
              } de {
                filteredSells.length
              }

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
                  currentPage ===
                  1
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

    </div>

  );
}
