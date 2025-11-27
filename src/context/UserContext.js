// src/context/UserContextProvider.jsx
import React from "react";
import Contexts from "./Contexts";
import { useSecurity } from "../security/SecurityContext";

export default function UserContextProvider({ children }) {
  const { user, setUser } = useSecurity();

  const apiUrl = process.env.REACT_APP_API_URL;

  const login = async (credentials) => {
    try {
      const response = await fetch(`${apiUrl}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });
      console.log("🔹 Resultado del fetch login:", response);

      const data = await response.json();

      if (response.ok) {
        console.log("🔹 Data recibida:", data);
        const loggedUser = data.user;

        // 🟢 Guardar user en contexto
        setUser(loggedUser);

        // 🟢 Guardar token en sessionStorage (si viene)
        if (loggedUser && loggedUser.token) {
          try {
            sessionStorage.setItem("jwtToken", loggedUser.token);
            console.log("🔹 jwtToken guardado en sessionStorage");
          } catch (e) {
            console.warn("No se pudo guardar jwtToken en sessionStorage:", e);
          }
        }

        return loggedUser;
      } else {
        throw new Error(data.error || "Credenciales inválidas");
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${apiUrl}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.warn("Error en logout backend (se ignora):", e);
    }

    // 🧹 Limpiar contexto y token local
    setUser(null);
    try {
      sessionStorage.removeItem("jwtToken");
      console.log("🔹 jwtToken eliminado de sessionStorage en logout");
    } catch (e) {
      console.warn("No se pudo borrar jwtToken de sessionStorage:", e);
    }
  };

  return (
    <Contexts.UserContext.Provider value={{ user, login, logout }}>
      {children}
    </Contexts.UserContext.Provider>
  );
}
