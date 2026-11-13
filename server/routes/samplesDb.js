const express = require('express');
const { samplesDb } = require('../config/databases');
const router = express.Router();

// Prepare statements once
const stmts = {
  all: samplesDb.prepare('SELECT * FROM timesheet ORDER BY id'),
  get: samplesDb.prepare('SELECT * FROM timesheet WHERE id = ?'),
  insert: samplesDb.prepare(`INSERT INTO timesheet (
    projectName,
    projectNumber,
    reportNumber,
    date,
    sampleType,
    sets,
    setSize,
    employee,
    storageLocation
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`),
  update: samplesDb.prepare(`UPDATE timesheet 
    SET 
    projectName = ?,
    projectNumber = ?,
    reportNumber = ?,
    date = ?,
    sampleType = ?,
    sets = ?,
    setSize = ?, 
    employee= ?,
    storageLocation =?
    WHERE id = ?`),
  remove: samplesDb.prepare('DELETE FROM timesheet WHERE id = ?'),
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
      projectName,
      projectNumber,
      reportNumber,
      date,
      sampleType,
      sets,
      setSize,
      employee,
      storageLocation
    } = req.body;
    if (!date || !startTime) return res.status(400).json({ error: 'Date and Start Time required' });
    const entry = stmts.insert.run(
      projectName,
      projectNumber,
      reportNumber,
      date,
      sampleType,
      sets,
      setSize,
      employee,
      storageLocation
    );
    res.status(201).json({ id: entry.lastInsertRowid, 
      projectName,
      projectNumber,
      reportNumber,
      date,
      sampleType,
      sets,
      setSize,
      employee,
      storageLocation
    });
  } catch (err) { next(err); }
});

router.put('/:id', (req, res, next) => {
  try {
    const {
      projectName,
      projectNumber,
      reportNumber,
      date,
      sampleType,
      sets,
      setSize,
      employee,
      storageLocation
    } = req.body;
    const entry = stmts.update.run(
      projectName,
      projectNumber,
      reportNumber,
      date,
      sampleType,
      sets,
      setSize,
      employee,
      storageLocation,
       req.params.id
    );
    if (entry.changes === 0) return res.status(404).json({ error: 'Entry not found' });
    res.json({ id: Number(req.params.id), 
      projectName,
      projectNumber,
      reportNumber,
      date,
      sampleType,
      sets,
      setSize,
      employee,
      storageLocation
     });
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