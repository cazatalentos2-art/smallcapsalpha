import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSession, clearSession } from './authService';

const AppAuthContext = createContext();

export function AppAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    setSession(s);
    setLoading(false);
  }, []);

  const login = (newSession) => setSession(newSession);

  const logout = () => {
    clearSession();
    setSession(null);
  };

  return (
    <AppAuthContext.Provider value={{ session, loading, login, logout }}>
      {children}
    </AppAuthContext.Provider>
  );
}

export function useAppAuth() {
  return useContext(AppAuthContext);
}