// finblog-frontend/src/components/RoleGuard.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleGuard = ({
  children,
  user,
  requiredRole = null,
  requiredRoles = [],
  redirectTo = '/login',
  fallback = null
}) => {

  if (!user && (requiredRole || requiredRoles.length > 0)) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return fallback || <Navigate to="/" replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
    return fallback || <Navigate to="/" replace />;
  }

  return children;
};

export default RoleGuard;
