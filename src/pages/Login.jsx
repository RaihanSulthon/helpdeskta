// src/pages/Login.jsx
import { useState } from "react";
import "../App.css";
import TextField from "../components/TextField";
import Label from "../components/Label";
import Button from "../components/Button";
import Icon from "../components/Icon";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
    // Clear any error when user types
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!credentials.email || !credentials.password) {
      setError("Silakan isi email dan password!");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Attempting login with:", { email: credentials.email });

      const userData = await login(credentials.email, credentials.password);
      console.log("Login successful:", userData);

      // Navigate berdasarkan role
      switch (userData.role) {
        case "student":
          navigate("/student");
          break;
        case "admin":
          navigate("/admin");
          break;
        default:
          console.warn("Unknown role:", userData.role);
          setError(`Role tidak dikenal: ${userData.role}`);
          return;
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError(error.message || "Login gagal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk kembali ke landing page
  const handleBackToHome = () => {
    navigate("/");
  };

  // Fungsi untuk mengisi form dengan data test
  const fillTestData = () => {
    setCredentials({
      email: "john@student.telkomuniversity.ac.id",
      password: "password123",
    });
  };

  const backgroundStyle = {
    backgroundImage: "linear-gradient(to bottom, #0c4a80, #0e6bb8)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={backgroundStyle}
    >
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-center mb-6">
          Masuk ke Akun Anda
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email/Username Field */}
          <div className="mb-4">
            <Label htmlFor="email">Email</Label>
            <TextField
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="contoh@domain.co.id"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format email:
              <span className="text-blue-600">
                {" "}
                @student.telkomuniversity.ac.id
              </span>
              ,<span className="text-green-600"> @admin.co.id</span>
            </p>
          </div>

          {/* Password Field */}
          <div className="mb-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <div className="relative">
              <TextField
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={handleChange}
                placeholder="Masukkan Kata Sandi"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                <Icon name={showPassword ? "eyeOff" : "eye"} />
              </button>
            </div>
          </div>

          {/* Test Data Button - Hanya untuk development */}
          <div className="mb-4">
            <button
              type="button"
              onClick={fillTestData}
              className="text-xs text-gray-600 hover:text-blue-600 underline"
            >
              Isi dengan data test
            </button>
          </div>

          {/* Forgot Password */}
          <div className="text-left mb-6 mt-2">
            <a href="#" className="text-blue-600 text-sm hover:underline">
              Lupa Password?
            </a>
          </div>

          {/* Login Button */}
          <Button type="primary" className="w-full" disabled={isLoading}>
            {isLoading ? "Sedang Masuk..." : "Masuk"}
          </Button>

          {/* Signup Option */}
          <div className="text-center mt-4">
            <span className="text-gray-600">Belum memiliki akun? </span>
            <a href="#" className="text-blue-600 hover:underline">
              Daftar Sekarang
            </a>
          </div>
        </form>
      </div>

      {/* Tombol kembali (opsional) */}
      <button
        onClick={handleBackToHome}
        className="mt-4 text-white hover:underline flex items-center"
      >
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
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          ></path>
        </svg>
        Kembali ke Beranda
      </button>
    </div>
  );
}

export default Login;
