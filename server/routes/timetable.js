const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const timetableCtrl = require('../controllers/timetableController');

router.get('/:classId', auth, timetableCtrl.getClassTimetable);
router.post('/', auth, authorize('admin', 'teacher'), timetableCtrl.createTimetable);
router.put('/:id', auth, authorize('admin', 'teacher'), timetableCtrl.updateTimetable);
router.delete('/:id', auth, authorize('admin'), timetableCtrl.deleteTimetable);

module.exports = router;
