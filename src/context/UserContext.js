import React, { useState } from "react";
import Contexts from "./Contexts";


export default function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  // `${apiUrl}/formas-pago/`
  

  const login = async (credentials) => {
    try {
      const response = await fetch(`${apiUrl}/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("user", data)
        setUser(data.user);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Credenciales inválidas");
      }
    } catch (error) {
      throw error; // Lanza el error para que sea capturado por el código que llama a login
    }
  };


  const logout = async () => {
    try {
      const response = await fetch(`${apiUrl}/logout`, {
        method: "POST",
        credentials: "include", // Incluye las cookies en la solicitud
      });

      if (response.ok) {
        // Limpiar el estado del usuario en el frontend
        setUser(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cerrar sesión");
      }
    } catch (error) {
      throw error; // Lanza el error para que sea capturado por el código que llama a logout
    }
  };

  return (
    <Contexts.UserContext.Provider value={{ user, login, logout }}>
      {children}
    </Contexts.UserContext.Provider>
  );
}
