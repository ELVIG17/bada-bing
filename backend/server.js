const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Упрощенная настройка CORS для прокси
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));





// Временное хранилище в памяти (пока без БД)
// Позже заменим на MongoDB или PostgreSQL
const users = [];
const teachers = [];
const slots = [];
const bookings = [];

// ========== ИНИЦИАЛИЗАЦИЯ ДЕМО-ДАННЫХ ==========
// Преподаватели
teachers.push(
  { id: 1, name: "Иванов Иван Иванович", subject: "Математика", subjectId: "math" },
  { id: 2, name: "Петрова Анна Сергеевна", subject: "Физика", subjectId: "physics" },
  { id: 3, name: "Сидоров Михаил Олегович", subject: "Информатика", subjectId: "it" },
  { id: 4, name: "Кузнецова Мария Павловна", subject: "Английский язык", subjectId: "english" },
  { id: 5, name: "Волков Дмитрий Алексеевич", subject: "Математика", subjectId: "math" },
  { id: 6, name: "Соколова Елена Владимировна", subject: "Программирование", subjectId: "programming" }
);

// Демо-пользователи
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

users.push(
  { 
    id: 1, 
    email: "student@example.com", 
    password: bcrypt.hashSync("Student123", salt), 
    name: "Иван Студентов", 
    role: "student",
    createdAt: new Date().toISOString()
  },
  { 
    id: 2, 
    email: "teacher@example.com", 
    password: bcrypt.hashSync("Teacher123", salt), 
    name: "Анна Преподавательская", 
    role: "teacher",
    teacherId: 2,
    createdAt: new Date().toISOString()
  },
  { 
    id: 3, 
    email: "admin@example.com", 
    password: bcrypt.hashSync("Admin123", salt), 
    name: "Админ Админович", 
    role: "admin",
    createdAt: new Date().toISOString()
  }
);

// Начальные слоты
slots.push(
  { id: "s1", teacherId: 1, teacherName: "Иванов Иван Иванович", dt: "2026-03-20 14:00", durationMin: 30, createdAt: new Date().toISOString() },
  { id: "s2", teacherId: 1, teacherName: "Иванов Иван Иванович", dt: "2026-03-20 15:00", durationMin: 45, createdAt: new Date().toISOString() },
  { id: "s3", teacherId: 2, teacherName: "Петрова Анна Сергеевна", dt: "2026-03-18 16:00", durationMin: 30, createdAt: new Date().toISOString() },
  { id: "s4", teacherId: 3, teacherName: "Сидоров Михаил Олегович", dt: "2026-03-22 13:10", durationMin: 40, createdAt: new Date().toISOString() }
);

// ========== МАРШРУТЫ API ==========

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========== АВТОРИЗАЦИЯ ==========
const jwt = require('jsonwebtoken');

// Регистрация
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, role, teacherId } = req.body;
  
  // Проверка существования пользователя
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ success: false, error: "Пользователь с таким email уже существует" });
  }
  
  // Хэширование пароля
  const hashedPassword = bcrypt.hashSync(password, salt);
  
  // Создание пользователя
  const newUser = {
    id: Date.now(),
    email,
    password: hashedPassword,
    name,
    role: role || "student",
    teacherId: role === "teacher" ? teacherId : null,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  // Генерация токена
  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.json({
    success: true,
    token,
    user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }
  });
});

// Вход
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ success: false, error: "Неверный email или пароль" });
  }
  
  const isValidPassword = bcrypt.compareSync(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ success: false, error: "Неверный email или пароль" });
  }
  
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.json({
    success: true,
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

// Получение текущего пользователя (по токену)
app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: "Токен не предоставлен" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(401).json({ success: false, error: "Пользователь не найден" });
    }
    
    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(401).json({ success: false, error: "Неверный токен" });
  }
});

// ========== ПРЕПОДАВАТЕЛИ ==========
app.get('/api/teachers', (req, res) => {
  res.json(teachers);
});

app.get('/api/teachers/:id', (req, res) => {
  const teacher = teachers.find(t => t.id === parseInt(req.params.id));
  if (!teacher) {
    return res.status(404).json({ error: "Преподаватель не найден" });
  }
  res.json(teacher);
});

// ========== СЛОТЫ ==========
app.get('/api/slots', (req, res) => {
  const { teacherId } = req.query;
  if (teacherId) {
    return res.json(slots.filter(s => s.teacherId === parseInt(teacherId)));
  }
  res.json(slots);
});

app.post('/api/slots', (req, res) => {
  const { teacherId, teacherName, dt, durationMin } = req.body;
  
  const newSlot = {
    id: "slot_" + Date.now(),
    teacherId,
    teacherName,
    dt,
    durationMin,
    createdAt: new Date().toISOString()
  };
  
  slots.push(newSlot);
  res.status(201).json(newSlot);
});

app.delete('/api/slots/:id', (req, res) => {
  const slotId = req.params.id;
  const index = slots.findIndex(s => s.id === slotId);
  
  if (index === -1) {
    return res.status(404).json({ error: "Слот не найден" });
  }
  
  slots.splice(index, 1);
  
  // Удаляем связанные записи
  const remainingBookings = bookings.filter(b => b.slotId !== slotId);
  bookings.length = 0;
  bookings.push(...remainingBookings);
  
  res.json({ success: true });
});

// ========== ЗАПИСИ ==========
app.get('/api/bookings', (req, res) => {
  const { studentEmail, teacherId } = req.query;
  
  let result = [...bookings];
  
  if (studentEmail) {
    result = result.filter(b => b.studentEmail === studentEmail);
  }
  
  if (teacherId) {
    result = result.filter(b => b.teacherId === parseInt(teacherId));
  }
  
  res.json(result);
});

app.post('/api/bookings', (req, res) => {
  const { teacherId, teacherName, subject, slotId, dt, durationMin, topic, comment, studentName, studentEmail } = req.body;
  
  const newBooking = {
    id: "b" + Date.now(),
    teacherId,
    teacherName,
    subject,
    slotId,
    dt,
    durationMin,
    topic,
    comment,
    studentName,
    studentEmail,
    status: "Новая",
    createdAt: new Date().toISOString()
  };
  
  bookings.push(newBooking);
  res.status(201).json(newBooking);
});

app.put('/api/bookings/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const booking = bookings.find(b => b.id === id);
  if (!booking) {
    return res.status(404).json({ error: "Запись не найдена" });
  }
  
  booking.status = status;
  res.json(booking);
});

app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const index = bookings.findIndex(b => b.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: "Запись не найдена" });
  }
  
  bookings.splice(index, 1);
  res.json({ success: true });
});

// ========== АДМИН ==========
app.get('/api/admin/users', (req, res) => {
  // В реальном проекте проверять роль!
  const safeUsers = users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt
  }));
  res.json(safeUsers);
});

app.delete('/api/admin/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === userId);
  
  if (index === -1) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }
  
  users.splice(index, 1);
  res.json({ success: true });
});

app.put('/api/admin/users/:id/role', (req, res) => {
  const userId = parseInt(req.params.id);
  const { role } = req.body;
  
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }
  
  user.role = role;
  res.json({ success: true });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📡 API доступен по адресу http://localhost:${PORT}/api`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});