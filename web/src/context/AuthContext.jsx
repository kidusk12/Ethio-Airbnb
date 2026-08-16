import React, { createContext, useContext, useState } from "react";

/**
 * Minimal auth context — provides a mock guest user so the dashboard
 * renders without a real backend. Replace `mockUser` and `logout` with
 * real API calls when authentication is implemented.
 */

const AuthContext = createContext(null);

const mockUser = {
  name: "Abebe",
  email: "abebe@example.com",
  avatar: null,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(mockUser);

  function login(userData) {
    setUser(userData);
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * @returns {{ user: typeof mockUser | null, login: (u: object) => void, logout: () => void }}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
