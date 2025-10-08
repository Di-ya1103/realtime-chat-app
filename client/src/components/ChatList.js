import React from 'react';

function ChatList({ onlineUsers, currentChat, setCurrentChat }) {
  const currentUserId = localStorage.getItem('userId');

  return (
    <div className="chat-list">
      <h2>Chats</h2>
      {onlineUsers.length > 0 ? (
        onlineUsers
          .filter((user) => user._id !== currentUserId)
          .map((user) => (
            <div
              key={user._id}
              onClick={() => setCurrentChat(user)}
              className={currentChat && currentChat._id === user._id ? 'active' : ''}
            >
              <span>{user.username}</span>
              <span> (Online)</span>
            </div>
          ))
      ) : (
        <p>No users online</p>
      )}
    </div>
  );
}

export default ChatList;