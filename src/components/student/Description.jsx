import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import Header from "../Navbar";
import Form from "./Form";
import Button from "../Button";
import Label from "../Label";

const Description = () => {
  const [activePage, setActivePage] = useState("inbox");
  const [showFormModal, setShowFormModal] = useState(false);
  const username = localStorage.getItem("username") || "Pengguna";

  // State untuk daftar status
  const [statusList, setStatusList] = useState([
    {
      id: 1,
      status: "Pengaduan Baru",
      description:
        "Laporan pengaduan baru telah diterima dan sedang menunggu verifikasi",
      time: "7 Mei",
      date: "7 Mei 2025, 04:05 (2 hari yang lalu)",
    },
    {
      id: 2,
      status: "Verifikasi",
      description: "Laporan sedang diverifikasi oleh petugas",
      time: "13.42",
      date: "6 Mei 2025, 13:42 (3 hari yang lalu)",
    },
    {
      id: 3,
      status: "Diproses",
      description: "Laporan sedang ditindaklanjuti oleh unit terkait",
      time: "13.42",
      date: "5 Mei 2025, 13:42 (4 hari yang lalu)",
    },
    {
      id: 4,
      status: "Selesai",
      description: "Laporan telah selesai ditindaklanjuti",
      time: "13.42",
      date: "4 Mei 2025, 13:42 (5 hari yang lalu)",
    },
    {
      id: 5,
      status: "Ditolak",
      description: "Laporan ditolak karena tidak memenuhi kriteria",
      time: "13.42",
      date: "3 Mei 2025, 13:42 (6 hari yang lalu)",
    },
  ]);

  // State untuk item yang dipilih
  const [selectedStatusId, setSelectedStatusId] = useState(null);

  // Temukan status yang dipilih
  const selectedStatus = statusList.find(
    (item) => item.id === selectedStatusId
  );

  // Status badge component
  const StatusBadge = ({ status }) => {
    // Menentukan warna badge berdasarkan status
    const getBadgeColor = () => {
      switch (status.toLowerCase()) {
        case "pengaduan baru":
          return "bg-blue-100 text-blue-800";
        case "verifikasi":
          return "bg-yellow-100 text-yellow-800";
        case "diproses":
          return "bg-indigo-100 text-indigo-800";
        case "selesai":
          return "bg-green-100 text-green-800";
        case "ditolak":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    return (
      <span
        className={`${getBadgeColor()} px-2 py-1 text-xs font-medium rounded-full`}
      >
        {status}
      </span>
    );
  };

  // Handler untuk menu yang diklik dari sidebar
  const handleMenuClick = (menuId) => {
    if (menuId === "tulis") {
      // Jika menu "tulis" diklik, tampilkan modal form
      setShowFormModal(true);
    } else {
      // Untuk menu lain, update halaman aktif
      setActivePage(menuId);
    }
  };

  // Handler untuk menutup modal
  const handleCloseModal = () => {
    setShowFormModal(false);
  };

  // Handler untuk klik pada status item
  const handleStatusClick = (statusId) => {
    setSelectedStatusId(statusId === selectedStatusId ? null : statusId);
  };

  // Function to handle checkbox selection (to be implemented later)
  const handleSelectAll = () => {
    // Implementation for select all functionality
  };

  // Menentukan konten yang ditampilkan berdasarkan activePage
  const renderContent = () => {
    if (activePage === "kanban") {
      return (
        <div className="p-4 bg-gray-900 min-h-screen">
          <h1 className="text-2xl font-bold text-white mb-4">Kanban Board</h1>
          <p className="text-gray-300">
            Konten Kanban Board akan ditampilkan di sini.
          </p>
        </div>
      );
    }

    // Untuk halaman lain, tampilkan status list
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <Label
            text={`Status Pengaduan - ${
              activePage.charAt(0).toUpperCase() + activePage.slice(1)
            }`}
            color="blue"
            className="text-xl font-semibold"
          />
          <p className="text-gray-600 mt-2">
            Berikut adalah status pengaduan terbaru:
          </p>
        </div>

        {/* Status List */}
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          {/* Header dengan opsi */}
          <div className="bg-gray-50 p-3 border-b flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 rounded mr-3"
                onChange={handleSelectAll}
              />
              <span className="text-sm font-medium">Status Pengaduan</span>
            </div>
            <div className="flex items-center space-x-2">
              <button className="text-gray-500 hover:text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Daftar status */}
          <div className="divide-y">
            {statusList.map((item) => (
              <div
                key={item.id}
                className={`flex items-center p-3 border-b cursor-pointer ${
                  item.id === selectedStatusId
                    ? "bg-pink-100"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleStatusClick(item.id)}
              >
                <div className="flex-shrink-0 mr-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="flex-grow min-w-0 flex items-center">
                  <StatusBadge status={item.status} />
                  <div className="text-sm truncate flex-grow ml-4 text-gray-700">
                    {item.description}
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4 text-sm text-gray-500">
                  {item.time}
                </div>
              </div>
            ))}
          </div>

          {/* Detail status */}
          {selectedStatusId && (
            <div className="bg-pink-50 p-6">
              <h2 className="text-xl font-semibold mb-4">
                {selectedStatus.status}
              </h2>

              <div className="flex items-center mb-6">
                <div className="mr-3">
                  <StatusBadge status={selectedStatus.status} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedStatus.time} ({selectedStatus.date})
                  </div>
                </div>
              </div>

              <div className="text-gray-800">
                <p className="mb-4">{selectedStatus.description}</p>
                <p className="mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse
                  cillum dolore eu fugiat nulla pariatur. Excepteur sint
                  occaecat cupidatat non proident, sunt in culpa qui officia
                  deserunt mollit anim id est laborum.
                </p>
              </div>

              {/* Detail langkah-langkah status */}
              <div className="mt-8">
                <h3 className="font-medium text-lg mb-4">
                  Langkah-langkah Penanganan:
                </h3>
                <div className="border-l-2 border-gray-300 pl-4 space-y-6 ml-2">
                  <div className="relative">
                    <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-green-500"></div>
                    <div>
                      <div className="font-medium">Pengaduan Diterima</div>
                      <div className="text-sm text-gray-500">
                        3 Mei 2025, 10:30
                      </div>
                      <p className="mt-1 text-sm">
                        Pengaduan telah diterima dan dicatat dalam sistem.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-green-500"></div>
                    <div>
                      <div className="font-medium">Verifikasi Data</div>
                      <div className="text-sm text-gray-500">
                        4 Mei 2025, 13:45
                      </div>
                      <p className="mt-1 text-sm">
                        Data pengaduan telah diverifikasi oleh petugas.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-green-500"></div>
                    <div>
                      <div className="font-medium">Proses Penanganan</div>
                      <div className="text-sm text-gray-500">
                        5 Mei 2025, 09:15
                      </div>
                      <p className="mt-1 text-sm">
                        Pengaduan sedang dalam proses penanganan oleh tim
                        terkait.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div
                      className={`absolute -left-6 mt-1 w-4 h-4 rounded-full ${
                        selectedStatus.status === "Selesai"
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <div>
                      <div className="font-medium">Penyelesaian</div>
                      <div className="text-sm text-gray-500">
                        {selectedStatus.status === "Selesai"
                          ? "7 Mei 2025, 16:20"
                          : "Menunggu"}
                      </div>
                      <p className="mt-1 text-sm">
                        {selectedStatus.status === "Selesai"
                          ? "Pengaduan telah diselesaikan."
                          : "Menunggu penyelesaian pengaduan."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header Component */}
      <Header />

      <div className="flex flex-1">
        {/* Sidebar Component dengan handler onClick */}
        <Sidebar onMenuClick={handleMenuClick} />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Selamat Datang, {username}</span>
              <Button
                text="Logout"
                type="danger"
                onClick={() => {
                  // Handle logout
                  localStorage.removeItem("username");
                  window.location.reload(); // Refresh halaman untuk kembali ke login
                }}
              />
            </div>
          </div>

          {/* Render konten berdasarkan activePage */}
          {renderContent()}
        </div>
      </div>

      {/* Modal Form */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="sticky top-0 z-10 flex justify-end p-4 bg-white border-b">
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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
            <div className="p-4">
              <Form />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
