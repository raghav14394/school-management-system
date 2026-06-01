const Fee = require('../models/Fee');
const Student = require('../models/Student');

exports.createFee = async (req, res) => {
  try {
    const fee = await Fee.create(req.body);
    res.status(201).json(fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentFees = async (req, res) => {
  try {
    const fees = await Fee.find({ studentId: req.params.studentId }).sort({ dueDate: -1 });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!fee) return res.status(404).json({ message: 'Fee record not found' });
    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markFeePaid = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, { status: 'paid', paidDate: new Date(), paidAmount: req.body.paidAmount || req.body.amount }, { new: true });
    if (!fee) return res.status(404).json({ message: 'Fee record not found' });
    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFeeReport = async (req, res) => {
  try {
    const { classId, status, month } = req.query;
    let studentFilter = {};
    if (classId) studentFilter.classId = classId;
    const students = await Student.find(studentFilter)
      .populate('userId', 'name email phone')
      .populate('classId', 'name section')
      .populate('parentId', 'name phone');
    const studentIds = students.map(s => s._id);
    let feeFilter = { studentId: { $in: studentIds } };
    if (status) feeFilter.status = status;
    if (month) feeFilter.month = month;
    const fees = await Fee.find(feeFilter).sort({ month: 1, dueDate: 1 });

    // Build student-centric summary
    const studentMap = {};
    students.forEach(s => {
      studentMap[s._id.toString()] = {
        studentId: s._id,
        studentName: s.userId?.name || 'N/A',
        className: s.classId ? `${s.classId.name}-${s.classId.section}` : 'N/A',
        parentName: s.parentId?.name || 'N/A',
        parentPhone: s.parentId?.phone || '',
        totalFee: 0,
        totalPaid: 0,
        totalPending: 0,
        status: 'paid',
        fees: []
      };
    });

    fees.forEach(f => {
      const sid = f.studentId.toString();
      if (studentMap[sid]) {
        studentMap[sid].fees.push(f);
        studentMap[sid].totalFee += f.amount;
        if (f.status === 'paid') {
          studentMap[sid].totalPaid += f.paidAmount || f.amount;
        } else if (f.status === 'partial') {
          studentMap[sid].totalPaid += f.paidAmount || 0;
          studentMap[sid].totalPending += f.amount - (f.paidAmount || 0);
        } else {
          studentMap[sid].totalPending += f.amount;
        }
      }
    });

    // Determine overall status per student
    Object.values(studentMap).forEach(s => {
      if (s.totalPending === 0 && s.totalPaid > 0) s.status = 'paid';
      else if (s.totalPending > 0 && s.totalPaid > 0) s.status = 'partial';
      else if (s.totalPending > 0 && s.totalPaid === 0) s.status = 'unpaid';
      else s.status = 'unpaid';
    });

    // Apply status filter to student list
    let studentSummaries = Object.values(studentMap);
    if (status) {
      studentSummaries = studentSummaries.filter(s => s.status === status);
    }

    const totalCollected = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + (f.paidAmount || f.amount), 0);
    const totalPending = fees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + f.amount - (f.paidAmount || 0), 0);

    res.json({
      studentSummaries,
      summary: {
        totalCollected,
        totalPending,
        totalStudents: studentSummaries.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
