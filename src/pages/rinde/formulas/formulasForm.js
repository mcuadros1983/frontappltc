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
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">Agregar Fórmula</h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Código de la Fórmula</Form.Label>
          <div className="d-flex align-items-center">
            <Form.Control
              type="text"
              name="codigoFormula"
              value={formula.codigoFormula}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Ingrese el código del artículo"
              className="my-input"
            />
            <Button
              variant="primary"
              onClick={handleSearchArticulo}
              disabled={searching}
            >
              {searching ? (
                <Spinner
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                "Buscar"
              )}
            </Button>
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            type="text"
            name="descripcion"
            value={formula.descripcion}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ingrese la descripción de la fórmula"
            className="my-input"
            disabled
          />
        </Form.Group>

        <hr />

        <h2>Artículos</h2>
        <Form.Group className="mb-3">
          <Form.Label>Código Artículo</Form.Label>
          <div className="d-flex align-items-center">
            <Form.Control
              type="text"
              name="codigo"
              value={articuloInput.codigo}
              onChange={handleArticuloChange}
              onKeyDown={handleKeyDown}
              placeholder="Ingrese el código del artículo"
              className="my-input"
            />
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Porcentaje</Form.Label>
          <div className="d-flex align-items-center">
            <Form.Control
              type="number"
              name="cantidad"
              value={articuloInput.cantidad}
              onChange={handleArticuloChange}
              onKeyDown={handleKeyDown}
              placeholder="Ingrese la cantidad"
              className="my-input"
            />
            <Button
              variant="primary"
              onClick={handleAddArticulo}
              disabled={searching}
            >
              Agregar
            </Button>
          </div>
        </Form.Group>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Código</th>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {formula.articulos.map((articulo, index) => (
              <tr key={index}>
                <td>{articulo.codigo}</td>
                <td>{articulo.descripcion}</td>
                <td>{articulo.cantidad}</td>
                <td>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteArticulo(index)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Button
          variant="primary"
          type="submit"
          disabled={loading}
          style={{ position: "relative" }}
        >
          {loading ? (
            <Spinner
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
          ) : (
            "Guardar"
          )}
        </Button>
      </Form>
    </Container>
  );
}
