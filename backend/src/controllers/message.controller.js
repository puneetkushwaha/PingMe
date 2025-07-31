import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "cloudinary";
import { io, getReceiverSocketId } from "../lib/socket.js";

// ✅ Sidebar ke liye — saare users laao except current user
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Messages laao ek user ke saath
export const getMessages = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Message send karo (text ya image ya dono)
export const sendMessage = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.user._id;
    const { text } = req.body;
    let image = null;

    // Optional validation (can skip if not needed)
    if (!text && !req.file) {
      return res.status(400).json({ error: "Message must contain text or image" });
    }

    // ✅ Image upload ho raha hai to Cloudinary pe bhejo
    if (req.file) {
      const uploadResult = await cloudinary.v2.uploader.upload(req.file.path);
      image = uploadResult.secure_url;
    }

    const newMessage = new Message({ senderId, receiverId, text, image });
    const savedMessage = await newMessage.save();

    // ✅ Real-time message emit using socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", savedMessage);
    }

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
