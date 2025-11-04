import React from "react";
import ShortcutsBar from "../components/shortcuts/ShortcutsBar";
import HeroSearch from "../components/shortcuts/HeroSearch";
import "./Main.css"; // <- estilos del fondo

export default function Main() {
  return (
    <div className="home-hero">
      {/* Logo de fondo, no interactivo */}
      <img src="/ltc.png" alt="" className="home-hero__bg img-fluid"
        style={{ maxWidth: "50%", height: "auto" }} />

      {/* Hero + buscador */}
      <HeroSearch />

      {/* Accesos directos en grilla */}
      <ShortcutsBar />
    </div>
  );
}
