import {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import JobCard from '../components/JobCard.jsx';


function TimeDB({BASE_URL}) {
  const [timesheet, setTimesheet] = useState([]);
  const [travelDetailsOpen, setTravelDetailsOpen] = useState(false);
  const [seek, setSeek] = useState(0);
  let dataLoaded = false;

  const [sundayData, setSundayData] = useState([]);
  const [mondayData, setMondayData] = useState([]);
  const [tuesdayData, setTuesdayData] = useState([]);
  const [wednesdayData, setWednesdayData] = useState([]);
  const [thursdayData, setThursdayData] = useState([]);
  const [fridayData, setFridayData] = useState([]);
  const [saturdayData, setSaturdayData] = useState([]);

  let sun;
  let mon;
  let tue;
  let wed;
  let thur;
  let fri;
  let sat;
  let period = getPeriod();

  function getPeriod() {
    const sunday = new Date();
    const offset = seek * 7;
    sunday.setDate(sunday.getDate() - sunday.getDay() + offset);
    const start = formatDate(sunday);

    const saturday = new Date();
    saturday.setDate(sunday.getDate() + 6);
    const end = formatDate(saturday);

    let temp = new Date();
    sun = start;
    temp.setDate(sunday.getDate()+1);
    mon = formatDate(temp);
    temp.setDate(sunday.getDate()+2);
    tue = formatDate(temp);
    temp.setDate(sunday.getDate()+3);
    wed = formatDate(temp);
    temp.setDate(sunday.getDate()+4);
    thur = formatDate(temp);
    temp.setDate(sunday.getDate()+5);
    fri = formatDate(temp);
    temp.setDate(sunday.getDate()+1);
    sat = end;
    return {start: start, end: end};
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  }

  useEffect(()=>{
    if (!dataLoaded) {
    const controller = new AbortController();
    period = getPeriod();
    fetchPeriodData();
    return () => controller.abort();
    }
  }, [seek]);

  const fetchPeriodData = async () => {
    dataLoaded = true;

    const url = new URL(`${BASE_URL}/timesheet/period`);
    url.searchParams.append('periodStart', period.start);
    url.searchParams.append('periodEnd', period.end);
    try {
      const response = await fetch(url);
      const data = await response.json();
      setTimesheet(data);
      for (const entry of data) {
        console.log(entry.date)
        if (entry.date === sun) {
          setSundayData((sundayData)=>[...sundayData, entry]);
        } else if (entry.date === mon) {
          setMondayData((mondayData)=>[...mondayData, entry]);
        } else if (entry.date === tue) {
          setTuesdayData((tuesdayData)=>[...tuesdayData, entry]);
        } else if (entry.date === wed) {
          setWednesdayData((wednesdayData)=>[...wednesdayData, entry]);
        } else if (entry.date === thur) {
          setThursdayData((thursdayData)=>[...thursdayData, entry]);
        } else if (entry.date === fri) {
          setFridayData((fridayData)=>[...fridayData, entry]);
        } else if (entry.date === sat) {
          setSaturdayData((saturdayData)=>[...saturdayData, entry]);
        }
      }
    } catch (error) {
      console.log('Error fetching timesheet:', error.message);
      dataLoaded = false;
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

  function clearDateObjects() {
    setSundayData([]);
    setMondayData([]);
    setTuesdayData([]);
    setWednesdayData([]);
    setThursdayData([]);
    setFridayData([]);
    setSaturdayData([]);
  }

  return (
    
    <div className='main'>
      <nav className='timesheet-seek'>
        <button onClick={()=>{dataLoaded = false, setSeek(seek - 1)}}>Previous</button>
        <button onClick={()=>{dataLoaded = false, setSeek(0)}}>Current</button>
        <button onClick={()=>{dataLoaded = false, setSeek(seek + 1)}}>Next</button>
      </nav>
      <p>{getUIDate(period.start)} - {getUIDate(period.end)}</p>

      
      <JobCard data={thursdayData} />
    </div>
  )
}
export default TimeDB;