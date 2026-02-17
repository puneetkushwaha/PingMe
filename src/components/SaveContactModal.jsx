import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { X, Search, UserPlus, Phone, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const SaveContactModal = ({ isOpen, onClose }) => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const { users, setSelectedUser } = useChatStore();
    const { setActiveSidebar } = useAuthStore();

    const handleSearchAndAdd = async (e) => {
        e.preventDefault();
        if (!phoneNumber.trim()) return;

        setIsSearching(true);
        // We already have all users in store from getUsers() call in Sidebar/App
        // We search locally for a match. If not found, we could add a specific backend search endpoint.
        const foundUser = users.find(u => u.phone === phoneNumber.trim());

        setTimeout(() => {
            if (foundUser) {
                toast.success(`Found ${foundUser.fullName}!`);
                setSelectedUser(foundUser);
                setActiveSidebar("chats");
                onClose();
            } else {
                toast.error("User not found with this phone number.");
            }
            setIsSearching(false);
        }, 800);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#111b21] w-full max-w-md rounded-2xl border border-white/5 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#202c33]">
                    <h3 className="text-white font-bold text-lg">Add New Contact</h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors">
                        <X className="size-6" />
                    </button>
                </div>

                <form onSubmit={handleSearchAndAdd} className="p-6">
                    <p className="text-[var(--wa-gray)] text-sm mb-6">
                        Enter the phone number of the person you want to add. If they are on PingMe, you can start chatting instantly.
                    </p>

                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="size-5 text-[var(--wa-gray)] group-focus-within:text-[#00a884]" />
                            </div>
                            <input
                                type="tel"
                                placeholder="Phone Number (e.g. +91...)"
                                className="block w-full pl-10 pr-3 py-3 bg-[#202c33] border border-white/5 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#00a884] transition-all"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSearching}
                            className="w-full bg-[#00a884] text-[#111b21] py-3 rounded-xl font-bold hover:bg-[#008f6f] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSearching ? <Loader2 className="size-5 animate-spin" /> : <Search className="size-5" />}
                            {isSearching ? "Searching..." : "Find and Add"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SaveContactModal;
