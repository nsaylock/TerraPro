const express = require('express');
const { timesheet } = require('../config/databases');
const router = express.Router();

// Every column a client may set when creating an entry. The SQL and the row
// object are both built from this list, so column and placeholder counts
// can't drift apart. scheduleId links an entry to the job it belongs to.
const FIELDS = [
  'scheduleId', 'date', 'projectName', 'projectNumber', 'reportNumber', 'role', 'task',
  'startTime', 'endTime', 'onSiteHours',
  'travelType', 'toSiteStart', 'toSiteEnd', 'fromSiteStart', 'fromSiteEnd',
  'milesToSite', 'milesFromSite', 'totalMiles',
  'timeToSite', 'timeFromSite', 'totalTravelTime',
];

// Missing fields become null, because better-sqlite3 refuses to bind undefined
const toRow = (body) => Object.fromEntries(FIELDS.map((f) => [f, body[f] ?? null]));

// Prepare statements once
const stmts = {
  all: timesheet.prepare('SELECT * FROM timesheet ORDER BY date'),
  get: timesheet.prepare('SELECT * FROM timesheet WHERE id = ?'),
  queryByDate: timesheet.prepare(`
      SELECT * FROM timesheet
      WHERE date >= ? AND date <= ?
      ORDER BY date ASC
    `),
  insert: timesheet.prepare(
    `INSERT INTO timesheet (${FIELDS.join(', ')})
     VALUES (${FIELDS.map((f) => '@' + f).join(', ')})`
  ),
  // travelType uses COALESCE so a clock out that doesn't send one leaves the
  // existing value alone
  update: timesheet.prepare(`UPDATE timesheet 
    SET 
    endTime = ?,
    onSiteHours = ?,
    fromSiteStart = ?,
    fromSiteEnd = ?,
    milesFromSite = ?,
    totalMiles = ?,
    timeFromSite = ?,
    totalTravelTime = ?,
    travelType = COALESCE(?, travelType)
    WHERE id = ?`),
  // Outbound travel, added after clock in. Totals are derived here (outbound +
  // whatever return trip exists) so clients can't send totals that disagree.
  setTravel: timesheet.prepare(`UPDATE timesheet
    SET
    travelType = @travelType,
    toSiteStart = @toSiteStart,
    toSiteEnd = @toSiteEnd,
    milesToSite = @milesToSite,
    timeToSite = @timeToSite,
    totalMiles = @milesToSite + COALESCE(milesFromSite, 0),
    totalTravelTime = @timeToSite + COALESCE(timeFromSite, 0)
    WHERE id = @id`),
  remove: timesheet.prepare('DELETE FROM timesheet WHERE id = ?'),
};

router.get('/', (req, res, next) => {
  try {
    res.json(stmts.all.all());
  } catch (err) { next(err); }
});

router.get('/period', (req, res) => {
  const {periodStart, periodEnd} = req.query;

  if (!periodStart || !periodEnd) {
    return res.status(400).json({error: 'period start and period end are required'});
  }

  try {
    res.json(stmts.queryByDate.all(periodStart, periodEnd));
  } catch (err) {
    console.error('Timesheet Database query failed', err);
    res.status(500).json({error: 'Internal server error'});
  }

});

router.get('/:id', (req, res, next) => {
  try {
    const entry = stmts.get.get(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    res.json(entry);
  } catch (err) { next(err); }
});

router.post('/', (req, res, next) => {
  try {
    const row = toRow(req.body);
    // startTime is a military integer, and 0 (12:00 AM) is a real value,
    // so check for "missing" rather than "falsy"
    if (!row.date || row.startTime === null || row.startTime === '') {
      return res.status(400).json({ error: 'Date and Start Time required' });
    }
    const result = stmts.insert.run(row);
    res.status(201).json({ id: result.lastInsertRowid, ...row });
  } catch (err) { next(err); }
});

router.put('/:id', (req, res, next) => {
  try {
    const {
      endTime, onSiteHours, fromSiteStart, 
      fromSiteEnd, milesFromSite, totalMiles,
      timeFromSite, totalTravelTime, travelType
    } = req.body;
    const entry = stmts.update.run(
      endTime, onSiteHours, fromSiteStart, 
      fromSiteEnd, milesFromSite, totalMiles,
      timeFromSite, totalTravelTime, travelType ?? null, req.params.id
    );
    if (entry.changes === 0) return res.status(404).json({ error: 'Entry not found' });
    res.json({ id: Number(req.params.id), endTime, onSiteHours, fromSiteStart, 
          fromSiteEnd, milesFromSite, totalMiles,
          timeFromSite, totalTravelTime, travelType });
  } catch (err) { next(err); }
});

// Add outbound travel to an entry without touching its clock out fields
// (the PUT above would overwrite endTime with null)
router.patch('/:id/travel', (req, res, next) => {
  try {
    const { travelType, toSiteStart, toSiteEnd, milesToSite, timeToSite } = req.body;
    if (!travelType) return res.status(400).json({ error: 'Travel type is required' });
    if (!Number.isFinite(milesToSite) || !Number.isFinite(timeToSite) || milesToSite < 0 || timeToSite < 0) {
      return res.status(400).json({ error: 'Mileage and travel time must be non-negative numbers' });
    }
    const id = Number(req.params.id);
    const result = stmts.setTravel.run({
      id, travelType, toSiteStart: toSiteStart ?? null, toSiteEnd: toSiteEnd ?? null, milesToSite, timeToSite,
    });
    if (result.changes === 0) return res.status(404).json({ error: 'Entry not found' });
    res.json(stmts.get.get(id));
  } catch (err) { next(err); }
});

router.delete('/:id', (req, res, next) => {
  try {
    const entry = stmts.remove.run(req.params.id);
    if (entry.changes === 0) return res.status(404).json({ error: 'Entry not found' });
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
