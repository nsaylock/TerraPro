import {useState, useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import TimeSelector from "./TimeSelector";
import Travel from './Travel';

// Need to disable clock out button if not all fields are filled
// Will need to be able to handle over night jobs

function ClockOut({BASE_URL}) {
  const [travelOpen, setTravelOpen] = useState(false);
  const [reverseTrip, setReverseTrip] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const location = useLocation(null);
  const entryId = location.state?.id;
  const [entry, setEntry] = useState([]);
  const startTime = location.state?.startTime;

  const [travelType, setTravelType] = useState('');
  const [milesFromSite, setMilesFromSite] = useState(0);
  const [timeFromSite, setTimeFromSite] = useState(0);
  const [fromSiteStart, setFromSiteStart] = useState('');
  const [fromSiteEnd, setFromSiteEnd] = useState('');
  const [endTime, setEndTime] = useState(location.state?.endTime);
  const [onSiteHours, setOnSiteHours] = useState(0);
  const [totalMiles, setTotalMiles] = useState(0);
  const [totalTravelTime, setTotalTravelTime] = useState(0);

  const STArray = startTime.split(/[: ]/); // Start Time Array
  const STHours = Number(STArray[0]);
  const STMins = Number(STArray[1]);
  if (STArray[2] === 'PM') STHours += 12;

  useEffect(()=>{
    fetchEntry();
  },[])

  const fetchEntry = async () => {
    try {
      const response = await fetch(`${BASE_URL}/timesheet/${entryId}`);
      const data = await response.json();
      setEntry(data);
    } catch (error) {
      console.log('Error fetching entry: ', error.message)
    }
  }

  useEffect(()=>{
    setDataLoaded(true);
    setTotalMiles(entry.milesToSite);
    setTotalTravelTime(entry.timeToSite);
    
  },[entry])
  
  useEffect(()=>{
    if (endTime) calculate_hours();
  },[endTime])

  function calculate_hours() {
    let calculatedHours = 0;
    let tempArray = endTime.split(/[: ]/);
    let ETHours = Number(tempArray[0]);
    let ETMins = Number(tempArray[1]);
    if (tempArray[2] === 'PM' && tempArray[0] != 12) ETHours += 12;
    let elapsedHours = ETHours - STHours;
    let elapsedMins =  ETMins - STMins;
    console.log('STMins ' + STMins)
    console.log('ETMins ' + ETMins);

    if (elapsedMins < 0) {
      elapsedHours -= 1;
      if (ETMins === 0) {
        elapsedMins = 60 - STMins;
        calculatedHours = (elapsedHours + (elapsedMins/60)).toFixed(2);
        console.log('if1: ' + calculatedHours)
      } else {
        elapsedMins = Math.abs(elapsedMins);
        calculatedHours = (elapsedHours + (1 - elapsedMins/60)).toFixed(2);
        console.log('if2: ' + calculatedHours)
      }
    } else {
      calculatedHours = (elapsedHours + elapsedMins/60).toFixed(2);
      console.log('if3: ' + calculatedHours)
    }
    setOnSiteHours(calculatedHours);
  }

  function reverse_trip() {
    setReverseTrip(true);
    setMilesFromSite(Number(entry.milesToSite));
    setTimeFromSite(Number(entry.timeToSite));
    setFromSiteStart(Number(entry.toSiteStart));
    setFromSiteEnd(Number(entry.fromSiteEnd));
    setTotalMiles(Number(entry.milesToSite)*2);
    setTotalTravelTime(entry.timeToSite*2);
  }

  function reset_trip_values() {
    setReverseTrip(false)
    setMilesFromSite(0);
    setTimeFromSite(0);
    setFromSiteStart(0);
    setFromSiteEnd(0);
    setTotalMiles(entry.milesToSite);
    setTotalTravelTime(entry.timeToSite);
  }

  useEffect(()=>{
    setTotalMiles(Number(entry.milesToSite) + Number(milesFromSite))
  },[milesFromSite])

  useEffect(()=>{
    setTotalTravelTime(Number(entry.timeToSite) + Number(timeFromSite))
  }, [timeFromSite])

  const handle_clock_out = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/timesheet/${entryId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
          endTime, onSiteHours,
          travelType, toSiteEnd, fromSiteStart, 
          fromSiteEnd, milesFromSite, totalMiles,
          timeFromSite, totalTravelTime
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add new entry 0546');
      }
      setTimesheet([...timesheet, data]);
    } catch (error) {
      console.error(error.message);
    }
  }

return (
  <div style={{color: 'black', padding: '1rem'}}>
    <h1>Clock Out</h1>
    <div className='clock-in-grid'>
      <label>Date:</label>
      <p>{entry.date}</p>
      
      <label>Job Name:</label>
      <p>{entry.jobName}</p>
      <label>Job Number:</label>
      <p>{entry.jobNumber}</p>
      <label>Start Time:</label>
      <p>{entry.startTime}</p>
      <label>End Time:</label>
      <TimeSelector header='End Time' pullTimeData={(timeString)=>setEndTime(timeString)}/>
      <label>On-Site:</label>
      <p>{onSiteHours} hrs</p>
    </div> {/**Close clock out grid */}
    <h2 style={{marginTop: '10px'}}>Travel</h2>
    <div className='clock-in-grid'>
      <label>To Site:</label>
      <p>{entry.toSiteStart + ' to ' + entry.toSiteEnd}</p>
      <label>Miles:</label>
      <p>{entry.milesToSite} mi | Hours: {entry.timeToSite} {
        entry.timeToSite === 1?'hr':'hrs'
      }</p>
      {reverseTrip === true && (
        <>
        <label>From Site:</label>
        <p>{entry.toSiteStart + ' to ' + entry.toSiteEnd}</p>
        </>
      )}
      <label>Total Miles:</label>
      <p>{totalMiles} mi</p>
      <label>Total Travel Time:</label>
      <p>{totalTravelTime} hrs</p>
    </div>
    <div>
      <span className='flex'>
      <label>Include Return Travel?</label>
        <input type='radio' onChange={()=>{
          setTravelOpen(false),
          reverse_trip()
        }}
          style={{marginLeft:'10px'}} name='travel-radio'
        />Reverse
        <input type='radio' onChange={()=>{setTravelOpen(true), reset_trip_values()}}
          style={{marginLeft:'10px'}} name='travel-radio'
        />New Trip
        <input type='radio' onChange={()=>{setTravelOpen(false), reset_trip_values()}}
          style={{marginLeft:'10px'}} name='travel-radio'
        />No
      </span>
      <Travel isOpen={travelOpen} travelData={(array)=>{
        setFromSiteStart(array[0]), setFromSiteEnd(array[1]),
        setMilesFromSite(array[2]), setTimeFromSite(array[3]),
        setTravelType(array[4])
      }}/>
      
    </div>
    <button className='big-btn' 
      style={{background: 'green', justifySelf: 'center', marginTop: '10px'}} 
      onClick={handle_clock_out}
      ><strong>Clock Out</strong>
    </button>
    
  </div>
)
}

export default ClockOut;