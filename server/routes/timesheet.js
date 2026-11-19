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
  update: timesheetDb.prepare(`UPDATE timesheet 
    SET 
    endTime = ?,
    onSiteHours = ?,
    fromSiteStart = ?,
    fromSiteEnd = ?,
    milesFromSite = ?,
    totalMiles = ?,
    timeFromSite = ?,
    totalTravelTime = ?
    WHERE id = ?`),
  remove: timesheetDb.prepare('DELETE FROM timesheet WHERE id = ?'),
};

router.get('/', (req, res) => {
  try {
    const timesheet = stmts.all.all();
    res.json(timesheet);
  } catch (err) {
    console.error('Failed to fetch Timesheet');
    res.status(500);
  }
})

router.get('/period', async (req, res) => {
  const {periodStart, periodEnd} = req.query;

  if (!periodStart || !periodEnd) {
    return res.status(400).json({error: 'period start and period end are required'});
  }

  try {
    const response = await stmts.queryByDate.all(periodStart, periodEnd);
    res.json(response);
  } catch (err) {
    console.error('Database query failed', err);
    res.status(500).json({error: 'Internal server error'});
  }

});

router.get('/:id', (req, res, next) => {
  try {
    const timesheet = stmts.get.get(req.params.id);
    if (!timesheet) return res.status(404).json({ error: 'User not found' });
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
    if (!date || !startTime) return res.status(400).json({ error: 'Date and Start Time required' });
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
      timeFromSite, totalTravelTime
    } = req.body;
    const entry = stmts.update.run(
      endTime, onSiteHours, fromSiteStart, 
      fromSiteEnd, milesFromSite, totalMiles,
      timeFromSite, totalTravelTime, req.params.id
    );
    if (entry.changes === 0) return res.status(404).json({ error: 'Entry not found' });
    res.json({ id: Number(req.params.id), endTime, onSiteHours, fromSiteStart, 
          fromSiteEnd, milesFromSite, totalMiles,
          timeFromSite, totalTravelTime });
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