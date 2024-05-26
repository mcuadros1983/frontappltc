import React, { useState, useEffect,useCallback } from "react";
import { useParams } from "react-router-dom";
import { Container, Table } from "react-bootstrap";

export default function FormulasItems() {
  const { formulaId } = useParams();
  const [formula, setFormula] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL;

  const obtenerFormulaPorId = useCallback(async () => {
    try {
      const response = await fetch(
        `${apiUrl}/obtenerformulaporid/${formulaId}`
      );
      if (response.ok) {
        const data = await response.json();
        setFormula(data);
      } else {
        throw new Error("Error al obtener la fórmula");
      }
    } catch (error) {
      console.error(error);
    }
  }, [apiUrl, formulaId]); // Añadir apiUrl y formulaId como dependencias

  useEffect(() => {
    obtenerFormulaPorId();
  }, [obtenerFormulaPorId]); // Añadir obtenerFormulaPorId a las dependencias

  return (
    <Container>
      {/* <h1 className="my-list-title dark-text">Detalles de la Fórmula</h1> */}

      {formula && (
        <>
          <div
            style={{
              marginBottom: "20px",
              padding: "10px",
              backgroundColor: "#f7f7f7",
              borderRadius: "5px",
            }}
          >
            <h2 style={{ marginBottom: "10px", color: "#333" }}>
              Información de la Fórmula
            </h2>
            {/* <p>ID: {formula.id}</p> */}
            <p>Código de la Fórmula: {formula.codigobarraformula}</p>
            <p>Descripción: {formula.descripcionformula}</p>
          </div>

          <h3>Artículos de la Fórmula</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                {/* <th>ID</th> */}
                <th>Código de Barras</th>
                <th>Descripción</th>
                <th>Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              {formula.formulaarticulos.map((articulo) => (
                <tr key={articulo.id}>
                  {/*<td>{articulo.id}</td> */}
                  <td>{articulo.codigobarra}</td>
                  <td>{articulo.descripcion}</td>
                  <td>{articulo.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  );
}
