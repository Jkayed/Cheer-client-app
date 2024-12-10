import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useAuth } from "../contexts/authContext";
import "../css/managedGroups.css";
const MessageBoard = ({ groupId, ownerId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser.uid); // Ensure user object is fully set
    }
  }, [currentUser]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `https://cheer-client-app-backend.onrender.com/groups/674023a40d464a4485cc9a45/messages`
      );
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error adding message:", error); // Log the full error
      res
        .status(500)
        .json({ message: "Error adding message", error: error.message });
    }
  };

  const handleAddMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const response = await fetch(
        `https://cheer-client-app-backend.onrender.com/groups/674023a40d464a4485cc9a45/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ownerId: "tjdRnfcvb9Z23cR8zJhH3x29NS32",
            content: newMessage,
          }), // Send ownerId
        }
      );
      if (response.ok) {
        setNewMessage("");
        fetchMessages(); // Refresh messages
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error adding message:", error);
    }
  };
  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await fetch(
        `https://cheer-client-app-backend.onrender.com/groups/${groupId}/messages/${messageId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        fetchMessages(); // Refresh messages after deletion
      } else {
        console.error("Error deleting message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };
  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <section>
      <></>
      <div className="messageBoard-div">
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalContent>
            <ModalHeader>Add Message</ModalHeader>
            <ModalBody>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full border p-2"
                placeholder="Type your message here"
              ></textarea>
            </ModalBody>
            <ModalFooter>
              <Button onPress={() => setIsModalOpen(false)}>Cancel</Button>
              <Button color="primary" onPress={handleAddMessage}>
                Confirm
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <div className="message-container">
          {ownerId == currentUser.uid ? (
            <Button
              className="add-message-button"
              onPress={() => setIsModalOpen(true)}
            >
              Add Message
            </Button>
          ) : (
            ""
          )}

          <div className="message-board">
            {messages.length > 0
              ? messages.map((msg) => (
                  <div key={msg._id} className="message-item">
                    <p className="message-content">{msg.content}</p>
                    <small className="message-date">
                      {new Date(msg.timestamp).toLocaleString()}
                    </small>
                    {ownerId == currentUser.uid ? (
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() => handleDeleteMessage(msg._id)}
                      >
                        Delete
                      </Button>
                    ) : (
                      ""
                    )}
                  </div>
                ))
              : ""}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MessageBoard;
