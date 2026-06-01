const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalClasses = await Class.countDocuments();
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
    res.json({ totalStudents, totalTeachers, totalClasses, totalUsers, usersByRole });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User Management
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    const total = await User.countDocuments(filter);
    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    let profile = { ...user.toObject() };
    if (user.role === 'student') {
      profile.studentProfile = await Student.findOne({ userId: user._id }).populate('classId');
    } else if (user.role === 'teacher') {
      profile.teacherProfile = await Teacher.findOne({ userId: user._id });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address, subject, qualification, classId, rollNumber, parentId, dateOfBirth, gender } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });
    const user = await User.create({ name, email, password, role, phone, address });
    if (role === 'student') {
      await Student.create({ userId: user._id, classId, rollNumber, parentId, dateOfBirth, gender });
    } else if (role === 'teacher') {
      await Teacher.create({ userId: user._id, subject, qualification });
    }
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, address, isActive, subject, qualification, classId, rollNumber } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, email, phone, address, isActive }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'student') {
      await Student.findOneAndUpdate({ userId: user._id }, { classId, rollNumber }, { new: true });
    } else if (user.role === 'teacher') {
      await Teacher.findOneAndUpdate({ userId: user._id }, { subject, qualification }, { new: true });
    }
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'student') await Student.deleteOne({ userId: user._id });
    if (user.role === 'teacher') await Teacher.deleteOne({ userId: user._id });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Class Management
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate('teacherId');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createClass = async (req, res) => {
  try {
    const cls = await Class.create(req.body);
    res.status(201).json(cls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json(cls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const cls = await Class.findByIdAndDelete(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClassStudents = async (req, res) => {
  try {
    const students = await Student.find({ classId: req.params.id }).populate('userId parentId', 'name email phone');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign teacher to class
exports.assignTeacher = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const cls = await Class.findByIdAndUpdate(req.params.id, { teacherId }, { new: true }).populate('teacherId');
    res.json(cls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
