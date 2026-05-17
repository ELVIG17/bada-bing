import { useEffect, useState } from 'react';
import Button from '../../components/Button/Button.jsx';
import Badge from '../../components/Badge/Badge.jsx';
import { bookingsAPI } from '../../shared/api.js';
import { authAPI } from '../../shared/api.js';
import './styles/StudentPage.css';

export default function StudentPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = authAPI.getCurrentUser();

  useEffect(() => {
    if (currentUser) {
      loadBookings();
    }
  }, [currentUser]);

  async function loadBookings() {
    try {
      const data = await bookingsAPI.getAll({ studentEmail: currentUser.email });
      setBookings(data);
    } catch (error) {
      console.error('Ошибка загрузки записей:', error);
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(id) {
    if (!confirm('Отменить запись?')) return;
    try {
      await bookingsAPI.delete(id);
      await loadBookings();
    } catch (error) {
      alert('Ошибка при отмене записи');
    }
  }

  if (!currentUser) {
    return (
      <section className="panel">
        <h1>Требуется авторизация</h1>
        <p className="muted">Пожалуйста, войдите в систему, чтобы увидеть свои записи.</p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="panel">
        <h1>Мои записи</h1>
        <p className="muted">Загрузка...</p>
      </section>
    );
  }

  return (
    <>
      <section className="panel">
        <h1>Мои записи</h1>
        <p className="muted">
          {currentUser.name}, здесь вы можете отслеживать свои записи на консультации.
        </p>
      </section>

      <section className="panel mt">
        <div className="list">
          {bookings.length === 0 && (
            <div className="empty-state">
              📭 У вас пока нет записей.<br />
              Перейдите на главную страницу и выберите преподавателя.
            </div>
          )}

          {bookings.map((b) => (
            <div className="item" key={b.id}>
              <div>
                <div className="strong">
                  {b.teacherName} <span className="muted">({b.subject})</span>
                </div>
                <div>
                  📅 {b.dt} • ⏱ {b.durationMin} мин.
                </div>
                <div className="muted">📖 Тема: {b.topic}</div>
                {b.comment && <div className="muted">💬 {b.comment}</div>}
                <div className="status-row">
                  Статус: <Badge status={b.status} />
                </div>
              </div>

              {b.status === 'Новая' && (
                <Button variant="danger" onClick={() => cancelBooking(b.id)}>
                  Отменить
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}