import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import bgdashboard from "../assets/bgdashboard.jpg";

const BaseLayout = ({ children }) => {
  const { getUserRole, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Route protection logic
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }

    const userRole = getUserRole();
    const currentPath = location.pathname;

    // Check for role mismatch
    if (currentPath.startsWith('/admin/') && userRole !== 'admin') {
      console.warn('Student trying to access admin route, redirecting...');
      navigate('/student/tickets', { replace: true });
      return;
    }

    if (currentPath.startsWith('/student/') && userRole !== 'student') {
      console.warn('Admin trying to access student route, redirecting...');
      navigate('/admin/tickets', { replace: true });
      return;
    }

    // Check for shared routes that need role-specific handling
    if (currentPath.startsWith('/ticket/')) {
      // Ticket routes are accessible by both roles, no redirect needed
      return;
    }

  }, [location.pathname, getUserRole, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen relative">
      {/* Layer 1 (Background Gray) */}
      <div className="fixed inset-0 z-0" style={{ backgroundColor: '#ECF0F5' }}></div>
      
      {/* layer 2 (Background Gambar Gedung) */}
      <div className="fixed inset-0 z-10">
        <div 
          className="w-full h-1/3 bg-cover bg-center bg-no-repeat opacity-100"
          style={{
            backgroundImage: `url(${bgdashboard})`,
            backgroundPosition: 'top center',
          }}
        ></div>
      </div>

      {/* Layer 3 (Konten Utama) */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
};

export default BaseLayout;