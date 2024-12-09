const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const stripe = require("stripe")(
  "sk_test_51PuIxd04SqVmxWqObj6TUfy02Py19x7wA8qN572q2fOhoW97EbowJlYRG6mMUq4ySAyw8gnurg4V8vIvtJzm8ceW00QcfZ9XuQ"
);
const app = express();
const port = 3000;
const { ObjectId } = mongoose.Types;

const storeItems = new Map([
  [1, { priceInCents: 10000, name: "test" }],
  [2, { priceInCents: 20000, name: "test2" }],
]);
// Middleware
app.use(cors());
app.use(bodyParser.json());
const messageBoardSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },
  ownerId: {
    type: String, // Changed from ObjectId to String
    required: true,
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});
const MessageBoard = mongoose.model("MessageBoard", messageBoardSchema);
module.exports = MessageBoard;

// MongoDB Connection
const CONNECTION_STRING =
  "mongodb+srv://jkayed0:nOI2coAj1TQE53kV@cluster0.zzrxo.mongodb.net/Cheerapp?retryWrites=true&w=majority";

mongoose
  .connect(CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("Error connecting to MongoDB:", err.message));

// Define Schemas
const memberSchema = new mongoose.Schema({
  memberID: String,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  role: String,
  paymentStatus: {
    type: String,
    enum: ["paid", "unpaid"], // Restrict values to either 'paid' or 'unpaid'
    default: "unpaid", // Default to 'unpaid' if not specified
  },
});

const requestSchema = new mongoose.Schema({
  memberID: String,
  name: String,
});
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group", // Reference the group schema
    required: true,
  },
});

const Product = mongoose.model("Product", productSchema);
const contactSchema = new mongoose.Schema({
  ownerID: String,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  groupName: String,
  description: String,
  country: String,
  city: String,
  state: String,
  zip: String,
  latitude: String,
  longitude: String,
  members: [memberSchema],
  requests: [requestSchema],
  memberID: String,
});

const Message = mongoose.model(
  "Message",
  new mongoose.Schema({
    senderId: {
      type: String,
      ref: "Contact",
      required: true,
    },
    receiverId: {
      type: String,
      ref: "Contact",
      required: true,
    },
    receiverName: {
      type: String,
      required: true,
    },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
  })
);

