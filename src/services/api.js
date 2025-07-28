const BASE_URL = 'https://apibackendtio.mynextskill.com/api';

// Helper function untuk retry logic
const retryFetch = async (url, options, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      // Wait before retry (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
};

export { retryFetch };

// Get Ticket Statistics API - ADMIN ONLY
export const getTicketStatisticsAPI = async (filters = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    const queryParams = new URLSearchParams();
    if (filters.date_from) queryParams.append('date_from', filters.date_from);
    if (filters.date_to) queryParams.append('date_to', filters.date_to);
    if (filters.period) queryParams.append('period', filters.period);

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/tickets/statistics${queryString ? `?${queryString}` : ''
      }`;

    console.log('Fetching ticket statistics from:', url);

    const response = await retryFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Get Ticket Statistics API response:', result);

    // Extract statistics from response
    if (result.status === 'success' && result.data) {
      return result.data;
    }

    return {
      total: 0,
      new: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
      unread: 0,
      by_category: [],
    };
  } catch (error) {
    console.error('Get Ticket Statistics API Error:', error);
    throw new Error(
      error.message || 'Terjadi kesalahan saat mengambil statistik tiket'
    );
  }
};

// FAQ API Functions
// Get All FAQs API
export const getFAQsAPI = async (filters = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    const queryParams = new URLSearchParams();
    if (filters.category_id)
      queryParams.append('category_id', filters.category_id);
      if (filters.search) {
        queryParams.append('search', filters.search);
        queryParams.append('search_field', 'question'); // Hanya cari di field question
      }
    queryParams.append('per_page', filters.per_page || '10');
    queryParams.append('page', filters.page || '1');

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/faqs${queryString ? `?${queryString}` : ''}`;

    console.log('Fetching FAQs from:', url);

    const response = await retryFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Get FAQs API response:', result);

    // Extract FAQs from response
    if (result?.data?.data) {
      return result.data.data;
    }
    if (result?.data && Array.isArray(result.data)) {
      return result.data;
    }
    if (Array.isArray(result)) {
      return result;
    }

    return [];
  } catch (error) {
    console.error('Get FAQs API Error:', error);
    throw new Error(
      error.message || 'Terjadi kesalahan saat mengambil data FAQ'
    );
  }
};

export const getFAQsAdminAPI = async (filters = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    const queryParams = new URLSearchParams();
    if (filters.category_id)
      queryParams.append('category_id', filters.category_id);
      if (filters.search) {
        queryParams.append('search', filters.search);
        queryParams.append('search_field', 'question'); // Hanya cari di field question
      }
    queryParams.append('per_page', '100');
    queryParams.append('page', '1');

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/admin/faqs${queryString ? `?${queryString}` : ''}`;

    const response = await retryFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Get Admin FAQs API response:', result);

    // Extract FAQs from response
    if (result?.data?.data) {
      return result.data.data;
    }
    if (result?.data && Array.isArray(result.data)) {
      return result.data;
    }
    if (Array.isArray(result)) {
      return result;
    }

    return [];
  } catch (error) {
    console.error('Get Admin FAQs API Error:', error);
    throw new Error(
      error.message || 'Terjadi kesalahan saat mengambil data FAQ admin'
    );
  }
};

export const getFAQByIdAPI = async (faqId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    if (!faqId) {
      throw new Error('ID FAQ tidak valid');
    }

    console.log('Fetching FAQ by ID:', faqId);

    const response = await retryFetch(`${BASE_URL}/faqs/${faqId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Get FAQ By ID API response:', result);

    // Extract FAQ from response
    if (result?.data) {
      return result.data;
    }

    return result;
  } catch (error) {
    console.error('Get FAQ By ID API Error:', error);
    throw new Error(error.message || 'Gagal mengambil detail FAQ');
  }
};

