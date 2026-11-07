import { useState, useEffect } from 'react';
import DateSelector from "./DateSelector";
import TimeSelector from "./TimeSelector";
import Travel from './Travel';
import '../css/App.css';

function ClockIn({API_URL}) {
  const [entries, setEntries] = useState([]);
  const [jobName, setJobName] = useState('');
  const [jobNumber, setJobNumber] = useState('');
  const [reportNumber, setReportNumber] = useState('');
  const [dateEntry, setDateEntry] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [entryHours, setEntryHours] = useState(0);
  const [service, setService] = useState('');
  const [travelType, setTravelType] = useState('');
  const [fromLoc, setFromLoc] = useState('');
  const [toLoc, setToLoc] = useState('');
  const [mileage, setMileage] = useState('');
  const [travelTime, setTravelTime] = useState('');
  
  const [travelOpen, setTravelOpen] = useState(false); 

  useEffect(()=>{
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const handleSubmit = async(e)=> {
    e.preventDefault();
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ jobName, jobNumber, reportNumber, dateEntry, startTime, endTime, entryHours, service, travelType, fromLoc, toLoc, mileage, travelTime })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add new entry');
      }
      setEntries([...entries, data]);
    } catch (error) {
      console.error(error.message);
    }
  }

  function clear_all_fields() {
    setJobName('');
    setDateEntry('');
    setStartTime('');
    setEndTime('');
    setService('');

  }

  return (
    <div style={{color: 'black', padding: '1rem'}}>
      <h1>Clock In</h1>

      <div className='clock-in-grid'>
      <label>Date:</label>
      <DateSelector pullDateString={(dateString)=>setDateEntry(dateString)}/>
      <label>Time:</label>

      <TimeSelector pullTimeData={(timeString)=>setStartTime(timeString)} />

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
          setFromLoc(array[0]), setToLoc(array[1]),
          setMileage(array[2]), setTravelTime(array[3]),
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