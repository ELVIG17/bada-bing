import { useState, useEffect } from "react";
import { getCurrentUser, logoutUser, loginUser, registerUser } from "../shared/lib/auth.js";

export const validateEmail = (email) => {
  const re = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  if (password.length < 6) return "Пароль должен содержать минимум 6 символов";
  if (!/[A-Z]/.test(password)) return "Пароль должен содержать хотя бы одну заглавную букву";
  if (!/[a-z]/.test(password)) return "Пароль должен содержать хотя бы одну строчную букву";
  if (!/[0-9]/.test(password)) return "Пароль должен содержать хотя бы одну цифру";
  return null;
};

export const validateName = (name) => {
  if (!name || !name.trim()) return "Введите ваше имя";
  if (name.trim().length < 2) return "Имя должно содержать минимум 2 символа";
  return null;
};

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsAuthenticated(!!currentUser);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    if (!email || !password) return { success: false, error: "Заполните все поля" };
    if (!validateEmail(email)) return { success: false, error: "Введите корректный email" };

    const result = loginUser(email, password);
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const register = async (name, email, password, confirmPassword, role = "student") => {
    const nameError = validateName(name);
    if (nameError) return { success: false, error: nameError };
    if (!email) return { success: false, error: "Введите email" };
    if (!validateEmail(email)) return { success: false, error: "Введите корректный email" };
    
    const passwordError = validatePassword(password);
    if (passwordError) return { success: false, error: passwordError };
    if (password !== confirmPassword) return { success: false, error: "Пароли не совпадают" };

    const result = registerUser(email, password, name.trim(), role);
    return result;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setIsAuthenticated(false);
  };

  return { user, isAuthenticated, loading, login, register, logout };
}