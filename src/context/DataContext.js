import React, { useState, useEffect } from "react";
import Contexts from "./Contexts";

export default function DataContextProvider({ children }) {
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
  const [tiposTarjetaTabla, setTiposTarjetaTabla] = useState([]);
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
        // console.warn(`⚠️ ${url} → HTTP ${res.status}`);
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
    let cancelled = false;
    const fetchData = async () => {
      // Sucursales
      const dataSucursales = await fetchJsonSafe(`${apiUrl}/sucursales`, {credentials: "include"});
      if (!cancelled) {
        const arr = toArray(dataSucursales);
        arr.sort((a, b) => Number(a.id) - Number(b.id));
        setSucursales(arr);
      }

      // Clientes
      const dataClientes = await fetchJsonSafe(`${apiUrl}/clientes`, {credentials: "include"});
      if (!cancelled) {
        console.log("datosclientes", dataClientes);
        setClientes(toArray(dataClientes));
      }

      // Formas de pago
      const dataFormasPago = await fetchJsonSafe(`${apiUrl}/formas-pago`, {credentials: "include"});
      if (!cancelled) setFormasPago(toArray(dataFormasPago));

      // Tablas varias
      const dataClientesTabla = await fetchJsonSafe(`${apiUrl}/obtenerclientestabla`, {credentials: "include"});
      if (!cancelled) setClientesTabla(toArray(dataClientesTabla));

      const dataSucursalesTabla = await fetchJsonSafe(`${apiUrl}/obtenersucursales`, {credentials: "include"} );
      if (!cancelled) setSucursalesTabla(toArray(dataSucursalesTabla));

      const dataArticulosTabla = await fetchJsonSafe(`${apiUrl}/obtenerarticulos`, {credentials: "include"});
      if (!cancelled) setArticulosTabla(toArray(dataArticulosTabla));

      const dataTipoDeIngresoTabla = await fetchJsonSafe(`${apiUrl}/obtenertipoingreso`, {credentials: "include"});
      if (!cancelled) setTipoDeIngresoTabla(toArray(dataTipoDeIngresoTabla));

      const dataTipoDeGastoTabla = await fetchJsonSafe(`${apiUrl}/obtenertipogasto`, {credentials: "include"});
      if (!cancelled) {
        const arr = toArray(dataTipoDeGastoTabla);
        arr.sort((a, b) => String(a.descripcion || "").localeCompare(String(b.descripcion || "")));
        setTipoDeGastoTabla(arr);
      }

      const dataPlanTarjetaTabla = await fetchJsonSafe(`${apiUrl}/obtenerplantarjeta`, {credentials: "include"});
      if (!cancelled) setPlanTarjetaTabla(toArray(dataPlanTarjetaTabla));

      const dataTarjetaTesoreriaTabla = await fetchJsonSafe(`${apiUrl}/tarjetas-comunes`, {credentials: "include"});
      if (!cancelled) setTarjetasTesoreriaTabla(toArray(dataTarjetaTesoreriaTabla));

      const dataEmpleadosTabla = await fetchJsonSafe(`${apiUrl}/obtenerempleados`, {credentials: "include"});
      if (!cancelled) setEmpleados(toArray(dataEmpleadosTabla));

      const dataUsuariosTabla = await fetchJsonSafe(`${apiUrl}/obtenerusuario`, {credentials: "include"});
      if (!cancelled) setUsuariosTabla(toArray(dataUsuariosTabla));

      const dataSubcategoriasTabla = await fetchJsonSafe(`${apiUrl}/obtenersubcategorias`, {credentials: "include"});
      if (!cancelled) setSubcategoriasTabla(toArray(dataSubcategoriasTabla));

      const dataTiposTarjeta = await fetchJsonSafe(`${apiUrl}/tipos-tarjeta`, {credentials: "include"});
      if (!cancelled) setTiposTarjetaTabla(toArray(dataTiposTarjeta));

      const dataMarcasTarjeta = await fetchJsonSafe(`${apiUrl}/marcas-tarjeta`, {credentials: "include"});
      if (!cancelled) setMarcasTarjetaTabla(toArray(dataMarcasTarjeta));

      const dataEmpresas = await fetchJsonSafe(`${apiUrl}/empresas`, {credentials: "include"});
      if (!cancelled) setEmpresasTabla(toArray(dataEmpresas));

      const dataBancos = await fetchJsonSafe(`${apiUrl}/bancos`, {credentials: "include"});
      if (!cancelled) setBancosTabla(toArray(dataBancos));

      const dataRubros = await fetchJsonSafe(`${apiUrl}/conciliacion-rubros`, {credentials: "include"});
      if (!cancelled) setRubrosTabla(toArray(dataRubros));

      const dataFormasPagoTes = await fetchJsonSafe(`${apiUrl}/formas-pago-tesoreria`, {credentials: "include"});
      if (!cancelled) setFormasPagoTesoreria(toArray(dataFormasPagoTes));

      const dataFrigorifico = await fetchJsonSafe(`${apiUrl}/frigorificos`, {credentials: "include"});
      if (!cancelled) setFrigorificoTabla(toArray(dataFrigorifico));

      const dataImputacionContable = await fetchJsonSafe(`${apiUrl}/imputaciones-contables`, {credentials: "include"});
      if (!cancelled) setImputacionContableTabla(toArray(dataImputacionContable));

      const dataProyectos = await fetchJsonSafe(`${apiUrl}/proyectos`, {credentials: "include"});
      if (!cancelled) setProyectosTabla(toArray(dataProyectos));

      const dataPlanTarjetasTes = await fetchJsonSafe(`${apiUrl}/tarjeta-planes`, {credentials: "include"});
      if (!cancelled) setPlanTarjetaTesoreriaTabla(toArray(dataPlanTarjetasTes));

      const dataTiposComprobantes = await fetchJsonSafe(`${apiUrl}/tipos-comprobantes`, {credentials: "include"});
      if (!cancelled) setTiposComprobanteTabla(toArray(dataTiposComprobantes));

      const dataProveedores = await fetchJsonSafe(`${apiUrl}/proveedores`, {credentials: "include"});
      if (!cancelled) setProveedoresTabla(toArray(dataProveedores));

      const dataPtosVenta = await fetchJsonSafe(`${apiUrl}/ptos-venta`, {credentials: "include"});
      if (!cancelled) setPtosVentaTabla(toArray(dataPtosVenta));

      const dataLibrosIva = await fetchJsonSafe(`${apiUrl}/librosiva`, {credentials: "include"});
      if (!cancelled) setLibrosIvaTabla(toArray(dataLibrosIva));

      const dataCategoriaAnimal = await fetchJsonSafe(`${apiUrl}/categorias-animales`, {credentials: "include"});
      if (!cancelled) setCategoriaAnimalTabla(toArray(dataCategoriaAnimal));

      const dataCategoriasEgreso = await fetchJsonSafe(`${apiUrl}/categorias-egreso`, {credentials: "include"});
      if (!cancelled) setCategoriasEgreso(toArray(dataCategoriasEgreso));

      const dataCategoriasIngreso = await fetchJsonSafe(`${apiUrl}/categorias-ingreso`, {credentials: "include"});
      if (!cancelled) setCategoriasIngreso(toArray(dataCategoriasIngreso));

      // Caja abierta (puede no existir; no lo fuerzo a objeto)
      const dataCajaAbierta = await fetchJsonSafe(`${apiUrl}/caja-tesoreria/actual`, {credentials: "include"});
      if (!cancelled) setCajaAbierta(dataCajaAbierta || null);
    };

    fetchData();
    return () => { cancelled = true; };
  }, [apiUrl]);

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
        sucursalesTabla,
        articulosTabla,
        tipoDeIngresoTabla,
        tipoDeGastoTabla,
        planTarjetaTabla,
        tiposTarjetaTabla, setTiposTarjetaTabla,
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
