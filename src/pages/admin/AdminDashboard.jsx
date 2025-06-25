// src/pages/admin/AdminDashboard.jsx - Kanban Board for Ticket Management
import React, { useState } from "react";

const AdminDashboard = () => {
  const [tickets, setTickets] = useState({
    "tiket-baru": [
      {
        id: "BP1FRZ9k",
        sender: "Muhammad Burhan",
        email: "muhammadburhan@student.telkomuniversity.ac.id",
        date: "Kemarin, 05:43",
        subject:
          "TAK Belum Kunjung Lorem Ipsum TAK Belum Kunjung Lorem Ipsum ...",
        category: "TAK",
        feedback: 2,
        feedbackType: "warning",
      },
      {
        id: "BP2XYZ12",
        sender: "Ahmad Rizki",
        email: "ahmad.rizki@student.telkomuniversity.ac.id",
        date: "Kemarin, 08:15",
        subject:
          "TAK Belum Kunjung Lorem Ipsum TAK Belum Kunjung Lorem Ipsum ...",
        category: "TAK",
        feedback: 1,
        feedbackType: "warning",
      },
      {
        id: "BP3ABC34",
        sender: "Sari Dewi",
        email: "sari.dewi@student.telkomuniversity.ac.id",
        date: "Kemarin, 10:30",
        subject:
          "TAK Belum Kunjung Lorem Ipsum TAK Belum Kunjung Lorem Ipsum ...",
        category: "TAK",
        feedback: 3,
        feedbackType: "warning",
      },
    ],
    diproses: [
      {
        id: "BP4DEF56",
        sender: "Budi Santoso",
        email: "budi.santoso@student.telkomuniversity.ac.id",
        date: "Kemarin, 11:20",
        subject:
          "TAK Belum Kunjung Lorem Ipsum TAK Belum Kunjung Lorem Ipsum ...",
        category: "TAK",
        feedback: 2,
        feedbackType: "warning",
      },
      {
        id: "BP5GHI78",
        sender: "Lisa Permata",
        email: "lisa.permata@student.telkomuniversity.ac.id",
        date: "Kemarin, 14:45",
        subject:
          "TAK Belum Kunjung Lorem Ipsum TAK Belum Kunjung Lorem Ipsum ...",
        category: "TAK",
        feedback: 1,
        feedbackType: "warning",
      },
    ],
    selesai: [
      {
        id: "BP6JKL90",
        sender: "Andi Wijaya",
        email: "andi.wijaya@student.telkomuniversity.ac.id",
        date: "Kemarin, 16:00",
        subject:
          "TAK Belum Kunjung Lorem Ipsum TAK Belum Kunjung Lorem Ipsum ...",
        category: "TAK",
        feedback: 5,
        feedbackType: "success",
      },
      {
        id: "BP7MNO12",
        sender: "Maya Sari",
        email: "maya.sari@student.telkomuniversity.ac.id",
        date: "Kemarin, 17:30",
        subject:
          "TAK Belum Kunjung Lorem Ipsum TAK Belum Kunjung Lorem Ipsum ...",
        category: "TAK",
        feedback: 4,
        feedbackType: "success",
      },
      {
        id: "BP8PQR34",
        sender: "Roni Pratama",
        email: "roni.pratama@student.telkomuniversity.ac.id",
        date: "Kemarin, 19:15",
        subject:
          "TAK Belum Kunjung Lorem Ipsum TAK Belum Kunjung Lorem Ipsum ...",
        category: "TAK",
        feedback: 5,
        feedbackType: "success",
      },
    ],
  });

  const [draggedTicket, setDraggedTicket] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);

  const columnConfig = {
    "tiket-baru": {
      title: "TIKET BARU",
      count: tickets["tiket-baru"].length,
      bgColor: "bg-red-600",
      textColor: "text-white",
    },
    diproses: {
      title: "DIPROSES",
      count: tickets["diproses"].length,
      bgColor: "bg-red-600",
      textColor: "text-white",
    },
    selesai: {
      title: "SELESAI",
      count: tickets["selesai"].length,
      bgColor: "bg-red-600",
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

  const handleDrop = (e, toColumn) => {
    e.preventDefault();

    if (!draggedTicket || !draggedFrom || draggedFrom === toColumn) {
      return;
    }

    setTickets((prev) => {
      const newTickets = { ...prev };

      // Remove from source column
      newTickets[draggedFrom] = newTickets[draggedFrom].filter(
        (ticket) => ticket.id !== draggedTicket.id
      );

      // Add to target column
      newTickets[toColumn] = [...newTickets[toColumn], draggedTicket];

      return newTickets;
    });

    setDraggedTicket(null);
    setDraggedFrom(null);
  };

  const TicketCard = ({ ticket, columnKey }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, ticket, columnKey)}
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow"
    >
      {/* Checkbox and ID */}
      <div className="flex items-center mb-2">
        <input type="checkbox" className="w-4 h-4 mr-2 rounded" />
        <span className="text-sm font-medium text-gray-600">#{ticket.id}</span>
        <span className="ml-auto text-xs text-gray-500">{ticket.date}</span>
      </div>

      {/* Sender Info */}
      <div className="mb-2">
        <div className="text-sm font-medium text-gray-800">{ticket.sender}</div>
        <div className="text-xs text-gray-500 truncate">{ticket.email}</div>
      </div>

      {/* Subject */}
      <div className="mb-3">
        <h4 className="text-sm font-medium text-blue-700 leading-snug">
          {ticket.subject}
        </h4>
      </div>

      {/* Footer with category and feedback */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">📁 {ticket.category}</span>
        </div>

        <div className="flex items-center space-x-1">
          <span className="text-xs">💬</span>
          <span className="text-xs text-gray-600">Feedback</span>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              ticket.feedbackType === "success"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {ticket.feedback}
          </span>
        </div>
      </div>
    </div>
  );

  const Column = ({ columnKey, config }) => (
    <div
      className="flex-1 bg-gray-50 rounded-lg p-4"
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
          <span className="font-bold text-sm">{config.count}</span>
        </div>
        <button className="text-white hover:bg-red-700 p-1 rounded">
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
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      {/* Tickets */}
      <div className="space-y-2 min-h-96">
        {tickets[columnKey].map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} columnKey={columnKey} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Management Ticket</h1>
      </div>

      {/* Kanban Board */}
      <div className="flex space-x-6 overflow-x-auto">
        {Object.entries(columnConfig).map(([key, config]) => (
          <Column key={key} columnKey={key} config={config} />
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
