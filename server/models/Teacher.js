const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  qualification: { type: String, default: '' },
  experience: { type: Number, default: 0 },
  joinDate: { type: Date, default: Date.now },
  salary: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