export const getFAQByIdAdminAPI = async (faqId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    if (!faqId) {
      throw new Error('ID FAQ tidak valid');
    }

    console.log('Fetching FAQ by ID (Admin):', faqId);

    const response = await retryFetch(`${BASE_URL}/admin/faqs/${faqId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Get FAQ By ID Admin API response:', result);

    // Extract FAQ from response
    if (result?.data) {
      return result.data;
    }

    return result;
  } catch (error) {
    console.error('Get FAQ By ID Admin API Error:', error);
    throw new Error(error.message || 'Gagal mengambil detail FAQ admin');
  }
};

// Create FAQ API
export const createFAQAPI = async (faqData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    // Validasi input
    if (!faqData.question || faqData.question.trim() === '') {
      throw new Error('Pertanyaan harus diisi');
    }

    if (!faqData.answer || faqData.answer.trim() === '') {
      throw new Error('Jawaban harus diisi');
    }

    // Prepare request body
    const requestBody = {
      question: faqData.question.trim(),
      answer: faqData.answer.trim(),
      category_id: parseInt(faqData.category_id) || 1,
      is_public: Boolean(faqData.is_public !== false),
    };

    console.log('Creating FAQ with data:', requestBody);

    // Configure request options
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify(requestBody),
    };

    const response = await retryFetch(`${BASE_URL}/faqs`, options);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Create FAQ response:', result);

    return {
      success: true,
      message: result.message || 'FAQ berhasil dibuat',
      data: result.data || result,
    };

  } catch (error) {
    console.error('Create FAQ API Error:', error);
    throw new Error(error.message || 'Gagal membuat FAQ');
  }
};

// Update FAQ API
export const updateFAQAPI = async (faqId, faqData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    if (!faqId) {
      throw new Error('ID FAQ tidak valid');
    }

    const requestBody = {};
    if (faqData.question) requestBody.question = faqData.question.trim();
    if (faqData.answer) requestBody.answer = faqData.answer.trim();
    if (faqData.category_id)
      requestBody.category_id = parseInt(faqData.category_id);
    if (faqData.hasOwnProperty('is_public'))
      requestBody.is_public = Boolean(faqData.is_public);

    console.log('Updating FAQ:', { faqId, requestBody });

    const options = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify(requestBody),
    };

    const response = await retryFetch(`${BASE_URL}/faqs/${faqId}`, options);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Update FAQ response:', result);

    return {
      success: true,
      message: result.message || 'FAQ berhasil diupdate',
      data: result.data || result,
    };
  } catch (error) {
    console.error('Update FAQ API Error:', error);
    throw new Error(error.message || 'Gagal mengupdate FAQ');
  }
};

// Delete FAQ API
export const deleteFAQAPI = async (faqId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    if (!faqId) {
      throw new Error('ID FAQ tidak valid');
    }

    console.log('Deleting FAQ:', faqId);

    const options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
    };

    const response = await retryFetch(`${BASE_URL}/faqs/${faqId}`, options);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Delete FAQ response:', result);

    return {
      success: true,
      message: result.message || 'FAQ berhasil dihapus',
    };
  } catch (error) {
    console.error('Delete FAQ API Error:', error);
    throw new Error(error.message || 'Gagal menghapus FAQ');
  }
};

// Update Ticket Status API - NEW for Admin
export const updateTicketStatusAPI = async (ticketId, newStatus) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    if (!ticketId) {
      throw new Error('ID tiket tidak valid');
    }

    const requestBody = {
      status: newStatus, // e.g. "open", "in_progress", "completed"
    };

    console.log('Updating ticket status:', { ticketId, newStatus });

    const options = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify(requestBody),
    };

    const response = await retryFetch(
      `${BASE_URL}/tickets/${ticketId}/status`,
      options
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Update status response:', result);

    return {
      success: true,
      message: result.message || 'Status tiket berhasil diupdate',
      data: result.data || result,
    };
  } catch (error) {
    console.error('Update Ticket Status API Error:', error);
    throw new Error(error.message || 'Gagal mengupdate status tiket');
  }
};

// Get Admin Tickets API - for all tickets from all users
export const getAdminTicketsAPI = async (filters = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.date) queryParams.append('date', filters.date);
    if (filters.user_id) queryParams.append('user_id', filters.user_id);
    if (filters.search) queryParams.append('search', filters.search);

    // Get more data for admin view
    queryParams.append('per_page', filters.per_page || '200');
    queryParams.append('page', filters.page || '1');

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/tickets${queryString ? `?${queryString}` : ''}`;

    const response = await retryFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    // Extract tickets from response
    if (result?.data?.tickets) {
      return result.data.tickets;
    }
    if (result?.data && Array.isArray(result.data)) {
      return result.data;
    }
    if (Array.isArray(result)) {
      return result;
    }

    console.warn('Unexpected API response format:', result);
    return [];
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        'Koneksi ke server gagal. Pastikan server berjalan dan coba lagi.'
      );
    }
    throw new Error(
      error.message || 'Terjadi kesalahan saat mengambil data tiket admin'
    );
  }
};

