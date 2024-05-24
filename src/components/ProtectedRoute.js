// import React from "react";
// import { Route, Navigate } from "react-router-dom";

// const ProtectedRoute = ({ element, isAuthenticated }) => {
//   return isAuthenticated ? (
//     <Route element={element} />
//   ) : (
//     <Route path="/*" element={<Navigate to="/login" />} />
//   );
// };

// export default ProtectedRoute;

import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = ({ 
  isAllowed,
  redirectTo = "/login",
  children,
}) => {
  if (!isAllowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? children : <Outlet />;
};