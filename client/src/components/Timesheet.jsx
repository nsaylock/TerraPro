import { useState, useEffect, useMemo } from 'react';
import JobCard from './JobCard.jsx';
import ClockInModal from './ClockInModal.jsx';
import AddTravelModal from './AddTravelModal.jsx';
import { getUIDate } from '../utils/dateTime.js';
import { sumHours } from '../utils/hours.js';
import '../css/Timesheet.css';

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Returns 7 'YYYY-MM-DD' strings, Sunday through Saturday
function getWeekDates(seek) {
  const t = new Date();
  const sunday = new Date(t.getFullYear(), t.getMonth(), t.getDate() - t.getDay() + seek * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return formatDate(d);
  });
}

async function getJson(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Server returned ${res.status}`);
  return res.json();
}

function Timesheet({ BASE_URL, employeeId = 276067 }) {
  const [seek, setSeek] = useState(0);
  const [schedule, setSchedule] = useState(null); // null = not loaded yet
  const [timesheet, setTimesheet] = useState(null);
  const [error, setError] = useState(null);

  const [clockInJob, setClockInJob] = useState(null); // schedule row being clocked in to
  const [travelEntry, setTravelEntry] = useState(null); // timesheet entry getting travel

  const weekDates = useMemo(() => getWeekDates(seek), [seek]);
  const start = weekDates[0];
  const end = weekDates[6];

  useEffect(() => {
    const controller = new AbortController();
    setSchedule(null);
    setTimesheet(null);
    setError(null);

    const scheduleUrl = new URL(`${BASE_URL}/schedule/employee/${employeeId}`);
    scheduleUrl.searchParams.append('periodStart', start);
    scheduleUrl.searchParams.append('periodEnd', end);

    const timesheetUrl = new URL(`${BASE_URL}/timesheet/period`);
    timesheetUrl.searchParams.append('periodStart', start);
    timesheetUrl.searchParams.append('periodEnd', end);

    Promise.all([
      getJson(scheduleUrl, controller.signal),
      getJson(timesheetUrl, controller.signal),
    ])
      .then(([scheduleRows, timesheetRows]) => {
        setSchedule(scheduleRows);
        setTimesheet(timesheetRows);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      });

    return () => controller.abort();
  }, [BASE_URL, employeeId, start, end]);

  // Join the two tables: every scheduled job, paired with its timesheet entry
  // (if the employee has clocked in). Entries from before the schedule existed
  // have no scheduleId, so they show up as entry-only items.
  // Result: { '2026-11-22': [{ job, entry }, ...], ... }
  const itemsByDate = useMemo(() => {
    const map = {};
    if (!schedule || !timesheet) return map;

    const entryByJob = new Map();
    const legacy = [];
    for (const entry of timesheet) {
      if (entry.scheduleId == null) legacy.push(entry);
      else entryByJob.set(entry.scheduleId, entry);
    }

    const add = (date, item) => (map[date] ??= []).push(item);
    for (const job of schedule) {
      add(job.date, { job, entry: entryByJob.get(job.id) ?? null });
    }
    for (const entry of legacy) add(entry.date, { job: null, entry });

    // Within a day: the order they happen (scheduled time, or clock in time)
    const when = ({ job, entry }) => Number(job?.timeNeeded ?? entry?.startTime ?? 0);
    for (const items of Object.values(map)) items.sort((a, b) => when(a) - when(b));
    return map;
  }, [schedule, timesheet]);

  // Only entries that belong to a job shown this week count toward the total
  const weeklyHours = useMemo(() => {
    const entries = Object.values(itemsByDate).flat().map((i) => i.entry).filter(Boolean);
    return sumHours(entries);
  }, [itemsByDate]);

  const handleClockedIn = (entry) => setTimesheet((prev) => [...prev, entry]);

  const handleTravelSaved = (updated) =>
    setTimesheet((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));

  // Deleting a timesheet entry undoes the clock in: the job goes back to "scheduled"
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this time entry? The job will stay on your schedule.')) return;
    try {
      const res = await fetch(`${BASE_URL}/timesheet/${id}`, { method: 'DELETE' });
      if (res.ok) setTimesheet((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Error deleting entry:', err);
    }
  };

  const loading = schedule === null || timesheet === null;

  return (
    <div className='ts-main'>
      <nav className='ts-seek'>
        <button onClick={() => setSeek((s) => s - 1)}>Previous</button>
        <button onClick={() => setSeek(0)}>Current</button>
        <button onClick={() => setSeek((s) => s + 1)}>Next</button>
      </nav>
      <h3 style={{ color: 'var(--text)' }}>{getUIDate(start)} - {getUIDate(end)}</h3>
      <h3 style={{ color: 'var(--text)' }}>Total Hours: {weeklyHours}</h3>

      {error && <p>Error: {error}</p>}
      {loading && !error && <p>Loading...</p>}

      {!loading &&
        weekDates.map((date) => (
          <JobCard
            key={date}
            items={itemsByDate[date] ?? []}
            date={date}
            onClockIn={setClockInJob}
            onAddTravel={setTravelEntry}
            onDelete={handleDelete}
          />
        ))}

      <ClockInModal
        job={clockInJob}
        BASE_URL={BASE_URL}
        onClockedIn={handleClockedIn}
        onClose={() => setClockInJob(null)}
      />
      <AddTravelModal
        entry={travelEntry}
        BASE_URL={BASE_URL}
        onSaved={handleTravelSaved}
        onClose={() => setTravelEntry(null)}
      />
    </div>
  );
}

export default Timesheet;