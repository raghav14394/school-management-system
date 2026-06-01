const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Class = require('../models/Class');
const Assignment = require('../models/Assignment');
const Notice = require('../models/Notice');

// Attendance
exports.markAttendance = async (req, res) => {
  try {
    const { records } = req.body; // [{ studentId, status, remarks }]
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

    const attendanceRecords = records.map(r => ({
      ...r,
      date: req.body.date || new Date(),
      markedBy: req.user._id
    }));

    const results = [];
    for (const record of attendanceRecords) {
      const existing = await Attendance.findOne({ studentId: record.studentId, date: { $gte: new Date(record.date).setHours(0, 0, 0, 0), $lt: new Date(record.date).setHours(23, 59, 59, 999) } });
      if (existing) {
        existing.status = record.status;
        existing.remarks = record.remarks || '';
        existing.markedBy = req.user._id;
        await existing.save();
        results.push(existing);
      } else {
        const att = await Attendance.create(record);
        results.push(att);
      }
    }
    res.status(201).json({ message: 'Attendance marked successfully', results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClassAttendance = async (req, res) => {
  try {
    const { classId, date } = req.query;
    const students = await Student.find({ classId }).populate('userId', 'name');
    const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999);
    const attendance = await Attendance.find({ studentId: { $in: students.map(s => s._id) }, date: { $gte: startOfDay, $lt: endOfDay } });
    res.json({ students, attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMonthlyAttendance = async (req, res) => {
  try {
    const { classId, month, year } = req.query;
    const students = await Student.find({ classId }).populate('userId', 'name');
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const attendance = await Attendance.find({ studentId: { $in: students.map(s => s._id) }, date: { $gte: startDate, $lte: endDate } });
    const summary = students.map(s => {
      const studentAtt = attendance.filter(a => a.studentId.toString() === s._id.toString());
      const present = studentAtt.filter(a => a.status === 'present').length;
      const absent = studentAtt.filter(a => a.status === 'absent').length;
      const late = studentAtt.filter(a => a.status === 'late').length;
      return { student: s, present, absent, late, total: studentAtt.length };
    });
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Exams & Results
exports.createExam = async (req, res) => {
  try {
    const exam = await Exam.create(req.body);
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClassExams = async (req, res) => {
  try {
    const exams = await Exam.find({ classId: req.params.classId }).sort({ date: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadResults = async (req, res) => {
  try {
    const { examId, results } = req.body; // [{ studentId, marks, grade, remarks }]
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const createdResults = [];
    for (const r of results) {
      const existing = await Result.findOne({ studentId: r.studentId, examId });
      if (existing) {
        existing.marks = r.marks;
        existing.grade = r.grade || '';
        existing.remarks = r.remarks || '';
        await existing.save();
        createdResults.push(existing);
      } else {
        const result = await Result.create({ ...r, examId });
        createdResults.push(result);
      }
    }
    res.status(201).json({ message: 'Results uploaded successfully', results: createdResults });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExamResults = async (req, res) => {
  try {
    const results = await Result.find({ examId: req.params.examId }).populate('studentId', 'rollNumber').populate({ path: 'studentId', populate: { path: 'userId', select: 'name' } });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assignments
exports.createAssignment = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });
    const assignment = await Assignment.create({ ...req.body, teacherId: teacher._id });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClassAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ classId: req.params.classId }).populate('teacherId').sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Teacher's assigned classes
exports.getTeacherClasses = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });
    const classes = await Class.find({ teacherId: teacher._id });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Teacher notices
exports.createNotice = async (req, res) => {
  try {
    const notice = await Notice.create({ ...req.body, postedBy: req.user._id });
    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
