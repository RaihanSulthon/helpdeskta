// TextArea.jsx
import React from "react";

function TextArea({
  id,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  className = "",
  disabled = false,
}) {
  return (
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${className}`}
    />
  );
}

export default TextArea;
