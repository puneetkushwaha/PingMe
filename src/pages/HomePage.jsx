import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import {
  MessageSquare, Users, CircleDashed, Settings, Star, MessageCircle,
  Phone, Archive, LogOut, UserPlus, Video,
  Plus, Moon, Sun, Wallpaper, MessageSquarePlus,
  Send, Bell, Shield, Lock, Smartphone, Image as ImageIcon, Volume2, Download
} from "lucide-react";

const WALLPAPERS = [
  { id: "obsidian", name: "Default Obsidian", url: "https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png" },
  { id: "minimal", name: "Minimal Gray", url: "https://wallpaperaccess.com/full/1556608.jpg" },
  { id: "abstract", name: "Dark Abstract", url: "https://wallpaperaccess.com/full/2109.jpg" },
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
import SettingsSidebarSection from "../components/SettingsSidebarSection";

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

  const { initiateCall, calls, getCallHistory } = useCallStore();

  const { activeSidebar, authUser, setProfileOpen, onlineUsers, setActiveSidebar } = useAuthStore();
  const { theme, setTheme, wallpaper, setWallpaper } = useThemeStore();

  useEffect(() => {
    if (activeSidebar === "status") getStatuses();
    if (activeSidebar === "calls") getCallHistory();
  }, [activeSidebar, getStatuses, getCallHistory]);

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


          {(activeSidebar === "chats" || activeSidebar === "calls") && <Sidebar />}

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
            <div className="flex-1 flex flex-col bg-[#111b21] overflow-hidden animate-in slide-in-from-left duration-200">
              <SettingsSidebarSection onBack={() => setActiveSidebar("chats")} />
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
