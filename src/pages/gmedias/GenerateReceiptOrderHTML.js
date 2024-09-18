export const GenerateReceiptOrderHTML = (ingreso, productos, nombreSucursal) => {

  // Formatear la fecha del ingreso
  const fechaIngreso = new Date(ingreso.fecha).toLocaleDateString();

  // Generar la lista de productos
  const productList = productos.map(producto => `
    <tr>
    <td>${producto.num_media ? producto.num_media : ''}</td>
    <td>${producto.garron ? producto.garron : ''}</td>
    <td>${producto.kg ? producto.kg : ''}</td>
    <td>${producto.categoria_producto ? producto.categoria_producto : ''}</td>
    </tr>
  `).join('');

  return `
    <div>
    <h2>Orden de Egreso N° ${ingreso.id}</h2>
    <p>Fecha: ${fechaIngreso ? fechaIngreso : ''}</p>
    <p>Sucursal: ${nombreSucursal ? nombreSucursal : ''}</p>
    <p>Cantidad total: ${ingreso.cantidad_total ? ingreso.cantidad_total : ''}</p>
    <p>Peso total: ${ingreso.peso_total ? ingreso.peso_total : ''}</p>
      <table>
        <thead>
          <tr>
            <th>Número</th>
            <th>Garrón</th>
            <th>Peso</th>
            <th>Categoria</th>
          </tr>
        </thead>
        <tbody>
          ${productList}
        </tbody>
      </table>
    </div>
  `;
};