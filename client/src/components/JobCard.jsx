import {useState} from 'react';
import {Link} from 'react-router-dom';

function JobCard({data}) {

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
    alert('Can\'t edit yet lol')
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

  function getTimeDisplay(time) {
    let timeFloor = Math.floor(time / 100) * 100;
    let meridiem;
    let hours = timeFloor / 100;
    if (hours < 12) {
      meridiem = 'AM';
    } else if (hours === 12) {
      meridiem = 'PM';
    } else {
      hours -= 12;
      meridiem = 'PM'
    }
    let mins = time - timeFloor;
    if (mins.toString().length === 1) {
      mins = `0${mins}`;
    }

    return (`${hours}:${mins} ${meridiem}`);
  }

  {data.map((entry)=>(
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
                <p>Start: {getTimeDisplay(entry.startTime)}</p>
                <p>End: {
                  entry.endTime == 0  ? '-------' : getTimeDisplay(entry.endTime)
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
}

export default JobCard;

