// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { loginAPI } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Gagal memuat userData:", error);
        localStorage.removeItem("userData");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error("Email dan password harus diisi");
    }

    try {
      const result = await loginAPI(email, password);

      const userData = {
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        token: result.token,
      };

      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("token", result.token);

      setUser(userData);

      return userData;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    setUser(null);
  };

  const isAuthenticated = () => !!user;
  const getUserRole = () => user?.role || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        getUserRole,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
};
