// components/cierres/ListadoCierresZ.js

import React, { useState, useEffect } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsTrash, BsPencilSquare, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import * as XLSX from "xlsx";


const ListadoCierresZ = () => {
  const [cierres, setCierres] = useState([]);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [cuit, setCuit] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [cierresPerPage] = useState(10);

  const apiUrl = process.env.REACT_APP_API_URL;

  const exportToExcel = () => {
    if (cierres.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const dataFormateada = cierres.map((c) => ({
      ID: c.id,
      Fecha: c.fechaJornada,
      CUIT: c.cuit,
      "Punto Venta": c.puntoVenta,
      "Nro Z": c.numeroZeta,
      "Primer Comp.": c.primerComprobante,
      "Último Comp.": c.ultimoComprobante,
      "Emitidos": c.cantidadEmitidos,
      "Cancelados": c.cantidadCancelados,
      "Neto": parseFloat(c.neto),
      "IVA 10.5%": parseFloat(c.iva105),
      "IVA 21%": parseFloat(c.iva21),
      "IVA Total": parseFloat(c.ivaTotal),
      "Total": parseFloat(c.total),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataFormateada);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CierresZ");
    XLSX.writeFile(workbook, `cierresZ_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleFilter = async () => {
    try {
      const res = await fetch(`${apiUrl}/caja/cierrez/filtrados`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fechaDesde, fechaHasta, cuit }),
      }, { credentials: "include" });

      if (!res.ok) throw new Error("Error al obtener los cierres Z");
      const data = await res.json();

      if (data.length === 0) {
        setCierres([]);
        alert("No hay cierres para la fecha solicitada.");
      } else {
        setCierres(data);
      }

      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      alert("Error al filtrar cierres Z");
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este cierre Z?")) return;
    try {
      const res = await fetch(`${apiUrl}/caja/cierrez/${id}`, {
        method: "DELETE",
      }, { credentials: "include" });
      if (!res.ok) throw new Error("Error al eliminar");
      setCierres(cierres.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error al eliminar cierre Z");
    }
  };

  const indexOfLast = currentPage * cierresPerPage;
  const indexOfFirst = indexOfLast - cierresPerPage;
  const currentCierres = cierres.slice(indexOfFirst, indexOfLast);

  const nextPage = () => {
    if (currentPage < Math.ceil(cierres.length / cierresPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const calcularTotales = () => {
    const totalNeto = cierres.reduce((sum, item) => sum + parseFloat(item.neto || 0), 0);
    const totalIva105 = cierres.reduce((sum, item) => sum + parseFloat(item.iva105 || 0), 0);
    const totalIva21 = cierres.reduce((sum, item) => sum + parseFloat(item.iva21 || 0), 0);
    const totalIvaTotal = cierres.reduce((sum, item) => sum + parseFloat(item.ivaTotal || 0), 0);
    const totalTotal = cierres.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);

    return {
      totalNeto,
      totalIva105,
      totalIva21,
      totalIvaTotal,
      totalTotal,
    };
  };

  const decimalConComa = (valor) => {
    return (parseFloat(valor) || 0).toFixed(2).replace('.', ',');
  };

  const formatearNumero = (valor) =>
    new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor);

 return (
  <Container className="vt-page">
    <h1 className="my-list-title dark-text vt-title">Cierres Z</h1>

    {/* Barra superior: acción principal */}
    <div className="d-flex justify-content-end mb-3">
      <Button variant="success" onClick={exportToExcel} className="vt-btn">
        Exportar a Excel
      </Button>
    </div>

    {/* Filtros */}
    <div className="vt-toolbar mb-3 d-flex flex-wrap align-items-end gap-3">
      <div className="d-inline-block w-auto mx-2">
        <label className="mr-2">Desde:</label>
        <input
          type="date"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
          className="form-control rounded-0 text-center vt-input"
        />
      </div>

      <div className="d-inline-block w-auto mx-2">
        <label className="ml-2 mr-2">Hasta:</label>
        <input
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
          className="form-control rounded-0 text-center vt-input"
        />
      </div>

      <div className="d-inline-block w-auto mx-2">
        <label className="d-block">CUIT</label>
        <select
          value={cuit}
          onChange={(e) => setCuit(e.target.value)}
          className="form-control vt-input"
          style={{ minWidth: 240 }}
        >
          <option value="">Seleccione CUIT</option>
          <option value="30708490004">30708490004</option>
          <option value="20246050822">20246050822</option>
        </select>
      </div>

      <div className="d-inline-block mx-2">
        <Button variant="primary" onClick={handleFilter} className="vt-btn">
          Filtrar
        </Button>
      </div>
    </div>

    {/* Tabla */}
    <div className="vt-tablewrap table-responsive">
      <Table striped bordered hover className="mb-2">
        <thead>
          <tr>
            <th className="vt-th-sort">ID</th>
            <th className="vt-th-sort">Fecha Jornada</th>
            <th className="vt-th-sort">CUIT</th>
            <th className="vt-th-sort">Punto Venta</th>
            <th className="vt-th-sort">Nro Z</th>
            <th className="vt-th-sort">Primer Comp.</th>
            <th className="vt-th-sort">Último Comp.</th>
            <th className="vt-th-sort text-end">Emitidos</th>
            <th className="vt-th-sort text-end">Cancelados</th>
            <th className="vt-th-sort text-end">Neto</th>
            <th className="vt-th-sort text-end">IVA 10.5%</th>
            <th className="vt-th-sort text-end">IVA 21%</th>
            <th className="vt-th-sort text-end">IVA Total</th>
            <th className="vt-th-sort text-end">Total</th>
          </tr>
        </thead>
        <tbody>
          {currentCierres.map((cierre) => (
            <tr key={cierre.id}>
              <td>{cierre.id}</td>
              <td>{cierre.fechaJornada}</td>
              <td>{cierre.cuit}</td>
              <td>{cierre.puntoVenta}</td>
              <td>{cierre.numeroZeta}</td>
              <td>{cierre.primerComprobante}</td>
              <td>{cierre.ultimoComprobante}</td>
              <td className="text-end">{cierre.cantidadEmitidos}</td>
              <td className="text-end">{cierre.cantidadCancelados}</td>
              <td className="text-end">{formatearNumero(cierre.neto)}</td>
              <td className="text-end">{formatearNumero(cierre.iva105)}</td>
              <td className="text-end">{formatearNumero(cierre.iva21)}</td>
              <td className="text-end">{formatearNumero(cierre.ivaTotal)}</td>
              <td className="text-end">{formatearNumero(cierre.total)}</td>
            </tr>
          ))}

          {cierres.length > 0 && (() => {
            const {
              totalNeto,
              totalIva105,
              totalIva21,
              totalIvaTotal,
              totalTotal,
            } = calcularTotales();

            return (
              <tr className="vt-total-row">
                <td colSpan={9} className="text-end">
                  <strong>Totales:</strong>
                </td>
                <td className="text-end"><strong>{formatearNumero(totalNeto)}</strong></td>
                <td className="text-end"><strong>{formatearNumero(totalIva105)}</strong></td>
                <td className="text-end"><strong>{formatearNumero(totalIva21)}</strong></td>
                <td className="text-end"><strong>{formatearNumero(totalIvaTotal)}</strong></td>
                <td className="text-end"><strong>{formatearNumero(totalTotal)}</strong></td>
              </tr>
            );
          })()}
        </tbody>
      </Table>
    </div>

    {/* Paginación */}
    <div className="d-flex justify-content-center align-items-center vt-pager">
      <Button onClick={prevPage} disabled={currentPage === 1} variant="light">
        <BsChevronLeft />
      </Button>
      <span className="mx-2">
        Página {currentPage} de {Math.ceil(cierres.length / cierresPerPage)}
      </span>
      <Button
        onClick={nextPage}
        disabled={currentPage === Math.ceil(cierres.length / cierresPerPage)}
        variant="light"
      >
        <BsChevronRight />
      </Button>
    </div>
  </Container>
);

};

export default ListadoCierresZ;
