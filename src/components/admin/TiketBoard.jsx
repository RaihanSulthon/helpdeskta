// src/pages/TiketPage.jsx
import React, { useState } from "react";
import TiketColumn from "./TiketColumn";
import TiketCard from "./TiketCard";

const TiketPage = () => {
  // State untuk halaman aktif
  const [activePage, setActivePage] = useState("inbox");

  // State untuk kolom tiket
  const [columns, setColumns] = useState({
    "column-1": {
      id: "column-1",
      title: "Pesan Masuk",
      cardIds: ["task-3"],
    },
    "column-2": {
      id: "column-2",
      title: "Dibaca",
      cardIds: ["task-2"],
    },
    "column-3": {
      id: "column-3",
      title: "Penting",
      cardIds: ["task-4"],
    },
    "column-4": {
      id: "column-4",
      title: "Diarsipkan",
      cardIds: ["task-1"],
    },
  });

  // State untuk semua tiket
  const [tickets, setTickets] = useState({
    "task-1": {
      id: "task-1",
      judul: "Tugas Individu ACDR Week 7",
      dateRange: "April 17, 2025 → April 27, 2025",
      kategori: "Akademik",
      status: "selesai",
    },
    "task-2": {
      id: "task-2",
      judul: "Tugas Kelompok ACDR",
      dateRange: "April 17, 2025 → April 29, 2025",
      kategori: "Kelompok",
      status: "diproses",
    },
    "task-3": {
      id: "task-3",
      judul: "Dicoding Course",
      dateRange: "April 22, 2025 → April 29, 2025",
      kategori: "Kursus",
      status: "menunggu",
    },
    "task-4": {
      id: "task-4",
      judul: "Tugas Quiz 2 ACDR",
      dateRange: "April 23, 2025 → April 29, 2025",
      kategori: "Akademik",
      status: "selesai",
    },
  });

  // State untuk pesan
  const [messages, setMessages] = useState([
    {
      id: "msg-1",
      message: "Jangan lupa deadline Tugas Kelompok ACDR",
      sender: "Dosen ACDR",
      timestamp: "10:25 AM",
      isNew: true,
    },
    {
      id: "msg-2",
      message: "Kumpulkan laporan praktikum minggu lalu",
      sender: "Asisten Lab",
      timestamp: "09:30 AM",
      isNew: true,
    },
    {
      id: "msg-3",
      message: "Persiapkan presentasi untuk meeting besok",
      sender: "Kelompok Proyek",
      timestamp: "Yesterday",
      isNew: false,
    },
  ]);

  // State untuk input pesan baru
  const [newMessage, setNewMessage] = useState("");

  // State untuk tiket yang sedang dilihat detailnya
  const [selectedTicket, setSelectedTicket] = useState(null);

  // State untuk modal detail tiket
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Handler untuk mengirim pesan baru
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const newMessageObj = {
      id: `msg-${messages.length + 1}`,
      message: newMessage,
      sender: "Anda",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isNew: false,
    };

    setMessages([newMessageObj, ...messages]);
    setNewMessage("");
  };

  // Handler untuk mendrop tiket ke kolom
  const handleDropTicket = (cardId, columnId) => {
    // Cek apakah ini adalah pesan yang di-drop
    if (cardId.startsWith("msg-")) {
      // Konversi pesan menjadi tiket
      const messageIndex = messages.findIndex((msg) => msg.id === cardId);

      if (messageIndex !== -1) {
        const message = messages[messageIndex];

        // Buat tiket baru dari pesan
        const newTaskId = `task-${
          Object.keys(tickets).length + 1
        }-${Date.now()}`;
        const newTask = {
          id: newTaskId,
          judul: message.message,
          dateRange: `${new Date().toLocaleDateString()} → ${new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toLocaleDateString()}`,
          kategori: "Baru",
          status: "menunggu",
        };

        // Tambahkan tiket baru ke state tickets
        setTickets({
          ...tickets,
          [newTaskId]: newTask,
        });

        // Tambahkan ID tiket ke kolom tujuan
        const targetColumn = { ...columns[columnId] };
        targetColumn.cardIds = [...targetColumn.cardIds, newTaskId];

        setColumns({
          ...columns,
          [columnId]: targetColumn,
        });

        // Hapus pesan dari daftar pesan
        const newMessages = [...messages];
        newMessages.splice(messageIndex, 1);
        setMessages(newMessages);

        return;
      }
    }

    // Proses untuk tiket yang sudah ada
    // Cari kolom sumber
    let sourceColumnId = null;
    for (const [colId, column] of Object.entries(columns)) {
      if (column.cardIds.includes(cardId)) {
        sourceColumnId = colId;
        break;
      }
    }

    // Jika tidak ada kolom sumber atau sama dengan kolom tujuan, keluar
    if (!sourceColumnId || sourceColumnId === columnId) {
      return;
    }

    // Hapus tiket dari kolom sumber
    const sourceColumn = { ...columns[sourceColumnId] };
    const sourceCardIds = [...sourceColumn.cardIds];
    sourceCardIds.splice(sourceCardIds.indexOf(cardId), 1);
    sourceColumn.cardIds = sourceCardIds;

    // Tambahkan tiket ke kolom tujuan
    const destColumn = { ...columns[columnId] };
    const destCardIds = [...destColumn.cardIds];
    destCardIds.push(cardId);
    destColumn.cardIds = destCardIds;

    // Update state
    setColumns({
      ...columns,
      [sourceColumnId]: sourceColumn,
      [columnId]: destColumn,
    });
  };

  // Handler untuk menambahkan tiket baru
  const handleAddTicket = (columnId) => {
    const newCardId = `task-${Object.keys(tickets).length + 1}-${Date.now()}`;
    const newCard = {
      id: newCardId,
      judul: "Tugas Baru",
      dateRange: "Mei 1, 2025 → Mei 15, 2025",
      kategori: "Baru",
      status: "menunggu",
    };

    // Tambahkan tiket baru ke state
    setTickets({
      ...tickets,
      [newCardId]: newCard,
    });

    // Tambahkan ID tiket ke kolom
    const column = { ...columns[columnId] };
    column.cardIds = [...column.cardIds, newCardId];

    setColumns({
      ...columns,
      [columnId]: column,
    });
  };

  // Handler untuk klik tiket (menampilkan detail)
  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setShowDetailModal(true);
  };

  // Handler untuk klik pesan (menampilkan detail)
  const handleMessageClick = (message) => {
    // Konversi pesan menjadi tiket untuk ditampilkan detailnya
    const messageAsTicket = {
      id: message.id,
      judul: message.message,
      dateRange: `${new Date().toLocaleDateString()} → ${new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toLocaleDateString()}`,
      pengirim: message.sender,
      kategori: "Pesan",
      status: "menunggu",
    };

    setSelectedTicket(messageAsTicket);
    setShowDetailModal(true);
  };

  // Handler untuk menutup modal detail
  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedTicket(null);
  };

  // Judul section pesan baru
  const getMessageTitle = () => {
    switch (activePage) {
      case "inbox":
        return "Pesan Baru";
      case "diproses":
        return "Request Tugas Baru";
      case "selesai":
        return "Laporan Penyelesaian";
      case "arsip":
        return "Item untuk Diarsipkan";
      default:
        return "Pesan Tugas Baru";
    }
  };

  // Komponen untuk MessageCard
  const MessageCard = ({ message, onDragStart, onClick }) => {
    return (
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData(
            "application/json",
            JSON.stringify({ id: message.id })
          );
          onDragStart && onDragStart();
        }}
        onClick={() => onClick && onClick(message)}
        className={`mt-4 p-3 rounded-lg ${
          message.isNew ? "bg-green-800" : "bg-gray-700"
        } max-w-xs cursor-grab hover:opacity-80`}
      >
        <div className="flex justify-between items-center mb-1">
          <span className="font-medium text-sm text-white">
            {message.sender}
          </span>
          <span className="text-xs text-gray-300">{message.timestamp}</span>
        </div>
        <p className="text-white">{message.message}</p>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white mb-4">
          {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
        </h1>

        {/* Kanban Board dengan 4 kolom */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Kolom 1 */}
          <TiketColumn
            id="column-1"
            title={columns["column-1"].title}
            tickets={columns["column-1"].cardIds.map(
              (cardId) => tickets[cardId]
            )}
            onAddTicket={handleAddTicket}
            onDropTicket={handleDropTicket}
            onTicketClick={handleTicketClick}
          />

          {/* Kolom 2 */}
          <TiketColumn
            id="column-2"
            title={columns["column-2"].title}
            tickets={columns["column-2"].cardIds.map(
              (cardId) => tickets[cardId]
            )}
            onAddTicket={handleAddTicket}
            onDropTicket={handleDropTicket}
            onTicketClick={handleTicketClick}
          />

          {/* Kolom 3 */}
          <TiketColumn
            id="column-3"
            title={columns["column-3"].title}
            tickets={columns["column-3"].cardIds.map(
              (cardId) => tickets[cardId]
            )}
            onAddTicket={handleAddTicket}
            onDropTicket={handleDropTicket}
            onTicketClick={handleTicketClick}
          />

          {/* Kolom 4 */}
          <TiketColumn
            id="column-4"
            title={columns["column-4"].title}
            tickets={columns["column-4"].cardIds.map(
              (cardId) => tickets[cardId]
            )}
            onAddTicket={handleAddTicket}
            onDropTicket={handleDropTicket}
            onTicketClick={handleTicketClick}
          />
        </div>
      </div>

      {/* Pesan Baru (yang bisa di-drag ke kolom) */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-white mb-4">
          {getMessageTitle()}
        </h2>
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm mb-4">
            Drag pesan berikut ke kolom di atas untuk mengubahnya menjadi tugas:
          </p>

          {messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              onDragStart={() => {}}
              onClick={() => handleMessageClick(message)}
            />
          ))}

          {/* Form untuk mengirim pesan baru */}
          <div className="mt-6">
            <div className="flex">
              <input
                type="text"
                placeholder="Tambahkan pesan tugas baru..."
                className="flex-1 bg-gray-700 text-white p-2 rounded-l-lg focus:outline-none"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button
                className="bg-green-700 text-white px-4 py-2 rounded-r-lg hover:bg-green-600"
                onClick={handleSendMessage}
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Detail Tiket */}
      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Detail Tiket
                </h2>
                <button
                  onClick={handleCloseDetail}
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
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">Judul</p>
                    <p className="text-gray-800">{selectedTicket.judul}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">
                      Kategori
                    </p>
                    <p className="text-gray-800">
                      {selectedTicket.kategori || "Tidak ada kategori"}
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">
                      Pengirim
                    </p>
                    <p className="text-gray-800">
                      {selectedTicket.pengirim || "Sistem"}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">Tanggal</p>
                    <p className="text-gray-800">{selectedTicket.dateRange}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-gray-800">
                      {selectedTicket.status || "Menunggu Tanggapan"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 mb-2">
                  Deskripsi
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800">
                    {selectedTicket.deskripsi || selectedTicket.judul}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 mt-6">
                <button
                  className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded font-medium"
                  onClick={handleCloseDetail}
                >
                  Kembali
                </button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium">
                  Balas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TiketPage;
