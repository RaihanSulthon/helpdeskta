// src/services/api.js

const BASE_URL =
  "https://sturdy-couscous-6754px5r75pc5xpx-8000.app.github.dev/api";

export const loginAPI = async (email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Login gagal");
    }

    // Response dari API Anda memiliki struktur:
    // {
    //   "status": "success",
    //   "message": "Login successful",
    //   "data": {
    //     "user": { "id": "...", "name": "...", "email": "...", "role": "..." },
    //     "token": "..."
    //   }
    // }

    return {
      user: result.data.user,
      token: result.data.token,
    };
  } catch (error) {
    console.error("Login API Error:", error);
    throw new Error(error.message || "Terjadi kesalahan saat login");
  }
};
