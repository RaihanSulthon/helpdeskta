// pages/student/TicketFeedback.jsx - Updated with real API integration
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getChatMessagesAPI, sendChatMessageAPI, getTicketDetailAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const TicketFeedback = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const { user } = useAuth();
  const [newFeedback, setNewFeedback] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Load ticket data and chat messages on mount
  useEffect(() => {
    if (ticketId) {
      loadTicketData();
      loadChatMessages();
    }
  }, [ticketId]);

  const loadTicketData = async () => {
    try {
      console.log("Loading ticket data for feedback page...");
      const data = await getTicketDetailAPI(ticketId);
      setTicketData({
        id: data.id,
        title: data.judul || data.title || "Judul tidak tersedia",
      });
    } catch (error) {
      console.error("Error loading ticket data:", error);
      setError("Gagal memuat data tiket");
    }
  };

  const loadChatMessages = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("Loading chat messages for ticket:", ticketId);
      const messages = await getChatMessagesAPI(ticketId);
      console.log("Received messages:", messages);

      // Transform API messages to component format
      const transformedMessages = messages.map((msg) => ({
        id: msg.id,
        author: msg.user?.name || msg.user?.email || "Unknown User",
        role: msg.user?.role === "admin" ? "Admin" : "Student",
        date: formatDate(msg.created_at),
        message: msg.message,
        isAdmin: msg.user?.role === "admin",
        userId: msg.user_id,
        isSystemMessage: msg.is_system_message || false,
      }));

      setFeedbacks(transformedMessages);
    } catch (error) {
      console.error("Error loading chat messages:", error);
      setError("Gagal memuat pesan feedback: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        return `Kemarin, ${date.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      }
      if (diffDays === 0) {
        return `Hari ini, ${date.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      }
      return `${date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}, ${date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } catch (error) {
      return "Tanggal tidak valid";
    }
  };

  const handleSendFeedback = async () => {
    if (!newFeedback.trim()) {
      setError("Pesan tidak boleh kosong");
      return;
    }

    try {
      setSending(true);
      setError("");

      console.log("Sending feedback message:", newFeedback);
      await sendChatMessageAPI(ticketId, newFeedback);

      // Clear input and reload messages
      setNewFeedback("");
      await loadChatMessages();

      console.log("Feedback sent successfully!");
    } catch (error) {
      console.error("Error sending feedback:", error);
      setError("Gagal mengirim feedback: " + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleBack = () => {
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendFeedback();
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-12 py-4">
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
                  {feedbacks.length}
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
      <div className="flex-1 overflow-y-auto px-12 py-6">
        {/* Orange left border */}
        <div className="border-l-4 border-orange-400 pl-6">
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-8 leading-tight">
            {ticketData?.title || "Loading..."}
          </h1>

          {/* Feedback Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Feedback
            </h2>

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

            {/* Feedback List */}
            <div className="space-y-4 mb-8">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-gray-600">Memuat feedback...</span>
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-lg font-medium mb-2">Belum ada feedback</p>
                  <p className="text-sm">Jadilah yang pertama memberikan feedback untuk tiket ini!</p>
                </div>
              ) : (
                feedbacks.map((feedback) => (
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
                      {feedback.author.charAt(0).toUpperCase()}
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
                          {feedback.isSystemMessage && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                              System
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {feedback.date}
                        </span>
                      </div>
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {feedback.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reply Input */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start space-x-4">
                {/* User Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                </div>

                {/* Input Area */}
                <div className="flex-1">
                  <textarea
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tulis feedback Anda... (Tekan Enter untuk kirim, Shift+Enter untuk baris baru)"
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows={3}
                    disabled={sending}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-4">
                      <button className="text-gray-500 hover:text-gray-700 transition-colors">
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
                      <button className="text-gray-500 hover:text-gray-700 transition-colors">
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
                      <span className="text-xs text-gray-500">
                        {newFeedback.length}/500 karakter
                      </span>
                    </div>
                    <button
                      onClick={handleSendFeedback}
                      disabled={!newFeedback.trim() || sending}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      {sending ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Mengirim...</span>
                        </>
                      ) : (
                        <>
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
                              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                          </svg>
                          <span>Kirim</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                  Tips Feedback
                </h3>
                <ul className="text-sm text-blue-800 mt-1 space-y-1">
                  <li>• Berikan feedback yang konstruktif dan spesifik</li>
                  <li>• Gunakan Enter untuk mengirim, Shift+Enter untuk baris baru</li>
                  <li>• Maksimal 500 karakter per pesan</li>
                  <li>• Tim kami akan merespons dalam 1x24 jam</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketFeedback;