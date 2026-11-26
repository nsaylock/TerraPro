import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DateSelector from './DateSelector';
import TimeSelector from './TimeSelector';
import '../css/ClockIn.css';

const ROLES = ['Concrete Testing', 'Rebar Inspection', 'Soils Testing', 'Asphalt Testing'];
const SAMPLE_TYPES = ['4"x8" Cylinder', '6"x12" Cylinder', 'Grout Cube'];
const EMPLOYEES = [{ id: 276067, name: 'Nick Saylock' }]; // TODO: load from the server

const INITIAL_FORM = {
  date: '',
  timeNeeded: 0,
  projectName: '',
  projectNumber: '',
  reportNumber: '',
  role: '',
  task: '',
  location: '',
  description: '',
  assignedEmployee: '', // '' = nobody chosen yet (matches the select's placeholder option)
  sampleType: SAMPLE_TYPES[0],
  sets: '',
  setSize: '',
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

  const isConcrete = form.role === 'Concrete Testing';

  const handleSubmit = async () => {
    if (submitting) return;

    // The date and time pickers always report a value, so only the
    // fields the user can actually leave empty are checked here
    if (!form.projectNumber.trim()) return setError('Enter a project number.');
    if (!form.role) return setError('Please choose a role.');
    if (!form.assignedEmployee) return setError('Please assign an employee.');

    setSubmitting(true);
    setError(null);

    // Sample fields only apply to concrete jobs that actually have sets
    const hasSamples = isConcrete && Number(form.sets) > 0;
    const payload = {
      ...form,
      projectNumber: form.projectNumber.trim(),
      assignedEmployee: Number(form.assignedEmployee),
      sampleType: hasSamples ? form.sampleType : null,
      sets: hasSamples ? Number(form.sets) : null,
      setSize: hasSamples ? Number(form.setSize) || 0 : null,
    };

    try {
      const response = await fetch(`${BASE_URL}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add new job to schedule | 0546aa');
      }
      navigate('/'); // only leave the page if the save worked
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      setSubmitting(false);
    }
  };

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
          {ROLES.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>

        <label>Task:</label>
        <input className='white-box' type='text' value={form.task} onChange={onField('task')} />

        <label>Location:</label>
        <input className='white-box' type='text' value={form.location} onChange={onField('location')} />

        <label>Description:</label>
        <input className='white-box' type='text' value={form.description} onChange={onField('description')} />

        <label>Assign Employee:</label>
        <select
          className='white-box'
          name='assign-employee'
          value={276067} /* TODO create database for employees */
          onChange={onField('assignedEmployee')}
        >
          <option value='' style={{ color: 'rgba(0,0,0,0.5)' }}>Select Employee</option>
          {EMPLOYEES.map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>

        {/* Samples only apply to concrete testing */}
        {isConcrete && (
          <>
            <label>Sample Type:</label>
            <select className='white-box' value={form.sampleType} onChange={onField('sampleType')}>
              {SAMPLE_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <label>Sets:</label>
            <input
              className='white-box'
              type='number'
              min='1'
              step='1'
              placeholder='Leave blank if none'
              value={form.sets}
              onChange={onField('sets')}
            />

            <label>Set Size:</label>
            <input
              className='white-box'
              type='number'
              min='1'
              step='1'
              placeholder='Samples per set'
              value={form.setSize}
              onChange={onField('setSize')}
            />
          </>
        )}
      </div>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <button type='button' onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Saving...' : 'Submit'}
      </button>
    </div>
  );
}

export default CreateJob;