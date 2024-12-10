// src/components/JoinRequests.jsx

import React, { useEffect, useState } from "react";
import { Button } from "@nextui-org/react";
import { useAuth } from "../contexts/authContext";

function JoinRequests({ groupId }) {
  const { currentUser } = useAuth();
  const [joinRequests, setJoinRequests] = useState([]);

  useEffect(() => {
    const fetchJoinRequests = async () => {
      try {
        const response = await fetch(
          `https://cheer-client-app-backend.onrender.com/groups/66d4d4d41737dddf7dc442e3/join-requests?ownerId=${currentUser.uid}`,
          {
            method: "GET",
          }
        );
        const data = await response.json();
        if (response.ok) {
          setJoinRequests(data);
        } else {
          console.error("Error fetching join requests:", data.message);
        }
      } catch (error) {
        console.error("Error fetching join requests:", error);
      }
    };

    fetchJoinRequests();
  }, [groupId, currentUser.uid]);

  const handleApprove = async (requestId) => {
    try {
      const response = await fetch(
        `https://cheer-client-app-backend.onrender.com/groups/${groupId}/join-requests/${requestId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ownerId: currentUser.uid }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        // Remove the approved request from the list
        setJoinRequests(joinRequests.filter((req) => req._id !== requestId));
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error approving join request:", error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      const response = await fetch(
        `https://cheer-client-app-backend.onrender.com/groups/${groupId}/join-requests/${requestId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ownerId: currentUser.uid }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        // Remove the rejected request from the list
        setJoinRequests(joinRequests.filter((req) => req._id !== requestId));
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error rejecting join request:", error);
    }
  };

  return (
    <div>
      <h3>Pending Join Requests</h3>
      {joinRequests.length > 0 ? (
        joinRequests.map((request) => (
          <div
            key={request._id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              margin: "10px 0",
            }}
          >
            <p>
              <strong>Name:</strong> {request.userId.firstName}{" "}
              {request.userId.lastName}
            </p>
            <p>
              <strong>Email:</strong> {request.userId.email}
            </p>
            {/* Add more user details if needed */}
            <Button onPress={() => handleApprove(request._id)} color="success">
              Approve
            </Button>
            <Button onPress={() => handleReject(request._id)} color="error">
              Reject
            </Button>
          </div>
        ))
      ) : (
        <p>No pending join requests.</p>
      )}
    </div>
  );
}

export default JoinRequests;
