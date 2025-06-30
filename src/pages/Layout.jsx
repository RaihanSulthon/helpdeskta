// pages/Layout.jsx - Updated with clean menu navigation
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children, requiredRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

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
        <Navbar />
      </div>

      {/* Main content with top padding for fixed navbar */}
      <div className="flex h-screen bg-slate-200 pt-16">
        {/* Fixed Sidebar */}
        <div className="fixed left-0 top-16 bottom-0 z-40">
          <Sidebar onMenuClick={handleMenuClick} />
        </div>

        {/* Main Content with left margin for fixed sidebar */}
        <div className="flex-1 flex flex-col ml-80 h-full">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getPageTitle()}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Welcome back, {user?.name || user?.email}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {/* User Role Badge */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user?.role === "admin"
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user?.role?.toUpperCase()}
                </span>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* Page Content - Background FORCE untuk semua halaman */}
          <main
            className="flex-1 overflow-y-auto bg-slate-200"
            style={{ backgroundColor: "#f1f5f9" }}
          >
            <div
              className="w-full h-full bg-slate-200 p-0"
              style={{ backgroundColor: "#f1f5f9" }}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
