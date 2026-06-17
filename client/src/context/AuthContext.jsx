import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("devdesk_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (formData) => {
    const { data } = await api.post("/auth/login", formData);

    localStorage.setItem("devdesk_token", data.token);
    localStorage.setItem("devdesk_user", JSON.stringify(data.user));
    setUser(data.user);

    return data.user;
  };

  const register = async (formData) => {
    const { data } = await api.post("/auth/register", formData);

    localStorage.setItem("devdesk_token", data.token);
    localStorage.setItem("devdesk_user", JSON.stringify(data.user));
    setUser(data.user);

    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("devdesk_token");
    localStorage.removeItem("devdesk_user");
    setUser(null);
  };

  const refreshMe = async () => {
    const token = localStorage.getItem("devdesk_token");

    if (!token) return;

    try {
      setLoading(true);
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      localStorage.setItem("devdesk_user", JSON.stringify(data.user));
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);