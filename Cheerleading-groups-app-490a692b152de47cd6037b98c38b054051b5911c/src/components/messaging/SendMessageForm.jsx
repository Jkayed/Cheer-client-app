import React, { useState } from "react";

function SendMessageForm({ senderId, receiverId }) {
  const [content, setContent] = useState("");

  const sendMessage = () => {
    const response = fetch("https://cheer-client-app-backend.onrender.com/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        senderId,
        receiverId,
        content,
      }),
    });

    if (response.ok) {
      // Handle success (e.g., clear form, show notification)
      setContent("");
    } else {
      // Handle error
      console.error("Failed to send message");
    }
  };

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your message"
      ></textarea>
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default SendMessageForm;
