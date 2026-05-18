const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Простые данные
const users = [
  { id: 1, email: "student@example.com", password: "Student123", name: "Студент", role: "student" }
];

// HEALTH CHECK (для теста)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Сервер работает!' });
});

// ЛОГИН (максимально простой)
app.post('/api/auth/login', (req, res) => {
  console.log('Получен запрос:', req.body);
  
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    console.log('Ошибка: пользователь не найден');
    return res.status(401).json({ success: false, error: "Неверный email или пароль" });
  }
  
  console.log('Успех!', user.name);
  
  res.json({
    success: true,
    token: "fake_token_123",
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

// Список преподавателей
app.get('/api/teachers', (req, res) => {
  res.json([
    { id: 1, name: "Иванов Иван", subject: "Математика", subjectId: "math" }
  ]);
});

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});