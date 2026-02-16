import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, Users, Image as ImageIcon, Check } from "lucide-react";
import toast from "react-hot-toast";

const NewGroupModal = ({ isOpen, onClose }) => {
    const { users, createGroup } = useChatStore();
    const [name, setName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [groupPic, setGroupPic] = useState(null);

    const handleToggleMember = (userId) => {
        if (selectedMembers.includes(userId)) {
            setSelectedMembers(selectedMembers.filter((id) => id !== userId));
        } else {
            setSelectedMembers([...selectedMembers, userId]);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setGroupPic(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateGroup = async () => {
        if (!name.trim()) return toast.error("Group name is required");
        if (selectedMembers.length === 0) return toast.error("Please select at least one member");

        await createGroup({
            name,
            members: selectedMembers,
            groupPic,
        });
        onClose();
        setName("");
        setSelectedMembers([]);
        setGroupPic(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#2a3942] w-full max-w-md rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 bg-[var(--wa-header-bg)] flex justify-between items-center">
                    <h2 className="text-[#e9edef] font-bold text-lg">Create New Group</h2>
                    <button onClick={onClose} className="text-[var(--wa-gray)] hover:text-white">
                        <X className="size-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Group Pic */}
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            <div className="size-24 rounded-full bg-[#111b21] flex items-center justify-center overflow-hidden border-2 border-zinc-700">
                                {groupPic ? (
                                    <img src={groupPic} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <ImageIcon className="size-10 text-zinc-600" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-[#00a884] p-2 rounded-full cursor-pointer hover:scale-110 transition-transform">
                                <ImageIcon className="size-4 text-white" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                        <p className="text-[var(--wa-gray)] text-xs mt-2 text-center">Add group icon</p>
                    </div>

                    {/* Group Name */}
                    <div className="space-y-2">
                        <label className="text-emerald-500 text-xs font-medium uppercase">Group Name</label>
                        <input
                            type="text"
                            placeholder="Enter group name..."
                            className="w-full bg-[#111b21] text-[#e9edef] border-b border-zinc-700 pb-1 outline-none px-1"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Member Selection */}
                    <div className="space-y-2">
                        <label className="text-emerald-500 text-xs font-medium uppercase flex items-center gap-1">
                            Select Members <span className="text-[var(--wa-gray)] text-[10px] normal-case">({selectedMembers.length} selected)</span>
                        </label>
                        <div className="space-y-2 mt-2">
                            {users.map((user) => (
                                <div
                                    key={user._id}
                                    onClick={() => handleToggleMember(user._id)}
                                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${selectedMembers.includes(user._id) ? "bg-[#202c33]" : "hover:bg-white/5"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <img src={user.profilePic || "/avatar.png"} className="size-8 rounded-full" alt="" />
                                        <span className="text-[#e9edef] text-sm">{user.fullName}</span>
                                    </div>
                                    {selectedMembers.includes(user._id) && <Check className="size-4 text-[#00a884]" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-[var(--wa-header-bg)] flex justify-end">
                    <button
                        onClick={handleCreateGroup}
                        disabled={!name.trim() || selectedMembers.length === 0}
                        className="bg-[#00a884] text-[#111b21] px-6 py-2 rounded font-bold hover:bg-[#06cf9c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm flex items-center gap-2"
                    >
                        Create Group
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewGroupModal;
