import '../css/App.css';

// Controlled component: the parent owns the values, this just displays them
// and reports changes. Field names match the timesheet DB columns, so the
// "From" and "To" locations are stored as toSiteStart and toSiteEnd.
function Travel({ isOpen, values, onChange }) {
  if (!isOpen) return null;

  const field = (name) => (e) => onChange({ [name]: e.target.value });

  return (
    <div className='main' style={{ padding: '0' }}>
      <div className='clock-in-grid'>
        <label>Travel Type:</label>
        <span>
          <input
            type='radio'
            name='travel-type'
            checked={values.travelType === 'Personal'}
            onChange={() => onChange({ travelType: 'Personal' })}
          />
          Personal
          <input
            type='radio'
            name='travel-type'
            checked={values.travelType === 'Company'}
            onChange={() => onChange({ travelType: 'Company' })}
          />
          Company
        </span>

        <label htmlFor='start-loc'>From:</label>
        <input
          type='text'
          id='start-loc'
          placeholder='Starting Location'
          value={values.toSiteStart}
          onChange={field('toSiteStart')}
        />

        <label htmlFor='end-loc'>To:</label>
        <input
          type='text'
          id='end-loc'
          placeholder='Ending Location'
          value={values.toSiteEnd}
          onChange={field('toSiteEnd')}
        />

        <label htmlFor='mileage'>Mileage:</label>
        <input
          type='number'
          id='mileage'
          min='0'
          step='any'
          placeholder='Miles'
          value={values.milesToSite}
          onChange={field('milesToSite')}
        />

        <label htmlFor='trav-time'>Time:</label>
        <input
          type='number'
          id='trav-time'
          min='0'
          step='any'
          placeholder='Travel Time in hours'
          value={values.timeToSite}
          onChange={field('timeToSite')}
        />
      </div>
    </div>
  );
}

export default Travel;
