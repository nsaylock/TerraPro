import { useState, useEffect } from 'react';
import Modal from './Modal';
import DateSelector from './DateSelector';
import TimeSelector from './TimeSelector';
import { getUIDate, getTimeDisplay } from '../utils/dateTime';

const DROP_OFF_LOCATIONS = ['J8 Laboratory'];

const SMALL = { fontSize: '14px' };

function Info({ label, value, as: Heading = 'h5', style }) {
  return (
    <>
      <Heading>{label}</Heading>
      <p style={{ ...SMALL, ...style }}>{value ?? '—'}</p>
    </>
  );
}

const hasValue = (v) => v !== null && v !== undefined && v !== '';

function formatPickUp(set) {
  const date = getUIDate(set.pickUpDate, true);
  return hasValue(set.pickUpTime) ? `${date} ${getTimeDisplay(Number(set.pickUpTime))}` : date;
}

const formatTemp = (t) => (hasValue(t) ? `${t}°F` : null);

// ---- The pick up form. It lives inside the Modal, which unmounts its children
// when closed, so every pick up starts with a fresh, empty form. ----

function PickUpForm({ onSubmit, submitting, error }) {
  const [form, setForm] = useState({
    pickUpDate: '',
    pickUpTime: null,
    pickUpEmployee: '',
    dropOffLocation: '',
    highTemp: '',
    lowTemp: '',
  });

  const update = (fields) => setForm((f) => ({ ...f, ...fields }));
  const onField = (name) => (e) => update({ [name]: e.target.value });

  let blocker = null;
  if (!form.pickUpEmployee.trim()) {
    blocker = 'Enter who picked up the samples.';
  } else if (!form.dropOffLocation) {
    blocker = 'Choose a drop off location.';
  } else if (form.highTemp === '' || form.lowTemp === '') {
    blocker = 'Enter the high and low temperature readings.';
  } else if (Number(form.highTemp) < Number(form.lowTemp)) {
    blocker = "The high temperature can't be lower than the low.";
  }

  const handleSubmit = () => {
    if (blocker || submitting) return;
    onSubmit({
      ...form,
      pickUpEmployee: form.pickUpEmployee.trim(),
      highTemp: Number(form.highTemp),
      lowTemp: Number(form.lowTemp),
    });
  };

  return (
    <div style={{ color: 'black' }}>
      <div className='clock-in-grid'>
        <label>Pick Up Date:</label>
        <DateSelector pullDateString={(d) => update({ pickUpDate: d })} allowEdit={false} />

        <label>Pick Up Time:</label>
        <TimeSelector header='Pick Up Time' pullTimeInteger={(t) => update({ pickUpTime: t })} />

        <label>Pick Up Employee:</label>
        <input type='text' value={form.pickUpEmployee} onChange={onField('pickUpEmployee')} />

        <label>Drop Off Location:</label>
        <select value={form.dropOffLocation} onChange={onField('dropOffLocation')}>
          <option value=''>Select</option>
          {DROP_OFF_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        <label>High Temp (°F):</label>
        <input
          type='number'
          step='any'
          inputMode='decimal'
          placeholder='High reading'
          value={form.highTemp}
          onChange={onField('highTemp')}
        />

        <label>Low Temp (°F):</label>
        <input
          type='number'
          step='any'
          inputMode='decimal'
          placeholder='Low reading'
          value={form.lowTemp}
          onChange={onField('lowTemp')}
        />
      </div>

      {blocker && <p>{blocker}</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <button
        type='button'
        className='big-btn'
        style={{ marginTop: '15px', opacity: blocker || submitting ? 0.5 : 1 }}
        disabled={Boolean(blocker) || submitting}
        onClick={handleSubmit}
      >
        {submitting ? 'Saving...' : 'Pick Up'}
      </button>
    </div>
  );
}

// ---- One set of samples ----

function SampleCard({ set, onPickUp }) {
  const pickedUp = Boolean(set.pickUpDate);

  return (
    <div className='samples-card'>
      <div className='samples-list'>
        <div className='samples-list-grid'>
          <div className='samples-list-info'>
            <Info label='Cast Date' value={getUIDate(set.castDate, true)} />
            <Info label='Type' value={set.sampleType} />
            <Info label='Sets' value={set.sets} />
            <Info label='Set Size' value={set.setSize} />
          </div>
          <div className='samples-list-info'>
            <Info label='Project' value={set.projectName} />
            <Info label='Project #' value={set.projectNumber} />
            <Info label='Report #' value={set.reportNumber} />
            <Info label='Employee' value={set.employee} />
          </div>
        </div>
      </div>

      <div className='samples-location'>
        <h5 style={{ borderStyle: 'solid', borderColor: 'black', borderWidth: '0 1px 1px 0' }}>
          Location
        </h5>
        <p style={{ ...SMALL, textAlign: 'start' }}>{set.storageLocation}</p>
      </div>

      {pickedUp ? (
        <>
          <div className='samples-list-grid'>
            <div className='samples-list-info'>
              <Info as='h6' label='Picked Up' value={formatPickUp(set)} />
            </div>
            <div className='samples-list-info'>
              <Info as='h6' label='Picked Up By' value={set.pickUpEmployee} />
            </div>
          </div>
          <div className='samples-list-grid'>
            <div className='samples-list-info'>
              <Info as='h6' label='High Temp' value={formatTemp(set.highTemp)} />
            </div>
            <div className='samples-list-info'>
              <Info as='h6' label='Low Temp' value={formatTemp(set.lowTemp)} />
            </div>
          </div>
          <div className='samples-location'>
            <Info as='h6' label='Drop Off' value={set.dropOffLocation} />
          </div>
        </>
      ) : (
        <button
          type='button'
          style={{
            margin: '6px 30px',
            padding: '5px',
            width: '30%',
            background: 'green',
            alignSelf: 'center',
            fontSize: '16px',
          }}
          onClick={() => onPickUp(set)}
        >
          Pick Up
        </button>
      )}
    </div>
  );
}

// ---- The page ----

function Samples({ BASE_URL }) {
  const [samplesTable, setSamplesTable] = useState(null); // null = not loaded yet
  const [loadError, setLoadError] = useState(null);
  const [showPickedUp, setShowPickedUp] = useState(false);

  const [target, setTarget] = useState(null); // the set being picked up (modal is open when set)
  const [submitting, setSubmitting] = useState(false);
  const [pickUpError, setPickUpError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${BASE_URL}/samples`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then(setSamplesTable)
      .catch((err) => {
        if (err.name !== 'AbortError') setLoadError(err.message);
      });

    return () => controller.abort();
  }, [BASE_URL]);

  const openPickUp = (set) => {
    setPickUpError(null);
    setTarget(set);
  };

  const handlePickUp = async (payload) => {
    setSubmitting(true);
    setPickUpError(null);
    try {
      const response = await fetch(`${BASE_URL}/samples/${target.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to record the pick up');

      // Update the card in place so the list reflects the pick up right away
      setSamplesTable((prev) =>
        prev.map((s) => (s.id === target.id ? { ...s, ...payload } : s))
      );
      setTarget(null);
    } catch (err) {
      console.error('Failed to save pick up:', err.message);
      setPickUpError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) return <h3>Couldn't load samples: {loadError}</h3>;
  if (samplesTable === null) return <h3>Loading...</h3>;

  const visible = samplesTable.filter((s) => Boolean(s.pickUpDate) === showPickedUp);

  return (
    <div className='samples-container'>
      <button type='button' aria-pressed={showPickedUp} onClick={() => setShowPickedUp(true)}>
        Picked Up
      </button>
      <button type='button' aria-pressed={!showPickedUp} onClick={() => setShowPickedUp(false)}>
        Not Picked Up
      </button>

      {visible.length === 0 && (
        <p>{showPickedUp ? 'No samples have been picked up yet.' : 'No samples are waiting for pick up.'}</p>
      )}

      {visible.map((set) => (
        <SampleCard key={set.id} set={set} onPickUp={openPickUp} />
      ))}

      <Modal isOpen={target !== null} onClose={() => setTarget(null)}>
        {target && (
          <PickUpForm onSubmit={handlePickUp} submitting={submitting} error={pickUpError} />
        )}
      </Modal>
    </div>
  );
}

export default Samples;
