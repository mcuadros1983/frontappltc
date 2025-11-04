import React, { useState } from "react";
import Contexts from "./Contexts";


export default function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  // `${apiUrl}/formas-pago/`


  // UserContextProvider.jsx (cambios mínimos)
  const login = async (credentials) => {
    try {
      const response = await fetch(`${apiUrl}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });
      console.log("🔹 Resultado del fetch login:", response);

      const data = await response.json();    // <= MOVER el json arriba para poder retornarlo siempre

      if (response.ok) {
        console.log("🔹 Data recibida:", data);
        setUser(data.user);                  // sigue seteando el viejo contexto por compatibilidad
        return data.user;                    // <= DEVOLVER EL USUARIO
      } else {
        throw new Error(data.error || "Credenciales inválidas");
      }
    } catch (error) {
      throw error;
    }
  };



  const logout = async () => {
    const res = await fetch(`${apiUrl}/logout`, {
      method: "POST",
      credentials: "include",
    });
    // No intentes clearCookie acá: eso es del backend
    setUser(null);
  };


  return (
    <Contexts.UserContext.Provider value={{ user, login, logout }}>
      {children}
    </Contexts.UserContext.Provider>
  );
}
