const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: { type: String, required: true },        // e.g. "Mid Term", "Final"
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subject: { type: String, required: true },
  date: { type: Date, required: true },
  totalMarks: { type: Number, default: 100 },
  passMarks: { type: Number, default: 35 }
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
