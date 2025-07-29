// components/Button.jsx - SPL-enabled
import React from "react";
import { SPLManager } from "../config/splConfig";

function Button({
  children,
  type = "default",
  size = "medium",
  className = "",
  onClick,
  splEnabled = false,
}) {
  // SPL Configuration
  let finalType = type;
  let finalSize = size;

  if (splEnabled) {
    const config = SPLManager.getComponentConfig("button");

    // Validate and adjust type based on user role
    if (!config.allowedTypes.includes(type)) {
      finalType = config.defaultType;
    }

    // Validate size based on context
    if (!config.allowedSizes.includes(size)) {
      finalSize = config.allowedSizes[0];
    }
  }

  const getButtonStyle = () => {
    switch (finalType) {
      case "primary":
        return "bg-blue-500 hover:bg-blue-600 text-white";
      case "secondary":
        return "bg-white text-blue-600 border border-blue-600";
      case "danger":
        return "bg-red-500 hover:bg-red-600 text-white";
      case "outline":
        return "bg-transparent border border-current";
      default:
        return "bg-gray-200 hover:bg-gray-300 text-gray-800";
    }
  };

  const getSizeStyle = () => {
    switch (finalSize) {
      case "small":
        return "px-2 py-1 text-sm";
      case "large":
        return "px-6 py-3 text-lg";
      default:
        return "px-4 py-2";
    }
  };

  return (
    <button
      className={`${getSizeStyle()} rounded font-medium ${getButtonStyle()} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
