import React from 'react';
import ClockIn from './components/ClockIn';
import Samples from './components/Samples.jsx';
import Timesheet from './components/Timesheet.jsx';
import MixCalculator from './components/MixCalculator';
import CreateJob from './components/CreateJob.jsx';
import { Link, Routes, Route } from 'react-router-dom';
import './css/App.css';
import './css/buttons.css';
import './css/tags.css';
import ClockOut from './components/ClockOut';

const BASE_URL = 'http://localhost:3000/api';

function App() {
  const employeeId = 276067;

  return(
    <div className='app-main'>
      
      <nav className='nav-link-btns'>
        <Link to='/'><button>Timesheet</button></Link>
        <Link to='/create-job'><button>Create Job</button></Link>
        <Link to='/samples'><button>Samples</button></Link>
        <Link to='/mix-calculator'><button>Mix Calculator</button></Link>
      </nav>
      <Routes>
        <Route path='/' element={<Timesheet BASE_URL={BASE_URL} employeeId={employeeId}/>}/>
        <Route path='/create-job' element={<CreateJob BASE_URL={BASE_URL} />}/>
        <Route path='/samples' element={<Samples BASE_URL={BASE_URL}/>}/>
        <Route path='/mix-calculator' element={<MixCalculator />}/>
        <Route path='/clock-out' element={<ClockOut BASE_URL={BASE_URL}/>}/>

      </Routes>
    </div>
  )
}

export default App;