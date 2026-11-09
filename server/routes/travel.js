const express = require('express');
const { timesheetDb } = require('../config/databases');
const router = express.Router();

const stmts = {
  all: timesheetDb.prepare('SELECT * FROM travel ORDER BY created_at DESC'),
  getByTimesheet: timesheetDb.prepare('SELECT * FROM travel WHERE timesheet_id = ?'),
  insert: timesheetDb.prepare(`INSERT INTO travel (
    timesheet_id, travelType, toSiteStart, toSiteEnd,
    fromSiteStart, fromSiteEnd, milesToSite, milesFromSite,
    totalMiles, timeToSite, timeFromSite, totalTravelTime
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
  updateStatus: timesheetDb.prepare(`UPDATE travel SET 
    travelType = ?,
    toSiteStart = ?,
    toSiteEnd = ?,
    fromSiteStart = ?,
    fromSiteEnd = ?,
    milesToSite = ?,
    milesFromSite = ?,
    totalMiles = ?,
    timeToSite= ?,
    timeFromSite = ?,
    totalTravelTime = ?
    WHERE id = ?`),
};

router.get('/', (req, res) => {
  res.json(stmts.all.all());
});

// what is timesheet id ???
router.get('/timesheet/:timesheetId', (req, res, next) => {
  try {
    res.json(stmts.getByTimesheet.all(req.params.timesheetId));
  } catch (err) { next(err); }
});

// Cross-database transaction: verify user exists, then insert order
router.post('/', (req, res, next) => {
  try {
    const { timesheet_id, travelType, toSiteStart, toSiteEnd,
    fromSiteStart, fromSiteEnd, milesToSite, milesFromSite,
    totalMiles, timeToSite, timeFromSite, totalTravelTime } = req.body;

    // Validate user exists in the OTHER database
    const ts = timesheetDb.prepare('SELECT id FROM timesheet WHERE id = ?').get(timesheet_id);
    if (!ts) return res.status(400).json({ error: 'Invalid timesheet' });

    const entry = stmts.insert.run(
      timesheet_id, travelType, toSiteStart, toSiteEnd,
      fromSiteStart, fromSiteEnd, milesToSite, milesFromSite,
      totalMiles, timeToSite, timeFromSite, totalTravelTime
    );
    res.status(201).json({ id: entry.lastInsertRowid, 
      timesheet_id, travelType, toSiteStart, toSiteEnd,
      fromSiteStart, fromSiteEnd, milesToSite, milesFromSite,
      totalMiles, timeToSite, timeFromSite, totalTravelTime});
  } catch (err) { next(err); }
});

router.put('/:id', (req, res, next) => {
  try {
    const {
      travelType, toSiteStart, toSiteEnd,
      fromSiteStart, fromSiteEnd, milesToSite, milesFromSite,
      totalMiles, timeToSite, timeFromSite, totalTravelTime
    } = req.body;
    const entry = stmts.update.run(
      travelType, toSiteStart, toSiteEnd,
      fromSiteStart, fromSiteEnd, milesToSite, milesFromSite,
      totalMiles, timeToSite, timeFromSite, totalTravelTime, req.params.id
    );
    if (entry.changes === 0) return res.status(404).json({ error: 'Entry not found' });
    res.json({ id: Number(req.params.id), travelType, toSiteStart, toSiteEnd,
      fromSiteStart, fromSiteEnd, milesToSite, milesFromSite,
      totalMiles, timeToSite, timeFromSite, totalTravelTime });
  } catch (err) { next(err); }
});

/*
router.patch('/:id/status', (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ error: `status must be one of: ${valid.join(', ')}` });
    const info = stmts.updateStatus.run(status, req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ id: Number(req.params.id), status });
  } catch (err) { next(err); }
});
*/

module.exports = router;