"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { authAPI } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getTokens = () => {
    if (typeof window === "undefined") return {};
    return {
      accessToken: localStorage.getItem("accessToken"),
      refreshToken: localStorage.getItem("refreshToken"),
    };
  };

  const setTokens = (accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  };

  const clearTokens = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const loadUser = useCallback(async () => {
    const { accessToken, refreshToken } = getTokens();
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const result = await authAPI.me(accessToken);
      if (result.success) {
        setUser(result.data.user);
      } else if (refreshToken) {
        // Try to refresh
        const refreshResult = await authAPI.refresh(refreshToken);
        if (refreshResult.success) {
          setTokens(
            refreshResult.data.accessToken,
            refreshResult.data.refreshToken || refreshToken,
          );
          const retryResult = await authAPI.me(refreshResult.data.accessToken);
          if (retryResult.success) setUser(retryResult.data.user);
          else clearTokens();
        } else {
          clearTokens();
        }
      } else {
        clearTokens();
      }
    } catch {
      clearTokens();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (username, password) => {
    const result = await authAPI.login(username, password);
    if (result.success) {
      setTokens(result.data.accessToken, result.data.refreshToken);
      setUser(result.data.user);
    }
    return result;
  };

  const register = async (username, password) => {
    const result = await authAPI.register(username, password);
    if (result.success) {
      setTokens(result.data.accessToken, result.data.refreshToken);
      setUser(result.data.user);
    }
    return result;
  };

  const logout = async () => {
    const { refreshToken } = getTokens();
    try {
      await authAPI.logout(refreshToken);
    } catch {
      // Ignore errors, clear locally anyway
    }
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
