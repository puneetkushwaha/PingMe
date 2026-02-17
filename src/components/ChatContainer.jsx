import { useThemeStore } from "../store/useThemeStore"; // Import useThemeStore
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { Check, CheckCheck, FileText, Smile, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    searchQuery,
    addReaction,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const { wallpaper } = useThemeStore(); // Get wallpaper from store
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const filteredMessages = messages.filter((message) => {
    if (!searchQuery.trim()) return true;
    return message.text?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto bg-[#0b141a]">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  let lastDate = "";

  return (
    <div
      className="flex-1 flex flex-col overflow-auto relative bg-[#0b141a]"
      style={{
        backgroundImage: wallpaper ? `url(${wallpaper})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
        backgroundColor: wallpaper ? 'rgba(11, 20, 26, 0.9)' : '#0b141a' // Blend with base color for readability
      }}
    >
      <ChatHeader />

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 space-y-4 relative z-10 scrollbar-thin scrollbar-thumb-white/10">
        <AnimatePresence initial={false}>
          {filteredMessages.map((message) => {
            const isSentByMe = message.senderId === authUser._id;
            const messageDate = new Date(message.createdAt).toLocaleDateString();
            const isNewDay = lastDate !== messageDate;
            lastDate = messageDate;

            return (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {isNewDay && (
                  <div className="flex justify-center my-4">
                    <span className="bg-[#1a1a1a] text-[var(--wa-gray)] text-[11px] px-2 py-1 rounded font-bold uppercase">
                      {new Date(message.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )}
                <div
                  className={`flex flex-col ${isSentByMe ? "items-end" : "items-start"}`}
                  ref={messageEndRef}
                >
                  <div
                    className={`chat-bubble p-2 sm:p-2.5 relative shadow-sm group ${isSentByMe
                      ? "text-[#e9edef] chat-bubble-sent"
                      : "text-[#e9edef] chat-bubble-received"
                      }`}
                  >
                    {/* Sender Name in Group */}
                    {!isSentByMe && selectedUser.isGroup && (
                      <div className="text-[11px] font-bold text-emerald-400 mb-0.5">
                        {message.senderName || "Member"}
                      </div>
                    )}

                    {/* Message Content */}
                    <div className="flex flex-col gap-1.5">
                      {message.image && (
                        <img
                          src={message.image}
                          alt="Attachment"
                          className="max-w-[240px] sm:max-w-[280px] rounded mb-0.5 cursor-pointer"
                          onClick={() => window.open(message.image, "_blank")}
                        />
                      )}
                      {message.file && (
                        <div className="flex items-center gap-2.5 bg-black/10 p-2 rounded border border-white/5 cursor-pointer">
                          <div className="bg-[#00a884] p-1.5 rounded">
                            <FileText className="size-4 text-white" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[12px] font-medium truncate max-w-[140px] text-white/90">{message.fileName || "File"}</span>
                          </div>
                        </div>
                      )}
                      {message.audio && (
                        <div className="bg-black/10 p-1.5 rounded min-w-[180px]">
                          <audio controls className="h-7 w-full" src={message.audio} />
                        </div>
                      )}
                      {message.type === "location" && message.location && (
                        <div
                          className="flex flex-col gap-2 bg-[#202c33] rounded-lg overflow-hidden border border-white/5 cursor-pointer hover:bg-[#2a3942] transition-all min-w-[200px]"
                          onClick={() => window.open(`https://www.google.com/maps?q=${message.location.lat},${message.location.lng}`, "_blank")}
                        >
                          <div className="h-32 bg-[#0b141a] relative flex items-center justify-center">
                            <MapPin className="size-10 text-red-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#202c33] to-transparent opacity-50" />
                          </div>
                          <div className="p-3 flex flex-col gap-1">
                            <span className="text-[14px] font-bold text-[var(--wa-teal)]">Live Location</span>
                            <span className="text-[12px] text-zinc-400">Click to view on Google Maps</span>
                          </div>
                        </div>
                      )}

                      {message.type === "contact" && message.contact && (
                        <div className="flex flex-col gap-3 bg-[#202c33] p-3 rounded-lg border border-white/5 min-w-[220px]">
                          <div className="flex items-center gap-3">
                            <img
                              src={message.contact.profilePic || "/avatar.png"}
                              className="size-12 rounded-full border border-white/10 object-cover"
                              alt=""
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-[#e9edef] font-bold text-[15px] truncate">{message.contact.fullName}</p>
                              <p className="text-[12px] text-zinc-400 truncate">{message.contact.phone}</p>
                            </div>
                          </div>
                          <button
                            className="w-full py-2 bg-white/5 rounded text-[13px] font-bold text-[var(--wa-teal)] hover:bg-white/10 transition-colors border-t border-white/5"
                            onClick={() => toast.success(`Contact ${message.contact.fullName} added (Simulated)`)}
                          >
                            Message
                          </button>
                        </div>
                      )}

                      {message.text && (
                        <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">
                          {message.text}
                        </p>
                      )}
                    </div>

                    {/* Reactions Display */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1 -ml-1">
                        {message.reactions.map((reaction, idx) => (
                          <span key={idx} className="bg-black/30 text-[10px] px-1.5 py-0.5 rounded-full text-white/90 backdrop-blur-sm border border-white/10">
                            {reaction.emoji}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Timestamp & Status */}
                    <div className={`flex items-center justify-end gap-1 mt-0.5`}>
                      <span className="text-[9px] text-white/30 font-bold">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {isSentByMe && (
                        <span className="flex items-center">
                          {message.status === "seen" || (message.readBy && message.readBy.length > 0) ? (
                            <CheckCheck className="size-3 text-[#53bdeb]" />
                          ) : (
                            <Check className="size-3 text-white/20" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reaction Button (Visible on Hover) */}
                  <div className={`opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 ${isSentByMe ? '-left-8' : '-right-8'} z-20`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Trigger generic emoji picker in a modal or popover (simplified for now to just show alert or we need a proper popover state)
                        const emoji = prompt("Enter an emoji to react:");
                        if (emoji) addReaction(message._id, emoji);
                      }}
                      className="p-1 bg-[#202c33] rounded-full text-[var(--wa-gray)] hover:text-white shadow-lg border border-white/5"
                    >
                      <Smile className="size-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
