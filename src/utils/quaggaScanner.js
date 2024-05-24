const Quagga = require('quagga');

const startBarcodeScanner = (targetElement, callback) => {
  Quagga.init({
    inputStream : {
      name : 'Live',
      type : 'LiveStream',
      target: targetElement, // Utiliza el elemento especificado como destino
      constraints: {
        width: 640,
        height: 480,
      },
    },
    decoder : {
      readers : ['code_128_reader']
    },
  }, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    Quagga.start();
  });

  // Manejar eventos de detección de códigos de barras
  Quagga.onDetected((data) => {
    // console.log("Barcode detected:", data.codeResult.code);
    Quagga.stop();
    callback(data.codeResult.code); // Llama al callback y pasa los datos del código de barras detectado
  });
};

const checkQuaggaCompatibility = () => {
  Quagga.init({
    inputStream : {
      name : 'Live',
      type : 'LiveStream',
      constraints: {
        width: 640,
        height: 480,
        facingMode: "environment" // Usa la cámara trasera si está disponible
      },
      target: document.querySelector('#scanner-container'), // Elemento DOM donde se mostrará la vista previa de la cámara
    },
    frequency: 10, // Número de veces por segundo que se intenta acceder al stream de la cámara
    decoder : {
      readers : ['code_128_reader'] // Tipo de código de barras que se intentará decodificar
    },
  }, function(err) {
    if (err) {
      console.error('Quagga error:', err);
      // El dispositivo no es compatible con Quagga
    } else {

      // El dispositivo es compatible con Quagga
    }
  });
};

module.exports = { startBarcodeScanner, checkQuaggaCompatibility };