const Contact = mongoose.model("Contact", contactSchema);

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Socket.io connection handling
io.on("connection", (socket) => {

  socket.on("sendMessage", async (messageData) => {
    try {
      const message = new Message(messageData);
      await message.save();

      // Broadcast the message to all connected clients
      io.emit("receiveMessage", message);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});
// Route for leaving a group
app.patch(
  "/groups/:groupId/members/:memberId/payment-status",
  async (req, res) => {
    const { groupId, memberId } = req.params;
    const { paymentStatus } = req.body; // Expecting 'paid' or 'unpaid'
    try {
      // Find the group
      const group = await Contact.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      // Find the member within the group
      const member = group.members.find((m) => m.memberID === memberId);
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }

      // Update the payment status
      member.paymentStatus = paymentStatus || "unpaid";

      // Save the updated group document
      await group.save();

      res
        .status(200)
        .json({ message: "Payment status updated successfully", member });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating payment status", error });
    }
  }
);
app.post("/groups/:groupId/leave", async (req, res) => {
  const { groupId } = req.params;
  const { memberID } = req.body;

  try {
    // Find the group by ID
    const group = await Contact.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if the user is a member of the group
    const isMember = group.members.some(
      (member) => member.memberID === memberID
    );

    if (!isMember) {
      return res
        .status(400)
        .json({ message: "User is not a member of the group" });
    }

    // Remove the member from the group's members array
    group.members = group.members.filter(
      (member) => member.memberID !== memberID
    );

    // Save the updated group
    await group.save();

    res.status(200).json({ message: "User has left the group", group });
  } catch (error) {
    console.error("Error leaving group:", error);
    res.status(500).json({ message: "Server error", error });
  }
});
// Route to add product

app.post("/products", async (req, res) => {
  const { name, description, price, groupId } = req.body;

  if (!name || !description || !price || !groupId) {
    return res.status(400).json({ message: "Missing product details" });
  }

  try {
    const product = new Product({ name, description, price, groupId });
    await product.save();

    // Return the created product in the response
    res.status(201).json({ product });
  } catch (error) {
    console.error("Error:", error); // Log the exact error
    res
      .status(500)
      .json({ message: "Error creating product", error: error.message });
  }
});
app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
});
app.delete("/delete-product/:id", async (req, res) => {
  const productId = req.params.id; // Get product ID from the request URL

  try {
    // Find the product by ID and delete it
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
});
app.post("/create-checkout-session", async (req, res) => {
  const { name, description, price } = req.body;

  if (!name || !description || !price) {
    return res.status(400).json({ message: "Missing product details" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: name,
            },
            unit_amount: price, // Ensure price is in cents
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:5173/",
      cancel_url: "http://localhost:5173/",
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error:", error); // Log the exact error
    res
      .status(500)
      .json({ message: "Error creating product", error: error.message });
  }
});
app.post("/groups/:groupId/messages", async (req, res) => {
  const { groupId } = req.params;
  const { ownerId, content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Message content is required" });
  }

  try {
    const message = new MessageBoard({
      groupId: new mongoose.Types.ObjectId(groupId), // Keep this as ObjectId
      ownerId, // Use the string directly
      content,
    });

    await message.save();
    res
      .status(201)
      .json({ message: "Message added successfully", data: message });
  } catch (error) {
    console.error("Error adding message:", error);
    res
      .status(500)
      .json({ message: "Error adding message", error: error.message });
  }
});

app.delete("/groups/:groupId/messages/:messageId", async (req, res) => {
  const { messageId } = req.params;

  try {
    const deletedMessage = await MessageBoard.findByIdAndDelete(messageId);
    if (!deletedMessage) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting message", error: error.message });
  }
});
app.get("/groups/:groupId/messages", async (req, res) => {
  const { groupId } = req.params;

  try {
    const messages = await MessageBoard.find({ groupId }).sort({
      timestamp: -1,
    });
    res.status(200).json(messages);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching messages", error: error.message });
  }
});
app.get("/users/conversations/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    const userIds = new Set();
    messages.forEach((msg) => {
      if (msg.senderId !== userId) userIds.add(msg.senderId);
      if (msg.receiverId !== userId) userIds.add(msg.receiverId);
    });

    const users = await Contact.find({
      memberID: { $in: Array.from(userIds) },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching conversations", error });
  }
});

app.post("/contact", async (req, res) => {
  try {
    const {
      ownerID,
      firstName,
      lastName,
      email,
      phone,
      groupName,
      description,
      country,
      city,
      state,
      zip,
      latitude,
      longitude,
      memberID,
    } = req.body;

    if (!ownerID || !firstName || !lastName || !email || !phone || !groupName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const contact = new Contact({
      ownerID,
      firstName,
      lastName,
      email,
      phone,
      groupName,
      description,
      country,
      city,
      state,
      zip,
      latitude,
      longitude,
      memberID,
    });
    await contact.save();
    res.status(201).json(contact);
  } catch (err) {
    console.error("Error creating contact:", err.message);
    res
      .status(500)
      .json({ message: "Error creating contact", error: err.message });
  }
});
app.get("/groups/:groupId/products", async (req, res) => {
  try {
    const { groupId } = req.params;

    // Find products for the given groupId
    const products = await Product.find({ groupId });

    if (!products) {
      return res
        .status(404)
        .json({ message: "No products found for this group" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products for group:", error);
    res.status(500).json({ message: "An error occurred on the server", error });
  }
});
app.get("/groups/:groupId/requests", async (req, res) => {
  const { groupId } = req.params;

  try {
    // Find the group by ID
    const group = await Contact.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Send the requests array in the response
    res.status(200).json(group.requests);
  } catch (error) {
    console.error("Error fetching group requests:", error);
    res.status(500).json({ message: "An error occurred on the server", error });
  }
});
app.post("/groups/:groupId/requests/:memberId/accept", async (req, res) => {
  try {
    const { groupId, memberId } = req.params;

    // Find the group by ID
    const group = await Contact.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Find the request to accept
    const requestIndex = group.requests.findIndex(
      (request) => request.memberID === memberId
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Remove the request from the requests array and add it to the members array
    const [acceptedRequest] = group.requests.splice(requestIndex, 1);
    group.members.push({
      memberID: acceptedRequest.memberID,
      firstName: acceptedRequest.name,

      // Add other fields as necessary
    });

    // Save the updated group document
    await group.save();

    res
      .status(200)
      .json({ message: "Request accepted", member: acceptedRequest });
  } catch (error) {
    console.error("Error accepting request:", error);
    res.status(500).json({ message: "An error occurred on the server", error });
  }
});

app.post("/groups/:groupId/requests/:memberId/decline", async (req, res) => {
  try {
    const { groupId, memberId } = req.params;

    // Find the group by ID
    const group = await Contact.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Find and remove the request from the requests array
    const requestIndex = group.requests.findIndex(
      (request) => request.memberID === memberId
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: "Request not found" });
    }

    group.requests.splice(requestIndex, 1);

    // Save the updated group document
    await group.save();

    res.status(200).json({ message: "Request declined" });
  } catch (error) {
    console.error("Error declining request:", error);
    res.status(500).json({ message: "An error occurred on the server", error });
  }
});
// Route to request to join a group
app.post("/groups/:groupId/request", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberID, name } = req.body;

    // Find the group by ID
    const group = await Contact.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is already a member of the group
    const isMember = group.members.some(
      (member) => member.memberID === memberID
    );

    if (isMember) {
      return res
        .status(400)
        .json({ message: "User is already a member of the group" });
    }

    // Check if user has already requested to join the group
    const hasRequested = group.requests.some(
      (request) => request.memberID === memberID
    );

    if (hasRequested) {
      return res
        .status(400)
        .json({ message: "User has already requested to join this group" });
    }

    // Add new request
    group.requests.push({
      memberID,
      name,
    });

    await group.save();

    res
      .status(200)
      .json({ message: "Request to join the group has been submitted" });
  } catch (error) {
    console.error("Error handling join request:", error);
    res.status(500).json({ message: "An error occurred on the server", error });
  }
});
app.get("/recent-conversations/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const sentMessages = await Message.aggregate([
      { $match: { senderId: userId } },
      {
        $group: {
          _id: "$receiverId",
          lastMessage: { $last: "$content" },
          timestamp: { $last: "$timestamp" },
          receiverName: { $last: "$receiverName" },
        },
      },
    ]);

    const receivedMessages = await Message.aggregate([
      { $match: { receiverId: userId } },
      {
        $group: {
          _id: "$senderId",
          lastMessage: { $last: "$content" },
          timestamp: { $last: "$timestamp" },
          receiverName: { $last: "$receiverName" },
        },
      },
    ]);

    const allConversations = [...sentMessages, ...receivedMessages];
    allConversations.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    const recentUserIds = allConversations.map((conv) => conv._id);

    const users = await Contact.find({ memberID: { $in: recentUserIds } });

    const recentConversations = allConversations.map((conv) => {
      const user = users.find((u) => u.memberID === conv._id);

      return {
        receiverId: user ? user.memberID : conv._id,
        receiverName: conv.receiverName,
        lastMessage: conv.lastMessage,
        timestamp: conv.timestamp,
      };
    });

    res.json(recentConversations);
  } catch (error) {
    console.error("Error fetching recent conversations:", error);
    res
      .status(500)
      .json({ message: "Error fetching recent conversations", error });
  }
});
// Route to handle join requests for a specific group

