import React, { useEffect, useState } from "react";

function MessageList({ userId1, userId2 }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3000/messages/${userId1}/${userId2}`)
      .then((response) => response.json())
      .then((data) => setMessages(data))
      .catch((error) => console.error("Error fetching messages:", error));
  }, [userId1, userId2]);

  return (
    <div className="message-container">
      {messages.length > 0 ? messages.map((message) => (
        <div key={message._id} className={message.senderId === userId1 ? "sent message" : "received message"}>
          <p>{message.content}</p>
          <small>{new Date(message.timestamp).toLocaleString()}</small>
        </div>
      )) : ""}
    </div>
  );
}

export default MessageList;