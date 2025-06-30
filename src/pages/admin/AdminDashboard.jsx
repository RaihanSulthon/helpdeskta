// src/pages/admin/AdminDashboard.jsx - Real API Integration with Drag & Drop
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminTicketsAPI, updateTicketStatusAPI } from "../../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState({
    "tiket-baru": [],
    diproses: [],
    selesai: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draggedTicket, setDraggedTicket] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [updating, setUpdating] = useState(null); // Track which ticket is being updated

  // Load tickets on component mount
  useEffect(() => {
    loadAdminTickets();
  }, []);

  const loadAdminTickets = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Loading admin tickets...");
      const ticketsData = await getAdminTicketsAPI();
      console.log("Received tickets data:", ticketsData);

      // Group tickets by status
      const groupedTickets = {
        "tiket-baru": [],
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

      console.log("Grouped tickets:", groupedTickets);
      setTickets(groupedTickets);
    } catch (error) {
      console.error("Error loading admin tickets:", error);
      setError("Gagal memuat data tiket: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Transform API ticket data to component format
  const transformTicketData = (ticket) => {
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
      priority: ticket.priority || "medium",
      isRead: ticket.read_by_admin === true || ticket.read_by_admin === 1,
      status: ticket.status,
      rawTicket: ticket, // Keep original data for reference
      // Additional admin fields
      nim: ticket.nim || "",
      prodi: ticket.prodi || "",
      semester: ticket.semester || "",
      noHp: ticket.no_hp || "",
      anonymous: ticket.anonymous === true || ticket.anonymous === 1,
      readByAdmin: ticket.read_by_admin === true || ticket.read_by_admin === 1,
      readByDisposisi:
        ticket.read_by_disposisi === true || ticket.read_by_disposisi === 1,
      readByStudent:
        ticket.read_by_student === true || ticket.read_by_student === 1,
      assignedTo: ticket.assigned_to,
      feedback: Math.floor(Math.random() * 5) + 1, // Mock feedback for now
      feedbackType: "warning", // Mock feedback type
    };
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
      });
    } catch (error) {
      return "Tanggal tidak valid";
    }
  };

  // Map API status to display category
  const mapStatusToCategory = (status) => {
    if (!status) return "TAK";

    switch (status.toLowerCase()) {
      case "pending":
      case "new":
      case "open":
        return "TAK";
      case "in_progress":
      case "processing":
      case "assigned":
        return "PROSES";
      case "completed":
      case "resolved":
      case "closed":
        return "SELESAI";
      default:
        return "TAK";
    }
  };

  // Map API status to kanban column - UPDATED
  const mapStatusToColumn = (status) => {
    if (!status) return "tiket-baru";

    switch (status.toLowerCase()) {
      case "pending":
      case "new":
      case "open":
        return "tiket-baru";
      case "in_progress":
      case "processing":
      case "assigned":
        return "diproses";
      case "completed":
      case "resolved":
      case "closed":
        return "selesai";
      default:
        return "tiket-baru";
    }
  };

  // Map column to API status - FIXED
  const mapColumnToStatus = (column) => {
    switch (column) {
      case "tiket-baru":
        return "open";
      case "diproses":
        return "in_progress";
      case "selesai":
        return "closed"; // Try "closed" instead of "completed"
      default:
        return "open";
    }
  };

  const columnConfig = {
    "tiket-baru": {
      title: "TIKET BARU",
      count: tickets["tiket-baru"].length,
      bgColor: "bg-orange-600",
      textColor: "text-white",
    },
    diproses: {
      title: "DIPROSES",
      count: tickets["diproses"].length,
      bgColor: "bg-blue-600",
      textColor: "text-white",
    },
    selesai: {
      title: "SELESAI",
      count: tickets["selesai"].length,
      bgColor: "bg-green-600",
      textColor: "text-white",
    },
  };

  const handleDragStart = (e, ticket, fromColumn) => {
    setDraggedTicket(ticket);
    setDraggedFrom(fromColumn);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, toColumn) => {
    e.preventDefault();

    if (!draggedTicket || !draggedFrom || draggedFrom === toColumn) {
      setDraggedTicket(null);
      setDraggedFrom(null);
      return;
    }

    try {
      setUpdating(draggedTicket.id);

      // Get new status for API - try multiple options
      let newStatus = mapColumnToStatus(toColumn);
      console.log(
        `Updating ticket ${draggedTicket.id} from ${draggedFrom} to ${toColumn} (${newStatus})`
      );

      // Call API to update status
      try {
        await updateTicketStatusAPI(draggedTicket.id, newStatus);
      } catch (error) {
        // If failed, try alternative status names
        if (toColumn === "selesai") {
          console.log("Trying alternative status for 'selesai'...");
          try {
            newStatus = "completed";
            await updateTicketStatusAPI(draggedTicket.id, newStatus);
          } catch (error2) {
            try {
              newStatus = "resolved";
              await updateTicketStatusAPI(draggedTicket.id, newStatus);
            } catch (error3) {
              throw error; // Throw original error if all fail
            }
          }
        } else {
          throw error;
        }
      }

      // Update local state
      setTickets((prev) => {
        const newTickets = { ...prev };

        // Remove from source column
        newTickets[draggedFrom] = newTickets[draggedFrom].filter(
          (ticket) => ticket.id !== draggedTicket.id
        );

        // Update ticket status and add to target column
        const updatedTicket = {
          ...draggedTicket,
          status: newStatus,
          category: mapStatusToCategory(newStatus),
        };
        newTickets[toColumn] = [...newTickets[toColumn], updatedTicket];

        return newTickets;
      });

      console.log("Ticket status updated successfully to:", newStatus);
    } catch (error) {
      console.error("Error updating ticket status:", error);
      setError("Gagal mengupdate status tiket: " + error.message);

      // Show error for 5 seconds
      setTimeout(() => setError(""), 5000);
    } finally {
      setUpdating(null);
      setDraggedTicket(null);
      setDraggedFrom(null);
    }
  };

  const handleTicketClick = (ticketId) => {
    navigate(`/ticket/${ticketId}`);
  };

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

  const TicketCard = ({ ticket, columnKey }) => (
    <div
      draggable={!updating}
      onDragStart={(e) => handleDragStart(e, ticket, columnKey)}
      onClick={() => handleTicketClick(ticket.id)}
      className={`bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200 transition-all duration-200 ${
        updating === ticket.id
          ? "opacity-50 cursor-wait"
          : "cursor-move hover:shadow-md"
      }`}
    >
      {/* Checkbox and ID */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="w-4 h-4 mr-2 rounded"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
            #{ticket.id}
          </span>
        </div>
        <div className="flex items-center space-x-2">
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
      </div>

      {/* Date */}
      <div className="text-xs text-gray-500 mb-2">{ticket.date}</div>

      {/* Sender Info */}
      <div className="mb-2">
        <div className="text-sm font-medium text-gray-800">{ticket.sender}</div>
        <div className="text-xs text-gray-500 truncate">{ticket.email}</div>
        {ticket.nim && (
          <div className="text-xs text-gray-500">NIM: {ticket.nim}</div>
        )}
      </div>

      {/* Subject */}
      <div className="mb-3">
        <h4 className="text-sm font-medium text-blue-700 leading-snug line-clamp-2">
          {ticket.subject}
        </h4>
      </div>

      {/* Footer with category and status indicators */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            📁 {ticket.categoryType}
          </span>
        </div>

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
          {ticket.readByStudent && (
            <span className="text-gray-600" title="Dibaca Mahasiswa">
              👁️
            </span>
          )}
        </div>
      </div>

      {updating === ticket.id && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );

  const Column = ({ columnKey, config }) => (
    <div
      className="flex-1 bg-gray-50 rounded-lg p-4 min-w-80"
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, columnKey)}
    >
      {/* Column Header */}
      <div
        className={`${config.bgColor} ${config.textColor} rounded-lg p-3 mb-4 flex items-center justify-between`}
      >
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-white rounded"></div>
          <span className="font-bold text-sm">{config.title}</span>
          <span className="font-bold text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
            {config.count}
          </span>
        </div>
        <button
          className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
          title="Refresh Column"
          onClick={loadAdminTickets}
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
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Drop Zone Indicator */}
      <div className="min-h-96 relative">
        {tickets[columnKey].length === 0 ? (
          <div className="absolute inset-0 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg
                className="w-8 h-8 mx-auto mb-2 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414-2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <span className="text-sm">Tidak ada tiket</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {tickets[columnKey].map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                columnKey={columnKey}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Loading state
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

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Management Ticket
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola semua tiket dengan drag & drop untuk mengubah status
            </p>
          </div>
          <button
            onClick={loadAdminTickets}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
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
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tiket</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tickets["tiket-baru"].length +
                  tickets["diproses"].length +
                  tickets["selesai"].length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border">
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
                {tickets["tiket-baru"].length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border">
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
                {tickets["diproses"].length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border">
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
                {tickets["selesai"].length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex space-x-6 overflow-x-auto pb-4">
        {Object.entries(columnConfig).map(([key, config]) => (
          <Column key={key} columnKey={key} config={config} />
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-blue-900">
              Cara Menggunakan
            </h3>
            <p className="text-sm text-blue-800 mt-1">
              Drag & drop tiket antar kolom untuk mengubah status. Status akan
              otomatis tersinkronisasi dengan dashboard student.
            </p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>
                • <strong>Tiket Baru:</strong> Status "open" - tiket yang baru
                masuk
              </li>
              <li>
                • <strong>Diproses:</strong> Status "in_progress" - tiket yang
                sedang ditangani
              </li>
              <li>
                • <strong>Selesai:</strong> Status "completed" - tiket yang
                sudah diselesaikan
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
