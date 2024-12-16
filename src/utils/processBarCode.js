export function processBarCode(codBar, categoria) {
  let longitudRequerida = 29;
  let num_media;
  let tropa;
  let kg;

  if (categoria === "bovino") {
    num_media = parseFloat(codBar.slice(2, 12)); // Número de media
    tropa = parseFloat(codBar.slice(13, 18)); // Número de tropa
    kg = parseInt(codBar.slice(24, 27), 10); // Peso en kg (incluye ceros iniciales)
  } else if (categoria === "porcino") {
    longitudRequerida = 7;
    num_media = codBar;
    tropa = 0;
    kg = 0;
  } else {
    return {
      success: false,
      message: "Categoría no válida.",
    };
  }

  // Validar longitud del código de barras
  if (codBar.length !== longitudRequerida) {
    return {
      success: false,
      message: `El código de barras debe tener exactamente ${longitudRequerida} dígitos.`,
    };
  }

  const result = {
    success: true,
    data: {
      num_media,
      tropa,
      kg,
    },
  };

  return result;
}
