import {useState, useEffect} from 'react';

function Samples({BASE_URL}) {
  const [samplesTable, setSamplesTable] = useState([]);


  const fetchSamplesTable = async (e) => {
    try {
      const response = await fetch(`${BASE_URL}/samples`);
      const data = await response.json();
      console.log(data.castDate)
      setSamplesTable(data);
      
    } catch (error) {
      console.error('Error fetching samples table (Samples.jsx): ', error.message);
    }
  }

  useEffect(()=>{
    fetchSamplesTable();
  },[])


  function handlePickUp() {
    alert('Can\'t do pick up yet lol');
  }

  return (
    <div className='samples-container'>
      {samplesTable.map((set)=>(
      <div className='samples-card'>
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
        <button style={{
          margin: '6px 30px',
          padding: '5px',
          width: '30%',
          background: 'green',
          alignSelf: 'center',
          fontSize: '16px'
          }}
          onClick={handlePickUp}
          
          >Pick Up</button>
      </div>
      ))}
    </div>
  )
}

export default Samples;