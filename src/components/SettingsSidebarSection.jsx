import { useState } from "react";
import {
    ArrowLeft, Moon, Bell, Shield, HelpCircle, LogOut, ChevronRight,
    Key, CircleUser, Languages, Database, Accessibility, Info,
    Smartphone, Volume2, Image as ImageIcon, Download
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import toast from "react-hot-toast";

const SettingsSidebarSection = ({ onBack }) => {
    const { logout, authUser } = useAuthStore();
    const { theme, setTheme, wallpaper, setWallpaper } = useThemeStore();
    const [activeSection, setActiveSection] = useState("main");

    const WALLPAPERS = [
        { id: "obsidian", name: "Default Obsidian", url: "https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png" },
        { id: "minimal", name: "Minimal Gray", url: "https://wallpaperaccess.com/full/1556608.jpg" },
        { id: "abstract", name: "Dark Abstract", url: "https://wallpaperaccess.com/full/2109.jpg" },
    ];

    const renderMainSettings = () => (
        <div className="flex-1 overflow-y-auto py-2 animate-in fade-in slide-in-from-right-4 duration-300 custom-scrollbar">
            {/* Profile Card */}
            <div
                className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer transition-colors mb-2"
                onClick={() => setActiveSection("account")}
            >
                <img src={authUser?.profilePic || "/avatar.png"} className="size-20 rounded-full object-cover ring-1 ring-white/5" alt="Profile" />
                <div className="flex-1">
                    <h2 className="text-[#e9edef] text-xl font-medium">{authUser?.fullName}</h2>
                    <p className="text-[var(--wa-gray)] text-sm line-clamp-1 italic">{authUser?.about || "Hey there! I am using PingMe."}</p>
                </div>
                <ChevronRight className="size-5 text-[var(--wa-gray)]" />
            </div>

            {/* Settings List */}
            <div className="space-y-0.5">
                <OptionItem
                    icon={<Key className="size-6" />}
                    title="Account"
                    subtitle="Security notifications, change number"
                    onClick={() => setActiveSection("account")}
                />
                <OptionItem
                    icon={<Shield className="size-6" />}
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
                    icon={<div className="scale-x-[-1] min-w-6 flex justify-center"><Bell className="size-6" /></div>}
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
                    subtitle="Help centre, contact us, privacy policy"
                    onClick={() => setActiveSection("help")}
                />

                <div
                    onClick={logout}
                    className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer transition-colors text-red-500 mt-4"
                >
                    <LogOut className="size-6" />
                    <div className="flex-1">
                        <h3 className="text-[17px] font-medium">Log out</h3>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAccount = () => (
        <SubSectionLayout title="Account" onBack={() => setActiveSection("main")}>
            <div className="p-4 space-y-6">
                <div className="space-y-4">
                    <h3 className="text-[#00a884] text-sm font-medium ml-2">Security</h3>
                    <div className="bg-white/5 rounded-xl overflow-hidden ring-1 ring-white/5">
                        <div className="p-4 flex items-center justify-between border-b border-white/5">
                            <div>
                                <p className="text-[#e9edef]">Security notifications</p>
                                <p className="text-xs text-[var(--wa-gray)]">Get notified when your security code changes</p>
                            </div>
                            <input type="checkbox" className="toggle toggle-success toggle-sm" />
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <p className="text-[#e9edef]">Two-step verification</p>
                            <ChevronRight className="size-5 text-[var(--wa-gray)]" />
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-[#00a884] text-sm font-medium ml-2">Personal info</h3>
                    <div className="bg-white/5 rounded-xl p-4 ring-1 ring-white/5 space-y-4">
                        <div>
                            <p className="text-[var(--wa-gray)] text-xs">Email</p>
                            <p className="text-[#e9edef]">{authUser?.email}</p>
                        </div>
                        <div>
                            <p className="text-[var(--wa-gray)] text-xs">Joined</p>
                            <p className="text-[#e9edef]">{new Date(authUser?.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </SubSectionLayout>
    );

    const renderPrivacy = () => (
        <SubSectionLayout title="Privacy" onBack={() => setActiveSection("main")}>
            <div className="p-4 space-y-6">
                <div className="space-y-4">
                    <h3 className="text-[#00a884] text-sm font-medium ml-2">Who can see my info</h3>
                    <div className="bg-white/5 rounded-xl overflow-hidden ring-1 ring-white/5">
                        <PrivacyItem title="Last seen and online" value="Everyone" />
                        <PrivacyItem title="Profile photo" value="Everyone" />
                        <PrivacyItem title="About" value="Everyone" />
                        <PrivacyItem title="Status" value="My contacts" />
                    </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 ring-1 ring-white/5 flex items-center justify-between">
                    <div>
                        <p className="text-[#e9edef]">Read receipts</p>
                        <p className="text-xs text-[var(--wa-gray)]">Show when you've read messages</p>
                    </div>
                    <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked />
                </div>
                <div className="bg-white/5 rounded-xl p-4 ring-1 ring-white/5 flex items-center justify-between cursor-pointer">
                    <div>
                        <p className="text-[#e9edef]">Blocked contacts</p>
                        <p className="text-xs text-[var(--wa-gray)]">{authUser?.blockedUsers?.length || 0} contacts</p>
                    </div>
                    <ChevronRight className="size-5 text-[var(--wa-gray)]" />
                </div>
            </div>
        </SubSectionLayout>
    );

    const renderChats = () => (
        <SubSectionLayout title="Chats" onBack={() => setActiveSection("main")}>
            <div className="p-4 space-y-6">
                <div className="space-y-4">
                    <h3 className="text-[#00a884] text-sm font-medium ml-2">Display</h3>
                    <div className="bg-white/5 rounded-xl overflow-hidden ring-1 ring-white/5">
                        <div className="p-4 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <Moon className="size-5 text-[var(--wa-gray)]" />
                                <div>
                                    <p className="text-[#e9edef]">Theme</p>
                                    <p className="text-xs text-[var(--wa-gray)] uppercase">{theme}</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                className="toggle toggle-success toggle-sm"
                                checked={theme === "dark"}
                                onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                            />
                        </div>
                        <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => toast.success("Wallpaper settings coming soon!")}>
                            <div className="scale-x-[-1] min-w-5 flex justify-center"><Bell className="size-5 text-[var(--wa-gray)]" /></div>
                            <p className="text-[#e9edef]">Wallpaper</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-[#00a884] text-sm font-medium ml-2">Chat Wallpaper</h3>
                    <div className="grid grid-cols-3 gap-2 px-2">
                        {WALLPAPERS.map((w) => (
                            <button
                                key={w.id}
                                onClick={() => setWallpaper(w.url)}
                                className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${wallpaper === w.url ? "border-[var(--wa-teal)]" : "border-transparent hover:border-white/20"}`}
                            >
                                <img src={w.url} alt={w.name} className="w-full h-full object-cover" />
                                {wallpaper === w.url && (
                                    <div className="absolute top-1 right-1 bg-[var(--wa-teal)] rounded-full p-0.5">
                                        <div className="size-1.5 bg-white rounded-full" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-[#00a884] text-sm font-medium ml-2">Chat settings</h3>
                    <div className="bg-white/5 rounded-xl overflow-hidden ring-1 ring-white/5">
                        <div className="p-4 flex items-center justify-between border-b border-white/5">
                            <p className="text-[#e9edef]">Enter is send</p>
                            <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked />
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <p className="text-[#e9edef]">Media visibility</p>
                            <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked />
                        </div>
                    </div>
                </div>
            </div>
        </SubSectionLayout>
    );

    const renderNotifications = () => (
        <SubSectionLayout title="Notifications" onBack={() => setActiveSection("main")}>
            <div className="p-4 space-y-6">
                <div className="space-y-4">
                    <h3 className="text-[#00a884] text-sm font-medium ml-2">Messages</h3>
                    <div className="bg-white/5 rounded-xl overflow-hidden ring-1 ring-white/5">
                        <div className="p-4 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <Volume2 className="size-5 text-[var(--wa-gray)]" />
                                <div>
                                    <p className="text-[#e9edef]">Notification tone</p>
                                    <p className="text-xs text-[var(--wa-gray)]">Default</p>
                                </div>
                            </div>
                            <ChevronRight className="size-5 text-[var(--wa-gray)]" />
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Smartphone className="size-5 text-[var(--wa-gray)]" />
                                <div>
                                    <p className="text-[#e9edef]">Vibrate</p>
                                    <p className="text-xs text-[var(--wa-gray)]">Default</p>
                                </div>
                            </div>
                            <ChevronRight className="size-5 text-[var(--wa-gray)]" />
                        </div>
                    </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 ring-1 ring-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Bell className="size-5 text-[var(--wa-gray)]" />
                        <p className="text-[#e9edef]">High priority notifications</p>
                    </div>
                    <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked />
                </div>
            </div>
        </SubSectionLayout>
    );

    return (
        <div className="flex-1 flex flex-col h-full bg-[#111b21] overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-[var(--wa-header-bg)] h-16 flex items-center shrink-0 border-b border-white/5">
                <div className="flex items-center gap-6">
                    <ArrowLeft
                        className="size-6 text-[#e9edef] cursor-pointer"
                        onClick={() => activeSection === "main" ? onBack() : setActiveSection("main")}
                    />
                    <h1 className="text-[#e9edef] text-[19px] font-medium">
                        {activeSection === "main" ? "Settings" : activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                    </h1>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
                {activeSection === "main" && renderMainSettings()}
                {activeSection === "account" && renderAccount()}
                {activeSection === "privacy" && renderPrivacy()}
                {activeSection === "chats" && renderChats()}
                {activeSection === "notifications" && renderNotifications()}
                {activeSection === "help" && (
                    <SubSectionLayout title="Help" onBack={() => setActiveSection("main")}>
                        <div className="p-2 space-y-0.5 animate-in fade-in slide-in-from-right-4 duration-300">
                            <OptionItem icon={<HelpCircle className="size-6" />} title="Help Centre" subtitle="" />
                            <OptionItem icon={<CircleUser className="size-6" />} title="Contact us" subtitle="Questions? Need help?" />
                            <OptionItem icon={<Shield className="size-6" />} title="Terms and Privacy Policy" subtitle="" />
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
        <div className="text-[var(--wa-gray)] min-w-6 flex justify-center">{icon}</div>
        <div className="flex-1 border-b border-white/5 pb-4 group-last:border-none">
            <h3 className="text-[17px] font-medium text-[#e9edef]">{title}</h3>
            {subtitle && <p className="text-[var(--wa-gray)] text-sm">{subtitle}</p>}
        </div>
        <ChevronRight className="size-4 text-[var(--wa-gray)]/30 mr-2" />
    </div>
);

const SubSectionLayout = ({ title, children, onBack }) => (
    <div className="animate-in slide-in-from-right-10 duration-300 h-full flex flex-col bg-[#111b21] overflow-y-auto custom-scrollbar">
        {children}
    </div>
);

const PrivacyItem = ({ title, value }) => (
    <div className="p-4 border-b border-white/5 last:border-none hover:bg-white/5 cursor-pointer flex items-center justify-between transition-colors">
        <div>
            <p className="text-[#e9edef]">{title}</p>
            <p className="text-[#00a884] text-sm">{value}</p>
        </div>
    </div>
);

export default SettingsSidebarSection;
