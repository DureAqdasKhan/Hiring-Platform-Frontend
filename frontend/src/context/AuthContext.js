import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken, setToken, clearToken } from "../store/auth";
import { me as meApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);     // {id,email,role}
  const [loading, setLoading] = useState(true);

  async function bootstrap() {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await meApi();
      setUser(profile);
    } catch (e) {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    bootstrap();
  }, []);

async function onLogin(accessToken) {
  setLoading(true);
  setToken(accessToken);

  try {
    const profile = await meApi();
    setUser(profile);
    return profile;
  } finally {
    setLoading(false);
  }
}


  function onLogout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, onLogin, onLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
