import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.query.currentUserId;
    if (!currentUserId) return res.status(400).json({ error: 'Current user ID required' });

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
      .populate('sender', 'username')
      .populate('receiver', 'username')
      .sort({ timestamp: 1 });

    res.json({ messages });
  } catch (err) {
    console.error('Get chat history error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;