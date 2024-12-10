import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import "../../css/messagesPage.css";
import ConversationsTab from "./ConversationsTab";
import { useAuth } from "../../contexts/authContext";

function MessagesPage() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const receiverId = query.get("receiverId");
  const receiverName = query.get("receiverName"); // Get the receiverName from the URL query parameters
  const [currentUserId] = useState(currentUser.uid);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("https://cheer-client-app-backend.onrender.com");
    }

    const socket = socketRef.current;

    if (receiverId) {
      fetch(`https://cheer-client-app-backend.onrender.com/messages/${currentUserId}/${receiverId}`)
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setMessages(data);
          } else {
            console.error("Fetched data is not an array:", data);
            setMessages([]);
          }
        })
        .catch((error) => console.error("Error fetching messages:", error));

      const handleReceiveMessage = (newMessage) => {
        if (
          (newMessage.senderId === currentUserId &&
            newMessage.receiverId === receiverId) ||
          (newMessage.senderId === receiverId &&
            newMessage.receiverId === currentUserId)
        ) {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      };

      socket.on("receiveMessage", handleReceiveMessage);

      return () => {
        socket.off("receiveMessage", handleReceiveMessage);
      };
    }
  }, [receiverId, currentUserId]);

  const sendMessage = () => {
    fetch("https://cheer-client-app-backend.onrender.com/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receiverId,
        receiverName, // Include the receiverName in the POST request
        senderId: currentUserId,
        content,
      }),
    })
      .then((response) => {
        if (response.ok) {
          setContent("");
          // Remove the following block
          // if (socketRef.current) {
          //   socketRef.current.emit("sendMessage", {
          //     senderId: currentUserId,
          //     receiverId,
          //     receiverName, // Include the receiverName in the socket emit
          //     content,
          //   });
          // }
        } else {
          console.error("Failed to send message");
        }
      })
      .catch((error) => {
        console.error("Error in sending message:", error);
      });
  };
  return (
    <div className="messages-page">
      <ConversationsTab currentUserId={currentUserId} />
      <div className="message-container">
        {messages.length > 0
          ? messages.map((message) => (
              <div
                key={message._id}
                className={
                  message.senderId === currentUserId ? "sent" : "received"
                }
              >
                <div className="message">
                  <p>{message.content}</p>
                  <small>{new Date(message.timestamp).toLocaleString()}</small>
                </div>
              </div>
            ))
          : "No messages"}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your message"
      ></textarea>
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default MessagesPage;
