// Shared date/time helpers. Dates are 'YYYY-MM-DD' strings and times are
// "military integers" (1305 = 1:05 PM, 5 = 12:05 AM).

// 'YYYY-MM-DD' -> 'MM/DD/YY' (or 'MM/DD/YYYY' with fullYear)
export function getUIDate(dateString, fullYear = false) {
  const [year, month, day] = dateString.split('-');
  return `${month}/${day}/${fullYear ? year : year.slice(2)}`;
}

// 'YYYY-MM-DD' -> 'Monday'
export function getDayOfWeek(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { weekday: 'long' });
}

// 1305 -> '1:05 PM', 5 -> '12:05 AM', 2400 -> '12:00 AM'
export function getTimeDisplay(time) {
  const hour24 = Math.floor(time / 100) % 24;
  const mins = String(time % 100).padStart(2, '0');
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${mins} ${hour24 >= 12 ? 'PM' : 'AM'}`;
}

const toMinutes = (time) => Math.floor(time / 100) * 60 + (time % 100);

// Hours between two military times, rounded to 2 decimals.
// If the end is earlier than the start, the job ran past midnight.
// (Assumes a job is shorter than 24 hours.)
export function calculateHours(startTime, endTime) {
  let minutes = toMinutes(endTime) - toMinutes(startTime);
  if (minutes < 0) minutes += 24 * 60;
  return Number((minutes / 60).toFixed(2));
}
