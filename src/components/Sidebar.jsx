// components/Sidebar.jsx - SPL-enabled
import React, { useState, useEffect } from "react";
import Form from "../components/student/Form";
import Button from "./Button";
import { SPLManager } from "../config/splConfig";

const Sidebar = ({ onMenuClick }) => {
  const [splConfig, setSplConfig] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [activeItem, setActiveItem] = useState("mail");
  const [activeSubmenu, setActiveSubmenu] = useState("inbox");
  const [showSubmenu, setShowSubmenu] = useState(true);

  useEffect(() => {
    const config = SPLManager.getCurrentConfig();
    setSplConfig(config);
  }, []);

  if (!splConfig) return <div>Loading...</div>;

  // SPL-based menu configuration
  const getMenuItems = () => {
    const baseMenus = {
      inbox: {
        id: "inbox",
        label: "Kotak Masuk",
        icon: "square",
        allowedRoles: ["student", "admin", "disposition"],
      },
      management: {
        id: "management",
        label: "Management",
        icon: "settings",
        allowedRoles: ["admin"],
      },
      users: {
        id: "users",
        label: "Users",
        icon: "users",
        allowedRoles: ["admin"],
      },
      review: {
        id: "review",
        label: "Review",
        icon: "check",
        allowedRoles: ["disposition"],
      },
    };

    // Filter menu based on role
    return Object.values(baseMenus).filter((menu) =>
      menu.allowedRoles.includes(splConfig.role)
    );
  };

  const handleMainItemClick = (menuId) => {
    setActiveItem(menuId);
    if (menuId === "mail") {
      setShowSubmenu(true);
      if (activeItem !== "mail") {
        setActiveSubmenu("inbox");
        if (onMenuClick) {
          onMenuClick("inbox");
        }
      }
    } else {
      setShowSubmenu(false);
      if (onMenuClick) {
        onMenuClick(menuId);
      }
    }
  };

  const handleSubmenuClick = (menuId) => {
    setActiveSubmenu(menuId);
    if (onMenuClick) {
      onMenuClick(menuId);
    }
  };

  const handleComposeClick = () => {
    setShowFormModal(true);
    if (onMenuClick) {
      onMenuClick("tulis");
    }
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
  };

  const MailIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" />
    </svg>
  );

  const PencilIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" />
    </svg>
  );

  const SquareIcon = () => (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  );

  return (
    <div className="flex h-screen">
      {/* Main sidebar */}
      <div className="bg-gray-200 w-16 flex flex-col items-center">
        <div
          className={`flex flex-col items-center justify-center py-4 cursor-pointer ${
            "mail" === activeItem
              ? "text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => handleMainItemClick("mail")}
        >
          <MailIcon />
          <span className="text-xs mt-1">Mail</span>
        </div>
      </div>

      {/* Sub-sidebar for Mail - SPL configured */}
      {showSubmenu && (
        <div className="bg-blue-50 w-56 p-2">
          {/* Compose button - only for student role */}
          {splConfig.role === "student" && (
            <div className="mb-6">
              <Button
                type="primary"
                splEnabled={true}
                className="flex items-center space-x-2 rounded-xl px-4 py-2 w-full"
                onClick={handleComposeClick}
              >
                <PencilIcon />
                <span className="font-medium">Tulis</span>
              </Button>
            </div>
          )}

          {/* Mail categories - filtered by SPL */}
          <div className="space-y-1">
            {getMenuItems().map((item) => (
              <div
                key={item.id}
                className={`flex items-center px-4 py-2 rounded-lg cursor-pointer ${
                  item.id === activeSubmenu
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => handleSubmenuClick(item.id)}
              >
                <SquareIcon className="mr-3" />
                <span className="flex-1">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Modal using the Form component */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="sticky top-0 z-10 flex justify-end p-4 bg-white border-b">
              <Button
                type="outline"
                splEnabled={true}
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>
            <div className="p-4">
              <Form />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
