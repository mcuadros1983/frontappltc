import {
  FiGrid, FiHome, FiCalendar, FiClipboard, FiShoppingCart, FiUser, FiUsers,
  FiBox, FiTruck, FiDollarSign, FiTrendingUp, FiPieChart, FiList, FiDatabase,
  FiBriefcase, FiCreditCard, FiBookOpen, FiArchive, FiPackage, FiFileText,
  FiBarChart2, FiLayers,
} from "react-icons/fi";

const ICON_MAP = {
  dashboard: FiHome,
  agenda: FiCalendar,
  registros: FiClipboard,
  precioshistoricos: FiTrendingUp,
  productos: FiPackage, product: FiPackage,
  sucursal: FiBriefcase,
  clientes: FiUsers,
  orders: FiTruck, orden: FiTruck,
  receipts: FiArchive, ingresos: FiArchive,
  sells: FiShoppingCart, ventas: FiShoppingCart,
  accounts: FiFileText, "cta cte": FiFileText,
  stock: FiBox,
  inventario: FiDatabase, movimientos: FiLayers, rinde: FiPieChart,
  precios: FiDollarSign, porcentajes: FiBarChart2, formulas: FiList,
  info: FiClipboard, cajas: FiArchive, gastos: FiDollarSign, retiros: FiDollarSign,
  vales: FiFileText, cupones: FiCreditCard, sueldos: FiDollarSign,
  ingresosinfo: FiDollarSign, cierres: FiArchive, detalle: FiClipboard,
  users: FiUser, bancos: FiCreditCard, empresas: FiBriefcase, frigorificos: FiArchive,
  iva: FiBookOpen, tesoreria: FiDollarSign, pagos: FiDollarSign, proveedores: FiBriefcase,
  facturacion: FiFileText, clientesventas: FiUsers, comparativo: FiBarChart2,
  rangos: FiBarChart2, grafico: FiBarChart2,
};

export function getIconByName(nameOrPath = "", props = {}) {
  const key = nameOrPath.toString().toLowerCase();
  const hit = Object.keys(ICON_MAP).find((k) => key.includes(k)) || "dashboard";
  const Icon = ICON_MAP[hit] || FiGrid;
  return <Icon {...props} />;
}
