// pages/Layout.jsx - Updated with clean menu navigation
import React, {useState} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children, requiredRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Handle menu clicks from sidebar - BERSIHKAN INI!
  const handleMenuClick = (menuId) => {
    const userRole = user?.role || "student";

    switch (menuId) {
      case "tickets":
        navigate(`/${userRole}/tickets`);
        break;
      case "askedus":
        navigate(`/${userRole}/askedus`);
        break;
      case "users":
        navigate("/admin/users");
        break;
      case "reachus":
        navigate("/student/reachus");
        break;
      case "sampaikan":
        // Handle compose action - this is handled in Sidebar component
        break;
      default:
        console.log("Unknown menu item:", menuId);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get current page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/emails")) return "Email Management";
    if (path.includes("/askedus")) return "AskedUs";
    if (path.includes("/reachus")) return "ReachUs";
    if (path.includes("/users")) return "Manage Users";
    if (path.includes("/tickets")) return "Tickets Dashboard";
    if (path.includes("/sampaikan")) return "Sampaikan Laporan";
    if (path.includes("/feedback")) return "Ticket Feedback";
    if (path.includes("/ticket/")) return "Ticket Detail";
    return "Dashboard";
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar 
          onMenuToggle={() => setSidebarExpanded(!sidebarExpanded)}
          sidebarExpanded={sidebarExpanded}
          user={user}
        />
      </div>
  
      {/* Main content with top padding for fixed navbar */}
      <div className="flex h-screen bg-slate-200 pt-16">
        {/* Sidebar - tidak fixed, mengikuti flow layout */}
        <div className="transition-all duration-300 z-40">
          <Sidebar 
            onMenuClick={handleMenuClick} 
            forceExpanded={sidebarExpanded}
          />
        </div>
  
        {/* Main Content - otomatis menyesuaikan */}
        <div className="flex-1 flex flex-col transition-all duration-300 h-full">
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
