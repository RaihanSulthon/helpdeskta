import React, { useState, useEffect } from 'react';
import {
  sendEmailAPI,
  getTicketDetailAPI,
  updateTicketStatusAPI,
  deleteTicketAPI,
} from '../../services/api';
import { ToastContainer } from '../../components/Toast';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../../components/Navigation';

const validators = {
  required: (value, fieldName) => {
    if (!value?.trim()) {
      return `${fieldName} harus diisi`;
    }
    return null;
  },

  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value?.trim())) {
      return 'Format email tidak valid';
    }
    if (value?.includes(' ')) {
      return 'Email tidak boleh mengandung spasi';
    }
    return null;
  },

  minLength: (value, min, fieldName) => {
    if (value?.trim().length < min) {
      return `${fieldName} minimal ${min} karakter`;
    }
    return null;
  },
};

const AdminEmailManagement = () => {
  const [activeTab, setActiveTab] = useState('compose');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ticketData, setTicketData] = useState(null);
  const [newFeedbackCount, setNewFeedbackCount] = useState(0);
  const [totalFeedbackCount, setTotalFeedbackCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';

  // Email form state
  const [emailForm, setEmailForm] = useState({
    to_email: '',
    subject: '',
    body: '',
  });

  const navigate = useNavigate();
  const location = useLocation();
  const ticketInfo = location.state;

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

  useEffect(() => {
    if (location.state?.ticketId) {
      loadTicketDetail();
    }
  }, [location.state?.ticketId]);

  const loadTicketDetail = async () => {
    if (!location.state?.ticketId) return;

    try {
      const data = await getTicketDetailAPI(location.state.ticketId);
      setTicketData({
        id: data.id || 'Tidak tersedia',
        title: data.judul || data.title || 'Judul tidak tersedia',
        status: mapStatus(data.status),
        rawStatus: data.status,
      });

      // Load feedback counts
      setTotalFeedbackCount(data.chat_count || 0);
      setNewFeedbackCount(data.unread_chat_count || 0);
    } catch (error) {
      console.error('Error loading ticket detail:', error);
    }
  };

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      // Default kembali ke admin dashboard
      navigate('/admin/tickets');
    }
  };

  const handleEmailFormChange = (e) => {
    const { name, value } = e.target;
    setEmailForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation using validators
    const validationError =
      validators.required(emailForm.to_email, 'Email tujuan') ||
      validators.email(emailForm.to_email) ||
      validators.required(emailForm.subject, 'Subject') ||
      validators.minLength(emailForm.subject, 3, 'Subject') ||
      validators.required(emailForm.body, 'Isi email') ||
      validators.minLength(emailForm.body, 10, 'Isi email');

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSending(true);
      const result = await sendEmailAPI(emailForm);

      if (result.success) {
        setSuccess(`Email berhasil dikirim ke ${emailForm.to_email}!`);

        // Reset form
        setEmailForm({
          to_email: '',
          subject: '',
          body: '',
        });

        setError('');

        // Auto hide success message after 5 seconds
        setTimeout(() => {
          setSuccess('');
        }, 5000);
      } else {
        setError('Gagal mengirim email: ' + result.message);
      }
    } catch (error) {
      setError('Gagal mengirim email: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleTicketDetail = (e) => {
    e.stopPropagation();
    if (location.state?.ticketId) {
      navigate(`/ticket/${location.state.ticketId}`);
    }
  };

  const handleFeedback = (e) => {
    e.stopPropagation();
    if (location.state?.ticketId) {
      navigate(`/ticket/${location.state.ticketId}/feedback`);
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

  const handleDeleteTicket = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteTicket = async () => {
    if (!ticketData?.id || isDeleting) return;
    try {
      setIsDeleting(true);
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

  return (
    <div className={`bg-white rounded-lg shadow h-auto`}>
      <Navigation topOffset="">
        <div className="mx-aute">
          <div className="flex items-center space-x-3">
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
              className="flex items-center gap-2 px-4 py-2 hover:scale-105 transition-all duration-300 bg-white text-[#333333] border border-gray-500 rounded-md shadow-xl text-sm font-medium"
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
                {/* Email (Disposisi) Button */}
                <button className="flex items-center gap-2 px-4 py-2 hover:scale-105 transition-all duration-300 bg-[#f8caca] hover:bg-[#f8caca] text-[#333333] border border-gray-500 rounded-md shadow-xl text-sm font-medium">
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

        {/* Main Container (All Email Section) */}
        <div className="px-8 pt-4 pb-6 pl-[50px]">
          {ticketData?.title && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {ticketData.title}
              </h1>
            </div>
          )}

          {/* Label Disposisi (Email) */}
          <h2 className="text-sm font-medium text-gray-700">
            Disposisi (Email)
          </h2>

          <div className="border border-blue-400 rounded-lg p-6 bg-white">
            {/* Email Form */}
            <form onSubmit={handleSendEmail} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tujuan <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="to_email"
                  value={emailForm.to_email}
                  onChange={handleEmailFormChange}
                  required
                  placeholder="contoh@telkomuniversity.ac.id"
                  className="w-full px-3 py-2 border-2 border-gray-500 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjek <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={emailForm.subject}
                  onChange={handleEmailFormChange}
                  required
                  placeholder="Masukkan subjek"
                  className="w-full px-3 py-2 border-2 border-gray-500 rounded-lg"
                />
              </div>

              {/* Isi Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Isi Email <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="body"
                  value={emailForm.body}
                  onChange={handleEmailFormChange}
                  required
                  rows={8}
                  placeholder="Ketik isi email"
                  className="w-full px-3 py-2 border-2 border-gray-500 rounded-lg"
                />
              </div>

              {/* Info Box dan Buttons dalam satu baris */}
              <div className="flex items-center justify-between">
                {/* Info section - kiri dengan background biru */}
                <div className="flex items-start space-x-3 bg-blue-50 border border-blue-200 rounded-lg p-4 flex-1 mr-4">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 0.75C12.4533 0.75 14.8063 1.72427 16.541 3.45898C18.2757 5.1937 19.25 7.54675 19.25 10C19.25 12.4533 18.2757 14.8063 16.541 16.541C14.8063 18.2757 12.4533 19.25 10 19.25C7.54675 19.25 5.1937 18.2757 3.45898 16.541C1.72427 14.8063 0.75 12.4533 0.75 10C0.75 7.54675 1.72427 5.1937 3.45898 3.45898C5.1937 1.72427 7.54675 0.75 10 0.75ZM10 4.25C9.46956 4.25 8.96101 4.46087 8.58594 4.83594C8.21087 5.21101 8 5.71957 8 6.25C8 6.78043 8.21087 7.28899 8.58594 7.66406C8.71987 7.798 8.87126 7.91009 9.03418 8H8.75C8.30245 8 7.87311 8.17767 7.55664 8.49414C7.24017 8.81061 7.0625 9.23995 7.0625 9.6875C7.0625 10.1351 7.24017 10.5644 7.55664 10.8809C7.76755 11.0918 8.02938 11.2383 8.3125 11.3145V12.375H7.8125C7.36495 12.375 6.93561 12.5527 6.61914 12.8691C6.30267 13.1856 6.125 13.6149 6.125 14.0625C6.125 14.5101 6.30267 14.9394 6.61914 15.2559C6.93561 15.5723 7.36495 15.75 7.8125 15.75H12.1875C12.6351 15.75 13.0644 15.5723 13.3809 15.2559C13.6973 14.9394 13.875 14.5101 13.875 14.0625C13.875 13.6149 13.6973 13.1856 13.3809 12.8691C13.0644 12.5527 12.6351 12.375 12.1875 12.375H11.6875V8H10.9658C11.1287 7.91009 11.2801 7.798 11.4141 7.66406C11.7891 7.28899 12 6.78043 12 6.25C12 5.71957 11.7891 5.21101 11.4141 4.83594C11.039 4.46087 10.5304 4.25 10 4.25Z"
                      fill="#0072C6"
                      stroke="#0072C6"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <p className="text-sm text-blue-800">
                    <strong>Info:</strong> Email akan berisi detail lengkap
                    tiket dengan format yang rapi seperti yang Anda lihat di
                    sistem ini.
                  </p>
                </div>

                {/* Buttons section - kanan tanpa background */}
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailForm({ to_email: '', subject: '', body: '' });
                      setError('');
                      setSuccess('');
                    }}
                    className="px-6 hover:scale-105 hover:shadow-lg transition-all duration-300 border-2 border-blue-700 text-blue-700 rounded-lg hover:bg-gray-50"
                  >
                    <span className="font-bold">Clear</span>
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-6 py-2 hover:shadow-lg hover:scale-105 transition-all duration-300 bg-blue-400 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {sending ? (
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
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          width="24"
                          height="22"
                          viewBox="0 0 24 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M1.69299 0.818655C1.53414 0.750422 1.35891 0.732531 1.18999 0.767305C1.02108 0.802079 0.866291 0.887912 0.745694 1.01367C0.625098 1.13943 0.54426 1.29932 0.513664 1.4726C0.483068 1.64588 0.504126 1.82455 0.574106 1.98545L4.1199 10.1214H12.8233C13.0514 10.1214 13.27 10.214 13.4313 10.3787C13.5925 10.5435 13.6831 10.767 13.6831 11C13.6831 11.233 13.5925 11.4565 13.4313 11.6213C13.27 11.786 13.0514 11.8786 12.8233 11.8786H4.1199L0.574106 20.0146C0.504126 20.1755 0.483068 20.3541 0.513664 20.5274C0.54426 20.7007 0.625098 20.8606 0.745694 20.9863C0.866291 21.1121 1.02108 21.1979 1.18999 21.2327C1.35891 21.2675 1.53414 21.2496 1.69299 21.1813L23.4745 11.8095C23.6303 11.7423 23.7632 11.6297 23.8567 11.4857C23.9501 11.3417 24 11.1728 24 11C24 10.8272 23.9501 10.6583 23.8567 10.5143C23.7632 10.3703 23.6303 10.2577 23.4745 10.1905L1.69299 0.818655Z"
                            fill="white"
                          />
                        </svg>
                        <span>Kirim Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Alert Messages */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  <div className="flex items-center justify-between">
                    <span>{error}</span>
                    <button
                      onClick={() => setError('')}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                  <div className="flex items-center justify-between">
                    <span>{success}</span>
                    <button
                      onClick={() => setSuccess('')}
                      className="text-green-500 hover:text-green-700"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </form>
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

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default AdminEmailManagement;
