// components/Molekul/Form.jsx
import React, { useState } from "react";
import Button from "../Button";
import TextField from "../TextField";
import TextArea from "../TextArea";
import Label from "../Label";
import Select from "../Select";
import Icon from "../Icon";

function Form() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    jenis: "PENGADUAN",
    judul: "",
    isi: "",
    tanggal: "",
    lokasi: "",
    kategori: "",
    subKategori: "",
    nama: "",
    nim: "",
    prodi: "",
    semester: "",
    email: "",
    noHp: "",
    anonymous: false,
  });

  // Kategori laporan
  const kategoriOptions = [
    { value: "", label: "Pilih Kategori" },
    { value: "pendidikan", label: "Pendidikan" },
    { value: "kesehatan", label: "Kesehatan" },
    { value: "infrastruktur", label: "Infrastruktur" },
    { value: "pelayanan_publik", label: "Pelayanan Publik" },
    { value: "lainnya", label: "Lainnya" },
  ];

  // Sub kategori berdasarkan kategori yang dipilih
  const subKategoriOptions = {
    pendidikan: [
      { value: "kurikulum", label: "Kurikulum" },
      { value: "pengajar", label: "Tenaga Pengajar" },
      { value: "fasilitas_pendidikan", label: "Fasilitas Pendidikan" },
      { value: "pendidikan_lainnya", label: "Lainnya" },
    ],
    kesehatan: [
      { value: "fasilitas_kesehatan", label: "Fasilitas Kesehatan" },
      { value: "layanan_kesehatan", label: "Layanan Kesehatan" },
      { value: "kesehatan_lainnya", label: "Lainnya" },
    ],
    infrastruktur: [
      { value: "jalan", label: "Jalan" },
      { value: "bangunan", label: "Bangunan" },
      { value: "air_bersih", label: "Air Bersih" },
      { value: "infrastruktur_lainnya", label: "Lainnya" },
    ],
    pelayanan_publik: [
      { value: "layanan_administrasi", label: "Layanan Administrasi" },
      { value: "layanan_online", label: "Layanan Online" },
      { value: "layanan_lainnya", label: "Lainnya" },
    ],
    lainnya: [{ value: "lainnya", label: "Lainnya" }],
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });

      // Reset sub-kategori jika kategori berubah
      if (name === "kategori") {
        setFormData((prev) => ({
          ...prev,
          subKategori: "",
        }));
      }
    }
  };

  const handleJenisChange = (jenis) => {
    setFormData({ ...formData, jenis });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulasi pengiriman data ke server
    setTimeout(() => {
      console.log("Data yang dikirim:", formData);
      setIsLoading(false);
      setIsSubmitted(true);

      // Reset form setelah berhasil submit
      setFormData({
        jenis: "PENGADUAN",
        judul: "",
        isi: "",
        tanggal: "",
        lokasi: "",
        kategori: "",
        subKategori: "",
        nama: "",
        nim: "",
        prodi: "",
        semester: "",
        email: "",
        noHp: "",
        anonymous: false,
      });
    }, 1500);
  };

  // Komponen untuk alert sukses
  const SuccessAlert = () => (
    <div
      className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6"
      role="alert"
    >
      <strong className="font-bold">Berhasil! </strong>
      <span className="block sm:inline">
        Laporan Anda telah berhasil dikirim. Tim kami akan menindaklanjuti
        segera.
      </span>
      <button
        className="absolute top-0 bottom-0 right-0 px-4 py-3"
        onClick={() => setIsSubmitted(false)}
      >
        <span className="text-green-500">×</span>
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-lg w-full max-w-full mx-auto">
      {isSubmitted && <SuccessAlert />}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Bagian 1: Identitas Pelapor */}
        <div>
          <h2 className="text-lg font-semibold mb-6 text-gray-900">
            Identitas Pelapor
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="nama" required>
                Nama Lengkap
              </Label>
              <TextField
                id="nama"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap Anda"
                disabled={formData.anonymous}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="nim" required>
                NIM/NIK
              </Label>
              <TextField
                id="nim"
                name="nim"
                value={formData.nim}
                onChange={handleChange}
                placeholder="Masukkan NIM atau NIK Anda"
                disabled={formData.anonymous}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="prodi">Program Studi</Label>
              <TextField
                id="prodi"
                name="prodi"
                value={formData.prodi}
                onChange={handleChange}
                placeholder="Masukkan program studi Anda"
                disabled={formData.anonymous}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="semester">Semester</Label>
              <Select
                id="semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(
                  (sem) => ({ value: sem.toString(), label: sem.toString() })
                )}
                placeholder="Pilih Semester"
                disabled={formData.anonymous}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email" required>
                Email
              </Label>
              <TextField
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Masukkan email Anda"
                disabled={formData.anonymous}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="noHp">Nomor HP</Label>
              <TextField
                id="noHp"
                name="noHp"
                value={formData.noHp}
                onChange={handleChange}
                placeholder="Masukkan nomor HP Anda"
                disabled={formData.anonymous}
                className="mt-1"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="anonymous"
                checked={formData.anonymous}
                onChange={handleChange}
                className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="ml-3 text-sm text-gray-700">
                Kirim sebagai Anonim (Identitas tidak akan ditampilkan)
              </span>
            </label>
          </div>
        </div>

        {/* Bagian 2: Detail Laporan */}
        <div>
          <h2 className="text-lg font-semibold mb-6 text-gray-900">
            Detail Laporan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="kategori" required>
                Kategori
              </Label>
              <Select
                id="kategori"
                name="kategori"
                value={formData.kategori}
                onChange={handleChange}
                options={kategoriOptions}
                placeholder="Pilih Kategori"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="subKategori" required>
                Sub Kategori
              </Label>
              <Select
                id="subKategori"
                name="subKategori"
                value={formData.subKategori}
                onChange={handleChange}
                options={
                  formData.kategori
                    ? [
                        { value: "", label: "Pilih Sub Kategori" },
                        ...(subKategoriOptions[formData.kategori] || []),
                      ]
                    : []
                }
                placeholder="Pilih Sub Kategori"
                disabled={!formData.kategori}
                className="mt-1"
              />
            </div>
          </div>

          <div className="mb-6">
            <Label htmlFor="judul" required>
              Judul Laporan
            </Label>
            <TextField
              id="judul"
              name="judul"
              value={formData.judul}
              onChange={handleChange}
              placeholder="Berikan judul yang singkat dan jelas"
              className="mt-1"
            />
          </div>

          <div className="mb-6">
            <Label htmlFor="isi" required>
              Deskripsi
            </Label>
            <TextArea
              id="isi"
              name="isi"
              value={formData.isi}
              onChange={handleChange}
              placeholder="Sampaikan secara detail keluhan atau laporan Anda..."
              rows={6}
              className="mt-1"
            />
          </div>

          <div className="mb-6">
            <Label>
              Lampiran (opsional)
              <span className="text-sm text-gray-500 font-normal">
                Maksimal 5 MB (.jpg, .png, .pdf)
              </span>
            </Label>
            <div className="mt-2">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Klik untuk Upload</span>{" "}
                      atau drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG atau PDF (Maks. 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Catatan dan Submit */}
        <div className="border-t pt-6">
          <div className="text-sm text-gray-600 mb-6">
            <p className="mb-2">
              <span className="font-medium">Catatan:</span> Kolom bertanda{" "}
              <span className="text-red-500">*</span> wajib diisi
            </p>
            <p>Laporan Anda akan ditindaklanjuti dalam waktu 3x24 jam kerja.</p>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Mengirim...
                </span>
              ) : (
                "Kirim Laporan"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Form;
