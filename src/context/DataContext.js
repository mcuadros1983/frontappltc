import React, { useState, useEffect } from "react";
import Contexts from "./Contexts";

export default function DataContextProvider({ children }) {
  const [data, setData] = useState(null);
  const [sucursales, setSucursales] = useState(null);
  const [clientes, setClientes] = useState(null);
  const [formasPago, setFormasPago] = useState(null);
  const [sucursalesTabla, setSucursalesTabla] = useState(null);
  const [subcategoriasTabla, setSubcategoriasTabla] = useState(null);
  const [articulosTabla, setArticulosTabla] = useState(null);
  const [tipoDeIngresoTabla, setTipoDeIngresoTabla] = useState(null);
  const [tipoDeGastoTabla, setTipoDeGastoTabla] = useState(null);
  const [planTarjetaTabla, setPlanTarjetaTabla] = useState(null);
  const [clientesTabla, setClientesTabla] = useState(null);
  const [empleados, setEmpleados] = useState(null);
  const [usuariosTabla, setUsuariosTabla] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // console.log("apliUrl", apiUrl)
    const fetchData = async () => {
      // Consulta para obtener sucursales
      const resSucursales = await fetch(`${apiUrl}/obtenersucursales`);
      const dataSucursales = await resSucursales.json();
      // console.log("sucursales", dataSucursales);
      if (dataSucursales.length > 0) {
        const sortedBranches = dataSucursales.sort((a, b) => a.id - b.id);
        setSucursales(sortedBranches);
      } else {
        setSucursales(dataSucursales);
      }

      // Consulta para obtener clientes
      const resClientes = await fetch(`${apiUrl}/obtenerclientestabla/`, {
        credentials: "include",
      });
      const dataClientes = await resClientes.json();
      setClientes(dataClientes);
      // console.log("Clientes", dataClientes);

      // Consulta para obtener formas de pago
      const resFormasPago = await fetch(`${apiUrl}/formas-pago`, {
        credentials: "include",
      });
      const dataFormasPago = await resFormasPago.json();
      setFormasPago(dataFormasPago);

      // Consultas para obtener las tablas adicionales
      const resClientesTabla = await fetch(`${apiUrl}/obtenerclientestabla`);
      const dataClientesTabla = await resClientesTabla.json();
      setClientesTabla(dataClientesTabla);

      // Consultas para obtener las tablas adicionales
      const resSucursalesTabla = await fetch(`${apiUrl}/obtenersucursales`);
      const dataSucursalesTabla = await resSucursalesTabla.json();
      setSucursalesTabla(dataSucursalesTabla);

      const resArticulosTabla = await fetch(`${apiUrl}/obtenerarticulos`);
      const dataArticulosTabla = await resArticulosTabla.json();
      setArticulosTabla(dataArticulosTabla);
      // console.log(`dataArticulosTabla`, dataArticulosTabla);

      const resTipoDeIngresoTabla = await fetch(`${apiUrl}/obtenertipoingreso`);
      const dataTipoDeIngresoTabla = await resTipoDeIngresoTabla.json();
      setTipoDeIngresoTabla(dataTipoDeIngresoTabla);

      // console.log(`datatipodeingresotabla`, dataTipoDeIngresoTabla);

      const resTipoDeGastoTabla = await fetch(`${apiUrl}/obtenertipogasto`);
      const dataTipoDeGastoTabla = await resTipoDeGastoTabla.json();
      const sortedTipoDeGastoTabla = dataTipoDeGastoTabla.sort((a, b) => {
        return a.descripcion.localeCompare(b.descripcion);
      });
      setTipoDeGastoTabla(sortedTipoDeGastoTabla);

      const resPlanTarjetaTabla = await fetch(`${apiUrl}/obtenerplantarjeta`);
      const dataPlanTarjetaTabla = await resPlanTarjetaTabla.json();
      setPlanTarjetaTabla(dataPlanTarjetaTabla);

      const resEmpleadosTabla = await fetch(`${apiUrl}/obtenerempleados`);
      const dataEmpleadosTabla = await resEmpleadosTabla.json();
      setEmpleados(dataEmpleadosTabla);

      const resUsuariosTabla = await fetch(`${apiUrl}/obtenerusuario`);
      const dataUsuariosTabla = await resUsuariosTabla.json();
      setUsuariosTabla(dataUsuariosTabla);

      const resSubcategoriasTabla = await fetch(
        `${apiUrl}/obtenersubcategorias`
      );
      const dataSubcategoriasTabla = await resSubcategoriasTabla.json();
      setSubcategoriasTabla(dataSubcategoriasTabla);

      // console.log("datacategoriastabla", dataCategoriasTabla);
    };
    fetchData();
  }, [apiUrl]);

  return (
    <Contexts.DataContext.Provider
      value={{
        data,
        setData,
        sucursales,
        setSucursales,
        clientes,
        setClientes,
        clientesTabla,
        subcategoriasTabla,
        formasPago,
        setFormasPago,
        empleados,
        usuariosTabla,
        sucursalesTabla,
        articulosTabla,
        tipoDeIngresoTabla,
        tipoDeGastoTabla,
        planTarjetaTabla,
      }}
    >
      {children}
    </Contexts.DataContext.Provider>
  );
}
