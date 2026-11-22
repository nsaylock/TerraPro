import { useState, useEffect, Fragment } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TimeSelector from './TimeSelector';
import Travel from './Travel';
import { getUIDate, getTimeDisplay, calculateHours } from '../utils/dateTime';

const EMPLOYEE = 'Nick Saylock'; // TODO: use the logged-in user
const SAMPLE_TYPES = ['4"x8" Cylinder', '6"x12" Cylinder', 'Grout Cube'];
const RETURN_OPTIONS = [
  { value: 'reverse', label: 'Reverse' },
  { value: 'new', label: 'New Trip' },
  { value: 'none', label: 'No' },
];

// A new return trip, in the field names the Travel component uses
// (its "From" / "To" / Mileage / Time inputs)
const EMPTY_TRIP = { travelType: '', toSiteStart: '', toSiteEnd: '', milesToSite: '', timeToSite: '' };

const toNumber = (value) => Number(value) || 0;
const round2 = (n) => Number(n.toFixed(2));

// The return trip is derived from the choice the user made, never stored
function getReturnTrip(mode, entry, newTrip) {
  if (mode === 'reverse') {
    return {
      fromSiteStart: entry.toSiteEnd, // leave the site...
      fromSiteEnd: entry.toSiteStart, // ...and go back where you started
      milesFromSite: toNumber(entry.milesToSite),
      timeFromSite: toNumber(entry.timeToSite),
    };
  }
  if (mode === 'new') {
    return {
      fromSiteStart: newTrip.toSiteStart,
      fromSiteEnd: newTrip.toSiteEnd,
      milesFromSite: toNumber(newTrip.milesToSite),
      timeFromSite: toNumber(newTrip.timeToSite),
    };
  }
  return { fromSiteStart: '', fromSiteEnd: '', milesFromSite: 0, timeFromSite: 0 };
}

