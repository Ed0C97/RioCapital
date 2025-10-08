// NUOVO FILE: src/hooks/AuthContext.js
import { useContext, createContext } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('authProvider must be used within an AuthProvider');
  }
  return context;
};