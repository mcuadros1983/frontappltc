import React, { useEffect, useState } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
// import { createAuthenticatedRequest } from "../../utils/createAuthenticatedRequest";

export default function ProductForm() {
  const location = useLocation();

  const [product, setProduct] = useState({
    codigo_de_barra: "",
    num_media: "",
    precio: "",
    kg: "",
    tropa: "",
    sucursal_id: "",
    categoria_producto: "", // Asegúrate de incluir todos los campos aquí
    subcategoria:""
  });

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false); //estado para saber si se esta editando o no

  const apiUrl = process.env.REACT_APP_API_URL;
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({
      ...product,
      [name]: value,
    });
  };

  const navigate = useNavigate();
  const params = useParams();

  const loadProduct = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/productos/${id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Error al cargar el producto");
      }
      const data = await res.json();
      // Verificar si los datos recuperados del servidor son completos
      if (data && Object.keys(data).length > 0) {
        setProduct(data);
        setEditing(true);
      } else {
        throw new Error("Los datos del producto están incompletos");
      }
    } catch (error) {
      console.error("Error al cargar el producto:", error);
      // Manejar el error según sea necesario
    }
  };

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id);
    } else {
      setEditing(false);
      setProduct({
        codigo_de_barra: "",
        num_media: "",
        precio: "",
        kg: "",
        tropa: "",
        sucursal_id: "",
        categoria_producto: "", // Asegúrate de incluir todos los campos aquí
        subcategoria:""
      });
    }
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault(); //cancela el comportamiento por defecto
    // Aquí puedes manejar la lógica de envío del formulario
    setLoading(true);

    if (editing) {
      //si esta editando
      await fetch(`${apiUrl}/productos/${params.id}`, {
        credentials: "include",
        method: "PUT",
        body: JSON.stringify(product),
        headers: {
          "Content-Type": "application/json",
        },
      });
      setEditing(false);

      if (
        location.state &&
        location.state.product &&
        location.state.product.orden_id !== undefined
      ) {
        const order_id = location.state.product.orden_id;
        navigate(`/orders/${order_id}/products`);
      } else {
        navigate("/products");
      }
    } else {
      //si no esta editando
      await fetch(`${apiUrl}/productos/`, {
        credentials: "include",
        method: "POST",
        body: JSON.stringify(product),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    setLoading(false);
    if (
      location.state &&
      location.state.product &&
      location.state.product.orden_id !== undefined
    ) {
      const order_id = location.state.product.orden_id;
      navigate(`/orders/${order_id}/products`);
    } else {
      navigate("/products");
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Producto" : "Agregar Producto"}
      </h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Categoria</Form.Label>
          <Form.Control
            type="text"
            name="categoria_producto"
            value={product.categoria_producto}
            onChange={handleChange}
            placeholder="Categoria del producto"
            className="my-input"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Subcategoria</Form.Label>
          <Form.Control
            type="text"
            name="subcategoria"
            value={product.subcategoria}
            onChange={handleChange}
            placeholder="Subcategoria del producto"
            className="my-input"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Codigo de barra</Form.Label>
          <Form.Control
            type="text"
            name="codigo_de_barra"
            value={product.codigo_de_barra}
            onChange={handleChange}
            placeholder="Ingresa el codigo de barra"
            className="my-input"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Numero de media</Form.Label>
          <Form.Control
            type="number"
            name="num_media"
            value={product.num_media}
            onChange={handleChange}
            placeholder="Ingresa el numero de la media"
            className="my-input"
            min="0" // Establecer el valor mínimo como 0
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Garron de la media</Form.Label>
          <Form.Control
            type="number"
            name="garron"
            value={product.garron}
            onChange={handleChange}
            placeholder="Ingresa el garron de la media"
            className="my-input"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Precio</Form.Label>
          <Form.Control
            type="float"
            name="precio"
            value={product.precio}
            onChange={handleChange}
            placeholder="Ingresa el precio de la media"
            className="my-input"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Costo</Form.Label>
          <Form.Control
            type="float"
            name="costo"
            value={product.costo}
            onChange={handleChange}
            placeholder="Ingresa el costo de la media"
            className="my-input"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Peso media</Form.Label>
          <Form.Control
            type="number"
            name="kg"
            value={product.kg}
            onChange={handleChange}
            placeholder="Ingresa el peso de la media"
            className="my-input"
            min="0" // Establecer el valor mínimo como 0
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Numero de tropa</Form.Label>
          <Form.Control
            type="number"
            name="tropa"
            value={product.tropa}
            onChange={handleChange}
            placeholder="Ingresa la tropa de la media"
            className="my-input"
            min="0" // Establecer el valor mínimo como 0
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Sucursal</Form.Label>
          <Form.Control
            type="number"
            name="sucursal_id"
            value={product.sucursal_id}
            onChange={handleChange}
            placeholder="Ingrese la Sucursal"
            className="my-input"
            min="0" // Establecer el valor mínimo como 0
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Cliente</Form.Label>
          <Form.Control
            type="text"
            name="cliente_id"
            value={product.cliente_id}
            onChange={handleChange}
            placeholder="Ingrese al cliente"
            className="my-input"
            min="0" // Establecer el valor mínimo como 0
          />
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          disabled={loading} // Desactiva el botón mientras se carga
          style={{ position: "relative" }} // Añade una posición relativa al botón
        >
          {
            editing ? (
              "Editar"
            ) : loading ? (
              <Spinner
                animation="border"
                size="sm" // Ajusta el tamaño del Spinner a "sm" (pequeño)
                role="status"
                aria-hidden="true"
              />
            ) : (
              "Guardar"
            )
            //"Enviar" // Si está editando muestra "Editar", si no "Enviar"
          }
        </Button>
      </Form>
    </Container>
  );
}
