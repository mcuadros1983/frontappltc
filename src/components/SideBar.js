// src/components/SideBar.js
import { useContext, useState } from "react";
import { useSecurity } from "../security/SecurityContext";
import { Nav } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Collapse from "react-bootstrap/Collapse";
import Contexts from "../context/Contexts";
import "../styles/SideBar.css";

// Icons
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
  FiSearch,
  FiX
} from "react-icons/fi";

import { TbReceiptTax } from "react-icons/tb";
import { LuWallet } from "react-icons/lu";
import { MdPointOfSale } from "react-icons/md";
import { BsBuildings } from "react-icons/bs";


const Caret = ({ open }) => (
  <span className="sb-caret">
    {open ? <FiChevronDown /> : <FiChevronRight />}
  </span>
);


const SideBar = ({ toggleSidebar, isMobile }) => {

  const [showMainItems, setShowMainItems] = useState(true);
  const [showReturnButton, setShowReturnButton] = useState(false);

  const [useritem, setUseritem] = useState(false);
  const [bankitem, setBankitem] = useState(false);
  const [categoriaanimalitem, setCategoriaanimalitem] = useState(false);
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

  const [maintenanceItem, setMaintenanceItem] = useState(false);
  const [customerOneShotItem, setCustomerOneShotItem] = useState(false);
  const [movimientosOtros, setMovimientosOtros] = useState(false);
  const [sellStatics, setSellStatics] = useState(false);

  const [showGestionItems, setShowGestionItems] = useState(false);
  const [showGestionOperativaItems, setShowGestionOperativaItems] = useState(false);
  const [showConfigItems, setShowConfigItems] = useState(false);
  const [showAuditoriaAtencionItems, setShowAuditoriaAtencionItems] = useState(false);
  const [showDocumentacionItems, setShowDocumentacionItems] = useState(false);
  const [showInspeccionesItems, setShowInspeccionesItems] = useState(false);
  const [showEvaluacionItems, setShowEvaluacionItems] = useState(false);

  const [tarjetacomunitem, setTarjetacomunitem] = useState(false);
  const [planPagoTarjetaItem, setPlanPagoTarjetaItem] = useState(false);
  const [empresaitem, setEmpresaitem] = useState(false);
  const [formapagoitem, setFormapagoitem] = useState(false);
  const [frigorificoitem, setFrigorificoitem] = useState(false);
  const [imputacionitem, setImputacionitem] = useState(false);
  const [marcatarjetaitem, setMarcatarjetaitem] = useState(false);
  const [tipotarjetaitem, setTipotarjetaitem] = useState(false);
  const [tipocomprobanteitem, setTipocomprobanteitem] = useState(false);
  const [ptoventaitem, setPtoventaitem] = useState(false);
  const [proveedoritem, setProveedoritem] = useState(false);
  const [proyectoitem, setProyectoitem] = useState(false);

  const [showConciliacionItems, setShowConciliacionItems] = useState(false);
  const [rubroItem, setRubroItem] = useState(false);
  const [cuentaItem, setCuentaItem] = useState(false);
  const [criterioItem, setCriterioItem] = useState(false);

  const [libroIvaItem, setLibroIvaItem] = useState(false);

  const [cajaItem, setCajaItem] = useState(false);
  const [movCajaItem, setMovCajaItem] = useState(false);
  const [movBancoItem, setMovBancoItem] = useState(false);
  const [movTarjetaItem, setMovTarjetaItem] = useState(false);
  const [registroChequeItem, setRegistroChequeItem] = useState(false);
  const [registroAjusteItem, setRegistroAjusteItem] = useState(false);

  const [showStaticsItems, setShowStaticsItems] = useState(false);
  const [showIVAItems, setShowIVAItems] = useState(false);
  const [showAsistenciaItems, setShowAsistenciaItems] = useState(false);
  const [showCajaItems, setShowCajaItems] = useState(false);
  const [showFacturacionItems, setShowFacturacionItems] = useState(false);

  const [categoriaTesoreriaItem, setCategoriaTesoreriaItem] = useState(false);
  const [ventasFacturacionItem, setVentasFacturacionItem] = useState(false);
  const [comprasFacturacionItem, setComprasFacturacionItem] = useState(false);

  const [showSueldosItems, setShowSueldosItems] = useState(false);
  const [pagoSueldosItem, setPagoSueldosItem] = useState(false);
  const [gastosEstimadosItem, setGastosEstimadosItem] = useState(false);

  // presentes en tu código original
  const [messageItem, setMessageItem] = useState(false);
  const [scheduleItem, setScheduleItem] = useState(false);

  const [showFidelizacionItems, setShowFidelizacionItems] = useState(false);
  const [showLegajosItems, setShowLegajosItems] = useState(false);
  const [showInteligenciaItems, setShowInteligenciaItems] = useState(false);


  // =========================================================
  // NUEVO: BUSCADOR DEL SIDEBAR
  // =========================================================

  const [menuSearch, setMenuSearch] = useState("");


  const context = useContext(Contexts.UserContext);

  const { can, loading } = useSecurity();
  const { setUser: setSecUser } = useSecurity();

  const navigate = useNavigate();


  // =========================================================
  // NUEVO: RUTA ACTUAL
  // =========================================================

  const location = useLocation();


  // =========================================================
  // NUEVO: NORMALIZAR TEXTO PARA EL BUSCADOR
  //
  // Permite que:
  // "prestamo" encuentre "Préstamos"
  // "tesoreria" encuentre "Tesorería"
  // =========================================================

  const normalizeSearchText = (value = "") =>
    String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();


  const normalizedMenuSearch = normalizeSearchText(menuSearch);

  const searchActive = normalizedMenuSearch.length > 0;


  // =========================================================
  // NUEVO: SABER SI UN TEXTO COINCIDE CON LA BÚSQUEDA
  // =========================================================

  const matchesSearch = (...values) => {

    if (!searchActive) {
      return true;
    }

    const text = values
      .map((value) => normalizeSearchText(value))
      .join(" ");

    return text.includes(normalizedMenuSearch);
  };


  // =========================================================
  // NUEVO: SABER SI UNA RUTA ES LA RUTA ACTUAL
  // =========================================================

  const isActiveRoute = (route) => {

    if (!route || route === "#") {
      return false;
    }

    const current =
      location.pathname.replace(/\/+$/, "") || "/";

    const target =
      String(route).replace(/\/+$/, "") || "/";

    return current === target;
  };


  // =========================================================
  // NUEVO: CLASE PARA LINKS
  //
  // Ejemplo:
  //
  // className={getLinkClassName("/agenda", "sb-top")}
  //
  // Si estamos en /agenda agregará:
  //
  // sb-current-route
  // =========================================================

  const getLinkClassName = (route, extraClass = "") => {

    return [
      "nav-link",
      extraClass,
      isActiveRoute(route) ? "sb-current-route" : ""
    ]
      .filter(Boolean)
      .join(" ");
  };


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


  if (loading) return null;


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


  return (

    <Nav
      defaultActiveKey="/"
      className="flex-column sidebar sb-root"
    >

      {/* =====================================================
          HEADER ORIGINAL
          ===================================================== */}

      <div className="sb-header">

        <div className="sb-brand">

          <span className="sb-brand-icon">
            <BsBuildings />
          </span>

          <span className="sb-brand-text">
            La Tradición
          </span>

        </div>


        {/* ===================================================
            NUEVO: BUSCADOR
            =================================================== */}

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

      </div>


      <div className="sb-body">

        {/* ===================================================
            INICIO
            =================================================== */}

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


        {/* ===================================================
            A PARTIR DE AQUÍ CONTINÚA LA PARTE 2
            HOME: BLOQUE PRINCIPAL ORIGINAL
            =================================================== */}

        {/* ===== HOME: BLOQUE PRINCIPAL (sin restricciones por rol) ===== */}
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

              {/* CONFIGURACIÓN */}
              {can("config:view") &&
                matchesSearch(
                  "Configuración",
                  "Usuarios",
                  "Bancos",
                  "Categorias Animales",
                  "Tarjetas Deb Cred",
                  "Planes de Tarjetas",
                  "Empresas",
                  "Formas de Pago",
                  "Frigoríficos",
                  "Imputación contable",
                  "Marca de Tarjetas",
                  "Tipos de Tarjeta",
                  "Tipos de Comprobantes",
                  "Puntos de Venta",
                  "Proveedores",
                  "Proyectos",
                  "Periodos",
                  "Sincronizar",
                  "Registros",
                  "Centro de Notificaciones",
                  "Scheduler"
                ) && (
                  <Nav.Item
                    onClick={() => {
                      setShowMainItems(false);
                      setShowConfigItems(true);
                      setShowReturnButton(true);
                    }}
                    className="sb-top"
                  >
                    <Link to="#" className="nav-link">
                      <FiSettings className="sb-ico" />
                      <span>Configuración</span>
                      <FiChevronsRight className="sb-right" />
                    </Link>
                  </Nav.Item>
                )}


              {/* COMERCIOS AMIGOS */}
              {can("fidelizacion:view") &&
                matchesSearch(
                  "Comercios Amigos",
                  "Fidelización",
                  "Dashboard",
                  "Comercios Asociados",
                  "Campañas",
                  "Premios Clientes",
                  "Cupones",
                  "Canjes",
                  "Clientes Registrados",
                  "Validar Cupón",
                  "Puntos Comercio",
                  "Premios Comercios",
                  "Canjes Comercios",
                  "Alertas Fraude"
                ) && (
                  <Nav.Item
                    onClick={() => {
                      setShowMainItems(false);
                      setShowFidelizacionItems(true);
                      setShowReturnButton(true);
                    }}
                    className="sb-top"
                  >
                    <Link to="#" className="nav-link">
                      <FiGift className="sb-ico" />
                      <span>Comercios Amigos</span>
                      <FiChevronsRight className="sb-right" />
                    </Link>
                  </Nav.Item>
                )}


              {/* LEGAJOS */}
              {can("legajos:view") &&
                matchesSearch(
                  "Legajos",
                  "Conceptos",
                  "Registros",
                  "Gestión Empleados",
                  "Gestión Empresas",
                  "Gestión Sucursales"
                ) && (
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

                      <span>Legajos</span>

                      <FiChevronsRight className="sb-right" />
                    </Link>
                  </Nav.Item>
                )}


              {/* AGENDA */}
              {can("agenda:view") &&
                matchesSearch(
                  "Agenda",
                  "Calendario"
                ) && (
                  <Link
                    to="/agenda"
                    className={getLinkClassName(
                      "/agenda",
                      "sb-top"
                    )}
                    onClick={handleLinkClick}
                  >
                    <FiCalendar className="sb-ico" />
                    <span>Agenda</span>
                  </Link>
                )}


              {/* PERMISOS */}
              {can("permisos:view") &&
                matchesSearch(
                  "Permisos"
                ) && (
                  <Link
                    to="/permisos"
                    className={getLinkClassName(
                      "/permisos",
                      "sb-top"
                    )}
                    onClick={handleLinkClick}
                  >
                    <FiShield className="sb-ico" />
                    <span>Permisos</span>
                  </Link>
                )}


              {/* BOT WHATSAPP */}
              {can("doc:view") &&
                matchesSearch(
                  "Bot WhatsApp",
                  "WhatsApp",
                  "Promociones",
                  "Productos IA",
                  "Conversaciones",
                  "Sucursales IA",
                  "Beneficios",
                  "Eventos"
                ) && (
                  <Nav.Item
                    onClick={() => {
                      setShowMainItems(false);
                      setShowAuditoriaAtencionItems(true);
                      setShowReturnButton(true);
                    }}
                    className="sb-top"
                  >
                    <Link to="#" className="nav-link">
                      <FiMessageCircle className="sb-ico" />
                      <span>Bot WhatsApp</span>
                      <FiChevronsRight className="sb-right" />
                    </Link>
                  </Nav.Item>
                )}


              {/* DOCUMENTACIÓN */}
              {can("doc:view") &&
                matchesSearch(
                  "Documentación",
                  "Documentos",
                  "Crear Documentos",
                  "Categorias",
                  "Subcategorias"
                ) && (
                  <Nav.Item
                    onClick={() => {
                      setShowMainItems(false);
                      setShowDocumentacionItems(true);
                      setShowReturnButton(true);
                    }}
                    className="sb-top"
                  >
                    <Link to="#" className="nav-link">
                      <FiBookOpen className="sb-ico" />
                      <span>Documentación</span>
                      <FiChevronsRight className="sb-right" />
                    </Link>
                  </Nav.Item>
                )}


              {/* INSPECCIONES */}
              {(
                can("inspecciones:view") ||
                can("inspecciones:create") ||
                can("inspecciones:admin") ||
                can("inspecciones:reportes")
              ) &&
                matchesSearch(
                  "Inspecciones",
                  "Nueva Inspección",
                  "Plantillas",
                  "Notificaciones",
                  "Reportes"
                ) && (
                  <Nav.Item
                    onClick={() => {
                      setShowMainItems(false);
                      setShowInspeccionesItems(true);
                      setShowReturnButton(true);
                    }}
                    className="sb-top"
                  >
                    <Link to="#" className="nav-link">
                      <FiShield className="sb-ico" />
                      <span>Inspecciones</span>
                      <FiChevronsRight className="sb-right" />
                    </Link>
                  </Nav.Item>
                )}


              {/* EVALUACIÓN */}
              {can("evaluacion:view") &&
                matchesSearch(
                  "Evaluación",
                  "Evaluaciones",
                  "Metas",
                  "Mystery",
                  "Supervisores"
                ) && (
                  <Nav.Item
                    onClick={() => {
                      setShowMainItems(false);
                      setShowEvaluacionItems(true);
                      setShowReturnButton(true);
                    }}
                    className="sb-top"
                  >
                    <Link to="#" className="nav-link">
                      <FiBarChart2 className="sb-ico" />
                      <span>Evaluación</span>
                      <FiChevronsRight className="sb-right" />
                    </Link>
                  </Nav.Item>
                )}


              {/* ESTADÍSTICAS */}
              {can("statics:view") &&
                matchesSearch(
                  "Estadísticas",
                  "Precios Históricos",
                  "Ventas Comparativo",
                  "Ventas entre Rangos",
                  "Gráfico Comparativo",
                  "Ventas Totales",
                  "Ventas por Cliente",
                  "Ventas Anuladas",
                  "Ventas con Dcto",
                  "Ventas por Art",
                  "Ventas por Usuario",
                  "Kg por Sucursal",
                  "Cantidad Tickets",
                  "Stock"
                ) && (
                  <Nav.Item
                    onClick={() => {
                      setShowMainItems(false);
                      setShowStaticsItems(true);
                      setShowReturnButton(true);
                    }}
                    className="sb-top"
                  >
                    <Link to="#" className="nav-link">
                      <FiBarChart2 className="sb-ico" />
                      <span>Estadísticas</span>
                      <FiChevronsRight className="sb-right" />
                    </Link>
                  </Nav.Item>
                )}


              {/* INTELIGENCIA COMERCIAL */}
              {matchesSearch(
                "Inteligencia Comercial",
                "Dashboard",
                "Eventos",
                "Snapshots",
                "Clima"
              ) && (
                  <Nav.Item
                    onClick={() => {
                      setShowMainItems(false);
                      setShowInteligenciaItems(true);
                      setShowReturnButton(true);
                    }}
                    className="sb-top"
                  >
                    <Link to="#" className="nav-link">
                      <FiBarChart2 className="sb-ico" />
                      <span>Inteligencia Comercial</span>
                      <FiChevronsRight className="sb-right" />
                    </Link>
                  </Nav.Item>
                )}


              {/* IVA */}
              {can("iva:view") &&
                matchesSearch(
                  "IVA",
                  "Libro IVA",
                  "Compras Proyectadas",
                  "Proyección IVA"
                ) && (
                  <Nav.Item
                    onClick={() => {
                      setShowMainItems(false);
                      setShowIVAItems(true);
                      setShowReturnButton(true);
                    }}
                    className="sb-top"
                  >
                    <Link to="#" className="nav-link">
                      <TbReceiptTax className="sb-ico" />
                      <span>IVA</span>
                      <FiChevronsRight className="sb-right" />
                    </Link>
                  </Nav.Item>
                )}


              {/* RRHH */}
              {can("rrhh:view") &&
                matchesSearch(
                  "RRHH",
                  "Recursos Humanos",
                  "Empleados",
                  "Asistencia",
                  "Horarios",
                  "Jornadas",
                  "Vacaciones"
                ) && (
                  <Nav.Item
                    onClick={() => {
                      setShowMainItems(false);
                      setShowAsistenciaItems(true);
                      setShowReturnButton(true);
                    }}
                    className="sb-top"
                  >
                    <Link to="#" className="nav-link">
                      <FiUsers className="sb-ico" />
                      <span>RRHH</span>
                      <FiChevronsRight className="sb-right" />
                    </Link>
                  </Nav.Item>
                )}


              {/* TESORERÍA */}
              {can("tesoreria:view") &&
                matchesSearch(
                  "Tesorería",
                  "Caja",
                  "Bancos",
                  "Movimientos Bancarios",
                  "Tarjetas",
                  "Cheques",
                  "eCheq",
                  "Categorías",
                  "Gastos Estimados",
                  "Retiros Sucursales"
                ) && (
                  <Nav.Item
                    onClick={() => {
                      setShowMainItems(false);
                      setShowCajaItems(true);
                      setShowReturnButton(true);
                    }}
                    className="sb-top"
                  >
                    <Link to="#" className="nav-link">
                      <LuWallet className="sb-ico" />
                      <span>Tesorería</span>
                      <FiChevronsRight className="sb-right" />
                    </Link>
                  </Nav.Item>
                )}


              {/* CONCILIACIÓN TARJETAS
                  Se mantiene comentado exactamente como en el original. */}
              {/*
              <Nav.Item
                onClick={() => {
                  setShowMainItems(false);
                  setShowConciliacionItems(true);
                  setShowReturnButton(true);
                }}
                className="sb-top"
              >
                <Link to="#" className="nav-link">
                  <LuWallet className="sb-ico" />
                  <span>Conciliación Tarjetas</span>
                  <FiChevronsRight className="sb-right" />
                </Link>
              </Nav.Item>
              */}


              {/* FACTURACIÓN */}
              {can("facturacion:view") &&
                matchesSearch(
                  "Facturación",
                  "Ventas",
                  "Compras",
                  "Clientes",
                  "Proveedores"
                ) && (
                  <Nav.Item
                    onClick={() => {
                      setShowMainItems(false);
                      setShowFacturacionItems(true);
                      setShowReturnButton(true);
                    }}
                    className="sb-top"
                  >
                    <Link to="#" className="nav-link">
                      <MdPointOfSale className="sb-ico" />
                      <span>Facturación</span>
                      <FiChevronsRight className="sb-right" />
                    </Link>
                  </Nav.Item>
                )}


              {/* SUELDOS */}
              {can("sueldos:view") &&
                matchesSearch(
                  "Sueldos",
                  "Liquidación Mensual",
                  "Adicionales Fijos",
                  "Adicionales Variables",
                  "Vales",
                  "Adelantos",
                  "Préstamos a Empleados",
                  "Pago de Sueldos",
                  "Recibos"
                ) && (
                  <Nav.Item
                    onClick={() => {
                      setShowMainItems(false);
                      setShowSueldosItems(true);
                      setShowReturnButton(true);
                    }}
                    className="sb-top"
                  >
                    <Link to="#" className="nav-link">
                      <FiUsers className="sb-ico" />
                      <span>Sueldos</span>
                      <FiChevronsRight className="sb-right" />
                    </Link>
                  </Nav.Item>
                )}


              {/* GESTIÓN DE MEDIAS */}
              {can("gmedias:view") &&
                matchesSearch(
                  "Gestión de Medias",
                  "Hacienda",
                  "Productos",
                  "Sucursales",
                  "Clientes",
                  "Formas de Pago",
                  "Ventas",
                  "Cuenta Corriente",
                  "Stock",
                  "Órdenes",
                  "Recibos"
                ) && (
                  <Nav.Item
                    onClick={() => {
                      setShowMainItems(false);
                      setShowGestionItems(true);
                      setShowReturnButton(true);
                    }}
                    className="sb-top"
                  >
                    <Link to="#" className="nav-link">
                      <FiLayers className="sb-ico" />
                      <span>Gestión de Medias</span>
                      <FiChevronsRight className="sb-right" />
                    </Link>
                  </Nav.Item>
                )}


              {/* GESTIÓN ADMINISTRATIVA */}
              {can("gestion:view") &&
                matchesSearch(
                  "Gestión Administrativa",
                  "Dashboard",
                  "Kanban",
                  "Tareas",
                  "Proyectos",
                  "Calendario",
                  "Supervisor"
                ) && (
                  <Nav.Item
                    onClick={() => {
                      setShowMainItems(false);
                      setShowGestionOperativaItems(true);
                      setShowReturnButton(true);
                    }}
                    className="sb-top"
                  >
                    <Link to="#" className="nav-link">
                      <FiFolder className="sb-ico" />
                      <span>Gestión Administrativa</span>
                      <FiChevronsRight className="sb-right" />
                    </Link>
                  </Nav.Item>
                )}


              {/* INFO SUCURSALES */}
              {can("infosuc:view") &&
                matchesSearch(
                  "Info Sucursales",
                  "Información Caja",
                  "Información Rinde",
                  "Sucursales"
                ) && (
                  <Nav.Item
                    onClick={toggleMainItems}
                    className="sb-top"
                  >
                    <Link to="#" className="nav-link">
                      <BsBuildings className="sb-ico" />
                      <span>Info Sucursales</span>
                      <FiChevronsRight className="sb-right" />
                    </Link>
                  </Nav.Item>
                )}


              {/* MANTENIMIENTO */}
              {can("mantenimiento:view") &&
                matchesSearch(
                  "Mantenimiento",
                  "Equipos",
                  "Mantenimientos",
                  "Órdenes",
                  "Preventivo"
                ) && (
                  <>
                    <Nav.Item
                      onClick={() =>
                        setMaintenanceItem(!maintenanceItem)
                      }
                      aria-expanded={maintenanceItem}
                      className="sb-top"
                    >
                      <Link
                        to="#"
                        className="nav-link"
                      >
                        <FiTool className="sb-ico" />
                        <span>Mantenimiento</span>

                        <Caret
                          open={
                            maintenanceItem ||
                            searchActive
                          }
                        />
                      </Link>
                    </Nav.Item>

                    <Collapse
                      in={
                        maintenanceItem ||
                        searchActive
                      }
                    >
                      <div className="ml-3 sb-sub">

                        {can("mantenimiento:view.equipos") &&
                          matchesSearch(
                            "Mantenimiento",
                            "Equipos"
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
                            "Mantenimiento",
                            "Mantenimientos"
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
                            "Mantenimiento",
                            "Órdenes",
                            "Ordenes"
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
                            "Mantenimiento",
                            "Preventivo"
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

            </>
          )}


        {/* ===================================================
            A PARTIR DE AQUÍ CONTINÚA LA PARTE 3
            BOTONES VOLVER + CONTENIDO DE LOS SUBMENÚS
            =================================================== */}

        {/* ====== BOTONES VOLVER (según sub menú) ====== */}
        {showReturnButton && (
          <>
            {/* Volver genérico */}
            {!showGestionItems &&
              !showGestionOperativaItems &&
              !showConfigItems &&
              !showStaticsItems &&
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
              !showConciliacionItems && (
                <Nav.Item
                  onClick={togglePreviousItems}
                  className="sb-top"
                >
                  <Link to="#" className="nav-link">
                    <FiArrowLeftCircle className="sb-ico" />
                    <span>Volver</span>
                  </Link>
                </Nav.Item>
              )}

            {/* COMERCIOS AMIGOS */}
            {showFidelizacionItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowFidelizacionItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link to="#" className="nav-link">
                  <FiArrowLeftCircle className="sb-ico" />
                  <span>Volver</span>
                </Link>
              </Nav.Item>
            )}

            {/* LEGAJOS */}
            {showLegajosItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowLegajosItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link to="#" className="nav-link">
                  <FiArrowLeftCircle className="sb-ico" />
                  <span>Volver</span>
                </Link>
              </Nav.Item>
            )}

            {/* INTELIGENCIA COMERCIAL */}
            {showInteligenciaItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowInteligenciaItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link to="#" className="nav-link">
                  <FiArrowLeftCircle className="sb-ico" />
                  <span>Volver</span>
                </Link>
              </Nav.Item>
            )}

            {/* GESTIÓN DE MEDIAS */}
            {showGestionItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowGestionItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link to="#" className="nav-link">
                  <FiArrowLeftCircle className="sb-ico" />
                  <span>Volver</span>
                </Link>
              </Nav.Item>
            )}

            {/* GESTIÓN ADMINISTRATIVA */}
            {showGestionOperativaItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowGestionOperativaItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link to="#" className="nav-link">
                  <FiArrowLeftCircle className="sb-ico" />
                  <span>Volver</span>
                </Link>
              </Nav.Item>
            )}

            {/* ESTADÍSTICAS */}
            {showStaticsItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowStaticsItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link to="#" className="nav-link">
                  <FiArrowLeftCircle className="sb-ico" />
                  <span>Volver</span>
                </Link>
              </Nav.Item>
            )}

            {/* CONFIGURACIÓN */}
            {showConfigItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowConfigItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link to="#" className="nav-link">
                  <FiArrowLeftCircle className="sb-ico" />
                  <span>Volver</span>
                </Link>
              </Nav.Item>
            )}

            {/* BOT WHATSAPP */}
            {showAuditoriaAtencionItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowAuditoriaAtencionItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link to="#" className="nav-link">
                  <FiArrowLeftCircle className="sb-ico" />
                  <span>Volver</span>
                </Link>
              </Nav.Item>
            )}

            {/* DOCUMENTACIÓN */}
            {showDocumentacionItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowDocumentacionItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link to="#" className="nav-link">
                  <FiArrowLeftCircle className="sb-ico" />
                  <span>Volver</span>
                </Link>
              </Nav.Item>
            )}

            {/* INSPECCIONES */}
            {showInspeccionesItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowInspeccionesItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link to="#" className="nav-link">
                  <FiArrowLeftCircle className="sb-ico" />
                  <span>Volver</span>
                </Link>
              </Nav.Item>
            )}

            {/* EVALUACIÓN */}
            {showEvaluacionItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowEvaluacionItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link to="#" className="nav-link">
                  <FiArrowLeftCircle className="sb-ico" />
                  <span>Volver</span>
                </Link>
              </Nav.Item>
            )}

            {/* CONCILIACIÓN */}
            {showConciliacionItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowConciliacionItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link to="#" className="nav-link">
                  <FiArrowLeftCircle className="sb-ico" />
                  <span>Volver</span>
                </Link>
              </Nav.Item>
            )}

            {/* IVA */}
            {showIVAItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowIVAItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link to="#" className="nav-link">
                  <FiArrowLeftCircle className="sb-ico" />
                  <span>Volver</span>
                </Link>
              </Nav.Item>
            )}

            {/* RRHH */}
            {showAsistenciaItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowAsistenciaItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link to="#" className="nav-link">
                  <FiArrowLeftCircle className="sb-ico" />
                  <span>Volver</span>
                </Link>
              </Nav.Item>
            )}

            {/* TESORERÍA */}
            {showCajaItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowCajaItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link to="#" className="nav-link">
                  <FiArrowLeftCircle className="sb-ico" />
                  <span>Volver</span>
                </Link>
              </Nav.Item>
            )}

            {/* FACTURACIÓN */}
            {showFacturacionItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowFacturacionItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link to="#" className="nav-link">
                  <FiArrowLeftCircle className="sb-ico" />
                  <span>Volver</span>
                </Link>
              </Nav.Item>
            )}

            {/* SUELDOS */}
            {showSueldosItems && (
              <Nav.Item
                onClick={() => {
                  setShowMainItems(true);
                  setShowSueldosItems(false);
                  setShowReturnButton(false);
                }}
                className="sb-top"
              >
                <Link to="#" className="nav-link">
                  <FiArrowLeftCircle className="sb-ico" />
                  <span>Volver</span>
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
                {matchesSearch(
                  "Dashboard",
                  "Gestión Administrativa"
                ) && (
                    <Link
                      to="/gestion"
                      className={getLinkClassName("/gestion")}
                      onClick={handleLinkClick}
                    >
                      Dashboard
                    </Link>
                  )}

                {matchesSearch(
                  "Kanban",
                  "Gestión Administrativa"
                ) && (
                    <Link
                      to="/gestion/kanban"
                      className={getLinkClassName("/gestion/kanban")}
                      onClick={handleLinkClick}
                    >
                      Kanban
                    </Link>
                  )}

                {matchesSearch(
                  "Tareas",
                  "Gestión Administrativa"
                ) && (
                    <Link
                      to="/gestion/tareas"
                      className={getLinkClassName("/gestion/tareas")}
                      onClick={handleLinkClick}
                    >
                      Tareas
                    </Link>
                  )}

                {matchesSearch(
                  "Proyectos",
                  "Gestión Administrativa"
                ) && (
                    <Link
                      to="/gestion/proyectos"
                      className={getLinkClassName("/gestion/proyectos")}
                      onClick={handleLinkClick}
                    >
                      Proyectos
                    </Link>
                  )}

                {matchesSearch(
                  "Calendario",
                  "Gestión Administrativa"
                ) && (
                    <Link
                      to="/gestion/calendario"
                      className={getLinkClassName("/gestion/calendario")}
                      onClick={handleLinkClick}
                    >
                      Calendario
                    </Link>
                  )}

                {can("gestion.supervision:view") &&
                  matchesSearch(
                    "Supervisor",
                    "Supervisión",
                    "Gestión Administrativa"
                  ) && (
                    <Link
                      to="/gestion/supervisor"
                      className={getLinkClassName("/gestion/supervisor")}
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
                {/* USUARIOS */}
                {matchesSearch(
                  "Usuarios",
                  "Crear Usuario",
                  "Listar Usuarios"
                ) && (
                    <>
                      <Nav.Item
                        onClick={() => setUseritem(!useritem)}
                      >
                        <Link to="#" className="nav-link">
                          Usuarios{" "}
                          <Caret
                            open={useritem || searchActive}
                          />
                        </Link>
                      </Nav.Item>

                      <Collapse
                        in={useritem || searchActive}
                      >
                        <div className="ml-3 sb-sub">

                          {matchesSearch(
                            "Crear Usuario",
                            "Usuarios"
                          ) && (
                              <Link
                                to="/users/new"
                                className={getLinkClassName("/users/new")}
                                onClick={handleLinkClick}
                              >
                                Crear Usuario
                              </Link>
                            )}

                          {matchesSearch(
                            "Listar Usuarios",
                            "Usuarios"
                          ) && (
                              <Link
                                to="/users"
                                className={getLinkClassName("/users")}
                                onClick={handleLinkClick}
                              >
                                Listar Usuarios
                              </Link>
                            )}

                        </div>
                      </Collapse>
                    </>
                  )}


                {matchesSearch("Bancos", "Configuración") && (
                  <Link
                    to="/banks"
                    className={getLinkClassName("/banks")}
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
                      className={getLinkClassName("/categorias-animales")}
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
                      className={getLinkClassName("/tarjetas-comunes")}
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
                      className={getLinkClassName("/tarjeta-planes")}
                      onClick={handleLinkClick}
                    >
                      Planes de Tarjetas
                    </Link>
                  )}

                {matchesSearch("Empresas", "Configuración") && (
                  <Link
                    to="/empresas"
                    className={getLinkClassName("/empresas")}
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
                      className={getLinkClassName("/formas-pago-tesoreria")}
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
                      className={getLinkClassName("/frigorificos")}
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
                      className={getLinkClassName("/imputaciones-contables")}
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
                      className={getLinkClassName("/marcas-tarjeta")}
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
                      className={getLinkClassName("/tipos-tarjeta")}
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
                      className={getLinkClassName("/tipos-comprobantes")}
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
                      className={getLinkClassName("/ptos-venta")}
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
                      className={getLinkClassName("/proveedores")}
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
                      className={getLinkClassName("/proyectos")}
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
                      className={getLinkClassName("/periodoliquidacion")}
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
                      className={getLinkClassName("/sync")}
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
                      className={getLinkClassName("/registros")}
                      onClick={handleLinkClick}
                    >
                      Registros
                    </Link>
                  )}

                {can("notification:view") &&
                  matchesSearch(
                    "Centro de Notificaciones",
                    "Notificaciones",
                    "Configuración"
                  ) && (
                    <Link
                      to="/notification"
                      className={getLinkClassName("/notification")}
                      onClick={handleLinkClick}
                    >
                      Centro de Notificaciones
                    </Link>
                  )}

                {can("scheduler:view") &&
                  matchesSearch(
                    "Scheduler",
                    "Configuración"
                  ) && (
                    <Link
                      to="/scheduler"
                      className={getLinkClassName("/scheduler")}
                      onClick={handleLinkClick}
                    >
                      Scheduler
                    </Link>
                  )}
              </>
            )}


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
                      className={getLinkClassName("/promociones")}
                      onClick={handleLinkClick}
                    >
                      Promociones
                    </Link>
                  )}

                {can("doc:create") &&
                  matchesSearch(
                    "Productos IA",
                    "Productos",
                    "Bot WhatsApp"
                  ) && (
                    <Link
                      to="/bot/product-meta"
                      className={getLinkClassName("/bot/product-meta")}
                      onClick={handleLinkClick}
                    >
                      Productos (IA)
                    </Link>
                  )}

                {can("doc:create") &&
                  matchesSearch(
                    "Conversaciones",
                    "Bot WhatsApp"
                  ) && (
                    <Link
                      to="/bot/conversations"
                      className={getLinkClassName("/bot/conversations")}
                      onClick={handleLinkClick}
                    >
                      Conversaciones
                    </Link>
                  )}

                {can("doc:create") &&
                  matchesSearch(
                    "Sucursales IA",
                    "Sucursales",
                    "Bot WhatsApp"
                  ) && (
                    <Link
                      to="/bot/branch-meta"
                      className={getLinkClassName("/bot/branch-meta")}
                      onClick={handleLinkClick}
                    >
                      Sucursales (IA)
                    </Link>
                  )}

                {can("doc:create") &&
                  matchesSearch(
                    "Beneficios",
                    "Bot WhatsApp"
                  ) && (
                    <Link
                      to="/bot/benefit-meta"
                      className={getLinkClassName("/bot/benefit-meta")}
                      onClick={handleLinkClick}
                    >
                      Beneficios
                    </Link>
                  )}

                {can("doc:create") &&
                  matchesSearch(
                    "Eventos",
                    "Bot WhatsApp"
                  ) && (
                    <Link
                      to="/bot/event-meta"
                      className={getLinkClassName("/bot/event-meta")}
                      onClick={handleLinkClick}
                    >
                      Eventos
                    </Link>
                  )}

                {/* Próximos módulos - se mantienen comentados */}
                {/*
                <Nav.Link as={Link} to="/bot/conversations">
                  Conversaciones
                </Nav.Link>

                <Nav.Link as={Link} to="/bot/handoffs">
                  Atención Humana
                </Nav.Link>

                <Nav.Link as={Link} to="/bot/settings">
                  Configuración
                </Nav.Link>
                */}
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
                      className={getLinkClassName("/documentos")}
                      onClick={handleLinkClick}
                    >
                      Documentos
                    </Link>
                  )}

                {can("doc:create") &&
                  matchesSearch(
                    "Crear Documentos",
                    "Documentación"
                  ) && (
                    <Link
                      to="/documentos/nuevo"
                      className={getLinkClassName("/documentos/nuevo")}
                      onClick={handleLinkClick}
                    >
                      Crear Documentos
                    </Link>
                  )}

                {can("doc:categorias") &&
                  matchesSearch(
                    "Categorias",
                    "Categorías",
                    "Documentación"
                  ) && (
                    <Link
                      to="/documentos/categorias"
                      className={getLinkClassName("/documentos/categorias")}
                      onClick={handleLinkClick}
                    >
                      Categorias
                    </Link>
                  )}

                {can("doc:subcategorias") &&
                  matchesSearch(
                    "Subcategorias",
                    "Subcategorías",
                    "Documentación"
                  ) && (
                    <Link
                      to="/documentos/subcategorias"
                      className={getLinkClassName("/documentos/subcategorias")}
                      onClick={handleLinkClick}
                    >
                      Subcategorias
                    </Link>
                  )}
              </>
            )}


            {/* =================================================
                A PARTIR DE AQUÍ CONTINÚA LA PARTE 4
                INSPECCIONES + EVALUACIÓN + COMERCIOS AMIGOS
                + LEGAJOS + INTELIGENCIA COMERCIAL
                ================================================= */}


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
                    "Inspección"
                  ) && (
                    <Link
                      to="/inspecciones"
                      className={getLinkClassName("/inspecciones")}
                      onClick={handleLinkClick}
                    >
                      Inspecciones
                    </Link>
                  )}

                {can("inspecciones:create") &&
                  matchesSearch(
                    "Nueva Inspección",
                    "Nueva Inspeccion",
                    "Inspecciones"
                  ) && (
                    <Link
                      to="/inspecciones/nueva"
                      className={getLinkClassName("/inspecciones/nueva")}
                      onClick={handleLinkClick}
                    >
                      Nueva Inspección
                    </Link>
                  )}

                {can("inspecciones:admin") &&
                  matchesSearch(
                    "Plantillas",
                    "Inspecciones"
                  ) && (
                    <Link
                      to="/inspecciones/plantillas"
                      className={getLinkClassName(
                        "/inspecciones/plantillas"
                      )}
                      onClick={handleLinkClick}
                    >
                      Plantillas
                    </Link>
                  )}

                {can("inspecciones:admin") &&
                  matchesSearch(
                    "Notificaciones",
                    "Inspecciones"
                  ) && (
                    <Link
                      to="/inspecciones/notificaciones"
                      className={getLinkClassName(
                        "/inspecciones/notificaciones"
                      )}
                      onClick={handleLinkClick}
                    >
                      Notificaciones
                    </Link>
                  )}

                {can("inspecciones:reportes") &&
                  matchesSearch(
                    "Reportes",
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
                {can("evaluacion:view") &&
                  matchesSearch(
                    "Evaluaciones",
                    "Evaluación",
                    "Evaluacion"
                  ) && (
                    <Link
                      to="/evaluaciones"
                      className={getLinkClassName("/evaluaciones")}
                      onClick={handleLinkClick}
                    >
                      Evaluaciones
                    </Link>
                  )}

                {can("evaluacion:admin") &&
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

                {can("evaluacion:admin") &&
                  matchesSearch(
                    "Mystery",
                    "Evaluación"
                  ) && (
                    <Link
                      to="/evaluacion/mystery"
                      className={getLinkClassName(
                        "/evaluacion/mystery"
                      )}
                      onClick={handleLinkClick}
                    >
                      Mystery
                    </Link>
                  )}

                {can("evaluacion:admin") &&
                  matchesSearch(
                    "Supervisores",
                    "Evaluación"
                  ) && (
                    <Link
                      to="/evaluacion/supervisores"
                      className={getLinkClassName(
                        "/evaluacion/supervisores"
                      )}
                      onClick={handleLinkClick}
                    >
                      Supervisores
                    </Link>
                  )}
              </>
            )}


            {/* =================================================
                COMERCIOS AMIGOS / FIDELIZACIÓN
                ================================================= */}

            {showFidelizacionItems && (
              <>
                <div className="sb-section-title">
                  <FiGift className="sb-section-title-icon" />
                  <span>Comercios Amigos</span>
                </div>
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

                {can("fidelizacion:comercios") &&
                  matchesSearch(
                    "Comercios Asociados",
                    "Comercios",
                    "Fidelización"
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

                {can("fidelizacion:campanias") &&
                  matchesSearch(
                    "Campañas",
                    "Campanias",
                    "Fidelización"
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

                {can("fidelizacion:premios") &&
                  matchesSearch(
                    "Premios Clientes",
                    "Premios",
                    "Fidelización"
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


                {/* CUPONES */}

                {can("fidelizacion:cupones") && (
                  <>
                    {matchesSearch(
                      "Cupones Generados",
                      "Cupones",
                      "Fidelización"
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
                      "Fidelización"
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
                      "Fidelización"
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
                      "Fidelización"
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


                {can("fidelizacion:puntos") &&
                  matchesSearch(
                    "Puntos Comercio",
                    "Puntos",
                    "Fidelización"
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


                {can("fidelizacion:premiosComercio") &&
                  matchesSearch(
                    "Premios Comercios",
                    "Premios",
                    "Comercios",
                    "Fidelización"
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


                {can("fidelizacion:canjesComercio") &&
                  matchesSearch(
                    "Canjes Comercios",
                    "Canjes",
                    "Comercios",
                    "Fidelización"
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


                {can("fidelizacion:fraude") &&
                  matchesSearch(
                    "Alertas Fraude",
                    "Fraude",
                    "Alertas",
                    "Fidelización"
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
                  )}


                {can(
                  "motorconceptos:gestion.empleados.view"
                ) &&
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


                {can(
                  "motorconceptos:gestion.empresas.view"
                ) &&
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


                {can(
                  "motorconceptos:gestion.sucursales.view"
                ) &&
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


                {/*
                =================================================
                REPORTES

                Este bloque permanece comentado porque también
                estaba comentado en el Sidebar original.
                =================================================
                */}
              </>
            )}


            {/* =================================================
                INTELIGENCIA COMERCIAL
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
                A PARTIR DE AQUÍ CONTINÚA LA PARTE 5

                ESTADÍSTICAS
                IVA
                RRHH
                TESORERÍA
                FACTURACIÓN
                SUELDOS
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
                {can("stats:prices.historic.view") &&
                  matchesSearch(
                    "Precios Históricos",
                    "Precios Historicos",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/precioshistoricos"
                      className={getLinkClassName("/precioshistoricos")}
                      onClick={handleLinkClick}
                    >
                      Precios Históricos
                    </Link>
                  )}

                {can("stats:sales.comparative.view") &&
                  matchesSearch(
                    "Ventas Comparativo",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/sells/totalcomparativo"
                      className={getLinkClassName("/sells/totalcomparativo")}
                      onClick={handleLinkClick}
                    >
                      Ventas Comparativo
                    </Link>
                  )}

                {can("stats:sales.range.view") &&
                  matchesSearch(
                    "Ventas entre Rangos",
                    "Rangos",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/sells/comparativorangos"
                      className={getLinkClassName("/sells/comparativorangos")}
                      onClick={handleLinkClick}
                    >
                      Ventas entre Rangos
                    </Link>
                  )}

                {can("stats:sales.chart.view") &&
                  matchesSearch(
                    "Gráfico Comparativo",
                    "Grafico Comparativo",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/sells/graficoventas"
                      className={getLinkClassName("/sells/graficoventas")}
                      onClick={handleLinkClick}
                    >
                      Gráfico Comparativo
                    </Link>
                  )}

                {can("stats:sales.total.view") &&
                  matchesSearch(
                    "Ventas Totales",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/sells/total"
                      className={getLinkClassName("/sells/total")}
                      onClick={handleLinkClick}
                    >
                      Ventas Totales
                    </Link>
                  )}

                {can("stats:sales.byCustomer.view") &&
                  matchesSearch(
                    "Ventas por Cliente",
                    "Cliente",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/sells/customers"
                      className={getLinkClassName("/sells/customers")}
                      onClick={handleLinkClick}
                    >
                      Ventas por Cliente
                    </Link>
                  )}

                {can("stats:sales.deleted.view") &&
                  matchesSearch(
                    "Ventas Anuladas",
                    "Anuladas",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/sells/deleted"
                      className={getLinkClassName("/sells/deleted")}
                      onClick={handleLinkClick}
                    >
                      Ventas Anuladas
                    </Link>
                  )}

                {can("stats:sales.discount.view") &&
                  matchesSearch(
                    "Ventas con Dcto",
                    "Descuento",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/sells/discount"
                      className={getLinkClassName("/sells/discount")}
                      onClick={handleLinkClick}
                    >
                      Ventas con Dcto
                    </Link>
                  )}

                {can("stats:sales.byArticle.view") &&
                  matchesSearch(
                    "Ventas por Art",
                    "Ventas por Artículo",
                    "Articulo",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/sells/articles"
                      className={getLinkClassName("/sells/articles")}
                      onClick={handleLinkClick}
                    >
                      Ventas por Art
                    </Link>
                  )}

                {can("stats:sales.byUser.view") &&
                  matchesSearch(
                    "Ventas por Usuario",
                    "Usuario",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/sells/user"
                      className={getLinkClassName("/sells/user")}
                      onClick={handleLinkClick}
                    >
                      Ventas por Usuario
                    </Link>
                  )}

                {can("stats:sales.kgByBranch.view") &&
                  matchesSearch(
                    "Kg por Sucursal",
                    "Kilos",
                    "Sucursal",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/sells/kg_branch"
                      className={getLinkClassName("/sells/kg_branch")}
                      onClick={handleLinkClick}
                    >
                      Kg por Sucursal
                    </Link>
                  )}

                {can("stats:sales.ticketCount.view") &&
                  matchesSearch(
                    "Cantidad Tickets",
                    "Tickets",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/sells/quantity"
                      className={getLinkClassName("/sells/quantity")}
                      onClick={handleLinkClick}
                    >
                      Cantidad Tickets
                    </Link>
                  )}

                {can("stats:inventory.stock.view") &&
                  matchesSearch(
                    "Stock",
                    "Inventario",
                    "Estadísticas"
                  ) && (
                    <Link
                      to="/inventory/stock"
                      className={getLinkClassName("/inventory/stock")}
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
                {/* LIBROS IVA */}

                {(can("iva:libro.create") ||
                  can("iva:libro.view")) &&
                  matchesSearch(
                    "Libros IVA",
                    "Crear Libro IVA",
                    "Listar Libros IVA"
                  ) && (
                    <>
                      <Nav.Item
                        onClick={() =>
                          setLibroIvaItem(!libroIvaItem)
                        }
                      >
                        <Link
                          to="#"
                          className="nav-link"
                        >
                          Libros IVA{" "}
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


                {/* COMPRAS PROYECTADAS */}

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


                {/* PROYECCIÓN DEL IVA */}

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
                {can("asistencia:dashboard.view") &&
                  matchesSearch(
                    "Dashboard Asistencia",
                    "Asistencia",
                    "RRHH"
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


                {can("asistencia:concepto.manage") &&
                  matchesSearch(
                    "Conceptos",
                    "Asistencia",
                    "RRHH"
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


                {can("asistencia:evento.manage") &&
                  matchesSearch(
                    "Eventos",
                    "Asistencia",
                    "RRHH"
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


                {can("asistencia:vacacion.manage") &&
                  matchesSearch(
                    "Vacaciones",
                    "Asistencia",
                    "RRHH"
                  ) && (
                    <Link
                      to="/asistencias/vacaciones"
                      className={getLinkClassName(
                        "/asistencias/vacaciones"
                      )}
                      onClick={handleLinkClick}
                    >
                      Vacaciones
                    </Link>
                  )}


                {can("asistencia:planificacion.view") &&
                  matchesSearch(
                    "Planificación",
                    "Planificacion",
                    "Asistencia",
                    "RRHH"
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
              </>
            )}


            {/* =================================================
                TESORERÍA
                ================================================= */}

            {showCajaItems && (
              <>
                <div className="sb-section-title">
                  <LuWallet className="sb-section-title-icon" />
                  <span>Tesorería</span>
                </div>
                {/* CAJA */}

                {(can("tesoreria:caja.view") ||
                  can("tesoreria:caja.movimientos")) &&
                  matchesSearch(
                    "Caja",
                    "Movimientos Caja",
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
                          Caja{" "}
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

                          {can("tesoreria:caja.view") &&
                            matchesSearch(
                              "Caja",
                              "Tesorería"
                            ) && (
                              <Link
                                to="/tesoreria/caja"
                                className={getLinkClassName(
                                  "/tesoreria/caja"
                                )}
                                onClick={handleLinkClick}
                              >
                                Caja
                              </Link>
                            )}

                          {can("tesoreria:caja.movimientos") &&
                            matchesSearch(
                              "Movimientos Caja",
                              "Caja",
                              "Tesorería"
                            ) && (
                              <Link
                                to="/tesoreria/movimientos-caja"
                                className={getLinkClassName(
                                  "/tesoreria/movimientos-caja"
                                )}
                                onClick={handleLinkClick}
                              >
                                Movimientos Caja
                              </Link>
                            )}

                        </div>
                      </Collapse>
                    </>
                  )}


                {/* MOVIMIENTOS BANCARIOS */}

                {can("tesoreria:bancos.movimientos") &&
                  matchesSearch(
                    "Movimientos Bancarios",
                    "Bancos",
                    "Tesorería"
                  ) && (
                    <Link
                      to="/tesoreria/movimientos-banco"
                      className={getLinkClassName(
                        "/tesoreria/movimientos-banco"
                      )}
                      onClick={handleLinkClick}
                    >
                      Movimientos Bancarios
                    </Link>
                  )}


                {/* TARJETAS */}

                {can("tesoreria:tarjetas.view") &&
                  matchesSearch(
                    "Movimientos Tarjetas",
                    "Tarjetas",
                    "Tesorería"
                  ) && (
                    <Link
                      to="/tesoreria/movimientos-tarjeta"
                      className={getLinkClassName(
                        "/tesoreria/movimientos-tarjeta"
                      )}
                      onClick={handleLinkClick}
                    >
                      Movimientos Tarjetas
                    </Link>
                  )}


                {/* CHEQUES / ECHEQ */}

                {can("tesoreria:cheques.view") &&
                  matchesSearch(
                    "Cheques",
                    "eCheq",
                    "Echeq",
                    "Tesorería"
                  ) && (
                    <Link
                      to="/tesoreria/echeqs"
                      className={getLinkClassName(
                        "/tesoreria/echeqs"
                      )}
                      onClick={handleLinkClick}
                    >
                      Cheques / eCheq
                    </Link>
                  )}


                {/* AJUSTES DE COMPROBANTES */}

                {can("tesoreria:ajustes.view") &&
                  matchesSearch(
                    "Ajustes",
                    "Ajustes Comprobantes",
                    "Registros de ajustes",
                    "Tesorería"
                  ) && (
                    <>
                      <Nav.Item
                        onClick={() =>
                          setRegistroAjusteItem(
                            !registroAjusteItem
                          )
                        }
                      >
                        <Link
                          to="#"
                          className="nav-link"
                        >
                          Ajustes de Comprobantes{" "}
                          <Caret
                            open={
                              registroAjusteItem ||
                              searchActive
                            }
                          />
                        </Link>
                      </Nav.Item>

                      <Collapse
                        in={
                          registroAjusteItem ||
                          searchActive
                        }
                      >
                        <div className="ml-3 sb-sub">

                          {matchesSearch(
                            "Registros de ajustes",
                            "Ajustes",
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

                        </div>
                      </Collapse>
                    </>
                  )}


                {/* GASTOS ESTIMADOS */}

                {(can("tesoreria:gastosEstimados.view") ||
                  can("tesoreria:gastosEstimados.import")) &&
                  matchesSearch(
                    "Gastos Estimados",
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
                          Gastos Estimados{" "}
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


                {/* VENCIMIENTOS
                    Se mantiene comentado como en el original. */}

                {/*
                {can("tesoreria:vencimientos.view") && (
                  <Link
                    to="/vencimientos"
                    className={getLinkClassName("/vencimientos")}
                    onClick={handleLinkClick}
                  >
                    Vencimientos
                  </Link>
                )}
                */}

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
                {/* VENTAS */}

                {(can("facturacion:ventas.clientes.view") ||
                  can("facturacion:ventas.facturar")) &&
                  matchesSearch(
                    "Ventas",
                    "Clientes",
                    "Facturación"
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
                          Ventas{" "}
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


                {/* COMPRAS */}

                {(can("facturacion:compras.proveedores.view") ||
                  can("facturacion:compras.facturar") ||
                  can("facturacion:compras.pagos") ||
                  can("facturacion:compras.ctacte.view") ||
                  can("facturacion:compras.situacionFinanciera.view")) &&
                  matchesSearch(
                    "Compras",
                    "Proveedores",
                    "Facturación",
                    "Pagos",
                    "Cuenta Corriente",
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
                          Compras{" "}
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
                              "Compras"
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
                              "Pagos",
                              "Compras"
                            ) && (
                              <Link
                                to="/comprasfacturacion/pagos"
                                className={getLinkClassName(
                                  "/comprasfacturacion/pagos"
                                )}
                                onClick={handleLinkClick}
                              >
                                Pagos
                              </Link>
                            )}

                          {can("facturacion:compras.ctacte.view") &&
                            matchesSearch(
                              "Cuenta Corriente",
                              "Cta Cte",
                              "Compras"
                            ) && (
                              <Link
                                to="/comprasfacturacion/ctacte"
                                className={getLinkClassName(
                                  "/comprasfacturacion/ctacte"
                                )}
                                onClick={handleLinkClick}
                              >
                                Cuenta Corriente
                              </Link>
                            )}

                          {can("facturacion:compras.situacionFinanciera.view") &&
                            matchesSearch(
                              "Situación Financiera",
                              "Situacion Financiera",
                              "Compras"
                            ) && (
                              <Link
                                to="/comprasfacturacion/situacionfinanciera"
                                className={getLinkClassName(
                                  "/comprasfacturacion/situacionfinanciera"
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
                {can("sueldos:liquidacion.run") &&
                  matchesSearch(
                    "Liquidación Mensual",
                    "Liquidacion Mensual",
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


                {can("sueldos:pago.tesoreria") &&
                  matchesSearch(
                    "Pago de Sueldos",
                    "Pago de Sueldos Tes",
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


                {can("sueldos:adelantos.tesoreria") &&
                  matchesSearch(
                    "Adelantos",
                    "Adelantos Tes",
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


                {can("sueldos:adelantos.tesoreria") &&
                  matchesSearch(
                    "Prestamos a Empleados",
                    "Préstamos a Empleados",
                    "Prestamos",
                    "Préstamos",
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
                A PARTIR DE AQUÍ CONTINÚA LA PARTE 6

                RINDE
                INFO DE CAJA
                GESTIÓN DE MEDIAS
                RESTO DEL SIDEBAR
                CIERRE DEL COMPONENTE
                ================================================= */}

            {/* =================================================
                INFO SUCURSALES
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
              !showInteligenciaItems &&
              !showLegajosItems &&
              !showConciliacionItems &&
              !showIVAItems &&
              !showAsistenciaItems &&
              !showCajaItems &&
              !showFacturacionItems &&
              !showSueldosItems &&
              !showStaticsItems && (
                <>

                  <div className="sb-section-title">
                    <BsBuildings className="sb-section-title-icon" />
                    <span>Info Sucursales</span>
                  </div>

                  {/* =============================================
                      VENTAS RINDE
                      ============================================= */}

                  {(can(
                    "stats:sales.comparative.view",
                    "stats:sales.total.view",
                    "stats:sales.byCustomer.view",
                    "stats:sales.deleted.view",
                    "stats:sales.discount.view",
                    "stats:sales.byArticle.view",
                    "stats:sales.byUser.view",
                    "stats:sales.kgByBranch.view",
                    "stats:sales.ticketCount.view"
                  )) &&
                    matchesSearch(
                      "Ventas Rinde",
                      "Ventas Comparativo",
                      "Ventas Totales",
                      "Ventas por Cliente",
                      "Ventas Anuladas",
                      "Ventas con Dcto",
                      "Ventas por Art",
                      "Ventas por Usuario",
                      "Kg por Sucursal",
                      "Cantidad Tickets"
                    ) && (
                      <>
                        <Nav.Item
                          onClick={() =>
                            setSellRinde(!sellRinde)
                          }
                        >
                          <Link
                            to="#"
                            className="nav-link"
                          >
                            Ventas Rinde{" "}
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
                                "Ventas por Artículo",
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
                      </>
                    )}


                  {/* =============================================
                      INFO DE CAJA
                      ============================================= */}

                  {(can(
                    "tesoreria:info.cajas.view",
                    "tesoreria:info.gastos.view",
                    "tesoreria:info.retiros.view",
                    "tesoreria:info.vales.view",
                    "tesoreria:info.cupones.view",
                    "tesoreria:info.sueldos.view",
                    "tesoreria:info.ingresos.view",
                    "tesoreria:info.cierresZ.view",
                    "tesoreria:info.ctacte.cliente.view",
                    "tesoreria:info.ctacte.sucursal.view",
                    "tesoreria:info.ctacte.detalle.view",
                    "tesoreria:info.caja.detalle.view"
                  )) &&
                    matchesSearch(
                      "Info de Caja",
                      "Cajas",
                      "Gastos",
                      "Retiros",
                      "Vales",
                      "Cupones",
                      "Sueldos",
                      "Ingresos",
                      "Cierres Z",
                      "Cta Cte Cliente",
                      "Ctas Ctes Suc",
                      "Detalle Cta Cte",
                      "Detalle de Caja"
                    ) && (
                      <>
                        <Nav.Item
                          onClick={() =>
                            setInfoCaja(!infoCaja)
                          }
                        >
                          <Link
                            to="#"
                            className="nav-link"
                          >
                            Info de Caja{" "}
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
                              matchesSearch(
                                "Cajas",
                                "Info de Caja"
                              ) && (
                                <Link
                                  to="/info/register"
                                  className={getLinkClassName(
                                    "/info/register"
                                  )}
                                  onClick={handleLinkClick}
                                >
                                  Cajas
                                </Link>
                              )}

                            {can("tesoreria:info.gastos.view") &&
                              matchesSearch(
                                "Gastos",
                                "Info de Caja"
                              ) && (
                                <Link
                                  to="/info/expenses"
                                  className={getLinkClassName(
                                    "/info/expenses"
                                  )}
                                  onClick={handleLinkClick}
                                >
                                  Gastos
                                </Link>
                              )}

                            {can("tesoreria:info.retiros.view") &&
                              matchesSearch(
                                "Retiros",
                                "Info de Caja"
                              ) && (
                                <Link
                                  to="/info/withdrawals"
                                  className={getLinkClassName(
                                    "/info/withdrawals"
                                  )}
                                  onClick={handleLinkClick}
                                >
                                  Retiros
                                </Link>
                              )}

                            {can("tesoreria:info.vales.view") &&
                              matchesSearch(
                                "Vales",
                                "Info de Caja"
                              ) && (
                                <Link
                                  to="/info/vouchers"
                                  className={getLinkClassName(
                                    "/info/vouchers"
                                  )}
                                  onClick={handleLinkClick}
                                >
                                  Vales
                                </Link>
                              )}

                            {can("tesoreria:info.cupones.view") &&
                              matchesSearch(
                                "Cupones",
                                "Info de Caja"
                              ) && (
                                <Link
                                  to="/info/creditcard"
                                  className={getLinkClassName(
                                    "/info/creditcard"
                                  )}
                                  onClick={handleLinkClick}
                                >
                                  Cupones
                                </Link>
                              )}

                            {can("tesoreria:info.sueldos.view") &&
                              matchesSearch(
                                "Sueldos",
                                "Info de Caja"
                              ) && (
                                <Link
                                  to="/info/salaries"
                                  className={getLinkClassName(
                                    "/info/salaries"
                                  )}
                                  onClick={handleLinkClick}
                                >
                                  Sueldos
                                </Link>
                              )}

                            {can("tesoreria:info.ingresos.view") &&
                              matchesSearch(
                                "Ingresos",
                                "Info de Caja"
                              ) && (
                                <Link
                                  to="/info/incomes"
                                  className={getLinkClassName(
                                    "/info/incomes"
                                  )}
                                  onClick={handleLinkClick}
                                >
                                  Ingresos
                                </Link>
                              )}

                            {can("tesoreria:info.cierresZ.view") &&
                              matchesSearch(
                                "Cierres Z",
                                "Info de Caja"
                              ) && (
                                <Link
                                  to="/info/cierrez"
                                  className={getLinkClassName(
                                    "/info/cierrez"
                                  )}
                                  onClick={handleLinkClick}
                                >
                                  Cierres Z
                                </Link>
                              )}

                            {can("tesoreria:info.ctacte.cliente.view") &&
                              matchesSearch(
                                "Cta Cte Cliente",
                                "Cuenta Corriente Cliente",
                                "Info de Caja"
                              ) && (
                                <Link
                                  to="/info/balanceaccount"
                                  className={getLinkClassName(
                                    "/info/balanceaccount"
                                  )}
                                  onClick={handleLinkClick}
                                >
                                  Cta. Cte. Cliente
                                </Link>
                              )}

                            {can("tesoreria:info.ctacte.sucursal.view") &&
                              matchesSearch(
                                "Ctas Ctes Suc",
                                "Cuentas Corrientes Sucursales",
                                "Info de Caja"
                              ) && (
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
                              matchesSearch(
                                "Detalle Cta Cte",
                                "Detalle Cuenta Corriente",
                                "Info de Caja"
                              ) && (
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
                              matchesSearch(
                                "Detalle de Caja",
                                "Info de Caja"
                              ) && (
                                <Link
                                  to="/info/detail"
                                  className={getLinkClassName(
                                    "/info/detail"
                                  )}
                                  onClick={handleLinkClick}
                                >
                                  Detalle de Caja
                                </Link>
                              )}

                          </div>
                        </Collapse>
                      </>
                    )}


                  {/* =============================================
                      INFO DE RINDE
                      ============================================= */}

                  {(can(
                    "rinde:formula.view",
                    "rinde:formula.create",
                    "rinde:percent.view",
                    "rinde:percent.update",
                    "rinde:prices.view",
                    "rinde:prices.update",
                    "inventario:inventarios.view",
                    "inventario:inventarios.create",
                    "inventario:movimientosInternos.view",
                    "inventario:movimientosOtros.view",
                    "inventario:movimientosOtros.create",
                    "rinde:calculo.run",
                    "rinde:list.view",
                    "rinde:list.comparative.view",
                    "rindeGeneral:calculo.run",
                    "rindeGeneral:list.view",
                    "rindeGeneral:list.global.view",
                    "inventario:stock.control.view"
                  )) &&
                    matchesSearch(
                      "Info de Rinde",
                      "Formulas",
                      "Crear Formulas",
                      "Porcentajes",
                      "Actualizar %",
                      "Precios",
                      "Actualizar Precios",
                      "Inventarios",
                      "Crear Inventario",
                      "Mov Internos",
                      "Fabrica y Ach",
                      "Rinde"
                    ) && (
                      <>
                        <Nav.Item
                          onClick={() =>
                            setInfoRinde(!infoRinde)
                          }
                        >
                          <Link
                            to="#"
                            className="nav-link"
                          >
                            Info de Rinde{" "}
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
                              matchesSearch(
                                "Formulas",
                                "Fórmulas",
                                "Info de Rinde"
                              ) && (
                                <Link
                                  to="/formulas"
                                  className={getLinkClassName(
                                    "/formulas"
                                  )}
                                  onClick={handleLinkClick}
                                >
                                  Formulas
                                </Link>
                              )}

                            {can("rinde:formula.create") &&
                              matchesSearch(
                                "Crear Formulas",
                                "Crear Fórmulas",
                                "Info de Rinde"
                              ) && (
                                <Link
                                  to="/formulas/create"
                                  className={getLinkClassName(
                                    "/formulas/create"
                                  )}
                                  onClick={handleLinkClick}
                                >
                                  Crear Formulas
                                </Link>
                              )}

                            {can("rinde:percent.view") &&
                              matchesSearch(
                                "Porcentajes",
                                "Info de Rinde"
                              ) && (
                                <Link
                                  to="/percent"
                                  className={getLinkClassName(
                                    "/percent"
                                  )}
                                  onClick={handleLinkClick}
                                >
                                  Porcentajes
                                </Link>
                              )}

                            {can("rinde:percent.update") &&
                              matchesSearch(
                                "Actualizar %",
                                "Porcentajes",
                                "Info de Rinde"
                              ) && (
                                <Link
                                  to="/percent_update"
                                  className={getLinkClassName(
                                    "/percent_update"
                                  )}
                                  onClick={handleLinkClick}
                                >
                                  Actualizar %
                                </Link>
                              )}

                            {can("rinde:prices.view") &&
                              matchesSearch(
                                "Precios",
                                "Info de Rinde"
                              ) && (
                                <Link
                                  to="/prices"
                                  className={getLinkClassName(
                                    "/prices"
                                  )}
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
                                  className={getLinkClassName(
                                    "/prices_update"
                                  )}
                                  onClick={handleLinkClick}
                                >
                                  Actualizar Precios
                                </Link>
                              )}

                            {can("inventario:inventarios.view") &&
                              matchesSearch(
                                "Inventarios",
                                "Info de Rinde"
                              ) && (
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
                                "Inventarios",
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
                                "Fábrica",
                                "Achuras",
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


                            {/* Continúan las opciones de Rinde
                                en la Parte 7 */}

                          </div>
                        </Collapse>
                      </>
                    )}

                </>
              )}


            {/* =================================================
                GESTIÓN DE MEDIAS
                ================================================= */}

            {showGestionItems && (
              <>
                <div className="sb-section-title">
                  <FiLayers className="sb-section-title-icon" />
                  <span>Gestión de Medias</span>
                </div>
                {/* REGISTRO DE HACIENDA */}

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


                {/* =================================================
                    VENTAS MEDIAS

                    Continúa en la Parte 7.
                    ================================================= */}

              </>
            )}


            {/* =================================================
                A PARTIR DE AQUÍ CONTINÚA LA PARTE 7

                RESTO DE INFO DE RINDE
                VENTAS MEDIAS
                PRODUCTOS
                SUCURSALES
                CLIENTES
                FORMAS DE PAGO
                COBRANZAS
                CUENTAS CORRIENTES
                STOCK
                ORDENES
                INGRESOS
                REVISIÓN MOVIMIENTOS
                CERRAR SESIÓN
                ================================================= */}

            {/* =================================================
                GESTIÓN DE MEDIAS
                ================================================= */}

            {showGestionItems && (
              <>

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

                {(can("gmedias:ventas.view") ||
                  can("gmedias:ventas.create")) &&
                  matchesSearch(
                    "Ventas Medias",
                    "Ventas",
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
                          Ventas Medias{" "}
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

                          {can("gmedias:ventas.view") &&
                            matchesSearch(
                              "Ventas",
                              "Ventas Medias"
                            ) && (
                              <Link
                                to="/sells"
                                className={getLinkClassName(
                                  "/sells"
                                )}
                                onClick={handleLinkClick}
                              >
                                Ventas
                              </Link>
                            )}

                          {can("gmedias:ventas.create") &&
                            matchesSearch(
                              "Nueva Venta",
                              "Ventas Medias"
                            ) && (
                              <Link
                                to="/sells/new"
                                className={getLinkClassName(
                                  "/sells/new"
                                )}
                                onClick={handleLinkClick}
                              >
                                Nueva Venta
                              </Link>
                            )}

                        </div>
                      </Collapse>
                    </>
                  )}


                {/* =============================================
                    PRODUCTOS
                    ============================================= */}

                {(can("gmedias:productos.view") ||
                  can("gmedias:productos.create")) &&
                  matchesSearch(
                    "Productos",
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
                          Productos{" "}
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

                          {can("gmedias:productos.view") &&
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

                          {can("gmedias:productos.create") &&
                            matchesSearch(
                              "Nuevo Producto",
                              "Productos"
                            ) && (
                              <Link
                                to="/products/new"
                                className={getLinkClassName(
                                  "/products/new"
                                )}
                                onClick={handleLinkClick}
                              >
                                Nuevo Producto
                              </Link>
                            )}

                        </div>
                      </Collapse>
                    </>
                  )}


                {/* =============================================
                    SUCURSALES
                    ============================================= */}

                {(can("gmedias:sucursales.view") ||
                  can("gmedias:sucursales.create")) &&
                  matchesSearch(
                    "Sucursales",
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
                          Sucursales{" "}
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

                          {can("gmedias:sucursales.view") &&
                            matchesSearch(
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

                          {can("gmedias:sucursales.create") &&
                            matchesSearch(
                              "Nueva Sucursal",
                              "Sucursales"
                            ) && (
                              <Link
                                to="/branches/new"
                                className={getLinkClassName(
                                  "/branches/new"
                                )}
                                onClick={handleLinkClick}
                              >
                                Nueva Sucursal
                              </Link>
                            )}

                        </div>
                      </Collapse>
                    </>
                  )}


                {/* =============================================
                    CLIENTES
                    ============================================= */}

                {(can("gmedias:clientes.view") ||
                  can("gmedias:clientes.create")) &&
                  matchesSearch(
                    "Clientes",
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
                          Clientes{" "}
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

                          {can("gmedias:clientes.view") &&
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

                          {can("gmedias:clientes.create") &&
                            matchesSearch(
                              "Nuevo Cliente",
                              "Clientes"
                            ) && (
                              <Link
                                to="/customers/new"
                                className={getLinkClassName(
                                  "/customers/new"
                                )}
                                onClick={handleLinkClick}
                              >
                                Nuevo Cliente
                              </Link>
                            )}

                        </div>
                      </Collapse>
                    </>
                  )}


                {/* =============================================
                    FORMAS DE PAGO
                    ============================================= */}

                {(can("gmedias:formasPago.view") ||
                  can("gmedias:formasPago.create")) &&
                  matchesSearch(
                    "Formas de Pago",
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
                          Formas de Pago{" "}
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

                          {can("gmedias:formasPago.view") &&
                            matchesSearch(
                              "Listar Formas de Pago",
                              "Formas de Pago"
                            ) && (
                              <Link
                                to="/waypayments"
                                className={getLinkClassName(
                                  "/waypayments"
                                )}
                                onClick={handleLinkClick}
                              >
                                Listar Formas de Pago
                              </Link>
                            )}

                          {can("gmedias:formasPago.create") &&
                            matchesSearch(
                              "Nueva Forma de Pago",
                              "Formas de Pago"
                            ) && (
                              <Link
                                to="/waypayments/new"
                                className={getLinkClassName(
                                  "/waypayments/new"
                                )}
                                onClick={handleLinkClick}
                              >
                                Nueva Forma de Pago
                              </Link>
                            )}

                        </div>
                      </Collapse>
                    </>
                  )}


                {/* =============================================
                    COBRANZAS
                    ============================================= */}

                {(can("gmedias:cobranzas.view") ||
                  can("gmedias:cobranzas.create")) &&
                  matchesSearch(
                    "Cobranzas",
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
                          Cobranzas{" "}
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

                          {can("gmedias:cobranzas.view") &&
                            matchesSearch(
                              "Cobranzas",
                              "Listar Cobranzas"
                            ) && (
                              <Link
                                to="/receipts"
                                className={getLinkClassName(
                                  "/receipts"
                                )}
                                onClick={handleLinkClick}
                              >
                                Cobranzas
                              </Link>
                            )}

                          {can("gmedias:cobranzas.create") &&
                            matchesSearch(
                              "Nueva Cobranza",
                              "Cobranzas"
                            ) && (
                              <Link
                                to="/receipts/new"
                                className={getLinkClassName(
                                  "/receipts/new"
                                )}
                                onClick={handleLinkClick}
                              >
                                Nueva Cobranza
                              </Link>
                            )}

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
                    "Cuenta Corriente",
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
                          Cuentas Corrientes{" "}
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

                          {/*
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
                          Stock{" "}
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
                    "Nueva Orden",
                    "Importar Excel",
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
                          Ordenes{" "}
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
                              "Nueva Orden",
                              "Ordenes"
                            ) && (
                              <Link
                                to="/orders/new"
                                className={getLinkClassName(
                                  "/orders/new"
                                )}
                                onClick={handleLinkClick}
                              >
                                Nueva Orden
                              </Link>
                            )}

                          {can("gmedias:orden.view") &&
                            matchesSearch(
                              "Ordenes",
                              "Listado Ordenes"
                            ) && (
                              <Link
                                to="/orders"
                                className={getLinkClassName(
                                  "/orders"
                                )}
                                onClick={handleLinkClick}
                              >
                                Ordenes
                              </Link>
                            )}

                          {can("gmedias:orden.import.excel") &&
                            matchesSearch(
                              "Importar Productos Excel",
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
                                Importar Productos Excel
                              </Link>
                            )}

                        </div>
                      </Collapse>
                    </>
                  )}


                {/* =============================================
                    INGRESOS
                    ============================================= */}

                {(can("gmedias:ingresos.view") ||
                  can("gmedias:ingresos.create")) &&
                  matchesSearch(
                    "Ingresos",
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
                          Ingresos{" "}
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

                          {can("gmedias:ingresos.view") &&
                            matchesSearch(
                              "Ingresos",
                              "Listar Ingresos"
                            ) && (
                              <Link
                                to="/debts"
                                className={getLinkClassName(
                                  "/debts"
                                )}
                                onClick={handleLinkClick}
                              >
                                Ingresos
                              </Link>
                            )}

                          {can("gmedias:ingresos.create") &&
                            matchesSearch(
                              "Nuevo Ingreso",
                              "Ingresos"
                            ) && (
                              <Link
                                to="/debts/new"
                                className={getLinkClassName(
                                  "/debts/new"
                                )}
                                onClick={handleLinkClick}
                              >
                                Nuevo Ingreso
                              </Link>
                            )}

                        </div>
                      </Collapse>
                    </>
                  )}

              </>
            )}


            {/* =================================================
                REVISIÓN MOVIMIENTOS
                ================================================= */}

            {(can("inventario:movimientosInternos.view") ||
              can("inventario:movimientosOtros.view")) &&
              matchesSearch(
                "Revisión Movimientos",
                "Revision Movimientos",
                "Mov Internos",
                "Fabrica y Ach",
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
                    className="sb-top"
                  >
                    <Link
                      to="#"
                      className="nav-link"
                    >
                      <FiFolder className="sb-ico" />

                      <span>
                        Revisión Movimientos
                      </span>

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
                          "Movimientos Internos",
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
                          "Fábrica",
                          "Achuras",
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

      </div>


      {/* =====================================================
          CERRAR SESIÓN
          ===================================================== */}

      <div className="sb-footer">

        <Nav.Item>

          <button
            className="nav-link"
            style={{
              color: "white",
              whiteSpace: "nowrap",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer"
            }}
            onClick={handleLogout}
          >
            CERRAR SESIÓN
          </button>

        </Nav.Item>

      </div>

    </Nav>
  );
};

export default SideBar; 