// Signup API
export const signUpAPI = async (userData) => {
  try {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify(userData),
    };

    // Endpoint untuk registrasi biasanya /auth/register atau /register
    const response = await retryFetch(`${BASE_URL}/auth/register`, options);
    const result = await response.json();

    if (!response.ok) {
      // Menangani error validasi dari server
      if (response.status === 422 && result.errors) {
        const errorMessages = Object.values(result.errors).flat().join(', ');
        throw new Error(`Registrasi gagal: ${errorMessages}`);
      }
      throw new Error(result.message || 'Registrasi gagal. Terjadi kesalahan pada server.');
    }

    // Jika berhasil, backend biasanya mengembalikan data user yang baru dibuat
    return {
      success: true,
      message: result.message || 'Registrasi berhasil!',
      data: result.data,
    };
  } catch (error) {
    console.error('Sign Up API Error:', error);
    throw new Error(error.message || 'Tidak dapat terhubung ke server. Silakan coba lagi.');
  }
};

// Login API
export const loginAPI = async (email, password) => {
  try {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    };

    const response = await retryFetch(`${BASE_URL}/auth/login`, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Login gagal');
    }

    return {
      user: result.data.user,
      token: result.data.token,
    };
  } catch (error) {
    console.error('Login API Error:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        'Tidak dapat terhubung ke server. Pastikan server berjalan dan coba lagi.'
      );
    }
    throw new Error(error.message || 'Terjadi kesalahan saat login');
  }
};

export const getUserProfileAPI = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
    };

    const response = await retryFetch(`${BASE_URL}/auth/profile`, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Gagal mengambil profil user');
    }

    return result.data.user;
  } catch (error) {
    console.error('Get User Profile API Error:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        'Tidak dapat terhubung ke server. Pastikan server berjalan dan coba lagi.'
      );
    }
    throw new Error(error.message || 'Terjadi kesalahan saat mengambil profil user');
  }
};

// Logout API
export const logoutAPI = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      // If no token, consider it already logged out
      return { success: true, message: 'Already logged out' };
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
    };

    const response = await retryFetch(`${BASE_URL}/auth/logout`, options);
    const result = await response.json();

    if (!response.ok) {
      // Even if logout fails on server, we should still clear local data
      console.warn(
        'Server logout failed, but clearing local data:',
        result.message
      );
    }

    return {
      success: true,
      message: result.message || 'Logged out successfully',
    };
  } catch (error) {
    console.error('Logout API Error:', error);
    // Don't throw error for logout - always clear local data
    return {
      success: true,
      message: 'Logged out locally (server may be unreachable)',
    };
  }
};

