import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/authContext";
import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { Tabs, Tab, Card, CardBody } from "@nextui-org/react";
import JoinedGroups from "./joinedGroups";
import "../css/groupList.css"
function ManagedGroups() {
  const [groups, setGroups] = useState([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate(); // Use the navigate hook

  useEffect(() => {
    fetch(`https://cheer-client-app-backend.onrender.com/groups`)
      .then((response) => response.json())
      .then((data) => {
        const filteredGroups = data.filter(
          (group) => group.ownerID === currentUser.uid
        );
        setGroups(filteredGroups);
      })
      .catch((err) => {
        console.error("Error fetching group data:", err);
      });
  }, [currentUser.uid]);

  const handleRequestToJoinClick = (groupId) => {
    // Navigate to the GroupDetails page with the selected groupId
    navigate(`/Manage-group/${groupId}`);
  };

  return (
    <>
    <div className="owned-groups-background">
      <div className="flex w-full flex-col px-4 lg:px-20" >
        <Tabs aria-label="Group Options" className="mx-auto mt-10 lg:mt-20 max-w-5xl">
          <Tab key="owned-groups" title="Owned Groups">
          <div className="group-div2">
            <div className="group-container">
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
                    <button
                      onClick={() => handleRequestToJoinClick(group._id)}
                      className="request-join-button"
                    >
                      See Details
                    </button>
                    
                  </div>
                ))
              ) : (
                <p className="no-groups-message">No groups found.</p>
              )}
            </div>
            </div>
          </Tab>
          <Tab key="joined-groups" title="Joined Groups">
            <JoinedGroups />
          </Tab>
        </Tabs>
      </div>
    </div>
  </>
  );
}

export default ManagedGroups;
