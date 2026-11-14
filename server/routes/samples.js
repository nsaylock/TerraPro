const express = require('express');
const { samplesDb } = require('../config/databases');
const router = express.Router();

// Prepare statements once
const stmts = {
  all: samplesDb.prepare('SELECT * FROM samples ORDER BY id'),
  get: samplesDb.prepare('SELECT * FROM samples WHERE id = ?'),
  insert: samplesDb.prepare(`INSERT INTO samples (
    projectName,
    projectNumber,
    reportNumber,
    castDate,
    sampleType,
    sets,
    setSize,
    employee,
    storageLocation,
    pickUpDate,
    dropOffLocation
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
  update: samplesDb.prepare(`UPDATE samples 
    SET 
    projectName = ?,
    projectNumber = ?,
    reportNumber = ?,
    castDate = ?,
    sampleType = ?,
    sets = ?,
    setSize = ?, 
    employee = ?,
    storageLocation = ?,
    pickUpDate = ?,
    dropOffLocation = ?
    WHERE id = ?`),
    remove: samplesDb.prepare('DELETE FROM samples WHERE id = ?'),
};

router.get('/', (req, res) => {
  res.json(stmts.all.all());
});

router.get('/:id', (req, res, next) => {
  try {
    const samples = stmts.get.get(req.params.id);
    if (!samples) return res.status(404).json({ error: 'User not found' });
    res.json(samples);
  } catch (err) { next(err); }
});

router.post('/', (req, res, next) => {
  try {
    const { 
      projectName,
      projectNumber,
      reportNumber,
      castDate,
      sampleType,
      sets,
      setSize,
      employee,
      storageLocation,
      pickUpDate,
      dropOffLocation
    } = req.body;
    if (!castDate || !projectNumber) return res.status(400).json({ error: 'Date and Project Number required' });
    const sample = stmts.insert.run(
      projectName,
      projectNumber,
      reportNumber,
      castDate,
      sampleType,
      sets,
      setSize,
      employee,
      storageLocation,
      pickUpDate,
      dropOffLocation
    );
    res.status(201).json({ 
      id: sample.lastInsertRowid, 
      projectName,
      projectNumber,
      reportNumber,
      castDate,
      sampleType,
      sets,
      setSize,
      employee,
      storageLocation,
      pickUpDate,
      dropOffLocation
    });
  } catch (err) { next(err); }
});

router.put('/:id', (req, res, next) => {
  try {
    const {
      projectName,
      projectNumber,
      reportNumber,
      castDate,
      sampleType,
      sets,
      setSize,
      employee,
      storageLocation,
      pickUpDate,
      dropOffLocation
    } = req.body;
    const sample = stmts.update.run(
      projectName,
      projectNumber,
      reportNumber,
      castDate,
      sampleType,
      sets,
      setSize,
      employee,
      storageLocation,
      pickUpDate,
      dropOffLocation,
      req.params.id
    );
    if (sample.changes === 0) return res.status(404).json({ error: 'Entry not found' });
    res.json({
      id: Number(req.params.id), 
      projectName,
      projectNumber,
      reportNumber,
      castDate,
      sampleType,
      sets,
      setSize,
      employee,
      storageLocation,
      pickUpDate,
      dropOffLocation
     });
  } catch (err) { next(err); }
});

router.delete('/:id', (req, res, next) => {
  try {
    const sample = stmts.remove.run(req.params.id);
    if (sample.changes === 0) return res.status(404).json({ error: 'Entry not found' });
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;