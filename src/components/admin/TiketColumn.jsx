import React, { useState } from "react";
import TicketCard from "./TiketCard";

const TicketColumn = ({
  id,
  title,
  tickets,
  onAddTicket,
  onDropTicket,
  onTicketClick,
  columnColor = "bg-blue-800",
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropPosition, setDropPosition] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);

    // Calculate drop position
    const columnRect = e.currentTarget.getBoundingClientRect();
    const mouseY = e.clientY;
    const tickets = Array.from(e.currentTarget.querySelectorAll('[data-ticket-card]'));
    
    let insertIndex = tickets.length;
    
    for (let i = 0; i < tickets.length; i++) {
      const ticketRect = tickets[i].getBoundingClientRect();
      const ticketMiddle = ticketRect.top + ticketRect.height / 2;
      
      if (mouseY < ticketMiddle) {
        insertIndex = i;
        break;
      }
    }
    
    setDropPosition(insertIndex);
  };


  const handleDragLeave = (e) => {
    // Only set drag over to false if we're actually leaving the column
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
      setDropPosition(null);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      onDropTicket && onDropTicket(data.id, id, dropPosition);
    } catch (err) {
      console.error("Error parsing drag data:", err);
    } finally {
      setDropPosition(null);
    }
  };

  return (
    <div className={`w-full ${columnColor} p-4 rounded-lg`}>
      {title && (
        <div className="mb-4 pb-2 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`min-h-[50px] rounded-lg transition-colors ${
          isDragOver ? "bg-gray-700 bg-opacity-50" : ""
        }`}
      >
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onDragStart={() => {}}
            onClick={() => onTicketClick && onTicketClick(ticket)}
          />
        ))}

        {/* Tombol New Page selalu ditampilkan di akhir kolom */}
        <div
          className="border border-gray-300 border-dashed rounded-lg p-3 text-gray-300 hover:bg-gray-700 transition duration-200 flex items-center justify-center cursor-pointer"
          onClick={() => onAddTicket && onAddTicket(id)}
        >
          <span className="text-xl mr-2">+</span>
          <span>New page</span>
        </div>
      </div>
    </div>
  );
};

export default TicketColumn;
