import React from "react";
import { Table } from "react-bootstrap";

const CategorySummaryTable = ({filteredProducts}) => {
  const categorySummary = filteredProducts.reduce((summary, product) => {
    const category = product.categoria_producto;
    const peso = parseFloat(product.kg);

    if (!summary[category]) {
      summary[category] = {
        cantidad: 0,
        pesoTotal: 0,
      };
    }

    summary[category].cantidad += 1;
    summary[category].pesoTotal += peso; // Si el peso no es cero, lo sumamos

    // Verificar si el peso es válido y no es cero antes de sumarlo
    if (!isNaN(peso)) {
      if (peso === 0) {
        summary[category].pesoTotal = "N/A"; // Si el peso es cero, establecemos "N/A"
      } else {
        summary[category].pesoTotal += peso; // Si el peso no es cero, lo sumamos
      }
    }

    return summary;
  }, {});

  // Si el peso total de la categoría es cero, mostramos "N/A"
  Object.keys(categorySummary).forEach((category) => {
    if (categorySummary[category].pesoTotal === 0) {
      categorySummary[category].pesoTotal = "N/A";
    }
  });

  return (
    <div style={{ maxWidth: "25%", marginTop: "20px" }}>
      {/* Añade un estilo inline para limitar el ancho de la tabla */}
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
              <td>
                {categorySummary[category].pesoTotal !== 0
                  ? categorySummary[category].pesoTotal
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CategorySummaryTable;