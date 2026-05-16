import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button.jsx";
import Badge from "../../components/Badge/Badge.jsx";
import { teachers } from "../../data/seed.js";
import { 
  loadBookings, 
  updateBookingStatus, 
  loadSlots, 
  addSlot, 
  deleteSlot,
  getTeacherSlots,
  initSlots
} from "../../shared/lib/storage.js";
import { getCurrentUser, hasRole } from "../../shared/lib/auth.js";

export default function TeacherCabinetPage() {
  const [tab, setTab] = useState("slots"); // slots | requests
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAddSlotForm, setShowAddSlotForm] = useState(false);
  const [newSlot, setNewSlot] = useState({
    dt: "",
    durationMin: 30
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  useEffect(() => {
    initSlots();
    const user = getCurrentUser();
    setCurrentUser(user);
    
    // Проверка: только преподаватель имеет доступ
    if (!user || user.role !== "teacher") {
      navigate("/");
      return;
    }
    
    loadData();
  }, [navigate]);

  const loadData = () => {
    setBookings(loadBookings());
    if (currentUser?.teacherId) {
      setSlots(getTeacherSlots(currentUser.teacherId));
    } else {
      setSlots([]);
    }
  };

  const handleAddSlot = (e) => {
    e.preventDefault();
    
    if (!newSlot.dt) {
      setMessage({ text: "Выберите дату и время", type: "error" });
      return;
    }
    
    const teacher = teachers.find(t => t.id === currentUser?.teacherId);
    if (!teacher) {
      setMessage({ text: "Преподаватель не найден", type: "error" });
      return;
    }
    
    const slot = addSlot({
      teacherId: currentUser.teacherId,
      teacherName: teacher.name,
      dt: newSlot.dt,
      durationMin: parseInt(newSlot.durationMin)
    });
    
    setMessage({ text: `Слот ${slot.dt} успешно создан!`, type: "success" });
    setNewSlot({ dt: "", durationMin: 30 });
    setShowAddSlotForm(false);
    loadData();
    
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleDeleteSlot = (slotId) => {
    if (window.confirm("Удалить этот слот? Все связанные записи также будут удалены.")) {
      const success = deleteSlot(slotId, currentUser?.teacherId);
      if (success) {
        setMessage({ text: "Слот удален", type: "success" });
        loadData();
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      }
    }
  };

  const approveBooking = (id) => {
    const updated = updateBookingStatus(id, "Подтверждена");
    setBookings(updated);
    setMessage({ text: "Запись подтверждена", type: "success" });
    setTimeout(() => setMessage({ text: "", type: "" }), 2000);
  };

  const rejectBooking = (id) => {
    const updated = updateBookingStatus(id, "Отклонена");
    setBookings(updated);
    setMessage({ text: "Запись отклонена", type: "success" });
    setTimeout(() => setMessage({ text: "", type: "" }), 2000);
  };

  const getTeacherSlotsWithBookings = () => {
    return slots.map(slot => {
      const slotBookings = bookings.filter(b => b.slotId === slot.id);
      return { ...slot, bookings: slotBookings };
    });
  };

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
            className={`tab ${tab === "slots" ? "active" : ""}`}
            onClick={() => setTab("slots")}
          >
            📅 Мои слоты ({slots.length})
          </button>
          <button
            className={`tab ${tab === "requests" ? "active" : ""}`}
            onClick={() => setTab("requests")}
          >
            📋 Заявки ({bookings.filter(b => b.teacherId === currentUser?.teacherId && b.status === "Новая").length})
          </button>
        </div>

        {/* Вкладка СЛОТЫ */}
        {tab === "slots" && (
          <div className="panel-inner">
            <div className="slots-header">
              <h2 className="h2">Доступные слоты для записи</h2>
              <Button 
                variant="primary" 
                onClick={() => setShowAddSlotForm(!showAddSlotForm)}
              >
                {showAddSlotForm ? "✖ Отмена" : "+ Добавить слот"}
              </Button>
            </div>

            {/* Форма добавления слота */}
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
                    <Button variant="primary" type="submit" style={{ marginTop: "28px" }}>
                      ✅ Создать
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* Список слотов */}
            <div className="slots-list">
              {slots.length === 0 && (
                <div className="empty-state">
                  😕 У вас пока нет созданных слотов.<br />
                  Нажмите "Добавить слот", чтобы студенты могли записываться.
                </div>
              )}
              
              {getTeacherSlotsWithBookings().map((slot) => (
                <div className="slot-card" key={slot.id}>
                  <div className="slot-info">
                    <div className="slot-datetime">
                      <span className="slot-icon">📅</span>
                      <span className="slot-date">{slot.dt.replace("T", " ")}</span>
                    </div>
                    <div className="slot-duration">
                      ⏱ {slot.durationMin} минут
                    </div>
                    {slot.bookings.length > 0 && (
                      <div className="slot-bookings">
                        📝 Записей: {slot.bookings.length}
                        {slot.bookings.map(b => (
                          <div key={b.id} className="booking-preview">
                            {b.topic} — <Badge status={b.status} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="danger" 
                    onClick={() => handleDeleteSlot(slot.id)}
                  >
                    🗑️ Удалить
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Вкладка ЗАЯВКИ */}
        {tab === "requests" && (
          <div className="panel-inner">
            <h2 className="h2">Новые заявки на консультации</h2>
            
            <div className="requests-list">
              {bookings.filter(b => b.teacherId === currentUser?.teacherId).length === 0 && (
                <div className="empty-state">
                  📭 Нет заявок. Когда студенты запишутся, они появятся здесь.
                </div>
              )}
              
              {bookings
                .filter(b => b.teacherId === currentUser?.teacherId)
                .map((booking) => (
                  <div className="request-card" key={booking.id}>
                    <div className="request-info">
                      <div className="request-student">
                        🎓 Студент: <strong>{booking.studentName || "Студент"}</strong>
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
                    
                    {booking.status === "Новая" && (
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