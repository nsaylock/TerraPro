import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import '../css/TimeSelector.css';

function TimeSelector({header, pullTimeData}) {
  const [timeOfDay, setTimeOfDay] = useState('');
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  let [currentMinute, setCurrentMinute] = useState(new Date().getMinutes());
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(()=>{
    check_timeOfDay();
  },[]);

  useEffect(() => {
    currentMinute.toString().length === 1 ? (
      pullTimeData(currentHour + ':0' + currentMinute + ' ' + timeOfDay)
    ):(
      pullTimeData(currentHour + ':' + currentMinute + ' ' + timeOfDay)
    )
  }, [currentHour, currentMinute, timeOfDay]);

  function check_timeOfDay() {
    if (currentHour > 12) {
      setTimeOfDay('PM')
      setCurrentHour(currentHour - 12);
    } else if (currentHour === 12) {
      setTimeOfDay('PM');
    } else {
      setTimeOfDay('AM');
    }
  }

  const increase_hour = () => {
    setCurrentHour(currentHour + 1)
    if (currentHour >= 12) {
      setCurrentHour(1)
    }
  }

  const decrease_hour = () => {
    setCurrentHour(currentHour - 1)
    if (currentHour <= 1)
      setCurrentHour(12);
  }

  const increase_minute = () => {
    do {
      currentMinute += 1;
    } while (currentMinute % 15 != 0);
    setCurrentMinute(currentMinute);
    if (currentMinute >= 59) {
      setCurrentMinute(0);
    }
  }

  const decrease_minute = () => {
    do {
      currentMinute -= 1;
    } while (currentMinute % 15 != 0);
    setCurrentMinute(currentMinute);
    if (currentMinute < 0) {
      setCurrentMinute(45);
    }
  }

  function setTimeNow() {
    let hourNow = new Date().getHours();
    if (hourNow <= 12) {
      setCurrentHour(hourNow);
      setTimeOfDay('AM')
    } else {
      setCurrentHour(hourNow - 12);
      setTimeOfDay('PM');
    }
    setCurrentMinute(new Date().getMinutes());
  }

  function handleTransition(id) {
    if (id == 'PM') {
      // transition to PM
      setTimeOfDay('PM');
    } else if (id == 'AM') {
      setTimeOfDay('AM');
    }
  }


  return (
  <div>
    <div className='flex white-box'>
      {currentHour} : {String(currentMinute).padStart(2, '0')} {timeOfDay}
      <button onClick={()=>setModalOpen(true)} className='edit-btn'>Edit</button>
      <button type='button' onClick={()=>setTimeNow()} className='edit-btn'>Now</button>
    </div>
    <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)}>
      <h2 style={{color: 'black'}}>{header}</h2>
      <div className='time-edit-grid'>
      <button
        className='invis-btn'
        type='button'
        onClick={increase_hour}
        ><div className='up-arrow'></div></button>
      <h1></h1>
      <button 
        className='invis-btn'
        type='button'
        onClick={increase_minute}
        ><div className='up-arrow'></div>
        </button>
        {timeOfDay=='PM'?(
          <button className='invis-btn' type='button' onClick={()=>handleTransition('AM')}>AM</button>
        ):(<h1></h1>)}
      

      <div className='time-box'>
        <h2>{currentHour}</h2>
      </div>
      <h2>:</h2> 

      <div className='time-box'>
        <h2>{String(currentMinute).padStart(2, '0')}</h2>
      </div>
      <div className='time-box'><h2>{timeOfDay}</h2></div>

      <button className='invis-btn'
        type='button'
        onClick={decrease_hour}
        ><div className='down-arrow'></div></button>
      <h1></h1>
      <button className='invis-btn'
        type='button'
        onClick={decrease_minute}
        ><div className='down-arrow'></div></button>
      {timeOfDay=='AM' ? (
      <button className='invis-btn' type='button'
        onClick={()=>handleTransition('PM')}
        >PM</button> ):(
          <h1></h1>
        )}
      </div> {/*Close time-edit-grid*/}
      <button type='button' onClick={()=>setModalOpen(false)}>OK</button>
    </Modal>
    </div>
  )
}
 export default TimeSelector