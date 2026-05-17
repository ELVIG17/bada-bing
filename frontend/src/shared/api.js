// ТЕПЕРЬ ВСЕ ЗАПРОСЫ ИДУТ НА ТОТ ЖЕ ПОРТ ЧЕРЕЗ ПРОКСИ
const API_URL = '/api';  // ← не полный URL, а относительный!

console.log('🔧 API_URL:', API_URL);

// Вспомогательная функция для запросов
async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem('bb_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const url = `${API_URL}${endpoint}`;
  console.log(`📡 ${options.method || 'GET'} ${url}`);
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Ошибка запроса');
  }
  
  return data;
}

// ========== АВТОРИЗАЦИЯ ==========
export const authAPI = {
  register: async (email, password, name, role, teacherId) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role, teacherId }),
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка регистрации');
    }
    
    localStorage.setItem('bb_token', data.token);
    localStorage.setItem('bb_user', JSON.stringify(data.user));
    return data;
  },
  
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка входа');
    }
    
    localStorage.setItem('bb_token', data.token);
    localStorage.setItem('bb_user', JSON.stringify(data.user));
    return data;
  },
  
  logout: () => {
    localStorage.removeItem('bb_token');
    localStorage.removeItem('bb_user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('bb_user');
    return user ? JSON.parse(user) : null;
  },
  
  checkAuth: async () => {
    const token = localStorage.getItem('bb_token');
    if (!token) return null;
    
    try {
      const data = await fetchWithAuth('/auth/me');
      return data.user;
    } catch (error) {
      localStorage.removeItem('bb_token');
      localStorage.removeItem('bb_user');
      return null;
    }
  }
};

// ========== ПРЕПОДАВАТЕЛИ ==========
export const teachersAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/teachers`);
    if (!response.ok) throw new Error('Ошибка загрузки');
    return response.json();
  },
  
  getById: async (id) => {
    const response = await fetch(`${API_URL}/teachers/${id}`);
    if (!response.ok) throw new Error('Преподаватель не найден');
    return response.json();
  }
};

// ========== СЛОТЫ ==========
export const slotsAPI = {
  getAll: async (teacherId = null) => {
    const url = teacherId ? `${API_URL}/slots?teacherId=${teacherId}` : `${API_URL}/slots`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Ошибка загрузки слотов');
    return response.json();
  },
  
  create: async (slotData) => {
    return fetchWithAuth('/slots', {
      method: 'POST',
      body: JSON.stringify(slotData),
    });
  },
  
  delete: async (slotId) => {
    return fetchWithAuth(`/slots/${slotId}`, {
      method: 'DELETE',
    });
  }
};

// ========== ЗАПИСИ ==========
export const bookingsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const url = params ? `/bookings?${params}` : '/bookings';
    return fetchWithAuth(url);
  },
  
  create: async (bookingData) => {
    return fetchWithAuth('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },
  
  updateStatus: async (id, status) => {
    return fetchWithAuth(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
  
  delete: async (id) => {
    return fetchWithAuth(`/bookings/${id}`, {
      method: 'DELETE',
    });
  }
};

// ========== АДМИН ==========
export const adminAPI = {
  getUsers: async () => {
    return fetchWithAuth('/admin/users');
  },
  
  deleteUser: async (userId) => {
    return fetchWithAuth(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },
  
  updateUserRole: async (userId, role) => {
    return fetchWithAuth(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }
};