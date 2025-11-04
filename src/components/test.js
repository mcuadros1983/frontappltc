import { useContext, useState } from "react";
import { Nav } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Collapse from "react-bootstrap/Collapse";
import Contexts from "../context/Contexts";
import "../styles/SideBar.css";

// Icons
import { FiHome, FiSettings, FiBarChart2, FiPercent, FiLogOut, FiArrowLeftCircle, FiTool, FiUsers, FiFolder, FiLayers, FiChevronsRight, FiChevronDown, FiChevronRight, FiCalendar } from "react-icons/fi";
import { TbReceiptTax } from "react-icons/tb";
import { LuWallet } from "react-icons/lu";
import { MdPointOfSale } from "react-icons/md";
import { BsBuildings, BsCreditCard2Front, BsBank } from "react-icons/bs";

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

  const context = useContext(Contexts.UserContext);
  const navigate = useNavigate();

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

        {/* ===== HOME: BLOQUE PRINCIPAL PARA ROL 1 ===== */}
        {context.user &&
          context.user.rol_id === 1 &&
          showMainItems &&
          !showGestionItems &&
          !showReturnButton &&
          !showConfigItems &&
          !showConciliacionItems && (
            <>
              {/* CONFIGURACIÓN */}
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

              {/* AGENDA (acceso directo) */}
              <Link
                to="/agenda"
                className="nav-link sb-top"
                onClick={handleLinkClick}
              >
                <FiCalendar className="sb-ico" />
                <span>Agenda</span>
              </Link>

              {/* ESTADÍSTICAS */}
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

              {/* IVA */}
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

              {/* ASISTENCIA */}
              <Nav.Item
                onClick={() => {
                  setShowMainItems(false);
                  setShowAsistenciaItems(true);
                  setShowReturnButton(true);
                }}
                className="sb-top"
              >
                <Link to="#" className="nav-link">
                  <TbReceiptTax className="sb-ico" />
                  <span>Asistencia</span>
                  <FiChevronsRight className="sb-right" />
                </Link>


              </Nav.Item>

              {/* TESORERÍA */}
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

              {/* FACTURACIÓN */}
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

              {/* SUELDOS */}
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
            </>
          )}

        {/* GESTIÓN DE MEDIAS (roles 1/2/3) */}
        {context.user &&
          (context.user.rol_id === 1 ||
            context.user.rol_id === 2 ||
            context.user.rol_id === 3) &&
          showMainItems &&
          !showGestionItems &&
          !showReturnButton && (
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

        {/* Bloque visible para todos excepto 4 y 5 */}
        {context.user &&
          context.user.rol_id !== 4 &&
          context.user.rol_id !== 5 &&
          showMainItems && (
            <>
              {(context.user.rol_id === 1 || context.user.rol_id === 2) && (
                <Nav.Item onClick={toggleMainItems} className="sb-top">
                  <Link to="#" className="nav-link">
                    <BsBuildings className="sb-ico" />
                    <span>Info Sucursales</span>
                    <FiChevronsRight className="sb-right" />
                  </Link>
                </Nav.Item>
              )}

              {/* MANTENIMIENTO */}
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
              <Collapse in={maintenanceItem}>
                <div className="ml-3 sb-sub">
                  {context.user.rol_id !== 4 && (
                    <Link to="/equipos" className="nav-link" onClick={handleLinkClick}>
                      Equipos
                    </Link>
                  )}
                  <Link to="/mantenimientos" className="nav-link" onClick={handleLinkClick}>
                    Mantenimientos
                  </Link>
                  <Link to="/ordenes-mantenimiento" className="nav-link" onClick={handleLinkClick}>
                    Órdenes
                  </Link>
                  {context.user.rol_id !== 4 && (
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

            {/* ======= CONCILIACIÓN ======= */}
            {showConciliacionItems && (
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
            )}

            {/* ======= GESTIÓN DE MEDIAS ======= */}
            {showGestionItems && (
              <>
                <Link to="/registrohacienda" className="nav-link" onClick={handleLinkClick}>
                  Registro Hacienda
                </Link>

                <Nav.Item onClick={() => setSellitem(!sellitem)}>
                  <Link to="#" className="nav-link">
                    Ventas Medias <Caret open={sellitem} />
                  </Link>
                </Nav.Item>
                <Collapse in={sellitem}>
                  <div className="ml-3 sb-sub">
                    <Link to="/sells/new" className="nav-link" onClick={handleLinkClick}>
                      Crear Venta
                    </Link>
                    <Link to="/sells" className="nav-link" onClick={handleLinkClick}>
                      Listar Ventas
                    </Link>
                  </div>
                </Collapse>

                {(context.user.rol_id === 1 || context.user.rol_id === 2) && (
                  <>
                    <Nav.Item onClick={() => setProditem(!proditem)}>
                      <Link to="#" className="nav-link">
                        Productos <Caret open={proditem} />
                      </Link>
                    </Nav.Item>
                    <Collapse in={proditem}>
                      <div className="ml-3 sb-sub">
                        <Link to="/products/new" className="nav-link" onClick={handleLinkClick}>
                          Crear Productos
                        </Link>
                        <Link to="/products" className="nav-link" onClick={handleLinkClick}>
                          Listar Productos
                        </Link>
                        <Link to="/products_update" className="nav-link" onClick={handleLinkClick}>
                          Actualizar
                        </Link>
                        <Link to="/products_update_tropa" className="nav-link" onClick={handleLinkClick}>
                          Actualizar por Tropa
                        </Link>
                        <Link to="/products/verificar-tropa" className="nav-link">
                          Verificar por Tropa
                        </Link>
                      </div>
                    </Collapse>

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

                    <Nav.Item onClick={() => setCustitem(!custitem)}>
                      <Link to="#" className="nav-link">
                        Clientes <Caret open={custitem} />
                      </Link>
                    </Nav.Item>
                    <Collapse in={custitem}>
                      <div className="ml-3 sb-sub">
                        <Link to="/customers/new" className="nav-link" onClick={handleLinkClick}>
                          Crear Cliente
                        </Link>
                        <Link to="/customers" className="nav-link" onClick={handleLinkClick}>
                          Listar Clientes
                        </Link>
                      </div>
                    </Collapse>

                    <Nav.Item onClick={() => setWaypayitem(!waypitem)}>
                      <Link to="#" className="nav-link">
                        Formas de Pago <Caret open={waypitem} />
                      </Link>
                    </Nav.Item>
                    <Collapse in={waypitem}>
                      <div className="ml-3 sb-sub">
                        <Link to="/waypays/new" className="nav-link" onClick={handleLinkClick}>
                          Crear Forma Pago
                        </Link>
                        <Link to="/waypays" className="nav-link" onClick={handleLinkClick}>
                          Listar Formas Pago
                        </Link>
                      </div>
                    </Collapse>
                  </>
                )}

                {context.user.usuario === "1" && (
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

                <Nav.Item onClick={() => setCtacteitem(!ctacteitem)}>
                  <Link to="#" className="nav-link">
                    Cuentas Corrientes <Caret open={ctacteitem} />
                  </Link>
                </Nav.Item>
                <Collapse in={ctacteitem}>
                  <div className="ml-3 sb-sub">
                    <Link to="/accounts/new" className="nav-link" onClick={handleLinkClick}>
                      Registros
                    </Link>
                    <Link to="/accounts" className="nav-link" onClick={handleLinkClick}>
                      Saldos
                    </Link>
                  </div>
                </Collapse>

                <Nav.Item onClick={() => setStockitem(!stockitem)}>
                  <Link to="#" className="nav-link">
                    Stock <Caret open={stockitem} />
                  </Link>
                </Nav.Item>
                <Collapse in={stockitem}>
                  <div className="ml-3 sb-sub">
                    <Link to="/stock" className="nav-link" onClick={handleLinkClick}>
                      Stock Sucursales
                    </Link>
                    <Link to="/stock/central" className="nav-link" onClick={handleLinkClick}>
                      Stock Central
                    </Link>
                  </div>
                </Collapse>

                <Nav.Item onClick={() => setOrditem(!orditem)}>
                  <Link to="#" className="nav-link">
                    <FiFolder className="sb-ico" />
                    <span>Ordenes</span>
                    <Caret open={orditem} />
                  </Link>
                </Nav.Item>
                <Collapse in={orditem}>
                  <div className="ml-3 sb-sub">
                    {context.user.rol_id !== 4 && (
                      <Link to="/orders/new" className="nav-link" onClick={handleLinkClick}>
                        Crear Orden
                      </Link>
                    )}
                    <Link to="/orders" className="nav-link" onClick={handleLinkClick}>
                      Listar Ordenes
                    </Link>
                    <Link to="/orders/productsfromexcel" className="nav-link" onClick={handleLinkClick}>
                      Crear Orden Excel
                    </Link>
                  </div>
                </Collapse>

                <Nav.Item onClick={() => setReceiptitem(!receiptitem)}>
                  <Link to="#" className="nav-link">
                    Ingresos <Caret open={receiptitem} />
                  </Link>
                </Nav.Item>
                <Collapse in={receiptitem}>
                  <div className="ml-3 sb-sub">
                    <Link to="/receipts/new" className="nav-link" onClick={handleLinkClick}>
                      Crear Ingreso
                    </Link>
                    <Link to="/receipts" className="nav-link" onClick={handleLinkClick}>
                      Listar Ingresos
                    </Link>
                    {context.user.usuario === "1" && (
                      <Link to="/receipts/products" className="nav-link">
                        Productos
                      </Link>
                    )}
                  </div>
                </Collapse>
              </>
            )}

            {/* ======= ESTADÍSTICAS ======= */}
            {showStaticsItems && (
              <>
                <Link to="/precioshistoricos" className="nav-link">
                  Precios Historicos
                </Link>

                <Link to="/sells/totalcomparativo" className="nav-link" onClick={handleLinkClick}>
                  Ventas Comparativo
                </Link>

                <Link to="/sells/comparativorangos" className="nav-link" onClick={handleLinkClick}>
                  Ventas entre rangos
                </Link>

                <Link to="/sells/graficoventas" className="nav-link" onClick={handleLinkClick}>
                  Grafico Comparativo
                </Link>

                <Link to="/sells/total" className="nav-link" onClick={handleLinkClick}>
                  Ventas Totales
                </Link>

                <Link to="/sells/customers" className="nav-link" onClick={handleLinkClick}>
                  Ventas por Cliente
                </Link>

                <Link to="/sells/deleted" className="nav-link" onClick={handleLinkClick}>
                  Ventas Anuladas
                </Link>
                <Link to="/sells/discount" className="nav-link" onClick={handleLinkClick}>
                  Ventas con Dcto
                </Link>
                <Link to="/sells/articles" className="nav-link" onClick={handleLinkClick}>
                  Ventas por Art
                </Link>
                <Link to="/sells/user" className="nav-link" onClick={handleLinkClick}>
                  Ventas por Usuario
                </Link>
                <Link to="/sells/kg_branch" className="nav-link" onClick={handleLinkClick}>
                  Kg por Sucursal
                </Link>
                <Link to="/sells/quantity" className="nav-link" onClick={handleLinkClick}>
                  Cantidad Tickets
                </Link>

                <Link to="/inventory/stock" className="nav-link" onClick={handleLinkClick}>
                  Stock
                </Link>
              </>
            )}

            {/* ======= IVA ======= */}
            {showIVAItems && (
              <>
                <Nav.Item onClick={() => setLibroIvaItem(!libroIvaItem)}>
                  <Link to="#" className="nav-link">
                    Libros IVA <Caret open={libroIvaItem} />
                  </Link>
                </Nav.Item>
                <Collapse in={libroIvaItem}>
                  <div className="ml-3 sb-sub">
                    <Link to="/librosiva/new" className="nav-link" onClick={handleLinkClick}>
                      Crear Libro IVA
                    </Link>
                    <Link to="/librosiva" className="nav-link" onClick={handleLinkClick}>
                      Listar Libros IVA
                    </Link>
                  </div>
                </Collapse>

                <Link to="/compraproyectada" className="nav-link">
                  Compras Proyectadas
                </Link>

                <Link to="/ivaproyeccion" className="nav-link">
                  Proyección del IVA
                </Link>
              </>
            )}

            {/* ======= ASISTENCIA ======= */}

            {showAsistenciaItems && (
              <>
                <Link to="/dashboardasistencia" className="nav-link">
                  Dashboard Asistencia
                </Link>

                <Link to="/asistencias" className="nav-link">
                  Listar Asistencias
                </Link>

                <Link to="/dispositivosasistencias" className="nav-link">
                  Dispositivos
                </Link>

                <Link to="/empleadosasistencias" className="nav-link">
                  Empleados
                </Link>

                <Link to="/sucursalesasistencias" className="nav-link">
                  Sucursales
                </Link>

                <Link to="/turnosasistencias" className="nav-link">
                  Turnos
                </Link>

                <Link to="/parametrosasistencias" className="nav-link">
                  Parametros
                </Link>
              </>
            )}


            {/* ======= TESORERÍA ======= */}
            {showCajaItems && (
              <>
                <Nav.Item onClick={() => setCategoriaTesoreriaItem(!categoriaTesoreriaItem)}>
                  <Link to="#" className="nav-link">
                    Categorias <Caret open={categoriaTesoreriaItem} />
                  </Link>
                </Nav.Item>
                <Collapse in={categoriaTesoreriaItem}>
                  <div className="ml-3 sb-sub">
                    <Link to="/categoriaingreso" className="nav-link" onClick={handleLinkClick}>
                      Categorias Ingreso
                    </Link>
                    <Link to="/categoriaegreso" className="nav-link" onClick={handleLinkClick}>
                      Categorias Egreso
                    </Link>
                  </div>
                </Collapse>

                <Nav.Item onClick={() => setCajaItem(!cajaItem)}>
                  <Link to="#" className="nav-link">
                    Caja <Caret open={cajaItem} />
                  </Link>
                </Nav.Item>
                <Collapse in={cajaItem}>
                  <div className="ml-3 sb-sub">
                    <Link to="/tesoreria/cajas/apertura" className="nav-link" onClick={handleLinkClick}>
                      Apertura de Caja
                    </Link>
                    <Link to="/tesoreria/movimientos-caja-tesoreria" className="nav-link" onClick={handleLinkClick}>
                      Movimientos de Caja
                    </Link>
                    <Link to="/tesoreria/retirossucursales" className="nav-link" onClick={handleLinkClick}>
                      Registro de Retiros
                    </Link>
                  </div>
                </Collapse>

                <Nav.Item onClick={() => setMovBancoItem(!movBancoItem)}>
                  <Link to="#" className="nav-link">
                    Bancos <Caret open={movBancoItem} />
                  </Link>
                </Nav.Item>
                <Collapse in={movBancoItem}>
                  <div className="ml-3 sb-sub">
                    <Link to="/tesoreria/movimientos-banco-tesoreria" className="nav-link" onClick={handleLinkClick}>
                      Movimientos bancarios
                    </Link>
                    <Link to="/tesoreria/movimientos-banco-tesoreria-excel" className="nav-link" onClick={handleLinkClick}>
                      Movimientos bancarios Excel
                    </Link>
                  </div>
                </Collapse>

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

                <Nav.Item onClick={() => setGastosEstimadosItem(!gastosEstimadosItem)}>
                  <Link to="#" className="nav-link">
                    Gastos Estimados <Caret open={gastosEstimadosItem} />
                  </Link>
                </Nav.Item>
                <Collapse in={gastosEstimadosItem}>
                  <div className="ml-3 sb-sub">
                    <Link to="/gastosestimados" className="nav-link" onClick={handleLinkClick}>
                      Listar Gastos Estimados
                    </Link>
                    <Link to="/importargastosestimados" className="nav-link" onClick={handleLinkClick}>
                      Importar Gastos Estimados
                    </Link>
                  </div>
                </Collapse>

                <Link to="/vencimientos" className="nav-link">
                  Vencimientos
                </Link>
              </>
            )}

            {/* ======= FACTURACIÓN ======= */}
            {showFacturacionItems && (
              <>
                <Nav.Item onClick={() => setVentasFacturacionItem(!ventasFacturacionItem)}>
                  <Link to="#" className="nav-link">
                    Ventas <Caret open={ventasFacturacionItem} />
                  </Link>
                </Nav.Item>
                <Collapse in={ventasFacturacionItem}>
                  <div className="ml-3 sb-sub">
                    <Link to="/ventasfacturacion/clientes" className="nav-link" onClick={handleLinkClick}>
                      Clientes
                    </Link>
                    <Link to="/ventasfacturacion/facturacion" className="nav-link" onClick={handleLinkClick}>
                      Facturación
                    </Link>
                  </div>
                </Collapse>

                <Nav.Item onClick={() => setComprasFacturacionItem(!comprasFacturacionItem)}>
                  <Link to="#" className="nav-link">
                    Compras <Caret open={comprasFacturacionItem} />
                  </Link>
                </Nav.Item>
                <Collapse in={comprasFacturacionItem}>
                  <div className="ml-3 sb-sub">
                    <Link to="/comprasfacturacion/proveedores" className="nav-link" onClick={handleLinkClick}>
                      Proveedores
                    </Link>
                    <Link to="/comprasfacturacion/facturacion" className="nav-link" onClick={handleLinkClick}>
                      Facturación
                    </Link>
                    <Link to="/comprasfacturacion/ordendepago" className="nav-link" onClick={handleLinkClick}>
                      Pagos a Proveedores
                    </Link>
                    <Link to="/comprasfacturacion/ctasctes" className="nav-link" onClick={handleLinkClick}>
                      Ctas. Ctes. Proveedores
                    </Link>
                    <Link to="/sitfinanciera" className="nav-link" onClick={handleLinkClick}>
                      Situación Financiera
                    </Link>
                  </div>
                </Collapse>
              </>
            )}

            {/* ======= SUELDOS ======= */}
            {showSueldosItems && (
              <>


                <div className="ml-3 sb-sub">
                  <Link to="/sueldostesoreria/asignartelefono" className="nav-link" onClick={handleLinkClick}>
                    Asignar Teléfono
                  </Link>
                  <Link to="/sueldostesoreria/asignardatosempleado" className="nav-link" onClick={handleLinkClick}>
                    Asignar Datos a Empleado
                  </Link>
                  <Link to="/sueldostesoreria/adicionalfijotipo" className="nav-link" onClick={handleLinkClick}>
                    Tipos de adicional fijos
                  </Link>
                  <Link to="/sueldostesoreria/asignaradicionalfijo" className="nav-link" onClick={handleLinkClick}>
                    Asignar Adicional Fijo
                  </Link>
                  <Link to="/sueldostesoreria/recibosimportmanager" className="nav-link" onClick={handleLinkClick}>
                    Importar items Recibo
                  </Link>
                  <Link to="/sueldostesoreria/importaritemsvariables" className="nav-link" onClick={handleLinkClick}>
                    Importar Vales y Adelantos
                  </Link>
                  <Link to="/sueldostesoreria/listaradicionalesvariables" className="nav-link" onClick={handleLinkClick}>
                    Listar Adicionales Variables
                  </Link>
                  <Link to="/sueldostesoreria/liquidacionmensual" className="nav-link" onClick={handleLinkClick}>
                    Liquidación Mensual
                  </Link>
                  <Link to="/sueldostesoreria/pagodesueldos" className="nav-link" onClick={handleLinkClick}>
                    Pago de Sueldos (Tes)
                  </Link>
                  <Link to="/sueldostesoreria/adelantos" className="nav-link" onClick={handleLinkClick}>
                    Adelantos (Tes)
                  </Link>
                </div>

              </>
            )}

            {/* ======= RINDE (si no estás en ninguna otra sub-sección) ======= */}
            {!showGestionItems &&
              !showConfigItems &&
              !showConciliacionItems &&
              !showIVAItems &&
              !showAsistenciaItems &&
              !showCajaItems &&
              !showFacturacionItems &&
              !showSueldosItems &&
              !showStaticsItems && (
                <>
                  <Nav.Item onClick={() => setSellRinde(!sellRinde)}>
                    <Link to="#" className="nav-link">
                      Ventas Rinde <Caret open={sellRinde} />
                    </Link>
                  </Nav.Item>
                  <Collapse in={sellRinde}>
                    <div className="ml-3 sb-sub">
                      <Link to="/sells/totalcomparativo" className="nav-link" onClick={handleLinkClick}>
                        Ventas Comparativo
                      </Link>
                      <Link to="/sells/total" className="nav-link" onClick={handleLinkClick}>
                        Ventas Totales
                      </Link>
                      <Link to="/sells/customers" className="nav-link" onClick={handleLinkClick}>
                        Ventas por Cliente
                      </Link>
                      <Link to="/sells/deleted" className="nav-link" onClick={handleLinkClick}>
                        Ventas Anuladas
                      </Link>
                      <Link to="/sells/discount" className="nav-link" onClick={handleLinkClick}>
                        Ventas con Dcto
                      </Link>
                      <Link to="/sells/articles" className="nav-link" onClick={handleLinkClick}>
                        Ventas por Art
                      </Link>
                      <Link to="/sells/user" className="nav-link" onClick={handleLinkClick}>
                        Ventas por Usuario
                      </Link>
                      <Link to="/sells/kg_branch" className="nav-link" onClick={handleLinkClick}>
                        Kg por Sucursal
                      </Link>
                      <Link to="/sells/quantity" className="nav-link" onClick={handleLinkClick}>
                        Cantidad Tickets
                      </Link>
                    </div>
                  </Collapse>

                  <Nav.Item onClick={() => setInfoCaja(!infoCaja)}>
                    <Link to="#" className="nav-link">
                      Info de Caja <Caret open={infoCaja} />
                    </Link>
                  </Nav.Item>
                  <Collapse in={infoCaja}>
                    <div className="ml-3 sb-sub">
                      <Link to="/info/register" className="nav-link" onClick={handleLinkClick}>
                        Cajas
                      </Link>
                      <Link to="/info/expenses" className="nav-link" onClick={handleLinkClick}>
                        Gastos
                      </Link>
                      <Link to="/info/withdrawals" className="nav-link" onClick={handleLinkClick}>
                        Retiros
                      </Link>
                      <Link to="/info/vouchers" className="nav-link" onClick={handleLinkClick}>
                        Vales
                      </Link>
                      <Link to="/info/creditcard" className="nav-link" onClick={handleLinkClick}>
                        Cupones
                      </Link>
                      <Link to="/info/salaries" className="nav-link" onClick={handleLinkClick}>
                        Sueldos
                      </Link>
                      <Link to="/info/incomes" className="nav-link" onClick={handleLinkClick}>
                        Ingresos
                      </Link>
                      <Link to="/info/cierrez" className="nav-link" onClick={handleLinkClick}>
                        Cierres Z
                      </Link>
                      <Link to="/info/balanceaccount" className="nav-link" onClick={handleLinkClick}>
                        Cta. Cte. Cliente
                      </Link>
                      <Link to="/info/balanceaccountbranch" className="nav-link" onClick={handleLinkClick}>
                        Ctas. Ctes. Suc.
                      </Link>
                      <Link to="/info/balanceaccountdetail" className="nav-link" onClick={handleLinkClick}>
                        Detalle Cta. Cte.
                      </Link>
                      <Link to="/info/detail" className="nav-link" onClick={handleLinkClick}>
                        Detalle de Caja
                      </Link>
                    </div>
                  </Collapse>

                  <Nav.Item onClick={() => setInfoRinde(!infoRinde)}>
                    <Link to="#" className="nav-link">
                      Info de Rinde <Caret open={infoRinde} />
                    </Link>
                  </Nav.Item>
                  <Collapse in={infoRinde}>
                    <div className="ml-3 sb-sub">
                      <Link to="/formulas" className="nav-link" onClick={handleLinkClick}>
                        Formulas
                      </Link>
                      <Link to="/formulas/create" className="nav-link" onClick={handleLinkClick}>
                        Crear Formulas
                      </Link>
                      <Link to="/percent" className="nav-link" onClick={handleLinkClick}>
                        Porcentajes
                      </Link>
                      <Link to="/percent_update" className="nav-link" onClick={handleLinkClick}>
                        Actualizar %
                      </Link>
                      <Link to="/prices" className="nav-link" onClick={handleLinkClick}>
                        Precios
                      </Link>
                      <Link to="/prices_update" className="nav-link" onClick={handleLinkClick}>
                        Actualizar Precios
                      </Link>
                      <Link to="/inventory/inventories" className="nav-link" onClick={handleLinkClick}>
                        Inventarios
                      </Link>
                      <Link to="/inventory/create" className="nav-link" onClick={handleLinkClick}>
                        Crear Inventario
                      </Link>
                      <Link to="/inventory/movements" className="nav-link" onClick={handleLinkClick}>
                        Mov. Internos
                      </Link>
                      <Link to="/inventory/movementsotherslist" className="nav-link" onClick={handleLinkClick}>
                        Fabrica y Ach
                      </Link>
                      <Link to="/inventory/movementsothers" className="nav-link" onClick={handleLinkClick}>
                        Crear Fabrica y Ach
                      </Link>
                      <Link to="/inventory/performance" className="nav-link" onClick={handleLinkClick}>
                        Calculo Rinde
                      </Link>
                      <Link to="/inventory/performancelist" className="nav-link" onClick={handleLinkClick}>
                        Rendimientos
                      </Link>
                      <Link to="/inventory/performancelistcomparative" className="nav-link" onClick={handleLinkClick}>
                        Rendimientos Comparativos
                      </Link>
                      <Link to="/inventory/performancegeneral/" className="nav-link" onClick={handleLinkClick}>
                        Calculo Rinde Consolidado
                      </Link>
                      <Link to="/inventory/performancegenerallist/" className="nav-link" onClick={handleLinkClick}>
                        Rendimientos Consolidados
                      </Link>
                      <Link to="/inventory/performancelistgral" className="nav-link" onClick={handleLinkClick}>
                        Rendimientos Gral
                      </Link>
                      <Link to="/inventory/stock" className="nav-link" onClick={handleLinkClick}>
                        Control Stock
                      </Link>
                    </div>
                  </Collapse>
                </>
              )}
          </>
        )}

        {/* NUEVOS CLIENTES / REVISION MOVIMIENTOS (roles 1 y 4) */}
        {(context.user.rol_id === 1 || context.user.rol_id === 4) && (
          <>
            <Nav.Item onClick={() => setCustomerOneShotItem(!customerOneShotItem)} className="sb-top">
              <Link to="#" className="nav-link">
                <FiUsers className="sb-ico" />
                <span>Nuevos Clientes</span>
                <Caret open={customerOneShotItem} />
              </Link>
            </Nav.Item>
            <Collapse in={customerOneShotItem}>
              <div className="ml-3 sb-sub">
                <Link to="/clientesoneshot" className="nav-link" onClick={handleLinkClick}>
                  Listar Clientes
                </Link>
                <Link to="/clientesoneshot/new" className="nav-link" onClick={handleLinkClick}>
                  Crear Cliente
                </Link>
              </div>
            </Collapse>

            <Nav.Item onClick={() => setMovimientosOtros(!movimientosOtros)} className="sb-top">
              <Link to="#" className="nav-link">
                <FiFolder className="sb-ico" />
                <span>Revisión Movimientos</span>
                <Caret open={movimientosOtros} />
              </Link>
            </Nav.Item>
            <Collapse in={movimientosOtros}>
              <div className="ml-3 sb-sub">
                <Link to="/inventory/movements" className="nav-link" onClick={handleLinkClick}>
                  Mov. Internos
                </Link>
                <Link to="/inventory/movementsotherslist" className="nav-link" onClick={handleLinkClick}>
                  Fabrica y Ach
                </Link>
              </div>
            </Collapse>
          </>
        )}

        {/* Rol 4: Ordenes */}
        {context.user.rol_id === 4 && (
          <>
            <Nav.Item onClick={() => setOrditem(!orditem)}>
              <Link to="#" className="nav-link">
                <FiFolder className="sb-ico" />
                <span>Ordenes</span>
                <Caret open={orditem} />
              </Link>
            </Nav.Item>
            <Collapse in={orditem}>
              <div className="ml-3 sb-sub">
                <Link to="/orders" className="nav-link" onClick={handleLinkClick}>
                  Listar Ordenes
                </Link>
              </div>
            </Collapse>
          </>
        )}

      </div>

      {/* Cerrar sesión (anclado abajo) */}
      <div className="sb-footer">
        <Nav.Item>
          <Link
            to="#"
            className="nav-link sb-top sb-logout"
            onClick={() => {
              context.logout();
              navigate("/login");
            }}
          >
            <FiLogOut className="sb-ico" />
            <span>Cerrar Sesión</span>
          </Link>
        </Nav.Item>
      </div>
    </Nav>
  );
};

export default SideBar;
