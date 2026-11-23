import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import { getUIDate, getDayOfWeek, getTimeDisplay } from '../utils/dateTime';
import '../css/JobCard.css';

function TitleBar({ date, dailyHours }) {
  const [stateHours, setStateHours] = useState(dailyHours);
  return (
    <div className='title-bar'>
      <div style={{display:'flex'}}>
        <h3 style={{ marginRight: '10px' }}>{getUIDate(date)}</h3>
        <h3>{getDayOfWeek(date)}</h3>
      </div>
      {dailyHours != null && (
        <div style={{display:'flex'}}>
          <h3>Hours: {dailyHours}</h3>
        </div>
      )}
      
    </div>
  );
}

// ---- One timesheet entry. Owns its own "travel details" modal state. ----

function JobEntry({ entry, onDelete, pullEntryHours }) {
  const navigate = useNavigate();
  
  
  const [travelOpen, setTravelOpen] = useState(false);

  const hasTravel = Boolean(entry.travelType);
  const totalHours = Number((Number(entry.onSiteHours) + Number(entry.totalTravelTime)).toFixed(2));
  const clockedOut = Number(entry.endTime) !== 0;

  const pullRef = useRef(pullEntryHours);
  useEffect(()=>{pullRef.current = pullEntryHours});
  useEffect(()=>{pullRef.current?.(totalHours)},[])
  

  return (
    <div className='job-week-view'>
      <div className='job'>
        <div style={{ textAlign: 'left' }}>
          <h3>{totalHours} {totalHours <= 1?'Hr':'Hrs'}</h3>
        </div>

        <div className='job-info'>
          <p><strong>{entry.projectName}</strong></p>
          <p>{entry.service}</p>
          <p>Start: {getTimeDisplay(entry.startTime)}</p>
          <p>End: {clockedOut ? getTimeDisplay(entry.endTime) : '-------'}</p>
          <p>On-Site: {entry.onSiteHours} hrs</p>
        </div>

        <div className='job-info'>
          <p>Project: {entry.projectNumber}</p>
          <p>Report: {entry.reportNumber}</p>
          <p>
            Travel: {hasTravel ? entry.travelType : 'None'}
            {hasTravel && (
              <button type='button' className='info-btn' onClick={() => setTravelOpen(true)}>
                Show
              </button>
            )}
          </p>
          {hasTravel && <p>Mileage: {entry.totalMiles} mi</p>}
          {hasTravel && <p>Time: {entry.totalTravelTime} hrs</p>}
        </div>

        <div className='entry-controls'>
          <button
            type='button'
            className='edit-btn'
            onClick={() => alert("Can't edit yet")}
          >
            Edit
          </button>
          <button
            type='button'
            className='edit-btn'
            style={{ background: 'lightblue' }}
            onClick={() =>
              navigate('/clock-out', {
                state: { id: entry.id, startTime: entry.startTime, service: entry.service },
              })
            }
          >
            Clock Out
          </button>
          <button
            type='button'
            className='edit-btn'
            style={{ background: 'indianred' }}
            onClick={() => alert("Reports aren't available yet")}
          >
            Report
          </button>
          <button type='button' className='danger-btn' onClick={() => onDelete(entry.id)}>
            Delete
          </button>
        </div>
      </div>

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
    </div>
  );
}

// ---- One day: a title bar, plus an entry for each job on that day ----

function JobCard({ data = [], date, onDelete }) {
  if (data.length === 0) return <TitleBar date={date} />;
  const [dailyHours, setDailyHours] = useState(0);
  const handleHours = useCallback((totalHours)=>{
    setDailyHours(dailyHours + totalHours);
  })

  return (
    <div className='entry'>
      <TitleBar date={date} dailyHours={dailyHours}/>
      {data.map((entry) => (
        <JobEntry key={entry.id} entry={entry} onDelete={onDelete} pullEntryHours={handleHours} />
      ))}
    </div>
  );
}

export default JobCard;
