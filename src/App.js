import { Routes, Route } from "react-router-dom";
import ProductList from "./pages/gmedias/ProductList";
import ProductUpdate from "./pages/gmedias/ProductUpdate";
import ProductUpdateTropa from "./pages/gmedias/ProductUpdateTropa.js";
import ProductForm from "./pages/gmedias/ProductForm";
import BranchForm from "./pages/gmedias/BranchForm";
import BranchList from "./pages/gmedias/BranchList";
import StockList from "./pages/gmedias/StockList";
import OrderForm from "./pages/gmedias/OrderForm";
import OrderList from "./pages/gmedias/OrderList";
import OrderItem from "./pages/gmedias/OrderItem";
import ReceiptForm from "./pages/gmedias/ReceiptForm";
import ReceiptList from "./pages/gmedias/ReceiptList";
import ReceiptItem from "./pages/gmedias/ReceiptItem";
import ReceiptProducts from "./pages/gmedias/ReceiptProducts";
// import NotFoundPages from "./pages/gmedias/NotFoundPages";
// import Navigation from "./components/Navbar";
// import SideBar from "./components/SideBar";
// import { Container, Row, Col } from "react-bootstrap";
import Main from "./pages/Main";
import StockProductsList from "./pages/gmedias/StockProductsList";
import StockCentralList from "./pages/gmedias/StockCentralList";
import CustomerList from "./pages/gmedias/CustomerList";
import CustomerForm from "./pages/gmedias/CustomerForm";
import CustomerOneShotList from "./pages/caja/customerOneShotList";
import CustomerOneShotForm from "./pages/caja/customerOneShotForm";
import SellList from "./pages/gmedias/SellList";
import SellForm from "./pages/gmedias/SellForm";
import SellItem from "./pages/gmedias/SellItem";
import WayPayList from "./pages/gmedias/WayPayList";
import WayPayForm from "./pages/gmedias/WayPayForm";
import AccountList from "./pages/gmedias/AccountList";
import AccountForm from "./pages/gmedias/AccountForm";
import AccountItem from "./pages/gmedias/AccountItem";
import DebtList from "./pages/gmedias/DebtList";
import DebtForm from "./pages/gmedias/DebtForm";
import UserList from "./pages/auth/UserList";
import UserForm from "./pages/auth/UserForm";
import LoginForm from "./pages/auth/LoginForm";
import Layout from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useContext } from "react";
import Contexts from "./context/Contexts";
import VentasAnuladas from "./pages/rinde/ventas/ventasAnuladas";
import VentasDescuentos from "./pages/rinde/ventas/ventasDescuentos";
import VentasTotales from "./pages/rinde/ventas/ventasTotales";
import VentasClientes from "./pages/rinde/ventas/ventasClientes";
import VentasArticulos from "./pages/rinde/ventas/ventasArticulos";
import Gastos from "./pages/caja/gastos";
import Retiros from "./pages/caja/retiros";
import Vales from "./pages/caja/vales";
import Cupones from "./pages/caja/cupones";
import Sueldos from "./pages/caja/sueldos";
import Ingresos from "./pages/caja/ingresos";
import VentasCtaCte from "./pages/caja/vtasctacte";
import CobranzasCtaCte from "./pages/caja/cobranzasctacte";
import SaldosCtaCte from "./pages/caja/saldosctacte";
import Cajas from "./pages/caja/cajas";
import DetalleDeCaja from "./pages/caja/detallecaja";
import Inventario from "./pages/rinde/inventarios/inventarios";
import InventariosArticulos from "./pages/rinde/inventarios/InventariosArticulos";
import MovimientosInternos from "./pages/rinde/inventarios/movimientos";
import MovimientosOtros from "./pages/rinde/inventarios/MovimientosOtrosList.js";
import CrearMovimientosOtros from "./pages/rinde/inventarios/crearMovimientosOtros.js";
import ArticulosPrecios from "./pages/tablas/articulosprecios";
// import ArticulosPeciosActualizar from "./pages/tablas/articulosprecios_actualizar";
import ArticulosPreciosActualizar from "./pages/tablas/articulosprecios_actualizar";
import CalculoRinde from "./pages/rinde/rinde/rinde";
import ListaRindes from "./pages/rinde/rinde/rindelist";
import ArticulosPorcentaje from "./pages/tablas/articulosporcentajes";
import ArticulosPorcentajeActualizar from "./pages/tablas/articulosporcentajes_actualizar";
import Formulas from "./pages/rinde/formulas/formulasList";
import FormulasItems from "./pages/rinde/formulas/formulasItems";
import FormulasForm from "./pages/rinde/formulas/formulasForm";
import Stock from "./pages/rinde/inventarios/stock";
import Cierres from "./pages/caja/cierres";
import VentasComparativo from "./pages/rinde/ventas/ventasComparativo";
import VentasPorUsuario from "./pages/rinde/ventas/ventasPorUsuario";
import KgPorUsuario from "./pages/rinde/ventas/kgPorUsuario";
import KgPorSucursal from "./pages/rinde/ventas/kgPorSucursal";
import SaldosCtaCteSucursal from "./pages/caja/saldosctactesucursal";
import DetalleCtaCte from "./pages/caja/detallectacte";
import CantidadTicketPorUsuario from "./pages/rinde/ventas/cantidadTicketPorUsuario";
import CategoriaEquipoForm from "./pages/mantenimiento/categoriaEquipoForm";
import CategoriaEquipoList from "./pages/mantenimiento/categoriaEquipoList";
import EquipoForm from "./pages/mantenimiento/equipoForm";
import EquipoList from "./pages/mantenimiento/equipoList";
import MantenimientoForm from "./pages/mantenimiento/mantenimientoForm";
import MantenimientoList from "./pages/mantenimiento/mantenimientoList";
import OrdenMantenimientoForm from "./pages/mantenimiento/ordenMantenimientoForm";
import OrdenMantenimientoList from "./pages/mantenimiento/ordenMantenimientoList";
import MantenimientoPreventivoList from "./pages/mantenimiento/mantenimientoPreventivoList";
import MantenimientoPreventivoForm from "./pages/mantenimiento/mantenimientoPreventivoForm";
import MessageList from "./pages/messages/MessageList";
import MessageForm from "./pages/messages/MessageForm";
import ScheduleList from "./pages/schedule/ScheduleList";
import ScheduleForm from "./pages/schedule/ScheduleForm";
import SyncForm from "./pages/sync/syncForm";
import SellUpload from "./pages/statics/SellUploads.js";
import VentasPivotTable from "./pages/statics/VentasPivotTable"; // Importa el componente
import VentasReporte from "./pages/statics/VentasReporte.js"; // Importa el componente
import CrearInventario from "./pages/rinde/inventarios/crearInventario.js";

