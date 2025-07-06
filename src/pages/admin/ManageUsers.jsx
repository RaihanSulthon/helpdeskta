import React, { useState, useEffect } from "react";
import SearchBar from "../../components/SearchBar";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [roleFilter, setRoleFilter] = useState("Semua Role");
  const [selectAll, setSelectAll] = useState(false);
  const [statistics, setStatistics] = useState({
    total_users: 0,
    admin_users: 0,
    student_users: 0,
    disposisi_users: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  // API base URL
  const BASE_URL = "https://apibackendtio.mynextskill.com/api";

  // Helper function for API calls
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
  const fetchStatistics = async () => {
    try {
      const result = await makeAPICall("/users/statistics");
      if (result.status === "success") {
        setStatistics(result.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await makeAPICall("/users");

      if (result.status === "success") {
        const usersWithCheckbox = result.data.map((user) => ({
          ...user,
          isChecked: false,
          // Format created_at for display
          registered: new Date(user.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          // Create avatar URL or placeholder
          avatar: `/api/placeholder/40/40`,
        }));

        setUsers(usersWithCheckbox);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchStatistics();
    fetchUsers();
  }, []);

  useEffect(() => {
    loadUsers();
    loadUserStatistics();
  }, []);
  
  // Update filteredUsers when users change
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  // Filter users based on status and role
  // const filteredUsers = filteredUsers.filter((user) => {
  //   const statusMatch =
  //     statusFilter === "Semua Status" ||
  //     (statusFilter === "Active" && user.email_verified_at) ||
  //     (statusFilter === "Inactive" && !user.email_verified_at);

  //   const roleMatch =
  //     roleFilter === "Semua Role" ||
  //     user.role.toLowerCase() === roleFilter.toLowerCase();

  //   return statusMatch && roleMatch;
  // });

  // Handle individual checkbox
  const handleCheckboxChange = (id) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, isChecked: !user.isChecked } : user
      )
    );
  };

  // Add this new function after loadUserStatistics
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = filteredUsers.filter(user => {
      const searchLower = query.toLowerCase();
      return (
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.nim?.toLowerCase().includes(searchLower) ||
        user.prodi?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredUsers(filtered);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredUsers(users);
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setUsers((prev) =>
      prev.map((user) => ({ ...user, isChecked: newSelectAll }))
    );
  };

  // Handle view action
  const handleView = (id) => {
    console.log(`View user with id: ${id}`);
    // Add view functionality here
  };

  // Handle reset filter
  const handleResetFilter = () => {
    setStatusFilter("Semua Status");
    setRoleFilter("Semua Role");
    setSelectAll(false);
    setUsers((prev) => prev.map((user) => ({ ...user, isChecked: false })));
  };

  // Handle delete selected users
  const handleDeleteSelected = () => {
    const selectedUsers = filteredUsers.filter((user) => user.isChecked);
    if (selectedUsers.length === 0) return;

    if (
      confirm(
        `Apakah Anda yakin ingin menghapus ${selectedUsers.length} user yang dipilih?`
      )
    ) {
      // TODO: Implement delete API call
      console.log(
        "Delete users:",
        selectedUsers.map((u) => u.id)
      );
    }
  };

  // Handle export data
  const handleExportData = () => {
    const selectedUsers = filteredUsers.filter((user) => user.isChecked);
    const dataToExport = selectedUsers.length > 0 ? selectedUsers : users;

    // Simple CSV export
    const csvContent = [
      [
        "Name",
        "Email",
        "Role",
        "Registered",
        "Total Tickets",
        "Open Tickets",
        "Closed Tickets",
      ],
      ...dataToExport.map((user) => [
        user.name,
        user.email,
        user.role,
        user.registered,
        user.tickets_statistics?.total || 0,
        user.tickets_statistics?.open || 0,
        user.tickets_statistics?.closed || 0,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users_data.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading...</div>
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
        <p className="text-sm text-gray-600 mt-1">Kelola pengguna sistem</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Total Users Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">
                Total Users
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {statistics.total_users}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Admin</div>
              <div className="text-2xl font-bold text-gray-900">
                {statistics.admin_users}
              </div>
            </div>
          </div>
        </div>

        {/* Student Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Student</div>
              <div className="text-2xl font-bold text-gray-900">
                {statistics.student_users}
              </div>
            </div>
          </div>
        </div>

        {/* Disposisi Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Disposisi</div>
              <div className="text-2xl font-bold text-gray-900">
                {statistics.disposisi_users}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <SearchBar
          placeholder="Cari nama, email, NIM, atau prodi mahasiswa..."
          onSearch={handleSearch}
          onClear={handleClearSearch}
          className="max-w-md"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
        <div className="flex justify-between items-center">
          {/* Left side - Select All Checkbox */}
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="form-checkbox h-4 w-4 text-red-600 rounded border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-600">Select All</span>
            </label>
          </div>

          {/* Right side - Filters */}
          <div className="flex items-center space-x-4">
            {/* Role Filter Dropdown */}
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option>Semua Role</option>
                <option>admin</option>
                <option>student</option>
                <option>disposisi</option>
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

            {/* Status Filter Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option>Semua Status</option>
                <option>Active</option>
                <option>Inactive</option>
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

            {/* Reset Filter Button */}
            <button
              onClick={handleResetFilter}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Reset Filter
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchUsers}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="form-checkbox h-4 w-4 text-red-600 rounded border-gray-300"
              />
            </div>
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Email Address</div>
            <div className="col-span-1">Role</div>
            <div className="col-span-2">Registered</div>
            <div className="col-span-1">Tickets</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {filteredUsers.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Tidak ada data user yang ditemukan
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Checkbox */}
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      checked={user.isChecked}
                      onChange={() => handleCheckboxChange(user.id)}
                      className="form-checkbox h-4 w-4 text-red-600 rounded border-gray-300"
                    />
                  </div>

                  {/* Name with Avatar */}
                  <div className="col-span-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 mr-3 flex items-center justify-center">
                        <span className="text-gray-600 text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {user.name}
                      </span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="col-span-3">
                    <span className="text-sm text-gray-600">{user.email}</span>
                    {user.email_verified_at && (
                      <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Role */}
                  <div className="col-span-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-800"
                          : user.role === "student"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>

                  {/* Registered */}
                  <div className="col-span-2">
                    <span className="text-sm text-gray-600">
                      {user.registered}
                    </span>
                  </div>

                  {/* Tickets Statistics */}
                  <div className="col-span-1">
                    <div className="text-xs text-gray-600">
                      <div>Total: {user.tickets_statistics?.total || 0}</div>
                      <div className="text-green-600">
                        Closed: {user.tickets_statistics?.closed || 0}
                      </div>
                      <div className="text-yellow-600">
                        Open: {user.tickets_statistics?.open || 0}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1">
                    <button
                      onClick={() => handleView(user.id)}
                      className="bg-green-100 text-green-800 px-3 py-1 text-xs font-medium rounded-full hover:bg-green-200 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      {users.some((user) => user.isChecked) && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {filteredUsers.filter((user) => user.isChecked).length} dari {users.length}{" "}
            user dipilih
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleDeleteSelected}
              className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Hapus Terpilih
            </button>
            <button
              onClick={handleExportData}
              className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Export Data
            </button>
          </div>
        </div>
      )}

      {/* Display filtered count */}
      <div className="mt-4 text-sm text-gray-500 text-center">
        Menampilkan {filteredUsers.length} dari {users.length} users
        {(statusFilter !== "Semua Status" || roleFilter !== "Semua Role") &&
          " (filtered)"}
      </div>
    </div>
  );
};

export default ManageUsers;
