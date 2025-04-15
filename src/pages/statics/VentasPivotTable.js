import React, { useEffect, useState } from "react";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { Container, Spinner, Alert } from "react-bootstrap";

const VentasPivotTable = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const response = await fetch(`${apiUrl}/statics-ventas`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error al obtener las ventas");
        }

        const data = await response.json();
        setVentas(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVentas();
  }, [apiUrl]);

  const columns = [
    { accessorKey: "fecha2", header: "fecha2" },
    { accessorKey: "sucursal", header: "sucursal" },
    { accessorKey: "cliente", header: "cliente" },
    { accessorKey: "monto", header: "monto", cell: (info) => info.getValue().toFixed(2) },
    { accessorKey: "descuento", header: "descuento", cell: (info) => info.getValue().toFixed(2) },
  ];

  const table = useReactTable({
    data: ventas,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Container>
      <h1 className="my-list-title dark-text">Tabla Dinámica de Ventas</h1>
      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        <table className="table table-bordered">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Container>
  );
};

export default VentasPivotTable;
