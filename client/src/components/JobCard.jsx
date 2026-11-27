import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import { getUIDate, getDayOfWeek, getTimeDisplay } from '../utils/dateTime';
import { getEntryHours, sumHours } from '../utils/hours';
import '../css/JobCard.css';

function TitleBar({ date, dailyHours }) {
  return (
    <div className='title-bar'>
      <div style={{ display: 'flex' }}>
        <h3 style={{ marginRight: '10px' }}>{getUIDate(date)}</h3>
        <h3>{getDayOfWeek(date)}</h3>
      </div>
      {dailyHours != null && (
        <div style={{ display: 'flex' }}>
          <h3>Hours: {dailyHours}</h3>
        </div>
      )}
    </div>
  );
}

// One scheduled job. `job` comes from the schedule table, `entry` from the
// timesheet table. entry is null until the employee clocks in, and job is null
// for old entries that were created before the schedule existed.
function JobItem({ job, entry, onClockIn, onAddTravel, onDelete }) {
  const navigate = useNavigate();
  const [travelOpen, setTravelOpen] = useState(false);

  const info = job ?? entry; // fields both tables share
  const clockedIn = entry !== null;
  const clockedOut = clockedIn && Number(entry.endTime) !== 0;
  const hasTravel = clockedIn && Boolean(entry.travelType);
  const hours = clockedIn ? getEntryHours(entry) : 0;

  return (
    <div className='job-details'>
      {clockedIn && <p className='job-hrs'>{hours}</p>}
      <div className='job-grid'>
        <div className='job-info-col'>
          <h3 className='col-header'>{info.projectName}</h3>
          <p><strong>Project: {info.projectNumber}</strong></p>
          <p><strong>Report: {info.reportNumber}</strong></p>
          {info.role && <p>{info.role}</p>}
          {info.task && <p>Task: {info.task}</p>}
          {job?.location && <p>Location: {job.location}</p>}
          {job?.description && <p>{job.description}</p>}
          {job?.cubicYards && <p>{job.cubicYards} CY</p>}
          {job?.sampleType && <p>{job.sampleType}</p>}
          {job?.sets && <p style={{display: 'inline'}}>{job.sets}</p>}
          {job?.setSize && <p style={{display:'inline'}}>({job.setSize})</p>}
        </div>

        <div className='job-info-col'>
          <h3 className='col-header'>Time</h3>
          {clockedIn ? (
            <>
              <p>Start: {getTimeDisplay(entry.startTime)}</p>
              <p>End: {clockedOut ? getTimeDisplay(entry.endTime) : '-------'}</p>
              <p>On-Site: {entry.onSiteHours} hrs</p>
            </>
          ) : (
            <>
              <p>Scheduled</p>
              {job?.timeNeeded != null && <p>Needed: {getTimeDisplay(Number(job.timeNeeded))}</p>}
            </>
          )}

          {!clockedIn && (
            <button
              type='button'
              className='ts-btn'
              style={{ background: 'lightgreen' }}
              onClick={() => onClockIn(job)}
            >
              Clock In
            </button>
          )}
          {clockedIn && !clockedOut && (
            <button
              type='button'
              className='ts-btn'
              style={{ background: 'var(--danger)' }}
              onClick={() => navigate('/clock-out', { state: { id: entry.id } })}
            >
              Clock Out
            </button>
          )}
        </div>

        <div className='job-info-col'>
          <h3 className='col-header'>Travel</h3>
          <p>
            {hasTravel ? entry.travelType : 'None'}
            {hasTravel && (
              <button type='button' className='info-btn' onClick={() => setTravelOpen(true)}>
                Show
              </button>
            )}
          </p>
          {hasTravel && <p>Mileage: {entry.totalMiles} mi</p>}
          {hasTravel && <p>Time: {entry.totalTravelTime} hrs</p>}
          {clockedIn && !clockedOut && (
            <button type='button' className='ts-btn' onClick={() => onAddTravel(entry)}>
              {hasTravel ? 'Edit Travel' : 'Add Travel'}
            </button>
          )}
        </div>

        <div className='job-controls'>
          <button
            type='button'
            className='ts-btn'
            style={{ backgroundColor: 'var(--danger)' }}
            onClick={() => alert("Reports aren't available yet")}
          >
            Report
          </button>
          <button
            type='button'
            className='ts-btn'
            onClick={() => alert("Can't edit yet")}
          >
            Edit
          </button>
          {clockedIn && (
            <button
              type='button'
              className='ts-btn'
              style={{ backgroundColor: 'orange' }}
              onClick={() => onDelete(entry.id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {hasTravel && (
        <Modal isOpen={travelOpen} onClose={() => setTravelOpen(false)}>
          <div style={{ color: 'black' }}>
            <h2>Travel Details</h2>
            <p>Type: {entry.travelType}</p>
            {entry.toSiteStart && <p>From: {entry.toSiteStart}</p>}
            {entry.toSiteEnd && <p>To: {entry.toSiteEnd}</p>}
            <p>Mileage: {entry.totalMiles} mi</p>
            <p>Time: {entry.totalTravelTime} hrs</p>
            <button type='button' onClick={() => setTravelOpen(false)}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// One day: a title bar plus an item for each job. Each item is { job, entry }.
function JobCard({ items = [], date, onClockIn, onAddTravel, onDelete }) {
  if (items.length === 0) return (
    <div className='job-cont-trans'>
      <TitleBar date={date} />
    </div>
    )

  const entries = items.map((i) => i.entry).filter(Boolean);

  return (
    <div className='job-container'>
      <TitleBar date={date} dailyHours={sumHours(entries)} />
      {items.map(({ job, entry }) => (
        <JobItem
          key={job ? `job-${job.id}` : `entry-${entry.id}`}
          job={job}
          entry={entry}
          onClockIn={onClockIn}
          onAddTravel={onAddTravel}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default JobCard;