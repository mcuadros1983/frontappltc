import React, { useState, useContext, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  FormControl,
  Modal,
  ListGroup,
  InputGroup,
} from "react-bootstrap";
import Contexts from "../../../context/Contexts";
import { useNavigate } from "react-router-dom";

export default function CalculoRinde() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchSucursal, setSearchSucursal] = useState("");
  const [montoVentas, setMontoVentas] = useState(0);
  const [montoMovimientos, setMontoMovimientos] = useState(0);
  const [montoMovimientosOtros, setMontoMovimientosOtros] = useState(0);
  const [montoInventarioInicial, setMontoInventarioInicial] = useState(0);
  const [montoInventarioFinal, setMontoInventarioFinal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [inventarios, setInventarios] = useState([]);
  const [isFinal, setIsFinal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [novillosIngresos, setNovillosIngresos] = useState(0);
  const [exportacionIngresos, setExportacionIngresos] = useState(0);
  const [cerdosIngresos, setCerdosIngresos] = useState(0);
  const [kgNovillo, setKgNovillo] = useState(0);
  const [kgVaca, setKgVaca] = useState(0);
  const [kgCerdo, setKgCerdo] = useState(0);
  const [showModalCategories, setShowModalCategories] = useState(false);
  const [selectedCategorias, setSelectedCategorias] = useState([]);
  const [ajustes, setAjustes] = useState([]);
  const [showAjustesModal, setShowAjustesModal] = useState(false);
  const [nuevoAjuste, setNuevoAjuste] = useState({
    descripcion: "",
    importe: "",
  });

  const [rinde, setRinde] = useState(0);

  // Estados para el modal de ingresos esperados y ver
  const [showIngresosModal, setShowIngresosModal] = useState(false);
  const [showVerModal, setShowVerModal] = useState(false);

  const [cantidadMedias, setCantidadMedias] = useState("");
  const [totalKg, setTotalKg] = useState(null);
  const [costoprom, setCostoprom] = useState("");
  const [mgtotal, setMgtotal] = useState("");
  const [mgporkg, setMgporkg] = useState("");
  const [totalventa, setTotalventa] = useState("");
  const [promdiario, setPromdiario] = useState("");
  const [gastos, setGastos] = useState("");
  const [costovacuno, setCostovacuno] = useState("");
  const [achuras, setAchuras] = useState("");
  const [difInventario, setDifInventario] = useState("");
  const [ingEsperado, setIngEsperado] = useState("");
  const [ingVendido, setIngVendido] = useState("");
  const [difEsperado, setDifEsperado] = useState("");
  const [difVendido, setDifVendido] = useState("");
  const [valorRinde, setValorRinde] = useState("");
  const [eficiencia, setEficiencia] = useState("");

  // Ingreso manual
  const [mbcerdo, setMbcerdo] = useState("");
  const [cajagrande, setCajagrande] = useState("");
  const [otros, setOtros] = useState("");
  const [costoporcino, setCostoporcino] = useState("");

  const navigate = useNavigate();

  const context = useContext(Contexts.DataContext);
  // const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    setMontoVentas(0);
    setMontoMovimientos(0);
    setMontoMovimientosOtros(0);
    setMontoInventarioInicial(0);
    setMontoInventarioFinal(0);
    setKgNovillo(0);
    setKgVaca(0);
    setKgCerdo(0);
    setRinde(0);
    setAjustes([]);
    setCantidadMedias(0);
    setTotalKg(0);
    setCostoprom(0);
    setMgtotal(0);
    setMgporkg(0);
    setTotalventa(0);
    setPromdiario(0);
    setGastos(0);
    setCostovacuno(0);
    setAchuras(0);
    setDifInventario(0);
    setDifEsperado(0);
    setDifVendido(0);
    setValorRinde(0);
    setEficiencia(0);
    setMbcerdo(0);
    setCajagrande(0);
    setOtros(0);
    setCostoporcino(0);
    setIngEsperado(0);
    setIngVendido(0);
  }, [startDate, endDate, searchSucursal]);

  useEffect(() => {
    console.log("Reiniciando rinde...");
    setRinde(0);
  }, [
    montoVentas,
    montoMovimientos,
    montoMovimientosOtros,
    montoInventarioInicial,
    montoInventarioFinal,
    kgNovillo,
    kgVaca,
    kgCerdo,
    ajustes
  ]);

  // Resetear cantidadMedias si cambian kgNovillo, kgVaca o totalKg
  useEffect(() => {
    setCantidadMedias(0);
  }, [kgNovillo, kgVaca, totalKg]);

  // Resetear totalKg si cambian kgNovillo o kgVaca
  useEffect(() => {
    setTotalKg(0);
  }, [kgNovillo, kgVaca]);

  // Resetear costoprom si cambian totalKg o costovacuno
  useEffect(() => {
    setCostoprom(0);
  }, [totalKg, costovacuno]);

  // Resetear mgtotal si cambian montoVentas, montoMovimientos, montoMovimientosOtros, totalKg, costoprom, kgCerdo o cerdosIngresos
  useEffect(() => {
    setMgtotal(0);
  }, [montoVentas, montoMovimientos, montoMovimientosOtros, totalKg, costoprom, kgCerdo, cerdosIngresos]);

  // Resetear mgporkg si cambian mgtotal, montoInventarioFinal, montoInventarioInicial o totalKg
  useEffect(() => {
    setMgporkg(0);
  }, [mgtotal, montoInventarioFinal, montoInventarioInicial, totalKg]);

  // Resetear promdiario si cambia totalventa
  useEffect(() => {
    setPromdiario(0);
  }, [totalventa]);

  // Resetear costovacuno si cambia totalKg
  useEffect(() => {
    setCostovacuno(0);
  }, [totalKg]);

  // Resetear difInventario si cambian montoInventarioFinal o montoInventarioInicial
  useEffect(() => {
    setDifInventario(0);
  }, [montoInventarioFinal, montoInventarioInicial]);

  // Resetear mbcerdo si cambian cerdosIngresos o kgCerdo
  useEffect(() => {
    setMbcerdo(0);
  }, [cerdosIngresos, kgCerdo]);

  // Resetear costoporcino si cambian cerdosIngresos o kgCerdo
  useEffect(() => {
    setCostoporcino(0);
  }, [cerdosIngresos, kgCerdo]);

  // Resetear ingEsperado si cambian kgNovillo, kgVaca, novillosIngresos, exportacionIngresos o totalKg
  useEffect(() => {
    setIngEsperado(0);
  }, [kgNovillo, kgVaca, novillosIngresos, exportacionIngresos, totalKg]);

  // Resetear ingVendido si cambian montoVentas, montoMovimientos, montoMovimientosOtros, mbcerdo, montoInventarioFinal, montoInventarioInicial o totalKg
  useEffect(() => {
    setIngVendido(0);
  }, [montoVentas, montoMovimientos, montoMovimientosOtros, mbcerdo, montoInventarioFinal, montoInventarioInicial, totalKg, ajustes]);

  // Resetear difEsperado si cambian ingEsperado o costoprom
  useEffect(() => {
    setDifEsperado(0);
  }, [ingEsperado, costoprom]);

  // Resetear difVendido si cambian ingVendido o costoprom
  useEffect(() => {
    setDifVendido(0);
  }, [ingVendido, costoprom]);

  // Resetear valorRinde si cambia ingVendido
  useEffect(() => {
    setValorRinde(0);
  }, [ingVendido]);

  // Resetear rinde si cambian kgNovillo, kgVaca, kgCerdo, montoVentas, montoMovimientos, montoMovimientosOtros, montoInventarioFinal, montoInventarioInicial o ajustes
  useEffect(() => {
    setRinde(0);
  }, [kgNovillo, kgVaca, kgCerdo, montoVentas, montoMovimientos, montoMovimientosOtros, montoInventarioFinal, montoInventarioInicial, ajustes]);

  // Resetear eficiencia si cambian rinde, valorRinde o totalKg
  useEffect(() => {
    setEficiencia(0);
  }, [rinde, valorRinde, totalKg]);


  const isValidDate = (dateString) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;
    const date = new Date(dateString);
    if (!date.getTime()) return false;
    return date.toISOString().slice(0, 10) === dateString;
  };

  const handleStartDateChange = (value) => {
    setStartDate(value);
  };

  const handleEndDateChange = (value) => {
    setEndDate(value);
  };

  const handleObtenerInventario = async (isFinal) => {
    try {
      setLoading(true);
      if (!searchSucursal) {
        alert("Por favor seleccione una sucursal.");
        return;
      }

      const response = await fetch(
        `${apiUrl}/obtenermontoinventariosfiltrados`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sucursalId: searchSucursal,
            excludedCategories: selectedCategorias, //modificacion para exceptuar articulos segun categorias en ventas
          }), credentials: "include"
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.length === 0) {
          alert("No existen inventarios para la sucursal seleccionada.");
          return;
        }
        setInventarios(data);
        setShowModal(true);
        setIsFinal(isFinal);
      } else {
        throw new Error("Error al obtener el inventario.");
      }
    } catch (error) {
      alert("Error al obtener el inventario.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAjuste = () => {
    if (nuevoAjuste.descripcion.trim() && nuevoAjuste.importe.trim()) {
      setAjustes([...ajustes, { ...nuevoAjuste }]);
      setNuevoAjuste({ descripcion: "", importe: "" });
      setIngVendido(0); // ⬅️ opcional
    }
  };
  const handleGuardarAjustes = () => {
    setShowAjustesModal(false);
  };

  const handleCancelarAjustes = () => {
    setAjustes(ajustes);
    setShowAjustesModal(false);
  };

  const handleSelectCategories = async () => {
    if (!startDate || !endDate || !searchSucursal) {
      alert("Por favor complete las fechas y seleccione una sucursal.");
      return;
    }

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      alert("Ingrese una fecha válida.");
      return;
    }
    setShowModalCategories(true);
  };

  const handleObtenerDatos = async (url, operacion, excludedCategoriesId) => {
    try {
      setLoading(true);
      if (!startDate || !endDate || !searchSucursal) {
        alert("Por favor complete las fechas y seleccione una sucursal.");
        return;
      }

      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        return;
      }

      if (operacion === "ventas") {
        setShowModalCategories(false);
      }

      const bodyData = {
        fechaDesde: startDate,
        fechaHasta: endDate,
        sucursalId: searchSucursal,
      };

      if (excludedCategoriesId !== undefined) {
        bodyData.excludedCategories = excludedCategoriesId;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData), credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();

        if (operacion === "ventas" && data.montoTotalVenta === 0) {
          alert("No existen ventas para la fecha seleccionada.");
          return;
        } else if (
          operacion === "movimientos" &&
          data.montoTotalMovimientos === 0
        ) {
          alert("No existen movimientos para la fecha seleccionada.");
          return;
        } else if (
          operacion === "movimientosotros" &&
          data.montoTotalMovimientos === 0
        ) {
          alert("No existen movimientos OTROS para la fecha seleccionada.");
          return;
        }

        if (operacion === "ventas") {
          setMontoVentas(data.montoTotalVenta);
        } else if (operacion === "movimientos") {
          setMontoMovimientos(data.montoTotalMovimientos);
        } else if (operacion === "movimientosotros") {
          setMontoMovimientosOtros(data.montoTotalMovimientos);
        }
      } else {
        throw new Error("Error al obtener los datos.");
      }
    } catch (error) {
      alert("Error al obtener los datos.");
    } finally {
      setLoading(false);
    }
  };


  const handleObtenerKg = async (url, subcategoria) => {
    try {
      setLoading(true);
      if (!startDate || !endDate || !searchSucursal) {
        alert("Por favor complete las fechas y seleccione una sucursal.");
        return;
      }

      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        return;
      }

      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fechaDesde: startDate,
          fechaHasta: endDate,
          sucursalId: searchSucursal,
          subcategoria: subcategoria,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // console.log("data", data);

        if (data.productos.length === 0) {
          alert("No se encontraron datos para la fecha seleccionada");
          return;
        }

        // Actualizar el estado con el valor de kg obtenido

        if (subcategoria === "nt") {
          setKgNovillo(data.sumaKg);
        } else if (subcategoria === "va") {
          setKgVaca(data.sumaKg);
        } else if (subcategoria === "cerdo") {
          setKgCerdo(data.sumaKg);
        }
      } else {
        throw new Error("Error al obtener los kg.");
      }
    } catch (error) {
      alert("Error al obtener los kg.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSelectInventario = (inventario) => {
    // setSelectedInventario(inventario);
    if (isFinal) {
      setMontoInventarioFinal(inventario.total);
    } else {
      setMontoInventarioInicial(inventario.total);
    }
    setShowModal(false);
  };

  // Funciones para manejar los cambios en los ingresos esperados
  const handleNovillosChange = (value) => {
    setNovillosIngresos(value);
  };

  const handleExportacionChange = (value) => {
    setExportacionIngresos(value);
  };

  const handleCerdosChange = (value) => {
    setCerdosIngresos(value);
  };

  // Función para guardar los valores de ingresos esperados
  const handleGuardarIngresos = () => {
    // Aquí puedes realizar acciones adicionales, como enviar los datos al servidor si es necesario
    alert("Valores de ingresos esperados guardados correctamente.");
    setShowIngresosModal(false);
  };

  // Función para mostrar el modal de ver ingresos esperados
  const handleVerIngresos = () => {
    setShowVerModal(true);
  };

  // Función para cerrar el modal de ver ingresos esperados
  const handleCloseVerModal = () => {
    setShowVerModal(false);
  };

// Reemplazá COMPLETO el handler por esta versión basada en: rinde = (1 - ingresoVendido / ingresoEsperado) * 100
const handleCalculoRinde = () => {
  const esperado = parseFloat(ingEsperado) || 0; // $/kg esperado
  const vendido  = parseFloat(ingVendido)  || 0; // $/kg vendido

  if (esperado <= 0) {
    setRinde(0);
    alert("Primero calculá el Ingreso Esperado (y el Ingreso Vendido) para poder obtener el rinde.");
    return;
  }

  let rindeCalculado = (1 - (vendido / esperado)) * 100;

  if (!isFinite(rindeCalculado) || isNaN(rindeCalculado)) {
    rindeCalculado = 0;
  }

  setRinde(Number(rindeCalculado.toFixed(2)));
};

  const handleEliminarAjuste = (index) => {
    const nuevosAjustes = [...ajustes];
    nuevosAjustes.splice(index, 1);
    setAjustes(nuevosAjustes);
    setIngVendido(0); // ⬅️ opcional
  };

  const handleObtenerCantidadMedias = async () => {
    try {
      setLoading(true);
      if (!startDate || !endDate || !searchSucursal) {
        alert("Por favor complete las fechas y seleccione una sucursal.");
        return;
      }

      const response = await fetch(`${apiUrl}/sumacantidad`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fechaDesde: startDate,
          fechaHasta: endDate,
          sucursalId: searchSucursal,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCantidadMedias(data.cantidadMedias);
        console.log("Cantidad de medias bovino:", data.cantidadMedias);
      } else {
        alert("Error al obtener cantidad de medias.");
      }
    } catch (error) {
      console.error("Error al obtener cantidad de medias:", error);
      alert("Error al obtener cantidad de medias.");
    } finally {
      setLoading(false);
    }
  };

  const handleObtenerTotalKg = () => {
    const total =
      (Number(kgNovillo) || 0) + (Number(kgVaca) || 0);

    setTotalKg(total); // o solo `total` si no querés redondeo
    console.log("Total Kg calculado:", total);
  };
  const handleObtenerCostoProm = async () => {
    try {
      setLoading(true);
      if (!startDate || !endDate || !searchSucursal) {
        alert("Por favor complete las fechas y seleccione una sucursal.");
        return;
      }

      const response = await fetch(`${apiUrl}/ordenes/costopromedio`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fechaDesde: startDate,
          fechaHasta: endDate,
          sucursalId: searchSucursal,
          totalKg: totalKg, // este valor ya calculado previamente
        }),
      });

      const data = await response.json();
      console.log("datacostoprom", data)

      if (response.ok) {
        setCostoprom(data.costoPromedio.toFixed(2));
        console.log("Costo promedio:", data.costoPromedio);
      } else {
        alert("Error al obtener costo promedio.");
      }
    } catch (error) {
      console.error("Error al obtener costo promedio:", error);
      alert("Error al obtener costo promedio.");
    } finally {
      setLoading(false);
    }
  };

  const handleObtenerMgtotal = () => {
    try {
      console.log("valores", "montoVentas", montoVentas, "montoMovimientos", montoMovimientos, "montoMovimientosOtros", montoMovimientosOtros, "montocosto", ((Number(totalKg) || 0) * (Number(costoprom) || 0)))
      const total =
        (Number(montoVentas) || 0) +
        (Number(montoMovimientos) || 0) -
        (Number(montoMovimientosOtros) || 0) -
        ((Number(totalKg) || 0) * (Number(costoprom) || 0)) -
        ((Number(kgCerdo) || 0) * (Number(cerdosIngresos) || 0));

      setMgtotal(total.toFixed(2));
      console.log("MG total:", total);
    } catch (error) {
      console.error("Error al calcular mgtotal:", error);
      alert("Error al calcular mgtotal");
    }
  };
  const handleObtenerMgporkg = () => {
    try {
      const total =
        (Number(mgtotal) || 0) +
        ((Number(montoInventarioFinal) || 0) - (Number(montoInventarioInicial) || 0));

      const resultado = totalKg > 0 ? (total / Number(totalKg)) : 0;

      setMgporkg(resultado.toFixed(2));
      console.log("MG por Kg:", resultado);
    } catch (error) {
      console.error("Error al calcular mgporkg:", error);
      alert("Error al calcular MG por Kg");
    }
  };

  const handleObtenerTotalventa = async () => {
    try {
      setLoading(true);
      if (!startDate || !endDate || !searchSucursal) {
        alert("Por favor complete las fechas y seleccione una sucursal.");
        return;
      }

      const response = await fetch(`${apiUrl}/ventas/filtradas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fechaDesde: startDate,
          fechaHasta: endDate,
          sucursalId: searchSucursal,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al obtener las ventas filtradas");
      }

      const ventas = await response.json();

      if (!Array.isArray(ventas) || ventas.length === 0) {
        alert("No existen ventas para la fecha indicada.");
        setMontoVentas(0);
        return;
      }

      const total = ventas.reduce((sum, venta) => {
        return sum + parseFloat(venta.monto || 0);
      }, 0);

      setTotalventa(total.toFixed(2));
      console.log("Total ventas:", total);
    } catch (error) {
      console.error("Error al obtener monto de ventas:", error);
      alert("Error al obtener monto de ventas.");
    } finally {
      setLoading(false);
    }
  };

  const handleObtenerPromdiario = async () => {
    try {
      setLoading(true);

      if (!startDate || !endDate || !searchSucursal) {
        alert("Por favor complete las fechas y seleccione una sucursal.");
        return;
      }

      const response = await fetch(`${apiUrl}/ventas/dias-con-ventas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fechaDesde: startDate,
          fechaHasta: endDate,
          sucursalId: searchSucursal, credentials: "include"
        }),
      });

      if (!response.ok) {
        throw new Error("Error al obtener cantidad de días con ventas.");
      }

      const data = await response.json();
      const cantidadDias = data.diasConVentas;

      if (cantidadDias === 0) {
        alert("No hubo días con ventas en el período seleccionado.");
        return;
      }

      const promedio = totalventa / cantidadDias;
      setPromdiario(promedio.toFixed(2));
      console.log("Promedio diario de ventas:", promedio);
    } catch (error) {
      console.error("Error al calcular promedio diario:", error);
      alert("Error al calcular promedio diario.");
    } finally {
      setLoading(false);
    }
  };


  const handleObtenerGastos = async () => {
    try {
      setLoading(true);

      if (!startDate || !endDate || !searchSucursal) {
        alert("Por favor complete las fechas y seleccione una sucursal.");
        return;
      }

      const response = await fetch(`${apiUrl}/caja/suma_gastos`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fechaDesde: startDate,
          fechaHasta: endDate,
          sucursalId: searchSucursal,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al obtener los gastos.");
      }


      const data = await response.json();

      console.log("datagastos", data)
      setGastos(parseFloat(data.totalGastos).toFixed(2)); // Guardamos en estado
      console.log("Gastos totales:", data.totalGastos);
    } catch (error) {
      console.error("Error al obtener gastos:", error);
      alert("Error al obtener gastos.");
    } finally {
      setLoading(false);
    }
  };

  const handleObtenerCostovacuno = async () => {
    try {
      setLoading(true);

      if (!startDate || !endDate || !searchSucursal) {
        alert("Por favor complete las fechas y seleccione una sucursal.");
        return;
      }

      const response = await fetch(`${apiUrl}/ordenes/costovacuno_total`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fechaDesde: startDate,
          fechaHasta: endDate,
          sucursalId: searchSucursal,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCostovacuno(data.costoTotalVacuno.toFixed(2));
        console.log("Costo total vacuno:", data.costoTotalVacuno);
      } else {
        alert("Error al obtener costo vacuno.");
      }
    } catch (error) {
      console.error("Error al obtener costo vacuno:", error);
      alert("Error al obtener costo vacuno.");
    } finally {
      setLoading(false);
    }
  };

  const handleObtenerCostoporcino = async () => {
    try {
      setLoading(true);

      if (!startDate || !endDate || !searchSucursal) {
        alert("Por favor complete las fechas y seleccione una sucursal.");
        return;
      }

      const response = await fetch(`${apiUrl}/ordenes/costoporcino_total`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fechaDesde: startDate,
          fechaHasta: endDate,
          sucursalId: searchSucursal,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCostoporcino(data.costoTotalPorcino.toFixed(2));
        console.log("Costo total porcino:", data.costoTotalPorcino);
      } else {
        alert("Error al obtener costo porcino.");
      }
    } catch (error) {
      console.error("Error al obtener costo porcino:", error);
      alert("Error al obtener costo porcino.");
    } finally {
      setLoading(false);
    }
  };



  const handleObtenerAchuras = async () => {
    try {
      setLoading(true);

      if (!startDate || !endDate || !searchSucursal) {
        alert("Por favor complete las fechas y seleccione una sucursal.");
        return;
      }

      const response = await fetch(`${apiUrl}/movimientos-otro/achuras`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fechaDesde: startDate,
          fechaHasta: endDate,
          sucursalId: searchSucursal, credentials: "include"
        }),
      });

      const data = await response.json();
      console.log("dataachuras", data)

      if (response.ok) {
        setAchuras(data.montoTotalAchuras.toFixed(2));
        console.log("Achuras totales:", data.montoTotalAchuras);
      } else {
        alert("Error al obtener achuras.");
      }
    } catch (error) {
      console.error("Error al obtener achuras:", error);
      alert("Error al obtener achuras.");
    } finally {
      setLoading(false);
    }
  };

  const handleObtenerDifInventario = () => {
    try {
      const inicial = parseFloat(montoInventarioInicial) || 0;
      const final = parseFloat(montoInventarioFinal) || 0;

      const diferencia = final - inicial;

      setDifInventario(diferencia.toFixed(2));
      console.log("Diferencia de inventario:", diferencia);
    } catch (error) {
      console.error("Error al calcular diferencia de inventario:", error);
      alert("Error al calcular diferencia de inventario.");
    }
  };

  const handleObtenerIngEsperado = () => {
    try {

      const kgNov = parseFloat(kgNovillo) || 0;
      const kgVac = parseFloat(kgVaca) || 0;
      const novIngreso = parseFloat(novillosIngresos) || 0;
      const expIngreso = parseFloat(exportacionIngresos) || 0;

      console.log("kgnov", kgNov, "kgvac", kgVac, "noving", novIngreso, "expingreso", expIngreso)
      // const totalKg = kgNov + kgVac;

      if (totalKg === 0) {
        setIngEsperado(0);
        alert("No hay kilos de novillo ni exportación para calcular ingreso esperado.");
        return;
      }

      const ingresoEsperado = ((novIngreso * kgNov) + (expIngreso * kgVac)) / totalKg;

      setIngEsperado(ingresoEsperado.toFixed(2));
      console.log("Ingreso esperado:", ingresoEsperado);
    } catch (error) {
      console.error("Error al calcular ingreso esperado:", error);
      alert("Error al calcular ingreso esperado.");
    }
  };


  // Reemplazá COMPLETO este handler (ahora SÍ aplica ajustes acá)
  const handleObtenerIngVendido = () => {
    try {
      const ventas = parseFloat(montoVentas) || 0;
      const movimientos = parseFloat(montoMovimientos) || 0;
      const movimientosOtros = parseFloat(montoMovimientosOtros) || 0;
      const cerdoMb = parseFloat(mbcerdo) || 0;
      const invFinal = parseFloat(montoInventarioFinal) || 0;
      const invInicial = parseFloat(montoInventarioInicial) || 0;
      // const ach = parseFloat(achuras) || 0;

      // 🔹 Nuevo: sumar (o restar si viene negativo) los ajustes al ingreso vendido
      const montoAjuste = (ajustes || []).reduce(
        (total, a) => total + (parseFloat(a.importe) || 0),
        0
      );

      if (!totalKg || totalKg === 0) {
        setIngVendido(0);
        alert("No hay kilos suficientes para calcular ingreso vendido.");
        return;
      }

      let ingresoVendido =
        (ventas +
          movimientos -
          movimientosOtros -
          cerdoMb +
          // ach +
          (invFinal - invInicial) +
          montoAjuste // ⬅️ Ajustes se incorporan acá
        ) / totalKg;

      if (!isFinite(ingresoVendido) || isNaN(ingresoVendido)) {
        ingresoVendido = 0;
      }

      setIngVendido(ingresoVendido.toFixed(2));
      console.log("Ingreso vendido (con ajustes):", ingresoVendido, "Ajustes:", montoAjuste);
    } catch (error) {
      console.error("Error al calcular ingreso vendido:", error);
      alert("Error al calcular ingreso vendido.");
    }
  };

  const handleObtenerDifEsperado = () => {
    try {
      const ingresoEsperado = parseFloat(ingEsperado) || 0;
      const costoPromedio = parseFloat(costoprom) || 0;

      let diferencia = ingresoEsperado - costoPromedio;

      if (!isFinite(diferencia) || isNaN(diferencia)) {
        diferencia = 0;
      }

      setDifEsperado(diferencia.toFixed(2));
      console.log("Diferencia Esperado:", diferencia);
    } catch (error) {
      console.error("Error al calcular diferencia esperada:", error);
      setDifEsperado("0");
      alert("Error al calcular diferencia esperada.");
    }
  };

  const handleObtenerDifVendido = () => {
    try {
      const ingresoVendido = parseFloat(ingVendido) || 0;
      const costoPromedio = parseFloat(costoprom) || 0;

      let diferencia = ingresoVendido - costoPromedio;

      if (!isFinite(diferencia) || isNaN(diferencia)) {
        diferencia = 0;
      }

      setDifVendido(diferencia.toFixed(2));
      console.log("Diferencia Vendido:", diferencia);
    } catch (error) {
      console.error("Error al calcular diferencia vendida:", error);
      setDifVendido("0");
      alert("Error al calcular diferencia vendida.");
    }
  };


  const handleObtenerValorRinde = () => {
    try {
      const ingresoVendido = parseFloat(ingVendido) || 0;

      let valor = ingresoVendido / 93;

      if (!isFinite(valor) || isNaN(valor)) {
        valor = 0;
      }

      setValorRinde(valor.toFixed(2));
      console.log("Valor Rinde:", valor);
    } catch (error) {
      console.error("Error al calcular Valor Rinde:", error);
      setValorRinde("0");
      alert("Error al calcular Valor Rinde.");
    }
  };


  const handleObtenerEficiencia = () => {
    try {
      const r = parseFloat(rinde) || 0;
      const valor = parseFloat(valorRinde) || 0;
      const kg = parseFloat(totalKg) || 0;
      console.log("rinde", ((r) / 100), "valor", valor, "totalkg", kg)
      let resultado = ((r) / 100) * valor * kg * 100;

      if (!isFinite(resultado) || isNaN(resultado)) {
        resultado = 0;
      }

      setEficiencia(resultado.toFixed(2));
      console.log("Eficiencia:", resultado);
    } catch (error) {
      console.error("Error al calcular eficiencia:", error);
      setEficiencia("0");
      alert("Error al calcular eficiencia.");
    }
  };

  const handleObtenerMbCerdo = () => {
    try {
      const ingresos = parseFloat(cerdosIngresos) || 0;
      const kg = parseFloat(kgCerdo) || 0;

      const resultado = ingresos * kg;

      if (!isFinite(resultado) || isNaN(resultado)) {
        setMbcerdo(0);
        alert("No se pudo calcular mbcerdo. Verifica los valores.");
        return;
      }

      setMbcerdo(resultado.toFixed(2));
      console.log("mbcerdo:", resultado);
    } catch (error) {
      console.error("Error al calcular mbcerdo:", error);
      alert("Error al calcular mbcerdo.")
    }
  };



  const handleGuardarRinde = async () => {
    const confirmacion = window.confirm("¿Desea guardar el rinde?");
    if (confirmacion) {
      try {
        // Verificar que los campos obligatorios no estén vacíos ni sean nulos
        if (
          !startDate ||
          !endDate ||
          !selectedMonth ||
          !selectedYear ||
          !searchSucursal
        ) {
          alert("Por favor complete todos los campos.");
          return;
        }

        // Convertir mes y año a números enteros
        const mes = parseInt(selectedMonth);
        const anio = parseInt(selectedYear);

        // Verificar que mes y año sean números válidos
        if (isNaN(mes) || isNaN(anio)) {
          alert("Por favor seleccione un mes y año válidos.");
          return;
        }

        // Convertir sucursal_id a número entero
        const sucursalId = parseInt(searchSucursal);

        // Verificar que sucursalId sea un número válido
        if (isNaN(sucursalId)) {
          alert("Por favor seleccione una sucursal válida.");
          return;
        }

        setLoading(true);

        // Verificar si ya existe un rinde para la sucursal, mes y año especificados
        const verificarExistenciaResponse = await fetch(
          `${apiUrl}/obtenerrindefiltrado`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sucursalId: sucursalId,
              mes: mes,
              anio: anio,
            }),
          }
        );

        if (verificarExistenciaResponse.ok) {
          const data = await verificarExistenciaResponse.json();
          if (data.rindes.length > 0) {
            alert(
              "Ya se ha guardado un rendimiento para la sucursal, mes y año indicados."
            );

            return;
          }
        } else {
          throw new Error("Error al verificar la existencia del rinde.");
        }

        // Calcula el rinde aquí o asegúrate que se ha calculado correctamente antes de este punto
        const rindeCalculado = parseFloat(rinde); // Asumiendo que 'rinde' es una variable ya definida

        // Verificar si el rinde es infinito
        if (!isFinite(rindeCalculado)) {
          alert("Error en el cálculo del rinde, verifique los parámetros");
          return;
        }

        // Continuar con el proceso de guardado del rinde
        const response = await fetch(`${apiUrl}/crearrinde`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fechaDesde: startDate,
            fechaHasta: endDate,
            mes: mes,
            anio: anio,
            sucursal_id: sucursalId,
            totalVentas: parseFloat(montoVentas),
            totalMovimientos: parseFloat(montoMovimientos),
            totalMovimientosOtros: parseFloat(montoMovimientosOtros),
            totalInventarioInicial: parseFloat(montoInventarioInicial),
            totalInventarioFinal: parseFloat(montoInventarioFinal),
            ingresoEsperadoNovillo: parseFloat(novillosIngresos),
            ingresoEsperadoVaca: parseFloat(exportacionIngresos),
            ingresoEsperadoCerdo: parseFloat(cerdosIngresos),
            totalKgNovillo: parseFloat(kgNovillo),
            totalKgVaca: parseFloat(kgVaca),
            totalKgCerdo: parseFloat(kgCerdo),
            rinde: rindeCalculado,
            datosAjuste: ajustes,
            cantidadMedias: parseFloat(cantidadMedias),
            totalKg: parseFloat(totalKg),
            mbcerdo: parseFloat(mbcerdo),
            costoprom: parseFloat(costoprom),
            mgtotal: parseFloat(mgtotal),
            mgporkg: parseFloat(mgporkg),
            promdiario: parseFloat(promdiario),
            totalventa: parseFloat(totalventa),
            gastos: parseFloat(gastos),
            cajagrande: parseFloat(cajagrande),
            otros: parseFloat(otros),
            costovacuno: parseFloat(costovacuno),
            // achuras: parseFloat(achuras),
            difInventario: parseFloat(difInventario),
            costoporcino: parseFloat(costoporcino),
            ingEsperado: parseFloat(ingEsperado),
            ingVendido: parseFloat(ingVendido),
            difEsperado: parseFloat(difEsperado),
            difVendido: parseFloat(difVendido),
            valorRinde: parseFloat(valorRinde),
            eficiencia: parseFloat(eficiencia),
          }),
        });

        if (response.ok) {
          alert("Rinde guardado correctamente.");
          navigate("/inventory/performancelist"); // 👈 Redirección
        } else {
          throw new Error("Error al guardar el rinde.");
        }
      } catch (error) {
        alert("Error al guardar el rinde.");
      } finally {
        setLoading(false);
      }
    }
  };

  // const total =
  //   (Number(kgNovillo) || 0) + (Number(kgVaca) || 0) + (Number(kgCerdo) || 0);

  // setTotalKg(total.toFixed(2));

