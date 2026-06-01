const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  category: { type: String, enum: ['general', 'exam', 'holiday', 'event', 'urgent'], default: 'general' },
  targetRoles: [{ type: String, enum: ['admin', 'teacher', 'student', 'parent'] }],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPinned: { type: Boolean, default: false },
  attachments: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
