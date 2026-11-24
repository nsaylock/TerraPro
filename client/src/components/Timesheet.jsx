import { useState, useEffect, useMemo } from 'react';
import JobCard from './JobCard.jsx';
import {getUIDate} from '../utils/dateTime.js';
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

function Timesheet({ BASE_URL }) {

  const [seek, setSeek] = useState(0);
  const [timesheet, setTimesheet] = useState(null); // null = not loaded yet
  const [error, setError] = useState(null);
  const weeklyHours = sumHours(timesheet ?? []);


  const weekDates = useMemo(() => getWeekDates(seek), [seek]);
  const start = weekDates[0];
  const end = weekDates[6];

  useEffect(() => {
    const controller = new AbortController();
    setTimesheet(null);
    setError(null);

    const url = new URL(`${BASE_URL}/timesheet/period`);
    url.searchParams.append('periodStart', start);
    url.searchParams.append('periodEnd', end);

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then(setTimesheet)
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      });

    return () => controller.abort();
  }, [BASE_URL, start, end]);

  // Group entries by date: { '2026-11-22': [entry, ...], ... }
  const entriesByDate = useMemo(() => {
    const map = {};
    for (const entry of timesheet ?? []) {
      (map[entry.date] ??= []).push(entry);
    }
    return map;
  }, [timesheet]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      const res = await fetch(`${BASE_URL}/timesheet/${id}`, { method: 'DELETE' });
      if (res.ok) setTimesheet((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Error deleting entry:', err);
    }
  };

  

  return (
    <div className='ts-main'>
      <nav className='ts-seek'>
        <button onClick={() => setSeek((s) => s - 1)}>Previous</button>
        <button onClick={() => setSeek(0)}>Current</button>
        <button onClick={() => setSeek((s) => s + 1)}>Next</button>
      </nav>
      <h3 style={{color: 'var(--text)'}}>{getUIDate(start)} - {getUIDate(end)}</h3>
      <h3 style={{color:'var(--text)'}}>Total Hours: {weeklyHours}</h3>

      {error && <p>Error: {error}</p>}
      {timesheet === null && !error && <p>Loading...</p>}

      {timesheet !== null &&
        weekDates.map((date) => (
          <JobCard
            key={date}
            data={entriesByDate[date] ?? []}
            date={date}
            onDelete={handleDelete}
          />
        ))}
    </div>
  );
}

export default Timesheet;