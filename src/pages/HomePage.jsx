import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import {
  MessageSquare, Users, CircleDashed, Settings, Star, MessageCircle,
  Phone, Archive, LogOut, UserPlus, Video,
  Plus, Moon, Sun, Wallpaper, MessageSquarePlus,
  Send, Bell, Shield, Lock, Smartphone, Image as ImageIcon, Volume2
} from "lucide-react";

const WALLPAPERS = [
  { id: "obsidian", name: "Default Obsidian", url: "https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png" },
  { id: "midnight", name: "Midnight Blue", url: "https://i.pinimg.com/originals/97/21/05/972105c5a775f38cf33d3924a05d8b57.jpg" },
  { id: "forest", name: "Deep Forest", url: "https://i.pinimg.com/originals/24/76/65/247665796a5789f6df849646f2c5890e.jpg" },
  { id: "minimal", name: "Minimal Gray", url: "https://wallpaperaccess.com/full/1556608.jpg" },
  { id: "abstract", name: "Dark Abstract", url: "https://wallpaperaccess.com/full/2109.jpg" },
  { id: "black", name: "Pure Black", url: "" }, // Empty string for CSS background color fallback
];
import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";
import LeftNav from "../components/LeftNav";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import ProfileSettings from "../components/ProfileSettings";
import StatusViewer from "../components/StatusViewer";
import InviteSidebar from "../components/InviteSidebar";
import ContactsSidebar from "../components/ContactsSidebar";
import ContactInfoSidebar from "../components/ContactInfoSidebar";

import { useCallStore } from "../store/useCallStore";

