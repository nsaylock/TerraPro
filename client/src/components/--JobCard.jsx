import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import { getUIDate, getDayOfWeek, getTimeDisplay } from '../utils/dateTime';
import { getEntryHours, sumHours } from '../utils/hours.js';
import '../css/JobCard.css';

function TitleBar({ date, dailyHours }) {
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

function JobEntry({ job, onDelete }) {
  const navigate = useNavigate();
  
  
  const [travelOpen, setTravelOpen] = useState(false);

  const hasTravel = Boolean(job.travelType);
  const totalHours = Number((Number(job.onSiteHours) + Number(job.totalTravelTime)).toFixed(2));
  const clockedOut = Number(job.endTime) !== 0;
  

  return (
    <div className='job-details'>
      <p className='job-hrs'>{totalHours}</p>
      <div className='job-grid'>
        <div className='job-info-col'>
          <h3 className='col-header'>{job.projectName}</h3>
          <p><strong>Project: {job.projectNumber}</strong></p>
          <p><strong>Report: {job.reportNumber}</strong></p>
          <p>{job.service}</p>
          <p>Structure or Location</p>
          <p>Cylinders</p>
        </div>

        <div className='job-info-col'>
          <h3 className='col-header'>Time</h3>
          <p>Start: {getTimeDisplay(job.startTime)}</p>
          <p>End: {clockedOut ? getTimeDisplay(job.endTime) : '-------'}</p>
          <p>On-Site: {job.onSiteHours} hrs</p>
          
          <button
            type='button'
            className='ts-btn'
            style={{ background: 'var(--danger)' }}
            onClick={() =>
              navigate('/clock-out', {
                state: { id: job.id, startTime: job.startTime, service: job.service },
              })
            }
          >
            Clock Out
          </button>
        </div>

        <div className='job-info-col'>
          <h3 className='col-header'>Travel</h3>
          <p>
            {hasTravel ? job.travelType : 'None'}
            {hasTravel && (
              <button type='button' className='info-btn' onClick={() => setTravelOpen(true)}>
                Show
              </button>
            )}
          </p>
          {hasTravel && <p>Mileage: {job.totalMiles} mi</p>}
          {hasTravel && <p>Time: {job.totalTravelTime} hrs</p>}
          <button className='ts-btn'>Add Travel</button>
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
          
          <button type='button' className='ts-btn' 
            style={{backgroundColor: 'orange'}}
            onClick={() => onDelete(job.id)}>
            Delete
          </button>
        </div>
      </div>

      <Modal isOpen={travelOpen} onClose={() => setTravelOpen(false)}>
        <div style={{ color: 'black' }}>
          <h2>Travel Details</h2>
          <p>Type: {job.travelType}</p>
          {job.toSiteStart && <p>From: {job.toSiteStart}</p>}
          {job.toSiteEnd && <p>To: {job.toSiteEnd}</p>}
          <p>Mileage: {job.totalMiles} mi</p>
          <p>Time: {job.totalTravelTime} hrs</p>
          <button type='button' onClick={() => setTravelOpen(false)}>Close</button>
        </div>
      </Modal>
    </div>
  );
}

// ---- One day: a title bar, plus an entry for each job on that day ----

function JobCard({ data = [], date, onDelete }) {
  if (data.length === 0) return <TitleBar date={date} />;

  return (
    <div className='job-container'>
      <TitleBar date={date} dailyHours={sumHours(data)}/>
      {data.map((job) => (
        <JobEntry key={job.id} job={job} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default JobCard;
