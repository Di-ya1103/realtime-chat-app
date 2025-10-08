import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();
const User = mongoose.model('User', new mongoose.Schema({ username: String, _id: String }));

router.post('/login', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username is required' });

  let user = await User.findOne({ username });
  if (!user) {
    user = new User({ username, _id: mongoose.Types.ObjectId().toString() });
    await user.save();
  }

  res.json({ user: { _id: user._id, username: user.username } });
});

router.get('/user/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { _id: user._id, username: user.username } });
});

export default router; // Ensure this line exists and is not commented out