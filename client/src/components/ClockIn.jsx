import { useState, useEffect } from 'react';
import DateSelector from "./DateSelector";
import TimeSelector from "./TimeSelector";
import Travel from './Travel';
import '../css/App.css';

function ClockIn({BASE_URL}) {
  const [timesheetDb, setTimesheetDb] = useState([]);
  const [travelDb, setTravelDb] = useState([]);

  // Timesheet DB
  const [jobName, setJobName] = useState('');
  const [jobNumber, setJobNumber] = useState('');
  const [reportNumber, setReportNumber] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [entryHours, setEntryHours] = useState(0);
  const [service, setService] = useState('');
  const [sets, setSets] = useState('');

  // Travel DB
  const [travelType, setTravelType] = useState('');
  const [toSiteStart, setToSiteStart] = useState('');
  const [toSiteEnd, setToSiteEnd] = useState('');
  const [fromSiteStart, setFromSiteStart] = useState('');
  const [fromSiteEnd, setFromSiteEnd] = useState('');
  const [milesToSite, setMilesToSite] = useState('');
  const [milesFromSite, setMilesFromSite] = useState('');
  const [totalMiles, setTotalMiles] = useState('');
  const [timeToSite, setTimeToSite] = useState(0);
  const [timeFromSite, setTimeFromSite] = useState(0);
  const [totalTravelTime, setTotalTravelTime] = useState('');
  
  const [travelOpen, setTravelOpen] = useState(false); 

  useEffect(()=>{
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/timesheet`);
      const data = await response.json();
      setTimesheetDb(data);
    } catch (error) {
      console.error('Error fetching timesheet:', error);
    }

    try {
      const response = await fetch(`${BASE_URL}/travel`);
      const data = await response.json();
      setTravelDb(data);
    } catch (error) {
      console.error('Error fetching travel:', error);
    }
  }

  const handleSubmit = async(e)=> {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/timesheet`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
          jobName, jobNumber, reportNumber, date, 
          startTime, endTime, entryHours, service,
          sets, cylinders
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add new entry');
      }
      setTimesheetDb([...timesheetDb, data]);
    } catch (error) {
      console.error(error.message);
    }

    try {
      const response = await fetch(`${BASE_URL}/travel`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
          travelType, toSiteStart, toSiteEnd, fromSiteStart, fromSiteEnd,
          milesToSite, milesFromSite, totalMiles, timeToSite,
          timeFromSite, totalTravelTime
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add new entry');
      }
      setTravelDb([...travelDb, data]);
    } catch (error) {
      console.error(error.message);
    }
  }

  // Maybe clear all fields

  return (
    <div style={{color: 'black', padding: '1rem'}}>
      <h1>Clock In</h1>

      <div className='clock-in-grid'>
      <label>Date:</label>
      <DateSelector pullDateString={(dateString)=>setDate(dateString)}/>
      <label>Time:</label>

      <TimeSelector header='Start Time' pullTimeData={(timeString)=>setStartTime(timeString)} />

      <span style={{display: 'inline-block'}}><label>Job Name:</label></span>
      <input type="text"
        onChange={(e)=>setJobName(e.target.value)}
        ></input>
      <label>Job #:</label><input type='text' onChange={(e)=>setJobNumber(e.target.value)}/>
      <label>Report #:</label><input type='text' onChange={(e)=>setReportNumber(e.target.value)} />
      <span style={{display: 'inline-block'}}><label>Service:</label></span>

      <select name="service-performed"
        value={service}
        onChange={(option)=>setService(option.target.value)}>
        <option style={{color: 'rgba(0,0,0,0.5)'}}>Select Service</option>
        <option value={'Concrete Testing'}>Concrete Testing</option>
        <option value={'Rebar Inspection'}>Rebar Inspection</option>
        <option value={'Soils Testing'}>Soils Testing</option>
        <option value={'Asphalt Testing'}>Asphalt Testing</option>
      </select>

      <label>Include Travel?</label>
      <span style={{justifySelf: 'start'}}>
          <input type='radio' onChange={()=>setTravelOpen(true)}
            style={{marginLeft: '5px'}} name='travel-radio'
          />Yes
          <input type='radio' onChange={()=>setTravelOpen(false)}
            style={{marginLeft: '35px'}} name='travel-radio'
          />No
        </span>
      </div>
      
      <div className='main'>
        <Travel isOpen={travelOpen} travelData={(array)=>{
          setToSiteStart(array[0]), setToSiteEnd(array[1]),
          setMilesToSite(array[2]), setTimeToSite(array[3]),
          setTravelType(array[4])
        }} />
      </div>

      <button type='button'
        onClick={handleSubmit}
        >Submit</button>
    </div>
  )
}

export default ClockIn;