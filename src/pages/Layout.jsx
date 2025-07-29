// pages/Layout.jsx - Updated with clean menu navigation
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import NotificationModal from '../components/NotificationModal';

const Layout = ({ children, requiredRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Handle menu clicks from sidebar - BERSIHKAN INI!
  const handleMenuClick = (menuId) => {
    const userRole = user?.role || 'student';

    switch (menuId) {
      case 'tickets':
        navigate(`/${userRole}/tickets`);
        break;
      case 'askedus':
        navigate(`/${userRole}/askedus`);
        break;
      case 'users':
        navigate('/admin/users');
        break;
      case 'reachus':
        navigate('/student/reachus');
        break;
      case 'sampaikan':
        // Handle compose action - this is handled in Sidebar component
        break;
      default:
        console.log('Unknown menu item:', menuId);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleNotificationToggle = () => {
    setShowNotificationModal(true);
  };

  // TAMBAHAN: Handle close notification modal dengan refresh count
  const handleCloseNotificationModal = () => {
    setShowNotificationModal(false);
    // Refresh count setelah modal ditutup
    setTimeout(() => {
      if (window.refreshNotificationCount) {
        window.refreshNotificationCount();
      }
    }, 1000);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Get current page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/emails')) return 'Email Management';
    if (path.includes('/askedus')) return 'AskedUs';
    if (path.includes('/reachus')) return 'ReachUs';
    if (path.includes('/users')) return 'Manage Users';
    if (path.includes('/tickets')) return 'Tickets Dashboard';
    if (path.includes('/sampaikan')) return 'Sampaikan Laporan';
    if (path.includes('/feedback')) return 'Ticket Feedback';
    if (path.includes('/ticket/')) return 'Ticket Detail';
    return 'Dashboard';
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar
          onMenuToggle={() => setSidebarExpanded(!sidebarExpanded)}
          sidebarExpanded={sidebarExpanded}
          user={user}
          onLogout={handleLogout}
          onNotificationToggle={handleNotificationToggle}
        />
      </div>

      {/* Main content with top padding for fixed navbar */}
      <div className="flex h-screen pt-16">
        {/* Sidebar - tidak fixed, mengikuti flow layout */}
        <div className="transition-all duration-300 z-40">
          <Sidebar
            onMenuClick={handleMenuClick}
            forceExpanded={sidebarExpanded}
          />
        </div>

        {/* Main Content - otomatis menyesuaikan */}
        <div className="flex-1 flex flex-col transition-all duration-300 h-full ">
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm transition-opacity"
            onClick={cancelLogout}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header dengan icon dan background navy */}
              <div className="bg-gray-800 px-6 py-4 flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-white rounded mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-gray-800"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    >
                      <path d="M19.353 6.5H16.49V9H6.404v6H16.49v2.5h2.864A9.99 9.99 0 0 1 11 22C5.477 22 1 17.523 1 12S5.477 2 11 2a9.99 9.99 0 0 1 8.353 4.5M17.989 16v-1zm0-8v1z" />
                      <path d="m18.99 8l4 4l-4 4h-1v-2.5h-10v-3h10V8z" />
                    </g>
                  </svg>
                </div>
                <h3 className="text-white text-lg font-semibold">
                  Konfirmasi Logout
                </h3>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <p className="text-gray-700 font-semibold text-base mb-6">
                  Apakah Anda yakin ingin Logout?
                </p>

                {/* Custom Buttons sesuai design */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelLogout}
                    className="px-6 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-300 hover:scale-105 duration-300 transition-all hover:shadow-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 hover:scale-105 duration-300 transition-all hover:shadow-lg font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={handleCloseNotificationModal}
      />
    </div>
  );
};

export default Layout;
