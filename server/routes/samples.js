const express = require('express');
const { samplesDb } = require('../config/databases');
const router = express.Router();

// Prepare statements once
const stmts = {
  all: samplesDb.prepare('SELECT * FROM samples ORDER BY castDate'),
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
    pickUpTime,
    pickUpEmployee,
    dropOffLocation
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
  update: samplesDb.prepare(`UPDATE samples 
    SET 
    pickUpDate = ?,
    pickUpTime = ?,
    pickUpEmployee = ?,
    dropOffLocation = ?,
    highTemp = ?,
    lowTemp = ?
    WHERE id = ?`),
  remove: samplesDb.prepare('DELETE FROM samples WHERE id = ?'),
};

router.get('/', (req, res) => {
  res.json(stmts.all.all());
});

router.get('/:id', (req, res, next) => {
  try {
    const samples = stmts.get.get(req.params.id);
    if (!samples) return res.status(404).json({ error: 'Sample not found' });
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
      pickUpTime,
      pickUpEmployee,
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
      pickUpTime,
      pickUpEmployee,
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
      pickUpTime,
      pickUpEmployee,
      dropOffLocation
    });
  } catch (err) { next(err); }
});

// Record a pick up. Temperatures are entered by whoever picks the samples up.
router.put('/:id', (req, res, next) => {
  try {
    const {
      pickUpDate,
      pickUpTime,
      pickUpEmployee,
      dropOffLocation,
      highTemp,
      lowTemp
    } = req.body;

    if (!pickUpDate) {
      return res.status(400).json({ error: 'Pick up date is required' });
    }
    // Number.isFinite is strict: it rejects strings, null and NaN
    if (!Number.isFinite(highTemp) || !Number.isFinite(lowTemp)) {
      return res.status(400).json({ error: 'High and low temperatures must be numbers' });
    }
    if (highTemp < lowTemp) {
      return res.status(400).json({ error: 'High temperature cannot be lower than the low temperature' });
    }

    const sample = stmts.update.run(
      pickUpDate,
      pickUpTime ?? null,
      pickUpEmployee ?? null,
      dropOffLocation ?? null,
      highTemp,
      lowTemp,
      req.params.id
    );
    if (sample.changes === 0) return res.status(404).json({ error: 'Entry not found' });
    res.json({
      id: Number(req.params.id), 
      pickUpDate,
      pickUpTime,
      pickUpEmployee,
      dropOffLocation,
      highTemp,
      lowTemp
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
