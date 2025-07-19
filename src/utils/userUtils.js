let userCache = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10 menit

export const getCurrentUserId = () => {
  try {
    // Coba ambil dari localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed.id || parsed.user_id || null;
    }

    // Coba ambil dari token decode (jika ada)
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decoded = JSON.parse(jsonPayload);
        return decoded.sub || decoded.user_id || decoded.id || null;
      } catch (e) {
        console.warn('Failed to decode token:', e);
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

// Fetch admin ID dinamis dari API  
export const getAdminId = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token');

    const response = await fetch('https://apibackendtio.mynextskill.com/api/users?role=admin', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('API failed');

    const result = await response.json();
    const admins = result.data || result || [];
    
    // Return first admin ID
    return admins[0]?.id || null;
  } catch (error) {
    console.error('Error getting admin ID:', error);
    return null;
  }
};

export const getRecipientId = (ticketData, targetRole) => {
  if (targetRole === 'admin') {
    return getAdminId();
  } else if (targetRole === 'student') {
    return Promise.resolve(
      ticketData?.user_id || 
      ticketData?.student_id || 
      ticketData?.sender_id || 
      ticketData?.created_by ||
      null
    );
  }
  return Promise.resolve(null);
};

// Fetch user data from API
const fetchUserData = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const response = await fetch(`https://apibackendtio.mynextskill.com/api/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return null;

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

// Get user display name - 100% PRODUCTION READY tanpa hardcode
export const getUserDisplayName = async (userId) => {
  if (!userId) return "Unknown User";

  // Check cache first
  const now = Date.now();
  if (userCache[userId] && (now - userCache[userId].timestamp) < CACHE_DURATION) {
    return userCache[userId].name;
  }

  try {
    const userData = await fetchUserData(userId);
    
    let displayName = "User";
    if (userData) {
      displayName = userData.name || userData.nama || userData.email?.split('@')[0] || `User-${userId.slice(-6)}`;
    } else {
      displayName = `User-${userId.slice(-6)}`;
    }

    // Cache the result
    userCache[userId] = {
      name: displayName,
      timestamp: now
    };

    return displayName;
  } catch (error) {
    console.error('Error getting user display name:', error);
    return `User-${userId.slice(-6)}`;
  }
};

// Synchronous version - 100% PRODUCTION READY tanpa hardcode
export const getUserDisplayNameSync = (userId) => {
  if (!userId) return "Unknown User";

  // Check cache only
  if (userCache[userId]) {
    const now = Date.now();
    if ((now - userCache[userId].timestamp) < CACHE_DURATION) {
      return userCache[userId].name;
    }
  }

  // Dynamic fallback berdasarkan userId
  return `User-${userId.slice(-6)}`;
};

// Clear user cache
export const clearUserCache = () => {
  userCache = {};
};

// Generate notification message berdasarkan type dan context
export const generateNotificationMessage = (type, context = {}) => {
  switch (type) {
    case 'new_ticket':
      return `Tiket baru telah dibuat: ${context.ticketTitle || 'Untitled'}`;
    case 'chat_message':
      if (context.senderRole === 'student') {
        return "New chat message from student";
      } else if (context.senderRole === 'admin') {
        return "New chat message from admin";
      }
      return "New chat message";
    case 'status_update':
      return `Ticket status updated to ${context.newStatus || 'Updated'}`;
    default:
      return "New notification";
  }
};