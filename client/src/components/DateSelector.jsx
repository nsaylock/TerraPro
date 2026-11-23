import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import ArrowButton from './ArrowButton';
import '../css/App.css';
import '../css/TimeSelector.css';

const pad = (n) => String(n).padStart(2, '0');

// month is 1-12. Day 0 of the *next* month is the last day of this one,
// and Date handles leap years for us.
const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

// Spinner behavior: past the end goes back to the start, and vice versa
const wrap = (value, min, max) => (value > max ? min : value < min ? max : value);

const getToday = () => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
};

function DateSelector({ pullDateString, allowEdit }) {
  const [date, setDate] = useState(getToday);
  const [modalOpen, setModalOpen] = useState(false);
  const { year, month, day } = date;

  // Everything below is derived from the numbers above, never stored
  const dateString = `${year}-${pad(month)}-${pad(day)}`;
  const display = `${pad(month)} / ${pad(day)} / ${year}`;
  const dayOfWeek = new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
  });

  // Tell the parent whenever the date changes (and once on mount).
  // The callback lives in a ref so an inline function from the parent
  // can't re-trigger this effect.
  const pullRef = useRef(pullDateString);
  useEffect(() => {
    pullRef.current = pullDateString;
  });
  useEffect(() => {
    pullRef.current?.(dateString);
  }, [dateString]);

  const changeMonth = (delta) =>
    setDate((d) => {
      const newMonth = wrap(d.month + delta, 1, 12);
      return { ...d, month: newMonth, day: Math.min(d.day, daysInMonth(d.year, newMonth)) };
    });

  const changeDay = (delta) =>
    setDate((d) => ({ ...d, day: wrap(d.day + delta, 1, daysInMonth(d.year, d.month)) }));

  const changeYear = (delta) =>
    setDate((d) => {
      const newYear = d.year + delta;
      return { ...d, year: newYear, day: Math.min(d.day, daysInMonth(newYear, d.month)) };
    });

  return (
    <div className='full-width'>
      <span className='flex'>
      <div className='flex white-box'>
        {display}
        
      </div>
      {allowEdit && (
          <div className='edit-container'>
            <button type='button' onClick={() => setModalOpen(true)}>
              Edit
            </button>
            <button type='button' onClick={() => setDate(getToday())}>
              Today
            </button>
          </div>
        )}
        </span>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <h2 style={{ border: '2px solid gray' }}>Date</h2>
        <h3 style={{ marginBottom: '15px' }}>{dayOfWeek}</h3>
        <div className='date-edit-grid'>
          <ArrowButton direction='up' label='Next month' onClick={() => changeMonth(1)} />
          <p></p>
          <ArrowButton direction='up' label='Next day' onClick={() => changeDay(1)} />
          <p></p>
          <ArrowButton direction='up' label='Next year' onClick={() => changeYear(1)} />

          <h2>{pad(month)}</h2>
          <h2>/</h2>
          <h2>{pad(day)}</h2>
          <h2>/</h2>
          <h2>{year}</h2>

          <ArrowButton direction='down' label='Previous month' onClick={() => changeMonth(-1)} />
          <p></p>
          <ArrowButton direction='down' label='Previous day' onClick={() => changeDay(-1)} />
          <p></p>
          <ArrowButton direction='down' label='Previous year' onClick={() => changeYear(-1)} />
        </div>
      </Modal>
    </div>
  );
}

export default DateSelector;
