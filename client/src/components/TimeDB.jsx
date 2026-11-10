import {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import '../css/data.css';


function TimeDB({BASE_URL}) {
  const [timesheet, setTimesheet] = useState([]);

  useEffect(()=>{
      fetchData();
    }, []);
  
  const fetchData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/timesheet`);
      const data = await response.json();
      setTimesheet(data);
    } catch (error) {
      console.log('Error fetching timesheet:', error.message);
    }

  }

    // 3. Handle deleting a user
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    try {
      const response = await fetch(`${BASE_URL}/timesheet/${id}`, {
        method: 'DELETE',
      });
        if (response.ok) {
          // Filter out deleted user from UI state instantly
          setTimesheet(timesheet.filter((entry) => entry.id !== id));
        }
    } catch (err) {
      console.error('Error deleting entry - 324bcdl:', err)
    }
  };

  const edit_entry = (id) => {
    alert('this button doesnt work yet lol')
  }

  return (
    <div className='main'>
      {timesheet.map((entry)=>(
        <div key={entry.id} className='entry'>
          <h4 className='entry-date'>{entry.date}</h4>
            
           <div className='job'>
              <h3 style={{placeSelf: 'start'}}>DAY Hours<br/>10</h3>
              <div className='job-info'>
                <p><strong>{entry.jobName}</strong></p>
                <p>{entry.service}</p>
                <p>Start: {entry.startTime}</p>
                <p>End: {
                  entry.endTime == '' ? '----' : entry.endTime
                  }</p>
                <p>On-Site: {entry.onSiteHours} hrs</p>
              </div>

              <div className='job-info'>
                <p>{entry.jobNumber}</p>
                <p>{entry.reportNumber}</p>
                <p>Travel: {entry.travelType}<button className='info-btn'>Show</button></p>
                <p>{entry.milesToSite} mi</p>
                <p>{entry.timeToSite} hrs</p>
              </div>
            
            <div className='entry-controls'>
              <button className='edit-btn'
                onClick={edit_entry}
                >Edit</button>
              <Link to='/clock-out' state={{
                id: entry.id,
                startTime: entry.startTime
                }}>
                <button className='edit-btn'
                style={{background: 'lightblue'}}
                >
                Clock Out
                </button>
              </Link>
              <button className='edit-btn'
                style={{background: 'indianred'}}
                onClick={edit_entry}
                >Report</button>
              <button className='danger-btn' onClick={()=>handleDelete(entry.id)}>Delete</button>
            </div> {/* close entry controls */}
          </div>
        </div> /* Close Entry */
      ))}
    </div>
  )
}
export default TimeDB;