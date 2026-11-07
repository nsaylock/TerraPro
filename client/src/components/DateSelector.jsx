import { useState, useEffect, use } from 'react';
import Modal from './Modal';
import '../css/App.css';
import '../css/TimeSelector.css';

function DateSelector({pullDateString}) {
  const monthNow = new Date(Date.now()).getMonth() + 1;
  const dayNow = new Date(Date.now()).getDate();
  const yearNow = new Date(Date.now()).getFullYear()
  const [month, setMonth] = useState(monthNow);
  const [day, setDay] = useState(dayNow);
  const [year, setYear] = useState(yearNow);
  const [modalOpen, setModalOpen] = useState(false);
  let lastDayOfMonth;
  get_last_day_of_month();

  useEffect(()=> {
    day.toString().length == 1 ? (
    pullDateString(month + '/0' + day + '/' + year.toString().slice(2, 4))
    ) : (
      pullDateString(month + '/' + day + '/' + year.toString().slice(2,4))
    )
  }, [])

  function change_month(action) {
    if (action == 'increase') {
      setMonth(month + 1);
      if (month >= 12) setMonth(1);
    } else if (action == 'decrease') {
      setMonth(month - 1);
      if (month <= 1) setMonth(12);
    }
  }

  useEffect(()=>{
    get_last_day_of_month();
    if (day > lastDayOfMonth) setDay(lastDayOfMonth);
  }, [month])

  function get_last_day_of_month() {
    switch (month) {
      case 1:
      case 3:
      case 5:
      case 7:
      case 8:
      case 10:
      case 12:
        lastDayOfMonth = 31;
        break;
      case 4:
      case 6:
      case 9:
      case 11:
        lastDayOfMonth = 30;
        break;
      case 2:
        if (year % 4 === 0) lastDayOfMonth = 29;
        else lastDayOfMonth = 28;
        break;
  }}

  function change_day(action) {
    if (action == 'increase') {
      setDay(day + 1);
      if (day >= lastDayOfMonth) setDay(1);
    } else if (action == 'decrease') {
      setDay(day - 1);
      if (day <= 1) setDay(lastDayOfMonth);
    }
  }

  function change_year(action) {
    if (action == 'increase') {
      setYear(year + 1);
    } else if (action == 'decrease') setYear(year - 1);
  }

  function setDateToday() {
    setMonth(monthNow);
    setDay(dayNow);
    setYear(yearNow);
  }

  return (
    <>
    <div className='white-box'>
    {(month.toString().length==1?month.toString().padStart(2,'0'):month)
     + ' / ' + 
      (day.toString().length==1?day.toString().padStart(2, '0'):day)
     + ' / ' + year}
      <button className='edit-btn' onClick={()=>setModalOpen(true)}>Edit</button>
      <button className='edit-btn' onClick={()=>setDateToday()}>Today</button>
    </div>

    {/**Inside MODAL */}
    <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)}>
      <h2>Date</h2>
      <div className='date-edit-grid'>
        <button type='button' className='invis-btn'
          onClick={()=>change_month('increase')}
          ><div className='up-arrow'></div></button>
        <p></p>
        <button className='invis-btn'onClick={()=>change_day('increase')}><div className='up-arrow'></div></button>
        <p></p>
        <button className='invis-btn' onClick={()=>change_year('increase')}><div className='up-arrow'></div></button>
        <h2>{month.toString().length==1?month.toString().padStart(2,'0'):month}</h2>
        <h2>/</h2>
        <h2>{day.toString().length==1?day.toString().padStart(2,'0'):day}</h2>
        <h2>/</h2>
        <h2>{year}</h2>
        <button className='invis-btn'
          onClick={()=>change_month('decrease')}
          ><div className='down-arrow'></div></button>
        <p></p>
        <button className='invis-btn'
          onClick={()=>change_day('decrease')}
          ><div className='down-arrow'></div></button>
        <p></p>
        <button className='invis-btn' onClick={()=>change_year('decrease')}><div className='down-arrow'></div></button>
      </div>
    </Modal>
    
    </>
  )
}

export default DateSelector