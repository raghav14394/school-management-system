const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },        // e.g. "Class 10"
  section: { type: String, required: true },      // e.g. "A", "B"
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },
  academicYear: { type: String, default: '2024-2025' }
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
