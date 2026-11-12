const Database = require('better-sqlite3');
const path = require('path');

function createDB(name, file) {
  const dbPath = path.join(__dirname, '..', 'data', file);
  const db = new Database(dbPath);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  db.pragma('synchronous = NORMAL');

return db;
}

const timesheetDb = createDB('timesheet', 'timesheet.db');

// Initialize schemas
timesheetDb.exec(`
  CREATE TABLE IF NOT EXISTS timesheet (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    jobName TEXT,
    jobNumber TEXT,
    reportNumber TEXT,
    date TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT,
    onSiteHours REAL,
    service TEXT,
    travelType TEXT,
    toSiteStart TEXT,
    toSiteEnd TEXT,
    fromSiteStart TEXT,
    fromSiteEnd TEXT,
    milesToSite INTEGER,
    milesFromSite INTEGER,
    totalMiles INTEGER,
    timeToSite REAL,
    timeFromSite REAL,
    totalTravelTime REAL,
    sets INTEGER,
    samples INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = { timesheetDb };