import {useState, useEffect} from 'react';

function Samples({BASE_URL}) {
  const [samplesTable, setSamplesTable] = useState([]);


  const fetchSamplesTable = async (e) => {
    try {
      const response = await fetch(`${BASE_URL}/samples`);
      const data = await response.json();
      console.log(data)
      setSamplesTable(data);
      
    } catch (error) {
      console.error('Error fetching samples table (Samples.jsx): ', error.message);
    }
  }

  useEffect(()=>{
    fetchSamplesTable();
  },[])


  return (
    <div className='samples-list'>
      <div className='samples-list-row'>
        <h6 className='cell'>Project Name</h6>
        <h6 className='cell'>Project #</h6>
        <h6 className='cell'>Report #</h6>
        <h6 className='cell'>Cast Date</h6>
        <h6 className='cell'>Sample Type</h6>
        <h6 className='cell'>Sets</h6>
        <h6 className='cell'>Set Size</h6>
        <h6 className='cell'>Employee</h6>
        <h6 className='cell'>Storage Location</h6>
        <h6 className='cell'>Pick Up Date</h6>
        <h6 className='cell'>Drop Off Location</h6>
      </div>
      {samplesTable.map((row)=>(
        <div className='samples-list-row'>
          <p className='cell'>{row.projectName}</p>
          <p className='cell'>{row.projecNumber}</p>
          <p className='cell'>{row.reportNumber}</p>
          <p className='cell'>{row.castDate}</p>
          <p className='cell'>{row.sampleType}</p>
          <p className='cell'>{row.sets}</p>
          <p className='cell'>{row.setSize}</p>
          <p className='cell'>{row.employee}</p>
          <p className='cell'>{row.storageLocation}</p>
          <p className='cell'>{row.pickUpDate}</p>
          <p className='cell'>{row.dropOffLocation}</p>
        </div>
      ))}
    </div>
  )
}

export default Samples;