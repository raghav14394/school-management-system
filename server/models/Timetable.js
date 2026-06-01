const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], required: true },
  periods: [{
    subject: { type: String, required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String, default: '' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
