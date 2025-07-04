import React, {useEffect} from "react";

const TicketCard = ({ ticket, onClick, onDragStart, onDragEnd, isDraggable = true, isBeingDragged = false }) => {
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
      // Ganti bagian onDragStart dengan ini
      onDragStart={(e) => {
        if (isDraggable && onDragStart) {
          e.dataTransfer.setData(
            "application/json",
            JSON.stringify({ id: ticket.id })
          );
          
          // Pure Tailwind visual feedback
          e.target.style.cssText = `
            opacity: 0.8;
            transform: rotate(5deg) scale(1.05);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
            border: 2px solid #3b82f6;
            z-index: 1000;
            transition: none;
          `;
          
          // Create drag preview
          const dragPreview = document.createElement('div');
          dragPreview.innerHTML = `📋 ${ticket.judul}`;
          dragPreview.style.cssText = `
            position: absolute;
            top: -1000px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 8px;
            padding: 12px 16px;
            font-weight: bold;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            font-size: 14px;
            pointer-events: none;
          `;
          document.body.appendChild(dragPreview);
          e.dataTransfer.setDragImage(dragPreview, 0, 0);
          
          setTimeout(() => {
            document.body.removeChild(dragPreview);
          }, 0);
          
          onDragStart();
        }
      }}

      onDragEnd={(e) => {
        // Reset styles
        e.target.style.cssText = '';
        onDragEnd && onDragEnd();
      }}
      onClick={() => onClick && onClick(ticket)}
      className={`${getStatusColor()} text-white p-4 rounded-lg mb-3 shadow-md hover:opacity-90 transition-all duration-200 cursor-move ${
        isBeingDragged ? 'opacity-50 transform rotate-2 scale-105' : ''
      }`}
      style={{
        cursor: isDraggable ? 'move' : 'pointer'
      }}
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
