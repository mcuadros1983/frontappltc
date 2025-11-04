import React, { useState, useEffect } from "react";
import { Container, Table, Button } from "react-bootstrap";
import "../../../components/css/styles.css";

export default function ListaRindesConsolidados() {
  const [metricas, setMetricas] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [mostrarContenido, setMostrarContenido] = useState(false);
  const [mostrarTabla2, setMostrarTabla2] = useState(false);
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchRindesGenerales = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}/general`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          console.log("data", data)
          const { metricas, columnas } = transformToComparative(data.rindes);
          setMetricas(metricas);
          setColumnas(columnas);
        } else {
          throw new Error("Error al obtener los rindes generales");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Ocurrió un error al obtener los rindes generales.");
      } finally {
        setLoading(false);
      }
    };
    fetchRindesGenerales();
  }, []);

  const transformToComparative = (rindes) => {
    const metricas = [
      { label: "Nº de 1/2 Res", key: "cantidadMedias" },
      { label: "Kg. De Carne", key: "totalKg" },
      { label: "M.B. estimado del Cerdo", key: "mbcerdo", prefix: "$" },
      { label: "Costo prom. /Kg. De Carne", key: "costoprom", prefix: "$" },
      { label: "Margen de la venta de carne", key: "mgtotal", prefix: "$" },
      { label: "Margen/Kg. Vendido de Carne", key: "mgporkg", prefix: "$" },
      { label: "Total de Venta", key: "totalventa", prefix: "$" },
      { label: "Gastos Diarios", key: "gastos", prefix: "$" },
      { label: "Gastos Caja Grande", key: "cajagrande", prefix: "$" },
      { label: "Otros productos", key: "otros", prefix: "$" },
      { label: "1/2 Res Ingresada", key: "costovacuno", prefix: "$" },
      { label: "Achuras y Productos", key: "achuras", prefix: "$" },
      { label: "Diferencia de Inventario", key: "difInventario", prefix: "$" },
      { label: "Compra de Cerdo", key: "costoporcino", prefix: "$" },
      { label: "KG. De Cerdo", key: "totalKgCerdo" },
    ];

    const columnas = [...rindes]
      .sort((a, b) => {
        const dateA = new Date(a.anio, a.mes - 1);
        const dateB = new Date(b.anio, b.mes - 1);
        return dateB - dateA;
      })
      .map((r) => ({
        titulo: `${r.mes}/${r.anio}`,
        ...r,
      }));

    return { metricas, columnas };
  };

  const tabla2Metricas = [
    { label: "Ingreso Esperado nt", key: "novillosIngresos", prefix: "$" },
    { label: "Ingreso Esperado ex", key: "exportacionIngresos", prefix: "$" },
    { label: "Kg Nt, Mej, o Vq", key: "totalKgNovillo" },
    { label: "Kg Exportacion", key: "totalKgVaca" },
    { label: "Kg. De Carne", key: "totalKg" },
    { label: "Costo prom. /Kg. De Carne", key: "costoprom", prefix: "$" },
    { label: "Ingreso por Kg. Esperado", key: "ingEsperado", prefix: "$" },
    { label: "Ingreso por Kg. Vendido", key: "ingVendido", prefix: "$" },
    { label: "Diferencia/Kg. Esperado de Carne", key: "difEsperado", prefix: "$" },
    { label: "Diferencia/Kg. Vendido de Carne", key: "difVendido", prefix: "$" },
    { label: "Porcentaje de Perdida", key: "rinde", suffix: "%" },
    { label: "Valor de un 1% de Rinde", key: "valorRinde" },
    { label: "Eficiencia en el uso de la carne", key: "eficiencia", prefix: "$" },
  ];

  const renderTabla = (titulo, metricas, mostrar, setMostrar) => (
  <>
    <div className="vt-toolbar mb-3 d-flex gap-2">
      <Button
        variant={mostrar ? "secondary" : "primary"}
        onClick={() => setMostrar(!mostrar)}
        className={mostrar ? "vt-btn-secondary" : "vt-btn"}
      >
        {mostrar ? `Ocultar ${titulo}` : `Mostrar ${titulo}`}
      </Button>
    </div>

    <div className="vt-tablewrap table-responsive fixed-table-container">
      <Table striped bordered hover responsive className="mb-2">
        <thead>
          <tr>
            <th className="vt-sticky-col">{titulo}</th>
            {columnas.map((col, i) => (
              <th key={i} className="text-end">{col.titulo}</th>
            ))}
          </tr>
        </thead>

        {mostrar && (
          <tbody>
            {metricas.map((metrica, i) => (
              <tr key={i}>
                <td className="vt-sticky-col">{metrica.label}</td>
                {columnas.map((col, j) => (
                  <td key={j} className="text-end">
                    {col[metrica.key] != null
                      ? `${metrica.prefix || ""}${parseFloat(
                          metrica.key === "rinde" ? col[metrica.key] * 100 : col[metrica.key]
                        ).toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}${metrica.suffix || ""}`
                      : "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        )}
      </Table>
    </div>
  </>
);

return (
  <Container className="vt-page">
    <h1 className="my-list-title dark-text vt-title">Comparativo de Rindes Consolidados</h1>

    {columnas.length > 0 && (
      <>
        {renderTabla("Resultado Consolidado", metricas, mostrarContenido, setMostrarContenido)}
        {renderTabla("Rendimiento Consolidado", tabla2Metricas, mostrarTabla2, setMostrarTabla2)}
      </>
    )}
  </Container>
);

}
