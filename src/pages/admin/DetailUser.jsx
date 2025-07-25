import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Button from '../../components/Button';
import { getTicketDetailAPI } from '../../services/api';

const DetailManage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  // Essential state only
  const [userDetail, setUserDetail] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(10);
  const [feedbackCounts, setFeedbackCounts] = useState({});
  const [loadingFeedbackCounts, setLoadingFeedbackCounts] = useState(false);

  const BASE_URL = 'https://apibackendtio.mynextskill.com/api';

  // API call helper
  const makeAPICall = async (endpoint) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };

  // Map status dari API ke kategori tampilan
  const mapStatusToCategory = (status) => {
    if (!status) return 'Tiket Baru';

    switch (status.toLowerCase()) {
      case 'pending':
      case 'new':
      case 'open':
        return 'Tiket Baru';
      case 'in_progress':
      case 'processing':
      case 'assigned':
        return 'Diproses';
      case 'completed':
      case 'resolved':
      case 'closed':
        return 'Selesai';
      default:
        return 'Tiket Baru';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Tanggal tidak tersedia';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      return 'Tanggal tidak valid';
    }
  };

  // Fetch user detail
  const fetchUserDetail = async () => {
    try {
      const result = await makeAPICall(`/users/${userId}`);
      if (result.status === 'success') {
        setUserDetail(result.data);
      }
    } catch (error) {
      console.error('Error fetching user detail:', error);
      setError('Gagal memuat detail user: ' + error.message);
    }
  };

  // Fetch user tickets
  const fetchUserTickets = async () => {
    try {
      let result;
      // Try multiple endpoints to find the correct one
      try {
        result = await makeAPICall(`/users/${userId}/tickets`);
      } catch (error) {
        try {
          result = await makeAPICall(`/tickets?user_id=${userId}`);
        } catch (error2) {
          // If specific user endpoints don't work, get all tickets and filter
          const allTicketsResult = await makeAPICall('/tickets');
          if (allTicketsResult.status === 'success') {
            const allTickets =
              allTicketsResult.data?.tickets || allTicketsResult.data || [];
            result = {
              status: 'success',
              data: {
                tickets: allTickets.filter(
                  (ticket) => ticket.user_id === userId
                ),
              },
            };
          } else {
            throw new Error('Could not fetch tickets');
          }
        }
      }

      let ticketsData = [];
      if (result.status === 'success' && result.data?.tickets) {
        ticketsData = result.data.tickets;
      } else if (result.status === 'success' && Array.isArray(result.data)) {
        ticketsData = result.data;
      } else if (Array.isArray(result)) {
        ticketsData = result;
      }

      // Transform tickets data
      const transformedTickets = ticketsData.map((ticket) => ({
        id: ticket.id,
        title: ticket.judul || ticket.title || 'Tidak ada judul',
        category: mapStatusToCategory(ticket.status),
        categoryType: ticket.category?.name || 'Umum',
        date: formatDate(ticket.created_at),
        status: ticket.status,
        description: ticket.deskripsi || ticket.description || '',
        originalDate: ticket.created_at,
        priority: ticket.priority || 'medium',
        chatCount: ticket.chat_count || 0,
        unreadChatCount: ticket.unread_chat_count || 0,
      }));

      setTickets(transformedTickets);
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      setTickets([]);
    }
  };

  // Tambahkan function ini setelah fetchUserTickets
  const loadFeedbackCounts = async (tickets) => {
    try {
      setLoadingFeedbackCounts(true);
      const counts = {};
  
      for (const ticket of tickets) {
        // ✅ Gunakan API call seperti di StudentDashboard.jsx
        try {
          const data = await getTicketDetailAPI(ticket.id);
          counts[ticket.id] = {
            total: data.chat_count || 0,  // ✅ Dari API response
            unread: data.unread_chat_count || 0,  // ✅ Dari API response
          };
        } catch (error) {
          console.error(`Error loading feedback for ticket ${ticket.id}:`, error);
          counts[ticket.id] = {
            total: ticket.chatCount || 0,  // ✅ Fallback ke data lokal
            unread: ticket.unreadChatCount || 0,  // ✅ Fallback ke data lokal
          };
        }
      }
  
      setFeedbackCounts(counts);
    } catch (error) {
      console.error('Error loading feedback counts:', error);
    } finally {
      setLoadingFeedbackCounts(false);
    }
  };

  // Get ticket counts by status
  const getTicketCounts = () => {
    const total = tickets.length;
    const tiketBaru = tickets.filter((t) => t.category === 'Tiket Baru').length;
    const diproses = tickets.filter((t) => t.category === 'Diproses').length;
    const selesai = tickets.filter((t) => t.category === 'Selesai').length;
    const tak = tickets.filter((t) => t.hasUnreadChat).length;

    return { total, tiketBaru, diproses, selesai, tak };
  };

  // Filter tickets based on active filter
  const getFilteredTickets = () => {
    if (activeFilter === 'Semua') return tickets;
    if (activeFilter === 'TAK') return tickets.filter((t) => t.hasUnreadChat);
    return tickets.filter((t) => t.category === activeFilter);
  };

  // Handle filter click
  const handleFilterClick = (filterType) => {
    setActiveFilter(filterType);
    setCurrentPage(1);
  };

  // Handle ticket click
  const handleTicketClick = (ticketId) => {
    navigate(`/ticket/${ticketId}`);
  };

  // Handle feedback click
  const handleFeedbackClick = (ticketId, e) => {
    e.stopPropagation();
    navigate(`/ticket/${ticketId}`);
  };

  // Pagination
  const filteredTickets = getFilteredTickets();
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);
  const startIndex = (currentPage - 1) * ticketsPerPage;
  const endIndex = startIndex + ticketsPerPage;
  const currentTickets = filteredTickets.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Load data on mount
  useEffect(() => {
    if (userId) {
      setLoading(true);
      Promise.all([fetchUserDetail(), fetchUserTickets()]).finally(() =>
        setLoading(false)
      );
    }
  }, [userId]);

  // useEffect(() => {
  //   fetchUserTickets();
  // }, [userId, currentPage, activeFilter]);

  useEffect(() => {
    if (tickets.length > 0) {
      loadFeedbackCounts(tickets);
    }
  }, [tickets]);

  // Helper functions for styling - DIPERBAIKI
  const getStatusBorderColor = (category) => {
    switch (category) {
      case 'Tiket Baru':
        return 'border-l-blue-500';
      case 'Diproses':
        return 'border-l-orange-500';
      case 'Selesai':
        return 'border-l-black-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const getStatusBgColor = (category) => {
    switch (category) {
      case 'Tiket Baru':
        return 'bg-blue-50';
      case 'Diproses':
        return 'bg-orange-50';
      case 'Selesai':
        return 'bg-green-50';
      default:
        return 'bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Memuat data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const counts = getTicketCounts();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {userDetail?.name || 'User Detail'}
              </h1>
              <p className="text-white opacity-80">
                {userDetail?.nim || userDetail?.email || 'Detail pengguna'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-lg shadow min-h-[600px]">
        {/* Navigation Filters - Tab Style */}
        <Navigation topOffset="">
          <div className="flex items-center gap-2 pt-6">
            {/* Semua */}
            <div
              onClick={() => handleFilterClick('Semua')}
              className={`border-2 border-gray-400 shadow-gray-300 text-sm px-3 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 shadow-lg cursor-pointer w-32 justify-center ${
                activeFilter === 'Semua'
                  ? 'border-blue-700 bg-blue-200 text-black' // Active state
                  : 'border-gray-400 text-black hover:text-blue-800 hover:border-blue-600'
              }`}
            >
              <svg
                className="w-4 h-4 text-red-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span className="font-semibold">Semua</span>
              <span className="font-semibold text-black text-sm rounded-full min-w-[20px] text-center">
                {counts.total}
              </span>
            </div>

            {/* Tiket Baru */}
            <div
              onClick={() => handleFilterClick('Tiket Baru')}
              className={`border-2 shadow-gray-300 text-sm px-1 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 shadow-lg cursor-pointer w-32 justify-center ${
                activeFilter === 'Tiket Baru'
                  ? 'border-gray-500 bg-gray-200 text-black' // Active state
                  : 'border-gray-400 text-black hover:text-gray-800 hover:border-gray-500' // Default state
              }`}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19.0244 7.16016H19.0254C19.1649 7.30222 19.25 7.49508 19.25 7.70898C19.25 7.91831 19.1674 8.10592 19.0332 8.24707L19.0283 8.25293L8.26953 19.0254C8.12747 19.1649 7.93457 19.2499 7.7207 19.25C7.56005 19.25 7.41135 19.202 7.28711 19.1191L7.17188 19.0254L6.13672 17.9902C6.40416 17.5264 6.55009 16.9974 6.5459 16.4531C6.5446 16.2875 6.52579 16.124 6.49805 15.9629L7.41016 16.875L7.41602 16.8818L7.42285 16.8877C7.70619 17.1581 8.08293 17.3089 8.47461 17.3086C8.8664 17.3083 9.24343 17.1568 9.52637 16.8857L9.53223 16.8799L9.53711 16.874L16.8701 9.54102L16.8691 9.54004C17.0088 9.40227 17.1209 9.23933 17.1973 9.05859C17.2748 8.87499 17.3152 8.67786 17.3154 8.47852C17.3155 8.329 17.2928 8.18048 17.249 8.03809L17.1982 7.89746L17.1338 7.7627C17.0626 7.63183 16.9712 7.51171 16.8643 7.40723L16.0361 6.5791C16.1728 6.59635 16.3108 6.60797 16.4492 6.60645C16.8529 6.60193 17.2517 6.51704 17.6221 6.35645C17.7564 6.29819 17.8839 6.22604 18.0078 6.14941L19.0244 7.16016ZM14.2031 8.47461L8.47363 14.2051L5.7832 11.5137L11.5117 5.78418L14.2031 8.47461ZM12.2783 0.75C12.4389 0.75 12.5877 0.798004 12.7119 0.880859L12.8271 0.974609L13.8359 1.9834C13.7602 2.10632 13.6905 2.23314 13.6328 2.36621C13.4721 2.73682 13.3863 3.13609 13.3818 3.54004C13.3803 3.67754 13.3912 3.81436 13.4082 3.9502L12.5752 3.11719L12.5684 3.11133L12.5625 3.10547L12.4521 3.00879C12.1849 2.79877 11.8534 2.6834 11.5107 2.68359C11.119 2.6839 10.7419 2.83547 10.459 3.10645L3.11426 10.4512C2.97471 10.5889 2.86343 10.7529 2.78711 10.9336C2.70952 11.1173 2.67008 11.3152 2.66992 11.5146C2.66982 11.7138 2.70897 11.9111 2.78613 12.0947C2.86225 12.2757 2.97376 12.4401 3.11328 12.5781V12.5791L4.02441 13.4902C3.86361 13.4627 3.70038 13.4446 3.53516 13.4434C2.99155 13.4393 2.46335 13.5846 2 13.8516L0.974609 12.8174C0.835126 12.6753 0.750058 12.4824 0.75 12.2686C0.75 12.0546 0.834102 11.8609 0.973633 11.7188L6.35156 6.34766L11.7295 0.973633L11.7305 0.974609C11.8725 0.83519 12.0645 0.750089 12.2783 0.75Z"
                  fill="#607D8B"
                  stroke="#607D8B"
                  strokeWidth="1.5"
                />
              </svg>
              <span className="font-semibold">Tiket Baru</span>
              <span className="font-semibold text-black text-sm rounded-full min-w-[20px] text-center">
                {counts.tiketBaru}
              </span>
            </div>

            {/* Diproses */}
            <div
              onClick={() => handleFilterClick('Diproses')}
              className={`border-2 border-gray-400 shadow-gray-300 text-sm px-3 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 shadow-lg cursor-pointer w-32 justify-center ${
                activeFilter === 'Diproses'
                  ? 'border-b-2 bg-orange-100 border-orange-500 text-orange-600'
                  : 'text-black'
              }`}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 0.75C15.0996 0.75 19.25 4.90037 19.25 10C19.25 15.0996 15.0996 19.25 10 19.25C4.90037 19.25 0.75 15.0996 0.75 10C0.75 4.90037 4.90037 0.75 10 0.75ZM8.13379 11.5723L8.5 11.791L13.4023 14.7158L14.0459 15.0996L14.4307 14.4561L15.2197 13.1348L15.6035 12.4912L14.96 12.1064L11.1729 9.84766V4.2207H8.13379V11.5723Z"
                  fill="#FFBA57"
                  stroke="#FFBA57"
                  strokeWidth="1.5"
                />
              </svg>
              <span className="font-semibold">Diproses</span>
              <span className="font-semibold text-black text-sm rounded-full min-w-[20px] text-center">
                {counts.diproses}
              </span>
            </div>

            {/* Selesai */}
            <div
              onClick={() => handleFilterClick('Selesai')}
              className={`border-2 border-gray-400 shadow-gray-300 text-sm px-3 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 shadow-lg cursor-pointer w-32 justify-center ${
                activeFilter === 'Selesai'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-black'
              }`}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_3510_76936)">
                  <path
                    d="M10 0.75C12.6581 0.75 15.053 1.88432 16.7432 3.69238C13.6407 6.0346 11.448 8.70968 10.2109 10.4375C9.55016 9.6939 8.67362 8.83111 7.65723 8.13965L7.375 7.95508L6.72559 7.54492L6.0918 7.14355L5.69141 7.77734L4.86914 9.07812L4.4668 9.71289L5.10254 10.1133L5.75293 10.5225V10.5234C6.64925 11.0906 7.46809 11.9096 8.07617 12.6133C8.66489 13.2946 9.02617 13.8326 9.03711 13.8486L9.05078 13.8701L9.06641 13.8896L9.32617 14.2344L9.55078 14.5332H11.2246L11.4395 14.1523L11.6592 13.7637C11.6592 13.7637 12.3233 12.6082 13.5947 11.0205C14.7407 9.58947 16.3698 7.82006 18.4395 6.22949C18.9586 7.38242 19.25 8.65681 19.25 10C19.25 15.0996 15.0996 19.25 10 19.25C4.90037 19.25 0.75 15.0996 0.75 10C0.750009 4.90035 4.90037 0.75 10 0.75Z"
                    fill="#28A745"
                    stroke="#28A745"
                    strokeWidth="1.5"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_3510_76936">
                    <rect width="20" height="20" rx="8" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <span className="font-semibold">Selesai</span>
              <span className="font-semibold text-black text-sm rounded-full min-w-[20px] text-center">
                {counts.selesai}
              </span>
            </div>
            <div className="border-2 border-gray-400 shadow-gray-300 text-sm rounded-lg px-3 py-1  items-center space-x-2 transition-all duration-300 shadow-lg cursor-pointer w-auto justify-center">
              <div className="flex items-center space-x-2 ">
                <svg
                  className="w-4 h-4"
                  width="20"
                  height="15"
                  viewBox="0 0 27 20"
                  fill="none"
                >
                  <g clipPath="url(#clip0_2657_120330)">
                    <path
                      d="M0.277344 20V1.875C0.277344 0.839453 1.22872 0 2.40234 0H15.1523C16.326 0 17.2773 0.839453 17.2773 1.875V20L8.77734 15.625L0.277344 20Z"
                      fill="#444746"
                    />
                    <path
                      d="M20.639 4.78515C20.567 4.89852 20.4802 4.98945 20.3838 5.05252C20.2873 5.11559 20.1832 5.1495 20.0776 5.15223C19.972 5.15497 19.8671 5.12646 19.7692 5.06843C19.6713 5.01039 19.5823 4.92401 19.5077 4.81444C19.433 4.70487 19.3741 4.57435 19.3346 4.43067C19.295 4.28698 19.2756 4.13309 19.2775 3.97815C19.2793 3.82322 19.3024 3.67042 19.3454 3.52887C19.3884 3.38733 19.4504 3.25994 19.5276 3.1543L22.5792 0.337463C22.7266 0.121374 22.9265 0 23.1349 0C23.3433 0 23.5432 0.121374 23.6906 0.337463L26.7506 3.1543C26.8278 3.25994 26.8898 3.38733 26.9328 3.52887C26.9758 3.67042 26.9989 3.82322 27.0007 3.97815C27.0026 4.13309 26.9832 4.28698 26.9436 4.43067C26.9041 4.57435 26.8452 4.70487 26.7705 4.81444C26.6959 4.92401 26.6069 5.01039 26.509 5.06843C26.4111 5.12646 26.3062 5.15497 26.2006 5.15223C26.095 5.1495 25.9909 5.11559 25.8944 5.05252C25.798 4.98945 25.7112 4.89852 25.6392 4.78515L23.924 2.6543L23.9213 18.8461C23.9213 19.1521 23.8384 19.4456 23.691 19.662C23.5435 19.8784 23.3435 20 23.1349 20C22.9263 20 22.7263 19.8784 22.5789 19.662C22.4314 19.4456 22.3485 19.1521 22.3485 18.8461L22.3512 2.6543L20.639 4.78515Z"
                      fill="black"
                    />
                  </g>
                </svg>
                <span className="font-semibold">TAK</span>
                <span className="text-black text-ms px-2 py-1 rounded-full min-w-[20px] text-center font-semibold">
                  {counts.tak}
                </span>
              </div>
            </div>
            {/* Date Info - Fixed calculation */}
            <div className="ml-auto flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center  my-2">
                <div className="border-2 border-gray-400 shadow-gray-300 text-sm rounded-lg flex items-center transition-all duration-300 shadow-lg cursor-pointer w-auto overflow-hidden">
                  <div className="px-4 py-2">
                    <span className="font-medium text-gray-700">
                      Tiket Pertama
                    </span>
                  </div>

                  {/* Garis Pemisah - Menempel border atas-bawah */}
                  <div className="w-0.5 h-10 bg-gray-400"></div>

                  <div className="px-4 py-2">
                    <span className="font-semibold text-gray-800">
                      {tickets.length > 0
                        ? formatDate(
                            tickets.sort(
                              (a, b) =>
                                new Date(a.originalDate) -
                                new Date(b.originalDate)
                            )[0]?.originalDate
                          )
                        : '-'}
                    </span>
                  </div>
                  <div className="w-0.5 h-10 bg-gray-400"></div>
                  <div className="px-2 py-2"></div>
                </div>
              </div>

              <div className="flex items-center ">
                <div className="border-2 border-gray-400 shadow-gray-300 text-sm rounded-lg flex items-center transition-all duration-300 shadow-lg cursor-pointer w-auto overflow-hidden">
                  <div className="px-2 py-2"></div>
                  <div className="w-0.5 h-10 bg-gray-400"></div>
                  <div className="px-4 py-2">
                    <span className="font-medium text-gray-700">
                      Tiket Terakhir
                    </span>
                  </div>

                  {/* Garis Pemisah - Menempel border atas-bawah */}
                  <div className="w-0.5 h-10 bg-gray-400"></div>

                  <div className="px-4 py-2">
                    <span className="font-semibold text-gray-700">
                      {tickets.length > 0
                        ? formatDate(
                            tickets.sort(
                              (a, b) =>
                                new Date(b.originalDate) -
                                new Date(a.originalDate)
                            )[0]?.originalDate
                          )
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Navigation>

        {/* Ticket List */}
        <div className="bg-white px-8 mt-4">
          <div className="divide-y divide-gray-200">
            {currentTickets.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                {activeFilter === 'Semua'
                  ? 'User ini belum membuat tiket'
                  : `Tidak ada tiket dengan status ${activeFilter}`}
              </div>
            ) : (
              currentTickets.map((ticket, index) => (
                <div
                  key={`${ticket.id}-${index}`}
                  className={`px-4 py-4 border-b border-l-4 hover:bg-gray-50 transition-colors cursor-pointer ${getStatusBorderColor(ticket.category)} ${
                    ticket.hasUnreadChat
                      ? getStatusBgColor(ticket.category)
                      : ''
                  }`}
                  onClick={() => handleTicketClick(ticket.id)}
                >
                  {/* Top Row - ID, Date */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        #{ticket.id}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">{ticket.date}</div>
                  </div>

                  {/* Second Row - Sender, Status, Category */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      {/* User Info dengan data yang benar */}
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4 text-gray-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <div className="text-sm font-medium text-gray-900">
                          {userDetail?.name || 'User'}
                          {userDetail?.nim && (
                            <span className="text-gray-500">
                              , {userDetail.nim}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          ticket.category === 'Tiket Baru'
                            ? 'bg-blue-100 text-blue-800'
                            : ticket.category === 'Diproses'
                              ? 'bg-orange-100 text-orange-800'
                              : ticket.category === 'Selesai'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {ticket.category}
                      </span>

                      {/* Category with Icon */}
                      <div className="flex items-center space-x-1">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                        <span className="text-sm text-gray-600">
                          {ticket.categoryType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Third Row - Title/Subject */}
                  <div className="mb-3">
                    <h3 className="text-blue-700 font-medium hover:text-blue-800 text-base leading-relaxed">
                      {ticket.title}
                    </h3>
                  </div>

                  {/* Bottom Row - View Button and Status Indicators */}
                  <div className="flex items-center justify-between">
                    {/* View Detail Button */}
                    <button
                      onClick={(e) => handleFeedbackClick(ticket.id, e)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border shadow-lg transition-colors ${(() => {
                        const unreadCount =
                          feedbackCounts[ticket.id]?.unread || 0;

                        return unreadCount > 0
                          ? 'bg-yellow-600 border-yellow-700 hover:bg-yellow-700 text-white'
                          : 'bg-white border-gray-300 hover:bg-gray-200 text-gray-700';
                      })()}`}
                    >
                      <svg
                        width="16"
                        height="14"
                        viewBox="0 0 24 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-1"
                      >
                        <path
                          d="M19.4092 7.38086C21.7593 8.52498 23.25 10.5925 23.25 12.8574C23.2499 14.1885 22.7409 15.4344 21.8477 16.4756L21.5479 16.8252L21.7236 17.25C22.0415 18.02 22.4653 18.7004 22.8018 19.1807C21.8379 19.0305 21.0144 18.6514 20.3682 18.248L20.0029 18.0195L19.6221 18.2197C18.3894 18.8678 16.9213 19.25 15.333 19.25C12.5831 19.2499 10.2094 18.1196 8.80078 16.4609C14.4682 16.3998 19.2637 12.4717 19.4092 7.38086ZM8.66699 0.75C13.1822 0.750144 16.5828 3.73976 16.583 7.14258C16.583 10.5455 13.1824 13.536 8.66699 13.5361C7.0801 13.5361 5.6109 13.15 4.37598 12.5049L3.99609 12.3066L3.63184 12.5332C2.98533 12.9367 2.16169 13.3167 1.19727 13.4668C1.53383 12.986 1.95825 12.3052 2.27637 11.5371L2.45215 11.1123L2.15332 10.7627C1.25849 9.71566 0.75 8.47315 0.75 7.14258C0.750186 3.73968 4.15157 0.75 8.66699 0.75ZM0.651367 14.1826L0.649414 14.1807C0.656513 14.1726 0.666326 14.1611 0.678711 14.1465C0.670118 14.1586 0.661652 14.1711 0.651367 14.1826Z"
                          fill="#444746"
                          stroke="#444746"
                          strokeWidth="1.5"
                        />
                      </svg>
                      <span
                        className={`text-sm font-semibold ${
                          feedbackCounts[ticket.id]?.unread > 0
                            ? 'text-white'
                            : 'text-gray-700'
                        }`}
                      >
                        Feedback ({feedbackCounts[ticket.id]?.total || 0}
                        {feedbackCounts[ticket.id]?.unread > 0
                          ? `/${feedbackCounts[ticket.id].unread} baru`
                          : ''}
                        )
                      </span>
                    </button>

                    {/* Status Indicators */}
                    <div className="flex items-center space-x-2">
                      {ticket.hasUnreadChat && (
                        <span
                          className="w-3 h-3 bg-blue-500 rounded-full"
                          title="Ada Pesan Baru"
                        ></span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-lg">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>

            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(endIndex, filteredTickets.length)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{filteredTickets.length}</span>{' '}
                  results
                </p>
              </div>

              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let startPage = Math.max(1, currentPage - 2);
                    let endPage = Math.min(totalPages, startPage + 4);

                    if (endPage - startPage < 4) {
                      startPage = Math.max(1, endPage - 4);
                    }

                    const page = startPage + i;
                    if (page > endPage) return null;

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          page === currentPage
                            ? 'z-10 bg-red-600 text-white'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailManage;
