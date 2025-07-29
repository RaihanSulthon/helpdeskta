import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFAQsAPI } from '../services/api'; // Sesuaikan path jika berbeda
import appLogo from '../assets/applogo.png';

// Komponen Button sederhana
function Button({ children, className = '', onClick }) {
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
  const { user, logout, isAuthenticated, getUserRole } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [faqData, setFaqData] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [expandedFAQs, setExpandedFAQs] = useState(new Set());
  const loadFAQs = useCallback(async () => {
    try {
      setFaqLoading(true);

      const apiFilters = {
        per_page: 6, // Hanya ambil 6 FAQ untuk landing page
        page: 1,
      };

      const result = await getFAQsAPI(apiFilters);

      let faqsArray = [];

      // Handle different response structures (sama seperti di StudentAskedUs)
      if (result?.faqs && Array.isArray(result.faqs)) {
        faqsArray = result.faqs;
      } else if (result?.data?.data && Array.isArray(result.data.data)) {
        faqsArray = result.data.data;
      } else if (result?.data && Array.isArray(result.data)) {
        faqsArray = result.data;
      } else if (Array.isArray(result)) {
        faqsArray = result;
      }

      // Filter only published FAQs
      const publishedFAQs = faqsArray
        .filter((faq) => faq.is_public === true || faq.is_public === 1)
        .slice(0, 6); // Limit to 6 items

      setFaqData(publishedFAQs);
    } catch (error) {
      console.error('Error loading FAQs for landing page:', error);
      setFaqData([]); // Set empty array on error
    } finally {
      setFaqLoading(false);
    }
  }, []);

  // Function untuk toggle FAQ accordion
  const toggleFAQ = (id) => {
    setExpandedFAQs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  // Check login status using AuthContext
  useEffect(() => {
    if (isAuthenticated() && user) {
      const role = getUserRole();
      setUserRole(role);
    } else {
      setUserRole(null);
    }

    // Load FAQs
    loadFAQs();
  }, [user, isAuthenticated, getUserRole, loadFAQs]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleDashboardClick = () => {
    const currentRole = getUserRole();
    switch (currentRole) {
      case 'admin':
        navigate('/admin/tickets');
        break;
      case 'student':
        navigate('/student/tickets');
        break;
      default:
        console.warn('Unknown role, defaulting to student dashboard');
        navigate('/student/tickets');
        break;
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Determine if user is logged in
  const isLoggedIn = isAuthenticated() && user && userRole;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Updated to red navbar style */}
      <header className="bg-red-600 shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Left section - Logo/Brand */}
          <div className="hidden sm:block">
            <img
              src={appLogo}
              alt="App Logo"
              className="h-8 w-auto ml-4 cursor-pointer  transition-all  duration-300"
            />
          </div>

          {/* Center section - Navigation Menu */}
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => scrollToSection('about-section')}
              className="text-white hover:text-gray-200 font-medium"
            >
              About-Us
            </button>
            <button
              onClick={() => scrollToSection('asked-section')}
              className="text-white hover:text-gray-200 font-medium"
            >
              Asked-Us
            </button>
          </nav>

          {/* Right section - Login/User Menu */}
          {!isLoggedIn ? (
            <div className="flex space-x-4">
              <div className="flex space-x-4">
                <Button
                  className="border-2 border-white text-white hover:bg-white hover:text-red-600 px-6 py-2 font-medium"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </Button>
              </div>
              <Button
                className="bg-white text-red-600 hover:bg-gray-100 px-6 py-2 font-medium"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="text-white text-sm">
                Welcome,{' '}
                <span className="font-medium capitalize">
                  {user?.name || userRole}
                </span>
              </div>
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <Button
                className="px-4 py-2 bg-white text-red-600 hover:bg-gray-100 rounded font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl"
                onClick={handleDashboardClick}
              >
                Dashboard
              </Button>
              <Button
                className="bg-white text-red-600 hover:bg-gray-100 px-4 py-2 font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl"
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
              mempermudah mahasiswa Telkom University dalam menyampaikan
              pertanyaan, laporan, maupun permintaan bantuan terkait layanan
              akademik dan non-akademik.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {!isLoggedIn ? (
                <>
                  <Button
                    className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 text-lg font-medium"
                    onClick={() => navigate('/login')}
                  >
                    Get Started
                  </Button>
                  <Button
                    className="border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-3 text-lg font-medium"
                    onClick={() => navigate('/laak-info')}
                  >
                    LAAK Info Portal
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 text-lg font-medium"
                    onClick={handleDashboardClick}
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    className="border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-3 text-lg font-medium"
                    onClick={() => navigate('/laak-info')}
                  >
                    LAAK Info Portal
                  </Button>
                  <Button
                    className="border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-3 text-lg font-medium"
                    onClick={() =>
                      navigate(
                        userRole === 'student'
                          ? '/student/sampaikan'
                          : '/admin/tickets'
                      )
                    }
                  >
                    {userRole === 'student'
                      ? 'Create Ticket'
                      : 'Manage Tickets'}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Right Content - App Logo */}
          <div className="md:block w-1/2">
            {/* App Logo */}
            <div className="w-full ml-4 h-full flex items-center justify-center">
              <img
                src={appLogo}
                alt="Tell-Us App Logo"
                className="w-80 h-80 object-contain"
              />
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
          <div className="bg-white rounded-lg max-w-4xl mx-auto">
            {faqLoading ? (
              // Loading state
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat FAQ...</p>
              </div>
            ) : faqData.length === 0 ? (
              // Empty state
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
                <p className="text-lg font-medium mb-2">Belum ada FAQ</p>
                <p className="text-sm">FAQ akan segera tersedia</p>
              </div>
            ) : (
              // FAQ List
              faqData.map((item, index) => (
                <div key={item.id}>
                  {/* Separator line between items */}
                  {index > 0 && (
                    <div className="border-t border-gray-200"></div>
                  )}

                  {/* Question Header - Clickable */}
                  <button
                    onClick={() => toggleFAQ(item.id)}
                    className="w-full px-6 py-6 text-left hover:bg-gray-50 transition-colors duration-150 focus:outline-none"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1 pr-6">
                        <h3 className="text-base font-semibold text-gray-900 leading-relaxed">
                          {item.question}
                        </h3>
                      </div>

                      {/* Chevron Icon */}
                      <div className="flex-shrink-0">
                        <svg
                          className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ease-in-out ${
                            expandedFAQs.has(item.id) ? 'rotate-180' : ''
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
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      expandedFAQs.has(item.id)
                        ? 'max-h-96 opacity-100'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-6 bg-gray-50">
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
                              {item.category?.name || item.category || 'Umum'}
                            </span>

                            <span>
                              Dipublikasikan:{' '}
                              {new Date(item.created_at).toLocaleDateString(
                                'id-ID',
                                {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
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

          {/* View All FAQ Button */}
          {faqData.length > 0 && (
            // Di section Asked Us, button "Lihat Semua FAQ"
            <div className="text-center mt-8">
              <Button
                className="bg-red-600 text-white border-2 hover:bg-white hover:text-red-600 transition-all duration-300 hover:scale-105 hover:shadow-xl border-white px-8 py-3 text-lg font-medium"
                onClick={() => {
                  const currentRole = getUserRole();
                  if (currentRole === 'admin') {
                    navigate('/admin/askedus');
                  } else if (currentRole === 'student') {
                    navigate('/student/askedus');
                  } else {
                    // Jika belum login atau role tidak dikenal, arahkan ke login
                    navigate('/login');
                  }
                }}
              >
                Lihat Semua FAQ
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap">
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
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm transition-opacity"
            onClick={cancelLogout}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header dengan icon dan background navy */}
              <div className="bg-gray-800 px-6 py-4 flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-white rounded mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-gray-800"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    >
                      <path d="M19.353 6.5H16.49V9H6.404v6H16.49v2.5h2.864A9.99 9.99 0 0 1 11 22C5.477 22 1 17.523 1 12S5.477 2 11 2a9.99 9.99 0 0 1 8.353 4.5M17.989 16v-1zm0-8v1z" />
                      <path d="m18.99 8l4 4l-4 4h-1v-2.5h-10v-3h10V8z" />
                    </g>
                  </svg>
                </div>
                <h3 className="text-white text-lg font-semibold">
                  Konfirmasi Logout
                </h3>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <p className="text-gray-700 font-semibold text-base mb-6">
                  Apakah Anda yakin ingin Logout?
                </p>

                {/* Custom Buttons sesuai design */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelLogout}
                    className="px-6 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 hover:scale-105 duration-300 transition-all hover:shadow-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="px-4 py-3 bg-red-600 text-white rounded-md hover:bg-white hover:text-red-600 hover:scale-105 duration-300 transition-all hover:shadow-lg hover:border-2 hover:border-red-600 font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
