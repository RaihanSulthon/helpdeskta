// components/Molekul/Contant.jsx
import React, { useState, useEffect } from "react";

// Komponen Card untuk setiap tugas
const TaskCard = ({ id, title, dateRange, onDragStart }) => {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/json", JSON.stringify({ id }));
        onDragStart && onDragStart();
      }}
      className="bg-green-800 text-white p-4 rounded-lg mb-3 shadow-md hover:bg-green-700 transition duration-200 cursor-grab"
    >
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-green-200">{dateRange}</p>
    </div>
  );
};

// Komponen untuk Card "New page"
const NewPageCard = ({ onClick }) => {
  return (
    <div
      className="border border-gray-300 border-dashed rounded-lg p-3 text-gray-500 hover:bg-gray-100 transition duration-200 flex items-center cursor-pointer"
      onClick={onClick}
    >
      <span className="text-xl mr-2">+</span>
      <span>New page</span>
    </div>
  );
};

// Komponen Column untuk setiap kolom tugas
const Column = ({
  id,
  title,
  cards,
  date,
  onAddCard,
  onDropCard,
  activePage,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  // Tentukan warna berdasarkan halaman aktif
  const getBgColor = () => {
    switch (activePage) {
      case "inbox":
        return "bg-blue-800";
      case "diproses":
        return "bg-yellow-800";
      case "selesai":
        return "bg-green-800";
      case "arsip":
        return "bg-purple-800";
      case "sampah":
        return "bg-red-800";
      case "starred":
        return "bg-amber-800";
      case "kanban":
      default:
        return "bg-gray-800";
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      onDropCard && onDropCard(data.id, id);
    } catch (err) {
      console.error("Error parsing drag data:", err);
    }
  };

  return (
    <div className={`w-full ${getBgColor()} p-4 rounded-lg`}>
      {title && (
        <div className="mb-4 pb-2 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {date && <p className="text-sm text-gray-400">{date}</p>}
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`min-h-[50px] rounded-lg transition-colors ${
          isDragOver ? "bg-gray-700 bg-opacity-50" : ""
        }`}
      >
        {cards.map((card) => (
          <TaskCard
            key={card.id}
            id={card.id}
            title={card.title}
            dateRange={card.dateRange}
            onDragStart={() => {}}
          />
        ))}

        {/* Tombol New Page selalu ditampilkan di akhir kolom */}
        <NewPageCard onClick={() => onAddCard && onAddCard(id)} />
      </div>
    </div>
  );
};

// Komponen Message Card yang bisa di-drag
const MessageCard = ({
  id,
  message,
  sender,
  timestamp,
  isNew,
  onDragStart,
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/json", JSON.stringify({ id }));
        onDragStart && onDragStart();
      }}
      className={`mt-4 p-3 rounded-lg ${
        isNew ? "bg-green-800" : "bg-gray-700"
      } max-w-xs cursor-grab hover:opacity-80`}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium text-sm text-white">{sender}</span>
        <span className="text-xs text-gray-300">{timestamp}</span>
      </div>
      <p className="text-white">{message}</p>
    </div>
  );
};

