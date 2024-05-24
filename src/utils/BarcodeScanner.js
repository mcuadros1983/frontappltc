import React, { useEffect, useRef } from 'react';

const BarcodeScanner = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const loadOpenCV = async () => {
      // Cargar OpenCV
      const cv = await window.cv;

      const cap = new cv.VideoCapture(videoRef.current);
      const frame = new cv.Mat();

      const processVideo = () => {
        try {
          if (!cap || cap.isOpened() === false) {
            return;
          }

          cap.read(frame);

          // Convertir el marco a una imagen en escala de grises
          const gray = new cv.Mat();
          cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY);

          // Detectar códigos de barras
          const barcodes = new cv.MatVector();
          const scanner = new cv.BarcodeDetector();
          scanner.detectMulti(gray, barcodes);

          // Dibujar los códigos de barras encontrados
          for (let i = 0; i < barcodes.size(); ++i) {
            const barcode = barcodes.get(i);
            const p1 = new cv.Point(barcode.x, barcode.y);
            const p2 = new cv.Point(barcode.x + barcode.width, barcode.y + barcode.height);
            cv.rectangle(frame, p1, p2, new cv.Scalar(0, 255, 0), 2);

            const text = barcode.data;
            cv.putText(frame, text, new cv.Point(barcode.x, barcode.y - 10), cv.FONT_HERSHEY_SIMPLEX, 0.9, new cv.Scalar(0, 255, 0), 2);
          }

          // Mostrar el marco en el elemento de video
          cv.imshow('barcode-scanner', frame);

          // Liberar memoria
          gray.delete();
          barcodes.delete();
          scanner.delete();

          requestAnimationFrame(processVideo);
        } catch (error) {
          console.error('Error al procesar el video:', error);
        }
      };

      processVideo();
    };

    // Cargar opencv.js
    const loadOpenCVScript = () => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'opencv.js';
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    loadOpenCVScript()
      .then(loadOpenCV)
      .catch(error => console.error('Error al cargar opencv.js:', error));

    return () => {
      // Limpiar al desmontar el componente
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return <video ref={videoRef} id="barcode-scanner" width="640" height="480" autoPlay></video>;
};

export default BarcodeScanner;