return (
  <Container className="vt-page">
    <h1 className="my-list-title dark-text vt-title">Cálculo de Rendimiento</h1>

    {/* Filtros MES/AÑO */}
    <div className="vt-toolbar mb-3 d-flex flex-wrap align-items-end gap-3">
      <div className="d-inline-block w-auto">
        <label className="vt-label d-block">MES</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="form-control vt-input text-center"
          disabled={loading}
        >
          <option value="">Seleccione el mes</option>
          <option value="01">Enero</option>
          <option value="02">Febrero</option>
          <option value="03">Marzo</option>
          <option value="04">Abril</option>
          <option value="05">Mayo</option>
          <option value="06">Junio</option>
          <option value="07">Julio</option>
          <option value="08">Agosto</option>
          <option value="09">Septiembre</option>
          <option value="10">Octubre</option>
          <option value="11">Noviembre</option>
          <option value="12">Diciembre</option>
        </select>
      </div>

      <div className="d-inline-block w-auto">
        <label className="vt-label d-block">AÑO</label>
        <input
          type="number"
          placeholder="Año"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="form-control vt-input text-center"
          min="2000"
          max="2050"
          maxLength="4"
          disabled={loading}
        />
      </div>
    </div>

    {/* Filtros fechas + sucursal */}
    <div className="vt-toolbar mb-3 d-flex flex-wrap align-items-end gap-3">
      <div className="d-inline-block w-auto">
        <label className="vt-label d-block">DESDE</label>
        <input
          type="date"
          placeholder="Seleccione fecha de inicio"
          value={startDate}
          onChange={(e) => handleStartDateChange(e.target.value)}
          className="form-control vt-input text-center"
          disabled={loading}
        />
      </div>

      <div className="d-inline-block w-auto">
        <label className="vt-label d-block">HASTA</label>
        <input
          type="date"
          placeholder="Seleccione fecha de fin"
          value={endDate}
          onChange={(e) => handleEndDateChange(e.target.value)}
          className="form-control vt-input text-center"
          disabled={loading}
        />
      </div>

      <div className="d-inline-block w-auto">
        <label className="vt-label d-block">Sucursal</label>
        <FormControl
          as="select"
          placeholder="Seleccione una sucursal"
          value={searchSucursal}
          onChange={(e) => setSearchSucursal(e.target.value)}
          className="vt-input"
          style={{ minWidth: 260 }}
          disabled={loading}
        >
          <option value="">Seleccione una sucursal</option>
          {context.sucursalesTabla.map((sucursal) => (
            <option key={sucursal.id} value={sucursal.id}>
              {sucursal.nombre}
            </option>
          ))}
        </FormControl>
      </div>
    </div>

    {/* Tabla de acciones/valores */}
    <div className="vt-tablewrap table-responsive">
      <Table striped bordered hover className="mb-2">
        <thead>
          <tr>
            <th>Operaciones</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Button onClick={() => handleSelectCategories()} disabled={loading} className="vt-btn">
                Obtener Ventas
              </Button>
            </td>
            <td className="text-end">
              {montoVentas !== null ? `$${parseInt(montoVentas).toFixed(2)}` : "-"}
            </td>
          </tr>

          <tr>
            <td>
              <Button
                onClick={() => handleObtenerDatos(`${apiUrl}/obtenermontomovimientosfiltrados`, "movimientos")}
                disabled={loading}
                className="vt-btn"
              >
                Obtener Movimientos
              </Button>
            </td>
            <td className="text-end">
              {montoMovimientos !== null ? `$${parseInt(montoMovimientos).toFixed(2)}` : "-"}
            </td>
          </tr>

          <tr>
            <td>
              <Button
                onClick={() => handleObtenerDatos(`${apiUrl}/movimientos-otro/monto`, "movimientosotros")}
                disabled={loading}
                className="vt-btn"
              >
                Obtener Movimientos Otros
              </Button>
            </td>
            <td className="text-end">
              {montoMovimientosOtros !== null ? `$${parseInt(montoMovimientosOtros).toFixed(2)}` : "-"}
            </td>
          </tr>

          <tr>
            <td>
              <Button onClick={() => handleObtenerInventario(false)} disabled={loading} className="vt-btn">
                Obtener Inventario Inicial
              </Button>
            </td>
            <td className="text-end">
              {montoInventarioInicial !== null ? `$${parseInt(montoInventarioInicial).toFixed(2)}` : "-"}
            </td>
          </tr>

          <tr>
            <td>
              <Button onClick={() => handleObtenerInventario(true)} disabled={loading} className="vt-btn">
                Obtener Inventario Final
              </Button>
            </td>
            <td className="text-end">
              {montoInventarioFinal !== null ? `$${parseInt(montoInventarioFinal).toFixed(2)}` : "-"}
            </td>
          </tr>

          <tr>
            <td>
              <Button onClick={() => setShowIngresosModal(true)} disabled={loading} className="vt-btn">
                Ingresos Esperados
              </Button>
            </td>
            <td>
              <Button
                onClick={handleVerIngresos}
                disabled={loading || (novillosIngresos === 0 && exportacionIngresos === 0 && cerdosIngresos === 0)}
                className="vt-btn-secondary"
              >
                Ver
              </Button>
            </td>
          </tr>

          <tr>
            <td>
              <Button onClick={() => handleObtenerKg(`${apiUrl}/productosordenesfiltradas`, "nt")} disabled={loading} className="vt-btn">
                Kgs Novillo
              </Button>
            </td>
            <td className="text-end">{kgNovillo !== null ? `${kgNovillo} Kg` : "-"}</td>
          </tr>

          <tr>
            <td>
              <Button onClick={() => handleObtenerKg(`${apiUrl}/productosordenesfiltradas`, "va")} disabled={loading} className="vt-btn">
                Kgs Exportacion
              </Button>
            </td>
            <td className="text-end">{kgVaca !== null ? `${kgVaca} Kg` : "-"}</td>
          </tr>

          <tr>
            <td>
              <Button onClick={handleObtenerCostovacuno} disabled={loading} className="vt-btn">
                Obtener Costo Vacuno
              </Button>
            </td>
            <td className="text-end">{costovacuno !== null ? `$${costovacuno}` : "-"}</td>
          </tr>

          <tr>
            <td>
              <Button onClick={() => handleObtenerKg(`${apiUrl}/productosordenesfiltradas`, "cerdo")} disabled={loading} className="vt-btn">
                Kgs Cerdo
              </Button>
            </td>
            <td className="text-end">{kgCerdo !== null ? `${kgCerdo} Kg` : "-"}</td>
          </tr>

          <tr>
            <td>
              <Button onClick={handleObtenerCostoporcino} disabled={loading} className="vt-btn">
                Obtener Costo Porcino
              </Button>
            </td>
            <td className="text-end">{costoporcino !== null ? `$${costoporcino}` : "-"}</td>
          </tr>

          <tr>
            <td>
              <Button onClick={() => setShowAjustesModal(true)} disabled={loading} className="vt-btn">
                Agregar Ajuste
              </Button>
            </td>
            <td>
              <Button onClick={() => setShowAjustesModal(true)} disabled={loading || ajustes.length === 0} className="vt-btn-secondary">
                Ver
              </Button>
            </td>
          </tr>

          <tr>
            <td>
              <Button onClick={handleObtenerTotalKg} disabled={loading} className="vt-btn">
                Obtener Total Kg
              </Button>
            </td>
            <td className="text-end">{totalKg !== null ? `${totalKg} Kg` : "-"}</td>
          </tr>

          <tr>
            <td>
              <Button onClick={handleObtenerCantidadMedias} disabled={loading} className="vt-btn">
                Obtener Cantidad Medias
              </Button>
            </td>
            <td className="text-end">{cantidadMedias !== "" ? cantidadMedias : "-"}</td>
          </tr>

          <tr>
            <td>
              <Button onClick={handleObtenerCostoProm} disabled={loading} className="vt-btn">
                Obtener Costo Promedio
              </Button>
            </td>
            <td className="text-end">{costoprom !== null ? `$${costoprom}` : "-"}</td>
          </tr>

          <tr>
            <td>
              <Button onClick={handleObtenerMgtotal} disabled={loading} className="vt-btn">
                Obtener Margen Total
              </Button>
            </td>
            <td className="text-end">{mgtotal !== null ? `$${mgtotal}` : "-"}</td>
          </tr>

          <tr>
            <td>
              <Button onClick={handleObtenerMgporkg} disabled={loading} className="vt-btn">
                Obtener Margen por Kg
              </Button>
            </td>
            <td className="text-end">{mgporkg !== null ? `$${mgporkg}` : "-"}</td>
          </tr>

          <tr>
            <td>
              <Button onClick={handleObtenerTotalventa} disabled={loading} className="vt-btn">
                Obtener Total Venta
              </Button>
            </td>
            <td className="text-end">{totalventa !== null ? `$${totalventa}` : "-"}</td>
          </tr>

          <tr>
            <td>
              <Button onClick={handleObtenerPromdiario} disabled={loading} className="vt-btn">
                Obtener Promedio Diario
              </Button>
            </td>
            <td className="text-end">{promdiario !== null ? `$${promdiario}` : "-"}</td>
          </tr>

          <tr>
            <td>
              <Button onClick={handleObtenerGastos} disabled={loading} className="vt-btn">
                Obtener Gastos
              </Button>
            </td>
            <td className="text-end">{gastos !== null ? `$${gastos}` : "-"}</td>
          </tr>

          <tr>
            <td>
              <Button onClick={handleObtenerAchuras} disabled={loading} className="vt-btn">
                Obtener Achuras
              </Button>
            </td>
            <td className="text-end">{achuras !== null ? `$${achuras}` : "-"}</td>
          </tr>

          <tr>
            <td>
              <Button onClick={handleObtenerDifInventario} disabled={loading} className="vt-btn">
                Obtener Diferencia Inventario
              </Button>
            </td>
            <td className="text-end">{difInventario !== null ? `$${difInventario}` : "-"}</td>
          </tr>

          <tr>
            <td>
              <Button onClick={handleObtenerMbCerdo} disabled={loading} className="vt-btn">
                MB Cerdo
              </Button>
            </td>
            <td className="text-end">{mbcerdo !== null ? `$${mbcerdo}` : "-"}</td>
          </tr>

          <tr>
            <td>Caja Grande</td>
            <td>
              <input
                type="number"
                value={cajagrande}
                onChange={(e) => setCajagrande(e.target.value)}
                className="form-control vt-input"
              />
            </td>
          </tr>

          <tr>
            <td>Otros</td>
            <td>
              <input
                type="number"
                value={otros}
                onChange={(e) => setOtros(e.target.value)}
                className="form-control vt-input"
              />
            </td>
          </tr>

          <tr>
            <td>
              <Button onClick={handleObtenerIngEsperado} disabled={loading} className="vt-btn">
                Obtener Ingreso Esperado
              </Button>
            </td>
            <td className="text-end">{ingEsperado !== null ? `$${ingEsperado}` : "-"}</td>
          </tr>

          <tr>
            <td>
              <Button onClick={handleObtenerIngVendido} disabled={loading} className="vt-btn">
                Obtener Ingreso Vendido
              </Button>
            </td>
            <td className="text-end">{ingVendido !== null ? `$${ingVendido}` : "-"}</td>
          </tr>

          <tr>
            <td>
              <Button onClick={handleObtenerDifEsperado} disabled={loading} className="vt-btn">
                Obtener Diferencia Esperado
              </Button>
            </td>
            <td className="text-end">{difEsperado !== null ? `$${difEsperado}` : "-"}</td>
          </tr>

          <tr>
            <td>
              <Button onClick={handleObtenerDifVendido} disabled={loading} className="vt-btn">
                Obtener Diferencia Vendido
              </Button>
            </td>
            <td className="text-end">{difVendido !== null ? `$${difVendido}` : "-"}</td>
          </tr>

          <tr>
            <td>
              <Button onClick={handleObtenerValorRinde} disabled={loading} className="vt-btn">
                Obtener Valor Rinde
              </Button>
            </td>
            <td className="text-end">{valorRinde !== null ? `${valorRinde}` : "-"}</td>
          </tr>

          {/* Calcular rinde */}
          <tr>
            <td>
              <Button onClick={handleCalculoRinde} disabled={loading} className="vt-btn">
                Calcular Rinde
              </Button>
            </td>
            <td className="text-end">
              {typeof rinde === "number" ? `${rinde.toFixed(2)} %` : "-"}
            </td>
          </tr>

          <tr>
            <td>
              <Button onClick={handleObtenerEficiencia} disabled={loading} className="vt-btn">
                Obtener Eficiencia
              </Button>
            </td>
            <td className="text-end">{eficiencia !== null ? `${eficiencia}` : "-"}</td>
          </tr>
        </tbody>
      </Table>
    </div>

    {/* Guardar rinde */}
    <Button
      onClick={handleGuardarRinde}
      disabled={loading}
      variant="success"
      className="vt-btn mx-auto mt-3 d-block"
      style={{ width: "150px" }}
    >
      Guardar Rinde
    </Button>

    {/* Modal Inventarios */}
    <Modal show={showModal} onHide={handleCloseModal} className="vt-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          Inventarios Sucursal{" "}
          {
            context.sucursalesTabla.find(
              (sucursal) => parseInt(sucursal.id) === parseInt(searchSucursal)
            )?.nombre
          }
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ListGroup>
          {inventarios.map((inventario) => (
            <ListGroup.Item
              key={inventario.id}
              onClick={() => handleSelectInventario(inventario)}
              action
            >
              Mes: {inventario.mes}, Año: {inventario.anio}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>
    </Modal>

    {/* Modal Ingresos Esperados */}
    <Modal show={showIngresosModal} onHide={() => setShowIngresosModal(false)} className="vt-modal">
      <Modal.Header closeButton>
        <Modal.Title>Ingresos Esperados</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <label className="vt-label">Novillos:</label>
          <input
            type="number"
            value={novillosIngresos}
            onChange={(e) => handleNovillosChange(e.target.value)}
            className="form-control vt-input"
          />
        </div>
        <div className="mb-3">
          <label className="vt-label">Exportación:</label>
          <input
            type="number"
            value={exportacionIngresos}
            onChange={(e) => handleExportacionChange(e.target.value)}
            className="form-control vt-input"
          />
        </div>
        <div className="mb-3">
          <label className="vt-label">Cerdos:</label>
          <input
            type="number"
            value={cerdosIngresos}
            onChange={(e) => handleCerdosChange(e.target.value)}
            className="form-control vt-input"
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowIngresosModal(false)} className="vt-btn-secondary">
          Cerrar
        </Button>
        <Button variant="primary" onClick={handleGuardarIngresos} className="vt-btn">
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>

    {/* Modal Ver Ingresos */}
    <Modal show={showVerModal} onHide={handleCloseVerModal} className="vt-modal">
      <Modal.Header closeButton>
        <Modal.Title>Ingresos Esperados</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>Novillos: {novillosIngresos}</div>
        <div>Exportación: {exportacionIngresos}</div>
        <div>Cerdos: {cerdosIngresos}</div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseVerModal} className="vt-btn-secondary">
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>

    {/* Modal Categorías (excluir) */}
    <Modal show={showModalCategories} onHide={() => setShowModalCategories(false)} className="vt-modal">
      <Modal.Header closeButton>
        <Modal.Title>Seleccionar Categorías a excluir</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="vt-muted">Presione Ctrl para una selección múltiple</p>
        <ListGroup>
          <FormControl
            as="select"
            multiple
            value={selectedCategorias}
            onChange={(e) =>
              setSelectedCategorias(Array.from(e.target.selectedOptions, (option) => option.value))
            }
            className="vt-input"
            style={{ minHeight: 220 }}
          >
            {context.subcategoriasTabla.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.descripcion}
              </option>
            ))}
          </FormControl>
        </ListGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModalCategories(false)} className="vt-btn-secondary">
          Cerrar
        </Button>
        <Button
          variant="primary"
          onClick={() =>
            handleObtenerDatos(
              `${apiUrl}/ventas/monto_con_articulo_filtradas`,
              "ventas",
              selectedCategorias
            )
          }
          className="vt-btn"
        >
          Continuar
        </Button>
      </Modal.Footer>
    </Modal>

    {/* Modal Ajustes */}
    <Modal show={showAjustesModal} onHide={() => setShowAjustesModal(false)} className="vt-modal">
      <Modal.Header closeButton>
        <Modal.Title>Ajustes de Rinde</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InputGroup>
          <FormControl
            placeholder="Descripción"
            value={nuevoAjuste.descripcion}
            onChange={(e) => setNuevoAjuste({ ...nuevoAjuste, descripcion: e.target.value })}
            className="vt-input"
          />
          <FormControl
            placeholder="Importe"
            value={nuevoAjuste.importe}
            onChange={(e) => setNuevoAjuste({ ...nuevoAjuste, importe: e.target.value })}
            className="vt-input"
          />
          <Button variant="primary" onClick={handleAddAjuste} className="vt-btn">
            Agregar
          </Button>
        </InputGroup>
        <ListGroup className="mt-3">
          {ajustes.map((ajuste, index) => (
            <ListGroup.Item
              key={index}
              className="d-flex justify-content-between align-items-center"
            >
              {`${ajuste.descripcion}: $${ajuste.importe}`}
              <Button variant="danger" onClick={() => handleEliminarAjuste(index)} className="vt-btn-danger">
                Eliminar
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancelarAjustes} className="vt-btn-secondary">
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleGuardarAjustes} className="vt-btn">
          Guardar Ajustes
        </Button>
      </Modal.Footer>
    </Modal>
  </Container>
);

}
