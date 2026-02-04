import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  Table,
  Container,
  Button,
  FormControl,
  Dropdown,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Contexts from "../../context/Contexts";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
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
      const res = await fetch(`${apiUrl}/ventas/`, {
        credentials: "include",
      });
      const data = await res.json();

      // agregamos props derivadas para mostrar en tabla
      const withDerived = data.map((s) => ({
        ...s,
        cantidad_total: calcCantidadItems(s),
        peso_total: calcPesoTotal(s),
        // categoria se completa luego vía categoriaCache (endpoint /ventas/:id/productos/)
      }));

      const sortedSells = withDerived.sort((a, b) => b.id - a.id);
      setSells(sortedSells);
    } catch (error) {
      console.error(error);
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

  const nextPage = () => setCurrentPage(currentPage + 1);
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


  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Ventas</h1>

      <Button variant="success" onClick={exportarExcel} disabled={!filteredSells.length}>
        Exportar Excel
      </Button>

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

      <div className="mb-2 small text-muted">
        <span style={{ backgroundColor: "#ffe5e5", padding: "2px 6px", borderRadius: 4 }}> </span>
        {" "}Fila en rojo: venta con productos sin precio.
      </div>


      <div className="mb-3">
        <label className="mr-2">Cliente:</label>
        <FormControl
          as="select"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-25"
        >
          <option value="">Todos los clientes</option>
          {[...clients]
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
            .map((client) => (
              <option key={client.id} value={client.nombre}>
                {client.nombre}
              </option>
            ))}
        </FormControl>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>#</th>
            <th onClick={() => handleSort("fecha")} style={{ cursor: "pointer" }}>Fecha</th>
            <th onClick={() => handleSort("Cliente.nombre")} style={{ cursor: "pointer" }}>Cliente</th>
            <th onClick={() => handleSort("FormaPago.tipo")} style={{ cursor: "pointer" }}>Forma de Pago</th>

            {/* NUEVAS COLUMNAS */}
            <th onClick={() => handleSort("cantidad_total")} style={{ cursor: "pointer" }}>
              Cantidad (medias)
            </th>
            <th onClick={() => handleSort("peso_total")} style={{ cursor: "pointer" }}>
              Peso total
            </th>
            <th>Categoría</th>

            <th style={{ cursor: "pointer" }}>Monto</th>
            <th>Operaciones</th>
          </tr>

        </thead>
        <tbody>
          {currentSells.map((sell) => (
            <tr
              key={sell.id}
              style={{
                cursor: "pointer",
                backgroundColor: hasMissingPrice(sell) ? "#ffe5e5" : undefined, // rojo suave
              }}
              title={hasMissingPrice(sell) ? "Esta venta tiene productos sin precio" : ""}
              onDoubleClick={() => navigate(`/sells/${sell.id}/products`)}
            >

              <td>{sell.id}</td>
              <td>{sell.fecha}</td>
              <td>
                {editingSellId && editingSellId.id === sell.id && editingSellId.type === "client" ? (
                  <Dropdown onSelect={handleChangeClient}>
                    <Dropdown.Toggle variant="success">
                      {selectedClient?.nombre || "Seleccionar cliente"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {[...clients]
                        .sort((a, b) => a.nombre.localeCompare(b.nombre))
                        .map((client) => (
                          <Dropdown.Item key={client.id} eventKey={client.nombre}>
                            {client.nombre}
                          </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                  </Dropdown>
                ) : sell.Cliente ? (
                  sell.Cliente.nombre
                ) : (
                  "Cliente Desconocido"
                )}
              </td>
              <td>
                {editingSellId && editingSellId.id === sell.id && editingSellId.type === "paymentMethod" ? (
                  <Dropdown onSelect={handleChangePaymentMethod}>
                    <Dropdown.Toggle variant="success">
                      {selectedPaymentMethod?.tipo || "Seleccionar forma de pago"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {[...paymentMethods]
                        .sort((a, b) => a.tipo.localeCompare(b.tipo))
                        .map((method) => (
                          <Dropdown.Item key={method.id} eventKey={method.tipo}>
                            {method.tipo}
                          </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                  </Dropdown>
                ) : sell.FormaPago ? (
                  sell.FormaPago.tipo
                ) : (
                  "Forma de pago desconocida"
                )}
              </td>

              <td>{sell.cantidad_total ?? 0}</td>
              <td>{(sell.peso_total ?? 0).toFixed(2)}</td>
              <td>{categoriaCache[sell.id] ?? ""}</td>


              <td>
                {sell.productos
                  .reduce((total, p) => total + p.precio * p.kg, 0)
                  .toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                    minimumFractionDigits: 2,
                  })}
              </td>
              <td className="text-center">
                {editingSellId && editingSellId.id === sell.id ? (
                  <>
                    <Button variant="primary" onClick={handleSaveEdit} className="mx-2">Guardar</Button>
                    <Button variant="secondary" onClick={handleCancelEdit} className="mx-2">Cancelar</Button>
                  </>
                ) : (
                  <>
                    <Button variant="primary" onClick={() => handleEditClient(sell.id)} className="mx-2">Editar Cliente</Button>
                    <Button variant="primary" onClick={() => handleEditPaymentMethod(sell.id)} className="mx-2">Editar FPago</Button>
                  </>
                )}
                {context.user?.usuario === "admin" && (
                  <Button variant="danger" onClick={() => handleDelete(sell.id)} className="mx-2">Eliminar</Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between">
        <Button onClick={prevPage} disabled={currentPage === 1}><BsChevronLeft /></Button>
        <span>Página {currentPage} de {Math.ceil(filteredSells.length / sellsPerPage)}</span>
        <Button
          onClick={nextPage}
          disabled={currentPage === Math.ceil(filteredSells.length / sellsPerPage)}
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
