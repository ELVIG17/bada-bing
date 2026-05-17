import { useMemo, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { teachersAPI, slotsAPI } from '../../shared/api.js';
import Button from '../../components/Button/Button.jsx';
import './styles/TeacherPage.css';

export default function TeacherPage() {
  const { id } = useParams();
  const teacherId = Number(id);
  const [teacher, setTeacher] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [teacherId]);

  const loadData = async () => {
    try {
      const [teacherData, slotsData] = await Promise.all([
        teachersAPI.getById(teacherId),
        slotsAPI.getAll(teacherId)
      ]);
      setTeacher(teacherData);
      setSlots(slotsData);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="panel">
        <h1>Загрузка...</h1>
      </section>
    );
  }

  if (!teacher) {
    return (
      <section className="panel">
        <h1>Преподаватель не найден</h1>
        <Link to="/">
          <Button variant="secondary">На главную</Button>
        </Link>
      </section>
    );
  }

  return (
    <>
      <section className="panel">
        <h1>
          {teacher.name} — <span className="muted">{teacher.subject}</span>
        </h1>
        <p className="muted">
          Выберите доступный слот и создайте запись на консультацию.
        </p>
      </section>

      <section className="panel mt">
        <h2 className="h2">Доступные слоты</h2>

        <div className="list">
          {slots.map((s) => (
            <div className="item" key={s.id}>
              <div>
                <div className="strong">📅 {s.dt}</div>
                <div className="muted">⏱ Длительность: {s.durationMin} мин.</div>
              </div>

              <Link
                to={`/booking?teacher=${teacher.id}&slot=${encodeURIComponent(s.id)}`}
              >
                <Button variant="primary">Записаться</Button>
              </Link>
            </div>
          ))}

          {slots.length === 0 && (
            <div className="panel muted empty-state">
              😕 Нет доступных слотов.<br />
              Преподаватель еще не добавил время для консультаций.
            </div>
          )}
        </div>
      </section>
    </>
  );
}