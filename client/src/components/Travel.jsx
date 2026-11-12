import { useState, useEffect } from 'react';
import '../css/App.css'

function Travel({isOpen, travelData}) {
  if(!isOpen) return null;
  const [fromLoc, setFromLoc] = useState('');
  const [toLoc, setToLoc] = useState('');
  const [mileage, setMileage] = useState('');
  const [travelTime, setTravelTime] = useState('');
  const [travelType, setTravelType] = useState('');

  useEffect(()=> {
    travelData([fromLoc, toLoc, mileage, travelTime, travelType])
  }, [fromLoc, toLoc, mileage, travelTime, travelType]);

  return(
    <div className='main' style={{padding: '0'}}>
      <form className='clock-in-grid'>
        <label>Travel Type:</label>
        <span>
          <input type='radio' onChange={()=>setTravelType('Personal')} name='travel-type'/>
          Personal
          <input type='radio' onChange={()=>setTravelType('Company')} name='travel-type'/>
          Company
        </span>
        <label >From:</label>
        <input type='text' name='start-loc' id='start-loc' placeholder='Starting Location' 
          onChange={(e)=>setFromLoc(e.target.value)} />
        <label>To:</label>
        <input type='text' name='end-loc' id='end-loc' placeholder='Ending Location'
          onChange={(e)=>setToLoc(e.target.value)}/>
        <label>Mileage:</label>
        <input type='number' name='mileage' id='mileage' placeholder='Miles' 
          onChange={(e)=>setMileage(e.target.value)}/>
        <label>Time:</label>
        <input type='number' name='trav-time' id='trav-time' placeholder='Travel Time in hours' 
          onChange={(e)=>setTravelTime(e.target.value)}/>
      </form>
    </div>
  )
}

export default Travel;