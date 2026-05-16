import { useEffect, useState } from "react";
import Button from "../../components/Button/Button.jsx";
import Badge from "../../components/Badge/Badge.jsx";
import { loadBookings, removeBooking } from "../../shared/lib/storage.js";
import { getCurrentUser } from "../../shared/lib/auth.js";
import "./styles/StudentPage.css";

export default function StudentPage() {
  const [bookings, setBookings] = useState([]);
  const currentUser = getCurrentUser();

  useEffect(() => {
    const allBookings = loadBookings();
    // Показываем только записи текущего студента
    const myBookings = allBookings.filter(b => b.studentEmail === currentUser?.email);
    setBookings(myBookings);
  }, [currentUser]);

  function cancelBooking(id) {
    if (!confirm("Отменить запись?")) return;
    const next = removeBooking(id);
    // Обновляем список, показывая только записи текущего студента
    setBookings(next.filter(b => b.studentEmail === currentUser?.email));
  }

  if (!currentUser) {
    return (
      <section className="panel">
        <h1>Требуется авторизация</h1>
        <p className="muted">Пожалуйста, войдите в систему, чтобы увидеть свои записи.</p>
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

              {b.status === "Новая" && (
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