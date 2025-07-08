import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SPLManager } from "../config/splConfig";
import { getTicketsAPI, getAdminTicketsAPI } from "../services/api";

const Sidebar = ({ onMenuClick, forceExpanded = false }) => {
  const [activeMenuItem, setActiveMenuItem] = useState("tickets");
  const [userRole, setUserRole] = useState(null);
  const [ticketCount, setTicketCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = forceExpanded || isHovered;

  // Get user role from multiple sources
  useEffect(() => {
    // Try to get role from different sources
    const roleFromAuth = user?.role;
    const roleFromLocalStorage = localStorage.getItem("userRole");
    const roleFromUser = user?.userRole;

    // Use the first available role
    const currentRole =
      roleFromAuth || roleFromLocalStorage || roleFromUser || "student";

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
    } else if (path.includes("/emails")) {
      setActiveMenuItem("emails");
    } else if (path.includes("/statistics")) {
      setActiveMenuItem("statistics");
    } else if (path.includes("/reachus")) {
      setActiveMenuItem("reachus");
    }
  }, [location.pathname]);

  // Load ticket count
  useEffect(() => {
    const loadTicketCount = async () => {
      if (!userRole) return;

      setLoadingCount(true);
      try {
        let ticketsData;
        if (userRole === "admin") {
          ticketsData = await getAdminTicketsAPI();
        } else {
          ticketsData = await getTicketsAPI();
        }
        setTicketCount(ticketsData?.length || 0);
      } catch (error) {
        console.error("Error loading ticket count:", error);
        setTicketCount(0);
      } finally {
        setLoadingCount(false);
      }
    };

    loadTicketCount();
  }, [userRole]);

  // Handle menu click with navigation
  const handleMenuClick = (menuId) => {
    setActiveMenuItem(menuId);

    if (menuId === "tickets") {
      if (userRole === "admin") {
        navigate("/admin/tickets"); // AdminDashboard
      } else {
        navigate("/student/tickets"); // StudentDashboard
      }
    } else if (menuId === "statistics" && userRole === "admin") {
      navigate("/admin/statistics"); // AdminTicketStatistics - admin only
    } else if (menuId === "askedus") {
      navigate(`/${userRole}/askedus`);
    } else if (menuId === "users" && userRole === "admin") {
      navigate("/admin/users");
    } else if (menuId === "emails" && userRole === "admin") {
      navigate("/admin/emails"); // Email Management - admin only
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

  // Icon components - New SVG Icons
  const ComposeIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" />
    </svg>
  );

  const TicketIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 1728 1728" fill="currentColor">
      <path d="m992 420l316 316l-572 572l-316-316zm-211 979l618-618q19-19 19-45t-19-45l-362-362q-18-18-45-18t-45 18L329 947q-19 19-19 45t19 45l362 362q18 18 45 18t45-18m889-637l-907 908q-37 37-90.5 37t-90.5-37l-126-126q56-56 56-136t-56-136t-136-56t-136 56L59 1146q-37-37-37-90.5T59 965L966 59q37-37 90.5-37t90.5 37l125 125q-56 56-56 136t56 136t136 56t136-56l126 125q37 37 37 90.5t-37 90.5" />
    </svg>
  );

  const UsersIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <g className="user-outline">
        <g fillRule="evenodd" className="Vector" clipRule="evenodd">
          <path d="M12 10a3 3 0 1 0 0-6a3 3 0 0 0 0 6m0 2a5 5 0 1 0 0-10a5 5 0 0 0 0 10m-7.361 3.448C5.784 13.93 7.509 13 9.714 13h4.572c2.205 0 3.93.93 5.075 2.448C20.482 16.935 21 18.916 21 21a1 1 0 1 1-2 0c0-1.782-.446-3.3-1.235-4.348C17 15.638 15.867 15 14.285 15h-4.57c-1.582 0-2.715.638-3.48 1.652C5.445 17.7 5 19.218 5 21a1 1 0 1 1-2 0c0-2.084.518-4.065 1.639-5.552" />
          <path d="M3 21a1 1 0 0 1 1-1h15.962a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1" />
        </g>
      </g>
    </svg>
  );

  const QuestionIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <g fill="none">
        <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
        <path
          fill="currentColor"
          d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m0 2a8 8 0 1 0 0 16a8 8 0 0 0 0-16m0 12a1 1 0 1 1 0 2a1 1 0 0 1 0-2m0-9.5a3.625 3.625 0 0 1 1.348 6.99a.8.8 0 0 0-.305.201c-.044.05-.051.114-.05.18L13 14a1 1 0 0 1-1.993.117L11 14v-.25c0-1.153.93-1.845 1.604-2.116a1.626 1.626 0 1 0-2.229-1.509a1 1 0 1 1-2 0A3.625 3.625 0 0 1 12 6.5"
        />
      </g>
    </svg>
  );

  const EmailIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );

  const StatisticsIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M3 3v18h18M7 14l4-4 4 4 4-4"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
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
    <div
      className={`bg-white h-full shadow-lg flex flex-col transition-all duration-300 ease-in-out overflow-y-auto rounded-tr-3xl ${
        isExpanded ? "w-80" : "w-16"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Profile Section - Paling Atas */}
      <div
        className={`${
          isExpanded ? "p-6" : "p-2"
        } border-b border-gray-200 bg-gray-50 transition-all duration-300`}
      >
        <div className="flex flex-col items-center text-center">
          {/* Profile Picture */}
          <div
            className={`${
              isExpanded ? "w-16 h-16" : "w-10 h-10"
            } bg-gray-300 rounded-full ${
              isExpanded ? "mb-3" : "mb-1"
            } flex items-center justify-center transition-all duration-300`}
          >
            <span
              className={`${
                isExpanded ? "text-lg" : "text-sm"
              } font-bold text-gray-600 transition-all duration-300`}
            >
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : user?.displayName
                ? user.displayName.charAt(0).toUpperCase()
                : user?.email
                ? user.email.charAt(0).toUpperCase()
                : "U"}
            </span>
          </div>

          {/* User Info - Only show when expanded */}
          {isExpanded && (
            <div className="transition-opacity duration-300">
              <div className="text-gray-800 font-bold text-sm mb-1">
                {user?.name ||
                  user?.displayName ||
                  user?.email?.split("@")[0] ||
                  "User"}
              </div>
              <div className="text-xs text-red-800 font-bold mb-2 bg-red-100 px-2 py-1 rounded">
                {userRole?.toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sampaikan Button - STUDENT ONLY */}
      {userRole === "student" && (
        <div
          className={`${
            isExpanded ? "p-6" : "p-2"
          } transition-all duration-300`}
        >
          <button
            onClick={handleComposeClick}
            className={`w-full rounded-full ${
              isExpanded ? "px-6 py-3" : "p-3"
            } flex items-center ${
              isExpanded ? "justify-center space-x-3" : "justify-center"
            } transition-all duration-300 shadow-md text-base ${
              activeMenuItem === "sampaikan"
                ? "bg-red-100 text-white"
                : "bg-red-100 text-red-600 hover:bg-red-200"
            }`}
            title={!isExpanded ? "Sampaikan" : ""}
          >
            <ComposeIcon />
            {isExpanded && <span className="font-medium">Ajukan Tiket</span>}
          </button>
        </div>
      )}

      {/* Menu Sections */}
      <div className="flex-1 px-4 space-y-6">
        {/* HELPDESK TELL-US Section */}
        <div>
          {isExpanded && (
            <div className="mb-4">
              <h2 className="text-sm font-bold text-gray-800 tracking-wide mt-4 ">
                HELPDESK TELL-US
              </h2>
            </div>
          )}

          <div className="space-y-2">
            {/* Tickets Menu - Available for both roles */}
            <button
              onClick={() => handleMenuClick("tickets")}
              className={`w-full flex items-center ${
                isExpanded
                  ? "justify-between px-4 py-3 rounded-full"
                  : "justify-center px-5 py-2 rounded-full"
              } transition-all duration-300 mt-4 ${
                activeMenuItem === "tickets"
                  ? `${
                      isExpanded
                        ? "bg-red-100 text-gray-800 shadow-lg"
                        : "bg-red-100 text-gray-800"
                    }`
                  : `${
                      isExpanded
                        ? "bg-white hover:bg-gray-50"
                        : "bg-white hover:bg-gray-50"
                    }`
              }`}
              title={
                !isExpanded
                  ? userRole === "admin"
                    ? "Kelola Tiket"
                    : "My Ticket"
                  : ""
              }
            >
              {isExpanded ? (
                <>
                  <div className="flex items-center space-x-3">
                    <div
                      className={`${
                        activeMenuItem === "tickets"
                          ? "text-gray-800"
                          : "text-gray-600"
                      } flex-shrink-0`}
                    >
                      <TicketIcon />
                    </div>
                    <span
                      className={`text-base font-medium ${
                        activeMenuItem === "tickets"
                          ? "text-gray-800"
                          : "text-gray-800"
                      }`}
                    >
                      {userRole === "admin" ? "Kelola Tiket" : "My Ticket"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {loadingCount ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                      <span
                        className={`font-semibold text-sm ${
                          activeMenuItem === "tickets"
                            ? "text-gray-800"
                            : "text-gray-600"
                        }`}
                      >
                        {ticketCount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div
                  className={`${
                    activeMenuItem === "tickets"
                      ? "text-gray-800"
                      : "text-gray-600"
                  }`}
                >
                  <TicketIcon />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* ADMIN MANAGEMENT Section */}
        <div>
          {isExpanded && (
            <div className="mb-4">
              <h2 className="text-sm font-bold text-gray-800 tracking-wide">
                ADMIN MANAGEMENT
              </h2>
            </div>
          )}

          <div className="space-y-2">
            {/* ADMIN ONLY MENUS */}
            {userRole === "admin" && (
              <>
                {/* Statistics Menu - ADMIN ONLY */}
                <button
                  onClick={() => handleMenuClick("statistics")}
                  className={`w-full flex items-center p-4 rounded-lg transition-colors ${
                    activeMenuItem === "statistics"
                      ? "bg-red-100 text-red-800 border-l-4 border-red-600"
                      : "bg-white border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={
                        activeMenuItem === "statistics"
                          ? "text-red-600"
                          : "text-gray-600"
                      }
                    >
                      <StatisticsIcon />
                    </div>
                    <span
                      className={`text-base font-medium ${
                        activeMenuItem === "statistics"
                          ? "text-red-800"
                          : "text-gray-800"
                      }`}
                    >
                      Statistics
                    </span>
                  </div>
                </button>
                {/* Users Menu - ADMIN ONLY */}
                <button
                  onClick={() => handleMenuClick("users")}
                  className={`w-full flex items-center ${
                    isExpanded
                      ? "justify-between px-4 py-3 rounded-full"
                      : "justify-center px-5 py-2 rounded-full"
                  } transition-all duration-300 mt-4 ${
                    activeMenuItem === "users"
                      ? `${
                          isExpanded
                            ? "bg-red-100 text-gray-800 shadow-lg"
                            : "bg-red-100 text-gray-800"
                        }`
                      : `${
                          isExpanded
                            ? "bg-white hover:bg-gray-50"
                            : "bg-white hover:bg-gray-50"
                        }`
                  }`}
                  title={!isExpanded ? "Data Mahasiswa" : ""}
                >
                  {isExpanded ? (
                    <div className="flex items-center space-x-3">
                      <div
                        className={`${
                          activeMenuItem === "users"
                            ? "text-gray-800"
                            : "text-gray-600"
                        } flex-shrink-0`}
                      >
                        <UsersIcon />
                      </div>
                      <span
                        className={`text-base font-medium ${
                          activeMenuItem === "users"
                            ? "text-gray-800"
                            : "text-gray-800"
                        }`}
                      >
                        Data Mahasiswa
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`${
                        activeMenuItem === "users"
                          ? "text-gray-800"
                          : "text-gray-600"
                      }`}
                    >
                      <UsersIcon />
                    </div>
                  )}
                </button>

                {/* AskedUs Menu - ADMIN */}
                <button
                  onClick={() => handleMenuClick("askedus")}
                  className={`w-full flex items-center ${
                    isExpanded
                      ? "justify-between px-4 py-3 rounded-full"
                      : "justify-center px-5 py-2 rounded-full"
                  } transition-all duration-300 mt-4 ${
                    activeMenuItem === "askedus"
                      ? `${
                          isExpanded
                            ? "bg-red-100 text-gray-800 shadow-lg"
                            : "bg-red-100 text-gray-800"
                        }`
                      : `${
                          isExpanded
                            ? "bg-white hover:bg-gray-50"
                            : "bg-white hover:bg-gray-50"
                        }`
                  }`}
                  title={!isExpanded ? "Kelola Asked Us (FAQ)" : ""}
                >
                  {isExpanded ? (
                    <div className="flex items-center space-x-3">
                      <div
                        className={`${
                          activeMenuItem === "askedus"
                            ? "text-gray-800"
                            : "text-gray-600"
                        } flex-shrink-0`}
                      >
                        <QuestionIcon />
                      </div>
                      <span
                        className={`text-base font-medium ${
                          activeMenuItem === "askedus"
                            ? "text-gray-800"
                            : "text-gray-800"
                        }`}
                      >
                        Kelola Asked Us (FAQ)
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`${
                        activeMenuItem === "askedus"
                          ? "text-gray-800"
                          : "text-gray-600"
                      }`}
                    >
                      <QuestionIcon />
                    </div>
                  )}
                </button>

                {/* Email Management Menu - ADMIN ONLY */}
                <button
                  onClick={() => handleMenuClick("emails")}
                  className={`w-full flex items-center ${
                    isExpanded
                      ? "justify-between px-4 py-3 rounded-full"
                      : "justify-center px-5 py-2 rounded-full"
                  } transition-all duration-300 mt-4 ${
                    activeMenuItem === "emails"
                      ? `${
                          isExpanded
                            ? "bg-red-100 text-gray-800 shadow-lg"
                            : "bg-red-100 text-gray-800"
                        }`
                      : `${
                          isExpanded
                            ? "bg-white hover:bg-gray-50"
                            : "bg-white hover:bg-gray-50"
                        }`
                  }`}
                  title={!isExpanded ? "Email Management" : ""}
                >
                  {isExpanded ? (
                    <div className="flex items-center space-x-3">
                      <div
                        className={`${
                          activeMenuItem === "emails"
                            ? "text-gray-800"
                            : "text-gray-600"
                        } flex-shrink-0`}
                      >
                        <EmailIcon />
                      </div>
                      <span
                        className={`text-base font-medium ${
                          activeMenuItem === "emails"
                            ? "text-gray-800"
                            : "text-gray-600"
                        }`}
                      >
                        Email Management
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`${
                        activeMenuItem === "emails"
                          ? "text-gray-800"
                          : "text-gray-600"
                      }`}
                    >
                      <EmailIcon />
                    </div>
                  )}
                </button>
              </>
            )}

            {/* STUDENT ONLY MENUS */}
            {userRole === "student" && (
              <>
                {/* AskedUs Menu - STUDENT */}
                <button
                  onClick={() => handleMenuClick("askedus")}
                  className={`w-full flex items-center ${
                    isExpanded
                      ? "justify-between px-4 py-3 rounded-full"
                      : "justify-center px-5 py-2 rounded-full"
                  } transition-all duration-300 mt-4 ${
                    activeMenuItem === "askedus"
                      ? `${
                          isExpanded
                            ? "bg-red-100 text-gray-800 shadow-lg"
                            : "bg-red-100 text-gray-800"
                        }`
                      : `${
                          isExpanded
                            ? "bg-white hover:bg-gray-50"
                            : "bg-white hover:bg-gray-50"
                        }`
                  }`}
                  title={!isExpanded ? "AskedUs" : ""}
                >
                  {isExpanded ? (
                    <div className="flex items-center space-x-3">
                      <div
                        className={`${
                          activeMenuItem === "askedus"
                            ? "text-gray-800"
                            : "text-gray-600"
                        } flex-shrink-0`}
                      >
                        <QuestionIcon />
                      </div>
                      <span
                        className={`text-base font-medium ${
                          activeMenuItem === "askedus"
                            ? "text-gray-800"
                            : "text-gray-600"
                        }`}
                      >
                        AskedUs
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`${
                        activeMenuItem === "askedus"
                          ? "text-gray-800"
                          : "text-gray-600"
                      }`}
                    >
                      <QuestionIcon />
                    </div>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
