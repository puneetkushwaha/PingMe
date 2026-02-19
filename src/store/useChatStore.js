import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { encryptMessage, decryptMessage } from "../lib/encryption";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  groups: [],
  starredMessages: [], // { messageId: true } or array of messages
  selectedUser: null, // This can be a User or a Group object
  isUsersLoading: false,
  isGroupsLoading: false,
  isMessagesLoading: false,
  unreadCounts: {}, // { userId: count }
  statuses: [],
  searchQuery: "",
  isContactInfoOpen: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setIsContactInfoOpen: (isOpen) => set({ isContactInfoOpen: isOpen }),
  // Array of grouped statuses
  isStatusesLoading: false,
  typingUsers: [], // Array of userIds currently typing

  getStatuses: async () => {
    set({ isStatusesLoading: true });
    try {
      const res = await axiosInstance.get("/status");
      set({ statuses: res.data });
    } catch (error) {
      console.error("Error fetching statuses:", error);
    } finally {
      set({ isStatusesLoading: false });
    }
  },

  uploadStatus: async (statusData) => {
    try {
      const res = await axiosInstance.post("/status/upload", statusData);
      // Don't push res.data directly because it's not grouped/populated and will crash the UI
      await get().getStatuses();
      toast.success("Status uploaded!");
    } catch (error) {
      toast.error("Failed to upload status");
    }
  },

  viewStatus: async (statusId) => {
    try {
      await axiosInstance.post(`/status/view/${statusId}`);
    } catch (error) {
      console.error("Error viewing status:", error);
    }
  },

  toggleStarMessage: (messageId) => {
    set((state) => {
      const isStarred = state.starredMessages.some((msg) => msg._id === messageId);
      if (isStarred) {
        return { starredMessages: state.starredMessages.filter((msg) => msg._id !== messageId) };
      } else {
        const message = state.messages.find((msg) => msg._id === messageId);
        return { starredMessages: [...state.starredMessages, message] };
      }
    });
  },

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({
        users: res.data,
        unreadCounts: res.data.reduce((acc, user) => ({ ...acc, [user._id]: user.unreadCount || 0 }), {})
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      // Tag groups with isGroup flag for easier UI handling
      const groupsWithFlag = res.data.map(g => ({ ...g, isGroup: true, fullName: g.name, profilePic: g.groupPic }));
      set({ groups: groupsWithFlag });
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/groups/create", groupData);
      const newGroup = { ...res.data, isGroup: true, fullName: res.data.name, profilePic: res.data.groupPic };
      set((state) => ({ groups: [...state.groups, newGroup] }));
      toast.success("Group created successfully!");
      return newGroup;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
    }
  },

  getMessages: async (id, isGroup = false) => {
    set({ isMessagesLoading: true });
    try {
      const endpoint = isGroup ? `/groups/${id}` : `/messages/${id}`;
      const res = await axiosInstance.get(endpoint);

      // Decrypt messages
      const messages = res.data.map(msg => ({
        ...msg,
        text: (msg.isEncrypted || msg.text?.startsWith("U2FsdGVkX1")) ? decryptMessage(msg.text) : msg.text
      }));
      set({ messages });

      if (!isGroup) {
        set((state) => ({
          unreadCounts: { ...state.unreadCounts, [id]: 0 }
        }));
        useAuthStore.getState().socket?.emit("markMessagesAsSeen", { senderId: id });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const endpoint = selectedUser.isGroup ? `/groups/send/${selectedUser._id}` : `/messages/send/${selectedUser._id}`;

      const encryptedText = messageData.text ? encryptMessage(messageData.text) : messageData.text;
      const payload = { ...messageData, text: encryptedText, isEncrypted: !!encryptedText };

      const res = await axiosInstance.post(endpoint, payload);
      // Optimistic update should use original text, but response will have encrypted.
      // So we override the response text with our original for local display until simple refresh
      const newMessage = { ...res.data, text: messageData.text };

      set({ messages: [...messages, newMessage] });

      // ✅ UPDATE SIDEBAR: Move this user to top with new last message
      set((state) => {
        const updatedUsers = [...state.users];
        const userIndex = updatedUsers.findIndex(u => u._id === selectedUser._id);

        if (userIndex !== -1) {
          const userToMove = { ...updatedUsers[userIndex] };
          userToMove.lastMessage = newMessage.text || (newMessage.image ? "📷 Image" : newMessage.audio ? "🎤 Audio" : "📁 File");
          userToMove.lastMessageTime = new Date().toISOString();

          updatedUsers.splice(userIndex, 1);
          updatedUsers.unshift(userToMove);

          return { users: updatedUsers };
        }
        return state;
      });

    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending message");
    }
  },

  clearMessages: async (targetId) => {
    try {
      await axiosInstance.delete(`/messages/clear/${targetId}`);
      set({ messages: [] });
      toast.success("Chat cleared!");
    } catch (error) {
      toast.error("Failed to clear chat");
    }
  },

  blockUser: async (targetId) => {
    try {
      const res = await axiosInstance.post(`/messages/block/${targetId}`);

      // Update the authUser in useAuthStore to reflect the new blockedUsers array
      const { authUser } = useAuthStore.getState();
      if (authUser) {
        useAuthStore.setState({
          authUser: { ...authUser, blockedUsers: res.data.blockedUsers }
        });
      }

      toast.success(res.data.message);
    } catch (error) {
      toast.error("Failed to block user");
    }
  },

  reportUser: async (targetId) => {
    try {
      const res = await axiosInstance.post(`/messages/report/${targetId}`);
      toast.success(res.data.message);
    } catch (error) {
      toast.error("Failed to report user");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, messages } = get();
    // Socket should be available even if no user is selected to get global notifications
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const authUser = useAuthStore.getState().authUser;
      const isOwnMessage = newMessage.senderId === authUser._id;
      const isGroupMessage = !!newMessage.groupId;
      const idToMatch = isGroupMessage ? newMessage.groupId : newMessage.senderId;
      const isMessageForSelectedChat = selectedUser && idToMatch === selectedUser._id;

      // Decrypt incoming message immediately
      const decryptedMessage = {
        ...newMessage,
        text: (newMessage.isEncrypted || newMessage.text?.startsWith("U2FsdGVkX1")) ? decryptMessage(newMessage.text) : newMessage.text
      };

      if (isMessageForSelectedChat) {
        // Prevent duplicate if already added by sendMessage (optimistic update)
        const messageExists = get().messages.some(msg => msg._id === decryptedMessage._id);
        if (!messageExists) {
          set({
            messages: [...get().messages, decryptedMessage],
          });
        }

        if (!isGroupMessage) {
          socket.emit("markMessagesAsSeen", { senderId: selectedUser._id });
        }
      } else if (!isOwnMessage) {
        if (!isGroupMessage) {
          set((state) => ({
            unreadCounts: {
              ...state.unreadCounts,
              [newMessage.senderId]: (state.unreadCounts[newMessage.senderId] || 0) + 1
            }
          }));
        }

        // Find sender name from users list
        const sender = get().users.find(u => u._id === newMessage.senderId);
        const senderName = sender?.fullName || "Someone";

        toast.success(`New message from ${isGroupMessage ? "Group" : senderName}`);
      }


      const notificationSettings = authUser?.notificationSettings || {
        showNotifications: true,
        showPreviews: true,
        notificationSound: true
      };

      const selectedSoundFile = notificationSettings?.selectedSound || "notification.mp3";

      if (!get().notiSound || get().notiSound.src.split('/').pop() !== selectedSoundFile) {
        set({ notiSound: new Audio(`/${selectedSoundFile}`) });
      }
      const sound = get().notiSound;

      if (!isOwnMessage && (!document.hasFocus() || !isMessageForSelectedChat)) {
        // Play sound if enabled
        if (notificationSettings.notificationSound !== false) {
          sound.currentTime = 0;
          sound.play().catch(() => { });
        }

        // Show browser notification if enabled
        if (notificationSettings.showNotifications !== false && !isMessageForSelectedChat && Notification.permission === "granted") {
          const sender = get().users.find(u => u._id === newMessage.senderId);
          const senderName = sender?.fullName || "Someone";

          const notificationBody = notificationSettings.showPreviews !== false
            ? (decryptedMessage.text || "Sent a media file")
            : "New message";

          new Notification(`New message from ${isGroupMessage ? "Group" : senderName}`, {
            body: notificationBody,
            icon: "/icon-192x192.png"
          });
        }
      }

      // ✅ UPDATE SIDEBAR: Update lastMessage and move user to top
      set((state) => {
        const otherUserId = isGroupMessage ? newMessage.groupId : (newMessage.senderId === useAuthStore.getState().authUser._id ? newMessage.receiverId : newMessage.senderId);

        // Find the user/group in the list
        const userIndex = state.users.findIndex(u => u._id === otherUserId);

        if (userIndex !== -1) {
          const updatedUsers = [...state.users];
          const userToMove = { ...updatedUsers[userIndex] };

          // Update last message text
          userToMove.lastMessage = decryptedMessage.text || (newMessage.image ? "📷 Image" : newMessage.audio ? "🎤 Audio" : "📁 File");
          userToMove.lastMessageTime = new Date().toISOString();

          // Remove from current position and add to top
          updatedUsers.splice(userIndex, 1);
          updatedUsers.unshift(userToMove);

          return { users: updatedUsers };
        }
        return state;
      });
    });

    socket.on("messagesSeen", ({ receiverId }) => {
      // If the current user is looking at the chat with receiverId, update content
      if (selectedUser && selectedUser._id === receiverId) {
        set((state) => ({
          messages: state.messages.map(msg => ({ ...msg, status: "seen" }))
        }));
      }
    });

    socket.on("typing", ({ senderId }) => {
      set((state) => ({
        typingUsers: [...new Set([...state.typingUsers, senderId])]
      }));
    });

    socket.on("stopTyping", ({ senderId }) => {
      set((state) => ({
        typingUsers: state.typingUsers.filter(id => id !== senderId)
      }));
    });

    socket.on("userOffline", ({ userId, lastSeen }) => {
      set((state) => {
        // Update the user in the main list
        const updatedUsers = state.users.map(u =>
          u._id === userId ? { ...u, lastSeen } : u
        );

        // Update selectedUser if same
        const updatedSelectedUser = state.selectedUser?._id === userId
          ? { ...state.selectedUser, lastSeen }
          : state.selectedUser;

        return { users: updatedUsers, selectedUser: updatedSelectedUser };
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("messagesSeen");
    socket.off("typing");
    socket.off("stopTyping");
    socket.off("userOffline");
  },

  setSelectedUser: (selectedItem) => {
    set({ selectedUser: selectedItem, searchQuery: "" });

    if (selectedItem) {
      get().getMessages(selectedItem._id, selectedItem.isGroup);

      if (!selectedItem.isGroup) {
        set((state) => ({
          unreadCounts: {
            ...state.unreadCounts,
            [selectedItem._id]: 0
          }
        }));

        const socket = useAuthStore.getState().socket;
        if (socket) {
          socket.emit("markMessagesAsSeen", { senderId: selectedItem._id });
        }
      }
    }
  },
}));
