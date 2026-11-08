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
const travelDb = createDB('travel', 'travel.db');

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
    entryHours REAL,
    service TEXT,
    sets INTEGER,
    cylinders INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

travelDb.exec(`
  CREATE TABLE IF NOT EXISTS travel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timesheet_id INTEGER NOT NULL,
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
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (timesheet_id) REFERENCES timesheet(id)
  )
`);

module.exports = { usersDb, ordersDb };