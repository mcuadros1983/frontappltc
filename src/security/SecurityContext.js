// src/security/SecurityContext.jsx
import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

const SecurityContext = createContext(null);

export function SecurityProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    (async ()=>{
      try {
        console.log("⚙️ Consultando /auth/me...");
        const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/me`, { credentials:"include" });
        console.log("⚙️ Respuesta status /auth/me:", res.status);
        if (!res.ok) throw new Error("No auth");
        const data = await res.json();
        console.log("⚙️ Data /auth/me:", data);
        setUser(data.user);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  },[]);

  const can = useMemo(()=> {
    const perms = user?.permissions || [];
    const isAdmin = perms.includes("admin.all") || user?.rol_id === 1; // ✅ fallback por rol

    return (...required) => {
      if (isAdmin) return true;
      return required.every(p => perms.includes(p));
    };
  }, [user]);

  return (
    <SecurityContext.Provider value={{ user, can, loading, setUser }}>
      {children}
    </SecurityContext.Provider>
  );
}

export const useSecurity = () => useContext(SecurityContext);
export const useCan = (...perms) => {
  const { can } = useSecurity();
  return can(...perms);
};
