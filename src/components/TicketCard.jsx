// TicketCard.jsx - Fixed duplicate className issue
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { getTicketDetailAPI } from '../services/api';

const TicketCard = ({
  ticket,
  columnKey,
  updating,
  handleDragStart,
  handleTicketClick,
  getPriorityColor,
  getPriorityLabel,
  onDelete,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newFeedbackCount, setNewFeedbackCount] = useState(0);
  const [totalFeedbackCount, setTotalFeedbackCount] = useState(0);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'Tanggal tidak tersedia';

    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}, ${date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } catch (error) {
      return 'Tanggal tidak valid';
    }
  };

  const getStatusBorderColor = (status) => {
    switch (status) {
      case 'tiket-baru':
      case 'open':
      case 'new':
        return 'border-l-[#607D8B]';
      case 'diproses':
      case 'in_progress':
      case 'processing':
        return 'border-l-[#FFBA57]';
      case 'closed':
      case 'resolved':
      case 'completed':
        return 'border-l-[#28A745]';
      default:
        return 'border-l-[#607D8B]';
    }
  };

  // Function to get background color based on read status and new feedback
  const getCardBackgroundColor = () => {
    // Prioritas: feedback baru > status read ticket
    if (newFeedbackCount > 0) {
      return 'bg-blue-50'; // Light blue background untuk feedback baru
    } else if (!ticket.isRead) {
      return 'bg-blue-50'; // Light blue background untuk ticket yang belum dibaca
    }
    return 'bg-white'; // Default white background
  };

  const loadTicketinfo = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getTicketDetailAPI(ticket.id);

      const transformedData = {
        id: data.id || 'Tidak tersedia',
        title: data.judul || data.title || 'Judul tidak tersedia',
        submitter:
          data.anonymous === true
            ? 'Anonim'
            : data.nama || data.name || 'Tidak diketahui',
        email:
          data.anonymous === true
            ? 'anonim@email.com'
            : data.email || 'tidak diketahui',
        date: data.created_at,
        status: data.status,
        lastUpdate: data.updated_at || data.created_at,
        category: data.category?.name || 'Umum',
        userId: data.user_id,
        unread: data.unread_chat_count,
        read: data.chat_count,
      };

      setTicketData(transformedData);

      // Update feedback counts berdasarkan transformedData
      setTotalFeedbackCount(transformedData.read || 0);
      setNewFeedbackCount(transformedData.unread || 0);
    } catch (error) {
      console.error('Error loading ticket detail:', error);
      setError(error.message || 'Gagal memuat detail tiket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicketinfo();
  }, [ticket.unread_chat_count, ticket.chat_count]);

  const handleDelete = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onDelete) {
      onDelete(ticket);
    }
  };

  const handleFeedback = (e) => {
    e.stopPropagation();
    const currentUserRole = localStorage.getItem('userRole');
    navigate(`/ticket/${ticket.id}/feedback`);
  };

  if (loading || !ticketData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 relative animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-20 bg-gray-200 rounded mb-4"></div>
      </div>
    );
  }

  // Add this right before the return statement
  const currentUserRole = localStorage.getItem('userRole');

  return (
    <div
      data-ticket-card
      draggable={!updating}
      onMouseDown={(e) => {
        if (e.button === 0 && !updating) {
          e.currentTarget.style.cursor = 'grabbing';
          setTimeout(() => {
            const element = e.currentTarget;
            if (element) {
              element.draggable = true;
              element.style.opacity = '0.8';
            }
          }, 10);
        }
      }}
      onDragStart={(e) => {
        if (updating === ticket.id) {
          e.preventDefault();
          return;
        }

        setIsDragging(true);
        handleDragStart(e, ticket, columnKey);

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.dropEffect = 'move';

        const dragImage = document.createElement('div');
        dragImage.innerHTML = `📋 #${ticket.id}`;
        dragImage.style.cssText = `
          position: absolute;
          top: -1000px;
          background: #3b82f6;
          color: white;
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        `;
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 0, 0);

        setTimeout(() => {
          if (document.body.contains(dragImage)) {
            document.body.removeChild(dragImage);
          }
        }, 50);
      }}
      onDragEnd={(e) => {
        setIsDragging(false);
        e.target.style.opacity = '';
        e.target.style.cursor = '';
      }}
      onMouseUp={() => {
        if (!isDragging) {
          setTimeout(() => {
            const elements = document.querySelectorAll('[data-ticket-card]');
            elements.forEach((el) => {
              el.style.cursor = '';
              el.style.opacity = '';
            });
          }, 100);
        }
      }}
      onClick={(e) => {
        if (isDragging) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        setTimeout(() => {
          if (!isDragging) {
            handleTicketClick(ticket.id);
          }
        }, 50);
      }}
      className={`${getCardBackgroundColor()} rounded-lg p-4 mb-3 shadow-sm transition-all duration-200 border ${
        newFeedbackCount > 0 || !ticket.isRead
          ? 'border-blue-200 hover:bg-blue-100 hover:border-blue-300'
          : 'border-gray-200 hover:bg-gray-100'
      } ${
        updating === ticket.id
          ? 'opacity-50 cursor-wait'
          : isDragging
            ? 'opacity-60 cursor-grabbing transform scale-95'
            : `cursor-grab hover:shadow-lg hover:scale-105 transition-all duration-300 hover:${getStatusBorderColor(ticketData.status).replace('border-l-', 'border-')}`
      } relative overflow-hidden ${getStatusBorderColor(ticketData.status)} border-l-8`}
    >
      {/* Ticket Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-black">
            {ticketData
              ? `#${ticketData.id.length > 10 ? `${ticketData.id.slice(0, 8)}...` : ticketData.id}`
              : `#${ticket.id.length > 10 ? `${ticket.id.slice(0, 8)}...` : ticket.id}`}
          </span>
        </div>

        {/* Right side info with calendar icon and lastUpdate date */}
        <div className="flex items-center space-x-2 text-gray-600 text-xs">
          <span>
            Terakhir Update:{' '}
            {ticketData
              ? formatDate(ticketData.lastUpdate)
              : formatDate(ticket.lastUpdate || ticket.updated_at)}
          </span>
        </div>
      </div>

      {/* Student Info Row: Name, Email, Created Date */}
      <div className="flex items-center justify-between mb-1">
        <div className="text-blue-800 text-xs font-semibold">
          {(ticketData?.submitter || 'Tidak diketahui').length > 10
            ? (ticketData?.submitter || 'Tidak diketahui').slice(0, 10) + '...'
            : ticketData?.submitter || 'Tidak diketahui'}
        </div>

        {/* Center email and right-align date */}
        <div className="flex items-center justify-between flex-1 ml-4">
          <span className="text-gray-600 text-xs mx-auto">
            {(ticketData?.email || ticket.email || 'Email tidak tersedia')
              .length > 25
              ? (ticketData?.email || ticket.email).slice(0, 20) + '...'
              : ticketData?.email || ticket.email || 'Email tidak tersedia'}
          </span>

          <span className="text-gray-600 flex items-center gap-1 text-xs">
            <svg
              viewBox="0 0 14 14"
              className="w-3 h-3"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 12.6875C0 13.4121 0.671875 14 1.5 14H12.5C13.3281 14 14 13.4121 14 12.6875V5.25H0V12.6875ZM10 7.32813C10 7.14766 10.1687 7 10.375 7H11.625C11.8313 7 12 7.14766 12 7.32813V8.42188C12 8.60234 11.8313 8.75 11.625 8.75H10.375C10.1687 8.75 10 8.60234 10 8.42188V7.32813ZM10 10.8281C10 10.6477 10.1687 10.5 10.375 10.5H11.625C11.8313 10.5 12 10.6477 12 10.8281V11.9219C12 12.1023 11.8313 12.25 11.625 12.25H10.375C10.1687 12.25 10 12.1023 10 11.9219V10.8281ZM6 7.32813C6 7.14766 6.16875 7 6.375 7H7.625C7.83125 7 8 7.14766 8 7.32813V8.42188C8 8.60234 7.83125 8.75 7.625 8.75H6.375C6.16875 8.75 6 8.60234 6 8.42188V7.32813ZM6 10.8281C6 10.6477 6.16875 10.5 6.375 10.5H7.625C7.83125 10.5 8 10.6477 8 10.8281V11.9219C8 12.1023 7.83125 12.25 7.625 12.25H6.375C6.16875 12.25 6 12.1023 6 11.9219V10.8281ZM2 7.32813C2 7.14766 2.16875 7 2.375 7H3.625C3.83125 7 4 7.14766 4 7.32813V8.42188C8 8.60234 3.83125 8.75 3.625 8.75H2.375C2.16875 8.75 2 8.60234 2 8.42188V7.32813ZM2 10.8281C2 10.6477 2.16875 10.5 2.375 10.5H3.625C3.83125 10.5 4 10.6477 4 10.8281V11.9219C4 12.1023 3.83125 12.25 3.625 12.25H2.375C2.16875 12.25 2 12.1023 2 11.9219V10.8281ZM12.5 1.75H11V0.4375C11 0.196875 10.775 0 10.5 0H9.5C9.225 0 9 0.196875 9 0.4375V1.75H5V0.4375C5 0.196875 4.775 0 4.5 0H3.5C3.225 0 3 0.196875 3 0.4375V1.75H1.5C0.671875 1.75 0 2.33789 0 3.0625V4.375H14V3.0625C14 2.33789 13.3281 1.75 12.5 1.75Z" />
            </svg>
            {ticketData
              ? formatDate(ticketData.date)
              : formatDate(ticket.date || ticket.created_at)}
          </span>
        </div>
      </div>

      {/* Bookmark Icon with TAK label */}
      <div className="flex items-center space-x-2 mb-3">
        <svg viewBox="0 0 17 20" fill="none" className="w-3 h-3">
          <path
            d="M0 20V1.875C0 0.839453 0.95138 0 2.125 0H14.875C16.0486 0 17 0.839453 17 1.875V20L8.5 15.625L0 20Z"
            fill="#444746"
          />
        </svg>
        <span className="text-gray-600 text-sm">
          {ticketData?.category || 'Umum'}
        </span>
      </div>

      {/* Ticket Title */}
      <div className="text-blue-800 font-bold text-lg mb-4">
        {ticketData
          ? ticketData.title ||
            'TAK Belum Kunjung Lorem Ipsum TAK Belum Kunjung Lorem Ipsum ...'
          : ticket.subject ||
            'TAK Belum Kunjung Lorem Ipsum TAK Belum Kunjung Lorem Ipsum ...'}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        {/* Feedback Button */}
        <button
          onClick={handleFeedback}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg border shadow-lg transition-colors ${
            newFeedbackCount > 0
              ? 'bg-yellow-600 border-yellow-700 hover:bg-yellow-700 text-white'
              : 'bg-white border-gray-300 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <svg viewBox="0 0 24 20" fill="none" className="w-4 h-4">
            <path
              d="M19.4092 7.38086C21.7593 8.52498 23.25 10.5925 23.25 12.8574C23.2499 14.1885 22.7409 15.4344 21.8477 16.4756L21.5479 16.8252L21.7236 17.25C22.0415 18.02 22.4653 18.7004 22.8018 19.1807C21.8379 19.0305 21.0144 18.6514 20.3682 18.248L20.0029 18.0195L19.6221 18.2197C18.3894 18.8678 16.9213 19.25 15.333 19.25C12.5831 19.2499 10.2094 18.1196 8.80078 16.4609C14.4682 16.3998 19.2637 12.4717 19.4092 7.38086ZM8.66699 0.75C13.1822 0.750144 16.5828 3.73976 16.583 7.14258C16.583 10.5455 13.1824 13.536 8.66699 13.5361C7.0801 13.5361 5.6109 13.15 4.37598 12.5049L3.99609 12.3066L3.63184 12.5332C2.98533 12.9367 2.16169 13.3167 1.19727 13.4668C1.53383 12.986 1.95825 12.3052 2.27637 11.5371L2.45215 11.1123L2.15332 10.7627C1.25849 9.71566 0.75 8.47315 0.75 7.14258C0.750186 3.73968 4.15157 0.75 8.66699 0.75ZM0.651367 14.1826L0.649414 14.1807C0.656513 14.1726 0.666326 14.1611 0.678711 14.1465C0.670118 14.1586 0.661652 14.1711 0.651367 14.1826Z"
              fill="#444746"
              stroke="#444746"
              strokeWidth="1.5"
            />
          </svg>
          <span
            className={`text-sm font-semibold ${
              newFeedbackCount > 0 ? 'text-white' : 'text-gray-700'
            }`}
          >
            Feedback ({totalFeedbackCount}
            {newFeedbackCount > 0 ? `/${newFeedbackCount} baru` : ''})
          </span>
        </button>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          disabled={updating === ticket.id}
          className={`p-2 rounded-lg transition-colors ${
            updating === ticket.id
              ? 'bg-gray-100 cursor-not-allowed opacity-50'
              : 'hover:bg-red-100'
          }`}
          title="Delete Ticket"
        >
          <svg viewBox="0 0 16 20" fill="none" className="w-4 h-4">
            <path
              d="M10.5 0.5V1.61133H15.5V2.83301H14.5V17.7773C14.5 18.271 14.346 18.6742 14.041 19.0137C13.738 19.3509 13.3995 19.5005 13.001 19.5H3C2.60175 19.5 2.26319 19.3504 1.95996 19.0137C1.65522 18.6751 1.50056 18.272 1.5 17.7773V2.83301H0.5V1.61133H5.5V0.5H10.5ZM4.5 16.0557H7.5V5.05566H4.5V16.0557ZM8.5 16.0557H11.5V5.05566H8.5V16.0557Z"
              fill="#444746"
              stroke="#444746"
            />
          </svg>
        </button>
      </div>

      {/* Keep the updating overlay exactly as it was */}
      {updating === ticket.id && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default TicketCard;