export const submitTicketAPI = async (formData, file = null) => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    console.log('=== API SUBMISSION DEBUG ===');
    console.log('Input form data:', formData);
    console.log('Input file:', file);

    // Validate required fields before sending
    if (!formData.judul || formData.judul.trim() === '') {
      throw new Error('Judul laporan harus diisi');
    }

    if (!formData.deskripsi || formData.deskripsi.trim() === '') {
      throw new Error('Deskripsi harus diisi');
    }

    if (!formData.category_id || isNaN(parseInt(formData.category_id))) {
      throw new Error('Kategori harus dipilih');
    }

    if (
      !formData.sub_category_id ||
      isNaN(parseInt(formData.sub_category_id))
    ) {
      throw new Error('Sub kategori harus dipilih');
    }

    // Validate file if provided
    if (file) {
      const allowedTypes = [
        'image/png',
        'image/jpeg',
        'application/pdf',
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          'Tipe file tidak diizinkan. Gunakan PNG, JPG, atau PDF.'
        );
      }

      if (file.size > maxSize) {
        throw new Error('Ukuran file terlalu besar. Maksimal 5MB.');
      }
    }

    // Prepare request data
    let requestBody;
    let headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // Use FormData for file upload
    if (file) {
      requestBody = new FormData();

      // Add all form fields
      requestBody.append('judul', formData.judul.trim());
      requestBody.append('deskripsi', formData.deskripsi.trim());
      requestBody.append('category_id', parseInt(formData.category_id));
      requestBody.append('sub_category_id', parseInt(formData.sub_category_id));
      requestBody.append('anonymous', formData.anonymous ? '1' : '0');

      // Add identity fields based on anonymous status
      if (formData.anonymous) {
        requestBody.append('nama', 'Anonim');
        requestBody.append('nim', '0');
        requestBody.append('prodi', 'Anonim');
        requestBody.append('semester', '0');
        requestBody.append(
          'email',
          formData.email ? formData.email.trim() : ''
        );
        requestBody.append('no_hp', '0');
      } else {
        requestBody.append('nama', formData.nama ? formData.nama.trim() : '');
        requestBody.append('nim', formData.nim ? formData.nim.trim() : '');
        requestBody.append(
          'prodi',
          formData.prodi ? formData.prodi.trim() : ''
        );
        requestBody.append(
          'semester',
          formData.semester ? formData.semester.toString() : ''
        );
        requestBody.append(
          'email',
          formData.email ? formData.email.trim() : ''
        );
        requestBody.append(
          'no_hp',
          formData.no_hp ? formData.no_hp.trim() : ''
        );
      }

      // Add file with key "lampiran"
      requestBody.append('lampiran', file);

      // Don't set Content-Type for FormData, browser will set it automatically
    } else {
      // Use JSON for requests without files
      headers['Content-Type'] = 'application/json';

      const requestData = {
        judul: formData.judul.trim(),
        deskripsi: formData.deskripsi.trim(),
        category_id: parseInt(formData.category_id),
        sub_category_id: parseInt(formData.sub_category_id),
        anonymous: formData.anonymous ? '1' : '0',
      };

      if (formData.anonymous) {
        requestData.nama = 'Anonim';
        requestData.nim = '0';
        requestData.prodi = 'Anonim';
        requestData.semester = '0';
        requestData.email = formData.email ? formData.email.trim() : '';
        requestData.no_hp = '0';
      } else {
        requestData.nama = formData.nama ? formData.nama.trim() : '';
        requestData.nim = formData.nim ? formData.nim.trim() : '';
        requestData.prodi = formData.prodi ? formData.prodi.trim() : '';
        requestData.semester = formData.semester
          ? formData.semester.toString()
          : '';
        requestData.email = formData.email ? formData.email.trim() : '';
        requestData.no_hp = formData.no_hp ? formData.no_hp.trim() : '';
      }

      requestBody = JSON.stringify(requestData);
    }

    console.log('Making API request to:', `${BASE_URL}/tickets`);
    console.log('Request headers:', headers);

    const options = {
      method: 'POST',
      headers,
      mode: 'cors',
      credentials: 'omit',
      body: requestBody,
    };

    const response = await retryFetch(`${BASE_URL}/tickets`, options, 3);

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));

    // Handle non-200 responses
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorResult = await response.json();
        console.log('Error response body:', errorResult);

        // Handle Laravel validation errors (422 status)
        if (response.status === 422 && errorResult.errors) {
          const validationErrors = Object.entries(errorResult.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
          errorMessage = `Validation failed - ${validationErrors}`;
        } else if (response.status === 422 && errorResult.message) {
          errorMessage = `Validation failed: ${errorResult.message}`;
        } else if (errorResult.message) {
          errorMessage = errorResult.message;
        }
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
        errorMessage = `HTTP ${response.status}: Server error occurred`;
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Success response body:', result);

    return {
      success: true,
      message: result.message || 'Tiket berhasil dikirim',
      data: result.data || result,
      id: result.data?.id || result.id || null,
    };
  } catch (error) {
    console.error('Submit Ticket API Error:', error);

    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        'Koneksi ke server gagal. Periksa koneksi internet Anda.'
      );
    }

    if (error.message.includes('CORS')) {
      throw new Error('Server tidak mengizinkan akses. Hubungi administrator.');
    }

    if (error.message.includes('Failed to fetch')) {
      throw new Error(
        'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
      );
    }

    // Re-throw with original message for specific errors
    throw error;
  }
};

