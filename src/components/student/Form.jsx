// components/Molekul/Form.jsx
import React, { useState } from "react";
import Button from "../Button";
import TextField from "../TextField";
import TextArea from "../TextArea";
import Label from "../Label";
import RadioCard from "../RadioCard";
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
    <div className="bg-white rounded-lg w-full max-w-4xl p-6 shadow-lg">
      {/* Header Form */}
      <div className="bg-blue-600 p-6 text-white -mx-6 -mt-6 mb-6 rounded-t-lg">
        <h1 className="text-xl font-semibold text-center">
          Sampaikan Laporan Anda
        </h1>
        <p className="mt-2 text-center text-sm">
          Silakan isi formulir di bawah ini untuk menyampaikan pengaduan atau
          aspirasi Anda
        </p>
      </div>

      {isSubmitted && <SuccessAlert />}

      <form onSubmit={handleSubmit}>
        {/* Bagian 1: Pilih Klasifikasi Laporan */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">
            Klasifikasi Laporan
          </h2>
          <div className="mb-4">
            <Label htmlFor="jenis">Pilih Klasifikasi Laporan</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <RadioCard
                value="PENGADUAN"
                selectedValue={formData.jenis}
                onChange={handleJenisChange}
                label="PENGADUAN"
              />
              <RadioCard
                value="ASPIRASI"
                selectedValue={formData.jenis}
                onChange={handleJenisChange}
                label="ASPIRASI"
              />
              <RadioCard
                value="PERMINTAAN INFORMASI"
                selectedValue={formData.jenis}
                onChange={handleJenisChange}
                label="PERMINTAAN INFORMASI"
              />
            </div>
          </div>

          <div className="mb-4 text-sm">
            <p className="text-gray-700">
              Perhatikan Cara Menyampaikan Pengaduan Yang Baik dan Benar
            </p>
            <a href="#" className="text-blue-500 hover:underline ml-2">
              Lihat Panduan
            </a>
          </div>
        </div>

        {/* Bagian 2: Identitas Pelapor */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">
            Identitas Pelapor
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
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
              />
            </div>

            <div className="mb-4">
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
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="prodi">Program Studi</Label>
              <TextField
                id="prodi"
                name="prodi"
                value={formData.prodi}
                onChange={handleChange}
                placeholder="Masukkan program studi Anda"
                disabled={formData.anonymous}
              />
            </div>

            <div className="mb-4">
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
              />
            </div>

            <div className="mb-4">
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
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="noHp">Nomor HP</Label>
              <TextField
                id="noHp"
                name="noHp"
                value={formData.noHp}
                onChange={handleChange}
                placeholder="Masukkan nomor HP Anda"
                disabled={formData.anonymous}
              />
            </div>
          </div>

          <div className="mt-2">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="anonymous"
                checked={formData.anonymous}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">
                Kirim sebagai Anonim (Identitas tidak akan ditampilkan)
              </span>
            </label>
          </div>
        </div>

        {/* Bagian 3: Detail Laporan */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">
            Detail Laporan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="mb-4">
              <Label htmlFor="kategori" required>
                Kategori Laporan
              </Label>
              <Select
                id="kategori"
                name="kategori"
                value={formData.kategori}
                onChange={handleChange}
                options={kategoriOptions}
                placeholder="Pilih Kategori Laporan"
              />
            </div>

            <div className="mb-4">
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
              />
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="judul" required>
              Judul Laporan
            </Label>
            <TextField
              id="judul"
              name="judul"
              value={formData.judul}
              onChange={handleChange}
              placeholder="Berikan judul yang singkat dan jelas"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="isi" required>
              Isi Laporan
            </Label>
            <TextArea
              id="isi"
              name="isi"
              value={formData.isi}
              onChange={handleChange}
              placeholder="Jelaskan secara detail pengaduan atau aspirasi Anda..."
              rows={5}
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="tanggal" required>
              Tanggal Kejadian
            </Label>
            <TextField
              id="tanggal"
              name="tanggal"
              type="date"
              value={formData.tanggal}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="lokasi" required>
              Lokasi Kejadian
            </Label>
            <TextField
              id="lokasi"
              name="lokasi"
              value={formData.lokasi}
              onChange={handleChange}
              placeholder="Sebutkan lokasi kejadian"
            />
          </div>

          <div className="mb-4">
            <Label>
              Lampiran (opsional)
              <span className="text-sm text-gray-500 ml-2">
                Maksimal 5 MB (.jpg, .png, .pdf)
              </span>
            </Label>
            <div className="flex items-center justify-center w-full mt-2">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Icon name="upload" className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Klik untuk upload</span>{" "}
                    atau drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG atau PDF (Maks. 5MB)
                  </p>
                </div>
                <input type="file" className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <Button
            type="primary"
            className="px-6 py-3 w-full md:w-auto"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Icon name="loading" className="animate-spin mr-2" />
                Mengirim...
              </span>
            ) : (
              "Kirim Laporan"
            )}
          </Button>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>
            Catatan: Kolom bertanda <span className="text-red-500">*</span>{" "}
            wajib diisi
          </p>
          <p className="mt-1">
            Laporan Anda akan ditindaklanjuti dalam waktu 3x24 jam kerja.
          </p>
        </div>
      </form>
    </div>
  );
}

export default Form;
