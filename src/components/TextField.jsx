// TextField.jsx
import React from "react";

function TextField({
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
  disabled = false,
}) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${className}`}
    />
  );
}

export default TextField;
