import React from "react";
import { Table } from "react-bootstrap";

const CategorySummaryTable = ({ filteredProducts }) => {
  const categorySummary = filteredProducts.reduce((summary, product) => {
    const category = product.categoria_producto;
    const peso = parseFloat(product.kg);

    if (!summary[category]) {
      summary[category] = {
        cantidad: 0,
        pesoTotal: 0,
      };
    }

    // Incrementar la cantidad
    summary[category].cantidad += 1;

    // Sumar el peso si es válido y no es NaN
    if (!isNaN(peso) && peso > 0) {
      summary[category].pesoTotal += Number(peso);
    }

    return summary;
  }, {});

  // Ajustar las categorías que tienen peso total igual a 0 para mostrar "N/A"
  Object.keys(categorySummary).forEach((category) => {
    if (categorySummary[category].pesoTotal === 0) {
      categorySummary[category].pesoTotal = "N/A";
    }
  });

  return (
    <div style={{ maxWidth: "25%", marginTop: "20px" }}>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Categoría</th>
            <th>Cantidad</th>
            <th>Peso Total</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(categorySummary).map((category) => (
            <tr key={category}>
              <td>{category}</td>
              <td>{categorySummary[category].cantidad}</td>
              <td>{categorySummary[category].pesoTotal}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CategorySummaryTable;
