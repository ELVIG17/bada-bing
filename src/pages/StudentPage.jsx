import React, { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import Badge from "../components/Badge.jsx";
import { loadBookings, removeBooking } from "../shared/lib/storage.js";

export default function StudentPage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    setBookings(loadBookings());
  }, []);

  function cancelBooking(id) {
    if (!confirm("Отменить запись?")) return;
    const next = removeBooking(id);
    setBookings(next);
  }

  return (
    <>
      <section className="panel">
        <h1>Мои записи</h1>
        <p className="muted">
          Записи сохраняются в localStorage (демо-версия без сервера).
        </p>
      </section>

      <section className="panel mt">
        <div className="list">
          {bookings.length === 0 && (
            <div className="muted">Записей пока нет.</div>
          )}

          {bookings.map((b) => (
            <div className="item" key={b.id}>
              <div>
                <div className="strong">
                  {b.teacherName} <span className="muted">({b.subject})</span>
                </div>
                <div>
                  {b.dt} • {b.durationMin} мин.
                </div>
                <div className="muted">Тема: {b.topic}</div>
                <Badge status={b.status} />
              </div>

              <Button variant="danger" onClick={() => cancelBooking(b.id)}>
                Отменить
              </Button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}