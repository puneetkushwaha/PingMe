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
  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="px-4 py-2 sm:px-4 sm:py-2.5 bg-[#0a0a0a] border-b border-white/5 sticky top-0 z-30 transition-all">
      <div className="flex items-center justify-between max-w-full mx-auto">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Back Button */}
          <button
            onClick={() => setSelectedUser(null)}
            className="lg:hidden p-1.5 hover:bg-white/5 rounded-full text-[var(--wa-gray)] active:scale-95 transition-all"
          >
            <ArrowLeft className="size-5" />
          </button>

          {/* User Info Click Area */}
          <div
            onClick={() => setIsContactInfoOpen(true)}
            className="flex items-center gap-2.5 p-1 hover:bg-white/5 rounded-lg cursor-pointer transition-all"
          >
            <div className="relative">
              <img
                src={selectedUser.profilePic || selectedUser.groupPic || "/avatar.png"}
                alt={selectedUser.fullName || selectedUser.name}
                className="size-9 sm:size-10 object-cover rounded-full"
              />
              {!selectedUser.isGroup && isOnline && (
                <span className="absolute bottom-0 right-0 size-2.5 bg-emerald-500 ring-2 ring-[#0a0a0a] rounded-full" />
              )}
            </div>

            <div className="min-w-0">
              <h3 className="font-bold text-[#e9edef] text-[15px] sm:text-[16px] truncate leading-tight">
                {selectedUser.fullName || selectedUser.name}
              </h3>
              <p className="text-[11px] sm:text-[12px] text-[var(--wa-gray)]">
                {typingUsers.includes(selectedUser._id) ? (
                  <span className="text-emerald-500 italic">typing...</span>
                ) : selectedUser.isGroup ? (
                  "Group Chat"
                ) : isOnline ? (
                  <span className="text-emerald-500 font-bold uppercase text-[9px]">Online</span>
                ) : (
                  <>Last seen {formatLastSeen(selectedUser.lastSeen)}</>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2 relative">
          {isSearchOpen && (
            <div className="absolute right-full mr-2 flex items-center bg-[#1a1a1a] rounded-lg px-3 h-8 w-40 sm:w-56 border border-white/5 shadow-xl animate-in fade-in slide-in-from-right-2 duration-200">
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-white text-xs w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <XIcon
                className="size-3.5 text-[var(--wa-gray)] cursor-pointer hover:text-white"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
              />
            </div>
          )}

          <button
            onClick={() => setIsSearchOpen(true)}
            className={`p-2 rounded-full hover:bg-white/5 ${isSearchOpen ? 'text-[var(--wa-teal)]' : 'text-[var(--wa-gray)]'}`}
          >
            <Search className="size-4.5" />
          </button>

          <button
            onClick={() => initiateCall(selectedUser._id, "audio")}
            className="p-2 text-[var(--wa-gray)] hover:bg-white/5 hover:text-white rounded-full transition-all"
          >
            <Phone className="size-4.5" />
          </button>
          <button
            onClick={() => initiateCall(selectedUser._id, "video")}
            className="p-2 text-[var(--wa-gray)] hover:bg-white/5 hover:text-white rounded-full transition-all"
          >
            <Video className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
