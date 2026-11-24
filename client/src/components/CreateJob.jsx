import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DateSelector from './DateSelector';
import TimeSelector from './TimeSelector';
import Travel from './Travel';
import '../css/ClockIn.css';

const INITIAL_FORM = {
  date: '',
  projectName: '',
  projectNumber: '',
  reportNumber: '',
  role: '',
  task: '',
  location: '',
  description: '',
  assignedEmployee: 0,
  sampleType: '',
  sets: 0,
  setSize: 0,
  timeNeeded: 0
};

function CreateJob({ BASE_URL }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
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
  const handleTimeNeeded = useCallback((military) => update({ timeNeeded: military }), [update]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // The date and time pickers always report a value, so only the
    // fields the user can actually leave empty are checked here
    if (!form.role) {
      setError('Please choose a role.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = { ...form };

    try {
      const response = await fetch(`${BASE_URL}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add new job | 0546aa');
      }
      navigate('/timesheet'); // only leave the page if the save worked
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      setSubmitting(false);
    }
  }
  return (
    <div style={{ color: 'black', padding: '1rem' }}>
      <h1>Create New Job</h1>

      <div className='clock-in-grid'>
        <label>Date:</label>
        <DateSelector pullDateString={handleDate} allowEdit={true} />

        <label>Time Needed:</label>
        <TimeSelector header='Time Needed' pullTimeInteger={handleTimeNeeded} />

        <span style={{ display: 'inline-block' }}><label>Job Name:</label></span>
        <input className='white-box' type='text' value={form.projectName} onChange={onField('projectName')} />

        <label>Project #:</label>
        <input className='white-box' type='text' value={form.projectNumber} onChange={onField('projectNumber')} />

        <label>Report #:</label>
        <input className='white-box' type='text' value={form.reportNumber} onChange={onField('reportNumber')} />

        <span style={{ display: 'inline-block' }}><label>Role:</label></span>
        <select className='white-box' name='role' value={form.role} onChange={onField('role')}>
          <option value='' style={{ color: 'rgba(0,0,0,0.5)' }}>Select Role</option>
          <option value='Concrete Testing'>Concrete Testing</option>
          <option value='Rebar Inspection'>Rebar Inspection</option>
          <option value='Soils Testing'>Soils Testing</option>
          <option value='Asphalt Testing'>Asphalt Testing</option>
        </select>

        <label>Task:</label>
        <input className='white-box' type='text' value={form.task} onChange={onField('task')} />
        <label>Location:</label>
        <input className='white-box' type='text' value={form.location} onChange={onField('location')} />
        <label>Description:</label>
        <input className='white-box' type='text' value={form.description} onChange={onField('description')} />
        <label>Assign Employee:</label>
        <input className='white-box' type='integer' value={form.assignedEmployee} onChange={onField('assignedEmployee')} />

        {/* If samples needed */}

        <label>Sample Type:</label>
        <input className='white-box' type='integer' value={form.sampleType} onChange={onField('sampleType')} />
        <label>Sets:</label>
        <input className='white-box' type='integer' value={form.sets} onChange={onField('sets')} />
        <label>Set Size:</label>
        <input className='white-box' type='integer' value={form.setSize} onChange={onField('setSize')} />
      </div>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <button type='button' onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Saving...' : 'Submit'}
      </button>
    </div>
  );
}

export default CreateJob;
