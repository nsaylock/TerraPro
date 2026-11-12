import {useState, useRef, useEffect} from 'react';
import '../css/App.css';
function MixCalculator() {
  const [batchSize, setBatchSize] = useState(null);
  const [stone, setStone] = useState(null);
  const [sand, setSand] = useState(null);
  const [cement, setCement] = useState(null);
  const [slag, setSlag] = useState(null);
  const [AEA, setAEA] = useState(null);
  const [z60, setZ60] = useState(null);
  const [glen7620, setGlen7620] = useState(null);
  const [xseed66, setXseed66] = useState(null);
  const [water, setWater] = useState(null);
  const [unitWeight, setUnitWeight] = useState(0);
  const [concreteWeight, setConcreteWeight] = useState(0);

  const [totalWeight, setTotalWeight] = useState(0);
  const [wcRatio, setWCRatio] = useState(0);
  const [yield1, setYield1] = useState(0);
  const [maxWater, setMaxWater] = useState(0);


  const [minWC, setMinWC] = useState(0.35);
  const [maxWC, setMaxWC] = useState(0.55);
  const [hrwrMix, setHrwrMix] = useState(false);

  let totalOz;
  let totalGal;
  let liquidWeight;

  useEffect(()=> {
    // oz conversion
    
  },[]);

  useEffect(()=>{

    totalOz = AEA + z60 + glen7620 + xseed66;
    totalGal = Math.ceil(totalOz/128 + water);
    liquidWeight = Math.ceil(totalGal * 8.34);
    let temp = liquidWeight + stone + sand + cement + slag;
    setTotalWeight(temp);
    setWCRatio((liquidWeight/(cement+slag)).toFixed(2));
    setUnitWeight((concreteWeight - 8.2)*4);
    setYield1(parseFloat(temp/unitWeight/27).toFixed(2));
    let temp2 = (0.45 * (cement+slag) / 8.34) - (liquidWeight / 8.34);
    setMaxWater(temp2);

  }, [batchSize, stone, sand, cement, slag, AEA, z60, glen7620, xseed66, water, concreteWeight])

  useEffect(()=>{
    if (hrwrMix == true) {
      setMinWC(0.25);
      setMaxWC(0.45);
    } else {
      setMaxWC(0.55);
      setMinWC(0.35);
    }
    console.log(minWC)
  }, [hrwrMix]);

  const redGreen = {
    background: wcRatio > minWC && wcRatio < maxWC ? 'lightgreen' : 'red',
    marginLeft: '5px'
  }


  return (
    <div className='flex-ctr col pad'>
      <h2>Mix Calculator</h2>
      <div className='mix-grid'>
        <label>Batch Size:</label>
        <input type='number' onChange={(e)=>setBatchSize(parseInt(e.target.value, 10))}/>
        <label>cubic yd</label>
        <label>57 Stone:</label>
        <input type='number' onChange={(e)=>setStone(parseInt(e.target.value, 10))}/>
        <label>lbs</label>
        <label>Sand:</label>
        <input type='number' onChange={(e)=>setSand(parseInt(e.target.value, 10))}/>
        <label>lbs</label>
        <label>Cement:</label>
        <input type='number' onChange={(e)=>setCement(parseInt(e.target.value, 10))}/>
        <label>lbs</label>
        <label>Slag:</label>
        <input type='number' onChange={(e)=>setSlag(parseInt(e.target.value, 10))}/>
        <label>lbs</label>
        <label>AEA:</label>
        <input type='number' onChange={(e)=>setAEA(parseInt(e.target.value, 10))}/>
        <label>oz</label>
        <label>Z-60:</label>
        <input type='number' onChange={(e)=>setZ60(parseInt(e.target.value, 10))}/>
        <label>oz</label>
        <label>GLEN-7620:</label>
        <input type='number' onChange={(e)=>setGlen7620(parseInt(e.target.value, 10))}/>
        <label>oz</label>
        <label>XSEED-66:</label>
        <input type='number' onChange={(e)=>setXseed66(parseInt(e.target.value, 10))}/>
        <label>oz</label>
        <label>Water:</label>
        <input type='number' onChange={(e)=>setWater(parseInt(e.target.value, 10))}/>
        <label>gal</label>
        <label>HRWR Mix?</label> 
        <span style={{justifySelf: 'start'}}><input type='radio' onChange={()=>setHrwrMix(true)} name='hrwr' value='yes'/>Yes
        <input type='radio' onChange={()=>setHrwrMix(false)} name='hrwr' value='no'
          style={{marginLeft: '1rem'}}/>No</span>
        <span></span>
        <span></span><span></span><br/>
        <label>Concrete Weight:</label>
        <input type='number' placeholder='Concrete + Bowl'
        onChange={(e)=>setConcreteWeight(e.target.value)} />
        <label>lbs</label>
        
      </div> {/* Close mix-grid */}
      
      <span className='divide-line'></span>
      <div>Unit Weight: <span className='result'>{unitWeight}</span> lbs/cuft</div>
      <div>Total Weight: <span className='result'> {totalWeight.toLocaleString('en-US')}</span> lbs</div>
      <div>W/C Ratio: 
        <span className='result'
          style={redGreen}
        >{wcRatio}</span></div>
      <div>Yield: <span className='result'>{yield1}</span> cu yds</div>
      <div>Max Added Water: <span className='result'>{maxWater.toFixed(0)}</span> gal</div>
    </div>
  )
}

export default MixCalculator;