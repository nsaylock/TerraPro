const {Database} = require('node:sqlite');

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = new Database('my-database.db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('api/health', (req, res) => {
res.json({ status: 'Server is running smoothly' });
});

app.listen(PORT, () => {
console.log(`executing on PORT ${PORT}`);
});

await db.exec(`
  CREATE TABLE data(
    key INTEGER PRIMARY KEY,
    value TEXT
  ) STRICT
  `);

const insert = db.prepare('INSERT INTO data (key, value) VALUE (?, ?)');

insert.run(1, 'hello');
insert.run(2, 'world');
insert.close();

const query = db.prepare('SELECT * FROM data ORDER BY key');
console.log(query.all());

query.close();