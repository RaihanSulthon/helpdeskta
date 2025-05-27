// src/api/api.js

const BASE_URL =
  "https://sturdy-couscous-6754px5r75pc5xpx-8000.app.github.dev/api"; // Ganti dengan base URL API kamu

export const loginAPI = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Login gagal");
  }

  return result; // hasil: { token, user }
};