export default function App() {
  const context = useContext(Contexts.UserContext);

  return (
    <>
      <Routes>
        <Route index element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route element={<ProtectedRoute isAllowed={!!context.user} />}>
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route index element={<Main />} />
                  <Route path="/dashboard" element={<Main />} />
                  {/* Rutas para Message */}
                  <Route path="/messages" element={<MessageList />} />
                  <Route path="/messages/new" element={<MessageForm />} />
                  <Route path="/messages/:id/edit" element={<MessageForm />} />

                  {/* Rutas para Schedule */}
                  <Route path="/schedules" element={<ScheduleList />} />
                  <Route path="/schedules/new" element={<ScheduleForm />} />
                  <Route
                    path="/schedules/:id/edit"
                    element={<ScheduleForm />}
                  />
                  <Route path="/users" element={<UserList />} />
                  <Route path="/users/new" element={<UserForm />} />
                  <Route path="/users/:id/edit" element={<UserForm />} />
                  <Route path="/products" element={<ProductList />} />
                  <Route path="/products/new" element={<ProductForm />} />
                  <Route path="/products/:id/edit" element={<ProductForm />} />
                  <Route path="/products_update" element={<ProductUpdate />} />
                  <Route path="/products_update_tropa" element={<ProductUpdateTropa />} />
                  <Route path="/customers" element={<CustomerList />} />
                  <Route path="/customers/new" element={<CustomerForm />} />
                  <Route
                    path="/customers/:id/edit"
                    element={<CustomerForm />}
                  />
                  <Route
                    path="/clientesoneshot"
                    element={<CustomerOneShotList />}
                  />
                  <Route
                    path="/clientesoneshot/new"
                    element={<CustomerOneShotForm />}
                  />
                  <Route
                    path="/clientesoneshot/:id/edit"
                    element={<CustomerOneShotForm />}
                  />
                  <Route path="/waypays" element={<WayPayList />} />
                  <Route path="/waypays/new" element={<WayPayForm />} />
                  <Route path="/waypays/:id/edit" element={<WayPayForm />} />
                  <Route path="/sells" element={<SellList />} />
                  <Route path="/sells_update" element={<SellList />} />
                  <Route path="/sells/new" element={<SellForm />} />
                  <Route path="/sells/:id/edit" element={<SellForm />} />
                  <Route path="/sells/:id/products" element={<SellItem />} />
                  <Route path="/debts" element={<DebtList />} />
                  <Route path="/debts/new" element={<DebtForm />} />
                  <Route path="/debts/:id/edit" element={<DebtForm />} />
                  <Route path="/accounts" element={<AccountList />} />
                  <Route path="/accounts/new" element={<AccountForm />} />
                  <Route path="/accounts/:id/edit" element={<AccountForm />} />
                  <Route
                    path="/accounts/:id/products"
                    element={<AccountItem />}
                  />
                  <Route path="/branches" element={<BranchList />} />
                  <Route path="/branches/new" element={<BranchForm />} />
                  <Route path="/branches/:id/edit" element={<BranchForm />} />
                  <Route path="/stock" element={<StockList />} />
                  <Route
                    path="/stock/products"
                    element={<StockProductsList />}
                  />
                  <Route path="/stock/central" element={<StockCentralList />} />
                  <Route path="/orders" element={<OrderList />} />
                  <Route path="/orders/new" element={<OrderForm />} />
                  <Route path="/orders/:id/edit" element={<OrderForm />} />
                  <Route path="/orders/:id/products" element={<OrderItem />} />
                  <Route path="/receipts" element={<ReceiptList />} />
                  <Route
                    path="/receipts/products"
                    element={<ReceiptProducts />}
                  />
                  <Route path="/receipts/new" element={<ReceiptForm />} />
                  <Route path="/receipts/:id/edit" element={<ReceiptForm />} />
                  <Route
                    path="/receipts/:id/products"
                    element={<ReceiptItem />}
                  />
                  {/* Rutas rinde */}
                  <Route path="/sells/deleted" element={<VentasAnuladas />} />
                  <Route
                    path="/sells/discount"
                    element={<VentasDescuentos />}
                  />
                  <Route path="/sells/total" element={<VentasTotales />} />
                  <Route
                    path="/sells/totalcomparativo"
                    element={<VentasComparativo />}
                  />
                  <Route path="/sells/customers" element={<VentasClientes />} />
                  <Route path="/sells/articles" element={<VentasArticulos />} />
                  <Route path="/sells/user" element={<VentasPorUsuario />} />
                  <Route path="/sells/kg_user" element={<KgPorUsuario />} />
                  <Route path="/sells/kg_branch" element={<KgPorSucursal />} />
                  <Route
                    path="/sells/quantity"
                    element={<CantidadTicketPorUsuario />}
                  />
                  {/* Rutas info de caja */}
                  <Route path="/info/register" element={<Cajas />} />
                  <Route path="/info/expenses" element={<Gastos />} />
                  <Route path="/info/withdrawals" element={<Retiros />} />
                  <Route path="/info/vouchers" element={<Vales />} />
                  <Route path="/info/creditcard" element={<Cupones />} />
                  <Route path="/info/salaries" element={<Sueldos />} />
                  <Route path="/info/incomes" element={<Ingresos />} />
                  <Route path="/info/salesaccount" element={<VentasCtaCte />} />
                  <Route
                    path="/info/collectionsaccount"
                    element={<CobranzasCtaCte />}
                  />
                  <Route path="/info/cashclosure" element={<Cierres />} />
                  <Route
                    path="/info/balanceaccount"
                    element={<SaldosCtaCte />}
                  />
                  <Route
                    path="/info/balanceaccountbranch"
                    element={<SaldosCtaCteSucursal />}
                  />
                  <Route
                    path="/info/balanceaccountdetail"
                    element={<DetalleCtaCte />}
                  />
                  <Route path="/info/detail" element={<DetalleDeCaja />} />
                  <Route
                    path="/inventory/inventories"
                    element={<Inventario />}
                  />
                  <Route
                    path="/inventory/create"
                    element={<CrearInventario />}
                  />
                  <Route
                    path="/inventory/:inventarioId/articles"
                    element={<InventariosArticulos />}
                  />
                  <Route
                    path="/inventory/movements/"
                    element={<MovimientosInternos />}
                  />
                  <Route
                    path="/inventory/movementsotherslist/"
                    element={<MovimientosOtros />}
                  />
                  <Route
                    path="/inventory/movementsothers/"
                    element={<CrearMovimientosOtros />}
                  />
                  <Route
                    path="/inventory/performance/"
                    element={<CalculoRinde />}
                  />
                  <Route
                    path="/inventory/performancelist/"
                    element={<ListaRindes />}
                  />
                  <Route path="/inventory/stock/" element={<Stock />} />
                  <Route path="/prices" element={<ArticulosPrecios />} />
                  <Route
                    path="/prices_update"
                    element={<ArticulosPreciosActualizar />}
                  />
                  <Route path="/percent" element={<ArticulosPorcentaje />} />
                  <Route
                    path="/percent_update"
                    element={<ArticulosPorcentajeActualizar />}
                  />
                  <Route path="/formulas" element={<Formulas />} />
                  <Route path="/formulas/create" element={<FormulasForm />} />
                  <Route
                    path="/formulas/:formulaId"
                    element={<FormulasItems />}
                  />
                  <Route
                    path="/categorias-equipos"
                    element={<CategoriaEquipoList />}
                  />
                  <Route
                    path="/categorias-equipos/new"
                    element={<CategoriaEquipoForm />}
                  />
                  <Route
                    path="/categorias-equipos/:id/edit"
                    element={<CategoriaEquipoForm />}
                  />
                  <Route path="/equipos" element={<EquipoList />} />
                  <Route path="/equipos/new" element={<EquipoForm />} />
                  <Route path="/equipos/:id/edit" element={<EquipoForm />} />
                  <Route
                    path="/mantenimientos"
                    element={<MantenimientoList />}
                  />
                  <Route
                    path="/mantenimientos/new"
                    element={<MantenimientoForm />}
                  />
                  <Route
                    path="/mantenimientos/:id/edit"
                    element={<MantenimientoForm />}
                  />
                  <Route
                    path="/ordenes-mantenimiento"
                    element={<OrdenMantenimientoList />}
                  />
                  <Route
                    path="/ordenes-mantenimiento/new"
                    element={<OrdenMantenimientoForm />}
                  />
                  <Route
                    path="/ordenes-mantenimiento/:id/edit"
                    element={<OrdenMantenimientoForm />}
                  />
                  <Route
                    path="/mantenimiento-preventivo"
                    element={<MantenimientoPreventivoList />}
                  />
                  <Route
                    path="/mantenimiento-preventivo/:id/edit"
                    element={<MantenimientoPreventivoForm />}
                  />
                  <Route
                    path="/mantenimiento-preventivo/new"
                    element={<MantenimientoPreventivoForm />}
                  />

                  <Route path="/sync" element={<SyncForm />} />
                  <Route path="/statics/sell-upload" element={<SellUpload />} />
                  <Route path="/statics/sells" element={<VentasPivotTable />} />
                  <Route path="/statics/sells-report" element={<VentasReporte />} />
                </Routes>
              </Layout>
            }
          />
        </Route>
      </Routes>
    </>
  );
}
