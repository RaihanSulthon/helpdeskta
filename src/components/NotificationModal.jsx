import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getNotificationsAPI,
  markNotificationAsReadAPI,
  markAllNotificationsAsReadAPI,
  getTicketDetailAPI,
} from '../services/api';
import { getUserDisplayName } from '../utils/userUtils';

const NotificationModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ticketTitles, setTicketTitles] = useState({});
  const [userNames, setUserNames] = useState({});
  const modalRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getNotificationsAPI({ read: false, per_page: 50 });

      let notificationList = [];
      if (result.notifications?.data) {
        notificationList = result.notifications.data;
      } else if (result.data) {
        notificationList = result.data;
      }

      setNotifications(notificationList);

      // Fetch ticket titles dan user names secara parallel
      if (notificationList.length > 0) {
        await Promise.all([
          fetchTicketTitles(notificationList),
          fetchUserNames(notificationList),
        ]);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Gagal memuat notifikasi');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user names secara async
  const fetchUserNames = async (notifications) => {
    const names = {};

    // Get unique sender IDs
    const senderIds = [
      ...new Set(notifications.map((notif) => notif.sender_id).filter(Boolean)),
    ];

    // Fetch names in parallel
    const namePromises = senderIds.map(async (senderId) => {
      try {
        const userName = await getUserDisplayName(senderId);
        return { senderId, userName };
      } catch (error) {
        console.error(`Error fetching name for user ${senderId}:`, error);
        return { senderId, userName: `User-${senderId.slice(-6)}` };
      }
    });

    const results = await Promise.all(namePromises);

    results.forEach(({ senderId, userName }) => {
      names[senderId] = userName;
    });

    setUserNames((prev) => ({ ...prev, ...names }));
  };

  // Fetch ticket titles secara terpisah dan parallel
  const fetchTicketTitles = async (notifications) => {
    const titles = {};

    // Batch process ticket titles
    const ticketPromises = notifications
      .filter((notif) => notif.ticket_id && !ticketTitles[notif.ticket_id])
      .slice(0, 10) // Limit hanya 10 first untuk avoid too many requests
      .map(async (notification) => {
        try {
          const ticketDetail = await getTicketDetailAPI(notification.ticket_id);
          return {
            ticketId: notification.ticket_id,
            title: ticketDetail.judul || ticketDetail.title || 'Untitled',
          };
        } catch (error) {
          return {
            ticketId: notification.ticket_id,
            title: 'Untitled',
          };
        }
      });

    // Wait for all promises
    const results = await Promise.all(ticketPromises);

    // Update titles state
    results.forEach((result) => {
      titles[result.ticketId] = result.title;
    });

    setTicketTitles((prev) => ({ ...prev, ...titles }));
  };

  // Mark notification as read and redirect based on notification type
  const handleNotificationClick = async (notification) => {
    try {
      // Mark clicked notification as read
      await markNotificationAsReadAPI(notification.id);

      // Jika ini adalah feedback notification, mark semua feedback notifications untuk tiket ini
      if (
        notification.type === 'chat_message' ||
        notification.message.includes('Feedback baru')
      ) {
        await markAllFeedbackNotificationsForTicket(notification.ticket_id);
      }

      // Update local state - remove all related notifications
      setNotifications((prev) =>
        prev.filter((notif) => {
          // Remove clicked notification
          if (notif.id === notification.id) return false;

          // If clicked notification is feedback, remove all feedback notifications for same ticket
          if (
            (notification.type === 'chat_message' ||
              notification.message.includes('Feedback baru')) &&
            notif.ticket_id === notification.ticket_id &&
            (notif.type === 'chat_message' ||
              notif.message.includes('Feedback baru'))
          ) {
            return false;
          }

          return true;
        })
      );

      if (notification.ticket_id) {
        onClose();

        // Redirect berdasarkan type notifikasi
        if (
          notification.type === 'chat_message' ||
          notification.message.includes('chat message')
        ) {
          // Redirect ke halaman feedback
          navigate(`/ticket/${notification.ticket_id}/feedback`);
        } else if (
          notification.type === 'new_ticket' ||
          notification.message.includes('Tiket baru telah dibuat')
        ) {
          // Redirect ke halaman ticket detail
          navigate(`/ticket/${notification.ticket_id}`);
        } else {
          // Default redirect ke ticket detail
          navigate(`/ticket/${notification.ticket_id}`);
        }
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsReadAPI();
      setNotifications([]);
    } catch (err) {
      console.error('Error marking all as read:', err);
      setError('Gagal menandai semua sebagai dibaca');
    }
  };

  // Format time for recent notifications
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper function to map status to user-friendly text
  const mapStatusToDisplayText = (status) => {
    if (!status) return status;

    const statusMap = {
      open: 'Tiket Baru',
      pending: 'Tiket Baru',
      new: 'Tiket Baru',
      in_progress: 'Diproses',
      processing: 'Diproses',
      assigned: 'Diproses',
      closed: 'Selesai',
      completed: 'Selesai',
      resolved: 'Selesai',
    };

    return statusMap[status.toLowerCase()] || status;
  };

  // Get notification content with colored text and ticket title
  const getNotificationContent = (notification) => {
    const { type, message, ticket_id } = notification;
    const ticketTitle = ticketTitles[ticket_id] || 'Loading...';

    if (type === 'new_ticket' || message.includes('Tiket baru telah dibuat')) {
      return (
        <>
          <span className="text-blue-600 font-medium">Tiket baru</span>
          <span className="text-gray-700"> telah dibuat: {ticketTitle}</span>
        </>
      );
    }

    if (type === 'chat_message' || message.includes('chat message')) {
      return (
        <>
          <span className="text-yellow-600 font-medium">Feedback baru</span>
          <span className="text-gray-700"> untuk tiket: {ticketTitle}</span>
        </>
      );
    }

    // Handle status update notifications
    if (
      type === 'status_update' ||
      message.includes('Status tiket telah diperbarui') ||
      message.includes('status updated')
    ) {
      // Extract status from message or context
      let statusText = '';

      // Try to extract status from message
      const statusMatch = message.match(
        /dari \w+ menjadi (\w+)|to (\w+)|status updated to (\w+)/i
      );
      if (statusMatch) {
        const extractedStatus =
          statusMatch[1] || statusMatch[2] || statusMatch[3];
        statusText = mapStatusToDisplayText(extractedStatus);
      }

      return (
        <>
          <span className="text-gray-700">
            Status tiket telah diperbarui menjadi{' '}
          </span>
          <span className="text-orange-600 font-bold">{statusText}</span>
          <span className="text-gray-700"> untuk tiket: {ticketTitle}</span>
        </>
      );
    }

    // Fallback dengan ticket title jika ada
    if (ticket_id && ticketTitle !== 'Loading...') {
      // Check if message contains status-related text and replace it
      let processedMessage = message;

      // Replace technical status terms with user-friendly ones
      processedMessage = processedMessage.replace(/\bopen\b/gi, 'Tiket Baru');
      processedMessage = processedMessage.replace(
        /\bin_progress\b/gi,
        'Diproses'
      );
      processedMessage = processedMessage.replace(/\bclosed\b/gi, 'Selesai');
      processedMessage = processedMessage.replace(
        /\bpending\b/gi,
        'Tiket Baru'
      );
      processedMessage = processedMessage.replace(/\bcompleted\b/gi, 'Selesai');
      processedMessage = processedMessage.replace(/\bresolved\b/gi, 'Selesai');

      return (
        <>
          <span className="text-gray-700">
            {processedMessage} untuk tiket: {ticketTitle}
          </span>
        </>
      );
    }

    // Process the general message
    let processedMessage = message;
    processedMessage = processedMessage.replace(/\bopen\b/gi, 'Tiket Baru');
    processedMessage = processedMessage.replace(
      /\bin_progress\b/gi,
      'Diproses'
    );
    processedMessage = processedMessage.replace(/\bclosed\b/gi, 'Selesai');
    processedMessage = processedMessage.replace(/\bpending\b/gi, 'Tiket Baru');
    processedMessage = processedMessage.replace(/\bcompleted\b/gi, 'Selesai');
    processedMessage = processedMessage.replace(/\bresolved\b/gi, 'Selesai');

    return <span className="text-gray-700">{processedMessage}</span>;
  };

  // Get sender name from state or fallback
  const getSenderName = (notification) => {
    const senderId = notification.sender_id;
    if (!senderId) return 'Unknown User';

    // Check if sender is admin by checking user role
    const currentUserRole = localStorage.getItem('userRole');
    const userData = localStorage.getItem('userData');
    let currentUserId = null;

    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        currentUserId = parsed.id || parsed.user_id;
      } catch (error) {
        console.error('Error parsing userData:', error);
      }
    }

    // If this is notification from admin to student
    if (
      currentUserRole === 'student' &&
      senderId &&
      senderId.toString() !== currentUserId?.toString()
    ) {
      // Check if sender has admin role by fetching from API or assume it's admin
      return 'Admin';
    }

    // Return from state if available, otherwise fallback
    return userNames[senderId] || `User-${senderId.slice(-6)}`;
  };
  // Close modal when clicking outside and setup auto-refresh
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    let refreshInterval;

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      fetchNotifications();

      // Auto refresh setiap 30 detik
      refreshInterval = setInterval(fetchNotifications, 30000);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const markAllFeedbackNotificationsForTicket = async (ticketId) => {
    try {
      // Get all unread notifications
      const result = await getNotificationsAPI({ read: false, per_page: 100 });
      const allNotifications = result.notifications?.data || result.data || [];

      // Filter feedback notifications untuk tiket ini
      const feedbackNotifications = allNotifications.filter(
        (notif) =>
          notif.ticket_id === ticketId &&
          (notif.type === 'chat_message' ||
            notif.message.includes('Feedback baru'))
      );

      // Mark semua feedback notifications sebagai read
      for (const notif of feedbackNotifications) {
        try {
          await markNotificationAsReadAPI(notif.id);
        } catch (err) {
          console.error('Error marking feedback notification as read:', err);
        }
      }

      console.log(
        `✅ Marked ${feedbackNotifications.length} feedback notifications as read for ticket ${ticketId}`
      );
    } catch (error) {
      console.error('Error marking all feedback notifications as read:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="absolute top-16 right-4 z-50">
        <div
          ref={modalRef}
          className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-80"
          style={{ maxHeight: '70vh' }}
        >
          {/* Header */}
          <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
            <h3 className="text-white text-lg font-semibold">Notifications</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div
            className="flex flex-col"
            style={{ maxHeight: 'calc(70vh - 140px)' }}
          >
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : error ? (
                <div className="text-red-600 text-center py-4">{error}</div>
              ) : notifications.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  Tidak ada notifikasi baru
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className="cursor-pointer hover:bg-gray-50 rounded-lg p-3 border-b border-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {getSenderName(notification)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                      <div className="text-sm">
                        {getNotificationContent(notification)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="border-t border-gray-200 px-4 py-3">
            <div className="flex space-x-3">
              <button
                onClick={handleMarkAllAsRead}
                disabled={notifications.length === 0}
                className="flex-1 px-4 py-2 text-sm font-medium text-black bg-white shadow-xl border-2 border-black rounded-md hover:bg-gray-200 hover:scale-105 duration-300 transition-all"
              >
                Baca Semua
              </button>
              <button
                disabled
                className="flex-1 px-4 py-2 text-sm font-medium text-black bg-white shadow-xl border-2 border-black rounded-md hover:bg-gray-200 hover:scale-105 duration-300 transition-all"
              >
                Hapus Semua
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
