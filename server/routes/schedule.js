/* schedule 
id,
date,
projectName,
projectNumber,
reportNumber,
role,
task,
location,
description,
assignedEmployee,
sets,
setSize,
timeNeeded
*/

const express = require('express');
const { schedule } = require('../config/databases');
const router = express.Router();

const stmts = {
  all: schedule.prepare('SELECT * FROM schedule ORDER BY date'),
  get: schedule.prepare('SELECT * FROM schedule WHERE id = ?'),
  queryByDate: schedule.prepare(`
    SELECT * FROM schedule
    WHERE data >= ? AND date <= ?
    ORDER BY date ASC`),
  insert: schedule.prepare(`INSERT INTO schedule (
    date,
    projectName,
    projectNumber,
    reportNumber,
    role,
    task,
    location,
    description,
    assignedEmployee,
    sampleType,
    sets,
    setSize,
    timeNeeded
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
  update: schedule.prepare(`UPDATE schedule SET
    date = ?,
    projectName = ?,
    projectNumber = ?,
    reportNumber = ?,
    role = ?,
    task = ?,
    location = ?,
    description = ?,
    assignedEmployee = ?,
    sampleType = ?,
    sets = ?,
    setSize = ?,
    timeNeeded = ?
    WHERE id = ?
    `),
  remove: schedule.prepare('DELETE FROM schedule WHERE id = ?')
}

// Get all
router.get('/', (req, res, next) => {
  try {
    res.json(stmts.all.all());
  } catch (err) { next(err); }
});

router.get('/period', (req, res) => {
  const { period_start, period_end } = req.query;
  if (!period_start || !period_end) {
    return res.status(400).json({error: 'Period start and end are required'});
  }

  try {
    res.json(stmts.queryByDate.all(period_start, period_end));
  } catch (err) {
    console.error('Schedule Database query failed', err);
    res.status(500).json({error: 'Internal server error'});
  }

});

router.get('/:id', (req, res, next) => {
  try {
    const schedule = stmts.get.get(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Entry not found' });
    res.json(schedule);
  } catch (err) { next(err); }
});

router.post('/', (req,res,next) => {
  try {
    const {
      date,
      projectName,
      projectNumber,
      reportNumber,
      role,
      task,
      location,
      description,
      assignedEmployee,
      sampleType,
      sets,
      setSize,
      timeNeeded
    } = req.body;
    if (!date || !projectNumber) {
      return res.status(400).json({error: 'Data and Project Number Required'});
    }
    const entry = stmts.insert.run(
      date,
      projectName,
      projectNumber,
      reportNumber,
      role,
      task,
      location,
      description,
      assignedEmployee,
      sampleType,
      sets,
      setSize,
      timeNeeded
    );
    res.status(201).json({id: entry.lastInsertRowid,
      date,
      projectName,
      projectNumber,
      reportNumber,
      role,
      task,
      location,
      description,
      assignedEmployee,
      sampleType,
      sets,
      setSize,
      timeNeeded
    });
  } catch (err){ next(err) }
});

router.put('/:id', (req,res,next) => {
  try {
    const {
      date,
      projectName,
      projectNumber,
      reportNumber,
      role,
      task,
      location,
      description,
      assignedEmployee,
      sampleType,
      sets,
      setSize,
      timeNeeded
    } = req.body;
    if (!date || !projectNumber) {
      return res.status(400).json({error: 'Data and Project Number Required'});
    }
    const entry = stmts.update.run(
      date,
      projectName,
      projectNumber,
      reportNumber,
      role,
      task,
      location,
      description,
      assignedEmployee,
      sampleType,
      sets,
      setSize,
      timeNeeded
    );
    if (entry.changes === 0) return res.status(404).json({error: 'Entry not found 21eso82'});

    res.json({
      id: Number(req.params.id),
      date,
      projectName,
      projectNumber,
      reportNumber,
      role,
      task,
      location,
      description,
      assignedEmployee,
      sampleType,
      sets,
      setSize,
      timeNeeded
    });
  } catch (err){ next(err) }
});

router.delete('/:id', (req, res, next) => {
  try {
    const entry = stmts.remove.run(req.params.id);
    if (entry.changes === 0) return res.status(404).json({ error: 'Entry not found' });
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;