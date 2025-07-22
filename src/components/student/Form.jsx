// components/student/Form.jsx - UPDATED VERSION with file upload
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button';
import TextField from '../TextField';
import TextArea from '../TextArea';
import Label from '../Label';
import Select from '../Select';
import Icon from '../Icon';
import {
  submitTicketAPI,
  getCategoriesAPI,
  createNotificationAPI,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getAdminId, generateNotificationMessage } from '../../utils/userUtils';

function Form() {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [submittedTicketId, setSubmittedTicketId] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    jenis: 'PENGADUAN',
    judul: '',
    isi: '',
    tanggal: '',
    lokasi: '',
    kategori: '',
    subKategori: '',
    nama: '',
    nim: '',
    prodi: '',
    semester: '',
    email: user?.email || '',
    noHp: '',
    anonymous: false,
  });

  useEffect(() => {
    if (user && !formData.anonymous) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || prev.email,
        nama: user.name || prev.nama,
      }));
    }
  }, [user, formData.anonymous]);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (user?.email && !formData.anonymous) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
      }));
    }
  }, [user]);

  const loadCategories = async () => {
    try {
      const categoriesData = await getCategoriesAPI();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Use fallback categories if API fails
      setCategories([
        {
          id: 1,
          name: 'Pendidikan',
          sub_categories: [
            { id: 1, name: 'Kurikulum' },
            { id: 2, name: 'Tenaga Pengajar' },
            { id: 3, name: 'Fasilitas Pendidikan' },
            { id: 4, name: 'Lainnya' },
          ],
        },
        {
          id: 2,
          name: 'Kesehatan',
          sub_categories: [
            { id: 5, name: 'Fasilitas Kesehatan' },
            { id: 6, name: 'Layanan Kesehatan' },
            { id: 7, name: 'Lainnya' },
          ],
        },
        {
          id: 3,
          name: 'Infrastruktur',
          sub_categories: [
            { id: 8, name: 'Jalan' },
            { id: 9, name: 'Bangunan' },
            { id: 10, name: 'Air Bersih' },
            { id: 11, name: 'Lainnya' },
          ],
        },
        {
          id: 4,
          name: 'Pelayanan Publik',
          sub_categories: [
            { id: 12, name: 'Layanan Administrasi' },
            { id: 13, name: 'Layanan Online' },
            { id: 14, name: 'Lainnya' },
          ],
        },
        {
          id: 5,
          name: 'Lainnya',
          sub_categories: [{ id: 15, name: 'Lainnya' }],
        },
      ]);
    }
  };

  // Create kategori options from API data
  const kategoriOptions = [
    { value: '', label: 'Pilih Kategori' },
    ...categories.map((cat) => ({
      value: cat.id.toString(),
      label: cat.name,
    })),
  ];

  // Get sub-categories for selected category
  const getSubCategoriesForCategory = (categoryId) => {
    if (!categoryId) return [];

    const selectedCategory = categories.find(
      (cat) => cat.id.toString() === categoryId.toString()
    );
    if (!selectedCategory || !selectedCategory.sub_categories) return [];

    return [
      { value: '', label: 'Pilih Sub Kategori' },
      ...selectedCategory.sub_categories.map((subCat) => ({
        value: subCat.id.toString(),
        label: subCat.name,
      })),
    ];
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Validate file type
      const allowedTypes = [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'application/pdf',
      ];
      if (!allowedTypes.includes(file.type)) {
        setError('Tipe file tidak diizinkan. Gunakan PNG, JPG, atau PDF.');
        e.target.value = '';
        return;
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('Ukuran file terlalu besar. Maksimal 5MB.');
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
      setError('');

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    // Clear file input
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      const newFormData = {
        ...formData,
        [name]: checked,
      };

      // Reset identity fields jika switch ke anonim
      if (name === 'anonymous' && checked) {
        newFormData.nama = '';
        newFormData.nim = '';
        newFormData.prodi = '';
        newFormData.semester = '';
        newFormData.noHp = '';
        // Email tetap dipertahankan jika user sudah login
        if (!user?.email) {
          newFormData.email = '';
        }
      }

      setFormData(newFormData);
    } else {
      // Mencegah perubahan email jika user sudah login dan tidak anonymous
      if (name === 'email' && user?.email && !formData.anonymous) {
        return; // Tidak mengizinkan perubahan email
      }

      setFormData({
        ...formData,
        [name]: value,
      });

      // Reset sub-kategori jika kategori berubah
      if (name === 'kategori') {
        setFormData((prev) => ({
          ...prev,
          subKategori: '',
        }));
      }
    }
  };

  const createTicketNotification = async (ticketData, userInfo) => {
    try {
      const adminId = getAdminId();
      const message = generateNotificationMessage('new_ticket', {
        ticketTitle: userInfo.judul,
      });

      await createNotificationAPI({
        recipient_id: adminId,
        type: 'custom_notification',
        subject: 'Custom Notification',
        content: 'This is a custom notification.',
      });

      console.log(
        'Ticket notification created successfully for admin:',
        adminId
      );
    } catch (error) {
      console.error('Failed to create ticket notification:', error);
      // Jangan throw error, biarkan proses create ticket tetap berhasil
    }
  };

  // UPDATED VALIDATION FUNCTION
  const validateForm = () => {
    const errors = [];

    // Basic validation
    if (!formData.judul || formData.judul.trim() === '') {
      errors.push('Judul laporan harus diisi');
    } else if (formData.judul.trim().length < 5) {
      errors.push('Judul laporan minimal 5 karakter');
    }

    if (!formData.isi || formData.isi.trim() === '') {
      errors.push('Deskripsi harus diisi');
    } else if (formData.isi.trim().length < 10) {
      errors.push('Deskripsi minimal 10 karakter');
    }

    if (!formData.kategori || formData.kategori === '') {
      errors.push('Kategori harus dipilih');
    }

    if (!formData.subKategori || formData.subKategori === '') {
      errors.push('Sub kategori harus dipilih');
    }

    // Validate identity fields only if not anonymous
    if (!formData.anonymous) {
      if (!formData.nama || formData.nama.trim() === '') {
        errors.push('Nama lengkap harus diisi');
      }

      if (!formData.nim || formData.nim.trim() === '') {
        errors.push('NIM/NIK harus diisi');
      } else if (!/^[0-9]+$/.test(formData.nim.trim())) {
        errors.push('NIM/NIK harus berupa angka');
      }

      if (!formData.anonymous && !user?.email) {
        if (!formData.email || formData.email.trim() === '') {
          errors.push('Email harus diisi');
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.email.trim())) {
            errors.push('Format email tidak valid');
          }
        }
      }
    }

    if (errors.length > 0) {
      setError(errors.join('. '));
      return false;
    }

    setError('');
    return true;
  };

  // UPDATED SUBMIT FUNCTION with file upload
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form first
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare clean data for API
      const submitData = {
        // Core ticket data
        judul: formData.judul.trim(),
        deskripsi: formData.isi.trim(), // API expects 'deskripsi', not 'isi'
        category_id: parseInt(formData.kategori),
        sub_category_id: parseInt(formData.subKategori),
        anonymous: formData.anonymous, // Will be converted to string in API

        // Identity data based on anonymous status
        nama: formData.anonymous ? '' : (formData.nama || '').trim(),
        nim: formData.anonymous ? '' : (formData.nim || '').trim(),
        prodi: formData.anonymous ? '' : (formData.prodi || '').trim(),
        semester: formData.anonymous
          ? ''
          : (formData.semester || '').toString(),
        email: (formData.email || '').trim(), // Always send actual email
        no_hp: formData.anonymous ? '' : (formData.noHp || '').trim(),
      };

      console.log('Prepared Submit Data:', submitData);
      console.log('Selected File:', selectedFile);

      // Final validation before API call
      if (isNaN(submitData.category_id) || submitData.category_id <= 0) {
        throw new Error('Kategori tidak valid');
      }

      if (
        isNaN(submitData.sub_category_id) ||
        submitData.sub_category_id <= 0
      ) {
        throw new Error('Sub kategori tidak valid');
      }

      console.log('Calling API with data:', submitData);

      // Call API with file support
      const response = await submitTicketAPI(submitData, selectedFile);
      console.log('API Response:', response);

      // Extract ticket ID from response
      let ticketId = null;
      if (response?.data?.id) {
        ticketId = response.data.id;
      } else if (response?.id) {
        ticketId = response.id;
      } else if (response?.ticket?.id) {
        ticketId = response.ticket.id;
      }

      // Create notification setelah ticket berhasil dibuat
      if (ticketId) {
        await createTicketNotification(response.data || response, {
          nama: submitData.nama,
          email: submitData.email,
          judul: submitData.judul,
        });
      }

      setSubmittedTicketId(ticketId);
      setIsSubmitted(true);
      setIsLoading(false);
      setRetryCount(0);

      // Reset form
      setFormData({
        jenis: 'PENGADUAN',
        judul: '',
        isi: '',
        tanggal: '',
        lokasi: '',
        kategori: '',
        subKategori: '',
        nama: '',
        nim: '',
        prodi: '',
        semester: '',
        email: user?.email || '', // Keep user email if logged in
        noHp: '',
        anonymous: false,
      });

      // Reset file
      setSelectedFile(null);
      setFilePreview(null);
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';

      // Navigate after delay
      setTimeout(() => {
        if (ticketId) {
          navigate(`/ticket/${ticketId}`);
        } else {
          navigate('/student/tickets');
        }
      }, 3000);
    } catch (error) {
      console.error('Submit Error Details:', error);
      setIsLoading(false);

      // Enhanced error handling
      let errorMessage = 'Terjadi kesalahan saat mengirim laporan';

      if (
        error.message.includes('Validation failed') ||
        error.message.includes('validation')
      ) {
        errorMessage = 'Data form tidak valid: ' + error.message;
      } else if (
        error.message.includes('kategori') ||
        error.message.includes('category')
      ) {
        errorMessage =
          'Kategori atau sub kategori tidak valid. Silakan pilih ulang.';
      } else if (
        error.message.includes('server') ||
        error.message.includes('500')
      ) {
        errorMessage =
          'Server sedang bermasalah. Silakan coba lagi dalam beberapa menit.';
      } else if (
        error.message.includes('network') ||
        error.message.includes('fetch') ||
        error.message.includes('koneksi')
      ) {
        errorMessage =
          'Koneksi internet bermasalah. Periksa koneksi Anda dan coba lagi.';
      } else if (
        error.message.includes('token') ||
        error.message.includes('401')
      ) {
        errorMessage = 'Sesi Anda telah berakhir. Silakan login ulang.';
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.message.includes('CORS')) {
        errorMessage =
          'Ada masalah dengan server. Silakan hubungi administrator.';
      } else {
        errorMessage = error.message || errorMessage;
      }

      setError(errorMessage);
      setRetryCount((prev) => prev + 1);
    }
  };

  // Retry submit function
  const handleRetrySubmit = () => {
    setError('');
    handleSubmit({ preventDefault: () => {} });
  };

  // Navigate to ticket view
  const handleViewTicket = () => {
    if (submittedTicketId) {
      navigate(`/ticket/${submittedTicketId}`);
    } else {
      navigate('/student/tickets');
    }
  };

  // Success Alert Component
  const SuccessAlert = () => (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
      <div className="flex items-center justify-between">
        <div>
          <strong className="font-bold">🎉 Berhasil! </strong>
          <span className="block sm:inline">
            Laporan Anda telah berhasil dikirim
            {submittedTicketId ? ` dengan ID #${submittedTicketId}` : ''}.
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleViewTicket}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            Lihat {submittedTicketId ? 'Detail' : 'Dashboard'}
          </button>
        </div>
      </div>
      <div className="mt-2 text-sm">
        Anda akan dialihkan ke halaman{' '}
        {submittedTicketId ? 'detail tiket' : 'dashboard'} dalam 3 detik...
      </div>
    </div>
  );

  // Error Alert Component
  const ErrorAlert = () => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <strong className="font-bold">❌ Error! </strong>
          <span className="block mt-1">{error}</span>

          {error.includes('server') && (
            <div className="mt-2 text-sm bg-red-50 p-2 rounded">
              <strong>Tips:</strong> Server mungkin sedang maintenance. Coba
              lagi dalam beberapa menit.
            </div>
          )}

          {error.includes('koneksi') && (
            <div className="mt-2 text-sm bg-red-50 p-2 rounded">
              <strong>Tips:</strong>
              <ul className="list-disc list-inside mt-1">
                <li>Periksa koneksi internet Anda</li>
                <li>Refresh halaman dan coba lagi</li>
                <li>Gunakan koneksi yang lebih stabil</li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-2 ml-4">
          {retryCount < 3 && (
            <button
              onClick={handleRetrySubmit}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Mencoba...' : 'Coba Lagi'}
            </button>
          )}
          <button
            onClick={() => setError('')}
            className="text-red-500 hover:text-red-700 text-lg font-bold"
          >
            ×
          </button>
        </div>
      </div>

      {retryCount >= 3 && (
        <div className="mt-3 p-2 bg-red-50 rounded text-sm">
          <strong>Sudah mencoba {retryCount} kali.</strong> Silakan:
          <ul className="list-disc list-inside mt-1">
            <li>Periksa koneksi internet</li>
            <li>Refresh halaman</li>
            <li>Hubungi administrator jika masalah berlanjut</li>
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg w-full max-w-full px-4">
      {isSubmitted && <SuccessAlert />}
      {error && <ErrorAlert />}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Bagian 1: Identitas Pelapor */}
        <div>
          <h2 className="text-lg font-semibold mb-6 text-gray-900 py-6">
            Identitas Pelapor
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="nama" required={!formData.anonymous}>
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
                required={!formData.anonymous}
              />
            </div>

            <div>
              <Label htmlFor="nim" required={!formData.anonymous}>
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
                required={!formData.anonymous}
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
              <Label htmlFor="email" required={!formData.anonymous}>
                Email
              </Label>
              <TextField
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Masukkan email Anda"
                disabled={formData.anonymous || !!user?.email}
                className={`mt-1 ${
                  formData.anonymous || !!user?.email ? 'bg-gray-100' : ''
                }`}
                required={!formData.anonymous}
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
                required
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
                options={getSubCategoriesForCategory(formData.kategori)}
                placeholder="Pilih Sub Kategori"
                disabled={!formData.kategori}
                className="mt-1"
                required
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
              placeholder="Berikan judul yang singkat dan jelas (minimal 5 karakter)"
              className="mt-1"
              required
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
              placeholder="Sampaikan secara detail keluhan atau laporan Anda... (minimal 10 karakter)"
              rows={6}
              className="mt-1"
              required
            />
          </div>

          {/* UPDATED Lampiran Section dengan preview */}
          <div className="mb-6">
            <Label>
              Lampiran (opsional)
              <span className="text-sm text-gray-500 font-normal">
                Maksimal 5 MB (.jpg, .png, .pdf)
              </span>
            </Label>

            {/* File Upload Area */}
            <div className="mt-2">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-input"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                >
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
                      <span className="font-semibold">Klik untuk Upload</span>{' '}
                      atau drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG atau PDF (Maks. 5MB)
                    </p>
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            {/* File Preview */}
            {selectedFile && (
              <div className="mt-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {/* File Icon */}
                    <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg">
                      {selectedFile.type.startsWith('image/') ? (
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-6 h-6 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </div>

                    {/* File Info */}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedFile.type} •{' '}
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Image Preview */}
                {filePreview && selectedFile.type.startsWith('image/') && (
                  <div className="mt-3">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="max-w-full h-48 object-contain border border-gray-200 rounded-lg bg-gray-50"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                <span>
                  Mengirim...{' '}
                  {retryCount > 0 && `(Percobaan ${retryCount + 1})`}
                </span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                <span>Kirim Laporan</span>
              </>
            )}
          </button>
        </div>

        {/* Catatan dan Submit */}
        <div className="border-t pt-6">
          <div className="text-sm text-gray-600 mb-6">
            <p className="mb-2">
              <span className="font-medium">Catatan:</span> Kolom bertanda{' '}
              <span className="text-red-500">*</span> wajib diisi
            </p>
            <p>Laporan Anda akan ditindaklanjuti dalam waktu 3x24 jam kerja.</p>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium mb-2">
                💡 Tips mengisi form:
              </p>
              <ul className="text-blue-700 text-xs space-y-1">
                <li>
                  • Judul minimal 5 karakter, deskripsi minimal 10 karakter
                </li>
                <li>• Pilih kategori dan sub kategori yang sesuai</li>
                <li>• Jika anonymous, data identitas tidak perlu diisi</li>
                <li>• Pastikan email valid untuk mendapat notifikasi</li>
                <li>• Lampiran opsional: JPG, PNG, PDF maksimal 5MB</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Form;
