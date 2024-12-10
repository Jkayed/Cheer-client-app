import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/sidebar.css"; // Assuming you have this CSS file

const Sidebar = ({ currentUserId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentConversations, setRecentConversations] = useState([]);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  // http://localhost:3000
  useEffect(() => {
    fetch(`https://cheer-client-app-backend.onrender.com/recent-conversations/${currentUserId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched conversations:", data);
        setRecentConversations(data);
      })
      .catch((error) =>
        console.error("Error fetching recent conversations:", error)
      );
  }, [currentUserId]);

  const handleConversationClick = (receiverId, receiverName) => {
    console.log("Clicked receiverId:", receiverName);
    navigate(
      `/messages?receiverId=${receiverId}&receiverName=${encodeURIComponent(
        receiverName
      )}`
    );
  };

  return (
    <div className="sidebar-container">
      {/* Button to open the sidebar */}
      {!isOpen && (
        <button className="toggle-button" onClick={toggleSidebar}>
          See messages
        </button>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        {/* Close icon at the top-right corner */}
        {isOpen && (
          <div className="close-icon" onClick={toggleSidebar}>
            <svg
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              viewBox="0 0 24 24"
              height="1em"
              width="1em"
            >
              <path d="M5 3 H19 A2 2 0 0 1 21 5 V19 A2 2 0 0 1 19 21 H5 A2 2 0 0 1 3 19 V5 A2 2 0 0 1 5 3 z" />
              <path d="M9 3v18M16 15l-3-3 3-3" />
            </svg>
          </div>
        )}

        <h2>Sidebar Menu</h2>
        <ul>
          {recentConversations.map((conversation) => (
            <li
              key={conversation.receiverId}
              onClick={() =>
                handleConversationClick(
                  conversation.receiverId,
                  conversation.receiverName
                )
              }
            >
              <div className="conversation-item">
                <strong>{conversation.receiverName}</strong>
                <p>{conversation.lastMessage}</p>
                <small>
                  {new Date(conversation.timestamp).toLocaleString()}
                </small>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
