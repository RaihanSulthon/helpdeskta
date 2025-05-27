import { useState } from "react";
import Form from "../components/student/Form";
import Header from "../components/Navbar";
import "../App.css";

function SplashPage() {
  const [laporan, setLaporan] = useState({
    jenis: "PENGADUAN",
    judul: "",
    isi: "",
    tanggal: "",
    lokasi: "",
    kategori: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLaporan({ ...laporan, [name]: value });
  };

  const handleJenisChange = (jenis) => {
    setLaporan({ ...laporan, jenis });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Laporan submitted:", laporan);
    // Proses pengiriman laporan
  };

  const backgroundStyle = {
    backgroundImage: "linear-gradient(to bottom, #c33, #a44, #e88)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div className="min-h-screen flex flex-col" style={backgroundStyle}>
      {/* Header */}
      <Header></Header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-4">
        {/* Title */}
        <div className="text-center text-white mb-4 mt-8">
          <h1 className="text-2xl font-bold">
            Layanan Aspirasi dan Pengaduan Online Rakyat
          </h1>
          <p className="text-sm">
            Sampaikan laporan Anda langsung kepada instansi pemerintah
            berwenang.
          </p>
        </div>

        {/* Form Card */}
        <Form></Form>

        {/* Process Icons */}
        <div className="grid grid-cols-5 gap-4 mt-8 max-w-4xl text-center text-white">
          <div className="flex flex-col items-center">
            <div className="bg-blue-500 rounded-full p-4 mb-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                ></path>
              </svg>
            </div>
            <h3 className="text-xs font-bold mb-1">Tulis Laporan</h3>
            <p className="text-xs">
              Laporan keluhan atau aspirasi anda dengan jelas dan lengkap
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-blue-500 rounded-full p-4 mb-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                ></path>
              </svg>
            </div>
            <h3 className="text-xs font-bold mb-1">Proses Verifikasi</h3>
            <p className="text-xs">
              Dalam 3 hari, laporan Anda akan diverifikasi dan diteruskan kepada
              instansi berwenang
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-blue-500 rounded-full p-4 mb-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h3 className="text-xs font-bold mb-1">Proses Tindak Lanjut</h3>
            <p className="text-xs">
              Dalam 5 hari, instansi akan menindaklanjuti dan membalas laporan
              Anda
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-blue-500 rounded-full p-4 mb-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xs font-bold mb-1">Beri Tanggapan</h3>
            <p className="text-xs">
              Anda dapat menanggapi kembali balasan yang diberikan oleh instansi
              dalam waktu 10 hari
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-blue-500 rounded-full p-4 mb-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xs font-bold mb-1">Selesai</h3>
            <p className="text-xs">
              Laporan Anda akan terus ditindaklanjuti hingga terselesaikan
            </p>
          </div>
        </div>

        {/* Learn More Button */}
        <div className="text-center mt-4">
          <button className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded mt-4">
            Pelajari Lebih Lanjut
          </button>
        </div>
      </main>
    </div>
  );
}

export default SplashPage;
