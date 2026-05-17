// Базовый URL бекенда
const API_URL = 'http://localhost:5000/api';

// Вспомогательная функция для запросов с токеном
async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem('bb_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  // Если токен просрочен — выходим
  if (response.status === 401) {
    localStorage.removeItem('bb_token');
    localStorage.removeItem('bb_user');
    window.location.href = '/';
    return null;
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Ошибка запроса');
  }
  
  return data;
}

// ========== АВТОРИЗАЦИЯ ==========
export const authAPI = {
  // Регистрация
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
    
    // Сохраняем токен и пользователя
    localStorage.setItem('bb_token', data.token);
    localStorage.setItem('bb_user', JSON.stringify(data.user));
    return data;
  },
  
  // Вход
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
    
    // Сохраняем токен и пользователя
    localStorage.setItem('bb_token', data.token);
    localStorage.setItem('bb_user', JSON.stringify(data.user));
    return data;
  },
  
  // Выход
  logout: () => {
    localStorage.removeItem('bb_token');
    localStorage.removeItem('bb_user');
  },
  
  // Получить текущего пользователя
  getCurrentUser: () => {
    const user = localStorage.getItem('bb_user');
    return user ? JSON.parse(user) : null;
  },
  
  // Проверка токена
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
    const data = await fetchWithAuth('/teachers');
    return data;
  },
  
  getById: async (id) => {
    const data = await fetchWithAuth(`/teachers/${id}`);
    return data;
  }
};

// ========== СЛОТЫ ==========
export const slotsAPI = {
  getAll: async (teacherId = null) => {
    const url = teacherId ? `/slots?teacherId=${teacherId}` : '/slots';
    const data = await fetchWithAuth(url);
    return data;
  },
  
  create: async (slotData) => {
    const data = await fetchWithAuth('/slots', {
      method: 'POST',
      body: JSON.stringify(slotData),
    });
    return data;
  },
  
  delete: async (slotId) => {
    const data = await fetchWithAuth(`/slots/${slotId}`, {
      method: 'DELETE',
    });
    return data;
  }
};

// ========== ЗАПИСИ ==========
export const bookingsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const url = params ? `/bookings?${params}` : '/bookings';
    const data = await fetchWithAuth(url);
    return data;
  },
  
  create: async (bookingData) => {
    const data = await fetchWithAuth('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
    return data;
  },
  
  updateStatus: async (id, status) => {
    const data = await fetchWithAuth(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return data;
  },
  
  delete: async (id) => {
    const data = await fetchWithAuth(`/bookings/${id}`, {
      method: 'DELETE',
    });
    return data;
  }
};

// ========== АДМИН ==========
export const adminAPI = {
  getUsers: async () => {
    const data = await fetchWithAuth('/admin/users');
    return data;
  },
  
  deleteUser: async (userId) => {
    const data = await fetchWithAuth(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
    return data;
  },
  
  updateUserRole: async (userId, role) => {
    const data = await fetchWithAuth(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
    return data;
  }
};