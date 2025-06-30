import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SPLManager } from "../config/splConfig";
import { getTicketsAPI, getAdminTicketsAPI } from "../services/api";

const Sidebar = ({ onMenuClick }) => {
  const [activeMenuItem, setActiveMenuItem] = useState("tickets");
  const [userRole, setUserRole] = useState(null);
  const [ticketCount, setTicketCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get user role from multiple sources
  useEffect(() => {
    // Try to get role from different sources
    const roleFromAuth = user?.role;
    const roleFromLocalStorage = localStorage.getItem("userRole");
    const roleFromUser = user?.userRole;

    // Use the first available role
    const currentRole =
      roleFromAuth || roleFromLocalStorage || roleFromUser || "student";

    // console.log("🔍 Role Detection:", {
    //   roleFromAuth,
    //   roleFromLocalStorage,
    //   roleFromUser,
    //   finalRole: currentRole,
    // });

    setUserRole(currentRole);
  }, [user]);

  // Set active menu based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/tickets")) {
      setActiveMenuItem("tickets");
    } else if (path.includes("/sampaikan")) {
      setActiveMenuItem("sampaikan");
    } else if (path.includes("/askedus")) {
      setActiveMenuItem("askedus");
    } else if (path.includes("/users")) {
      setActiveMenuItem("users");
    } else if (path.includes("/reachus")) {
      setActiveMenuItem("reachus");
    }
  }, [location.pathname]);

  // Load ticket count when role changes
  useEffect(() => {
    if (userRole) {
      loadTicketCount();
    }
  }, [userRole]);

  const loadTicketCount = async () => {
    try {
      setLoadingCount(true);
      let tickets = [];
      
      console.log(`Loading ticket count for role: ${userRole}`);
      
      if (userRole === "admin") {
        tickets = await getAdminTicketsAPI();
      } else {
        tickets = await getTicketsAPI();
      }
      
      setTicketCount(tickets.length);
      console.log(`Loaded ${tickets.length} tickets for ${userRole}`);
    } catch (error) {
      console.error("Error loading ticket count:", error);
      setTicketCount(0);
    } finally {
      setLoadingCount(false);
    }
  };

  // Refresh ticket count function - can be called from parent components
  const refreshTicketCount = () => {
    if (userRole) {
      loadTicketCount();
    }
  };

  const handleMenuClick = (menuId) => {
    setActiveMenuItem(menuId);

    // Handle navigation based on role and menu
    if (menuId === "tickets") {
      if (userRole === "admin") {
        navigate("/admin/tickets"); // AdminDashboard
      } else {
        navigate("/student/tickets"); // StudentDashboard
      }
    } else if (menuId === "askedus") {
      if (userRole === "admin") {
        navigate("/admin/askedus"); // AdminAskedUs
      } else {
        navigate("/student/askedus"); // StudentAskedUs
      }
    } else if (menuId === "users" && userRole === "admin") {
      navigate("/admin/users"); // ManageUsers - admin only
    } else if (menuId === "sampaikan" && userRole === "student") {
      navigate("/student/sampaikan"); // Sampaikan - student only
    }

    if (onMenuClick) {
      onMenuClick(menuId);
    }
  };

  const handleComposeClick = () => {
    setActiveMenuItem("sampaikan");
    navigate("/student/sampaikan");
    if (onMenuClick) {
      onMenuClick("sampaikan");
    }
  };

  // Icon components
  const PencilIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" />
    </svg>
  );

  const TicketIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 12h6v2H9zm0-4h6v2H9zm-3 8h12a1 1 0 001-1V7a1 1 0 00-1-1H6a1 1 0 00-1 1v10a1 1 0 001 1z" />
      <path d="M4 6V4a2 2 0 012-2h12a2 2 0 012 2v2M4 18v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
    </svg>
  );

  const QuestionIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
    </svg>
  );

  const ReachUsIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );

  const UsersIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );

  // Show loading if role is not determined yet
  if (!userRole) {
    return (
      <div className="bg-white h-screen shadow-lg flex items-center justify-center w-80">
        <div className="text-gray-500">Loading sidebar...</div>
      </div>
    );
  }

  return (
    <div className="bg-white h-full shadow-lg flex flex-col w-80 overflow-y-auto">
      {/* Profile Section - Paling Atas */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col items-center text-center">
          {/* Profile Picture */}
          <div className="w-16 h-16 bg-gray-300 rounded-full mb-3 overflow-hidden">
            <img
              src="/api/placeholder/64/64"
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white font-semibold text-lg hidden">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </div>
          </div>

          {/* User Info */}
          <div className="text-sm font-semibold text-gray-800 mb-1">
            {user?.nim || user?.id || "1302213109"}
          </div>
          <div className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            {user?.name || user?.email?.split("@")[0] || "MUHAMMAD BURHAN"}
          </div>

          {/* Role Badge */}
          <div
            className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
              userRole === "admin"
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {userRole?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Button Sampaikan - STUDENT ONLY */}
      {userRole === "student" && (
        <div className="p-6">
          <button
            onClick={handleComposeClick}
            className={`w-full rounded-full px-6 py-3 flex items-center justify-center space-x-3 transition-colors shadow-md text-base ${
              activeMenuItem === "sampaikan"
                ? "bg-red-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            <PencilIcon />
            <span className="font-semibold">Sampaikan</span>
          </button>
        </div>
      )}

      {/* Menu Sections */}
      <div className="flex-1 px-4 space-y-6">
        {/* Admin Panel Label - ADMIN ONLY */}
        {userRole === "admin" && (
          <div className="pt-4">
            <div className="bg-red-600 text-white text-center py-3 px-4 rounded-full">
              <span className="font-bold text-base tracking-wide">
                ADMIN PANEL
              </span>
            </div>
          </div>
        )}

        {/* HELPDESK TELL-US Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-sm font-bold text-gray-800 tracking-wide">
              HELPDESK TELL-US
            </h2>
          </div>

          <div className="space-y-2">
            {/* Tickets Menu - Available for both roles */}
            <button
              onClick={() => handleMenuClick("tickets")}
              className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
                activeMenuItem === "tickets"
                  ? "bg-red-100 text-red-800 border-l-4 border-red-600"
                  : "hover:bg-gray-50 bg-white border border-gray-200"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={
                    activeMenuItem === "tickets"
                      ? "text-red-600"
                      : "text-gray-600"
                  }
                >
                  <TicketIcon />
                </div>
                <span
                  className={`text-base font-medium ${
                    activeMenuItem === "tickets"
                      ? "text-red-800"
                      : "text-gray-800"
                  }`}
                >
                  {userRole === "admin" ? "Manage Ticket" : "My Ticket"}
                </span>
              </div>
              <div className="flex items-center">
                {loadingCount ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  <span
                    className={`font-semibold text-sm ${
                      activeMenuItem === "tickets"
                        ? "text-red-800"
                        : "text-gray-600"
                    }`}
                  >
                    {ticketCount.toLocaleString()}
                  </span>
                )}
                {/* Refresh button - only show when not loading */}
                {!loadingCount && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      refreshTicketCount();
                    }}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Refresh ticket count"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* ADMIN MANAGEMENT Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-sm font-bold text-gray-800 tracking-wide">
              ADMIN MANAGEMENT
            </h2>
          </div>

          <div className="space-y-2">
            {/* ADMIN ONLY MENUS */}
            {userRole === "admin" && (
              <>
                {/* Users Menu - ADMIN ONLY */}
                <button
                  onClick={() => handleMenuClick("users")}
                  className={`w-full flex items-center p-4 rounded-lg transition-colors ${
                    activeMenuItem === "users"
                      ? "bg-red-100 text-red-800 border-l-4 border-red-600"
                      : "bg-white border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={
                        activeMenuItem === "users"
                          ? "text-red-600"
                          : "text-gray-600"
                      }
                    >
                      <UsersIcon />
                    </div>
                    <span
                      className={`text-base font-medium ${
                        activeMenuItem === "users"
                          ? "text-red-800"
                          : "text-gray-800"
                      }`}
                    >
                      Users
                    </span>
                  </div>
                </button>

                {/* AskedUs Menu - ADMIN */}
                <button
                  onClick={() => handleMenuClick("askedus")}
                  className={`w-full flex items-center p-4 rounded-lg transition-colors ${
                    activeMenuItem === "askedus"
                      ? "bg-red-100 text-red-800 border-l-4 border-red-600"
                      : "bg-white border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={
                        activeMenuItem === "askedus"
                          ? "text-red-600"
                          : "text-gray-600"
                      }
                    >
                      <QuestionIcon />
                    </div>
                    <span
                      className={`text-base font-medium ${
                        activeMenuItem === "askedus"
                          ? "text-red-800"
                          : "text-gray-800"
                      }`}
                    >
                      AskedUs
                    </span>
                  </div>
                </button>
              </>
            )}

            {/* STUDENT ONLY MENUS */}
            {userRole === "student" && (
              <>
                {/* AskedUs Menu - STUDENT */}
                <button
                  onClick={() => handleMenuClick("askedus")}
                  className={`w-full flex items-center p-4 rounded-lg transition-colors ${
                    activeMenuItem === "askedus"
                      ? "bg-red-100 text-red-800 border-l-4 border-red-600"
                      : "bg-white border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={
                        activeMenuItem === "askedus"
                          ? "text-red-600"
                          : "text-gray-600"
                      }
                    >
                      <QuestionIcon />
                    </div>
                    <span
                      className={`text-base font-medium ${
                        activeMenuItem === "askedus"
                          ? "text-red-800"
                          : "text-gray-800"
                      }`}
                    >
                      AskedUs
                    </span>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="p-4 text-xs text-gray-500 border-t">
          <div>
            <strong>Session Info:</strong>
          </div>
          <div>
            User Role:{" "}
            <span className="font-bold text-blue-600">{userRole}</span>
          </div>
          <div>
            Ticket Count:{" "}
            <span className="font-bold text-green-600">
              {loadingCount ? "Loading..." : ticketCount}
            </span>
          </div>
          <div>Active Menu: {activeMenuItem}</div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;