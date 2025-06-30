import React, { useState, useEffect } from "react";
import { sendEmailAPI, getEmailLogsAPI } from "../../services/api";

const AdminEmailManagement = () => {
  const [activeTab, setActiveTab] = useState("compose");
  const [emailLogs, setEmailLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmailDetail, setSelectedEmailDetail] = useState(null);

  // Email form state
  const [emailForm, setEmailForm] = useState({
    to_email: "",
    subject: "",
    body: "",
  });

  // Pagination state for logs
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 10,
    total_pages: 1,
  });

  // Filter state for logs
  const [logFilters, setLogFilters] = useState({
    to_email: "",
    subject: "",
  });

  // Load email logs 
  useEffect(() => {
    if (activeTab === "logs") {
      loadEmailLogs();
      
      const interval = setInterval(() => {
        loadEmailLogs();
      }, 30000);
  
      return () => clearInterval(interval);
    }
  }, [activeTab, pagination.current_page]); // Add pagination.current_page dependency

  const handleViewEmailDetail = (log) => {
    setSelectedEmailDetail(log);
    setShowDetailModal(true);
  };
  
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedEmailDetail(null);
  };

  const loadEmailLogs = async (filters = {}) => {
    try {
      setLoading(true);
      setError("");

      const apiFilters = {
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...logFilters,
        ...filters,
      };

      const response = await getEmailLogsAPI(apiFilters);
      
      // Handle different response structures
      let logsData = [];
      let totalPages = 1;
      let totalCount = 0;
      
      if (response?.data?.data) {
        logsData = response.data.data;
        totalCount = response.data.total || logsData.length;
        totalPages = Math.ceil(totalCount / pagination.per_page);
      } else if (Array.isArray(response)) {
        logsData = response;
        totalCount = logsData.length;
        totalPages = Math.ceil(totalCount / pagination.per_page);
      }

      // Transform logs data if needed
      const transformedLogs = logsData.map((log) => ({
        id: log.id,
        user_id: log.user_id,
        to_email: log.to_email,
        subject: log.subject,
        content: log.content || log.body,
        status: log.status || "sent", 
        error_message: log.error_message,
        created_at: log.created_at,
        updated_at: log.updated_at,
      }));
      
      transformedLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setEmailLogs(transformedLogs);
      
      // Update pagination
      setPagination(prev => ({
        ...prev,
        total: totalCount,
        total_pages: totalPages,
      }));

    } catch (error) {
      console.error("Error loading email logs:", error);
      setError("Gagal memuat log email: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailFormChange = (e) => {
    const { name, value } = e.target;
    setEmailForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current_page: page }));
    // loadEmailLogs will be called by useEffect when pagination.current_page changes
  };
  
  const handlePreviousPage = () => {
    if (pagination.current_page > 1) {
      handlePageChange(pagination.current_page - 1);
    }
  };
  
  const handleNextPage = () => {
    if (pagination.current_page < pagination.total_pages) {
      handlePageChange(pagination.current_page + 1);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic validation
    if (!emailForm.to_email.trim()) {
      setError("Email tujuan harus diisi");
      return;
    }

    if (!emailForm.subject.trim()) {
      setError("Subject email harus diisi");
      return;
    }

    if (!emailForm.body.trim()) {
      setError("Isi email harus diisi");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForm.to_email.trim())) {
      setError("Format email tidak valid");
      return;
    }

    if (emailForm.subject.trim().length < 3) {
      setError("Subject minimal 3 karakter");
      return;
    }
    
    if (emailForm.body.trim().length < 10) {
      setError("Isi email minimal 10 karakter");
      return;
    }
    
    if (emailForm.to_email.includes(' ')) {
      setError("Email tidak boleh mengandung spasi");
      return;
    }      

    try {
      setSending(true);
      const result = await sendEmailAPI(emailForm);
    
      if (result.success) {
        setSuccess(`Email berhasil dikirim ke ${emailForm.to_email}!`);

        setEmailForm({
          to_email: "",
          subject: "",
          body: "",
        });

        setError("");
        
        // Auto hide success message after 5 seconds
        setTimeout(() => {
          setSuccess("");
        }, 5000);
      
        if (activeTab === "logs") {
          setTimeout(() => loadEmailLogs(), 1000);
        } else {
          setTimeout(() => {
            setActiveTab("logs");
            loadEmailLogs();
          }, 2000);
        }
      } else {
        setError("Gagal mengirim email: " + result.message);
      }
    } catch (error) {
      setError("Gagal mengirim email: " + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleLogFiltersChange = (e) => {
    const { name, value } = e.target;
    setLogFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyLogFilters = () => {
    // Reset to page 1 when applying filters
    setPagination(prev => ({ ...prev, current_page: 1 }));
    loadEmailLogs();
  };

  const resetLogFilters = () => {
    setLogFilters({
      to_email: "",
      subject: "",
    });
    setPagination(prev => ({ ...prev, current_page: 1 }));
    loadEmailLogs({});
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "sent":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case "sent":
        return "Terkirim";
      case "failed":
        return "Gagal";
      case "pending":
        return "Pending";
      default:
        return status || "Unknown";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Email Management</h1>
        <p className="text-gray-600 mt-1">
          Kelola dan kirim email kepada pengguna sistem
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("compose")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "compose"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Compose Email
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "logs"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Email Logs
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Compose Email Tab */}
          {activeTab === "compose" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Kirim Email Baru
              </h2>

              {/* Alert Messages */}
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

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                  <div className="flex items-center justify-between">
                    <span>{success}</span>
                    <button
                      onClick={() => setSuccess("")}
                      className="text-green-500 hover:text-green-700"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* Email Form */}
              <form onSubmit={handleSendEmail} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Tujuan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="to_email"
                    value={emailForm.to_email}
                    onChange={handleEmailFormChange}
                    required
                    placeholder="contoh@telkomuniversity.ac.id"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={emailForm.subject}
                    onChange={handleEmailFormChange}
                    required
                    placeholder="Masukkan subject email..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Isi Email <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="body"
                    value={emailForm.body}
                    onChange={handleEmailFormChange}
                    required
                    rows={8}
                    placeholder="Tulis isi email di sini..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailForm({ to_email: "", subject: "", body: "" });
                      setError("");
                      setSuccess("");
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
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
                            strokeWidth="2"
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                        <span>Kirim Email</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Email Logs Tab */}
          {activeTab === "logs" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Riwayat Email
                </h2>
                <button
                  onClick={() => loadEmailLogs()}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <svg
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Refresh</span>
                </button>
              </div>

              {/* Filters */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Email
                    </label>
                    <input
                      type="text"
                      name="to_email"
                      value={logFilters.to_email}
                      onChange={handleLogFiltersChange}
                      placeholder="Cari berdasarkan email tujuan..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={logFilters.subject}
                      onChange={handleLogFiltersChange}
                      placeholder="Cari berdasarkan subject..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div className="flex items-end space-x-2">
                    <button
                      onClick={applyLogFilters}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Apply Filter
                    </button>
                    <button
                      onClick={resetLogFilters}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message for Logs */}
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

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-gray-600">Memuat log email...</span>
                </div>
              )}

              {/* Email Logs Table */}
              {!loading && (
                <div className="overflow-x-auto">
                  {emailLogs.length === 0 ? (
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
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414-2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <p className="text-lg font-medium">Tidak ada log email</p>
                      <p className="text-sm">
                        {logFilters.to_email || logFilters.subject
                          ? "Tidak ada email yang cocok dengan filter"
                          : "Belum ada email yang dikirim"}
                      </p>
                    </div>
                  ) : (
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email Tujuan
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subject
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tanggal Kirim
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {emailLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {log.to_email}
                              </div>
                              {log.user_id && (
                                <div className="text-sm text-gray-500">
                                  User ID: {log.user_id}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {log.subject}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                                  log.status
                                )}`}
                              >
                                {getStatusLabel(log.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(log.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleViewEmailDetail(log)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                View
                              </button>
                              {log.status === "failed" && log.error_message && (
                                <button
                                  onClick={() => {
                                    alert("Error: " + log.error_message);
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Error
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Pagination Controls */}
              {!loading && emailLogs.length > 0 && pagination.total_pages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={handlePreviousPage}
                      disabled={pagination.current_page === 1}
                      className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={pagination.current_page === pagination.total_pages}
                      className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                          {((pagination.current_page - 1) * pagination.per_page) + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                        </span>{" "}
                        of <span className="font-medium">{pagination.total}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                          onClick={handlePreviousPage}
                          disabled={pagination.current_page === 1}
                          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {/* Page Numbers - Fixed to show proper page range */}
                        {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                          let startPage = Math.max(1, pagination.current_page - 2);
                          let endPage = Math.min(pagination.total_pages, startPage + 4);
                          
                          if (endPage - startPage < 4) {
                            startPage = Math.max(1, endPage - 4);
                          }
                          
                          const page = startPage + i;
                          
                          if (page > endPage) return null;
                          
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                page === pagination.current_page
                                  ? "z-10 bg-red-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                  : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={handleNextPage}
                          disabled={pagination.current_page === pagination.total_pages}
                          className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Email</p>
              <p className="text-2xl font-semibold text-gray-900">
                {pagination.total}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
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
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Terkirim</p>
              <p className="text-2xl font-semibold text-gray-900">
                {emailLogs.filter((log) => log.status === "sent").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gagal</p>
              <p className="text-2xl font-semibold text-gray-900">
                {emailLogs.filter((log) => log.status === "failed").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
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
              Petunjuk Penggunaan
            </h3>
            <ul className="text-sm text-blue-800 mt-1 space-y-1">
              <li>• Gunakan tab "Compose Email" untuk mengirim email baru</li>
              <li>• Tab "Email Logs" menampilkan riwayat semua email yang pernah dikirim</li>
              <li>• Filter dapat digunakan untuk mencari email berdasarkan tujuan atau subject</li>
              <li>• Status email akan menunjukkan apakah email berhasil terkirim atau gagal</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Email Detail Modal */}
      {showDetailModal && selectedEmailDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Detail Email</h2>
                <button
                  onClick={handleCloseDetailModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Tujuan</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEmailDetail.to_email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEmailDetail.subject}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedEmailDetail.status)}`}>
                    {getStatusLabel(selectedEmailDetail.status)}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tanggal Kirim</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedEmailDetail.created_at)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Isi Email</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                    <pre className="whitespace-pre-wrap text-sm text-gray-900">{selectedEmailDetail.content}</pre>
                  </div>
                </div>
                
                {selectedEmailDetail.error_message && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Error Message</label>
                    <p className="mt-1 text-sm text-red-600">{selectedEmailDetail.error_message}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCloseDetailModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmailManagement;