// ContactPreview
import React, { useState } from "react";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";

const ContactPreview = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // Data statis untuk daftar kontak
  const contacts = [
    {
      id: 1,
      name: "Dr. ARFIVE GANDHI, S.T., M.T.I.",
      department:
        "Keamanan Informasi, Auditor Sistem Informasi, Penelitian Kualitatif",
      email: "arfivegandhi@telkomuniversity.ac.id",
    },
    {
      id: 2,
      name: "ARIO HARRY PRAYOGO, S.Kom., M.Kom.",
      department: "Software Engineering",
      email: "ariohp@telkomuniversity.ac.id",
    },
    {
      id: 3,
      name: "AAZ MUHAMMAD HAFIDZ AZIS, S.T.,M.T.",
      department: "Data Science, Artificial Intelligence, Speech Processing",
      email: "aazmuhammad@telkomuniversity.ac.id",
    },
    {
      id: 4,
      name: "DANA SULISTYO KUSUMO, S.T., M.T., Ph.D.",
      department:
        "Software Engineering, Process-Aware Information Systems, Human Computer Interaction",
      email: "danakusumo@telkomuniversity.ac.id",
    },
    {
      id: 5,
      name: "FEDDY DEA RESKYRITA, S.T., M.Kom.",
      department: "Software Engineering",
      email: "feddydr@telkomuniversity.ac.id",
    },
    {
      id: 6,
      name: "JATI HILIAMSYAH HUSEN, S.T., M.Eng.",
      department: "Rekayasa Perangkat Lunak (RPL)",
      email: "jatihusen@telkomuniversity.ac.id",
    },
  ];

  // Filter kontak berdasarkan pencarian dan departemen
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      searchTerm === "" ||
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      selectedDepartment === "all" ||
      contact.department
        .toLowerCase()
        .includes(selectedDepartment.toLowerCase());

    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="flex flex-col w-full h-full overflow-auto bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-600 rounded-md flex items-center justify-center text-white font-bold text-lg">
                U
              </div>
              <div className="ml-2">
                <div className="text-xl font-bold text-red-600">UNIVERSITY</div>
                <div className="text-xs text-gray-500">Telkom University</div>
              </div>
            </div>

            <div className="hidden md:flex space-x-4">
              <Button
                className="border border-red-600 hover:bg-red-600 hover:text-red-50 text-red-600 px-4 py-2 transition-colors duration-300 rounded-md font-medium"
                onClick={() => navigate("/")} // Tambahkan ini untuk kembali ke halaman utama
              >
                Kembali
              </Button>
            </div>
            <div className="md:hidden">
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-red-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Daftar Dosen & Karyawan</h1>
          <p className="mt-2">
            Temukan dan hubungi dosen serta karyawan di Telkom University
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cari Dosen/Karyawan
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Cari berdasarkan nama, email, atau keahlian..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="md:w-64">
              <label
                htmlFor="department"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Bidang Keahlian
              </label>
              <select
                id="department"
                className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="all">Semua Bidang Keahlian</option>
                <option value="software engineering">
                  Software Engineering
                </option>
                <option value="data science">Data Science</option>
                <option value="keamanan informasi">Keamanan Informasi</option>
                <option value="human computer interaction">
                  Human Computer Interaction
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 gap-6">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex border-b border-gray-200 pb-6 last:border-0 last:pb-0"
              >
                <div className="mr-6">
                  <div className="w-24 h-24 bg-gray-200 border-2 border-red-600 flex items-center justify-center text-xl font-bold text-gray-500">
                    {contact.name.charAt(0)}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{contact.name}</h3>
                  <p className="text-sm mb-2">
                    <span className="font-medium">Bidang Keahlian: </span>
                    {contact.department}
                  </p>
                  <p className="text-sm mb-4">
                    <span className="font-medium">Email: </span>
                    {contact.email}
                  </p>
                  <div className="flex space-x-2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Menampilkan{" "}
            <span className="font-medium">{filteredContacts.length}</span> dari
            total <span className="font-medium">{contacts.length}</span> dosen
            dan karyawan
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              Sebelumnya
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">
              Berikutnya
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap">
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-4">Telkom University</h3>
              <p className="mb-4 text-gray-300 text-sm">
                Jl. Telekomunikasi No. 1, Terusan Buahbatu
                <br />
                Bandung, Jawa Barat, Indonesia 40257
              </p>
              <div className="flex space-x-4">
                <span className="text-gray-300 hover:text-white">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </span>
                <span className="text-gray-300 hover:text-white">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </span>
              </div>
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
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Berita & Kegiatan
                  </a>
                </li>
              </ul>
            </div>

            <div className="w-full md:w-1/3">
              <h3 className="text-lg font-semibold mb-4">Kontak Kami</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-gray-400 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    ></path>
                  </svg>
                  <span className="text-gray-300">+62 (022) 7564-108</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-gray-400 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    ></path>
                  </svg>
                  <span className="text-gray-300">
                    info@telkomuniversity.ac.id
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700 text-sm text-center text-gray-400">
            <p>
              © {new Date().getFullYear()} Telkom University. Hak Cipta
              Dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactPreview;
