/* eslint-disable react/only-export-components -- hook lives next to the provider */
import { createContext, useContext, useEffect, useState } from "react";
import { getToken, login as apiLogin, logout as apiLogout, me, register as apiRegister, setToken } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(() => !getToken());

  useEffect(() => {
    let live = true;

    if (!getToken()) {
      return undefined;
    }

    me()
      .then((profile) => {
        if (live) setUser(profile);
      })
      .catch(() => {
        setToken(null);
        if (live) setUser(null);
      })
      .finally(() => {
        if (live) setReady(true);
      });

    return () => {
      live = false;
    };
  }, []);

  async function login(credentials) {
    const data = await apiLogin(credentials);
    setToken(data.token);
    const profile = await me();
    setUser(profile);
    return profile;
  }

  async function register(payload) {
    await apiRegister(payload);
    return login({ email: payload.email, password: payload.password });
  }

  async function logout() {
    try {
      await apiLogout();
    } catch {
      // Still clear the local session if the API is unreachable.
    }
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
