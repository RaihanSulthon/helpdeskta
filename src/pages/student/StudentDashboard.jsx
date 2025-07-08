// src/pages/student/StudentDashboard.jsx - Fixed status filter logic
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getTicketsAPI,
  deleteTicketAPI,
  deleteMultipleTicketsAPI,
  getCategoriesAPI,
  getTicketDetailAPI,
} from "../../services/api";
import Modal from "../../components/Modal";
import {
  StatusBadge,
  FilterButton,
  getStatusBorderColor,
  getStatusBgColor,
} from "../../components/student/StatusBadge";
import { ToastContainer } from "../../components/Toast";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State declarations
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("Semua Kategori");
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [clickedTickets, setClickedTickets] = useState(new Set());
  const [lastViewTime, setLastViewTime] = useState(new Map());
  const [categories, setCategories] = useState([]);
  const [readFilter, setReadFilter] = useState("Semua");
  const [showReadDropdown, setShowReadDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastStatusCheck, setLastStatusCheck] = useState(new Map());
  const [lastFeedbackCheck, setLastFeedbackCheck] = useState(new Map());

  const [feedbackCounts, setFeedbackCounts] = useState({});
  const [loadingFeedbackCounts, setLoadingFeedbackCounts] = useState(false);
  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return "Kemarin";
      if (diffDays === 0) return "Hari Ini";
      if (diffDays <= 7) return `${diffDays} hari lalu`;
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Tanggal tidak valid";
    }
  };
  const saveStatusTracking = () => {
    if (user?.id) {
      localStorage.setItem(
        `statusTracking_${user.id}`,
        JSON.stringify(Object.fromEntries(lastStatusCheck))
      );
      localStorage.setItem(
        `feedbackTracking_${user.id}`,
        JSON.stringify(Object.fromEntries(lastFeedbackCheck))
      );
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
      console.error("Error loading categories:", error);
      // Fallback ke kategori default jika API gagal
      setCategories([
        { id: 1, name: "Akademik" },
        { id: 2, name: "Fasilitas" },
        { id: 3, name: "Administrasi" },
        { id: 4, name: "Kemahasiswaan" },
        { id: 5, name: "Lainnya" },
      ]);
    }
  };

  // FIXED: Unified filtering logic
  const getFilteredTickets = () => {
    let filtered = [...tickets];

    // 🔧 FIX: Search filter - TAMBAH INI
    if (searchQuery.trim() !== "") {
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
    if (statusFilter !== "Semua") {
      filtered = filtered.filter((ticket) => ticket.category === statusFilter);
    }

    // Category filter
    if (categoryFilter !== "Semua Kategori") {
      filtered = filtered.filter(
        (ticket) => ticket.categoryType === categoryFilter
      );
    }

    // Read filter
    if (readFilter !== "Semua") {
      if (readFilter === "Sudah Dibaca") {
        filtered = filtered.filter((ticket) => ticket.isRead === true);
      } else if (readFilter === "Belum Dibaca") {
        filtered = filtered.filter((ticket) => ticket.isRead === false);
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
    setStatusFilter("Semua");
    setCategoryFilter("Semua Kategori");
    setDateRangeFilter({ startDate: "", endDate: "" });
    setReadFilter("Semua");
    setSearchQuery(""); // 🔧 TAMBAH: Reset search
    setCurrentPage(1);
    setSelectedTickets([]);

    // Tutup dropdowns
    setShowDatePicker(false);
    setShowReadDropdown(false);

    // Show toast notification
    addToast("Filter berhasil direset", "success");
  };
  const mapStatusToCategory = (status) => {
    if (!status) return "Tiket Baru";

    switch (status.toLowerCase()) {
      case "pending":
      case "new":
      case "open":
        return "Tiket Baru";
      case "in_progress":
      case "processing":
      case "assigned":
        return "Sedang Diproses";
      case "completed":
      case "resolved":
      case "closed":
        return "Selesai";
      default:
        return "Tiket Baru";
    }
  };
  const handleRefresh = async () => {
    try {
      setRefreshLoading(true);

      // 🔧 PENTING: Simpan state badge sebelum refresh
      const currentClickedTickets = new Set(clickedTickets);
      const currentLastViewTime = new Map(lastViewTime);

      console.log("💾 Menyimpan state badge sebelum refresh:", {
        clickedTickets: [...currentClickedTickets],
        lastViewTime: Object.fromEntries(currentLastViewTime),
      });

      const oldTicketCount = tickets.length;
      addToast("Memperbarui data tiket...", "info", 2000);

      // Reload data
      await Promise.all([loadTickets(), loadCategories()]);

      // 🔧 PENTING: Restore state badge setelah refresh
      setClickedTickets(currentClickedTickets);
      setLastViewTime(currentLastViewTime);

      console.log("🔄 State badge dipulihkan setelah refresh");

      if (tickets.length > 0) {
        await loadFeedbackCounts(tickets);
      }

      setCurrentPage(1);
      setSelectedTickets([]);

      setTimeout(() => {
        const newTicketCount = tickets.length;
        const difference = newTicketCount - oldTicketCount;

        if (difference > 0) {
          addToast(`${difference} tiket baru ditemukan!`, "success");
        } else if (difference < 0) {
          addToast(`${Math.abs(difference)} tiket telah dihapus`, "info");
        } else {
          addToast("Data tiket sudah up to date", "success");
        }
      }, 500);
    } catch (error) {
      console.error("Error refreshing data:", error);
      addToast("Gagal memperbarui data: " + error.message, "error");
    } finally {
      setRefreshLoading(false);
    }
  };
  // FIXED: Unified filtering logic

  const getTicketCounts = () => {
    return {
      total: tickets.length,
      new: tickets.filter((t) => t.category === "Tiket Baru").length,
      processing: tickets.filter((t) => t.category === "Sedang Diproses")
        .length,
      completed: tickets.filter((t) => t.category === "Selesai").length,
    };
  };
  const hasStatusUpdate = (statusType, tickets) => {
    if (!tickets || tickets.length === 0) return false;

    const statusTickets = tickets.filter(
      (ticket) => ticket.category === statusType
    );
    return statusTickets.some((ticket) => {
      // Cek apakah ada perubahan status dalam 24 jam terakhir
      const updateTime = new Date(ticket.lastStatusUpdate);
      const now = new Date();
      const hoursDiff = (now - updateTime) / (1000 * 60 * 60);

      return hoursDiff <= 24 && !clickedTickets.has(ticket.id);
    });
  };

  // TAMBAH: Fungsi untuk cek feedback update
  const hasFeedbackUpdate = (statusType, tickets) => {
    if (!tickets || tickets.length === 0) return false;

    const statusTickets = tickets.filter(
      (ticket) => ticket.category === statusType
    );
    return statusTickets.some((ticket) => {
      const feedbackCount = feedbackCounts[ticket.id];
      return feedbackCount?.unread > 0 && !clickedTickets.has(ticket.id);
    });
  };

  // TAMBAH: Fungsi gabungan untuk badge
  const shouldShowBadge = (statusType, tickets) => {
    return (
      hasStatusUpdate(statusType, tickets) ||
      hasFeedbackUpdate(statusType, tickets) ||
      hasNewMessages(statusType, tickets)
    );
  };
  // FIXED: Improved hasNewMessages logic
  const hasNewMessages = (statusType, tickets) => {
    if (!tickets || tickets.length === 0) return false;

    // 🔥 ULTRA SIMPLE: Badge muncul jika ada tiket tidak terbaca di kategori ini
    const unreadTickets = tickets.filter(
      (ticket) =>
        ticket.category === statusType &&
        !ticket.isRead &&
        !clickedTickets.has(ticket.id)
    );

    unreadTickets.forEach((t) =>
      console.log(
        `  - Ticket #${t.id}: isRead=${t.isRead}, clicked=${clickedTickets.has(
          t.id
        )}`
      )
    );

    return unreadTickets.length > 0;
  };
  // Tambahkan sebelum useEffect (sekitar line 320):
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
          console.error(
            `Error loading feedback for ticket ${ticket.id}:`,
            error
          );
          counts[ticket.id] = { total: 0, unread: 0 };
        }
      }

      setFeedbackCounts(counts);
    } catch (error) {
      console.error("Error loading feedback counts:", error);
    } finally {
      setLoadingFeedbackCounts(false);
    }
  };
  const addToast = (message, type = "info", duration = 3000) => {
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

  // FIXED: Load and save badge state properly
  useEffect(() => {
    const savedClickedTickets = localStorage.getItem(
      `clickedTickets_${user?.id || "anonymous"}`
    );
    if (savedClickedTickets) {
      try {
        const parsed = JSON.parse(savedClickedTickets);

        setClickedTickets(new Set(parsed));
      } catch (error) {
        console.error("Error loading clicked tickets:", error);
        setClickedTickets(new Set());
      }
    }

    // Load last view times dengan user-specific key
    const savedLastViewTime = localStorage.getItem(
      `lastViewTime_${user?.id || "anonymous"}`
    );
    if (savedLastViewTime) {
      try {
        const parsed = JSON.parse(savedLastViewTime);
        const timeMap = new Map();
        Object.entries(parsed).forEach(([key, value]) => {
          timeMap.set(key, new Date(value));
        });
        setLastViewTime(timeMap);
      } catch (error) {
        console.error("Error loading last view time:", error);
        setLastViewTime(new Map());
      }
    }
  }, [user?.id]);
  // Tambahkan setelah useEffect yang ada
  useEffect(() => {
    if (tickets.length > 0) {
      loadFeedbackCounts(tickets);
    }
  }, [tickets]);
  // FIXED: Improved status filter click handler
  const handleStatusFilterClick = (statusType) => {
    setStatusFilter(statusType);
  };
  useEffect(() => {
    if (user?.id) {
      loadStatusTracking();
    }
  }, [user?.id]);

  // TAMBAH: Save tracking saat update
  useEffect(() => {
    saveStatusTracking();
  }, [lastStatusCheck, lastFeedbackCheck, user?.id]);
  // FIXED: Save last view times to localStorage with user-specific key
  useEffect(() => {
    if (lastViewTime.size > 0 && user?.id) {
      const timeObj = {};
      lastViewTime.forEach((value, key) => {
        timeObj[key] = value.toISOString();
      });
      localStorage.setItem(`lastViewTime_${user.id}`, JSON.stringify(timeObj));
    }
  }, [lastViewTime, user?.id]);

  useEffect(() => {
    if (user?.id) {
      const ticketsArray = [...clickedTickets];
      localStorage.setItem(
        `clickedTickets_${user.id}`,
        JSON.stringify(ticketsArray)
      );
    }
  }, [clickedTickets, user?.id]);

  // Load tickets only once on mount
  useEffect(() => {
    loadTickets();
    loadCategories(); // ← TAMBAHKAN INI
  }, []);

  // Reset pagination when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, categoryFilter, dateRangeFilter, readFilter, searchQuery]);

  // Clear selection when page changes
  useEffect(() => {
    setSelectedTickets([]);
  }, [currentPage]);

  // Click outside handler for date picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDatePicker && !event.target.closest(".date-picker-container")) {
        setShowDatePicker(false);
      }
      // TAMBAHKAN INI:
      if (showReadDropdown && !event.target.closest(".relative")) {
        setShowReadDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDatePicker, showReadDropdown]);
  // FIXED: Simplified loadTickets - load all data, filter on frontend
  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getTicketsAPI({});

      let ticketsData = [];
      if (response && response.tickets) {
        ticketsData = response.tickets;
      } else if (Array.isArray(response)) {
        ticketsData = response;
      } else if (response && response.data) {
        ticketsData = Array.isArray(response.data)
          ? response.data
          : response.data.tickets || [];
      }

      console.log("🔍 RAW API DATA:", ticketsData.slice(0, 2));

      const transformedTickets = ticketsData.map((ticket) => {
        // Deteksi perubahan status
        const lastKnownStatus = lastStatusCheck.get(ticket.id);
        const currentStatus = ticket.status;
        const isStatusChanged =
          lastKnownStatus && lastKnownStatus !== currentStatus;

        // Deteksi feedback baru
        const lastKnownFeedbackCount = lastFeedbackCheck.get(ticket.id) || 0;
        const currentFeedbackCount = ticket.chat_count || 0;
        const hasFeedbackUpdate = currentFeedbackCount > lastKnownFeedbackCount;

        // ✅ RETURN TICKET OBJECT
        return {
          id: ticket.id,
          sender:
            ticket.anonymous === true
              ? "Anonim"
              : ticket.nama || ticket.name || "Tidak diketahui",
          email:
            ticket.anonymous === true
              ? "anonim@email.com"
              : ticket.email || "tidak diketahui",
          date: formatDate(ticket.created_at),
          originalDate: ticket.updated_at || ticket.created_at,
          subject: ticket.judul || ticket.title || "Tidak ada judul",
          category: mapStatusToCategory(ticket.status),
          categoryType: ticket.category?.name || "Umum",
          subCategory: ticket.sub_category?.name || "Umum",
          isRead:
            ticket.read_by_student === true ||
            ticket.read_by_student === 1 ||
            ticket.read_by_student === "1",
          status: ticket.status,
          priority: ticket.priority || "medium",
          description: ticket.deskripsi || ticket.description || "",
          nim: ticket.nim || "",
          prodi: ticket.prodi || "",
          semester: ticket.semester || "",
          noHp: ticket.no_hp || "",
          anonymous: ticket.anonymous === true || ticket.anonymous === 1,
          readByAdmin:
            ticket.read_by_admin === true ||
            ticket.read_by_admin === 1 ||
            ticket.read_by_admin === "1",
          readByDisposisi:
            ticket.read_by_disposisi === true ||
            ticket.read_by_disposisi === 1 ||
            ticket.read_by_disposisi === "1",
          assignedTo: ticket.assigned_to,
          lastUpdated: ticket.updated_at,
          statusChanged: ticket.created_at !== ticket.updated_at,
          rawStatus: ticket.status,
          rawReadByAdmin: ticket.read_by_admin,
          rawReadByDisposisi: ticket.read_by_disposisi,
          rawReadByStudent: ticket.read_by_student,

          // Badge tracking properties
          hasStatusUpdate: isStatusChanged,
          hasFeedbackUpdate: hasFeedbackUpdate,
          lastStatusUpdate: ticket.updated_at,
        };
      });

      setTickets(transformedTickets);

      // Update tracking
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

      console.log("📊 LOADED TICKETS SUMMARY:", {
        total: transformedTickets.length,
        categories: {
          "Tiket Baru": transformedTickets.filter(
            (t) => t.category === "Tiket Baru"
          ).length,
          "Sedang Diproses": transformedTickets.filter(
            (t) => t.category === "Sedang Diproses"
          ).length,
          Selesai: transformedTickets.filter((t) => t.category === "Selesai")
            .length,
        },
        unread: transformedTickets.filter((t) => !t.isRead).length,
      });
    } catch (error) {
      console.error("Error loading tickets:", error);
      setError("Gagal memuat data tiket: " + error.message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = (ticketId) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  // FIXED: Improved ticket click handler
  const handleTicketClick = (ticketId) => {
    setClickedTickets((prev) => {
      const newSet = new Set([...prev, ticketId]);
      // 🔥 LANGSUNG SAVE KE LOCALSTORAGE
      if (user?.id) {
        localStorage.setItem(
          `clickedTickets_${user.id}`,
          JSON.stringify([...newSet])
        );
      }

      return newSet;
    });
    // 2. Update ticket isRead status
    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id === ticketId) {
          return { ...ticket, isRead: true };
        }
        return ticket;
      })
    );

    // 3. Navigate ke detail
    navigate(`/ticket/${ticketId}`);
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
    console.log("Mark as read:", selectedTickets);

    // Mark selected tickets as clicked (removes badges)
    setClickedTickets((prev) => {
      const newSet = new Set(prev);
      selectedTickets.forEach((id) => newSet.add(id));
      return newSet;
    });

    // Update isRead status for selected tickets
    setTickets((prev) =>
      prev.map((ticket) =>
        selectedTickets.includes(ticket.id)
          ? { ...ticket, isRead: true }
          : ticket
      )
    );

    setSelectedTickets([]);
    addToast("Tiket berhasil ditandai sebagai dibaca", "success");
  };

  const handleDeleteTickets = () => {
    if (selectedTickets.length === 0) {
      addToast("Pilih tiket yang ingin dihapus", "warning");
      return;
    }
    setShowDeleteModal(true);
  };

  const confirmDeleteTickets = async () => {
    try {
      setDeleteLoading(true);

      const ticketCount = selectedTickets.length;
      console.log(`Deleting ${ticketCount} tickets:`, selectedTickets);

      if (ticketCount === 1) {
        await deleteTicketAPI(selectedTickets[0]);
        addToast("Tiket berhasil dihapus", "success");
      } else {
        const result = await deleteMultipleTicketsAPI(selectedTickets);

        if (result.success) {
          addToast(`${result.deletedCount} tiket berhasil dihapus`, "success");
        } else {
          addToast(
            `${result.deletedCount} tiket berhasil dihapus, ${result.errorCount} gagal`,
            "warning"
          );
        }
      }

      await loadTickets();
      setSelectedTickets([]);
    } catch (error) {
      console.error("Error deleting tickets:", error);
      addToast("Gagal menghapus tiket: " + error.message, "error");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleteLoading) {
      setShowDeleteModal(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Tiket Saya</h1>
          <p className="text-gray-600 mt-1">
            Temukan tiket yang sudah kamu sampaikan
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-lg shadow max-w-0xl mx-auto">
        {/* Filter Section */}
        <div className="py-0 px-6 border-b border-gray-200 shadow-xl rounded-xl">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
            {/* 🔧 SEARCH BOX - Tetap di Kiri */}
            <div className="relative flex-1 min-w-[250px] max-w-[400px]">
              <input
                type="text"
                placeholder="Cari id / judul / nama mahasiswa"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-black border border-gray-300 text-sm pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

            {/* 🔧 FILTER GROUP - Di Kanan (Berdekatan) */}
            <div className="flex items-center space-x-3">
              {/* Kategori Dropdown */}
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => handleCategoryFilterChange(e.target.value)}
                  className="appearance-none text-black border border-gray-300 text-sm pl-8 pr-8 py-2 rounded-lg min-w-[140px] hover:opacity-90 hover:shadow-xl transition-all hover:scale-105 duration-300 ease-out transform"
                  style={{ backgroundColor: "#ffffff" }}
                >
                  <option value="Semua Kategori">Semua Kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {/* Icon Kategori - Asli */}
                <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none">
                  <svg
                    width="14"
                    height="16"
                    viewBox="0 0 17 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_3127_62689)">
                      <path
                        d="M0 20V1.875C0 0.839453 0.95138 0 2.125 0H14.875C16.0486 0 17 0.839453 17 1.875V20L8.5 15.625L0 20Z"
                        fill="black"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_3127_62689">
                        <rect width="17" height="20" fill="black" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Date Range Picker */}
              <div className="relative date-picker-container">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-center text-black border border-gray-300 text-sm pl-3 pr-8 py-2 rounded-lg min-w-[160px] hover:opacity-90 hover:shadow-xl transition-all hover:scale-105 duration-300 ease-out transform"
                  style={{ backgroundColor: "#ffffff" }}
                >
                  {/* Icon Pilih Rentang - Asli */}
                  <svg
                    width="16"
                    height="15"
                    viewBox="0 0 21 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute left-3"
                  >
                    <g clipPath="url(#clip0_3127_62700)">
                      <path
                        d="M16.6584 0C17.6161 0 18.5346 0.380455 19.2119 1.05767C19.8891 1.73488 20.2695 2.65338 20.2695 3.61111V16.3889C20.2695 17.3466 19.8891 18.2651 19.2119 18.9423C18.5346 19.6195 17.6161 20 16.6584 20H3.88064C2.92292 20 2.00442 19.6195 1.3272 18.9423C0.649986 18.2651 0.269531 17.3466 0.269531 16.3889V3.61111C0.269531 2.65338 0.649986 1.73488 1.3272 1.05767C2.00442 0.380455 2.92292 0 3.88064 0H16.6584ZM18.6029 6.11111H1.9362V16.3889C1.9362 17.4622 2.80731 18.3333 3.88064 18.3333H16.6584C17.1741 18.3333 17.6687 18.1285 18.0333 17.7638C18.398 17.3992 18.6029 16.9046 18.6029 16.3889V6.11111ZM5.54731 12.7778C5.91567 12.7778 6.26893 12.9241 6.5294 13.1846C6.78987 13.445 6.9362 13.7983 6.9362 14.1667C6.9362 14.535 6.78987 14.8883 6.5294 15.1488C6.26893 15.4092 5.91567 15.5556 5.54731 15.5556C5.17895 15.5556 4.82568 15.4092 4.56522 15.1488C4.30475 14.8883 4.15842 14.535 4.15842 14.1667C4.15842 13.7983 4.30475 13.445 4.56522 13.1846C4.82568 12.9241 5.17895 12.7778 5.54731 12.7778ZM10.2695 12.7778C10.6379 12.7778 10.9912 12.9241 11.2516 13.1846C11.5121 13.445 11.6584 13.7983 11.6584 14.1667C11.6584 14.535 11.5121 14.8883 11.2516 15.1488C10.9912 15.4092 10.6379 15.5556 10.2695 15.5556C9.90118 15.5556 9.54791 15.4092 9.28744 15.1488C9.02697 14.8883 8.88064 14.535 8.88064 14.1667C8.88064 13.7983 9.02697 13.445 9.28744 13.1846C9.54791 12.9241 9.90118 12.7778 10.2695 12.7778ZM5.54731 8.33333C5.91567 8.33333 6.26893 8.47966 6.5294 8.74013C6.78987 9.0006 6.9362 9.35387 6.9362 9.72222C6.9362 10.0906 6.78987 10.4438 6.5294 10.7043C6.26893 10.9648 5.91567 11.1111 5.54731 11.1111C5.17895 11.1111 4.82568 10.9648 4.56522 10.7043C4.30475 10.4438 4.15842 10.0906 4.15842 9.72222C4.15842 9.35387 4.30475 9.0006 4.56522 8.74013C4.82568 8.47966 5.17895 8.33333 5.54731 8.33333ZM10.2695 8.33333C10.6379 8.33333 10.9912 8.47966 11.2516 8.74013C11.5121 9.0006 11.6584 9.35387 11.6584 9.72222C11.6584 10.0906 11.5121 10.4438 11.2516 10.7043C10.9912 10.9648 10.6379 11.1111 10.2695 11.1111C9.90118 11.1111 9.54791 10.9648 9.28744 10.7043C9.02697 10.4438 8.88064 10.0906 8.88064 9.72222C8.88064 9.35387 9.02697 9.0006 9.28744 8.74013C9.54791 8.47966 9.90118 8.33333 10.2695 8.33333ZM14.9918 8.33333C15.3601 8.33333 15.7134 8.47966 15.9738 8.74013C16.2343 9.0006 16.3806 9.35387 16.3806 9.72222C16.3806 10.0906 16.2343 10.4438 15.9738 10.7043C15.7134 10.9648 15.3601 11.1111 14.9918 11.1111C14.6234 11.1111 14.2701 10.9648 14.0097 10.7043C13.7492 10.4438 13.6029 10.0906 13.6029 9.72222C13.6029 9.35387 13.7492 9.0006 14.0097 8.74013C14.2701 8.47966 14.6234 8.33333 14.9918 8.33333ZM16.6584 1.66667H3.88064C3.36494 1.66667 2.87037 1.87153 2.50571 2.23618C2.14106 2.60084 1.9362 3.09541 1.9362 3.61111V4.44444H18.6029V3.61111C18.6029 3.09541 18.398 2.60084 18.0333 2.23618C17.6687 1.87153 17.1741 1.66667 16.6584 1.66667Z"
                        fill="black"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_3127_62700">
                        <rect
                          width="20"
                          height="20"
                          fill="white"
                          transform="translate(0.269531)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                  <span className="text-black ml-6">
                    {dateRangeFilter.startDate && dateRangeFilter.endDate
                      ? `${new Date(
                          dateRangeFilter.startDate
                        ).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })} - ${new Date(
                          dateRangeFilter.endDate
                        ).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}`
                      : "Pilih Rentang"}
                  </span>
                  <svg
                    className="w-4 h-4 text-black absolute right-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Date Picker Dropdown */}
                {showDatePicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 min-w-[300px]">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Tanggal Mulai
                        </label>
                        <input
                          type="date"
                          value={dateRangeFilter.startDate}
                          onChange={(e) =>
                            setDateRangeFilter((prev) => ({
                              ...prev,
                              startDate: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Tanggal Akhir
                        </label>
                        <input
                          type="date"
                          value={dateRangeFilter.endDate}
                          onChange={(e) =>
                            setDateRangeFilter((prev) => ({
                              ...prev,
                              endDate: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-3">
                      <button
                        onClick={() => {
                          setDateRangeFilter({ startDate: "", endDate: "" });
                          setShowDatePicker(false);
                        }}
                        className="px-3 py-1 border border-gray-300 text-sm bg-white text-black rounded hover:bg-gray-200"
                      >
                        Reset
                      </button>
                      <button
                        onClick={handleDateFilterApply}
                        className="px-3 py-1 border border-gray-300 text-sm bg-white text-black rounded hover:bg-gray-200"
                      >
                        Terapkan
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Read Status Filter */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg hover:opacity-90 hover:shadow-xl transition-all hover:scale-105 duration-300 ease-out transform"
                  style={{ backgroundColor: "#ffffff" }}
                  onClick={() => setShowReadDropdown(!showReadDropdown)}
                >
                  <svg
                    className="w-5 h-5 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm text-black">{readFilter}</span>
                  <svg
                    className="w-4 h-4 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>

                  {/* Badge untuk belum dibaca */}
                  {(() => {
                    const unreadCount = tickets.filter((t) => !t.isRead).length;
                    return unreadCount > 0 && readFilter === "Semua" ? (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-1">
                        {unreadCount}
                      </span>
                    ) : null;
                  })()}
                </button>

                {/* Dropdown Menu */}
                {showReadDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[160px]">
                    {["Semua", "Sudah Dibaca", "Belum Dibaca"].map((option) => (
                      <button
                        key={option}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                          readFilter === option
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700"
                        }`}
                        onClick={() => {
                          setReadFilter(option);
                          setShowReadDropdown(false);
                        }}
                      >
                        {option}
                        {option === "Belum Dibaca" &&
                          (() => {
                            const unreadCount = tickets.filter(
                              (t) => !t.isRead
                            ).length;
                            return unreadCount > 0 ? (
                              <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                {unreadCount}
                              </span>
                            ) : null;
                          })()}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Reset Filter Button */}
              <button
                className="flex items-center gap-2 text-black border border-gray-300 font-medium px-4 py-2 rounded-lg hover:opacity-90 hover:shadow-xl transition-all hover:scale-105 duration-300 ease-out transform"
                style={{ backgroundColor: "#ffffff" }}
                onClick={handleResetFilter}
              >
                {/* Reset Filter Icon - Asli */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.0625 5.625C13.2359 5.6239 12.424 5.84285 11.71 6.25937C10.9961 6.67588 10.4058 7.27493 10 7.995V5H8.75V10H13.75V8.75H11.0106C11.289 8.20699 11.7069 7.74795 12.2216 7.42014C12.7362 7.09232 13.3289 6.90756 13.9387 6.88488C14.5485 6.86219 15.1533 7.0024 15.6908 7.29108C16.2284 7.57975 16.6794 8.00646 16.9973 8.52729C17.3152 9.04812 17.4885 9.64426 17.4995 10.2543C17.5105 10.8644 17.3588 11.4664 17.0599 11.9984C16.7609 12.5303 16.3257 12.973 15.7989 13.2809C15.272 13.5888 14.6727 13.7507 14.0625 13.75H13.75V15H14.0625C15.3057 15 16.498 14.5061 17.3771 13.6271C18.2561 12.748 18.75 11.5557 18.75 10.3125C18.75 9.0693 18.2561 7.87701 17.3771 6.99794C16.498 6.11886 15.3057 5.625 14.0625 5.625Z"
                    fill="black"
                  />
                  <path
                    d="M16.25 3.75H2.5V5.73187L7.13375 10.3656L7.5 10.7319V16.25H10V15H11.25V16.25C11.25 16.5815 11.1183 16.8995 10.8839 17.1339C10.6495 17.3683 10.3315 17.5 10 17.5H7.5C7.16848 17.5 6.85054 17.3683 6.61612 17.1339C6.3817 16.8995 6.25 16.5815 6.25 16.25V11.25L1.61625 6.61562C1.38181 6.38126 1.25007 6.06337 1.25 5.73187V3.75C1.25 3.41848 1.3817 3.10054 1.61612 2.86612C1.85054 2.6317 2.16848 2.5 2.5 2.5H16.25V3.75Z"
                    fill="black"
                  />
                </svg>
                <span className="text-sm">Reset Filter</span>
              </button>
            </div>
          </div>

          {/* Status Tabs - Layout Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshLoading}
              className="flex items-center space-x-2 px-8 py-2 bg-white text-black rounded-lg transition-colors   "
            >
              <svg
                className={`w-6 h-6 ${refreshLoading ? "animate-spin" : ""}`}
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
            </button>
            <FilterButton
              label="Semua Tiket"
              count={ticketCounts.total}
              active={statusFilter === "Semua"}
              onClick={() => handleStatusFilterClick("Semua")}
              statusType="Semua"
              hasNew={false} // Semua tiket tidak perlu badge
            />
            <FilterButton
              label="Tiket Baru"
              count={ticketCounts.new}
              active={statusFilter === "Tiket Baru"}
              onClick={() => handleStatusFilterClick("Tiket Baru")}
              statusType="Tiket Baru"
              hasNew={shouldShowBadge("Tiket Baru", tickets)} // GANTI dari hasNewMessages
            />
            <FilterButton
              label="Sedang Diproses"
              count={ticketCounts.processing}
              active={statusFilter === "Sedang Diproses"}
              onClick={() => handleStatusFilterClick("Sedang Diproses")}
              statusType="Sedang Diproses"
              hasNew={shouldShowBadge("Sedang Diproses", tickets)} // GANTI dari hasNewMessages
            />
            <FilterButton
              label="Selesai"
              count={ticketCounts.completed}
              active={statusFilter === "Selesai"}
              onClick={() => handleStatusFilterClick("Selesai")}
              statusType="Selesai"
              hasNew={shouldShowBadge("Selesai", tickets)} // GANTI dari hasNewMessages
            />
          </div>
        </div>

        {/* Ticket List - NEW DESIGN */}
        {currentTickets.map((ticket, index) => (
          <div
            key={`${ticket.id}-${index}`}
            className={`px-4 py-4 border-b border-l-8 hover:bg-gray-50 transition-colors cursor-pointer ${getStatusBorderColor(
              ticket.category
            )} ${
              !ticket.isRead
                ? getStatusBgColor(ticket.category)
                : feedbackCounts[ticket.id]?.unread > 0
                ? "bg-yellow-50"
                : "" // 👈 TAMBAHAN
            } ${selectedTickets.includes(ticket.id) ? "bg-blue-100" : ""}`}
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
                    ticket.category === "Tiket Baru"
                      ? "bg-blue-100 text-blue-800" // 🔧 FIX: Ubah dari orange ke blue
                      : ticket.category === "Sedang Diproses"
                      ? "bg-orange-100 text-orange-800" // 🔧 FIX: Ubah dari blue ke orange
                      : ticket.category === "Selesai"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {ticket.category === "Sedang Diproses"
                    ? "Sedang Diproses"
                    : ticket.category === "Selesai"
                    ? "Selesai"
                    : "Tiket Baru"}
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
              <button
                onClick={(e) => handleFeedbackClick(ticket.id, e)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border shadow-lg transition-colors ${(() => {
                  const unreadCount = feedbackCounts[ticket.id]?.unread || 0;

                  return unreadCount > 0
                    ? "bg-yellow-600 border-yellow-700 hover:bg-yellow-700 text-white"
                    : "bg-white border-gray-300 hover:bg-gray-200 text-gray-700";
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
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                >
                  Feedback ({feedbackCounts[ticket.id]?.total || 0}
                  {feedbackCounts[ticket.id]?.unread > 0
                    ? `/${feedbackCounts[ticket.id].unread} baru`
                    : ""}
                  )
                </span>
              </button>

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
                {!ticket.isRead && (
                  <span
                    className="w-3 h-3 bg-blue-500 rounded-full"
                    title="Belum Dibaca"
                  ></span>
                )}
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
              {statusFilter === "Semua"
                ? "Belum ada tiket yang dibuat"
                : `Belum ada tiket untuk kategori ${statusFilter}`}
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredTickets.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Menampilkan{" "}
                <span className="font-medium">{startIndex + 1}</span> sampai{" "}
                <span className="font-medium">
                  {Math.min(endIndex, filteredTickets.length)}
                </span>{" "}
                dari{" "}
                <span className="font-medium">{filteredTickets.length}</span>{" "}
                hasil
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>

              {/* Page Numbers */}
              <div className="flex space-x-1">
                {(() => {
                  const pages = [];
                  const showEllipsisStart = currentPage > 3;
                  const showEllipsisEnd = currentPage < totalPages - 2;

                  // First page
                  if (showEllipsisStart) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        1
                      </button>
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
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                          pageNum === currentPage
                            ? "text-white bg-blue-600 border border-blue-600"
                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
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
                      <button
                        key={totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        {totalPages}
                      </button>
                    );
                  }

                  return pages;
                })()}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedTickets.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-2xl border px-6 py-3">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {selectedTickets.length} tiket dipilih
            </span>
            <button
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={handleMarkAsRead}
            >
              Tandai sebagai dibaca
            </button>
            <button
              className="text-sm text-red-600 hover:text-red-800"
              onClick={handleDeleteTickets}
            >
              Hapus
            </button>
            <button
              className="text-sm text-gray-600 hover:text-gray-800"
              onClick={() => setSelectedTickets([])}
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={confirmDeleteTickets}
        title="Hapus Tiket"
        type="danger"
        confirmText="Ya, Hapus"
        cancelText="Batal"
        loading={deleteLoading}
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Apakah Anda yakin ingin menghapus{" "}
            <span className="font-semibold text-gray-900">
              {selectedTickets.length}
            </span>{" "}
            tiket yang dipilih?
          </p>
          <div className="mt-3 p-3 bg-yellow-50 rounded-md border border-yellow-200">
            <p className="text-xs text-yellow-800">
              <strong>Catatan:</strong> Tiket akan dihapus secara permanen dari
              dashboard Anda, tetapi data akan tetap tersimpan untuk keperluan
              administrasi.
            </p>
          </div>
        </div>
      </Modal>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default StudentDashboard;
