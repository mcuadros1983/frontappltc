import React, { useState, useEffect } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";

const ActualizarPorTropa = () => {
  const [tropas, setTropas] = useState([]); // tropa options según categoría elegida
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(""); // nueva: categoría global (bovino / porcino)
  const [tropaSeleccionada, setTropaSeleccionada] = useState("");

  const [categoria, setCategoria] = useState("");        // esta era tu categoría interna que mandabas al backend
  const [subcategoria, setSubcategoria] = useState("");
  const [costo, setCosto] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  // Cada vez que se elige una categoría principal (bovino/porcino),
  // pedimos las tropas disponibles SOLO de esa categoría
  useEffect(() => {
    const fetchTropasPorCategoria = async () => {
      if (!categoriaSeleccionada) {
        // si no hay categoría todavía, vaciamos tropas
        setTropas([]);
        return;
      }

      try {
        const res = await fetch(
          `${apiUrl}/productos/tropas?categoria=${encodeURIComponent(
            categoriaSeleccionada
          )}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();

        if (Array.isArray(data.tropas)) {
          // data.tropas ya debería venir ordenada desde backend, pero
          // igual limpiamos duplicados y aseguramos tipo string
          const únicas = Array.from(new Set(data.tropas.map(String)));
          setTropas(únicas);
        } else {
          setTropas([]);
        }
      } catch (err) {
        console.error("Error al obtener tropas:", err);
        setTropas([]);
      }
    };

    // Al cambiar la categoría:
    // - limpiamos tropa seleccionada
    // - limpiamos subcategoria, costo, mensajes
    setTropaSeleccionada("");
    setSubcategoria("");
    setCosto("");
    setMensaje("");
    setExito(false);

    // También sincronizamos `categoria` (la que mandás al backend) con la elegida
    setCategoria(categoriaSeleccionada);

    fetchTropasPorCategoria();
  }, [categoriaSeleccionada, apiUrl]);

  // Limpia el form después de actualización exitosa
  const limpiarFormulario = () => {
    setCategoriaSeleccionada("");
    setTropaSeleccionada("");
    setCategoria("");
    setSubcategoria("");
    setCosto("");
  };

  // Actualizar masivamente
  const handleActualizar = async () => {
    if (!categoriaSeleccionada) {
      setExito(false);
      setMensaje("Debe seleccionar una categoría.");
      return;
    }

    if (!tropaSeleccionada) {
      setExito(false);
      setMensaje("Debe seleccionar una tropa.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/productos/actualizar-por-tropa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tropa: tropaSeleccionada,
          categoria_producto: categoria, // ya sincronizado con categoriaSeleccionada
          subcategoria: subcategoria,
          costo: costo,
        }),
      });

      const data = await response.json();
      setExito(response.ok);
      setMensaje(data.mensaje || "Actualización completada.");
      if (response.ok) limpiarFormulario();
    } catch (error) {
      console.error(error);
      setExito(false);
      setMensaje("Error al actualizar productos.");
    }
  };

  // helper genérico para limpiar mensajes al editar
  const handleFieldChange = (setter) => (e) => {
    setter(e.target.value);
    setMensaje("");
    setExito(false);
  };

  // Campos que deben quedar deshabilitados hasta que haya categoría elegida
  const tropaDisabled = !categoriaSeleccionada;

  // Campos que deben quedar deshabilitados hasta que haya tropa elegida
  const subcategoriaYCostoDisabled = !tropaSeleccionada || !categoriaSeleccionada;

  return (
    <Container className="mt-4">
      <h4 className="my-list-title dark-text mb-4 text-center">
        Actualizar productos por Tropa
      </h4>

      {mensaje && (
        <Alert
          variant={exito ? "success" : "danger"}
          className="text-center"
        >
          {mensaje}
        </Alert>
      )}

      <div style={{ maxWidth: "400px", margin: "auto" }}>
        <Form>
          {/* 1. Seleccionar CATEGORÍA primero */}
          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              value={categoriaSeleccionada}
              onChange={(e) => {
                // usamos este handler custom porque al cambiar categoría
                // ya hacemos lógica extra en el useEffect
                setCategoriaSeleccionada(e.target.value);
              }}
              className="my-input custom-style-select"
              size="lg"
            >
              <option value="">Seleccione una categoría</option>
              <option value="bovino">bovino</option>
              <option value="porcino">porcino</option>
            </Form.Select>
          </Form.Group>

          {/* 2. Seleccionar TROPA filtrada por la categoría */}
          <Form.Group className="mb-3">
            <Form.Label>Tropa</Form.Label>
            <Form.Select
              value={tropaSeleccionada}
              onChange={(e) => {
                setTropaSeleccionada(e.target.value);
                setMensaje("");
                setExito(false);
              }}
              className="my-input custom-style-select"
              size="lg"
              disabled={tropaDisabled}
            >
              <option value="">
                {tropaDisabled
                  ? "Seleccione primero una categoría"
                  : "Seleccione una tropa"}
              </option>
              {tropas.map((tropa, i) => (
                <option key={i} value={tropa}>
                  {tropa}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* 3. Subcategoría (habilitado solo si ya tengo categoría y tropa) */}
          <Form.Group className="mb-3">
            <Form.Label>Subcategoría</Form.Label>
            <Form.Select
              value={subcategoria}
              onChange={handleFieldChange(setSubcategoria)}
              className="my-input custom-style-select"
              size="lg"
              disabled={subcategoriaYCostoDisabled}
            >
              <option value="">Seleccione una subcategoría</option>
              <option value="nt">nt</option>
              <option value="va">va</option>
              <option value="cerdo">cerdo</option>
            </Form.Select>
          </Form.Group>

          {/* 4. Costo (habilitado solo si ya tengo categoría y tropa) */}
          <Form.Group className="mb-3">
            <Form.Label>Costo</Form.Label>
            <Form.Control
              type="text"
              inputMode="decimal"
              pattern="^\\d*(\\.\\d{0,2})?$"
              value={costo}
              onChange={(e) => {
                const input = e.target.value.replace(",", ".");
                if (/^\d*(\.\d{0,2})?$/.test(input) || input === "") {
                  setCosto(input);
                  setMensaje("");
                  setExito(false);
                }
              }}
              className="my-input custom-style-select"
              size="lg"
              placeholder="Ej: 123.45"
              disabled={subcategoriaYCostoDisabled}
            />
          </Form.Group>

          {/* 5. Botón de actualizar */}
          <div className="text-center">
            <Button
              variant="primary"
              onClick={handleActualizar}
              disabled={!categoriaSeleccionada || !tropaSeleccionada}
            >
              Actualizar Productos
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default ActualizarPorTropa;
