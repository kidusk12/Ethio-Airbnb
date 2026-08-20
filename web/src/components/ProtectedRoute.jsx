import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Protects a route by authentication and optionally by role.
 *
 * Props:
 *  - allowedRoles?: string[]  e.g. ['host'] or ['admin']
 *                             If omitted, any authenticated user is allowed.
 *  - children: the route element to render when access is granted.
 *
 * Redirect behaviour:
 *  - Not logged in → /login (with `from` state so Login can redirect back)
 *  - Wrong role    → / (home page with a generic 403-style redirect)
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to role-appropriate dashboard instead of a blank 403
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "guest") return <Navigate to="/guest_dashboard" replace />;
    return <Navigate to="/host/Host_dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
