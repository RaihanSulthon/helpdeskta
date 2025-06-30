import React, { useState, useEffect, useCallback } from "react";
import {
  getFAQsAPI,
  createFAQAPI,
  updateFAQAPI,
  deleteFAQAPI,
  getFAQCategoriesAPI,
} from "../../services/api";

const AdminAskedUs = () => {
  const [faqData, setFaqData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 100,
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data - FIXED dengan useState terpisah
  const [questionInput, setQuestionInput] = useState("");
  const [answerInput, setAnswerInput] = useState("");
  const [categoryInput, setCategoryInput] = useState(1);
  const [isPublicInput, setIsPublicInput] = useState(true);

  // Load categories menggunakan useCallback untuk mencegah re-render
  const loadCategories = useCallback(async () => {
    try {
      console.log("Loading categories...");
      const categoriesData = await getFAQCategoriesAPI();
      setCategories(categoriesData);
      console.log("Categories loaded:", categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
      // Fallback categories
      setCategories([
        { id: 1, name: "Facilities" },
        { id: 2, name: "Academic" },
        { id: 3, name: "General" },
      ]);
    }
  }, []);

  // Load FAQs dengan useCallback
  const loadFAQs = useCallback(
    async (filters = {}) => {
      try {
        setLoading(true);
        setError("");

        console.log("=== LOADING FAQs ===");

        // Prepare filters
        const apiFilters = {
          per_page: 100,
          page: 1,
          ...filters,
        };

        // Add category filter if selected
        if (categoryFilter && categoryFilter !== "") {
          apiFilters.category_id = categoryFilter;
        }

        // Add search query if exists
        if (searchQuery && searchQuery.trim()) {
          apiFilters.search = searchQuery.trim();
        }

        console.log("API Filters:", apiFilters);

        const result = await getFAQsAPI(apiFilters);
        console.log("=== FULL API RESPONSE ===", result);

        // Handle different response structures
        let faqsArray = [];
        let paginationData = {
          current_page: 1,
          total: 0,
          per_page: 100,
        };

        // Try multiple response structures
        if (result?.faqs && Array.isArray(result.faqs)) {
          faqsArray = result.faqs;
          paginationData = result.pagination || paginationData;
          console.log("Using result.faqs");
        } else if (result?.data?.data && Array.isArray(result.data.data)) {
          faqsArray = result.data.data;
          paginationData = {
            current_page: result.data.current_page || 1,
            total: result.data.total || result.data.data.length,
            per_page: result.data.per_page || 100,
          };
          console.log("Using result.data.data");
        } else if (result?.data && Array.isArray(result.data)) {
          faqsArray = result.data;
          console.log("Using result.data");
        } else if (Array.isArray(result)) {
          faqsArray = result;
          console.log("Using result directly");
        } else {
          console.error("Could not find FAQs array in response:", result);
          setFaqData([]);
          setPagination({
            current_page: 1,
            total: 0,
            per_page: 100,
          });
          return;
        }

        console.log("FAQs Array found:", faqsArray);

        if (faqsArray.length === 0) {
          console.log("No FAQs found in API response");
          setFaqData([]);
          setPagination(paginationData);
          return;
        }

        // Transform FAQs data
        const transformedFAQs = faqsArray.map((faq) => {
          console.log("Processing FAQ:", faq);
          return {
            id: faq.id,
            question: faq.question || "No question",
            answer: faq.answer || "No answer",
            category_id: faq.category_id,
            category: faq.category?.name || "Umum",
            is_public: faq.is_public,
            view_count: faq.view_count || 0,
            created_at: faq.created_at,
            updated_at: faq.updated_at,
            user_id: faq.user_id,
            ticket_id: faq.ticket_id,
            deleted_at: faq.deleted_at,
            isChecked: false,
          };
        });

        console.log("Setting FAQ data:", transformedFAQs);
        setFaqData(transformedFAQs);
        setPagination({
          ...paginationData,
          total: transformedFAQs.length,
        });
      } catch (error) {
        console.error("Error loading FAQs:", error);
        setError("Gagal memuat data FAQ: " + error.message);
      } finally {
        setLoading(false);
      }
    },
    [categoryFilter, searchQuery]
  );

  // Load data on mount
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([loadCategories(), loadFAQs()]);
    };
    initializeData();
  }, [loadCategories, loadFAQs]);

  // Handle filter changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  // Apply filters
  const handleApplyFilters = () => {
    loadFAQs();
  };

  // Reset form inputs
  const resetForm = useCallback(() => {
    console.log("Resetting form...");
    setQuestionInput("");
    setAnswerInput("");
    setCategoryInput(categories.length > 0 ? categories[0].id : 1);
    setIsPublicInput(true);
    setError("");
  }, [categories]);

  // Handle add new FAQ
  const handleAddFAQ = useCallback(() => {
    console.log("Opening add modal...");
    resetForm();
    setEditingFAQ(null);
    setShowAddModal(true);
  }, [resetForm]);

  // Handle edit FAQ
  const handleEdit = useCallback((faq) => {
    console.log("Editing FAQ:", faq);
    setEditingFAQ(faq);
    setQuestionInput(faq.question || "");
    setAnswerInput(faq.answer || "");
    setCategoryInput(faq.category_id || 1);
    setIsPublicInput(faq.is_public !== undefined ? faq.is_public : true);
    setError("");
    setShowEditModal(true);
  }, []);

  // Submit add FAQ
  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    console.log("=== SUBMITTING ADD FAQ ===");

    // Validation
    if (!questionInput.trim()) {
      setError("Pertanyaan harus diisi");
      return;
    }

    if (!answerInput.trim()) {
      setError("Jawaban harus diisi");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const submitData = {
        question: questionInput.trim(),
        answer: answerInput.trim(),
        category_id: parseInt(categoryInput),
        is_public: Boolean(isPublicInput),
      };

      console.log("Submitting data:", submitData);

      const result = await createFAQAPI(submitData);
      console.log("Create result:", result);

      if (result.success) {
        // Close modal dan reset form
        setShowAddModal(false);
        resetForm();

        // Refresh data
        setTimeout(() => {
          loadFAQs();
        }, 500);

        console.log("FAQ berhasil ditambahkan!");
      } else {
        setError("Gagal menambah FAQ: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating FAQ:", error);
      setError("Gagal menambah FAQ: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit edit FAQ
  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    if (!editingFAQ) {
      setError("Data FAQ yang akan diedit tidak ditemukan");
      return;
    }

    // Validation
    if (!questionInput.trim()) {
      setError("Pertanyaan harus diisi");
      return;
    }

    if (!answerInput.trim()) {
      setError("Jawaban harus diisi");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const submitData = {
        question: questionInput.trim(),
        answer: answerInput.trim(),
        category_id: parseInt(categoryInput),
        is_public: Boolean(isPublicInput),
      };

      console.log("Updating FAQ:", editingFAQ.id, submitData);

      const result = await updateFAQAPI(editingFAQ.id, submitData);

      if (result.success) {
        // Close modal dan reset
        setShowEditModal(false);
        setEditingFAQ(null);
        resetForm();

        // Refresh data
        await loadFAQs();
        console.log("FAQ berhasil diupdate!");
      } else {
        setError(
          "Gagal mengupdate FAQ: " + (result.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error updating FAQ:", error);
      setError("Gagal mengupdate FAQ: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle individual checkbox
  const handleCheckboxChange = (id) => {
    setFaqData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      )
    );
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setFaqData((prev) =>
      prev.map((item) => ({ ...item, isChecked: newSelectAll }))
    );
  };

  // Handle delete selected FAQs
  const handleDeleteSelected = async () => {
    const selectedFAQs = faqData.filter((item) => item.isChecked);

    if (selectedFAQs.length === 0) {
      alert("Pilih FAQ yang ingin dihapus");
      return;
    }

    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus ${selectedFAQs.length} FAQ?`
      )
    ) {
      return;
    }

    try {
      setError("");

      for (const faq of selectedFAQs) {
        await deleteFAQAPI(faq.id);
      }

      await loadFAQs();
      setSelectAll(false);
      console.log(`${selectedFAQs.length} FAQ berhasil dihapus!`);
    } catch (error) {
      console.error("Error deleting FAQs:", error);
      setError("Gagal menghapus FAQ: " + error.message);
    }
  };

  // Handle reset filter
  const handleResetFilter = () => {
    setStatusFilter("Semua Status");
    setCategoryFilter("");
    setSearchQuery("");
    setSelectAll(false);
    setFaqData((prev) => prev.map((item) => ({ ...item, isChecked: false })));
    // Reload data without filters
    loadFAQs({});
  };

  // Filter FAQs based on status
  const filteredFAQs = faqData.filter((faq) => {
    if (statusFilter === "Semua Status") return true;
    if (statusFilter === "Published") return faq.is_public;
    if (statusFilter === "Draft") return !faq.is_public;
    return true;
  });

  // Handle close modals
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingFAQ(null);
    resetForm();
  };

  // Modal Component
  const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <button
              onClick={onClose}
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
                />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data FAQ...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage AskedUs</h1>
          <p className="text-gray-600 mt-1">
            Kelola FAQ (Frequently Asked Questions)
          </p>
        </div>

        {/* Add FAQ Button */}
        <button
          onClick={handleAddFAQ}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <svg
            className="w-5 h-5"
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
          <span>Tambah FAQ</span>
        </button>
      </div>

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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total FAQ</p>
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-semibold text-gray-900">
                {faqData.filter((faq) => faq.is_public).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="text-2xl font-semibold text-gray-900">
                {faqData.filter((faq) => !faq.is_public).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-semibold text-gray-900">
                {faqData.reduce((sum, faq) => sum + (faq.view_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari FAQ
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Cari berdasarkan pertanyaan atau jawaban..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              value={categoryFilter}
              onChange={handleCategoryFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Semua Kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.faqs_count || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Apply Filter Button */}
          <div className="flex items-end">
            <button
              onClick={handleApplyFilters}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      </div>

      {/* Additional Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
        <div className="flex justify-between items-center">
          {/* Left side - Select All Checkbox */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="form-checkbox h-4 w-4 text-red-600 rounded border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-600">Select All</span>
            </label>

            {faqData.some((item) => item.isChecked) && (
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors"
              >
                Hapus Terpilih (
                {faqData.filter((item) => item.isChecked).length})
              </button>
            )}
          </div>

          {/* Right side - Status Filter and Actions */}
          <div className="flex items-center space-x-4">
            {/* Status Filter Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option>Semua Status</option>
                <option>Published</option>
                <option>Draft</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => loadFAQs()}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
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
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Refresh</span>
            </button>

            {/* Reset Filter Button */}
            <button
              onClick={handleResetFilter}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* FAQ List */}
      <div className="bg-white rounded-lg shadow-sm">
        {filteredFAQs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <svg
              className="w-12 h-12 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-lg font-medium">Tidak ada FAQ</p>
            <p className="text-sm mb-4">Belum ada FAQ yang dibuat</p>
            <button
              onClick={handleAddFAQ}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Tambah FAQ Pertama
            </button>
          </div>
        ) : (
          filteredFAQs.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-start justify-between p-4 ${
                index !== filteredFAQs.length - 1
                  ? "border-b border-gray-200"
                  : ""
              } hover:bg-gray-50 transition-colors`}
            >
              {/* Left side - Checkbox and FAQ Info */}
              <div className="flex items-start flex-1">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.isChecked}
                    onChange={() => handleCheckboxChange(item.id)}
                    className="form-checkbox h-4 w-4 text-red-600 rounded border-gray-300 mt-1"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-gray-800 font-medium">
                        {item.question}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.is_public
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.is_public ? "Published" : "Draft"}
                      </span>
                      <span className="text-xs text-gray-500">
                        👁️ {item.view_count || 0} views
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {item.answer}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>📁 {item.category}</span>
                      <span>
                        📅{" "}
                        {new Date(item.created_at).toLocaleDateString("id-ID")}
                      </span>
                      {item.user_id && <span>👤 User ID: {item.user_id}</span>}
                    </div>
                  </div>
                </label>
              </div>

              {/* Right side - Action Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit FAQ"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Apakah Anda yakin ingin menghapus FAQ ini?"
                      )
                    ) {
                      deleteFAQAPI(item.id)
                        .then(() => {
                          loadFAQs();
                          console.log("FAQ berhasil dihapus!");
                        })
                        .catch((error) => {
                          setError("Gagal menghapus FAQ: " + error.message);
                        });
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Hapus FAQ"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Actions */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {faqData.filter((item) => item.isChecked).length} dari{" "}
          {faqData.length} item dipilih
        </div>

        {faqData.some((item) => item.isChecked) && (
          <div className="flex space-x-2">
            <button
              onClick={handleDeleteSelected}
              className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Hapus Terpilih
            </button>
          </div>
        )}
      </div>

      {/* Add FAQ Modal */}
      <Modal
        show={showAddModal}
        onClose={handleCloseAddModal}
        title="Tambah FAQ Baru"
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pertanyaan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Masukkan pertanyaan FAQ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jawaban <span className="text-red-500">*</span>
            </label>
            <textarea
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Masukkan jawaban FAQ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              value={categoryInput}
              onChange={(e) => setCategoryInput(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isPublicInput}
                onChange={(e) => setIsPublicInput(e.target.checked)}
                className="form-checkbox h-4 w-4 text-red-600 rounded border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">
                Publikasikan FAQ
              </span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseAddModal}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan FAQ"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit FAQ Modal */}
      <Modal
        show={showEditModal}
        onClose={handleCloseEditModal}
        title="Edit FAQ"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pertanyaan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Masukkan pertanyaan FAQ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jawaban <span className="text-red-500">*</span>
            </label>
            <textarea
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Masukkan jawaban FAQ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              value={categoryInput}
              onChange={(e) => setCategoryInput(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isPublicInput}
                onChange={(e) => setIsPublicInput(e.target.checked)}
                className="form-checkbox h-4 w-4 text-red-600 rounded border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">
                Publikasikan FAQ
              </span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseEditModal}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Update FAQ"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminAskedUs;
