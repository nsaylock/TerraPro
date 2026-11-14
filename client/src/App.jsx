import React from 'react';
import ClockIn from './components/ClockIn';
import Samples from './components/Samples.jsx';
import TimeDB from './components/TimeDB';
import MixCalculator from './components/MixCalculator';
import { Link, Routes, Route } from 'react-router-dom';
import './css/App.css'
import ClockOut from './components/ClockOut';

const BASE_URL = 'http://localhost:3000/api';

function App() {
  function check_width() {
    console.log(window.innerWidth);
  }

  return(
    <div className='app-main'>
      <button type='button' className='check-width' onClick={()=>check_width()}>
        Check Width
      </button>
      <nav className='nav-link-btns'>
        <Link to='/timeDB'><button>Time DB</button></Link>
        <Link to='/'><button>Clock In</button></Link>
        <Link to='/samples'><button>Samples</button></Link>
        <Link to='/mix-calculator'><button>Mix Calculator</button></Link>
        </nav>
      <Routes>
        <Route path='/' element={<ClockIn BASE_URL={BASE_URL} />}/>
        <Route path='/timeDB' element={<TimeDB BASE_URL={BASE_URL}/>}/>
        <Route path='/samples' element={<Samples BASE_URL={BASE_URL}/>}/>
        <Route path='/mix-calculator' element={<MixCalculator />}/>
        <Route path='/clock-out' element={<ClockOut BASE_URL={BASE_URL}/>}/>

      </Routes>
    </div>
  )
}

export default App;