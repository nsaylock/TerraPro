const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
// better-sqlite3 creates the .db file but not its folder, so make sure it exists.
fs.mkdirSync(dataDir, { recursive: true });

function createDB(name, file) {
  const dbPath = path.join(dataDir, file);
  const db = new Database(dbPath);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  db.pragma('synchronous = NORMAL');

  return db;
}

// CREATE TABLE IF NOT EXISTS never changes a table that already exists, so
// columns added later need a migration. This adds a column only if it's missing,
// which makes it safe to run on every startup.
function addColumnIfMissing(db, table, column, type) {
  const exists = db
    .prepare(`PRAGMA table_info(${table})`)
    .all()
    .some((col) => col.name === column);
  if (!exists) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
}

const timesheet = createDB('timesheet', 'timesheet.db');
const samples = createDB('samples', 'samples.db');
const schedule = createDB('schedule', 'schedule.db');

// Initialize schemas
timesheet.exec(`
  CREATE TABLE IF NOT EXISTS timesheet (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scheduleId INTEGER,
    date TEXT NOT NULL,
    projectName TEXT,
    projectNumber TEXT,
    reportNumber TEXT,
    role TEXT,
    task TEXT,
    startTime TEXT NOT NULL,
    endTime TEXT,
    onSiteHours REAL,
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
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

samples.exec(`
  CREATE TABLE IF NOT EXISTS samples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectName TEXT NOT NULL,
    projectNumber TEXT NOT NULL,
    reportNumber TEXT NOT NULL,
    castDate TEXT NOT NULL,
    sampleType TEXT NOT NULL,
    sets INTEGER,
    setSize INTEGER,
    employee TEXT,
    storageLocation TEXT,
    pickUpDate TEXT,
    pickUpTime TEXT,
    pickUpEmployee TEXT,
    dropOffLocation TEXT,
    highTemp REAL,
    lowTemp REAL
  )
`);

schedule.exec(`
  CREATE TABLE IF NOT EXISTS schedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assignedEmployee INTEGER,
  date TEXT NOT NULL,
  projectName TEXT,
  projectNumber TEXT,
  reportNumber TEXT,
  role TEXT,
  task TEXT,
  location TEXT,
  description TEXT,
  cubicYards INTEGER,
  sampleType TEXT,
  sets INTEGER,
  setSize INTEGER,
  timeNeeded TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

// Migrations for databases created before these columns existed.
// Existing rows get NULL, which the UI shows as "—".
// addColumnIfMissing(samples, 'samples', 'highTemp', 'REAL');
// addColumnIfMissing(samples, 'samples', 'lowTemp', 'REAL');

module.exports = { timesheet, samples, schedule };
