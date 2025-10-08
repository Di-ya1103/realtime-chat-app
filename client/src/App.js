import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import './styles.css';

const socket = io('http://localhost:5000');

function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]); // User objects
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Client connected:', socket.id);
    });

    socket.on('update:users', (users) => {
      console.log('Received update:users:', users); // Debug
      setOnlineUsers(users);
    });

    socket.on('receive:message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('connect');
      socket.off('update:users');
      socket.off('receive:message');
      socket.disconnect();
    };
  }, []);

  const handleLogin = async () => {
    if (username.trim()) {
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        });
        const data = await response.json();
        console.log('Login data:', data);
        if (data.user) {
          localStorage.setItem('userId', data.user._id);
          localStorage.setItem('username', data.user.username);
          socket.emit('user:connect', data.user);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Login error:', error);
      }
    }
  };

  const sendMessage = (text) => {
    if (!text.trim() || !currentChat) return;
    const msg = {
      sender: localStorage.getItem('userId'),
      receiver: currentChat._id,
      text,
      timestamp: new Date(),
    };
    socket.emit('send:message', msg);
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>Login</h1>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <ChatList
        onlineUsers={onlineUsers}
        currentChat={currentChat}
        setCurrentChat={setCurrentChat}
      />
      <ChatWindow
        currentChat={currentChat}
        messages={messages}
        sendMessage={sendMessage}
        username={localStorage.getItem('username')}
      />
    </div>
  );
}

export default App;