import React, { useRef, useEffect } from 'react';

function ChatWindow({ currentChat, messages, sendMessage, username }) {
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentChat) {
    return (
      <div className="chat-window">
        <div className="no-chat">Select a chat to start messaging</div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">Chatting with {currentChat.username}</div>
      <div className="chat-messages">
        {messages
          .filter(
            (msg) =>
              (msg.sender._id === currentChat._id || msg.receiver._id === currentChat._id) &&
              (msg.sender._id === localStorage.getItem('userId') || msg.receiver._id === localStorage.getItem('userId'))
          )
          .map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender._id === localStorage.getItem('userId') ? 'sent' : 'received'}`}
            >
              <p>{msg.text}</p>
              <span className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputRef.current.value)}
        />
        <button onClick={() => sendMessage(inputRef.current.value)}>Send</button>
      </div>
    </div>
  );
}

export default ChatWindow;