import { useState } from 'react';
import Modal from './Modal';
import TimeSelector from './TimeSelector';
import { getUIDate, getTimeDisplay } from '../utils/dateTime';

// The form lives inside the Modal, which unmounts its children when closed,
// so every clock in starts with a fresh time picker.
function ClockInForm({ job, BASE_URL, onClockedIn, onClose }) {
  const [startTime, setStartTime] = useState(null); // set by TimeSelector on mount
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (startTime === null || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      // Job details are copied from the schedule; scheduleId keeps the link
      const response = await fetch(`${BASE_URL}/timesheet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleId: job.id,
          date: job.date,
          projectName: job.projectName,
          projectNumber: job.projectNumber,
          reportNumber: job.reportNumber,
          role: job.role,
          task: job.task,
          startTime,
          endTime: 0, // 0 means "not clocked out yet"
          onSiteHours: 0,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to clock in');

      onClockedIn(data); // parent adds the new entry to its list
      onClose();
    } catch (err) {
      console.error('Clock in failed:', err.message);
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div style={{ color: 'black' }}>
      <h2>Clock In</h2>
      <div className='clock-in-grid'>
        <label>Job:</label>
        <p>{job.projectName || job.projectNumber}</p>
        <label>Task:</label>
        <p>{job.task || job.role}</p>
        <label>Scheduled:</label>
        <p>
          {getUIDate(job.date, true)}
          {job.timeNeeded != null && ` at ${getTimeDisplay(Number(job.timeNeeded))}`}
        </p>
        <label>Arrival:</label>
        <TimeSelector
          header='Arrival to Site'
          pullTimeInteger={setStartTime}
          initialTime={job.timeNeeded}
        />
      </div>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <button
        type='button'
        className='big-btn'
        style={{ marginTop: '15px', opacity: startTime === null || submitting ? 0.5 : 1 }}
        disabled={startTime === null || submitting}
        onClick={handleSubmit}
      >
        {submitting ? 'Saving...' : 'Clock In'}
      </button>
    </div>
  );
}

// job: the schedule row being clocked in to (null = modal closed)
function ClockInModal({ job, BASE_URL, onClockedIn, onClose }) {
  return (
    <Modal isOpen={job !== null} onClose={onClose}>
      {job && (
        <ClockInForm job={job} BASE_URL={BASE_URL} onClockedIn={onClockedIn} onClose={onClose} />
      )}
    </Modal>
  );
}

export default ClockInModal;