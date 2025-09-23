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
  // Se non c'è utente e serve autenticazione
  if (!user && (requiredRole || requiredRoles.length > 0)) {
    return <Navigate to={redirectTo} replace />;
  }

  // Se c'è un ruolo specifico richiesto
  if (requiredRole && user?.role !== requiredRole) {
    return fallback || <Navigate to="/" replace />;
  }

  // Se ci sono più ruoli possibili
  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
    return fallback || <Navigate to="/" replace />;
  }

  return children;
};

export default RoleGuard;
