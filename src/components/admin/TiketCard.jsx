// src/components/user-specific/ticket-management/TicketCard.jsx
import React from "react";

const TicketCard = ({ ticket, onClick, onDragStart, isDraggable = true }) => {
  const getStatusColor = () => {
    switch (ticket.status?.toLowerCase()) {
      case "selesai":
        return "bg-green-800";
      case "diproses":
        return "bg-yellow-800";
      case "menunggu":
        return "bg-blue-800";
      case "ditolak":
        return "bg-red-800";
      default:
        return "bg-green-800"; // Default color
    }
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={(e) => {
        if (isDraggable && onDragStart) {
          e.dataTransfer.setData(
            "application/json",
            JSON.stringify({ id: ticket.id })
          );
          onDragStart();
        }
      }}
      onClick={() => onClick && onClick(ticket)}
      className={`${getStatusColor()} text-white p-4 rounded-lg mb-3 shadow-md hover:opacity-90 transition duration-200 cursor-pointer`}
    >
      <h3 className="text-lg font-semibold mb-1">{ticket.judul}</h3>
      {ticket.dateRange && (
        <p className="text-sm text-green-200">{ticket.dateRange}</p>
      )}
      {ticket.kategori && (
        <div className="mt-2">
          <span className="inline-block bg-opacity-30 bg-white text-xs px-2 py-1 rounded-full text-white">
            {ticket.kategori}
          </span>
        </div>
      )}
      {ticket.sender && ticket.timestamp && (
        <div className="flex justify-between items-center mt-2 text-xs text-green-200">
          <span>{ticket.sender}</span>
          <span>{ticket.timestamp}</span>
        </div>
      )}
    </div>
  );
};

export default TicketCard;
