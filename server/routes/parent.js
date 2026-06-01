const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const parentCtrl = require('../controllers/parentController');

router.get('/child', auth, authorize('parent'), parentCtrl.getChildInfo);
router.get('/attendance', auth, authorize('parent'), parentCtrl.getChildAttendance);
router.get('/results', auth, authorize('parent'), parentCtrl.getChildResults);
router.get('/fees', auth, authorize('parent'), parentCtrl.getChildFees);
router.get('/notices', auth, authorize('parent'), parentCtrl.getNotices);

module.exports = router;
