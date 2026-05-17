import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teachersAPI } from '../../shared/api.js';
import { subjects } from '../../data/seed.js';
import Button from '../../components/Button/Button.jsx';
import SubjectFilter from '../../components/SubjectFilter/SubjectFilter.jsx';
import './styles/TeachersPage.css';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const data = await teachersAPI.getAll();
      setTeachers(data);
    } catch (error) {
      console.error('Ошибка загрузки преподавателей:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = useMemo(() => {
    let filtered = teachers;
    
    if (selectedSubject) {
      filtered = filtered.filter(t => t.subjectId === selectedSubject);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.subject.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [teachers, searchQuery, selectedSubject]);

  const getSubjectIcon = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.icon : '📚';
  };

  if (loading) {
    return (
      <section className="panel">
        <h1>Преподаватели</h1>
        <p className="muted">Загрузка...</p>
      </section>
    );
  }

  return (
    <>
      <section className="panel">
        <h1>Преподаватели</h1>
        <p className="muted">
          Выберите предмет или найдите преподавателя для консультации
        </p>
        
        <div className="search-section">
          <label className="label" htmlFor="search">
            🔍 Поиск по имени или предмету
          </label>
          <input
            id="search"
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Иванов, Математика, Программирование..."
          />
        </div>
        
        <SubjectFilter 
          selectedSubject={selectedSubject} 
          onSelectSubject={setSelectedSubject} 
        />
      </section>

      <section className="mt">
        <div className="teachers-grid">
          {filteredTeachers.map((teacher) => (
            <article className="teacher-card" key={teacher.id}>
              <div className="teacher-icon">{getSubjectIcon(teacher.subjectId)}</div>
              <h2 className="teacher-name">{teacher.name}</h2>
              <div className="teacher-subject">{teacher.subject}</div>
              
              <div className="teacher-actions">
                <Link to={`/teacher/${teacher.id}`}>
                  <Button variant="secondary">📅 Слоты</Button>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {filteredTeachers.length === 0 && (
          <div className="panel muted empty-state">
            😕 Ничего не найдено. Попробуйте изменить параметры поиска.
          </div>
        )}
      </section>
    </>
  );
}