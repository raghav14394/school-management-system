const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Fee = require('../models/Fee');
const Notice = require('../models/Notice');
const User = require('../models/User');

exports.getChildAttendance = async (req, res) => {
  try {
    const parent = req.user;
    const student = await Student.findOne({ parentId: parent._id }).populate('userId classId');
    if (!student) return res.status(404).json({ message: 'No child linked to this account' });
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
    const percentage = totalDays > 0 ? ((present / totalDays) * 100).toFixed(1) : 0;
    res.json({ student, attendance, summary: { totalDays, present, absent, percentage } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getChildResults = async (req, res) => {
  try {
    const student = await Student.findOne({ parentId: req.user._id }).populate('userId classId');
    if (!student) return res.status(404).json({ message: 'No child linked to this account' });
    const results = await Result.find({ studentId: student._id }).populate({ path: 'examId', populate: { path: 'classId' } });
    res.json({ student, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getChildFees = async (req, res) => {
  try {
    const student = await Student.findOne({ parentId: req.user._id }).populate('userId classId');
    if (!student) return res.status(404).json({ message: 'No child linked to this account' });
    const fees = await Fee.find({ studentId: student._id }).sort({ dueDate: -1 });
    const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);
    const paidFees = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
    const unpaidFees = totalFees - paidFees;
    res.json({ student, fees, summary: { totalFees, paidFees, unpaidFees } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ targetRoles: { $in: ['parent', 'all'] } }).sort({ isPinned: -1, createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getChildInfo = async (req, res) => {
  try {
    const student = await Student.findOne({ parentId: req.user._id }).populate('userId classId');
    if (!student) return res.status(404).json({ message: 'No child linked to this account' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
