import { subjects } from "../../data/seed.js";
import "./styles/SubjectFilter.css";

export default function SubjectFilter({ selectedSubject, onSelectSubject }) {
  return (
    <div className="subject-filter">
      <button
        className={`filter-chip ${selectedSubject === null ? "active" : ""}`}
        onClick={() => onSelectSubject(null)}
      >
        Все предметы
      </button>
      
      {subjects.map((subject) => (
        <button
          key={subject.id}
          className={`filter-chip ${selectedSubject === subject.id ? "active" : ""}`}
          onClick={() => onSelectSubject(subject.id)}
        >
          <span className="filter-icon">{subject.icon}</span>
          <span>{subject.name}</span>
          <span className="filter-count">{subject.teacherCount}</span>
        </button>
      ))}
    </div>
  );
}