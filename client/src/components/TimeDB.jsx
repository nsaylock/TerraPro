import {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';


function TimeDB({BASE_URL}) {
  const [timesheet, setTimesheet] = useState([]);
  const [travelDetailsOpen, setTravelDetailsOpen] = useState(false);
  const [seek, setSeek] = useState(0);

  let period = getPeriod();

  function getPeriod() {
    const sunday = new Date();
    const offset = seek * 7;
    sunday.setDate(sunday.getDate() - sunday.getDay() + offset);
    const start = formatDate(sunday);

    const saturday = new Date();
    saturday.setDate(sunday.getDate() + 6);
    const end = formatDate(saturday);

    return {start: start, end: end};
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let formattedDate;
    if (day.toString().length == 1) formattedDate = `${year}-${month}-0${day}`;
    else formattedDate = `${year}-${month}-${day}`
    return formattedDate;
  }

  useEffect(()=>{
    period = getPeriod();
    fetchPeriodData();
  }, [seek]);


  const fetchPeriodData = async () => {
    const url = new URL(`${BASE_URL}/timesheet/period`);
    url.searchParams.append('periodStart', period.start);
    url.searchParams.append('periodEnd', period.end);
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(data[0])
      setTimesheet(data);
    } catch (error) {
      console.log('Error fetching timesheet:', error.message);
    }
  }

  const fetchAllData = async () => {
    const url = new URL(`${BASE_URL}/timesheet`);
    try {
      const response = await fetch(url);
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

function getUIDate(dateString) {
  const {month, day, year} = splitDateString(dateString);
  return (month + '/' + day + '/' + year.slice(2))
}

  function get_day_of_week(dateString) {
    const {month, day, year} = splitDateString(dateString);
    const specificDate = new Date(`${year}-${month}-${day}T12:00:00`);
    return specificDate.toLocaleDateString('en-US', {weekday: 'long'});
  }

  function splitDateString(dateString) {
    const temp = dateString.split(/[--]/);
    const year = temp[0];
    const month = temp[1];
    const day = temp[2];
    return {month, day, year};
  }

  return (
    
    <div className='main'>
      <nav className='timesheet-seek'>
        <button onClick={()=>setSeek(seek - 1)}>Previous</button>
        <button onClick={()=>setSeek(0)}>Current</button>
        <button onClick={()=>setSeek(seek + 1)}>Next</button>
      </nav>
      <p>{getUIDate(period.start)} - {getUIDate(period.end)}</p>
      {timesheet.map((entry)=>(
        <div key={entry.id} className='entry'>
          <div className='title-bar'>
            <h3 style={{marginRight: '10px'}}>{getUIDate(entry.date)}</h3>
            <h3>{get_day_of_week(entry.date)}</h3>
          </div> 
            
           <div className='job'>
              <div style={{textAlign: 'left'}}>
                <h3 style={{placeSelf: 'start'}}>Hours<br/>{Number(entry.onSiteHours) + Number(entry.totalTravelTime)}<br/></h3>
              </div>
              <div className='job-info'>
                <p><strong>{entry.projectName}</strong></p>
                <p>{entry.service}</p>
                <p>Start: {entry.startTime}</p>
                <p>End: {
                  entry.endTime == '' ? '----' : entry.endTime
                  }</p>
                <p>On-Site: {entry.onSiteHours} hrs</p>
              </div>

              <div className='job-info'>
                <p>Project: {entry.projectNumber}</p>
                <p>Report: {entry.reportNumber}</p>
                <p>Travel: {entry.travelType === '' ? 'None' : entry.travelType}
                  {entry.travelType != '' && <button className='info-btn' onClick={()=>setTravelDetailsOpen(true)}>Show</button>}
                </p>
                {entry.travelType != '' && <p>Mileage: {entry.totalMiles} mi</p>}
                {entry.travelType != '' && <p>Time: {entry.totalTravelTime} hrs</p>}
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