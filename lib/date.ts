import { addDays, differenceInCalendarDays, startOfWeek } from 'date-fns';

export function getWeekDays(base: Date, weekStartsOn: 0 | 1 = 1) {
  const start = startOfWeek(base, { weekStartsOn });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function isDueSoon(dueDateISO: string, today = new Date()) {
  const due = new Date(dueDateISO);
  const diff = differenceInCalendarDays(due, today);
  return diff >= 0 && diff <= 3;
}
