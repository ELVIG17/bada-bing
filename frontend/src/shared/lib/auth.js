const AUTH_KEY = "bb_current_user";
const USERS_KEY = "bb_users";

export function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Инициализация демо-пользователей
export function initDemoUser() {
  const users = loadUsers();
  
  if (users.length === 0) {
    const demoUsers = [
      {
        id: 1,
        email: "student@example.com",
        password: "Student123",
        name: "Иван Студентов",
        role: "student",
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        email: "teacher@example.com",
        password: "Teacher123",
        name: "Анна Преподавательская",
        role: "teacher",
        teacherId: 2, // связь с преподавателем из teachers
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        email: "admin@example.com",
        password: "Admin123",
        name: "Админ Админович",
        role: "admin",
        createdAt: new Date().toISOString()
      }
    ];
    
    for (const user of demoUsers) {
      if (!users.some(u => u.email === user.email)) {
        users.push(user);
      }
    }
    saveUsers(users);
  }
}

// Регистрация нового пользователя
export function registerUser(email, password, name, role = "student", teacherId = null) {
  const users = loadUsers();
  const exists = users.some(u => u.email === email);
  if (exists) {
    return { success: false, error: "Пользователь с таким email уже существует" };
  }
  
  const newUser = {
    id: Date.now(),
    email,
    password,
    name,
    role,
    teacherId: role === "teacher" ? teacherId : null,
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
  
  const { password: _, ...userWithoutPassword } = user;
  localStorage.setItem(AUTH_KEY, JSON.stringify(userWithoutPassword));
  
  return { success: true, user: userWithoutPassword };
}

export function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return getCurrentUser() !== null;
}

export function hasRole(role) {
  const user = getCurrentUser();
  return user ? user.role === role : false;
}

export function getAllUsers() {
  return loadUsers();
}

export function deleteUser(userId) {
  const users = loadUsers();
  const filtered = users.filter(u => u.id !== userId);
  saveUsers(filtered);
  return filtered;
}

export function updateUserRole(userId, newRole) {
  const users = loadUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    user.role = newRole;
    saveUsers(users);
  }
  return users;
}