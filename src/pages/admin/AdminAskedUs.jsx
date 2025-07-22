import React, { useState, useEffect, useCallback } from 'react';
import {
  getFAQsAdminAPI,
  getFAQCategoriesAPI,
  createFAQAPI,
  updateFAQAPI,
  deleteFAQAPI,
} from '../../services/api';
import SearchBar from '../../components/SearchBar';
import Navigation from '../../components/Navigation';

const Modal = React.memo(({ show, onClose, title, children }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-90vh overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
});

const AdminAskedUs = () => {
  const [faqData, setFaqData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 10,
    total_pages: 1,
  });

  // New filter states for dropdowns
  const [selectedDateRange, setSelectedDateRange] = useState('');
  const [unreadFilter, setUnreadFilter] = useState('');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  // Dropdown visibility states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isCategoryDropdownVisible, setIsCategoryDropdownVisible] =
    useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [isDateDropdownVisible, setIsDateDropdownVisible] = useState(false);
  const [showUnreadDropdown, setShowUnreadDropdown] = useState(false);
  const [isUnreadDropdownVisible, setIsUnreadDropdownVisible] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isStatusDropdownVisible, setIsStatusDropdownVisible] = useState(false);
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [questionInput, setQuestionInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [categoryInput, setCategoryInput] = useState(1);
  const [isPublicInput, setIsPublicInput] = useState(true);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await getFAQCategoriesAPI();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([
        { id: 1, name: 'Facilities' },
        { id: 2, name: 'Academic' },
        { id: 3, name: 'General' },
      ]);
    }
  }, []);

  // Load FAQs
  const loadFAQs = useCallback(
    async (filters = {}) => {
      try {
        setLoading(true);
        setError('');

        const apiFilters = {
          per_page: pagination.per_page,
          page: pagination.current_page,
          ...filters,
        };

        if (
          selectedCategory &&
          selectedCategory !== '' &&
          selectedCategory !== 'Semua Kategori'
        ) {
          const category = categories.find(
            (cat) => cat.name === selectedCategory
          );
          if (category) {
            apiFilters.category_id = category.id;
          }
        }

        if (searchQuery && searchQuery.trim()) {
          apiFilters.search = searchQuery.trim();
        }

        const result = await getFAQsAdminAPI(apiFilters);

        let faqsArray = [];
        if (result?.data && Array.isArray(result.data)) {
          faqsArray = result.data;
        } else if (Array.isArray(result)) {
          faqsArray = result;
        }

        const transformedFAQs = faqsArray.map((faq) => ({
          id: faq.id,
          question: faq.question || 'No question',
          answer: faq.answer || 'No answer',
          category_id: faq.category_id,
          category: faq.category?.name || 'Umum',
          is_public: faq.is_public,
          view_count: faq.view_count || 0,
          created_at: faq.created_at,
          updated_at: faq.updated_at,
          user_id: faq.user_id,
          ticket_id: faq.ticket_id,
          deleted_at: faq.deleted_at,
          isChecked: false,
        }));

        setFaqData(transformedFAQs);
        if (result?.data) {
          setPagination((prev) => ({
            ...prev,
            total: result.total || transformedFAQs.length,
            total_pages:
              result.last_page ||
              Math.ceil(transformedFAQs.length / prev.per_page),
          }));
        }
      } catch (error) {
        console.error('Error loading FAQs:', error);
        setError('Gagal memuat data FAQ: ' + error.message);
      } finally {
        setLoading(false);
      }
    },
    [
      selectedCategory,
      searchQuery,
      pagination.current_page,
      pagination.per_page,
    ]
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
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Reset form inputs - Tambahkan delay untuk mencegah race condition
  const resetForm = useCallback(() => {
    setTimeout(() => {
      setQuestionInput('');
      setAnswerInput('');
      setCategoryInput(categories.length > 0 ? categories[0].id : 1);
      setIsPublicInput(true);
      setError('');
    }, 0);
  }, [categories]);

  const handleAddFAQ = useCallback(() => {
    setEditingFAQ(null);
    setShowAddModal(true);
    setTimeout(() => {
      resetForm();
    }, 10);
  }, [resetForm]);
  // Handle edit FAQ
  const handleEdit = useCallback((faq) => {
    setEditingFAQ(faq);
    setQuestionInput(faq.question || '');
    setAnswerInput(faq.answer || '');
    setCategoryInput(faq.category_id || 1);
    setIsPublicInput(faq.is_public !== undefined ? faq.is_public : true);
    setError('');
    setShowEditModal(true);
  }, []);

  // Submit add FAQ
  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    if (!questionInput.trim()) {
      setError('Pertanyaan harus diisi');
      return;
    }

    if (!answerInput.trim()) {
      setError('Jawaban harus diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const submitData = {
        question: questionInput.trim(),
        answer: answerInput.trim(),
        category_id: parseInt(categoryInput),
        is_public: Boolean(isPublicInput),
      };

      const result = await createFAQAPI(submitData);

      if (result.success) {
        setShowAddModal(false);
        resetForm();
        setTimeout(() => {
          loadFAQs();
        }, 500);
      } else {
        setError('Gagal menambah FAQ: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating FAQ:', error);
      setError('Gagal menambah FAQ: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit edit FAQ
  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    if (!editingFAQ) {
      setError('Data FAQ yang akan diedit tidak ditemukan');
      return;
    }

    if (!questionInput.trim()) {
      setError('Pertanyaan harus diisi');
      return;
    }

    if (!answerInput.trim()) {
      setError('Jawaban harus diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const submitData = {
        question: questionInput.trim(),
        answer: answerInput.trim(),
        category_id: parseInt(categoryInput),
        is_public: Boolean(isPublicInput),
      };

      const result = await updateFAQAPI(editingFAQ.id, submitData);

      if (result.success) {
        setShowEditModal(false);
        setEditingFAQ(null);
        resetForm();
        await loadFAQs();
      } else {
        setError(
          'Gagal mengupdate FAQ: ' + (result.message || 'Unknown error')
        );
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
      setError('Gagal mengupdate FAQ: ' + error.message);
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
      alert('Pilih FAQ yang ingin dihapus');
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
      setError('');

      for (const faq of selectedFAQs) {
        await deleteFAQAPI(faq.id);
      }

      await loadFAQs();
      setSelectAll(false);
    } catch (error) {
      console.error('Error deleting FAQs:', error);
      setError('Gagal menghapus FAQ: ' + error.message);
    }
  };

  // Filter FAQs based on status
  const filteredFAQs = faqData.filter((faq) => {
    // Di admin, tampilkan semua FAQ (baik published maupun draft)
    if (statusFilter === 'Semua Status') return true;
    if (statusFilter === 'Published') return faq.is_public === true;
    if (statusFilter === 'Draft') return faq.is_public === false;
    return true; // Default: tampilkan semua
  });

  // Handle close modals - Add useCallback to prevent re-creation
  const handleCloseAddModal = useCallback(() => {
    setShowAddModal(false);
    resetForm();
  }, [resetForm]);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditingFAQ(null);
    resetForm();
  }, [resetForm]);

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
    <div className="">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white w-50">
              Kelola Asked Us (FAQ)
            </h1>
          </div>

          <div className="mb-3 justify-end flex">
            <button
              onClick={handleAddFAQ}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors "
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
        </div>
      </div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow min-h-[600px]">
        <Navigation topOffset="">
          <div className="flex items-center gap-4 pt-6">
            <div className="w-80 shadow-md shadow-gray-300">
              <SearchBar
                placeholder="Telusuri FAQ"
                onSearch={handleSearch}
                onClear={handleClearSearch}
                disabled={loading}
                className="w-full"
                initialValue={searchQuery}
                debounceMs={150}
              />
            </div>

            <div className="flex items-center space-x-3 ml-auto">
              <div className="relative" data-dropdown="status">
                <button
                  onClick={() => {
                    if (showStatusDropdown) {
                      setShowStatusDropdown(false);
                      setTimeout(() => setIsStatusDropdownVisible(false), 300);
                    } else {
                      setIsStatusDropdownVisible(true);
                      setTimeout(() => setShowStatusDropdown(true), 10);
                    }
                  }}
                  className={`border-2 border-gray-400 text-sm px-3 py-2 rounded-lg flex items-center shadow-lg space-x-2 transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                    statusFilter !== 'Semua Status'
                      ? 'bg-red-200 font-semibold'
                      : 'bg-white hover:bg-red-100'
                  }`}
                >
                  {/* SVG Icon berdasarkan status */}
                  {statusFilter === 'Published' ? (
                    <svg
                    width="22"
                    height="16"
                    viewBox="0 0 20 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_published)">
                      <path
                        d="M10 4.4C9.27668 4.4 8.58299 4.67393 8.07153 5.16152C7.56006 5.64912 7.27273 6.31044 7.27273 7C7.27273 7.68956 7.56006 8.35088 8.07153 8.83848C8.58299 9.32607 9.27668 9.6 10 9.6C10.7233 9.6 11.417 9.32607 11.9285 8.83848C12.4399 8.35088 12.7273 7.68956 12.7273 7C12.7273 6.31044 12.4399 5.64912 11.9285 5.16152C11.417 4.67393 10.7233 4.4 10 4.4ZM10 11.3333C8.79447 11.3333 7.63832 10.8768 6.78588 10.0641C5.93344 9.25147 5.45455 8.14927 5.45455 7C5.45455 5.85073 5.93344 4.74853 6.78588 3.93587C7.63832 3.12321 8.79447 2.66667 10 2.66667C11.2055 2.66667 12.3617 3.12321 13.2141 3.93587C14.0666 4.74853 14.5455 5.85073 14.5455 7C14.5455 8.14927 14.0666 9.25147 13.2141 10.0641C12.3617 10.8768 11.2055 11.3333 10 11.3333ZM10 0.5C5.45455 0.5 1.57273 3.19533 0 7C1.57273 10.8047 5.45455 13.5 10 13.5C14.5455 13.5 18.4273 10.8047 20 7C18.4273 3.19533 14.5455 0.5 10 0.5Z"
                        fill="#28A745"
                      />
                    </g>
                  </svg>
                  ) : statusFilter === 'Draft' ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 32 32"
                    >
                      <path
                        fill="currentColor"
                        d="m29.707 19.293l-3-3a1 1 0 0 0-1.414 0L16 25.586V30h4.414l9.293-9.293a1 1 0 0 0 0-1.414M19.586 28H18v-1.586l5-5L24.586 23zM26 21.586L24.414 20L26 18.414L27.586 20zM8 16h10v2H8zm0-6h12v2H8z"
                      />
                      <path
                        fill="currentColor"
                        d="M26 4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v13a10.98 10.98 0 0 0 5.824 9.707L13 29.467V27.2l-4.234-2.258A8.99 8.99 0 0 1 4 17V4h20v9h2Z"
                      />
                    </svg>
                  ) : null}
                  <span>{statusFilter}</span>
                  <svg
                    width="11"
                    height="8"
                    viewBox="0 0 11 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 0.9375H10.27L5.135 7.0675L0 0.9375Z"
                      fill="black"
                    />
                  </svg>
                </button>

                {isStatusDropdownVisible && (
                  <div
                    className={`absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20 transform transition-all duration-300 ease-out origin-top ${
                      showStatusDropdown
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 -translate-y-2'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setStatusFilter('Semua Status');
                        setShowStatusDropdown(false);
                        setTimeout(
                          () => setIsStatusDropdownVisible(false),
                          300
                        );
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      Semua Status
                    </button>
                    <button
                      onClick={() => {
                        setStatusFilter('Published');
                        setShowStatusDropdown(false);
                        setTimeout(
                          () => setIsStatusDropdownVisible(false),
                          300
                        );
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                    >
                      Published
                    </button>
                    <button
                      onClick={() => {
                        setStatusFilter('Draft');
                        setShowStatusDropdown(false);
                        setTimeout(
                          () => setIsStatusDropdownVisible(false),
                          300
                        );
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                    >
                      Draft
                    </button>
                  </div>
                )}
              </div>

              {/* Category Filter */}
              <div className="relative" data-dropdown="category">
                <button
                  onClick={() => {
                    if (showCategoryDropdown) {
                      setShowCategoryDropdown(false);
                      setTimeout(
                        () => setIsCategoryDropdownVisible(false),
                        300
                      );
                    } else {
                      setIsCategoryDropdownVisible(true);
                      setTimeout(() => setShowCategoryDropdown(true), 10);
                    }
                  }}
                  className={`border-2 border-gray-400 text-sm px-3 py-2 rounded-lg flex items-center shadow-lg space-x-2 transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                    selectedCategory
                      ? 'bg-red-200 font-semibold'
                      : 'bg-white hover:bg-red-100'
                  }`}
                >
                  <svg
                    width="17"
                    height="20"
                    viewBox="0 0 17 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 20V1.875C0 0.839453 0.95138 0 2.125 0H14.875C16.0486 0 17 0.839453 17 1.875V20L8.5 15.625L0 20Z"
                      fill="#444746"
                    />
                  </svg>
                  <span>{selectedCategory || 'Semua Kategori'}</span>
                  <svg
                    width="11"
                    height="8"
                    viewBox="0 0 11 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 0.9375H10.27L5.135 7.0675L0 0.9375Z"
                      fill="black"
                    />
                  </svg>
                </button>

                {isCategoryDropdownVisible && (
                  <div
                    className={`absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20 transform transition-all duration-300 ease-out origin-top ${
                      showCategoryDropdown
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 -translate-y-2'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedCategory('');
                        setShowCategoryDropdown(false);
                        setTimeout(
                          () => setIsCategoryDropdownVisible(false),
                          300
                        );
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      Semua Kategori
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.name);
                          setShowCategoryDropdown(false);
                          setTimeout(
                            () => setIsCategoryDropdownVisible(false),
                            300
                          );
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Reset Filter Button */}
              <button
                className="border-2 border-gray-400 text-sm px-3 py-2 shadow-gray-300 shadow-md rounded-lg flex items-center space-x-2 hover:bg-red-100 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out transform"
                onClick={() => {
                  setStatusFilter('Semua Status');
                  setSelectedCategory('');
                  setSelectedDateRange('');
                  setUnreadFilter('');
                  setCustomDateRange({ startDate: '', endDate: '' });
                  loadFAQs();
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  className="w-4 h-4"
                >
                  <path
                    fill="currentColor"
                    d="M22.5 9a7.45 7.45 0 0 0-6.5 3.792V8h-2v8h8v-2h-4.383a5.494 5.494 0 1 1 4.883 8H22v2h.5a7.5 7.5 0 0 0 0-15"
                  />
                  <path
                    fill="currentColor"
                    d="M26 6H4v3.171l7.414 7.414l.586.586V26h4v-2h2v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-8l-7.414-7.415A2 2 0 0 1 2 9.171V6a2 2 0 0 1 2-2h22Z"
                  />
                </svg>
                <span>Reset Filter</span>
              </button>
            </div>
          </div>
        </Navigation>
        <div className="bg-white rounded-lg shadow-sm mt-4">
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
            <div className="bg-white rounded-lg shadow-sm mt-4">
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
                        ? 'border-b border-gray-200'
                        : ''
                    } hover:bg-gray-50 transition-colors`}
                  >
                    {/* Left side - Checkbox and FAQ Info */}
                    <div className="flex items-start flex-1">
                      <label className="flex items-start cursor-pointer">
                        <div className="ml-4 flex-1">
                          {/* Status Aktif dan View Count */}
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="flex items-center space-x-1">
                              {item.is_public ? (
                                <>
                                  {/* Mata aktif */}
                                  <svg
                                    width="22"
                                    height="16"
                                    viewBox="0 0 20 14"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <g clipPath="url(#clip0_3510_112121)">
                                      <path
                                        d="M10 4.4C9.27668 4.4 8.58299 4.67393 8.07153 5.16152C7.56006 5.64912 7.27273 6.31044 7.27273 7C7.27273 7.68956 7.56006 8.35088 8.07153 8.83848C8.58299 9.32607 9.27668 9.6 10 9.6C10.7233 9.6 11.417 9.32607 11.9285 8.83848C12.4399 8.35088 12.7273 7.68956 12.7273 7C12.7273 6.31044 12.4399 5.64912 11.9285 5.16152C11.417 4.67393 10.7233 4.4 10 4.4ZM10 11.3333C8.79447 11.3333 7.63832 10.8768 6.78588 10.0641C5.93344 9.25147 5.45455 8.14927 5.45455 7C5.45455 5.85073 5.93344 4.74853 6.78588 3.93587C7.63832 3.12321 8.79447 2.66667 10 2.66667C11.2055 2.66667 12.3617 3.12321 13.2141 3.93587C14.0666 4.74853 14.5455 5.85073 14.5455 7C14.5455 8.14927 14.0666 9.25147 13.2141 10.0641C12.3617 10.8768 11.2055 11.3333 10 11.3333ZM10 0.5C5.45455 0.5 1.57273 3.19533 0 7C1.57273 10.8047 5.45455 13.5 10 13.5C14.5455 13.5 18.4273 10.8047 20 7C18.4273 3.19533 14.5455 0.5 10 0.5Z"
                                        fill="#28A745"
                                      />
                                    </g>
                                    <defs>
                                      <clipPath id="clip0_3510_112121">
                                        <rect
                                          y="0.5"
                                          width="20"
                                          height="13"
                                          rx="6.5"
                                          fill="white"
                                        />
                                      </clipPath>
                                    </defs>
                                  </svg>
                                  <span className="text-green-700 text-sm font-medium">
                                    Aktif
                                  </span>
                                </>
                              ) : (
                                <>
                                  {/* Mata non-aktif */}
                                  <svg
                                    width="20"
                                    height="14"
                                    viewBox="0 0 20 14"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M0 7C1.57273 3.19533 5.45455 0.5 10 0.5C14.5455 0.5 18.4273 3.19533 20 7C18.4273 10.8047 14.5455 13.5 10 13.5C5.45455 13.5 1.57273 10.8047 0 7Z"
                                      fill="#D1D5DB"
                                    />
                                  </svg>
                                  <span className="text-gray-400 text-sm font-medium">
                                    Tidak Aktif
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Kategori */}
                          <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                            <svg
                              width="11"
                              height="14"
                              viewBox="0 0 11 14"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g clipPath="url(#clip0_3510_101071)">
                                <path
                                  d="M0 14V1.3125C0 0.587617 0.615599 0 1.375 0H9.625C10.3844 0 11 0.587617 11 1.3125V14L5.5 10.9375L0 14Z"
                                  fill="#444746"
                                />
                              </g>
                              <defs>
                                <clipPath id="clip0_3510_101071">
                                  <rect width="11" height="14" fill="white" />
                                </clipPath>
                              </defs>
                            </svg>
                            <span className=" text-base  text-gray-700">
                              {item.category}
                            </span>
                          </div>
                          {/* Judul FAQ */}
                          <div className="mt-3 text-gray-800 font-medium mb-1 text-base">
                            {item.question}
                          </div>

                          {/* Jawaban ringkas */}
                          <p className=" text-base text-gray-600 line-clamp-2 mb-2">
                            {item.answer}
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Right side - Action Buttons */}
                    <div className="flex flex-col items-end text-right space-y-2 ml-4">
                      <span className="text-base text-gray-400">
                        {(() => {
                          const createdAt = new Date(item.created_at);
                          const now = new Date();
                          const isToday =
                            createdAt.toDateString() === now.toDateString();
                          const isYesterday =
                            new Date(
                              now.setDate(now.getDate() - 1)
                            ).toDateString() === createdAt.toDateString();

                          const time = createdAt.toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                          const dayLabel = isToday
                            ? 'Hari ini'
                            : isYesterday
                              ? 'Kemarin'
                              : createdAt.toLocaleDateString('id-ID', {
                                  weekday: 'long',
                                });

                          return `${dayLabel}, ${time}`;
                        })()}
                      </span>
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-black hover:text-blue-600 transition-colors"
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
                              'Apakah Anda yakin ingin menghapus FAQ ini?'
                            )
                          ) {
                            deleteFAQAPI(item.id)
                              .then(() => {
                                loadFAQs();
                              })
                              .catch((error) => {
                                setError(
                                  'Gagal menghapus FAQ: ' + error.message
                                );
                              });
                          }
                        }}
                        className="p-2 text-black hover:text-red-600 transition-colors"
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
          )}
        </div>
        {/* Pagination Component */}
        {faqData.length > 0 && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    current_page: prev.current_page - 1,
                  }))
                }
                disabled={pagination.current_page === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    current_page: prev.current_page + 1,
                  }))
                }
                disabled={pagination.current_page === pagination.total_pages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {(pagination.current_page - 1) * pagination.per_page + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(
                      pagination.current_page * pagination.per_page,
                      pagination.total
                    )}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span>{' '}
                  results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        current_page: prev.current_page - 1,
                      }))
                    }
                    disabled={pagination.current_page === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {Array.from(
                    { length: Math.min(5, pagination.total_pages) },
                    (_, i) => {
                      let startPage = Math.max(1, pagination.current_page - 2);
                      let endPage = Math.min(
                        pagination.total_pages,
                        startPage + 4
                      );
                      if (endPage - startPage < 4) {
                        startPage = Math.max(1, endPage - 4);
                      }
                      const page = startPage + i;
                      if (page > endPage) return null;

                      return (
                        <button
                          key={page}
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              current_page: page,
                            }))
                          }
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            page === pagination.current_page
                              ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}

                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        current_page: prev.current_page + 1,
                      }))
                    }
                    disabled={
                      pagination.current_page === pagination.total_pages
                    }
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
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
              key="question-input"
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
              key="answer-input"
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
              {isSubmitting ? 'Menyimpan...' : 'Simpan FAQ'}
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
              {isSubmitting ? 'Menyimpan...' : 'Update FAQ'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminAskedUs;
