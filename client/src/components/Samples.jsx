import {useState, useEffect} from 'react';
import Modal from './Modal';
import DateSelector from './DateSelector';
import TimeSelector from './TimeSelector';

function Samples({BASE_URL}) {
  const [samplesTable, setSamplesTable] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [pickUpDate, setPickUpDate] = useState('');
  const [pickUpTime, setPickUpTime] = useState('');
  const [pickUpEmployee, setPickUpEmployee] = useState('');
  const [dropOffLocation, setDropOffLocation] = useState('');

  const [targetId, setTargetId] = useState(null);
  const [pickedUp, setPickedUp] = useState(false);


  const fetchSamplesTable = async (e) => {
    try {
      const response = await fetch(`${BASE_URL}/samples`);
      const data = await response.json();
      setSamplesTable(data);
      
    } catch (error) {
      console.error('Error fetching samples table (Samples.jsx): ', error.message);
    }
  }

  useEffect(()=>{
    fetchSamplesTable();
  },[])


  async function handlePickUp(targetId) {
    try {
      const response = await fetch(`${BASE_URL}/samples/${targetId}`,{
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          pickUpDate, pickUpTime, pickUpEmployee, dropOffLocation
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add pick up to data table');
      }

    } catch (error) {
      console.error('Failed to put new pick up: ', error.message)
    }
  }


  if (!samplesTable) return (<h3>Loading...</h3>)

  return (
    <div className='samples-container'>
      <button onClick={()=>setPickedUp(true)}>Picked Up</button>
      <button onClick={()=>setPickedUp(false)}>Not Picked Up</button>
      {samplesTable.map(set => {
      if ((set.pickUpDate !== null) == pickedUp) return (
      <div className='samples-card' key={set.id}>
        <div  className='samples-list'>
          <div className='samples-list-grid'>
            <div className='samples-list-info'>
              <h5>Cast Date</h5><p style={{fontSize: '14px'}}>{set.castDate}</p>
              <h5>Type</h5><p style={{fontSize: '14px'}}>{set.sampleType}</p>
              <h5>Sets</h5><p style={{fontSize: '14px'}}>{set.sets}</p>
              <h5>Set Size</h5><p style={{fontSize: '14px'}}>{set.setSize}</p>
            </div>
            <div className='samples-list-info'>
              <h5>Project</h5><p style={{fontSize: '14px'}}>{set.projectName}</p>
              <h5>Project #</h5><p style={{fontSize: '14px'}}>{set.projectNumber}</p>
              <h5>Report #</h5><p style={{fontSize: '14px'}}>{set.reportNumber}</p>
              <h5>Employee</h5><p style={{fontSize: '14px'}}>{set.employee}</p>
            </div>
        </div>
        </div>
        <div className='samples-location'>
          <h5 style={{
            borderStyle: 'solid',
            borderColor: 'black',
            borderWidth: '0 1px 1px 0'
          }}>Location</h5><p style={{textAlign:'start', fontSize: '14px'}}>{set.storageLocation}</p>
        </div>
        <div className='samples-list-grid'>
        <div className='samples-list-info'>
          <h6>Pick Up Date</h6><p style={{fontSize: '14px'}}>{set.pickUpDate}</p>
        </div>
        <div className='samples-list-info'>
          <h6>Picked Up By</h6><p style={{fontSize:'14px'}}>{set.pickUpEmployee}</p>
        </div>
        </div>
        <div className='samples-location'>
          <h6>Drop Off</h6><p style={{fontSize:'14px'}}>{set.dropOffLocation}</p>
        </div>
        <button style={{
          margin: '6px 30px',
          padding: '5px',
          width: '30%',
          background: 'green',
          alignSelf: 'center',
          fontSize: '16px'
          }}
          onClick={()=>{setModalOpen(true), setTargetId(set.id)}}
          
          >Pick Up</button>
      </div>
      )})}
      <Modal isOpen={modalOpen} onClose={()=>handlePickUp(targetId)}>
        <div className='clock-in-grid'>
          <label>Pick Up Date:</label>
          <DateSelector pullDateString={(dateString)=>setPickUpDate(dateString)} 
            allowEdit={false}/>
          <label>Pick Up Time:</label>
          <TimeSelector pullTimeData={(timeString)=>setPickUpTime(timeString)} />
          <label>Pick Up Employee:</label>
          <input type='text' onChange={(e)=>setPickUpEmployee(e.target.value)} />
          <label>Drop Off Location:</label>
          <select onChange={(option)=>setDropOffLocation(option.target.value)}>
            <option>Select</option>
            <option value='J8 Laboratory'>J8 Laboratory</option>
          </select>
        </div>
        <button className='big-btn' onClick={()=>{setModalOpen(false), handlePickUp(targetId)}}
          style={{marginTop: '15px'}}
          >Pick Up</button>
      </Modal>
    </div>
  )
}

export default Samples;