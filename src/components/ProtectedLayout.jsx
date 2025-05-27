// src/components/ProtectedLayout.jsx (Simplified)
import React from "react";
import { Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

/**
 * Simplified layout component for protected routes with role-based access
 * Only shows Navbar, Sidebar and the content (ManagementTiket)
 */
const ProtectedLayout = ({ children, requiredRole }) => {
  const { isAuthenticated, getUserRole, loading } = useAuth();

  // Show loading state if still checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  const userRole = getUserRole();
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate tickets page based on actual role
    const redirectPath = `/${userRole}/tickets`;
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
};

export default ProtectedLayout;
