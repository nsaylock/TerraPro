import {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import '../css/data.css';


function TimeDB({BASE_URL}) {
  const [timesheet, setTimesheet] = useState([]);
  const [travelDetailsOpen, setTravelDetailsOpen] = useState(false);

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

  function get_day_of_week(dateString) {
    const temp = dateString.split(/[//]/);
    const month = temp[0];
    const day = temp[1];
    const year = '20' + temp[2];
    const specificDate = new Date(`${year}-${month}-${day}T12:00:00`);
    return specificDate.toLocaleDateString('en-US', {weekday: 'long'});
  }

  return (
    <div className='main'>
      {timesheet.map((entry)=>(
        <div key={entry.id} className='entry'>
          <div className='title-bar'>
            <h3 style={{marginRight: '10px'}}>{entry.date}</h3>
            <h3>{get_day_of_week(entry.date)}</h3>
          </div> 
            
           <div className='job'>
              <div style={{textAlign: 'left'}}>
                <h3 style={{placeSelf: 'start'}}>Hours<br/>{entry.onSiteHours + entry.totalTravelTime}<br/></h3>
                {entry.sets !== null && (
                  <>
                  <h3>Samples</h3>
                  <h3>{entry.sets + '(' + entry.samples + ')'}</h3>
                  </>
                )}
              </div>
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
                <p>Project: {entry.jobNumber}</p>
                <p>Report: {entry.reportNumber}</p>
                <p>Travel: {entry.travelType}
                  <button className='info-btn' onClick={()=>setTravelDetailsOpen(true)}>Show</button>
                </p>
                <p>{entry.totalMiles} mi</p>
                <p>{entry.totalTravelTime} hrs</p>
              </div>
            
            <div className='entry-controls'>
              <button className='edit-btn'
                onClick={edit_entry}
                >Edit</button>
              <Link to='/clock-out' state={{
                id: entry.id,
                startTime: entry.startTime,
                service: entry.service
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