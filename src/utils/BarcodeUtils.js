// BarcodeUtils.js

import cv from 'opencv.js'; // Importa OpenCV.js

export const captureBarcode = (setIsCapturingBarcode, setBarcodeNumber, setProduct) => {
    setIsCapturingBarcode(true);
    let videoStream = null;
  
    // Lógica para abrir la cámara y capturar el código de barras
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoStream = stream;
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.play();
  
        // Capturar el código de barras
        const captureFrame = () => {
          const canvasElement = document.createElement('canvas');
          const context = canvasElement.getContext('2d');
          canvasElement.width = videoElement.videoWidth;
          canvasElement.height = videoElement.videoHeight;
          context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
          const imageData = context.getImageData(0, 0, canvasElement.width, canvasElement.height);
  
          // Convertir la imagen a formato adecuado para OpenCV.js
          const src = cv.matFromImageData(imageData);
          const dst = new cv.Mat();
  
          // Convertir a escala de grises
          cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
  
          // Detectar códigos de barras usando el detector de barras de OpenCV.js
          const barcodes = new cv.BarcodeDetector().detect(dst);
  
          if (barcodes.size() > 0) {
            // Si se encuentra un código de barras, detener la captura y actualizar el número de código de barras
            setIsCapturingBarcode(false);
            setBarcodeNumber(barcodes.get(0).data);
            setProduct({...product, codigo_de_barra: barcodes.get(0).data});
            videoStream.getTracks().forEach(track => track.stop());
          } else {
            // Si no se encuentra ningún código de barras, continuar capturando
            requestAnimationFrame(captureFrame);
          }
  
          // Liberar recursos
          src.delete();
          dst.delete();
        };
  
        // Iniciar la captura de fotogramas
        requestAnimationFrame(captureFrame);
      })
      .catch((error) => {
        console.error('Error al acceder a la cámara:', error);
        setIsCapturingBarcode(false);
      });
  };
  
  export const cancelBarcodeCapture = (videoStream) => {
    if (videoStream) {
      // Detener la captura de video cerrando la cámara
      videoStream.getTracks().forEach(track => track.stop());
    }
    // Realiza cualquier limpieza adicional necesaria
  };
  