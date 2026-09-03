import React, { useState, useEffect } from "react";
import Contexts from "./Contexts";
import { useSecurity } from "../security/SecurityContext";

export default function DataContextProvider({ children }) {

  const {
    user,
    loading: securityLoading,
  } = useSecurity();

  // Objetos/piezas únicas
  const [data, setData] = useState(null);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null); // null = todas
  const [cajaAbierta, setCajaAbierta] = useState(null);                 // null si no hay

  // Listas (siempre arrays para evitar .map de null/objeto)
  const [sucursales, setSucursales] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [formasPago, setFormasPago] = useState([]);
  const [sucursalesTabla, setSucursalesTabla] = useState([]);
  const [subcategoriasTabla, setSubcategoriasTabla] = useState([]);
  const [articulosTabla, setArticulosTabla] = useState([]);
  const [tipoDeIngresoTabla, setTipoDeIngresoTabla] = useState([]);
  const [tipoDeGastoTabla, setTipoDeGastoTabla] = useState([]);
  const [planTarjetaTabla, setPlanTarjetaTabla] = useState([]);
  const [clientesTabla, setClientesTabla] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [usuariosTabla, setUsuariosTabla] = useState([]);
  const [usuariosSistema, setUsuariosSistema] = useState([]);
  const [tiposTarjetaTabla, setTiposTarjetaTabla] = useState([]);
  const [tarjetaDeCreditoTabla, setTarjetaDeCreditoTabla] = useState([]);
  const [marcasTarjetaTabla, setMarcasTarjetaTabla] = useState([]);
  const [planTarjetaTesoreriaTabla, setPlanTarjetaTesoreriaTabla] = useState([]);
  const [tarjetasTesoreriaTabla, setTarjetasTesoreriaTabla] = useState([]);
  const [empresasTabla, setEmpresasTabla] = useState([]);
  const [bancosTabla, setBancosTabla] = useState([]);
  const [rubrosTabla, setRubrosTabla] = useState([]);
  const [categoriaAnimalTabla, setCategoriaAnimalTabla] = useState([]);
  const [formasPagoTesoreria, setFormasPagoTesoreria] = useState([]);
  const [frigorificoTabla, setFrigorificoTabla] = useState([]);
  const [imputacionContableTabla, setImputacionContableTabla] = useState([]);
  const [proveedoresTabla, setProveedoresTabla] = useState([]);
  const [proyectosTabla, setProyectosTabla] = useState([]);
  const [ptosVentaTabla, setPtosVentaTabla] = useState([]);
  const [tiposComprobanteTabla, setTiposComprobanteTabla] = useState([]);
  const [librosIvaTabla, setLibrosIvaTabla] = useState([]);
  const [categoriasEgreso, setCategoriasEgreso] = useState([]);
  const [categoriasIngreso, setCategoriasIngreso] = useState([]);

  const apiUrl = process.env.REACT_APP_API_URL;

  // Helper: fetch seguro que nunca devuelve algo que rompa el UI
  const fetchJsonSafe = async (url, opts = {}) => {
    try {
      const res = await fetch(url, { credentials: "include", ...opts });
      if (!res.ok) {
        console.warn(`⚠️ ${url} → HTTP ${res.status}`);
        return null; // devolvemos null; el caller normaliza a []
      }
      return await res.json();
    } catch (e) {
      console.warn(`❌ Error fetch ${url}:`, e?.message || e);
      return null;
    }
  };

  // Normaliza a array (acepta payloads tipo {rows: []} o [] directo)
  const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.rows)) return payload.rows;
    return [];
  };

  useEffect(() => {

    if (securityLoading) {
      return;
    }

    if (!user) {
      return;
    }


    let cancelled = false;


    const fetchData = async () => {

      const [
        dataSucursales,
        dataClientes,
        dataFormasPago,
        dataClientesTabla,
        dataSucursalesTabla,
        dataArticulosTabla,
        dataTipoDeIngresoTabla,
        dataTipoDeGastoTabla,
        dataPlanTarjetaTabla,
        dataTarjetaTesoreriaTabla,
        dataTarjetaDeCreditoTabla,
        dataEmpleadosTabla,
        dataUsuariosTabla,
        dataUsuariosSistema,
        dataSubcategoriasTabla,
        dataTiposTarjeta,
        dataMarcasTarjeta,
        dataEmpresas,
        dataBancos,
        dataRubros,
        dataFormasPagoTes,
        dataFrigorifico,
        dataImputacionContable,
        dataProyectos,
        dataPlanTarjetasTes,
        dataTiposComprobantes,
        dataProveedores,
        dataPtosVenta,
        dataLibrosIva,
        dataCategoriaAnimal,
        dataCategoriasEgreso,
        dataCategoriasIngreso,
        dataCajaAbierta,
      ] = await Promise.all([
        fetchJsonSafe(`${apiUrl}/sucursales`),
        fetchJsonSafe(`${apiUrl}/clientes`),
        fetchJsonSafe(`${apiUrl}/formas-pago`),
        fetchJsonSafe(`${apiUrl}/obtenerclientestabla`),
        fetchJsonSafe(`${apiUrl}/obtenersucursales`),
        fetchJsonSafe(`${apiUrl}/obtenerarticulos`),
        fetchJsonSafe(`${apiUrl}/obtenertipoingreso`),
        fetchJsonSafe(`${apiUrl}/obtenertipogasto`),
        fetchJsonSafe(`${apiUrl}/obtenerplantarjeta`),
        fetchJsonSafe(`${apiUrl}/tarjetas-comunes`),
        fetchJsonSafe(`${apiUrl}/obtenertarjetadecredito`),
        fetchJsonSafe(`${apiUrl}/obtenerempleados`),
        fetchJsonSafe(`${apiUrl}/obtenerusuario`),
        fetchJsonSafe(`${apiUrl}/usuarios`),
        fetchJsonSafe(`${apiUrl}/obtenersubcategorias`),
        fetchJsonSafe(`${apiUrl}/tipos-tarjeta`),
        fetchJsonSafe(`${apiUrl}/marcas-tarjeta`),
        fetchJsonSafe(`${apiUrl}/empresas`),
        fetchJsonSafe(`${apiUrl}/bancos`),
        fetchJsonSafe(`${apiUrl}/conciliacion-rubros`),
        fetchJsonSafe(`${apiUrl}/formas-pago-tesoreria`),
        fetchJsonSafe(`${apiUrl}/frigorificos`),
        fetchJsonSafe(`${apiUrl}/imputaciones-contables`),
        fetchJsonSafe(`${apiUrl}/proyectos`),
        fetchJsonSafe(`${apiUrl}/tarjeta-planes`),
        fetchJsonSafe(`${apiUrl}/tipos-comprobantes`),
        fetchJsonSafe(`${apiUrl}/proveedores`),
        fetchJsonSafe(`${apiUrl}/ptos-venta`),
        fetchJsonSafe(`${apiUrl}/librosiva`),
        fetchJsonSafe(`${apiUrl}/categorias-animales`),
        fetchJsonSafe(`${apiUrl}/categorias-egreso`),
        fetchJsonSafe(`${apiUrl}/categorias-ingreso`),
        fetchJsonSafe(`${apiUrl}/caja-tesoreria/actual`),
      ]);

      if (cancelled) {
        return;
      }

      const sucursalesArr =
        toArray(dataSucursales);

      sucursalesArr.sort(
        (a, b) =>
          Number(a.id) -
          Number(b.id)
      );

      setSucursales(sucursalesArr);

      setClientes(
        toArray(dataClientes)
      );

      setFormasPago(
        toArray(dataFormasPago)
      );

      setClientesTabla(
        toArray(dataClientesTabla)
      );

      setSucursalesTabla(
        toArray(dataSucursalesTabla)
      );

      setArticulosTabla(
        toArray(dataArticulosTabla)
      );

      setTipoDeIngresoTabla(
        toArray(dataTipoDeIngresoTabla)
      );

      const gastosArr =
        toArray(dataTipoDeGastoTabla);

      gastosArr.sort(
        (a, b) =>
          String(
            a.descripcion || ""
          ).localeCompare(
            String(
              b.descripcion || ""
            )
          )
      );

      setTipoDeGastoTabla(
        gastosArr
      );

      setPlanTarjetaTabla(
        toArray(dataPlanTarjetaTabla)
      );

      setTarjetasTesoreriaTabla(
        toArray(dataTarjetaTesoreriaTabla)
      );

      setTarjetaDeCreditoTabla(
        toArray(dataTarjetaDeCreditoTabla)
      );

      const empleadosActivos =
        toArray(dataEmpleadosTabla)
          .filter(
            (emp) =>
              emp.empleado?.fechabaja ===
              null
          );

      setEmpleados(
        empleadosActivos
      );

      setUsuariosTabla(
        toArray(dataUsuariosTabla)
      );

      setUsuariosSistema(
        toArray(dataUsuariosSistema)
      );

      setSubcategoriasTabla(
        toArray(dataSubcategoriasTabla)
      );

      setTiposTarjetaTabla(
        toArray(dataTiposTarjeta)
      );

      setMarcasTarjetaTabla(
        toArray(dataMarcasTarjeta)
      );

      setEmpresasTabla(
        toArray(dataEmpresas)
      );

      setBancosTabla(
        toArray(dataBancos)
      );

      setRubrosTabla(
        toArray(dataRubros)
      );

      setFormasPagoTesoreria(
        toArray(dataFormasPagoTes)
      );

      setFrigorificoTabla(
        toArray(dataFrigorifico)
      );

      setImputacionContableTabla(
        toArray(dataImputacionContable)
      );

      setProyectosTabla(
        toArray(dataProyectos)
      );

      setPlanTarjetaTesoreriaTabla(
        toArray(dataPlanTarjetasTes)
      );

      setTiposComprobanteTabla(
        toArray(dataTiposComprobantes)
      );

      setProveedoresTabla(
        toArray(dataProveedores)
      );

      setPtosVentaTabla(
        toArray(dataPtosVenta)
      );

      setLibrosIvaTabla(
        toArray(dataLibrosIva)
      );

      setCategoriaAnimalTabla(
        toArray(dataCategoriaAnimal)
      );

      setCategoriasEgreso(
        toArray(dataCategoriasEgreso)
      );

      setCategoriasIngreso(
        toArray(dataCategoriasIngreso)
      );

      setCajaAbierta(
        dataCajaAbierta || null
      );
      
    };

    console.log(
      "🚀 INICIO FETCH DATACONTEXT",
      new Date().toISOString(),
      {
        userId: user?.id,
        securityLoading,
      }
    );

    fetchData();

    return () => {
      cancelled = true;
    };

  }, [
    apiUrl,
    user?.id,
    securityLoading,
  ]);

  return (
    <Contexts.DataContext.Provider
      value={{
        data, setData,
        sucursales, setSucursales,
        clientes, setClientes,
        clientesTabla,
        subcategoriasTabla,
        formasPago, setFormasPago,
        empleados, setEmpleados,
        usuariosTabla,
        usuariosSistema, setUsuariosSistema,
        sucursalesTabla,
        articulosTabla,
        tipoDeIngresoTabla,
        tipoDeGastoTabla,
        planTarjetaTabla,
        tiposTarjetaTabla, setTiposTarjetaTabla,
        tarjetaDeCreditoTabla, setTarjetaDeCreditoTabla,
        marcasTarjetaTabla, setMarcasTarjetaTabla,
        empresasTabla, setEmpresasTabla,
        bancosTabla, setBancosTabla,
        rubrosTabla, setRubrosTabla,
        categoriaAnimalTabla, setCategoriaAnimalTabla,
        formasPagoTesoreria, setFormasPagoTesoreria,
        frigorificoTabla, setFrigorificoTabla,
        imputacionContableTabla, setImputacionContableTabla,
        proveedoresTabla, setProveedoresTabla,
        proyectosTabla, setProyectosTabla,
        tiposComprobanteTabla, setTiposComprobanteTabla,
        ptosVentaTabla, setPtosVentaTabla,
        librosIvaTabla, setLibrosIvaTabla,
        empresaSeleccionada, setEmpresaSeleccionada,
        planTarjetaTesoreriaTabla, setPlanTarjetaTesoreriaTabla,
        tarjetasTesoreriaTabla, setTarjetasTesoreriaTabla,
        categoriasEgreso, setCategoriasEgreso,
        categoriasIngreso, setCategoriasIngreso,
        cajaAbierta, setCajaAbierta
      }}
    >
      {children}
    </Contexts.DataContext.Provider>
  );
}
