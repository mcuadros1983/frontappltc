import React, { useState } from "react";

export default function ProductSearch({ products, onProductSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;
  
  const filteredProducts = products.filter((product) =>
    product.num_media.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = (product) => {
    onProductSelect(product);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar por número de media"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ul>
        {filteredProducts.map((product) => (
          <li
            key={product.codigo_de_barra}
            onDoubleClick={() => handleProductSelect(product)}
          >
            {product.num_media}
          </li>
        ))}
      </ul>
    </div>
  );
}
