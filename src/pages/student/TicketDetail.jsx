// pages/DetailTicket.jsx - Halaman detail tiket
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const DetailTicket = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams();

  // Mock data - ganti dengan API call
  const ticketData = {
    id: "SP17FR296",
    title: "TAK Belum Kunjung Lorem Ipsum TAK Belum Kunjung Lorem Ipsum",
    submitter: "Muhammad Burhan",
    email: "muhammadburhan@student...",
    date: "Kemarin, 05:43",
    status: "TAK",
    lastUpdate: "7 Mei 2025, 12:30 (Kemarin)",
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint.`,
    attachment: true,
  };

  const handleBack = () => {
    // Kembali ke dashboard student atau admin tergantung role
    const userRole = localStorage.getItem("userRole") || "student";
    if (userRole === "admin") {
      navigate("/admin/tickets");
    } else {
      navigate("/student/tickets");
    }
  };

  const handleFeedback = () => {
    navigate(`/ticket/${ticketId}/feedback`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "TAK":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "SELESAI":
        return "bg-green-100 text-green-800 border-green-200";
      case "PROSES":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div>
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm font-medium">Ticket Detail</span>
              </button>

              <button
                onClick={handleFeedback}
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="text-sm font-medium">Feedback</span>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
            {ticketData.title}
          </h1>

          {/* Ticket Info */}
          <div className="flex items-center space-x-6 mb-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{ticketData.submitter}</span>
              <span>{ticketData.email}</span>
            </div>
            <div className="flex items-center space-x-1">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{ticketData.date}</span>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                ticketData.status
              )}`}
            >
              {ticketData.status}
            </div>
          </div>

          {/* Ticket ID */}
          <div className="mb-6">
            <span className="text-sm font-medium text-gray-500">
              #{ticketData.id}
            </span>
            <span className="text-sm text-gray-500 ml-8">
              Last Update: {ticketData.lastUpdate}
            </span>
          </div>

          {/* Description */}
          <div className="mb-8">
            <p className="text-gray-800 leading-relaxed text-justify">
              {ticketData.description}
            </p>
          </div>

          {/* Attachment */}
          {ticketData.attachment && (
            <div className="mb-6">
              <button className="flex items-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  Download Lampiran
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailTicket;
