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
      });

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
      });
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
    <Container>
      <h1 className="my-list-title dark-text">Cierres Z</h1>

      <div className="mb-3 d-flex justify-content-end">
        <Button variant="success" onClick={exportToExcel}>
          Exportar a Excel
        </Button>
      </div>

      <div className="mb-3 d-flex flex-wrap align-items-end">
        <div style={{ marginRight: '20px', marginBottom: '10px' }}>
          <label className="form-label">Desde:</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="form-control"
          />
        </div>

        <div style={{ marginRight: '20px', marginBottom: '10px' }}>
          <label className="form-label">Hasta:</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="form-control"
          />
        </div>

        <div style={{ marginRight: '20px', marginBottom: '10px' }}>
          <label className="form-label">CUIT:</label>
          <select
            value={cuit}
            onChange={(e) => setCuit(e.target.value)}
            className="form-control"
          >
            <option value="">Seleccione CUIT</option>
            <option value="30708490004">30708490004</option>
            <option value="20246050822">20246050822</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <Button variant="primary" onClick={handleFilter}>
            Filtrar
          </Button>
        </div>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha Jornada</th>
            <th>CUIT</th>
            <th>Punto Venta</th>
            <th>Nro Z</th>
            <th>Primer Comp.</th>
            <th>Último Comp.</th>
            <th>Emitidos</th>
            <th>Cancelados</th>
            <th>Neto</th>
            <th>IVA 10.5%</th>
            <th>IVA 21%</th>
            <th>IVA Total</th>
            <th>Total</th>
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
              <td>{cierre.cantidadEmitidos}</td>
              <td>{cierre.cantidadCancelados}</td>
              <td>{formatearNumero(cierre.neto)}</td>
              <td>{formatearNumero(cierre.iva105)}</td>
              <td>{formatearNumero(cierre.iva21)}</td>
              <td>{formatearNumero(cierre.ivaTotal)}</td>
              <td>{formatearNumero(cierre.total)}</td>
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
              <tr style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
                <td colSpan={9} className="text-end">Totales:</td>
                <td>{formatearNumero(totalNeto)}</td>
                <td>{formatearNumero(totalIva105)}</td>
                <td>{formatearNumero(totalIva21)}</td>
                <td>{formatearNumero(totalIvaTotal)}</td>
                <td>{formatearNumero(totalTotal)}</td>
              </tr>
            );
          })()}
        </tbody>
      </Table>


      <div className="d-flex justify-content-center align-items-center">
        <Button onClick={prevPage} disabled={currentPage === 1}>
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de {Math.ceil(cierres.length / cierresPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={currentPage === Math.ceil(cierres.length / cierresPerPage)}
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
};

export default ListadoCierresZ;
