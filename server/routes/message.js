const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const messageCtrl = require('../controllers/messageController');

router.get('/:receiverId', auth, messageCtrl.getMessages);
router.post('/', auth, messageCtrl.sendMessage);
router.get('/unread/count', auth, messageCtrl.getUnreadCount);

module.exports = router;
