const express = require('express');
const cors = require('cors');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const PORT = 3000;

// Middleware to parse JSON request bodies
app.use(cors());
app.use(express.json());

const path = require('path');
const dbPath = path.resolve(__dirname, '../db/database.db');

// Initialize SQLite database (creates database.db file if it does not exist)
const db = new DatabaseSync(dbPath);

// Create a sample 'users' table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
  )  
`);

// --- API ROUTES ---

// 1. GET all users
app.get('/api/users', (req, res) => {
  try {
    const users = db.prepare('SELECT * FROM users').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

// 2. Get a single user by ID
app.get('/api/users/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(req.params.id);

    if (!user) return res.status(404).json({message: 'User not found'});
    res.json(user);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

// 3. POST a new user (Create)
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({message:'Name and email are required'});
  }
  try {
    const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
    const result = stmt.run(name, email);

    res.status(201).json({
      id: result.lastInsertRowid,
      name,
      email
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ message: 'email already exists'});
    }
    res.status(500).json({ error: error.message });
  }
});

// 4. PUT update a user (Update)
app.put('/api/users', (req, res)=>{
  const {name, email} = req.body;
  if(!name || !email) {
    return res.status(400).json({ message: 'Name and Email are required'});
  }

  try {
    const stmt = db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?');
    const result = stmt.run(name, email, req.params.id);
  
    if (result.changes === 0) {
      return res.status(404).json({ message: 'User not found'});
    }
    res.json({ id: req.params.id, name, email });
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

// 5. DELETE a user
app.delete('/api/users/:id', (req, res)=> {
  try {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({message: 'User not found'});
    }
    res.json({message: 'User deleted'});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});