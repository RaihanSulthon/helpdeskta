import React, { useState, useEffect } from "react";
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
} from "recharts";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("minggu_ini");
  const [dateRange, setDateRange] = useState({
    date_from: "",
    date_to: "",
  });

  // API base URL and helper function
  const BASE_URL = "https://apibackendtio.mynextskill.com/api";

  const makeAPICall = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token tidak ditemukan. Silakan login ulang.");
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      mode: "cors",
      credentials: "omit",
      ...options,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn("Could not parse error response:", parseError);
      }
      throw new Error(errorMessage);
    }

    return response.json();
  };

  // Fetch statistics
  const fetchStatistics = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (filters.date_from) queryParams.append("date_from", filters.date_from);
      if (filters.date_to) queryParams.append("date_to", filters.date_to);
      if (filters.period) queryParams.append("period", filters.period);

      const queryString = queryParams.toString();
      const endpoint = `/tickets/statistics${
        queryString ? `?${queryString}` : ""
      }`;

      const result = await makeAPICall(endpoint);

      if (result.status === "success" && result.data) {
        // Add mock trend data if not provided by API
        const trendData = result.data.trend_data || [
          {
            date: "5 Mei",
            total: 5,
            new: 1,
            in_progress: 2,
            resolved: 1,
            closed: 1,
          },
          {
            date: "6 Mei",
            total: 6,
            new: 1,
            in_progress: 2,
            resolved: 2,
            closed: 1,
          },
          {
            date: "7 Mei",
            total: 7,
            new: 2,
            in_progress: 2,
            resolved: 2,
            closed: 1,
          },
          {
            date: "8 Mei",
            total: 6,
            new: 2,
            in_progress: 1,
            resolved: 2,
            closed: 1,
          },
          {
            date: "9 Mei",
            total: 6,
            new: 1,
            in_progress: 2,
            resolved: 2,
            closed: 1,
          },
          {
            date: "10 Mei",
            total: 7,
            new: 2,
            in_progress: 2,
            resolved: 2,
            closed: 1,
          },
          {
            date: "11 Mei",
            total: 5,
            new: 2,
            in_progress: 1,
            resolved: 1,
            closed: 1,
          },
          {
            date: "12 Mei",
            total: 4,
            new: 1,
            in_progress: 1,
            resolved: 1,
            closed: 1,
          },
        ];

        setStatistics({
          ...result.data,
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
      console.error("Error fetching statistics:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchStatistics({ period: selectedPeriod });
  }, []);

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setDateRange({ date_from: "", date_to: "" });
    fetchStatistics({ period });
  };

  // Handle custom date range
  const handleDateRangeSubmit = () => {
    if (dateRange.date_from && dateRange.date_to) {
      setSelectedPeriod("custom");
      fetchStatistics(dateRange);
    }
  };

  // Colors for charts
  const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#6b7280", "#8b5cf6"];

  // Calculate percentages for categories
  const getCategoryPercentage = (count) => {
    if (statistics.total === 0) return 0;
    return Math.round((count / statistics.total) * 100);
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
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      total: "bg-blue-500",
      new: "bg-red-500",
      in_progress: "bg-yellow-500",
      resolved: "bg-green-500",
      closed: "bg-gray-500",
      unread: "bg-purple-500",
    };
    return colors[status] || "bg-gray-500";
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "total":
        return (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      case "new":
        return (
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        );
      case "in_progress":
        return (
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "resolved":
        return (
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "closed":
        return (
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
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "unread":
        return (
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading statistics...</div>
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
            onClick={() => fetchStatistics({ period: selectedPeriod })}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Statistik Tiket</h1>
        <p className="text-sm text-gray-600 mt-1">
          Dashboard statistik dan laporan tiket
        </p>
      </div>

      {/* Period Filter */}
      <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Periode:</span>
            <div className="flex gap-2">
              {[
                { value: "hari_ini", label: "Hari Ini" },
                { value: "minggu_ini", label: "Minggu Ini" },
                { value: "bulan_ini", label: "Bulan Ini" },
                { value: "tahun_ini", label: "Tahun Ini" },
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => handlePeriodChange(period.value)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    selectedPeriod === period.value
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.date_from}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, date_from: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Dari"
            />
            <span className="text-gray-500">-</span>
            <input
              type="date"
              value={dateRange.date_to}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, date_to: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Sampai"
            />
            <button
              onClick={handleDateRangeSubmit}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              Filter
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchStatistics({ period: selectedPeriod })}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
        {[
          { key: "total", label: "Semua", value: statistics.total },
          { key: "new", label: "Tiket Baru", value: statistics.new },
          {
            key: "in_progress",
            label: "Sedang Diproses",
            value: statistics.in_progress,
          },
          { key: "resolved", label: "Selesai", value: statistics.resolved },
          { key: "closed", label: "Ditutup", value: statistics.closed },
          { key: "unread", label: "Belum Dibaca", value: statistics.unread },
        ].map((stat) => (
          <div key={stat.key} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getStatusColor(
                    stat.key
                  )}`}
                >
                  {getStatusIcon(stat.key)}
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">
                  {stat.label}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Insights / Periode (
            {selectedPeriod === "minggu_ini"
              ? "Minggu Ini"
              : selectedPeriod === "bulan_ini"
              ? "Bulan Ini"
              : selectedPeriod === "tahun_ini"
              ? "Tahun Ini"
              : selectedPeriod === "hari_ini"
              ? "Hari Ini"
              : "Custom"}
            )
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    domain={[0, "dataMax + 2"]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#10b981" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="new"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: "#f59e0b", strokeWidth: 2, r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="in_progress"
                    stroke="#6b7280"
                    strokeWidth={2}
                    dot={{ fill: "#6b7280", strokeWidth: 2, r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="closed"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444", strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart - Kategori */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-4">Kategori</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statistics.by_category.map((cat, index) => ({
                      name: cat.category_name,
                      value: cat.count,
                      color: COLORS[index % COLORS.length],
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statistics.by_category.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    labelStyle={{ color: "#374151" }}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-4">
            {[
              {
                icon: "📧",
                label: "Semua",
                value: statistics.total,
                color: "text-red-600",
              },
              {
                icon: "🆕",
                label: "Tiket Baru",
                value: statistics.new,
                color: "text-blue-600",
              },
              {
                icon: "⏳",
                label: "Sedang Diproses",
                value: statistics.in_progress,
                color: "text-yellow-600",
              },
              {
                icon: "✅",
                label: "Selesai",
                value: statistics.resolved,
                color: "text-green-600",
              },
              //   {
              //     icon: "📊",
              //     label: "Persentase",
              //     value: "XXX%",
              //     color: "text-red-600",
              //   },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium text-gray-700">
                    {item.label}
                  </span>
                </div>
                <span className={`font-bold text-lg ${item.color}`}>
                  {typeof item.value === "number"
                    ? item.value.toLocaleString()
                    : item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-4">
            {statistics.by_category.map((category, index) => (
              <div key={category.category_id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">
                    {category.category_name}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-600">
                      {getCategoryPercentage(category.count)}
                    </span>
                    <span className="font-bold text-gray-900">
                      {category.count > 1000 ? "xxxx" : category.count}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className="bg-green-500 h-1 rounded-full transition-all duration-300"
                    style={{
                      width: `${getCategoryPercentage(category.count)}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}

            {/* Add some mock categories to match the image */}
            {/* {statistics.by_category.length < 3 && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Keuangan</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600">
                        33% selesai (1 dari 3)
                      </span>
                      <span className="font-bold text-gray-900">3</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-green-500 h-1 rounded-full w-1/3"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Fasilitas</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600">
                        33% selesai (1 dari 3)
                      </span>
                      <span className="font-bold text-gray-900">xxxx</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-green-500 h-1 rounded-full w-1/3"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">UKM</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600">
                        33% selesai (1 dari 3)
                      </span>
                      <span className="font-bold text-gray-900">xxxx</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-green-500 h-1 rounded-full w-1/3"></div>
                  </div>
                </div>
              </>
            )} */}
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">
              Response Rate
            </div>
            <div className="text-xl font-bold text-blue-800">
              {statistics.total > 0
                ? (
                    ((statistics.in_progress +
                      statistics.resolved +
                      statistics.closed) /
                      statistics.total) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 font-medium">
              Resolution Rate
            </div>
            <div className="text-xl font-bold text-green-800">
              {statistics.total > 0
                ? ((statistics.resolved / statistics.total) * 100).toFixed(1)
                : 0}
              %
            </div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="text-sm text-yellow-600 font-medium">
              Pending Tickets
            </div>
            <div className="text-xl font-bold text-yellow-800">
              {(statistics.new + statistics.in_progress).toLocaleString()}
            </div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="text-sm text-red-600 font-medium">
              Unread Tickets
            </div>
            <div className="text-xl font-bold text-red-800">
              {statistics.unread.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTicketStatistics;
