// RioCapitalBlog-frontend/src/hooks/useAuth.jsx

import { useState, useEffect, useContext, createContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/apiauth/me', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Errore nel controllo dello stato di autenticazione:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await fetch('/apiauth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      return { success: false, error: 'Errore di connessione' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('/apiauth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      return { success: false, error: 'Errore di connessione' };
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/apiauth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setUser(null);
        return { success: true };
      }
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
    return { success: false };
  };

  const updateProfile = async (profileData) => {
    // --- MODIFICA CHIAVE QUI ---
    // Prima di tutto, controlliamo se l'utente è loggato e abbiamo il suo ID
    if (!user || !user.id) {
      return { success: false, error: 'Utente non autenticato.' };
    }

    try {
      // Costruiamo l'URL corretto usando l'ID dell'utente
      // Nota: Ho usato /api/users/ che corrisponde alla struttura standard.
      // Se il tuo prefisso è diverso (es. /api/user/), adattalo.
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        // Aggiorniamo lo stato locale dell'utente con i nuovi dati dal server
        setUser(data); // Assumendo che l'API restituisca l'oggetto utente aggiornato
        return { success: true, user: data };
      } else {
        const error = await response.json();
        return { success: false, error: error.error || 'Errore sconosciuto' };
      }
    } catch (error) {
      return { success: false, error: 'Errore di connessione' };
    }
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const canWriteArticles = () => {
    return hasAnyRole(['collaborator', 'admin']);
  };

  const isAdmin = () => {
    return hasRole('admin');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    hasAnyRole,
    canWriteArticles,
    isAdmin,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
