const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Timetable = require('../models/Timetable');
const Assignment = require('../models/Assignment');
const Notice = require('../models/Notice');
const Fee = require('../models/Fee');

exports.getMyAttendance = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    const { month, year } = req.query;
    let filter = { studentId: student._id };
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: startDate, $lte: endDate };
    }
    const attendance = await Attendance.find(filter).sort({ date: -1 });
    const totalDays = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const percentage = totalDays > 0 ? ((present + late) / totalDays * 100).toFixed(1) : 0;
    res.json({ attendance, summary: { totalDays, present, absent, late, percentage } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyResults = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    const results = await Result.find({ studentId: student._id }).populate({ path: 'examId', populate: { path: 'classId' } });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyTimetable = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    const timetable = await Timetable.find({ classId: student.classId }).populate('periods.teacherId').sort({ day: 1 });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyAssignments = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    const assignments = await Assignment.find({ classId: student.classId }).populate('teacherId').sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ targetRoles: { $in: ['student', 'all'] } }).sort({ isPinned: -1, createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyFees = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    const fees = await Fee.find({ studentId: student._id }).sort({ dueDate: -1 });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
