const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subject: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  dueDate: { type: Date, required: true },
  totalMarks: { type: Number, default: 100 },
  attachments: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
