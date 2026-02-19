import { useEffect, useState } from "react";
import { decryptMessage } from "../lib/encryption";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users as UsersIcon, CircleDashed, MessageSquarePlus, EllipsisVertical, Search, Filter, Archive, LogOut, UserPlus as UserPlusIcon, Settings, Download, Phone as PhoneIcon, MonitorUp } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import NewGroupModal from "./NewGroupModal";
import PairDeviceModal from "./PairDeviceModal";

const Sidebar = () => {
  const { getUsers, users, getGroups, groups, selectedUser, setSelectedUser, isUsersLoading, isGroupsLoading, unreadCounts, typingUsers } = useChatStore();
  const { onlineUsers, logout, activeSidebar = "chats", setActiveSidebar, authUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'unread', 'groups'
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);

  useEffect(() => {
    getUsers();
    getGroups();
  }, [getUsers, getGroups]);

  const { calls, getCallHistory, logCall, initiateCall } = useCallStore();

  useEffect(() => {
    if (activeSidebar === "calls") {
      getCallHistory();
    }
  }, [activeSidebar, getCallHistory]);

  const allItems = activeFilter === "groups" ? groups : users;

  const filteredItems = allItems.filter((item) => {
    const itemName = item.fullName || item.name || "";
    const matchesSearch = itemName.toLowerCase().includes(searchQuery.toLowerCase());
    // Only show item if it has a last message or is a group (groups always show for now)
    const hasHistory = item.lastMessage || item.isGroup;

    if (activeFilter === "unread") return matchesSearch && unreadCounts[item._id] > 0 && hasHistory;
    if (activeFilter === "groups") return matchesSearch; // Groups filter uses 'groups' array which are explicitly groups

    // For 'all', we only show items with history. 
    // To chat with a new user, one must use the "New Chat" button (ContactsSidebar).
    return matchesSearch && hasHistory;
  });

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full lg:w-[400px] border-r border-white/5 flex flex-col bg-[#0a0a0a] transition-all duration-200">

      {/* Minimalist Sidebar Header */}
      <div className="h-16 px-4 flex items-center justify-between shrink-0 sticky top-0 z-20 bg-[#0a0a0a]">
        <h1 className="text-[#e9edef] text-[22px] font-bold">
          {activeSidebar === "calls" ? "Calls" : "Chats"}
        </h1>
        <div className="flex items-center gap-4 text-[var(--wa-gray)]">
          {activeSidebar === "calls" ? (
            <PhoneIcon
              className="size-5 cursor-pointer hover:text-white transition-colors"
              onClick={() => toast("Select contact to call")}
            />
          ) : (
            <MessageSquarePlus
              className="size-5 cursor-pointer hover:text-white transition-colors"
              onClick={() => setActiveSidebar("contacts")}
            />
          )}
          <div className="relative group">
            <EllipsisVertical className="size-5 cursor-pointer hover:text-white transition-colors" />
            <div className="absolute right-0 top-10 w-48 bg-[#233138] rounded-lg shadow-2xl border border-white/5 hidden group-hover:block z-50 overflow-hidden">
              <div className="flex flex-col">
                <button
                  onClick={() => setIsGroupModalOpen(true)}
                  className="w-full text-left px-4 py-3 text-sm text-[#e9edef] hover:bg-white/5 flex items-center gap-3"
                >
                  <UserPlusIcon className="size-4" />
                  New group
                </button>
                <button
                  onClick={() => setActiveSidebar("settings")}
                  className="w-full text-left px-4 py-3 text-sm text-[#e9edef] hover:bg-white/5 flex items-center gap-3"
                >
                  <Settings className="size-4" />
                  Settings
                </button>
                <button
                  onClick={() => setIsPairModalOpen(true)}
                  className="w-full text-left px-4 py-3 text-sm text-[#e9edef] hover:bg-white/5 flex items-center gap-3"
                >
                  <MonitorUp className="size-4" />
                  Link a device
                </button>
                <button
                  onClick={() => {
                    if (window.deferredPrompt) {
                      window.deferredPrompt.prompt();
                      window.deferredPrompt.userChoice.then((choice) => {
                        if (choice.outcome === 'accepted') {
                          toast.success('PingMe installed! 🎉');
                        }
                        window.deferredPrompt = null;
                      });
                    } else if (window.matchMedia('(display-mode: standalone)').matches) {
                      toast.success('Already installed as PWA! ✅');
                    } else {
                      toast('Install option not available', { icon: 'ℹ️' });
                    }
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-[#e9edef] hover:bg-white/5 flex items-center gap-3"
                >
                  <Download className="size-4" />
                  Install App
                </button>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-3 text-sm text-[#e9edef] hover:bg-white/5 flex items-center gap-3 border-t border-white/5"
                >
                  <LogOut className="size-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 bg-[#0a0a0a]">
        <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-1.5 h-[40px] border border-white/5 group transition-all">
          <Search className="size-4 text-[var(--wa-gray)] group-focus-within:text-[var(--wa-teal)] transition-colors" />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="bg-transparent border-none outline-none text-[#e9edef] text-sm w-full placeholder-[var(--wa-gray)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Pills */}
      <div className="px-3 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
        {["All", "Unread", "Groups"].map((filter) => (
          <motion.button
            whileTap={{ scale: 0.95 }}
            key={filter}
            onClick={() => setActiveFilter(filter.toLowerCase())}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all
              ${activeFilter === filter.toLowerCase()
                ? "bg-[var(--wa-teal)] text-[#0a0a0a]"
                : "bg-[#1a1a1a] text-[var(--wa-gray)] hover:text-white"}`}
          >
            {filter}
          </motion.button>
        ))}
      </div>

      {/* Chat/Call List */}
      <div className="overflow-y-auto w-full flex-1 scrollbar-thin scrollbar-thumb-white/10">
        {activeSidebar === "calls" ? (
          calls.length === 0 ? (
            <div className="text-center text-zinc-500 py-10 px-6">
              <PhoneIcon className="size-12 mx-auto mb-4 opacity-20" />
              <p>No call history yet</p>
            </div>
          ) : (
            calls.map((call) => {
              const withUser = call?.callerId?._id === authUser?._id ? call?.receiverId : call?.callerId;
              const isOutgoing = call?.callerId?._id === authUser?._id;
              if (!withUser || typeof withUser === 'string') return null;

              return (
                <div
                  key={call._id}
                  className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-all border-b border-white/5 group"
                >
                  <div className="relative shrink-0">
                    <img
                      src={withUser.profilePic || "/avatar.png"}
                      alt={withUser.fullName || "User"}
                      className="size-12 object-cover rounded-full border border-white/10"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className="font-bold text-[#e9edef] truncate">{withUser.fullName || "Unknown"}</h3>
                      <span className="text-[10px] text-[var(--wa-gray)]">
                        {new Date(call.startedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[13px]">
                      {call.status === "missed" ? (
                        <PhoneIcon className="size-3 text-red-500" />
                      ) : isOutgoing ? (
                        <PhoneIcon className="size-3 text-emerald-500 rotate-[135deg]" />
                      ) : (
                        <PhoneIcon className="size-3 text-emerald-500" />
                      )}
                      <span className={`${call.status === "missed" ? "text-red-500" : "text-[var(--wa-gray)]"}`}>
                        {call.status === "missed" ? "Missed" : isOutgoing ? "Outgoing" : "Incoming"}
                      </span>
                      <span className="text-[var(--wa-gray)]">•</span>
                      <span className="text-[var(--wa-gray)]">
                        {call.type === "video" ? "Video" : "Voice"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => initiateCall(withUser._id, call.type)}
                    className="p-2 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {call.type === "video" ? <UsersIcon className="size-5" /> : <PhoneIcon className="size-5" />}
                  </button>
                </div>
              );
            })
          )
        ) : (
          <>
            <AnimatePresence initial={false}>
              {filteredItems.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={item._id}
                  onClick={() => setSelectedUser(item)}
                  className={`
                  w-full p-3 flex items-center gap-3
                  hover:bg-white/5 transition-all cursor-pointer border-b border-white/5
                  ${selectedUser?._id === item._id ? "bg-[#1a1a1a]" : ""}
                `}
                >
                  <div className="relative shrink-0">
                    <img
                      src={item.profilePic || "/avatar.png"}
                      alt={item.fullName || item.name}
                      className="size-11 object-cover rounded-full"
                    />
                    {!item.isGroup && onlineUsers.includes(item._id) && item.privacy?.lastSeen !== "nobody" && (
                      <span
                        className="absolute bottom-0 right-0 size-3 bg-emerald-500 
                      ring-2 ring-[#0a0a0a] rounded-full"
                      />
                    )}
                  </div>

                  {/* User/Group info */}
                  <div className="text-left min-w-0 flex-1 py-1">
                    <div className="flex justify-between items-center">
                      <div className={`font-bold truncate text-[15px] ${selectedUser?._id === item._id ? "text-[var(--wa-teal)]" : "text-[#e9edef]"}`}>
                        {item.fullName || item.name}
                      </div>
                      <span className={`text-[10px] ${!item.isGroup && unreadCounts[item._id] > 0 ? "text-emerald-500 font-bold" : "text-[var(--wa-gray)]"}`}>
                        {item.lastMessageTime ? new Date(item.lastMessageTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : ''}
                      </span>
                    </div>
                    <div className={`text-[12px] truncate flex items-center gap-1 ${!item.isGroup && unreadCounts[item._id] > 0 ? "text-emerald-500 font-medium" : "text-[var(--wa-gray)]"}`}>
                      {typingUsers.includes(item._id) ? (
                        <span className="text-emerald-500">typing...</span>
                      ) : (
                        (item.lastMessage && item.lastMessage.startsWith("U2FsdGVkX1") ? decryptMessage(item.lastMessage) : item.lastMessage) || "No messages yet"
                      )}
                    </div>
                  </div>

                  {/* Unread Badge */}
                  <div className="flex flex-col items-end justify-center min-w-[30px] gap-2 absolute right-4 top-1/2 -translate-y-1/2 h-full py-3">
                    <div className="flex flex-col items-end gap-2 h-full justify-between pb-1">
                      <div className="h-4"></div> {/* Spacer for time position */}
                      <div className="flex items-center gap-2">
                        {!item.isGroup && unreadCounts[item._id] > 0 && (
                          <span className="bg-[#00a884] text-[#111b21] text-[11px] font-bold rounded-full size-5 flex items-center justify-center shadow-lg">
                            {unreadCounts[item._id]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredItems.length === 0 && (
              <div className="text-center text-zinc-500 py-4">No {activeFilter === 'groups' ? 'groups' : 'users'} found</div>
            )}
          </>
        )}
      </div>

      <NewGroupModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} />
      <PairDeviceModal isOpen={isPairModalOpen} onClose={() => setIsPairModalOpen(false)} />
    </aside>
  );
};
export default Sidebar;
