// Navbar.jsx
import React, { useState } from "react";
import Icon from "./Icon";
import Button from "./Button";
import TextField from "./TextField";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStudentClick = () => {
    setShowStudentDropdown(!showStudentDropdown);
  };

  const handleLogout = () => {
    // Handle logout logic here
    console.log("Logout clicked");
    setShowStudentDropdown(false);
    // Add your logout logic here
  };

  const handleProfileClick = () => {
    // Set login status in sessionStorage or localStorage before navigation
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("userType", "student");
    sessionStorage.setItem("userName", "U"); // or actual user name

    // Navigate to landing page
    window.location.href = "/"; // or use your routing method
    console.log("Navigate to landing page with login status");
  };

  return (
    <header className="flex items-center justify-between w-full px-4 py-2 bg-red-600 shadow-sm">
      {/* Left section - Menu and Logo */}
      <div className="flex items-center space-x-3">
        <Button className="text-white hover:bg-red-700 p-2 rounded">
          <Icon name="menu" size={20} className="text-white" />
        </Button>
        <div className="bg-white rounded px-3 py-1">
          <span className="text-red-600 font-medium text-sm">Gmail</span>
        </div>
      </div>

      {/* Center section - Search */}
      <div className="flex-1 mx-6 max-w-2xl">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Icon name="search" size={18} className="text-gray-500" />
          </div>
          <TextField
            type="text"
            placeholder="Telusuri Telus"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full py-2.5 pl-12 pr-4 text-gray-700 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 shadow-sm"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Button className="text-gray-500 hover:text-gray-700">
              <Icon name="filter" size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Right section - Actions and Profile */}
      <div className="flex items-center space-x-2 relative">
        <div className="relative">
          {/* Student Dropdown */}
          {showStudentDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border">
              <div className="py-1">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <div className="font-medium">Student Account</div>
                  <div className="text-xs text-gray-500">
                    student@example.com
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Icon name="log-out" size={16} className="mr-2" />
                    Logout
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        <Button className="text-white hover:bg-red-700 p-2 rounded">
          <Icon name="bell" size={20} className="text-white" />
        </Button>

        <Button
          className="text-white hover:bg-red-700 p-1 rounded-full"
          onClick={handleProfileClick}
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">U</span>
          </div>
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