const HomePage = () => {
  const [activeStatus, setActiveStatus] = useState(null);
  const {
    selectedUser,
    setSelectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    starredMessages,
    archivedUsers,
    users,
    toggleArchiveUser,
    statuses,
    getStatuses,
    uploadStatus,
    isContactInfoOpen,
    blockUser,
  } = useChatStore();

  const { initiateCall } = useCallStore();

  const { activeSidebar, authUser, setProfileOpen, onlineUsers, setActiveSidebar } = useAuthStore();
  const { theme, setTheme, wallpaper, setWallpaper } = useThemeStore();

  useEffect(() => {
    if (activeSidebar === "status") getStatuses();
  }, [activeSidebar, getStatuses]);

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [subscribeToMessages, unsubscribeFromMessages]);

  return (
    <div className="h-[100dvh] w-full bg-[var(--wa-chat-bg)] flex overflow-hidden flex-col lg:flex-row relative">
      {/* Left/Bottom Navigation */}
      <LeftNav className={`${selectedUser ? 'hidden' : 'flex'} lg:flex`} />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative lg:pb-0">
        <ProfileSettings />

        {/* Sidebar Sections */}
        <div className={`h-full w-full lg:w-[400px] shrink-0 border-r border-[var(--wa-header-bg)] ${selectedUser ? 'hidden lg:flex' : 'flex'} flex-col bg-[var(--wa-sidebar-bg)] pb-16 lg:pb-0`}>

          {activeSidebar === "chats" && <Sidebar />}

          {activeSidebar === "contacts" && <ContactsSidebar />}

          {activeSidebar === "status" && (
            <div className="flex-1 flex flex-col">
              <div className="p-4 bg-[var(--wa-sidebar-bg)] h-16 flex items-center justify-between shrink-0">
                <h1 className="text-[#e9edef] text-[22px] font-bold">Status</h1>
                <div className="flex items-center gap-3 text-[var(--wa-gray)]">
                  <CircleDashed className="size-5 cursor-pointer hover:text-white" />
                  <label className="cursor-pointer hover:text-white">
                    <Plus className="size-6" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => uploadStatus({ type: "image", content: reader.result });
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="flex items-center gap-4 cursor-pointer p-2 hover:bg-white/5 rounded-lg transition-colors" onClick={() => toast("Upload Status")}>
                  <div className="relative">
                    <img src={authUser.profilePic || "/avatar.png"} className="size-12 rounded-full border-2 border-[#00a884] p-0.5" alt="" />
                    <div className="absolute -bottom-1 -right-1 bg-[#00a884] rounded-full p-1 border-2 border-[var(--wa-sidebar-bg)]">
                      <Plus className="size-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[#e9edef] font-medium">My Status</h3>
                    <p className="text-xs text-[var(--wa-gray)]">Tap to add status update</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[#00a884] text-sm font-medium uppercase px-2">Recent Updates</h4>
                  {statuses.length === 0 ? (
                    <div className="text-[var(--wa-gray)] text-center py-10 text-sm italic">No status updates yet</div>
                  ) : (
                    statuses.map((item) => {
                      if (!item.user) return null;
                      return (
                        <div
                          key={item.user._id}
                          className="flex items-center gap-4 cursor-pointer p-2 hover:bg-white/5 rounded-lg transition-colors group"
                          onClick={() => setActiveStatus(item)}
                        >
                          <div className="size-12 rounded-full border-2 border-emerald-500 p-0.5">
                            <img src={item.user.profilePic || "/avatar.png"} className="w-full h-full rounded-full object-cover" alt="" />
                          </div>
                          <div className="flex-1 border-b border-zinc-800 pb-3 group-last:border-none">
                            <h3 className="text-[#e9edef] font-medium">{item.user.fullName}</h3>
                            <p className="text-xs text-[var(--wa-gray)]">Today at {new Date(item.statuses[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSidebar === "calls" && (
            <div className="flex-1 flex flex-col">
              <div className="p-4 bg-[var(--wa-sidebar-bg)] h-16 flex items-center justify-between shrink-0">
                <h1 className="text-[#e9edef] text-[22px] font-bold">Calls</h1>
                <Phone className="size-5 text-[var(--wa-gray)] cursor-pointer hover:text-white" onClick={() => toast("Select contact to call")} />
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="flex items-center gap-4 cursor-pointer p-4 bg-[#00a884]/10 rounded-lg border border-[#00a884]/20 hover:bg-[#00a884]/20 transition-colors group">
                  <div className="size-12 bg-[#00a884] rounded-full flex items-center justify-center text-[#111b21]">
                    <Phone className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-[#00a884] font-bold">Start a Call</h3>
                    <p className="text-xs text-[var(--wa-gray)]">Voice or video chat with your friends</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[#00a884] text-sm font-medium uppercase px-2">Available Now</h4>
                  {users.filter(u => onlineUsers.includes(u._id)).length === 0 ? (
                    <div className="text-[var(--wa-gray)] text-center py-10 text-sm italic">No one online to call right now</div>
                  ) : (
                    users.filter(u => onlineUsers.includes(u._id)).map((user) => (
                      <div key={user._id} className="flex items-center gap-4 p-2 hover:bg-white/5 rounded-lg transition-colors group">
                        <img src={user.profilePic || "/avatar.png"} className="size-12 rounded-full object-cover" alt="" />
                        <div className="flex-1 border-b border-zinc-800 pb-3 group-last:border-none flex items-center justify-between">
                          <div>
                            <h3 className="text-[#e9edef] font-medium">{user.fullName}</h3>
                            <p className="text-xs text-emerald-500">Available</p>
                          </div>
                          <div className="flex gap-4">
                            <button onClick={() => initiateCall(user._id, 'audio')} className="p-2 text-[#00a884] hover:bg-[#00a884]/10 rounded-full transition-colors"><Phone className="size-5" /></button>
                            <button onClick={() => initiateCall(user._id, 'video')} className="p-2 text-[#00a884] hover:bg-[#00a884]/10 rounded-full transition-colors"><Video className="size-5" /></button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSidebar === "invite" && <InviteSidebar />}

          {activeSidebar === "starred" && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h1 className="text-[#e9edef] text-[22px] font-bold mb-6 px-2">Starred Messages</h1>
              <div className="flex flex-col gap-3 px-2">
                {starredMessages.length === 0 ? (
                  <div className="text-[var(--wa-gray)] text-center py-10">No starred messages yet</div>
                ) : (
                  starredMessages.map((msg) => (
                    <div key={msg._id} className="bg-[var(--wa-header-bg)] p-3 rounded-lg border border-zinc-700/50">
                      <p className="text-sm text-[#e9edef] mb-1">{msg.text}</p>
                      <p className="text-[10px] text-[var(--wa-gray)] text-right">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeSidebar === "settings" && (
            <div className="flex-1 flex flex-col bg-[#0a0a0a] overflow-hidden">
              <div className="p-4 bg-[var(--wa-sidebar-bg)] h-16 flex items-center shrink-0 border-b border-white/5">
                <h1 className="text-[#e9edef] text-[22px] font-bold">Settings</h1>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* 1. Account Info */}
                <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setProfileOpen(true)}>
                  <div className="flex items-center gap-4">
                    <img src={authUser?.profilePic || "/avatar.png"} alt="Profile" className="size-14 rounded-full object-cover" />
                    <div>
                      <h2 className="text-lg font-bold text-white">{authUser?.fullName}</h2>
                      <p className="text-sm text-[var(--wa-gray)]">{authUser?.email}</p>
                    </div>
                  </div>
                </div>

                {/* 2. Chat Wallpaper */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[var(--wa-teal)] px-1">
                    <ImageIcon className="size-4" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--wa-teal)]">Chat Wallpaper</h2>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {WALLPAPERS.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => setWallpaper(w.url)}
                        className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${wallpaper === w.url ? "border-[var(--wa-teal)]" : "border-transparent hover:border-white/20"}`}
                      >
                        {w.url ? (
                          <img src={w.url} alt={w.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#050505]"></div>
                        )}
                        {wallpaper === w.url && (
                          <div className="absolute top-1 right-1 bg-[var(--wa-teal)] rounded-full p-0.5">
                            <div className="size-1.5 bg-white rounded-full" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Notifications */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[var(--wa-teal)] px-1">
                    <Bell className="size-4" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--wa-teal)]">Notifications</h2>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5 divide-y divide-white/5">
                    <div className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <Volume2 className="size-5 text-[var(--wa-gray)]" />
                        <div>
                          <h3 className="text-[#e9edef] font-medium text-sm">Message Sounds</h3>
                        </div>
                      </div>
                      <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked />
                    </div>
                    <div className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <Smartphone className="size-5 text-[var(--wa-gray)]" />
                        <div>
                          <h3 className="text-[#e9edef] font-medium text-sm">Vibration</h3>
                        </div>
                      </div>
                      <input type="checkbox" className="toggle toggle-success toggle-sm" />
                    </div>
                  </div>
                </div>

                {/* 4. Privacy & Security */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[var(--wa-teal)] px-1">
                    <Shield className="size-4" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--wa-teal)]">Privacy</h2>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5 divide-y divide-white/5">
                    <div className="p-3 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <Lock className="size-5 text-[var(--wa-gray)]" />
                        <div>
                          <h3 className="text-[#e9edef] font-medium text-sm">Blocked Contacts</h3>
                          <p className="text-xs text-[var(--wa-gray)]">{authUser?.blockedUsers?.length || 0} contacts</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Display Area */}
        <div className={`flex-1 h-full relative ${!selectedUser ? 'hidden lg:flex' : 'flex'}`}>
          {!selectedUser ? <NoChatSelected /> : <ChatContainer />}

          {selectedUser && isContactInfoOpen && (
            <div className="absolute top-0 right-0 h-full w-full lg:w-[400px] z-50 animate-in slide-in-from-right duration-300">
              <ContactInfoSidebar />
            </div>
          )}
        </div>

        {activeStatus && (
          <StatusViewer
            statusItem={activeStatus}
            onClose={() => setActiveStatus(null)}
          />
        )}

        {/* Mobile Floating Action Button */}
        {!selectedUser && (activeSidebar === "chats" || activeSidebar === "calls") && (
          <button
            className="lg:hidden fixed bottom-20 right-4 size-14 bg-[#00a884] rounded-full shadow-2xl flex items-center justify-center text-[#111b21] hover:scale-105 active:scale-95 transition-all z-50 border-2 border-[#111b21]"
            onClick={() => {
              if (activeSidebar === "chats") setActiveSidebar("contacts");
              else toast("Starting a call...");
            }}
          >
            {activeSidebar === "chats" ? <MessageSquarePlus className="size-6" /> : <Phone className="size-6" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default HomePage;
