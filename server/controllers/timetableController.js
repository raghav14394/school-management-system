const Timetable = require('../models/Timetable');

exports.getClassTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.find({ classId: req.params.classId }).populate('periods.teacherId').sort({ day: 1 });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTimetable = async (req, res) => {
  try {
    const { classId, day, periods } = req.body;
    const existing = await Timetable.findOne({ classId, day });
    if (existing) {
      existing.periods = periods;
      await existing.save();
      res.json(existing);
    } else {
      const timetable = await Timetable.create(req.body);
      res.status(201).json(timetable);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!timetable) return res.status(404).json({ message: 'Timetable not found' });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTimetable = async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: 'Timetable deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
