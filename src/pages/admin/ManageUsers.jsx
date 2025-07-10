import React, { useState, useEffect } from 'react';
import SearchBar from '../../components/SearchBar';
import Navigation from '../../components/Navigation';
import { useNavigate } from 'react-router-dom';

const ManageUsers = () => {
  const navigate = useNavigate();

  const handleViewDetail = (userId) => {
    navigate(`/student/detailmanage/${userId}`);
  };

  const saveFiltersToStorage = (filters) => {
    try {
      localStorage.setItem('manageUsersFilters', JSON.stringify(filters));
    } catch (error) {
      console.warn('Failed to save filters to localStorage:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tanggal tidak tersedia';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      return 'Tanggal tidak valid';
    }
  };

  const loadFiltersFromStorage = () => {
    try {
      const saved = localStorage.getItem('manageUsersFilters');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load filters from localStorage:', error);
    }
    return {
      statusFilter: 'Semua Status',
      roleFilter: 'Semua Role',
      customDateRange: { startDate: '', endDate: '' },
      selectedDateRange: '',
    };
  };

  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 10,
    total_pages: 1,
  });

  const initialFilters = loadFiltersFromStorage();
  const [users, setUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(initialFilters.statusFilter);
  const [roleFilter, setRoleFilter] = useState(initialFilters.roleFilter);
  const [selectAll, setSelectAll] = useState(false);
  const [statistics, setStatistics] = useState({
    total_users: 0,
    admin_users: 0,
    student_users: 0,
    disposisi_users: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [isStatusDropdownVisible, setIsStatusDropdownVisible] = useState(false);
  const [isRoleDropdownVisible, setIsRoleDropdownVisible] = useState(false);
  const [isDateDropdownVisible, setIsDateDropdownVisible] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState(
    initialFilters.selectedDateRange
  );
  const [customDateRange, setCustomDateRange] = useState(
    initialFilters.customDateRange
  );

  const BASE_URL = 'https://apibackendtio.mynextskill.com/api';

  const formatLastTicket = (dateString) => {
    if (!dateString) return 'Tidak ada tiket';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Hari ini';
      if (diffDays === 1) return 'Kemarin';
      if (diffDays <= 7) return `${diffDays} hari lalu`;

      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Tanggal tidak valid';
    }
  };

  const makeAPICall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
      ...options,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    return response.json();
  };

  const fetchStatistics = async () => {
    try {
      const result = await makeAPICall('/users/statistics');
      if (result.status === 'success') {
        setStatistics(result.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiFilters = {
        page: pagination.current_page,
        per_page: pagination.per_page,
      };
      const queryString = new URLSearchParams(apiFilters).toString();
      const endpoint = `/users?${queryString}`;
      const result = await makeAPICall(endpoint);

      if (result.status === 'success') {
        let usersData = [];
        let totalCount = 0;
        let totalPages = 1;

        if (result.data?.data) {
          usersData = result.data.data;
          totalCount = result.data.total || usersData.length;
          totalPages = Math.ceil(totalCount / pagination.per_page);
        } else if (Array.isArray(result.data)) {
          usersData = result.data;
          totalCount = usersData.length;
          totalPages = Math.ceil(totalCount / pagination.per_page);
        }

        const usersWithCheckbox = usersData.map((user) => ({
          ...user,
          isChecked: false,
          registered: new Date(user.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          avatar: `/api/placeholder/40/40`,
        }));

        setUsers(usersWithCheckbox);
        setOriginalUsers(usersWithCheckbox);

        setPagination((prev) => ({
          ...prev,
          total: totalCount,
          total_pages: totalPages,
        }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredUsers = (usersList) => {
    let filtered = usersList;

    if (statusFilter && statusFilter !== 'Semua Status') {
      if (statusFilter === 'Active') {
        filtered = filtered.filter((user) => user.email_verified_at);
      } else if (statusFilter === 'Inactive') {
        filtered = filtered.filter((user) => !user.email_verified_at);
      }
    }

    if (roleFilter && roleFilter !== 'Semua Role') {
      filtered = filtered.filter(
        (user) => user.role.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    if (
      selectedDateRange &&
      selectedDateRange !== '' &&
      selectedDateRange !== 'Pilih Rentang'
    ) {
      if (selectedDateRange.includes(' - ')) {
        const [startDateStr, endDateStr] = selectedDateRange.split(' - ');
        const startDate = new Date(startDateStr + 'T00:00:00');
        const endDate = new Date(endDateStr + 'T23:59:59');

        filtered = filtered.filter((user) => {
          const userDate = new Date(user.created_at);
          return userDate >= startDate && userDate <= endDate;
        });
      }
    }

    return filtered;
  };

  const getDisplayedUsers = () => {
    if (pagination.total > users.length) {
      return users;
    }

    const filtered = getFilteredUsers(users);
    const startIndex = (pagination.current_page - 1) * pagination.per_page;
    const endIndex = startIndex + pagination.per_page;
    return filtered.slice(startIndex, endIndex);
  };

  const displayedUsers = getDisplayedUsers();

  const getPaginationInfo = () => {
    if (pagination.total > users.length) {
      return {
        totalItems: pagination.total,
        totalPages: pagination.total_pages,
        currentPage: pagination.current_page,
        perPage: pagination.per_page,
      };
    } else {
      const filtered = getFilteredUsers(users);
      return {
        totalItems: filtered.length,
        totalPages: Math.ceil(filtered.length / pagination.per_page),
        currentPage: pagination.current_page,
        perPage: pagination.per_page,
      };
    }
  };

  const paginationInfo = getPaginationInfo();

  const handleSearch = async (query) => {
    try {
      setSearchQuery(query);

      if (!query.trim()) {
        setUsers(originalUsers);
        setError('');
        return;
      }

      const queryLower = query.toLowerCase();
      const searchFiltered = originalUsers.filter((user) => {
        return (
          user.name?.toLowerCase().includes(queryLower) ||
          user.email?.toLowerCase().includes(queryLower) ||
          user.nim?.toLowerCase().includes(queryLower) ||
          user.prodi?.toLowerCase().includes(queryLower)
        );
      });

      setUsers(searchFiltered);
    } catch (error) {
      console.error('Search error:', error);
      setError('Gagal melakukan pencarian: ' + error.message);
    }
  };

  const handleClearSearch = async () => {
    setSearchQuery('');
    setUsers(originalUsers);
    setError('');
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
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

  useEffect(() => {
    fetchUsers();
  }, [pagination.current_page]);

  useEffect(() => {
    fetchStatistics();
    fetchUsers();
  }, []);

  useEffect(() => {
    const currentFilters = {
      statusFilter,
      roleFilter,
      selectedDateRange,
      customDateRange,
    };
    saveFiltersToStorage(currentFilters);
  }, [statusFilter, roleFilter, selectedDateRange, customDateRange]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data pengguna...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => fetchUsers()}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Manage Users</h1>
        <p className="text-sm text-white mt-1">Kelola pengguna sistem</p>
      </div>

      <div className="bg-white rounded-lg shadow min-h-[600px]">
        <Navigation topOffset="">
          <div className="flex items-center gap-4 pt-6">
            <div className="w-80">
              <SearchBar
                placeholder="Cari nama, email, NIM, atau prodi mahasiswa..."
                onSearch={handleSearch}
                onClear={handleClearSearch}
                disabled={loading}
                className="w-full"
                initialValue={searchQuery}
                debounceMs={150}
              />
            </div>
          </div>
        </Navigation>

        <div className="bg-white px-8 mt-4">
          <div className="divide-y divide-gray-200">
            {displayedUsers.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Tidak ada data user yang ditemukan
              </div>
            ) : (
              displayedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-blue-800 text-base">
                          {user.name}
                        </h3>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            Last Ticket:{' '}
                            <span className="font-medium text-gray-900">
                              {user.registered}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div
                          className="flex items-center space-x-2 text-sm text-gray-600"
                          title="Tanggal"
                        >
                          <svg
                            width="17"
                            height="16"
                            viewBox="0 0 21 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M0.5 18.125C0.5 19.1602 1.45982 20 2.64286 20H18.3571C19.5402 20 20.5 19.1602 20.5 18.125V7.5H0.5V18.125ZM14.7857 10.4688C14.7857 10.2109 15.0268 10 15.3214 10H17.1071C17.4018 10 17.6429 10.2109 17.6429 10.4688V12.0313C17.6429 12.2891 17.4018 12.5 17.1071 12.5H15.3214C15.0268 12.5 14.7857 12.2891 14.7857 12.0313V10.4688ZM14.7857 15.4688C14.7857 15.2109 15.0268 15 15.3214 15H17.1071C17.4018 15 17.6429 15.2109 17.6429 15.4688V17.0312C17.6429 17.2891 17.4018 17.5 17.1071 17.5H15.3214C15.0268 17.5 14.7857 17.2891 14.7857 17.0312V15.4688ZM9.07143 10.4688C9.07143 10.2109 9.3125 10 9.60714 10H11.3929C11.6875 10 11.9286 10.2109 11.9286 10.4688V12.0313C11.9286 12.2891 11.6875 12.5 11.3929 12.5H9.60714C9.3125 12.5 9.07143 12.2891 9.07143 12.0313V10.4688ZM9.07143 15.4688C9.07143 15.2109 9.3125 15 9.60714 15H11.3929C11.6875 15 11.9286 15.2109 11.9286 15.4688V17.0312C11.9286 17.2891 11.6875 17.5 11.3929 17.5H9.60714C9.3125 17.5 9.07143 17.2891 9.07143 17.0312V15.4688ZM3.35714 10.4688C3.35714 10.2109 3.59821 10 3.89286 10H5.67857C5.97321 10 6.21429 10.2109 6.21429 10.4688V12.0313C6.21429 12.2891 5.97321 12.5 5.67857 12.5H3.89286C3.59821 12.5 3.35714 12.2891 3.35714 12.0313V10.4688ZM3.35714 15.4688C3.35714 15.2109 3.59821 15 3.89286 15H5.67857C5.97321 15 6.21429 15.2109 6.21429 15.4688V17.0312C6.21429 17.2891 5.97321 17.5 5.67857 17.5H3.89286C3.59821 17.5 3.35714 17.2891 3.35714 17.0312V15.4688ZM18.3571 2.5H16.2143V0.625C16.2143 0.28125 15.8929 0 15.5 0H14.0714C13.6786 0 13.3571 0.28125 13.3571 0.625V2.5H7.64286V0.625C7.64286 0.28125 7.32143 0 6.92857 0H5.5C5.10714 0 4.78571 0.28125 4.78571 0.625V2.5H2.64286C1.45982 2.5 0.5 3.33984 0.5 4.375V6.25H20.5V4.375C20.5 3.33984 19.5402 2.5 18.3571 2.5Z"
                              fill="#444746"
                            />
                          </svg>
                          <span>{formatDate(user.created_at)}</span>
                        </div>

                        <div
                          className="flex items-center space-x-2"
                          title="Kategori Terfavorit"
                        >
                          <svg
                            className="ml-2"
                            width="20"
                            height="15"
                            viewBox="0 0 27 20"
                            fill="none"
                          >
                            <g clipPath="url(#clip0_2657_120330)">
                              <path
                                d="M0.277344 20V1.875C0.277344 0.839453 1.22872 0 2.40234 0H15.1523C16.326 0 17.2773 0.839453 17.2773 1.875V20L8.77734 15.625L0.277344 20Z"
                                fill="#444746"
                              />
                              <path
                                d="M20.639 4.78515C20.567 4.89852 20.4802 4.98945 20.3838 5.05252C20.2873 5.11559 20.1832 5.1495 20.0776 5.15223C19.972 5.15497 19.8671 5.12646 19.7692 5.06843C19.6713 5.01039 19.5823 4.92401 19.5077 4.81444C19.433 4.70487 19.3741 4.57435 19.3346 4.43067C19.295 4.28698 19.2756 4.13309 19.2775 3.97815C19.2793 3.82322 19.3024 3.67042 19.3454 3.52887C19.3884 3.38733 19.4504 3.25994 19.5276 3.1543L22.5792 0.337463C22.7266 0.121374 22.9265 0 23.1349 0C23.3433 0 23.5432 0.121374 23.6906 0.337463L26.7506 3.1543C26.8278 3.25994 26.8898 3.38733 26.9328 3.52887C26.9758 3.67042 26.9989 3.82322 27.0007 3.97815C27.0026 4.13309 26.9832 4.28698 26.9436 4.43067C26.9041 4.57435 26.8452 4.70487 26.7705 4.81444C26.6959 4.92401 26.6069 5.01039 26.509 5.06843C26.4111 5.12646 26.3062 5.15497 26.2006 5.15223C26.095 5.1495 25.9909 5.11559 25.8944 5.05252C25.798 4.98945 25.7112 4.89852 25.6392 4.78515L23.924 2.6543L23.9213 18.8461C23.9213 19.1521 23.8384 19.4456 23.691 19.662C23.5435 19.8784 23.3435 20 23.1349 20C22.9263 20 22.7263 19.8784 22.5789 19.662C22.4314 19.4456 22.3485 19.1521 22.3485 18.8461L22.3512 2.6543L20.639 4.78515Z"
                                fill="black"
                              />
                            </g>
                          </svg>
                          <span>
                            {user.favorite_category || 'Belum ada'}
                            {user.favorite_category_count > 0 && (
                              <span className="ml-1 text-blue-600 font-semibold">
                                ({user.favorite_category_count})
                              </span>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div
                            className="flex items-center space-x-2"
                            title="Tiket Baru"
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M19.0244 7.16016H19.0254C19.1649 7.30222 19.25 7.49508 19.25 7.70898C19.25 7.91831 19.1674 8.10592 19.0332 8.24707L19.0283 8.25293L8.26953 19.0254C8.12747 19.1649 7.93457 19.2499 7.7207 19.25C7.56005 19.25 7.41135 19.202 7.28711 19.1191L7.17188 19.0254L6.13672 17.9902C6.40416 17.5264 6.55009 16.9974 6.5459 16.4531C6.5446 16.2875 6.52579 16.124 6.49805 15.9629L7.41016 16.875L7.41602 16.8818L7.42285 16.8877C7.70619 17.1581 8.08293 17.3089 8.47461 17.3086C8.8664 17.3083 9.24343 17.1568 9.52637 16.8857L9.53223 16.8799L9.53711 16.874L16.8701 9.54102L16.8691 9.54004C17.0088 9.40227 17.1209 9.23933 17.1973 9.05859C17.2748 8.87499 17.3152 8.67786 17.3154 8.47852C17.3155 8.329 17.2928 8.18048 17.249 8.03809L17.1982 7.89746L17.1338 7.7627C17.0626 7.63183 16.9712 7.51171 16.8643 7.40723L16.0361 6.5791C16.1728 6.59635 16.3108 6.60797 16.4492 6.60645C16.8529 6.60193 17.2517 6.51704 17.6221 6.35645C17.7564 6.29819 17.8839 6.22604 18.0078 6.14941L19.0244 7.16016ZM14.2031 8.47461L8.47363 14.2051L5.7832 11.5137L11.5117 5.78418L14.2031 8.47461ZM12.2783 0.75C12.4389 0.75 12.5877 0.798004 12.7119 0.880859L12.8271 0.974609L13.8359 1.9834C13.7602 2.10632 13.6905 2.23314 13.6328 2.36621C13.4721 2.73682 13.3863 3.13609 13.3818 3.54004C13.3803 3.67754 13.3912 3.81436 13.4082 3.9502L12.5752 3.11719L12.5684 3.11133L12.5625 3.10547L12.4521 3.00879C12.1849 2.79877 11.8534 2.6834 11.5107 2.68359C11.119 2.6839 10.7419 2.83547 10.459 3.10645L3.11426 10.4512C2.97471 10.5889 2.86343 10.7529 2.78711 10.9336C2.70952 11.1173 2.67008 11.3152 2.66992 11.5146C2.66982 11.7138 2.70897 11.9111 2.78613 12.0947C2.86225 12.2757 2.97376 12.4401 3.11328 12.5781V12.5791L4.02441 13.4902C3.86361 13.4627 3.70038 13.4446 3.53516 13.4434C2.99155 13.4393 2.46335 13.5846 2 13.8516L0.974609 12.8174C0.835126 12.6753 0.750058 12.4824 0.75 12.2686C0.75 12.0546 0.834102 11.8609 0.973633 11.7188L6.35156 6.34766L11.7295 0.973633L11.7305 0.974609C11.8725 0.83519 12.0645 0.750089 12.2783 0.75Z"
                                fill="#607D8B"
                                stroke="#607D8B"
                                strokeWidth="1.5"
                              />
                            </svg>
                            <span className="text-blue-600 font-semibold">
                              {user.tickets_statistics?.new || 0}
                            </span>
                          </div>

                          <div
                            className="flex items-center space-x-2"
                            title="Sedang Diproses"
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M10 0.75C15.0996 0.75 19.25 4.90037 19.25 10C19.25 15.0996 15.0996 19.25 10 19.25C4.90037 19.25 0.75 15.0996 0.75 10C0.75 4.90037 4.90037 0.75 10 0.75ZM8.13379 11.5723L8.5 11.791L13.4023 14.7158L14.0459 15.0996L14.4307 14.4561L15.2197 13.1348L15.6035 12.4912L14.96 12.1064L11.1729 9.84766V4.2207H8.13379V11.5723Z"
                                fill="#FFBA57"
                                stroke="#FFBA57"
                                strokeWidth="1.5"
                              />
                            </svg>
                            <span className="text-yellow-600 font-semibold">
                              {user.tickets_statistics?.in_progress || 0}
                            </span>
                          </div>

                          <div
                            className="flex items-center space-x-2"
                            title="Selesai"
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g clipPath="url(#clip0_3510_76936)">
                                <path
                                  d="M10 0.75C12.6581 0.75 15.053 1.88432 16.7432 3.69238C13.6407 6.0346 11.448 8.70968 10.2109 10.4375C9.55016 9.6939 8.67362 8.83111 7.65723 8.13965L7.375 7.95508L6.72559 7.54492L6.0918 7.14355L5.69141 7.77734L4.86914 9.07812L4.4668 9.71289L5.10254 10.1133L5.75293 10.5225V10.5234C6.64925 11.0906 7.46809 11.9096 8.07617 12.6133C8.66489 13.2946 9.02617 13.8326 9.03711 13.8486L9.05078 13.8701L9.06641 13.8896L9.32617 14.2344L9.55078 14.5332H11.2246L11.4395 14.1523L11.6592 13.7637C11.6592 13.7637 12.3233 12.6082 13.5947 11.0205C14.7407 9.58947 16.3698 7.82006 18.4395 6.22949C18.9586 7.38242 19.25 8.65681 19.25 10C19.25 15.0996 15.0996 19.25 10 19.25C4.90037 19.25 0.75 15.0996 0.75 10C0.750009 4.90035 4.90037 0.75 10 0.75Z"
                                  fill="#28A745"
                                  stroke="#28A745"
                                  strokeWidth="1.5"
                                />
                              </g>
                              <defs>
                                <clipPath id="clip0_3510_76936">
                                  <rect
                                    width="20"
                                    height="20"
                                    rx="8"
                                    fill="white"
                                  />
                                </clipPath>
                              </defs>
                            </svg>
                            <span className="text-green-600 font-semibold">
                              {user.tickets_statistics?.closed || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleViewDetail(user.id)}
                        className="mt-2 border-2 border-gray-300 text-sm px-3 py-2 shadow-gray-300 shadow-md rounded-lg flex items-center space-x-2 hover:bg-red-100 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out transform"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2.22266 0.754883H17.7773C18.1864 0.754883 18.5183 0.892314 18.8135 1.1875C19.1087 1.4827 19.2456 1.81392 19.2451 2.22168V17.7773C19.2451 18.1868 19.1081 18.5193 18.8135 18.8145C18.5196 19.1088 18.1881 19.2456 17.7783 19.2451H2.22266C1.81318 19.2451 1.48172 19.1077 1.1875 18.8135C0.893414 18.5194 0.755487 18.1879 0.754883 17.7773V2.22266C0.754883 1.81362 0.891727 1.48181 1.18652 1.1875C1.4451 0.929365 1.73183 0.79235 2.07324 0.761719L2.22266 0.754883ZM1.4668 12.9775H6.16699C6.23726 12.9776 6.28445 12.9934 6.32715 13.0195C6.39907 13.0636 6.4598 13.1207 6.51172 13.1982V13.1973C6.88645 13.7867 7.37279 14.2674 7.9668 14.6309C8.58679 15.0102 9.26999 15.199 10 15.1982C10.73 15.1982 11.4132 15.0092 12.0332 14.6299C12.6275 14.2662 13.1143 13.7857 13.4893 13.1963C13.5412 13.1184 13.6017 13.0612 13.6729 13.0176C13.7147 12.992 13.7617 12.9773 13.8311 12.9775H18.5332V1.4668H1.4668V12.9775Z"
                            strokeWidth="1.51"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>Lihat Semua</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* FORCE PAGINATION - Hapus kondisi totalPages > 1 untuk testing */}
        {!loading && displayedUsers.length > 0 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-lg">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={handlePreviousPage}
                disabled={paginationInfo.currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={
                  paginationInfo.currentPage === paginationInfo.totalPages
                }
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
                    {(paginationInfo.currentPage - 1) * paginationInfo.perPage +
                      1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(
                      paginationInfo.currentPage * paginationInfo.perPage,
                      paginationInfo.totalItems
                    )}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">
                    {paginationInfo.totalItems}
                  </span>{' '}
                  results
                </p>
              </div>

              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                  <button
                    onClick={handlePreviousPage}
                    disabled={paginationInfo.currentPage === 1}
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
                    { length: Math.min(5, paginationInfo.totalPages) },
                    (_, i) => {
                      let startPage = Math.max(
                        1,
                        paginationInfo.currentPage - 2
                      );
                      let endPage = Math.min(
                        paginationInfo.totalPages,
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
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            page === paginationInfo.currentPage
                              ? 'z-10 bg-red-600 text-white'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}

                  <button
                    onClick={handleNextPage}
                    disabled={
                      paginationInfo.currentPage === paginationInfo.totalPages
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
    </div>
  );
};

export default ManageUsers;
