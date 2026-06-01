const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  feeType: { type: String, enum: ['tuition', 'transport', 'exam', 'library', 'other'], default: 'tuition' },
  status: { type: String, enum: ['paid', 'unpaid', 'partial'], default: 'unpaid' },
  paidAmount: { type: Number, default: 0 },
  dueDate: { type: Date, required: true },
  paidDate: { type: Date },
  month: { type: String, required: true },  // e.g. "2024-01"
  academicYear: { type: String, default: '2024-2025' },
  receiptNumber: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);
