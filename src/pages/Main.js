import React from "react";

import {
  FiGrid,
} from "react-icons/fi";

import HeroSearch
  from "../components/shortcuts/HeroSearch";

import ShortcutsBar
  from "../components/shortcuts/ShortcutsBar";

import "./Main.css";


export default function Main() {

  return (

    <div className="erp-home">

      {/*
      |--------------------------------------------------------------------------
      | FONDO
      |--------------------------------------------------------------------------
      */}

      <div className="erp-home__background">

        <img
          src="/ltc.png"
          alt=""
          className="erp-home__logo"
        />

      </div>


      {/*
      |--------------------------------------------------------------------------
      | CONTENIDO
      |--------------------------------------------------------------------------
      */}

      <div className="erp-home__content">

        <div className="erp-home__heading">

          <div>

            <div className="erp-home__eyebrow">
              <FiGrid />
              Sistema de gestión
            </div>

            <h1 className="erp-home__title">
              Panel principal
            </h1>

            <p className="erp-home__subtitle">
              Busca una función del sistema o accede rápidamente
              a tus herramientas habituales.
            </p>

          </div>

        </div>


        <HeroSearch />


        <ShortcutsBar />

      </div>

    </div>

  );

}