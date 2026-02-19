import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import axios from "axios";


// Environment-based base URL
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : import.meta.env.VITE_API_BASE_URL;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCompiling: false, // Replaced isUpdatingProfile with isCompiling
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  isProfileOpen: false,
  activeSidebar: "chats", // "chats", "status", "calls", "starred", "archived"
  linkedDevices: [],
  isFetchingDevices: false,

  setProfileOpen: (isOpen) => set({ isProfileOpen: isOpen }),
  setActiveSidebar: (sidebar) => set({ activeSidebar: sidebar, isProfileOpen: false }),

  // ✅ Get linked devices
  getLinkedDevices: async () => {
    set({ isFetchingDevices: true });
    try {
      const res = await axiosInstance.get("/auth/linked-devices");
      set({ linkedDevices: res.data });
    } catch (error) {
      console.log("Error in getLinkedDevices:", error);
    } finally {
      set({ isFetchingDevices: false });
    }
  },

  // ✅ Unlink a device
  unlinkDevice: async (deviceId) => {
    try {
      await axiosInstance.post("/auth/unlink-device", { deviceId });
      set((state) => ({
        linkedDevices: state.linkedDevices.filter((d) => d.deviceId !== deviceId),
      }));
      toast.success("Device unlinked");
    } catch (error) {
      toast.error("Failed to unlink device");
    }
  },

  // ✅ Check if user is authenticated
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      // Only logout if explicit unauthorized, otherwise keep state (might be network error)
      if (error?.response?.status === 401) {
        set({ authUser: null });
      }
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // ✅ Signup user
  signup: async (data) => {
    set({ isCompiling: true }); // Changed to isCompiling
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message); // Updated error handling
    } finally {
      set({ isCompiling: false }); // Changed to isCompiling
    }
  },

  // ✅ Login user
  login: async (data) => {
    set({ isCompiling: true }); // Changed to isCompiling
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message); // Updated error handling
    } finally {
      set({ isCompiling: false }); // Changed to isCompiling
    }
  },

  // ✅ Logout user
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      get().disconnectSocket();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response.data.message); // Updated error handling
    }
  },

  // ✅ Update user profile
  updateProfile: async (data) => {
    set({ isCompiling: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error in updateProfile:", error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || "Profile update failed");
    } finally {
      set({ isCompiling: false });
    }
  },

  // ✅ Connect to socket.io (modified to allow pairing without authUser)
  connectSocket: (isPairing = false) => {
    const { authUser, socket } = get();
    if (!isPairing && (!authUser || socket?.connected)) return;
    if (isPairing && socket?.connected) return;

    const newSocket = io(BASE_URL, {
      query: {
        userId: authUser?._id || "",
        isPairing: isPairing ? "true" : "false"
      },
    });

    newSocket.connect();
    set({ socket: newSocket });

    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    newSocket.on("pairing:code", ({ pairingCode }) => {
      set({ pairingCode });
    });

    newSocket.on("pairing:authorized", async ({ pairingToken }) => {
      await get().loginWithPairingToken(pairingToken);
    });
  },

  // ✅ Initiate QR Pairing
  initiatePairing: () => {
    get().connectSocket(true);
    const { socket } = get();
    // Use a small timeout to ensure socket is connected before emitting
    setTimeout(() => {
      const currentSocket = get().socket;
      if (currentSocket) {
        currentSocket.emit("pairing:request");
        set({ isPairing: true });
      }
    }, 500);
  },

  // ✅ Pair current device to a web instance
  pairWeb: async (pairingCode) => {
    try {
      await axiosInstance.post("/auth/pair-device", { pairingCode });
      toast.success("Web device linked!");
      get().getLinkedDevices(); // Refresh list immediately
    } catch (error) {
      toast.error(error.response?.data?.message || "Pairing failed");
    }
  },

  // ✅ Finalize login on the web instance
  loginWithPairingToken: async (pairingToken) => {
    try {
      const res = await axiosInstance.post("/auth/login-with-token", { pairingToken });
      set({ authUser: res.data });
      set({ pairingCode: null, isPairing: false });
      get().connectSocket(); // Reconnect as full user
      toast.success("Logged in via QR Code!");
    } catch (error) {
      toast.error("Pairing token expired or invalid");
    }
  },

  // ✅ Disconnect socket
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) socket.disconnect();
  },
}));
