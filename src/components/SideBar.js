import { useContext, useState } from "react";
import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import Collapse from "react-bootstrap/Collapse";
import Contexts from "../context/Contexts";
import { useNavigate } from "react-router-dom";
import "../styles/SideBar.css";

const SideBar = ({ toggleSidebar, isMobile }) => {
  const [showMainItems, setShowMainItems] = useState(true);
  const [showReturnButton, setShowReturnButton] = useState(false);
  const [useritem, setUseritem] = useState(false);
  const [proditem, setProditem] = useState(false);
  const [sucitem, setSucitem] = useState(false);
  const [custitem, setCustitem] = useState(false);
  const [waypitem, setWaypayitem] = useState(false);
  const [sellitem, setSellitem] = useState(false);
  const [debtitem, setDebtitem] = useState(false);
  const [ctacteitem, setCtacteitem] = useState(false);
  const [stockitem, setStockitem] = useState(false);
  // const [movitem, setMovitem] = useState(false);
  const [orditem, setOrditem] = useState(false);
  const [receiptitem, setReceiptitem] = useState(false);
  const [sellRinde, setSellRinde] = useState(false);
  const [infoCaja, setInfoCaja] = useState(false);
  const [infoRinde, setInfoRinde] = useState(false);
  const [maintenanceItem, setMaintenanceItem] = useState(false);
  const [customerOneShotItem, setCustomerOneShotItem] = useState(false);
  const [movimientosOtros, setMovimientosOtros] = useState(false);
  const [sellStatics, setSellStatics] = useState(false);

  // Agregamos estados para Mensajes y Horarios
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
    // Verifica si la pantalla es de tamaño móvil
    if (window.innerWidth < 993) {
      toggleSidebar(); // Oculta el sidebar
    }
  };

  return (
    <Nav defaultActiveKey="/" className="flex-column sidebar">
      <Nav.Item>
        <Link
          to="/dashboard"
          className="nav-link"
          style={{ color: "white", whiteSpace: "nowrap" }}
          onClick={handleLinkClick}
        >
          Inicio
        </Link>
      </Nav.Item>

      {context.user &&
        context.user.rol_id !== 4 &&
        context.user.rol_id !== 5 &&
        showMainItems && (
          <>
            {context.user &&
              (context.user.rol_id === 1 || context.user.rol_id === 2) && (
                <>
                  <Nav.Item onClick={toggleMainItems}>
                    <Link
                      to="#"
                      className="nav-link"
                      style={{ color: "white", whiteSpace: "nowrap" }}
                    >
                      Rinde
                    </Link>
                  </Nav.Item>
                  {context.user.rol_id === 1 && (
                    <>
                      <Nav.Item
                        onClick={() => setUseritem(!useritem)}
                        className="nav-item"
                      >
                        <Link
                          to="#"
                          className="nav-link"
                          style={{ color: "white", whiteSpace: "nowrap" }}
                        >
                          Usuarios
                        </Link>
                      </Nav.Item>
                      <Collapse in={useritem}>
                        <div className="ml-3">
                          <Link
                            to="/users/new"
                            className="nav-link"
                            style={{ color: "white", whiteSpace: "nowrap" }}
                            onClick={handleLinkClick}
                          >
                            Crear Usuario
                          </Link>
                          <Link
                            to="/users"
                            className="nav-link"
                            style={{ color: "white", whiteSpace: "nowrap" }}
                            onClick={handleLinkClick}
                          >
                            Listar Usuarios
                          </Link>
                        </div>
                      </Collapse>
                      <Nav.Item onClick={() => setProditem(!proditem)}>
                        <Link
                          to="#"
                          className="nav-link"
                          style={{ color: "white", whiteSpace: "nowrap" }}
                        >
                          Productos
                        </Link>
                      </Nav.Item>
                      <Collapse in={proditem}>
                        <div className="ml-3">
                          <Link
                            to="/products/new"
                            className="nav-link"
                            style={{ color: "white", whiteSpace: "nowrap" }}
                            onClick={handleLinkClick}
                          >
                            Crear Productos
                          </Link>
                          <Link
                            to="/products"
                            className="nav-link"
                            style={{ color: "white", whiteSpace: "nowrap" }}
                            onClick={handleLinkClick}
                          >
                            Listar Productos
                          </Link>
                          <Link
                            to="/products_update"
                            className="nav-link"
                            style={{ color: "white", whiteSpace: "nowrap" }}
                            onClick={handleLinkClick}
                          >
                            Actualizar
                          </Link>
                          <Link
                            to="/products_update_tropa"
                            className="nav-link"
                            style={{ color: "white", whiteSpace: "nowrap" }}
                            onClick={handleLinkClick}
                          >
                            Actualizar por Tropa
                          </Link>
                        </div>
                      </Collapse>
                      <Nav.Item onClick={() => setSucitem(!sucitem)}>
                        <Link
                          to="#"
                          className="nav-link"
                          style={{ color: "white", whiteSpace: "nowrap" }}
                        >
                          Sucursales
                        </Link>
                      </Nav.Item>
                      <Collapse in={sucitem}>
                        <div className="ml-3">
                          <Link
                            to="/branches"
                            className="nav-link"
                            style={{ color: "white", whiteSpace: "nowrap" }}
                            onClick={handleLinkClick}
                          >
                            Listar Sucursales
                          </Link>
                        </div>
                      </Collapse>
                      <Nav.Item onClick={() => setCustitem(!custitem)}>
                        <Link
                          to="#"
                          className="nav-link"
                          style={{ color: "white", whiteSpace: "nowrap" }}
                        >
                          Clientes
                        </Link>
                      </Nav.Item>
                      <Collapse in={custitem}>
                        <div className="ml-3">
                          <Link
                            to="/customers/new"
                            className="nav-link"
                            style={{ color: "white", whiteSpace: "nowrap" }}
                            onClick={handleLinkClick}
                          >
                            Crear Cliente
                          </Link>
                          <Link
                            to="/customers"
                            className="nav-link"
                            style={{ color: "white", whiteSpace: "nowrap" }}
                            onClick={handleLinkClick}
                          >
                            Listar Clientes
                          </Link>
                        </div>
                      </Collapse>
                      <Nav.Item onClick={() => setWaypayitem(!waypitem)}>
                        <Link
                          to="#"
                          className="nav-link"
                          style={{ color: "white", whiteSpace: "nowrap" }}
                        >
                          Formas de Pago
                        </Link>
                      </Nav.Item>
                      <Collapse in={waypitem}>
                        <div className="ml-3">
                          <Link
                            to="/waypays/new"
                            className="nav-link"
                            style={{ color: "white", whiteSpace: "nowrap" }}
                            onClick={handleLinkClick}
                          >
                            Crear Forma Pago
                          </Link>
                          <Link
                            to="/waypays"
                            className="nav-link"
                            style={{ color: "white", whiteSpace: "nowrap" }}
                            onClick={handleLinkClick}
                          >
                            Listar Formas Pago
                          </Link>
                        </div>
                      </Collapse>

                      <Nav.Item>
                        <Link
                          to="/sync"
                          className="nav-link"
                          style={{ color: "white", whiteSpace: "nowrap" }}
                          onClick={handleLinkClick}
                        >
                          Sincronizar
                        </Link>
                      </Nav.Item>
                    </>
                  )}
                </>
              )}

            <Nav.Item onClick={() => setSellitem(!sellitem)}>
              <Link
                to="#"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
              >
                Ventas Medias
              </Link>
            </Nav.Item>
            <Collapse in={sellitem}>
              <div className="ml-3">
                <Link
                  to="/sells/new"
                  className="nav-link"
                  style={{ color: "white", whiteSpace: "nowrap" }}
                  onClick={handleLinkClick}
                >
                  Crear Venta
                </Link>
                <Link
                  to="/sells"
                  className="nav-link"
                  style={{ color: "white", whiteSpace: "nowrap" }}
                  onClick={handleLinkClick}
                >
                  Listar Ventas
                </Link>
              </div>
            </Collapse>
            {context.user && context.user.usuario === "1" && (
              <>
                <Nav.Item onClick={() => setDebtitem(!debtitem)}>
                  <Link
                    to="#"
                    className="nav-link"
                    style={{ color: "white", whiteSpace: "nowrap" }}
                  >
                    Cobranzas
                  </Link>
                </Nav.Item>
                <Collapse in={debtitem}>
                  <div className="ml-3">
                    <Link
                      to="/debts"
                      className="nav-link"
                      style={{ color: "white", whiteSpace: "nowrap" }}
                      onClick={handleLinkClick}
                    >
                      Listar Cobranzas
                    </Link>
                  </div>
                </Collapse>
              </>
            )}
            <Nav.Item onClick={() => setCtacteitem(!ctacteitem)}>
              <Link
                to="#"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
              >
                Cuentas Corrientes
              </Link>
            </Nav.Item>
            <Collapse in={ctacteitem}>
              <div className="ml-3">
                <Link
                  to="/accounts/new"
                  className="nav-link"
                  style={{ color: "white", whiteSpace: "nowrap" }}
                  onClick={handleLinkClick}
                >
                  Registros
                </Link>
                <Link
                  to="/accounts"
                  className="nav-link"
                  style={{ color: "white", whiteSpace: "nowrap" }}
                  onClick={handleLinkClick}
                >
                  Saldos
                </Link>
              </div>
            </Collapse>
            <Nav.Item onClick={() => setStockitem(!stockitem)}>
              <Link
                to="#"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
              >
                Stock
              </Link>
            </Nav.Item>
            <Collapse in={stockitem}>
              <div className="ml-3">
                <Link
                  to="/stock"
                  className="nav-link"
                  style={{ color: "white", whiteSpace: "nowrap" }}
                  onClick={handleLinkClick}
                >
                  Stock Sucurales
                </Link>
                <Link
                  to="/stock/central"
                  className="nav-link"
                  style={{ color: "white", whiteSpace: "nowrap" }}
                  onClick={handleLinkClick}
                >
                  Stock Central
                </Link>
              </div>
            </Collapse>
            <Nav.Item onClick={() => setOrditem(!orditem)}>
              <Link
                to="#"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
              >
                Ordenes
              </Link>
            </Nav.Item>
            <Collapse in={orditem}>
              <div className="ml-3">
                <Link
                  to="/orders/new"
                  className="nav-link"
                  style={{ color: "white", whiteSpace: "nowrap" }}
                  onClick={handleLinkClick}
                >
                  Crear Orden
                </Link>
                <Link
                  to="/orders"
                  className="nav-link"
                  style={{ color: "white", whiteSpace: "nowrap" }}
                  onClick={handleLinkClick}
                >
                  Listar Ordenes
                </Link>
                <Link
                  to="/orders/productsfromexcel"
                  className="nav-link"
                  style={{ color: "white", whiteSpace: "nowrap" }}
                  onClick={handleLinkClick}
                >
                  Crear Orden Excel
                </Link>
              </div>
            </Collapse>
            <Nav.Item onClick={() => setReceiptitem(!receiptitem)}>
              <Link
                to="#"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
              >
                Ingresos
              </Link>
            </Nav.Item>
            <Collapse in={receiptitem}>
              <div className="ml-3">
                <Link
                  to="/receipts/new"
                  className="nav-link"
                  style={{ color: "white", whiteSpace: "nowrap" }}
                >
                  Crear Ingreso
                </Link>
                <Link
                  to="/receipts"
                  className="nav-link"
                  style={{ color: "white", whiteSpace: "nowrap" }}
                  onClick={handleLinkClick}
                >
                  Listar Ingresos
                </Link>
                {context.user && context.user.usuario === "1" && (
                  <Link
                    to="/receipts/products"
                    className="nav-link"
                    style={{ color: "white", whiteSpace: "nowrap" }}
                  >
                    Productos
                  </Link>
                )}
              </div>
            </Collapse>

            <Nav.Item onClick={() => setMaintenanceItem(!maintenanceItem)}>
              <Link
                to="#"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
              >
                Mantenimiento
              </Link>
            </Nav.Item>
            <Collapse in={maintenanceItem}>
              <div className="ml-3">
                {context.user.rol_id !== 4 && (
                  <Link
                    to="/equipos"
                    className="nav-link"
                    style={{ color: "white", whiteSpace: "nowrap" }}
                    onClick={handleLinkClick}
                  >
                    Equipos
                  </Link>
                )}
                <Link
                  to="/mantenimientos"
                  className="nav-link"
                  style={{ color: "white", whiteSpace: "nowrap" }}
                  onClick={handleLinkClick}
                >
                  Mantenimientos
                </Link>
                <Link
                  to="/ordenes-mantenimiento"
                  className="nav-link"
                  style={{ color: "white", whiteSpace: "nowrap" }}
                  onClick={handleLinkClick}
                >
                  Órdenes
                </Link>
                {context.user.rol_id !== 4 && (
                  <Link
                    to="/mantenimiento-preventivo"
                    className="nav-link"
                    style={{ color: "white", whiteSpace: "nowrap" }}
                    onClick={handleLinkClick}
                  >
                    Preventivo
                  </Link>
                )}
              </div>
            </Collapse>
          </>
        )}

      {showReturnButton && (
        <>
          <Nav.Item onClick={togglePreviousItems}>
            <Link
              to="#"
              className="nav-link"
              style={{ color: "white", whiteSpace: "nowrap" }}
            >
              Volver
            </Link>
          </Nav.Item>

          <Nav.Item onClick={() => setSellRinde(!sellRinde)}>
            <Link
              to="#"
              className="nav-link"
              style={{ color: "white", whiteSpace: "nowrap" }}
            >
              Ventas Rinde
            </Link>
          </Nav.Item>
          <Collapse in={sellRinde}>
            <div className="ml-3">
              <Link
                to="/sells/totalcomparativo"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Ventas Comparativo
              </Link>

              <Link
                to="/sells/total"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Ventas Totales
              </Link>

              <Link
                to="/sells/customers"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Ventas por Cliente
              </Link>

              {/* {context.user && context.user.usuario == "admin" && ( */}
              <Link
                to="/sells/deleted"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Ventas Anuladas
              </Link>
              <Link
                to="/sells/discount"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Ventas con Dcto
              </Link>
              <Link
                to="/sells/articles"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Ventas por Art
              </Link>
              <Link
                to="/sells/user"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Ventas por Usuario
              </Link>
              <Link
                to="/sells/kg_user"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Kg por Usuario
              </Link>
              <Link
                to="/sells/kg_branch"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Kg por Sucursal
              </Link>
              <Link
                to="/sells/quantity"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Cantidad Tickets
              </Link>
              {/* )} */}
            </div>
          </Collapse>

          <Nav.Item onClick={() => setInfoCaja(!infoCaja)}>
            <Link
              to="#"
              className="nav-link"
              style={{ color: "white", whiteSpace: "nowrap" }}
            >
              Info de Caja
            </Link>
          </Nav.Item>
          <Collapse in={infoCaja}>
            <div className="ml-3">
              <Link
                to="/info/register"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Cajas
              </Link>
              <Link
                to="/info/expenses"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Gastos
              </Link>
              <Link
                to="/info/withdrawals"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Retiros
              </Link>
              {/* {context.user && context.user.usuario == "admin" && ( */}
              <Link
                to="/info/vouchers"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Vales
              </Link>
              <Link
                to="/info/creditcard"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Cupones
              </Link>
              <Link
                to="/info/salaries"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Sueldos
              </Link>
              <Link
                to="/info/incomes"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Ingresos
              </Link>
              {/* <Link
                to="/info/salesaccount"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
              >
                Vtas Cta. Cte.
              </Link>

              <Link
                to="/info/collectionsaccount"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
              >
                Cob Cta. Cte.
              </Link> */}

              <Link
                to="/info/cashclosure"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Cierres Z
              </Link>

              <Link
                to="/info/balanceaccount"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Cta. Cte. Cliente
              </Link>

              <Link
                to="/info/balanceaccountbranch"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Ctas. Ctes. Suc.
              </Link>

              <Link
                to="/info/balanceaccountdetail"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Detalle Cta. Cte.
              </Link>

              <Link
                to="/info/detail"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Detalle de Caja
              </Link>
            </div>
          </Collapse>

          <Nav.Item onClick={() => setInfoRinde(!infoRinde)}>
            <Link
              to="#"
              className="nav-link"
              style={{ color: "white", whiteSpace: "nowrap" }}
            >
              Info de Rinde
            </Link>
          </Nav.Item>
          <Collapse in={infoRinde}>
            <div className="ml-3">
              <Link
                to="/formulas"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Formulas
              </Link>
              <Link
                to="/formulas/create"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Crear Formulas
              </Link>

              <Link
                to="/percent"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Porcentajes
              </Link>
              <Link
                to="/percent_update"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Actualizar %
              </Link>
              <Link
                to="/prices"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Precios
              </Link>
              <Link
                to="/prices_update"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Actualizar Precios
              </Link>
              <Link
                to="/inventory/inventories"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Inventarios
              </Link>
              <Link
                to="/inventory/create"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Crear Inventario
              </Link>
              <Link
                to="/inventory/movements"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Mov. Internos
              </Link>
              <Link
                to="/inventory/movementsotherslist"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Fabrica y Ach
              </Link>
              <Link
                to="/inventory/movementsothers"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Crear Fabrica y Ach
              </Link>
              <Link
                to="/inventory/performance"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Calculo Rinde
              </Link>
              <Link
                to="/inventory/performancelist"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Rendimientos
              </Link>
              <Link
                to="/inventory/performancelistcomparative"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Rendimientos Comparativos
              </Link>
              <Link
                to="/inventory/stock"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Control Stock
              </Link>
            </div>
          </Collapse>
        </>
      )}

      {(context.user.rol_id === 4 || context.user.rol_id === 5) && (
        <>
          <Nav.Item onClick={() => setMaintenanceItem(!maintenanceItem)}>
            <Link
              to="#"
              className="nav-link"
              style={{ color: "white", whiteSpace: "nowrap" }}
            >
              Mantenimiento
            </Link>
          </Nav.Item>
          <Collapse in={maintenanceItem}>
            <div className="ml-3">
              {context.user.rol_id !== 4 && (
                <Link
                  to="/equipos"
                  className="nav-link"
                  style={{ color: "white", whiteSpace: "nowrap" }}
                  onClick={handleLinkClick}
                >
                  Equipos
                </Link>
              )}
              <Link
                to="/mantenimientos"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Mantenimientos
              </Link>
              <Link
                to="/ordenes-mantenimiento"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Órdenes
              </Link>
              {context.user.rol_id !== 4 && (
                <Link
                  to="/mantenimiento-preventivo"
                  className="nav-link"
                  style={{ color: "white", whiteSpace: "nowrap" }}
                  onClick={handleLinkClick}
                >
                  Preventivo
                </Link>
              )}
            </div>
          </Collapse>
        </>
      )}

      {(context.user.rol_id === 1 || context.user.rol_id === 4) && (
        <>
          {/* Sección de Clientes OneShot */}
          <Nav.Item
            onClick={() => setCustomerOneShotItem(!customerOneShotItem)}
          >
            <Link
              to="#"
              className="nav-link"
              style={{ color: "white", whiteSpace: "nowrap" }}
            >
              Clientes OneShot
            </Link>
          </Nav.Item>
          <Collapse in={customerOneShotItem}>
            <div className="ml-3">
              <Link
                to="/clientesoneshot"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Listar Clientes
              </Link>
              <Link
                to="/clientesoneshot/new"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Crear Cliente
              </Link>

            </div>
          </Collapse>

          <Nav.Item
            onClick={() => setMovimientosOtros(!movimientosOtros)}
          >
            <Link
              to="#"
              className="nav-link"
              style={{ color: "white", whiteSpace: "nowrap" }}
            >
              Movimientos
            </Link>
          </Nav.Item>
          <Collapse in={movimientosOtros}>
            <div className="ml-3">
              <Link
                to="/inventory/movements"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Mov. Internos
              </Link>
              <Link
                to="/inventory/movementsotherslist"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Fabrica y Ach
              </Link>
            </div>
          </Collapse>
        </>
      )}


      {(context.user.rol_id === 4) && (
        <>
          {/* Sección de Clientes OneShot */}
          <Nav.Item onClick={() => setOrditem(!orditem)}>
            <Link
              to="#"
              className="nav-link"
              style={{ color: "white", whiteSpace: "nowrap" }}
            >
              Ordenes
            </Link>
          </Nav.Item>
          <Collapse in={orditem}>
            <div className="ml-3">
              <Link
                to="/orders"
                className="nav-link"
                style={{ color: "white", whiteSpace: "nowrap" }}
                onClick={handleLinkClick}
              >
                Listar Ordenes
              </Link>
            </div>
          </Collapse>

        </>
      )}


      <Nav.Item>
        <Link
          to="#"
          className="nav-link"
          style={{ color: "white", whiteSpace: "nowrap" }}
          onClick={() => {
            context.logout();
            navigate("/login");
          }}
        >
          Cerrar Sesión
        </Link>
      </Nav.Item>
    </Nav>
  );
};

export default SideBar;
