import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Komponen Button sederhana
function Button({ children, className = "", onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg font-semibold transition duration-300 ${className}`}
    >
      {children}
    </button>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState("");

  // Check login status on component mount
  useEffect(() => {
    const loginStatus =
      sessionStorage.getItem("isLoggedIn") || localStorage.getItem("userRole");
    const storedUserType =
      sessionStorage.getItem("userType") || localStorage.getItem("userRole");

    if (loginStatus === "true" || loginStatus) {
      setIsLoggedIn(true);
      setUserType(storedUserType || "student");
    }
  }, []);

  const handleLogout = () => {
    // Clear all login data
    sessionStorage.clear();
    localStorage.clear();
    setIsLoggedIn(false);
    setUserType("");
    // Reload page to reset state
    window.location.reload();
  };
  const handleDashboardClick = () => {
    const userRole = localStorage.getItem("userRole") || userType;

    switch (userRole) {
      case "admin":
        navigate("/admin/tickets");
        break;
      case "student":
        navigate("/student/tickets");
        break;
      // fallback to student
    }
  };
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const contacts = [
    {
      id: 1,
      name: "Dr. ARFIVE GANDHI, S.T., M.T.I.",
      department:
        "Keamanan Informasi, Auditor Sistem Informasi, Penelitian Kualitatif",
      email: "arfivegandhi@telkomuniversity.ac.id",
      imageSrc: "/api/placeholder/80/80",
    },
    {
      id: 2,
      name: "ARIO HARRY PRAYOGO, S.Kom., M.Kom.",
      department: "Software Engineering",
      email: "ariohp@telkomuniversity.ac.id",
      imageSrc: "/api/placeholder/80/80",
    },
    {
      id: 3,
      name: "AAZ MUHAMMAD HAFIDZ AZIS, S.T.,M.T.",
      department: "Data Science, Artificial Intelligence, Speech Processing",
      email: "aazmuhammad@telkomuniversity.ac.id",
      imageSrc: "/api/placeholder/80/80",
    },
    {
      id: 4,
      name: "DANA SULISTYO KUSUMO, S.T., M.T., Ph.D.",
      department:
        "Software Engineering, Process-Aware Information Systems, Human Computer Interaction",
      email: "danakusumo@telkomuniversity.ac.id",
      imageSrc: "/api/placeholder/80/80",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Updated to red navbar style */}
      <header className="bg-red-600 shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Left section - Logo/Brand */}
          <div className="flex items-center">
            <div className="bg-white rounded-lg px-4 py-2">
              <div className="text-red-600 font-bold text-lg">HELPDESK</div>
            </div>
          </div>

          {/* Center section - Navigation Menu */}
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => scrollToSection("about-section")}
              className="text-white hover:text-gray-200 font-medium"
            >
              AboutUs
            </button>
            <button
              onClick={() => scrollToSection("asked-section")}
              className="text-white hover:text-gray-200 font-medium"
            >
              AskedUs
            </button>
            <a href="#" className="text-white hover:text-gray-200 font-medium">
              ReachUs
            </a>
          </nav>

          {/* Right section - Login/User Menu */}
          {!isLoggedIn ? (
            <div className="flex space-x-4">
              <Button
                className="bg-white text-red-600 hover:bg-gray-100 px-6 py-2 font-medium"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-4 text-sm font-medium text-blue-700">
                <Button
                  className="px-4 py-2 bg-blue-100 rounded hover:bg-blue-200"
                  onClick={handleDashboardClick}
                >
                  Dashboard
                </Button>
              </nav>
              <div className="text-white text-sm">
                Welcome,{" "}
                <span className="font-medium capitalize">{userType}</span>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">U</span>
              </div>
              <Button
                className="bg-white text-red-600 hover:bg-gray-100 px-4 py-2 font-medium"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* About Section - Hero */}
      <div
        id="about-section"
        className="relative w-full py-16 md:py-24 bg-red-600 text-white pt-20"
      >
        <div className="container mx-auto px-4 flex items-center">
          {/* Left Content */}
          <div className="w-full md:w-1/2 pr-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Selamat Datang to Tell-Us
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold mb-6">
              Sistem Helpdesk Terintegrasi untuk Sivitas Akademika Telkom
              University
            </h2>
            <p className="text-lg opacity-90 mb-8 leading-relaxed">
              Tell-Us adalah platform komprehensif yang dirancang untuk
              mempermudah mahasiswa dan dosen Telkom University dalam
              menyampaikan pertanyaan, laporan, maupun permintaan bantuan
              terkait layanan akademik dan non-akademik.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 text-lg font-medium">
                Get Started
              </Button>
              <Button className="border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-3 text-lg font-medium">
                Learn More
              </Button>
            </div>
          </div>

          {/* Right Content - Placeholder */}
          <div className="hidden md:block w-1/2">
            <div className="bg-white bg-opacity-10 rounded-lg p-8 h-80">
              {/* Placeholder for image or illustration */}
              <div className="w-full h-full bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">Image Placeholder</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TellUs, AskedUs, ReachUs Cards Section */}
      <div className="bg-red-600 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TellUs Card */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-gray-100 rounded-full p-3 mr-3">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">TellUs</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Di halaman TellUs, kamu bisa mengisi formulir pengaduan untuk
                memulai percakapan dengan tim kami. Kami siap mendengar dan
                memindahlanjuti setiap pesan yang kamu kirimkan.
              </p>
            </div>

            {/* AskedUs Card */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-gray-100 rounded-full p-3 mr-3">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 9l3 3-3 3m13 0h-6"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">AskedUs</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Sebelum menghubungi kami, coba cari solusi lebih cepat di
                halaman AskedUs. Semua informasi penting dan FAQ (Frequently
                Asked Questions) telah kami rangkum untuk membantumu secara
                instan.
              </p>
            </div>

            {/* ReachUs Card */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-gray-100 rounded-full p-3 mr-3">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">ReachUs</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Butuh bantuan cepat? Gunakan ReachUs untuk terhubung dengan
                petugas kami secara real-time. Kami hadir untuk meresponsmu
                dengan cepat dan ramah melalui chat.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Asked Us Section */}
      <div id="asked-section" className="bg-red-600 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Asked Us
            </h2>
            <p className="text-white text-lg opacity-90">
              Lihat pertanyaan yang sering diajukan kepada kami.
            </p>
          </div>

          {/* FAQ Items */}
          <div className="bg-white rounded-lg p-6 max-w-4xl mx-auto">
            <div className="space-y-4">
              {/* FAQ Item 1 */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-3 rounded">
                  <h3 className="text-lg font-medium text-gray-800">
                    Bagaimana cara mengajukan SK TA/Thesis/Disertasi?
                  </h3>
                  <svg
                    className="w-5 h-5 text-gray-500"
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

              {/* FAQ Item 2 */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-3 rounded">
                  <h3 className="text-lg font-medium text-gray-800">
                    Bisakah saya mengganti dosen pembimbing setelah SK terbit?
                  </h3>
                  <svg
                    className="w-5 h-5 text-gray-500"
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

              {/* FAQ Item 3 */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-3 rounded">
                  <h3 className="text-lg font-medium text-gray-800">
                    Apakah saya bisa mulai bimbingan sebelum SK terbit?
                  </h3>
                  <svg
                    className="w-5 h-5 text-gray-500"
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
            </div>
          </div>
        </div>
      </div>

      {/* Contact List */}
      {/* Reach Us Section */}
      {/* Reach Us Section */}
      <div id="reach-us-section" className="bg-red-600 py-16">
        <div className="container mx-auto px-4">
          {/* Section Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Reach Us
            </h2>
            <p className="text-white text-lg opacity-90">
              Lihat Contact Person Layanan yang kami sediakan.
            </p>
          </div>

          {/* White Container */}
          <div className="bg-white rounded-2xl p-8 max-w-6xl mx-auto">
            {/* Category Tabs */}

            {/* Contact Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Contact Card 1 */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 flex items-start space-x-4">
                <div className="w-20 h-20 bg-red-500 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">
                    Dr. ARFIVE GANDHI, S.T., M.T.I.
                  </h3>
                  <div className="text-sm text-gray-600 mb-2">
                    Bidang Keahlian
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-pink-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                      Keamanan Informasi, Auditor Sistem Informasi, Penelitian
                      Kualitatif Keamanan Informasi
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      arfivegandhi@telkomuniversity.ac.id
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      TULT Lt 5
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Card 2 */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 flex items-start space-x-4">
                <div className="w-20 h-20 bg-red-500 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">
                    MAHENDRA DWIFEBRI PURBOLAKSONO, S.Kom., M.Kom.
                  </h3>
                  <div className="text-sm text-gray-600 mb-2">
                    Bidang Keahlian
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-pink-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                      Data Mining / Text Mining, Auditor Sistem Informasi
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      mahendradp@telkomuniversity.ac.id
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      TULT Lt 5
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Card 3 - Blurred */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 flex items-start space-x-4 opacity-30 blur-sm">
                <div className="w-20 h-20 bg-red-500 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">
                    Dr. NAMA DOSEN, S.T., M.T.
                  </h3>
                  <div className="text-sm text-gray-600 mb-2">
                    Bidang Keahlian
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-pink-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                      Bidang Keahlian Dosen
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      email@telkomuniversity.ac.id
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      TULT Lt 5
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Card 4 - Blurred */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 flex items-start space-x-4 opacity-30 blur-sm">
                <div className="w-20 h-20 bg-red-500 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">
                    Dr. NAMA DOSEN, S.T., M.T.
                  </h3>
                  <div className="text-sm text-gray-600 mb-2">
                    Bidang Keahlian
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-pink-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                      Bidang Keahlian Dosen
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      email@telkomuniversity.ac.id
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      TULT Lt 5
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* View All Button - Centered */}
            <div className="text-center relative">
              <Button
                className="bg-red-600 text-white hover:bg-red-700 px-6 py-3 rounded-lg font-medium relative z-10"
                onClick={() => navigate("/daftar-kontak")}
              >
                Lihat Semua Kontak Dosen
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap">
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-4">Universitas Example</h3>
              <p className="text-sm text-gray-300">
                Jl. Contoh No. 123, Kota Bandung
                <br />
                Jawa Barat, Indonesia 40123
              </p>
            </div>
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <h3 className="text-lg font-semibold mb-4">Link Cepat</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Beranda
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Tentang Kami
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Program Studi
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Fasilitas
                  </a>
                </li>
              </ul>
            </div>
            <div className="w-full md:w-1/3">
              <h3 className="text-lg font-semibold mb-4">Kontak Kami</h3>
              <ul className="text-sm text-gray-300">
                <li>Telp: +62 (022) 123-4567</li>
                <li>Email: info@example.ac.id</li>
                <li>Alamat: Jl. Contoh No. 123, Bandung</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-700 text-sm text-center text-gray-400">
            © {new Date().getFullYear()} Universitas Example. Hak Cipta
            Dilindungi.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
