// export const GenerateReceiptReceiptHTML = (ingreso, productos) => {

//   // Formatear la fecha de la venta
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
//     <h2>Comprobante de Ingreso N° ${ingreso.id}</h2>
//     <p>Fecha: ${fechaIngreso}</p>
//     <p>Sucursal: CENTRAL</p>
//     <p>Categoría: ${ingreso.categoria_ingreso ? ingreso.categoria_ingreso : ''}</p>
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
export const GenerateReceiptReceiptHTML = (ingreso, productos) => {
  const fechaIngreso = new Date(ingreso.fecha).toLocaleDateString();

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
    <html>
      <head>
        <title>La Tradición Carnicerías</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid black;
            padding: 5px;
            text-align: left;
          }
          h2 {
            text-align: center;
          }
          p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <h2>Comprobante de Ingreso N° ${ingreso.id}</h2>
        <p>Fecha: ${fechaIngreso}</p>
        <p>Sucursal: CENTRAL</p>
        <p>Categoría: ${ingreso.categoria_ingreso || ""}</p>
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
      </body>
    </html>
  `;
};