// Get Tickets API
export const getTicketsAPI = async (filters = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.date) queryParams.append('date', filters.date);
    queryParams.append('per_page', '100');
    queryParams.append('page', '1');

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/tickets${queryString ? `?${queryString}` : ''}`;

    const response = await retryFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Get Tickets API response:', result);

    // Extract tickets from response
    if (result?.data?.tickets) {
      return result.data.tickets;
    }
    if (result?.data && Array.isArray(result.data)) {
      return result.data;
    }
    if (Array.isArray(result)) {
      return result;
    }

    return [];
  } catch (error) {
    console.error('Get Tickets API Error:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        'Koneksi ke server gagal. Pastikan server berjalan dan coba lagi.'
      );
    }
    throw new Error(
      error.message || 'Terjadi kesalahan saat mengambil data tiket'
    );
  }
};
// Add this function to your api.js file:

// Get FAQ Categories API
export const getFAQCategoriesAPI = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    console.log('Fetching FAQ categories...');

    const response = await retryFetch(`${BASE_URL}/faqs/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    // console.log('Get FAQ Categories API response:', result);

    // Extract categories from response
    if (result?.data && Array.isArray(result.data)) {
      return result.data;
    }
    if (Array.isArray(result)) {
      return result;
    }

    return [];
  } catch (error) {
    console.error('Get FAQ Categories API Error:', error);

    // Return fallback categories if API fails
    console.warn('Using fallback FAQ categories due to API error');
    return [
      { id: 1, name: 'Facilities' },
      { id: 2, name: 'Academic' },
      { id: 3, name: 'General' },
    ];
  }
};
// Get Ticket Detail API
export const getTicketDetailAPI = async (ticketId) => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    if (!ticketId) {
      throw new Error('ID tiket tidak valid');
    }

    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
    };

    const response = await retryFetch(
      `${BASE_URL}/tickets/${ticketId}`,
      options
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Tiket tidak ditemukan');
      }
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    // Handle the response structure based on the Postman response
    // The API returns: { status: "success", data: { ticket: {...} } }
    if (result.status === 'success' && result.data && result.data.ticket) {
      return result.data.ticket;
    } else if (result.data) {
      console.log('Using result.data:', result.data);
      return result.data;
    } else {
      console.log('Using full result:', result);
      return result;
    }
  } catch (error) {
    console.error('Get Ticket Detail API Error:', error);

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        'Koneksi ke server gagal. Pastikan server berjalan dan coba lagi.'
      );
    }

    throw new Error(
      error.message || 'Terjadi kesalahan saat mengambil detail tiket'
    );
  }
};

// Get Categories API
export const getCategoriesAPI = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
    };

    const response = await retryFetch(`${BASE_URL}/categories`, options);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    // console.log('Categories API response:', result);

    // Handle the response structure: { status, message, data: [...] }
    const categories = result.data || result || [];

    // Ensure each category has the expected structure
    const processedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      sub_categories: category.sub_categories || [],
      created_at: category.created_at,
      updated_at: category.updated_at,
    }));
    return processedCategories;
  } catch (error) {
    console.error('Get Categories API Error:', error);

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      // Return fallback categories if API fails
      console.warn('Using fallback categories due to connection error');
      return [
        {
          id: 1,
          name: 'Pendidikan',
          sub_categories: [
            { id: 1, name: 'Kurikulum', category_id: 1 },
            { id: 2, name: 'Tenaga Pengajar', category_id: 1 },
            { id: 3, name: 'Fasilitas Pendidikan', category_id: 1 },
            { id: 4, name: 'Lainnya', category_id: 1 },
          ],
        },
        {
          id: 2,
          name: 'Kesehatan',
          sub_categories: [
            { id: 5, name: 'Fasilitas Kesehatan', category_id: 2 },
            { id: 6, name: 'Layanan Kesehatan', category_id: 2 },
            { id: 7, name: 'Lainnya', category_id: 2 },
          ],
        },
        {
          id: 3,
          name: 'Infrastruktur',
          sub_categories: [
            { id: 8, name: 'Jalan', category_id: 3 },
            { id: 9, name: 'Bangunan', category_id: 3 },
            { id: 10, name: 'Air Bersih', category_id: 3 },
            { id: 11, name: 'Lainnya', category_id: 3 },
          ],
        },
        {
          id: 4,
          name: 'Pelayanan Publik',
          sub_categories: [
            { id: 12, name: 'Layanan Administrasi', category_id: 4 },
            { id: 13, name: 'Layanan Online', category_id: 4 },
            { id: 14, name: 'Lainnya', category_id: 4 },
          ],
        },
        {
          id: 5,
          name: 'Lainnya',
          sub_categories: [{ id: 15, name: 'Lainnya', category_id: 5 }],
        },
      ];
    }

    throw new Error(
      error.message || 'Terjadi kesalahan saat mengambil data kategori'
    );
  }
};

