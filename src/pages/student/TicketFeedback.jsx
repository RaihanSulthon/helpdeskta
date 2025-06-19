// pages/TicketFeedback.jsx - Halaman feedback tiket
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const TicketFeedback = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const [newFeedback, setNewFeedback] = useState("");

  // Mock data - ganti dengan API call
  const ticketData = {
    id: "SP17FR296",
    title: "TAK Belum Kunjung Lorem Ipsum TAK Belum Kunjung Lorem Ipsum",
    feedbackCount: 0,
  };

  const feedbacks = [
    {
      id: 1,
      author: "LAAK FIF",
      role: "Admin",
      date: "7 Mei 2025, 12:30 (Kemarin)",
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
      isAdmin: true,
    },
    {
      id: 2,
      author: "Muhammad Burhan",
      role: "Student",
      date: "7 Mei 2025, 12:45 (Kemarin)",
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore m",
      isAdmin: false,
    },
    {
      id: 3,
      author: "LAAK FIF",
      role: "Admin",
      date: "7 Mei 2025, 16:15 (Kemarin)",
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
      isAdmin: true,
    },
    {
      id: 4,
      author: "Muhammad Burhan",
      role: "Student",
      date: "7 Mei 2025, 17:45 (Kemarin)",
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore m",
      isAdmin: false,
    },
    {
      id: 5,
      author: "LAAK FIF",
      role: "Admin",
      date: "7 Mei 2025, 16:15 (Kemarin)",
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
      isAdmin: true,
    },
  ];

  const handleBack = () => {
    // Kembali ke dashboard student atau admin tergantung role
    const userRole = localStorage.getItem("userRole") || "student";
    if (userRole === "admin") {
      navigate("/admin/tickets");
    } else {
      navigate("/student/tickets");
    }
  };

  const handleTicketDetail = () => {
    navigate(`/ticket/${ticketId}`);
  };

  const handleSendFeedback = () => {
    if (newFeedback.trim()) {
      // Add new feedback logic here
      console.log("Sending feedback:", newFeedback);
      setNewFeedback("");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-12 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Fixed Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleTicketDetail}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm font-medium">Ticket Detail</span>
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="text-sm font-medium">Feedback</span>
                <span className="bg-red-800 text-white text-xs px-2 py-0.5 rounded-full">
                  {ticketData.feedbackCount}
                </span>
              </button>
            </div>
          </div>

          {/* Menu Button */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-12 py-6">
        {/* Orange left border */}
        <div className="border-l-4 border-orange-400 pl-6">
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-8 leading-tight">
            {ticketData.title}
          </h1>

          {/* Feedback Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Feedback
            </h2>

            {/* Feedback List */}
            <div className="space-y-4 mb-8">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className={`flex items-start space-x-4 p-4 rounded-lg ${
                    feedback.isAdmin
                      ? "bg-blue-50 border border-blue-100"
                      : "bg-red-50 border border-red-100"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                      feedback.isAdmin ? "bg-blue-600" : "bg-red-600"
                    }`}
                  >
                    {feedback.author.charAt(0)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">
                          {feedback.author}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            feedback.isAdmin
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {feedback.role}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {feedback.date}
                      </span>
                    </div>
                    <p className="text-gray-800 leading-relaxed">
                      {feedback.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start space-x-4">
                {/* User Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-semibold">
                  U
                </div>

                {/* Input Area */}
                <div className="flex-1">
                  <textarea
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    placeholder="Tulis feedback Anda..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-4">
                      <button className="text-gray-500 hover:text-gray-700">
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
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                          />
                        </svg>
                      </button>
                      <button className="text-gray-500 hover:text-gray-700">
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
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={handleSendFeedback}
                      disabled={!newFeedback.trim()}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Kirim
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketFeedback;
