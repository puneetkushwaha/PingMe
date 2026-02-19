import { useState } from "react";
import {
    ArrowLeft, Moon, Bell, Shield, HelpCircle, LogOut, ChevronRight,
    Key, CircleUser, Languages, Database, Accessibility, Info,
    Smartphone, Volume2, Image as ImageIcon, Download, Edit2, Check,
    Camera as CameraIcon, MessageSquare, Zap
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import toast from "react-hot-toast";

const SettingsSidebarSection = ({ onBack }) => {
    const { logout, authUser, updateProfile, isCompiling } = useAuthStore();
    const { theme, setTheme, wallpaper, setWallpaper } = useThemeStore();
    const [activeSection, setActiveSection] = useState("main");

    const SOUND_THEMES = [
        { id: "notification.mp3", name: "Default (PingMe)", file: "/notification.mp3" },
        { id: "noti.wav", name: "Digital Alert", file: "/noti.wav" },
        { id: "simple", name: "Simple Pop", file: "/notification.mp3" },
        { id: "elegant", name: "Elegant Chime", file: "/noti.wav" },
        { id: "classic", name: "Classic Tone", file: "/notification.mp3" },
    ];

    const handleUpdateChatSettings = async (key, value) => {
        try {
            await updateProfile({
                chatSettings: {
                    ...authUser?.chatSettings,
                    [key]: value
                }
            });
            toast.success("Settings updated");
        } catch (error) {
            toast.error("Failed to update settings");
        }
    };

    // Local state for editing
    const [isEditingName, setIsEditingName] = useState(false);
    const [fullName, setFullName] = useState(authUser?.fullName || "");
    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [about, setAbout] = useState(authUser?.about || "Hey there! I am using PingMe.");
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [phone, setPhone] = useState(authUser?.phone || "");
    const [selectedImg, setSelectedImg] = useState(null);

    // Privacy selection state
    const [privacySelection, setPrivacySelection] = useState(null); // { key: 'lastSeen', title: 'Last seen and online', current: 'everyone' }
    const [tempStatusOption, setTempStatusOption] = useState(authUser?.privacy?.status || "contacts");

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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = async () => {
            const base64Image = reader.result;
            setSelectedImg(base64Image);
            await updateProfile({ profilePic: base64Image });
        };
    };

    const handleUpdateName = async () => {
        if (fullName.trim() && fullName !== authUser.fullName) {
            await updateProfile({ fullName });
        }
        setIsEditingName(false);
    };

    const handleUpdateAbout = async () => {
        if (about.trim() && about !== authUser.about) {
            await updateProfile({ about });
        }
        setIsEditingAbout(false);
    };

    const handleUpdatePhone = async () => {
        if (phone.trim() && phone !== authUser.phone) {
            await updateProfile({ phone });
        }
        setIsEditingPhone(false);
    };

    const renderAccount = () => (
        <SubSectionLayout title="Account" onBack={() => setActiveSection("main")}>
            <div className="flex-1 overflow-y-auto custom-scrollbar pt-4">
                {/* Profile Pic */}
                <div className="flex justify-center mb-8 relative group cursor-pointer w-fit mx-auto transition-transform hover:scale-[1.02]">
                    <div className="size-48 rounded-full overflow-hidden border-4 border-[var(--wa-header-bg)] shadow-xl relative">
                        <img
                            src={selectedImg || authUser?.profilePic || "/avatar.png"}
                            alt="Profile"
                            className={`size-full object-cover ${isCompiling ? "opacity-50" : ""}`}
                        />
                        {isCompiling && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <div className="loading loading-spinner loading-md text-[#00a884]"></div>
                            </div>
                        )}
                    </div>
                    <label
                        htmlFor="profile-upload-sidebar"
                        className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white flex-col gap-2"
                    >
                        <CameraIcon className="size-8" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Change Photo</span>
                    </label>
                    <input
                        type="file"
                        id="profile-upload-sidebar"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isCompiling}
                    />
                </div>

                <div className="px-6 space-y-8 pb-8">
                    {/* Name Section */}
                    <div>
                        <div className="text-[#00a884] text-sm font-medium mb-3 ml-1">Your name</div>
                        {isEditingName ? (
                            <div className="flex items-center gap-3 border-b-2 border-[#00a884] pb-1 animate-in fade-in duration-200">
                                <input
                                    type="text"
                                    className="bg-transparent text-[#e9edef] text-[17px] outline-none w-full"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    autoFocus
                                    onKeyDown={(e) => e.key === "Enter" && handleUpdateName()}
                                />
                                <Check className="size-5 text-[#00a884] cursor-pointer hover:scale-110 transition-transform" onClick={handleUpdateName} />
                            </div>
                        ) : (
                            <div
                                className="flex items-center justify-between text-[#e9edef] group border-b border-white/5 pb-3 hover:border-white/20 transition-colors cursor-pointer"
                                onClick={() => setIsEditingName(true)}
                            >
                                <span className="text-[17px] font-medium">{authUser?.fullName}</span>
                                <Edit2 className="size-4 text-[var(--wa-gray)] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        )}
                        <p className="text-[var(--wa-gray)] text-[13px] mt-3 leading-relaxed opacity-80">
                            This is not your username or pin. This name will be visible to your PingMe contacts.
                        </p>
                    </div>

                    {/* About Section */}
                    <div>
                        <div className="text-[#00a884] text-sm font-medium mb-3 ml-1">About</div>
                        {isEditingAbout ? (
                            <div className="flex items-center gap-3 border-b-2 border-[#00a884] pb-1 animate-in fade-in duration-200">
                                <input
                                    type="text"
                                    className="bg-transparent text-[#e9edef] text-[17px] outline-none w-full"
                                    value={about}
                                    onChange={(e) => setAbout(e.target.value)}
                                    autoFocus
                                    onKeyDown={(e) => e.key === "Enter" && handleUpdateAbout()}
                                />
                                <Check className="size-5 text-[#00a884] cursor-pointer hover:scale-110 transition-transform" onClick={handleUpdateAbout} />
                            </div>
                        ) : (
                            <div
                                className="flex items-center justify-between text-[#e9edef] group border-b border-white/5 pb-3 hover:border-white/20 transition-colors cursor-pointer"
                                onClick={() => setIsEditingAbout(true)}
                            >
                                <span className="text-[17px] font-medium line-clamp-1">{authUser?.about || "Hey there! I am using PingMe."}</span>
                                <Edit2 className="size-4 text-[var(--wa-gray)] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        )}
                    </div>

                    {/* Phone Section */}
                    <div>
                        <div className="text-[#00a884] text-sm font-medium mb-3 ml-1">Phone</div>
                        {isEditingPhone ? (
                            <div className="flex items-center gap-3 border-b-2 border-[#00a884] pb-1 animate-in fade-in duration-200">
                                <input
                                    type="text"
                                    className="bg-transparent text-[#e9edef] text-[17px] outline-none w-full"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    autoFocus
                                    onKeyDown={(e) => e.key === "Enter" && handleUpdatePhone()}
                                />
                                <Check className="size-5 text-[#00a884] cursor-pointer hover:scale-110 transition-transform" onClick={handleUpdatePhone} />
                            </div>
                        ) : (
                            <div
                                className="flex items-center justify-between text-[#e9edef] group border-b border-white/5 pb-3 hover:border-white/20 transition-colors cursor-pointer"
                                onClick={() => setIsEditingPhone(true)}
                            >
                                <span className="text-[17px] font-medium">{authUser?.phone || "Add phone number"}</span>
                                <Edit2 className="size-4 text-[var(--wa-gray)] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        )}
                    </div>

                    {/* Security Info */}
                    <div className="pt-4 border-t border-white/5">
                        <div className="bg-[#202c33] rounded-xl p-4 flex items-center gap-4 group cursor-pointer hover:bg-[#2a3942] transition-colors">
                            <Shield className="size-5 text-[var(--wa-gray)] group-hover:text-[#00a884] transition-colors" />
                            <div className="flex-1">
                                <p className="text-[#e9edef] text-sm font-medium">Security</p>
                                <p className="text-[var(--wa-gray)] text-xs">Security notifications, two-step verification</p>
                            </div>
                            <ChevronRight className="size-4 text-[var(--wa-gray)]" />
                        </div>
                    </div>
                </div>
            </div>
        </SubSectionLayout>
    );

    const handleUpdatePrivacy = async (key, value) => {
        await updateProfile({
            privacy: {
                ...authUser.privacy,
                [key]: value
            }
        });
        setPrivacySelection(null);
    };

    const renderPrivacySelection = () => (
        <SubSectionLayout title={privacySelection.title} onBack={() => setPrivacySelection(null)}>
            <div className="py-2">
                <div className="p-4 text-[var(--wa-teal)] text-sm font-medium">Who can see my {privacySelection.title.toLowerCase()}</div>
                <div className="bg-white/5 mx-4 rounded-xl overflow-hidden ring-1 ring-white/5">
                    {["everyone", "nobody"].map((option) => (
                        <div
                            key={option}
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5 last:border-none"
                            onClick={() => handleUpdatePrivacy(privacySelection.key, option)}
                        >
                            <span className="text-[#e9edef] capitalize">{option}</span>
                            <div className={`size-5 rounded-full border-2 flex items-center justify-center ${authUser?.privacy?.[privacySelection.key] === option ? "border-[var(--wa-teal)]" : "border-[var(--wa-gray)]"}`}>
                                {authUser?.privacy?.[privacySelection.key] === option && (
                                    <div className="size-2.5 bg-[var(--wa-teal)] rounded-full animate-in zoom-in duration-200" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <p className="px-6 py-4 text-[var(--wa-gray)] text-xs leading-relaxed">
                    If you don't share your {privacySelection.title.toLowerCase()}, you won't be able to see other people's {privacySelection.title.toLowerCase()}.
                </p>
            </div>
        </SubSectionLayout>
    );

    const renderPrivacy = () => (
        <SubSectionLayout title="Privacy" onBack={() => setActiveSection("main")}>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4 space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-[#00a884] text-sm font-medium ml-2 uppercase tracking-wider text-[11px]">Who can see my info</h3>
                        <div className="bg-white/5 rounded-xl overflow-hidden ring-1 ring-white/5">
                            <PrivacyItem
                                title="Last seen and online"
                                value={authUser?.privacy?.lastSeen || "everyone"}
                                onClick={() => setPrivacySelection({ key: "lastSeen", title: "Last seen and online" })}
                            />
                            <PrivacyItem
                                title="Profile photo"
                                value={authUser?.privacy?.profilePic || "everyone"}
                                onClick={() => setPrivacySelection({ key: "profilePic", title: "Profile photo" })}
                            />
                            <PrivacyItem
                                title="About"
                                value={authUser?.privacy?.about || "everyone"}
                                onClick={() => setPrivacySelection({ key: "about", title: "About" })}
                            />
                            <PrivacyItem
                                title="Status"
                                value={authUser?.privacy?.status === 'contacts' ? 'My contacts' : authUser?.privacy?.status === 'except' ? 'My contacts except...' : 'Only share with...'}
                                subtitle="Changes to your privacy settings won't affect status updates that you shared already."
                                onClick={() => setActiveSection("status-privacy")}
                            />
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 ring-1 ring-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#e9edef]">Read receipts</p>
                                <p className="text-xs text-[var(--wa-gray)]">Show when you've read messages</p>
                            </div>
                            <input
                                type="checkbox"
                                className="toggle toggle-success toggle-sm"
                                checked={authUser?.privacy?.readReceipts !== false}
                                onChange={(e) => handleUpdatePrivacy("readReceipts", e.target.checked)}
                            />
                        </div>
                        <p className="text-[11px] text-[var(--wa-gray)] leading-relaxed italic opacity-70">
                            If turned off, you won't send or receive Read receipts. Read receipts are always sent for group chats.
                        </p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 ring-1 ring-white/5 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="bg-[#2a3942] p-2 rounded-lg text-[var(--wa-gray)] group-hover:text-[#00a884] transition-colors">
                                <Shield className="size-5" />
                            </div>
                            <div>
                                <p className="text-[#e9edef] font-medium">Blocked contacts</p>
                                <p className="text-xs text-[var(--wa-gray)] uppercase tracking-tight">{authUser?.blockedUsers?.length || 0} contacts</p>
                            </div>
                        </div>
                        <ChevronRight className="size-5 text-[var(--wa-gray)]/30" />
                    </div>
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
                                onClick={() => {
                                    setWallpaper(w.url);
                                    handleUpdateChatSettings("wallpaper", w.url);
                                }}
                                className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${wallpaper === w.url || authUser?.chatSettings?.wallpaper === w.url ? "border-[var(--wa-teal)]" : "border-transparent hover:border-white/20"}`}
                            >
                                <img src={w.url} alt={w.name} className="w-full h-full object-cover" />
                                {(wallpaper === w.url || authUser?.chatSettings?.wallpaper === w.url) && (
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
                            <input
                                type="checkbox"
                                className="toggle toggle-success toggle-sm"
                                checked={authUser?.chatSettings?.enterIsSend !== false}
                                onChange={(e) => handleUpdateChatSettings("enterIsSend", e.target.checked)}
                            />
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <p className="text-[#e9edef]">Media visibility</p>
                            <input
                                type="checkbox"
                                className="toggle toggle-success toggle-sm"
                                checked={authUser?.chatSettings?.mediaVisibility !== false}
                                onChange={(e) => handleUpdateChatSettings("mediaVisibility", e.target.checked)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </SubSectionLayout>
    );

    const handleUpdateNotificationSettings = async (key, value) => {
        try {
            await updateProfile({
                notificationSettings: {
                    ...authUser?.notificationSettings,
                    [key]: value
                }
            });
            toast.success("Settings updated");
        } catch (error) {
            toast.error("Failed to update settings");
        }
    };

    const renderNotifications = () => (
        <SubSectionLayout title="Notifications" onBack={() => setActiveSection("main")}>
            <div className="p-4 space-y-6">
                <div className="space-y-4">
                    <h3 className="text-[#00a884] text-sm font-medium ml-2 uppercase tracking-wider text-[11px]">Messages</h3>
                    <div className="bg-[#202c33]/50 rounded-xl overflow-hidden ring-1 ring-white/5">
                        <div className="p-4 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <Bell className="size-5 text-[var(--wa-gray)]" />
                                <div className="flex-1">
                                    <p className="text-[#e9edef]">Notification tone</p>
                                    <p className="text-[#00a884] text-xs">
                                        {SOUND_THEMES.find(s => s.id === authUser?.notificationSettings?.selectedSound)?.name || "Default (PingMe)"}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight
                                className="size-5 text-[var(--wa-gray)] cursor-pointer"
                                onClick={() => setActiveSection("sound-selection")}
                            />
                        </div>
                        <div className="p-4 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <MessageSquare className="size-5 text-[var(--wa-gray)]" />
                                <p className="text-[#e9edef]">Show Previews</p>
                            </div>
                            <input
                                type="checkbox"
                                className="toggle toggle-success toggle-sm"
                                checked={authUser?.notificationSettings?.showPreviews !== false}
                                onChange={(e) => handleUpdateNotificationSettings("showPreviews", e.target.checked)}
                            />
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Zap className="size-5 text-[var(--wa-gray)]" />
                                <p className="text-[#e9edef]">High priority notifications</p>
                            </div>
                            <input
                                type="checkbox"
                                className="toggle toggle-success toggle-sm"
                                checked={authUser?.notificationSettings?.showNotifications !== false}
                                onChange={(e) => handleUpdateNotificationSettings("showNotifications", e.target.checked)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </SubSectionLayout>
    );

    const renderStatusPrivacy = () => (
        <SubSectionLayout title="Status privacy" onBack={() => setActiveSection("privacy")}>
            <div className="p-6 space-y-8 h-full">
                <div className="space-y-4">
                    <p className="text-[#8696a0] text-sm font-medium uppercase tracking-wider">Who can see my status updates</p>
                    <div className="space-y-6">
                        {[
                            { id: "contacts", label: "My contacts" },
                            { id: "except", label: "My contacts except...", count: authUser?.privacy?.statusExclude?.length || 0, color: "text-red-500" },
                            { id: "share", label: "Only share with...", count: authUser?.privacy?.statusInclude?.length || 0, color: "text-[#00a884]" },
                        ].map((option) => (
                            <label key={option.id} className="flex items-center justify-between cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className={`size-5 rounded-full border-2 flex items-center justify-center transition-colors ${authUser?.privacy?.status === option.id ? 'border-[#00a884]' : 'border-[#8696a0]'}`}>
                                        {authUser?.privacy?.status === option.id && <div className="size-2.5 bg-[#00a884] rounded-full" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[#e9edef] text-[17px]">{option.label}</span>
                                        {option.count !== undefined && (
                                            <span className={`${option.color} text-sm`}>{option.count} {option.id === 'except' ? 'excluded' : 'included'}</span>
                                        )}
                                    </div>
                                </div>
                                <input
                                    type="radio"
                                    className="hidden"
                                    name="statusPrivacy"
                                    checked={authUser?.privacy?.status === option.id}
                                    onChange={() => {
                                        updateProfile({ privacy: { ...authUser?.privacy, status: option.id } });
                                        toast.success("Privacy updated");
                                    }}
                                />
                            </label>
                        ))}
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                            <div className="text-[var(--wa-gray)]"><Volume2 className="size-6 rotate-180" /></div>
                            <div>
                                <p className="text-[#e9edef] text-[17px]">Allow sharing</p>
                                <p className="text-[#8696a0] text-sm">Let people who can see your status reshare and forward it.</p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            className="toggle toggle-success toggle-sm"
                            checked={authUser?.privacy?.allowSharing !== false}
                            onChange={(e) => updateProfile({ privacy: { ...authUser?.privacy, allowSharing: e.target.checked } })}
                        />
                    </div>
                </div>

                <div className="space-y-4 pt-6">
                    <div>
                        <p className="text-[#8696a0] text-sm uppercase font-medium tracking-wider mb-2">Share across apps</p>
                        <p className="text-[#8696a0] text-sm mb-4">Automatically share your status to your Facebook or Instagram Stories.</p>
                        <p className="text-[#00a884] font-medium cursor-pointer hover:underline mb-6">Manage in Accounts Centre</p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between opacity-60">
                            <div className="flex items-center gap-4">
                                <div className="size-6 flex items-center justify-center border border-[#8696a0] rounded-full text-[#8696a0] text-xs font-bold">f</div>
                                <span className="text-[#e9edef]">Facebook Story</span>
                            </div>
                            <input type="checkbox" className="toggle toggle-sm" disabled />
                        </div>
                        <div className="flex items-center justify-between opacity-60">
                            <div className="flex items-center gap-4">
                                <div className="size-6 flex items-center justify-center border border-[#8696a0] rounded-full text-[#8696a0] text-xs font-bold ring-1 ring-inset ring-[#8696a0]">ix</div>
                                <span className="text-[#e9edef]">Instagram Story</span>
                            </div>
                            <input type="checkbox" className="toggle toggle-sm" disabled />
                        </div>
                    </div>
                </div>

                <p className="text-[#8696a0] text-[13px] leading-relaxed italic opacity-70">
                    Changes to your privacy settings won't affect status updates that you shared already.
                </p>
            </div>
        </SubSectionLayout>
    );

    const renderSoundSelection = () => (
        <SubSectionLayout title="Notification tone" onBack={() => setActiveSection("notifications")}>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-2">
                    {SOUND_THEMES.map((sound) => (
                        <div
                            key={sound.id}
                            className="flex items-center justify-between p-4 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-none group"
                            onClick={() => {
                                handleUpdateNotificationSettings("selectedSound", sound.id);
                                const audio = new Audio(sound.file);
                                audio.play().catch(() => { });
                            }}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`size-5 rounded-full border-2 flex items-center justify-center transition-colors ${authUser?.notificationSettings?.selectedSound === sound.id || (!authUser?.notificationSettings?.selectedSound && sound.id === 'notification.mp3') ? 'border-[#00a884]' : 'border-[#8696a0]'}`}>
                                    {(authUser?.notificationSettings?.selectedSound === sound.id || (!authUser?.notificationSettings?.selectedSound && sound.id === 'notification.mp3')) && <div className="size-2.5 bg-[#00a884] rounded-full" />}
                                </div>
                                <span className="text-[#e9edef] text-[17px]">{sound.name}</span>
                            </div>
                            {authUser?.notificationSettings?.selectedSound === sound.id && <Check className="size-5 text-[#00a884]" />}
                        </div>
                    ))}
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
                {activeSection === "privacy" && (privacySelection ? renderPrivacySelection() : renderPrivacy())}
                {activeSection === "chats" && renderChats()}
                {activeSection === "notifications" && renderNotifications()}
                {activeSection === "sound-selection" && renderSoundSelection()}
                {activeSection === "status-privacy" && renderStatusPrivacy()}
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

const PrivacyItem = ({ title, value, subtitle, onClick }) => (
    <div
        className={`p-4 border-b border-white/5 last:border-none hover:bg-white/5 flex items-center justify-between transition-colors ${onClick ? "cursor-pointer" : ""}`}
        onClick={onClick}
    >
        <div className="flex-1">
            <p className="text-[#e9edef] font-medium">{title}</p>
            <p className="text-[#00a884] text-sm capitalize">{value}</p>
            {subtitle && <p className="text-[10px] text-[var(--wa-gray)] mt-1 opacity-70 italic">{subtitle}</p>}
        </div>
        {onClick && <ChevronRight className="size-4 text-[var(--wa-gray)]/30" />}
    </div>
);

export default SettingsSidebarSection;
