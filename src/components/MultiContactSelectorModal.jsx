import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, Search, User, Check } from "lucide-react";

const MultiContactSelectorModal = ({ isOpen, onClose, onSelect, title, initialSelectedIds = [] }) => {
    const { users, getUsers } = useChatStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState(new Set(initialSelectedIds));

    useEffect(() => {
        if (isOpen) {
            getUsers();
            setSelectedIds(new Set(initialSelectedIds));
        }
    }, [isOpen, getUsers, initialSelectedIds]);

    const filteredUsers = users.filter((user) =>
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelection = (userId) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedIds(newSelected);
    };

    const handleDone = () => {
        onSelect(Array.from(selectedIds));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#111b21] w-full max-w-md rounded-2xl border border-white/5 flex flex-col max-h-[80vh] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#202c33]">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="hover:bg-white/5 rounded-full p-1 transition-colors">
                            <X className="size-6 text-zinc-400 hover:text-white" />
                        </button>
                        <h3 className="text-white font-bold text-lg">{title}</h3>
                    </div>
                </div>

                {/* Search */}
                <div className="p-3 bg-[#111b21]">
                    <div className="flex items-center gap-2 bg-[#202c33] rounded-lg px-3 py-2 border border-white/5 focus-within:border-[var(--wa-teal)]/30 transition-all">
                        <Search className="size-4 text-[var(--wa-gray)]" />
                        <input
                            type="text"
                            placeholder="Search contacts"
                            className="bg-transparent border-none outline-none text-[#e9edef] text-sm w-full placeholder-[var(--wa-gray)]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* User List */}
                <div className="flex-1 overflow-y-auto w-full p-2 scrollbar-thin scrollbar-thumb-white/10">
                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-10">
                            <User className="size-12 text-zinc-700 mx-auto mb-2" />
                            <p className="text-zinc-500">No contacts found</p>
                        </div>
                    ) : (
                        filteredUsers.map((user) => {
                            const isSelected = selectedIds.has(user._id);
                            return (
                                <div
                                    key={user._id}
                                    onClick={() => toggleSelection(user._id)}
                                    className={`w-full p-3 flex items-center gap-4 hover:bg-[#202c33] transition-all cursor-pointer rounded-xl group ${isSelected ? 'bg-[#202c33]' : ''}`}
                                >
                                    <div className="relative">
                                        <img
                                            src={user.profilePic || "/avatar.png"}
                                            alt={user.fullName}
                                            className="size-12 object-cover rounded-full border border-white/5"
                                        />
                                        {isSelected && (
                                            <div className="absolute -bottom-1 -right-1 bg-[var(--wa-teal)] rounded-full p-1 border-2 border-[#111b21]">
                                                <Check className="size-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <div className="font-bold text-[#e9edef] text-[16px] truncate">{user.fullName}</div>
                                        <div className="text-[13px] text-[var(--wa-gray)] truncate">PingMe User</div>
                                    </div>
                                    <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-[var(--wa-teal)] bg-[var(--wa-teal)]' : 'border-zinc-600'}`}>
                                        {isSelected && <Check className="size-4 text-white" />}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-white/5 bg-[#202c33]/50">
                    <button
                        onClick={handleDone}
                        className="w-full bg-[var(--wa-teal)] hover:bg-[#00a884] text-[#111b21] font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <Check className="size-5" />
                        Done ({selectedIds.size})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MultiContactSelectorModal;
