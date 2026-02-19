import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Search, Phone, Video, X as XIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";
import { formatLastSeen } from "../lib/utils";

const ChatHeader = () => {
  const {
    selectedUser,
    setSelectedUser,
    typingUsers,
    clearMessages,
    isContactInfoOpen,
    setIsContactInfoOpen,
    searchQuery,
    setSearchQuery
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { initiateCall } = useCallStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  if (!selectedUser) return null;

  const isTyping = selectedUser && typingUsers.includes(selectedUser._id);
  const isOnline = onlineUsers.includes(selectedUser._id) && selectedUser.privacy?.lastSeen !== "nobody";

  return (
    <div className="px-1 py-1 sm:px-2 sm:py-2 bg-[#0a0a0a] border-b border-white/5 sticky top-0 z-30 w-full overflow-hidden">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-0.5 overflow-hidden flex-1 min-w-0">
          {/* Back Button */}
          <button
            onClick={() => setSelectedUser(null)}
            className="lg:hidden p-1 hover:bg-white/5 rounded-full text-[var(--wa-gray)] active:scale-95 transition-all shrink-0"
          >
            <ArrowLeft className="size-5" />
          </button>

          {/* User Info Click Area */}
          <div
            onClick={() => setIsContactInfoOpen(true)}
            className="flex items-center gap-1 p-0.5 hover:bg-white/5 rounded-lg cursor-pointer transition-all min-w-0 flex-1 overflow-hidden"
          >
            <div className="relative shrink-0">
              <img
                src={selectedUser.profilePic || selectedUser.groupPic || "/avatar.png"}
                alt={selectedUser.fullName || selectedUser.name}
                className="size-8 sm:size-10 object-cover rounded-full"
              />
              {!selectedUser.isGroup && isOnline && (
                <span className="absolute bottom-0 right-0 size-2 bg-emerald-500 ring-1 ring-[#0a0a0a] rounded-full" />
              )}
            </div>

            <div className="min-w-0 overflow-hidden flex-1">
              <h3 className="font-bold text-[#e9edef] text-[13px] sm:text-[16px] truncate leading-tight">
                {selectedUser.fullName || selectedUser.name}
              </h3>
              <p className="text-[9px] sm:text-[11px] text-[var(--wa-gray)] truncate leading-tight">
                {isTyping ? (
                  <span className="text-emerald-500 italic">typing...</span>
                ) : selectedUser.isGroup ? (
                  "Group Chat"
                ) : isOnline ? (
                  <span className="text-emerald-500 font-bold uppercase text-[8px]">Online</span>
                ) : (
                  selectedUser.privacy?.lastSeen !== "nobody" && selectedUser.lastSeen ? <>Last seen {formatLastSeen(selectedUser.lastSeen)}</> : null
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-0 relative shrink-0 ml-1">
          {isSearchOpen && (
            <div className="absolute right-full mr-1 flex items-center bg-[#1a1a1a] rounded-lg px-1.5 h-7 w-24 sm:w-56 border border-white/5 shadow-xl z-50">
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-white text-[10px] w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <XIcon
                className="size-3 text-[var(--wa-gray)] cursor-pointer hover:text-white"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
              />
            </div>
          )}

          <button
            onClick={() => setIsSearchOpen(true)}
            className={`p-1 rounded-full hover:bg-white/5 ${isSearchOpen ? 'text-[var(--wa-teal)]' : 'text-[var(--wa-gray)]'}`}
          >
            <Search className="size-4" />
          </button>

          <button
            onClick={() => initiateCall(selectedUser._id, "audio")}
            className="p-1 text-[var(--wa-gray)] hover:bg-white/5 hover:text-white rounded-full transition-all"
          >
            <Phone className="size-4" />
          </button>
          <button
            onClick={() => initiateCall(selectedUser._id, "video")}
            className="p-1 text-[var(--wa-gray)] hover:bg-white/5 hover:text-white rounded-full transition-all"
          >
            <Video className="size-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
