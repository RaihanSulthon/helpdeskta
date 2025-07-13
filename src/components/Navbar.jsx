import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import appLogo from '../assets/applogo.png';

const Navbar = ({ onMenuToggle, sidebarExpanded }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserDropdown(false);
  };

  const toggleDropdown = () => {
    if (showUserDropdown) {
      setShowUserDropdown(false);
      setTimeout(() => setIsDropdownVisible(false), 300);
    } else {
      setIsDropdownVisible(true);
      setTimeout(() => setShowUserDropdown(true), 10);
    }
  };

  const [userInfo, setUserInfo] = useState({
    email: '',
    registeredDate: '',
  });

  useEffect(() => {
    // Fetch user data dari API atau context
    if (user) {
      setUserInfo({
        email: user.email || 'user@telkomuniversity.ac.id',
        registeredDate:
          user.registeredDate ||
          new Date().toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          }),
      });
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (showUserDropdown) {
          setShowUserDropdown(false);
          setTimeout(() => setIsDropdownVisible(false), 300);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

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
    <nav className="bg-black/20 backdrop-blur-md shadow-sm border-b border-white/20 h-16 flex items-center w-full">
      <div className="flex items-center justify-between w-full px-4">
        {/* Left section - Hamburger Menu */}
        <div className="flex items-center space-x-4">
          {/* Hamburger Menu Button */}
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-md text-white hover:text-white hover:bg-black/20 hover:scale-110 transition-all duration-300 ease-out transform"
            title="Toggle Sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Page Title */}
          <div className="hidden sm:block">
            <img src={appLogo} alt="App Logo" className="h-8 w-auto ml-4" />
          </div>
        </div>

        {/* Right section - User actions */}
        <div className="flex items-center space-x-4">
          {/* User Role Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              user?.role === 'admin'
                ? 'bg-white text-gray-800'
                : 'bg-red-600 text-white'
            }`}
          >
            {user?.role === 'admin' ? 'Admin' : 'Student'}
          </span>

          {/* Notifications */}
          <button className="p-2 text-white hover:text-white hover:bg-white/20 rounded-md transition-colors relative">
            <svg
              width="20"
              height="22"
              viewBox="0 0 20 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 1V3.10526"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 3.10547C6.48313 3.10547 3.625 5.93705 3.625 9.42126V15.737C2.5625 15.737 1.5 16.7897 1.5 17.8423H10M10 3.10547C13.5169 3.10547 16.375 5.93705 16.375 9.42126V15.737C17.4375 15.737 18.5 16.7897 18.5 17.8423H10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7.875 18.8945C7.875 20.0524 8.83125 20.9998 10 20.9998C11.1688 20.9998 12.125 20.0524 12.125 18.8945"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {/* Notification badge */}
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 text-white hover:text-white hover:bg-white/20 rounded-md p-2 transition-colors"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                <span className="text-sm font-medium text-white">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-white transform transition-transform duration-300 ease-out ${
                  showUserDropdown ? 'rotate-180' : 'rotate-0'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownVisible && (
              <div
                className={`absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50  transform transition-all duration-300 ease-out origin-top-right ${
                  showUserDropdown
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-95 -translate-y-2'
                }`}
              >
                {/* Header dengan close button */}
                <div className="bg-[#101B33] text-white p-4 rounded-t-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                      <span className="text-lg font-bold text-white">
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      {/* <div className="font-bold text-lg">
                        {user?.id || "1302213109"}
                      </div> */}
                      <div className="text-sm opacity-90">
                        {user?.role?.toUpperCase() || 'ADMIN'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setTimeout(() => setIsDropdownVisible(false), 300);
                    }}
                    className="text-white hover:bg-white/20 rounded p-1 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Body dengan staggered animation untuk content */}
                <div className="p-6">
                  <h3
                    className={`text-lg font-semibold text-gray-800 mb-4 transition-all duration-500 delay-100 ${
                      showUserDropdown
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    }`}
                  >
                    Informasi Akun
                  </h3>

                  {/* Email Field */}
                  <div
                    className={`mb-4 transition-all duration-500 delay-150 ${
                      showUserDropdown
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    }`}
                  >
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Email
                    </label>
                    <input
                      type="text"
                      value={userInfo.email}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                    />
                  </div>

                  {/* Registered Date Field */}
                  <div
                    className={`mb-6 transition-all duration-500 delay-200 ${
                      showUserDropdown
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    }`}
                  >
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Registered On
                    </label>
                    <input
                      type="text"
                      value={userInfo.registeredDate}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                    />
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className={`w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition-all duration-500 delay-250 flex items-center justify-center space-x-2 font-medium ${
                      showUserDropdown
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
