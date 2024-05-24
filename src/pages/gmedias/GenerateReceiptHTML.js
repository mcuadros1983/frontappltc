export const GenerateReceiptHTML = (sell, productos, nombreCliente, nombreFormaPago) => {

  // Formatear la fecha de la venta
  const fechaVenta = new Date(sell.fecha).toLocaleDateString();

  // Generar la lista de productos
  const productList = productos.map(producto => `
    <tr>
    <td>${producto.num_media ? producto.num_media : ''}</td>
    <td>${producto.garron ? producto.garron : ''}</td>
    <td>${producto.precio ? producto.precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) : ''}</td>
    <td>${producto.kg ? producto.kg : ''}</td>
    <td>${producto.categoria_producto ? producto.categoria_producto : ''}</td>
    </tr>
  `).join('');

  // Verificar si todos los productos tienen los campos "precio" y "kg"
  const todosProductosTienenPrecioYKg = productos.every(producto => producto.precio && producto.kg);

  // Si todos los productos tienen los campos "precio" y "kg", mostrar el monto total de la venta
  // De lo contrario, indicar "Monto de la venta a confirmar"
  const montoTotalVenta = todosProductosTienenPrecioYKg ? sell.monto_total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) : "Monto de la venta a confirmar";

  return `
    <div>
      <h2>Venta N° ${sell.id}</h2>
      <td>Fecha: ${fechaVenta}</td>
      <p>Cliente: ${nombreCliente}</p>
      <p>Forma de Pago: ${nombreFormaPago}</p>
      <p>Cantidad total: ${sell.cantidad_total}</p>
      <p>Peso total: ${sell.peso_total}</p>
      <table>
        <thead>
          <tr>
            <th>Número</th>
            <th>Garrón</th>
            <th>Precio</th>
            <th>Peso</th>
            <th>Categoria</th>
          </tr>
        </thead>
        <tbody>
          ${productList}
        </tbody>
      </table>
      <p> Monto Total ${montoTotalVenta}</p>
    </div>

  `;
};