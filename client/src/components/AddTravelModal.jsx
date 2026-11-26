import { useState } from 'react';
import Modal from './Modal';
import Travel from './Travel';

const toNumber = (v) => Number(v) || 0;

// Reuses the controlled Travel form: it reads and writes toSiteStart, toSiteEnd,
// milesToSite, timeToSite and travelType.
function AddTravelForm({ entry, BASE_URL, onSaved, onClose }) {
  const [values, setValues] = useState({
    travelType: entry.travelType || '',
    toSiteStart: entry.toSiteStart || '',
    toSiteEnd: entry.toSiteEnd || '',
    milesToSite: entry.milesToSite ?? '',
    timeToSite: entry.timeToSite ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const update = (fields) => setValues((v) => ({ ...v, ...fields }));

  let blocker = null;
  if (!values.travelType) blocker = 'Choose a travel type.';
  else if (!values.toSiteStart.trim() || !values.toSiteEnd.trim()) blocker = 'Enter the from and to locations.';
  else if (values.milesToSite === '' || values.timeToSite === '') blocker = 'Enter the mileage and travel time.';

  const handleSave = async () => {
    if (blocker || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/timesheet/${entry.id}/travel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          travelType: values.travelType,
          toSiteStart: values.toSiteStart.trim(),
          toSiteEnd: values.toSiteEnd.trim(),
          milesToSite: toNumber(values.milesToSite),
          timeToSite: toNumber(values.timeToSite),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to save travel');

      onSaved(data); // the server returns the full updated entry, totals included
      onClose();
    } catch (err) {
      console.error('Saving travel failed:', err.message);
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div style={{ color: 'black' }}>
      <h2>Add Travel</h2>
      <Travel isOpen values={values} onChange={update} />

      {blocker && <p>{blocker}</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <button
        type='button'
        className='big-btn'
        style={{ marginTop: '15px', opacity: blocker || submitting ? 0.5 : 1 }}
        disabled={Boolean(blocker) || submitting}
        onClick={handleSave}
      >
        {submitting ? 'Saving...' : 'Save Travel'}
      </button>
    </div>
  );
}

// entry: the timesheet entry to add travel to (null = modal closed)
function AddTravelModal({ entry, BASE_URL, onSaved, onClose }) {
  return (
    <Modal isOpen={entry !== null} onClose={onClose}>
      {entry && <AddTravelForm entry={entry} BASE_URL={BASE_URL} onSaved={onSaved} onClose={onClose} />}
    </Modal>
  );
}

export default AddTravelModal;