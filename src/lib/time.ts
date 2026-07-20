export function addMinutes(ts: number, minutes: number): number {
  return ts + minutes * 60 * 1000;
}

export function minutesBetween(fromTs: number, toTs: number): number {
  return (toTs - fromTs) / (60 * 1000);
}

export function startOfLocalDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function dateAtHour(base: Date, hour: number, minute = 0): number {
  const d = new Date(base);
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}
