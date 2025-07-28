import { useState, useEffect } from 'react';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import { signUpAPI } from '../services/api';

function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    nim: '',
    prodi: '',
    no_hp: '',
  });

  const [role, setRole] = useState(null); // 'student', 'admin', atau null
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Efek untuk mendeteksi role berdasarkan email
  useEffect(() => {
    if (formData.email.endsWith('@student.telkomuniversity.ac.id')) {
      setRole('student');
    } else if (formData.email.endsWith('@adminhelpdesk.ac.id')) {
      setRole('admin');
    } else {
      setRole(null);
    }
  }, [formData.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validasi dasar
    if (!formData.email || !formData.password || !formData.name) {
      setError('Nama, Email, dan Password harus diisi.');
      return;
    }
    if (formData.password !== formData.password_confirmation) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }
    if (!role) {
      setError(
        'Gunakan email Telkom University (@student.telkomuniversity.ac.id).'
      );
      return;
    }

    setIsLoading(true);

    // Siapkan payload sesuai dengan role
    let payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.password_confirmation,
    };

    if (role === 'student') {
      if (!formData.nim || !formData.prodi || !formData.no_hp) {
        setError('Untuk mahasiswa, NIM, Prodi, dan No. HP harus diisi.');
        setIsLoading(false);
        return;
      }
      payload = {
        ...payload,
        nim: formData.nim,
        prodi: formData.prodi,
        no_hp: formData.no_hp,
      };
    }

    try {
      const response = await signUpAPI(payload);
      setSuccess(response.message || 'Registrasi berhasil! Silakan login.');

      // Kosongkan form setelah berhasil
      setFormData({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        nim: '',
        prodi: '',
        no_hp: '',
      });

      // Arahkan ke halaman login setelah beberapa detik
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-red-600 flex items-center justify-center relative">
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 flex items-center">
        {/* Sisi Kiri - Info */}
        <div className="flex-1 text-white pr-12 hidden md:block">
          <button
            onClick={handleBackToHome}
            className="flex items-center mb-8 text-white hover:opacity-80 transition-opacity"
          >
            <svg
              className="w-8 h-8 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div className="bg-white rounded-lg px-4 py-2 inline-block mb-8">
            <div className="text-red-600 font-bold text-lg">HELPDESK</div>
          </div>
          <h1 className="text-5xl font-bold mb-4">Sign Up</h1>
          <p className="text-xl mb-2">Buat akun Helpdesk baru Anda.</p>
        </div>

        {/* Sisi Kanan - Form Registrasi */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <span className="block">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <span className="block">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Nama Lengkap
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Email SSO
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="contoh@student.telkomuniversity.ac.id"
                required
              />
            </div>

            {/* Input tambahan untuk role 'student' */}
            {role === 'student' && (
              <>
                <div className="mb-4">
                  <label
                    htmlFor="nim"
                    className="block text-gray-700 text-sm font-medium mb-2"
                  >
                    NIM
                  </label>
                  <input
                    id="nim"
                    name="nim"
                    type="text"
                    value={formData.nim}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Masukkan NIM"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="prodi"
                    className="block text-gray-700 text-sm font-medium mb-2"
                  >
                    Program Studi
                  </label>
                  <input
                    id="prodi"
                    name="prodi"
                    type="text"
                    value={formData.prodi}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Contoh: S1 Rekayasa Perangkat Lunak"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="no_hp"
                    className="block text-gray-700 text-sm font-medium mb-2"
                  >
                    No. Handphone
                  </label>
                  <input
                    id="no_hp"
                    name="no_hp"
                    type="tel"
                    value={formData.no_hp}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Masukkan nomor HP aktif"
                    required
                  />
                </div>
              </>
            )}

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Masukkan password"
                  required
                />
              </div>
            </div>
            <div className="mb-6">
              <label
                htmlFor="password_confirmation"
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Konfirmasi Password
              </label>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type={showPassword ? 'text' : 'password'}
                value={formData.password_confirmation}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Ulangi password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Mendaftarkan...' : 'Sign Up'}
            </button>
            <p className="text-center text-sm text-gray-600 mt-4">
              Sudah punya akun?{' '}
              <a
                onClick={() => navigate('/login')}
                className="font-medium text-red-600 hover:text-red-500 cursor-pointer"
              >
                Login di sini
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
