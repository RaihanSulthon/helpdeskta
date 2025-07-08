// src/pages/admin/AdminDashboard.jsx - Real API Integration with Drag & Drop
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminTicketsAPI,
  updateTicketStatusAPI,
  getCategoriesAPI,
  deleteTicketAPI,
} from '../../services/api';
import TicketColumn from '../../components/TicketColumn';
import { ToastContainer } from '../../components/Toast';
import SearchBar from '../../components/SearchBar';
import Navigation from '../../components/Navigation';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const saveFiltersToStorage = (filters) => {
    try {
      localStorage.setItem('adminDashboardFilters', JSON.stringify(filters));
    } catch (error) {
      console.warn('Failed to save filters to localStorage:', error);
    }
  };

  const loadFiltersFromStorage = () => {
    try {
      const saved = localStorage.getItem('adminDashboardFilters');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load filters from localStorage:', error);
    }
    return {
      selectedCategory: '',
      selectedDateRange: '',
      unreadFilter: '',
      customDateRange: { startDate: '', endDate: '' },
      statusFilter: 'Semua',
    };
  };

  const clearPersistedFilters = () => {
    localStorage.removeItem('adminDashboardFilters');
  };

  // 1. ALL STATE DEFINITIONS
  const initialFilters = loadFiltersFromStorage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draggedTicket, setDraggedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState(initialFilters.statusFilter);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [dropPosition, setDropPosition] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    initialFilters.selectedCategory
  );
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState(
    initialFilters.selectedDateRange
  );
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showUnreadDropdown, setShowUnreadDropdown] = useState(false);
  const [unreadFilter, setUnreadFilter] = useState(initialFilters.unreadFilter);
  const [customDateRange, setCustomDateRange] = useState(
    initialFilters.customDateRange
  );
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [isCategoryDropdownVisible, setIsCategoryDropdownVisible] =
    useState(false);
  const [isDateDropdownVisible, setIsDateDropdownVisible] = useState(false);
  const [isUnreadDropdownVisible, setIsUnreadDropdownVisible] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tickets, setTickets] = useState({
    'tiket-baru': [],
    diproses: [],
    selesai: [],
  });
  const [originalTickets, setOriginalTickets] = useState({
    'tiket-baru': [],
    diproses: [],
    selesai: [],
  });

  // 2. HELPER FUNCTIONS (defined first)
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
      });
    } catch (error) {
      return 'Tanggal tidak valid';
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

  // Map API status to display category
  const mapStatusToCategory = (status) => {
    if (!status) return 'TAK';

    switch (status.toLowerCase()) {
      case 'pending':
      case 'new':
      case 'open':
        return 'TAK';
      case 'in_progress':
      case 'processing':
      case 'assigned':
        return 'PROSES';
      case 'completed':
      case 'resolved':
      case 'closed':
        return 'SELESAI';
      default:
        return 'TAK';
    }
  };

  // Map API status to kanban column - UPDATED
  const mapStatusToColumn = (status) => {
    if (!status) return 'tiket-baru';

    switch (status.toLowerCase()) {
      case 'pending':
      case 'new':
      case 'open':
        return 'tiket-baru';
      case 'in_progress':
      case 'processing':
      case 'assigned':
        return 'diproses';
      case 'completed':
      case 'resolved':
      case 'closed':
        return 'selesai';
      default:
        return 'tiket-baru';
    }
  };

  // Map column to API status - FIXED
  const mapColumnToStatus = (column) => {
    switch (column) {
      case 'tiket-baru':
        return 'open';
      case 'diproses':
        return 'in_progress';
      case 'selesai':
        return 'closed'; // Try "closed" instead of "completed"
      default:
        return 'open';
    }
  };

  // Transform API ticket data to component format
  const transformTicketData = (ticket) => {
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
      subject: ticket.judul || ticket.title || 'Tidak ada judul',
      category: mapStatusToCategory(ticket.status),
      categoryType: ticket.category?.name || 'Umum',
      subCategory: ticket.sub_category?.name || 'Umum',
      priority: ticket.priority || 'medium',
      isRead: ticket.read_by_admin === true || ticket.read_by_admin === 1,
      status: ticket.status,
      rawTicket: ticket, // Keep original data for reference
      // Additional admin fields
      nim: ticket.nim || '',
      prodi: ticket.prodi || '',
      semester: ticket.semester || '',
      noHp: ticket.no_hp || '',
      anonymous: ticket.anonymous === true || ticket.anonymous === 1,
      readByAdmin: ticket.read_by_admin === true || ticket.read_by_admin === 1,
      readByDisposisi:
        ticket.read_by_disposisi === true || ticket.read_by_disposisi === 1,
      readByStudent:
        ticket.read_by_student === true || ticket.read_by_student === 1,
      assignedTo: ticket.assigned_to,
      feedback: Math.floor(Math.random() * 5) + 1, // Mock feedback for now
      feedbackType: 'warning', // Mock feedback type
    };
  };

  // 3. FILTERING FUNCTIONS (after helper functions)
  // Filter tickets based on selected filters
  const getFilteredTickets = (tickets) => {
    let filtered = tickets;

    // Filter by category
    if (selectedCategory && selectedCategory !== '') {
      filtered = filtered.filter((ticket) => {
        // Check both categoryType and raw ticket category name
        const categoryMatches =
          ticket.categoryType === selectedCategory ||
          ticket.rawTicket?.category?.name === selectedCategory;

        return categoryMatches;
      });
    }

    // Filter by date range
    if (
      selectedDateRange &&
      selectedDateRange !== '' &&
      selectedDateRange !== 'Pilih Rentang'
    ) {
      if (selectedDateRange.includes(' - ')) {
        // Custom date range (format: "YYYY-MM-DD - YYYY-MM-DD")
        const [startDateStr, endDateStr] = selectedDateRange.split(' - ');
        const startDate = new Date(startDateStr + 'T00:00:00'); // Start of day
        const endDate = new Date(endDateStr + 'T23:59:59'); // End of day

        filtered = filtered.filter((ticket) => {
          const ticketDate = new Date(ticket.rawTicket?.created_at);
          const isInRange = ticketDate >= startDate && ticketDate <= endDate;
          return isInRange;
        });
      }
    }

    // Filter by read status
    if (unreadFilter && unreadFilter !== '') {
      if (unreadFilter === 'Belum Dibaca') {
        filtered = filtered.filter((ticket) => {
          const isUnread = !ticket.isRead && !ticket.readByAdmin;
          return isUnread;
        });
      } else if (unreadFilter === 'Sudah Dibaca') {
        filtered = filtered.filter((ticket) => {
          const isRead = ticket.isRead || ticket.readByAdmin;
          return isRead;
        });
      }
    }
    return filtered;
  };

  // Apply filtering to all tickets and regroup by status
  const applyFiltersToTickets = () => {
    // Get all tickets from all columns
    const allTickets = [
      ...tickets['tiket-baru'],
      ...tickets['diproses'],
      ...tickets['selesai'],
    ];

    // Apply filters
    const filteredTickets = getFilteredTickets(allTickets);

    // Regroup filtered tickets by status/column
    const regrouped = {
      'tiket-baru': [],
      diproses: [],
      selesai: [],
    };

    filteredTickets.forEach((ticket) => {
      const status = mapStatusToColumn(ticket.status);
      if (regrouped[status]) {
        regrouped[status].push(ticket);
      }
    });

    return regrouped;
  };

  // 4. COMPUTED VALUES (after all functions are defined)
  const filteredTickets = applyFiltersToTickets();
  // const ticketCounts = getTicketCounts();

  const columnConfig = {
    'tiket-baru': {
      title: 'TIKET BARU',
      count: filteredTickets['tiket-baru'].length,
      bgColor: 'bg-red-700',
      textColor: 'text-white',
    },
    diproses: {
      title: 'DIPROSES',
      count: filteredTickets['diproses'].length,
      bgColor: 'bg-red-700',
      textColor: 'text-white',
    },
    selesai: {
      title: 'SELESAI',
      count: filteredTickets['selesai'].length,
      bgColor: 'bg-red-700',
      textColor: 'text-white',
    },
  };

  // Add this new function after other utility functions
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

        const result = await getAdminTicketsAPI(filters);

        if (Array.isArray(result)) {
          // Group tickets by status dari server
          const serverGroupedTickets = {
            'tiket-baru': [],
            diproses: [],
            selesai: [],
          };

          result.forEach((ticket) => {
            const transformedTicket = transformTicketData(ticket);
            const status = mapStatusToColumn(ticket.status);

            if (serverGroupedTickets[status]) {
              serverGroupedTickets[status].push(transformedTicket);
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

  const handleClearSearch = async () => {
    setSearchQuery('');
    setTickets(originalTickets);
    setError('');
  };

  const handleDeleteTicket = (ticket) => {
    setTicketToDelete(ticket);
    setShowDeleteModal(true);
  };

  const confirmDeleteTicket = async () => {
    if (!ticketToDelete) return;

    try {
      setIsDeleting(true);

      console.log('Deleting ticket:', ticketToDelete.id);

      // Call the delete API
      const result = await deleteTicketAPI(ticketToDelete.id);

      console.log('Delete result:', result);

      if (result.success) {
        // Show success toast
        addToast('Tiket berhasil dihapus', 'success', 3000);

        // Refresh tickets
        await loadAdminTickets();
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      addToast('Gagal menghapus tiket: ' + error.message, 'error', 5000);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setTicketToDelete(null);
    }
  };

  const cancelDeleteTicket = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setTicketToDelete(null);
    }
  };

  // 5. USE EFFECTS
  // Load tickets on component mount
  useEffect(() => {
    loadAdminTickets();
  }, []);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    const currentFilters = {
      selectedCategory,
      selectedDateRange,
      unreadFilter,
      statusFilter,
      customDateRange,
    };
    saveFiltersToStorage(currentFilters);

    // Reload tickets when filters change (except search)
    if (!searchQuery) {
      loadAdminTickets();
    }
  }, [
    selectedCategory,
    selectedDateRange,
    unreadFilter,
    statusFilter,
    customDateRange,
  ]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategoriesAPI();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const categoryDropdown = event.target.closest(
        '[data-dropdown="category"]'
      );
      const dateDropdown = event.target.closest('[data-dropdown="date"]');
      const unreadDropdown = event.target.closest('[data-dropdown="unread"]');

      if (!categoryDropdown && showCategoryDropdown) {
        setShowCategoryDropdown(false);
        setTimeout(() => setIsCategoryDropdownVisible(false), 300);
      }
      if (!dateDropdown && showDateDropdown) {
        setShowDateDropdown(false);
        setTimeout(() => setIsDateDropdownVisible(false), 300);
      }
      if (!unreadDropdown && showUnreadDropdown) {
        setShowUnreadDropdown(false);
        setTimeout(() => setIsUnreadDropdownVisible(false), 300);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryDropdown, showDateDropdown, showUnreadDropdown]);

  // 6. ASYNC FUNCTIONS
  const loadAdminTickets = async () => {
    try {
      setLoading(true);
      setError('');

      const ticketsData = await getAdminTicketsAPI();
      console.log('Received tickets data:', ticketsData);

      // Group tickets by status
      const groupedTickets = {
        'tiket-baru': [],
        diproses: [],
        selesai: [],
      };

      ticketsData.forEach((ticket) => {
        const transformedTicket = transformTicketData(ticket);
        const status = mapStatusToColumn(ticket.status);

        if (groupedTickets[status]) {
          groupedTickets[status].push(transformedTicket);
        }
      });

      // Simpan original data dan current data
      setOriginalTickets(groupedTickets);
      setTickets(groupedTickets);
    } catch (error) {
      console.error('Error loading admin tickets:', error);
      setError('Gagal memuat data tiket: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 7. EVENT HANDLERS
  const handleDragStart = (e, ticket, fromColumn) => {
    // Store drag data immediately
    setDraggedTicket(ticket);
    setDraggedFrom(fromColumn);

    // Set drag effect
    e.dataTransfer.effectAllowed = 'move';

    // Store ticket data for drop handler (backup method)
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        ticketId: ticket.id,
        fromColumn: fromColumn,
      })
    );
  };

  // 2. handleDragOver - COMPLETE VERSION (no changes needed)
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // 3. handleDrop - COMPLETE VERSION
  const handleDrop = async (e, toColumn, insertIndex = null) => {
    e.preventDefault();

    // Get drag data (try both methods)
    let dragData = null;
    try {
      const dataTransferData = e.dataTransfer.getData('application/json');
      if (dataTransferData) {
        dragData = JSON.parse(dataTransferData);
      }
    } catch (error) {
      console.log('No dataTransfer data, using state');
    }

    // Use stored state as primary method
    const ticket = draggedTicket;
    const fromColumn = draggedFrom || (dragData ? dragData.fromColumn : null);

    if (!ticket || !fromColumn) {
      console.log('No ticket or fromColumn found, resetting drag state');
      setDraggedTicket(null);
      setDraggedFrom(null);
      return;
    }

    // Handle same-column reordering (NEW LOGIC)
    if (fromColumn === toColumn) {
      console.log('Same column reordering');

      // Only proceed if we have a valid insertIndex and it's different from current position
      if (insertIndex !== null) {
        setTickets((prev) => {
          const newTickets = { ...prev };
          const currentColumnTickets = [...newTickets[fromColumn]];

          // Find current position of the ticket
          const currentIndex = currentColumnTickets.findIndex(
            (t) => t.id === ticket.id
          );

          if (currentIndex === -1) {
            console.log('Ticket not found in current column');
            return prev;
          }

          // If dropping at the same position, do nothing
          if (
            currentIndex === insertIndex ||
            currentIndex === insertIndex - 1
          ) {
            console.log('Dropping at same position, no change needed');
            return prev;
          }

          // Remove ticket from current position
          const [movedTicket] = currentColumnTickets.splice(currentIndex, 1);

          // Calculate new insert position (adjust if moving from earlier position)
          let newInsertIndex = insertIndex;
          if (currentIndex < insertIndex) {
            newInsertIndex = insertIndex - 1;
          }

          // Insert at new position
          currentColumnTickets.splice(newInsertIndex, 0, movedTicket);

          // Update the column
          newTickets[fromColumn] = currentColumnTickets;

          return newTickets;
        });

        console.log(`Ticket ${ticket.id} reordered within ${fromColumn}`);
      }

      // Reset drag state
      setDraggedTicket(null);
      setDraggedFrom(null);
      return;
    }

    // Handle cross-column movement (EXISTING LOGIC)
    try {
      setUpdating(ticket.id);
      console.log(
        `Updating ticket ${ticket.id} from ${fromColumn} to ${toColumn}`
      );

      // Get new status for API - try multiple options
      let newStatus = mapColumnToStatus(toColumn);

      // Call API to update status
      try {
        await updateTicketStatusAPI(ticket.id, newStatus);
      } catch (error) {
        // If failed, try alternative status names
        if (toColumn === 'selesai') {
          console.log("Trying alternative status for 'selesai'...");
          try {
            newStatus = 'completed';
            await updateTicketStatusAPI(ticket.id, newStatus);
          } catch (error2) {
            try {
              newStatus = 'resolved';
              await updateTicketStatusAPI(ticket.id, newStatus);
            } catch (error3) {
              throw error; // Throw original error if all fail
            }
          }
        } else {
          throw error;
        }
      }

      // Update local state with proper positioning
      setTickets((prev) => {
        const newTickets = { ...prev };

        // Remove from source column
        newTickets[fromColumn] = newTickets[fromColumn].filter(
          (t) => t.id !== ticket.id
        );

        // Update ticket status
        const updatedTicket = {
          ...ticket,
          status: newStatus,
          category: mapStatusToCategory(newStatus),
        };

        // Add to target column at specific position
        if (
          insertIndex !== null &&
          insertIndex >= 0 &&
          insertIndex <= newTickets[toColumn].length
        ) {
          newTickets[toColumn].splice(insertIndex, 0, updatedTicket);
        } else {
          newTickets[toColumn].push(updatedTicket);
        }

        return newTickets;
      });

      console.log('Ticket status updated successfully to:', newStatus);
      // Toast
      const statusMessage =
        newStatus === 'in_progress'
          ? 'Sedang Diproses'
          : newStatus === 'completed'
            ? 'Selesai'
            : newStatus === 'open'
              ? 'Tiket Baru'
              : newStatus;
      addToast(
        `Status tiket berhasil diperbarui menjadi ${statusMessage}`,
        'success',
        4000
      );
    } catch (error) {
      console.error('Error updating ticket status:', error);
      setError('Gagal mengupdate status tiket: ' + error.message);

      // Show error for 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setUpdating(null);
      setDraggedTicket(null);
      setDraggedFrom(null);
    }
  };

  const handleTicketClick = (ticketId) => {
    navigate(`/ticket/${ticketId}`);
  };

  // 8. UTILITY FUNCTIONS
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'Tinggi';
      case 'medium':
        return 'Sedang';
      case 'low':
        return 'Rendah';
      default:
        return 'Sedang';
    }
  };

  // 10. LOADING STATE
  if (loading) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data tiket admin...</p>
          </div>
        </div>
      </div>
    );
  }

  // 11. MAIN RENDER
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Kelola Tiket</h1>
          </div>
        </div>
      </div>

      {/* Error Alert */}
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

      <div className="bg-white rounded-lg shadow min-h-[600px]">
        {/* Filters */}
        <Navigation topOffset=''>
          <div className="flex items-center gap-4 pt-6">
            <div className="w-80">
              <SearchBar
                placeholder="Cari id / judul / nama mahasiswa"
                onSearch={handleSearch}
                onClear={handleClearSearch}
                disabled={loading}
                className="w-full"
                initialValue={searchQuery}
                debounceMs={150}
              />
            </div>
            <div className="flex items-center space-x-3 ml-auto">
              {/* Category Filter */}
              <div className="relative" data-dropdown="category">
                <button
                  onClick={() => {
                    if (showCategoryDropdown) {
                      setShowCategoryDropdown(false);
                      setTimeout(
                        () => setIsCategoryDropdownVisible(false),
                        300
                      );
                    } else {
                      setIsCategoryDropdownVisible(true);
                      setTimeout(() => setShowCategoryDropdown(true), 10);
                    }
                  }}
                  className={`border-2 border-gray-400 text-sm px-3 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                    selectedCategory
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
                  <span>{selectedCategory || 'Semua Kategori'}</span>

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
                </button>

                {isCategoryDropdownVisible && (
                  <div
                    className={`absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20 transform transition-all duration-300 ease-out origin-top ${
                      showCategoryDropdown
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 -translate-y-2'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedCategory('');
                        setShowCategoryDropdown(false);
                        setTimeout(
                          () => setIsCategoryDropdownVisible(false),
                          300
                        );
                      }}
                      className="w-full text-left px-3 py-2 text-sm"
                    >
                      Semua Kategori
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.name);
                          setShowCategoryDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Range Filter */}
              <div className="relative" data-dropdown="date">
                <button
                  onClick={() => {
                    if (showDateDropdown) {
                      setShowDateDropdown(false);
                      setTimeout(() => setIsDateDropdownVisible(false), 300);
                    } else {
                      setIsDateDropdownVisible(true);
                      setTimeout(() => setShowDateDropdown(true), 10);
                    }
                  }}
                  className={`border-2 border-gray-400 text-sm px-3 py-2 shadow-gray-300 shadow-md rounded-lg flex items-center space-x-2 transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                    selectedDateRange ||
                    (customDateRange.startDate && customDateRange.endDate)
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
                    {customDateRange.startDate && customDateRange.endDate
                      ? `${customDateRange.startDate} - ${customDateRange.endDate}`
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
                </button>
                {isDateDropdownVisible && (
                  <div
                    className={`absolute top-full left-0 mt-2 w-[500px] bg-white rounded-lg shadow-xl z-50 transform transition-all duration-300 ease-out origin-top-left ${
                      showDateDropdown
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 -translate-y-2'
                    }`}
                  >
                    {/* Header with close button */}
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
                            Pilih Rentang - Kelola Tiket
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowDateDropdown(false);
                          setTimeout(
                            () => setIsDateDropdownVisible(false),
                            300
                          );
                        }}
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
                      </button>
                    </div>

                    {/* Menu Filter Rentang Tanggal */}
                    <div className="p-6">
                      <div
                        className={`mb-6 transition-all duration-500 delay-100 ${
                          showDateDropdown
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-4'
                        }`}
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                              Tanggal Mulai{' '}
                              <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="date"
                                value={customDateRange.startDate}
                                onChange={(e) =>
                                  setCustomDateRange((prev) => ({
                                    ...prev,
                                    startDate: e.target.value,
                                  }))
                                }
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:w-6 [&::-webkit-calendar-picker-indicator]:h-6 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                              />
                              <svg
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
                                viewBox="0 0 21 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M0.5 18.125C0.5 19.1602 1.45982 20 2.64286 20H18.3571C19.5402 20 20.5 19.1602 20.5 18.125V7.5H0.5V18.125ZM14.7857 10.4688C14.7857 10.2109 15.0268 10 15.3214 10H17.1071C17.4018 10 17.6429 10.2109 17.6429 10.4688V12.0313C17.6429 12.2891 17.4018 12.5 17.1071 12.5H15.3214C15.0268 12.5 14.7857 12.2891 14.7857 12.0313V10.4688ZM14.7857 15.4688C14.7857 15.2109 15.0268 15 15.3214 15H17.1071C17.4018 15 17.6429 15.2109 17.6429 15.4688V17.0312C17.6429 17.2891 17.4018 17.5 17.1071 17.5H15.3214C15.0268 17.5 14.7857 17.2891 14.7857 17.0312V15.4688ZM9.07143 10.4688C9.07143 10.2109 9.3125 10 9.60714 10H11.3929C11.6875 10 11.9286 10.2109 11.9286 10.4688V12.0313C11.9286 12.2891 11.6875 12.5 11.3929 12.5H9.60714C9.3125 12.5 9.07143 12.2891 9.07143 12.0313V10.4688ZM9.07143 15.4688C9.07143 15.2109 9.3125 15 9.60714 15H11.3929C11.6875 15 11.9286 15.2109 11.9286 15.4688V17.0312C11.9286 17.2891 11.6875 17.5 11.3929 17.5H9.60714C9.3125 17.5 9.07143 17.2891 9.07143 17.0312V15.4688ZM3.35714 10.4688C3.35714 10.2109 3.59821 10 3.89286 10H5.67857C5.97321 10 6.21429 10.2109 6.21429 10.4688V12.0313C6.21429 12.2891 5.97321 12.5 5.67857 12.5H3.89286C3.59821 12.5 3.35714 12.2891 3.35714 12.0313V10.4688ZM3.35714 15.4688C3.35714 15.2109 3.59821 15 3.89286 15H5.67857C5.97321 15 6.21429 15.2109 6.21429 15.4688V17.0312C6.21429 17.2891 5.97321 17.5 5.67857 17.5H3.89286C3.59821 17.5 3.35714 17.2891 3.35714 17.0312V15.4688ZM18.3571 2.5H16.2143V0.625C16.2143 0.28125 15.8929 0 15.5 0H14.0714C13.6786 0 13.3571 0.28125 13.3571 0.625V2.5H7.64286V0.625C7.64286 0.28125 7.32143 0 6.92857 0H5.5C5.10714 0 4.78571 0.28125 4.78571 0.625V2.5H2.64286C1.45982 2.5 0.5 3.33984 0.5 4.375V6.25H20.5V4.375C20.5 3.33984 19.5402 2.5 18.3571 2.5Z"
                                  fill="#444746"
                                />
                              </svg>
                            </div>
                          </div>
                          {/* Sampai Tanggal Field */}
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                              Sampai Tanggal{' '}
                              <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="date"
                                value={customDateRange.endDate}
                                onChange={(e) =>
                                  setCustomDateRange((prev) => ({
                                    ...prev,
                                    endDate: e.target.value,
                                  }))
                                }
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:w-6 [&::-webkit-calendar-picker-indicator]:h-6 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                              />
                              <svg
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
                                viewBox="0 0 21 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M0.5 18.125C0.5 19.1602 1.45982 20 2.64286 20H18.3571C19.5402 20 20.5 19.1602 20.5 18.125V7.5H0.5V18.125ZM14.7857 10.4688C14.7857 10.2109 15.0268 10 15.3214 10H17.1071C17.4018 10 17.6429 10.2109 17.6429 10.4688V12.0313C17.6429 12.2891 17.4018 12.5 17.1071 12.5H15.3214C15.0268 12.5 14.7857 12.2891 14.7857 12.0313V10.4688ZM14.7857 15.4688C14.7857 15.2109 15.0268 15 15.3214 15H17.1071C17.4018 15 17.6429 15.2109 17.6429 15.4688V17.0312C17.6429 17.2891 17.4018 17.5 17.1071 17.5H15.3214C15.0268 17.5 14.7857 17.2891 14.7857 17.0312V15.4688ZM9.07143 10.4688C9.07143 10.2109 9.3125 10 9.60714 10H11.3929C11.6875 10 11.9286 10.2109 11.9286 10.4688V12.0313C11.9286 12.2891 11.6875 12.5 11.3929 12.5H9.60714C9.3125 12.5 9.07143 12.2891 9.07143 12.0313V10.4688ZM9.07143 15.4688C9.07143 15.2109 9.3125 15 9.60714 15H11.3929C11.6875 15 11.9286 15.2109 11.9286 15.4688V17.0312C11.9286 17.2891 11.6875 17.5 11.3929 17.5H9.60714C9.3125 17.5 9.07143 17.2891 9.07143 17.0312V15.4688ZM3.35714 10.4688C3.35714 10.2109 3.59821 10 3.89286 10H5.67857C5.97321 10 6.21429 10.2109 6.21429 10.4688V12.0313C6.21429 12.2891 5.97321 12.5 5.67857 12.5H3.89286C3.59821 12.5 3.35714 12.2891 3.35714 12.0313V10.4688ZM3.35714 15.4688C3.35714 15.2109 3.59821 15 3.89286 15H5.67857C5.97321 15 6.21429 15.2109 6.21429 15.4688V17.0312C6.21429 17.2891 5.97321 17.5 5.67857 17.5H3.89286C3.59821 17.5 3.35714 17.2891 3.35714 17.0312V15.4688ZM18.3571 2.5H16.2143V0.625C16.2143 0.28125 15.8929 0 15.5 0H14.0714C13.6786 0 13.3571 0.28125 13.3571 0.625V2.5H7.64286V0.625C7.64286 0.28125 7.32143 0 6.92857 0H5.5C5.10714 0 4.78571 0.28125 4.78571 0.625V2.5H2.64286C1.45982 2.5 0.5 3.33984 0.5 4.375V6.25H20.5V4.375C20.5 3.33984 19.5402 2.5 18.3571 2.5Z"
                                  fill="#444746"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Action Button - Bottom Right Positioned */}
                      <div
                        className={`pt-4 border-t border-gray-200 transition-all duration-500 delay-200 ${
                          showDateDropdown
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-4'
                        }`}
                      >
                        <div className="flex items-center justify-end space-x-3">
                          {/* Clear Button */}
                          <button
                            onClick={() => {
                              setCustomDateRange({
                                startDate: '',
                                endDate: '',
                              });
                              setSelectedDateRange('');
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
                          </button>

                          {/* Apply/Terapkan Button */}
                          <button
                            onClick={() => {
                              setSelectedDateRange(
                                customDateRange.startDate &&
                                  customDateRange.endDate
                                  ? `${customDateRange.startDate} - ${customDateRange.endDate}`
                                  : ''
                              );
                              setShowDateDropdown(false);
                              setTimeout(
                                () => setIsDateDropdownVisible(false),
                                300
                              );
                            }}
                            className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                          >
                            Terapkan
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Unread Filter */}
              <div className="relative" data-dropdown="unread">
                <button
                  onClick={() => {
                    if (showUnreadDropdown) {
                      setShowUnreadDropdown(false);
                      setTimeout(() => setIsUnreadDropdownVisible(false), 300);
                    } else {
                      setIsUnreadDropdownVisible(true);
                      setTimeout(() => setShowUnreadDropdown(true), 10);
                    }
                  }}
                  className={`border-2 border-gray-400 text-sm px-3 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                    unreadFilter && unreadFilter !== 'Belum Dibaca'
                      ? 'bg-red-200 font-semibold'
                      : 'bg-white hover:bg-red-100'
                  }`}
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

                  <span>{unreadFilter || 'Belum Dibaca'}</span>
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
                </button>
                {isUnreadDropdownVisible && (
                  <div
                    className={`absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20 transform transition-all duration-300 ease-out origin-top ${
                      showUnreadDropdown
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 -translate-y-2'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setUnreadFilter('Belum Dibaca');
                        setShowUnreadDropdown(false);
                        setTimeout(
                          () => setIsUnreadDropdownVisible(false),
                          300
                        );
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                    >
                      Belum Dibaca
                    </button>
                    <button
                      onClick={() => {
                        setUnreadFilter('Sudah Dibaca');
                        setShowUnreadDropdown(false);
                        setTimeout(
                          () => setIsUnreadDropdownVisible(false),
                          300
                        );
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                    >
                      Sudah Dibaca
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Reset Filter Button */}
            <button
              className="border-2 border-gray-400 text-sm px-3 py-2 shadow-gray-300 shadow-md rounded-lg flex items-center space-x-2 hover:bg-red-100 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out transform"
              onClick={() => {
                const defaultFilters = {
                  selectedCategory: '',
                  selectedDateRange: '',
                  unreadFilter: '',
                  statusFilter: 'Semua',
                  customDateRange: { startDate: '', endDate: '' },
                };

                setStatusFilter(defaultFilters.statusFilter);
                setSelectedCategory(defaultFilters.selectedCategory);
                setSelectedDateRange(defaultFilters.selectedDateRange);
                setUnreadFilter(defaultFilters.unreadFilter);
                setCustomDateRange(defaultFilters.customDateRange);

                // Clear localStorage
                localStorage.removeItem('adminDashboardFilters');

                loadAdminTickets();
              }}
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
            </button>
          </div>
        </Navigation>

        {/* Kanban Board */}
        <div className="px-8 mt-4">
          <div className="flex space-x-6 overflow-x-auto pb-4">
            {Object.entries(columnConfig).map(([key, config]) => (
              <TicketColumn
                key={key}
                columnKey={key}
                config={config}
                tickets={filteredTickets[key]}
                handleDrop={handleDrop}
                loadAdminTickets={loadAdminTickets}
                updating={updating}
                handleDragStart={handleDragStart}
                handleTicketClick={handleTicketClick}
                getPriorityColor={getPriorityColor}
                getPriorityLabel={getPriorityLabel}
                onDeleteTicket={handleDeleteTicket}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && ticketToDelete && (
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
                <span className="font-bold">Judul:</span>{' '}
                {ticketToDelete.subject ||
                  ticketToDelete.title ||
                  'Tidak ada judul'}
              </p>

              {/* Warning Box */}
              <div className="bg-red-100 rounded-lg p-3 mb-6 flex items-center space-x-3">
                {/* Warning Icon - Now properly centered */}
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

                {/* Warning Text - "Peringatan:" is now bold */}
                <div className="flex-1">
                  <p className="text-[#E01A3F] font-medium text-xs">
                    <span className="font-bold">Peringatan:</span> Tiket akan
                    dihapus dari daftar Anda, namun tetap dapat diakses oleh
                    Admin.
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

export default AdminDashboard;
