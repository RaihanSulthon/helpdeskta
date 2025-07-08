import React, { useState, useEffect, useCallback } from "react";
import { getFAQsAPI, getFAQCategoriesAPI } from "../../services/api";
import SearchBar from "../../components/SearchBar";

const StudentAskedUs = () => {
  const [faqData, setFaqData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [statusFilter, setStatusFilter] = useState("Published");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 100,
  });

  // Accordion state
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Toggle accordion item
  const toggleAccordion = (id) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Load categories
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
        { id: 1, name: "Facilities", faqs_count: 0 },
        { id: 2, name: "Academic", faqs_count: 0 },
        { id: 3, name: "General", faqs_count: 0 },
      ]);
    }
  }, []);

  // Load FAQs dengan filter yang benar
  const loadFAQs = useCallback(
    async (filters = {}) => {
      try {
        setLoading(true);
        setError("");

        console.log("=== LOADING FAQs FOR STUDENTS ===");

        // Prepare filters based on current state
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
        } else if (result?.data?.data && Array.isArray(result.data.data)) {
          faqsArray = result.data.data;
          paginationData = {
            current_page: result.data.current_page || 1,
            total: result.data.total || result.data.data.length,
            per_page: result.data.per_page || 100,
          };
        } else if (result?.data && Array.isArray(result.data)) {
          faqsArray = result.data;
        } else if (Array.isArray(result)) {
          faqsArray = result;
        } else {
          console.warn("No FAQ array found, trying fallback...");

          // Set fallback data untuk testing
          const fallbackData = [
            {
              id: 1,
              question: "Bagaimana cara mengajukan SK TA/Thesis/Disertasi?",
              answer:
                "Untuk mengajukan SK TA/Thesis/Disertasi, Anda perlu mengikuti langkah-langkah berikut:\n\n1. Siapkan dokumen yang diperlukan seperti transkrip nilai dan proposal\n2. Submit aplikasi melalui portal online mahasiswa\n3. Tunggu verifikasi dari bagian akademik\n4. Setelah disetujui, SK akan diterbitkan\n\nProses ini biasanya memakan waktu 3-5 hari kerja.",
              category_id: 1,
              category: { name: "Academic" },
              is_public: true,
              view_count: 25,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              user_id: "admin",
            },
            {
              id: 2,
              question:
                "Bisakah saya mengganti dosen pembimbing setelah SK terbit?",
              answer:
                "Ya, Anda dapat mengganti dosen pembimbing dengan ketentuan sebagai berikut:\n\n1. Mengajukan permohonan tertulis ke bagian akademik\n2. Menyertakan alasan yang jelas dan dapat dipertanggungjawabkan\n3. Mendapat persetujuan dari dosen pembimbing lama\n4. Mendapat persetujuan dari dosen pembimbing baru\n5. Membayar biaya administrasi sesuai ketentuan\n\nProses ini memerlukan waktu sekitar 1-2 minggu.",
              category_id: 1,
              category: { name: "Academic" },
              is_public: true,
              view_count: 18,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              user_id: "admin",
            },
            {
              id: 3,
              question: "Apakah saya bisa mulai bimbingan sebelum SK terbit?",
              answer:
                "Secara teknis, bimbingan dapat dimulai setelah proposal Anda disetujui, namun:\n\n1. SK tetap diperlukan untuk validasi formal\n2. Konsultasi awal dapat dilakukan dengan dosen pembimbing\n3. Progress bimbingan akan dicatat setelah SK terbit\n4. Disarankan untuk segera mengurus SK agar tidak mengganggu jadwal\n\nUntuk kepastian, konsultasikan dengan bagian akademik.",
              category_id: 1,
              category: { name: "Academic" },
              is_public: true,
              view_count: 12,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              user_id: "admin",
            },
          ];

          faqsArray = fallbackData;
          paginationData.total = fallbackData.length;
        }

        if (faqsArray.length === 0) {
          setFaqData([]);
          setPagination(paginationData);
          return;
        }

        // Transform FAQs data dan filter hanya yang published
        const transformedFAQs = faqsArray
          .filter((faq) => {
            const isPublished = faq.is_public === true || faq.is_public === 1;
            return isPublished;
          })
          .map((faq) => ({
            id: faq.id,
            question: faq.question || "No question",
            answer: faq.answer || "No answer available",
            category_id: faq.category_id,
            category: faq.category?.name || "Umum",
            is_public: faq.is_public,
            view_count: faq.view_count || 0,
            created_at: faq.created_at || new Date().toISOString(),
            updated_at: faq.updated_at || new Date().toISOString(),
            user_id: faq.user_id,
            ticket_id: faq.ticket_id,
            deleted_at: faq.deleted_at,
          }));

        setFaqData(transformedFAQs);
        setPagination({
          ...paginationData,
          total: transformedFAQs.length,
        });
      } catch (error) {
        console.error("Error loading FAQs:", error);
        setError("Gagal memuat data FAQ: " + error.message);

        // Error fallback data
        const errorFallbackData = [
          {
            id: 999,
            question: "Test FAQ - Error Fallback",
            answer:
              "Ini adalah data test karena terjadi error saat memuat FAQ dari server. Silakan coba refresh halaman atau hubungi administrator.",
            category: "System",
            view_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];

        setFaqData(errorFallbackData);
        setPagination({
          current_page: 1,
          total: 1,
          per_page: 100,
        });
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

  const handleSearch = (query) => {
    setSearchQuery(query);
    loadFAQs();
  };
  
  const handleClearSearch = () => {
    setSearchQuery("");
    loadFAQs();
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  // Apply filters
  const handleApplyFilters = () => {
    loadFAQs();
  };

  // Handle reset filter
  const handleResetFilter = () => {
    setStatusFilter("Published");
    setCategoryFilter("");
    setSearchQuery("");
    setExpandedItems(new Set());
    loadFAQs({});
  };

  // Filter FAQs based on status (client-side filter)
  const filteredFAQs = faqData.filter((faq) => {
    return faq.is_public === true;
  });

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
    <div className="mb-6 font-handline">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">AskedUs (FAQ)</h1>
        <p className="text-gray-600 mt-1">
          Temukan jawaban untuk pertanyaan yang sering diajukan
        </p>
      </div>
      <div className="p-6 bg-gray-50 min-h-screen mt-4 rounded-lg">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Error Loading FAQ:</p>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.faqs_count || 0})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
        </div>

        {/* Clean Accordion List - New Design */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredFAQs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-4"
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
              <p className="text-lg font-medium mb-2">Tidak ada FAQ</p>
              <p className="text-sm">
                {searchQuery || categoryFilter
                  ? "Tidak ada FAQ yang cocok dengan pencarian atau filter"
                  : "Belum ada FAQ yang tersedia"}
              </p>
            </div>
          ) : (
            filteredFAQs.map((item, index) => (
              <div key={item.id}>
                {/* Separator line between items */}
                {index > 0 && <div className="border-t border-gray-200"></div>}
                {/* Question Header - Clickable */}
                <button
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full px-8 py-8 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-150 focus:outline-none "
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 pr-6">
                      <h3 className="text-base font-bold text-gray-900 leading-relaxed">
                        {item.question}
                      </h3>
                    </div>

                    {/* Chevron Icon */}
                    <div className="flex-shrink-0">
                      <svg
                        className={`w-5 h-5  transform transition-transform duration-500 ease-in-out ${
                          expandedItems.has(item.id) ? "rotate-180" : ""
                        }`}
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
                </button>
                {/* Answer Content - Collapsible */}
                <div
                  className={`overflow-hidden transition-all duration-1000 ease-in-out ${
                    expandedItems.has(item.id)
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6 border-t border-gray-150 bg-gray-50">
                    <div className="pt-4">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {item.answer}
                        </p>
                      </div>

                      {/* Metadata */}
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                              />
                            </svg>
                            {item.category}
                          </span>

                          <span>
                            Dipublikasikan:{" "}
                            {new Date(item.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Expand/Collapse All - only show if there are FAQs */}
        {filteredFAQs.length > 1 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                if (expandedItems.size === filteredFAQs.length) {
                  setExpandedItems(new Set());
                } else {
                  setExpandedItems(
                    new Set(filteredFAQs.map((item) => item.id))
                  );
                }
              }}
              className="text-grey-300 text-sm font-bold underline"
            >
              {expandedItems.size === filteredFAQs.length
                ? "Tutup Semua"
                : "Buka Semua"}
            </button>
          </div>
        )}

        {/* Help Section */}
        {filteredFAQs.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tidak menemukan jawaban yang Anda cari?
              </h3>
              <p className="text-gray-600 mb-4">
                Silakan hubungi support tiket
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAskedUs;
