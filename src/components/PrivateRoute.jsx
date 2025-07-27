import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, getUserRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    // Redirect ke login dengan menyimpan intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = getUserRole();
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // SMART REDIRECT: Redirect berdasarkan current path pattern
    const currentPath = location.pathname;
    
    let redirectPath;
    
    if (currentPath.startsWith('/admin/')) {
      // Jika user mencoba akses admin route tapi bukan admin
      redirectPath = userRole === 'student' ? '/student/tickets' : '/login';
    } else if (currentPath.startsWith('/student/')) {
      // Jika user mencoba akses student route tapi bukan student  
      redirectPath = userRole === 'admin' ? '/admin/tickets' : '/login';
    } else {
      // Default redirect berdasarkan role
      switch (userRole) {
        case 'admin':
          redirectPath = '/admin/tickets';
          break;
        case 'student':
          redirectPath = '/student/tickets';
          break;
        default:
          redirectPath = '/login';
      }
    }
    
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default PrivateRoute;