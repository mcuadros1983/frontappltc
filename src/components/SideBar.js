// src/components/SideBar.js

import { useContext, useState } from "react";
import { useSecurity } from "../security/SecurityContext";
import { Nav } from "react-bootstrap";
import {
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";
import Collapse from "react-bootstrap/Collapse";
import Contexts from "../context/Contexts";
import "../styles/SideBar.css";


// ======================================================
// ICONOS
// ======================================================

import {
  FiHome,
  FiBookOpen,
  FiSettings,
  FiBarChart2,
  FiLogOut,
  FiArrowLeftCircle,
  FiTool,
  FiUsers,
  FiFolder,
  FiLayers,
  FiChevronsRight,
  FiChevronDown,
  FiChevronRight,
  FiCalendar,
  FiShield,
  FiMessageCircle,
  FiGift,

  // Nuevos para el buscador
  FiSearch,
  FiX
} from "react-icons/fi";

import { TbReceiptTax } from "react-icons/tb";
import { LuWallet } from "react-icons/lu";
import { MdPointOfSale } from "react-icons/md";
import { BsBuildings } from "react-icons/bs";


// ======================================================
// CARET
// ======================================================

const Caret = ({ open }) => (
  <span className="sb-caret">
    {open ? <FiChevronDown /> : <FiChevronRight />}
  </span>
);


// ======================================================
// SIDEBAR
// ======================================================

const SideBar = ({ toggleSidebar, isMobile }) => {

  // ====================================================
  // ESTADOS ORIGINALES
  // ====================================================

  const [showMainItems, setShowMainItems] = useState(true);
  const [showReturnButton, setShowReturnButton] = useState(false);

  const [useritem, setUseritem] = useState(false);
  const [bankitem, setBankitem] = useState(false);

  const [
    categoriaanimalitem,
    setCategoriaanimalitem
  ] = useState(false);

  const [proditem, setProditem] = useState(false);
  const [sucitem, setSucitem] = useState(false);
  const [custitem, setCustitem] = useState(false);

  const [waypitem, setWaypayitem] = useState(false);

  const [sellitem, setSellitem] = useState(false);
  const [debtitem, setDebtitem] = useState(false);
  const [ctacteitem, setCtacteitem] = useState(false);
  const [stockitem, setStockitem] = useState(false);
  const [orditem, setOrditem] = useState(false);
  const [receiptitem, setReceiptitem] = useState(false);

  const [sellRinde, setSellRinde] = useState(false);
  const [infoCaja, setInfoCaja] = useState(false);
  const [infoRinde, setInfoRinde] = useState(false);

  const [
    maintenanceItem,
    setMaintenanceItem
  ] = useState(false);

  const [
    customerOneShotItem,
    setCustomerOneShotItem
  ] = useState(false);

  const [
    movimientosOtros,
    setMovimientosOtros
  ] = useState(false);

  const [sellStatics, setSellStatics] = useState(false);


  // ====================================================
  // SECCIONES PRINCIPALES
  // ====================================================

  const [
    showGestionItems,
    setShowGestionItems
  ] = useState(false);

  const [
    showGestionOperativaItems,
    setShowGestionOperativaItems
  ] = useState(false);

  const [
    showConfigItems,
    setShowConfigItems
  ] = useState(false);

  const [
    showAuditoriaAtencionItems,
    setShowAuditoriaAtencionItems
  ] = useState(false);

  const [
    showDocumentacionItems,
    setShowDocumentacionItems
  ] = useState(false);

  const [
    showInspeccionesItems,
    setShowInspeccionesItems
  ] = useState(false);

  const [
    showEvaluacionItems,
    setShowEvaluacionItems
  ] = useState(false);


  // ====================================================
  // CONFIGURACIÓN
  // ====================================================

  const [
    tarjetacomunitem,
    setTarjetacomunitem
  ] = useState(false);

  const [
    planPagoTarjetaItem,
    setPlanPagoTarjetaItem
  ] = useState(false);

  const [empresaitem, setEmpresaitem] = useState(false);
  const [formapagoitem, setFormapagoitem] = useState(false);
  const [frigorificoitem, setFrigorificoitem] = useState(false);
  const [imputacionitem, setImputacionitem] = useState(false);
  const [marcatarjetaitem, setMarcatarjetaitem] = useState(false);
  const [tipotarjetaitem, setTipotarjetaitem] = useState(false);

  const [
    tipocomprobanteitem,
    setTipocomprobanteitem
  ] = useState(false);

  const [ptoventaitem, setPtoventaitem] = useState(false);
  const [proveedoritem, setProveedoritem] = useState(false);
  const [proyectoitem, setProyectoitem] = useState(false);


  // ====================================================
  // CONCILIACIÓN
  // ====================================================

  const [
    showConciliacionItems,
    setShowConciliacionItems
  ] = useState(false);

  const [rubroItem, setRubroItem] = useState(false);
  const [cuentaItem, setCuentaItem] = useState(false);
  const [criterioItem, setCriterioItem] = useState(false);


  // ====================================================
  // IVA
  // ====================================================

  const [libroIvaItem, setLibroIvaItem] = useState(false);


  // ====================================================
  // TESORERÍA
  // ====================================================

  const [cajaItem, setCajaItem] = useState(false);
  const [movCajaItem, setMovCajaItem] = useState(false);
  const [movBancoItem, setMovBancoItem] = useState(false);
  const [movTarjetaItem, setMovTarjetaItem] = useState(false);

  const [
    registroChequeItem,
    setRegistroChequeItem
  ] = useState(false);

  const [
    registroAjusteItem,
    setRegistroAjusteItem
  ] = useState(false);


  // ====================================================
  // MÓDULOS
  // ====================================================

  const [
    showStaticsItems,
    setShowStaticsItems
  ] = useState(false);

  const [
    showIVAItems,
    setShowIVAItems
  ] = useState(false);

  const [
    showAsistenciaItems,
    setShowAsistenciaItems
  ] = useState(false);

  const [
    showCajaItems,
    setShowCajaItems
  ] = useState(false);

  const [
    showFacturacionItems,
    setShowFacturacionItems
  ] = useState(false);


  // ====================================================
  // TESORERÍA / FACTURACIÓN
  // ====================================================

  const [
    categoriaTesoreriaItem,
    setCategoriaTesoreriaItem
  ] = useState(false);

  const [
    ventasFacturacionItem,
    setVentasFacturacionItem
  ] = useState(false);

  const [
    comprasFacturacionItem,
    setComprasFacturacionItem
  ] = useState(false);


  // ====================================================
  // SUELDOS
  // ====================================================

  const [
    showSueldosItems,
    setShowSueldosItems
  ] = useState(false);

  const [
    pagoSueldosItem,
    setPagoSueldosItem
  ] = useState(false);

  const [
    gastosEstimadosItem,
    setGastosEstimadosItem
  ] = useState(false);


  // ====================================================
  // PRESENTES EN EL CÓDIGO ORIGINAL
  // Compatibilidad futura
  // ====================================================

  const [messageItem, setMessageItem] = useState(false);
  const [scheduleItem, setScheduleItem] = useState(false);


  // ====================================================
  // FIDELIZACIÓN
  // ====================================================

  const [
    showFidelizacionItems,
    setShowFidelizacionItems
  ] = useState(false);


  // ====================================================
  // LEGAJOS
  // ====================================================

  const [
    showLegajosItems,
    setShowLegajosItems
  ] = useState(false);


  // ====================================================
  // INTELIGENCIA COMERCIAL
  // ====================================================

  const [
    showInteligenciaItems,
    setShowInteligenciaItems
  ] = useState(false);


  // ====================================================
  // NUEVO: BUSCADOR
  // ====================================================

  const [menuSearch, setMenuSearch] = useState("");


  // ====================================================
  // CONTEXTOS
  // ====================================================

  const context = useContext(Contexts.UserContext);

  const {
    can,
    loading
  } = useSecurity();

  const {
    setUser: setSecUser
  } = useSecurity();


  // ====================================================
  // ROUTER
  // ====================================================

  const navigate = useNavigate();

  // NUEVO:
  // únicamente para saber cuál es la ruta activa.
  const location = useLocation();


  // ====================================================
  // LOGOUT
  // ====================================================

  const handleLogout = async (e) => {
    e.preventDefault();

    try {

      await context.logout();

      setSecUser(null);

      navigate("/login", {
        replace: true
      });

    } catch (err) {

      alert(
        err?.message ||
        "No se pudo cerrar sesión"
      );

    }
  };


  // ====================================================
  // SECURITY LOADING
  // ====================================================

  if (loading) return null;


  // ====================================================
  // FUNCIONES ORIGINALES
  // ====================================================

  const toggleMainItems = () => {

    setShowMainItems(!showMainItems);

    setShowReturnButton(true);

  };


  const togglePreviousItems = () => {

    setShowMainItems(true);

    setShowReturnButton(false);

  };


  const handleLinkClick = () => {

    if (
      window.innerWidth < 993 ||
      isMobile
    ) {

      toggleSidebar?.();

    }

  };


  // ====================================================
  // NUEVO:
  // NORMALIZACIÓN PARA BÚSQUEDA
  //
  // Permite por ejemplo:
  // "prestamos" -> "Préstamos"
  // "tesoreria" -> "Tesorería"
  // ====================================================

  const normalizeSearchText = (value = "") =>
    String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();


  const normalizedMenuSearch =
    normalizeSearchText(menuSearch);


  const searchActive =
    normalizedMenuSearch.length > 0;


  // ====================================================
  // NUEVO:
  // COMPROBAR COINCIDENCIA DEL BUSCADOR
  // ====================================================

  const matchesSearch = (...values) => {

    if (!searchActive) {
      return true;
    }

    const text = values
      .map((value) =>
        normalizeSearchText(value)
      )
      .join(" ");

    return text.includes(
      normalizedMenuSearch
    );

  };


  // ====================================================
  // NUEVO:
  // RUTA ACTUAL
  // ====================================================

  const isActiveRoute = (route) => {

    if (
      !route ||
      route === "#"
    ) {
      return false;
    }

    const current =
      location.pathname.replace(/\/+$/, "") ||
      "/";

    const target =
      String(route).replace(/\/+$/, "") ||
      "/";

    return current === target;

  };


  // ====================================================
  // NUEVO:
  // CLASE PARA LINKS
  // ====================================================

  const getLinkClassName = (
    route,
    extraClass = ""
  ) => {

    return [
      "nav-link",
      extraClass,
      isActiveRoute(route)
        ? "sb-current-route"
        : ""
    ]
      .filter(Boolean)
      .join(" ");

  };


  // ====================================================
  // JSX
  // ====================================================

  return (

    <Nav
      defaultActiveKey="/"
      className="flex-column sidebar sb-root"
    >


      {/* =================================================
          HEADER
          ================================================= */}

      <div className="sb-header">

        <div className="sb-brand">

          <span className="sb-brand-icon">
            <BsBuildings />
          </span>

          <span className="sb-brand-text">
            La Tradición
          </span>

        </div>

      </div>


      {/* =================================================
          BUSCADOR
          NUEVO
          ================================================= */}

      <div className="sb-search">

        <FiSearch className="sb-search-icon" />

        <input
          type="text"
          value={menuSearch}
          onChange={(e) =>
            setMenuSearch(e.target.value)
          }
          placeholder="Buscar..."
          className="sb-search-input"
          autoComplete="off"
        />

        {menuSearch && (

          <button
            type="button"
            className="sb-search-clear"
            onClick={() =>
              setMenuSearch("")
            }
            title="Limpiar búsqueda"
          >
            <FiX />
          </button>

        )}

      </div>


      {/* =================================================
          CUERPO DEL SIDEBAR
          ================================================= */}

      <div className="sb-body">


        {/* =================================================
            LA PARTE 2 COMIENZA AQUÍ
            INICIO + MENÚ PRINCIPAL
            ================================================= */}

        {/* =================================================
            INICIO
            ================================================= */}

        <Nav.Item>
          <Link
            to="/dashboard"
            className={getLinkClassName(
              "/dashboard",
              "sb-top"
            )}
            onClick={handleLinkClick}
          >
            <FiHome className="sb-ico" />
            <span>Inicio</span>
          </Link>
        </Nav.Item>


        {/* =================================================
            HOME: BLOQUE PRINCIPAL
            ================================================= */}

        {showMainItems &&
          !showGestionItems &&
          !showGestionOperativaItems &&
          !showReturnButton &&
          !showConfigItems &&
          !showAuditoriaAtencionItems &&
          !showDocumentacionItems &&
          !showInspeccionesItems &&
          !showEvaluacionItems &&
          !showFidelizacionItems &&
          !showLegajosItems &&
          !showInteligenciaItems &&
          !showConciliacionItems && (
            <>


              {/* =============================================
                  CONFIGURACIÓN
                  permiso real: config:view
                  ============================================= */}

              {can("config:view") && (
                <Nav.Item
                  onClick={() => {
                    setShowMainItems(false);
                    setShowConfigItems(true);
                    setShowReturnButton(true);
                  }}
                  className="sb-top"
                >
                  <Link
                    to="#"
                    className="nav-link"
                  >
                    <FiSettings className="sb-ico" />

                    <span>
                      Configuración
                    </span>

                    <FiChevronsRight className="sb-right" />
                  </Link>
                </Nav.Item>
              )}


              {/* =============================================
                  COMERCIOS AMIGOS
                  permiso real: fidelizacion:view
                  ============================================= */}

              {can("fidelizacion:view") && (
                <Nav.Item
                  onClick={() => {
                    setShowMainItems(false);
                    setShowFidelizacionItems(true);
                    setShowReturnButton(true);
                  }}
                  className="sb-top"
                >
                  <Link
                    to="#"
                    className="nav-link"
                  >
                    <FiGift className="sb-ico" />

                    <span>
                      Comercios Amigos
                    </span>

                    <FiChevronsRight className="sb-right" />
                  </Link>
                </Nav.Item>
              )}


              {/* =============================================
                  LEGAJOS
                  permiso real: legajos:view
                  ============================================= */}

              {can("legajos:view") && (
                <Nav.Item
                  onClick={() => {
                    setShowMainItems(false);
                    setShowLegajosItems(true);
                    setShowReturnButton(true);
                  }}
                  className="sb-top"
                >
                  <Link
                    to="#"
                    className="nav-link"
                  >
                    <FiFolder className="sb-ico" />

                    <span>
                      Legajos
                    </span>

                    <FiChevronsRight className="sb-right" />
                  </Link>
                </Nav.Item>
              )}


              {/* =============================================
                  AGENDA
                  permiso real: agenda:view
                  ruta real: /agenda
                  ============================================= */}

              {can("agenda:view") && (
                <Link
                  to="/agenda"
                  className={getLinkClassName(
                    "/agenda",
                    "sb-top"
                  )}
                  onClick={handleLinkClick}
                >
                  <FiCalendar className="sb-ico" />

                  <span>
                    Agenda
                  </span>
                </Link>
              )}


              {/* =============================================
                  PERMISOS
                  permiso real: permisos:view
                  ruta real: /permisos
                  ============================================= */}

              {can("permisos:view") && (
                <Link
                  to="/permisos"
                  className={getLinkClassName(
                    "/permisos",
                    "sb-top"
                  )}
                  onClick={handleLinkClick}
                >
                  <FiShield className="sb-ico" />

                  <span>
                    Permisos
                  </span>
                </Link>
              )}


              {/* =============================================
                  BOT WHATSAPP

                  El archivo real usa doc:view
                  para mostrar este módulo.
                  ============================================= */}

              {can("doc:view") && (
                <Nav.Item
                  onClick={() => {
                    setShowMainItems(false);
                    setShowAuditoriaAtencionItems(true);
                    setShowReturnButton(true);
                  }}
                  className="sb-top"
                >
                  <Link
                    to="#"
                    className="nav-link"
                  >
                    <FiMessageCircle className="sb-ico" />

                    <span>
                      Bot WhatsApp
                    </span>

                    <FiChevronsRight className="sb-right" />
                  </Link>
                </Nav.Item>
              )}


              {/* =============================================
                  DOCUMENTACIÓN

                  permiso real: doc:view
                  ============================================= */}

              {can("doc:view") && (
                <Nav.Item
                  onClick={() => {
                    setShowMainItems(false);
                    setShowDocumentacionItems(true);
                    setShowReturnButton(true);
                  }}
                  className="sb-top"
                >
                  <Link
                    to="#"
                    className="nav-link"
                  >
                    <FiBookOpen className="sb-ico" />

                    <span>
                      Documentación
                    </span>

                    <FiChevronsRight className="sb-right" />
                  </Link>
                </Nav.Item>
              )}


              {/* =============================================
                  INSPECCIONES

                  permisos reales:
                  inspecciones:view
                  inspecciones:create
                  inspecciones:admin
                  inspecciones:reportes
                  ============================================= */}

              {(
                can("inspecciones:view") ||
                can("inspecciones:create") ||
                can("inspecciones:admin") ||
                can("inspecciones:reportes")
              ) && (
                  <Nav.Item
                    onClick={() => {
                      setShowMainItems(false);
                      setShowInspeccionesItems(true);
                      setShowReturnButton(true);
                    }}
                    className="sb-top"
                  >
                    <Link
                      to="#"
                      className="nav-link"
                    >
                      <FiShield className="sb-ico" />

                      <span>
                        Inspecciones
                      </span>

                      <FiChevronsRight className="sb-right" />
                    </Link>
                  </Nav.Item>
                )}


              {/* =============================================
                  EVALUACIÓN
                  permiso real: evaluacion:view
                  ============================================= */}

              {can("evaluacion:view") && (
                <Nav.Item
                  onClick={() => {
                    setShowMainItems(false);
                    setShowEvaluacionItems(true);
                    setShowReturnButton(true);
                  }}
                  className="sb-top"
                >
                  <Link
                    to="#"
                    className="nav-link"
                  >
                    <FiBarChart2 className="sb-ico" />

                    <span>
                      Evaluación
                    </span>

                    <FiChevronsRight className="sb-right" />
                  </Link>
                </Nav.Item>
              )}


              {/* =============================================
                  ESTADÍSTICAS
                  permiso real: statics:view
                  ============================================= */}

              {can("statics:view") && (
                <Nav.Item
                  onClick={() => {
                    setShowMainItems(false);
                    setShowStaticsItems(true);
                    setShowReturnButton(true);
                  }}
                  className="sb-top"
                >
                  <Link
                    to="#"
                    className="nav-link"
                  >
                    <FiBarChart2 className="sb-ico" />

                    <span>
                      Estadísticas
                    </span>

                    <FiChevronsRight className="sb-right" />
                  </Link>
                </Nav.Item>
              )}


              {/* =============================================
                  INTELIGENCIA COMERCIAL

                  IMPORTANTE:
                  El archivo real NO tiene can(...)
                  alrededor de este acceso.
                  Lo conservamos exactamente así.
                  ============================================= */}

              {can("inteligencia:view") && (
                <Nav.Item
                  onClick={() => {
                    setShowMainItems(false);
                    setShowInteligenciaItems(true);
                    setShowReturnButton(true);
                  }}
                  className="sb-top"
                >
                  <Link
                    to="#"
                    className="nav-link"
                  >
                    <FiBarChart2 className="sb-ico" />

                    <span>
                      Inteligencia Comercial
                    </span>

                    <FiChevronsRight className="sb-right" />
                  </Link>
                </Nav.Item>
              )}

              {/* =============================================
                  IVA
                  permiso real: iva:view
                  ============================================= */}

              {can("iva:view") && (
                <Nav.Item
                  onClick={() => {
                    setShowMainItems(false);
                    setShowIVAItems(true);
                    setShowReturnButton(true);
                  }}
                  className="sb-top"
                >
                  <Link
                    to="#"
                    className="nav-link"
                  >
                    <TbReceiptTax className="sb-ico" />

                    <span>
                      IVA
                    </span>

                    <FiChevronsRight className="sb-right" />
                  </Link>
                </Nav.Item>
              )}


              {/* =============================================
                  RRHH
                  permiso real: rrhh:view
                  ============================================= */}

              {can("rrhh:view") && (
                <Nav.Item
                  onClick={() => {
                    setShowMainItems(false);
                    setShowAsistenciaItems(true);
                    setShowReturnButton(true);
                  }}
                  className="sb-top"
                >
                  <Link
                    to="#"
                    className="nav-link"
                  >
                    <FiUsers className="sb-ico" />

                    <span>
                      RRHH
                    </span>

                    <FiChevronsRight className="sb-right" />
                  </Link>
                </Nav.Item>
              )}


              {/* =============================================
                  TESORERÍA
                  permiso real: tesoreria:view
                  ============================================= */}

              {can("tesoreria:view") && (
                <Nav.Item
                  onClick={() => {
                    setShowMainItems(false);
                    setShowCajaItems(true);
                    setShowReturnButton(true);
                  }}
                  className="sb-top"
                >
                  <Link
                    to="#"
                    className="nav-link"
                  >
                    <LuWallet className="sb-ico" />

                    <span>
                      Tesorería
                    </span>

                    <FiChevronsRight className="sb-right" />
                  </Link>
                </Nav.Item>
              )}


              {/* =============================================
                  CONCILIACIÓN TARJETAS

                  Está comentado en el archivo real.
                  Lo conservamos comentado.
                  ============================================= */}

              {/*
              <Nav.Item
                onClick={() => {
                  setShowMainItems(false);
                  setShowConciliacionItems(true);
                  setShowReturnButton(true);
                }}
                className="sb-top"
              >
                <Link
                  to="#"
                  className="nav-link"
                >
                  <LuWallet className="sb-ico" />

                  <span>
                    Conciliación Tarjetas
                  </span>

                  <FiChevronsRight className="sb-right" />
                </Link>
              </Nav.Item>
              */}


              {/* =============================================
                  FACTURACIÓN
                  permiso real: facturacion:view
                  ============================================= */}

              {can("facturacion:view") && (
                <Nav.Item
                  onClick={() => {
                    setShowMainItems(false);
                    setShowFacturacionItems(true);
                    setShowReturnButton(true);
                  }}
                  className="sb-top"
                >
                  <Link
                    to="#"
                    className="nav-link"
                  >
                    <MdPointOfSale className="sb-ico" />

                    <span>
                      Facturación
                    </span>

                    <FiChevronsRight className="sb-right" />
                  </Link>
                </Nav.Item>
              )}


              {/* =============================================
                  SUELDOS
                  permiso real: sueldos:view
                  ============================================= */}

              {can("sueldos:view") && (
                <Nav.Item
                  onClick={() => {
                    setShowMainItems(false);
                    setShowSueldosItems(true);
                    setShowReturnButton(true);
                  }}
                  className="sb-top"
                >
                  <Link
                    to="#"
                    className="nav-link"
                  >
                    <FiUsers className="sb-ico" />

                    <span>
                      Sueldos
                    </span>

                    <FiChevronsRight className="sb-right" />
                  </Link>
                </Nav.Item>
              )}


              {/* =============================================
                  GESTIÓN DE MEDIAS
                  permiso real: gmedias:view
                  ============================================= */}

              {can("gmedias:view") && (
                <Nav.Item
                  onClick={() => {
                    setShowMainItems(false);
                    setShowGestionItems(true);
                    setShowReturnButton(true);
                  }}
                  className="sb-top"
                >
                  <Link
                    to="#"
                    className="nav-link"
                  >
                    <FiLayers className="sb-ico" />

                    <span>
                      Gestión de Medias
                    </span>

                    <FiChevronsRight className="sb-right" />
                  </Link>
                </Nav.Item>
              )}


              {/* =============================================
                  GESTIÓN ADMINISTRATIVA
                  permiso real: gestion:view
                  ============================================= */}

              {can("gestion:view") && (
                <Nav.Item
                  onClick={() => {
                    setShowMainItems(false);
                    setShowGestionOperativaItems(true);
                    setShowReturnButton(true);
                  }}
                  className="sb-top"
                >
                  <Link
                    to="#"
                    className="nav-link"
                  >
                    <FiFolder className="sb-ico" />

                    <span>
                      Gestión Administrativa
                    </span>

                    <FiChevronsRight className="sb-right" />
                  </Link>
                </Nav.Item>
              )}


              {/* =============================================
                  INFO SUCURSALES
                  permiso real: infosuc:view

                  IMPORTANTE:
                  Conservamos toggleMainItems porque así
                  funciona el archivo original.
                  ============================================= */}

              {can("infosuc:view") && (
                <Nav.Item
                  onClick={toggleMainItems}
                  className="sb-top"
                >
                  <Link
                    to="#"
                    className="nav-link"
                  >
                    <BsBuildings className="sb-ico" />

                    <span>
                      Info Sucursales
                    </span>

                    <FiChevronsRight className="sb-right" />
                  </Link>
                </Nav.Item>
              )}


              {/* =============================================
                  MANTENIMIENTO
                  permiso principal real:
                  mantenimiento:view
                  ============================================= */}

              {can("mantenimiento:view") && (
                <Nav.Item
                  onClick={() =>
                    setMaintenanceItem(
                      !maintenanceItem
                    )
                  }
                  aria-expanded={maintenanceItem}
                  className="sb-top"
                >
                  <Link
                    to="#"
                    className="nav-link"
                  >
                    <FiTool className="sb-ico" />

                    <span>
                      Mantenimiento
                    </span>

                    <Caret
                      open={
                        maintenanceItem ||
                        searchActive
                      }
                    />
                  </Link>
                </Nav.Item>
              )}


              {/* =============================================
                  SUBMENÚ MANTENIMIENTO

                  Única adaptación:
                  durante una búsqueda se abre el Collapse.
                  Rutas y permisos permanecen intactos.
                  ============================================= */}

              <Collapse
                in={
                  maintenanceItem ||
                  searchActive
                }
              >
                <div className="ml-3 sb-sub">


                  {can("mantenimiento:view.equipos") &&
                    matchesSearch(
                      "Equipos",
                      "Mantenimiento"
                    ) && (
                      <Link
                        to="/equipos"
                        className={getLinkClassName(
                          "/equipos"
                        )}
                        onClick={handleLinkClick}
                      >
                        Equipos
                      </Link>
                    )}


                  {can("mantenimiento:view.mantenimientos") &&
                    matchesSearch(
                      "Mantenimientos",
                      "Mantenimiento"
                    ) && (
                      <Link
                        to="/mantenimientos"
                        className={getLinkClassName(
                          "/mantenimientos"
                        )}
                        onClick={handleLinkClick}
                      >
                        Mantenimientos
                      </Link>
                    )}


                  {can("mantenimiento:view.ordenes") &&
                    matchesSearch(
                      "Órdenes",
                      "Ordenes",
                      "Mantenimiento"
                    ) && (
                      <Link
                        to="/ordenes-mantenimiento"
                        className={getLinkClassName(
                          "/ordenes-mantenimiento"
                        )}
                        onClick={handleLinkClick}
                      >
                        Órdenes
                      </Link>
                    )}


                  {can("mantenimiento:view.preventivo") &&
                    matchesSearch(
                      "Preventivo",
                      "Mantenimiento"
                    ) && (
                      <Link
                        to="/mantenimiento-preventivo"
                        className={getLinkClassName(
                          "/mantenimiento-preventivo"
                        )}
                        onClick={handleLinkClick}
                      >
                        Preventivo
                      </Link>
                    )}

                </div>
              </Collapse>

            </>
          )}


        {/* =================================================
            LA PARTE 3 COMIENZA AQUÍ

            BOTONES VOLVER
            +
            GESTIÓN ADMINISTRATIVA
            +
            CONFIGURACIÓN
            ================================================= */}

        {/* =================================================
            PARTE 3
            BOTONES VOLVER
            GESTIÓN ADMINISTRATIVA
            CONFIGURACIÓN
            ================================================= */}


        {/* =================================================
            BOTONES VOLVER
            ================================================= */}

        {showReturnButton && (
          <>

            {/* =============================================
                VOLVER GENÉRICO

                Se agrega !showStaticsItems para evitar
                duplicar "Volver" cuando estamos dentro
                de Estadísticas.
                ============================================= */}

            {!showGestionItems &&
              !showGestionOperativaItems &&
              !showConfigItems &&
              !showConciliacionItems &&
              !showIVAItems &&
              !showAsistenciaItems &&
              !showCajaItems &&
              !showFacturacionItems &&
              !showSueldosItems &&
              !showAuditoriaAtencionItems &&
              !showDocumentacionItems &&
              !showInspeccionesItems &&
              !showEvaluacionItems &&
              !showFidelizacionItems &&
              !showLegajosItems &&
              !showInteligenciaItems &&
              !showStaticsItems && (

                <Nav.Item
                  onClick={togglePreviousItems}
                  className="sb-top"
                >
                  <Link
                    to="#"
                    className="nav-link"
                  >
                    <FiArrowLeftCircle className="sb-ico" />

                    <span>
                      Volver
                    </span>
                  </Link>
                </Nav.Item>

              )}


            {/* =============================================
                VOLVER - COMERCIOS AMIGOS
                ============================================= */}

            {showFidelizacionItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowFidelizacionItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link
                  to="#"
                  className="nav-link"
                >
                  <FiArrowLeftCircle className="sb-ico" />

                  <span>
                    Volver
                  </span>
                </Link>
              </Nav.Item>
            )}


            {/* =============================================
                VOLVER - LEGAJOS
                ============================================= */}

            {showLegajosItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowLegajosItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link
                  to="#"
                  className="nav-link"
                >
                  <FiArrowLeftCircle className="sb-ico" />

                  <span>
                    Volver
                  </span>
                </Link>
              </Nav.Item>
            )}


            {/* =============================================
                VOLVER - INTELIGENCIA COMERCIAL
                ============================================= */}

            {showInteligenciaItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowInteligenciaItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link
                  to="#"
                  className="nav-link"
                >
                  <FiArrowLeftCircle className="sb-ico" />

                  <span>
                    Volver
                  </span>
                </Link>
              </Nav.Item>
            )}


            {/* =============================================
                VOLVER - GESTIÓN DE MEDIAS
                ============================================= */}

            {showGestionItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowGestionItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link
                  to="#"
                  className="nav-link"
                >
                  <FiArrowLeftCircle className="sb-ico" />

                  <span>
                    Volver
                  </span>
                </Link>
              </Nav.Item>
            )}


            {/* =============================================
                VOLVER - GESTIÓN ADMINISTRATIVA
                ============================================= */}

            {showGestionOperativaItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowGestionOperativaItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link
                  to="#"
                  className="nav-link"
                >
                  <FiArrowLeftCircle className="sb-ico" />

                  <span>
                    Volver
                  </span>
                </Link>
              </Nav.Item>
            )}


            {/* =============================================
                VOLVER - ESTADÍSTICAS
                ============================================= */}

            {showStaticsItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowStaticsItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link
                  to="#"
                  className="nav-link"
                >
                  <FiArrowLeftCircle className="sb-ico" />

                  <span>
                    Volver
                  </span>
                </Link>
              </Nav.Item>
            )}


            {/* =============================================
                VOLVER - CONFIGURACIÓN
                ============================================= */}

            {showConfigItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowConfigItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link
                  to="#"
                  className="nav-link"
                >
                  <FiArrowLeftCircle className="sb-ico" />

                  <span>
                    Volver
                  </span>
                </Link>
              </Nav.Item>
            )}


            {/* =============================================
                VOLVER - BOT WHATSAPP
                ============================================= */}

            {showAuditoriaAtencionItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowAuditoriaAtencionItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link
                  to="#"
                  className="nav-link"
                >
                  <FiArrowLeftCircle className="sb-ico" />

                  <span>
                    Volver
                  </span>
                </Link>
              </Nav.Item>
            )}


            {/* =============================================
                VOLVER - DOCUMENTACIÓN
                ============================================= */}

            {showDocumentacionItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowDocumentacionItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link
                  to="#"
                  className="nav-link"
                >
                  <FiArrowLeftCircle className="sb-ico" />

                  <span>
                    Volver
                  </span>
                </Link>
              </Nav.Item>
            )}


            {/* =============================================
                VOLVER - INSPECCIONES
                ============================================= */}

            {showInspeccionesItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowInspeccionesItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link
                  to="#"
                  className="nav-link"
                >
                  <FiArrowLeftCircle className="sb-ico" />

                  <span>
                    Volver
                  </span>
                </Link>
              </Nav.Item>
            )}


            {/* =============================================
                VOLVER - EVALUACIÓN
                ============================================= */}

            {showEvaluacionItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowEvaluacionItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link
                  to="#"
                  className="nav-link"
                >
                  <FiArrowLeftCircle className="sb-ico" />

                  <span>
                    Volver
                  </span>
                </Link>
              </Nav.Item>
            )}


            {/* =============================================
                VOLVER - CONCILIACIÓN
                ============================================= */}

            {showConciliacionItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowConciliacionItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link
                  to="#"
                  className="nav-link"
                >
                  <FiArrowLeftCircle className="sb-ico" />

                  <span>
                    Volver
                  </span>
                </Link>
              </Nav.Item>
            )}


            {/* =============================================
                VOLVER - IVA
                ============================================= */}

            {showIVAItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowIVAItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link
                  to="#"
                  className="nav-link"
                >
                  <FiArrowLeftCircle className="sb-ico" />

                  <span>
                    Volver
                  </span>
                </Link>
              </Nav.Item>
            )}


            {/* =============================================
                VOLVER - RRHH
                ============================================= */}

            {showAsistenciaItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowAsistenciaItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link
                  to="#"
                  className="nav-link"
                >
                  <FiArrowLeftCircle className="sb-ico" />

                  <span>
                    Volver
                  </span>
                </Link>
              </Nav.Item>
            )}


            {/* =============================================
                VOLVER - TESORERÍA
                ============================================= */}

            {showCajaItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowCajaItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link
                  to="#"
                  className="nav-link"
                >
                  <FiArrowLeftCircle className="sb-ico" />

                  <span>
                    Volver
                  </span>
                </Link>
              </Nav.Item>
            )}


            {/* =============================================
                VOLVER - FACTURACIÓN
                ============================================= */}

            {showFacturacionItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowFacturacionItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link
                  to="#"
                  className="nav-link"
                >
                  <FiArrowLeftCircle className="sb-ico" />

                  <span>
                    Volver
                  </span>
                </Link>
              </Nav.Item>
            )}


            {/* =============================================
                VOLVER - SUELDOS
                ============================================= */}

            {showSueldosItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowSueldosItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link
                  to="#"
                  className="nav-link"
                >
                  <FiArrowLeftCircle className="sb-ico" />

                  <span>
                    Volver
                  </span>
                </Link>
              </Nav.Item>
            )}



            {/* =================================================
                GESTIÓN ADMINISTRATIVA
                ================================================= */}

            {showGestionOperativaItems && (
              <>

                <div className="sb-section-title">
                  <FiFolder className="sb-section-title-icon" />
                  <span>Gestión Administrativa</span>
                </div>


                {/* Ruta real: /gestion */}

                {matchesSearch(
                  "Dashboard",
                  "Gestión Administrativa"
                ) && (
                    <Link
                      to="/gestion"
                      className={getLinkClassName(
                        "/gestion"
                      )}
                      onClick={handleLinkClick}
                    >
                      Dashboard
                    </Link>
                  )}


                {/* Ruta real: /gestion/kanban */}

                {matchesSearch(
                  "Kanban",
                  "Gestión Administrativa"
                ) && (
                    <Link
                      to="/gestion/kanban"
                      className={getLinkClassName(
                        "/gestion/kanban"
                      )}
                      onClick={handleLinkClick}
                    >
                      Kanban
                    </Link>
                  )}


                {/* Ruta real: /gestion/tareas */}

                {matchesSearch(
                  "Tareas",
                  "Gestión Administrativa"
                ) && (
                    <Link
                      to="/gestion/tareas"
                      className={getLinkClassName(
                        "/gestion/tareas"
                      )}
                      onClick={handleLinkClick}
                    >
                      Tareas
                    </Link>
                  )}


                {/* Ruta real: /gestion/proyectos */}

                {matchesSearch(
                  "Proyectos",
                  "Gestión Administrativa"
                ) && (
                    <Link
                      to="/gestion/proyectos"
                      className={getLinkClassName(
                        "/gestion/proyectos"
                      )}
                      onClick={handleLinkClick}
                    >
                      Proyectos
                    </Link>
                  )}


                {/* Ruta real: /gestion/calendario */}

                {matchesSearch(
                  "Calendario",
                  "Gestión Administrativa"
                ) && (
                    <Link
                      to="/gestion/calendario"
                      className={getLinkClassName(
                        "/gestion/calendario"
                      )}
                      onClick={handleLinkClick}
                    >
                      Calendario
                    </Link>
                  )}


                {/* Permiso y ruta reales */}

                {can("gestion.supervision:view") &&
                  matchesSearch(
                    "Supervisor",
                    "Gestión Administrativa"
                  ) && (
                    <Link
                      to="/gestion/supervisor"
                      className={getLinkClassName(
                        "/gestion/supervisor"
                      )}
                      onClick={handleLinkClick}
                    >
                      Supervisor
                    </Link>
                  )}

              </>
            )}



            {/* =================================================
                CONFIGURACIÓN
                ================================================= */}

            {showConfigItems && (
              <>

                <div className="sb-section-title">
                  <FiSettings className="sb-section-title-icon" />
                  <span>Configuración</span>
                </div>


                {/* =============================================
                    USUARIOS
                    ============================================= */}

                <Nav.Item
                  onClick={() =>
                    setUseritem(!useritem)
                  }
                >
                  <Link
                    to="#"
                    className="nav-link"
                  >
                    Usuarios

                    <Caret
                      open={
                        useritem ||
                        searchActive
                      }
                    />
                  </Link>
                </Nav.Item>


                <Collapse
                  in={
                    useritem ||
                    searchActive
                  }
                >
                  <div className="ml-3 sb-sub">


                    {matchesSearch(
                      "Crear Usuario",
                      "Usuarios",
                      "Configuración"
                    ) && (
                        <Link
                          to="/users/new"
                          className={getLinkClassName(
                            "/users/new"
                          )}
                          onClick={handleLinkClick}
                        >
                          Crear Usuario
                        </Link>
                      )}


                    {matchesSearch(
                      "Listar Usuarios",
                      "Usuarios",
                      "Configuración"
                    ) && (
                        <Link
                          to="/users"
                          className={getLinkClassName(
                            "/users"
                          )}
                          onClick={handleLinkClick}
                        >
                          Listar Usuarios
                        </Link>
                      )}

                  </div>
                </Collapse>


                {/* =============================================
                    RESTO DE CONFIGURACIÓN

                    El archivo original NO tiene can(...)
                    individual en estos links.
                    No agregamos ninguno.
                    ============================================= */}


                {matchesSearch(
                  "Bancos",
                  "Configuración"
                ) && (
                    <Link
                      to="/banks"
                      className={getLinkClassName(
                        "/banks"
                      )}
                      onClick={handleLinkClick}
                    >
                      Bancos
                    </Link>
                  )}


                {matchesSearch(
                  "Categorias Animales",
                  "Categorías Animales",
                  "Configuración"
                ) && (
                    <Link
                      to="/categorias-animales"
                      className={getLinkClassName(
                        "/categorias-animales"
                      )}
                      onClick={handleLinkClick}
                    >
                      Categorias Animales
                    </Link>
                  )}


                {matchesSearch(
                  "Tarjetas Deb Cred",
                  "Tarjetas",
                  "Configuración"
                ) && (
                    <Link
                      to="/tarjetas-comunes"
                      className={getLinkClassName(
                        "/tarjetas-comunes"
                      )}
                      onClick={handleLinkClick}
                    >
                      Tarjetas Deb/Cred
                    </Link>
                  )}


                {matchesSearch(
                  "Planes de Tarjetas",
                  "Tarjetas",
                  "Configuración"
                ) && (
                    <Link
                      to="/tarjeta-planes"
                      className={getLinkClassName(
                        "/tarjeta-planes"
                      )}
                      onClick={handleLinkClick}
                    >
                      Planes de Tarjetas
                    </Link>
                  )}


                {matchesSearch(
                  "Empresas",
                  "Configuración"
                ) && (
                    <Link
                      to="/empresas"
                      className={getLinkClassName(
                        "/empresas"
                      )}
                      onClick={handleLinkClick}
                    >
                      Empresas
                    </Link>
                  )}


                {matchesSearch(
                  "Formas de Pago",
                  "Configuración"
                ) && (
                    <Link
                      to="/formas-pago-tesoreria"
                      className={getLinkClassName(
                        "/formas-pago-tesoreria"
                      )}
                      onClick={handleLinkClick}
                    >
                      Formas de Pago
                    </Link>
                  )}


                {matchesSearch(
                  "Frigoríficos",
                  "Frigorificos",
                  "Configuración"
                ) && (
                    <Link
                      to="/frigorificos"
                      className={getLinkClassName(
                        "/frigorificos"
                      )}
                      onClick={handleLinkClick}
                    >
                      Frigoríficos
                    </Link>
                  )}


                {matchesSearch(
                  "Imputación contable",
                  "Imputacion contable",
                  "Configuración"
                ) && (
                    <Link
                      to="/imputaciones-contables"
                      className={getLinkClassName(
                        "/imputaciones-contables"
                      )}
                      onClick={handleLinkClick}
                    >
                      Imputación contable
                    </Link>
                  )}


                {matchesSearch(
                  "Marca de Tarjetas",
                  "Tarjetas",
                  "Configuración"
                ) && (
                    <Link
                      to="/marcas-tarjeta"
                      className={getLinkClassName(
                        "/marcas-tarjeta"
                      )}
                      onClick={handleLinkClick}
                    >
                      Marca de Tarjetas
                    </Link>
                  )}


                {matchesSearch(
                  "Tipos de Tarjeta",
                  "Tarjetas",
                  "Configuración"
                ) && (
                    <Link
                      to="/tipos-tarjeta"
                      className={getLinkClassName(
                        "/tipos-tarjeta"
                      )}
                      onClick={handleLinkClick}
                    >
                      Tipos de Tarjeta
                    </Link>
                  )}


                {matchesSearch(
                  "Tipos de Comprobantes",
                  "Comprobantes",
                  "Configuración"
                ) && (
                    <Link
                      to="/tipos-comprobantes"
                      className={getLinkClassName(
                        "/tipos-comprobantes"
                      )}
                      onClick={handleLinkClick}
                    >
                      Tipos de Comprobantes
                    </Link>
                  )}


                {matchesSearch(
                  "Puntos de Venta",
                  "Configuración"
                ) && (
                    <Link
                      to="/ptos-venta"
                      className={getLinkClassName(
                        "/ptos-venta"
                      )}
                      onClick={handleLinkClick}
                    >
                      Puntos de Venta
                    </Link>
                  )}


                {matchesSearch(
                  "Proveedores",
                  "Configuración"
                ) && (
                    <Link
                      to="/proveedores"
                      className={getLinkClassName(
                        "/proveedores"
                      )}
                      onClick={handleLinkClick}
                    >
                      Proveedores
                    </Link>
                  )}


                {matchesSearch(
                  "Proyectos",
                  "Configuración"
                ) && (
                    <Link
                      to="/proyectos"
                      className={getLinkClassName(
                        "/proyectos"
                      )}
                      onClick={handleLinkClick}
                    >
                      Proyectos
                    </Link>
                  )}


                {matchesSearch(
                  "Periodos",
                  "Períodos",
                  "Configuración"
                ) && (
                    <Link
                      to="/periodoliquidacion"
                      className={getLinkClassName(
                        "/periodoliquidacion"
                      )}
                      onClick={handleLinkClick}
                    >
                      Periodos
                    </Link>
                  )}


                {matchesSearch(
                  "Sincronizar",
                  "Sync",
                  "Configuración"
                ) && (
                    <Link
                      to="/sync"
                      className={getLinkClassName(
                        "/sync"
                      )}
                      onClick={handleLinkClick}
                    >
                      Sincronizar
                    </Link>
                  )}


                {matchesSearch(
                  "Registros",
                  "Configuración"
                ) && (
                    <Link
                      to="/registros"
                      className={getLinkClassName(
                        "/registros"
                      )}
                      onClick={handleLinkClick}
                    >
                      Registros
                    </Link>
                  )}


                {/* =============================================
                    CENTRO DE NOTIFICACIONES

                    permiso real:
                    notification:view
                    ============================================= */}

                {can("notification:view") &&
                  matchesSearch(
                    "Centro de Notificaciones",
                    "Notificaciones",
                    "Configuración"
                  ) && (
                    <Link
                      to="/notification"
                      className={getLinkClassName(
                        "/notification"
                      )}
                      onClick={handleLinkClick}
                    >
                      Centro de Notificaciones
                    </Link>
                  )}


                {/* =============================================
                    SCHEDULER

                    permiso real:
                    scheduler:view
                    ============================================= */}

                {can("scheduler:view") &&
                  matchesSearch(
                    "Scheduler",
                    "Configuración"
                  ) && (
                    <Link
                      to="/scheduler"
                      className={getLinkClassName(
                        "/scheduler"
                      )}
                      onClick={handleLinkClick}
                    >
                      Scheduler
                    </Link>
                  )}

              </>
            )}


            {/* =================================================
                LA PARTE 4 COMIENZA AQUÍ

                BOT WHATSAPP
                DOCUMENTACIÓN
                INSPECCIONES
                EVALUACIÓN
                ================================================= */}

            {/* =================================================
                PARTE 4
                BOT WHATSAPP
                DOCUMENTACIÓN
                INSPECCIONES
                EVALUACIÓN
                ================================================= */}


            {/* =================================================
                BOT WHATSAPP
                ================================================= */}

            {showAuditoriaAtencionItems && (
              <>

                <div className="sb-section-title">
                  <FiMessageCircle className="sb-section-title-icon" />
                  <span>Bot WhatsApp</span>
                </div>


                {can("doc:create") &&
                  matchesSearch(
                    "Promociones",
                    "Bot WhatsApp"
                  ) && (
                    <Link
                      to="/promociones"
                      className={getLinkClassName(
                        "/promociones"
                      )}
                      onClick={handleLinkClick}
                    >
                      Promociones
                    </Link>
                  )}


                {can("doc:create") &&
                  matchesSearch(
                    "Productos Meta",
                    "Producto Meta",
                    "Bot WhatsApp"
                  ) && (
                    <Link
                      to="/bot/product-meta"
                      className={getLinkClassName(
                        "/bot/product-meta"
                      )}
                      onClick={handleLinkClick}
                    >
                      Productos Meta
                    </Link>
                  )}


                {can("doc:create") &&
                  matchesSearch(
                    "Conversaciones",
                    "Bot WhatsApp"
                  ) && (
                    <Link
                      to="/bot/conversations"
                      className={getLinkClassName(
                        "/bot/conversations"
                      )}
                      onClick={handleLinkClick}
                    >
                      Conversaciones
                    </Link>
                  )}


                {can("doc:create") &&
                  matchesSearch(
                    "Sucursales Meta",
                    "Sucursal Meta",
                    "Bot WhatsApp"
                  ) && (
                    <Link
                      to="/bot/branch-meta"
                      className={getLinkClassName(
                        "/bot/branch-meta"
                      )}
                      onClick={handleLinkClick}
                    >
                      Sucursales Meta
                    </Link>
                  )}


                {can("doc:create") &&
                  matchesSearch(
                    "Beneficios Meta",
                    "Beneficio Meta",
                    "Bot WhatsApp"
                  ) && (
                    <Link
                      to="/bot/benefit-meta"
                      className={getLinkClassName(
                        "/bot/benefit-meta"
                      )}
                      onClick={handleLinkClick}
                    >
                      Beneficios Meta
                    </Link>
                  )}


                {can("doc:create") &&
                  matchesSearch(
                    "Eventos Meta",
                    "Evento Meta",
                    "Bot WhatsApp"
                  ) && (
                    <Link
                      to="/bot/event-meta"
                      className={getLinkClassName(
                        "/bot/event-meta"
                      )}
                      onClick={handleLinkClick}
                    >
                      Eventos Meta
                    </Link>
                  )}

              </>
            )}



            {/* =================================================
                DOCUMENTACIÓN
                ================================================= */}

            {showDocumentacionItems && (
              <>

                <div className="sb-section-title">
                  <FiBookOpen className="sb-section-title-icon" />
                  <span>Documentación</span>
                </div>


                {can("doc:view") &&
                  matchesSearch(
                    "Documentos",
                    "Documentación"
                  ) && (
                    <Link
                      to="/documentos"
                      className={getLinkClassName(
                        "/documentos"
                      )}
                      onClick={handleLinkClick}
                    >
                      Documentos
                    </Link>
                  )}


                {can("doc:create") &&
                  matchesSearch(
                    "Nuevo Documento",
                    "Crear Documento",
                    "Documentación"
                  ) && (
                    <Link
                      to="/documentos/nuevo"
                      className={getLinkClassName(
                        "/documentos/nuevo"
                      )}
                      onClick={handleLinkClick}
                    >
                      Nuevo Documento
                    </Link>
                  )}


                {can("doc:categorias") &&
                  matchesSearch(
                    "Categorías",
                    "Categorias",
                    "Documentación"
                  ) && (
                    <Link
                      to="/documentos/categorias"
                      className={getLinkClassName(
                        "/documentos/categorias"
                      )}
                      onClick={handleLinkClick}
                    >
                      Categorías
                    </Link>
                  )}


                {can("doc:subcategorias") &&
                  matchesSearch(
                    "Subcategorías",
                    "Subcategorias",
                    "Documentación"
                  ) && (
                    <Link
                      to="/documentos/subcategorias"
                      className={getLinkClassName(
                        "/documentos/subcategorias"
                      )}
                      onClick={handleLinkClick}
                    >
                      Subcategorías
                    </Link>
                  )}

              </>
            )}



            {/* =================================================
                INSPECCIONES
                ================================================= */}

            {showInspeccionesItems && (
              <>

                <div className="sb-section-title">
                  <FiShield className="sb-section-title-icon" />
                  <span>Inspecciones</span>
                </div>


                {can("inspecciones:view") &&
                  matchesSearch(
                    "Inspecciones",
                    "Listado de Inspecciones"
                  ) && (
                    <Link
                      to="/inspecciones"
                      className={getLinkClassName(
                        "/inspecciones"
                      )}
                      onClick={handleLinkClick}
                    >
                      Inspecciones
                    </Link>
                  )}


                {can("inspecciones:create") &&
                  matchesSearch(
                    "Nueva Inspección",
                    "Nueva Inspeccion",
                    "Crear Inspección",
                    "Inspecciones"
                  ) && (
                    <Link
                      to="/inspecciones/nueva"
                      className={getLinkClassName(
                        "/inspecciones/nueva"
                      )}
                      onClick={handleLinkClick}
                    >
                      Nueva Inspección
                    </Link>
                  )}


                {can("inspecciones:reportes") &&
                  matchesSearch(
                    "Reportes",
                    "Reportes Inspecciones",
                    "Inspecciones"
                  ) && (
                    <Link
                      to="/inspecciones/reportes"
                      className={getLinkClassName(
                        "/inspecciones/reportes"
                      )}
                      onClick={handleLinkClick}
                    >
                      Reportes
                    </Link>
                  )}


                {can("inspecciones:admin") &&
                  matchesSearch(
                    "Configuración",
                    "Configuracion",
                    "Administración",
                    "Inspecciones"
                  ) && (
                    <Link
                      to="/inspecciones/configuracion"
                      className={getLinkClassName(
                        "/inspecciones/configuracion"
                      )}
                      onClick={handleLinkClick}
                    >
                      Configuración
                    </Link>
                  )}

              </>
            )}



            {/* =================================================
                EVALUACIÓN
                ================================================= */}

            {showEvaluacionItems && (
              <>

                <div className="sb-section-title">
                  <FiBarChart2 className="sb-section-title-icon" />
                  <span>Evaluación</span>
                </div>


                {/* =============================================
                    DASHBOARD
                    ============================================= */}

                {can("evaluacion:view") &&
                  matchesSearch(
                    "Dashboard",
                    "Evaluación"
                  ) && (
                    <Link
                      to="/evaluacion/dashboard"
                      className={getLinkClassName(
                        "/evaluacion/dashboard"
                      )}
                      onClick={handleLinkClick}
                    >
                      Dashboard
                    </Link>
                  )}


                {/* =============================================
                    EVALUACIONES
                    ============================================= */}

                {can("evaluacion:view") &&
                  matchesSearch(
                    "Evaluaciones",
                    "Evaluación"
                  ) && (
                    <Link
                      to="/evaluaciones"
                      className={getLinkClassName(
                        "/evaluaciones"
                      )}
                      onClick={handleLinkClick}
                    >
                      Evaluaciones
                    </Link>
                  )}


                {/* =============================================
                    REPORTE POR EMPLEADO
                    ============================================= */}

                {can("evaluacion:view") &&
                  matchesSearch(
                    "Reporte Empleado",
                    "Reporte por Empleado",
                    "Evaluación"
                  ) && (
                    <Link
                      to="/evaluacion/reportes/empleado"
                      className={getLinkClassName(
                        "/evaluacion/reportes/empleado"
                      )}
                      onClick={handleLinkClick}
                    >
                      Reporte Empleado
                    </Link>
                  )}


                {/* =============================================
                    REPORTE SUPERVISOR

                    Ruta real:
                    /evaluacion/reportes/supervisor
                    ============================================= */}

                {can("evaluacion:view") &&
                  matchesSearch(
                    "Reporte Supervisor",
                    "Supervisor",
                    "Evaluación"
                  ) && (
                    <Link
                      to="/evaluacion/reportes/supervisor"
                      className={getLinkClassName(
                        "/evaluacion/reportes/supervisor"
                      )}
                      onClick={handleLinkClick}
                    >
                      Reporte Supervisor
                    </Link>
                  )}


                {/* =============================================
                    MYSTERY SHOPPER

                    Ruta real:
                    /evaluacion/reportes/mystery
                    ============================================= */}

                {can("evaluacion:view") &&
                  matchesSearch(
                    "Mystery",
                    "Mystery Shopper",
                    "Evaluación"
                  ) && (
                    <Link
                      to="/evaluacion/reportes/mystery"
                      className={getLinkClassName(
                        "/evaluacion/reportes/mystery"
                      )}
                      onClick={handleLinkClick}
                    >
                      Mystery Shopper
                    </Link>
                  )}


                {/* =============================================
                    METAS
                    ============================================= */}

                {can("evaluacion:view") &&
                  matchesSearch(
                    "Metas",
                    "Evaluación"
                  ) && (
                    <Link
                      to="/evaluacion/metas"
                      className={getLinkClassName(
                        "/evaluacion/metas"
                      )}
                      onClick={handleLinkClick}
                    >
                      Metas
                    </Link>
                  )}


                {/* =============================================
                    AVISOS
                    ============================================= */}

                {can("evaluacion:view") &&
                  matchesSearch(
                    "Avisos",
                    "Evaluación"
                  ) && (
                    <Link
                      to="/evaluacion/avisos"
                      className={getLinkClassName(
                        "/evaluacion/avisos"
                      )}
                      onClick={handleLinkClick}
                    >
                      Avisos
                    </Link>
                  )}


                {/* =============================================
                    REPORTES
                    ============================================= */}

                {can("evaluacion:view") &&
                  matchesSearch(
                    "Reportes",
                    "Reportes Evaluación",
                    "Evaluación"
                  ) && (
                    <Link
                      to="/evaluacion/reportes"
                      className={getLinkClassName(
                        "/evaluacion/reportes"
                      )}
                      onClick={handleLinkClick}
                    >
                      Reportes
                    </Link>
                  )}


                {/* =============================================
                    CONFIGURACIÓN
                    ============================================= */}

                {can("evaluacion:admin") &&
                  matchesSearch(
                    "Configuración",
                    "Configuracion",
                    "Evaluación"
                  ) && (
                    <Link
                      to="/evaluacion/configuracion"
                      className={getLinkClassName(
                        "/evaluacion/configuracion"
                      )}
                      onClick={handleLinkClick}
                    >
                      Configuración
                    </Link>
                  )}

              </>
            )}


            {/* =================================================
                LA PARTE 5 COMIENZA AQUÍ

                COMERCIOS AMIGOS
                LEGAJOS
                INTELIGENCIA COMERCIAL
                ================================================= */}

            {/* =================================================
                PARTE 5
                COMERCIOS AMIGOS
                LEGAJOS
                INTELIGENCIA COMERCIAL
                ================================================= */}


            {/* =================================================
                COMERCIOS AMIGOS / FIDELIZACIÓN
                ================================================= */}

            {showFidelizacionItems && (
              <>

                <div className="sb-section-title">
                  <FiGift className="sb-section-title-icon" />
                  <span>Comercios Amigos</span>
                </div>


                {/* =============================================
                    DASHBOARD

                    permiso real:
                    fidelizacion:view

                    ruta real:
                    /fidelizacion/dashboard
                    ============================================= */}

                {can("fidelizacion:view") &&
                  matchesSearch(
                    "Dashboard",
                    "Comercios Amigos",
                    "Fidelización"
                  ) && (
                    <Link
                      to="/fidelizacion/dashboard"
                      className={getLinkClassName(
                        "/fidelizacion/dashboard"
                      )}
                      onClick={handleLinkClick}
                    >
                      Dashboard
                    </Link>
                  )}


                {/* =============================================
                    COMERCIOS ASOCIADOS
                    ============================================= */}

                {can("fidelizacion:comercios") &&
                  matchesSearch(
                    "Comercios Asociados",
                    "Comercios",
                    "Comercios Amigos"
                  ) && (
                    <Link
                      to="/fidelizacion/comercios"
                      className={getLinkClassName(
                        "/fidelizacion/comercios"
                      )}
                      onClick={handleLinkClick}
                    >
                      Comercios Asociados
                    </Link>
                  )}


                {/* =============================================
                    CAMPAÑAS
                    ============================================= */}

                {can("fidelizacion:campanias") &&
                  matchesSearch(
                    "Campañas",
                    "Campanias",
                    "Comercios Amigos"
                  ) && (
                    <Link
                      to="/fidelizacion/campanias"
                      className={getLinkClassName(
                        "/fidelizacion/campanias"
                      )}
                      onClick={handleLinkClick}
                    >
                      Campañas
                    </Link>
                  )}


                {/* =============================================
                    PREMIOS CLIENTES
                    ============================================= */}

                {can("fidelizacion:premios") &&
                  matchesSearch(
                    "Premios Clientes",
                    "Premios",
                    "Comercios Amigos"
                  ) && (
                    <Link
                      to="/fidelizacion/premios-clientes"
                      className={getLinkClassName(
                        "/fidelizacion/premios-clientes"
                      )}
                      onClick={handleLinkClick}
                    >
                      Premios Clientes
                    </Link>
                  )}


                {/* =============================================
                    CUPONES

                    IMPORTANTE:
                    El permiso fidelizacion:cupones habilita
                    CUATRO opciones en el archivo original.
                    ============================================= */}

                {can("fidelizacion:cupones") && (
                  <>

                    {matchesSearch(
                      "Cupones Generados",
                      "Cupones",
                      "Comercios Amigos"
                    ) && (
                        <Link
                          to="/fidelizacion/cupones"
                          className={getLinkClassName(
                            "/fidelizacion/cupones"
                          )}
                          onClick={handleLinkClick}
                        >
                          Cupones Generados
                        </Link>
                      )}


                    {matchesSearch(
                      "Canjes de Cupones",
                      "Canjes",
                      "Cupones",
                      "Comercios Amigos"
                    ) && (
                        <Link
                          to="/fidelizacion/canjes-cupones"
                          className={getLinkClassName(
                            "/fidelizacion/canjes-cupones"
                          )}
                          onClick={handleLinkClick}
                        >
                          Canjes de Cupones
                        </Link>
                      )}


                    {matchesSearch(
                      "Clientes Registrados",
                      "Clientes",
                      "Comercios Amigos"
                    ) && (
                        <Link
                          to="/fidelizacion/clientes"
                          className={getLinkClassName(
                            "/fidelizacion/clientes"
                          )}
                          onClick={handleLinkClick}
                        >
                          Clientes Registrados
                        </Link>
                      )}


                    {matchesSearch(
                      "Validar Cupón",
                      "Validar Cupon",
                      "Cupones",
                      "Comercios Amigos"
                    ) && (
                        <Link
                          to="/fidelizacion/validar-cupon"
                          className={getLinkClassName(
                            "/fidelizacion/validar-cupon"
                          )}
                          onClick={handleLinkClick}
                        >
                          Validar Cupón
                        </Link>
                      )}

                  </>
                )}


                {/* =============================================
                    PUNTOS COMERCIO
                    ============================================= */}

                {can("fidelizacion:puntos") &&
                  matchesSearch(
                    "Puntos Comercio",
                    "Puntos",
                    "Comercios Amigos"
                  ) && (
                    <Link
                      to="/fidelizacion/puntos-comercio"
                      className={getLinkClassName(
                        "/fidelizacion/puntos-comercio"
                      )}
                      onClick={handleLinkClick}
                    >
                      Puntos Comercio
                    </Link>
                  )}


                {/* =============================================
                    PREMIOS COMERCIOS
                    ============================================= */}

                {can("fidelizacion:premiosComercio") &&
                  matchesSearch(
                    "Premios Comercios",
                    "Premios Comercio",
                    "Comercios Amigos"
                  ) && (
                    <Link
                      to="/fidelizacion/premios-comercios"
                      className={getLinkClassName(
                        "/fidelizacion/premios-comercios"
                      )}
                      onClick={handleLinkClick}
                    >
                      Premios Comercios
                    </Link>
                  )}


                {/* =============================================
                    CANJES COMERCIOS

                    Esta opción existe en el archivo real.
                    ============================================= */}

                {can("fidelizacion:canjesComercio") &&
                  matchesSearch(
                    "Canjes Comercios",
                    "Canjes Comercio",
                    "Comercios Amigos"
                  ) && (
                    <Link
                      to="/fidelizacion/canjes-comercios"
                      className={getLinkClassName(
                        "/fidelizacion/canjes-comercios"
                      )}
                      onClick={handleLinkClick}
                    >
                      Canjes Comercios
                    </Link>
                  )}


                {/* =============================================
                    ALERTAS FRAUDE

                    Esta opción también existe en el archivo real.
                    ============================================= */}

                {can("fidelizacion:fraude") &&
                  matchesSearch(
                    "Alertas Fraude",
                    "Fraude",
                    "Comercios Amigos"
                  ) && (
                    <Link
                      to="/fidelizacion/alertas-fraude"
                      className={getLinkClassName(
                        "/fidelizacion/alertas-fraude"
                      )}
                      onClick={handleLinkClick}
                    >
                      Alertas Fraude
                    </Link>
                  )}

              </>
            )}



            {/* =================================================
                LEGAJOS
                ================================================= */}

            {showLegajosItems && (
              <>

                <div className="sb-section-title">
                  <FiFolder className="sb-section-title-icon" />
                  <span>Legajos</span>
                </div>


                {/* =============================================
                    CONCEPTOS

                    permiso real:
                    legajos:conceptos.view

                    ruta real:
                    /motor-conceptos
                    ============================================= */}

                {can("legajos:conceptos.view") &&
                  matchesSearch(
                    "Conceptos",
                    "Legajos"
                  ) && (
                    <Link
                      to="/motor-conceptos"
                      className={getLinkClassName(
                        "/motor-conceptos"
                      )}
                      onClick={handleLinkClick}
                    >
                      Conceptos
                    </Link>
                  )}


                {/* =============================================
                    REGISTROS
                    ============================================= */}
{/* 
                {can("legajos:registros.view") &&
                  matchesSearch(
                    "Registros",
                    "Legajos"
                  ) && (
                    <Link
                      to="/motor-conceptos/registros"
                      className={getLinkClassName(
                        "/motor-conceptos/registros"
                      )}
                      onClick={handleLinkClick}
                    >
                      Registros
                    </Link>
                  )} */}


                {/* =============================================
                    GESTIÓN EMPLEADOS

                    IMPORTANTE:
                    El permiso NO comienza con legajos:
                    en el archivo real utiliza
                    motorconceptos:gestion.empleados.view
                    ============================================= */}

                {can("motorconceptos:gestion.empleados.view") &&
                  matchesSearch(
                    "Gestión Empleados",
                    "Gestion Empleados",
                    "Empleados",
                    "Legajos"
                  ) && (
                    <Link
                      to="/motor-conceptos/documentacion/empleados"
                      className={getLinkClassName(
                        "/motor-conceptos/documentacion/empleados"
                      )}
                      onClick={handleLinkClick}
                    >
                      Gestión Empleados
                    </Link>
                  )}


                {/* =============================================
                    GESTIÓN EMPRESAS
                    ============================================= */}

                {can("motorconceptos:gestion.empresas.view") &&
                  matchesSearch(
                    "Gestión Empresas",
                    "Gestion Empresas",
                    "Empresas",
                    "Legajos"
                  ) && (
                    <Link
                      to="/motor-conceptos/documentacion/empresas"
                      className={getLinkClassName(
                        "/motor-conceptos/documentacion/empresas"
                      )}
                      onClick={handleLinkClick}
                    >
                      Gestión Empresas
                    </Link>
                  )}


                {/* =============================================
                    GESTIÓN SUCURSALES
                    ============================================= */}

                {can("motorconceptos:gestion.sucursales.view") &&
                  matchesSearch(
                    "Gestión Sucursales",
                    "Gestion Sucursales",
                    "Sucursales",
                    "Legajos"
                  ) && (
                    <Link
                      to="/motor-conceptos/documentacion/sucursales"
                      className={getLinkClassName(
                        "/motor-conceptos/documentacion/sucursales"
                      )}
                      onClick={handleLinkClick}
                    >
                      Gestión Sucursales
                    </Link>
                  )}


                {/* =============================================
                    REPORTES

                    Está comentado en el archivo original.
                    Lo mantenemos comentado.
                    ============================================= */}

                {/*
                {can("legajos:reportes.view") && (
                  <Link
                    to="/motor-conceptos/reportes/registros"
                    className={getLinkClassName(
                      "/motor-conceptos/reportes/registros"
                    )}
                    onClick={handleLinkClick}
                  >
                    Reportes
                  </Link>
                )}
                */}

              </>
            )}



            {/* =================================================
                INTELIGENCIA COMERCIAL

                IMPORTANTE:
                El archivo original no aplica can(...)
                individual a estas opciones.
                ================================================= */}

            {showInteligenciaItems && (
              <>

                <div className="sb-section-title">
                  <FiBarChart2 className="sb-section-title-icon" />
                  <span>Inteligencia Comercial</span>
                </div>


                {matchesSearch(
                  "Dashboard",
                  "Inteligencia Comercial"
                ) && (
                    <Link
                      to="/inteligencia/dashboard"
                      className={getLinkClassName(
                        "/inteligencia/dashboard"
                      )}
                      onClick={handleLinkClick}
                    >
                      Dashboard
                    </Link>
                  )}


                {matchesSearch(
                  "Eventos",
                  "Inteligencia Comercial"
                ) && (
                    <Link
                      to="/inteligencia/eventos"
                      className={getLinkClassName(
                        "/inteligencia/eventos"
                      )}
                      onClick={handleLinkClick}
                    >
                      Eventos
                    </Link>
                  )}


                {matchesSearch(
                  "Snapshots",
                  "Inteligencia Comercial"
                ) && (
                    <Link
                      to="/inteligencia/snapshots"
                      className={getLinkClassName(
                        "/inteligencia/snapshots"
                      )}
                      onClick={handleLinkClick}
                    >
                      Snapshots
                    </Link>
                  )}


                {matchesSearch(
                  "Clima",
                  "Inteligencia Comercial"
                ) && (
                    <Link
                      to="/inteligencia/clima"
                      className={getLinkClassName(
                        "/inteligencia/clima"
                      )}
                      onClick={handleLinkClick}
                    >
                      Clima
                    </Link>
                  )}

              </>
            )}


            {/* =================================================
                LA PARTE 6 COMIENZA AQUÍ

                ESTADÍSTICAS
                IVA
                RRHH / ASISTENCIA
                ================================================= */}

            {/* =================================================
                PARTE 6
                ESTADÍSTICAS
                IVA
                RRHH / ASISTENCIA
                ================================================= */}


            {/* =================================================
                ESTADÍSTICAS
                ================================================= */}

            {showStaticsItems && (
              <>

                <div className="sb-section-title">
                  <FiBarChart2 className="sb-section-title-icon" />
                  <span>Estadísticas</span>
                </div>


                {/* =============================================
                    PRECIOS HISTÓRICOS
                    ============================================= */}

                {can("stats:prices.historic.view") &&
                  matchesSearch(
                    "Precios Históricos",
                    "Precios Historicos",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/precioshistoricos"
                      className={getLinkClassName(
                        "/precioshistoricos"
                      )}
                      onClick={handleLinkClick}
                    >
                      Precios Históricos
                    </Link>
                  )}


                {/* =============================================
                    VENTAS COMPARATIVO
                    ============================================= */}

                {can("stats:sales.comparative.view") &&
                  matchesSearch(
                    "Ventas Comparativo",
                    "Ventas",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/sells/totalcomparativo"
                      className={getLinkClassName(
                        "/sells/totalcomparativo"
                      )}
                      onClick={handleLinkClick}
                    >
                      Ventas Comparativo
                    </Link>
                  )}


                {/* =============================================
                    VENTAS ENTRE RANGOS
                    ============================================= */}

                {can("stats:sales.range.view") &&
                  matchesSearch(
                    "Ventas entre Rangos",
                    "Rangos",
                    "Ventas",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/sells/comparativorangos"
                      className={getLinkClassName(
                        "/sells/comparativorangos"
                      )}
                      onClick={handleLinkClick}
                    >
                      Ventas entre Rangos
                    </Link>
                  )}


                {/* =============================================
                    GRÁFICO COMPARATIVO
                    ============================================= */}

                {can("stats:sales.chart.view") &&
                  matchesSearch(
                    "Gráfico Comparativo",
                    "Grafico Comparativo",
                    "Ventas",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/sells/graficoventas"
                      className={getLinkClassName(
                        "/sells/graficoventas"
                      )}
                      onClick={handleLinkClick}
                    >
                      Gráfico Comparativo
                    </Link>
                  )}


                {/* =============================================
                    VENTAS TOTALES
                    ============================================= */}

                {can("stats:sales.total.view") &&
                  matchesSearch(
                    "Ventas Totales",
                    "Ventas",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/sells/total"
                      className={getLinkClassName(
                        "/sells/total"
                      )}
                      onClick={handleLinkClick}
                    >
                      Ventas Totales
                    </Link>
                  )}


                {/* =============================================
                    VENTAS POR CLIENTE
                    ============================================= */}

                {can("stats:sales.byCustomer.view") &&
                  matchesSearch(
                    "Ventas por Cliente",
                    "Cliente",
                    "Ventas",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/sells/customers"
                      className={getLinkClassName(
                        "/sells/customers"
                      )}
                      onClick={handleLinkClick}
                    >
                      Ventas por Cliente
                    </Link>
                  )}


                {/* =============================================
                    VENTAS ANULADAS
                    ============================================= */}

                {can("stats:sales.deleted.view") &&
                  matchesSearch(
                    "Ventas Anuladas",
                    "Anuladas",
                    "Ventas",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/sells/deleted"
                      className={getLinkClassName(
                        "/sells/deleted"
                      )}
                      onClick={handleLinkClick}
                    >
                      Ventas Anuladas
                    </Link>
                  )}


                {/* =============================================
                    VENTAS CON DESCUENTO
                    ============================================= */}

                {can("stats:sales.discount.view") &&
                  matchesSearch(
                    "Ventas con Dcto",
                    "Ventas con Descuento",
                    "Descuento",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/sells/discount"
                      className={getLinkClassName(
                        "/sells/discount"
                      )}
                      onClick={handleLinkClick}
                    >
                      Ventas con Dcto
                    </Link>
                  )}


                {/* =============================================
                    VENTAS POR ARTÍCULO
                    ============================================= */}

                {can("stats:sales.byArticle.view") &&
                  matchesSearch(
                    "Ventas por Art",
                    "Ventas por Artículo",
                    "Ventas por Articulo",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/sells/articles"
                      className={getLinkClassName(
                        "/sells/articles"
                      )}
                      onClick={handleLinkClick}
                    >
                      Ventas por Art
                    </Link>
                  )}


                {/* =============================================
                    VENTAS POR USUARIO
                    ============================================= */}

                {can("stats:sales.byUser.view") &&
                  matchesSearch(
                    "Ventas por Usuario",
                    "Usuario",
                    "Ventas",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/sells/user"
                      className={getLinkClassName(
                        "/sells/user"
                      )}
                      onClick={handleLinkClick}
                    >
                      Ventas por Usuario
                    </Link>
                  )}


                {/* =============================================
                    KG POR SUCURSAL
                    ============================================= */}

                {can("stats:sales.kgByBranch.view") &&
                  matchesSearch(
                    "Kg por Sucursal",
                    "Kilos por Sucursal",
                    "Sucursal",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/sells/kg_branch"
                      className={getLinkClassName(
                        "/sells/kg_branch"
                      )}
                      onClick={handleLinkClick}
                    >
                      Kg por Sucursal
                    </Link>
                  )}


                {/* =============================================
                    CANTIDAD DE TICKETS
                    ============================================= */}

                {can("stats:sales.ticketCount.view") &&
                  matchesSearch(
                    "Cantidad Tickets",
                    "Tickets",
                    "Ventas",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/sells/quantity"
                      className={getLinkClassName(
                        "/sells/quantity"
                      )}
                      onClick={handleLinkClick}
                    >
                      Cantidad Tickets
                    </Link>
                  )}


                {/* =============================================
                    STOCK
                    ============================================= */}

                {can("stats:inventory.stock.view") &&
                  matchesSearch(
                    "Stock",
                    "Inventario",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/inventory/stock"
                      className={getLinkClassName(
                        "/inventory/stock"
                      )}
                      onClick={handleLinkClick}
                    >
                      Stock
                    </Link>
                  )}

              </>
            )}



            {/* =================================================
                IVA
                ================================================= */}

            {showIVAItems && (
              <>

                <div className="sb-section-title">
                  <TbReceiptTax className="sb-section-title-icon" />
                  <span>IVA</span>
                </div>


                {/* =============================================
                    LIBROS IVA

                    Permisos reales:
                    iva:libro.create
                    iva:libro.view
                    ============================================= */}

                {(can("iva:libro.create") ||
                  can("iva:libro.view")) &&
                  matchesSearch(
                    "Libros IVA",
                    "Crear Libro IVA",
                    "Listar Libros IVA",
                    "IVA"
                  ) && (
                    <>

                      <Nav.Item
                        onClick={() =>
                          setLibroIvaItem(
                            !libroIvaItem
                          )
                        }
                      >
                        <Link
                          to="#"
                          className="nav-link"
                        >
                          Libros IVA

                          <Caret
                            open={
                              libroIvaItem ||
                              searchActive
                            }
                          />
                        </Link>
                      </Nav.Item>


                      <Collapse
                        in={
                          libroIvaItem ||
                          searchActive
                        }
                      >
                        <div className="ml-3 sb-sub">


                          {can("iva:libro.create") &&
                            matchesSearch(
                              "Crear Libro IVA",
                              "Libros IVA"
                            ) && (
                              <Link
                                to="/librosiva/new"
                                className={getLinkClassName(
                                  "/librosiva/new"
                                )}
                                onClick={handleLinkClick}
                              >
                                Crear Libro IVA
                              </Link>
                            )}


                          {can("iva:libro.view") &&
                            matchesSearch(
                              "Listar Libros IVA",
                              "Libros IVA"
                            ) && (
                              <Link
                                to="/librosiva"
                                className={getLinkClassName(
                                  "/librosiva"
                                )}
                                onClick={handleLinkClick}
                              >
                                Listar Libros IVA
                              </Link>
                            )}

                        </div>
                      </Collapse>

                    </>
                  )}


                {/* =============================================
                    COMPRAS PROYECTADAS
                    ============================================= */}

                {can("iva:compras.proyectadas.view") &&
                  matchesSearch(
                    "Compras Proyectadas",
                    "Compras",
                    "IVA"
                  ) && (
                    <Link
                      to="/compraproyectada"
                      className={getLinkClassName(
                        "/compraproyectada"
                      )}
                      onClick={handleLinkClick}
                    >
                      Compras Proyectadas
                    </Link>
                  )}


                {/* =============================================
                    PROYECCIÓN DEL IVA
                    ============================================= */}

                {can("iva:proyeccion.view") &&
                  matchesSearch(
                    "Proyección del IVA",
                    "Proyeccion del IVA",
                    "IVA"
                  ) && (
                    <Link
                      to="/ivaproyeccion"
                      className={getLinkClassName(
                        "/ivaproyeccion"
                      )}
                      onClick={handleLinkClick}
                    >
                      Proyección del IVA
                    </Link>
                  )}

              </>
            )}



            {/* =================================================
                RRHH / ASISTENCIA
                ================================================= */}

            {showAsistenciaItems && (
              <>

                <div className="sb-section-title">
                  <FiUsers className="sb-section-title-icon" />
                  <span>RRHH</span>
                </div>


                {/* =============================================
                    DASHBOARD ASISTENCIA
                    ============================================= */}

                {can("asistencia:dashboard.view") &&
                  matchesSearch(
                    "Dashboard Asistencia",
                    "Dashboard",
                    "RRHH",
                    "Asistencia"
                  ) && (
                    <Link
                      to="/dashboardasistencias"
                      className={getLinkClassName(
                        "/dashboardasistencias"
                      )}
                      onClick={handleLinkClick}
                    >
                      Dashboard Asistencia
                    </Link>
                  )}


                {/* =============================================
                    CONCEPTOS
                    ============================================= */}

                {can("asistencia:concepto.manage") &&
                  matchesSearch(
                    "Conceptos",
                    "RRHH",
                    "Asistencia"
                  ) && (
                    <Link
                      to="/asistencias/conceptos"
                      className={getLinkClassName(
                        "/asistencias/conceptos"
                      )}
                      onClick={handleLinkClick}
                    >
                      Conceptos
                    </Link>
                  )}


                {/* =============================================
                    EVENTOS
                    ============================================= */}

                {can("asistencia:evento.manage") &&
                  matchesSearch(
                    "Eventos",
                    "RRHH",
                    "Asistencia"
                  ) && (
                    <Link
                      to="/asistencias/eventos"
                      className={getLinkClassName(
                        "/asistencias/eventos"
                      )}
                      onClick={handleLinkClick}
                    >
                      Eventos
                    </Link>
                  )}


                {/* =============================================
                    VACACIONES
                    ============================================= */}

                {can("asistencia:vacacion.view") &&
                  matchesSearch(
                    "Vacaciones",
                    "RRHH",
                    "Asistencia"
                  ) && (
                    <Link
                      to="/asistencias/listarvacaciones"
                      className={getLinkClassName(
                        "/asistencias/listarvacaciones"
                      )}
                      onClick={handleLinkClick}
                    >
                      Vacaciones
                    </Link>
                  )}


                {/* =============================================
                    PLANIFICACIÓN
                    ============================================= */}

                {can("asistencia:planificacion.manage") &&
                  matchesSearch(
                    "Planificación",
                    "Planificacion",
                    "RRHH",
                    "Asistencia"
                  ) && (
                    <Link
                      to="/asistencias/planificacion"
                      className={getLinkClassName(
                        "/asistencias/planificacion"
                      )}
                      onClick={handleLinkClick}
                    >
                      Planificación
                    </Link>
                  )}


                {/* =============================================
                    HORARIOS
                    ============================================= */}

                {can("asistencia:horario.manage") &&
                  matchesSearch(
                    "Horarios",
                    "RRHH",
                    "Asistencia"
                  ) && (
                    <Link
                      to="/asistencias/horarios"
                      className={getLinkClassName(
                        "/asistencias/horarios"
                      )}
                      onClick={handleLinkClick}
                    >
                      Horarios
                    </Link>
                  )}


                {/* =============================================
                    ASIGNAR DATOS A EMPLEADO
                    ============================================= */}

                {can("asistencia:asignacion.manage") &&
                  matchesSearch(
                    "Asignar Datos a Empleado",
                    "Asignar Empleado",
                    "Empleado",
                    "RRHH",
                    "Asistencia"
                  ) && (
                    <Link
                      to="/asistencias/asignarempleado"
                      className={getLinkClassName(
                        "/asistencias/asignarempleado"
                      )}
                      onClick={handleLinkClick}
                    >
                      Asignar Datos a Empleado
                    </Link>
                  )}


                {/* =============================================
                    HUELLAS NAVEGADOR
                    ============================================= */}

                {can("asistencia:fingerprint.manage") &&
                  matchesSearch(
                    "Huellas Navegador",
                    "Huellas",
                    "Fingerprint",
                    "RRHH",
                    "Asistencia"
                  ) && (
                    <Link
                      to="/asistencias/huellanavegador"
                      className={getLinkClassName(
                        "/asistencias/huellanavegador"
                      )}
                      onClick={handleLinkClick}
                    >
                      Huellas Navegador
                    </Link>
                  )}


                {/* =============================================
                    LISTAR ASISTENCIAS
                    ============================================= */}

                {can("asistencia:view") &&
                  matchesSearch(
                    "Listar Asistencias",
                    "Asistencias",
                    "RRHH"
                  ) && (
                    <Link
                      to="/asistencias"
                      className={getLinkClassName(
                        "/asistencias"
                      )}
                      onClick={handleLinkClick}
                    >
                      Listar Asistencias
                    </Link>
                  )}


                {/* =============================================
                    JORNADAS
                    ============================================= */}

                {can("asistencia:jornada.manage") &&
                  matchesSearch(
                    "Jornadas",
                    "RRHH",
                    "Asistencia"
                  ) && (
                    <Link
                      to="/jornadasasistencias"
                      className={getLinkClassName(
                        "/jornadasasistencias"
                      )}
                      onClick={handleLinkClick}
                    >
                      Jornadas
                    </Link>
                  )}


                {/* =============================================
                    PARÁMETROS
                    ============================================= */}

                {can("asistencia:parametro.manage") &&
                  matchesSearch(
                    "Parámetros",
                    "Parametros",
                    "RRHH",
                    "Asistencia"
                  ) && (
                    <Link
                      to="/parametrosasistencias"
                      className={getLinkClassName(
                        "/parametrosasistencias"
                      )}
                      onClick={handleLinkClick}
                    >
                      Parámetros
                    </Link>
                  )}

              </>
            )}


            {/* =================================================
                LA PARTE 7 COMIENZA AQUÍ

                TESORERÍA
                FACTURACIÓN
                SUELDOS
                ================================================= */}

            {/* =================================================
                PARTE 7
                TESORERÍA
                FACTURACIÓN
                SUELDOS
                ================================================= */}


            {/* =================================================
                TESORERÍA
                ================================================= */}

            {showCajaItems && (
              <>

                <div className="sb-section-title">
                  <LuWallet className="sb-section-title-icon" />
                  <span>Tesorería</span>
                </div>


                {/* =============================================
                    CATEGORÍAS TESORERÍA
                    ============================================= */}

                {can("tesoreria:categoria.manage") &&
                  matchesSearch(
                    "Categorías",
                    "Categorias",
                    "Categorías Ingreso",
                    "Categorías Egreso",
                    "Tesorería"
                  ) && (
                    <>

                      <Nav.Item
                        onClick={() =>
                          setCategoriaTesoreriaItem(
                            !categoriaTesoreriaItem
                          )
                        }
                      >
                        <Link
                          to="#"
                          className="nav-link"
                        >
                          Categorías

                          <Caret
                            open={
                              categoriaTesoreriaItem ||
                              searchActive
                            }
                          />
                        </Link>
                      </Nav.Item>


                      <Collapse
                        in={
                          categoriaTesoreriaItem ||
                          searchActive
                        }
                      >
                        <div className="ml-3 sb-sub">

                          {matchesSearch(
                            "Categorías Ingreso",
                            "Categorias Ingreso",
                            "Tesorería"
                          ) && (
                              <Link
                                to="/categoriaingreso"
                                className={getLinkClassName(
                                  "/categoriaingreso"
                                )}
                                onClick={handleLinkClick}
                              >
                                Categorías Ingreso
                              </Link>
                            )}


                          {matchesSearch(
                            "Categorías Egreso",
                            "Categorias Egreso",
                            "Tesorería"
                          ) && (
                              <Link
                                to="/categoriaegreso"
                                className={getLinkClassName(
                                  "/categoriaegreso"
                                )}
                                onClick={handleLinkClick}
                              >
                                Categorías Egreso
                              </Link>
                            )}

                        </div>
                      </Collapse>

                    </>
                  )}



                {/* =============================================
                    CAJA

                    Permisos reales:
                    tesoreria:caja.open
                    tesoreria:caja.view
                    tesoreria:retiros.view
                    ============================================= */}

                {(can("tesoreria:caja.open") ||
                  can("tesoreria:caja.view") ||
                  can("tesoreria:retiros.view")) &&
                  matchesSearch(
                    "Caja",
                    "Apertura de Caja",
                    "Movimientos de Caja",
                    "Registro de Retiros",
                    "Tesorería"
                  ) && (
                    <>

                      <Nav.Item
                        onClick={() =>
                          setCajaItem(!cajaItem)
                        }
                      >
                        <Link
                          to="#"
                          className="nav-link"
                        >
                          Caja

                          <Caret
                            open={
                              cajaItem ||
                              searchActive
                            }
                          />
                        </Link>
                      </Nav.Item>


                      <Collapse
                        in={
                          cajaItem ||
                          searchActive
                        }
                      >
                        <div className="ml-3 sb-sub">


                          {can("tesoreria:caja.open") &&
                            matchesSearch(
                              "Apertura de Caja",
                              "Caja",
                              "Tesorería"
                            ) && (
                              <Link
                                to="/tesoreria/cajas/apertura"
                                className={getLinkClassName(
                                  "/tesoreria/cajas/apertura"
                                )}
                                onClick={handleLinkClick}
                              >
                                Apertura de Caja
                              </Link>
                            )}


                          {can("tesoreria:caja.view") &&
                            matchesSearch(
                              "Movimientos de Caja",
                              "Caja",
                              "Tesorería"
                            ) && (
                              <Link
                                to="/tesoreria/movimientos-caja-tesoreria"
                                className={getLinkClassName(
                                  "/tesoreria/movimientos-caja-tesoreria"
                                )}
                                onClick={handleLinkClick}
                              >
                                Movimientos de Caja
                              </Link>
                            )}


                          {can("tesoreria:retiros.view") &&
                            matchesSearch(
                              "Registro de Retiros",
                              "Retiros",
                              "Sucursal",
                              "Tesorería"
                            ) && (
                              <Link
                                to="/tesoreria/retirossucursales"
                                className={getLinkClassName(
                                  "/tesoreria/retirossucursales"
                                )}
                                onClick={handleLinkClick}
                              >
                                Registro de Retiros
                              </Link>
                            )}

                        </div>
                      </Collapse>

                    </>
                  )}



                {/* =============================================
                    BANCOS
                    ============================================= */}

                {(can("tesoreria:banco.view") ||
                  can("tesoreria:banco.import")) &&
                  matchesSearch(
                    "Bancos",
                    "Movimientos bancarios",
                    "Movimientos bancarios Excel",
                    "Tesorería"
                  ) && (
                    <>

                      <Nav.Item
                        onClick={() =>
                          setMovBancoItem(
                            !movBancoItem
                          )
                        }
                      >
                        <Link
                          to="#"
                          className="nav-link"
                        >
                          Bancos

                          <Caret
                            open={
                              movBancoItem ||
                              searchActive
                            }
                          />
                        </Link>
                      </Nav.Item>


                      <Collapse
                        in={
                          movBancoItem ||
                          searchActive
                        }
                      >
                        <div className="ml-3 sb-sub">


                          {can("tesoreria:banco.view") &&
                            matchesSearch(
                              "Movimientos bancarios",
                              "Bancos",
                              "Tesorería"
                            ) && (
                              <Link
                                to="/tesoreria/movimientos-banco-tesoreria"
                                className={getLinkClassName(
                                  "/tesoreria/movimientos-banco-tesoreria"
                                )}
                                onClick={handleLinkClick}
                              >
                                Movimientos bancarios
                              </Link>
                            )}


                          {can("tesoreria:banco.import") &&
                            matchesSearch(
                              "Movimientos bancarios Excel",
                              "Importar Excel",
                              "Bancos",
                              "Tesorería"
                            ) && (
                              <Link
                                to="/tesoreria/movimientos-banco-tesoreria-excel"
                                className={getLinkClassName(
                                  "/tesoreria/movimientos-banco-tesoreria-excel"
                                )}
                                onClick={handleLinkClick}
                              >
                                Movimientos bancarios Excel
                              </Link>
                            )}

                        </div>
                      </Collapse>

                    </>
                  )}



                {/* =============================================
                    TARJETAS
                    ============================================= */}

                {can("tesoreria:tarjeta.view") &&
                  matchesSearch(
                    "Tarjetas",
                    "Movimientos TC TD",
                    "Tarjeta Crédito",
                    "Tarjeta Débito",
                    "Tesorería"
                  ) && (
                    <Link
                      to="/tesoreria/movimientos-tarjetas-tesoreria"
                      className={getLinkClassName(
                        "/tesoreria/movimientos-tarjetas-tesoreria"
                      )}
                      onClick={handleLinkClick}
                    >
                      Movimientos TC/TD
                    </Link>
                  )}



                {/* =============================================
                    CHEQUES / ECHEQ
                    ============================================= */}

                {can("tesoreria:cheque.view") &&
                  matchesSearch(
                    "Cheques",
                    "Echeq",
                    "Cheques Echeq",
                    "Tesorería"
                  ) && (
                    <Link
                      to="/tesoreria/movimientos-echeq-tesoreria"
                      className={getLinkClassName(
                        "/tesoreria/movimientos-echeq-tesoreria"
                      )}
                      onClick={handleLinkClick}
                    >
                      Cheques / Echeq
                    </Link>
                  )}



                {/* =============================================
                    AJUSTES

                    En el archivo real usa:
                    tesoreria:view
                    ============================================= */}

                {can("tesoreria:view") &&
                  matchesSearch(
                    "Registros de ajustes",
                    "Ajustes",
                    "Comprobantes",
                    "Tesorería"
                  ) && (
                    <Link
                      to="/tesoreria/ajustes-comprobantes"
                      className={getLinkClassName(
                        "/tesoreria/ajustes-comprobantes"
                      )}
                      onClick={handleLinkClick}
                    >
                      Registros de ajustes
                    </Link>
                  )}



                {/* =============================================
                    GASTOS ESTIMADOS
                    ============================================= */}

                {(can("tesoreria:gastosEstimados.view") ||
                  can("tesoreria:gastosEstimados.import")) &&
                  matchesSearch(
                    "Gastos Estimados",
                    "Listar Gastos Estimados",
                    "Importar Gastos Estimados",
                    "Tesorería"
                  ) && (
                    <>

                      <Nav.Item
                        onClick={() =>
                          setGastosEstimadosItem(
                            !gastosEstimadosItem
                          )
                        }
                      >
                        <Link
                          to="#"
                          className="nav-link"
                        >
                          Gastos Estimados

                          <Caret
                            open={
                              gastosEstimadosItem ||
                              searchActive
                            }
                          />
                        </Link>
                      </Nav.Item>


                      <Collapse
                        in={
                          gastosEstimadosItem ||
                          searchActive
                        }
                      >
                        <div className="ml-3 sb-sub">


                          {can("tesoreria:gastosEstimados.view") &&
                            matchesSearch(
                              "Listar Gastos Estimados",
                              "Gastos Estimados"
                            ) && (
                              <Link
                                to="/gastosestimados"
                                className={getLinkClassName(
                                  "/gastosestimados"
                                )}
                                onClick={handleLinkClick}
                              >
                                Listar Gastos Estimados
                              </Link>
                            )}


                          {can("tesoreria:gastosEstimados.import") &&
                            matchesSearch(
                              "Importar Gastos Estimados",
                              "Gastos Estimados"
                            ) && (
                              <Link
                                to="/importargastosestimados"
                                className={getLinkClassName(
                                  "/importargastosestimados"
                                )}
                                onClick={handleLinkClick}
                              >
                                Importar Gastos Estimados
                              </Link>
                            )}

                        </div>
                      </Collapse>

                    </>
                  )}

              </>
            )}



            {/* =================================================
                FACTURACIÓN
                ================================================= */}

            {showFacturacionItems && (
              <>

                <div className="sb-section-title">
                  <MdPointOfSale className="sb-section-title-icon" />
                  <span>Facturación</span>
                </div>


                {/* =============================================
                    VENTAS
                    ============================================= */}

                {(can("facturacion:ventas.clientes.view") ||
                  can("facturacion:ventas.facturar")) &&
                  matchesSearch(
                    "Ventas",
                    "Clientes",
                    "Facturación",
                    "Facturacion"
                  ) && (
                    <>

                      <Nav.Item
                        onClick={() =>
                          setVentasFacturacionItem(
                            !ventasFacturacionItem
                          )
                        }
                      >
                        <Link
                          to="#"
                          className="nav-link"
                        >
                          Ventas

                          <Caret
                            open={
                              ventasFacturacionItem ||
                              searchActive
                            }
                          />
                        </Link>
                      </Nav.Item>


                      <Collapse
                        in={
                          ventasFacturacionItem ||
                          searchActive
                        }
                      >
                        <div className="ml-3 sb-sub">


                          {can("facturacion:ventas.clientes.view") &&
                            matchesSearch(
                              "Clientes",
                              "Ventas",
                              "Facturación"
                            ) && (
                              <Link
                                to="/ventasfacturacion/clientes"
                                className={getLinkClassName(
                                  "/ventasfacturacion/clientes"
                                )}
                                onClick={handleLinkClick}
                              >
                                Clientes
                              </Link>
                            )}


                          {can("facturacion:ventas.facturar") &&
                            matchesSearch(
                              "Facturación",
                              "Facturacion",
                              "Ventas"
                            ) && (
                              <Link
                                to="/ventasfacturacion/facturacion"
                                className={getLinkClassName(
                                  "/ventasfacturacion/facturacion"
                                )}
                                onClick={handleLinkClick}
                              >
                                Facturación
                              </Link>
                            )}

                        </div>
                      </Collapse>

                    </>
                  )}



                {/* =============================================
                    COMPRAS
                    ============================================= */}

                {(can("facturacion:compras.proveedores.view") ||
                  can("facturacion:compras.facturar") ||
                  can("facturacion:compras.pagos") ||
                  can("facturacion:compras.ctacte.view") ||
                  can("facturacion:compras.situacionFinanciera.view")) &&
                  matchesSearch(
                    "Compras",
                    "Proveedores",
                    "Facturación",
                    "Pagos a Proveedores",
                    "Cuentas Corrientes",
                    "Situación Financiera"
                  ) && (
                    <>

                      <Nav.Item
                        onClick={() =>
                          setComprasFacturacionItem(
                            !comprasFacturacionItem
                          )
                        }
                      >
                        <Link
                          to="#"
                          className="nav-link"
                        >
                          Compras

                          <Caret
                            open={
                              comprasFacturacionItem ||
                              searchActive
                            }
                          />
                        </Link>
                      </Nav.Item>


                      <Collapse
                        in={
                          comprasFacturacionItem ||
                          searchActive
                        }
                      >
                        <div className="ml-3 sb-sub">


                          {can("facturacion:compras.proveedores.view") &&
                            matchesSearch(
                              "Proveedores",
                              "Compras",
                              "Facturación"
                            ) && (
                              <Link
                                to="/comprasfacturacion/proveedores"
                                className={getLinkClassName(
                                  "/comprasfacturacion/proveedores"
                                )}
                                onClick={handleLinkClick}
                              >
                                Proveedores
                              </Link>
                            )}


                          {can("facturacion:compras.facturar") &&
                            matchesSearch(
                              "Facturación",
                              "Facturacion",
                              "Compras"
                            ) && (
                              <Link
                                to="/comprasfacturacion/facturacion"
                                className={getLinkClassName(
                                  "/comprasfacturacion/facturacion"
                                )}
                                onClick={handleLinkClick}
                              >
                                Facturación
                              </Link>
                            )}


                          {can("facturacion:compras.pagos") &&
                            matchesSearch(
                              "Pagos a Proveedores",
                              "Pagos",
                              "Compras"
                            ) && (
                              <Link
                                to="/comprasfacturacion/ordendepago"
                                className={getLinkClassName(
                                  "/comprasfacturacion/ordendepago"
                                )}
                                onClick={handleLinkClick}
                              >
                                Pagos a Proveedores
                              </Link>
                            )}


                          {can("facturacion:compras.ctacte.view") &&
                            matchesSearch(
                              "Ctas Ctes Proveedores",
                              "Cuentas Corrientes Proveedores",
                              "Compras"
                            ) && (
                              <Link
                                to="/comprasfacturacion/ctasctes"
                                className={getLinkClassName(
                                  "/comprasfacturacion/ctasctes"
                                )}
                                onClick={handleLinkClick}
                              >
                                Ctas. Ctes. Proveedores
                              </Link>
                            )}


                          {can("facturacion:compras.situacionFinanciera.view") &&
                            matchesSearch(
                              "Situación Financiera",
                              "Situacion Financiera",
                              "Compras"
                            ) && (
                              <Link
                                to="/sitfinanciera"
                                className={getLinkClassName(
                                  "/sitfinanciera"
                                )}
                                onClick={handleLinkClick}
                              >
                                Situación Financiera
                              </Link>
                            )}

                        </div>
                      </Collapse>

                    </>
                  )}


                {/* =============================================
                    PAGOS PROGRAMADOS

                    Está comentado en el archivo original.
                    Se mantiene fuera del menú.
                    ============================================= */}

                {/*
                <Link
                  to="/tesoreria/pagos-programados"
                  className={getLinkClassName(
                    "/tesoreria/pagos-programados"
                  )}
                  onClick={handleLinkClick}
                >
                  Pagos Programados
                </Link>
                */}

              </>
            )}



            {/* =================================================
                SUELDOS
                ================================================= */}

            {showSueldosItems && (
              <>

                <div className="sb-section-title">
                  <FiUsers className="sb-section-title-icon" />
                  <span>Sueldos</span>
                </div>


                {/* =============================================
                    OPCIONES COMENTADAS EN EL ARCHIVO ORIGINAL

                    No las reactivamos.
                    ============================================= */}

                {/*
                {can("sueldos:telefono.assign") && (
                  <Link
                    to="/sueldostesoreria/asignartelefono"
                    className={getLinkClassName(
                      "/sueldostesoreria/asignartelefono"
                    )}
                    onClick={handleLinkClick}
                  >
                    Asignar Teléfono
                  </Link>
                )}


                {can("sueldos:datosEmpleado.assign") && (
                  <Link
                    to="/sueldostesoreria/asignardatosempleado"
                    className={getLinkClassName(
                      "/sueldostesoreria/asignardatosempleado"
                    )}
                    onClick={handleLinkClick}
                  >
                    Asignar Datos Empleado
                  </Link>
                )}
                */}


                {/* =============================================
                    TIPOS DE ADICIONAL FIJOS
                    ============================================= */}

                {can("sueldos:adicionalFijo.tipo.manage") &&
                  matchesSearch(
                    "Tipos de adicional fijos",
                    "Adicional Fijo",
                    "Sueldos"
                  ) && (
                    <Link
                      to="/sueldostesoreria/adicionalfijotipo"
                      className={getLinkClassName(
                        "/sueldostesoreria/adicionalfijotipo"
                      )}
                      onClick={handleLinkClick}
                    >
                      Tipos de adicional fijos
                    </Link>
                  )}


                {/* =============================================
                    ASIGNAR ADICIONAL FIJO
                    ============================================= */}

                {can("sueldos:adicionalFijo.assign") &&
                  matchesSearch(
                    "Asignar Adicional Fijo",
                    "Adicional Fijo",
                    "Sueldos"
                  ) && (
                    <Link
                      to="/sueldostesoreria/asignaradicionalfijo"
                      className={getLinkClassName(
                        "/sueldostesoreria/asignaradicionalfijo"
                      )}
                      onClick={handleLinkClick}
                    >
                      Asignar Adicional Fijo
                    </Link>
                  )}


                {/* =============================================
                    IMPORTAR ITEMS RECIBO
                    ============================================= */}

                {can("sueldos:recibo.items.import") &&
                  matchesSearch(
                    "Importar items Recibo",
                    "Items Recibo",
                    "Recibos",
                    "Sueldos"
                  ) && (
                    <Link
                      to="/sueldostesoreria/recibosimportmanager"
                      className={getLinkClassName(
                        "/sueldostesoreria/recibosimportmanager"
                      )}
                      onClick={handleLinkClick}
                    >
                      Importar items Recibo
                    </Link>
                  )}


                {/* =============================================
                    IMPORTAR VALES Y ADELANTOS
                    ============================================= */}

                {can("sueldos:variables.import") &&
                  matchesSearch(
                    "Importar Vales y Adelantos",
                    "Vales",
                    "Adelantos",
                    "Sueldos"
                  ) && (
                    <Link
                      to="/sueldostesoreria/importaritemsvariables"
                      className={getLinkClassName(
                        "/sueldostesoreria/importaritemsvariables"
                      )}
                      onClick={handleLinkClick}
                    >
                      Importar Vales y Adelantos
                    </Link>
                  )}


                {/* =============================================
                    LISTAR ADICIONALES VARIABLES
                    ============================================= */}

                {can("sueldos:variables.view") &&
                  matchesSearch(
                    "Listar Adicionales Variables",
                    "Adicionales Variables",
                    "Sueldos"
                  ) && (
                    <Link
                      to="/sueldostesoreria/listaradicionalesvariables"
                      className={getLinkClassName(
                        "/sueldostesoreria/listaradicionalesvariables"
                      )}
                      onClick={handleLinkClick}
                    >
                      Listar Adicionales Variables
                    </Link>
                  )}


                {/* =============================================
                    LIQUIDACIÓN MENSUAL
                    ============================================= */}

                {can("sueldos:liquidacion.run") &&
                  matchesSearch(
                    "Liquidación Mensual",
                    "Liquidacion Mensual",
                    "Liquidación",
                    "Sueldos"
                  ) && (
                    <Link
                      to="/sueldostesoreria/liquidacionmensual"
                      className={getLinkClassName(
                        "/sueldostesoreria/liquidacionmensual"
                      )}
                      onClick={handleLinkClick}
                    >
                      Liquidación Mensual
                    </Link>
                  )}


                {/* =============================================
                    PAGO DE SUELDOS
                    ============================================= */}

                {can("sueldos:pago.tesoreria") &&
                  matchesSearch(
                    "Pago de Sueldos",
                    "Pago de Sueldos Tesorería",
                    "Sueldos"
                  ) && (
                    <Link
                      to="/sueldostesoreria/pagodesueldos"
                      className={getLinkClassName(
                        "/sueldostesoreria/pagodesueldos"
                      )}
                      onClick={handleLinkClick}
                    >
                      Pago de Sueldos (Tes)
                    </Link>
                  )}


                {/* =============================================
                    ADELANTOS
                    ============================================= */}

                {can("sueldos:adelantos.tesoreria") &&
                  matchesSearch(
                    "Adelantos",
                    "Adelantos Tesorería",
                    "Sueldos"
                  ) && (
                    <Link
                      to="/sueldostesoreria/adelantos"
                      className={getLinkClassName(
                        "/sueldostesoreria/adelantos"
                      )}
                      onClick={handleLinkClick}
                    >
                      Adelantos (Tes)
                    </Link>
                  )}


                {/* =============================================
                    PRÉSTAMOS A EMPLEADOS

                    CORRECCIÓN INTENCIONAL:

                    En el SideBar fuente aparece protegido
                    nuevamente con:
                    sueldos:adelantos.tesoreria

                    Pero para este módulo habíamos definido
                    el permiso específico:

                    sueldos:prestamos.tesoreria

                    Conservamos la ruta real y usamos
                    el permiso específico.
                    ============================================= */}

                {can("sueldos:prestamos.tesoreria") &&
                  matchesSearch(
                    "Prestamos a Empleados",
                    "Préstamos a Empleados",
                    "Prestamos",
                    "Préstamos",
                    "Empleados",
                    "Sueldos"
                  ) && (
                    <Link
                      to="/sueldostesoreria/prestamosempleados"
                      className={getLinkClassName(
                        "/sueldostesoreria/prestamosempleados"
                      )}
                      onClick={handleLinkClick}
                    >
                      Prestamos a Empleados
                    </Link>
                  )}

              </>
            )}


            {/* =================================================
                LA PARTE 8 COMIENZA AQUÍ

                GESTIÓN DE MEDIAS
                INFO SUCURSALES
                REVISIÓN MOVIMIENTOS
                FOOTER / CIERRE DEL COMPONENTE
                ================================================= */}

            {/* =================================================
                PARTE 8
                GESTIÓN DE MEDIAS
                INFO SUCURSALES
                REVISIÓN MOVIMIENTOS
                FOOTER
                ================================================= */}


            {/* =================================================
                GESTIÓN DE MEDIAS
                ================================================= */}

            {showGestionItems && (
              <>

                <div className="sb-section-title">
                  <FiLayers className="sb-section-title-icon" />
                  <span>Gestión de Medias</span>
                </div>


                {/* =============================================
                    REGISTRO DE HACIENDA
                    ============================================= */}

                {can("gmedias:registro.view") &&
                  matchesSearch(
                    "Registro Hacienda",
                    "Hacienda",
                    "Gestión de Medias"
                  ) && (
                    <Link
                      to="/registrohacienda"
                      className={getLinkClassName(
                        "/registrohacienda"
                      )}
                      onClick={handleLinkClick}
                    >
                      Registro Hacienda
                    </Link>
                  )}


                {/* =============================================
                    VENTAS MEDIAS
                    ============================================= */}

                {(can("gmedias:venta.create") ||
                  can("gmedias:venta.view")) &&
                  matchesSearch(
                    "Ventas Medias",
                    "Crear Venta",
                    "Listar Ventas",
                    "Gestión de Medias"
                  ) && (
                    <>

                      <Nav.Item
                        onClick={() =>
                          setSellitem(!sellitem)
                        }
                      >
                        <Link
                          to="#"
                          className="nav-link"
                        >
                          Ventas Medias

                          <Caret
                            open={
                              sellitem ||
                              searchActive
                            }
                          />
                        </Link>
                      </Nav.Item>


                      <Collapse
                        in={
                          sellitem ||
                          searchActive
                        }
                      >
                        <div className="ml-3 sb-sub">

                          {can("gmedias:venta.create") &&
                            matchesSearch(
                              "Crear Venta",
                              "Ventas Medias"
                            ) && (
                              <Link
                                to="/sells/new"
                                className={getLinkClassName(
                                  "/sells/new"
                                )}
                                onClick={handleLinkClick}
                              >
                                Crear Venta
                              </Link>
                            )}


                          {can("gmedias:venta.view") &&
                            matchesSearch(
                              "Listar Ventas",
                              "Ventas Medias"
                            ) && (
                              <Link
                                to="/sells"
                                className={getLinkClassName(
                                  "/sells"
                                )}
                                onClick={handleLinkClick}
                              >
                                Listar Ventas
                              </Link>
                            )}

                        </div>
                      </Collapse>

                    </>
                  )}


                {/* =============================================
                    PRODUCTOS

                    ATENCIÓN:
                    Los permisos reales son producto,
                    en singular.
                    ============================================= */}

                {(can("gmedias:producto.create") ||
                  can("gmedias:producto.view") ||
                  can("gmedias:producto.update") ||
                  can("gmedias:producto.update.tropa") ||
                  can("gmedias:producto.verify.tropa")) &&
                  matchesSearch(
                    "Productos",
                    "Crear Productos",
                    "Listar Productos",
                    "Actualizar",
                    "Actualizar por Tropa",
                    "Verificar por Tropa",
                    "Gestión de Medias"
                  ) && (
                    <>

                      <Nav.Item
                        onClick={() =>
                          setProditem(!proditem)
                        }
                      >
                        <Link
                          to="#"
                          className="nav-link"
                        >
                          Productos

                          <Caret
                            open={
                              proditem ||
                              searchActive
                            }
                          />
                        </Link>
                      </Nav.Item>


                      <Collapse
                        in={
                          proditem ||
                          searchActive
                        }
                      >
                        <div className="ml-3 sb-sub">


                          {can("gmedias:producto.create") &&
                            matchesSearch(
                              "Crear Productos",
                              "Productos"
                            ) && (
                              <Link
                                to="/products/new"
                                className={getLinkClassName(
                                  "/products/new"
                                )}
                                onClick={handleLinkClick}
                              >
                                Crear Productos
                              </Link>
                            )}


                          {can("gmedias:producto.view") &&
                            matchesSearch(
                              "Listar Productos",
                              "Productos"
                            ) && (
                              <Link
                                to="/products"
                                className={getLinkClassName(
                                  "/products"
                                )}
                                onClick={handleLinkClick}
                              >
                                Listar Productos
                              </Link>
                            )}


                          {can("gmedias:producto.update") &&
                            matchesSearch(
                              "Actualizar",
                              "Productos"
                            ) && (
                              <Link
                                to="/products_update"
                                className={getLinkClassName(
                                  "/products_update"
                                )}
                                onClick={handleLinkClick}
                              >
                                Actualizar
                              </Link>
                            )}


                          {can("gmedias:producto.update.tropa") &&
                            matchesSearch(
                              "Actualizar por Tropa",
                              "Productos",
                              "Tropa"
                            ) && (
                              <Link
                                to="/products_update_tropa"
                                className={getLinkClassName(
                                  "/products_update_tropa"
                                )}
                                onClick={handleLinkClick}
                              >
                                Actualizar por Tropa
                              </Link>
                            )}


                          {can("gmedias:producto.verify.tropa") &&
                            matchesSearch(
                              "Verificar por Tropa",
                              "Productos",
                              "Tropa"
                            ) && (
                              <Link
                                to="/products/verificar-tropa"
                                className={getLinkClassName(
                                  "/products/verificar-tropa"
                                )}
                                onClick={handleLinkClick}
                              >
                                Verificar por Tropa
                              </Link>
                            )}

                        </div>
                      </Collapse>

                    </>
                  )}


                {/* =============================================
                    SUCURSALES
                    ============================================= */}

                {can("gmedias:sucursal.view") &&
                  matchesSearch(
                    "Sucursales",
                    "Listar Sucursales",
                    "Gestión de Medias"
                  ) && (
                    <>

                      <Nav.Item
                        onClick={() =>
                          setSucitem(!sucitem)
                        }
                      >
                        <Link
                          to="#"
                          className="nav-link"
                        >
                          Sucursales

                          <Caret
                            open={
                              sucitem ||
                              searchActive
                            }
                          />
                        </Link>
                      </Nav.Item>


                      <Collapse
                        in={
                          sucitem ||
                          searchActive
                        }
                      >
                        <div className="ml-3 sb-sub">

                          {matchesSearch(
                            "Listar Sucursales",
                            "Sucursales"
                          ) && (
                              <Link
                                to="/branches"
                                className={getLinkClassName(
                                  "/branches"
                                )}
                                onClick={handleLinkClick}
                              >
                                Listar Sucursales
                              </Link>
                            )}

                        </div>
                      </Collapse>

                    </>
                  )}


                {/* =============================================
                    CLIENTES
                    ============================================= */}

                {(can("gmedias:cliente.create") ||
                  can("gmedias:cliente.view")) &&
                  matchesSearch(
                    "Clientes",
                    "Crear Cliente",
                    "Listar Clientes",
                    "Gestión de Medias"
                  ) && (
                    <>

                      <Nav.Item
                        onClick={() =>
                          setCustitem(!custitem)
                        }
                      >
                        <Link
                          to="#"
                          className="nav-link"
                        >
                          Clientes

                          <Caret
                            open={
                              custitem ||
                              searchActive
                            }
                          />
                        </Link>
                      </Nav.Item>


                      <Collapse
                        in={
                          custitem ||
                          searchActive
                        }
                      >
                        <div className="ml-3 sb-sub">

                          {can("gmedias:cliente.create") &&
                            matchesSearch(
                              "Crear Cliente",
                              "Clientes"
                            ) && (
                              <Link
                                to="/customers/new"
                                className={getLinkClassName(
                                  "/customers/new"
                                )}
                                onClick={handleLinkClick}
                              >
                                Crear Cliente
                              </Link>
                            )}


                          {can("gmedias:cliente.view") &&
                            matchesSearch(
                              "Listar Clientes",
                              "Clientes"
                            ) && (
                              <Link
                                to="/customers"
                                className={getLinkClassName(
                                  "/customers"
                                )}
                                onClick={handleLinkClick}
                              >
                                Listar Clientes
                              </Link>
                            )}

                        </div>
                      </Collapse>

                    </>
                  )}


                {/* =============================================
                    FORMAS DE PAGO
                    ============================================= */}

                {(can("gmedias:formaPago.create") ||
                  can("gmedias:formaPago.view")) &&
                  matchesSearch(
                    "Formas de Pago",
                    "Crear Forma Pago",
                    "Listar Formas Pago",
                    "Gestión de Medias"
                  ) && (
                    <>

                      <Nav.Item
                        onClick={() =>
                          setWaypayitem(!waypitem)
                        }
                      >
                        <Link
                          to="#"
                          className="nav-link"
                        >
                          Formas de Pago

                          <Caret
                            open={
                              waypitem ||
                              searchActive
                            }
                          />
                        </Link>
                      </Nav.Item>


                      <Collapse
                        in={
                          waypitem ||
                          searchActive
                        }
                      >
                        <div className="ml-3 sb-sub">

                          {can("gmedias:formaPago.create") &&
                            matchesSearch(
                              "Crear Forma Pago",
                              "Formas de Pago"
                            ) && (
                              <Link
                                to="/waypays/new"
                                className={getLinkClassName(
                                  "/waypays/new"
                                )}
                                onClick={handleLinkClick}
                              >
                                Crear Forma Pago
                              </Link>
                            )}


                          {can("gmedias:formaPago.view") &&
                            matchesSearch(
                              "Listar Formas Pago",
                              "Formas de Pago"
                            ) && (
                              <Link
                                to="/waypays"
                                className={getLinkClassName(
                                  "/waypays"
                                )}
                                onClick={handleLinkClick}
                              >
                                Listar Formas Pago
                              </Link>
                            )}

                        </div>
                      </Collapse>

                    </>
                  )}


                {/* =============================================
                    COBRANZAS
                    ============================================= */}

                {can("gmedias:cobranza.view") &&
                  matchesSearch(
                    "Cobranzas",
                    "Listar Cobranzas",
                    "Gestión de Medias"
                  ) && (
                    <>

                      <Nav.Item
                        onClick={() =>
                          setDebtitem(!debtitem)
                        }
                      >
                        <Link
                          to="#"
                          className="nav-link"
                        >
                          Cobranzas

                          <Caret
                            open={
                              debtitem ||
                              searchActive
                            }
                          />
                        </Link>
                      </Nav.Item>


                      <Collapse
                        in={
                          debtitem ||
                          searchActive
                        }
                      >
                        <div className="ml-3 sb-sub">

                          <Link
                            to="/debts"
                            className={getLinkClassName(
                              "/debts"
                            )}
                            onClick={handleLinkClick}
                          >
                            Listar Cobranzas
                          </Link>

                        </div>
                      </Collapse>

                    </>
                  )}


                {/* =============================================
                    CUENTAS CORRIENTES
                    ============================================= */}

                {(can("gmedias:ctacte.registros") ||
                  can("gmedias:ctacte.view")) &&
                  matchesSearch(
                    "Cuentas Corrientes",
                    "Saldos",
                    "Gestión de Medias"
                  ) && (
                    <>

                      <Nav.Item
                        onClick={() =>
                          setCtacteitem(!ctacteitem)
                        }
                      >
                        <Link
                          to="#"
                          className="nav-link"
                        >
                          Cuentas Corrientes

                          <Caret
                            open={
                              ctacteitem ||
                              searchActive
                            }
                          />
                        </Link>
                      </Nav.Item>


                      <Collapse
                        in={
                          ctacteitem ||
                          searchActive
                        }
                      >
                        <div className="ml-3 sb-sub">

                          {/*
                          IMPORTANTE:
                          En el archivo fuente este link está
                          comentado. NO lo reactivamos.

                          {can("gmedias:ctacte.registros") && (
                            <Link
                              to="/accounts/new"
                              className={getLinkClassName(
                                "/accounts/new"
                              )}
                              onClick={handleLinkClick}
                            >
                              Registros
                            </Link>
                          )}
                          */}


                          {can("gmedias:ctacte.view") &&
                            matchesSearch(
                              "Saldos",
                              "Cuentas Corrientes"
                            ) && (
                              <Link
                                to="/accounts"
                                className={getLinkClassName(
                                  "/accounts"
                                )}
                                onClick={handleLinkClick}
                              >
                                Saldos
                              </Link>
                            )}

                        </div>
                      </Collapse>

                    </>
                  )}


                {/* =============================================
                    STOCK
                    ============================================= */}

                {(can("gmedias:stock.view") ||
                  can("gmedias:stock.central.view")) &&
                  matchesSearch(
                    "Stock",
                    "Stock Sucursales",
                    "Stock Central",
                    "Gestión de Medias"
                  ) && (
                    <>

                      <Nav.Item
                        onClick={() =>
                          setStockitem(!stockitem)
                        }
                      >
                        <Link
                          to="#"
                          className="nav-link"
                        >
                          Stock

                          <Caret
                            open={
                              stockitem ||
                              searchActive
                            }
                          />
                        </Link>
                      </Nav.Item>


                      <Collapse
                        in={
                          stockitem ||
                          searchActive
                        }
                      >
                        <div className="ml-3 sb-sub">

                          {can("gmedias:stock.view") &&
                            matchesSearch(
                              "Stock Sucursales",
                              "Stock"
                            ) && (
                              <Link
                                to="/stock"
                                className={getLinkClassName(
                                  "/stock"
                                )}
                                onClick={handleLinkClick}
                              >
                                Stock Sucursales
                              </Link>
                            )}


                          {can("gmedias:stock.central.view") &&
                            matchesSearch(
                              "Stock Central",
                              "Stock"
                            ) && (
                              <Link
                                to="/stock/central"
                                className={getLinkClassName(
                                  "/stock/central"
                                )}
                                onClick={handleLinkClick}
                              >
                                Stock Central
                              </Link>
                            )}

                        </div>
                      </Collapse>

                    </>
                  )}


                {/* =============================================
                    ORDENES
                    ============================================= */}

                {(can("gmedias:orden.create") ||
                  can("gmedias:orden.view") ||
                  can("gmedias:orden.import.excel")) &&
                  matchesSearch(
                    "Ordenes",
                    "Órdenes",
                    "Crear Orden",
                    "Listar Ordenes",
                    "Crear Orden Excel",
                    "Gestión de Medias"
                  ) && (
                    <>

                      <Nav.Item
                        onClick={() =>
                          setOrditem(!orditem)
                        }
                      >
                        <Link
                          to="#"
                          className="nav-link"
                        >
                          <span>Ordenes</span>

                          <Caret
                            open={
                              orditem ||
                              searchActive
                            }
                          />
                        </Link>
                      </Nav.Item>


                      <Collapse
                        in={
                          orditem ||
                          searchActive
                        }
                      >
                        <div className="ml-3 sb-sub">

                          {can("gmedias:orden.create") &&
                            matchesSearch(
                              "Crear Orden",
                              "Ordenes"
                            ) && (
                              <Link
                                to="/orders/new"
                                className={getLinkClassName(
                                  "/orders/new"
                                )}
                                onClick={handleLinkClick}
                              >
                                Crear Orden
                              </Link>
                            )}


                          {can("gmedias:orden.view") &&
                            matchesSearch(
                              "Listar Ordenes",
                              "Ordenes"
                            ) && (
                              <Link
                                to="/orders"
                                className={getLinkClassName(
                                  "/orders"
                                )}
                                onClick={handleLinkClick}
                              >
                                Listar Ordenes
                              </Link>
                            )}


                          {can("gmedias:orden.import.excel") &&
                            matchesSearch(
                              "Crear Orden Excel",
                              "Excel",
                              "Ordenes"
                            ) && (
                              <Link
                                to="/orders/productsfromexcel"
                                className={getLinkClassName(
                                  "/orders/productsfromexcel"
                                )}
                                onClick={handleLinkClick}
                              >
                                Crear Orden Excel
                              </Link>
                            )}

                        </div>
                      </Collapse>

                    </>
                  )}


                {/* =============================================
                    INGRESOS
                    ============================================= */}

                {(can("gmedias:ingreso.create") ||
                  can("gmedias:ingreso.view") ||
                  can("gmedias:ingreso.productos.view")) &&
                  matchesSearch(
                    "Ingresos",
                    "Crear Ingreso",
                    "Listar Ingresos",
                    "Productos",
                    "Gestión de Medias"
                  ) && (
                    <>

                      <Nav.Item
                        onClick={() =>
                          setReceiptitem(!receiptitem)
                        }
                      >
                        <Link
                          to="#"
                          className="nav-link"
                        >
                          Ingresos

                          <Caret
                            open={
                              receiptitem ||
                              searchActive
                            }
                          />
                        </Link>
                      </Nav.Item>


                      <Collapse
                        in={
                          receiptitem ||
                          searchActive
                        }
                      >
                        <div className="ml-3 sb-sub">

                          {can("gmedias:ingreso.create") &&
                            matchesSearch(
                              "Crear Ingreso",
                              "Ingresos"
                            ) && (
                              <Link
                                to="/receipts/new"
                                className={getLinkClassName(
                                  "/receipts/new"
                                )}
                                onClick={handleLinkClick}
                              >
                                Crear Ingreso
                              </Link>
                            )}


                          {can("gmedias:ingreso.view") &&
                            matchesSearch(
                              "Listar Ingresos",
                              "Ingresos"
                            ) && (
                              <Link
                                to="/receipts"
                                className={getLinkClassName(
                                  "/receipts"
                                )}
                                onClick={handleLinkClick}
                              >
                                Listar Ingresos
                              </Link>
                            )}


                          {can("gmedias:ingreso.productos.view") &&
                            matchesSearch(
                              "Productos",
                              "Ingresos"
                            ) && (
                              <Link
                                to="/receipts/products"
                                className={getLinkClassName(
                                  "/receipts/products"
                                )}
                                onClick={handleLinkClick}
                              >
                                Productos
                              </Link>
                            )}

                        </div>
                      </Collapse>

                    </>
                  )}

              </>
            )}



            {/* =================================================
                INFO SUCURSALES

                Se muestra cuando salimos del menú principal
                mediante toggleMainItems().
                ================================================= */}

            {!showMainItems &&
              !showGestionItems &&
              !showGestionOperativaItems &&
              !showConfigItems &&
              !showAuditoriaAtencionItems &&
              !showDocumentacionItems &&
              !showInspeccionesItems &&
              !showEvaluacionItems &&
              !showFidelizacionItems &&
              !showLegajosItems &&
              !showInteligenciaItems &&
              !showStaticsItems &&
              !showIVAItems &&
              !showAsistenciaItems &&
              !showCajaItems &&
              !showFacturacionItems &&
              !showSueldosItems &&
              !showConciliacionItems && (
                <>

                  <div className="sb-section-title">
                    <BsBuildings className="sb-section-title-icon" />
                    <span>Info Sucursales</span>
                  </div>


                  {/* ===========================================
                      VENTAS RINDE
                      =========================================== */}

                  <Nav.Item
                    onClick={() =>
                      setSellRinde(!sellRinde)
                    }
                  >
                    <Link
                      to="#"
                      className="nav-link"
                    >
                      Ventas Rinde

                      <Caret
                        open={
                          sellRinde ||
                          searchActive
                        }
                      />
                    </Link>
                  </Nav.Item>


                  <Collapse
                    in={
                      sellRinde ||
                      searchActive
                    }
                  >
                    <div className="ml-3 sb-sub">


                      {can("stats:sales.comparative.view") &&
                        matchesSearch(
                          "Ventas Comparativo",
                          "Ventas Rinde"
                        ) && (
                          <Link
                            to="/sells/totalcomparativo"
                            className={getLinkClassName(
                              "/sells/totalcomparativo"
                            )}
                            onClick={handleLinkClick}
                          >
                            Ventas Comparativo
                          </Link>
                        )}


                      {can("stats:sales.total.view") &&
                        matchesSearch(
                          "Ventas Totales",
                          "Ventas Rinde"
                        ) && (
                          <Link
                            to="/sells/total"
                            className={getLinkClassName(
                              "/sells/total"
                            )}
                            onClick={handleLinkClick}
                          >
                            Ventas Totales
                          </Link>
                        )}


                      {can("stats:sales.byCustomer.view") &&
                        matchesSearch(
                          "Ventas por Cliente",
                          "Ventas Rinde"
                        ) && (
                          <Link
                            to="/sells/customers"
                            className={getLinkClassName(
                              "/sells/customers"
                            )}
                            onClick={handleLinkClick}
                          >
                            Ventas por Cliente
                          </Link>
                        )}


                      {can("stats:sales.deleted.view") &&
                        matchesSearch(
                          "Ventas Anuladas",
                          "Ventas Rinde"
                        ) && (
                          <Link
                            to="/sells/deleted"
                            className={getLinkClassName(
                              "/sells/deleted"
                            )}
                            onClick={handleLinkClick}
                          >
                            Ventas Anuladas
                          </Link>
                        )}


                      {can("stats:sales.discount.view") &&
                        matchesSearch(
                          "Ventas con Dcto",
                          "Ventas Rinde"
                        ) && (
                          <Link
                            to="/sells/discount"
                            className={getLinkClassName(
                              "/sells/discount"
                            )}
                            onClick={handleLinkClick}
                          >
                            Ventas con Dcto
                          </Link>
                        )}


                      {can("stats:sales.byArticle.view") &&
                        matchesSearch(
                          "Ventas por Art",
                          "Ventas Rinde"
                        ) && (
                          <Link
                            to="/sells/articles"
                            className={getLinkClassName(
                              "/sells/articles"
                            )}
                            onClick={handleLinkClick}
                          >
                            Ventas por Art
                          </Link>
                        )}


                      {can("stats:sales.byUser.view") &&
                        matchesSearch(
                          "Ventas por Usuario",
                          "Ventas Rinde"
                        ) && (
                          <Link
                            to="/sells/user"
                            className={getLinkClassName(
                              "/sells/user"
                            )}
                            onClick={handleLinkClick}
                          >
                            Ventas por Usuario
                          </Link>
                        )}


                      {can("stats:sales.kgByBranch.view") &&
                        matchesSearch(
                          "Kg por Sucursal",
                          "Ventas Rinde"
                        ) && (
                          <Link
                            to="/sells/kg_branch"
                            className={getLinkClassName(
                              "/sells/kg_branch"
                            )}
                            onClick={handleLinkClick}
                          >
                            Kg por Sucursal
                          </Link>
                        )}


                      {can("stats:sales.ticketCount.view") &&
                        matchesSearch(
                          "Cantidad Tickets",
                          "Ventas Rinde"
                        ) && (
                          <Link
                            to="/sells/quantity"
                            className={getLinkClassName(
                              "/sells/quantity"
                            )}
                            onClick={handleLinkClick}
                          >
                            Cantidad Tickets
                          </Link>
                        )}

                    </div>
                  </Collapse>


                  {/* ===========================================
                      INFO DE CAJA
                      =========================================== */}

                  <Nav.Item
                    onClick={() =>
                      setInfoCaja(!infoCaja)
                    }
                  >
                    <Link
                      to="#"
                      className="nav-link"
                    >
                      Info de Caja

                      <Caret
                        open={
                          infoCaja ||
                          searchActive
                        }
                      />
                    </Link>
                  </Nav.Item>


                  <Collapse
                    in={
                      infoCaja ||
                      searchActive
                    }
                  >
                    <div className="ml-3 sb-sub">


                      {can("tesoreria:info.cajas.view") &&
                        matchesSearch("Cajas", "Info de Caja") && (
                          <Link
                            to="/info/register"
                            className={getLinkClassName("/info/register")}
                            onClick={handleLinkClick}
                          >
                            Cajas
                          </Link>
                        )}


                      {can("tesoreria:info.gastos.view") &&
                        matchesSearch("Gastos", "Info de Caja") && (
                          <Link
                            to="/info/expenses"
                            className={getLinkClassName("/info/expenses")}
                            onClick={handleLinkClick}
                          >
                            Gastos
                          </Link>
                        )}


                      {can("tesoreria:info.retiros.view") &&
                        matchesSearch("Retiros", "Info de Caja") && (
                          <Link
                            to="/info/withdrawals"
                            className={getLinkClassName("/info/withdrawals")}
                            onClick={handleLinkClick}
                          >
                            Retiros
                          </Link>
                        )}


                      {can("tesoreria:info.vales.view") &&
                        matchesSearch("Vales", "Info de Caja") && (
                          <Link
                            to="/info/vouchers"
                            className={getLinkClassName("/info/vouchers")}
                            onClick={handleLinkClick}
                          >
                            Vales
                          </Link>
                        )}


                      {can("tesoreria:info.cupones.view") &&
                        matchesSearch("Cupones", "Info de Caja") && (
                          <Link
                            to="/info/creditcard"
                            className={getLinkClassName("/info/creditcard")}
                            onClick={handleLinkClick}
                          >
                            Cupones
                          </Link>
                        )}


                      {can("tesoreria:info.sueldos.view") &&
                        matchesSearch("Sueldos", "Info de Caja") && (
                          <Link
                            to="/info/salaries"
                            className={getLinkClassName("/info/salaries")}
                            onClick={handleLinkClick}
                          >
                            Sueldos
                          </Link>
                        )}


                      {can("tesoreria:info.ingresos.view") &&
                        matchesSearch("Ingresos", "Info de Caja") && (
                          <Link
                            to="/info/incomes"
                            className={getLinkClassName("/info/incomes")}
                            onClick={handleLinkClick}
                          >
                            Ingresos
                          </Link>
                        )}


                      {can("tesoreria:info.cierresZ.view") &&
                        matchesSearch("Cierres Z", "Info de Caja") && (
                          <Link
                            to="/info/cierrez"
                            className={getLinkClassName("/info/cierrez")}
                            onClick={handleLinkClick}
                          >
                            Cierres Z
                          </Link>
                        )}


                      {can("tesoreria:info.ctacte.cliente.view") &&
                        matchesSearch("Cta Cte Cliente", "Info de Caja") && (
                          <Link
                            to="/info/balanceaccount"
                            className={getLinkClassName("/info/balanceaccount")}
                            onClick={handleLinkClick}
                          >
                            Cta. Cte. Cliente
                          </Link>
                        )}


                      {can("tesoreria:info.ctacte.sucursal.view") &&
                        matchesSearch("Ctas Ctes Suc", "Info de Caja") && (
                          <Link
                            to="/info/balanceaccountbranch"
                            className={getLinkClassName(
                              "/info/balanceaccountbranch"
                            )}
                            onClick={handleLinkClick}
                          >
                            Ctas. Ctes. Suc.
                          </Link>
                        )}


                      {can("tesoreria:info.ctacte.detalle.view") &&
                        matchesSearch("Detalle Cta Cte", "Info de Caja") && (
                          <Link
                            to="/info/balanceaccountdetail"
                            className={getLinkClassName(
                              "/info/balanceaccountdetail"
                            )}
                            onClick={handleLinkClick}
                          >
                            Detalle Cta. Cte.
                          </Link>
                        )}


                      {can("tesoreria:info.caja.detalle.view") &&
                        matchesSearch("Detalle de Caja", "Info de Caja") && (
                          <Link
                            to="/info/detail"
                            className={getLinkClassName("/info/detail")}
                            onClick={handleLinkClick}
                          >
                            Detalle de Caja
                          </Link>
                        )}

                    </div>
                  </Collapse>


                  {/* ===========================================
                      INFO DE RINDE
                      =========================================== */}

                  <Nav.Item
                    onClick={() =>
                      setInfoRinde(!infoRinde)
                    }
                  >
                    <Link
                      to="#"
                      className="nav-link"
                    >
                      Info de Rinde

                      <Caret
                        open={
                          infoRinde ||
                          searchActive
                        }
                      />
                    </Link>
                  </Nav.Item>


                  <Collapse
                    in={
                      infoRinde ||
                      searchActive
                    }
                  >
                    <div className="ml-3 sb-sub">


                      {can("rinde:formula.view") &&
                        matchesSearch("Formulas", "Info de Rinde") && (
                          <Link
                            to="/formulas"
                            className={getLinkClassName("/formulas")}
                            onClick={handleLinkClick}
                          >
                            Formulas
                          </Link>
                        )}


                      {can("rinde:formula.create") &&
                        matchesSearch("Crear Formulas", "Info de Rinde") && (
                          <Link
                            to="/formulas/create"
                            className={getLinkClassName("/formulas/create")}
                            onClick={handleLinkClick}
                          >
                            Crear Formulas
                          </Link>
                        )}


                      {can("rinde:percent.view") &&
                        matchesSearch("Porcentajes", "Info de Rinde") && (
                          <Link
                            to="/percent"
                            className={getLinkClassName("/percent")}
                            onClick={handleLinkClick}
                          >
                            Porcentajes
                          </Link>
                        )}


                      {can("rinde:percent.update") &&
                        matchesSearch("Actualizar %", "Info de Rinde") && (
                          <Link
                            to="/percent_update"
                            className={getLinkClassName("/percent_update")}
                            onClick={handleLinkClick}
                          >
                            Actualizar %
                          </Link>
                        )}


                      {can("rinde:prices.view") &&
                        matchesSearch("Precios", "Info de Rinde") && (
                          <Link
                            to="/prices"
                            className={getLinkClassName("/prices")}
                            onClick={handleLinkClick}
                          >
                            Precios
                          </Link>
                        )}


                      {can("rinde:prices.update") &&
                        matchesSearch(
                          "Actualizar Precios",
                          "Info de Rinde"
                        ) && (
                          <Link
                            to="/prices_update"
                            className={getLinkClassName("/prices_update")}
                            onClick={handleLinkClick}
                          >
                            Actualizar Precios
                          </Link>
                        )}


                      {can("inventario:inventarios.view") &&
                        matchesSearch("Inventarios", "Info de Rinde") && (
                          <Link
                            to="/inventory/inventories"
                            className={getLinkClassName(
                              "/inventory/inventories"
                            )}
                            onClick={handleLinkClick}
                          >
                            Inventarios
                          </Link>
                        )}


                      {can("inventario:inventarios.create") &&
                        matchesSearch(
                          "Crear Inventario",
                          "Info de Rinde"
                        ) && (
                          <Link
                            to="/inventory/create"
                            className={getLinkClassName(
                              "/inventory/create"
                            )}
                            onClick={handleLinkClick}
                          >
                            Crear Inventario
                          </Link>
                        )}


                      {can("inventario:movimientosInternos.view") &&
                        matchesSearch(
                          "Mov Internos",
                          "Movimientos Internos",
                          "Info de Rinde"
                        ) && (
                          <Link
                            to="/inventory/movements"
                            className={getLinkClassName(
                              "/inventory/movements"
                            )}
                            onClick={handleLinkClick}
                          >
                            Mov. Internos
                          </Link>
                        )}


                      {can("inventario:movimientosOtros.view") &&
                        matchesSearch(
                          "Fabrica y Ach",
                          "Info de Rinde"
                        ) && (
                          <Link
                            to="/inventory/movementsotherslist"
                            className={getLinkClassName(
                              "/inventory/movementsotherslist"
                            )}
                            onClick={handleLinkClick}
                          >
                            Fabrica y Ach
                          </Link>
                        )}


                      {can("inventario:movimientosOtros.create") &&
                        matchesSearch(
                          "Crear Fabrica y Ach",
                          "Info de Rinde"
                        ) && (
                          <Link
                            to="/inventory/movementsothers"
                            className={getLinkClassName(
                              "/inventory/movementsothers"
                            )}
                            onClick={handleLinkClick}
                          >
                            Crear Fabrica y Ach
                          </Link>
                        )}


                      {can("rinde:calculo.run") &&
                        matchesSearch(
                          "Calculo Rinde",
                          "Cálculo Rinde",
                          "Info de Rinde"
                        ) && (
                          <Link
                            to="/inventory/performance"
                            className={getLinkClassName(
                              "/inventory/performance"
                            )}
                            onClick={handleLinkClick}
                          >
                            Calculo Rinde
                          </Link>
                        )}


                      {can("rinde:list.view") &&
                        matchesSearch("Rendimientos", "Info de Rinde") && (
                          <Link
                            to="/inventory/performancelist"
                            className={getLinkClassName(
                              "/inventory/performancelist"
                            )}
                            onClick={handleLinkClick}
                          >
                            Rendimientos
                          </Link>
                        )}


                      {can("rinde:list.comparative.view") &&
                        matchesSearch(
                          "Rendimientos Comparativos",
                          "Info de Rinde"
                        ) && (
                          <Link
                            to="/inventory/performancelistcomparative"
                            className={getLinkClassName(
                              "/inventory/performancelistcomparative"
                            )}
                            onClick={handleLinkClick}
                          >
                            Rendimientos Comparativos
                          </Link>
                        )}


                      {can("rindeGeneral:calculo.run") &&
                        matchesSearch(
                          "Calculo Rinde Consolidado",
                          "Info de Rinde"
                        ) && (
                          <Link
                            to="/inventory/performancegeneral/"
                            className={getLinkClassName(
                              "/inventory/performancegeneral/"
                            )}
                            onClick={handleLinkClick}
                          >
                            Calculo Rinde Consolidado
                          </Link>
                        )}


                      {can("rindeGeneral:list.view") &&
                        matchesSearch(
                          "Rendimientos Consolidados",
                          "Info de Rinde"
                        ) && (
                          <Link
                            to="/inventory/performancegenerallist/"
                            className={getLinkClassName(
                              "/inventory/performancegenerallist/"
                            )}
                            onClick={handleLinkClick}
                          >
                            Rendimientos Consolidados
                          </Link>
                        )}


                      {can("rindeGeneral:list.global.view") &&
                        matchesSearch(
                          "Rendimientos Gral",
                          "Info de Rinde"
                        ) && (
                          <Link
                            to="/inventory/performancelistgral"
                            className={getLinkClassName(
                              "/inventory/performancelistgral"
                            )}
                            onClick={handleLinkClick}
                          >
                            Rendimientos Gral
                          </Link>
                        )}


                      {can("inventario:stock.control.view") &&
                        matchesSearch(
                          "Control Stock",
                          "Info de Rinde"
                        ) && (
                          <Link
                            to="/inventory/stock"
                            className={getLinkClassName(
                              "/inventory/stock"
                            )}
                            onClick={handleLinkClick}
                          >
                            Control Stock
                          </Link>
                        )}

                    </div>
                  </Collapse>


                  {/* ===========================================
                      REVISIÓN MOVIMIENTOS
                      =========================================== */}

                  {(can("inventario:movimientosInternos.view") ||
                    can("inventario:movimientosOtros.view")) &&
                    matchesSearch(
                      "Revisión Movimientos",
                      "Revision Movimientos",
                      "Movimientos Internos",
                      "Fabrica",
                      "Produccion",
                      "Stock Fabrica",
                      "Transferencias",
                      "Nueva Transferencia"
                    ) && (
                      <>

                        <Nav.Item
                          onClick={() =>
                            setMovimientosOtros(
                              !movimientosOtros
                            )
                          }
                        >
                          <Link
                            to="#"
                            className="nav-link"
                          >
                            Revisión Movimientos

                            <Caret
                              open={
                                movimientosOtros ||
                                searchActive
                              }
                            />
                          </Link>
                        </Nav.Item>


                        <Collapse
                          in={
                            movimientosOtros ||
                            searchActive
                          }
                        >
                          <div className="ml-3 sb-sub">


                            {can("inventario:movimientosInternos.view") &&
                              matchesSearch(
                                "Mov Internos",
                                "Revisión Movimientos"
                              ) && (
                                <Link
                                  to="/inventory/movements"
                                  className={getLinkClassName(
                                    "/inventory/movements"
                                  )}
                                  onClick={handleLinkClick}
                                >
                                  Mov. Internos
                                </Link>
                              )}


                            {can("inventario:movimientosOtros.view") &&
                              matchesSearch(
                                "Fabrica y Ach",
                                "Revisión Movimientos"
                              ) && (
                                <Link
                                  to="/inventory/movementsotherslist"
                                  className={getLinkClassName(
                                    "/inventory/movementsotherslist"
                                  )}
                                  onClick={handleLinkClick}
                                >
                                  Fabrica y Ach
                                </Link>
                              )}


                            {can("inventario:movimientosOtros.view") &&
                              matchesSearch(
                                "Produccion",
                                "Producción",
                                "Fabrica",
                                "Revisión Movimientos"
                              ) && (
                                <Link
                                  to="/fabrica/produccion-lotes"
                                  className={getLinkClassName(
                                    "/fabrica/produccion-lotes"
                                  )}
                                  onClick={handleLinkClick}
                                >
                                  Produccion
                                </Link>
                              )}


                            {can("inventario:movimientosOtros.view") &&
                              matchesSearch(
                                "Stock Fabrica",
                                "Stock Fábrica",
                                "Revisión Movimientos"
                              ) && (
                                <Link
                                  to="/fabrica/stock"
                                  className={getLinkClassName(
                                    "/fabrica/stock"
                                  )}
                                  onClick={handleLinkClick}
                                >
                                  Stock Fabrica
                                </Link>
                              )}


                            {can("inventario:movimientosOtros.view") &&
                              matchesSearch(
                                "Transferencias",
                                "Fabrica",
                                "Revisión Movimientos"
                              ) && (
                                <Link
                                  to="/fabrica/transferencias"
                                  className={getLinkClassName(
                                    "/fabrica/transferencias"
                                  )}
                                  onClick={handleLinkClick}
                                >
                                  Transferencias
                                </Link>
                              )}


                            {can("inventario:movimientosOtros.view") &&
                              matchesSearch(
                                "Nueva Transferencia",
                                "Transferir",
                                "Fabrica",
                                "Revisión Movimientos"
                              ) && (
                                <Link
                                  to="/fabrica/transferir"
                                  className={getLinkClassName(
                                    "/fabrica/transferir"
                                  )}
                                  onClick={handleLinkClick}
                                >
                                  Nueva Transferencia
                                </Link>
                              )}

                          </div>
                        </Collapse>

                      </>
                    )}

                </>
              )}

          </>
        )}


      </div>


      {/* =================================================
          FOOTER
          ================================================= */}

      <div className="sb-footer">

        <button
          className="nav-link"
          style={{ color: "white", whiteSpace: "nowrap", background: "none", border: "none", padding: 0, cursor: "pointer" }}
          onClick={handleLogout}
        >
          CERRAR SESIÓN
        </button>

      </div>

    </Nav>
  );
};


export default SideBar;