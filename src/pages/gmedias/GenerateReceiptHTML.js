export const GenerateReceiptHTML = (sell, productos, nombreCliente, nombreFormaPago) => {
  const fechaVenta = sell.fecha;

  // Generar la lista de productos
  const productList = productos
    .map(
      (producto) => `
    <tr>
      <td>${producto.num_media || ""}</td>
      <td>${producto.garron || ""}</td>
      <td>${producto.tropa || ""}</td>
      <td>${producto.precio ? producto.precio.toLocaleString("es-AR", { style: "currency", currency: "ARS" }) : ""}</td>
      <td>${producto.kg || ""}</td>
      <td>${producto.categoria_producto || ""}</td>
    </tr>
  `
    )
    .join("");

  const todosProductosTienenPrecioYKg = productos.every(producto => producto.precio && producto.kg);
  const montoTotalVenta = todosProductosTienenPrecioYKg 
    ? sell.monto_total.toLocaleString("es-AR", { style: "currency", currency: "ARS" }) 
    : "Monto de la venta a confirmar";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>La Tradición Carnicerías - Recibo de Venta</title>
      <style>
        @media print {
          @page {
            size: auto; /* Ajusta automáticamente el tamaño de la página al contenido */
            margin: 0; /* Sin márgenes */
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          margin: 0;
          padding: 0;
        }
        h2, p {
          margin: 0;
          padding: 2px 0;
          text-align: center;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          border: 1px solid #000;
          padding: 4px;
          text-align: left;
          font-size: 12px;
        }
        th {
          background-color: #f2f2f2;
        }
        /* Opcional: Ajustes específicos para impresoras térmicas */
        div {
          page-break-inside: avoid; /* Evita que el contenido se divida en páginas */
        }
      </style>
    </head>
    <body>
      <div>
        <h2>La Tradición Carnicerías</h2>
        <h2>Recibo de Venta N° ${sell.id}</h2>
        <p>Fecha: ${fechaVenta}</p>
        <p>Cliente: ${nombreCliente}</p>
        <p>Forma de Pago: ${nombreFormaPago}</p>
        <p>Cantidad total: ${sell.cantidad_total}</p>
        <p>Peso total: ${sell.peso_total}</p>
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Garrón</th>
              <th>Tropa</th>
              <th>Precio</th>
              <th>Peso</th>
              <th>Categoría</th>
            </tr>
          </thead>
          <tbody>
            ${productList}
          </tbody>
        </table>
        <p>Monto Total: ${montoTotalVenta}</p>
      </div>
    </body>
    </html>
  `;
};
