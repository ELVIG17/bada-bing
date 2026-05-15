import { useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { teachers, slots } from "../../data/seed.js";
import { formatSlot } from "../../shared/lib/format.js";
import { addBooking } from "../../shared/lib/storage.js";
import Button from "../../components/Button/Button.jsx";
import "./styles/BookingPage.css";

export default function BookingPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const teacherId = Number(params.get("teacher"));
  const slotId = params.get("slot");

  const teacher = useMemo(
    () => teachers.find((t) => t.id === teacherId),
    [teacherId]
  );
  const slot = useMemo(() => slots.find((s) => s.id === slotId), [slotId]);

  const [topic, setTopic] = useState("");
  const [comment, setComment] = useState("");

  const [errTopic, setErrTopic] = useState("");
  const [errCommon, setErrCommon] = useState("");
  const [notice, setNotice] = useState("");

  function onSubmit(e) {
    e.preventDefault();

    let ok = true;

    if (!topic.trim()) {
      setErrTopic("Введите тему обращения (обязательное поле).");
      ok = false;
    } else setErrTopic("");

    if (!teacher || !slot) {
      setErrCommon("Ошибка: не выбран преподаватель или слот.");
      ok = false;
    } else setErrCommon("");

    if (!ok) return;

    addBooking({
      id: "b" + Date.now(),
      teacherId: teacher.id,
      teacherName: teacher.name,
      subject: teacher.subject,
      slotId: slot.id,
      dt: slot.dt,
      durationMin: slot.durationMin,
      topic: topic.trim(),
      comment: comment.trim(),
      status: "Новая",
    });

    setNotice("Запись создана. Переходим в раздел «Мои записи»…");
    setTimeout(() => navigate("/student"), 700);
  }

  return (
    <>
      <section className="panel">
        <h1>Запись на консультацию</h1>
        <p className="muted">Заполните форму и подтвердите запись.</p>
      </section>

      <section className="panel mt">
        <form onSubmit={onSubmit} noValidate>
          <label className="label">Преподаватель</label>
          <input
            className="input"
            readOnly
            value={teacher ? `${teacher.name} (${teacher.subject})` : "—"}
          />

          <label className="label">Слот</label>
          <input className="input" readOnly value={formatSlot(slot)} />

          <label className="label">Тема обращения *</label>
          <input
            className="input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder='Например: "Интегралы. Разбор задач"'
          />
          {errTopic && <div className="error">{errTopic}</div>}

          <label className="label">Комментарий</label>
          <textarea
            className="textarea"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Опишите вопрос (необязательно)…"
          />

          {errCommon && <div className="error">{errCommon}</div>}

          <div className="row mt-sm">
            <Button variant="primary" type="submit">
              Подтвердить запись
            </Button>

            <Link to="/">
              <Button variant="ghost" type="button">
                Отмена
              </Button>
            </Link>
          </div>

          {notice && <div className="notice">{notice}</div>}
        </form>
      </section>
    </>
  );
}