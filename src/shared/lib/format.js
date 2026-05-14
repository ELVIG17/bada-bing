export function formatSlot(slot) {
  if (!slot) return "—";
  return `${slot.dt} (${slot.durationMin} мин.)`;
}