const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId },
        { senderId: receiverId, receiverId: req.user._id }
      ]
    }).sort({ createdAt: 1 });
    // Mark unread messages as read
    await Message.updateMany({ senderId: receiverId, receiverId: req.user._id, isRead: false }, { isRead: true });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const msg = await Message.create({ senderId: req.user._id, receiverId, message });
    res.status(201).json(msg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiverId: req.user._id, isRead: false });
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