function ClockOut({ BASE_URL }) {
  const location = useLocation();
  const navigate = useNavigate();
  const entryId = location.state?.id;

  const [entry, setEntry] = useState(null); // null = not loaded yet
  const [loadError, setLoadError] = useState(null);

  const [endTime, setEndTime] = useState(null); // set by TimeSelector on mount
  const [returnMode, setReturnMode] = useState('none'); // 'reverse' | 'new' | 'none'
  const [newTrip, setNewTrip] = useState(EMPTY_TRIP);

  const [samplesOpen, setSamplesOpen] = useState(false);
  const [sampleType, setSampleType] = useState(SAMPLE_TYPES[0]);
  const [sets, setSets] = useState('');
  const [setSize, setSetSize] = useState('');
  const [storageLocation, setStorageLocation] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!entryId) return;
    const controller = new AbortController();

    fetch(`${BASE_URL}/timesheet/${entryId}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then(setEntry)
      .catch((err) => {
        if (err.name !== 'AbortError') setLoadError(err.message);
      });

    return () => controller.abort();
  }, [BASE_URL, entryId]);

  if (!entryId || loadError) {
    return (
      <div style={{ color: 'black', padding: '1rem' }}>
        <p>{loadError ? `Couldn't load this entry: ${loadError}` : 'No entry selected.'}</p>
        <button type='button' onClick={() => navigate('/timeDB')}>Back to timesheet</button>
      </div>
    );
  }
  if (!entry) return <p>Loading...</p>;

  // ---- Everything below is derived from entry + the user's choices ----
  const hasOutbound = Boolean(entry.toSiteStart && entry.toSiteEnd);
  const isConcrete = entry.service === 'Concrete Testing';
  const submitSamples = isConcrete && samplesOpen;

  const onSiteHours = endTime === null ? 0 : calculateHours(Number(entry.startTime), endTime);
  const returnTrip = getReturnTrip(returnMode, entry, newTrip);
  const totalMiles = round2(toNumber(entry.milesToSite) + returnTrip.milesFromSite);
  const totalTravelTime = round2(toNumber(entry.timeToSite) + returnTrip.timeFromSite);

  let blocker = null;
  if (submitSamples && !(Number(sets) > 0 && Number(setSize) > 0)) {
    blocker = 'Enter the number of sets and samples per set.';
  } else if (
    returnMode === 'new' &&
    (!newTrip.toSiteStart || !newTrip.toSiteEnd || newTrip.milesToSite === '' || newTrip.timeToSite === '')
  ) {
    blocker = 'Fill in the locations, mileage and time for the return trip.';
  } else if (returnMode === 'new' && !entry.travelType && !newTrip.travelType) {
    blocker = 'Choose a travel type for the return trip.';
  }
  const canSubmit = !submitting && endTime !== null && !blocker;

  const handleClockOut = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/timesheet/${entryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endTime: endTime === 0 ? 2400 : endTime, // exactly midnight is stored as 2400, since 0 means "not clocked out"
          onSiteHours,
          fromSiteStart: returnTrip.fromSiteStart,
          fromSiteEnd: returnTrip.fromSiteEnd,
          milesFromSite: returnTrip.milesFromSite,
          totalMiles,
          timeFromSite: returnTrip.timeFromSite,
          totalTravelTime,
          // The server keeps the existing type if this is null
          travelType: entry.travelType || (returnMode === 'new' ? newTrip.travelType : '') || null,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to clock out');

      if (submitSamples) {
        const samplesResponse = await fetch(`${BASE_URL}/samples`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectName: entry.projectName,
            projectNumber: entry.projectNumber,
            reportNumber: entry.reportNumber,
            castDate: entry.date,
            sampleType,
            sets: Number(sets),
            setSize: Number(setSize),
            employee: EMPLOYEE,
            storageLocation,
            pickUpDate: null,
            pickUpTime: null,
            pickUpEmployee: null,
            dropOffLocation: null,
          }),
        });
        if (!samplesResponse.ok) {
          const samplesData = await samplesResponse.json().catch(() => ({}));
          throw new Error(
            samplesData.error || 'Clocked out, but the samples failed to save. Press Clock Out to retry.'
          );
        }
      }

      navigate('/timeDB'); // only leave once everything saved
    } catch (err) {
      console.error('Clock out failed:', err.message);
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div style={{ color: 'black', padding: '1rem' }}>
      <h1>Clock Out</h1>
      <div className='clock-in-grid'>
        <label>Date:</label>
        <p>{getUIDate(entry.date, true)}</p>
        <label>Job Name:</label><p>{entry.projectName}</p>
        <label>Job Number:</label><p>{entry.projectNumber}</p>
        <label>Start Time:</label><p>{getTimeDisplay(entry.startTime)}</p>
        <label>End Time:</label>
        <TimeSelector header='Leave Site' pullTimeInteger={setEndTime} />
        <label>On-Site:</label><p>{onSiteHours} hrs</p>

        {isConcrete && (
          <>
            <label>Include Strength Specimens?</label>
            <span>
              <input
                type='radio'
                name='samples-question'
                checked={samplesOpen}
                onChange={() => setSamplesOpen(true)}
              />
              Yes
              <input
                type='radio'
                name='samples-question'
                checked={!samplesOpen}
                onChange={() => setSamplesOpen(false)}
                style={{ marginLeft: '10px' }}
              />
              No
            </span>
          </>
        )}
      </div>

      {submitSamples && (
        <div className='clock-in-grid'>
          <label>Sample Type:</label>
          <select value={sampleType} onChange={(e) => setSampleType(e.target.value)}>
            {SAMPLE_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <label>Sets:</label>
          <input
            type='number'
            min='1'
            step='1'
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            placeholder='Number of Sets'
          />
          <label>Set Size:</label>
          <input
            type='number'
            min='1'
            step='1'
            value={setSize}
            onChange={(e) => setSetSize(e.target.value)}
            placeholder='Samples per Set'
          />
          <label>Storage Location:</label>
          <input
            type='text'
            value={storageLocation}
            onChange={(e) => setStorageLocation(e.target.value)}
          />
        </div>
      )}

      <h2 style={{ marginTop: '10px' }}>Travel</h2>
      {hasOutbound && (
        <div className='clock-in-grid'>
          <label>To Site:</label>
          <p>{entry.toSiteStart + ' to ' + entry.toSiteEnd}</p>
          <label>Miles:</label>
          <p>
            {entry.milesToSite} mi | Hours: {entry.timeToSite}{' '}
            {Number(entry.timeToSite) === 1 ? 'hr' : 'hrs'}
          </p>
          {returnMode === 'reverse' && (
            <>
              <label>From Site:</label>
              <p>{returnTrip.fromSiteStart + ' to ' + returnTrip.fromSiteEnd}</p>
            </>
          )}
        </div>
      )}

      <div className='clock-in-grid'>
        <label>Total Miles:</label>
        <p>{totalMiles} mi</p>
        <label>Total Travel Time:</label>
        <p>{totalTravelTime} hrs</p>
      </div>

      <div>
        <span className='flex'>
          <label>Include Return Travel?</label>
          {RETURN_OPTIONS.filter((o) => o.value !== 'reverse' || hasOutbound).map((o) => (
            <Fragment key={o.value}>
              <input
                type='radio'
                name='return-travel'
                checked={returnMode === o.value}
                onChange={() => setReturnMode(o.value)}
                style={{ marginLeft: '10px' }}
              />
              {o.label}
            </Fragment>
          ))}
        </span>

        <Travel
          isOpen={returnMode === 'new'}
          values={newTrip}
          onChange={(fields) => setNewTrip((t) => ({ ...t, ...fields }))}
        />
      </div>

      {blocker && <p>{blocker}</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <button
        type='button'
        className='big-btn'
        style={{
          background: 'green',
          justifySelf: 'center',
          marginTop: '10px',
          opacity: canSubmit ? 1 : 0.5,
        }}
        disabled={!canSubmit}
        onClick={handleClockOut}
      >
        <strong>{submitting ? 'Saving...' : 'Clock Out'}</strong>
      </button>
    </div>
  );
}

export default ClockOut;
