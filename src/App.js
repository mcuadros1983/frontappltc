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
// import { ProtectedRoute } from "./components/ProtectedRoute";
import { useContext } from "react";
import Contexts from "./context/Contexts";
import VentasAnuladas from "./pages/rinde/ventas/ventasAnuladas";
import VentasDescuentos from "./pages/rinde/ventas/ventasDescuentos";
import VentasTotales from "./pages/rinde/ventas/ventasTotales";
import VentasClientes from "./pages/rinde/ventas/ventasClientes";
import VentasArticulos from "./pages/rinde/ventas/ventasArticulos";
import GraficoVentas from "./pages/rinde/ventas/graficoVentas.js";
import VentasEntreRangos from "./pages/rinde/ventas/ventasEntreRangos.js";
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
import ListaRindesComparativo from "./pages/rinde/rinde/rindecomparativo.js";
import ArticulosPorcentaje from "./pages/tablas/articulosporcentajes";
import ArticulosPorcentajeActualizar from "./pages/tablas/articulosporcentajes_actualizar";
import Formulas from "./pages/rinde/formulas/formulasList";
import FormulasItems from "./pages/rinde/formulas/formulasItems";
import FormulasForm from "./pages/rinde/formulas/formulasForm";
import Stock from "./pages/rinde/inventarios/stock";
import Cierres from "./pages/caja/cierres";
import ListadoCierresZ from "./pages/caja/ListadoCierresZ";
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
import OrderFromExcel from "./pages/gmedias/OrderFromExcel.js";
import CalculoRindeGeneral from "./pages/rinde/rinde/calculorindegeneral.js";
import ListaRindesConsolidados from "./pages/rinde/rinde/listarindegeneral.js";
import ListaRindesGenerales from "./pages/rinde/rinde/rindelistgeneral.js";
import VerificarProductosPorTropa from "./pages/gmedias/VerificarProductosPorTropa";
import BancoList from "./pages/config/BancoList.js";
import BancoForm from "./pages/config/BancoForm.js";
import CategoriaAnimalList from "./pages/config/CategoriaAnimalList.js";
import CategoriaAnimalForm from "./pages/config/CategoriaAnimalForm.js";
import TarjetaComunList from "./pages/config/TarjetaComunList.js";
import TarjetaComunForm from "./pages/config/TarjetaComunForm.js";
import FormaPagoTesoreriaList from "./pages/config/FormaPagoTesoreriaList.js";
import FormaPagoTesoreriaForm from "./pages/config/FormaPagoTesoreriaForm.js";
import FrigorificoList from "./pages/config/FrigorificoList.js";
import FrigorificoForm from "./pages/config/FrigorificoForm.js";
import ImputacionContableList from "./pages/config/ImputacionContableList.js";
import ImputacionContableForm from "./pages/config/ImputacionContableForm.js";
import MarcaTarjetaList from "./pages/config/MarcaTarjetaList.js";
import MarcaTarjetaForm from "./pages/config/MarcaTarjetaForm.js";
import ProveedorList from "./pages/config/ProveedorList.js";
import ProveedorForm from "./pages/config/ProveedorForm.js";
import ProyectoList from "./pages/config/ProyectoList.js";
import ProyectoForm from "./pages/config/ProyectoForm.js";
import PtoVentaList from "./pages/config/PtoVentaList.js";
import PtoVentaForm from "./pages/config/PtoVentaForm.js";
import TipoComprobanteList from "./pages/config/TipoComprobanteList.js";
import TipoComprobanteForm from "./pages/config/TipoComprobanteForm.js";
import TipoTarjetaList from "./pages/config/TipoTarjetaList.js";
import TipoTarjetaForm from "./pages/config/TipoTarjetaForm.js";
import EmpresaList from "./pages/config/EmpresaList.js";
import EmpresaForm from "./pages/config/EmpresaForm.js";
import ConciliacionRubroList from "./pages/conciliacion/ConciliacionRubroList.js";
import ConciliacionRubroForm from "./pages/conciliacion/ConciliacionRubroForm.js";
import ConciliacionCuentaList from "./pages/conciliacion/ConciliacionCuentaList.js";
import ConciliacionCuentaForm from "./pages/conciliacion/ConciliacionCuentaForm.js";
import ConciliacionCriterioList from "./pages/conciliacion/ConciliacionCriterioList.js";
import ConciliacionCriterioForm from "./pages/conciliacion/ConciliacionCriterioForm.js";
import LibroIVAList from "./pages/iva/LibroIVAList.js";
import LibroIVAForm from "./pages/iva/LibroIVAForm.js";
import AbrirCaja from "./pages/tesoreria/AbrirCaja.js";
import MovimientosCajaTesoreria from "./pages/tesoreria/MovimientosCajaTesoreria";
import MovimientosBancoTesoreria from "./pages/tesoreria/MovimientosBancoTesoreria";
import CategoriaIngresoList from "./pages/tesoreria/CategoriaIngresoList.js";
import CategoriaEgresoForm from "./pages/tesoreria/CategoriaEgresoForm.js";
import CategoriaIngresoForm from "./pages/tesoreria/CategoriaIngresoForm.js";
import CategoriaEgresoList from "./pages/tesoreria/CategoriaEgresoList.js";
import ClienteList from "./pages/ventasTesoreria/clienteTesoreriaList.js";
import ClienteTesoreriaList from "./pages/ventasTesoreria/clienteTesoreriaList.js";
import FacturacionTesoreriaList from "./pages/ventasTesoreria/facturacionTesoreriaList.js";
import ProveedorTesoreriaList from "./pages/comprasTesoreria/proveedorTesoreria.js";
import PagosNoProveedores from "./pages/comprasTesoreria/comprasNoProveedores.js";
import ComprobantesEgresoList from "./pages/comprasTesoreria/facturacionTesoreriaList.js";
import TarjetaPlanPagoList from "./pages/tesoreria/TarjetaPlanPagoList.js";
import TarjetaPlanPagoForm from "./pages/tesoreria/TarjetaPlanPagoForm.js";
import OrdenPagoList from "./pages/comprasTesoreria/ordenPagoList.js";
import PagoSueldosTesoreria from "./pages/sueldosTesoreria/pagoSueldosTesoreria.js";
import AdelantosSueldosTesoreria from "./pages/sueldosTesoreria/adelantoSueldosTesoreria.js";
import CtasCtesList from "./pages/comprasTesoreria/ctasCtesList.js";
import NuevoMovimientoBancoExcel from "./pages/tesoreria/NuevoMovimientoBancoExcel.js";
import MovimientosTarjetasTesoreria from "./pages/tesoreria/MovimientosTarjetaTesoreria.js";
import MovimientosChequesTesoreria from "./pages/tesoreria/MovimientosChequesTesoreria.js";
import RegistroHacienda from "./pages/gmedias/RegistroHacienda.js";
import MoivmientosCajaRetirosTesoreria from "./pages/tesoreria/MovimientosCajaRetirosTesoreria.js";
import AdicionalFijoTipo from "./pages/sueldosTesoreria/AdicionalFijoTipoPage.js";
import AdicionalFijoManager from "./pages/sueldosTesoreria/AdicionalFijoManager.js";
import EmpleadoAdicionalFijoManager from "./pages/sueldosTesoreria/EmpleadoAdicionalFijoManager.js";
import AdicionalVariableManager from "./pages/sueldosTesoreria/AdicionalVariableManager.js";
import AdicionalVariableTipoManager from "./pages/sueldosTesoreria/AdicionalVariableTipoManager.js";
import AdicionalVariableImportManager from "./pages/sueldosTesoreria/AdicionalVariableImportManager.js";
import RecibosImportManager from "./pages/sueldosTesoreria/RecibosImportManager.js";
import ValesAdelantosImportManager from "./pages/sueldosTesoreria/ValesAdelantosImportManager.js";
import AdicionalVariableList from "./pages/sueldosTesoreria/AdicionalVariableList.js";
import LiquidacionMensualManager from "./pages/sueldosTesoreria/LiquidacionMensualManager.js";
import AsignarTelefono from "./pages/sueldosTesoreria/AsignarTelefonoManager.js";
import AsignarDatosEmpleado from "./pages/sueldosTesoreria/AsignarDatosEmpleadoManager.js";
import CompraProyectadaManager from "./pages/iva/CompraProyectadaManager.js";
import IvaProyeccion from "./pages/iva/IvaProyeccion.js";
import PeriodoManager from "./pages/config/PeriodoManager.js";
import GastoEstimadoManager from "./pages/tesoreria/GastoEstimadoManager.js";
import ImportarGastosEstimados from "./pages/tesoreria/ImportarGastosEstimados.js";
import VencimientosManager from "./pages/tesoreria/VencimientosManager.js";
import SitFinanciera from "./pages/comprasTesoreria/SitFinanciera.js";
import AgendaManager from "./pages/agenda/agendaManager.js";
import PermissionsPage from "./pages/admin/PermissionsPage.js";
import DocumentosList from "./pages/documentacion/DocumentosList.js";
import DocumentoCreatePage from "./pages/documentacion/DocumentoCreatePage.js";
import DocumentoDetalle from "./pages/documentacion/DocumentoDetalle.js";
import RegistrosManager from "./pages/registros/registrosManager.js";
import PreciosHistoricos from "./pages/statics/registroPreciosManager.js";
import Empleados from "./pages/asistencia/Empleados.js";
import Sucursales from "./pages/asistencia/Sucursales.js";
import Dispositivos from "./pages/asistencia/Dispositivos.js";
import Turnos from "./pages/asistencia/Turnos.js";
import Jornadas from "./pages/asistencia/Jornadas.js";
import Parametros from "./pages/asistencia/Parametros.js";
import Asistencias from "./pages/asistencia/Asistencias.js";
import DashboardAsistencia from "./pages/asistencia/DashboardAsistencia.js";
import HorarioManager from "./pages/asistencia/HorarioTurnoManager.js";
import HuellaNavegadorManager from "./pages/asistencia/HuellaNavegadorManager.js";
import AsignarEmpleadoManager from "./pages/asistencia/AsignarEmpleadoManager.js";
import ConceptoManager from "./pages/asistencia/ConceptoManager.js";
import PlanificacionManager from "./pages/asistencia/PlanificacionManager.js";
import EventoManager from "./pages/asistencia/EventoManager.js";
import { VacacionesManager } from "./pages/asistencia/VacacionesManager.js";
import { VacacionesSchedule } from "./pages/asistencia/VacacionesSchedule.js";
import DocumentoCategoriaManager from "./pages/documentacion/DocumentoCategoriaManager.js";
import DocumentoSubcategoriaManager from "./pages/documentacion/DocumentoSubcategoriaManager.js";
import DocumentoFormPage from "./pages/documentacion/DocumentoFormPage.js";
import ProyeccionCalculoPage from "./pages/proyeccion/ProyeccionCalculoPage.js";
import ProyeccionConfigPage from "./pages/proyeccion/ProyeccionConfigPage.js";
import ProyeccionHistoricoPage from "./pages/proyeccion/ProyeccionHistoricoPage";
// Auth / Security
import { SecurityProvider } from "./security/SecurityContext"; // si prefieres, hacelo en index.jsx
import ProtectedRoute from "./security/ProtectedRoute";
import PublicOnlyRoute from "./security/PublicOnlyRoute";
import UserContextProvider from "./context/UserContext";
import DataContext from "./context/DataContext";

