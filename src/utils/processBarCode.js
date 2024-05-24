export function processBarCode(codBar, categoria) {
  let longitudRequerida;
  let num_media;
  let tropa;
  let kg;

  if (categoria === "bovino") {
    longitudRequerida = 30;
    num_media = parseFloat(codBar.slice(2, 13));
    tropa = parseFloat(codBar.slice(14, 19));
    kg = parseFloat(codBar.slice(26, 28));
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
