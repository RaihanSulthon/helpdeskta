// RadioCard.jsx
import React from "react";

function RadioCard({ value, selectedValue, onChange, label, className = "" }) {
  const isSelected = value === selectedValue;

  return (
    <div
      className={`border rounded p-2 text-center cursor-pointer ${
        isSelected ? "bg-blue-500 text-white" : "border-gray-300"
      } ${className}`}
      onClick={() => onChange(value)}
    >
      <span className="text-sm">{label}</span>
    </div>
  );
}

export default RadioCard;
