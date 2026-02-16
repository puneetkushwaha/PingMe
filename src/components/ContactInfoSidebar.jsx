import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { X, Phone, Video, Trash2, Ban, ShieldAlert, User, Mail, Smartphone, Flag } from "lucide-react";
import toast from "react-hot-toast";

const ContactInfoSidebar = () => {
    const { selectedUser, setIsContactInfoOpen, clearMessages, setSelectedUser, blockUser, reportUser, messages } = useChatStore();
    const { onlineUsers, authUser } = useAuthStore();

    if (!selectedUser) return null;

    const handleClearChat = async () => {
        if (window.confirm("Are you sure you want to clear all messages in this chat?")) {
            await clearMessages(selectedUser._id);
            setIsContactInfoOpen(false);
        }
    };

    const handleBlockUser = async () => {
        if (window.confirm(`Are you sure you want to block/unblock ${selectedUser.fullName}?`)) {
            await blockUser(selectedUser._id);
        }
    };

    const handleReportUser = async () => {
        if (window.confirm(`Are you sure you want to report ${selectedUser.fullName}?`)) {
            await reportUser(selectedUser._id);
        }
    };

    const handleCloseChat = () => {
        setSelectedUser(null);
        setIsContactInfoOpen(false);
    };

    return (
        <div className="h-full w-full lg:w-[400px] bg-[var(--wa-sidebar-bg)] border-l border-[var(--wa-header-bg)] flex flex-col z-50">
            {/* Header */}
            <div className="p-4 bg-[var(--wa-header-bg)] h-16 flex items-center gap-6 shrink-0">
                <X className="size-6 text-[var(--wa-gray)] cursor-pointer hover:text-white" onClick={() => setIsContactInfoOpen(false)} />
                <h1 className="text-[#e9edef] text-xl font-medium">Contact Info</h1>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Profile Card */}
                <div className="bg-[var(--wa-header-bg)] p-8 flex flex-col items-center gap-4 mb-2">
                    <img
                        src={selectedUser.profilePic || "/avatar.png"}
                        className="size-48 rounded-full object-cover shadow-xl"
                        alt={selectedUser.fullName}
                    />
                    <div className="text-center">
                        <h2 className="text-[#e9edef] text-2xl font-normal">{selectedUser.fullName}</h2>
                        <p className="text-[var(--wa-gray)] text-sm">
                            {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                        </p>
                    </div>
                </div>

                {/* User Details */}
                <div className="bg-[var(--wa-header-bg)] p-4 space-y-6 mb-2">
                    <div className="space-y-1">
                        <span className="text-[var(--wa-gray)] text-sm opacity-80">Full Name</span>
                        <div className="flex items-center gap-4 text-[#e9edef]">
                            <User className="size-5 text-[var(--wa-gray)]" />
                            <span>{selectedUser.fullName}</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[var(--wa-gray)] text-sm opacity-80">Email Address</span>
                        <div className="flex items-center gap-4 text-[#e9edef]">
                            <Mail className="size-5 text-[var(--wa-gray)]" />
                            <span className="truncate">{selectedUser.email}</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[var(--wa-gray)] text-sm opacity-80">Phone Number</span>
                        <div className="flex items-center gap-4 text-[#e9edef]">
                            <Smartphone className="size-5 text-[var(--wa-gray)]" />
                            <span>{selectedUser.phone || "Not provided"}</span>
                        </div>
                    </div>
                </div>

                {/* Media Gallery */}
                <div className="bg-[#111b21] p-4 mb-2 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[#e9edef] text-[15px] font-medium">Media, Links and Docs</span>
                        <span className="text-[var(--wa-gray)] text-sm cursor-pointer hover:text-white">
                            {messages.filter(m => m.image).length}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {messages.filter(m => m.image).slice(0, 6).map((msg) => (
                            <div key={msg._id} className="relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-white/5" onClick={() => window.open(msg.image, "_blank")}>
                                <img src={msg.image} alt="Media" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                            </div>
                        ))}
                    </div>
                    {messages.filter(m => m.image).length === 0 && (
                        <div className="text-center py-4 text-[var(--wa-gray)] text-sm">
                            No media shared
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="bg-[var(--wa-header-bg)] p-4 space-y-2 mb-2">
                    <button
                        onClick={handleClearChat}
                        className="w-full flex items-center gap-4 p-3 text-red-500 hover:bg-white/5 transition-colors rounded-lg"
                    >
                        <Trash2 className="size-5" />
                        <span>Clear Chat</span>
                    </button>
                    <button
                        onClick={handleCloseChat}
                        className="w-full flex items-center gap-4 p-3 text-[#e9edef] hover:bg-white/5 transition-colors rounded-lg"
                    >
                        <X className="size-5" />
                        <span>Close Chat</span>
                    </button>
                    {/* Block/Report User */}
                    <div className="space-y-1">
                        <button
                            onClick={handleBlockUser}
                            className="w-full h-[52px] flex items-center gap-4 px-6 hover:bg-white/5 transition-colors text-[#ea5656]"
                        >
                            <Ban className="size-6" />
                            <span className="text-[17px]">
                                {authUser?.blockedUsers?.includes(selectedUser._id) ? "Unblock" : "Block"} {selectedUser.fullName}
                            </span>
                        </button>
                        <button
                            onClick={handleReportUser}
                            className="w-full h-[52px] flex items-center gap-4 px-6 hover:bg-white/5 transition-colors text-[#ea5656]"
                        >
                            <Flag className="size-6" />
                            <span className="text-[17px]">Report {selectedUser.fullName}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactInfoSidebar;
