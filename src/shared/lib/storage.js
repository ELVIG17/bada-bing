const KEY = "bb_bookings";

export function loadBookings() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBookings(bookings) {
  localStorage.setItem(KEY, JSON.stringify(bookings));
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