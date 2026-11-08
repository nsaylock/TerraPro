const express = require('express');
const { timesheetDb } = require('../config/databases');
const router = express.Router();

// Prepare statements once
const stmts = {
  all: timesheetDb.prepare('SELECT * FROM timesheet ORDER BY id'),
  get: timesheetDb.prepare('SELECT * FROM timesheet WHERE id = ?'),
  insert: timesheetDb.prepare(`INSERT INTO timesheet (
    jobName, jobNumber, reportNumber, date, startTime, endTime,
    entryHours, service, sets, cylinders
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
  update: timesheetDb.prepare(`UPDATE timesheet SET 
    jobName = ?,
    jobNumber = ?,
    reportNumber = ?,
    date = ?,
    startTime = ?,
    endTime = ?,
    entryHours = ?,
    service = ?,
    sets = ?,
    cylinders = ?
    WHERE id = ?`),
  remove: timesheetDb.prepare('DELETE FROM timesheet WHERE id = ?'),
};

router.get('/', (req, res) => {
  res.json(stmts.all.all());
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
      jobName, jobNumber, reportNumber, date, 
      startTime, endTime, entryHours, service,
      sets, cylinders
    } = req.body;
    if (!date || !startTime) return res.status(400).json({ error: 'Date and Start Time required' });
    const entry = stmts.insert.run(
      jobName, jobNumber, reportNumber, date, 
      startTime, endTime, entryHours, service,
      sets, cylinders
    );
    res.status(201).json({ id: entry.lastInsertRowid, 
      jobName, jobNumber, reportNumber, date, 
      startTime, endTime, entryHours, service,
      sets, cylinders
    });
  } catch (err) { next(err); }
});

router.put('/:id', (req, res, next) => {
  try {
    const {
      jobName, jobNumber, reportNumber, date, 
      startTime, endTime, entryHours, service,
      sets, cylinders
    } = req.body;
    const entry = stmts.update.run(
      jobName, jobNumber, reportNumber, date, 
      startTime, endTime, entryHours, service,
      sets, cylinders, req.params.id
    );
    if (entry.changes === 0) return res.status(404).json({ error: 'Entry not found' });
    res.json({ id: Number(req.params.id), jobName, jobNumber, reportNumber, date, 
      startTime, endTime, entryHours, service,
      sets, cylinders });
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