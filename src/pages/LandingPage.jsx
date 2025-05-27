import React from "react";
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

  const stats = [
    { value: "15,000+", label: "Mahasiswa Aktif" },
    { value: "500+", label: "Dosen & Tenaga Pengajar" },
    { value: "25+", label: "Program Studi" },
    { value: "30+", label: "Tahun Pengalaman" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => {
              if (localStorage.getItem("userRole")) {
                navigate("/dashboard");
              } else {
                navigate("/");
              }
            }}
          >
            <img
              src="/logo-university.png"
              alt="Logo"
              className="h-10 w-auto mr-2"
            />
            <div>
              <div className="text-xl font-bold text-blue-700">HELPDESK</div>
              <div className="text-xs text-gray-500">Telkom University</div>
            </div>
          </div>

          {!localStorage.getItem("userRole") ? (
            <div className="hidden md:flex space-x-4">
              <Button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
                onClick={() => navigate("/login")}
              >
                Masuk
              </Button>
              <Button className="border border-gray-300 px-4 py-2">
                Daftar
              </Button>
            </div>
          ) : (
            <nav className="hidden md:flex space-x-4 text-sm font-medium text-blue-700">
              <Button
                className="px-4 py-2 bg-blue-100 rounded hover:bg-blue-200"
                onClick={() => navigate("/dashboard")}
              >
                Beranda
              </Button>
              <Button
                className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/";
                }}
              >
                Logout
              </Button>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative w-full py-16 md:py-24 bg-blue-700 text-white text-center">
        <div className="absolute inset-0 bg-blue-900 opacity-50"></div>
        <div className="relative container mx-auto px-4 z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Sistem Informasi Akademik Terpadu
          </h1>
          <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
            Platform terpadu untuk manajemen perkuliahan, penilaian, dan
            administrasi akademik bagi mahasiswa, dosen, dan staff.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-blue-700 hover:bg-gray-100 px-8 py-3 text-lg">
              Masuk ke Sistem
            </Button>
            <Button className="border border-white text-white hover:bg-blue-600 px-8 py-3 text-lg">
              Pelajari Lebih Lanjut
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="w-full py-10">
          <h2 className="text-2xl font-bold text-center mb-2">Layanan Kami</h2>
          <p className="text-center text-gray-600 mb-8">
            Berbagai fitur untuk menunjang aktivitas akademik
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: 1,
                title: "Kelola Nilai",
                description:
                  "Akses penilaian mahasiswa, lihat dan unduh transkrip, serta kelola data akademik dengan mudah.",
                icon: "check",
                iconBgColor: "bg-blue-500",
              },
              {
                id: 2,
                title: "Jadwal Perkuliahan",
                description:
                  "Akses jadwal perkuliahan, ruangan, dan informasi pengajar secara real-time.",
                icon: "verify",
                iconBgColor: "bg-green-500",
              },
              {
                id: 3,
                title: "Bimbingan Akademik",
                description:
                  "Jadwalkan dan kelola sesi bimbingan akademik antara dosen dan mahasiswa.",
                icon: "chat",
                iconBgColor: "bg-purple-500",
              },
              {
                id: 4,
                title: "Perpustakaan Digital",
                description:
                  "Akses ribuan jurnal ilmiah, e-book, dan repository tugas akhir mahasiswa.",
                icon: "send",
                iconBgColor: "bg-red-500",
              },
            ].map((feature) => {
              const renderIcon = (iconName) => {
                switch (iconName) {
                  case "check":
                    return (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    );
                  case "verify":
                    return (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    );
                  case "chat":
                    return (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    );
                  case "send":
                    return (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    );
                  default:
                    return null;
                }
              };

              return (
                <div
                  key={feature.id}
                  className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300"
                >
                  <div
                    className={`${feature.iconBgColor} rounded-full p-4 mb-4 text-white`}
                  >
                    {renderIcon(feature.icon)}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="w-full sm:w-1/2 md:w-1/4 p-4 text-center"
              >
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 uppercase text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact List */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Kontak Dosen & Karyawan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex border-b border-gray-200 pb-4"
            >
              <div className="mr-4">
                <img
                  src={contact.imageSrc}
                  alt={contact.name}
                  className="w-20 h-20 object-cover border-2 border-red-600"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base">{contact.name}</h3>
                <p className="text-sm mb-1">
                  Bidang Keahlian: {contact.department}
                </p>
                <p className="text-sm">Email: {contact.email}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Button
            className="bg-red-600 text-white hover:bg-red-700 px-6 py-2"
            onClick={() => navigate("/daftar-kontak")}
          >
            Lihat Semua Dosen & Karyawan
          </Button>
        </div>
      </div>

      {/* Announcement Section */}
      <div className="bg-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-6">
              Pengumuman Terbaru
            </h2>
            <div className="space-y-4">
              {/* Pengumuman bisa dikelola secara dinamis */}
              <div className="border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">
                    Jadwal Pendaftaran Semester Ganjil 2025/2026
                  </h3>
                  <span className="text-sm text-gray-500">15 Apr 2025</span>
                </div>
                <p className="text-gray-600">
                  Pendaftaran mata kuliah untuk semester ganjil 2025/2026 akan
                  dibuka pada tanggal 1 Juni 2025. Silakan persiapkan KRS Anda.
                </p>
              </div>
              <div className="border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">
                    Workshop Penulisan Karya Ilmiah
                  </h3>
                  <span className="text-sm text-gray-500">10 Apr 2025</span>
                </div>
                <p className="text-gray-600">
                  Workshop diadakan pada 20 April 2025. Peserta terbatas hanya
                  50 orang.
                </p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">
                    Pemeliharaan Sistem SIAKAD
                  </h3>
                  <span className="text-sm text-gray-500">5 Apr 2025</span>
                </div>
                <p className="text-gray-600">
                  SIAKAD akan mengalami pemeliharaan pada tanggal 18-19 April
                  2025.
                </p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <a href="#" className="text-blue-600 font-medium hover:underline">
                Lihat Semua Pengumuman
              </a>
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
