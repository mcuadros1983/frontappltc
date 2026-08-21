import React, {

  useEffect,
  useMemo,
  useRef,
  useState,

} from "react";

import {

  Form,
  InputGroup,
  Button,

} from "react-bootstrap";

import {

  FiSearch,
  FiArrowRight,

} from "react-icons/fi";

import {

  Link,

} from "react-router-dom";

import {

  getNavLinks,

} from "../../utils/navApi";

import {

  getIconByName,

} from "../../utils/uiIcons";

import {

  useSecurity,

} from "../../security/SecurityContext";

import "./HeroSearch.css";


const norm = (s = "") =>

  s
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );


export default function HeroSearch() {

  const {

    user,

  } = useSecurity();


  const roleId =
    user?.rol_id;

  const userId =
    user?.id;


  const [
    q,
    setQ,
  ] = useState("");


  const [
    catalog,
    setCatalog,
  ] = useState([]);


  const [
    open,
    setOpen,
  ] = useState(false);


  const boxRef =
    useRef(null);

  const acRef =
    useRef(null);


  /*
  |--------------------------------------------------------------------------
  | CARGAR CATÁLOGO
  |--------------------------------------------------------------------------
  */

  useEffect(
    () => {

      let mounted = true;


      if (
        acRef.current
      ) {

        acRef.current.abort();

      }


      const ac =
        new AbortController();


      acRef.current =
        ac;


      (
        async () => {

          try {

            const data =
              await getNavLinks({
                roleId,
                userId,
              });


            const links =
              Array.isArray(data)
                ? data
                : data?.links || [];


            if (mounted) {

              setCatalog(
                links
              );

            }

          }
          catch (e) {

            if (
              e.name !==
              "AbortError"
            ) {

              console.error(
                "HeroSearch getNavLinks error:",
                e
              );

            }

          }

        }
      )();


      return () => {

        mounted = false;

        ac.abort();

      };

    },
    [
      roleId,
      userId,
    ]
  );


  /*
  |--------------------------------------------------------------------------
  | CLICK FUERA
  |--------------------------------------------------------------------------
  */

  useEffect(
    () => {

      const handler =
        (e) => {

          if (
            boxRef.current &&
            !boxRef.current.contains(
              e.target
            )
          ) {

            setOpen(false);

          }

        };


      document.addEventListener(
        "mousedown",
        handler
      );


      return () =>
        document.removeEventListener(
          "mousedown",
          handler
        );

    },
    []
  );


  /*
  |--------------------------------------------------------------------------
  | FILTRADO
  |--------------------------------------------------------------------------
  */

  const filtered =
    useMemo(
      () => {

        if (!q) {

          return [];

        }


        const s =
          norm(q);


        return catalog
          .filter(
            (x) =>

              norm(
                x.label
              ).includes(s) ||

              norm(
                x.path
              ).includes(s) ||

              (
                x.keywords ||
                []
              ).some(
                (k) =>
                  norm(k)
                    .includes(s)
              )
          )
          .slice(
            0,
            10
          );

      },
      [
        catalog,
        q,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (

    <div
      className="erp-search"
      ref={boxRef}
    >

      <div className="erp-search__content">

        <div className="erp-search__heading">

          <div className="erp-search__icon">

            <FiSearch />

          </div>


          <div>

            <div className="erp-search__title">
              ¿Qué estás buscando?
            </div>

            <div className="erp-search__subtitle">
              Encuentra rápidamente módulos,
              pantallas y funciones del sistema.
            </div>

          </div>

        </div>


        <Form
          onSubmit={
            (e) => {

              e.preventDefault();

              if (q.trim()) {

                setOpen(true);

              }

            }
          }
        >

          <InputGroup className="erp-search__input">

            <InputGroup.Text>

              <FiSearch />

            </InputGroup.Text>


            <Form.Control

              placeholder="Buscar módulos, funciones o acciones..."

              value={q}

              autoComplete="off"

              onChange={
                (e) => {

                  setQ(
                    e.target.value
                  );

                  setOpen(
                    Boolean(
                      e.target.value
                        .trim()
                    )
                  );

                }
              }

              onFocus={
                () => {

                  if (
                    q.trim()
                  ) {

                    setOpen(true);

                  }

                }
              }

            />


            <Button
              type="submit"
              variant="primary"
            >

              Buscar

            </Button>

          </InputGroup>

        </Form>


        {
          open && (

            <div className="erp-search__dropdown">

              {
                filtered.length ===
                  0
                  ? (

                    <div className="erp-search__empty">

                      <FiSearch />

                      <div>

                        <strong>
                          Sin coincidencias
                        </strong>

                        <span>
                          Prueba con otro término de búsqueda.
                        </span>

                      </div>

                    </div>

                  )
                  : filtered.map(
                    (it) => (

                      <Link

                        key={
                          it.path
                        }

                        to={
                          it.path
                        }

                        className="erp-search__result"

                        onClick={
                          () =>
                            setOpen(false)
                        }

                      >

                        <span className="erp-search__result-icon">

                          {
                            getIconByName(
                              it.icon ||
                              it.path ||
                              it.label,
                              {
                                size: 19,
                              }
                            )
                          }

                        </span>


                        <span className="erp-search__result-content">

                          <strong>
                            {it.label}
                          </strong>

                          <small>
                            {it.path}
                          </small>

                        </span>


                        <FiArrowRight className="erp-search__result-arrow" />

                      </Link>

                    )
                  )
              }

            </div>

          )
        }

      </div>

    </div>

  );

}