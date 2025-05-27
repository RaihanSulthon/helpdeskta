// src/pages/ManagementTiket.jsx
import React, { useState, useEffect } from "react";
import TiketBoard from "../components/TiketBoard";

/**
 * Management Tiket page component
 * Uses TiketBoard from components folder (not student)
 */
const ManagementTiket = () => {
  const [activePage, setActivePage] = useState("inbox");
  const username = localStorage.getItem("username") || "Pengguna";

  // Handler untuk menu yang diklik dari sidebar
  const handleMenuClick = (menuId) => {
    console.log("Menu diklik:", menuId);

    // Jika yang diklik adalah tombol "tulis", tampilkan modal form
    if (menuId === "tulis") {
      // TODO: Implement form modal display
      return;
    }

    // Update halaman aktif
    setActivePage(menuId);
  };

  // Effect untuk monitor sidebar menu clicks
  useEffect(() => {
    // Communicate with Sidebar component
    // For now, we'll need to listen to Sidebar events through a custom event
    const handleSidebarEvent = (event) => {
      if (event.detail && event.detail.menuId) {
        handleMenuClick(event.detail.menuId);
      }
    };

    // Add event listener
    window.addEventListener("sidebarMenuClick", handleSidebarEvent);

    // Clean up
    return () => {
      window.removeEventListener("sidebarMenuClick", handleSidebarEvent);
    };
  }, []);

  return (
    <div className="p-4 bg-gray-900 min-h-screen">
      {/* Header untuk halaman */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Management Tiket</h1>
        <div className="text-white text-sm">Hello, {username}</div>
      </div>

      {/* Render TiketBoard dengan activePage */}
      <TiketBoard activePage={activePage} />
    </div>
  );
};

export default ManagementTiket;
