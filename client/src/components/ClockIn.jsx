import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DateSelector from './DateSelector';
import TimeSelector from './TimeSelector';
import Travel from './Travel';
import '../css/App.css';

const NO_TRAVEL = {
  travelType: '',
  toSiteStart: '',
  toSiteEnd: '',
  fromSiteStart: '',
  fromSiteEnd: '',
  // Number fields are strings while the user types; converted on submit
  milesToSite: '',
  milesFromSite: '',
  timeToSite: '',
  timeFromSite: '',
};

const INITIAL_FORM = {
  projectName: '',
  projectNumber: '',
  reportNumber: '',
  date: '',
  startTime: 0,
  endTime: 0,
  onSiteHours: 0,
  service: '',
  ...NO_TRAVEL,
};

function ClockIn({ BASE_URL }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [travelOpen, setTravelOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Update one or more fields at once
  const update = useCallback((fields) => {
    setForm((prev) => ({ ...prev, ...fields }));
  }, []);

  // Text inputs: <input onChange={onField('projectName')} />
  const onField = (name) => (e) => update({ [name]: e.target.value });

  // Callbacks for the date and time pickers
  const handleDate = useCallback((dateString) => update({ date: dateString }), [update]);
  const handleStartTime = useCallback((military) => update({ startTime: military }), [update]);

  const handleTravelToggle = (open) => {
    setTravelOpen(open);
    // Choosing "No" discards any travel data that was already entered
    if (!open) update(NO_TRAVEL);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // The date and time pickers always report a value, so only the
    // fields the user can actually leave empty are checked here
    if (!form.service) {
      setError('Please choose a service.');
      return;
    }
    if (travelOpen && !form.travelType) {
      setError('Choose a travel type, or select No for travel.');
      return;
    }

    setSubmitting(true);
    setError(null);

    // Convert the typed strings to numbers; totals are derived, not stored
    const milesToSite = Number(form.milesToSite) || 0;
    const milesFromSite = Number(form.milesFromSite) || 0;
    const timeToSite = Number(form.timeToSite) || 0;
    const timeFromSite = Number(form.timeFromSite) || 0;

    const payload = {
      ...form,
      milesToSite,
      milesFromSite,
      timeToSite,
      timeFromSite,
      totalMiles: milesToSite + milesFromSite,
      totalTravelTime: timeToSite + timeFromSite,
    };

    try {
      const response = await fetch(`${BASE_URL}/timesheet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add new entry 0546');
      }
      navigate('/timeDB'); // only leave the page if the save worked
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div style={{ color: 'black', padding: '1rem' }}>
      <h1>Clock In</h1>

      <div className='clock-in-grid'>
        <label>Date:</label>
        <DateSelector pullDateString={handleDate} allowEdit={true} />

        <label>Time:</label>
        <TimeSelector header='Arrival to Site' pullTimeInteger={handleStartTime} />

        <span style={{ display: 'inline-block' }}><label>Job Name:</label></span>
        <input type='text' value={form.projectName} onChange={onField('projectName')} />

        <label>Project #:</label>
        <input type='text' value={form.projectNumber} onChange={onField('projectNumber')} />

        <label>Report #:</label>
        <input type='text' value={form.reportNumber} onChange={onField('reportNumber')} />

        <span style={{ display: 'inline-block' }}><label>Service:</label></span>
        <select name='service-performed' value={form.service} onChange={onField('service')}>
          <option value='' style={{ color: 'rgba(0,0,0,0.5)' }}>Select Service</option>
          <option value='Concrete Testing'>Concrete Testing</option>
          <option value='Rebar Inspection'>Rebar Inspection</option>
          <option value='Soils Testing'>Soils Testing</option>
          <option value='Asphalt Testing'>Asphalt Testing</option>
        </select>

        <label>Include Travel?</label>
        <span style={{ justifySelf: 'start' }}>
          <input
            type='radio'
            name='travel-radio'
            checked={travelOpen}
            onChange={() => handleTravelToggle(true)}
            style={{ marginLeft: '5px' }}
          />Yes
          <input
            type='radio'
            name='travel-radio'
            checked={!travelOpen}
            onChange={() => handleTravelToggle(false)}
            style={{ marginLeft: '35px' }}
          />No
        </span>
      </div>

      <div className='main'>
        <Travel isOpen={travelOpen} values={form} onChange={update} />
      </div>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <button type='button' onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Saving...' : 'Submit'}
      </button>
    </div>
  );
}

export default ClockIn;
