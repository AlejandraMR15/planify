import { CATEGORY_SCHEDULE } from '../data/mockData';
import { uid } from './format';

const MINUTES_IN_DAY = 1440;
const MAX_LEAD_MINUTES = 600;

const toMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export function shiftTime(time, delta) {
  const total = (toMinutes(time) + delta + MINUTES_IN_DAY) % MINUTES_IN_DAY;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export const minutesBetween = (from, to) => toMinutes(to) - toMinutes(from);

// Minutos desde el inicio del evento. Lo que queda muy antes del inicio es madrugada del día siguiente.
export function offsetFromStart(time, startTime) {
  const diff = minutesBetween(startTime, time);
  return diff < -MAX_LEAD_MINUTES ? diff + MINUTES_IN_DAY : diff;
}

export const sortActivities = (activities, startTime) =>
  [...activities].sort((a, b) => offsetFromStart(a.time, startTime) - offsetFromStart(b.time, startTime));

// Un mismo proveedor no puede estar en dos actividades a la vez
export function findConflicts(activities, startTime) {
  const sorted = sortActivities(activities, startTime);
  const conflicts = new Set();
  sorted.forEach((a, i) => {
    if (!a.serviceId) return;
    const end = offsetFromStart(a.time, startTime) + a.duration;
    sorted.slice(i + 1).forEach((b) => {
      if (b.serviceId === a.serviceId && offsetFromStart(b.time, startTime) < end) {
        conflicts.add(a.id);
        conflicts.add(b.id);
      }
    });
  });
  return conflicts;
}

export function buildActivities(items, startTime) {
  return items.flatMap(({ service, qty }) =>
    (CATEGORY_SCHEDULE[service.category] || []).map((step) => ({
      id: uid('a'),
      title: step.title,
      time: shiftTime(startTime, step.offset),
      duration: step.billedHours && service.unit === 'hora' ? qty * 60 : step.duration,
      serviceId: service.id,
      done: false,
    }))
  );
}
