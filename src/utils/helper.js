// Contoh file helper.js

/**
 * Mendapatkan data otentikasi dari localStorage atau sumber lainnya
 * @returns {Object} Data autentikasi
 */
export const getAuth = () => {
  try {
    // Mendapatkan data auth dari localStorage
    const authData = localStorage.getItem("auth");
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  } catch (error) {
    console.error("Error getting auth data:", error);
    return null;
  }
};

/**
 * Mendapatkan token dari localStorage atau sumber lainnya
 * @returns {string} Token autentikasi
 */
export const getToken = () => {
  const auth = getAuth();
  return auth ? auth.token : "";
};

/**
 * Menyimpan data otentikasi ke localStorage
 * @param {Object} authData - Data autentikasi yang akan disimpan
 */
export const setAuth = (authData) => {
  try {
    localStorage.setItem("auth", JSON.stringify(authData));
  } catch (error) {
    console.error("Error saving auth data:", error);
  }
};

/**
 * Menghapus data otentikasi dari localStorage (logout)
 */
export const clearAuth = () => {
  try {
    localStorage.removeItem("auth");
  } catch (error) {
    console.error("Error clearing auth data:", error);
  }
};