export const getCategoryByIdAPI = async (categoryId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    const response = await retryFetch(`${BASE_URL}/categories/${categoryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Get Category By ID API response:', result);

    return result.data || result;
  } catch (error) {
    console.error('Get Category By ID API Error:', error);
    throw new Error(
      error.message || 'Terjadi kesalahan saat mengambil data kategori'
    );
  }
};

export const getChatMessagesAPI = async (ticketId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    if (!ticketId) {
      throw new Error('ID tiket tidak valid');
    }

    const response = await retryFetch(`${BASE_URL}/tickets/${ticketId}/chat`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    // Extract messages from response
    let messages = [];
    if (result?.data && Array.isArray(result.data)) {
      messages = result.data;
    } else if (Array.isArray(result)) {
      messages = result;
    }

    return messages;
  } catch (error) {
    console.error('Get Chat Messages API Error:', error);
    throw new Error(error.message || 'Gagal memuat pesan chat');
  }
};

// Send Chat Message API
export const sendChatMessageAPI = async (ticketId, message, file = null) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    if (!ticketId) {
      throw new Error('ID tiket tidak valid');
    }

    if (!message || message.trim() === '') {
      throw new Error('Pesan tidak boleh kosong');
    }

    // Validasi file jika ada
    if (file) {
      const allowedTypes = [
        'image/png',
        'image/jpeg',  // MIME type yang benar untuk file .jpg/.jpeg
        'application/pdf',
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          'Tipe file tidak diizinkan. Gunakan PNG, JPG, atau PDF.'
        );
      }

      if (file.size > maxSize) {
        throw new Error('Ukuran file terlalu besar. Maksimal 5MB.');
      }
    }

    let requestBody;
    let headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };

    if (file) {
      // Gunakan FormData untuk upload file
      requestBody = new FormData();
      requestBody.append('message', message.trim());
      requestBody.append('is_system_message', 'false');
      requestBody.append('file', file);
      // Jangan set Content-Type untuk FormData, browser akan set otomatis
    } else {
      // Gunakan JSON untuk pesan biasa
      headers['Content-Type'] = 'application/json';
      requestBody = JSON.stringify({
        message: message.trim(),
        is_system_message: false,
      });
    }

    console.log('Sending chat message:', {
      ticketId,
      message,
      hasFile: !!file,
      fileName: file?.name,
    });

    const response = await retryFetch(`${BASE_URL}/tickets/${ticketId}/chat`, {
      method: 'POST',
      headers,
      mode: 'cors',
      credentials: 'omit',
      body: requestBody,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Send Chat Message API response:', result);

    return {
      success: true,
      message: result.message || 'Pesan berhasil dikirim',
      data: result.data || result,
    };
  } catch (error) {
    console.error('Send Chat Message API Error:', error);
    throw new Error(error.message || 'Gagal mengirim pesan');
  }
};

// Delete Ticket API - Soft delete for students
export const deleteTicketAPI = async (ticketId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    if (!ticketId) {
      throw new Error('ID tiket tidak valid');
    }

    console.log('Deleting ticket:', ticketId);

    const options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
    };

    const response = await retryFetch(
      `${BASE_URL}/tickets/${ticketId}`,
      options
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Delete ticket response:', result);

    return {
      success: true,
      message: result.message || 'Tiket berhasil dihapus',
      data: result.data || result,
    };
  } catch (error) {
    console.error('Delete Ticket API Error:', error);
    throw new Error(error.message || 'Gagal menghapus tiket');
  }
};

// Delete Multiple Tickets API
export const deleteMultipleTicketsAPI = async (ticketIds) => {
  try {
    const results = [];
    const errors = [];

    for (const ticketId of ticketIds) {
      try {
        const result = await deleteTicketAPI(ticketId);
        results.push({ ticketId, success: true, ...result });
      } catch (error) {
        errors.push({ ticketId, error: error.message });
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors,
      deletedCount: results.length,
      errorCount: errors.length,
    };
  } catch (error) {
    console.error('Delete Multiple Tickets API Error:', error);
    throw new Error(error.message || 'Gagal menghapus tiket');
  }
};

// Send Email API - Dynamic format detection
export const sendEmailAPI = async (emailData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    if (!emailData.to_email || emailData.to_email.trim() === '') {
      throw new Error('Email tujuan harus diisi');
    }

    if (!emailData.subject || emailData.subject.trim() === '') {
      throw new Error('Subject email harus diisi');
    }

    if (!emailData.body || emailData.body.trim() === '') {
      throw new Error('Isi email harus diisi');
    }

    // Try different formats based on common API patterns
    const requestFormats = [
      // Format 1: Based on validation error
      {
        email: emailData.to_email.trim(),
        subject: emailData.subject.trim(),
        body: emailData.body.trim(),
      },
      // Format 2: Alternative naming
      {
        to_email: emailData.to_email.trim(),
        subject: emailData.subject.trim(),
        content: emailData.body.trim(),
      },
      // Format 3: Another common pattern
      {
        recipient: emailData.to_email.trim(),
        subject: emailData.subject.trim(),
        message: emailData.body.trim(),
      },
    ];

    let lastError = null;

    // Try each format until one works
    for (let i = 0; i < requestFormats.length; i++) {
      const requestBody = requestFormats[i];

      try {
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          mode: 'cors',
          credentials: 'omit',
          body: JSON.stringify(requestBody),
        };

        const response = await retryFetch(`${BASE_URL}/emails/send`, options);

        if (response.ok) {
          const result = await response.json();
          return {
            success: true,
            message: result.message || 'Email berhasil dikirim',
            data: result.data || result,
          };
        } else {
          // Store error but continue trying other formats
          const errorResult = await response.json().catch(() => ({}));
          lastError = {
            status: response.status,
            statusText: response.statusText,
            body: errorResult,
            format: i + 1,
          };

          // If it's not a validation error, stop trying other formats
          if (response.status !== 422) {
            break;
          }
        }
      } catch (error) {
        lastError = { error, format: i + 1 };
      }
    }

    // If all formats failed, throw the last error
    if (lastError) {
      let errorMessage = 'Gagal mengirim email';

      if (lastError.status === 422) {
        if (lastError.body?.errors) {
          const validationErrors = Object.entries(lastError.body.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
          errorMessage = `Validation failed - ${validationErrors}`;
        } else if (lastError.body?.message) {
          errorMessage = `Validation failed: ${lastError.body.message}`;
        }
      } else if (lastError.body?.message) {
        errorMessage = lastError.body.message;
      } else if (lastError.error?.message) {
        errorMessage = lastError.error.message;
      }

      throw new Error(errorMessage);
    }

    throw new Error('Semua format request gagal');
  } catch (error) {
    console.error('Send Email API Error:', error);
    throw new Error(error.message || 'Gagal mengirim email');
  }
};

// Get Email Logs API
export const getEmailLogsAPI = async (filters = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.per_page) queryParams.append('per_page', filters.per_page);
    if (filters.to_email) queryParams.append('to_email', filters.to_email);
    if (filters.subject) queryParams.append('subject', filters.subject);

    // Default pagination
    if (!filters.per_page) queryParams.append('per_page', '50');
    if (!filters.page) queryParams.append('page', '1');

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/emails/logs${queryString ? `?${queryString}` : ''
      }`;

    const response = await retryFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    // Extract logs from response
    if (result?.data?.data) {
      return result.data.data;
    }
    if (result?.data && Array.isArray(result.data)) {
      return result.data;
    }
    if (Array.isArray(result)) {
      return result;
    }

    return [];
  } catch (error) {
    console.error('Get Email Logs API Error:', error);
    throw new Error(
      error.message || 'Terjadi kesalahan saat mengambil data log email'
    );
  }
};