app.post("/groups/:groupId/add-member", async (req, res) => {
  const { groupId } = req.params;
  const newMember = req.body;

  try {
    const group = await Contact.findById(groupId);

    if (!group) return res.status(404).send({ message: "Group not found" });

    group.members.push(newMember);
    await group.save();

    res.status(200).send({ message: "Member added successfully", group });
  } catch (error) {
    res.status(500).send({ message: "Error adding member", error });
  }
});

app.get("/groups/:groupId/members", async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Contact.findById(groupId);

    if (!group) return res.status(404).send({ message: "Group not found" });

    res.json(group.members);
  } catch (error) {
    res.status(500).send({ message: "Error fetching members", error });
  }
});

app.get("/groups", async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/messages", async (req, res) => {
  const { senderId, receiverId, content, receiverName } = req.body;
  try {
    const message = new Message({
      senderId,
      receiverId,
      content,
      receiverName,
    });
    await message.save();

    io.emit("receiveMessage", message);

    res.status(201).send(message);
  } catch (error) {
    res.status(500).send({ message: "Error saving message", error });
  }
});

app.get("/messages/:userId1/:userId2", async (req, res) => {
  const { userId1, userId2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).send(messages);
  } catch (error) {
    res.status(500).send({ message: "Error fetching messages", error });
  }
});

// Start the server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
