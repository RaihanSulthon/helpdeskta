import React, { useState, useEffect } from 'react';
import TicketCard from './TicketCard';

const TicketColumn = ({
  columnKey,
  config,
  tickets: columnTickets,
  handleDrop,
  loadAdminTickets,
  updating,
  handleDragStart,
  handleTicketClick,
  getPriorityColor,
  getPriorityLabel,
  onDeleteTicket,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropPosition, setDropPosition] = useState(null);

  

  const handleColumnDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);

    // Calculate drop position
    const columnElement = e.currentTarget;
    const ticketCards = Array.from(
      columnElement.querySelectorAll('[data-ticket-card]')
    );
    const mouseY = e.clientY;

    let insertIndex = ticketCards.length;

    for (let i = 0; i < ticketCards.length; i++) {
      const cardRect = ticketCards[i].getBoundingClientRect();
      const cardMiddle = cardRect.top + cardRect.height / 2;

      if (mouseY < cardMiddle) {
        insertIndex = i;
        break;
      }
    }

    setDropPosition(insertIndex);
  };

  const handleColumnDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
      setDropPosition(null);
    }
  };

  const handleColumnDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleDrop(e, columnKey, dropPosition);
    setDropPosition(null);
  };

  return (
    <div
      className="flex-1 bg-gray-50 rounded-lg px-4 mt-2 pb-4"
      onDragOver={handleColumnDragOver}
      onDragLeave={handleColumnDragLeave}
      onDrop={handleColumnDrop}
    >
      {/* Column Header */}
      <div
        className={`${config.bgColor} ${config.textColor} rounded-t-lg p-3 mb-4 flex items-center justify-between`}
      >
        <div className="flex items-center space-x-2">
          <span className="font-bold text-sm">{config.title}</span>
          <span className="font-bold text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
            {config.count}
          </span>
          {/* Badge "baru" dengan warna sesuai status ticket */}
          {config.hasNewItems && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white animate-pulse ${config.badgeColor} cursor-pointer`}
              onClick={(e) => {
                e.stopPropagation();
                // Mark column as viewed when badge is clicked
                if (config.markAsViewed) {
                  config.markAsViewed(columnKey);
                }
              }}
              title="Klik untuk menandai sebagai sudah dilihat"
            >
              baru
            </span>
          )}
        </div>
        <button
          className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
          title="Refresh Column"
          onClick={loadAdminTickets}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Drop Zone Indicator */}
      <div className="min-h-96 relative">
        {columnTickets.length === 0 ? (
          <div className="absolute inset-0 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg
                className="w-8 h-8 mx-auto mb-2 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414-2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <span className="text-sm">Belum ada tiket di kolom ini</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {columnTickets.map((ticket, index) => (
              <React.Fragment key={ticket.id}>
                {/* Drop indicator line */}
                {isDragOver && dropPosition === index && (
                  <div className="h-0.5 bg-blue-500 rounded-full mx-2 transition-all duration-200" />
                )}

                <TicketCard
                  ticket={ticket}
                  columnKey={columnKey}
                  updating={updating}
                  handleDragStart={handleDragStart}
                  handleTicketClick={handleTicketClick}
                  getPriorityColor={getPriorityColor}
                  getPriorityLabel={getPriorityLabel}
                  onDelete={onDeleteTicket}
                />
              </React.Fragment>
            ))}

            {/* Drop indicator at the end */}
            {isDragOver && dropPosition === columnTickets.length && (
              <div className="h-0.5 bg-blue-500 rounded-full mx-2 transition-all duration-200" />
            )}
          </div>
        )}

        {/* Drag over overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-50 border-2 border-blue-300 border-dashed rounded-lg pointer-events-none transition-all duration-200">
            <div className="flex items-center justify-center h-full">
              <div className="text-blue-600 font-medium text-sm">
                Lepas tiket di sini
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketColumn;