// Get All Notifications API
export const getNotificationsAPI = async (filters = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    const queryParams = new URLSearchParams();
    if (filters.read !== undefined) queryParams.append('read', filters.read);
    if (filters.per_page) queryParams.append('per_page', filters.per_page);
    if (filters.page) queryParams.append('page', filters.page);

    // Default values
    if (!filters.per_page) queryParams.append('per_page', '15');
    if (!filters.page) queryParams.append('page', '1');

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/notifications${queryString ? `?${queryString}` : ''}`;

    const response = await retryFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Get Notifications API Error:', error);
    throw new Error(
      error.message || 'Terjadi kesalahan saat mengambil notifikasi'
    );
  }
};

// Mark Notification as Read API
export const markNotificationAsReadAPI = async (notificationId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    const response = await retryFetch(
      `${BASE_URL}/notifications/${notificationId}/read`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      }
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Mark Notification as Read API Error:', error);
    throw new Error(
      error.message ||
      'Terjadi kesalahan saat menandai notifikasi sebagai dibaca'
    );
  }
};

// Mark All Notifications as Read API
export const markAllNotificationsAsReadAPI = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    const response = await retryFetch(`${BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Mark All Notifications as Read API Error:', error);
    throw new Error(
      error.message ||
      'Terjadi kesalahan saat menandai semua notifikasi sebagai dibaca'
    );
  }
};

