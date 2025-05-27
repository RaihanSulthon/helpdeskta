// Label.jsx
import React from "react";

function Label({ htmlFor, children, required = false, className = "" }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block mb-2 text-sm font-medium ${className}`}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

export default Label;
