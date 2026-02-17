import { ArrowLeft, Search, UserPlus } from "lucide-react";
import SaveContactModal from "./SaveContactModal";

const ContactsSidebar = () => {
    const { getUsers, users, setSelectedUser } = useChatStore();
    const { setActiveSidebar, onlineUsers } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    const filteredUsers = users.filter((user) =>
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.phone && user.phone.includes(searchQuery))
    );

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setActiveSidebar("chats");
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#111b21]">
            <SaveContactModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} />

            {/* Header */}
            <div className="p-4 bg-[var(--wa-sidebar-bg)] h-[108px] flex flex-col justify-end shrink-0 gap-4">
                <div className="flex items-center gap-6">
                    <ArrowLeft
                        className="size-6 text-[#e9edef] cursor-pointer"
                        onClick={() => setActiveSidebar("chats")}
                    />
                    <h1 className="text-[#e9edef] text-[19px] font-medium">New Chat</h1>
                </div>
            </div>

            {/* Search */}
            <div className="px-3 py-2 bg-[var(--wa-sidebar-bg)] flex flex-col gap-2">
                <div className="flex items-center gap-2 bg-[var(--wa-header-bg)] rounded-lg px-2 py-1.5 h-[35px]">
                    <Search className="size-4 text-[var(--wa-gray)] pl-1" />
                    <input
                        type="text"
                        placeholder="Search by name or phone number"
                        className="bg-transparent border-none outline-none text-[#e9edef] text-sm w-full placeholder-[var(--wa-gray)] ml-2 focus:ring-0"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <button
                    onClick={() => setIsSaveModalOpen(true)}
                    className="flex items-center gap-4 px-3 py-3 hover:bg-[#202c33] transition-colors text-[var(--wa-teal)] group"
                >
                    <div className="size-10 bg-[var(--wa-teal)] rounded-full flex items-center justify-center text-[#111b21]">
                        <UserPlus className="size-5" />
                    </div>
                    <span className="font-medium text-sm text-[#e9edef]">New Contact (Save by Number)</span>
                </button>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto w-full py-2">
                {searchQuery ? (
                    <>
                        <h4 className="text-[#00a884] text-sm font-medium uppercase px-6 py-4">Search Results</h4>
                        {filteredUsers.length === 0 ? (
                            <div className="text-center text-[var(--wa-gray)] py-10 px-6">
                                <p>No users found for "{searchQuery}"</p>
                                <p className="text-xs mt-2">Try searching for a name or the exact phone number.</p>
                            </div>
                        ) : (
                            filteredUsers.map((user) => (
                                <div
                                    key={user._id}
                                    onClick={() => handleSelectUser(user)}
                                    className="w-full p-4 py-3 flex items-center gap-4 hover:bg-[#202c33] transition-colors cursor-pointer"
                                >
                                    <div className="relative">
                                        <img
                                            src={user.profilePic || "/avatar.png"}
                                            alt={user.fullName}
                                            className="size-12 object-cover rounded-full"
                                        />
                                        {onlineUsers.includes(user._id) && (
                                            <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 ring-2 ring-[#111b21] rounded-full" />
                                        )}
                                    </div>
                                    <div className="text-left border-b border-zinc-800 flex-1 pb-3">
                                        <div className="font-medium text-[#e9edef] text-[16px]">{user.fullName}</div>
                                        <div className="text-[13px] text-[var(--wa-gray)] truncate">
                                            {user.phone ? user.phone : "PingMe user"}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center px-10 py-20">
                        <div className="bg-[#202c33] p-6 rounded-full mb-4">
                            <Search className="size-10 text-[var(--wa-gray)]" />
                        </div>
                        <h3 className="text-[#e9edef] text-lg font-medium mb-2">Search for Users</h3>
                        <p className="text-[var(--wa-gray)] text-sm">
                            Type a name or phone number to find people on PingMe and start chatting.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactsSidebar;
