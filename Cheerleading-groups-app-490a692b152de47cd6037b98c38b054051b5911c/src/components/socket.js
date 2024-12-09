import { io } from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io("http://localhost:3000");

const useChat = (currentUserId, receiverId) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const handleReceiveMessage = (newMessage) => {
      // Check if the message is relevant to the current conversation
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

    // Cleanup the event listener on component unmount or receiverId change
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [receiverId, currentUserId]);

  return { messages, setMessages };
};

export default useChat;