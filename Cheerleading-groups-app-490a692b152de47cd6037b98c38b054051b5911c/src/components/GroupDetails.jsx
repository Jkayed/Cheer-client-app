// export default GroupDetails;
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Chip, User, Tooltip } from "@nextui-org/react";
import { useAuth } from "../contexts/authContext";
import { Modal, useDisclosure } from "@nextui-org/react";
import "../css/managedGroups.css";
import CreateProductForm from "./CreateProductForm";
import { Tabs, Tab, Card, CardBody } from "@nextui-org/react";
import MessageBoard from "./MessageBoard";
import {
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
} from "@nextui-org/react";

const statusColorMap = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

const columns = [
  { name: "NAME", uid: "name" },
  { name: "STATUS", uid: "status" },
  { key: "payment", label: "Payment" }, // New column
  { name: "ACTIONS", uid: "actions" },
];

const GroupDetails = () => {
  const { groupId } = useParams(); // Access groupId from URL
  const [members, setMembers] = useState([]);
  const [group, setGroup] = useState("");
  const [requests, setRequests] = useState([]);
  const [products, setProducts] = useState([]); // New state for products
  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("sdfd");
  const [ownerID, setOwnerID] = useState(null); // State to store ownerID
  const [price, setPrice] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Fetch group data
  useEffect(() => {
    fetchGroupData();
    getGroupOwner(); // Fetch products when the component loads
    fetchProducts();
  }, [groupId]);
  const {
    isOpen: isFirstModalOpen,
    onOpen: openFirstModal,
    onClose: closeFirstModal,
  } = useDisclosure();

  const {
    isOpen: isSecondModalOpen,
    onOpen: openSecondModal,
    onClose: closeSecondModal,
  } = useDisclosure();

  const {
    isOpen: isThirdModalOpen,
    onOpen: openThirdModal,
    onClose: closeThirdModal,
  } = useDisclosure();
  const handleOpenModal = (user) => {
    setSelectedUser(user);
    openFirstModal(); // Opens the modal
  };
  const handleMessageClick = (memberId, firstName) => {
    navigate(
      `/messages?receiverId=${memberId}&receiverName=${encodeURIComponent(
        firstName
      )}`
    );
  };
  const getGroupOwner = () => {
    setLoading(true);
    fetch(`https://cheer-client-app-backend.onrender.com/groups`)
      .then((response) => response.json())
      .then((data) => {
        const groupData = data.find((group) => group._id === groupId); // Find the group with the matching _id
        if (groupData) {
          setGroup(groupData); // Set the matching group
        } else {
          console.error("Group not found");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching groups:", error);
        setLoading(false);
      });
  };
  const fetchGroupData = () => {
    setLoading(true);
    fetch(`https://cheer-client-app-backend.onrender.com/groups/${groupId}/members`)
      .then((response) => response.json())
      .then((data) => {
        setMembers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching members:", error);
        setLoading(false);
      });

    fetch(`https://cheer-client-app-backend.onrender.com/groups/${groupId}/requests`)
      .then((response) => response.json())
      .then((data) => {
        setRequests(data);
      })
      .catch((error) => {
        console.error("Error fetching requests:", error);
      });
  };
  const fetchProducts = () => {
    fetch(`https://cheer-client-app-backend.onrender.com/groups/${groupId}/products`)
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  };

  const handleAcceptRequest = (memberId) => {
    fetch(
      `https://cheer-client-app-backend.onrender.com/groups/${groupId}/requests/${memberId}/accept`,
      {
        method: "POST",
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setRequests((prevRequests) =>
          prevRequests.filter((request) => request.memberID !== memberId)
        );
        setMembers((prevMembers) => [...prevMembers, data.member]);
      })
      .catch((error) => {
        console.error("Error accepting request:", error);
      });
  };

  const handleDeclineRequest = (memberId) => {
    fetch(
      `https://cheer-client-app-backend.onrender.com/groups/${groupId}/requests/${memberId}/decline`,
      {
        method: "POST",
      }
    )
      .then((response) => response.json())
      .then(() => {
        setRequests((prevRequests) =>
          prevRequests.filter((request) => request.memberID !== memberId)
        );
      })
      .catch((error) => {
        console.error("Error declining request:", error);
      });
  };
  const handlePaymentStatusUpdate = async (memberID, status) => {
    try {
      const response = await fetch(
        `https://cheer-client-app-backend.onrender.com/groups/674023a40d464a4485cc9a45/members/tjdRnfcvb9Z23cR8zJhH3x29NS32/payment-status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentStatus: status }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update payment status");
      }

      const updatedMember = await response.json();

      setMembers((prevMembers) =>
        prevMembers.map((member) =>
          member.memberID === memberID
            ? { ...member, paymentStatus: status }
            : member
        )
      );
    } catch (error) {
      console.error("Error updating payment status:", error.message);
    }
  };
  const renderCell = React.useCallback(
    (member, columnKey) => {
      const cellValue = member[columnKey];

      switch (columnKey) {
        case "name":
          return (
            <User
              avatarProps={{ radius: "lg", src: member.avatar }}
              description={member.firstName}
              name={`${member.firstName}`}
            />
          );
        case "role":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">{cellValue}</p>
            </div>
          );
        case "status":
          return (
            <Chip
              className="capitalize"
              color={statusColorMap[member.status]}
              size="sm"
              variant="flat"
            >
              {cellValue || member.paymentStatus}
            </Chip>
          );
        case "paymentStatus":
          return (
            <p
              className={`text-sm font-bold ${
                member.paymentStatus === "paid"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {member.paymentStatus || "unpaid"}
            </p>
          );
        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip content="Contact">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  onClick={() => handleOpenModal(member)}
                >
                  <path d="M8 9h8" />
                  <path d="M8 13h6" />
                  <path d="M12 21l-3 -3h-3a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8" />
                  <path d="M16 19h6" />
                </svg>
              </Tooltip>
            </div>
          );
        case "payment":
          return group.ownerID === currentUser.uid ? (
            <div className="flex items-center gap-2">
              <button
                className="text-xs px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600"
                onClick={() =>
                  handlePaymentStatusUpdate(member.memberID, "paid")
                }
              >
                Paid
              </button>
              <button
                className="text-xs px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={() =>
                  handlePaymentStatusUpdate(member.memberID, "unpaid")
                }
              >
                Unpaid
              </button>
            </div>
          ) : null;
        default:
          return cellValue;
      }
    },
    [] // Dependency to ensure modal state updates correctly
  );

  const renderCellRequests = React.useCallback(
    (member, columnKey) => {
      const cellValue = member[columnKey];
      switch (columnKey) {
        case "name":
          return (
            <User
              avatarProps={{ radius: "lg", src: member.avatar }}
              description={member.name}
              name={`${member.name}`}
            />
          );
        case "role":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">{cellValue}</p>
            </div>
          );
        case "status":
          return (
            <Chip
              className="capitalize"
              color={statusColorMap[member.status]}
              size="sm"
              variant="flat"
            >
              {cellValue || "unknown"}
            </Chip>
          );
        case "actions":
          return (
            <div className="relative flex items-center gap-2 ">
              <Button
                size="sm"
                color="success"
                onClick={() => handleAcceptRequest(member.memberID)}
              >
                Accept
              </Button>
              <Button
                size="sm"
                color="error"
                onClick={() => handleDeclineRequest(member.memberID)}
              >
                Decline
              </Button>
              <Tooltip content="Contact">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  onClick={() => handleOpenModal(member)}
                >
                  <path d="M8 9h8" />
                  <path d="M8 13h6" />
                  <path d="M12 21l-3 -3h-3a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8" />
                  <path d="M16 19h6" />
                </svg>
              </Tooltip>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [navigate, handleAcceptRequest, handleDeclineRequest]
  );

  const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch(
        `https://cheer-client-app-backend.onrender.com/products/${productId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== productId)
      );
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };
  const handlePurchase = async (product) => {
    try {
      const response = await fetch(
        `https://cheer-client-app-backend.onrender.com/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: product.name,
            description,
            price: parseInt(product.price, 10), // convert to integer
          }),
        }
      );

      const result = await response.json();
      if (result.url) {
        window.location = result.url; // Redirect to Stripe checkout if applicable
      }
      fetchProducts(); // Re-fetch products after adding a new one
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const renderProductCell = React.useCallback((columnKey) => {
    const cellValue = products[columnKey];
    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{ radius: "lg", src: user.avatar }}
            description={user.email}
            name={cellValue}
          >
            {user.email}
          </User>
        );
      case "role":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
            <p className="text-bold text-sm capitalize text-default-400">
              {user.name}
            </p>
          </div>
        );
      case "status":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[user.status]}
            size="sm"
            variant="flat"
          >
            {cellValue}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Details">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EyeIcon />
              </span>
            </Tooltip>
            <Tooltip content="Edit user">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete user">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const renderProducts = () => {
    <>
      <Table aria-label="Example table with custom cells">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderProductCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>;
  };

  const renderRequests = () => {
    return requests.map((request) => (
      <TableRow key={request.memberID}>
        {columns.map((column) => (
          <TableCell key={column.uid}>
            {renderCell(request, column.uid)}
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  const renderMembers = () => {
    return members.map((member, index) => (
      <TableRow key={index}>
        {columns.map((column) => (
          <TableCell key={index}>{renderCell(member, column.uid)}</TableCell>
        ))}
      </TableRow>
    ));
  };
  console.log(members)
  const isOwner = currentUser?.uid === group.ownerID;
  const formatLocation = (city, state) => {
    const capitalize = (word) =>
      word && word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    return `${capitalize(city)}, ${capitalize(state)}`;
  };
  const location = formatLocation(group.city, group.state);
  return (
    <section>
      <>
        <Modal isOpen={isFirstModalOpen} onClose={closeFirstModal}>
          <ModalContent>
            <ModalHeader>Contact info</ModalHeader>
            <ModalBody>
              {selectedUser && (
                <>
                  <p>
                    <strong>Email:</strong>{" "}
                    {selectedUser.firstName
                      ? selectedUser.firstName
                      : selectedUser.name}
                  </p>
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={closeFirstModal}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
      <div className="Group-details">
        <div className="Group-info2">
          <h2 className="ml-auto mr-auto text-4xl mt-10">{group.groupName}</h2>
          <p className="ml-5 location-text mt-10">
            <strong>Location:</strong> {formatLocation(group.city, group.state)}
          </p>
          <p className="description-text styled-description ml-5 mt-20">
            <strong>Description: </strong>
            {group.description &&
              group.description.charAt(0).toUpperCase() +
                group.description.slice(1)}
          </p>
          {renderProducts()}
        </div>
        <div className="products-div">
          {/* Header labels */}
          <div className="flex product-item header">
            <h2 className="product-name">Name</h2>
            <p className="product-price">Price</p>
          </div>

          {products.map((product) => (
            <div className="flex product-item" key={product.id}>
              <h2 className="product-name">{product.name}</h2>
              <p className="product-price">{product.price / 100}</p>
              <button
                className="buy-button"
                onClick={() => handlePurchase(product)}
              >
                Buy now
              </button>
              {group.ownerID == currentUser.uid ? (
                <Button
                  onPress={() => handleDeleteProduct(product._id)}
                  color="error"
                  className="delete-product-button"
                >
                  Delete
                </Button>
              ) : (
                ""
              )}
            </div>
          ))}

          {isOwner && (
            <Button onPress={openSecondModal} className="create-product">
              Create fee
            </Button>
          )}

          {renderProducts()}
        </div>
      </div>
      <Modal isOpen={isSecondModalOpen} onClose={closeSecondModal}>
        <CreateProductForm groupId={groupId} />
      </Modal>
      <Modal isOpen={isThirdModalOpen} onClose={closeThirdModal}>
        <h3>Confirm Delete</h3>

        <p>Are you sure you want to delete this product?</p>

        <Button
          color="danger"
          onPress={() => {
            handleDeleteProduct(productToDelete); // Pass the product ID to delete
            closeThirdModal(); // Close the modal after deletion
          }}
        >
          Confirm
        </Button>
        <Button color="primary" onPress={closeThirdModal}>
          Cancel
        </Button>
      </Modal>
      <MessageBoard ownerId={group.ownerID} />
      <div className="flex w-full flex-col bg-[#ed6847] p-4  ">
        <Tabs aria-label="Options" className="ml-auto mr-auto mt-10">
          <Tab key="members" title="Group members">
            <h2 className="group-members-title flex flex-col gap-1 text-center mb-10 mt-5">
              Group Members
            </h2>
            <Table
              aria-label="Example table with custom cells"
              className="custom-table"
              classNames={{
                table: "min-h-[220px]",
              }}
            >
              <TableHeader columns={columns}>
                {(column) => (
                  <TableColumn
                    key={column.uid}
                    align={column.memberID === "actions" ? "center" : "start"}
                  >
                    {column.name}
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody items={members}>
                {(member) => (
                  <TableRow key={member._id}>
                    {(columnKey) => (
                      <TableCell>{renderCell(member, columnKey)}</TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Tab>
          {group.ownerID == currentUser.uid ? (
            <Tab key="requests" title="Requests">
              <h2 className="group-members-title flex flex-col gap-1 text-center mb-10 mt-5">
                Group Requests
              </h2>
              <Table
                aria-label="Example table with custom cells"
                classNames={{
                  table: "min-h-[220px]",
                }}
              >
                <TableHeader columns={columns}>
                  {(column) => (
                    <TableColumn
                      key={column.uid}
                      align={column.memberID === "actions" ? "center" : "start"}
                    >
                      {column.name}
                    </TableColumn>
                  )}
                </TableHeader>
                <TableBody items={requests}>
                  {(member) => (
                    <TableRow key={member._id}>
                      {(columnKey) => (
                        <TableCell>
                          {renderCellRequests(member, columnKey)}
                        </TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Tab>
          ) : (
            ""
          )}
        </Tabs>
      </div>
    </section>
  );
};

export default GroupDetails;
