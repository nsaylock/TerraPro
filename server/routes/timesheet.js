const express = require('express');
const { timesheetDb } = require('../config/databases');
const router = express.Router();

// Prepare statements once
const stmts = {
  all: timesheetDb.prepare('SELECT * FROM timesheet ORDER BY date'),
  get: timesheetDb.prepare('SELECT * FROM timesheet WHERE id = ?'),
  queryByDate: timesheetDb.prepare(`
      SELECT * FROM timesheet
      WHERE date >= ? AND date <= ?
      ORDER BY date ASC
    `),
  insert: timesheetDb.prepare(`INSERT INTO timesheet (
    projectName, projectNumber, reportNumber, date, startTime, endTime,
    onSiteHours, service, travelType, toSiteStart, toSiteEnd,
    fromSiteStart, fromSiteEnd, milesToSite, milesFromSite,
    totalMiles, timeToSite, timeFromSite, totalTravelTime
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
  // travelType uses COALESCE so a clock out that doesn't send one leaves the
  // existing value alone
  update: timesheetDb.prepare(`UPDATE timesheet 
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
  remove: timesheetDb.prepare('DELETE FROM timesheet WHERE id = ?'),
};

router.get('/', (req, res, next) => {
  try {
    res.json(stmts.all.all());
  } catch (err) { next(err); } // before, a failure here never sent a response and the request hung
});

router.get('/period', (req, res) => {
  const {periodStart, periodEnd} = req.query;

  if (!periodStart || !periodEnd) {
    return res.status(400).json({error: 'period start and period end are required'});
  }

  try {
    res.json(stmts.queryByDate.all(periodStart, periodEnd));
  } catch (err) {
    console.error('Database query failed', err);
    res.status(500).json({error: 'Internal server error'});
  }

});

router.get('/:id', (req, res, next) => {
  try {
    const timesheet = stmts.get.get(req.params.id);
    if (!timesheet) return res.status(404).json({ error: 'Entry not found' });
    res.json(timesheet);
  } catch (err) { next(err); }
});

router.post('/', (req, res, next) => {
  try {
    const { 
      projectName, projectNumber, reportNumber, date, 
      startTime, endTime, onSiteHours, service,
      travelType, toSiteStart, toSiteEnd,
      fromSiteStart, fromSiteEnd, milesToSite, milesFromSite,
      totalMiles, timeToSite, timeFromSite, totalTravelTime
    } = req.body;
    // startTime is a military integer, and 0 (12:00 AM) is a real value,
    // so check for "missing" rather than "falsy"
    if (!date || startTime === undefined || startTime === null || startTime === '') {
      return res.status(400).json({ error: 'Date and Start Time required' });
    }
    const entry = stmts.insert.run(
      projectName, projectNumber, reportNumber, date, 
      startTime, endTime, onSiteHours, service,
      travelType, toSiteStart, toSiteEnd,
      fromSiteStart, fromSiteEnd, milesToSite, milesFromSite,
      totalMiles, timeToSite, timeFromSite, totalTravelTime
    );
    res.status(201).json({ id: entry.lastInsertRowid, 
      projectName, projectNumber, reportNumber, date, 
      startTime, endTime, onSiteHours, service,
      travelType, toSiteStart, toSiteEnd,
      fromSiteStart, fromSiteEnd, milesToSite, milesFromSite,
      totalMiles, timeToSite, timeFromSite, totalTravelTime
    });
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

router.delete('/:id', (req, res, next) => {
  try {
    const entry = stmts.remove.run(req.params.id);
    if (entry.changes === 0) return res.status(404).json({ error: 'Entry not found' });
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
