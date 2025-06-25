import React, { useState } from "react";

const ManageUsers = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      username: "Muhammad Burhan",
      email: "muhammadburhan@student.telkomuniversity.ac.id",
      role: "Student",
      registered: "19 Mei 2025",
      avatar: "/api/placeholder/40/40",
      isChecked: false,
    },
    {
      id: 2,
      username: "Admin LAAK FIF",
      email: "Lorem ipsum dolor amet consectetur@admin.telkom...",
      role: "Admin",
      registered: "19 Mei 2025",
      avatar: "/api/placeholder/40/40",
      isChecked: false,
    },
  ]);

  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [selectAll, setSelectAll] = useState(false);

  // Summary data
  const summaryData = {
    totalUsers: 30,
    admins: 3,
    students: 25,
  };

  // Handle individual checkbox
  const handleCheckboxChange = (id) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, isChecked: !user.isChecked } : user
      )
    );
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
    setSelectAll(false);
    setUsers((prev) => prev.map((user) => ({ ...user, isChecked: false })));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                Semua User
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {summaryData.totalUsers}
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
                {summaryData.admins}
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
                {summaryData.students}
              </div>
            </div>
          </div>
        </div>
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
                <option>Pending</option>
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
            <div className="col-span-3">Username</div>
            <div className="col-span-4">Email Address</div>
            <div className="col-span-1">Role</div>
            <div className="col-span-2">Registered</div>
            <div className="col-span-1">History</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {users.map((user) => (
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

                {/* Username with Avatar */}
                <div className="col-span-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 mr-3">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div className="w-10 h-10 bg-gray-300 rounded-full hidden items-center justify-center">
                        <span className="text-gray-600 text-sm font-medium">
                          {user.username.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {user.username}
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div className="col-span-4">
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>

                {/* Role */}
                <div className="col-span-1">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === "Admin"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
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
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      {users.some((user) => user.isChecked) && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {users.filter((user) => user.isChecked).length} dari {users.length}{" "}
            user dipilih
          </div>

          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors">
              Hapus Terpilih
            </button>
            <button className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
              Export Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
