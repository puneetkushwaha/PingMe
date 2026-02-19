import { MessageSquare, Users as UsersIcon, CircleDashed, Settings as SettingsIcon, Star, MessageCircle, Phone as PhoneIcon, Archive, LogOut, UserPlus } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const LeftNav = ({ className }) => {
    const { logout, authUser, setProfileOpen, isProfileOpen, activeSidebar, setSelectedUser, setActiveSidebar } = useAuthStore();
    const { selectedUser } = useChatStore();

    return (
        <div className={className}>
            {/* Desktop Left Nav */}
            <div className="hidden lg:flex w-[60px] h-full bg-[var(--wa-header-bg)] flex-col justify-between items-center py-4 border-r border-zinc-700/50 z-20">
                {/* Top Icons */}
                <div className="flex flex-col gap-6">
                    <div className="relative group cursor-pointer" onClick={() => setActiveSidebar("chats")}>
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-[#00a884] rounded-r-full ${activeSidebar === 'chats' && !isProfileOpen ? 'block' : 'hidden'}`}></div>
                        <MessageSquare className={`size-6 transition-colors ${activeSidebar === 'chats' && !isProfileOpen ? 'text-[#e9edef]' : 'text-[var(--wa-gray)] hover:text-[#e9edef]'}`} />
                    </div>

                    <div className="relative group cursor-pointer" onClick={() => setActiveSidebar("calls")}>
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-[#00a884] rounded-r-full ${activeSidebar === 'calls' && !isProfileOpen ? 'block' : 'hidden'}`}></div>
                        <PhoneIcon className={`size-6 transition-colors ${activeSidebar === 'calls' && !isProfileOpen ? 'text-[#e9edef]' : 'text-[var(--wa-gray)] hover:text-[#e9edef]'}`} />
                    </div>

                    <div className="relative group cursor-pointer" onClick={() => setActiveSidebar("status")}>
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-[#00a884] rounded-r-full ${activeSidebar === 'status' && !isProfileOpen ? 'block' : 'hidden'}`}></div>
                        <CircleDashed className={`size-6 transition-colors ${activeSidebar === 'status' && !isProfileOpen ? 'text-[#e9edef]' : 'text-[var(--wa-gray)] hover:text-[#e9edef]'}`} />
                    </div>

                    <div className="relative group cursor-pointer" onClick={() => setActiveSidebar("invite")}>
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-[#00a884] rounded-r-full ${activeSidebar === 'invite' && !isProfileOpen ? 'block' : 'hidden'}`}></div>
                        <UserPlus className={`size-6 transition-colors ${activeSidebar === 'invite' && !isProfileOpen ? 'text-[#e9edef]' : 'text-[var(--wa-gray)] hover:text-[#e9edef]'}`} title="Invite Friends" />
                    </div>
                </div>

                {/* Bottom Icons */}
                <div className="flex flex-col gap-6 items-center">
                    <div className="relative group cursor-pointer" onClick={() => setActiveSidebar("starred")}>
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-[#00a884] rounded-r-full ${activeSidebar === 'starred' ? 'block' : 'hidden'}`}></div>
                        <Star className={`size-6 transition-colors ${activeSidebar === 'starred' ? 'text-[#e9edef]' : 'text-[var(--wa-gray)] hover:text-[#e9edef]'}`} />
                    </div>

                    <div className="h-[1px] w-8 bg-zinc-700"></div>
                    <div className="relative group cursor-pointer" onClick={() => logout()}>
                        <LogOut className="size-6 text-[var(--wa-gray)] hover:text-[#e9edef] transition-colors" title="Logout" />
                    </div>
                    <div className="relative group cursor-pointer" onClick={() => setActiveSidebar("settings")}>
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-[#00a884] rounded-r-full ${activeSidebar === 'settings' ? 'block' : 'hidden'}`}></div>
                        <SettingsIcon className={`size-5 transition-colors ${activeSidebar === 'settings' ? 'text-[#e9edef]' : 'text-[var(--wa-gray)] hover:text-[#e9edef]'}`} title="Settings" />
                    </div>
                    <div className="relative group cursor-pointer" onClick={() => setProfileOpen(true)} title="Profile">
                        <img src={authUser?.profilePic || "/avatar.png"} className={`size-8 rounded-full object-cover transition-opacity ${isProfileOpen ? 'ring-2 ring-[#00a884]' : 'opacity-80 hover:opacity-100'}`} alt="Profile" />
                    </div>
                </div>
            </div>


            {/* Mobile Bottom Nav */}
            <div className={`lg:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-[#111b21]/95 backdrop-blur-md border-t border-zinc-700/50 flex items-center justify-around px-2 z-[60] pb-2 ${selectedUser ? 'hidden' : 'flex'}`}>
                <div className="flex flex-col items-center gap-1 cursor-pointer flex-1 py-2" onClick={() => setActiveSidebar("chats")}>
                    <div className={`p-1 px-4 rounded-full transition-all ${activeSidebar === 'chats' ? 'bg-[#00a884]/20 text-[#00a884]' : 'text-[var(--wa-gray)]'}`}>
                        <MessageSquare className="size-6" />
                    </div>
                    <span className={`text-[11px] font-medium ${activeSidebar === 'chats' ? 'text-[#e9edef]' : 'text-[var(--wa-gray)]'}`}>Chats</span>
                </div>
                <div className="flex flex-col items-center gap-1 cursor-pointer flex-1 py-2" onClick={() => setActiveSidebar("status")}>
                    <div className={`p-1 px-4 rounded-full transition-all ${activeSidebar === 'status' ? 'bg-[#00a884]/20 text-[#00a884]' : 'text-[var(--wa-gray)]'}`}>
                        <CircleDashed className="size-6" />
                    </div>
                    <span className={`text-[11px] font-medium ${activeSidebar === 'status' ? 'text-[#e9edef]' : 'text-[var(--wa-gray)]'}`}>Status</span>
                </div>
                <div className="flex flex-col items-center gap-1 cursor-pointer flex-1 py-2" onClick={() => setActiveSidebar("calls")}>
                    <div className={`p-1 px-4 rounded-full transition-all ${activeSidebar === 'calls' ? 'bg-[#00a884]/20 text-[#00a884]' : 'text-[var(--wa-gray)]'}`}>
                        <PhoneIcon className="size-5" />
                    </div>
                    <span className={`text-[11px] font-medium ${activeSidebar === 'calls' ? 'text-[#e9edef]' : 'text-[var(--wa-gray)]'}`}>Calls</span>
                </div>
                <div className="flex flex-col items-center gap-1 cursor-pointer flex-1 py-2" onClick={() => setActiveSidebar("invite")}>
                    <div className={`p-1 px-4 rounded-full transition-all ${activeSidebar === 'invite' ? 'bg-[#00a884]/20 text-[#00a884]' : 'text-[var(--wa-gray)]'}`}>
                        <UserPlus className="size-6" />
                    </div>
                    <span className={`text-[11px] font-medium ${activeSidebar === 'invite' ? 'text-[#e9edef]' : 'text-[var(--wa-gray)]'}`}>Invite</span>
                </div>
                <div className="flex flex-col items-center gap-1 cursor-pointer flex-1 py-2" onClick={() => setProfileOpen(true)}>
                    <div className={`p-1 px-4 rounded-full transition-all ${isProfileOpen ? 'bg-[#00a884]/20' : ''}`}>
                        <img src={authUser?.profilePic || "/avatar.png"} className={`size-6 rounded-full object-cover ${isProfileOpen ? 'ring-2 ring-[#00a884]' : ''}`} alt="" />
                    </div>
                    <span className={`text-[11px] font-medium ${isProfileOpen ? 'text-[#e9edef]' : 'text-[var(--wa-gray)]'}`}>Profile</span>
                </div>
            </div>
        </div>
    );
};

export default LeftNav;
