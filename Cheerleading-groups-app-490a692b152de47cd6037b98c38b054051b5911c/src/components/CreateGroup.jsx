import React, { useState } from "react";
import axios from "axios";
import "../css/createGroup.css";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
function CreateGroup() {
  // State variables for each input field
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [formData, setFormData] = useState({
    ownerID: "",
    ownerFirstName: "",
    ownerLastName: "",
    ownerEmail: "",
    ownerPhone: "",
    groupName: "",
    groupDesc: "",
    groupCountry: "",
    groupCity: "",
    groupState: "",
    groupZip: "",
    lat: "",
    lon: "",
  });
  const handleOpenModal = () => {
    setModalMessage(""); // Reset message when modal opens
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalMessage(""); // Reset message when modal closes
  };
  // Function to handle form submission and send data to the backend
  async function handleSubmit() {
    try {
      // Fetch latitude and longitude
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&limit=3&q=${formData.groupCity},${formData.groupState}`
      );
      const location = response.data[0];
      if (location) {
        // Update formData with latitude and longitude
        setFormData({
          ...formData,
          lat: location.lat,
          lon: location.lon,
        });
        // Send data to the backend
        await axios.post("http://localhost:3000/contact", {
          ownerID: currentUser.uid,
          firstName: formData.ownerFirstName,
          lastName: formData.ownerLastName,
          email: formData.ownerEmail,
          phone: formData.ownerPhone,
          groupName: formData.groupName, // Ensure this matches the backend field name
          description: formData.groupDesc,
          country: formData.groupCountry,
          city: formData.groupCity,
          state: formData.groupState,
          zip: formData.groupZip,
          latitude: location.lat,
          longitude: location.lon,
          memberID: "asd",
        });

        navigate("/find-group");
      } else {
        console.log("Location not found");
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Handle change in input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <>
    <h2 className="create-group-header">Create a group today!</h2>
    <form className="form-container" onSubmit={handleSubmit}>
      <div className="input-group">
        <input
          type="text"
          name="ownerFirstName"
          value={formData.ownerFirstName}
          onChange={handleChange}
          placeholder="First name"
          className="create-group-double-input"
        />
        <input
          type="text"
          name="ownerLastName"
          value={formData.ownerLastName}
          onChange={handleChange}
          placeholder="Last name"
          className="create-group-double-input"
        />
      </div>
      <input
        type="text"
        name="ownerEmail"
        value={formData.ownerEmail}
        onChange={handleChange}
        placeholder="Email"
        className="create-group-input"
      />
      <input
        type="text"
        name="ownerPhone"
        value={formData.ownerPhone}
        onChange={handleChange}
        placeholder="Phone"
        className="create-group-input"
      />
      <input
        type="text"
        name="groupCountry"
        value={formData.groupCountry}
        onChange={handleChange}
        placeholder="Country"
        className="create-group-input"
      />
      <input
        type="text"
        name="groupCity"
        value={formData.groupCity}
        onChange={handleChange}
        placeholder="City"
        className="create-group-input"
      />
      <input
        type="text"
        name="groupState"
        value={formData.groupState}
        onChange={handleChange}
        placeholder="State"
        className="create-group-input"
      />
      <input
        type="text"
        name="groupZip"
        value={formData.groupZip}
        onChange={handleChange}
        placeholder="Zip"
        className="create-group-input"
      />
      <input
        type="text"
        name="groupName"
        value={formData.groupName}
        onChange={handleChange}
        placeholder="Group name"
        className="create-group-input"
      />
      <textarea
        name="groupDesc"
        value={formData.groupDesc}
        onChange={handleChange}
        placeholder="Description"
        className="create-group-textArea"
      />
      <Button
        onPress={() => handleOpenModal()}
        className="submit-button"
        color="warning"
      >
        Submit
      </Button>
    </form>
    <Modal isOpen={isModalOpen} onOpenChange={handleCloseModal}>
      <ModalContent>
        {(onClose) => (
          <>
            {modalMessage ? (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Request Status
                </ModalHeader>
                <ModalBody>
                  <p>{modalMessage}</p>
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            ) : (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Confirm Request to Join
                </ModalHeader>
                <ModalBody>
                  <p>Are you sure you want to create this group?</p>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button onPress={() => handleSubmit()} color="warning">
                    Confirm
                  </Button>
                </ModalFooter>
              </>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  </>
  );
}

export default CreateGroup;
