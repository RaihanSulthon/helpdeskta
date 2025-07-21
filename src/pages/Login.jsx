// src/pages/Login.jsx
import { useState } from 'react';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
    // Clear any error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!credentials.email || !credentials.password) {
      setError('Silakan isi email dan password!');
      return;
    }

    try {
      setIsLoading(true);

      const userData = await login(credentials.email, credentials.password);
      console.log('Login successful:', userData);

      // Navigate berdasarkan role
      switch (userData.role) {
        case 'student':
          navigate('/student');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          console.warn('Unknown role:', userData.role);
          setError(`Role tidak dikenal: ${userData.role}`);
          return;
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.message || 'Login gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk kembali ke landing page
  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-red-600 flex items-center justify-center relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          {/* Optional: Add pattern or gradient overlay here */}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 flex items-center">
        {/* Left Side - Login Info */}
        <div className="flex-1 text-white pr-12">
          {/* Back Button */}
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

          {/* Logo/Brand */}
          <div className="bg-white rounded-lg px-4 py-2 inline-block mb-8">
            <div className="text-red-600 font-bold text-lg">HELPDESK</div>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold mb-4">Login</h1>

          {/* Subtitle */}
          <p className="text-xl mb-2">Login with your SSO account</p>
          <p className="text-lg opacity-90">
            username@student.telkomuniversity.ac.id
          </p>

          {/* Additional Links */}
          <div className="mt-12 space-y-4">
            <p className="text-lg">Ada kendala?</p>
            <div className="flex flex-wrap gap-4">
              <button className="border-2 border-white rounded-full px-6 py-2 text-white hover:bg-white hover:text-red-600 transition-colors">
                Helpdesk Puti
              </button>
              <button className="border-2 border-white rounded-full px-6 py-2 text-white hover:bg-white hover:text-red-600 transition-colors">
                Informasi Registrasi Lebih Lanjut
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <span className="block">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Username SSO
              </label>
              <input
                id="email"
                name="email"
                type="text"
                value={credentials.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                placeholder="Enter your SSO username"
              />
            </div>

            {/* Password Field */}
            <div className="mb-8">
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
                  value={credentials.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                  title=""
                >
                  {showPassword ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      title=""
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: isLoading ? '#dc2626' : '#dc2626' }}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
