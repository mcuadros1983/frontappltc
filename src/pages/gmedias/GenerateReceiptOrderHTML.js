// export const GenerateReceiptOrderHTML = (ingreso, productos, nombreSucursal) => {

//   // Formatear la fecha del ingreso
//   const fechaIngreso = new Date(ingreso.fecha).toLocaleDateString();

//   // Generar la lista de productos
//   const productList = productos.map(producto => `
//     <tr>
//     <td>${producto.num_media ? producto.num_media : ''}</td>
//     <td>${producto.garron ? producto.garron : ''}</td>
//     <td>${producto.kg ? producto.kg : ''}</td>
//     <td>${producto.categoria_producto ? producto.categoria_producto : ''}</td>
//     </tr>
//   `).join('');

//   return `
//     <div>
//     <h2>Orden de Egreso N° ${ingreso.id}</h2>
//     <p>Fecha: ${fechaIngreso ? fechaIngreso : ''}</p>
//     <p>Sucursal: ${nombreSucursal ? nombreSucursal : ''}</p>
//     <p>Cantidad total: ${ingreso.cantidad_total ? ingreso.cantidad_total : ''}</p>
//     <p>Peso total: ${ingreso.peso_total ? ingreso.peso_total : ''}</p>
//       <table>
//         <thead>
//           <tr>
//             <th>Número</th>
//             <th>Garrón</th>
//             <th>Peso</th>
//             <th>Categoria</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${productList}
//         </tbody>
//       </table>
//     </div>
//   `;
// };

export const GenerateReceiptOrderHTML = (ingreso, productos, nombreSucursal) => {
  // Formatear la fecha del ingreso
  const fechaIngreso = new Date(ingreso.fecha).toLocaleDateString();

  // Generar la lista de productos
  const productList = productos
    .map(
      (producto) => `
    <tr>
      <td>${producto.num_media || ""}</td>
      <td>${producto.garron || ""}</td>
      <td>${producto.kg || ""}</td>
      <td>${producto.categoria_producto || ""}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>La Tradición Carnicerías - Orden de Egreso</title>
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
        <h2>Orden de Egreso N° ${ingreso.id}</h2>
        <p>Fecha: ${fechaIngreso || ""}</p>
        <p>Sucursal: ${nombreSucursal || ""}</p>
        <p>Cantidad total: ${ingreso.cantidad_total || ""}</p>
        <p>Peso total: ${ingreso.peso_total || ""}</p>
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Garrón</th>
              <th>Peso</th>
              <th>Categoría</th>
            </tr>
          </thead>
          <tbody>
            ${productList}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;
};
