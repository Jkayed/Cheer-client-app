import { useEffect, useState } from "react";
import { useAuth } from "../contexts/authContext";
import {
  Button,
  Modal,
  ModalFooter,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

function JoinedGroups() {
  const { currentUser } = useAuth();
  const [groups, setGroups] = useState([]); // State to store the filtered groups
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [groupToLeave, setGroupToLeave] = useState(null); // State to store the group the user wants to leave
  const navigate = useNavigate(); // Use the navigate hook

  // Opens the modal when the "Leave Group" button is clicked
  const handleOpenModal = (groupId) => {
    setGroupToLeave(groupId);
    setIsModalOpen(true);
  };

  // Closes the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setGroupToLeave(null);
  };

  // Handle the logic for leaving the group
  const handleLeaveGroup = () => {
    if (!groupToLeave) return;

    fetch(`https://cheer-client-app-backend.onrender.com/groups/${groupToLeave}/leave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        memberID: currentUser.uid,
      }),
    })
      .then((response) => {
        if (response.ok) {
          // Remove the group from the state if the request is successful
          setGroups((prevGroups) =>
            prevGroups.filter((group) => group._id !== groupToLeave)
          );
          handleCloseModal(); // Close the modal after leaving the group
        } else {
          console.error("Failed to leave the group.");
        }
      })
      .catch((error) => {
        console.error("Error leaving the group:", error);
      });
  };
  const handleRequestToJoinClick = (groupId) => {
    // Navigate to the GroupDetails page with the selected groupId
    navigate(`/Manage-group/${groupId}`);
  };

  // Fetch groups for the current user
  useEffect(() => {
    fetch(`https://cheer-client-app-backend.onrender.com/groups`)
      .then((response) => response.json())
      .then((data) => {
        const filteredGroups = data.filter((group) =>
          group.members.some(
            (member) =>
              member.memberID === currentUser.uid ||
              member.email === currentUser.email
          )
        );
        setGroups(filteredGroups); // Update state with filtered groups
      })
      .catch((err) => {
        console.error("Error fetching group data:", err);
      });
  }, [currentUser]);
  return (
    <>
      <div className="flex w-full flex-col">
        <div className="group-div2">
          {groups.length > 0 ? (
            groups.map((group) => (
              <div key={group._id} className="group-item">
                <h2 className="group-name">{group.groupName}</h2>
                <p className="location">
                  {group.city}, {group.state}
                </p>
                <p className="owner">
                  Owner: {group.firstName} {group.lastName}
                </p>
                <p className="number">Phone: {group.phone}</p>
                <p className="Group-info">Description: {group.description}</p>
                <div className="button-container">
                  <button
                    onClick={() => handleRequestToJoinClick(group._id)}
                    className="request-join-button bg-orange-500"
                  >
                    SEE DETAILS
                  </button>
                  <button
                    onClick={() => handleOpenModal(group._id)}
                    className="leave-group-button"
                    color="error"
                  >
                    LEAVE GROUP
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No groups found.</p>
          )}
        </div>
      </div>

      {/* Modal for leaving the group */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <ModalHeader>
          <p>Are you sure you want to leave this group?</p>
        </ModalHeader>
        <ModalContent>
          <p>This action cannot be undone.</p>
        </ModalContent>
        <ModalFooter>
          <Button color="error" onPress={handleCloseModal}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleLeaveGroup}>
            Yes, Leave Group
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default JoinedGroups;
