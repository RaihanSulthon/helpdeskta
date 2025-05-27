// src/pages/StudentDashboardWithTabs.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const StudentDashboardWithTabs = () => {
  const { user } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTab, setActiveTab] = useState("notifications");

  // Sample notification data based on image 1
  const notifications = [
    {
      id: 1,
      sender: "Maze",
      subject:
        "Maze will be undergoing maintenance for approximately 4 hours to perform updates",
      date: "7 Mei",
      category: "FASILITAS AKADEMIK",
      status: "Diproses",
      quarter: "Kuartal 2/2025",
      content: `Izin melaporkan ke bkn pusat bahwa bkpsdm kabupaten lebong belum mengeluarkan pengumuman hasil administrasi pppk tahap 2 sampai saat ini,saat ditanya ke kepala bkpsdm nya belum juga ada kejelasan,dengan ini saya mewakili teman-teman honorer dikabupaten lebong provinsi bengkulu ingin melapor kan masalah ini ke bkn pusat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint.

Izin melaporkan ke bkn pusat bahwa bkpsdm kabupaten lebong belum mengeluarkan pengumuman hasil administrasi pppk tahap 2 sampai saat ini,saat ditanya ke kepala bkpsdm nya belum juga ada kejelasan,dengan ini saya mewakili teman-teman honorer dikabupaten lebong provinsi bengkulu ingin melapor kan masalah ini ke bkn pusat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint.`,
    },
    {
      id: 2,
      sender: "Maze",
      subject:
        "Maze will be undergoing maintenance for approximately 4 hours to perform updates",
      date: "13.42",
      category: "FASILITAS AKADEMIK",
      status: "Diproses",
      quarter: "Kuartal 2/2025",
      content: `Izin melaporkan ke bkn pusat bahwa bkpsdm kabupaten lebong belum mengeluarkan pengumuman hasil administrasi pppk tahap 2 sampai saat ini,saat ditanya ke kepala bkpsdm nya belum juga ada kejelasan,dengan ini saya mewakili teman-teman honorer dikabupaten lebong provinsi bengkulu ingin melapor kan masalah ini ke bkn pusat. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
    },
    {
      id: 3,
      sender: "Maze",
      subject:
        "Maze will be undergoing maintenance for approximately 4 hours to perform updates",
      date: "13.42",
      category: "FASILITAS AKADEMIK",
      status: "Diproses",
      quarter: "Kuartal 2/2025",
      content: `Izin melaporkan ke bkn pusat bahwa bkpsdm kabupaten lebong belum mengeluarkan pengumuman hasil administrasi pppk tahap 2 sampai saat ini,saat ditanya ke kepala bkpsdm nya belum juga ada kejelasan.`,
    },
    {
      id: 4,
      sender: "Maze",
      subject:
        "Maze will be undergoing maintenance for approximately 4 hours to perform updates",
      date: "13.42",
      category: "FASILITAS AKADEMIK",
      status: "Diproses",
      quarter: "Kuartal 2/2025",
      content: `Izin melaporkan ke bkn pusat bahwa bkpsdm kabupaten lebong belum mengeluarkan pengumuman hasil administrasi pppk tahap 2 sampai saat ini.`,
    },
    {
      id: 5,
      sender: "Maze",
      subject:
        "Maze will be undergoing maintenance for approximately 4 hours to perform updates",
      date: "13.42",
      category: "FASILITAS AKADEMIK",
      status: "Diproses",
      quarter: "Kuartal 2/2025",
      content: `Izin melaporkan ke bkn pusat bahwa bkpsdm kabupaten lebong belum mengeluarkan pengumuman hasil administrasi pppk tahap 2 sampai saat ini,saat ditanya ke kepala bkpsdm nya belum juga ada kejelasan,dengan ini saya mewakili teman-teman honorer dikabupaten lebong provinsi bengkulu ingin melapor kan masalah ini ke bkn pusat.`,
    },
  ];

  // Sample tickets data
  const tickets = [
    {
      id: 101,
      subject: "Bandung Proyektor Ruangan TULT Lantai 7 Sering Mati",
      date: "Hari ini, 05:43",
      category: "FASILITAS AKADEMIK",
      status: "Diproses",
      quarter: "Kuartal 2/2025",
      content: `Izin melaporkan ke bkn pusat bahwa bkpsdm kabupaten lebong belum mengeluarkan pengumuman hasil administrasi pppk tahap 2 sampai saat ini,saat ditanya ke kepala bkpsdm nya belum juga ada kejelasan,dengan ini saya mewakili teman-teman honorer dikabupaten lebong provinsi bengkulu ingin melapor kan masalah ini ke bkn pusat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint.

Izin melaporkan ke bkn pusat bahwa bkpsdm kabupaten lebong belum mengeluarkan pengumuman hasil administrasi pppk tahap 2 sampai saat ini,saat ditanya ke kepala bkpsdm nya belum juga ada kejelasan,dengan ini saya mewakili teman-teman honorer dikabupaten lebong provinsi bengkulu ingin melapor kan masalah ini ke bkn pusat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint.`,
    },
    {
      id: 102,
      subject: "AC Lab Komputer Gedung TULT Lantai 5 Tidak Dingin",
      date: "14 Mei 2025",
      category: "FASILITAS AKADEMIK",
      status: "Selesai",
      quarter: "Kuartal 2/2025",
      content: `Saya ingin melaporkan bahwa AC di laboratorium komputer gedung TULT lantai 5 sudah beberapa hari ini tidak dingin. Suhu ruangan sangat panas dan membuat mahasiswa tidak nyaman saat praktikum.`,
    },
    {
      id: 103,
      subject: "Wifi Gedung Kuliah Umum Sering Terputus",
      date: "10 Mei 2025",
      category: "FASILITAS AKADEMIK",
      status: "Diproses",
      quarter: "Kuartal 2/2025",
      content: `Saya ingin melaporkan bahwa wifi di gedung kuliah umum sering terputus, terutama pada jam-jam sibuk perkuliahan. Hal ini mengganggu proses pembelajaran yang membutuhkan koneksi internet.`,
    },
  ];

  // Function to handle ticket click
  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
  };

  // Function to close ticket detail
  const handleCloseTicket = () => {
    setSelectedTicket(null);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="font-semibold mb-2">Tiket Aktif</h3>
            <p className="text-3xl font-bold text-blue-600">3</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
            <h3 className="font-semibold mb-2">Tiket Selesai</h3>
            <p className="text-3xl font-bold text-green-600">7</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
            <h3 className="font-semibold mb-2">Total Tiket</h3>
            <p className="text-3xl font-bold text-purple-600">10</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="flex border-b">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "notifications"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("notifications")}
            >
              Notifikasi
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "tickets"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("tickets")}
            >
              Tiket Saya
            </button>
          </div>

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-8 px-4 py-3 text-left"></th>
                    <th className="px-4 py-3 text-left">Pengirim</th>
                    <th className="px-4 py-3 text-left">Subjek</th>
                    <th className="w-24 px-4 py-3 text-center">Aksi</th>
                    <th className="w-24 px-4 py-3 text-right">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {notifications.map((notification) => (
                    <tr
                      key={notification.id}
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => handleTicketClick(notification)}
                    >
                      <td className="px-4 py-3">
                        <button className="text-gray-400 hover:text-yellow-500">
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        </button>
                      </td>
                      <td className="px-4 py-3">{notification.sender}</td>
                      <td className="px-4 py-3">{notification.subject}</td>
                      <td className="px-4 py-3 text-center">
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg
                            className="w-5 h-5 inline"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {notification.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === "tickets" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Subjek</th>
                    <th className="px-4 py-3 text-left">Kategori</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="w-24 px-4 py-3 text-right">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => handleTicketClick(ticket)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{ticket.subject}</div>
                        <div className="text-xs text-gray-500">
                          {ticket.quarter}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          {ticket.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            ticket.status === "Diproses"
                              ? "bg-yellow-100 text-yellow-800"
                              : ticket.status === "Selesai"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">{ticket.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseTicket}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                    {selectedTicket.status}
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    {selectedTicket.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    {selectedTicket.quarter}
                  </span>
                </div>
                <h2 className="text-xl font-bold mt-1">
                  {selectedTicket.subject}
                </h2>
              </div>
              <button
                onClick={handleCloseTicket}
                className="text-gray-500 hover:text-gray-700"
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
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <div className="p-4">
              <div className="text-sm mb-4">
                {selectedTicket.sender && (
                  <p>
                    <span className="font-medium">Dari:</span>{" "}
                    {selectedTicket.sender}
                  </p>
                )}
                <p>
                  <span className="font-medium">Tanggal:</span>{" "}
                  {selectedTicket.date}
                </p>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="whitespace-pre-line">{selectedTicket.content}</p>
              </div>
            </div>

            <div className="flex justify-end p-4 border-t bg-gray-50">
              <button
                onClick={handleCloseTicket}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-100"
              >
                Tutup
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Balas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboardWithTabs;
