const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/student', require('./routes/student'));
app.use('/api/parent', require('./routes/parent'));
app.use('/api/fees', require('./routes/fee'));
app.use('/api/notices', require('./routes/notice'));
app.use('/api/messages', require('./routes/message'));
app.use('/api/timetable', require('./routes/timetable'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'School Management API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
