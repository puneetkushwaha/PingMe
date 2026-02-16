import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, CircleDashed, MessageSquarePlus, EllipsisVertical, Search, Filter, Archive, LogOut, UserPlus, Settings } from "lucide-react";
import toast from "react-hot-toast";
import NewGroupModal from "./NewGroupModal";

const Sidebar = () => {
  const { getUsers, users, getGroups, groups, selectedUser, setSelectedUser, isUsersLoading, isGroupsLoading, unreadCounts, typingUsers } = useChatStore();
  const { onlineUsers, logout, setActiveSidebar } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'unread', 'groups'
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  useEffect(() => {
    getUsers();
    getGroups();
  }, [getUsers, getGroups]);

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
        <h1 className="text-[#e9edef] text-[22px] font-bold">Chats</h1>
        <div className="flex items-center gap-4 text-[var(--wa-gray)]">
          <MessageSquarePlus
            className="size-5 cursor-pointer hover:text-white transition-colors"
            onClick={() => setActiveSidebar("contacts")}
          />
          <div className="relative group">
            <EllipsisVertical className="size-5 cursor-pointer hover:text-white transition-colors" />
            <div className="absolute right-0 top-10 w-48 bg-[#233138] rounded-lg shadow-2xl border border-white/5 hidden group-hover:block z-50 overflow-hidden">
              <div className="flex flex-col">
                <button
                  onClick={() => setIsGroupModalOpen(true)}
                  className="w-full text-left px-4 py-3 text-sm text-[#e9edef] hover:bg-white/5 flex items-center gap-3"
                >
                  <UserPlus className="size-4" />
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
          <button
            key={filter}
            onClick={() => setActiveFilter(filter.toLowerCase())}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all
              ${activeFilter === filter.toLowerCase()
                ? "bg-[var(--wa-teal)] text-[#0a0a0a]"
                : "bg-[#1a1a1a] text-[var(--wa-gray)] hover:text-white"}`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Chat List */}
      <div className="overflow-y-auto w-full flex-1">
        {filteredItems.map((item) => (
          <div
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
              {!item.isGroup && onlineUsers.includes(item._id) && (
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
                <span className="text-[10px] text-[var(--wa-gray)]">10:30 AM</span>
              </div>
              <div className="text-[12px] truncate flex items-center gap-1 text-[var(--wa-gray)]">
                {typingUsers.includes(item._id) ? (
                  <span className="text-emerald-500">typing...</span>
                ) : (
                  item.lastMessage || "No messages yet"
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
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No {activeFilter === 'groups' ? 'groups' : 'users'} found</div>
        )}
      </div>

      <NewGroupModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} />
    </aside>
  );
};
export default Sidebar;
