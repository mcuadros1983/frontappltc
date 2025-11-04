// src/security/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSecurity } from "./SecurityContext";

export default function ProtectedRoute({ children, required = [] }) {
  const { user, loading, can } = useSecurity();
  if (loading) return null; // o spinner
  if (!user) return <Navigate to="/login" replace />;
  if (required.length && !can(...required)) return <Navigate to="/403" replace />;
  return children;
}
