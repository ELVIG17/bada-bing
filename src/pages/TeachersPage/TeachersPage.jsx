import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { teachers } from "../../data/seed.js";
import Button from "../../components/Button/Button.jsx";
import "./styles/TeachersPage.css";

export default function TeachersPage() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return teachers;
    return teachers.filter((t) =>
      `${t.name} ${t.subject}`.toLowerCase().includes(s)
    );
  }, [q]);

  return (
    <>
      <section className="panel">
        <h1>Преподаватели</h1>

        <label className="label" htmlFor="search">
          Поиск
        </label>
        <input
          id="search"
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по ФИО/дисциплине…"
        />
      </section>

      <section className="mt">
        <div className="grid">
          {filtered.map((t) => (
            <article className="card" key={t.id}>
              <h2 className="h2">{t.name}</h2>
              <div className="muted">{t.subject}</div>

              <div className="mt-sm">
                <Link to={`/teacher/${t.id}`}>
                  <Button variant="secondary">Открыть</Button>
                </Link>
              </div>
            </article>
          ))}

          {filtered.length === 0 && (
            <div className="panel muted">Ничего не найдено</div>
          )}
        </div>
      </section>
    </>
  );
}