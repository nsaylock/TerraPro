const express = require('express');
const path = require('path');
const fs = require('fs');

const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const timesheetRoutes = require('./routes/timesheet');
const travelRoutes = require('./routes/travel');

const app = express();

// Ensure data directory exists
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });

// Middleware
app.use(express.json());
app.use(logger);

// Routes


app.use('/api/timesheet', timesheetRoutes);
app.use('/api/travel', travelRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 404 + error handling
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));