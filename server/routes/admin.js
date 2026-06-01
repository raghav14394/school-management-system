const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const adminCtrl = require('../controllers/adminController');

router.get('/dashboard', auth, authorize('admin'), adminCtrl.getDashboardStats);
router.get('/users', auth, authorize('admin'), adminCtrl.getAllUsers);
router.get('/users/:id', auth, authorize('admin'), adminCtrl.getUserById);
router.post('/users', auth, authorize('admin'), adminCtrl.createUser);
router.put('/users/:id', auth, authorize('admin'), adminCtrl.updateUser);
router.delete('/users/:id', auth, authorize('admin'), adminCtrl.deleteUser);
router.get('/classes', auth, authorize('admin'), adminCtrl.getAllClasses);
router.post('/classes', auth, authorize('admin'), adminCtrl.createClass);
router.put('/classes/:id', auth, authorize('admin'), adminCtrl.updateClass);
router.delete('/classes/:id', auth, authorize('admin'), adminCtrl.deleteClass);
router.get('/classes/:id/students', auth, authorize('admin', 'teacher'), adminCtrl.getClassStudents);
router.put('/classes/:id/assign-teacher', auth, authorize('admin'), adminCtrl.assignTeacher);

module.exports = router;
