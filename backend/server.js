const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ========== ПОДКЛЮЧЕНИЕ К POSTGRESQL ==========
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Проверка подключения
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Ошибка подключения к БД:', err.message);
  } else {
    console.log('✅ Подключено к PostgreSQL');
    release();
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query('SELECT id, email, name, role FROM users WHERE id = $1', [decoded.id]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }
    
    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Неверный токен' });
  }
};

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Сервер работает! БД подключена' });
});

// ========== РЕГИСТРАЦИЯ ==========
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Email уже используется' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email, passwordHash, name, role || 'student']
    );
    
    const user = result.rows[0];
    const token = generateToken(user);
    
    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// ========== ВХОД ==========
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const result = await pool.query(
      'SELECT id, email, password_hash, name, role FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Неверный email или пароль' });
    }
    
    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Неверный email или пароль' });
    }
    
    const token = generateToken(user);
    
    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// ========== ПОЛУЧЕНИЕ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ ==========
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ========== ПРЕПОДАВАТЕЛИ ==========
app.get('/api/teachers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teachers ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка загрузки преподавателей' });
  }
});

app.get('/api/teachers/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teachers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Преподаватель не найден' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка загрузки' });
  }
});

// ========== СЛОТЫ ==========
app.get('/api/slots', async (req, res) => {
  const { teacherId } = req.query;
  try {
    let query = 'SELECT * FROM slots ORDER BY dt';
    let params = [];
    
    if (teacherId) {
      query = 'SELECT * FROM slots WHERE teacher_id = $1 ORDER BY dt';
      params = [teacherId];
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка загрузки слотов' });
  }
});

app.post('/api/slots', authMiddleware, async (req, res) => {
  const { teacherId, teacherName, dt, durationMin } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO slots (teacher_id, teacher_name, dt, duration_min) VALUES ($1, $2, $3, $4) RETURNING *',
      [teacherId, teacherName, dt, durationMin]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка создания слота' });
  }
});

app.delete('/api/slots/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM slots WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления слота' });
  }
});

// ========== ЗАПИСИ ==========
app.get('/api/bookings', async (req, res) => {
  const { studentEmail, teacherId } = req.query;
  try {
    let query = 'SELECT * FROM bookings';
    let conditions = [];
    let params = [];
    
    if (studentEmail) {
      conditions.push(`student_email = $${params.length + 1}`);
      params.push(studentEmail);
    }
    
    if (teacherId) {
      conditions.push(`teacher_id = $${params.length + 1}`);
      params.push(teacherId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка загрузки записей' });
  }
});

app.post('/api/bookings', authMiddleware, async (req, res) => {
  const { teacherId, teacherName, subject, slotId, dt, durationMin, topic, comment, studentName, studentEmail } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO bookings (teacher_id, teacher_name, subject, slot_id, dt, duration_min, topic, comment, student_name, student_email, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Новая') RETURNING *`,
      [teacherId, teacherName, subject, slotId, dt, durationMin, topic, comment, studentName, studentEmail]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка создания записи' });
  }
});

app.put('/api/bookings/:id/status', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления статуса' });
  }
});

app.delete('/api/bookings/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM bookings WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления записи' });
  }
});

// ========== АДМИН ==========
app.get('/api/admin/users', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  
  try {
    const result = await pool.query('SELECT id, email, name, role, created_at FROM users ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка загрузки пользователей' });
  }
});

app.delete('/api/admin/users/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления пользователя' });
  }
});

app.put('/api/admin/users/:id/role', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  
  const { role } = req.body;
  try {
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления роли' });
  }
});

// ========== ЗАПУСК ==========
app.listen(PORT, () => {
  console.log(`\n🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`✅ Health: http://localhost:${PORT}/api/health`);
  console.log(`\n🔑 Демо-пользователи:`);
  console.log(`   student@example.com / Student123`);
  console.log(`   teacher@example.com / Teacher123`);
  console.log(`   admin@example.com / Admin123\n`);
});