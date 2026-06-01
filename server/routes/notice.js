const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const noticeCtrl = require('../controllers/noticeController');

router.get('/', auth, noticeCtrl.getAllNotices);
router.post('/', auth, noticeCtrl.createNotice);
router.put('/:id', auth, noticeCtrl.updateNotice);
router.delete('/:id', auth, noticeCtrl.deleteNotice);

module.exports = router;
