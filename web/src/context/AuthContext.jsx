import React, { createContext, useContext, useState } from "react";
import { logoutUser } from "../lib/api";

const AuthContext = createContext(null);

const STORAGE_KEY_TOKEN = "ethio_token";
const STORAGE_KEY_USER = "ethio_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY_TOKEN));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY_USER);
    return stored ? JSON.parse(stored) : null;
  });

  /** Persist auth state after a successful login or registration. */
  function login(userData, authToken) {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem(STORAGE_KEY_TOKEN, authToken);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
  }

  /**
   * Clear auth state (logout). Notifies the backend first (best-effort —
   * JWTs are stateless, so a failed network call must not block local
   * cleanup), then always clears local state regardless of the outcome.
   */
  async function logout() {
    if (token) {
      try {
        await logoutUser(token);
      } catch {
        // Ignore network failures — local cleanup below is what actually
        // secures the client; the server call is just a courtesy/audit hook.
      }
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
  }

  const value = { user, token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}