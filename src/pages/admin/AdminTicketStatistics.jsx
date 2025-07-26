import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Navigation from '../../components/Navigation';

const AdminTicketStatistics = () => {
  const [statistics, setStatistics] = useState({
    total: 0,
    new: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    unread: 0,
    by_category: [],
    trend_data: [],
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('minggu_ini');
  const [dateRange, setDateRange] = useState({
    date_from: '',
    date_to: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  // API base URL and helper function
  const BASE_URL = 'https://apibackendtio.mynextskill.com/api';

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

  // Load categories from API - but use by_category from statistics instead
  const loadCategories = async () => {
    try {
      const result = await makeAPICall('/categories');

      if (result.status === 'success' && result.data) {
        console.log('Categories loaded:', result.data);
        setCategories(result.data);
      } else if (Array.isArray(result)) {
        setCategories(result);
      } else {
        console.warn('Unexpected categories API response:', result);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  // Fetch statistics from tickets data
  const fetchStatistics = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching tickets data with filters:', filters);

      const queryParams = new URLSearchParams();

      // Handle period-based filtering
      if (filters.period) {
        const now = new Date();
        let startDate, endDate;

        switch (filters.period) {
          case 'hari_ini':
            startDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate()
            );
            endDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              23,
              59,
              59
            );
            break;
          case 'minggu_ini':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            startDate = new Date(
              weekStart.getFullYear(),
              weekStart.getMonth(),
              weekStart.getDate()
            );
            endDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              23,
              59,
              59
            );
            break;
          case 'bulan_ini':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0,
              23,
              59,
              59
            );
            break;
          case 'tahun_ini':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
            break;
        }

        if (startDate && endDate) {
          queryParams.append(
            'startDate',
            startDate.toISOString().split('T')[0]
          );
          queryParams.append('endDate', endDate.toISOString().split('T')[0]);
        }
      }

      // Handle custom date range
      if (
        filters.date_from &&
        filters.date_to &&
        filters.date_from === filters.date_to
      ) {
        queryParams.append('startDate', `${filters.date_from} 00:00:00`);
        queryParams.append('endDate', `${filters.date_to} 23:59:59`);
      } else {
        if (filters.date_from)
          queryParams.append('startDate', `${filters.date_from} 00:00:00`);
        if (filters.date_to)
          queryParams.append('endDate', `${filters.date_to} 23:59:59`);
      }

      // Get all tickets (large per_page to get all data for statistics)
      queryParams.append('per_page', '1000');
      queryParams.append('sortBy', 'created_at');
      queryParams.append('sortOrder', 'desc');

      const queryString = queryParams.toString();
      const endpoint = `/tickets${queryString ? `?${queryString}` : ''}`;

      const result = await makeAPICall(endpoint);
      console.log('Tickets API response:', result);

      if (result.status === 'success' && result.data && result.data.tickets) {
        const tickets = result.data.tickets;

        // Calculate statistics from tickets data
        const stats = {
          total: tickets.length,
          new: tickets.filter((t) => t.status === 'open').length,
          in_progress: tickets.filter((t) => t.status === 'in_progress').length,
          closed: tickets.filter((t) => t.status === 'closed').length,
          unread: tickets.filter((t) => t.has_unread_chat).length,
        };

        // Calculate category statistics
        const categoryStats = {};
        tickets.forEach((ticket) => {
          if (ticket.category) {
            const categoryName = ticket.category.name;
            if (!categoryStats[categoryName]) {
              categoryStats[categoryName] = {
                category_id: ticket.category.id,
                category_name: categoryName,
                count: 0,
              };
            }
            categoryStats[categoryName].count++;
          }
        });

        const by_category = Object.values(categoryStats);

        // Generate trend data from tickets (group by date)
        const trendData = generateTrendDataFromTickets(tickets);

        setStatistics({
          ...stats,
          by_category,
          trend_data: trendData,
        });
      } else {
        setStatistics({
          total: 0,
          new: 0,
          in_progress: 0,
          resolved: 0,
          closed: 0,
          unread: 0,
          by_category: [],
          trend_data: [],
        });
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate trend data from tickets
  const generateTrendDataFromTickets = (tickets) => {
    const dateGroups = {};

    tickets.forEach((ticket) => {
      const date = new Date(ticket.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      });

      if (!dateGroups[date]) {
        dateGroups[date] = {
          date,
          total: 0,
          new: 0,
          in_progress: 0,
          resolved: 0,
          closed: 0,
        };
      }

      dateGroups[date].total++;

      switch (ticket.status) {
        case 'open':
          dateGroups[date].new++;
          break;
        case 'in_progress':
          dateGroups[date].in_progress++;
          break;

        case 'closed':
          dateGroups[date].closed++;
          break;
      }
    });

    // Convert to array and sort by date
    return Object.values(dateGroups)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7); // Show last 7 days
  };
  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchStatistics({ period: selectedPeriod }),
        loadCategories(),
      ]);
    };
    loadData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dateDropdown = event.target.closest('.date-picker-container');

      if (!dateDropdown && showDatePicker) {
        setShowDatePicker(false);
        setTimeout(() => setIsDatePickerVisible(false), 300);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setDateRange({ date_from: '', date_to: '' });
    fetchStatistics({ period });
  };

  // Handle custom date range
  const handleDateRangeSubmit = () => {
    if (dateRange.date_from && dateRange.date_to) {
      setSelectedPeriod('custom');
      fetchStatistics(dateRange);
    }
    setShowDatePicker(false);
  };

  // Handle reset filter
  const handleResetFilter = () => {
    setSelectedPeriod('minggu_ini');
    setDateRange({ date_from: '', date_to: '' });
    setShowDatePicker(false);
    fetchStatistics({ period: 'minggu_ini' });
  };

  // Export tickets data to CSV
  const exportToCSV = async () => {
    try {
      setLoading(true);

      // Get all tickets data for export
      const queryParams = new URLSearchParams();

      // Apply current filters
      if (selectedPeriod !== 'custom') {
        const now = new Date();
        let startDate, endDate;

        switch (selectedPeriod) {
          case 'hari_ini':
            startDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate()
            );
            endDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              23,
              59,
              59
            );
            break;
          case 'minggu_ini':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            startDate = new Date(
              weekStart.getFullYear(),
              weekStart.getMonth(),
              weekStart.getDate()
            );
            endDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              23,
              59,
              59
            );
            break;
          case 'bulan_ini':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0,
              23,
              59,
              59
            );
            break;
          case 'tahun_ini':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
            break;
        }

        if (startDate && endDate) {
          queryParams.append(
            'startDate',
            startDate.toISOString().split('T')[0]
          );
          queryParams.append('endDate', endDate.toISOString().split('T')[0]);
        }
      } else if (dateRange.date_from && dateRange.date_to) {
        if (dateRange.date_from === dateRange.date_to) {
          queryParams.append('startDate', `${dateRange.date_from} 00:00:00`);
          queryParams.append('endDate', `${dateRange.date_to} 23:59:59`);
        } else {
          queryParams.append('startDate', `${dateRange.date_from} 00:00:00`);
          queryParams.append('endDate', `${dateRange.date_to} 23:59:59`);
        }
      }

      // Get large number to include all tickets
      queryParams.append('per_page', '10000');
      queryParams.append('sortBy', 'created_at');
      queryParams.append('sortOrder', 'desc');

      const queryString = queryParams.toString();
      const endpoint = `/tickets${queryString ? `?${queryString}` : ''}`;

      const result = await makeAPICall(endpoint);

      if (result.status === 'success' && result.data && result.data.tickets) {
        const tickets = result.data.tickets;

        // Create CSV headers
        const headers = [
          'ID Tiket',
          'Judul',
          'Pengirim',
          'Email',
          'NIM',
          'Program Studi',
          'Semester',
          'No HP',
          'Kategori',
          'Sub Kategori',
          'Status',
          'Prioritas',
          'Deskripsi',
          'Tanggal Dibuat',
          'Terakhir Diupdate',
          'Anonymous',
        ];

        // Create CSV rows
        const csvRows = [headers.join(',')];

        tickets.forEach((ticket) => {
          const row = [
            ticket.id || '',
            `"${(ticket.judul || ticket.title || '').replace(/"/g, '""')}"`,
            ticket.anonymous === true || ticket.anonymous === 1
              ? 'Anonymous'
              : `"${(ticket.nama || ticket.name || '').replace(/"/g, '""')}"`,
            ticket.anonymous === true || ticket.anonymous === 1
              ? 'Anonymous'
              : `"${(ticket.email || '').replace(/"/g, '""')}"`,
            ticket.anonymous === true || ticket.anonymous === 1
              ? 'Anonymous'
              : `"${(ticket.nim || '').replace(/"/g, '""')}"`,
            ticket.anonymous === true || ticket.anonymous === 1
              ? 'Anonymous'
              : `"${(ticket.prodi || '').replace(/"/g, '""')}"`,
            ticket.anonymous === true || ticket.anonymous === 1
              ? 'Anonymous'
              : `"${(ticket.semester || '').replace(/"/g, '""')}"`,
            ticket.anonymous === true || ticket.anonymous === 1
              ? 'Anonymous'
              : `"${(ticket.no_hp || '').replace(/"/g, '""')}"`,
            `"${(ticket.category?.name || '').replace(/"/g, '""')}"`,
            `"${(ticket.sub_category?.name || '').replace(/"/g, '""')}"`,
            `"${(ticket.status || '').replace(/"/g, '""')}"`,
            `"${(ticket.priority || 'medium').replace(/"/g, '""')}"`,
            `"${(ticket.deskripsi || ticket.description || '').replace(/"/g, '""')}"`,
            `"${new Date(ticket.created_at).toLocaleString('id-ID')}"`,
            `"${new Date(ticket.updated_at || ticket.created_at).toLocaleString('id-ID')}"`,
            ticket.anonymous === true || ticket.anonymous === 1
              ? 'Ya'
              : 'Tidak',
          ];
          csvRows.push(row.join(','));
        });

        // Create and download CSV file
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], {
          type: 'text/csv;charset=utf-8;',
        });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);

        // Generate filename with current date and filter info
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        let filterStr = '';

        if (selectedPeriod !== 'custom') {
          filterStr = selectedPeriod.replace('_', '-');
        } else if (dateRange.date_from && dateRange.date_to) {
          filterStr = `${dateRange.date_from}-to-${dateRange.date_to}`;
        } else {
          filterStr = 'all-data';
        }

        link.setAttribute(
          'download',
          `ticket-statistics-${filterStr}-${dateStr}.csv`
        );
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Show success message (you can replace this with a toast notification)
        alert(
          `Data berhasil diekspor! ${tickets.length} tiket telah disimpan ke file CSV.`
        );
      } else {
        alert('Tidak ada data untuk diekspor.');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Gagal mengekspor data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Colors for charts
  const COLORS = [
    '#ef4444',
    '#f59e0b',
    '#10b981',
    '#6b7280',
    '#8b5cf6',
    '#ec4899',
  ];

  // Calculate percentages for categories
  const getCategoryPercentage = (count) => {
    const totalFromCategories =
      statistics.by_category?.reduce((sum, cat) => sum + cat.count, 0) || 0;
    if (totalFromCategories === 0) return 0;
    return Math.round((count / totalFromCategories) * 100);
  };

  // Custom tooltip for line chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Statistik Laporan</h1>
            <p className="text-white mt-1">
              Dashboard statistik dan laporan tiket
            </p>
          </div>
          <button
            onClick={exportToCSV}
            disabled={true}
            className="bg-white text-blue-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2 opacity-50 cursor-not-allowed"
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Ekspor Data</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow min-h-[600px]">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Memuat statistik...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Statistik Laporan</h1>
            <p className="text-white mt-1">
              Dashboard statistik dan laporan tiket
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow min-h-[600px]">
          <div className="p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
              <button
                onClick={() => fetchStatistics({ period: selectedPeriod })}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Statistik Laporan</h1>
          <p className="text-white mt-1">
            Dashboard statistik dan laporan tiket
          </p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={loading}
          className="bg-white text-blue-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>{loading ? 'Mengekspor...' : 'Ekspor Data'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-lg shadow min-h-[600px]">
        <Navigation topOffset="">
          <div className="flex items-center justify-between">
            {/* Left Side - Period Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Insights / Periode (
                {selectedPeriod === 'minggu_ini'
                  ? 'Minggu Ini'
                  : selectedPeriod === 'bulan_ini'
                    ? 'Bulan Ini'
                    : selectedPeriod === 'tahun_ini'
                      ? 'Tahun Ini'
                      : selectedPeriod === 'hari_ini'
                        ? 'Hari Ini'
                        : `${dateRange.date_from} - ${dateRange.date_to}`}
                )
              </h3>
            </div>

            {/* Right Side - Filters with StudentDashboard styling */}
            <div className="flex items-center space-x-3">
              {/* Date Range Picker - Updated styling */}
              <div className="relative date-picker-container">
                <button
                  onClick={() => {
                    if (showDatePicker) {
                      setShowDatePicker(false);
                      setTimeout(() => setIsDatePickerVisible(false), 300);
                    } else {
                      setIsDatePickerVisible(true);
                      setTimeout(() => setShowDatePicker(true), 10);
                    }
                  }}
                  className={`border-2 border-gray-400 text-sm px-3 py-2 shadow-gray-300 shadow-md rounded-lg flex items-center space-x-2 transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg ${
                    dateRange.date_from && dateRange.date_to
                      ? 'bg-red-200 font-semibold'
                      : 'bg-white hover:bg-red-100'
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    className="w-4 h-4"
                  >
                    <path
                      fill="currentColor"
                      d="M5.673 0a.7.7 0 0 1 .7.7v1.309h7.517v-1.3a.7.7 0 0 1 1.4 0v1.3H18a2 2 0 0 1 2 1.999v13.993A2 2 0 0 1 18 20H2a2 2 0 0 1-2-1.999V4.008a2 2 0 0 1 2-1.999h2.973V.699a.7.7 0 0 1 .7-.699M1.4 7.742v10.259a.6.6 0 0 0 .6.6h16a.6.6 0 0 0 .6-.6V7.756zm5.267 6.877v1.666H5v-1.666zm4.166 0v1.666H9.167v-1.666zm4.167 0v1.666h-1.667v-1.666zm-8.333-3.977v1.666H5v-1.666zm4.166 0v1.666H9.167v-1.666zm4.167 0v1.666h-1.667v-1.666zM4.973 3.408H2a.6.6 0 0 0-.6.6v2.335l17.2.014V4.008a.6.6 0 0 0-.6-.6h-2.71v.929a.7.7 0 0 1-1.4 0v-.929H6.373v.92a.7.7 0 0 1-1.4 0z"
                    />
                  </svg>
                  <span>
                    {dateRange.date_from && dateRange.date_to
                      ? `${dateRange.date_from} - ${dateRange.date_to}`
                      : 'Pilih Rentang'}
                  </span>
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

                {/* Date Picker Dropdown - Enhanced styling */}
                {isDatePickerVisible && (
                  <div
                    className={`absolute top-full right-0 mt-2 w-[500px] bg-white rounded-lg shadow-xl z-50 transform transition-all duration-300 ease-out origin-top-right ${
                      showDatePicker
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 -translate-y-2'
                    }`}
                  >
                    {/* Header with close button */}
                    <div className="bg-[#101B33] text-white p-4 rounded-t-lg flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <svg
                          width="21"
                          height="20"
                          viewBox="0 0 21 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0.5 18.125C0.5 19.1602 1.45982 20 2.64286 20H18.3571C19.5402 20 20.5 19.1602 20.5 18.125V7.5H0.5V18.125ZM14.7857 10.4688C14.7857 10.2109 15.0268 10 15.3214 10H17.1071C17.4018 10 17.6429 10.2109 17.6429 10.4688V12.0313C17.6429 12.2891 17.4018 12.5 17.1071 12.5H15.3214C15.0268 12.5 14.7857 12.2891 14.7857 12.0313V10.4688ZM14.7857 15.4688C14.7857 15.2109 15.0268 15 15.3214 15H17.1071C17.4018 15 17.6429 15.2109 17.6429 15.4688V17.0312C17.6429 17.2891 17.4018 17.5 17.1071 17.5H15.3214C15.0268 17.5 14.7857 17.2891 14.7857 17.0312V15.4688ZM9.07143 10.4688C9.07143 10.2109 9.3125 10 9.60714 10H11.3929C11.6875 10 11.9286 10.2109 11.9286 10.4688V12.0313C11.9286 12.2891 11.6875 12.5 11.3929 12.5H9.60714C9.3125 12.5 9.07143 12.2891 9.07143 12.0313V10.4688ZM9.07143 15.4688C9.07143 15.2109 9.3125 15 9.60714 15H11.3929C11.6875 15 11.9286 15.2109 11.9286 15.4688V17.0312C11.9286 17.2891 11.6875 17.5 11.3929 17.5H9.60714C9.3125 17.5 9.07143 17.2891 9.07143 17.0312V15.4688ZM3.35714 10.4688C3.35714 10.2109 3.59821 10 3.89286 10H5.67857C5.97321 10 6.21429 10.2109 6.21429 10.4688V12.0313C6.21429 12.2891 5.97321 12.5 5.67857 12.5H3.89286C3.59821 12.5 3.35714 12.2891 3.35714 12.0313V10.4688ZM3.35714 15.4688C3.35714 15.2109 3.59821 15 3.89286 15H5.67857C5.97321 15 6.21429 15.2109 6.21429 15.4688V17.0312C6.21429 17.2891 5.97321 17.5 5.67857 17.5H3.89286C3.59821 17.5 3.35714 17.2891 3.35714 17.0312V15.4688ZM18.3571 2.5H16.2143V0.625C16.2143 0.28125 15.8929 0 15.5 0H14.0714C13.6786 0 13.3571 0.28125 13.3571 0.625V2.5H7.64286V0.625C7.64286 0.28125 7.32143 0 6.92857 0H5.5C5.10714 0 4.78571 0.28125 4.78571 0.625V2.5H2.64286C1.45982 2.5 0.5 3.33984 0.5 4.375V6.25H20.5V4.375C20.5 3.33984 19.5402 2.5 18.3571 2.5Z"
                            fill="white"
                          />
                        </svg>
                        <div>
                          <div className="font-bold text-lg">
                            Pilih Rentang - Statistik Laporan
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowDatePicker(false);
                          setTimeout(() => setIsDatePickerVisible(false), 300);
                        }}
                        className="text-white hover:bg-white/20 rounded p-1 transition-colors"
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
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Form content */}
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">
                            Tanggal Mulai{' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              value={dateRange.date_from}
                              onChange={(e) =>
                                setDateRange((prev) => ({
                                  ...prev,
                                  date_from: e.target.value,
                                }))
                              }
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:w-6 [&::-webkit-calendar-picker-indicator]:h-6 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                            />
                            <svg
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
                              viewBox="0 0 21 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M0.5 18.125C0.5 19.1602 1.45982 20 2.64286 20H18.3571C19.5402 20 20.5 19.1602 20.5 18.125V7.5H0.5V18.125ZM14.7857 10.4688C14.7857 10.2109 15.0268 10 15.3214 10H17.1071C17.4018 10 17.6429 10.2109 17.6429 10.4688V12.0313C17.6429 12.2891 17.4018 12.5 17.1071 12.5H15.3214C15.0268 12.5 14.7857 12.2891 14.7857 12.0313V10.4688ZM14.7857 15.4688C14.7857 15.2109 15.0268 15 15.3214 15H17.1071C17.4018 15 17.6429 15.2109 17.6429 15.4688V17.0312C17.6429 17.2891 17.4018 17.5 17.1071 17.5H15.3214C15.0268 17.5 14.7857 17.2891 14.7857 17.0312V15.4688ZM9.07143 10.4688C9.07143 10.2109 9.3125 10 9.60714 10H11.3929C11.6875 10 11.9286 10.2109 11.9286 10.4688V12.0313C11.9286 12.2891 11.6875 12.5 11.3929 12.5H9.60714C9.3125 12.5 9.07143 12.2891 9.07143 12.0313V10.4688ZM9.07143 15.4688C9.07143 15.2109 9.3125 15 9.60714 15H11.3929C11.6875 15 11.9286 15.2109 11.9286 15.4688V17.0312C11.9286 17.2891 11.6875 17.5 11.3929 17.5H9.60714C9.3125 17.5 9.07143 17.2891 9.07143 17.0312V15.4688ZM3.35714 10.4688C3.35714 10.2109 3.59821 10 3.89286 10H5.67857C5.97321 10 6.21429 10.2109 6.21429 10.4688V12.0313C6.21429 12.2891 5.97321 12.5 5.67857 12.5H3.89286C3.59821 12.5 3.35714 12.2891 3.35714 12.0313V10.4688ZM3.35714 15.4688C3.35714 15.2109 3.59821 15 3.89286 15H5.67857C5.97321 15 6.21429 15.2109 6.21429 15.4688V17.0312C6.21429 17.2891 5.97321 17.5 5.67857 17.5H3.89286C3.59821 17.5 3.35714 17.2891 3.35714 17.0312V15.4688ZM18.3571 2.5H16.2143V0.625C16.2143 0.28125 15.8929 0 15.5 0H14.0714C13.6786 0 13.3571 0.28125 13.3571 0.625V2.5H7.64286V0.625C7.64286 0.28125 7.32143 0 6.92857 0H5.5C5.10714 0 4.78571 0.28125 4.78571 0.625V2.5H2.64286C1.45982 2.5 0.5 3.33984 0.5 4.375V6.25H20.5V4.375C20.5 3.33984 19.5402 2.5 18.3571 2.5Z"
                                fill="#444746"
                              />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">
                            Sampai Tanggal{' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              value={dateRange.date_to}
                              onChange={(e) =>
                                setDateRange((prev) => ({
                                  ...prev,
                                  date_to: e.target.value,
                                }))
                              }
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:w-6 [&::-webkit-calendar-picker-indicator]:h-6 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                            />
                            <svg
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
                              viewBox="0 0 21 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M0.5 18.125C0.5 19.1602 1.45982 20 2.64286 20H18.3571C19.5402 20 20.5 19.1602 20.5 18.125V7.5H0.5V18.125ZM14.7857 10.4688C14.7857 10.2109 15.0268 10 15.3214 10H17.1071C17.4018 10 17.6429 10.2109 17.6429 10.4688V12.0313C17.6429 12.2891 17.4018 12.5 17.1071 12.5H15.3214C15.0268 12.5 14.7857 12.2891 14.7857 12.0313V10.4688ZM14.7857 15.4688C14.7857 15.2109 15.0268 15 15.3214 15H17.1071C17.4018 15 17.6429 15.2109 17.6429 15.4688V17.0312C17.6429 17.2891 17.4018 17.5 17.1071 17.5H15.3214C15.0268 17.5 14.7857 17.2891 14.7857 17.0312V15.4688ZM9.07143 10.4688C9.07143 10.2109 9.3125 10 9.60714 10H11.3929C11.6875 10 11.9286 10.2109 11.9286 10.4688V12.0313C11.9286 12.2891 11.6875 12.5 11.3929 12.5H9.60714C9.3125 12.5 9.07143 12.2891 9.07143 12.0313V10.4688ZM9.07143 15.4688C9.07143 15.2109 9.3125 15 9.60714 15H11.3929C11.6875 15 11.9286 15.2109 11.9286 15.4688V17.0312C11.9286 17.2891 11.6875 17.5 11.3929 17.5H9.60714C9.3125 17.5 9.07143 17.2891 9.07143 17.0312V15.4688ZM3.35714 10.4688C3.35714 10.2109 3.59821 10 3.89286 10H5.67857C5.97321 10 6.21429 10.2109 6.21429 10.4688V12.0313C6.21429 12.2891 5.97321 12.5 5.67857 12.5H3.89286C3.59821 12.5 3.35714 12.2891 3.35714 12.0313V10.4688ZM3.35714 15.4688C3.35714 15.2109 3.59821 15 3.89286 15H5.67857C5.97321 15 6.21429 15.2109 6.21429 15.4688V17.0312C6.21429 17.2891 5.97321 17.5 5.67857 17.5H3.89286C3.59821 17.5 3.35714 17.2891 3.35714 17.0312V15.4688ZM18.3571 2.5H16.2143V0.625C16.2143 0.28125 15.8929 0 15.5 0H14.0714C13.6786 0 13.3571 0.28125 13.3571 0.625V2.5H7.64286V0.625C7.64286 0.28125 7.32143 0 6.92857 0H5.5C5.10714 0 4.78571 0.28125 4.78571 0.625V2.5H2.64286C1.45982 2.5 0.5 3.33984 0.5 4.375V6.25H20.5V4.375C20.5 3.33984 19.5402 2.5 18.3571 2.5Z"
                                fill="#444746"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => {
                              setDateRange({
                                date_from: '',
                                date_to: '',
                              });
                            }}
                            className="border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center space-x-2"
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            <span>Clear</span>
                          </button>
                          <button
                            onClick={handleDateRangeSubmit}
                            className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                          >
                            Terapkan
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reset Filter Button - Updated styling */}
              <button
                className="border-2 border-gray-400 text-sm px-3 py-2 shadow-gray-300 shadow-md rounded-lg flex items-center space-x-2 hover:bg-red-100 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out transform"
                onClick={handleResetFilter}
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

        {/* Charts Section */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Line Chart - Status */}
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-4">Status</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={statistics.trend_data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      domain={[0, 'dataMax + 2']}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    <Line
                      type="monotone"
                      dataKey="new"
                      stroke="#6b7280"
                      strokeWidth={2}
                      dot={{ fill: '#6b7280', strokeWidth: 2, r: 3 }}
                      name="Baru (Open)"
                    />
                    <Line
                      type="monotone"
                      dataKey="in_progress"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                      name="Sedang Diproses"
                    />
                    <Line
                      type="monotone"
                      dataKey="closed"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                      name="Resolved"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart - Kategori */}
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-4">
                Kategori
              </h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={
                        statistics.by_category &&
                        statistics.by_category.length > 0
                          ? statistics.by_category.map((stat, index) => ({
                              name: stat.category_name,
                              value: stat.count,
                              color: COLORS[index % COLORS.length],
                            }))
                          : []
                      }
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statistics.by_category &&
                        statistics.by_category.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [value, name]}
                      labelStyle={{ color: '#374151' }}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Summary Statistics Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Summary */}
            <div className="space-y-4">
              {[
                {
                  icon: '📧',
                  label: 'Semua',
                  value: statistics.total,
                  color: 'text-red-600',
                },
                {
                  icon: '🆕',
                  label: 'Tiket Baru',
                  value: statistics.new,
                  color: 'text-blue-600',
                },
                {
                  icon: '⏳',
                  label: 'Sedang Diproses',
                  value: statistics.in_progress,
                  color: 'text-yellow-600',
                },
                {
                  icon: '✅',
                  label: 'Selesai',
                  value: statistics.closed,
                  color: 'text-purple-600',
                },

                {
                  icon: '📊',
                  label: 'Persentase Selesai',
                  value:
                    statistics.total > 0
                      ? `${Math.round((statistics.closed / statistics.total) * 100)}%`
                      : '0%',
                  color: 'text-green-600',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium text-gray-700">
                      {item.label}
                    </span>
                  </div>
                  <span className={`font-bold text-lg ${item.color}`}>
                    {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Category Summary - Using 100% real API data, no dummy */}
            <div className="space-y-4">
              {statistics.by_category && statistics.by_category.length > 0 ? (
                statistics.by_category.map((stat, index) => {
                  const percentage = getCategoryPercentage(stat.count);

                  return (
                    <div key={stat.category_id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">
                          {stat.category_name}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            {percentage}% dari total
                          </span>
                          <span className="font-bold text-gray-900">
                            {stat.count}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>Tidak ada data kategori dari API</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTicketStatistics;