// Simple 403 page 
function Forbidden403() {
  return <div style={{ padding: 24 }}><h2>403 - No autorizado</h2></div>;
}

export default function App() {
  const context = useContext(Contexts.UserContext);

  return (
    <>
      <SecurityProvider>
        <UserContextProvider>
          <DataContext>
            <Routes>

              {/* Público (redirige si ya hay user) */}
              <Route
                index
                element={
                  <PublicOnlyRoute>
                    <LoginForm />
                  </PublicOnlyRoute>
                }
              />

              {/* Público */}
              <Route index element={<LoginForm />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/403" element={<Forbidden403 />} />


              {/* <Route element={<ProtectedRoute isAllowed={!!context.user} />}> */}


              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        {/* Home / Dashboard (solo autenticado) */}
                        <Route index element={<Main />} />
                        <Route path="/dashboard" element={<Main />} />
                        {/* Mensajería (solo autenticado) */}
                        <Route path="/messages" element={<MessageList />} />
                        <Route path="/messages/new" element={<MessageForm />} />
                        <Route path="/messages/:id/edit" element={<MessageForm />} />

                        {/* Rutas para Asistencia */}
                        <Route path="/dashboardasistencias" element={<DashboardAsistencia />} />
                        <Route path="/empleadosasistencias" element={<Empleados />} />
                        <Route path="/sucursalesasistencias" element={<Sucursales />} />
                        <Route path="/dispositivosasistencias" element={<Dispositivos />} />
                        <Route path="/turnosasistencias" element={<Turnos />} />
                        <Route path="/jornadasasistencias" element={<Jornadas />} />

                        <Route path="/parametrosasistencias" element={<Parametros />} />
                        <Route path="/asistencias" element={<Asistencias />} />
                        <Route path="/asistencias/horarios" element={<HorarioManager />} />
                        <Route path="/asistencias/asignarempleado" element={<AsignarEmpleadoManager />} />
                        <Route path="/asistencias/huellanavegador" element={<HuellaNavegadorManager />} />
                        <Route path="/asistencias/conceptos" element={<ConceptoManager />} />
                        <Route path="/asistencias/eventos" element={<EventoManager />} />
                        <Route path="/asistencias/planificacion" element={<PlanificacionManager />} />


                        <Route path="/asistencias/listarvacaciones" element={<VacacionesManager />} />
                        <Route path="/asistencias/calendariovacaciones" element={<VacacionesSchedule />} />


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

                        {/* Rutas para Config */}
                        <Route path="/banks" element={<BancoList />} />
                        <Route path="/banks/new" element={<BancoForm />} />
                        <Route path="/banks/:id/edit" element={<BancoForm />} />

                        {/* Rutas para Categorias Animales */}
                        <Route path="/categorias-animales" element={<CategoriaAnimalList />} />
                        <Route path="/categorias-animales/new" element={<CategoriaAnimalForm />} />
                        <Route path="/categorias-animales/:id/edit" element={<CategoriaAnimalForm />} />

                        {/* Rutas para Empresas */}
                        <Route path="/empresas" element={<EmpresaList />} />
                        <Route path="/empresas/new" element={<EmpresaForm />} />
                        <Route path="/empresas/:id/edit" element={<EmpresaForm />} />


                        {/* Tarjetas Comunes */}
                        <Route path="/tarjetas-comunes" element={<TarjetaComunList />} />
                        <Route path="/tarjetas-comunes/new" element={<TarjetaComunForm />} />
                        <Route path="/tarjetas-comunes/:id/edit" element={<TarjetaComunForm />} />

                        {/* Forma de Pago */}
                        <Route path="/formas-pago-tesoreria" element={<FormaPagoTesoreriaList />} />
                        <Route path="/formas-pago-tesoreria/new" element={<FormaPagoTesoreriaForm />} />
                        <Route path="/formas-pago-tesoreria/:id/edit" element={<FormaPagoTesoreriaForm />} />

                        {/* Frigorífico */}
                        <Route path="/frigorificos" element={<FrigorificoList />} />
                        <Route path="/frigorificos/new" element={<FrigorificoForm />} />
                        <Route path="/frigorificos/:id/edit" element={<FrigorificoForm />} />

                        {/* Imputación Contable */}
                        <Route path="/imputaciones-contables" element={<ImputacionContableList />} />
                        <Route path="/imputaciones-contables/new" element={<ImputacionContableForm />} />
                        <Route path="/imputaciones-contables/:id/edit" element={<ImputacionContableForm />} />

                        {/* Marca Tarjeta */}
                        <Route path="/marcas-tarjeta" element={<MarcaTarjetaList />} />
                        <Route path="/marcas-tarjeta/new" element={<MarcaTarjetaForm />} />
                        <Route path="/marcas-tarjeta/:id/edit" element={<MarcaTarjetaForm />} />

                        {/* Proveedor */}
                        <Route path="/proveedores" element={<ProveedorList />} />
                        <Route path="/proveedores/new" element={<ProveedorForm />} />
                        <Route path="/proveedores/:id/edit" element={<ProveedorForm />} />

                        {/* Proyecto */}
                        <Route path="/proyectos" element={<ProyectoList />} />
                        <Route path="/proyectos/new" element={<ProyectoForm />} />
                        <Route path="/proyectos/:id/edit" element={<ProyectoForm />} />

                        {/* Punto de Venta */}
                        <Route path="/ptos-venta" element={<PtoVentaList />} />
                        <Route path="/ptos-venta/new" element={<PtoVentaForm />} />
                        <Route path="/ptos-venta/:id/edit" element={<PtoVentaForm />} />

                        {/* Tipo Comprobante */}
                        <Route path="/tipos-comprobantes" element={<TipoComprobanteList />} />
                        <Route path="/tipos-comprobantes/new" element={<TipoComprobanteForm />} />
                        <Route path="/tipos-comprobantes/:id/edit" element={<TipoComprobanteForm />} />

                        {/* Tipo Tarjeta */}
                        <Route path="/tipos-tarjeta" element={<TipoTarjetaList />} />
                        <Route path="/tipos-tarjeta/new" element={<TipoTarjetaForm />} />
                        <Route path="/tipos-tarjeta/:id/edit" element={<TipoTarjetaForm />} />

                        {/* Conciliación - Rubros */}
                        <Route path="/conciliacion-rubros" element={<ConciliacionRubroList />} />
                        <Route path="/conciliacion-rubros/new" element={<ConciliacionRubroForm />} />
                        <Route path="/conciliacion-rubros/:id/edit" element={<ConciliacionRubroForm />} />

                        {/* Conciliación - Cuentas */}
                        <Route path="/conciliacion-cuentas" element={<ConciliacionCuentaList />} />
                        <Route path="/conciliacion-cuentas/new" element={<ConciliacionCuentaForm />} />
                        <Route path="/conciliacion-cuentas/:id/edit" element={<ConciliacionCuentaForm />} />

                        {/* Conciliación - Criterios */}
                        <Route path="/conciliacion-criterios" element={<ConciliacionCriterioList />} />
                        <Route path="/conciliacion-criterios/new" element={<ConciliacionCriterioForm />} />
                        <Route path="/conciliacion-criterios/:id/edit" element={<ConciliacionCriterioForm />} />

                        {/* Conciliación - Libro IVA */}
                        <Route path="/librosiva" element={<LibroIVAList />} />
                        <Route path="/librosiva/new" element={<LibroIVAForm />} />
                        <Route path="/librosiva/:id/edit" element={<LibroIVAForm />} />
                        <Route path="/compraproyectada" element={<CompraProyectadaManager />} />
                        <Route path="/ivaproyeccion" element={<IvaProyeccion />} />
                        <Route path="/periodoliquidacion" element={<PeriodoManager />} />



                        {/* ====== AGENDA (con permisos) ====== */}
                        <Route
                          path="/agenda"
                          element={
                            <ProtectedRoute required={["agenda:view"]}>
                              <AgendaManager />
                            </ProtectedRoute>
                          }
                        />

                        {/* ====== PERMISOS ====== */}
                        <Route
                          path="/permisos"
                          element={
                            <ProtectedRoute required={["permisos:view"]}>
                              <PermissionsPage />
                            </ProtectedRoute>
                          }
                        />
                        {/* <Route path="/agenda" element={<AgendaManager />} /> */}
                        {/* Conciliación - Libro IVA */}
                        <Route path="/documentos" element={<DocumentosList />} />
                        <Route path="/documentos/:id" element={<DocumentoDetalle />} />
                        <Route path="/documentos/:id/editar" element={<DocumentoFormPage />} />
                        <Route path="/documentos/nuevo" element={<DocumentoFormPage />} />
                        <Route path="/documentos/categorias" element={<DocumentoCategoriaManager />} />
                        <Route path="/documentos/subcategorias" element={<DocumentoSubcategoriaManager />} />
                        <Route path="/registros" element={<RegistrosManager />} />
                        <Route path="/precioshistoricos" element={<PreciosHistoricos />} />

                        {/* Proyeccion Ventas */}
                        <Route path="/proyeccion" element={<ProyeccionCalculoPage />} />
                        <Route path="/proyeccion/config" element={<ProyeccionConfigPage />} />
                        <Route path="/proyeccion/historico" element={<ProyeccionHistoricoPage />} />

                        {/* Caja Tesoreria */}
                        <Route path="/tesoreria/cajas/apertura" element={<AbrirCaja />} />
                        <Route path="/tesoreria/movimientos-caja-tesoreria" element={<MovimientosCajaTesoreria />} />

                        {/* Bancos Tesoreria */}
                        <Route path="/tesoreria/movimientos-banco-tesoreria" element={<MovimientosBancoTesoreria />} />
                        <Route path="/tesoreria/movimientos-banco-tesoreria-excel" element={<NuevoMovimientoBancoExcel />} />

                        {/* Tarjetas Tesoreria */}
                        <Route path="/tesoreria/movimientos-tarjetas-tesoreria" element={<MovimientosTarjetasTesoreria />} />

                        {/* Echeq Tesoreria */}
                        <Route path="/tesoreria/movimientos-echeq-tesoreria" element={<MovimientosChequesTesoreria />} />

                        {/* Tesoreria - Categoria Ingreso */}
                        <Route path="/categoriaingreso" element={<CategoriaIngresoList />} />
                        <Route path="/categoriaingreso/new" element={<CategoriaIngresoForm />} />
                        <Route path="/categoriaingreso/:id/edit" element={<CategoriaIngresoForm />} />

                        {/* Tesoreria - Categoria Egreso */}
                        <Route path="/categoriaegreso" element={<CategoriaEgresoList />} />
                        <Route path="/categoriaegreso/new" element={<CategoriaEgresoForm />} />
                        <Route path="/categoriaegreso/:id/edit" element={<CategoriaEgresoForm />} />

                        <Route path="/tarjeta-planes" element={<TarjetaPlanPagoList />} />
                        <Route path="/tarjeta-planes/new" element={<TarjetaPlanPagoForm />} />
                        <Route path="/tarjeta-planes/:id/edit" element={<TarjetaPlanPagoForm />} />


                        {/* Tesoreria - Ventas  */}
                        <Route path="/ventasfacturacion/clientes" element={<ClienteTesoreriaList />} />
                        <Route path="/ventasfacturacion/facturacion" element={<FacturacionTesoreriaList />} />

                        {/* Tesoreria - Proveedores  */}
                        <Route path="/comprasfacturacion/proveedores" element={<ProveedorTesoreriaList />} />
                        <Route path="/comprasfacturacion/facturacion" element={<ComprobantesEgresoList />} />
                        {/* <Route path="/comprasfacturacion/liquidaciondecompra" element={<LiquidacionDeCompra />} /> */}
                        <Route path="/comprasfacturacion/pagosnoproveedores" element={<PagosNoProveedores />} />


                        {/* Tesoreria - Ordenes de Pago  */}
                        <Route path="/comprasfacturacion/ordendepago" element={<OrdenPagoList />} />

                        {/* Tesoreria - Ctas Ctes Proveedores  */}
                        <Route path="/comprasfacturacion/ctasctes" element={<CtasCtesList />} />
                        <Route path="/sitfinanciera" element={<SitFinanciera />} />

                        <Route path="/gastosestimados" element={<GastoEstimadoManager />} />
                        <Route path="/importargastosestimados" element={<ImportarGastosEstimados />} />
                        <Route path="/vencimientos" element={<VencimientosManager />} />

                        {/* Sueldos  */}
                        {/*<Route path="/sueldostesoreria/adicionalfijotipo" element={<AdicionalFijoTipo />} />*/}
                        <Route path="/sueldostesoreria/adicionalfijotipo" element={<AdicionalFijoManager />} />
                        <Route path="/sueldostesoreria/adicionalvariabletipo" element={<AdicionalVariableTipoManager />} />
                        <Route path="/sueldostesoreria/asignaradicionalfijo" element={<EmpleadoAdicionalFijoManager />} />
                        <Route path="/sueldostesoreria/pagodesueldos" element={<PagoSueldosTesoreria />} />
                        <Route path="/sueldostesoreria/adelantos" element={<AdelantosSueldosTesoreria />} />
                        <Route path="/sueldostesoreria/importaritemsvariables" element={<AdicionalVariableImportManager />} />
                        <Route path="/sueldostesoreria/listaradicionalesvariables" element={<AdicionalVariableList />} />
                        <Route path="/sueldostesoreria/recibosimportmanager" element={<RecibosImportManager />} />
                        <Route path="/sueldostesoreria/liquidacionmensual" element={<LiquidacionMensualManager />} />
                        <Route path="/sueldostesoreria/importarvalesyadelantos" element={<ValesAdelantosImportManager />} />
                        <Route path="/sueldostesoreria/asignartelefono" element={<AsignarTelefono />} />
                        <Route path="/sueldostesoreria/asignardatosempleado" element={<AsignarDatosEmpleado />} />

                        <Route path="/tesoreria/retirossucursales" element={<MoivmientosCajaRetirosTesoreria />} />

                        {/* Gestión de Medias  */}
                        <Route path="/registrohacienda" element={<RegistroHacienda />} />
                        <Route path="/products" element={<ProductList />} />
                        <Route path="/products/new" element={<ProductForm />} />
                        <Route path="/products/:id/edit" element={<ProductForm />} />
                        <Route path="/products_update" element={<ProductUpdate />} />
                        <Route path="/products_update_tropa" element={<ProductUpdateTropa />} />
                        <Route path="/products/verificar-tropa" element={<VerificarProductosPorTropa />} />
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
                        <Route path="/orders/productsfromexcel" element={<OrderFromExcel />} />
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
                        <Route
                          path="/sells/graficoventas"
                          element={<GraficoVentas />}
                        />
                        <Route
                          path="/sells/comparativorangos"
                          element={<VentasEntreRangos />}
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
                        <Route path="/info/cierrez" element={<ListadoCierresZ />} />
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
                          path="/inventory/performancegeneral/"
                          element={<CalculoRindeGeneral />}
                        />
                        <Route
                          path="/inventory/performancelist/"
                          element={<ListaRindes />}
                        />
                        <Route
                          path="/inventory/performancegenerallist/"
                          element={<ListaRindesConsolidados />}
                        />
                        <Route
                          path="/inventory/performancelistgral/"
                          element={<ListaRindesGenerales />}
                        />
                        <Route
                          path="/inventory/performancelistcomparative/"
                          element={<ListaRindesComparativo />}
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
                  </ProtectedRoute>
                }
              />
              {/* </Route> */}
            </Routes>
          </DataContext>
        </UserContextProvider>
      </SecurityProvider>
    </>
  );
}
