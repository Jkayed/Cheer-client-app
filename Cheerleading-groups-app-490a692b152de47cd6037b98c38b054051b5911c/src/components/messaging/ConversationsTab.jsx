import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../sidebar";
const ConversationsTab = ({ currentUserId }) => {
  const [recentConversations, setRecentConversations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`https://cheer-client-app-backend.onrender.com/recent-conversations/${currentUserId}`)
      .then((response) => response.json())
      .then((data) => {
        setRecentConversations(data);
      })
      .catch((error) =>
        console.error("Error fetching recent conversations:", error)
      );
  }, [currentUserId]);

  const handleConversationClick = (receiverId, recieverName) => {
    navigate(
      `/messages?receiverId=${receiverId}&receiverName=${encodeURIComponent(
        recieverName
      )}`
    );
  };
  return (
    <div className="recent-conversations">
      <Sidebar currentUserId={currentUserId}></Sidebar>
    </div>
  );
};

export default ConversationsTab;
