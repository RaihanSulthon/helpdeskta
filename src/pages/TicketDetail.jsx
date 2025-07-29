// pages/student/TicketDetail.jsx - UPDATED to properly display attachments
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getTicketDetailAPI,
  updateTicketStatusAPI,
  deleteTicketAPI,
  getChatMessagesAPI,
  getNotificationsAPI,
  markNotificationAsReadAPI,
  showAnonymousTokenAPI,
} from '../services/api';
import Navigation from '../components/Navigation';
import { ToastContainer } from '../components/Toast';

const DetailTicket = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newFeedbackCount, setNewFeedbackCount] = useState(0);
  const [totalFeedbackCount, setTotalFeedbackCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenPassword, setTokenPassword] = useState('');
  const [isRevealingToken, setIsRevealingToken] = useState(false);
  const [revealedToken, setRevealedToken] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [tokenTimer, setTokenTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [loadingAdminToken, setLoadingAdminToken] = useState(false);

  useEffect(() => {
    if (ticketId) {
      loadTicketDetail();
      markRelatedNotificationsAsRead(ticketId);
    }
  }, [ticketId, ticketData?.unread, ticketData?.read]);

  useEffect(() => {
    const loadAdminToken = async () => {
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'admin' && ticketData?.anonymous && ticketData?.id) {
        setLoadingAdminToken(true);
        try {
          // Untuk admin, gunakan password dummy karena backend dev bilang gapapa salah
          const result = await showAnonymousTokenAPI(ticketData.id, 'admin123');
          setAdminToken(result.token || 'Token tidak tersedia');
        } catch (error) {
          console.error('Error loading admin token:', error);
          setAdminToken('Gagal memuat token');
        } finally {
          setLoadingAdminToken(false);
        }
      }
    };

    loadAdminToken();
  }, [ticketData?.anonymous, ticketData?.id]);

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    setToasts((prev) => [...prev, newToast]);
  };

  const handleDeleteTicket = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteTicket = async () => {
    if (!ticketData?.id || isDeleting) return;
    try {
      setIsDeleting(true);
      const result = await deleteTicketAPI(ticketData.id);
      if (result.success || result.status === 'success' || result) {
        addToast(
          `Tiket #${ticketData.id} - "${ticketData.title}" berhasil dihapus`,
          'success',
          4000
        );
        setTimeout(() => {
          handleBack();
        }, 1500);
      } else {
        throw new Error('Respons API tidak valid');
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      addToast(
        `Gagal menghapus tiket: ${error.message || 'Terjadi kesalahan tidak diketahui'}`,
        'error',
        5000
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const cancelDeleteTicket = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const loadTicketDetail = async () => {
    if (!ticketId) return;
    try {
      setLoading(true);
      setError('');
      const data = await getTicketDetailAPI(ticketId);

      const transformedData = {
        id: data.id || 'Tidak tersedia',
        title: data.judul || data.title || 'Judul tidak tersedia',
        submitter:
          data.anonymous === true
            ? 'Anonim'
            : data.nama || data.name || 'Tidak diketahui',
        email: data.email || 'tidak diketahui',
        date: formatDate(data.created_at),
        status: mapStatus(data.status),
        lastUpdate: formatDate(data.updated_at || data.created_at),
        description:
          data.deskripsi || data.description || 'Deskripsi tidak tersedia',
        // UPDATED: Process attachments properly
        attachments: processAttachments(data.attachments || []),
        category: data.category?.name || 'Umum',
        subCategory: data.sub_category?.name || 'Umum',
        rawStatus: data.status,
        priority: data.priority || 'medium',
        assignedTo: data.assigned_to || null,
        readByAdmin: data.read_by_admin === true || data.read_by_admin === 1,
        readByDisposisi:
          data.read_by_disposisi === true || data.read_by_disposisi === 1,
        readByStudent:
          data.read_by_student === true || data.read_by_student === 1,
        nim: data.nim || '',
        prodi: data.prodi || '',
        semester: data.semester ? data.semester.toString() : '',
        noHp: data.no_hp || '',
        anonymous: data.anonymous === true || data.anonymous === 1,
      };

      setTicketData(transformedData);
      setTotalFeedbackCount(data.chat_count || 0);
      setNewFeedbackCount(data.unread_chat_count || 0);
    } catch (error) {
      console.error('Error loading ticket detail:', error);
      setError(error.message || 'Gagal memuat detail tiket');
    } finally {
      setLoading(false);
    }
  };

  const processAttachments = (attachments) => {
    if (!Array.isArray(attachments)) {
      return [];
    }

    return attachments.map((attachment) => {
      // Handle different possible response structures
      const processedAttachment = {
        id: attachment.id,
        file_name:
          attachment.file_name || attachment.filename || 'Unknown file',
        file_type:
          attachment.file_type ||
          attachment.mime_type ||
          attachment.type ||
          'unknown',
        file_url:
          attachment.file_url || attachment.url || attachment.path || '',
        file_size: attachment.file_size || attachment.size || null,
      };
      return processedAttachment;
    });
  };

  const markRelatedNotificationsAsRead = async (ticketId) => {
    try {
      const result = await getNotificationsAPI({ read: false, per_page: 100 });
      const notifications = result.notifications?.data || result.data || [];

      const relatedNotifications = notifications.filter(
        (notif) => notif.ticket_id === ticketId && notif.type === 'new_ticket'
      );

      for (const notification of relatedNotifications) {
        try {
          await markNotificationAsReadAPI(notification.id);
        } catch (err) {
          console.error('Error marking notification as read:', err);
        }
      }
    } catch (error) {
      console.error('Error marking related notifications as read:', error);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Tanggal tidak tersedia';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const dateOnly = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const nowOnly = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const diffTime = nowOnly.getTime() - dateOnly.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      const fullDate = date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const timeString = date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });

      if (diffDays === 0) {
        return `${fullDate}, ${timeString} (Hari ini)`;
      } else if (diffDays === 1) {
        return `${fullDate}, ${timeString} (Kemarin)`;
      } else {
        return `${fullDate}, ${timeString}`;
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Tanggal tidak valid';
    }
  };

  // Helper function to map API status
  const mapStatus = (status) => {
    if (!status) return 'Baru';
    switch (status.toLowerCase()) {
      case 'pending':
      case 'new':
      case 'open':
        return 'Baru';
      case 'in_progress':
      case 'processing':
      case 'assigned':
        return 'Diproses';
      case 'completed':
      case 'resolved':
      case 'closed':
        return 'Selesai';
      default:
        return 'Baru';
    }
  };

  const handleBack = () => {
    const userRole = localStorage.getItem('userRole') || 'student';
    if (userRole === 'admin') {
      navigate('/admin/tickets');
    } else {
      navigate('/student/tickets');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!ticketData?.id || isUpdatingStatus) return;
    try {
      setIsUpdatingStatus(true);
      await updateTicketStatusAPI(ticketData.id, newStatus);
      setTicketData((prev) => ({
        ...prev,
        status: newStatus,
        rawStatus: newStatus,
      }));
      const statusMessage =
        newStatus === 'in_progress' ? 'Diproses' : 'Selesai';
      addToast(
        `Status tiket berhasil diubah menjadi "${statusMessage}"`,
        'success',
        4000
      );
      setTimeout(() => {
        loadTicketDetail();
      }, 1000);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      addToast('Gagal mengubah status tiket: ' + error.message, 'error', 5000);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const renderStatusButton = () => {
    if (!ticketData) return null;
    const currentStatus = ticketData.rawStatus || ticketData.status;

    if (
      currentStatus === 'in_progress' ||
      currentStatus === 'processing' ||
      currentStatus === 'assigned'
    ) {
      return (
        <button
          onClick={() => handleUpdateStatus('closed')}
          disabled={isUpdatingStatus}
          className={`flex items-center gap-2 px-4 py-2 hover:scale-105 transition-all duration-300 border border-gray-500 rounded-md shadow-xl text-sm font-medium ${
            isUpdatingStatus
              ? 'bg-gray-400 cursor-not-allowed opacity-50'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isUpdatingStatus ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Mengubah...</span>
            </>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 0.75C12.6581 0.75 15.053 1.88432 16.7432 3.69238C13.6407 6.0346 11.448 8.70968 10.2109 10.4375C9.55016 9.6939 8.67362 8.83111 7.65723 8.13965L7.375 7.95508L6.72559 7.54492L6.0918 7.14355L5.69141 7.77734L4.86914 9.07812L4.4668 9.71289L5.10254 10.1133L5.75293 10.5225V10.5234C6.64925 11.0906 7.46809 11.9096 8.07617 12.6133C8.66489 13.2946 9.02617 13.8326 9.03711 13.8486L9.05078 13.8701L9.06641 13.8896L9.32617 14.2344L9.55078 14.5332H11.2246L11.4395 14.1523L11.6592 13.7637C11.6592 13.7637 12.3233 12.6082 13.5947 11.0205C14.7407 9.58947 16.3698 7.82006 18.4395 6.22949C18.9586 7.38242 19.25 8.65681 19.25 10C19.25 15.0996 15.0996 19.25 10 19.25C4.90037 19.25 0.75 15.0996 0.75 10C0.750186 4.90035 4.90037 0.75 10 0.75Z"
                  fill="white"
                  stroke="white"
                  strokeWidth="1.5"
                />
              </svg>
              <span>Tandai "Selesai"</span>
            </>
          )}
        </button>
      );
    }

    if (
      currentStatus === 'closed' ||
      currentStatus === 'completed' ||
      currentStatus === 'resolved'
    ) {
      return (
        <button
          onClick={() => handleUpdateStatus('in_progress')}
          disabled={isUpdatingStatus}
          className={`flex items-center gap-2 px-4 py-2 hover:scale-105 transition-all duration-300 border border-gray-500 rounded-md shadow-xl text-sm font-medium ${
            isUpdatingStatus
              ? 'bg-gray-400 cursor-not-allowed opacity-50'
              : 'bg-orange-400 hover:bg-orange-600 text-white'
          }`}
        >
          {isUpdatingStatus ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Mengubah...</span>
            </>
          ) : (
            <>
              <svg
                width="24"
                height="20"
                viewBox="0 0 24 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19.4092 7.38086C21.7593 8.52498 23.25 10.5925 23.25 12.8574C23.2499 14.1885 22.7409 15.4344 21.8477 16.4756L21.5479 16.8252L21.7236 17.25C22.0415 18.02 22.4653 18.7004 22.8018 19.1807C21.8379 19.0305 21.0144 18.6514 20.3682 18.248L20.0029 18.0195L19.6221 18.2197C18.3894 18.8678 16.9213 19.25 15.333 19.25C12.5831 19.2499 10.2094 18.1196 8.80078 16.4609C14.4682 16.3998 19.2637 12.4717 19.4092 7.38086ZM8.66699 0.75C13.1822 0.750144 16.5828 3.73976 16.583 7.14258C16.583 10.5455 13.1824 13.536 8.66699 13.5361C7.0801 13.5361 5.6109 13.15 4.37598 12.5049L3.99609 12.3066L3.63184 12.5332C2.98533 12.9367 2.16169 13.3167 1.19727 13.4668C1.53383 12.986 1.95825 12.3052 2.27637 11.5371L2.45215 11.1123L2.15332 10.7627C1.25849 9.71566 0.75 8.47315 0.75 7.14258C0.750186 3.73968 4.15157 0.75 8.66699 0.75ZM0.651367 14.1826L0.649414 14.1807C0.656513 14.1726 0.666326 14.1611 0.678711 14.1465C0.670118 14.1586 0.661652 14.1711 0.651367 14.1826Z"
                  fill="white"
                  stroke="white"
                  strokeWidth="1.5"
                />
              </svg>
              <span>Tandai "Diproses"</span>
            </>
          )}
        </button>
      );
    }

    if (
      currentStatus === 'new' ||
      currentStatus === 'open' ||
      currentStatus === 'pending'
    ) {
      return (
        <button
          onClick={() => handleUpdateStatus('in_progress')}
          disabled={isUpdatingStatus}
          className={`flex items-center gap-2 px-4 py-2 hover:scale-105 transition-all duration-300 border border-gray-500 rounded-md shadow-xl text-sm font-medium ${
            isUpdatingStatus
              ? 'bg-gray-400 cursor-not-allowed opacity-50'
              : 'bg-orange-400 hover:bg-orange-600 text-white'
          }`}
        >
          {isUpdatingStatus ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Mengubah...</span>
            </>
          ) : (
            <>
              <svg
                width="24"
                height="20"
                viewBox="0 0 24 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19.4092 7.38086C21.7593 8.52498 23.25 10.5925 23.25 12.8574C23.2499 14.1885 22.7409 15.4344 21.8477 16.4756L21.5479 16.8252L21.7236 17.25C22.0415 18.02 22.4653 18.7004 22.8018 19.1807C21.8379 19.0305 21.0144 18.6514 20.3682 18.248L20.0029 18.0195L19.6221 18.2197C18.3894 18.8678 16.9213 19.25 15.333 19.25C12.5831 19.2499 10.2094 18.1196 8.80078 16.4609C14.4682 16.3998 19.2637 12.4717 19.4092 7.38086ZM8.66699 0.75C13.1822 0.750144 16.5828 3.73976 16.583 7.14258C16.583 10.5455 13.1824 13.536 8.66699 13.5361C7.0801 13.5361 5.6109 13.15 4.37598 12.5049L3.99609 12.3066L3.63184 12.5332C2.98533 12.9367 2.16169 13.3167 1.19727 13.4668C1.53383 12.986 1.95825 12.3052 2.27637 11.5371L2.45215 11.1123L2.15332 10.7627C1.25849 9.71566 0.75 8.47315 0.75 7.14258C0.750186 3.73968 4.15157 0.75 8.66699 0.75ZM0.651367 14.1826L0.649414 14.1807C0.656513 14.1726 0.666326 14.1611 0.678711 14.1465C0.670118 14.1586 0.661652 14.1711 0.651367 14.1826Z"
                  fill="white"
                  stroke="white"
                  strokeWidth="1.5"
                />
              </svg>
              <span>Tandai "Diproses"</span>
            </>
          )}
        </button>
      );
    }

    return null;
  };

  const handleFeedback = (e) => {
    e.stopPropagation();
    const currentUserRole = localStorage.getItem('userRole');
    navigate(`/ticket/${ticketId}/feedback`);
  };

  const handleEmailDisposition = () => {
    navigate('/admin/emails', {
      state: {
        from: `/ticket/${ticketId}`,
        ticketId: ticketId,
        ticketTitle: ticketData?.title,
      },
    });
  };

  // Update handler untuk reveal token dengan logic yang lebih clear
  const handleRevealToken = async () => {
    if (!tokenPassword.trim()) {
      setTokenError('Password wajib diisi');
      return;
    }

    setIsRevealingToken(true);
    setTokenError('');

    try {
      const userRole = localStorage.getItem('userRole');

      const result = await showAnonymousTokenAPI(ticketId, tokenPassword);
      const token = result.token || 'Token tidak tersedia';
      setRevealedToken(String(token));

      if (userRole === 'student') {
        // Set timer 10 detik untuk mahasiswa
        setTimeLeft(10);
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setRevealedToken('');
              setTokenTimer(null);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        setTokenTimer(timer);
      }
      // Untuk admin, tidak ada timer - token akan tetap tampil

      setShowTokenModal(false);
      setTokenPassword('');
    } catch (error) {
      console.error('Error revealing token:', error);
      setTokenError(error.message || 'Gagal menampilkan token');
    } finally {
      setIsRevealingToken(false);
    }
  };

  // Update handler untuk copy token (support both student dan admin)
  const handleCopyToken = async (tokenValue = null) => {
    const tokenToCopy = tokenValue || revealedToken;

    // Pastikan tokenToCopy adalah string, bukan object
    const finalToken =
      typeof tokenToCopy === 'string' ? tokenToCopy : String(tokenToCopy);

    try {
      await navigator.clipboard.writeText(finalToken);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy token:', error);
      // Fallback untuk browser yang tidak support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = finalToken;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Handler untuk hide token (manual atau otomatis)
  const handleHideToken = () => {
    if (tokenTimer) {
      clearInterval(tokenTimer);
      setTokenTimer(null);
    }
    setRevealedToken('');
    setTimeLeft(0);
    setCopySuccess(false);
  };

  // Update cancelTokenModal untuk clear timer
  const cancelTokenModal = () => {
    if (!isRevealingToken) {
      setShowTokenModal(false);
      setTokenPassword('');
      setTokenError('');
    }
  };

  // Cleanup timer saat component unmount
  useEffect(() => {
    return () => {
      if (tokenTimer) {
        clearInterval(tokenTimer);
      }
    };
  }, [tokenTimer]);

  // UPDATED: Handle attachment download/view
  const handleDownloadAttachment = (attachment) => {
    if (!attachment.file_url) {
      addToast('URL file tidak tersedia', 'error', 3000);
      return;
    }

    try {
      // For images, open in new tab for preview
      if (attachment.file_type && attachment.file_type.startsWith('image/')) {
        window.open(attachment.file_url, '_blank');
      } else {
        // For other files, trigger download
        const link = document.createElement('a');
        link.href = attachment.file_url;
        link.download = attachment.file_name || 'download';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading attachment:', error);
      addToast('Gagal membuka file', 'error', 3000);
    }
  };

  // UPDATED: Get file icon based on type
  const getFileIcon = (fileType) => {
    if (!fileType) {
      return (
        <svg
          className="w-6 h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    }

    if (fileType.startsWith('image/')) {
      return (
        <svg
          className="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    }

    if (fileType === 'application/pdf') {
      return (
        <svg
          className="w-6 h-6 text-red-600"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M13 9h5.5L13 3.5zM6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m4.93 10.44c.41.9.93 1.64 1.53 2.15l.41.32c-.87.16-2.07.44-3.34.93l-.11.04l.5-1.04c.45-.87.78-1.66 1.01-2.4m6.48 3.81c.18-.18.27-.41.28-.66c.03-.2-.02-.39-.12-.55c-.29-.47-1.04-.69-2.28-.69l-1.29.07l-.87-.58c-.63-.52-1.2-1.43-1.6-2.56l.04-.14c.33-1.33.64-2.94-.02-3.6a.85.85 0 0 0-.61-.24h-.24c-.37 0-.7.39-.79.77c-.37 1.33-.15 2.06.22 3.27v.01c-.25.88-.57 1.9-1.08 2.93l-.96 1.8l-.89.49c-1.2.75-1.77 1.59-1.88 2.12c-.04.19-.02.36.05.54l.03.05l.48.31l.44.11c.81 0 1.73-.95 2.97-3.07l.18-.07c1.03-.33 2.31-.56 4.03-.75c1.03.51 2.24.74 3 .74c.44 0 .74-.11.91-.3m-.41-.71l.09.11c-.01.1-.04.11-.09.13h-.04l-.19.02c-.46 0-1.17-.19-1.9-.51c.09-.1.13-.1.23-.1c1.4 0 1.8.25 1.9.35M7.83 17c-.65 1.19-1.24 1.85-1.69 2c.05-.38.5-1.04 1.21-1.69zm3.02-6.91c-.23-.9-.24-1.63-.07-2.05l.07-.12l.15.05c.17.24.19.56.09 1.1l-.03.16l-.16.82z" />
        </svg>
      );
    }

    return (
      <svg
        className="w-6 h-6 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail tiket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow h-auto`}>
      {/* Header Buttons Row */}
      <Navigation topOffset="">
        <div className="mx-auto">
          <div className="flex items-center space-x-3">
            {/* Back Arrow */}
            <button
              onClick={handleBack}
              className="p-2 pl-3 mr-2 hover:bg-gray-100 rounded transition-all hover:shadow-xl hover:scale-105 duration-300"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 10H18M2 10L10 2M2 10L10 18"
                  stroke="#444746"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Ticket Detail Button */}
            <button className="flex items-center gap-2 px-4 py-2 hover:scale-105 transition-all duration-300 bg-[#f8caca] text-[#333333] border border-gray-500 rounded-md shadow-xl text-sm font-medium">
              <svg
                width="22"
                height="20"
                viewBox="0 0 22 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.2002 0.5H19.7998C20.249 0.5 20.6808 0.680504 21 1.00293C21.3194 1.32553 21.5 1.76428 21.5 2.22266V17.7773C21.5 18.2357 21.3194 18.6745 21 18.9971C20.6808 19.3195 20.249 19.5 19.7998 19.5H2.2002C1.75096 19.5 1.31921 19.3195 1 18.9971C0.680624 18.6745 0.5 18.2357 0.5 17.7773V2.22266C0.5 1.76428 0.680624 1.32553 1 1.00293C1.31921 0.680505 1.75096 0.5 2.2002 0.5ZM2.7998 16.0557H10.4004V12.833H2.7998V16.0557ZM2.7998 11.6113H19.2002V8.38867H2.7998V11.6113ZM2.7998 7.16699H19.2002V3.94434H2.7998V7.16699Z"
                  fill="#333333"
                  stroke="#333333"
                />
              </svg>
              <span>Ticket Detail</span>
            </button>

            {/* Feedback Button */}
            <button
              onClick={handleFeedback}
              className={`flex items-center gap-2 px-4 py-2 hover:scale-105 transition-all duration-300 border border-gray-500 rounded-md shadow-xl text-sm font-medium ${
                newFeedbackCount > 0
                  ? 'bg-yellow-600 border-yellow-700 hover:bg-yellow-700 text-white'
                  : 'bg-white hover:bg-[#f8caca] text-[#333333]'
              }`}
            >
              <svg
                width="24"
                height="20"
                viewBox="0 0 24 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19.4092 7.38086C21.7593 8.52498 23.25 10.5925 23.25 12.8574C23.2499 14.1885 22.7409 15.4344 21.8477 16.4756L21.5479 16.8252L21.7236 17.25C22.0415 18.02 22.4653 18.7004 22.8018 19.1807C21.8379 19.0305 21.0144 18.6514 20.3682 18.248L20.0029 18.0195L19.6221 18.2197C18.3894 18.8678 16.9213 19.25 15.333 19.25C12.5831 19.2499 10.2094 18.1196 8.80078 16.4609C14.4682 16.3998 19.2637 12.4717 19.4092 7.38086ZM8.66699 0.75C13.1822 0.750144 16.5828 3.73976 16.583 7.14258C16.583 10.5455 13.1824 13.536 8.66699 13.5361C7.0801 13.5361 5.6109 13.15 4.37598 12.5049L3.99609 12.3066L3.63184 12.5332C2.98533 12.9367 2.16169 13.3167 1.19727 13.4668C1.53383 12.986 1.95825 12.3052 2.27637 11.5371L2.45215 11.1123L2.15332 10.7627C1.25849 9.71566 0.75 8.47315 0.75 7.14258C0.750186 3.73968 4.15157 0.75 8.66699 0.75ZM0.651367 14.1826L0.649414 14.1807C0.656513 14.1726 0.666326 14.1611 0.678711 14.1465C0.670118 14.1586 0.661652 14.1711 0.651367 14.1826Z"
                  stroke="#444746"
                  strokeWidth="1.5"
                />
              </svg>
              <span
                className={`${newFeedbackCount > 0 ? 'text-white' : 'text-[#333333]'}`}
              >
                Feedback ({totalFeedbackCount}
                {newFeedbackCount > 0 ? `/${newFeedbackCount} baru` : ''})
              </span>
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={handleEmailDisposition}
                  className="flex items-center gap-2 px-4 py-2 hover:scale-105 transition-all duration-300 bg-white hover:bg-[#f8caca] text-[#333333] border border-gray-500 rounded-md shadow-xl text-sm font-medium"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      y="0.5"
                      width="20"
                      height="19"
                      fill="url(#pattern0_3370_21679)"
                    />
                    <defs>
                      <pattern
                        id="pattern0_3370_21679"
                        patternContentUnits="objectBoundingBox"
                        width="1"
                        height="1"
                      >
                        <use
                          xlinkHref="#image0_3370_21679"
                          transform="matrix(0.0416667 0 0 0.0438596 0 -0.00438596)"
                        />
                      </pattern>
                      <image
                        id="image0_3370_21679"
                        width="24"
                        height="23"
                        preserveAspectRatio="none"
                        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAXCAYAAAARIY8tAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAANMSURBVHgBtVVbaxNBGD2zl2a7uWpb02rVaMU+eAFF8UGE+qYiKL4pCPqkP8E3BVHxB1gEBRFBX/VB9EG8teKDiIogglqtCq2mNEmTNJvsZsZvJrspMYm0VT92spnbOfOdMzPL0Cask/dSrqe9AkQCi4vH1at7dmvtej0Pqb8AB5icD2j4z2G06/AS3WCeaGrv7g3D7Ghcl64zJPsjDW1M0/Diyh8IZAitmcCKGAh3kXKM1dvMDh39G5Y2jX0hM0ieff+IYIZAP0JI6QCuKrV6jUn+F+DlIipf3sCO7gALdWI+odG8oQBPPlxhMYHfwOWbmTbgVrCQMNRcJpGFyjlmadg3GGGxkIa3k2U8GysqroAEYkH45IGc4INvTIZw5/hqlnOqGM+4OLc3iYsP06oEwPlcGc73Agnv1kGkB3bEbAAWvr4G6S3RmWy4frgfo5+LOHrzuxpweGsClw8tx+jYLEY/FRRJpeRiNlOSuTcQ5Kadlhlovui0egurEiYuP59WdVluvcyqQRuSHRCcg1erWGgYQtTkCVyNhfTa7qHCCVTKlSA/RJVGcDFvD7xsNmUPnviswV/teMYTEmznGlt6ogA3UVZxS8fIx4Kqq/Z5EFSzGZTGx2EdOJKq7SIquaLLLj5I4/z+XsTppOZKHo5sW4Lhp1MY+ZCXh0MNZJUStEKGcg/VAYWhY+KrCUZbmKW/QY9EgeQ6dQ8ZgRwy/eGRKWQKHnYN2IiTLBfuT2L4SboOLjNVIM4szZzzQ9CpLo45sGwTof611Dd3QbD4qbciACDJ6YjRwzn87ev7EchD728PUA6vgIgtUwBafhom4VmbtkCzLDSb7IksuZwQCpyzwEgRgHJfQ58wvGo5etZvRvr5a3BaqbVuAHpPb1s/DM2rbvGAlEzKUzlRY/7dkFaeOF131H8xuDCXdSHU3YWVh/ahlMnSmZgBr8zSNWLJK7SJgLViTZ25e4zSudaqT4/1oKNvTb1edengTU2hlHfAwgniMBqIWl7X1uD2NtQtCE0T0b4+2N0uCpM/UXY4eRGjjhr0P/uiSaL4yhWILo3SLstCOPJq4a0J6GuUxSKjc0kCXQOr0Wkz8Jn0l7ZCDNz4cdA02OI/+hSOVbz9C4xGk2NU1HE+AAAAAElFTkSuQmCC"
                      />
                    </defs>
                  </svg>
                  <span>Disposisi (Email)</span>
                </button>
                {renderStatusButton()}
              </>
            )}

            {isAdmin && (
              <>
                <div className="flex-1 flex justify-end">
                  <button
                    onClick={handleDeleteTicket}
                    className="p-2 hover:bg-red-100 rounded transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <svg
                      width="16"
                      height="20"
                      viewBox="0 0 16 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.6504 0.349609V1.46094H15.6504V2.9834H14.6504V17.7773C14.6504 18.3062 14.4833 18.746 14.1523 19.1143C13.8228 19.4808 13.4441 19.651 13 19.6504H3C2.55614 19.6504 2.17835 19.4796 1.84863 19.1133C1.5179 18.7458 1.35019 18.3072 1.34961 17.7773V2.9834H0.349609V1.46094H5.34961V0.349609H10.6504ZM2.65039 18.1279H13.3496V2.9834H2.65039V18.1279ZM10.6504 5.90527V15.2051H9.34961V5.90527H10.6504ZM6.65039 5.90527V15.2051H5.34961V5.90527H6.65039Z"
                        fill="#444746"
                        stroke="#444746"
                        strokeWidth="0.7"
                      />
                    </svg>
                  </button>
                </div>
              </>
            )}
            {!isAdmin && <div className="flex-1"></div>}
          </div>
        </div>
      </Navigation>

      <div className="relative">
        <div
          className={`absolute left-[20px] top-0 bottom-0 w-2 ${
            ticketData.status === 'Baru'
              ? 'bg-[#607D8B]'
              : ticketData.status === 'Diproses'
                ? 'bg-[#FF8C00]'
                : ticketData.status === 'Selesai'
                  ? 'bg-[#228B22]'
                  : 'bg-[#607D8B]'
          }`}
        ></div>

        {/* Main Container */}
        <div className="px-8 pt-4 pb-6 space-y-6 pl-[50px]">
          {/* 1. Ticket Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {ticketData.title}
            </h1>
          </div>

          {/* 2. Submitter Information Section */}
          <div className="rounded-lg">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {/* User Info */}
              <div>
                <div className="font-semibold text-blue-900 text-md">
                  {ticketData.submitter}
                </div>
                <div className="text-sm text-black font-semibold">
                  {ticketData.email}
                </div>
              </div>
            </div>

            {/* 3. Ticket Information Row */}
            <div className="flex justify-between items-start">
              {/* Left Side */}
              <div className="space-y-3 pt-2">
                {/* Ticket ID */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-black font-semibold px-2 py-1">
                    #{ticketData.id}
                  </span>

                  {/* Created Date */}
                  <div className="text-sm text-black relative group flex items-center space-x-2">
                    <div className="relative flex items-center group">
                      <svg
                        viewBox="0 0 14 14"
                        className="w-4 h-4 text-black cursor-pointer"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M0 12.6875C0 13.4121 0.671875 14 1.5 14H12.5C13.3281 14 14 13.4121 14 12.6875V5.25H0V12.6875ZM10 7.32813C10 7.14766 10.1687 7 10.375 7H11.625C11.8313 7 12 7.14766 12 7.32813V8.42188C12 8.60234 11.8313 8.75 11.625 8.75H10.375C10.1687 8.75 10 8.60234 10 8.42188V7.32813ZM10 10.8281C10 10.6477 10.1687 10.5 10.375 10.5H11.625C11.8313 10.5 12 10.6477 12 10.8281V11.9219C12 12.1023 11.8313 12.25 11.625 12.25H10.375C10.1687 12.25 10 12.1023 10 11.9219V10.8281ZM6 7.32813C6 7.14766 6.16875 7 6.375 7H7.625C7.83125 7 8 7.14766 8 7.32813V8.42188C8 8.60234 7.83125 8.75 7.625 8.75H6.375C6.16875 8.75 6 8.60234 6 8.42188V7.32813ZM6 10.8281C6 10.6477 6.16875 10.5 6.375 10.5H7.625C7.83125 10.5 8 10.6477 8 10.8281V11.9219C8 12.1023 7.83125 12.25 7.625 12.25H6.375C6.16875 12.25 6 12.1023 6 11.9219V10.8281ZM2 7.32813C2 7.14766 2.16875 7 2.375 7H3.625C3.83125 7 4 7.14766 4 7.32813V8.42188C8 8.60234 3.83125 8.75 3.625 8.75H2.375C2.16875 8.75 2 8.60234 2 8.42188V7.32813ZM2 10.8281C2 10.6477 2.16875 10.5 2.375 10.5H3.625C3.83125 10.5 4 10.6477 4 10.8281V11.9219C4 12.1023 3.83125 12.25 3.625 12.25H2.375C2.16875 12.25 2 12.1023 2 11.9219V10.8281ZM12.5 1.75H11V0.4375C11 0.196875 10.775 0 10.5 0H9.5C9.225 0 9 0.196875 9 0.4375V1.75H5V0.4375C5 0.196875 4.775 0 4.5 0H3.5C3.225 0 3 0.196875 3 0.4375V1.75H1.5C0.671875 1.75 0 2.33789 0 3.0625V4.375H14V3.0625C14 2.33789 13.3281 1.75 12.5 1.75Z" />
                      </svg>
                      <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                        Tanggal Dibuat
                      </div>
                    </div>
                    <span>{ticketData.date}</span>
                  </div>

                  {/* Category */}
                  <div className="flex items-center space-x-1 relative group">
                    <div className="relative flex items-center group ml-2">
                      <svg
                        className="w-5 h-5 text-black cursor-pointer"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                      <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                        Kategori
                      </div>
                    </div>
                    <span className="text-sm text-black">
                      {ticketData.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side - Last Update */}
              <div className="text-right">
                <div className="text-sm text-black font-semibold">
                  Last Update:{' '}
                  <span className="font-light text-black">
                    {ticketData.lastUpdate}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Description */}
          <div>
            <p className="text-black leading-relaxed whitespace-pre-wrap text-justify">
              {ticketData.description}
            </p>
          </div>

          {/* 5. UPDATED Attachments Section */}
          {ticketData.attachments && ticketData.attachments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Lampiran ({ticketData.attachments.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ticketData.attachments.map((attachment, index) => (
                  <div
                    key={attachment.id || index}
                    className="group border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                    onClick={() => handleDownloadAttachment(attachment)}
                  >
                    {/* File Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* File Icon */}
                        <div className="flex-shrink-0">
                          {getFileIcon(attachment.file_type)}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700">
                            {attachment.file_name || 'File Attachment'}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {attachment.file_type
                              ?.split('/')[1]
                              ?.toUpperCase() || 'Unknown'}
                            {attachment.file_size && (
                              <span>
                                {' '}
                                • {formatFileSize(attachment.file_size)}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Download Icon */}
                      <div className="flex-shrink-0 ml-2">
                        <svg
                          className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Image Preview for image files */}
                    {attachment.file_type &&
                      attachment.file_type.startsWith('image/') &&
                      attachment.file_url && (
                        <div className="mt-3">
                          <div className="relative overflow-hidden rounded-lg bg-gray-100">
                            <img
                              src={attachment.file_url}
                              alt={attachment.file_name}
                              className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="hidden w-full h-32 items-center justify-center bg-gray-100 text-gray-500 text-sm">
                              Preview tidak tersedia
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Action Text */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-600 group-hover:text-blue-600 font-medium">
                        {attachment.file_type &&
                        attachment.file_type.startsWith('image/')
                          ? 'Klik untuk melihat gambar'
                          : 'Klik untuk mengunduh file'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* 4. Anonymous Report Section */}
          {ticketData.anonymous && (
            <>
              {/* Tampilan untuk Mahasiswa */}
              {localStorage.getItem('userRole') === 'student' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-purple-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-purple-600 font-medium text-sm">
                      Laporan Anonim:
                    </span>
                    <span className="text-purple-800 text-sm">
                      Identitas Anda tidak ditampilkan dalam laporan ini untuk
                      menjaga privasi.
                    </span>
                  </div>

                  {/* Token Rahasia Section untuk Mahasiswa */}
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-purple-600 font-medium text-sm">
                          Token Rahasia
                        </span>
                        <p className="text-purple-700 text-xs mt-1">
                          Token ini diperlukan jika Anda ingin verifikasi tiket
                          secara langsung dengan admin
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {revealedToken ? (
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <span className="bg-purple-100 px-3 py-1 rounded text-purple-800 font-mono text-sm border">
                                {revealedToken}
                              </span>
                              {/* Timer indicator untuk mahasiswa */}
                              {timeLeft > 0 && (
                                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                  {timeLeft}
                                </div>
                              )}
                            </div>

                            {/* Copy Button */}
                            <button
                              onClick={() => handleCopyToken(revealedToken)}
                              className={`px-2 py-1 rounded text-xs transition-all ${
                                copySuccess
                                  ? 'bg-green-100 text-green-700 border border-green-300'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
                              }`}
                              title="Copy token"
                            >
                              {copySuccess ? (
                                <div className="flex items-center gap-1">
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Copied!
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                  </svg>
                                  Copy
                                </div>
                              )}
                            </button>

                            {/* Hide Button untuk student jika masih ada waktu */}
                            {timeLeft > 0 && (
                              <button
                                onClick={handleHideToken}
                                className="text-purple-600 hover:text-purple-800 text-xs px-2 py-1 hover:bg-purple-50 rounded transition-colors"
                              >
                                Sembunyikan
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowTokenModal(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Lihat
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Timer warning untuk mahasiswa */}
                    {revealedToken && timeLeft > 0 && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                        <div className="flex items-center gap-1 text-yellow-700">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="font-medium">
                            Token akan hilang dalam {timeLeft} detik. Segera
                            copy jika diperlukan!
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tampilan untuk Admin */}
              {localStorage.getItem('userRole') === 'admin' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-orange-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-orange-700 font-semibold text-base">
                      📋 Panduan Verifikasi Tiket Anonymous
                    </span>
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <p className="text-orange-800 text-sm mb-3">
                      Jika mahasiswa datang untuk verifikasi tiket ini, minta
                      mereka menyebutkan:
                    </p>
                  </div>

                  {/* Data List */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start">
                      <span className="text-orange-700 font-medium text-sm min-w-0 w-24">
                        • ID Tiket:
                      </span>
                      <span className="text-orange-800 text-sm font-mono bg-orange-100 px-2 py-0.5 rounded ml-2">
                        {ticketData.id}
                      </span>
                    </div>

                    <div className="flex items-start">
                      <span className="text-orange-700 font-medium text-sm min-w-0 w-24">
                        • Judul:
                      </span>
                      <span className="text-orange-800 text-sm ml-2">
                        {ticketData.title}
                      </span>
                    </div>

                    <div className="flex items-start">
                      <span className="text-orange-700 font-medium text-sm min-w-0 w-24">
                        • NIM:
                      </span>
                      <span className="text-orange-800 text-sm ml-2">
                        {ticketData.nim || 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-start">
                      <span className="text-orange-700 font-medium text-sm min-w-0 w-24">
                        • Token:
                      </span>
                      <div className="flex items-center gap-2 ml-2">
                        {loadingAdminToken ? (
                          <div className="flex items-center gap-2">
                            <svg
                              className="animate-spin h-4 w-4 text-orange-600"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span className="text-orange-700 text-sm">
                              Memuat token...
                            </span>
                          </div>
                        ) : adminToken ? (
                          <>
                            <span className="text-orange-800 text-sm font-mono bg-orange-100 px-2 py-0.5 rounded border">
                              {adminToken}
                            </span>
                            <button
                              onClick={() => handleCopyToken(adminToken)}
                              className={`px-2 py-1 rounded text-xs transition-all ${
                                copySuccess
                                  ? 'bg-green-100 text-green-700 border border-green-300'
                                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300'
                              }`}
                              title="Copy token"
                            >
                              {copySuccess ? (
                                <div className="flex items-center gap-1">
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Copied!
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                  </svg>
                                  Copy
                                </div>
                              )}
                            </button>
                          </>
                        ) : (
                          <span className="text-red-600 text-sm">
                            Gagal memuat token
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Note */}
                  <div className="mt-4 pt-3 border-t border-orange-200">
                    <p className="text-orange-700 text-xs">
                      Semua data harus sesuai untuk memverifikasi ownership
                      tiket
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && ticketData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={cancelDeleteTicket}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-blue-950 px-6 py-4">
              <h3 className="text-white text-xl font-semibold">Hapus Tiket</h3>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-black mb-1 font-normal">
                Apakah anda yakin ingin menghapus tiket berikut?
              </p>

              <p className="text-gray-800 mb-6">
                <span className="font-bold">Judul:</span> {ticketData.title}
              </p>

              {/* Warning Box */}
              <div className="bg-red-100 rounded-lg p-3 mb-6 flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    width="18"
                    height="14"
                    viewBox="0 0 22 17"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.3001 0.882812L20.9342 14.5906C21.0658 14.7997 21.1351 15.0368 21.1351 15.2781C21.1351 15.5195 21.0658 15.7566 20.9342 15.9656C20.8025 16.1747 20.6132 16.3482 20.3851 16.4689C20.1571 16.5896 19.8985 16.6531 19.6352 16.6531H2.36715C2.10385 16.6531 1.84519 16.5896 1.61716 16.4689C1.38914 16.3482 1.19979 16.1747 1.06814 15.9656C0.936492 15.7566 0.867186 15.5195 0.867188 15.2781C0.867189 15.0368 0.936498 14.7997 1.06815 14.5906L9.70215 0.882812C10.2791 -0.0338542 11.7221 -0.0338542 12.3001 0.882812ZM11.0011 11.7471C10.7359 11.7471 10.4816 11.8437 10.294 12.0156C10.1065 12.1875 10.0011 12.4207 10.0011 12.6638C10.0011 12.9069 10.1065 13.1401 10.294 13.312C10.4816 13.4839 10.7359 13.5805 11.0011 13.5805C11.2664 13.5805 11.5207 13.4839 11.7083 13.312C11.8958 13.1401 12.0011 12.9069 12.0011 12.6638C12.0011 12.4207 11.8958 12.1875 11.7083 12.0156C11.5207 11.8437 11.2664 11.7471 11.0011 11.7471ZM11.0011 5.33048C10.7562 5.33051 10.5198 5.41294 10.3368 5.56214C10.1537 5.71133 10.0368 5.91692 10.0081 6.1399L10.0011 6.24715V9.91381C10.0014 10.1475 10.099 10.3722 10.274 10.5421C10.449 10.712 10.6881 10.8142 10.9425 10.8279C11.197 10.8416 11.4475 10.7657 11.643 10.6157C11.8384 10.4658 11.964 10.2531 11.9941 10.0211L12.0011 9.91381V6.24715C12.0011 6.00403 11.8958 5.77087 11.7083 5.59897C11.5207 5.42706 11.2664 5.33048 11.0011 5.33048Z"
                      fill="#E01A3F"
                    />
                  </svg>
                </div>

                <div className="flex-1">
                  <p className="text-[#E01A3F] font-medium text-xs">
                    <span className="font-bold">Peringatan:</span> Tiket akan
                    dihapus secara permanen dan tidak dapat dikembalikan.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDeleteTicket}
                  disabled={isDeleting}
                  className="px-6 py-2 bg-gray-300 text-white rounded-lg hover:bg-white hover:text-gray-600 border-2 border-gray-300 transition-all duration-300 hover:scale-105 flex items-center space-x-2 font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDeleteTicket}
                  disabled={isDeleting}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-white hover:text-red-600 border-2 border-red-600 transition-all duration-300 hover:scale-105 flex items-center space-x-2 font-medium"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <span>Hapus Tiket</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {/* Token Password Verification Modal */}
      {showTokenModal && localStorage.getItem('userRole') === 'student' && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={cancelTokenModal}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Dark theme seperti gambar */}
            <div className="bg-gray-800 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-slate-700"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-white text-lg font-medium">
                  Verifikasi Password
                </h3>
              </div>
            </div>

            {/* Content - White background */}
            <div className="p-6 bg-white">
              <p className="text-gray-700 text-sm mb-6 leading-relaxed">
                Untuk keamanan, silakan masukkan password Anda untuk melihat
                token tiket ini.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={tokenPassword}
                  onChange={(e) => setTokenPassword(e.target.value)}
                  placeholder="Masukkan password Anda"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  disabled={isRevealingToken}
                  onKeyPress={(e) => {
                    if (
                      e.key === 'Enter' &&
                      !isRevealingToken &&
                      tokenPassword.trim()
                    ) {
                      handleRevealToken();
                    }
                  }}
                />
                {tokenError && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {tokenError}
                  </p>
                )}
              </div>

              {/* Buttons - Posisi di sebelah kanan */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelTokenModal}
                  disabled={isRevealingToken}
                  className="px-4 py-3 text-gray-600 hover:border-2 hover:border-gray-600 bg-gray-200 rounded-md hover:bg-white hover:scale-105 duration-300 transition-all hover:shadow-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevealToken}
                  disabled={isRevealingToken || !tokenPassword.trim()}
                  className="px-4 py-3 bg-red-600 text-white rounded-md hover:bg-white hover:text-red-600 hover:scale-105 duration-300 transition-all hover:shadow-lg hover:border-2 hover:border-red-600 font-medium flex items-center gap-2"
                >
                  {isRevealingToken ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Verifikasi...
                    </>
                  ) : (
                    'Verifikasi'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper function to format file size
  function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

export default DetailTicket;
