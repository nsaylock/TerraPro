import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import ArrowButton from './ArrowButton';
import '../css/TimeSelector.css';

const pad = (n) => String(n).padStart(2, '0');

const wrap = (value, min, max) => (value > max ? min : value < min ? max : value);

const getNow = () => {
  const now = new Date();
  return { hour24: now.getHours(), minute: now.getMinutes() };
};

function TimeSelector({ header, pullTimeInteger }) {
  // The only stored time is a 24-hour hour and a minute.
  // The 12-hour display, AM/PM and military integer are all derived.
  const [time, setTime] = useState(getNow);
  const [modalOpen, setModalOpen] = useState(false);
  const { hour24, minute } = time;

  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12; // 0 -> 12, 13 -> 1
  const military = hour24 * 100 + minute; // 1:30 PM -> 1330, 12:15 AM -> 15

  // Tell the parent whenever the time changes (and once on mount).
  // The callback lives in a ref so an inline function from the parent
  // can't re-trigger this effect.
  const pullRef = useRef(pullTimeInteger);
  useEffect(() => {
    pullRef.current = pullTimeInteger;
  });
  useEffect(() => {
    pullRef.current?.(military);
  }, [military]);

  // Hour spins 1-12 and keeps the current AM/PM
  const changeHour = (delta) =>
    setTime((t) => {
      const isPM = t.hour24 >= 12;
      const newHour12 = wrap((t.hour24 % 12 || 12) + delta, 1, 12);
      return { ...t, hour24: (newHour12 % 12) + (isPM ? 12 : 0) };
    });

  // Minutes snap to the next/previous quarter hour
  const minuteUp = () =>
    setTime((t) => {
      const next = (Math.floor(t.minute / 15) + 1) * 15;
      return { ...t, minute: next >= 60 ? 0 : next };
    });

  const minuteDown = () =>
    setTime((t) => {
      const prev = (Math.ceil(t.minute / 15) - 1) * 15;
      return { ...t, minute: prev < 0 ? 45 : prev };
    });

  const togglePeriod = () => setTime((t) => ({ ...t, hour24: (t.hour24 + 12) % 24 }));

  return (
    <div>
      <div className='flex white-box'>
        {hour12} : {pad(minute)} {period}
        <button type='button' onClick={() => setModalOpen(true)} className='edit-btn'>
          Edit
        </button>
        <button type='button' onClick={() => setTime(getNow())} className='edit-btn'>
          Now
        </button>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <h2 style={{ color: 'black' }}>{header}</h2>
        <div className='time-edit-grid'>
          <ArrowButton direction='up' label='Next hour' onClick={() => changeHour(1)} />
          <h1></h1>
          <ArrowButton direction='up' label='Next quarter hour' onClick={minuteUp} />
          {period === 'PM' ? (
            <button className='invis-btn' type='button' onClick={togglePeriod}>
              AM
            </button>
          ) : (
            <h1></h1>
          )}

          <div className='time-box'>
            <h2>{hour12}</h2>
          </div>
          <h2>:</h2>
          <div className='time-box'>
            <h2>{pad(minute)}</h2>
          </div>
          <div className='time-box'>
            <h2>{period}</h2>
          </div>

          <ArrowButton direction='down' label='Previous hour' onClick={() => changeHour(-1)} />
          <h1></h1>
          <ArrowButton direction='down' label='Previous quarter hour' onClick={minuteDown} />
          {period === 'AM' ? (
            <button className='invis-btn' type='button' onClick={togglePeriod}>
              PM
            </button>
          ) : (
            <h1></h1>
          )}
        </div>
        <button type='button' onClick={() => setModalOpen(false)}>
          OK
        </button>
      </Modal>
    </div>
  );
}

export default TimeSelector;
