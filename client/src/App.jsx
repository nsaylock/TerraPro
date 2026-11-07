import React from 'react';
import ClockIn from './components/ClockIn';
import TimeDB from './components/TimeDB';
import MixCalculator from './components/MixCalculator';
import { Link, Routes, Route } from 'react-router-dom';
import './css/App.css'
import ClockOut from './components/ClockOut';

const JOBS_API_URL = 'http://localhost:3000/api/jobs';

function App() {
  function check_width() {
    console.log(window.innerWidth);
  }

  return(
    <div className='app-main'>
      <button type='button' className='check-width' onClick={()=>check_width()}>
        Check Width
      </button>
      <Link to='/timeDB'><button>Time DB</button></Link>
      <Link to='/'><button>Clock In</button></Link>
      <Link to='/mix-calculator'><button>Mix Calculator</button></Link>
      <Routes>
        <Route path='/' element={<ClockIn API_URL={JOBS_API_URL} />}/>
        <Route path='/timeDB' element={<TimeDB API_URL={JOBS_API_URL}/>}/>
        <Route path='/mix-calculator' element={<MixCalculator />}/>
        <Route path='/clock-out' element={<ClockOut API_URL={JOBS_API_URL}/>}/>
      </Routes>
    </div>
  )
}

export default App;