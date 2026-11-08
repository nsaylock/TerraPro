const express = require('express');
const cors = require('cors');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const PORT = 3000;

// Middleware to parse JSON request bodies
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const path = require('path');
const dbPath = path.resolve(__dirname, './db/jobs.db');

// Initialize SQLite database (creates database.db file if it does not exist)
const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    jobName TEXT,
    jobNumber TEXT,
    reportNumber TEXT,
    dateEntry TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT,
    entryHours REAL,
    service TEXT,
    travelType TEXT,
    fromLoc TEXT,
    toLoc TEXT,
    mileage INTEGER,
    travelTime REAL
  )  
`);

// --- API ROUTES ---

// 1. GET all users
app.get('/api/jobs', (req, res) => {
  try {
    const entries = db.prepare('SELECT * FROM jobs').all();
    res.json(entries);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

// 2. Get a single user by ID
app.get('/api/jobs/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM jobs WHERE id = ?');
    const entry = stmt.get(req.params.id);

    if (!entry) return res.status(404).json({message: 'Entry not found'});
    res.json(entry);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

// 3. POST a new user (Create)
app.post('/api/jobs', (req, res) => {
  const {
    jobName, jobNumber, reportNumber, dateEntry, startTime, endTime, entryHours, service,
    travelType, fromLoc, toLoc, mileage, travelTime
  } = req.body;
  if (!dateEntry) {
    return res.status(400).json({message:'Error 938fjaob'});
  }
  try {
    const stmt = db.prepare(`
      INSERT INTO jobs
      (jobName, jobNumber, reportNumber, dateEntry, startTime, endTime, 
      entryHours, service, travelType, fromLoc, toLoc, mileage, travelTime) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const result = stmt.run(jobName, jobNumber, reportNumber, dateEntry, startTime, endTime, 
    entryHours, service,
    travelType, fromLoc, toLoc, mileage, travelTime);

    res.status(201).json({
      id: result.lastInsertRowid,
      jobName, jobNumber, reportNumber, dateEntry, startTime, endTime, 
      entryHours, service,
      travelType, fromLoc, toLoc, mileage, travelTime
    });
  } catch (error) {
    res.status(500).json({ error: error.message + 'err:code 000a' });
  }
});

// 4. PUT PUT PUT PUT (Update)
app.put('/api/jobs', (req, res)=>{
  const {jobName, jobNumber, reportNumber, dateEntry, startTime, endTime, 
    entryHours, service,
    travelType, fromLoc, toLoc, mileage, travelTime} = req.body;
  if (!jobName || !dateEntry || !startTime || !service ||
    !fromLoc || !toLoc || !mileage || !travelTime) {
    return res.status(400).json({message:'All fields are required for submission'});
  }

  try {
    const stmt = db.prepare(`
      UPDATE jobs 
      SET jobName = ?,
      jobNumber = ?,
      reportNumber = ?, 
      dateEntry = ?,
      startTime = ?, 
      endTime = ?,
      entryHours = ?, 
      service = ?,
      travelType = ?,
      fromLoc = ?,
      toLoc = ?,
      mileage = ?,
      travelTime = ?
      WHERE id = ?`);
    const result = stmt.run(jobName, jobNumber, reportNumber, dateEntry, startTime, endTime, 
      entryHours, service,
    travelType, fromLoc, toLoc, mileage, travelTime, req.params.id);
  
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Entry not found'});
    }
    res.json({ id: req.params.id, jobName, jobNumber, reportNumber, dateEntry, startTime, endTime, entryHours, service,
    travelType, fromLoc, toLoc, mileage, travelTime });
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

// 5. DELETE a user
app.delete('/api/jobs/:id', (req, res)=> {
  try {
    const stmt = db.prepare('DELETE FROM jobs WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({message: 'Entry not found'});
    }
    res.json({message: 'Entry deleted'});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});