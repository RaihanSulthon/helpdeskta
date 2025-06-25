// src/pages/StudentDashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Semua");

  // Sample tickets data
  const tickets = [
    {
      id: "BP1FRZ9k",
      sender: "Muhammad Burhan",
      email: "muhammadburhan@student.telkomuniversity.ac.id",
      date: "Kemarin, 05:43",
      subject: "TAK Belum Kunjung Lorem Ipsum",
      category: "Tiket Baru",
      categoryType: "TAK",
      isRead: false,
    },
    {
      id: "BP1XYZ12",
      sender: "Ayu Lestari",
      email: "ayulestari@student.telkomuniversity.ac.id",
      date: "Kemarin, 12:30",
      subject: "Permintaan Perpanjangan Beasiswa",
      category: "Sedang Diproses",
      categoryType: "Beasiswa",
      isRead: false,
    },
    {
      id: "BP2LMN34",
      sender: "Rizky Maulana",
      email: "rizky@student.telkomuniversity.ac.id",
      date: "2 Hari Lalu, 08:00",
      subject: "Sertifikat TAK Belum Diterima",
      category: "Selesai",
      categoryType: "TAK",
      isRead: true,
    },
    {
      id: "BP3QRS56",
      sender: "Dewi Sartika",
      email: "dewi@student.telkomuniversity.ac.id",
      date: "Hari Ini, 10:15",
      subject: "Verifikasi Kegiatan Organisasi",
      category: "Tiket Baru",
      categoryType: "Organisasi",
      isRead: false,
    },
  ];

  const filteredTickets =
    statusFilter === "Semua"
      ? tickets
      : tickets.filter((ticket) => ticket.category === statusFilter);

  const handleSelectAll = (e) => {
    setSelectedTickets(e.target.checked ? tickets.map((t) => t.id) : []);
  };

  const handleSelectTicket = (ticketId, e) => {
    // Stop event bubbling agar tidak trigger handleTicketClick
    e.stopPropagation();
    setSelectedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  // Handler untuk navigasi ke detail tiket
  const handleTicketClick = (ticketId) => {
    navigate(`/ticket/${ticketId}`);
  };

  const FilterButton = ({ label, count, active, onClick, badgeColor }) => (
    <button
      className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${
        active ? "bg-blue-100 text-blue-700" : "text-gray-600"
      }`}
      onClick={onClick}
    >
      <span>{label}</span>
      {count > 0 && (
        <span
          className={`text-xs font-semibold px-2 rounded-full ${badgeColor}`}
        >
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="p-6">
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
          <button className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium">
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
            count={2048}
            active={statusFilter === "Semua"}
            onClick={() => setStatusFilter("Semua")}
          />
          <FilterButton
            label="Tiket Baru"
            count={3}
            badgeColor="bg-gray-200 text-gray-800"
            active={statusFilter === "Tiket Baru"}
            onClick={() => setStatusFilter("Tiket Baru")}
          />
          <FilterButton
            label="Sedang Diproses"
            count={25}
            badgeColor="bg-yellow-200 text-yellow-800"
            active={statusFilter === "Sedang Diproses"}
            onClick={() => setStatusFilter("Sedang Diproses")}
          />
          <FilterButton
            label="Selesai"
            count={2025}
            badgeColor="bg-green-200 text-green-800"
            active={statusFilter === "Selesai"}
            onClick={() => setStatusFilter("Selesai")}
          />
        </div>
      </div>

      {/* Ticket List Header */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center px-4 py-3 border-b bg-gray-50 rounded-t-lg">
          <input
            type="checkbox"
            checked={
              selectedTickets.length === filteredTickets.length &&
              filteredTickets.length > 0
            }
            onChange={handleSelectAll}
            className="w-4 h-4 mr-4"
          />
          <span className="text-sm font-medium text-gray-700">
            {selectedTickets.length > 0
              ? `${selectedTickets.length} tiket dipilih`
              : `${filteredTickets.length} tiket`}
          </span>
        </div>

        {/* Ticket List */}
        {filteredTickets.map((ticket, index) => (
          <div
            key={`${ticket.id}-${index}`}
            className={`flex items-start gap-4 px-4 py-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
              !ticket.isRead ? "bg-blue-50" : ""
            } ${selectedTickets.includes(ticket.id) ? "bg-blue-100" : ""}`}
            onClick={() => handleTicketClick(ticket.id)}
          >
            <input
              type="checkbox"
              checked={selectedTickets.includes(ticket.id)}
              onChange={(e) => handleSelectTicket(ticket.id, e)}
              className="mt-1 w-4 h-4"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                <div className="flex flex-wrap gap-2">
                  <span className="font-semibold text-black">#{ticket.id}</span>
                  <span>{ticket.sender}</span>
                  <span className="text-gray-400">{ticket.email}</span>
                </div>
                <span>{ticket.date}</span>
              </div>
              <div className="text-blue-700 font-medium mb-1 text-sm hover:text-blue-800">
                {ticket.subject}
              </div>
              <div className="flex gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <span>🗓</span>
                  <span>{ticket.date}</span>
                </div>
                <div className="flex items-center gap-1 text-blue-600">
                  <span>🔵</span>
                  <span>{ticket.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📁</span>
                  <span>{ticket.categoryType}</span>
                </div>
              </div>
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
        {filteredTickets.length === 0 && (
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-lg font-medium">Tidak ada tiket</p>
            <p className="text-sm">
              Belum ada tiket untuk kategori {statusFilter}
            </p>
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
            <button className="text-sm text-blue-600 hover:text-blue-800">
              Tandai sebagai dibaca
            </button>
            <button className="text-sm text-red-600 hover:text-red-800">
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
    </div>
  );
};

export default StudentDashboard;
