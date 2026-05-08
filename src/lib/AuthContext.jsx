import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '@/api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setAuthError(null);
      setIsLoadingPublicSettings(false);

      setAppPublicSettings({
        auth_required: false,
        app_name: 'Small Caps Alpha'
      });

      await checkUserAuth();
    } catch (error) {
      console.error('Error comprobando estado de la app:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'Error al comprobar el estado de la aplicación'
      });
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      const response = await api.get('auth/me.php');
      const currentUser = response?.user || response;

      if (currentUser && currentUser.id) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);

      if (error.message) {
        setAuthError({
          type: 'auth_required',
          message: error.message
        });
      }
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const login = async (credentials) => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      const response = await api.post('auth/login.php', credentials);
      const loggedUser = response?.user || response;

      setUser(loggedUser);
      setIsAuthenticated(true);
      setAuthChecked(true);

      return response;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError({
        type: 'login_failed',
        message: error.message || 'Credenciales incorrectas'
      });
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('auth/logout.php', {});
    } catch (error) {
      console.warn('Error al cerrar sesión en servidor:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setAuthChecked(true);
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        authChecked,
        login,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};