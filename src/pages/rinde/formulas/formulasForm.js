import React, { useState} from "react";
import { Container, Form, Button, Spinner, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
// import Contexts from "../../../context/Contexts";

export default function FormulasForm() {
  // const context = useContext(Contexts.userContext);
  const navigate = useNavigate();

  const [formula, setFormula] = useState({
    codigoFormula: "",
    articulo_id: "",
    descripcion: "",
    articulos: [],
  });

  const [articuloInput, setArticuloInput] = useState({
    codigo: "",
    cantidad: "",
  });

  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormula({
      ...formula,
      [name]: value,
    });
  };

  const handleArticuloChange = (e) => {
    const { name, value } = e.target;
    setArticuloInput({
      ...articuloInput,
      [name]: value,
    });
  };

  const handleSearchArticulo = async () => {
    try {
      setSearching(true);
      const response = await fetch(
        `${apiUrl}/obtenerarticulos/${formula.codigoFormula}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Error al buscar el artículo");
      }
      const data = await response.json();
      // console.log("data", data);
      setFormula({
        ...formula,
        codigoFormula: data.codigobarra,
        articulo_id: data.id,
        descripcion: data.descripcion,
      });
    } catch (error) {
      console.error("Error al buscar el artículo:", error);
      alert("No se encontró ningún artículo con este código");
    } finally {
      setSearching(false);
    }
  };

  const handleAddArticulo = async () => {
    try {
      setSearching(true);
      if (!articuloInput.cantidad) {
        alert("Debe ingresar una cantidad para este producto.");
        return;
      }

      const response = await fetch(
        `${apiUrl}/obtenerarticulos/${articuloInput.codigo}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include"
        }
      );
      if (!response.ok) {
        throw new Error("Error al buscar el artículo");
      }
      const data = await response.json();
      // console.log("dataarticulo", data);
      const nuevoArticulo = {
        articulo_id: data.id,
        codigo: data.codigobarra,
        descripcion: data.descripcion,
        cantidad: parseFloat(articuloInput.cantidad),
      };
      setFormula({
        ...formula,
        articulos: [...formula.articulos, nuevoArticulo],
      });
      setArticuloInput({
        codigo: "",
        cantidad: "",
      });
    } catch (error) {
      //console.error("Error al buscar el artículo:", error);
      alert("No se encontró ningún artículo con este código");
    } finally {
      setSearching(false);
    }
  };

  const handleDeleteArticulo = (index) => {
    const updatedArticulos = [...formula.articulos];
    updatedArticulos.splice(index, 1);
    setFormula({
      ...formula,
      articulos: updatedArticulos,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevenir la acción por defecto (enviar formulario)
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Verificar que ningún campo esté vacío
    if (
      !formula.codigoFormula ||
      !formula.descripcion ||
      formula.articulos.length === 0
    ) {
      alert(
        "Todos los campos son obligatorios. Por favor, complete todos los campos."
      );
      setLoading(false);
      return;
    }

    // Si todos los campos están completos, proceder con la operación
    // console.log("submit", formula);

    try {
      const confirmacion = window.confirm(
        "¿Estás seguro de que deseas grabar esta fórmula?"
      );
      if (!confirmacion) return; // Si el usuario cancela, no procedemos con la eliminación

      const response = await fetch(`${apiUrl}/crearformula`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo: formula.codigoFormula,
          articulo_id: formula.articulo_id,
          descripcion: formula.descripcion,
          articulos: formula.articulos,
        }),
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Error al guardar la fórmula");
      }
      await response.json();
      // console.log("Fórmula guardada:", data);
      // Si la fórmula se guarda correctamente, navegar a la página de fórmulas
      navigate("/formulas");
    } catch (error) {
      console.error("Error al guardar la fórmula:", error);
      // Manejar el error aquí
    } finally {
      setLoading(false);
    }
  };
 return (
  <Container className="vt-page">
    <h1 className="my-form-title text-center vt-title">Agregar Fórmula</h1>

    <Form onSubmit={handleSubmit} className="vt-form vt-form-narrow">
      {/* Código de la fórmula */}
      <Form.Group className="mb-3">
        <Form.Label className="vt-label">Código de la Fórmula</Form.Label>
        <div className="d-flex align-items-center gap-2">
          <Form.Control
            type="text"
            name="codigoFormula"
            value={formula.codigoFormula}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ingrese el código del artículo"
            className="vt-input"
          />
          <Button
            variant="primary"
            onClick={handleSearchArticulo}
            disabled={searching}
            className="vt-btn"
          >
            {searching ? (
              <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
            ) : (
              "Buscar"
            )}
          </Button>
        </div>
      </Form.Group>

      {/* Descripción */}
      <Form.Group className="mb-3">
        <Form.Label className="vt-label">Descripción</Form.Label>
        <Form.Control
          type="text"
          name="descripcion"
          value={formula.descripcion}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ingrese la descripción de la fórmula"
          className="vt-input"
          disabled
        />
      </Form.Group>

      <hr className="vt-sep" />

      <h2 className="vt-subtitle">Artículos</h2>

      {/* Código artículo */}
      <Form.Group className="mb-3">
        <Form.Label className="vt-label">Código Artículo</Form.Label>
        <div className="d-flex align-items-center">
          <Form.Control
            type="text"
            name="codigo"
            value={articuloInput.codigo}
            onChange={handleArticuloChange}
            onKeyDown={handleKeyDown}
            placeholder="Ingrese el código del artículo"
            className="vt-input"
          />
        </div>
      </Form.Group>

      {/* Porcentaje/Cantidad */}
      <Form.Group className="mb-4">
        <Form.Label className="vt-label">Porcentaje</Form.Label>
        <div className="d-flex align-items-center gap-2">
          <Form.Control
            type="number"
            name="cantidad"
            value={articuloInput.cantidad}
            onChange={handleArticuloChange}
            onKeyDown={handleKeyDown}
            placeholder="Ingrese la cantidad"
            className="vt-input"
          />
          <Button
            variant="primary"
            onClick={handleAddArticulo}
            disabled={searching}
            className="vt-btn"
          >
            Agregar
          </Button>
        </div>
      </Form.Group>

      {/* Tabla artículos */}
      <div className="vt-tablewrap table-responsive mb-3">
        <Table striped bordered hover className="mb-2">
          <thead>
            <tr>
              <th>Código</th>
              <th>Descripción</th>
              <th className="text-end">Cantidad</th>
              <th className="text-center">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {formula.articulos.map((articulo, index) => (
              <tr key={index}>
                <td>{articulo.codigo}</td>
                <td>{articulo.descripcion}</td>
                <td className="text-end">{articulo.cantidad}</td>
                <td className="text-center">
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteArticulo(index)}
                    size="sm"
                    className="vt-btn-danger"
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Guardar */}
      <div className="d-flex justify-content-end">
        <Button variant="primary" type="submit" disabled={loading} className="vt-btn">
          {loading ? (
            <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
          ) : (
            "Guardar"
          )}
        </Button>
      </div>
    </Form>
  </Container>
);
}
