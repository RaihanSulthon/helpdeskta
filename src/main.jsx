// Komponen untuk mencegah akses login/signup jika sudah login
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  if (token && userRole) {
    // Sudah login, redirect sesuai role
    switch (userRole) {
      case 'student':
        return <Navigate to="/student/tickets" replace />;
      case 'admin':
        return <Navigate to="/admin/tickets" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }
  // Belum login, tampilkan halaman
  return children;
};
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage';
import Layout from './pages/Layout';
import StudentDashboard from './pages/student/StudentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import Form from './components/student/Form';
import DetailTicket from './pages/TicketDetail';
import TicketFeedback from './pages/TicketFeedback';
import { SPLManager } from './config/splConfig';
import AdminEmailManagement from './pages/admin/AdminEmailManagement';
import AdminTicketStatistics from './pages/admin/AdminTicketStatistics';
import BaseLayout from './components/BaseLayout';
import PrivateRoute from './components/PrivateRoute'; // TAMBAH INI
import './index.css';
import DetailUser from './pages/admin/DetailUser';
import StudentAskedUs from './pages/student/StudentAskedUs';
import AdminAskedUs from './pages/admin/AdminAskedUs';
import ManageUsers from './pages/admin/ManageUsers';
import LAAKInfoPortal from './pages/LAAKInfoPortal';
import TicketExport from './pages/TicketExport';

// SPL-aware Role-based redirect component
const RoleBasedRedirect = () => {
  const userRole = localStorage.getItem('userRole');
  const config = SPLManager.getCurrentConfig();

  const getRedirectPath = () => {
    switch (userRole) {
      case 'student':
        return '/student/tickets';
      case 'admin':
        return '/admin/tickets';
      default:
        return '/login';
    }
  };

  return <Navigate to={getRedirectPath()} replace />;
};

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/Signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/dashboard" element={<RoleBasedRedirect />} />
        <Route path="/laak-info" element={<LAAKInfoPortal />} />

        {/* Student routes - SEMUA DILINDUNGI */}
        <Route
          path="/student"
          element={<Navigate to="/student/tickets" replace />}
        />

        <Route
          path="/student/sampaikan"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <BaseLayout>
                <Layout>
                  <Form />
                </Layout>
              </BaseLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/student/detailmanage/:userId"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <BaseLayout>
                <Layout>
                  <DetailUser />
                </Layout>
              </BaseLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/student/tickets"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <BaseLayout>
                <Layout>
                  <StudentDashboard />
                </Layout>
              </BaseLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/student/askedus"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <BaseLayout>
                <Layout>
                  <StudentAskedUs />
                </Layout>
              </BaseLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/student/reachus"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <BaseLayout>
                <Layout>
                  <StudentAskedUs />
                </Layout>
              </BaseLayout>
            </PrivateRoute>
          }
        />

        {/* Admin routes - SEMUA DILINDUNGI */}
        <Route
          path="/admin"
          element={<Navigate to="/admin/tickets" replace />}
        />

        <Route
          path="/admin/tickets"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <BaseLayout>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </BaseLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/statistics"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <BaseLayout>
                <Layout>
                  <AdminTicketStatistics />
                </Layout>
              </BaseLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/askedus"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <BaseLayout>
                <Layout>
                  <AdminAskedUs />
                </Layout>
              </BaseLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <BaseLayout>
                <Layout>
                  <ManageUsers />
                </Layout>
              </BaseLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/detailmanage/:userId"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <BaseLayout>
                <Layout>
                  <DetailUser />
                </Layout>
              </BaseLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/emails"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <BaseLayout>
                <Layout>
                  <AdminEmailManagement />
                </Layout>
              </BaseLayout>
            </PrivateRoute>
          }
        />

        {/* Shared routes - accessible by both roles */}
        <Route
          path="/ticket/:ticketId/export"
          element={
            <PrivateRoute>
              <BaseLayout>
                <Layout>
                  <TicketExport />
                </Layout>
              </BaseLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/ticket/:ticketId"
          element={
            <PrivateRoute>
              <BaseLayout>
                <Layout>
                  <DetailTicket />
                </Layout>
              </BaseLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/ticket/:ticketId/feedback"
          element={
            <PrivateRoute>
              <BaseLayout>
                <Layout>
                  <TicketFeedback />
                </Layout>
              </BaseLayout>
            </PrivateRoute>
          }
        />

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
                  You don't have permission to access this page
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
);
