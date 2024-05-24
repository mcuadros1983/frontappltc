import React, { useContext, useState } from "react";
import Contexts from "../context/Contexts";

export default function Main() {
  const context = useContext(Contexts.dataContext);
  // console.log("clientes",context.clientesTabla)
  return (
    <div className="d-flex align-items-center justify-content-center">
      {/* Agregar imagen centrada */}
      <img
        src="/ltc.png" // Ruta relativa al directorio "public"
        alt="LTC Logo"
        className="img-fluid"
        style={{ maxWidth: "50%", height: "auto" }}
      />
    </div>
  );
}
