import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { Send, Bell, Shield, Lock, Smartphone, Image as ImageIcon, Volume2, Moon } from "lucide-react";

const WALLPAPERS = [
    { id: "obsidian", name: "Default Obsidian", url: "https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png" },
    { id: "midnight", name: "Midnight Blue", url: "https://i.pinimg.com/originals/97/21/05/972105c5a775f38cf33d3924a05d8b57.jpg" },
    { id: "forest", name: "Deep Forest", url: "https://i.pinimg.com/originals/24/76/65/247665796a5789f6df849646f2c5890e.jpg" },
    { id: "minimal", name: "Minimal Gray", url: "https://wallpaperaccess.com/full/1556608.jpg" },
    { id: "abstract", name: "Dark Abstract", url: "https://wallpaperaccess.com/full/2109.jpg" },
    { id: "black", name: "Pure Black", url: "" }, // Empty string for CSS background color fallback
];

const SettingsPage = () => {
    const { wallpaper, setWallpaper } = useThemeStore();
    const { authUser } = useAuthStore();
    const { blockUser } = useChatStore();

    return (
        <div className="h-screen container mx-auto px-4 pt-20 max-w-4xl pb-10 overflow-y-auto bg-[#0a0a0a] min-h-screen">
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-[#e9edef]">Settings</h1>

                {/* 1. Account Info (Read Only) */}
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="size-16 rounded-full overflow-hidden bg-white/10">
                            <img src={authUser?.profilePic || "/avatar.png"} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{authUser?.fullName}</h2>
                            <p className="text-[var(--wa-gray)]">{authUser?.email}</p>
                        </div>
                    </div>
                </div>

                {/* 2. Chat Wallpaper */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[var(--wa-teal)] mb-2">
                        <ImageIcon className="size-5" />
                        <h2 className="text-lg font-semibold text-[#e9edef]">Chat Wallpaper</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                                    <span className="text-white font-medium text-sm">{w.name}</span>
                                </div>
                                {wallpaper === w.url && (
                                    <div className="absolute top-2 right-2 bg-[var(--wa-teal)] rounded-full p-1">
                                        <div className="size-2 bg-white rounded-full" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Notifications */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[var(--wa-teal)] mb-2">
                        <Bell className="size-5" />
                        <h2 className="text-lg font-semibold text-[#e9edef]">Notifications</h2>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5">
                        <div className="p-4 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <Volume2 className="size-5 text-[var(--wa-gray)]" />
                                <div>
                                    <h3 className="text-[#e9edef] font-medium">Message Sounds</h3>
                                    <p className="text-xs text-[var(--wa-gray)]">Play sounds for incoming messages</p>
                                </div>
                            </div>
                            <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked />
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Smartphone className="size-5 text-[var(--wa-gray)]" />
                                <div>
                                    <h3 className="text-[#e9edef] font-medium">Vibration</h3>
                                    <p className="text-xs text-[var(--wa-gray)]">Vibrate on new message</p>
                                </div>
                            </div>
                            <input type="checkbox" className="toggle toggle-success toggle-sm" />
                        </div>
                    </div>
                </div>

                {/* 4. Privacy & Security */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[var(--wa-teal)] mb-2">
                        <Shield className="size-5" />
                        <h2 className="text-lg font-semibold text-[#e9edef]">Privacy</h2>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5">
                        <div className="p-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Lock className="size-5 text-[var(--wa-gray)]" />
                                <div>
                                    <h3 className="text-[#e9edef] font-medium">Blocked Contacts</h3>
                                    <p className="text-xs text-[var(--wa-gray)]">{authUser?.blockedUsers?.length || 0} contacts blocked</p>
                                </div>
                            </div>

                            {authUser?.blockedUsers?.length > 0 ? (
                                <div className="space-y-2">
                                    {/* We would need to fetch full user objects for blocked users to show names, 
                       but for now illustrating with ID or if we have them in store */}
                                    <p className="text-xs text-[var(--wa-gray)] italic">Manage blocked contacts from the chat interface.</p>
                                </div>
                            ) : (
                                <p className="text-sm text-[var(--wa-gray)] p-2 bg-white/5 rounded-lg text-center">No blocked contacts</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SettingsPage;
