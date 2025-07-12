// src/pages/student/StudentDashboard.jsx - Fixed status filter logic
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getTicketsAPI,
  getCategoriesAPI,
  getTicketDetailAPI,
} from '../../services/api';
import {
  FilterButton,
  getStatusBorderColor,
  getStatusBgColor,
} from '../../components/student/StatusBadge';
import { ToastContainer } from '../../components/Toast';
import Navigation from '../../components/Navigation';
import Button from '../../components/Button';
import SearchBar from '../../components/SearchBar';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State declarations
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(10);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [originalTickets, setOriginalTickets] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('Semua Kategori');
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: '',
    endDate: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [categories, setCategories] = useState([]);
  const [readFilter, setReadFilter] = useState('Semua');
  const [showReadDropdown, setShowReadDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastStatusCheck, setLastStatusCheck] = useState(new Map());
  const [lastFeedbackCheck, setLastFeedbackCheck] = useState(new Map());

  const [feedbackCounts, setFeedbackCounts] = useState({});
  const [loadingFeedbackCounts, setLoadingFeedbackCounts] = useState(false);
  const handleClearSearch = async () => {
    setSearchQuery('');
    setTickets(originalTickets);
    setError('');
  };
  const handleSearch = async (query) => {
    try {
      setSearchQuery(query);

      // Jika query kosong, gunakan original tickets (dari cache)
      if (!query.trim()) {
        setTickets(originalTickets);
        setError('');
        return;
      }

      // Search di client-side dulu untuk instant feedback
      const queryLower = query.toLowerCase();
      const filteredTickets = {
        'tiket-baru': [],
        diproses: [],
        selesai: [],
      };

      // Filter dari originalTickets
      Object.keys(originalTickets).forEach((status) => {
        filteredTickets[status] = originalTickets[status].filter((ticket) => {
          return (
            ticket.subject?.toLowerCase().includes(queryLower) ||
            ticket.sender?.toLowerCase().includes(queryLower) ||
            ticket.id?.toString().includes(queryLower) ||
            ticket.nim?.toLowerCase().includes(queryLower) ||
            ticket.email?.toLowerCase().includes(queryLower)
          );
        });
      });

      // Set hasil filter instant
      setTickets(filteredTickets);

      // Kemudian lakukan API call untuk hasil yang lebih akurat (background)
      try {
        const filters = {
          search: query.trim(),
          per_page: 200,
          page: 1,
        };

        // const result = await getAdminTicketsAPI(filters);
        const result = await getTicketsAPI(filters);

        if (Array.isArray(result)) {
          // Group tickets by status dari server
          const serverGroupedTickets = {
            'tiket-baru': [],
            diproses: [],
            selesai: [],
          };

          result.forEach((ticket) => {
            const ticketCategory = mapStatusToCategory(ticket.status);
            const transformedTicket = {
              id: ticket.id,
              sender:
                ticket.anonymous === true
                  ? 'Anonim'
                  : ticket.nama || ticket.name || 'Tidak diketahui',
              subject: ticket.judul || ticket.title || 'Tidak ada judul',
              category: ticketCategory,
              categoryType: ticket.category?.name || 'Umum',
              read_by_student: ticket.read_by_student,
            };

            if (serverGroupedTickets[ticketCategory]) {
              serverGroupedTickets[ticketCategory].push(transformedTicket);
            }
          });

          // Update dengan hasil server (lebih akurat)
          setTickets(serverGroupedTickets);
          setError('');
        }
      } catch (apiError) {
        console.warn('API search failed, using client-side results:', apiError);
        // Tetap gunakan hasil client-side filter jika API gagal
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Gagal melakukan pencarian: ' + error.message);
    }
  };
  const [clickedTicketsByStatus, setClickedTicketsByStatus] = useState(() => {
    try {
      const saved = localStorage.getItem(
        `clickedTicketsByStatus_${user?.id || 'anonymous'}`
      );
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          'Tiket Baru': new Set(parsed['Tiket Baru'] || []),
          'Sedang Diproses': new Set(parsed['Sedang Diproses'] || []),
          Selesai: new Set(parsed['Selesai'] || []),
        };
      }
      return {
        'Tiket Baru': new Set(),
        'Sedang Diproses': new Set(),
        Selesai: new Set(),
      };
    } catch (error) {
      console.error('Error loading clicked tickets by status:', error);
      return {
        'Tiket Baru': new Set(),
        'Sedang Diproses': new Set(),
        Selesai: new Set(),
      };
    }
  });

  const [lastViewTime, setLastViewTime] = useState(() => {
    try {
      const savedLastViewTime = localStorage.getItem(
        `lastViewTime_${user?.id || 'anonymous'}`
      );
      if (savedLastViewTime) {
        const parsed = JSON.parse(savedLastViewTime);
        const timeMap = new Map();
        Object.entries(parsed).forEach(([key, value]) => {
          timeMap.set(key, new Date(value));
        });
        return timeMap;
      }
      return new Map();
    } catch (error) {
      console.error('Error loading last view time:', error);
      return new Map();
    }
  });
  const formatDate = (dateString) => {
    if (!dateString) return 'Tanggal tidak tersedia';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return 'Kemarin';
      if (diffDays === 0) return 'Hari Ini';
      if (diffDays <= 7) return `${diffDays} hari lalu`;
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      return 'Tanggal tidak valid';
    }
  };

  // TAMBAH: Load status tracking
  const loadStatusTracking = () => {
    if (user?.id) {
      const savedStatus = localStorage.getItem(`statusTracking_${user.id}`);
      const savedFeedback = localStorage.getItem(`feedbackTracking_${user.id}`);

      if (savedStatus) {
        setLastStatusCheck(new Map(Object.entries(JSON.parse(savedStatus))));
      }
      if (savedFeedback) {
        setLastFeedbackCheck(
          new Map(Object.entries(JSON.parse(savedFeedback)))
        );
      }
    }
  };
  const loadCategories = async () => {
    try {
      const categoriesData = await getCategoriesAPI();
      setCategories(categoriesData);
    } catch (error) {
      setCategories([
        { id: 1, name: 'Akademik' },
        { id: 2, name: 'Fasilitas' },
        { id: 3, name: 'Administrasi' },
        { id: 4, name: 'Kemahasiswaan' },
        { id: 5, name: 'Lainnya' },
      ]);
    }
  };

  // FIXED: Unified filtering logic
  const getFilteredTickets = () => {
    let filtered = [...tickets];

    // 🔧 FIX: Search filter - TAMBAH INI
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((ticket) => {
        return (
          ticket.id.toString().includes(query) ||
          ticket.subject.toLowerCase().includes(query) ||
          ticket.sender.toLowerCase().includes(query) ||
          (ticket.nim && ticket.nim.toLowerCase().includes(query))
        );
      });
    }

    // Status filter
    if (statusFilter !== 'Semua') {
      filtered = filtered.filter((ticket) => ticket.category === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'Semua Kategori') {
      filtered = filtered.filter(
        (ticket) => ticket.categoryType === categoryFilter
      );
    }

    // Read filter
    if (readFilter !== 'Semua') {
      if (readFilter === 'Sudah Dibaca') {
        filtered = filtered.filter((ticket) => {
          const isUnreadFromAPI = !(
            ticket.read_by_student === true ||
            ticket.read_by_student === 1 ||
            ticket.read_by_student === '1'
          );
          const notClickedForThisStatus = !clickedTicketsByStatus[
            ticket.category
          ]?.has(ticket.id);
          const isUnreadForThisStatus =
            isUnreadFromAPI && notClickedForThisStatus;
          return !isUnreadForThisStatus; // Sudah dibaca = NOT unread
        });
      } else if (readFilter === 'Belum Dibaca') {
        filtered = filtered.filter((ticket) => {
          const isUnreadFromAPI = !(
            ticket.read_by_student === true ||
            ticket.read_by_student === 1 ||
            ticket.read_by_student === '1'
          );
          const notClickedForThisStatus = !clickedTicketsByStatus[
            ticket.category
          ]?.has(ticket.id);
          const isUnreadForThisStatus =
            isUnreadFromAPI && notClickedForThisStatus;
          return isUnreadForThisStatus; // Belum dibaca = unread
        });
      }
    }

    // Date range filter
    if (dateRangeFilter.startDate && dateRangeFilter.endDate) {
      const startDate = new Date(dateRangeFilter.startDate);
      const endDate = new Date(dateRangeFilter.endDate);
      endDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter((ticket) => {
        if (!ticket.originalDate) return false;
        const ticketDate = new Date(ticket.originalDate);
        return ticketDate >= startDate && ticketDate <= endDate;
      });
    }

    return filtered;
  };
  const handleResetFilter = () => {
    // Reset semua filter ke nilai default
    setStatusFilter('Semua');
    setCategoryFilter('Semua Kategori');
    setDateRangeFilter({ startDate: '', endDate: '' });
    setReadFilter('Semua');
    setSearchQuery(''); // 🔧 TAMBAH: Reset search
    setCurrentPage(1);
    setSelectedTickets([]);

    // Tutup dropdowns
    setShowDatePicker(false);
    setShowReadDropdown(false);

    // Show toast notification
    addToast('Filter berhasil direset', 'success');
  };
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
        return 'Sedang Diproses';
      case 'completed':
      case 'resolved':
      case 'closed':
        return 'Selesai';
      default:
        return 'Tiket Baru';
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshLoading(true);
      const previousTicketCount = tickets.length;

      const currentLastViewTime = new Map(lastViewTime);

      // Load tickets and get the new data directly
      const response = await getTicketsAPI({});
      let newTicketsData = [];

      if (response && response.tickets) {
        newTicketsData = response.tickets;
      } else if (Array.isArray(response)) {
        newTicketsData = response;
      } else if (response && response.data) {
        newTicketsData = Array.isArray(response.data)
          ? response.data
          : response.data.tickets || [];
      }

      const difference = newTicketsData.length - previousTicketCount;

      await Promise.all([loadTickets(), loadCategories()]);

      setLastViewTime(currentLastViewTime);

      if (newTicketsData.length > 0) {
        await loadFeedbackCounts(tickets);
      }

      setCurrentPage(1);
      setSelectedTickets([]);

      setTimeout(() => {
        if (difference > 0) {
          addToast(`${difference} tiket baru ditemukan!`, 'success');
        } else if (difference < 0) {
          addToast(`${Math.abs(difference)} tiket telah dihapus`, 'info');
        } else {
          addToast('Data tiket sudah up to date', 'success');
        }
      }, 500);
    } catch (error) {
      addToast('Gagal memperbarui data: ' + error.message, 'error');
    } finally {
      setRefreshLoading(false);
    }
  };

  const getTicketCounts = () => {
    return {
      total: tickets.length,
      new: tickets.filter((t) => t.category === 'Tiket Baru').length,
      processing: tickets.filter((t) => t.category === 'Sedang Diproses')
        .length,
      completed: tickets.filter((t) => t.category === 'Selesai').length,
    };
  };

  // TAMBAH: Fungsi gabungan untuk badge
  const shouldShowBadge = (
    statusType,
    allTickets,
    currentClickedTicketsByStatus
  ) => {
    if (!allTickets || allTickets.length === 0) return false;
    if (!currentClickedTicketsByStatus) {
      console.warn(
        `shouldShowBadge: currentClickedTicketsByStatus missing for ${statusType}`
      );
      return false;
    }

    const statusTickets = allTickets.filter(
      (ticket) => ticket.category === statusType
    );
    if (statusTickets.length === 0) return false;

    const shouldShow = statusTickets.some((ticket) => {
      // ✅ FIX: Cek unread berdasarkan API original + status-specific clicked
      const isUnreadFromAPI = !(
        ticket.read_by_student === true ||
        ticket.read_by_student === 1 ||
        ticket.read_by_student === '1'
      );

      // ✅ FIX: Cek apakah sudah diklik untuk status ini specifically
      const notClickedForThisStatus = !currentClickedTicketsByStatus[
        statusType
      ]?.has(ticket.id);

      // ✅ FIX: Gabungkan kondisi
      const isUnreadForThisStatus = isUnreadFromAPI && notClickedForThisStatus;

      const hasUnreadFeedback = (feedbackCounts[ticket.id]?.unread || 0) > 0;

      const needsBadge = isUnreadForThisStatus || hasUnreadFeedback;

      return needsBadge;
    });

    return shouldShow;
  };

  const loadFeedbackCounts = async (tickets) => {
    try {
      setLoadingFeedbackCounts(true);
      const counts = {};

      for (const ticket of tickets) {
        try {
          const data = await getTicketDetailAPI(ticket.id);

          // 🔍 DEBUG: Cek data yang diterima dari API

          counts[ticket.id] = {
            total: data.chat_count || 0,
            unread: data.unread_chat_count || 0,
          };
        } catch (error) {
          counts[ticket.id] = { total: 0, unread: 0 };
        }
      }

      setFeedbackCounts(counts);
    } catch (error) {
      console.error('Error loading feedback counts:', error);
    } finally {
      setLoadingFeedbackCounts(false);
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

  // FIXED: Use unified filtering
  const filteredTickets = getFilteredTickets();
  const ticketCounts = getTicketCounts();

  // Pagination calculations
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);
  const startIndex = (currentPage - 1) * ticketsPerPage;
  const endIndex = startIndex + ticketsPerPage;
  const currentTickets = filteredTickets.slice(startIndex, endIndex);
  const handleStatusFilterClick = (statusType) => {
    setStatusFilter(statusType);
  };
  // FIXED: Load and save badge state properly
  // 🚀 useEffect #1: INITIALIZATION (tetap pisah)
  useEffect(() => {
    loadTickets();
    loadCategories();
  }, []); // Run sekali saat mount

  useEffect(() => {
    if (!user?.id) return;

    try {
      // ✅ Load clickedTicketsByStatus
      const savedClickedTicketsByStatus = localStorage.getItem(
        `clickedTicketsByStatus_${user.id}`
      );
      if (savedClickedTicketsByStatus) {
        const parsed = JSON.parse(savedClickedTicketsByStatus);
        setClickedTicketsByStatus({
          'Tiket Baru': new Set(parsed['Tiket Baru'] || []),
          'Sedang Diproses': new Set(parsed['Sedang Diproses'] || []),
          Selesai: new Set(parsed['Selesai'] || []),
        });
      } else {
        setClickedTicketsByStatus({
          'Tiket Baru': new Set(),
          'Sedang Diproses': new Set(),
          Selesai: new Set(),
        });
      }

      // Load lastViewTime (tetap sama)
      const savedLastViewTime = localStorage.getItem(`lastViewTime_${user.id}`);
      if (savedLastViewTime) {
        const parsed = JSON.parse(savedLastViewTime);
        const timeMap = new Map();
        Object.entries(parsed).forEach(([key, value]) => {
          timeMap.set(key, new Date(value));
        });
        setLastViewTime(timeMap);
      } else {
        setLastViewTime(new Map());
      }

      // Load status tracking (tetap sama)
      const savedStatus = localStorage.getItem(`statusTracking_${user.id}`);
      const savedFeedback = localStorage.getItem(`feedbackTracking_${user.id}`);

      if (savedStatus) {
        setLastStatusCheck(new Map(Object.entries(JSON.parse(savedStatus))));
      }
      if (savedFeedback) {
        setLastFeedbackCheck(
          new Map(Object.entries(JSON.parse(savedFeedback)))
        );
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // ✅ Reset ke default clickedTicketsByStatus
      setClickedTicketsByStatus({
        'Tiket Baru': new Set(),
        'Sedang Diproses': new Set(),
        Selesai: new Set(),
      });
      setLastViewTime(new Map());
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    try {
      const saveData = {
        'Tiket Baru': [...clickedTicketsByStatus['Tiket Baru']],
        'Sedang Diproses': [...clickedTicketsByStatus['Sedang Diproses']],
        Selesai: [...clickedTicketsByStatus['Selesai']],
      };
      localStorage.setItem(
        `clickedTicketsByStatus_${user.id}`,
        JSON.stringify(saveData)
      );
    } catch (error) {
      console.error('Error saving clicked tickets by status:', error);
    }
  }, [clickedTicketsByStatus, user?.id]);

  useEffect(() => {
    if (!user?.id || lastViewTime.size === 0) return;

    try {
      const timeObj = {};
      lastViewTime.forEach((value, key) => {
        timeObj[key] = value.toISOString();
      });
      localStorage.setItem(`lastViewTime_${user.id}`, JSON.stringify(timeObj));
    } catch (error) {
      console.error('Error saving last view time:', error);
    }
  }, [lastViewTime, user?.id]);

  useEffect(() => {
    setCurrentPage(1); // Reset pagination saat filter berubah
    setSelectedTickets([]); // Clear selection saat filter/page berubah
  }, [
    statusFilter,
    categoryFilter,
    dateRangeFilter,
    readFilter,
    searchQuery,
    currentPage,
  ]);

  useEffect(() => {
    if (tickets.length > 0) {
      loadFeedbackCounts(tickets);
    }

    const handleClickOutside = (event) => {
      if (showDatePicker && !event.target.closest('.date-picker-container')) {
        setShowDatePicker(false);
      }
      if (showReadDropdown && !event.target.closest('.relative')) {
        setShowReadDropdown(false);
      }
      // ✅ TAMBAH: Handle category dropdown click outside
      if (showCategoryDropdown && !event.target.closest('.category-dropdown')) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [tickets, showDatePicker, showReadDropdown, showCategoryDropdown]);

  // FIXED: Simplified loadTickets - load all data, filter on frontend
  const loadTickets = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getTicketsAPI({});
      let ticketsData = [];

      // Parse response logic tetap sama...
      if (response && response.tickets) {
        ticketsData = response.tickets;
      } else if (Array.isArray(response)) {
        ticketsData = response;
      } else if (response && response.data) {
        ticketsData = Array.isArray(response.data)
          ? response.data
          : response.data.tickets || [];
      }

      const transformedTickets = ticketsData.map((ticket) => {
        const ticketCategory = mapStatusToCategory(ticket.status);

        return {
          id: ticket.id,
          sender:
            ticket.anonymous === true
              ? 'Anonim'
              : ticket.nama || ticket.name || 'Tidak diketahui',
          email:
            ticket.anonymous === true
              ? 'anonim@email.com'
              : ticket.email || 'tidak diketahui',
          date: formatDate(ticket.created_at),
          originalDate: ticket.updated_at || ticket.created_at,
          subject: ticket.judul || ticket.title || 'Tidak ada judul',
          category: ticketCategory,
          categoryType: ticket.category?.name || 'Umum',
          subCategory: ticket.sub_category?.name || 'Umum',

          // ✅ isRead menggunakan status-specific clicked tracking
          isRead:
            ticket.read_by_student === true ||
            ticket.read_by_student === 1 ||
            ticket.read_by_student === '1',
          isClickedForCurrentStatus:
            clickedTicketsByStatus[ticketCategory]?.has(ticket.id) || false,

          status: ticket.status,
          priority: ticket.priority || 'medium',
          description: ticket.deskripsi || ticket.description || '',
          nim: ticket.nim || '',
          prodi: ticket.prodi || '',
          semester: ticket.semester || '',
          noHp: ticket.no_hp || '',
          anonymous: ticket.anonymous === true || ticket.anonymous === 1,
          readByAdmin:
            ticket.read_by_admin === true ||
            ticket.read_by_admin === 1 ||
            ticket.read_by_admin === '1',
          readByDisposisi:
            ticket.read_by_disposisi === true ||
            ticket.read_by_disposisi === 1 ||
            ticket.read_by_disposisi === '1',
          assignedTo: ticket.assigned_to,
          lastUpdated: ticket.updated_at,
        };
      });

      setTickets(transformedTickets);
      setOriginalTickets(transformedTickets);
      // Update tracking maps
      setLastStatusCheck((prev) => {
        const newMap = new Map(prev);
        transformedTickets.forEach((ticket) => {
          newMap.set(ticket.id, ticket.status);
        });
        return newMap;
      });

      setLastFeedbackCheck((prev) => {
        const newMap = new Map(prev);
        transformedTickets.forEach((ticket) => {
          newMap.set(ticket.id, feedbackCounts[ticket.id]?.total || 0);
        });
        return newMap;
      });
    } catch (error) {
      setError('Gagal memuat data tiket: ' + error.message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketClick = async (ticketId) => {
    const clickedTicket = tickets.find((t) => t.id === ticketId);
    if (!clickedTicket) {
      navigate(`/ticket/${ticketId}`);
      return;
    }

    try {
      const ticketStatus = clickedTicket.category; // 'Tiket Baru', 'Sedang Diproses', 'Selesai'

      // 🔧 KUNCI: Update clicked tracking per status
      setClickedTicketsByStatus((prevClicked) => {
        const newClicked = {
          'Tiket Baru': new Set(prevClicked['Tiket Baru']),
          'Sedang Diproses': new Set(prevClicked['Sedang Diproses']),
          Selesai: new Set(prevClicked['Selesai']),
        };

        // Hanya tambah ke status yang diklik
        newClicked[ticketStatus].add(ticketId);

        // Simpan ke localStorage
        if (user?.id) {
          const saveData = {
            'Tiket Baru': [...newClicked['Tiket Baru']],
            'Sedang Diproses': [...newClicked['Sedang Diproses']],
            Selesai: [...newClicked['Selesai']],
          };
          localStorage.setItem(
            `clickedTicketsByStatus_${user.id}`,
            JSON.stringify(saveData)
          );
        }

        return newClicked;
      });

      // Update tracking
      setLastStatusCheck((prev) => {
        const newMap = new Map(prev);
        newMap.set(ticketId, clickedTicket.status);
        return newMap;
      });

      setLastFeedbackCheck((prev) => {
        const newMap = new Map(prev);
        const currentFeedbackCount = feedbackCounts[ticketId]?.total || 0;
        newMap.set(ticketId, currentFeedbackCount);
        return newMap;
      });

      navigate(`/ticket/${ticketId}`);
    } catch (error) {
      console.error('❌ Error in handleTicketClick:', error);
      navigate(`/ticket/${ticketId}`);
    }
  };

  const handleFeedbackClick = (ticketId, e) => {
    e.stopPropagation();
    navigate(`/ticket/${ticketId}/feedback`);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleMarkAsRead = async () => {
    // ✅ Update per status
    setClickedTicketsByStatus((prev) => {
      const newClicked = {
        'Tiket Baru': new Set(prev['Tiket Baru']),
        'Sedang Diproses': new Set(prev['Sedang Diproses']),
        Selesai: new Set(prev['Selesai']),
      };

      // Add selected tickets to appropriate status
      selectedTickets.forEach((ticketId) => {
        const ticket = tickets.find((t) => t.id === ticketId);
        if (ticket) {
          newClicked[ticket.category].add(ticketId);
        }
      });

      return newClicked;
    });

    setTickets((prev) =>
      prev.map((ticket) =>
        selectedTickets.includes(ticket.id)
          ? { ...ticket, isRead: true }
          : ticket
      )
    );

    setSelectedTickets([]);
    addToast('Tiket berhasil ditandai sebagai dibaca', 'success');
  };

  const handleDeleteTickets = () => {
    if (selectedTickets.length === 0) {
      addToast('Pilih tiket yang ingin dihapus', 'warning');
      return;
    }
  };

  const handleCategoryFilterChange = (value) => {
    setCategoryFilter(value);
  };

  const handleDateFilterApply = () => {
    setShowDatePicker(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Memuat tiket...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tiket Saya</h1>
          <p className="text-white mt-1">
            Temukan tiket yang sudah kamu sampaikan
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-lg shadow min-h-[600px]">
        <Navigation topOffset="">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
            {/* 🔧 SEARCH BOX - Tetap di Kiri */}
            <div className="relative flex-1 min-w-[250px] max-w-[400px]">
              <SearchBar
                placeholder="Cari id / judul / nama mahasiswa"
                onSearch={handleSearch}
                onClear={handleClearSearch}
                disabled={loading}
                className="w-full"
                initialValue={searchQuery}
                debounceMs={150}
              />
              {/* Search Icon */}
              <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* 🔧 FILTER GROUP - Di Kanan (Updated dengan styling admin) */}
            <div className="flex items-center space-x-3">
              {/* Search Bar - Updated styling */}

              {/* Kategori Dropdown - Updated styling */}
              <div className="relative category-dropdown">
                <Button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className={`border-2 border-gray-400 text-sm px-3 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                    categoryFilter !== 'Semua Kategori'
                      ? 'bg-red-200 font-semibold'
                      : 'bg-white hover:bg-red-100'
                  }`}
                >
                  {/* Bookmark/Category Icon */}
                  <svg
                    width="17"
                    height="20"
                    viewBox="0 0 17 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 20V1.875C0 0.839453 0.95138 0 2.125 0H14.875C16.0486 0 17 0.839453 17 1.875V20L8.5 15.625L0 20Z"
                      fill="#444746"
                    />
                  </svg>
                  <span>{categoryFilter}</span>
                  {/* Dropdown Icon */}
                  <svg
                    width="11"
                    height="8"
                    viewBox="0 0 11 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 0.9375H10.27L5.135 7.0675L0 0.9375Z"
                      fill="black"
                    />
                  </svg>
                </Button>

                {showCategoryDropdown && (
                  <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20 transform transition-all duration-300 ease-out origin-top opacity-100 scale-100 translate-y-0">
                    <Button
                      onClick={() => {
                        setCategoryFilter('Semua Kategori');
                        setShowCategoryDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      Semua Kategori
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        onClick={() => {
                          setCategoryFilter(category.name);
                          setShowCategoryDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Range Picker - Updated styling */}
              <div className="relative date-picker-container">
                <Button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className={`border-2 border-gray-400 text-sm px-3 py-2 shadow-gray-300 shadow-md rounded-lg flex items-center space-x-2 transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                    dateRangeFilter.startDate && dateRangeFilter.endDate
                      ? 'bg-red-200 font-semibold'
                      : 'bg-white hover:bg-red-100'
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    className="w-4 h-4"
                  >
                    <path
                      fill="currentColor"
                      d="M5.673 0a.7.7 0 0 1 .7.7v1.309h7.517v-1.3a.7.7 0 0 1 1.4 0v1.3H18a2 2 0 0 1 2 1.999v13.993A2 2 0 0 1 18 20H2a2 2 0 0 1-2-1.999V4.008a2 2 0 0 1 2-1.999h2.973V.699a.7.7 0 0 1 .7-.699M1.4 7.742v10.259a.6.6 0 0 0 .6.6h16a.6.6 0 0 0 .6-.6V7.756zm5.267 6.877v1.666H5v-1.666zm4.166 0v1.666H9.167v-1.666zm4.167 0v1.666h-1.667v-1.666zm-8.333-3.977v1.666H5v-1.666zm4.166 0v1.666H9.167v-1.666zm4.167 0v1.666h-1.667v-1.666zM4.973 3.408H2a.6.6 0 0 0-.6.6v2.335l17.2.014V4.008a.6.6 0 0 0-.6-.6h-2.71v.929a.7.7 0 0 1-1.4 0v-.929H6.373v.92a.7.7 0 0 1-1.4 0z"
                    />
                  </svg>
                  <span>
                    {dateRangeFilter.startDate && dateRangeFilter.endDate
                      ? `${dateRangeFilter.startDate} - ${dateRangeFilter.endDate}`
                      : 'Pilih Rentang'}
                  </span>
                  <svg
                    width="11"
                    height="8"
                    viewBox="0 0 11 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 0.9375H10.27L5.135 7.0675L0 0.9375Z"
                      fill="black"
                    />
                  </svg>
                </Button>

                {/* Date Picker Dropdown - Enhanced styling */}
                {showDatePicker && (
                  <div className="absolute top-full left-0 mt-2 w-[500px] bg-white rounded-lg shadow-xl z-50 transform transition-all duration-300 ease-out origin-top-left opacity-100 scale-100 translate-y-0">
                    {/* Header with close Button */}
                    <div className="bg-[#101B33] text-white p-4 rounded-t-lg flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <svg
                          width="21"
                          height="20"
                          viewBox="0 0 21 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0.5 18.125C0.5 19.1602 1.45982 20 2.64286 20H18.3571C19.5402 20 20.5 19.1602 20.5 18.125V7.5H0.5V18.125ZM14.7857 10.4688C14.7857 10.2109 15.0268 10 15.3214 10H17.1071C17.4018 10 17.6429 10.2109 17.6429 10.4688V12.0313C17.6429 12.2891 17.4018 12.5 17.1071 12.5H15.3214C15.0268 12.5 14.7857 12.2891 14.7857 12.0313V10.4688ZM14.7857 15.4688C14.7857 15.2109 15.0268 15 15.3214 15H17.1071C17.4018 15 17.6429 15.2109 17.6429 15.4688V17.0312C17.6429 17.2891 17.4018 17.5 17.1071 17.5H15.3214C15.0268 17.5 14.7857 17.2891 14.7857 17.0312V15.4688ZM9.07143 10.4688C9.07143 10.2109 9.3125 10 9.60714 10H11.3929C11.6875 10 11.9286 10.2109 11.9286 10.4688V12.0313C11.9286 12.2891 11.6875 12.5 11.3929 12.5H9.60714C9.3125 12.5 9.07143 12.2891 9.07143 12.0313V10.4688ZM9.07143 15.4688C9.07143 15.2109 9.3125 15 9.60714 15H11.3929C11.6875 15 11.9286 15.2109 11.9286 15.4688V17.0312C11.9286 17.2891 11.6875 17.5 11.3929 17.5H9.60714C9.3125 17.5 9.07143 17.2891 9.07143 17.0312V15.4688ZM3.35714 10.4688C3.35714 10.2109 3.59821 10 3.89286 10H5.67857C5.97321 10 6.21429 10.2109 6.21429 10.4688V12.0313C6.21429 12.2891 5.97321 12.5 5.67857 12.5H3.89286C3.59821 12.5 3.35714 12.2891 3.35714 12.0313V10.4688ZM3.35714 15.4688C3.35714 15.2109 3.59821 15 3.89286 15H5.67857C5.97321 15 6.21429 15.2109 6.21429 15.4688V17.0312C6.21429 17.2891 5.97321 17.5 5.67857 17.5H3.89286C3.59821 17.5 3.35714 17.2891 3.35714 17.0312V15.4688ZM18.3571 2.5H16.2143V0.625C16.2143 0.28125 15.8929 0 15.5 0H14.0714C13.6786 0 13.3571 0.28125 13.3571 0.625V2.5H7.64286V0.625C7.64286 0.28125 7.32143 0 6.92857 0H5.5C5.10714 0 4.78571 0.28125 4.78571 0.625V2.5H2.64286C1.45982 2.5 0.5 3.33984 0.5 4.375V6.25H20.5V4.375C20.5 3.33984 19.5402 2.5 18.3571 2.5Z"
                            fill="white"
                          />
                        </svg>
                        <div>
                          <div className="font-bold text-lg">
                            Pilih Rentang - Tiket Saya
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowDatePicker(false)}
                        className="text-white hover:bg-white/20 rounded p-1 transition-colors"
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
                      </Button>
                    </div>

                    {/* Form content */}
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">
                            Tanggal Mulai{' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              value={dateRangeFilter.startDate}
                              onChange={(e) =>
                                setDateRangeFilter((prev) => ({
                                  ...prev,
                                  startDate: e.target.value,
                                }))
                              }
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <svg
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
                              viewBox="0 0 21 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M0.5 18.125C0.5 19.1602 1.45982 20 2.64286 20H18.3571C19.5402 20 20.5 19.1602 20.5 18.125V7.5H0.5V18.125Z..."
                                fill="#444746"
                              />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">
                            Sampai Tanggal{' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              value={dateRangeFilter.endDate}
                              onChange={(e) =>
                                setDateRangeFilter((prev) => ({
                                  ...prev,
                                  endDate: e.target.value,
                                }))
                              }
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <svg
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
                              viewBox="0 0 21 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M0.5 18.125C0.5 19.1602 1.45982 20 2.64286 20H18.3571C19.5402 20 20.5 19.1602 20.5 18.125V7.5H0.5V18.125Z..."
                                fill="#444746"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-end space-x-3">
                          <Button
                            onClick={() => {
                              setDateRangeFilter({
                                startDate: '',
                                endDate: '',
                              });
                            }}
                            className="border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center space-x-2"
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
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            <span>Clear</span>
                          </Button>
                          <Button
                            onClick={handleDateFilterApply}
                            className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                          >
                            Terapkan
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Read Status Filter - Updated styling */}
              <div className="relative">
                <Button
                  className={`border-2 border-gray-400 text-sm px-3 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                    readFilter !== 'Semua' && readFilter !== 'Belum Dibaca'
                      ? 'bg-red-200 font-semibold'
                      : 'bg-white hover:bg-red-100'
                  }`}
                  onClick={() => setShowReadDropdown(!showReadDropdown)}
                >
                  <svg
                    width="21"
                    height="20"
                    viewBox="0 0 21 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="currentColor"
                      d="M1.73177 3.75C1.67652 3.75 1.62353 3.77195 1.58446 3.81102C1.54539 3.85009 1.52344 3.90308 1.52344 3.95833V4.66833L10.1568 10.5017C10.1912 10.525 10.2319 10.5374 10.2734 10.5374C10.315 10.5374 10.3557 10.525 10.3901 10.5017L15.1318 7.2975C15.2691 7.20467 15.4377 7.17022 15.6005 7.20171C15.7633 7.2332 15.9069 7.32806 15.9997 7.46542C16.0925 7.60278 16.127 7.77139 16.0955 7.93415C16.064 8.09692 15.9691 8.24051 15.8318 8.33333L11.0901 11.5375C10.5968 11.8708 9.9501 11.8708 9.45677 11.5375L1.52344 6.17667V16.0417C1.52344 16.1567 1.61677 16.25 1.73177 16.25H18.8151C18.8704 16.25 18.9233 16.2281 18.9624 16.189C19.0015 16.1499 19.0234 16.0969 19.0234 16.0417V8.95833C19.0234 8.79257 19.0893 8.6336 19.2065 8.51639C19.3237 8.39918 19.4827 8.33333 19.6484 8.33333C19.8142 8.33333 19.9732 8.39918 20.0904 8.51639C20.2076 8.6336 20.2734 8.79257 20.2734 8.95833V16.0417C20.2734 16.4284 20.1198 16.7994 19.8463 17.0729C19.5728 17.3464 19.2019 17.5 18.8151 17.5H1.73177C1.345 17.5 0.974064 17.3464 0.700573 17.0729C0.427083 16.7994 0.273438 16.4284 0.273438 16.0417L0.273438 3.95833C0.273438 3.15333 0.926771 2.5 1.73177 2.5H14.6484C14.8142 2.5 14.9732 2.56585 15.0904 2.68306C15.2076 2.80027 15.2734 2.95924 15.2734 3.125C15.2734 3.29076 15.2076 3.44973 15.0904 3.56694C14.9732 3.68415 14.8142 3.75 14.6484 3.75H1.73177Z"
                    />
                    <path
                      fill="currentColor"
                      d="M20.276 4.58333C20.276 5.13587 20.0565 5.66577 19.6658 6.05647C19.2751 6.44717 18.7452 6.66667 18.1927 6.66667C17.6402 6.66667 17.1103 6.44717 16.7196 6.05647C16.3289 5.66577 16.1094 5.13587 16.1094 4.58333C16.1094 4.0308 16.3289 3.5009 16.7196 3.11019C17.1103 2.71949 17.6402 2.5 18.1927 2.5C18.7452 2.5 19.2751 2.71949 19.6658 3.11019C20.0565 3.5009 20.276 4.0308 20.276 4.58333Z"
                    />
                  </svg>
                  <span>{readFilter || 'Belum Dibaca'}</span>
                  <svg
                    width="11"
                    height="8"
                    viewBox="0 0 11 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 0.9375H10.27L5.135 7.0675L0 0.9375Z"
                      fill="black"
                    />
                  </svg>

                  {/* Badge untuk belum dibaca */}
                  {(() => {
                    const unreadCount = tickets.filter((ticket) => {
                      const isUnreadFromAPI = !(
                        ticket.read_by_student === true ||
                        ticket.read_by_student === 1 ||
                        ticket.read_by_student === '1'
                      );
                      const notClickedForThisStatus = !clickedTicketsByStatus[
                        ticket.category
                      ]?.has(ticket.id);
                      return isUnreadFromAPI && notClickedForThisStatus;
                    }).length;

                    return unreadCount > 0 && readFilter === 'Semua' ? (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-1">
                        {unreadCount}
                      </span>
                    ) : null;
                  })()}
                </Button>

                {/* Dropdown Menu */}
                {showReadDropdown && (
                  <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20 transform transition-all duration-300 ease-out origin-top opacity-100 scale-100 translate-y-0">
                    {['Semua', 'Sudah Dibaca', 'Belum Dibaca'].map((option) => (
                      <Button
                        key={option}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                          readFilter === option
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700'
                        }`}
                        onClick={() => {
                          setReadFilter(option);
                          setShowReadDropdown(false);
                        }}
                      >
                        {option}
                        {option === 'Belum Dibaca' &&
                          (() => {
                            const unreadCount = tickets.filter((ticket) => {
                              const isUnreadFromAPI = !(
                                ticket.read_by_student === true ||
                                ticket.read_by_student === 1 ||
                                ticket.read_by_student === '1'
                              );
                              const notClickedForThisStatus =
                                !clickedTicketsByStatus[ticket.category]?.has(
                                  ticket.id
                                );
                              return isUnreadFromAPI && notClickedForThisStatus;
                            }).length;

                            return unreadCount > 0 ? (
                              <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                {unreadCount}
                              </span>
                            ) : null;
                          })()}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Reset Filter Button - Updated styling */}
              <Button
                className="border-2 border-gray-400 text-sm px-3 py-2 shadow-gray-300 shadow-md rounded-lg flex items-center space-x-2 hover:bg-red-100 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out transform"
                onClick={handleResetFilter}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  className="w-4 h-4"
                >
                  <path
                    fill="currentColor"
                    d="M22.5 9a7.45 7.45 0 0 0-6.5 3.792V8h-2v8h8v-2h-4.383a5.494 5.494 0 1 1 4.883 8H22v2h.5a7.5 7.5 0 0 0 0-15"
                  />
                  <path
                    fill="currentColor"
                    d="M26 6H4v3.171l7.414 7.414l.586.586V26h4v-2h2v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-8l-7.414-7.415A2 2 0 0 1 2 9.171V6a2 2 0 0 1 2-2h22Z"
                  />
                </svg>
                <span>Reset Filter</span>
              </Button>
            </div>
          </div>

          {/* Status Tabs - Layout Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            <Button
              onClick={handleRefresh}
              disabled={refreshLoading}
              className="flex items-center space-x-2 px-8 py-2 bg-white text-black rounded-lg transition-colors   "
            >
              <svg
                className={`w-6 h-6 ${refreshLoading ? 'animate-spin' : ''}`}
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
              <span>{refreshLoading}</span>
            </Button>
            <FilterButton
              label="Semua Tiket"
              count={ticketCounts.total}
              active={statusFilter === 'Semua'}
              onClick={() => handleStatusFilterClick('Semua')}
              statusType="Semua"
              hasNew={false} // Semua tiket tidak perlu badge
            />
            <FilterButton
              label="Tiket Baru"
              count={ticketCounts.new}
              active={statusFilter === 'Tiket Baru'}
              onClick={() => handleStatusFilterClick('Tiket Baru')}
              statusType="Tiket Baru"
              hasNew={shouldShowBadge(
                'Tiket Baru',
                tickets,
                clickedTicketsByStatus
              )} // ✅ Pass clickedTicketsByStatus
            />
            <FilterButton
              label="Sedang Diproses"
              count={ticketCounts.processing}
              active={statusFilter === 'Sedang Diproses'}
              onClick={() => handleStatusFilterClick('Sedang Diproses')}
              statusType="Sedang Diproses"
              hasNew={shouldShowBadge(
                'Sedang Diproses',
                tickets,
                clickedTicketsByStatus
              )} // ✅ Pass clickedTicketsByStatus
            />
            <FilterButton
              label="Selesai"
              count={ticketCounts.completed}
              active={statusFilter === 'Selesai'}
              onClick={() => handleStatusFilterClick('Selesai')}
              statusType="Selesai"
              hasNew={shouldShowBadge(
                'Selesai',
                tickets,
                clickedTicketsByStatus
              )} // ✅ Pass clickedTicketsByStatus
            />
          </div>
        </Navigation>
        {/* Filter Section */}

        {/* Ticket List - NEW DESIGN */}
        {currentTickets.map((ticket, index) => (
          <div
            key={`${ticket.id}-${index}`}
            className={`px-4 py-4 border-b border-l-8 hover:bg-gray-50 transition-colors cursor-pointer ${getStatusBorderColor(
              ticket.category
            )} ${(() => {
              const isUnreadFromAPI = !(
                ticket.read_by_student === true ||
                ticket.read_by_student === 1 ||
                ticket.read_by_student === '1'
              );
              const notClickedForThisStatus = !clickedTicketsByStatus[
                ticket.category
              ]?.has(ticket.id);
              const isUnreadForThisStatus =
                isUnreadFromAPI && notClickedForThisStatus;

              if (isUnreadForThisStatus) {
                return getStatusBgColor(ticket.category);
              } else if (feedbackCounts[ticket.id]?.unread > 0) {
                return 'bg-yellow-50';
              } else {
                return '';
              }
            })()} ${selectedTickets.includes(ticket.id) ? 'bg-blue-100' : ''}`}
            onClick={() => handleTicketClick(ticket.id)}
          >
            {/* Top Row - ID, Date, and Checkbox */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {/* Ticket ID */}
                <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  #{ticket.id}
                </span>
              </div>

              {/* Date - Right aligned */}
              <div className="text-sm text-gray-500">{ticket.date}</div>
            </div>

            {/* Second Row - Sender, Status, Category */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                {/* Sender Info with Icon */}
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
                    {ticket.sender}
                    {ticket.nim && (
                      <span className="text-gray-500">, {ticket.nim}</span>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    ticket.category === 'Tiket Baru'
                      ? 'bg-blue-100 text-blue-800' // 🔧 FIX: Ubah dari orange ke blue
                      : ticket.category === 'Sedang Diproses'
                        ? 'bg-orange-100 text-orange-800' // 🔧 FIX: Ubah dari blue ke orange
                        : ticket.category === 'Selesai'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {ticket.category === 'Sedang Diproses'
                    ? 'Sedang Diproses'
                    : ticket.category === 'Selesai'
                      ? 'Selesai'
                      : 'Tiket Baru'}
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
                {ticket.subject}
              </h3>
            </div>

            {/* Bottom Row - Feedback Button and Read Status */}
            <div className="flex items-center justify-between">
              {/* Feedback Button - FIXED */}
              <Button
                onClick={(e) => handleFeedbackClick(ticket.id, e)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border shadow-lg transition-colors ${(() => {
                  const unreadCount = feedbackCounts[ticket.id]?.unread || 0;

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
              </Button>

              {/* Read Status Indicators */}
              <div className="flex items-center space-x-2">
                {ticket.readByAdmin && (
                  <span
                    className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-medium"
                    title="Dibaca Admin"
                  >
                    A
                  </span>
                )}
                {ticket.readByDisposisi && (
                  <span
                    className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-medium"
                    title="Dibaca Disposisi"
                  >
                    D
                  </span>
                )}
                {(() => {
                  const isUnreadFromAPI = !(
                    ticket.read_by_student === true ||
                    ticket.read_by_student === 1 ||
                    ticket.read_by_student === '1'
                  );
                  const notClickedForThisStatus = !clickedTicketsByStatus[
                    ticket.category
                  ]?.has(ticket.id);
                  const isUnreadForThisStatus =
                    isUnreadFromAPI && notClickedForThisStatus;

                  return isUnreadForThisStatus ? (
                    <span
                      className="w-3 h-3 bg-blue-500 rounded-full"
                      title="Belum Dibaca"
                    ></span>
                  ) : null;
                })()}
              </div>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {filteredTickets.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <svg
              className="w-12 h-12 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414-2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-lg font-medium">Tidak ada tiket</p>
            <p className="text-sm">
              {statusFilter === 'Semua'
                ? 'Belum ada tiket yang dibuat'
                : `Belum ada tiket untuk kategori ${statusFilter}`}
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredTickets.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Menampilkan{' '}
                <span className="font-medium">{startIndex + 1}</span> sampai{' '}
                <span className="font-medium">
                  {Math.min(endIndex, filteredTickets.length)}
                </span>{' '}
                dari{' '}
                <span className="font-medium">{filteredTickets.length}</span>{' '}
                hasil
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <Button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </Button>

              {/* Page Numbers */}
              <div className="flex space-x-1">
                {(() => {
                  const pages = [];
                  const showEllipsisStart = currentPage > 3;
                  const showEllipsisEnd = currentPage < totalPages - 2;

                  // First page
                  if (showEllipsisStart) {
                    pages.push(
                      <Button
                        key={1}
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        1
                      </Button>
                    );

                    if (currentPage > 4) {
                      pages.push(
                        <span
                          key="ellipsis-start"
                          className="px-3 py-1 text-sm font-medium text-gray-500"
                        >
                          ...
                        </span>
                      );
                    }
                  }

                  // Current page range
                  const start = Math.max(1, currentPage - 2);
                  const end = Math.min(totalPages, currentPage + 2);

                  for (let pageNum = start; pageNum <= end; pageNum++) {
                    pages.push(
                      <Button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                          pageNum === currentPage
                            ? 'text-white bg-blue-600 border border-blue-600'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  }

                  // Last page
                  if (showEllipsisEnd) {
                    if (currentPage < totalPages - 3) {
                      pages.push(
                        <span
                          key="ellipsis-end"
                          className="px-3 py-1 text-sm font-medium text-gray-500"
                        >
                          ...
                        </span>
                      );
                    }

                    pages.push(
                      <Button
                        key={totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        {totalPages}
                      </Button>
                    );
                  }

                  return pages;
                })()}
              </div>

              {/* Next Button */}
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default StudentDashboard;
