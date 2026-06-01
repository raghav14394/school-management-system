const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const studentCtrl = require('../controllers/studentController');

router.get('/attendance', auth, authorize('student'), studentCtrl.getMyAttendance);
router.get('/results', auth, authorize('student'), studentCtrl.getMyResults);
router.get('/timetable', auth, authorize('student'), studentCtrl.getMyTimetable);
router.get('/assignments', auth, authorize('student'), studentCtrl.getMyAssignments);
router.get('/notices', auth, authorize('student'), studentCtrl.getNotices);
router.get('/fees', auth, authorize('student'), studentCtrl.getMyFees);

module.exports = router;
