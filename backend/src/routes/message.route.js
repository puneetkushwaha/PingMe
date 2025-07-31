import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

// ✅ Get all users for sidebar (except current user)
router.get("/users", protectRoute, getUsersForSidebar);

// ✅ Get all messages with a specific user
router.get("/:id", protectRoute, getMessages);

// ✅ Send a message to a user
router.post("/send/:id", protectRoute, sendMessage);

export default router;
