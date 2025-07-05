// pages/student/TicketDetail.jsx - Updated version matching API response structure
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTicketDetailAPI } from "../services/api";

const DetailTicket = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ticketId) {
      loadTicketDetail();
    } else {
      setError("ID tiket tidak valid");
      setLoading(false);
    }
  }, [ticketId]);

  const loadTicketDetail = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Loading ticket detail for ID:", ticketId);
      const data = await getTicketDetailAPI(ticketId);
      console.log("Received ticket data:", data);

      // Transform API data to match component expectations
      // Handle the response structure properly
      console.log("Raw API data structure:", JSON.stringify(data, null, 2));

      const transformedData = {
        id: data.id || "Tidak tersedia",
        title: data.judul || data.title || "Judul tidak tersedia",
        submitter:
          data.anonymous === true
            ? "Anonim"
            : data.nama || data.name || "Tidak diketahui",
        email:
          data.anonymous === true
            ? "anonim@email.com"
            : data.email || "tidak diketahui",
        date: formatDate(data.created_at),
        status: mapStatus(data.status),
        lastUpdate: formatDate(data.updated_at || data.created_at),
        description:
          data.deskripsi || data.description || "Deskripsi tidak tersedia",
        attachment:
          data.attachments &&
          Array.isArray(data.attachments) &&
          data.attachments.length > 0,
        attachmentUrl:
          data.attachments &&
          Array.isArray(data.attachments) &&
          data.attachments.length > 0
            ? data.attachments[0]
            : data.attachment_url || null,
        category: data.category?.name || "Umum",
        subCategory: data.sub_category?.name || "Umum",
        rawStatus: data.status,
        priority: data.priority || "medium",
        assignedTo: data.assigned_to || null,
        readByAdmin: data.read_by_admin === true || data.read_by_admin === 1,
        readByDisposisi:
          data.read_by_disposisi === true || data.read_by_disposisi === 1,
        readByStudent:
          data.read_by_student === true || data.read_by_student === 1,
        // User data fields from API response
        nim: data.nim || "",
        prodi: data.prodi || "",
        semester: data.semester ? data.semester.toString() : "",
        noHp: data.no_hp || "",
        anonymous: data.anonymous === true || data.anonymous === 1,
        userId: data.user_id,
      };

      console.log("Transformed data:", transformedData);

      setTicketData(transformedData);
    } catch (error) {
      console.error("Error loading ticket detail:", error);
      setError(error.message || "Gagal memuat detail tiket");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1)
        return `Kemarin, ${date.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      if (diffDays === 0)
        return `Hari ini, ${date.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      return (
        date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }) +
        `, ${date.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      );
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Tanggal tidak valid";
    }
  };

  // Helper function to map API status
  const mapStatus = (status) => {
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

  const handleBack = () => {
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

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  const handleDownloadAttachment = () => {
    if (ticketData.attachmentUrl) {
      window.open(ticketData.attachmentUrl, "_blank");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail tiket...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="flex items-center justify-between">
            <div>
              <strong className="font-bold">Error!</strong>
              <span className="block">{error}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={loadTicketDetail}
                className="text-red-600 hover:text-red-800 font-medium underline"
              >
                Coba Lagi
              </button>
              <button
                onClick={handleBack}
                className="text-red-600 hover:text-red-800 font-medium underline"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!ticketData) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tiket tidak ditemukan
          </h3>
          <p className="text-gray-600 mb-4">
            Tiket dengan ID #{ticketId} tidak dapat ditemukan.
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Kembali"
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

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg">
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
              </div>

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
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Ticket Header */}
          <div className="border-l-4 border-orange-400 px-8 py-6">
            {/* Ticket ID, Status, and Priority */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  #{ticketData.id}
                </span>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    ticketData.status
                  )}`}
                >
                  {ticketData.status}
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                    ticketData.priority
                  )}`}
                >
                  {getPriorityLabel(ticketData.priority)}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Dibuat: {ticketData.date}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">
              {ticketData.title}
            </h1>

            {/* Submitter Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Informasi Pelapor
                </h3>
                {ticketData.anonymous ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <span className="font-medium text-yellow-800">
                        Laporan Anonim
                      </span>
                    </div>
                    <p className="text-yellow-700 text-sm mt-2">
                      Identitas pelapor dirahasiakan untuk privasi
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nama:</span>
                      <span className="font-medium">
                        {ticketData.submitter}
                      </span>
                    </div>
                    {ticketData.nim && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">NIM:</span>
                        <span className="font-medium">{ticketData.nim}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium">{ticketData.email}</span>
                    </div>
                    {ticketData.prodi && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Program Studi:</span>
                        <span className="font-medium">{ticketData.prodi}</span>
                      </div>
                    )}
                    {ticketData.semester && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Semester:</span>
                        <span className="font-medium">
                          {ticketData.semester}
                        </span>
                      </div>
                    )}
                    {ticketData.noHp && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">No. HP:</span>
                        <span className="font-medium">{ticketData.noHp}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Informasi Tiket
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kategori:</span>
                    <span className="font-medium">{ticketData.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sub Kategori:</span>
                    <span className="font-medium">
                      {ticketData.subCategory}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Prioritas:</span>
                    <span className="font-medium">
                      {getPriorityLabel(ticketData.priority)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className="font-medium">{ticketData.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Terakhir Update:</span>
                    <span className="font-medium">{ticketData.lastUpdate}</span>
                  </div>
                  {ticketData.assignedTo && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ditugaskan ke:</span>
                      <span className="font-medium">
                        {ticketData.assignedTo}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Read Status Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div
                className={`p-3 rounded-lg border ${
                  ticketData.readByAdmin
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg
                    className={`w-4 h-4 ${
                      ticketData.readByAdmin
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span
                    className={`text-sm font-medium ${
                      ticketData.readByAdmin
                        ? "text-green-800"
                        : "text-gray-600"
                    }`}
                  >
                    Dibaca Admin
                  </span>
                </div>
              </div>

              <div
                className={`p-3 rounded-lg border ${
                  ticketData.readByDisposisi
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg
                    className={`w-4 h-4 ${
                      ticketData.readByDisposisi
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span
                    className={`text-sm font-medium ${
                      ticketData.readByDisposisi
                        ? "text-green-800"
                        : "text-gray-600"
                    }`}
                  >
                    Dibaca Disposisi
                  </span>
                </div>
              </div>

              <div
                className={`p-3 rounded-lg border ${
                  ticketData.readByStudent
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg
                    className={`w-4 h-4 ${
                      ticketData.readByStudent
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span
                    className={`text-sm font-medium ${
                      ticketData.readByStudent
                        ? "text-green-800"
                        : "text-gray-600"
                    }`}
                  >
                    Dibaca Mahasiswa
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-6 border-t border-gray-200">
            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Deskripsi Laporan
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-justify">
                  {ticketData.description}
                </p>
              </div>
            </div>

            {/* Attachment */}
            {ticketData.attachment && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Lampiran
                </h3>
                <button
                  onClick={handleDownloadAttachment}
                  className="flex items-center space-x-3 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300"
                >
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
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-700">
                      Download Lampiran
                    </div>
                    <div className="text-xs text-gray-500">
                      Klik untuk mengunduh file lampiran
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Status Information */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center space-x-2">
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Informasi Status</span>
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>
                  <span className="font-medium">Status saat ini:</span>{" "}
                  <span className="font-semibold">{ticketData.status}</span>
                </p>
                <p>
                  <span className="font-medium">Prioritas:</span>{" "}
                  <span className="font-semibold">
                    {getPriorityLabel(ticketData.priority)}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Terakhir diperbarui:</span>{" "}
                  {ticketData.lastUpdate}
                </p>

                {ticketData.status === "TAK" && (
                  <div className="mt-3 p-3 bg-orange-50 rounded border border-orange-200">
                    <p className="text-orange-800 font-medium">
                      🕐 Tiket Menunggu Tinjauan
                    </p>
                    <p className="text-orange-700 text-xs mt-1">
                      Laporan Anda sedang menunggu untuk ditinjau oleh tim kami.
                      Estimasi waktu proses adalah 3x24 jam kerja.
                    </p>
                  </div>
                )}

                {ticketData.status === "PROSES" && (
                  <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-blue-800 font-medium">
                      ⚙️ Tiket Sedang Diproses
                    </p>
                    <p className="text-blue-700 text-xs mt-1">
                      Tim kami sedang menangani laporan Anda. Kami akan
                      memberikan update secara berkala melalui email.
                    </p>
                  </div>
                )}

                {ticketData.status === "SELESAI" && (
                  <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                    <p className="text-green-800 font-medium">
                      ✅ Tiket Telah Diselesaikan
                    </p>
                    <p className="text-green-700 text-xs mt-1">
                      Laporan Anda telah diselesaikan. Jika masih ada pertanyaan
                      atau masalah berlanjut, silakan berikan feedback.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <p>Butuh bantuan? Hubungi tim support kami.</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Kembali ke Dashboard
                </button>
                <button
                  onClick={handleFeedback}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Berikan Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailTicket;