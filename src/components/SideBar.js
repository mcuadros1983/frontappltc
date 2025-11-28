// src/components/SideBar.js
import { useContext, useState } from "react";
import { useSecurity } from "../security/SecurityContext"; // 👈 usa tu SecurityContext
import { Nav } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
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
  FiCalendar, FiShield
} from "react-icons/fi";
import { TbReceiptTax } from "react-icons/tb";
import { LuWallet } from "react-icons/lu";
import { MdPointOfSale } from "react-icons/md";
import { BsBuildings } from "react-icons/bs";

const Caret = ({ open }) => (
  <span className="sb-caret">{open ? <FiChevronDown /> : <FiChevronRight />}</span>
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
  const [showConfigItems, setShowConfigItems] = useState(false);
  const [showDocumentacionItems, setShowDocumentacionItems] = useState(false);
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

  // (presentes en tu código original; los dejamos por compatibilidad futura)
  const [messageItem, setMessageItem] = useState(false);
  const [scheduleItem, setScheduleItem] = useState(false);

  const context = useContext(Contexts.UserContext); // lo seguís usando para logout si querés
  const { can, loading } = useSecurity();

  const { setUser: setSecUser } = useSecurity();
  const navigate = useNavigate();

  // const handleLogout = async (e) => {
  //   e.preventDefault();
  //   try {
  //     await context.logout(); // hace fetch POST /logout
  //     setSecUser(null);       // limpia SecurityContext para ProtectedRoute
  //     navigate("/login", { replace: true });
  //   } catch (err) {
  //     alert(err?.message || "No se pudo cerrar sesión");
  //   }
  // };

  const handleLogout = async (e) => {
  e.preventDefault();
  try {
    await context.logout(); // hace fetch POST /logout
    setSecUser(null);       // limpia SecurityContext para ProtectedRoute
    // context.setUser(null);  // 🔥 aseguramos que también se borra el user global
    navigate("/login", { replace: true });
  } catch (err) {
    alert(err?.message || "No se pudo cerrar sesión");
  }
};


  if (loading) return null; // o un spinner/skeleton

  const toggleMainItems = () => {
    setShowMainItems(!showMainItems);
    setShowReturnButton(true);
  };

  const togglePreviousItems = () => {
    setShowMainItems(true);
    setShowReturnButton(false);
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 993 || isMobile) {
      toggleSidebar?.();
    }
  };

  return (
    <Nav defaultActiveKey="/" className="flex-column sidebar sb-root">
      {/* Header / Logo pequeño opcional */}
      <div className="sb-header">
        <div className="sb-brand">
          <span className="sb-brand-icon"><BsBuildings /></span>
          <span className="sb-brand-text">La Tradición</span>
        </div>
      </div>

      <div className="sb-body">
        {/* INICIO */}
        <Nav.Item>
          <Link
            to="/dashboard"
            className="nav-link sb-top"
            onClick={handleLinkClick}
          >
            <FiHome className="sb-ico" />
            <span>Inicio</span>
          </Link>
        </Nav.Item>

        {/* ===== HOME: BLOQUE PRINCIPAL (sin restricciones por rol) ===== */}
        {showMainItems &&
          !showGestionItems &&
          !showReturnButton &&
          !showConfigItems &&
          !showDocumentacionItems &&
          !showConciliacionItems && (
            <>
              {/* CONFIGURACIÓN */}
              {can("config:view") && (
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

              {/* AGENDA (acceso directo) — 🔐 protegido por permiso */}
              {can("agenda:view") && (
                <Link
                  to="/agenda"
                  className="nav-link sb-top"
                  onClick={handleLinkClick}
                >
                  <FiCalendar className="sb-ico" />
                  <span>Agenda</span>
                </Link>
              )}

              {/* AGENDA (acceso directo) — 🔐 protegido por permiso */}
              {can("permisos:view") && (
                <Link
                  to="/permisos"
                  className="nav-link sb-top"
                  onClick={handleLinkClick}
                >

                  <FiShield className="sb-ico" />
                  <span>Permisos</span>
                </Link>
              )}

              {/* DOCUMENTACIÓN */}
              {can("doc:view") && (
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


              {/* ESTADÍSTICAS */}
              {can("statics:view") && (
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

              {/* IVA */}
              {can("iva:view") && (
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
              {can("rrhh:view") && (
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
              {can("tesoreria:view") && (
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

              {/* CONCILIACIÓN TARJETAS */}
              {/* <Nav.Item
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
              </Nav.Item> */}

              {/* FACTURACIÓN */}
              {can("facturacion:view") && (
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
              {can("sueldos:view") && (
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
              {can("gmedias:view") && (
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


              {/* Info Sucursales */}
              {can("infosuc:view") && (
                <Nav.Item onClick={toggleMainItems} className="sb-top">
                  <Link to="#" className="nav-link">
                    <BsBuildings className="sb-ico" />
                    <span>Info Sucursales</span>
                    <FiChevronsRight className="sb-right" />
                  </Link>
                </Nav.Item>
              )}

              {/* MANTENIMIENTO */}
              {can("mantenimiento:view") && (
                <Nav.Item
                  onClick={() => setMaintenanceItem(!maintenanceItem)}
                  aria-expanded={maintenanceItem}
                  className="sb-top"
                >
                  <Link to="#" className="nav-link">
                    <FiTool className="sb-ico" />
                    <span>Mantenimiento</span>
                    <Caret open={maintenanceItem} />
                  </Link>
                </Nav.Item>
              )}


              <Collapse in={maintenanceItem}>
                <div className="ml-3 sb-sub">
                  {can("mantenimiento:view.equipos") && (
                    <Link to="/equipos" className="nav-link" onClick={handleLinkClick}>
                      Equipos
                    </Link>
                  )}
                  {can("mantenimiento:view.mantenimientos") && (
                    <Link to="/mantenimientos" className="nav-link" onClick={handleLinkClick}>
                      Mantenimientos
                    </Link>
                  )}
                  {can("mantenimiento:view.ordenes") && (
                    <Link to="/ordenes-mantenimiento" className="nav-link" onClick={handleLinkClick}>
                      Órdenes
                    </Link>
                  )}
                  {can("mantenimiento:view.preventivo") && (
                    <Link to="/mantenimiento-preventivo" className="nav-link" onClick={handleLinkClick}>
                      Preventivo
                    </Link>
                  )}
                </div>
              </Collapse>

            </>
          )}

        {/* ====== BOTONES VOLVER (según sub menú) ====== */}
        {showReturnButton && (
          <>
            {/* Volver genérico */}
            {!showGestionItems &&
              !showConfigItems &&
              !showConciliacionItems &&
              !showIVAItems &&
              !showAsistenciaItems &&
              !showCajaItems &&
              !showFacturacionItems &&
              !showSueldosItems &&
              !showDocumentacionItems &&
              !showStaticsItems && (
                <Nav.Item onClick={togglePreviousItems} className="sb-top">
                  <Link to="#" className="nav-link">
                    <FiArrowLeftCircle className="sb-ico" />
                    <span>Volver</span>
                  </Link>
                </Nav.Item>
              )}

            {/* Volver por secciones */}
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

            {/* ======= CONTENIDO CONFIGURACIÓN ======= */}
            {showConfigItems && (
              <>
                <Nav.Item onClick={() => setUseritem(!useritem)}>
                  <Link to="#" className="nav-link">
                    Usuarios <Caret open={useritem} />
                  </Link>
                </Nav.Item>
                <Collapse in={useritem}>
                  <div className="ml-3 sb-sub">
                    <Link to="/users/new" className="nav-link" onClick={handleLinkClick}>
                      Crear Usuario
                    </Link>
                    <Link to="/users" className="nav-link" onClick={handleLinkClick}>
                      Listar Usuarios
                    </Link>
                  </div>
                </Collapse>

                <Link to="/banks" className="nav-link" onClick={handleLinkClick}>
                  Bancos
                </Link>

                <Link to="/categorias-animales" className="nav-link" onClick={handleLinkClick}>
                  Categorias Animales
                </Link>

                <Link to="/tarjetas-comunes" className="nav-link" onClick={handleLinkClick}>
                  Tarjetas Deb/Cred
                </Link>

                <Link to="/tarjeta-planes" className="nav-link" onClick={handleLinkClick}>
                  Planes de Tarjetas
                </Link>

                <Link to="/empresas" className="nav-link" onClick={handleLinkClick}>
                  Empresas
                </Link>

                <Link to="/formas-pago-tesoreria" className="nav-link" onClick={handleLinkClick}>
                  Formas de Pago
                </Link>

                <Link to="/frigorificos" className="nav-link" onClick={handleLinkClick}>
                  Frigoríficos
                </Link>

                <Link to="/imputaciones-contables" className="nav-link" onClick={handleLinkClick}>
                  Imputación contable
                </Link>

                <Link to="/marcas-tarjeta" className="nav-link" onClick={handleLinkClick}>
                  Marca de Tarjetas
                </Link>

                <Link to="/tipos-tarjeta" className="nav-link" onClick={handleLinkClick}>
                  Tipos de Tarjeta
                </Link>

                <Link to="/tipos-comprobantes" className="nav-link" onClick={handleLinkClick}>
                  Tipos de Comprobantes
                </Link>

                <Link to="/ptos-venta" className="nav-link" onClick={handleLinkClick}>
                  Puntos de Venta
                </Link>

                <Link to="/proveedores" className="nav-link" onClick={handleLinkClick}>
                  Proveedores
                </Link>

                <Link to="/proyectos" className="nav-link" onClick={handleLinkClick}>
                  Proyectos
                </Link>

                <Link to="/periodoliquidacion" className="nav-link" onClick={handleLinkClick}>
                  Periodos
                </Link>

                <Link to="/sync" className="nav-link" onClick={handleLinkClick}>
                  Sincronizar
                </Link>

                <Link to="/registros" className="nav-link" onClick={handleLinkClick}>
                  Registros
                </Link>
              </>
            )}

            {/* ======= CONTENIDO DOCUMENTACION ======= */}
            {showDocumentacionItems && (
              <>
                {can("doc:view") && (
                  <Link to="/documentos" className="nav-link" onClick={handleLinkClick}>
                    Documentos
                  </Link>
                )}
                {can("doc:create") && (
                  <Link to="/documentos/nuevo" className="nav-link" onClick={handleLinkClick}>
                    Crear Documentos
                  </Link>
                )}
                {can("doc:categorias") && (
                  <Link to="/documentos/categorias" className="nav-link" onClick={handleLinkClick}>
                    Categorias
                  </Link>
                )}
                {can("doc:subcategorias") && (
                  <Link to="/documentos/subcategorias" className="nav-link" onClick={handleLinkClick}>
                    Subcategorias
                  </Link>
                )}
              </>
            )}

            {/* ======= CONCILIACIÓN ======= */}
            {/* {showConciliacionItems && (
              <>
                <Nav.Item onClick={() => setRubroItem(!rubroItem)}>
                  <Link to="#" className="nav-link">
                    Rubros <Caret open={rubroItem} />
                  </Link>
                </Nav.Item>
                <Collapse in={rubroItem}>
                  <div className="ml-3 sb-sub">
                    <Link to="/conciliacion-rubros/new" className="nav-link" onClick={handleLinkClick}>
                      Crear Rubro
                    </Link>
                    <Link to="/conciliacion-rubros" className="nav-link" onClick={handleLinkClick}>
                      Listar Rubros
                    </Link>
                  </div>
                </Collapse>

                <Nav.Item onClick={() => setCuentaItem(!cuentaItem)}>
                  <Link to="#" className="nav-link">
                    Cuentas <Caret open={cuentaItem} />
                  </Link>
                </Nav.Item>
                <Collapse in={cuentaItem}>
                  <div className="ml-3 sb-sub">
                    <Link to="/conciliacion-cuentas/new" className="nav-link" onClick={handleLinkClick}>
                      Crear Cuenta
                    </Link>
                    <Link to="/conciliacion-cuentas" className="nav-link" onClick={handleLinkClick}>
                      Listar Cuentas
                    </Link>
                  </div>
                </Collapse>

                <Nav.Item onClick={() => setCriterioItem(!criterioItem)}>
                  <Link to="#" className="nav-link">
                    Criterios <Caret open={criterioItem} />
                  </Link>
                </Nav.Item>
                <Collapse in={criterioItem}>
                  <div className="ml-3 sb-sub">
                    <Link to="/conciliacion-criterios/new" className="nav-link" onClick={handleLinkClick}>
                      Crear Criterio
                    </Link>
                    <Link to="/conciliacion-criterios" className="nav-link" onClick={handleLinkClick}>
                      Listar Criterios
                    </Link>
                  </div>
                </Collapse>
              </>
            )} */}

            {/* ======= GESTIÓN DE MEDIAS ======= */}
            {showGestionItems && (
              <>
                {/* Registro de Hacienda */}
                {can("gmedias:registro.view") && (
                  <Link to="/registrohacienda" className="nav-link" onClick={handleLinkClick}>
                    Registro Hacienda
                  </Link>
                )}

                {/* Ventas Medias */}
                {(can("gmedias:venta.create") || can("gmedias:venta.view")) && (
                  <>
                    <Nav.Item onClick={() => setSellitem(!sellitem)}>
                      <Link to="#" className="nav-link">
                        Ventas Medias <Caret open={sellitem} />
                      </Link>
                    </Nav.Item>
                    <Collapse in={sellitem}>
                      <div className="ml-3 sb-sub">
                        {can("gmedias:venta.create") && (
                          <Link to="/sells/new" className="nav-link" onClick={handleLinkClick}>
                            Crear Venta
                          </Link>
                        )}
                        {can("gmedias:venta.view") && (
                          <Link to="/sells" className="nav-link" onClick={handleLinkClick}>
                            Listar Ventas
                          </Link>
                        )}
                      </div>
                    </Collapse>
                  </>
                )}

                {/* Productos */}
                {(can("gmedias:producto.create") || can("gmedias:producto.view") || can("gmedias:producto.update") || can("gmedias:producto.update.tropa") || can("gmedias:producto.verify.tropa")) && (
                  <>
                    <Nav.Item onClick={() => setProditem(!proditem)}>
                      <Link to="#" className="nav-link">
                        Productos <Caret open={proditem} />
                      </Link>
                    </Nav.Item>
                    <Collapse in={proditem}>
                      <div className="ml-3 sb-sub">
                        {can("gmedias:producto.create") && (
                          <Link to="/products/new" className="nav-link" onClick={handleLinkClick}>
                            Crear Productos
                          </Link>
                        )}
                        {can("gmedias:producto.view") && (
                          <Link to="/products" className="nav-link" onClick={handleLinkClick}>
                            Listar Productos
                          </Link>
                        )}
                        {can("gmedias:producto.update") && (
                          <Link to="/products_update" className="nav-link" onClick={handleLinkClick}>
                            Actualizar
                          </Link>
                        )}
                        {can("gmedias:producto.update.tropa") && (
                          <Link to="/products_update_tropa" className="nav-link" onClick={handleLinkClick}>
                            Actualizar por Tropa
                          </Link>
                        )}
                        {can("gmedias:producto.verify.tropa") && (
                          <Link to="/products/verificar-tropa" className="nav-link" onClick={handleLinkClick}>
                            Verificar por Tropa
                          </Link>
                        )}
                      </div>
                    </Collapse>
                  </>
                )}

                {/* Sucursales */}
                {can("gmedias:sucursal.view") && (
                  <>
                    <Nav.Item onClick={() => setSucitem(!sucitem)}>
                      <Link to="#" className="nav-link">
                        Sucursales <Caret open={sucitem} />
                      </Link>
                    </Nav.Item>
                    <Collapse in={sucitem}>
                      <div className="ml-3 sb-sub">
                        <Link to="/branches" className="nav-link" onClick={handleLinkClick}>
                          Listar Sucursales
                        </Link>
                      </div>
                    </Collapse>
                  </>
                )}

                {/* Clientes */}
                {(can("gmedias:cliente.create") || can("gmedias:cliente.view")) && (
                  <>
                    <Nav.Item onClick={() => setCustitem(!custitem)}>
                      <Link to="#" className="nav-link">
                        Clientes <Caret open={custitem} />
                      </Link>
                    </Nav.Item>
                    <Collapse in={custitem}>
                      <div className="ml-3 sb-sub">
                        {can("gmedias:cliente.create") && (
                          <Link to="/customers/new" className="nav-link" onClick={handleLinkClick}>
                            Crear Cliente
                          </Link>
                        )}
                        {can("gmedias:cliente.view") && (
                          <Link to="/customers" className="nav-link" onClick={handleLinkClick}>
                            Listar Clientes
                          </Link>
                        )}
                      </div>
                    </Collapse>
                  </>
                )}

                {/* Formas de Pago */}
                {(can("gmedias:formaPago.create") || can("gmedias:formaPago.view")) && (
                  <>
                    <Nav.Item onClick={() => setWaypayitem(!waypitem)}>
                      <Link to="#" className="nav-link">
                        Formas de Pago <Caret open={waypitem} />
                      </Link>
                    </Nav.Item>
                    <Collapse in={waypitem}>
                      <div className="ml-3 sb-sub">
                        {can("gmedias:formaPago.create") && (
                          <Link to="/waypays/new" className="nav-link" onClick={handleLinkClick}>
                            Crear Forma Pago
                          </Link>
                        )}
                        {can("gmedias:formaPago.view") && (
                          <Link to="/waypays" className="nav-link" onClick={handleLinkClick}>
                            Listar Formas Pago
                          </Link>
                        )}
                      </div>
                    </Collapse>
                  </>
                )}

                {/* Cobranzas */}
                {can("gmedias:cobranza.view") && (
                  <>
                    <Nav.Item onClick={() => setDebtitem(!debtitem)}>
                      <Link to="#" className="nav-link">
                        Cobranzas <Caret open={debtitem} />
                      </Link>
                    </Nav.Item>
                    <Collapse in={debtitem}>
                      <div className="ml-3 sb-sub">
                        <Link to="/debts" className="nav-link" onClick={handleLinkClick}>
                          Listar Cobranzas
                        </Link>
                      </div>
                    </Collapse>
                  </>
                )}

                {/* Cuentas Corrientes */}
                {(can("gmedias:ctacte.registros") || can("gmedias:ctacte.view")) && (
                  <>
                    <Nav.Item onClick={() => setCtacteitem(!ctacteitem)}>
                      <Link to="#" className="nav-link">
                        Cuentas Corrientes <Caret open={ctacteitem} />
                      </Link>
                    </Nav.Item>
                    <Collapse in={ctacteitem}>
                      <div className="ml-3 sb-sub">
                        {/* {can("gmedias:ctacte.registros") && (
                          <Link to="/accounts/new" className="nav-link" onClick={handleLinkClick}>
                            Registros
                          </Link>
                        )} */}
                        {can("gmedias:ctacte.view") && (
                          <Link to="/accounts" className="nav-link" onClick={handleLinkClick}>
                            Saldos
                          </Link>
                        )}
                      </div>
                    </Collapse>
                  </>
                )}

                {/* Stock */}
                {(can("gmedias:stock.view") || can("gmedias:stock.central.view")) && (
                  <>
                    <Nav.Item onClick={() => setStockitem(!stockitem)}>
                      <Link to="#" className="nav-link">
                        Stock <Caret open={stockitem} />
                      </Link>
                    </Nav.Item>
                    <Collapse in={stockitem}>
                      <div className="ml-3 sb-sub">
                        {can("gmedias:stock.view") && (
                          <Link to="/stock" className="nav-link" onClick={handleLinkClick}>
                            Stock Sucursales
                          </Link>
                        )}
                        {can("gmedias:stock.central.view") && (
                          <Link to="/stock/central" className="nav-link" onClick={handleLinkClick}>
                            Stock Central
                          </Link>
                        )}
                      </div>
                    </Collapse>
                  </>
                )}

                {/* Ordenes */}
                {(can("gmedias:orden.create") || can("gmedias:orden.view") || can("gmedias:orden.import.excel")) && (
                  <>
                    <Nav.Item onClick={() => setOrditem(!orditem)}>
                      <Link to="#" className="nav-link">
                        <span>Ordenes</span>
                        <Caret open={orditem} />
                      </Link>
                    </Nav.Item>
                    <Collapse in={orditem}>
                      <div className="ml-3 sb-sub">
                        {can("gmedias:orden.create") && (
                          <Link to="/orders/new" className="nav-link" onClick={handleLinkClick}>
                            Crear Orden
                          </Link>
                        )}
                        {can("gmedias:orden.view") && (
                          <Link to="/orders" className="nav-link" onClick={handleLinkClick}>
                            Listar Ordenes
                          </Link>
                        )}
                        {can("gmedias:orden.import.excel") && (
                          <Link to="/orders/productsfromexcel" className="nav-link" onClick={handleLinkClick}>
                            Crear Orden Excel
                          </Link>
                        )}
                      </div>
                    </Collapse>
                  </>
                )}

                {/* Ingresos */}
                {(can("gmedias:ingreso.create") || can("gmedias:ingreso.view") || can("gmedias:ingreso.productos.view")) && (
                  <>
                    <Nav.Item onClick={() => setReceiptitem(!receiptitem)}>
                      <Link to="#" className="nav-link">
                        Ingresos <Caret open={receiptitem} />
                      </Link>
                    </Nav.Item>
                    <Collapse in={receiptitem}>
                      <div className="ml-3 sb-sub">
                        {can("gmedias:ingreso.create") && (
                          <Link to="/receipts/new" className="nav-link" onClick={handleLinkClick}>
                            Crear Ingreso
                          </Link>
                        )}
                        {can("gmedias:ingreso.view") && (
                          <Link to="/receipts" className="nav-link" onClick={handleLinkClick}>
                            Listar Ingresos
                          </Link>
                        )}
                        {can("gmedias:ingreso.productos.view") && (
                          <Link to="/receipts/products" className="nav-link" onClick={handleLinkClick}>
                            Productos
                          </Link>
                        )}
                      </div>
                    </Collapse>
                  </>
                )}
              </>
            )}

            {/* ======= ESTADÍSTICAS ======= */}
            {showStaticsItems && (
              <>
                {can("stats:prices.historic.view") && (
                  <Link to="/precioshistoricos" className="nav-link" onClick={handleLinkClick}>
                    Precios Históricos
                  </Link>
                )}

                {can("stats:sales.comparative.view") && (
                  <Link to="/sells/totalcomparativo" className="nav-link" onClick={handleLinkClick}>
                    Ventas Comparativo
                  </Link>
                )}

                {can("stats:sales.range.view") && (
                  <Link to="/sells/comparativorangos" className="nav-link" onClick={handleLinkClick}>
                    Ventas entre Rangos
                  </Link>
                )}

                {can("stats:sales.chart.view") && (
                  <Link to="/sells/graficoventas" className="nav-link" onClick={handleLinkClick}>
                    Gráfico Comparativo
                  </Link>
                )}

                {can("stats:sales.total.view") && (
                  <Link to="/sells/total" className="nav-link" onClick={handleLinkClick}>
                    Ventas Totales
                  </Link>
                )}

                {can("stats:sales.byCustomer.view") && (
                  <Link to="/sells/customers" className="nav-link" onClick={handleLinkClick}>
                    Ventas por Cliente
                  </Link>
                )}

                {can("stats:sales.deleted.view") && (
                  <Link to="/sells/deleted" className="nav-link" onClick={handleLinkClick}>
                    Ventas Anuladas
                  </Link>
                )}

                {can("stats:sales.discount.view") && (
                  <Link to="/sells/discount" className="nav-link" onClick={handleLinkClick}>
                    Ventas con Dcto
                  </Link>
                )}

                {can("stats:sales.byArticle.view") && (
                  <Link to="/sells/articles" className="nav-link" onClick={handleLinkClick}>
                    Ventas por Art
                  </Link>
                )}

                {can("stats:sales.byUser.view") && (
                  <Link to="/sells/user" className="nav-link" onClick={handleLinkClick}>
                    Ventas por Usuario
                  </Link>
                )}

                {can("stats:sales.kgByBranch.view") && (
                  <Link to="/sells/kg_branch" className="nav-link" onClick={handleLinkClick}>
                    Kg por Sucursal
                  </Link>
                )}

                {can("stats:sales.ticketCount.view") && (
                  <Link to="/sells/quantity" className="nav-link" onClick={handleLinkClick}>
                    Cantidad Tickets
                  </Link>
                )}

                {can("stats:inventory.stock.view") && (
                  <Link to="/inventory/stock" className="nav-link" onClick={handleLinkClick}>
                    Stock
                  </Link>
                )}
              </>
            )}

            {/* ======= IVA ======= */}
            {showIVAItems && (
              <>
                {/* Libros IVA */}
                {(can("iva:libro.create") || can("iva:libro.view")) && (
                  <>
                    <Nav.Item onClick={() => setLibroIvaItem(!libroIvaItem)}>
                      <Link to="#" className="nav-link">
                        Libros IVA <Caret open={libroIvaItem} />
                      </Link>
                    </Nav.Item>
                    <Collapse in={libroIvaItem}>
                      <div className="ml-3 sb-sub">
                        {can("iva:libro.create") && (
                          <Link to="/librosiva/new" className="nav-link" onClick={handleLinkClick}>
                            Crear Libro IVA
                          </Link>
                        )}
                        {can("iva:libro.view") && (
                          <Link to="/librosiva" className="nav-link" onClick={handleLinkClick}>
                            Listar Libros IVA
                          </Link>
                        )}
                      </div>
                    </Collapse>
                  </>
                )}

                {/* Compras Proyectadas */}
                {can("iva:compras.proyectadas.view") && (
                  <Link to="/compraproyectada" className="nav-link" onClick={handleLinkClick}>
                    Compras Proyectadas
                  </Link>
                )}

                {/* Proyección del IVA */}
                {can("iva:proyeccion.view") && (
                  <Link to="/ivaproyeccion" className="nav-link" onClick={handleLinkClick}>
                    Proyección del IVA
                  </Link>
                )}
              </>
            )}

            {/* ======= ASISTENCIA ======= */}
            {showAsistenciaItems && (
              <>
                {can("asistencia:dashboard.view") && (
                  <Link to="/dashboardasistencias" className="nav-link" onClick={handleLinkClick}>
                    Dashboard Asistencia
                  </Link>
                )}

                {can("asistencia:concepto.manage") && (
                  <Link to="/asistencias/conceptos" className="nav-link" onClick={handleLinkClick}>
                    Conceptos
                  </Link>
                )}

                {can("asistencia:evento.manage") && (
                  <Link to="/asistencias/eventos" className="nav-link" onClick={handleLinkClick}>
                    Eventos
                  </Link>
                )}

                {can("asistencia:vacacion.view") && (
                  <Link to="/asistencias/listarvacaciones" className="nav-link" onClick={handleLinkClick}>
                    Vacaciones
                  </Link>
                )}

                {can("asistencia:planificacion.manage") && (
                  <Link to="/asistencias/planificacion" className="nav-link" onClick={handleLinkClick}>
                    Planificación
                  </Link>
                )}

                {can("asistencia:horario.manage") && (
                  <Link to="/asistencias/horarios" className="nav-link" onClick={handleLinkClick}>
                    Horarios
                  </Link>
                )}

                {can("asistencia:asignacion.manage") && (
                  <Link to="/asistencias/asignarempleado" className="nav-link" onClick={handleLinkClick}>
                    Asignar Empleado
                  </Link>
                )}

                {can("asistencia:fingerprint.manage") && (
                  <Link to="/asistencias/huellanavegador" className="nav-link" onClick={handleLinkClick}>
                    Huellas Navegador
                  </Link>
                )}

                {can("asistencia:view") && (
                  <Link to="/asistencias" className="nav-link" onClick={handleLinkClick}>
                    Listar Asistencias
                  </Link>
                )}

                {can("asistencia:jornada.manage") && (
                  <Link to="/jornadasasistencias" className="nav-link" onClick={handleLinkClick}>
                    Jornadas
                  </Link>
                )}

                {can("asistencia:parametro.manage") && (
                  <Link to="/parametrosasistencias" className="nav-link" onClick={handleLinkClick}>
                    Parámetros
                  </Link>
                )}
              </>
            )}


            {/* ======= TESORERÍA ======= */}
            {showCajaItems && (
              <>
                {/* Categorías */}
                {(can("tesoreria:categoria.manage")) && (
                  <>
                    <Nav.Item onClick={() => setCategoriaTesoreriaItem(!categoriaTesoreriaItem)}>
                      <Link to="#" className="nav-link">
                        Categorías <Caret open={categoriaTesoreriaItem} />
                      </Link>
                    </Nav.Item>
                    <Collapse in={categoriaTesoreriaItem}>
                      <div className="ml-3 sb-sub">
                        {can("tesoreria:categoria.manage") && (
                          <Link to="/categoriaingreso" className="nav-link" onClick={handleLinkClick}>
                            Categorías Ingreso
                          </Link>
                        )}
                        {can("tesoreria:categoria.manage") && (
                          <Link to="/categoriaegreso" className="nav-link" onClick={handleLinkClick}>
                            Categorías Egreso
                          </Link>
                        )}
                      </div>
                    </Collapse>
                  </>
                )}

                {/* Caja */}
                {(can("tesoreria:caja.open") || can("tesoreria:caja.view") || can("tesoreria:retiros.view")) && (
                  <>
                    <Nav.Item onClick={() => setCajaItem(!cajaItem)}>
                      <Link to="#" className="nav-link">
                        Caja <Caret open={cajaItem} />
                      </Link>
                    </Nav.Item>
                    <Collapse in={cajaItem}>
                      <div className="ml-3 sb-sub">
                        {can("tesoreria:caja.open") && (
                          <Link to="/tesoreria/cajas/apertura" className="nav-link" onClick={handleLinkClick}>
                            Apertura de Caja
                          </Link>
                        )}
                        {can("tesoreria:caja.view") && (
                          <Link to="/tesoreria/movimientos-caja-tesoreria" className="nav-link" onClick={handleLinkClick}>
                            Movimientos de Caja
                          </Link>
                        )}
                        {can("tesoreria:retiros.view") && (
                          <Link to="/tesoreria/retirossucursales" className="nav-link" onClick={handleLinkClick}>
                            Registro de Retiros
                          </Link>
                        )}
                      </div>
                    </Collapse>
                  </>
                )}

                {/* Bancos */}
                {(can("tesoreria:banco.view") || can("tesoreria:banco.import")) && (
                  <>
                    <Nav.Item onClick={() => setMovBancoItem(!movBancoItem)}>
                      <Link to="#" className="nav-link">
                        Bancos <Caret open={movBancoItem} />
                      </Link>
                    </Nav.Item>
                    <Collapse in={movBancoItem}>
                      <div className="ml-3 sb-sub">
                        {can("tesoreria:banco.view") && (
                          <Link to="/tesoreria/movimientos-banco-tesoreria" className="nav-link" onClick={handleLinkClick}>
                            Movimientos bancarios
                          </Link>
                        )}
                        {can("tesoreria:banco.import") && (
                          <Link to="/tesoreria/movimientos-banco-tesoreria-excel" className="nav-link" onClick={handleLinkClick}>
                            Movimientos bancarios Excel
                          </Link>
                        )}
                      </div>
                    </Collapse>
                  </>
                )}

                {/* Tarjetas de Crédito */}
                {can("tesoreria:tarjeta.view") && (
                  <>
                    <Nav.Item onClick={() => setMovTarjetaItem(!movTarjetaItem)}>
                      <Link to="#" className="nav-link">
                        Tarjetas de Crédito <Caret open={movTarjetaItem} />
                      </Link>
                    </Nav.Item>
                    <Collapse in={movTarjetaItem}>
                      <div className="ml-3 sb-sub">
                        <Link to="/tesoreria/movimientos-tarjetas-tesoreria" className="nav-link" onClick={handleLinkClick}>
                          Movimientos TC/TD
                        </Link>
                      </div>
                    </Collapse>
                  </>
                )}

                {/* Registro de Cheques */}
                {can("tesoreria:cheque.view") && (
                  <>
                    <Nav.Item onClick={() => setRegistroChequeItem(!registroChequeItem)}>
                      <Link to="#" className="nav-link">
                        Registro de Cheques <Caret open={registroChequeItem} />
                      </Link>
                    </Nav.Item>
                    <Collapse in={registroChequeItem}>
                      <div className="ml-3 sb-sub">
                        <Link to="/tesoreria/movimientos-echeq-tesoreria" className="nav-link" onClick={handleLinkClick}>
                          Cheques / Echeq
                        </Link>
                      </div>
                    </Collapse>
                  </>
                )}

                {/* Gastos Estimados */}
                {(can("tesoreria:gastosEstimados.view") || can("tesoreria:gastosEstimados.import")) && (
                  <>
                    <Nav.Item onClick={() => setGastosEstimadosItem(!gastosEstimadosItem)}>
                      <Link to="#" className="nav-link">
                        Gastos Estimados <Caret open={gastosEstimadosItem} />
                      </Link>
                    </Nav.Item>
                    <Collapse in={gastosEstimadosItem}>
                      <div className="ml-3 sb-sub">
                        {can("tesoreria:gastosEstimados.view") && (
                          <Link to="/gastosestimados" className="nav-link" onClick={handleLinkClick}>
                            Listar Gastos Estimados
                          </Link>
                        )}
                        {can("tesoreria:gastosEstimados.import") && (
                          <Link to="/importargastosestimados" className="nav-link" onClick={handleLinkClick}>
                            Importar Gastos Estimados
                          </Link>
                        )}
                      </div>
                    </Collapse>
                  </>
                )}

                {/* Vencimientos */}
                {can("tesoreria:vencimientos.view") && (
                  <Link to="/vencimientos" className="nav-link" onClick={handleLinkClick}>
                    Vencimientos
                  </Link>
                )}
              </>
            )}


            {/* ======= FACTURACIÓN ======= */}
            {showFacturacionItems && (
              <>
                {/* Ventas */}
                {(can("facturacion:ventas.clientes.view") || can("facturacion:ventas.facturar")) && (
                  <>
                    <Nav.Item onClick={() => setVentasFacturacionItem(!ventasFacturacionItem)}>
                      <Link to="#" className="nav-link">
                        Ventas <Caret open={ventasFacturacionItem} />
                      </Link>
                    </Nav.Item>
                    <Collapse in={ventasFacturacionItem}>
                      <div className="ml-3 sb-sub">
                        {can("facturacion:ventas.clientes.view") && (
                          <Link to="/ventasfacturacion/clientes" className="nav-link" onClick={handleLinkClick}>
                            Clientes
                          </Link>
                        )}
                        {can("facturacion:ventas.facturar") && (
                          <Link to="/ventasfacturacion/facturacion" className="nav-link" onClick={handleLinkClick}>
                            Facturación
                          </Link>
                        )}
                      </div>
                    </Collapse>
                  </>
                )}

                {/* Compras */}
                {(can("facturacion:compras.proveedores.view") || can("facturacion:compras.facturar") || can("facturacion:compras.pagos") || can("facturacion:compras.ctacte.view") || can("facturacion:compras.situacionFinanciera.view")) && (
                  <>
                    <Nav.Item onClick={() => setComprasFacturacionItem(!comprasFacturacionItem)}>
                      <Link to="#" className="nav-link">
                        Compras <Caret open={comprasFacturacionItem} />
                      </Link>
                    </Nav.Item>
                    <Collapse in={comprasFacturacionItem}>
                      <div className="ml-3 sb-sub">
                        {can("facturacion:compras.proveedores.view") && (
                          <Link to="/comprasfacturacion/proveedores" className="nav-link" onClick={handleLinkClick}>
                            Proveedores
                          </Link>
                        )}
                        {can("facturacion:compras.facturar") && (
                          <Link to="/comprasfacturacion/facturacion" className="nav-link" onClick={handleLinkClick}>
                            Facturación
                          </Link>
                        )}
                        {can("facturacion:compras.pagos") && (
                          <Link to="/comprasfacturacion/ordendepago" className="nav-link" onClick={handleLinkClick}>
                            Pagos a Proveedores
                          </Link>
                        )}
                        {can("facturacion:compras.ctacte.view") && (
                          <Link to="/comprasfacturacion/ctasctes" className="nav-link" onClick={handleLinkClick}>
                            Ctas. Ctes. Proveedores
                          </Link>
                        )}
                        {can("facturacion:compras.situacionFinanciera.view") && (
                          <Link to="/sitfinanciera" className="nav-link" onClick={handleLinkClick}>
                            Situación Financiera
                          </Link>
                        )}
                      </div>
                    </Collapse>
                  </>
                )}
              </>
            )}

            {/* ======= SUELDOS ======= */}
            {showSueldosItems && (
              <>
                <div className="ml-3 sb-sub">
                  {/* {can("sueldos:telefono.assign") && (
                    <Link to="/sueldostesoreria/asignartelefono" className="nav-link" onClick={handleLinkClick}>
                      Asignar Teléfono
                    </Link>
                  )} */}

                  {can("sueldos:datosEmpleado.assign") && (
                    <Link to="/sueldostesoreria/asignardatosempleado" className="nav-link" onClick={handleLinkClick}>
                      Asignar Datos a Empleado
                    </Link>
                  )}

                  {can("sueldos:adicionalFijo.tipo.manage") && (
                    <Link to="/sueldostesoreria/adicionalfijotipo" className="nav-link" onClick={handleLinkClick}>
                      Tipos de adicional fijos
                    </Link>
                  )}

                  {can("sueldos:adicionalFijo.assign") && (
                    <Link to="/sueldostesoreria/asignaradicionalfijo" className="nav-link" onClick={handleLinkClick}>
                      Asignar Adicional Fijo
                    </Link>
                  )}

                  {can("sueldos:recibo.items.import") && (
                    <Link to="/sueldostesoreria/recibosimportmanager" className="nav-link" onClick={handleLinkClick}>
                      Importar items Recibo
                    </Link>
                  )}

                  {can("sueldos:variables.import") && (
                    <Link to="/sueldostesoreria/importaritemsvariables" className="nav-link" onClick={handleLinkClick}>
                      Importar Vales y Adelantos
                    </Link>
                  )}

                  {can("sueldos:variables.view") && (
                    <Link to="/sueldostesoreria/listaradicionalesvariables" className="nav-link" onClick={handleLinkClick}>
                      Listar Adicionales Variables
                    </Link>
                  )}

                  {can("sueldos:liquidacion.run") && (
                    <Link to="/sueldostesoreria/liquidacionmensual" className="nav-link" onClick={handleLinkClick}>
                      Liquidación Mensual
                    </Link>
                  )}

                  {can("sueldos:pago.tesoreria") && (
                    <Link to="/sueldostesoreria/pagodesueldos" className="nav-link" onClick={handleLinkClick}>
                      Pago de Sueldos (Tes)
                    </Link>
                  )}

                  {can("sueldos:adelantos.tesoreria") && (
                    <Link to="/sueldostesoreria/adelantos" className="nav-link" onClick={handleLinkClick}>
                      Adelantos (Tes)
                    </Link>
                  )}
                </div>
              </>
            )}

            {/* ======= RINDE (si no estás en otra sub-sección) ======= */}
            {!showGestionItems &&
              !showConfigItems &&
              !showDocumentacionItems &&
              !showConciliacionItems &&
              !showIVAItems &&
              !showAsistenciaItems &&
              !showCajaItems &&
              !showFacturacionItems &&
              !showSueldosItems &&
              !showStaticsItems && (
                <>
                  {/* ===== Ventas Rinde ===== */}
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
                  )) && (
                      <>
                        <Nav.Item onClick={() => setSellRinde(!sellRinde)}>
                          <Link to="#" className="nav-link">
                            Ventas Rinde <Caret open={sellRinde} />
                          </Link>
                        </Nav.Item>
                        <Collapse in={sellRinde}>
                          <div className="ml-3 sb-sub">
                            {can("stats:sales.comparative.view") && (
                              <Link to="/sells/totalcomparativo" className="nav-link" onClick={handleLinkClick}>
                                Ventas Comparativo
                              </Link>
                            )}
                            {can("stats:sales.total.view") && (
                              <Link to="/sells/total" className="nav-link" onClick={handleLinkClick}>
                                Ventas Totales
                              </Link>
                            )}
                            {can("stats:sales.byCustomer.view") && (
                              <Link to="/sells/customers" className="nav-link" onClick={handleLinkClick}>
                                Ventas por Cliente
                              </Link>
                            )}
                            {can("stats:sales.deleted.view") && (
                              <Link to="/sells/deleted" className="nav-link" onClick={handleLinkClick}>
                                Ventas Anuladas
                              </Link>
                            )}
                            {can("stats:sales.discount.view") && (
                              <Link to="/sells/discount" className="nav-link" onClick={handleLinkClick}>
                                Ventas con Dcto
                              </Link>
                            )}
                            {can("stats:sales.byArticle.view") && (
                              <Link to="/sells/articles" className="nav-link" onClick={handleLinkClick}>
                                Ventas por Art
                              </Link>
                            )}
                            {can("stats:sales.byUser.view") && (
                              <Link to="/sells/user" className="nav-link" onClick={handleLinkClick}>
                                Ventas por Usuario
                              </Link>
                            )}
                            {can("stats:sales.kgByBranch.view") && (
                              <Link to="/sells/kg_branch" className="nav-link" onClick={handleLinkClick}>
                                Kg por Sucursal
                              </Link>
                            )}
                            {can("stats:sales.ticketCount.view") && (
                              <Link to="/sells/quantity" className="nav-link" onClick={handleLinkClick}>
                                Cantidad Tickets
                              </Link>
                            )}
                          </div>
                        </Collapse>
                      </>
                    )}

                  {/* ===== Info de Caja ===== */}
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
                  )) && (
                      <>
                        <Nav.Item onClick={() => setInfoCaja(!infoCaja)}>
                          <Link to="#" className="nav-link">
                            Info de Caja <Caret open={infoCaja} />
                          </Link>
                        </Nav.Item>
                        <Collapse in={infoCaja}>
                          <div className="ml-3 sb-sub">
                            {can("tesoreria:info.cajas.view") && (
                              <Link to="/info/register" className="nav-link" onClick={handleLinkClick}>
                                Cajas
                              </Link>
                            )}
                            {can("tesoreria:info.gastos.view") && (
                              <Link to="/info/expenses" className="nav-link" onClick={handleLinkClick}>
                                Gastos
                              </Link>
                            )}
                            {can("tesoreria:info.retiros.view") && (
                              <Link to="/info/withdrawals" className="nav-link" onClick={handleLinkClick}>
                                Retiros
                              </Link>
                            )}
                            {can("tesoreria:info.vales.view") && (
                              <Link to="/info/vouchers" className="nav-link" onClick={handleLinkClick}>
                                Vales
                              </Link>
                            )}
                            {can("tesoreria:info.cupones.view") && (
                              <Link to="/info/creditcard" className="nav-link" onClick={handleLinkClick}>
                                Cupones
                              </Link>
                            )}
                            {can("tesoreria:info.sueldos.view") && (
                              <Link to="/info/salaries" className="nav-link" onClick={handleLinkClick}>
                                Sueldos
                              </Link>
                            )}
                            {can("tesoreria:info.ingresos.view") && (
                              <Link to="/info/incomes" className="nav-link" onClick={handleLinkClick}>
                                Ingresos
                              </Link>
                            )}
                            {can("tesoreria:info.cierresZ.view") && (
                              <Link to="/info/cierrez" className="nav-link" onClick={handleLinkClick}>
                                Cierres Z
                              </Link>
                            )}
                            {can("tesoreria:info.ctacte.cliente.view") && (
                              <Link to="/info/balanceaccount" className="nav-link" onClick={handleLinkClick}>
                                Cta. Cte. Cliente
                              </Link>
                            )}
                            {can("tesoreria:info.ctacte.sucursal.view") && (
                              <Link to="/info/balanceaccountbranch" className="nav-link" onClick={handleLinkClick}>
                                Ctas. Ctes. Suc.
                              </Link>
                            )}
                            {can("tesoreria:info.ctacte.detalle.view") && (
                              <Link to="/info/balanceaccountdetail" className="nav-link" onClick={handleLinkClick}>
                                Detalle Cta. Cte.
                              </Link>
                            )}
                            {can("tesoreria:info.caja.detalle.view") && (
                              <Link to="/info/detail" className="nav-link" onClick={handleLinkClick}>
                                Detalle de Caja
                              </Link>
                            )}
                          </div>
                        </Collapse>
                      </>
                    )}

                  {/* ===== Info de Rinde ===== */}
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
                  )) && (
                      <>
                        <Nav.Item onClick={() => setInfoRinde(!infoRinde)}>
                          <Link to="#" className="nav-link">
                            Info de Rinde <Caret open={infoRinde} />
                          </Link>
                        </Nav.Item>
                        <Collapse in={infoRinde}>
                          <div className="ml-3 sb-sub">
                            {can("rinde:formula.view") && (
                              <Link to="/formulas" className="nav-link" onClick={handleLinkClick}>
                                Formulas
                              </Link>
                            )}
                            {can("rinde:formula.create") && (
                              <Link to="/formulas/create" className="nav-link" onClick={handleLinkClick}>
                                Crear Formulas
                              </Link>
                            )}
                            {can("rinde:percent.view") && (
                              <Link to="/percent" className="nav-link" onClick={handleLinkClick}>
                                Porcentajes
                              </Link>
                            )}
                            {can("rinde:percent.update") && (
                              <Link to="/percent_update" className="nav-link" onClick={handleLinkClick}>
                                Actualizar %
                              </Link>
                            )}
                            {can("rinde:prices.view") && (
                              <Link to="/prices" className="nav-link" onClick={handleLinkClick}>
                                Precios
                              </Link>
                            )}
                            {can("rinde:prices.update") && (
                              <Link to="/prices_update" className="nav-link" onClick={handleLinkClick}>
                                Actualizar Precios
                              </Link>
                            )}
                            {can("inventario:inventarios.view") && (
                              <Link to="/inventory/inventories" className="nav-link" onClick={handleLinkClick}>
                                Inventarios
                              </Link>
                            )}
                            {can("inventario:inventarios.create") && (
                              <Link to="/inventory/create" className="nav-link" onClick={handleLinkClick}>
                                Crear Inventario
                              </Link>
                            )}
                            {can("inventario:movimientosInternos.view") && (
                              <Link to="/inventory/movements" className="nav-link" onClick={handleLinkClick}>
                                Mov. Internos
                              </Link>
                            )}
                            {(can("inventario:movimientosOtros.view") || can("inventario:movimientosOtros.create")) && (
                              <>
                                {can("inventario:movimientosOtros.view") && (
                                  <Link to="/inventory/movementsotherslist" className="nav-link" onClick={handleLinkClick}>
                                    Fabrica y Ach
                                  </Link>
                                )}
                                {can("inventario:movimientosOtros.create") && (
                                  <Link to="/inventory/movementsothers" className="nav-link" onClick={handleLinkClick}>
                                    Crear Fabrica y Ach
                                  </Link>
                                )}
                              </>
                            )}
                            {can("rinde:calculo.run") && (
                              <Link to="/inventory/performance" className="nav-link" onClick={handleLinkClick}>
                                Calculo Rinde
                              </Link>
                            )}
                            {can("rinde:list.view") && (
                              <Link to="/inventory/performancelist" className="nav-link" onClick={handleLinkClick}>
                                Rendimientos
                              </Link>
                            )}
                            {can("rinde:list.comparative.view") && (
                              <Link to="/inventory/performancelistcomparative" className="nav-link" onClick={handleLinkClick}>
                                Rendimientos Comparativos
                              </Link>
                            )}
                            {can("rindeGeneral:calculo.run") && (
                              <Link to="/inventory/performancegeneral/" className="nav-link" onClick={handleLinkClick}>
                                Calculo Rinde Consolidado
                              </Link>
                            )}
                            {can("rindeGeneral:list.view") && (
                              <Link to="/inventory/performancegenerallist/" className="nav-link" onClick={handleLinkClick}>
                                Rendimientos Consolidados
                              </Link>
                            )}
                            {can("rindeGeneral:list.global.view") && (
                              <Link to="/inventory/performancelistgral" className="nav-link" onClick={handleLinkClick}>
                                Rendimientos Gral
                              </Link>
                            )}
                            {can("inventario:stock.control.view") && (
                              <Link to="/inventory/stock" className="nav-link" onClick={handleLinkClick}>
                                Control Stock
                              </Link>
                            )}
                          </div>
                        </Collapse>
                      </>
                    )}
                </>

              )}

            {/* ======= REVISIÓN MOVIMIENTOS ======= */}
            {can("inventario:movimientosInternos.view") || can("inventario:movimientosOtros.view") ? (
              <>
                <Nav.Item onClick={() => setMovimientosOtros(!movimientosOtros)} className="sb-top">
                  <Link to="#" className="nav-link">
                    <FiFolder className="sb-ico" />
                    <span>Revisión Movimientos</span>
                    <Caret open={movimientosOtros} />
                  </Link>
                </Nav.Item>
                <Collapse in={movimientosOtros}>
                  <div className="ml-3 sb-sub">
                    {can("inventario:movimientosInternos.view") && (
                      <Link to="/inventory/movements" className="nav-link" onClick={handleLinkClick}>
                        Mov. Internos
                      </Link>
                    )}
                    {can("inventario:movimientosOtros.view") && (
                      <Link to="/inventory/movementsotherslist" className="nav-link" onClick={handleLinkClick}>
                        Fabrica y Ach
                      </Link>
                    )}
                  </div>
                </Collapse>
              </>
            ) : null}
          </>
        )}
      </div>

      {/* Cerrar sesión (anclado abajo) */}
      <div className="sb-footer">
        <Nav.Item>
          <button
            className="nav-link"
            style={{ color: "white", whiteSpace: "nowrap", background: "none", border: "none", padding: 0, cursor: "pointer" }}
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
