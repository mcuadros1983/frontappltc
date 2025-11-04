import React from "react";
import { Navigate } from "react-router-dom";
import { useSecurity } from "./SecurityContext";

export default function PublicOnlyRoute({ children, redirectTo = "/dashboard" }) {
  const { user, loading } = useSecurity();
  if (loading) return null; // o spinner
  if (user) return <Navigate to={redirectTo} replace />;
  return children;
}
