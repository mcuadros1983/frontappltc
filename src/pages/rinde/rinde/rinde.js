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
import { useNavigate } from "react-router-dom";
import Contexts from "../../../context/Contexts";

export default function CalculoRinde() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchSucursal, setSearchSucursal] = useState("");
  const [montoVentas, setMontoVentas] = useState(0);
  const [montoMovimientos, setMontoMovimientos] = useState(0);
  const [montoInventarioInicial, setMontoInventarioInicial] = useState(0);
  const [montoInventarioFinal, setMontoInventarioFinal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [inventarios, setInventarios] = useState([]);
  const [selectedInventario, setSelectedInventario] = useState(null);
  const [isFinal, setIsFinal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [novillosIngresos, setNovillosIngresos] = useState(0);
  const [exportacionIngresos, setExportacionIngresos] = useState(0);
  const [cerdosIngresos, setCerdosIngresos] = useState(0);
  const [kgNovillo, setKgNovillo] = useState(0);
  const [kgVaca, setKgVaca] = useState(0);
  const [kgCerdo, setKgCerdo] = useState(0);
  const [montoVendidoParcial, setMontoVendidoParcial] = useState(0);
  const [montoEsperadoParcial, setMontoEsperadoParcial] = useState(0);
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

  const context = useContext(Contexts.dataContext);
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    setMontoVentas(0);
    setMontoMovimientos(0);
    setMontoInventarioInicial(0);
    setMontoInventarioFinal(0);
    setKgNovillo(0);
    setKgVaca(0);
    setKgCerdo(0);
    setRinde(0);
  }, [startDate, endDate, searchSucursal]);

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
          }),
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

  const handleSeleccionarCategoria = (categoriaId) => {
    const index = selectedCategorias.indexOf(categoriaId);
    if (index === -1) {
      setSelectedCategorias([...selectedCategorias, categoriaId]);
    } else {
      setSelectedCategorias(
        selectedCategorias.filter((id) => id !== categoriaId)
      );
    }
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

      // Si excludedCategoriesId está definido, agregamos el parámetro al cuerpo de la solicitud
      if (excludedCategoriesId !== undefined) {
        bodyData.excludedCategories = excludedCategoriesId;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        const data = await response.json();
        // console.log("data", data);

        if (operacion === "ventas" && data.montoTotalVenta === 0) {
          alert("No existen ventas para la fecha seleccionada.");
          return;
        } else if (
          operacion === "movimientos" &&
          data.montoTotalMovimientos === 0
        ) {
          alert("No existen movimientos para la fecha seleccionada.");
          return;
        }

        if (operacion === "ventas") {
          setMontoVentas(data.montoTotalVenta);
        } else if (operacion === "movimientos") {
          setMontoMovimientos(data.montoTotalMovimientos);
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
    setSelectedInventario(inventario);
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

  const handleCalculoRinde = () => {
    // console.log("calculando...");

    // Suma de importes de los ajustes si existen ajustes
    const montoAjuste = ajustes.reduce(
      (total, ajuste) => total + ajuste.importe,
      0
    );

    // Sumar montoVentas, montoMovimientos, montoInventarioFinal, y montoAjuste
    // Restar montoInventarioInicial
    const montoVendidoParcial =
      montoVentas +
      montoMovimientos +
      montoInventarioFinal -
      montoInventarioInicial +
      montoAjuste; // Incluir los ajustes en la suma

    // Multiplicar kgNovillo por novillosIngresos
    // Multiplicar kgVaca por exportacionIngresos
    // Multiplicar kgCerdo por cerdosIngresos
    const montoEsperadoParcial =
      kgNovillo * novillosIngresos +
      kgVaca * exportacionIngresos +
      kgCerdo * cerdosIngresos;

    // Calcular el rinde
    let rindeCalculado =
      ((montoEsperadoParcial - montoVendidoParcial) / montoEsperadoParcial) *
      100;

    // Verificar si el resultado es NaN y establecerlo en 0%
    if (isNaN(rindeCalculado)) {
      rindeCalculado = 0;
      setRinde(rindeCalculado);
      alert("Falta información para el cáculo del rinde");
    }

    // Actualizar el estado con el valor calculado de rinde
    setRinde(rindeCalculado);
  };

  // Función para mostrar el modal de ver ingresos esperados
  const handleVerAjustesRinde = () => {
    setShowAjustesModal(true);
  };

  const handleEliminarAjuste = (index) => {
    const nuevosAjustes = [...ajustes]; // Hacemos una copia de la lista actual de ajustes
    nuevosAjustes.splice(index, 1); // Eliminamos el elemento en el índice especificado
    setAjustes(nuevosAjustes); // Actualizamos el estado con la nueva lista de ajustes
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
          }),
        });

        if (response.ok) {
          alert("Rinde guardado correctamente.");
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

  return (
    <Container>
      <h1 className="my-list-title dark-text">Cálculo de Rendimiento</h1>

      <div className="mb-3">
        <div className="d-inline-block w-auto">
          <label className="mr-2">MES: </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="form-control rounded-0 border-transparent text-center"
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

        <div className="d-inline-block w-auto ml-2">
          <label className="ml-2 mr-2">AÑO:</label>
          <input
            type="number"
            placeholder="Año"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="form-control rounded-0 border-transparent text-center"
            min="2000"
            max="2050"
            maxLength="4"
            disabled={loading}
          />
        </div>
      </div>

      <div className="mb-3">
        <div className="d-inline-block w-auto">
          <label className="mr-2">DESDE: </label>
          <input
            type="date"
            placeholder="Seleccione fecha de inicio"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="form-control rounded-0 border-transparent text-center"
            disabled={loading}
          />
        </div>

        <div className="d-inline-block w-auto ml-2">
          <label className="ml-2 mr-2">HASTA:</label>
          <input
            type="date"
            placeholder="Seleccione fecha de fin"
            value={endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="form-control rounded-0 border-transparent text-center"
            disabled={loading}
          />
        </div>
      </div>
      <div className="mb-3">
        <FormControl
          as="select"
          placeholder="Seleccione una sucursal"
          value={searchSucursal}
          onChange={(e) => setSearchSucursal(e.target.value)}
          className="mr-2"
          style={{ width: "25%" }}
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

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Operaciones</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Button
                onClick={() =>
                  // handleObtenerDatos(
                  //   `${apiUrl}/ventas/monto_con_articulo_filtradas`,
                  //   "ventas"
                  // )
                  handleSelectCategories()
                }
                disabled={loading}
              >
                Obtener Ventas
              </Button>
            </td>
            <td>
              {montoVentas !== null
                ? `$${parseInt(montoVentas).toFixed(2)}`
                : "-"}
            </td>
          </tr>
          <tr>
            <td>
              <Button
                onClick={() =>
                  handleObtenerDatos(
                    `${apiUrl}/obtenermontomovimientosfiltrados`,
                    "movimientos"
                  )
                }
                disabled={loading}
              >
                Obtener Movimientos
              </Button>
            </td>
            <td>
              {montoMovimientos !== null
                ? `$${parseInt(montoMovimientos).toFixed(2)}`
                : "-"}
            </td>
          </tr>
          <tr>
            <td>
              <Button
                onClick={() => handleObtenerInventario(false)}
                disabled={loading}
              >
                Obtener Inventario Inicial
              </Button>
            </td>
            <td>
              {montoInventarioInicial !== null
                ? `$${parseInt(montoInventarioInicial).toFixed(2)}`
                : "-"}
            </td>
          </tr>
          <tr>
            <td>
              <Button
                onClick={() => handleObtenerInventario(true)}
                disabled={loading}
              >
                Obtener Inventario Final
              </Button>
            </td>
            <td>
              {montoInventarioFinal !== null
                ? `$${parseInt(montoInventarioFinal).toFixed(2)}`
                : "-"}
            </td>
          </tr>

          <tr>
            <td>
              <Button
                onClick={() => setShowIngresosModal(true)}
                disabled={loading}
              >
                Ingresos Esperados
              </Button>
            </td>
            <td>
              <Button
                onClick={handleVerIngresos}
                disabled={
                  loading ||
                  (novillosIngresos === 0 &&
                    exportacionIngresos === 0 &&
                    cerdosIngresos === 0)
                }
              >
                Ver
              </Button>
            </td>
          </tr>

          <tr>
            <td>
              <Button
                onClick={() =>
                  handleObtenerKg(`${apiUrl}/ordenesfiltradas`, "nt")
                }
                disabled={loading}
              >
                Kgs Novillo
              </Button>
            </td>
            <td>{kgNovillo !== null ? `${kgNovillo} Kg` : "-"}</td>
          </tr>

          <tr>
            <td>
              <Button
                onClick={() =>
                  handleObtenerKg(`${apiUrl}/ordenesfiltradas`, "va")
                }
                disabled={loading}
              >
                Kgs Exportacion
              </Button>
            </td>
            <td>{kgVaca !== null ? `${kgVaca} Kg` : "-"}</td>
          </tr>

          <tr>
            <td>
              <Button
                onClick={() =>
                  handleObtenerKg(`${apiUrl}/ordenesfiltradas`, "cerdo")
                }
                disabled={loading}
              >
                Kgs Cerdo
              </Button>
            </td>
            <td>{kgCerdo !== null ? `${kgCerdo} Kg` : "-"}</td>
          </tr>

          <tr>
            <td>
              <Button
                onClick={() => setShowAjustesModal(true)}
                disabled={loading}
                // variant="success"
              >
                Agregar Ajuste
              </Button>
            </td>
            <td>
              <Button
                onClick={() => setShowAjustesModal(true)}
                disabled={loading || ajustes.length === 0}
              >
                Ver
              </Button>
            </td>
          </tr>

          {/* Botón para calcular el rinde */}
          <tr>
            <td>
              <Button onClick={handleCalculoRinde} disabled={loading}>
                Calcular Rinde
              </Button>
            </td>
            <td>
              {rinde !== null ? `${parseFloat(rinde).toFixed(2)} %` : "-"}
            </td>
          </tr>
        </tbody>
      </Table>

      <Button
        onClick={handleGuardarRinde}
        disabled={loading}
        variant="success"
        className="rounded-0 mx-auto mt-3 d-block"
        style={{ width: "150px" }}
      >
        Guardar Rinde
      </Button>

      <Modal show={showModal} onHide={handleCloseModal}>
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

      {/* Modal para ingresar los valores de ingresos esperados */}
      <Modal
        show={showIngresosModal}
        onHide={() => setShowIngresosModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Ingresos Esperados</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label>Novillos:</label>
            <input
              type="number"
              value={novillosIngresos}
              onChange={(e) => handleNovillosChange(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label>Exportación:</label>
            <input
              type="number"
              value={exportacionIngresos}
              onChange={(e) => handleExportacionChange(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label>Cerdos:</label>
            <input
              type="number"
              value={cerdosIngresos}
              onChange={(e) => handleCerdosChange(e.target.value)}
              className="form-control"
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowIngresosModal(false)}
          >
            Cerrar
          </Button>
          <Button variant="primary" onClick={handleGuardarIngresos}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para ver los valores de ingresos esperados */}
      <Modal show={showVerModal} onHide={handleCloseVerModal}>
        <Modal.Header closeButton>
          <Modal.Title>Ingresos Esperados</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>Novillos: {novillosIngresos}</div>
          <div>Exportación: {exportacionIngresos}</div>
          <div>Cerdos: {cerdosIngresos}</div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseVerModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showModalCategories}
        onHide={() => setShowModalCategories(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Seleccionar Categorías a excluir</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Presione Ctrl para una selección múltiple</p>
          <ListGroup>
            <FormControl
              as="select"
              multiple // Permitir selección múltiple
              value={selectedCategorias}
              onChange={(e) =>
                setSelectedCategorias(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
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
          <Button
            variant="secondary"
            onClick={() => setShowModalCategories(false)}
          >
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
          >
            Continuar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAjustesModal} onHide={() => setShowAjustesModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ajustes de Rinde</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup>
            <FormControl
              placeholder="Descripción"
              value={nuevoAjuste.descripcion}
              onChange={(e) =>
                setNuevoAjuste({ ...nuevoAjuste, descripcion: e.target.value })
              }
            />
            <FormControl
              placeholder="Importe"
              value={nuevoAjuste.importe}
              onChange={(e) =>
                setNuevoAjuste({ ...nuevoAjuste, importe: e.target.value })
              }
            />
            <Button variant="primary" onClick={handleAddAjuste}>
              Agregar
            </Button>
          </InputGroup>
          <ListGroup>
            {ajustes.map((ajuste, index) => (
              <ListGroup.Item
                key={index}
                className="d-flex justify-content-between align-items-center"
              >
                {`${ajuste.descripcion}: $${ajuste.importe}`}
                <Button
                  variant="danger"
                  onClick={() => handleEliminarAjuste(index)}
                >
                  Eliminar
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelarAjustes}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleGuardarAjustes}>
            Guardar Ajustes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
