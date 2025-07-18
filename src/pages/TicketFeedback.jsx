// pages/student/TicketFeedback.jsx - Updated with real API integration
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getChatMessagesAPI,
  sendChatMessageAPI,
  getTicketDetailAPI,
  updateTicketStatusAPI,
  deleteTicketAPI,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import { ToastContainer } from '../components/Toast';

const TicketFeedback = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const { user } = useAuth();
  const [newFeedback, setNewFeedback] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [newFeedbackCount, setNewFeedbackCount] = useState(0);
  const [totalFeedbackCount, setTotalFeedbackCount] = useState(0);
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';

  // Load ticket data and chat messages on mount
  useEffect(() => {
    if (ticketId) {
      loadTicketData();
      loadChatMessages();
    }
  }, [ticketId, ticketData?.unread, ticketData?.read]);

  const loadTicketData = async () => {
    try {
      const data = await getTicketDetailAPI(ticketId);
      setTicketData({
        id: data.id,
        title: data.judul || data.title || 'Judul tidak tersedia',
        status: mapStatus(data.status),
        rawStatus: data.status,
      });
    } catch (error) {
      console.error('Error loading ticket data:', error);
      setError('Gagal memuat data tiket');
    }
  };

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

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleEmailDisposition = () => {
    navigate('/admin/emails', {
      state: {
        from: `/ticket/${ticketId}/feedback`,
        ticketId: ticketId,
        ticketTitle: ticketData?.title || 'Ticket Feedback',
      },
    });
  };

  const handleDeleteTicket = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteTicket = async () => {
    if (!ticketData?.id || isDeleting) return;
    try {
      setIsDeleting(true);
      console.log('Deleting ticket:', ticketData.id);
      const result = await deleteTicketAPI(ticketData.id);
      console.log('Delete result:', result);
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

  const handleUpdateStatus = async (newStatus) => {
    if (!ticketData?.id || isUpdatingStatus) return;
    try {
      setIsUpdatingStatus(true);
      console.log(`Updating ticket ${ticketData.id} status to:`, newStatus);
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
        loadTicketData();
      }, 1000);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      addToast('Gagal mengubah status tiket: ' + error.message, 'error', 5000);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const cancelDeleteTicket = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
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

  const loadChatMessages = async () => {
    try {
      setLoading(true);
      setError('');

      const messages = await getChatMessagesAPI(ticketId);
      // Transform API messages to component format
      const transformedMessages = messages.map((msg) => ({
        id: msg.id,
        author: msg.user?.name || msg.user?.email || 'Unknown User',
        role: msg.user?.role === 'admin' ? 'Admin' : 'Student',
        date: formatDate(msg.created_at),
        message: msg.message,
        isAdmin: msg.user?.role === 'admin',
        userId: msg.user_id,
        isSystemMessage: msg.is_system_message || false,
        attachments: msg.attachments || [],
      }));
      setFeedbacks(transformedMessages);
      setTotalFeedbackCount(transformedMessages.length);
      setNewFeedbackCount(0);
    } catch (error) {
      console.error('Error loading chat messages:', error);
      setError('Gagal memuat pesan feedback: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tanggal tidak tersedia';
    try {
      const date = new Date(dateString);
      const now = new Date();
      // Reset time to 00:00:00 for accurate day comparison
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
      // Format full date
      const fullDate = date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      // Format time
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

  const handleFileSelect = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    // Validasi file
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/pdf',
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      setError('Tipe file tidak diizinkan. Gunakan PNG, JPG, atau PDF.');
      event.target.value = '';
      return;
    }

    if (file.size > maxSize) {
      setError('Ukuran file terlalu besar. Maksimal 10MB.');
      event.target.value = '';
      return;
    }

    setSelectedFile(file);

    // Create preview untuk image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    setError(''); // Clear any previous error
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    // Reset file input
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
  };

  // Tambahkan debug di fungsi handleSendFeedback
  const handleSendFeedback = async () => {
    if (!newFeedback.trim() && !selectedFile) {
      setError('Pesan atau file harus diisi');
      return;
    }

    try {
      setSending(true);
      setError('');

      console.log('Sending feedback message:', {
        message: newFeedback,
        file: selectedFile?.name,
      });

      const messageToSend = newFeedback.trim() || '📎 File attachment';

      // ✅ TAMBAHKAN DEBUG: Capture response dari send message
      const sendResponse = await sendChatMessageAPI(
        ticketId,
        messageToSend,
        selectedFile
      );

      // ✅ DEBUG: Log response lengkap
      console.log('=== SEND MESSAGE RESPONSE ===');
      console.log('Full response:', sendResponse);

      // ✅ DEBUG: Cek apakah ada attachment info di response
      if (sendResponse.attachments) {
        console.log('Attachments in response:', sendResponse.attachments);
        sendResponse.attachments.forEach((attachment, index) => {
          console.log(`Attachment ${index + 1}:`, attachment);
          console.log(`File URL: ${attachment.file_url}`);

          // ✅ TEST: Coba akses link gambar langsung
          fetch(attachment.file_url, { method: 'HEAD' })
            .then((response) => {
              console.log(
                `Link ${attachment.file_url} status:`,
                response.status
              );
              if (response.status === 403) {
                console.error('❌ 403 FORBIDDEN - Backend access issue!');
              } else if (response.status === 200) {
                console.log('✅ Link accessible');
              }
            })
            .catch((error) => {
              console.error('❌ Error accessing link:', error);
            });
        });
      }

      // ✅ DEBUG: Cek struktur message yang baru dibuat
      if (sendResponse.message) {
        console.log('New message created:', sendResponse.message);
        if (sendResponse.message.attachments) {
          console.log('Message attachments:', sendResponse.message.attachments);
        }
      }

      // Clear input and reload messages
      setNewFeedback('');
      handleRemoveFile();

      // ✅ TAMBAHKAN DEBUG: Log reload messages
      console.log('=== RELOADING MESSAGES ===');
      await loadChatMessages();

      console.log('Feedback sent successfully!');
    } catch (error) {
      console.error('Error sending feedback:', error);
      setError('Gagal mengirim feedback: ' + error.message);
    } finally {
      setSending(false);
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

  const handleTicketDetail = () => {
    navigate(`/ticket/${ticketId}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendFeedback();
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow h-auto`}>
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
            <button
              onClick={handleTicketDetail}
              className="flex items-center gap-2 px-4 py-2 hover:scale-105 transition-all duration-300 bg-white hover:bg-[#f8caca] text-[#333333] border border-gray-500 rounded-md shadow-xl text-sm font-medium"
            >
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
            <button className="flex items-center gap-2 px-4 py-2 hover:scale-105 transition-all duration-300 bg-[#f8caca] text-[#333333] border border-gray-500 rounded-md shadow-xl text-sm font-medium">
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
              <span className="text-[#333333]">
                Feedback ({totalFeedbackCount}
                {newFeedbackCount > 0 ? `/${newFeedbackCount} baru` : ''})
              </span>
            </button>

            {isAdmin && (
              <>
                {/* Disposisi Email Button */}
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
                        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAXCAYAAAARIY8tAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAANMSURBVHgBtVVbaxNBGD2zl2a7uWpb02rVaMU+eAFF8UGE+qYiKL4pCPqkP8E3BVHxB1gEBRFBX/VB9EG8teKDiIogglqtCq2mNEmTNJvsZsZvJrspMYm0VT92spnbOfOdMzPL0Cask/dSrqe9AkQCi4vH1at7dmvtej0Pqb8AB5icD2j4z2G06/AS3WCeaGrv7g3D7Ghcl64zJPsjDW1M0/Diyh8IZAitmcCKGAh3kXKM1dvMDh39G5Y2jX0hM0ieff+IYIZAP0JI6QCuKrV6jUn+F+DlIipf3sCO7gALdWI+odG8oQBPPlxhMYHfwOWbmTbgVrCQMNRcJpGFyjlmadg3GGGxkIa3k2U8GysqroAEYkH45IGc4INvTIZw5/hqlnOqGM+4OLc3iYsP06oEwPlcGc73Agnv1kGkB3bEbAAWvr4G6S3RmWy4frgfo5+LOHrzuxpweGsClw8tx+jYLEY/FRRJpeRiNlOSuTcQ5Kadlhlovui0egurEiYuP59WdVluvcyqQRuSHRCcg1erWGgYQtTkCVyNhfTa7qHCCVTKlSA/RJVGcDFvD7xsNmUPnviswV/teMYTEmznGlt6ogA3UVZxS8fIx4Kqq/Z5EFSzGZTGx2EdOJKq7SIquaLLLj5I4/z+XsTppOZKHo5sW4Lhp1MY+ZCXh0MNZJUStEKGcg/VAYWhY+KrCUZbmKW/QY9EgeQ6dQ8ZgRwy/eGRKWQKHnYN2IiTLBfuT2L4SboOLjNVIM4szZzzQ9CpLo45sGwTof611Dd3QbD4qbciACDJ6YjRwzn87ev7EchD728PUA6vgIgtUwBafhom4VmbtkCzLDSb7IksuZwQCpyzwEgRgHJfQ58wvGo5etZvRvr5a3BaqbVuAHpPb1s/DM2rbvGAlEzKUzlRY/7dkFaeOF131H8xuDCXdSHU3YWVh/ahlMnSmZgBr8zSNWLJK7SJgLViTZ25e4zSudaqT4/1oKNvTb1edangTU2hlHfAwgniMBqIWl7X1uD2NtQtCE0T0b4+2N0uCpM/UXY4eRGjjhr0P/uiSaL4yhWILo3SLstCOPJq4a0J6GuUxSKjc0kCXQOr0Wkz8Jn0l7ZCDNz4cdA02OI/+hSOVbz9C4xGk2NU1HE+AAAAAElFTkSuQmCC"
                      />
                    </defs>
                  </svg>
                  <span>Disposisi (Email)</span>
                </button>

                {/* Status Button */}
                {renderStatusButton()}
              </>
            )}

            {isAdmin && (
              <>
                {/* Delete icon on the right */}
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
            ticketData?.status === 'Baru'
              ? 'bg-[#607D8B]'
              : ticketData?.status === 'Diproses'
                ? 'bg-[#FF8C00]'
                : ticketData?.status === 'Selesai'
                  ? 'bg-[#228B22]'
                  : 'bg-[#607D8B]'
          }`}
        ></div>

        {/* Content */}
        <div className="px-8 pt-4 pb-6 space-y-3 pl-[50px]">
          <div>
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {ticketData?.title || 'Loading...'}
            </h1>
          </div>

          {/* Feedback Section */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-600 mt-4 mb-2">
              Feedback
            </h2>

            {/* Container Chat - Scrollable */}
            <div className="bg-white border border-gray-500 rounded-lg h-80 overflow-y-auto mb-6 p-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-gray-600">Memuat feedback...</span>
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-lg font-medium mb-2">Belum ada feedback</p>
                  <p className="text-sm">
                    Jadilah yang pertama memberikan feedback untuk tiket ini!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {feedbacks.map((feedback) => (
                    <div
                      key={feedback.id}
                      className={`flex items-start space-x-4 p-4 rounded-lg ${
                        feedback.isAdmin
                          ? 'bg-blue-50 border border-blue-100'
                          : 'bg-red-50 border border-red-100'
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                          feedback.isAdmin ? 'bg-blue-600' : 'bg-red-600'
                        }`}
                      >
                        {feedback.author.charAt(0).toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-blue-900">
                              {feedback.author}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                feedback.isAdmin
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {feedback.role}
                            </span>
                            {feedback.isSystemMessage && (
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                                System
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {feedback.date}
                          </span>
                        </div>
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {feedback.message}
                        </p>
                        {feedback.attachments &&
                          feedback.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {feedback.attachments.map((attachment, index) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
                                >
                                  {attachment.file_type?.startsWith(
                                    'image/'
                                  ) ? (
                                    <img
                                      src={attachment.file_url}
                                      alt={attachment.file_name}
                                      className="w-16 h-16 object-cover rounded border cursor-pointer"
                                      onClick={() =>
                                        window.open(
                                          attachment.file_url,
                                          '_blank'
                                        )
                                      }
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-blue-100 rounded border flex items-center justify-center">
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
                                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                      </svg>
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">
                                      {attachment.file_name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {attachment.file_type}
                                    </div>
                                  </div>
                                  <a
                                    href={attachment.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    Download
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Isi Feedback Section */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Isi Feedback <span className="text-red-600">*</span>
              </label>
              <div className="bg-white border border-gray-300 rounded-lg">
                <div className="flex items-start space-x-4">
                  {/* Input Area */}
                  <div className="flex-1">
                    <textarea
                      value={newFeedback}
                      onChange={(e) => setNewFeedback(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Berikan feedback untuk mahasiswa..."
                      className="w-full p-3 border-none outline-none resize-none"
                      rows={4}
                      disabled={sending}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Lampiran Section */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-black mb-2">
                Lampiran (opsional) Maksimal 5 MB (.jpg, .png, .pdf)
              </label>
              <div className="bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg">
                {selectedFile ? (
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {filePreview ? (
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="w-12 h-12 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-red-100 rounded border flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-red-600"
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
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {selectedFile.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
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
                  </div>
                ) : (
                  <label
                    htmlFor="file-input"
                    className="block p-8 text-center cursor-pointer hover:bg-gray-200 transition-colors rounded-lg"
                  >
                    <div className="space-y-2">
                      <svg
                        className="w-8 h-8 mx-auto text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <div className="text-gray-600">
                        <span className="font-medium">Klik untuk Upload</span>{' '}
                        atau drag and drop
                      </div>
                      <div className="text-sm text-gray-500">
                        JPG, PNG atau PDF (Maks. 5MB)
                      </div>
                    </div>
                  </label>
                )}
                <input
                  id="file-input"
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={sending}
                />
              </div>
            </div>

            {/* Kirim Laporan Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSendFeedback}
                disabled={(!newFeedback.trim() && !selectedFile) || sending}
                className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 font-medium"
              >
                {sending ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
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
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <span>Kirim Laporan</span>
                )}
              </button>
            </div>
          </div>
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
                  className="px-6 py-2 border-2 border-[#E01A3F] text-[#E01A3F] rounded-lg hover:bg-[#E01A3F] hover:text-white transition-colors disabled:opacity-50 font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDeleteTicket}
                  disabled={isDeleting}
                  className="px-6 py-2 bg-[#E01A3F] text-white rounded-lg hover:bg-[#C41E3A] transition-colors disabled:opacity-50 flex items-center space-x-2 font-medium"
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

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default TicketFeedback;
