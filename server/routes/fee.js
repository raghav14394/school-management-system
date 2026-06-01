const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const feeCtrl = require('../controllers/feeController');

router.post('/', auth, authorize('admin'), feeCtrl.createFee);
router.get('/student/:studentId', auth, feeCtrl.getStudentFees);
router.put('/:id', auth, authorize('admin'), feeCtrl.updateFee);
router.put('/:id/pay', auth, authorize('admin'), feeCtrl.markFeePaid);
router.get('/report', auth, authorize('admin'), feeCtrl.getFeeReport);

module.exports = router;