// Komponen utama Contant (KanbanBoard)
const Contant = ({ activePage = "inbox" }) => {
  // Data awal untuk kolom-kolom (sekarang 4 kolom)
  const [columns, setColumns] = useState({
    "column-1": {
      id: "column-1",
      title: "Belum Dikerjakan",
      date: "",
      cardIds: [],
    },
    "column-2": {
      id: "column-2",
      title: "Dalam Proses",
      date: "",
      cardIds: [],
    },
    "column-3": {
      id: "column-3",
      title: "Sedang Direview",
      date: "",
      cardIds: [],
    },
    "column-4": {
      id: "column-4",
      title: "Selesai",
      date: "",
      cardIds: ["task-1", "task-2", "task-3", "task-4"],
    },
  });

  // Data awal untuk semua kartu
  const [cards, setCards] = useState({
    "task-1": {
      id: "task-1",
      title: "Tugas Individu ACDR Week 7",
      dateRange: "April 17, 2025 → April 27, 2025",
    },
    "task-2": {
      id: "task-2",
      title: "Tugas Kelompok ACDR",
      dateRange: "April 17, 2025 → April 29, 2025",
    },
    "task-3": {
      id: "task-3",
      title: "Dicoding Course",
      dateRange: "April 22, 2025 → April 29, 2025",
    },
    "task-4": {
      id: "task-4",
      title: "Tugas Quiz 2 ACDR",
      dateRange: "April 23, 2025 → April 29, 2025",
    },
  });

  // Pesan-pesan yang bisa diubah menjadi task
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

  // Ubah judul kolom berdasarkan activePage
  useEffect(() => {
    const updateColumnTitles = () => {
      const newColumns = { ...columns };

      if (activePage === "inbox") {
        newColumns["column-1"].title = "Pesan Masuk";
        newColumns["column-2"].title = "Dibaca";
        newColumns["column-3"].title = "Penting";
        newColumns["column-4"].title = "Diarsipkan";
      } else if (activePage === "diproses") {
        newColumns["column-1"].title = "Antrian";
        newColumns["column-2"].title = "Sedang Dikerjakan";
        newColumns["column-3"].title = "Menunggu Approval";
        newColumns["column-4"].title = "Selesai Diproses";
      } else if (activePage === "selesai") {
        newColumns["column-1"].title = "Selesai Hari Ini";
        newColumns["column-2"].title = "Selesai Minggu Ini";
        newColumns["column-3"].title = "Selesai Bulan Ini";
        newColumns["column-4"].title = "Selesai Tahun Ini";
      } else if (activePage === "arsip") {
        newColumns["column-1"].title = "Arsip 2025";
        newColumns["column-2"].title = "Arsip 2024";
        newColumns["column-3"].title = "Arsip 2023";
        newColumns["column-4"].title = "Arsip Lama";
      } else if (activePage === "sampah") {
        newColumns["column-1"].title = "Dihapus <7 hari";
        newColumns["column-2"].title = "Dihapus <30 hari";
        newColumns["column-3"].title = "Dapat Dipulihkan";
        newColumns["column-4"].title = "Hilang Permanen";
      } else if (activePage === "starred") {
        newColumns["column-1"].title = "Prioritas Tinggi";
        newColumns["column-2"].title = "Prioritas Sedang";
        newColumns["column-3"].title = "Prioritas Rendah";
        newColumns["column-4"].title = "Tidak Prioritas";
      } else {
        newColumns["column-1"].title = "Belum Dikerjakan";
        newColumns["column-2"].title = "Dalam Proses";
        newColumns["column-3"].title = "Sedang Direview";
        newColumns["column-4"].title = "Selesai";
      }

      setColumns(newColumns);
    };

    updateColumnTitles();
  }, [activePage]);

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

  // Handler untuk mendrop kartu ke kolom
  const handleDropCard = (cardId, columnId) => {
    // Cek apakah ini adalah kartu pesan
    if (cardId.startsWith("msg-")) {
      // Konversi pesan menjadi task
      const messageIndex = messages.findIndex((msg) => msg.id === cardId);

      if (messageIndex !== -1) {
        const message = messages[messageIndex];

        // Buat task baru dari pesan
        const newTaskId = `task-${Object.keys(cards).length + 1}-${Date.now()}`;
        const newTask = {
          id: newTaskId,
          title: message.message,
          dateRange: `${new Date().toLocaleDateString()} → ${new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toLocaleDateString()}`,
        };

        // Tambahkan task baru ke cards
        setCards({
          ...cards,
          [newTaskId]: newTask,
        });

        // Tambahkan taskId ke kolom tujuan
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

    // Proses normal untuk task yang sudah ada
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

    // Hapus kartu dari kolom sumber
    const sourceColumn = { ...columns[sourceColumnId] };
    const sourceCardIds = [...sourceColumn.cardIds];
    sourceCardIds.splice(sourceCardIds.indexOf(cardId), 1);
    sourceColumn.cardIds = sourceCardIds;

    // Tambahkan kartu ke kolom tujuan
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

  // Handler untuk menambahkan kartu baru
  const handleAddCard = (columnId) => {
    const newCardId = `task-${Object.keys(cards).length + 1}-${Date.now()}`;
    const newCard = {
      id: newCardId,
      title: "Tugas Baru",
      dateRange: "Mei 1, 2025 → Mei 15, 2025",
    };

    // Tambahkan kartu baru ke state
    setCards({
      ...cards,
      [newCardId]: newCard,
    });

    // Tambahkan referensi kartu ke kolom
    const column = { ...columns[columnId] };
    column.cardIds = [...column.cardIds, newCardId];

    setColumns({
      ...columns,
      [columnId]: column,
    });
  };

  // Judul bawah berdasarkan halaman aktif
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
      case "sampah":
        return "Item untuk Dihapus";
      case "starred":
        return "Item untuk Diberi Prioritas";
      default:
        return "Pesan Tugas Baru";
    }
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
          <Column
            id="column-1"
            title={columns["column-1"].title}
            date={columns["column-1"].date}
            cards={columns["column-1"].cardIds.map((cardId) => cards[cardId])}
            onAddCard={handleAddCard}
            onDropCard={handleDropCard}
            activePage={activePage}
          />

          {/* Kolom 2 */}
          <Column
            id="column-2"
            title={columns["column-2"].title}
            date={columns["column-2"].date}
            cards={columns["column-2"].cardIds.map((cardId) => cards[cardId])}
            onAddCard={handleAddCard}
            onDropCard={handleDropCard}
            activePage={activePage}
          />

          {/* Kolom 3 */}
          <Column
            id="column-3"
            title={columns["column-3"].title}
            date={columns["column-3"].date}
            cards={columns["column-3"].cardIds.map((cardId) => cards[cardId])}
            onAddCard={handleAddCard}
            onDropCard={handleDropCard}
            activePage={activePage}
          />

          {/* Kolom 4 */}
          <Column
            id="column-4"
            title={columns["column-4"].title}
            date={columns["column-4"].date}
            cards={columns["column-4"].cardIds.map((cardId) => cards[cardId])}
            onAddCard={handleAddCard}
            onDropCard={handleDropCard}
            activePage={activePage}
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
              id={message.id}
              message={message.message}
              sender={message.sender}
              timestamp={message.timestamp}
              isNew={message.isNew}
              onDragStart={() => {}}
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
    </div>
  );
};

export default Contant;
