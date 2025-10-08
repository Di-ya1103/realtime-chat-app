import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import messageRoutes from './routes/messages.js';
import User from './models/User.js';
import Message from './models/Message.js';

// Import dotenv for environment variables
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000' },
});

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('New socket connection:', socket.id);

  socket.on('user:connect', async (user) => {
    if (!user?._id) {
      console.log('Invalid user ID in user:connect:', user);
      return;
    }
    try {
      onlineUsers.set(user._id, socket.id);
      await User.findByIdAndUpdate(user._id, { online: true });
      const onlineUserObjects = await Promise.all(
        Array.from(onlineUsers.keys()).map(async (id) => {
          const u = await User.findById(id).select('username');
          return { _id: id, username: u.username };
        })
      );
      io.emit('update:users', onlineUserObjects);
      console.log('User connected:', user._id, 'Online users:', onlineUserObjects);
    } catch (err) {
      console.error('Error updating user online status:', err.message || err.stack);
    }
  });

  socket.on('send:message', async (msg) => {
    console.log('Received message event with data:', msg);
    try {
      if (!msg.sender || !msg.receiver || !msg.text) {
        console.log('Invalid message data:', msg);
        return;
      }
      console.log('Attempting to create message with:', {
        sender: msg.sender,
        receiver: msg.receiver,
        text: msg.text,
      });
      const newMessage = await Message.create({
        sender: mongoose.Types.ObjectId.createFromHexString(msg.sender),
        receiver: mongoose.Types.ObjectId.createFromHexString(msg.receiver),
        text: msg.text,
        timestamp: msg.timestamp || new Date(),
      });

      const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'username')
        .populate('receiver', 'username');

      const receiverSocket = onlineUsers.get(msg.receiver);
      if (receiverSocket) {
        io.to(receiverSocket).emit('receive:message', populatedMessage);
        console.log('Message sent to receiver:', receiverSocket);
      }
      io.to(socket.id).emit('receive:message', populatedMessage);
      console.log('Message sent to sender, data:', populatedMessage);
    } catch (err) {
      console.error('Error sending message:', err.message || err.stack);
    }
  });

  socket.on('disconnect', async () => {
    console.log('Socket disconnecting:', socket.id);
    for (const [userId, sId] of onlineUsers.entries()) {
      if (sId === socket.id) {
        onlineUsers.delete(userId);
        try {
          await User.findByIdAndUpdate(userId, { online: false });
          const onlineUserObjects = await Promise.all(
            Array.from(onlineUsers.keys()).map(async (id) => {
              const u = await User.findById(id).select('username');
              return { _id: id, username: u.username };
            })
          );
          io.emit('update:users', onlineUserObjects);
          console.log('User disconnected:', userId, 'Online users:', onlineUserObjects);
        } catch (err) {
          console.error('Error updating user offline status:', err.message || err.stack);
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});