const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const teacherCtrl = require('../controllers/teacherController');

router.post('/attendance', auth, authorize('teacher'), teacherCtrl.markAttendance);
router.get('/attendance', auth, authorize('teacher'), teacherCtrl.getClassAttendance);
router.get('/attendance/monthly', auth, authorize('teacher', 'admin'), teacherCtrl.getMonthlyAttendance);
router.post('/exams', auth, authorize('teacher', 'admin'), teacherCtrl.createExam);
router.get('/exams/:classId', auth, authorize('teacher', 'admin'), teacherCtrl.getClassExams);
router.post('/results', auth, authorize('teacher', 'admin'), teacherCtrl.uploadResults);
router.get('/results/:examId', auth, authorize('teacher', 'admin'), teacherCtrl.getExamResults);
router.post('/assignments', auth, authorize('teacher'), teacherCtrl.createAssignment);
router.get('/assignments/:classId', auth, authorize('teacher', 'admin', 'student'), teacherCtrl.getClassAssignments);
router.delete('/assignments/:id', auth, authorize('teacher'), teacherCtrl.deleteAssignment);
router.get('/classes', auth, authorize('teacher'), teacherCtrl.getTeacherClasses);
router.post('/notices', auth, authorize('teacher', 'admin'), teacherCtrl.createNotice);

module.exports = router;