// Create Notification API
export const createNotificationAPI = async (notificationData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    const response = await retryFetch(`${BASE_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Create Notification API Error:', error);
    throw new Error(
      error.message || 'Terjadi kesalahan saat membuat notifikasi'
    );
  }
};

// Upload Attachment API - Untuk upload attachment terpisah
export const uploadAttachmentAPI = async (ticketId, message, file) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    if (!ticketId) {
      throw new Error('ID tiket tidak valid');
    }

    if (!file) {
      throw new Error('File attachment harus dipilih');
    }

    // Validasi file
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'application/pdf',
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        'Tipe file tidak diizinkan. Gunakan PNG, JPG, atau PDF.'
      );
    }

    if (file.size > maxSize) {
      throw new Error('Ukuran file terlalu besar. Maksimal 5MB.');
    }

    // FIXED: Berikan default message jika kosong, seperti yang dilakukan backend
    const finalMessage = message && message.trim() !== '' ? message.trim() : 'Sent an attachment';

    const formData = new FormData();
    formData.append('message', finalMessage);
    formData.append('file', file);

    console.log('Uploading attachment:', {
      ticketId,
      message: finalMessage,
      fileName: file.name,
      fileSize: file.size,
    });

    const response = await retryFetch(`${BASE_URL}/tickets/${ticketId}/chat/attachment`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Upload Attachment API response:', result);

    return {
      success: true,
      message: result.message || result,
      attachment: result.attachment || null,
      chatMessage: result.message || null,
    };
  } catch (error) {
    console.error('Upload Attachment API Error:', error);
    throw new Error(error.message || 'Gagal mengupload attachment');
  }
};

export const makeAPICall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token tidak ditemukan. Silakan login ulang.');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    mode: 'cors',
    credentials: 'omit',
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorResult = await response.json();
      errorMessage = errorResult.message || errorMessage;
    } catch (parseError) {
      console.warn('Could not parse error response:', parseError);
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

// Tambahkan ke api.js
export const getUserStatisticsAPI = async () => {
  try {
    const result = await makeAPICall('/users/statistics');
    if (result.status === 'success') {
      return result.data;
    }
    throw new Error('Failed to fetch statistics');
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw new Error(error.message || 'Gagal mengambil statistik pengguna');
  }
};

// Get All Users API
export const getAllUsersAPI = async (pagination) => {
  try {
    const apiFilters = {
      page: pagination.current_page,
      per_page: pagination.per_page,
    };
    const queryString = new URLSearchParams(apiFilters).toString();
    const endpoint = `/users?${queryString}`;
    const result = await makeAPICall(endpoint);

    if (result.status === 'success') {
      let usersData = [];
      let totalCount = 0;
      let totalPages = 1;

      if (result.data?.data) {
        usersData = result.data.data;
        totalCount = result.data.total || usersData.length;
        totalPages = Math.ceil(totalCount / pagination.per_page);
      } else if (Array.isArray(result.data)) {
        usersData = result.data;
        totalCount = usersData.length;
        totalPages = Math.ceil(totalCount / pagination.per_page);
      }

      const usersWithCheckbox = usersData.map((user) => ({
        ...user,
        isChecked: false,
        registered: new Date(user.created_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        avatar: `/api/placeholder/40/40`,
      }));

      return { users: usersWithCheckbox, totalCount, totalPages };
    }
    throw new Error('Failed to fetch users');
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error(error.message || 'Gagal mengambil data pengguna');
  }
};

// Show Anonymous Token API
export const showAnonymousTokenAPI = async (ticketId, password) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    if (!ticketId) {
      throw new Error('ID tiket tidak valid');
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({
        password: password
      }),
    };

    const response = await retryFetch(
      `${BASE_URL}/tickets/${ticketId}/reveal-token`,
      options
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    // Handle the response structure based on the Postman response
    if (result.status === 'success' && result.data) {
      return result.data;
    } else {
      return result;
    }
  } catch (error) {
    console.error('Show Anonymous Token API Error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        'Koneksi ke server gagal. Pastikan server berjalan dan coba lagi.'
      );
    }

    throw new Error(
      error.message || 'Terjadi kesalahan saat mengambil token tiket'
    );
  }
};

// Update User Role API
export const updateUserRoleAPI = async (userId, newRole) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    const response = await fetch(`${BASE_URL}/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        role: newRole
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Update user role error:', error);
    throw error;
  }
};