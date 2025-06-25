import React, { useState } from "react";

const AdminAskedUs = () => {
  const [faqData, setFaqData] = useState([
    {
      id: 1,
      question: "Bagaimana cara mengajukan SK TA/Thesis/Disertasi?",
      isChecked: false,
    },
    {
      id: 2,
      question: "Bisakah saya mengganti dosen pembimbing setelah SK terbit?",
      isChecked: false,
    },
    {
      id: 3,
      question: "Apakah saya bisa mulai bimbingan sebelum SK terbit?",
      isChecked: false,
    },
    {
      id: 4,
      question: "Body Large - Roboto 16/24 - +0.5",
      isChecked: false,
    },
    {
      id: 5,
      question: "Body Large - Roboto 16/24 - +0.5",
      isChecked: false,
    },
  ]);

  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [selectAll, setSelectAll] = useState(false);

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

  // Handle edit action
  const handleEdit = (id) => {
    console.log(`Edit FAQ with id: ${id}`);
    // Add edit functionality here
  };

  // Handle add new FAQ
  const handleAddFAQ = () => {
    console.log("Add new FAQ");
    // Add new FAQ functionality here
  };

  // Handle reset filter
  const handleResetFilter = () => {
    setStatusFilter("Semua Status");
    setSelectAll(false);
    setFaqData((prev) => prev.map((item) => ({ ...item, isChecked: false })));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage AskedUs</h1>

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
                <option>Published</option>
                <option>Draft</option>
                <option>Archived</option>
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

      {/* FAQ List */}
      <div className="bg-white rounded-lg shadow-sm">
        {faqData.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-4 ${
              index !== faqData.length - 1 ? "border-b border-gray-200" : ""
            } hover:bg-gray-50 transition-colors`}
          >
            {/* Left side - Checkbox and Question */}
            <div className="flex items-center flex-1">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.isChecked}
                  onChange={() => handleCheckboxChange(item.id)}
                  className="form-checkbox h-4 w-4 text-red-600 rounded border-gray-300"
                />
                <span className="ml-4 text-gray-800 font-medium">
                  {item.question}
                </span>
              </label>
            </div>

            {/* Right side - Edit Button */}
            <button
              onClick={() => handleEdit(item.id)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Edit FAQ"
            >
              <svg className="w-5 h-5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Actions (Optional) */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {faqData.filter((item) => item.isChecked).length} dari{" "}
          {faqData.length} item dipilih
        </div>

        {faqData.some((item) => item.isChecked) && (
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors">
              Hapus Terpilih
            </button>
            <button className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
              Arsipkan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAskedUs;
