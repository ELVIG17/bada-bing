const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function hashPasswords() {
  try {
    const salt = await bcrypt.genSalt(10);
    
    // Новые хэшированные пароли
    const hashedStudent = await bcrypt.hash('Student123', salt);
    const hashedTeacher = await bcrypt.hash('Teacher123', salt);
    const hashedAdmin = await bcrypt.hash('Admin123', salt);
    
    // Обновляем пароли в БД
    await pool.query(
      `UPDATE users SET password_hash = $1 WHERE email = $2`,
      [hashedStudent, 'student@example.com']
    );
    await pool.query(
      `UPDATE users SET password_hash = $1 WHERE email = $2`,
      [hashedTeacher, 'teacher@example.com']
    );
    await pool.query(
      `UPDATE users SET password_hash = $1 WHERE email = $2`,
      [hashedAdmin, 'admin@example.com']
    );
    
    console.log('✅ Пароли успешно захэшированы!');
    console.log('   student@example.com -> Student123 (захэширован)');
    console.log('   teacher@example.com -> Teacher123 (захэширован)');
    console.log('   admin@example.com -> Admin123 (захэширован)');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
    process.exit(1);
  }
}

hashPasswords();