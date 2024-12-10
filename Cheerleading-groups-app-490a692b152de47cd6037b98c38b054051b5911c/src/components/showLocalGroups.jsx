import React, { useState } from "react";
import "../css/groupList.css";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useAuth } from "../contexts/authContext";

function ShowLocalGroups({ groups }) {
  const { currentUser } = useAuth();
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [modalMessage, setModalMessage] = useState(""); // New state for modal message

  const handleOpenModal = (groupId) => {
    setSelectedGroupId(groupId);
    setModalMessage(""); // Reset message when modal opens
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGroupId(null);
    setModalMessage(""); // Reset message when modal closes
  };

  const handleConfirmRequest = () => {
    if (selectedGroupId) {
      fetch(`https://cheer-client-app-backend.onrender.com/groups/${selectedGroupId}/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberID: currentUser.uid,
          name: currentUser.email,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message) {
            setModalMessage(data.message);
          } else {
            setModalMessage("Request successful");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          setModalMessage("An error occurred: " + error.message);
        });
    }
  };

  return (
<div className="group-container">
  {error && <p className="error-message">{error}</p>}

  {groups.length > 0 ? (
    groups.map((group) => (
      <div key={group._id} className="group-item">
        <h2 className="group-name">{group.groupName}</h2>
        <p className="group-location">
          {group.city}, {group.state}
        </p>
        <p className="group-owner">
          {group.firstName} {group.lastName}
        </p>
        <p className="group-phone">{group.phone}</p>
        <p className="group-description">Description: {group.description}</p>
        <button
          onClick={() => handleOpenModal(group._id)}
          className="request-button"
        >
          REQUEST TO JOIN
        </button>
      </div>
    ))
  ) : (
    <h2 className="no-groups-message">
      No groups found within the selected area.
    </h2>
  )}

      {/* Modal for confirmation */}
      <Modal isOpen={isModalOpen} onOpenChange={handleCloseModal}>
    <ModalContent>
      {(onClose) => (
        modalMessage ? (
          <>
            <ModalHeader>Request Status</ModalHeader>
            <ModalBody>
              <p>{modalMessage}</p>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={onClose}>Close</Button>
            </ModalFooter>
          </>
        ) : (
          <>
            <ModalHeader>Confirm Request to Join</ModalHeader>
            <ModalBody>
              <p>Are you sure you want to request to join this group?</p>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleConfirmRequest}>
                Confirm
              </Button>
            </ModalFooter>
          </>
        )
      )}
    </ModalContent>
  </Modal>
    </div>
  );
}

export default ShowLocalGroups;
