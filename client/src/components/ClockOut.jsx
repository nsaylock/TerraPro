import {useState, useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import TimeSelector from "./TimeSelector";
import Travel from './Travel';

// Need to disable clock out button if not all fields are filled
// Will need to be able to handle over night jobs

function ClockOut({BASE_URL}) {
  const [travelOpen, setTravelOpen] = useState(false);
  const [reverseTrip, setReverseTrip] = useState(false);

  const location = useLocation(null);
  const entryId = location.state?.id;
  const [entry, setEntry] = useState([]);

  const [endTime, setEndTime] = useState(location.state?.endTime);
  const [onSiteHours, setOnSiteHours] = useState(0);

  const fetchEntry = async () => {
    try {
      const response = await fetch(`${BASE_URL}/timesheet/${entryId}`);
      const data = await response.json();
      setEntry(data)
    } catch (error) {
      console.log('Error fetching entry: ', error.message)
    }
  }
  useEffect(()=>{
    fetchEntry();
  },[])

  let STArray = entry.startTime.split(/[: ]/); // Start Time Array
  let STHours = Number(STArray[0]);
  let STMins = Number(STArray[1]);
  if (STArray[2] === 'PM') STHours += 12;
  
  function calculate_hours() {
    let calculatedHours = 0;
    let tempArray = endTime.split(/[: ]/);
    let ETHours = Number(tempArray[0]);
    let ETMins = Number(tempArray[1]);
    if (tempArray[2] === 'PM' && tempArray[0] != 12) ETHours += 12;
    let elapsedHours = ETHours - STHours;
    let elapsedMins =  ETMins - STMins;
    if (elapsedMins < 0) {
      elapsedHours -= 1;
      if (ETMins === 0) {
        elapsedMins = 60 - STMins;
        calculatedHours = (elapsedHours + (elapsedMins/60)).toFixed(2);
      } else {
        elapsedMins = Math.abs(elapsedMins);
        calculatedHours = (elapsedHours + (1 - elapsedMins/60)).toFixed(2);
      }
    } else {
      calculatedHours = (elapsedHours + elapsedMins/60).toFixed(2);
    }
    setOnSiteHours(calculatedHours);
  }


  useEffect(()=>{
    calculate_hours();
  },[endTime])

  function handleClockOut() {
    alert('cant clock out yet lol')
  }

return (
  <div style={{color: 'black', padding: '1rem'}}>
    <h1>Clock Out</h1>
    <div className='clock-in-grid'>
      <label>Date:</label>
      <p>{entry.date}</p>
      
      <label>Job Name:</label>
      <p>{entry.job}</p>
      <label>Job Number:</label>
      <p>{entry.jobNumber}</p>
      <label>Start Time:</label>
      <p>{entry.startTime}</p>
      <label>End Time:</label>
      <TimeSelector header='End Time' pullTimeData={(timeString)=>setEndTime(timeString)}/>
      <label>On-Site:</label>
      <p>{entry.onSiteHours} hrs</p>
    </div> {/**Close clock out grid */}
    <h2 style={{marginTop: '10px'}}>Travel</h2>
    <div className='clock-in-grid'>
      <label>To Site:</label>
      <p>{entry.toSiteStart + ' to ' + entry.toSiteEnd}</p>
      {reverseTrip === true && (
        <>
        <label>From Site:</label>
        <p>{entry.toSiteStart + ' to ' + entry.toSiteEnd}</p>
        </>
      )}
      <label>Mileage:</label>
      <p>{reverseTrip===true?entry.milesToSite*2:entry.milesToSite} mi</p>
      <label>Travel Time:</label>
      <p>{reverseTrip===true?entry.timeToSite*2:entry.timeToSite} hrs</p>
    </div>
    <div>
      <span className='flex'>
      <label>Include Return Travel?</label>
        <input type='radio' onChange={()=>{setTravelOpen(false), setReverseTrip(true)}}
          style={{marginLeft:'10px'}} name='travel-radio'
        />Reverse
        <input type='radio' onChange={()=>{setTravelOpen(true), setReverseTrip(false)}}
          style={{marginLeft:'10px'}} name='travel-radio'
        />New Trip
        <input type='radio' onChange={()=>{setTravelOpen(false), setReverseTrip(false)}}
          style={{marginLeft:'10px'}} name='travel-radio'
        />No
      </span>
      <Travel isOpen={travelOpen} travelData={(array)=>{
        array[0]
      }}/>
      
    </div>
    <button className='big-btn' 
      style={{background: 'green', justifySelf: 'center', marginTop: '10px'}} 
      onClick={handleClockOut}
      ><strong>Clock Out</strong>
    </button>
    
  </div>
)
}

export default ClockOut;