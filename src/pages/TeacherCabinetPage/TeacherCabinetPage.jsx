import { useEffect, useState } from "react";
import Button from "../../components/Button/Button.jsx";
import Badge from "../../components/Badge/Badge.jsx";
import { slots, teachers } from "../../data/seed.js";
import { loadBookings, updateBookingStatus } from "../../shared/lib/storage.js";
import "./styles/TeacherCabinetPage.css";

export default function TeacherCabinetPage() {
  const [tab, setTab] = useState("requests");
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    setBookings(loadBookings());
  }, []);

  function teacherNameById(id) {
    return teachers.find((t) => t.id === id)?.name ?? "—";
  }

  function approve(id) {
    const updated = updateBookingStatus(id, "Подтверждена");
    setBookings(updated);
  }

  function reject(id) {
    const updated = updateBookingStatus(id, "Отклонена");
    setBookings(updated);
  }

  return (
    <>
      <section className="panel">
        <h1>Кабинет преподавателя</h1>

        <div className="tabs">
          <button
            className={"tab" + (tab === "slots" ? " active" : "")}
            type="button"
            onClick={() => setTab("slots")}
          >
            Слоты
          </button>
          <button
            className={"tab" + (tab === "requests" ? " active" : "")}
            type="button"
            onClick={() => setTab("requests")}
          >
            Заявки
          </button>
        </div>

        {tab === "slots" && (
          <div className="panel-inner">
            <h2 className="h2">Слоты (демо)</h2>
            <p className="muted">
              В учебной версии слоты берутся из мок-данных (seed.js).
            </p>

            <div className="list">
              {slots.map((s) => (
                <div className="item" key={s.id}>
                  <div>
                    <div className="strong">{s.dt}</div>
                    <div className="muted">
                      Преподаватель: {teacherNameById(s.teacherId)} •{" "}
                      {s.durationMin} мин.
                    </div>
                  </div>
                  <Button variant="secondary" disabled>
                    Добавить (позже)
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "requests" && (
          <div className="panel-inner">
            <h2 className="h2">Заявки</h2>

            <div className="list">
              {bookings.length === 0 && (
                <div className="muted">Заявок пока нет.</div>
              )}

              {bookings.map((b) => (
                <div className="item" key={b.id}>
                  <div>
                    <div className="strong">
                      {b.dt} — {b.teacherName}
                    </div>
                    <div className="muted">Тема: {b.topic}</div>
                    <Badge status={b.status} />
                  </div>

                  <div className="row">
                    <Button variant="primary" onClick={() => approve(b.id)}>
                      Подтвердить
                    </Button>
                    <Button variant="secondary" onClick={() => reject(b.id)}>
                      Отклонить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}