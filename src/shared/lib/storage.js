const BOOKINGS_KEY = "bb_bookings";
const SLOTS_KEY = "bb_slots";

// ========== РАБОТА С ЗАПИСЯМИ (BOOKINGS) ==========
export function loadBookings() {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBookings(bookings) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

export function addBooking(booking) {
  const bookings = loadBookings();
  bookings.push(booking);
  saveBookings(bookings);
}

export function removeBooking(id) {
  const bookings = loadBookings().filter((b) => b.id !== id);
  saveBookings(bookings);
  return bookings;
}

export function updateBookingStatus(id, status) {
  const bookings = loadBookings();
  const b = bookings.find((x) => x.id === id);
  if (!b) return bookings;
  b.status = status;
  saveBookings(bookings);
  return bookings;
}

// ========== РАБОТА СО СЛОТАМИ (SLOTS) ==========
// Загрузка всех слотов
export function loadSlots() {
  try {
    const raw = localStorage.getItem(SLOTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Сохранение всех слотов
function saveSlots(slots) {
  localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
}

// Добавление нового слота (только для преподавателя)
export function addSlot(slot) {
  const slots = loadSlots();
  const newSlot = {
    id: "slot_" + Date.now(),
    teacherId: slot.teacherId,
    teacherName: slot.teacherName,
    dt: slot.dt,
    durationMin: slot.durationMin,
    createdAt: new Date().toISOString(),
  };
  slots.push(newSlot);
  saveSlots(slots);
  return newSlot;
}

// Удаление слота (только для преподавателя)
export function deleteSlot(slotId, teacherId) {
  let slots = loadSlots();
  // Проверяем, что слот принадлежит этому преподавателю
  const slot = slots.find(s => s.id === slotId);
  if (slot && slot.teacherId === teacherId) {
    slots = slots.filter(s => s.id !== slotId);
    saveSlots(slots);
    
    // Также удаляем все записи, связанные с этим слотом
    let bookings = loadBookings();
    bookings = bookings.filter(b => b.slotId !== slotId);
    saveBookings(bookings);
    
    return true;
  }
  return false;
}

// Получение слотов конкретного преподавателя
export function getTeacherSlots(teacherId) {
  const slots = loadSlots();
  return slots.filter(s => s.teacherId === teacherId);
}

// Инициализация начальных слотов (если пусто)
export function initSlots() {
  const slots = loadSlots();
  if (slots.length === 0) {
    const initialSlots = [
      { id: "s1", teacherId: 1, teacherName: "Иванов Иван Иванович", dt: "2026-03-20 14:00", durationMin: 30, createdAt: new Date().toISOString() },
      { id: "s2", teacherId: 1, teacherName: "Иванов Иван Иванович", dt: "2026-03-20 15:00", durationMin: 45, createdAt: new Date().toISOString() },
      { id: "s3", teacherId: 2, teacherName: "Петрова Анна Сергеевна", dt: "2026-03-18 16:00", durationMin: 30, createdAt: new Date().toISOString() },
      { id: "s4", teacherId: 3, teacherName: "Сидоров Михаил Олегович", dt: "2026-03-22 13:10", durationMin: 40, createdAt: new Date().toISOString() },
    ];
    saveSlots(initialSlots);
  }
}

// Получить слот по ID
export function getSlotById(slotId) {
  const slots = loadSlots();
  return slots.find(s => s.id === slotId);
}