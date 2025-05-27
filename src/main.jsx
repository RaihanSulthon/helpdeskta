// src/main.jsx - Enhanced dengan SPL
import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import ManagementTiket from "./pages/ManagementTiket";
import ProtectedLayout from "./components/ProtectedLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import { AuthProvider } from "./context/AuthContext";
import { SPLManager } from "./config/splConfig";
import "./index.css";

// SPL-aware Role-based redirect component
const RoleBasedRedirect = () => {
  const userRole = localStorage.getItem("userRole");
  const config = SPLManager.getCurrentConfig();

  // Validate if user has access to requested features
  const getRedirectPath = () => {
    switch (userRole) {
      case "student":
        return SPLManager.validateFeature("dashboard")
          ? "/student/tickets"
          : "/access-denied";
      case "admin":
        return SPLManager.validateFeature("management")
          ? "/admin/tickets"
          : "/admin/dashboard";
      case "disposition":
        return SPLManager.validateFeature("review")
          ? "/disposition/tickets"
          : "/disposition/dashboard";
      default:
        return "/login";
    }
  };

  return <Navigate to={getRedirectPath()} replace />;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* SPL-aware role-based redirect */}
          <Route path="/dashboard" element={<RoleBasedRedirect />} />

          {/* Student routes dengan SPL validation */}
          <Route
            path="/student"
            element={<Navigate to="/student/tickets" replace />}
          />
          <Route
            path="/student/tickets"
            element={
              <ProtectedLayout requiredRole="student">
                <StudentDashboard />
              </ProtectedLayout>
            }
          />

          {/* Admin routes dengan SPL validation */}
          <Route
            path="/admin"
            element={<Navigate to="/admin/tickets" replace />}
          />
          <Route
            path="/admin/tickets"
            element={
              <ProtectedLayout requiredRole="admin">
                <ManagementTiket />
              </ProtectedLayout>
            }
          />

          {/* Disposition routes dengan SPL validation */}
          <Route
            path="/disposition"
            element={<Navigate to="/disposition/tickets" replace />}
          />
          <Route
            path="/disposition/tickets"
            element={
              <ProtectedLayout requiredRole="disposition">
                <ManagementTiket />
              </ProtectedLayout>
            }
          />

          {/* Access denied route */}
          <Route
            path="/access-denied"
            element={
              <div>Access Denied - Feature not available for your role</div>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
