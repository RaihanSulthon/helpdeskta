// src/pages/student/StudentDashboard.jsx - Updated to match API response structure
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getTicketsAPI, deleteTicketAPI, deleteMultipleTicketsAPI } from "../../services/api";
import Modal from "../../components/Modal";
import { ToastContainer } from "../../components/Toast";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Load tickets on component mount and when filter changes
  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const filters = {};
      if (statusFilter !== "Semua") {
        // Map display status to API status
        // const statusMapping = {
        //   "Tiket Baru": "open",
        //   "Sedang Diproses": "in_progress",
        //   Selesai: "completed",
        // };
        switch (statusFilter !== "semua") {
          case "Tiket Baru":
            break;
          case "Sedang Diproses":
            break;
          case "Selesai":
            break;
        }
      }

      // console.log("Loading tickets with filters:", filters);
      const response = await getTicketsAPI(filters);
      // console.log("API Response:", response);

      // Handle API response structure
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

      // console.log("Extracted tickets data:", ticketsData);

      // Transform API data to match component expectations
      const transformedTickets = ticketsData.map((ticket) => {
        // console.log("Processing ticket:", ticket);

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
          subject: ticket.judul || ticket.title || "Tidak ada judul",
          category: mapStatusToCategory(ticket.status),
          categoryType: ticket.category?.name || "Umum",
          subCategory: ticket.sub_category?.name || "Umum",
          isRead:
            ticket.read_by_student === true || ticket.read_by_student === 1,
          status: ticket.status,
          priority: ticket.priority || "medium",
          description: ticket.deskripsi || ticket.description || "",
          // Additional fields from API
          nim: ticket.nim || "",
          prodi: ticket.prodi || "",
          semester: ticket.semester || "",
          noHp: ticket.no_hp || "",
          anonymous: ticket.anonymous === true || ticket.anonymous === 1,
          readByAdmin:
            ticket.read_by_admin === true || ticket.read_by_admin === 1,
          readByDisposisi:
            ticket.read_by_disposisi === true || ticket.read_by_disposisi === 1,
          assignedTo: ticket.assigned_to,
        };
      });

      // console.log("Transformed tickets:", transformedTickets);
      setTickets(transformedTickets);
    } catch (error) {
      console.error("Error loading tickets:", error);
      setError("Gagal memuat data tiket: " + error.message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
  };
  
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Helper function to format date
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

  // Helper function to map API status to display category
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

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "Tinggi";
      case "medium":
        return "Sedang";
      case "low":
        return "Rendah";
      default:
        return "Sedang";
    }
  };

  // Count tickets by status
  const getTicketCounts = () => {
    return {
      total: tickets.length,
      new: tickets.filter((t) => t.category === "Tiket Baru").length,
      processing: tickets.filter((t) => t.category === "Sedang Diproses")
        .length,
      completed: tickets.filter((t) => t.category === "Selesai").length,
    };
  };

  const ticketCounts = getTicketCounts();

  const filteredTickets =
    statusFilter === "Semua"
      ? tickets
      : tickets.filter((ticket) => ticket.category === statusFilter);

      const handleSelectAll = (e) => {
        e.stopPropagation();
        
        if (e.target.checked) {
          const currentTicketIds = currentTickets.map((t) => t.id);
          setSelectedTickets(currentTicketIds);
        } else {
          setSelectedTickets([]);
        }
      };

  // Handler untuk pagination
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

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);
  const startIndex = (currentPage - 1) * ticketsPerPage;
  const endIndex = startIndex + ticketsPerPage;
  const currentTickets = filteredTickets.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  useEffect(() => {
    setSelectedTickets([]);
  }, [currentPage]);

  const handleSelectTicket = (ticketId) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleTicketClick = (ticketId) => {
    navigate(`/ticket/${ticketId}`);
  };

  const handleMarkAsRead = async () => {
    // Implement mark as read functionality
    console.log("Mark as read:", selectedTickets);
    setSelectedTickets([]);
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
        // Single ticket delete
        await deleteTicketAPI(selectedTickets[0]);
        addToast("Tiket berhasil dihapus", "success");
      } else {
        // Multiple tickets delete
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
  
      // Refresh tickets data
      await loadTickets();
      
      // Clear selection
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

  const FilterButton = ({ label, count, active, onClick, badgeColor }) => (
    <button
      className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        active ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      <span>{label}</span>
      {count > 0 && (
        <span
          className={`text-xs font-semibold px-2 rounded-full ${
            badgeColor || "bg-gray-200 text-gray-800"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

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
    <div className="p-6">
      {/* Header dengan tombol submit */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Tiket</h1>
          <p className="text-gray-600 mt-1">Kelola semua tiket Anda di sini</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <div className="flex space-x-2">
              <button
                onClick={loadTickets}
                className="text-red-600 hover:text-red-800 font-medium underline"
              >
                Coba Lagi
              </button>
              <button
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
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
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tiket</p>
              <p className="text-2xl font-semibold text-gray-900">
                {ticketCounts.total}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tiket Baru</p>
              <p className="text-2xl font-semibold text-gray-900">
                {ticketCounts.new}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Sedang Diproses
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {ticketCounts.processing}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Selesai</p>
              <p className="text-2xl font-semibold text-gray-900">
                {ticketCounts.completed}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Container - Gabungan filter dan tabs */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        {/* Top Filters */}
        <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
          <div className="flex space-x-2">
            <select className="border border-gray-300 text-sm px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Semua Kategori</option>
            </select>
            <select className="border border-gray-300 text-sm px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Kapan Saja</option>
            </select>
            <select className="border border-gray-300 text-sm px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Belum Dibaca</option>
            </select>
          </div>
          <button
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
            onClick={() => {
              setStatusFilter("Semua");
              loadTickets();
            }}
          >
            Reset Filter
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center space-x-2 border-t pt-4">
          <span className="text-sm font-medium text-gray-700 mr-2">
            Status:
          </span>
          <FilterButton
            label="Semua"
            count={ticketCounts.total}
            active={statusFilter === "Semua"}
            onClick={() => setStatusFilter("Semua")}
          />
          <FilterButton
            label="Tiket Baru"
            count={ticketCounts.new}
            badgeColor="bg-gray-200 text-gray-800"
            active={statusFilter === "Tiket Baru"}
            onClick={() => setStatusFilter("Tiket Baru")}
          />
          <FilterButton
            label="Sedang Diproses"
            count={ticketCounts.processing}
            badgeColor="bg-yellow-200 text-yellow-800"
            active={statusFilter === "Sedang Diproses"}
            onClick={() => setStatusFilter("Sedang Diproses")}
          />
          <FilterButton
            label="Selesai"
            count={ticketCounts.completed}
            badgeColor="bg-green-200 text-green-800"
            active={statusFilter === "Selesai"}
            onClick={() => setStatusFilter("Selesai")}
          />
        </div>
      </div>

      {/* Ticket List Header */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 rounded-t-lg">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedTickets.length === currentTickets.length && currentTickets.length > 0}
              ref={(el) => {
                if (el) {
                  el.indeterminate = selectedTickets.length > 0 && selectedTickets.length < currentTickets.length;
                }
              }}
              onChange={handleSelectAll}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 mr-4"
            />
            <span className="text-sm font-medium text-gray-700">
              {selectedTickets.length > 0
                ? `${selectedTickets.length} tiket dipilih`
                : `Menampilkan ${startIndex + 1}-${Math.min(endIndex, filteredTickets.length)} dari ${filteredTickets.length} tiket`}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Page Info */}
            <span className="text-sm text-gray-500">
              Halaman {currentPage} dari {totalPages}
            </span>

            {filteredTickets.length > 0 && (
              <button
                onClick={loadTickets}
                className="p-1 text-gray-500 hover:text-gray-700"
                title="Refresh"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Ticket List */}
        {currentTickets.map((ticket, index) => (
          <div
            key={`${ticket.id}-${index}`}
            className={`flex items-start gap-4 px-4 py-4 border-b hover:bg-gray-50 transition-colors ${
              !ticket.isRead ? "bg-blue-50" : ""
            } ${selectedTickets.includes(ticket.id) ? "bg-blue-100" : ""}`}
          >
            {/* Checkbox - Simplified handling */}
            <input
              type="checkbox"
              checked={selectedTickets.includes(ticket.id)}
              onChange={(e) => {
                e.stopPropagation();
                handleSelectTicket(ticket.id);
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="w-4 h-4 cursor-pointer mt-1"
            />

            <div 
              className="flex-1 cursor-pointer"
              onClick={() => handleTicketClick(ticket.id)}
            >
              {/* Ticket Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    #{ticket.id}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                      ticket.priority
                    )}`}
                  >
                    {getPriorityLabel(ticket.priority)}
                  </span>
                  {!ticket.isRead && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>
                <span className="text-sm text-gray-500">{ticket.date}</span>
              </div>

              {/* Ticket Title */}
              <div className="text-blue-700 font-medium mb-2 hover:text-blue-800">
                {ticket.subject}
              </div>

              {/* Ticket Meta Info */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">Dari:</span>
                    <span>{ticket.sender}</span>
                    {ticket.sender !== "Anonim" && ticket.email && (
                      <span className="text-gray-400">({ticket.email})</span>
                    )}
                  </div>
                  {ticket.nim && (
                    <div className="flex items-center space-x-1">
                      <span>NIM:</span>
                      <span className="font-medium">{ticket.nim}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <span>📁</span>
                    <span>{ticket.categoryType}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>🔵</span>
                    <span>{ticket.category}</span>
                  </div>
                  {/* Read Status Indicators */}
                  <div className="flex items-center space-x-1">
                    {ticket.readByAdmin && (
                      <span className="text-green-600" title="Dibaca Admin">
                        👨‍💼
                      </span>
                    )}
                    {ticket.readByDisposisi && (
                      <span className="text-blue-600" title="Dibaca Disposisi">
                        📋
                      </span>
                    )}
                    {ticket.isRead && (
                      <span className="text-gray-600" title="Dibaca Mahasiswa">
                        👁️
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Info for Non-Anonymous */}
              {!ticket.anonymous && (ticket.prodi || ticket.semester) && (
                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                  {ticket.prodi && <span>Prodi: {ticket.prodi}</span>}
                  {ticket.semester && <span>Semester: {ticket.semester}</span>}
                </div>
              )}
            </div>

            {/* Arrow indicator */}
            <div className="flex items-center text-gray-400">
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {filteredTickets.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414-2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Menampilkan <span className="font-medium">{startIndex + 1}</span> sampai{" "}
                <span className="font-medium">{Math.min(endIndex, filteredTickets.length)}</span> dari{" "}
                <span className="font-medium">{filteredTickets.length}</span> hasil
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
                        <span key="ellipsis-start" className="px-3 py-1 text-sm font-medium text-gray-500">
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
                            ? "text-white bg-red-600 border border-red-600"
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
                        <span key="ellipsis-end" className="px-3 py-1 text-sm font-medium text-gray-500">
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

      {/* Bulk Actions - tampil jika ada tiket yang dipilih */}
      {selectedTickets.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border px-6 py-3">
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
              <strong>Catatan:</strong> Tiket akan dihapus secara permanen dari dashboard Anda, 
              tetapi data akan tetap tersimpan untuk keperluan administrasi.
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
