// src/context/AuthContext.jsx - Updated to store userRole separately
import React, { createContext, useContext, useState, useEffect } from "react";
import { loginAPI, logoutAPI } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Ensure userRole is set if not already in localStorage
        if (!userRole && parsedUser.role) {
          localStorage.setItem("userRole", parsedUser.role);
        }
      } catch (error) {
        console.error("Gagal memuat userData:", error);
        localStorage.removeItem("userData");
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
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
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      };

      // Simpan data user, token, dan role secara terpisah
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("token", result.token);
      localStorage.setItem("userRole", result.user.role); // Store role separately for easy access

      setUser(userData);

      return userData;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setUser(null);
    console.log("User logged out successfully");
  };

  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");
    return !!(user && token && userData);
  };

  const getUserRole = () => {
    // Try multiple sources for role
    if (user?.role) return user.role;

    const storedRole = localStorage.getItem("userRole");
    if (storedRole) return storedRole;

    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        return parsedUser.role;
      } catch (error) {
        console.error("Error parsing userData for role:", error);
      }
    }

    return null;
  };

  const getToken = () => localStorage.getItem("token");

  // Helper function to check if user has specific role
  const hasRole = (role) => {
    const userRole = getUserRole();
    return userRole === role;
  };

  // Helper function to check if user is admin
  const isAdmin = () => hasRole("admin");

  // Helper function to check if user is student
  const isStudent = () => hasRole("student");

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        getUserRole,
        getToken,
        hasRole,
        isAdmin,
        isStudent,
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
