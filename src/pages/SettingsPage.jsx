import { useState } from "react";
import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import {
    Send, Bell, Shield, Lock, Smartphone, Image as ImageIcon,
    Volume2, Moon, ArrowLeft, Key, User, HelpCircle, LogOut,
    ChevronRight, CircleUser, Languages, Database, Accessibility
} from "lucide-react";

const WALLPAPERS = [
    { id: "obsidian", name: "Default Obsidian", url: "https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png" },
    { id: "midnight", name: "Midnight Blue", url: "https://i.pinimg.com/originals/97/21/05/972105c5a775f38cf33d3924a05d8b57.jpg" },
    { id: "forest", name: "Deep Forest", url: "https://i.pinimg.com/originals/24/76/65/247665796a5789f6df849646f2c5890e.jpg" },
    { id: "minimal", name: "Minimal Gray", url: "https://wallpaperaccess.com/full/1556608.jpg" },
    { id: "abstract", name: "Dark Abstract", url: "https://wallpaperaccess.com/full/2109.jpg" },
    { id: "black", name: "Pure Black", url: "" },
];

const SettingsPage = () => {
    const { wallpaper, setWallpaper, theme, setTheme } = useThemeStore();
    const { authUser, logout } = useAuthStore();
    const { blockUser } = useChatStore();
    const [activeSection, setActiveSection] = useState("main"); // "main", "account", "privacy", "chats", "notifications", "help"

    const renderMainSettings = () => (
        <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Profile Card */}
            <div
                className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer transition-colors"
                onClick={() => setActiveSection("account")}
            >
                <div className="size-16 rounded-full overflow-hidden bg-white/10 ring-1 ring-white/5">
                    <img src={authUser?.profilePic || "/avatar.png"} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">{authUser?.fullName}</h2>
                    <p className="text-[var(--wa-gray)] text-sm line-clamp-1 italic">{authUser?.about || "Hey there! I am using PingMe."}</p>
                </div>
                <ChevronRight className="size-5 text-[var(--wa-gray)]" />
            </div>

            <div className="h-[1px] bg-white/5 mx-4 my-2" />

            {/* Main Options */}
            <div className="space-y-1">
                <OptionItem
                    icon={<Key className="size-6" />}
                    title="Account"
                    subtitle="Security notifications, change number"
                    onClick={() => setActiveSection("account")}
                />
                <OptionItem
                    icon={<Lock className="size-6" />}
                    title="Privacy"
                    subtitle="Block contacts, disappearing messages"
                    onClick={() => setActiveSection("privacy")}
                />
                <OptionItem
                    icon={<CircleUser className="size-6" />}
                    title="Avatar"
                    subtitle="Create, edit, profile photo"
                />
                <OptionItem
                    icon={<ImageIcon className="size-6" />}
                    title="Chats"
                    subtitle="Theme, wallpapers, chat history"
                    onClick={() => setActiveSection("chats")}
                />
                <OptionItem
                    icon={<Bell className="size-6" />}
                    title="Notifications"
                    subtitle="Message, group & call tones"
                    onClick={() => setActiveSection("notifications")}
                />
                <OptionItem
                    icon={<Database className="size-6" />}
                    title="Storage and data"
                    subtitle="Network usage, auto-download"
                />
                <OptionItem
                    icon={<Accessibility className="size-6" />}
                    title="Accessibility"
                    subtitle="Increase contrast, animation"
                />
                <OptionItem
                    icon={<Languages className="size-6" />}
                    title="App language"
                    subtitle="English (device's language)"
                />
                <OptionItem
                    icon={<HelpCircle className="size-6" />}
                    title="Help"
                    subtitle="Help center, contact us, privacy policy"
                    onClick={() => setActiveSection("help")}
                />
                <OptionItem
                    icon={<CircleUser className="size-6" />}
                    title="Invite a friend"
                    subtitle=""
                />
                <div className="p-4 flex items-center gap-4 text-red-500 hover:bg-white/5 cursor-pointer transition-colors" onClick={logout}>
                    <LogOut className="size-6" />
                    <span className="font-medium">Logout</span>
                </div>
            </div>
        </div>
    );

    const renderAccount = () => (
        <SubSectionLayout title="Account" onBack={() => setActiveSection("main")}>
            <div className="space-y-4 p-4">
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/5">
                    <h3 className="text-[#00a884] font-medium mb-4">Security</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white">Security notifications</p>
                                <p className="text-xs text-[var(--wa-gray)]">Get notified when your security code changes</p>
                            </div>
                            <input type="checkbox" className="toggle toggle-success toggle-sm" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white">Two-step verification</p>
                                <p className="text-xs text-[var(--wa-gray)]">Add extra security to your account</p>
                            </div>
                            <ChevronRight className="size-5 text-[var(--wa-gray)]" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/5">
                    <h3 className="text-[#00a884] font-medium mb-4">Personal Info</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-[var(--wa-gray)] text-xs">Email</p>
                            <p className="text-white">{authUser?.email}</p>
                        </div>
                        <div>
                            <p className="text-[var(--wa-gray)] text-xs">Joined</p>
                            <p className="text-white">{new Date(authUser?.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </SubSectionLayout>
    );

    const renderPrivacy = () => (
        <SubSectionLayout title="Privacy" onBack={() => setActiveSection("main")}>
            <div className="space-y-4 p-4">
                <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5">
                    <div className="p-4 border-b border-white/5">
                        <h3 className="text-[#00a884] font-medium mb-4">Who can see my info</h3>
                        <div className="space-y-6">
                            <PrivacyItem title="Last seen and online" value="Everyone" />
                            <PrivacyItem title="Profile photo" value="Everyone" />
                            <PrivacyItem title="About" value="Everyone" />
                            <PrivacyItem title="Status" value="My contacts" />
                        </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-white">Read receipts</p>
                            <p className="text-xs text-[var(--wa-gray)]">If turned off, you won't send or receive read receipts.</p>
                        </div>
                        <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked />
                    </div>
                </div>

                <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
                    <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => {/* Navigate to blocked list if we had one */ }}
                    >
                        <div>
                            <p className="text-white">Blocked contacts</p>
                            <p className="text-xs text-[var(--wa-gray)]">{authUser?.blockedUsers?.length || 0} contacts</p>
                        </div>
                        <ChevronRight className="size-5 text-[var(--wa-gray)]" />
                    </div>
                </div>
            </div>
        </SubSectionLayout>
    );

    const renderChats = () => (
        <SubSectionLayout title="Chats" onBack={() => setActiveSection("main")}>
            <div className="space-y-6 p-4">
                <div>
                    <h3 className="text-[#00a884] font-medium mb-4 ml-2">Display</h3>
                    <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5">
                        <div className="p-4 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <Moon className="size-5 text-[var(--wa-gray)]" />
                                <div>
                                    <p className="text-white">Theme</p>
                                    <p className="text-xs text-[var(--wa-gray)]">{theme === 'dark' ? 'Dark' : 'Light'}</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                className="toggle toggle-success toggle-sm"
                                checked={theme === 'dark'}
                                onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-[#00a884] font-medium mb-4 ml-2">Wallpaper</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {WALLPAPERS.map((w) => (
                            <button
                                key={w.id}
                                onClick={() => setWallpaper(w.url)}
                                className={`group relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${wallpaper === w.url ? "border-[var(--wa-teal)]" : "border-transparent hover:border-white/20"}`}
                            >
                                {w.url ? (
                                    <img src={w.url} alt={w.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-[#050505]"></div>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white font-medium text-xs">{w.name}</span>
                                </div>
                                {wallpaper === w.url && (
                                    <div className="absolute top-2 right-2 bg-[var(--wa-teal)] rounded-full p-1">
                                        <div className="size-1.5 bg-white rounded-full" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-[#00a884] font-medium mb-4 ml-2">Chat settings</h3>
                    <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5">
                        <div className="p-4 flex items-center justify-between border-b border-white/5">
                            <div>
                                <p className="text-white">Enter is send</p>
                                <p className="text-xs text-[var(--wa-gray)]">Enter key will send your message</p>
                            </div>
                            <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked />
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-white">Media visibility</p>
                                <p className="text-xs text-[var(--wa-gray)]">Show newly downloaded media in your phone's gallery</p>
                            </div>
                            <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked />
                        </div>
                    </div>
                </div>
            </div>
        </SubSectionLayout>
    );

    const renderNotifications = () => (
        <SubSectionLayout title="Notifications" onBack={() => setActiveSection("main")}>
            <div className="space-y-6 p-4">
                <div>
                    <h3 className="text-[#00a884] font-medium mb-4 ml-2">Messages</h3>
                    <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5">
                        <div className="p-4 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <Volume2 className="size-5 text-[var(--wa-gray)]" />
                                <div>
                                    <p className="text-white">Notification tones</p>
                                    <p className="text-xs text-[var(--wa-gray)]">Default</p>
                                </div>
                            </div>
                            <ChevronRight className="size-5 text-[var(--wa-gray)]" />
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Smartphone className="size-5 text-[var(--wa-gray)]" />
                                <div>
                                    <p className="text-white">Vibrate</p>
                                    <p className="text-xs text-[var(--wa-gray)]">Default</p>
                                </div>
                            </div>
                            <ChevronRight className="size-5 text-[var(--wa-gray)]" />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-[#00a884] font-medium mb-4 ml-2">Groups</h3>
                    <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5">
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Bell className="size-5 text-[var(--wa-gray)]" />
                                <div>
                                    <p className="text-white">Group notifications</p>
                                    <p className="text-xs text-[var(--wa-gray)]">Show notifications for group messages</p>
                                </div>
                            </div>
                            <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked />
                        </div>
                    </div>
                </div>
            </div>
        </SubSectionLayout>
    );

    return (
        <div className="h-screen bg-[#0a0a0a] text-[#e9edef] flex flex-col pt-16">
            <div className="flex-1 max-w-2xl mx-auto w-full overflow-y-auto custom-scrollbar">
                {activeSection === "main" && renderMainSettings()}
                {activeSection === "account" && renderAccount()}
                {activeSection === "privacy" && renderPrivacy()}
                {activeSection === "chats" && renderChats()}
                {activeSection === "notifications" && renderNotifications()}
                {activeSection === "help" && (
                    <SubSectionLayout title="Help" onBack={() => setActiveSection("main")}>
                        <div className="p-4 space-y-2">
                            <OptionItem icon={<HelpCircle className="size-6" />} title="Help Centre" subtitle="" />
                            <OptionItem icon={<CircleUser className="size-6" />} title="Contact us" subtitle="Questions? Need help?" />
                            <OptionItem icon={<Shield className="size-6" />} title="Privacy Policy" subtitle="" />
                            <OptionItem icon={<Info className="size-6" />} title="App info" subtitle="" />
                        </div>
                    </SubSectionLayout>
                )}
            </div>
        </div>
    );
};

const OptionItem = ({ icon, title, subtitle, onClick }) => (
    <div
        className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer transition-colors group"
        onClick={onClick}
    >
        <div className="text-[var(--wa-gray)]">{icon}</div>
        <div className="flex-1 border-b border-white/5 pb-4 group-last:border-none">
            <h3 className="text-[17px] font-medium text-[#e9edef]">{title}</h3>
            {subtitle && <p className="text-[var(--wa-gray)] text-sm">{subtitle}</p>}
        </div>
        <ChevronRight className="size-4 text-[var(--wa-gray)]/50 mr-2" />
    </div>
);

const SubSectionLayout = ({ title, children, onBack }) => (
    <div className="animate-in slide-in-from-right-10 duration-300 h-full flex flex-col">
        <div className="flex items-center gap-6 p-4 bg-[#1a1a1a] sticky top-0 z-10 border-b border-white/5">
            <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft className="size-6 text-[var(--wa-teal)]" />
            </button>
            <h2 className="text-xl font-medium text-white">{title}</h2>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {children}
        </div>
    </div>
);

const PrivacyItem = ({ title, value }) => (
    <div className="flex items-center justify-between py-1 cursor-pointer hover:opacity-80 transition-opacity">
        <div>
            <p className="text-white">{title}</p>
            <p className="text-xs text-[var(--wa-teal)]">{value}</p>
        </div>
    </div>
);

const Info = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
    </svg>
);

export default SettingsPage;
