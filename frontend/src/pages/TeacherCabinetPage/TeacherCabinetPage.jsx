import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button.jsx';
import Badge from '../../components/Badge/Badge.jsx';
import { slotsAPI, bookingsAPI } from '../../shared/api.js';
import { authAPI } from '../../shared/api.js';
import './styles/TeacherCabinetPage.css';

export default function TeacherCabinetPage() {
  const [tab, setTab] = useState('slots');
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAddSlotForm, setShowAddSlotForm] = useState(false);
  const [newSlot, setNewSlot] = useState({ dt: '', durationMin: 30 });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = authAPI.getCurrentUser();
    setCurrentUser(user);
    
    if (!user || user.role !== 'teacher') {
      navigate('/');
      return;
    }
    
    loadData();
  }, [navigate]);

  async function loadData() {
    try {
      const [slotsData, bookingsData] = await Promise.all([
        slotsAPI.getAll(currentUser?.teacherId),
        bookingsAPI.getAll({ teacherId: currentUser?.teacherId })
      ]);
      setSlots(slotsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSlot(e) {
    e.preventDefault();
    
    if (!newSlot.dt) {
      setMessage({ text: 'Выберите дату и время', type: 'error' });
      return;
    }
    
    try {
      await slotsAPI.create({
        teacherId: currentUser.teacherId,
        teacherName: currentUser.name,
        dt: newSlot.dt,
        durationMin: parseInt(newSlot.durationMin)
      });
      
      setMessage({ text: 'Слот успешно создан!', type: 'success' });
      setNewSlot({ dt: '', durationMin: 30 });
      setShowAddSlotForm(false);
      await loadData();
      
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    }
  }

  async function handleDeleteSlot(slotId) {
    if (window.confirm('Удалить этот слот? Все связанные записи также будут удалены.')) {
      try {
        await slotsAPI.delete(slotId);
        setMessage({ text: 'Слот удален', type: 'success' });
        await loadData();
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      } catch (error) {
        setMessage({ text: error.message, type: 'error' });
      }
    }
  }

  async function approveBooking(id) {
    try {
      await bookingsAPI.updateStatus(id, 'Подтверждена');
      await loadData();
      setMessage({ text: 'Запись подтверждена', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 2000);
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    }
  }

  async function rejectBooking(id) {
    try {
      await bookingsAPI.updateStatus(id, 'Отклонена');
      await loadData();
      setMessage({ text: 'Запись отклонена', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 2000);
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    }
  }

  if (loading) {
    return (
      <section className="panel">
        <h1>📚 Кабинет преподавателя</h1>
        <p className="muted">Загрузка...</p>
      </section>
    );
  }

  return (
    <>
      <section className="panel">
        <h1>📚 Кабинет преподавателя</h1>
        <p className="muted">
          {currentUser?.name}, управляйте своими слотами и заявками
        </p>
      </section>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <section className="panel mt">
        <div className="tabs">
          <button
            className={`tab ${tab === 'slots' ? 'active' : ''}`}
            onClick={() => setTab('slots')}
          >
            📅 Мои слоты ({slots.length})
          </button>
          <button
            className={`tab ${tab === 'requests' ? 'active' : ''}`}
            onClick={() => setTab('requests')}
          >
            📋 Заявки ({bookings.filter(b => b.status === 'Новая').length})
          </button>
        </div>

        {tab === 'slots' && (
          <div className="panel-inner">
            <div className="slots-header">
              <h2 className="h2">Доступные слоты для записи</h2>
              <Button 
                variant="primary" 
                onClick={() => setShowAddSlotForm(!showAddSlotForm)}
              >
                {showAddSlotForm ? '✖ Отмена' : '+ Добавить слот'}
              </Button>
            </div>

            {showAddSlotForm && (
              <form onSubmit={handleAddSlot} className="add-slot-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="label">Дата и время *</label>
                    <input
                      type="datetime-local"
                      className="input"
                      value={newSlot.dt}
                      onChange={(e) => setNewSlot({ ...newSlot, dt: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Длительность (мин)</label>
                    <select
                      className="input"
                      value={newSlot.durationMin}
                      onChange={(e) => setNewSlot({ ...newSlot, durationMin: e.target.value })}
                    >
                      <option value="20">20 минут</option>
                      <option value="30">30 минут</option>
                      <option value="45">45 минут</option>
                      <option value="60">60 минут</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <Button variant="primary" type="submit" style={{ marginTop: '28px' }}>
                      ✅ Создать
                    </Button>
                  </div>
                </div>
              </form>
            )}

            <div className="slots-list">
              {slots.length === 0 && (
                <div className="empty-state">
                  😕 У вас пока нет созданных слотов.<br />
                  Нажмите "Добавить слот", чтобы студенты могли записываться.
                </div>
              )}
              
              {slots.map((slot) => (
                <div className="slot-card" key={slot.id}>
                  <div className="slot-info">
                    <div className="slot-datetime">
                      <span className="slot-icon">📅</span>
                      <span className="slot-date">{slot.dt.replace('T', ' ')}</span>
                    </div>
                    <div className="slot-duration">
                      ⏱ {slot.durationMin} минут
                    </div>
                  </div>
                  <Button variant="danger" onClick={() => handleDeleteSlot(slot.id)}>
                    🗑️ Удалить
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'requests' && (
          <div className="panel-inner">
            <h2 className="h2">Заявки на консультации</h2>
            
            <div className="requests-list">
              {bookings.length === 0 && (
                <div className="empty-state">
                  📭 Нет заявок. Когда студенты запишутся, они появятся здесь.
                </div>
              )}
              
              {bookings.map((booking) => (
                <div className="request-card" key={booking.id}>
                  <div className="request-info">
                    <div className="request-student">
                      🎓 Студент: <strong>{booking.studentName}</strong>
                    </div>
                    <div className="request-datetime">
                      📅 {booking.dt} • ⏱ {booking.durationMin} мин.
                    </div>
                    <div className="request-topic">
                      📖 Тема: {booking.topic}
                    </div>
                    {booking.comment && (
                      <div className="request-comment">
                        💬 Комментарий: {booking.comment}
                      </div>
                    )}
                    <div className="request-status">
                      Статус: <Badge status={booking.status} />
                    </div>
                  </div>
                  
                  {booking.status === 'Новая' && (
                    <div className="request-actions">
                      <Button variant="primary" onClick={() => approveBooking(booking.id)}>
                        ✅ Подтвердить
                      </Button>
                      <Button variant="secondary" onClick={() => rejectBooking(booking.id)}>
                        ❌ Отклонить
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}