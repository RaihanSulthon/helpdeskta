// src/main.jsx - Enhanced dengan SPL dan AskedUs Routes
import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import Layout from "./pages/Layout";
import StudentDashboard from "./pages/student/StudentDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { AuthProvider } from "./context/AuthContext";
import Form from "./components/student/Form";
import DetailTicket from "./pages/student/TicketDetail";
import TicketFeedback from "./pages/student/TicketFeedback";
import { SPLManager } from "./config/splConfig";
import "./index.css";

// Import AskedUs components
import StudentAskedUs from "./pages/student/StudentAskedUs";
import AdminAskedUs from "./pages/admin/AdminAskedUs";
import ManageUsers from "./pages/admin/ManageUsers";

// SPL-aware Role-based redirect component
const RoleBasedRedirect = () => {
  const userRole = localStorage.getItem("userRole");
  const config = SPLManager.getCurrentConfig();

  // Validate if user has access to requested features
  const getRedirectPath = () => {
    switch (userRole) {
      case "student":
        return "/student/tickets";
      case "admin":
        return "/admin/tickets";
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
            path="/student/sampaikan"
            element={
              <Layout>
                <Form />
              </Layout>
            }
          />
          {/* Student Tickets Dashboard */}
          <Route
            path="/student/tickets"
            element={
              <Layout>
                <StudentDashboard />
              </Layout>
            }
          />
          {/* Student AskedUs - bisa mengakses FAQ atau help */}
          <Route
            path="/student/askedus"
            element={
              <Layout>
                <StudentAskedUs />
              </Layout>
            }
          />
          {/* Student Detail */}
          <Route
            path="/ticket/:ticketId"
            element={
              <Layout>
                <DetailTicket />
              </Layout>
            }
          />
          <Route
            path="/ticket/:ticketId/feedback"
            element={
              <Layout>
                <TicketFeedback />
              </Layout>
            }
          />
          {/* Student ReachUs */}
          <Route
            path="/student/reachus"
            element={
              <Layout>
                <StudentAskedUs />
              </Layout>
            }
          />
          {/* Admin routes dengan SPL validation */}
          <Route
            path="/admin"
            element={<Navigate to="/admin/tickets" replace />}
          />
          {/* Admin Tickets Dashboard */}
          <Route
            path="/admin/tickets"
            element={
              <Layout>
                <AdminDashboard />
              </Layout>
            }
          />
          {/* Admin AskedUs - untuk mengelola FAQ */}
          <Route
            path="/admin/askedus"
            element={
              <Layout>
                <AdminAskedUs />
              </Layout>
            }
          />
          {/* Admin Users - untuk mengelola users */}
          <Route
            path="/admin/users"
            element={
              <Layout>
                <ManageUsers />
              </Layout>
            }
          />
          {/* Admin ReachUs - untuk mengelola kontak */}
          {/* <Route
            path="/admin/reachus"
            element={
              <Layout>
                <AdminReachUs />
              </Layout>
            }
          /> */}
          {/* Access denied route */}
          <Route
            path="/access-denied"
            element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-red-600 mb-4">
                    Access Denied
                  </h1>
                  <p className="text-gray-600">
                    Feature not available for your role
                  </p>
                  <button
                    onClick={() => window.history.back()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            }
          />
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
