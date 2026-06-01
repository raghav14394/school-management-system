const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  marks: { type: Number, required: true },
  grade: { type: String, default: '' },
  remarks: { type: String, default: '' }
}, { timestamps: true });

resultSchema.index({ studentId: 1, examId: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
