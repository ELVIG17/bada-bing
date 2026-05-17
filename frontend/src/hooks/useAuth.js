import { useState, useEffect } from 'react';
import { authAPI } from '../shared/api.js';

export const validateEmail = (email) => {
  const re = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  if (password.length < 6) return 'Пароль должен содержать минимум 6 символов';
  if (!/[A-Z]/.test(password)) return 'Пароль должен содержать хотя бы одну заглавную букву';
  if (!/[a-z]/.test(password)) return 'Пароль должен содержать хотя бы одну строчную букву';
  if (!/[0-9]/.test(password)) return 'Пароль должен содержать хотя бы одну цифру';
  return null;
};

export const validateName = (name) => {
  if (!name || !name.trim()) return 'Введите ваше имя';
  if (name.trim().length < 2) return 'Имя должно содержать минимум 2 символа';
  return null;
};

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const currentUser = authAPI.getCurrentUser();
      if (currentUser) {
        const validUser = await authAPI.checkAuth();
        if (validUser) {
          setUser(validUser);
          setIsAuthenticated(true);
        } else {
          authAPI.logout();
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (email, password) => {
    if (!email || !password) {
      return { success: false, error: 'Заполните все поля' };
    }
    if (!validateEmail(email)) {
      return { success: false, error: 'Введите корректный email' };
    }

    try {
      const result = await authAPI.login(email, password);
      setUser(result.user);
      setIsAuthenticated(true);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password, confirmPassword, role = 'student') => {
    const nameError = validateName(name);
    if (nameError) return { success: false, error: nameError };
    
    if (!email) return { success: false, error: 'Введите email' };
    if (!validateEmail(email)) return { success: false, error: 'Введите корректный email' };
    
    const passwordError = validatePassword(password);
    if (passwordError) return { success: false, error: passwordError };
    if (password !== confirmPassword) return { success: false, error: 'Пароли не совпадают' };

    try {
      const result = await authAPI.register(email, password, name.trim(), role);
      setUser(result.user);
      setIsAuthenticated(true);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };
}