import React, { useState, useEffect } from 'react';
import { sendEmailAPI } from '../../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

const validators = {
  required: (value, fieldName) => {
    if (!value?.trim()) {
      return `${fieldName} harus diisi`;
    }
    return null;
  },

  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value?.trim())) {
      return 'Format email tidak valid';
    }
    if (value?.includes(' ')) {
      return 'Email tidak boleh mengandung spasi';
    }
    return null;
  },

  minLength: (value, min, fieldName) => {
    if (value?.trim().length < min) {
      return `${fieldName} minimal ${min} karakter`;
    }
    return null;
  },
};

const AdminEmailManagement = () => {
  const [activeTab, setActiveTab] = useState('compose');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Email form state
  const [emailForm, setEmailForm] = useState({
    to_email: '',
    subject: '',
    body: '',
  });

  const navigate = useNavigate();
  const location = useLocation();
  const ticketInfo = location.state;

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      // Default kembali ke admin dashboard
      navigate('/admin/tickets');
    }
  };

  const handleEmailFormChange = (e) => {
    const { name, value } = e.target;
    setEmailForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation configuration
    const validationConfig = [
      () => validators.required(emailForm.to_email, 'Email tujuan'),
      () => validators.required(emailForm.subject, 'Subject email'),
      () => validators.required(emailForm.body, 'Isi email'),
      () => validators.email(emailForm.to_email),
      () => validators.minLength(emailForm.subject, 3, 'Subject'),
      () => validators.minLength(emailForm.body, 10, 'Isi email'),
    ];

    // Run validation
    const validationError = validationConfig
      .map((validate) => validate())
      .find((error) => error !== null);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSending(true);
      const result = await sendEmailAPI(emailForm);

      if (result.success) {
        setSuccess(`Email berhasil dikirim ke ${emailForm.to_email}!`);

        // Reset form
        setEmailForm({
          to_email: '',
          subject: '',
          body: '',
        });

        setError('');

        // Auto hide success message after 5 seconds
        setTimeout(() => {
          setSuccess('');
        }, 5000);
      } else {
        setError('Gagal mengirim email: ' + result.message);
      }
    } catch (error) {
      setError('Gagal mengirim email: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded transition-all hover:shadow-xl hover:scale-105 duration-300"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 10H18M2 10L10 2M2 10L10 18"
                stroke="#444746"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Email Management
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola dan kirim email kepada pengguna sistem
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('compose')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'compose'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Compose Email
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Compose Email Tab */}
          {activeTab === 'compose' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Kirim Email Baru
              </h2>

              {/* Email Form */}
              <form onSubmit={handleSendEmail} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Tujuan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="to_email"
                    value={emailForm.to_email}
                    onChange={handleEmailFormChange}
                    required
                    placeholder="contoh@telkomuniversity.ac.id"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={emailForm.subject}
                    onChange={handleEmailFormChange}
                    required
                    placeholder="Masukkan subject email..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Isi Email <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="body"
                    value={emailForm.body}
                    onChange={handleEmailFormChange}
                    required
                    rows={8}
                    placeholder="Tulis isi email di sini..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={sending}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      sending
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {sending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Mengirim...
                      </div>
                    ) : (
                      'Kirim Email'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEmailManagement;
