// Ключ для хранения пользователя в localStorage
const AUTH_KEY = "bb_current_user";
const USERS_KEY = "bb_users";

// Загрузка всех зарегистрированных пользователей
export function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Сохранение пользователей
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Инициализация демо-пользователя (вызвать при старте приложения)
export function initDemoUser() {
  const users = loadUsers();
  const demoExists = users.some(u => u.email === "demo@example.com");
  
  if (!demoExists) {
    const demoUser = {
      id: 0,
      email: "demo@example.com",
      password: "Demo123",
      name: "Демо Пользователь",
      role: "student",
      createdAt: new Date().toISOString()
    };
    users.push(demoUser);
    saveUsers(users);
    console.log("✅ Демо-пользователь создан");
  }
}

// Регистрация нового пользователя
export function registerUser(email, password, name) {
  const users = loadUsers();
  
  // Проверка: существует ли пользователь с таким email
  const exists = users.some(u => u.email === email);
  if (exists) {
    return { success: false, error: "Пользователь с таким email уже существует" };
  }
  
  // Создание нового пользователя
  const newUser = {
    id: Date.now(),
    email: email,
    password: password,
    name: name,
    role: "student",
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers(users);
  
  return { success: true, user: newUser };
}

// Вход пользователя
export function loginUser(email, password) {
  const users = loadUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return { success: false, error: "Неверный email или пароль" };
  }
  
  // Сохраняем текущего пользователя (без пароля)
  const { password: _, ...userWithoutPassword } = user;
  localStorage.setItem(AUTH_KEY, JSON.stringify(userWithoutPassword));
  
  return { success: true, user: userWithoutPassword };
}

// Выход из системы
export function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
}

// Получение текущего пользователя
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Проверка, авторизован ли пользователь
export function isAuthenticated() {
  return getCurrentUser() !== null;
}

// Обновление данных пользователя
export function updateCurrentUser(updates) {
  const user = getCurrentUser();
  if (!user) return null;
  
  const updatedUser = { ...user, ...updates };
  localStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
  
  // Также обновляем в списке пользователей
  const users = loadUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
  }
  
  return updatedUser;
}

// Получить всех пользователей (для отладки)
export function getAllUsers() {
  return loadUsers();
}