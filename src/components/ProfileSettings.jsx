import { ArrowLeft, Camera as CameraIcon, User as UserIcon, Info, Edit2, Check } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useState } from "react";

const ProfileSettings = () => {
    const { authUser, isProfileOpen, setProfileOpen, updateProfile, isCompiling } = useAuthStore();
    const [selectedImg, setSelectedImg] = useState(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [fullName, setFullName] = useState(authUser?.fullName || "");
    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [about, setAbout] = useState(authUser?.about || "Hey there! I am using PingMe.");
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [phone, setPhone] = useState(authUser?.phone || "");

    if (!isProfileOpen) return null;

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

    return (
        <div className="absolute inset-y-0 left-0 w-full lg:w-[400px] bg-[var(--wa-sidebar-bg)] border-r border-[var(--wa-header-bg)] z-50 flex flex-col animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="h-[60px] bg-[var(--wa-header-bg)] flex items-center px-4 gap-4 shrink-0">
                <button onClick={() => setProfileOpen(false)} className="text-[#e9edef] hover:bg-white/5 p-2 rounded-full transition-colors">
                    <ArrowLeft className="size-5" />
                </button>
                <div className="flex-1">
                    <h2 className="text-[#e9edef] text-[19px] font-medium leading-none">Profile</h2>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-[var(--wa-sidebar-bg)] px-6 pt-8 pb-28 custom-scrollbar">

                {/* Profile Pic */}
                <div className="flex justify-center mb-8 relative group cursor-pointer w-fit mx-auto">
                    <img
                        src={selectedImg || authUser.profilePic || "/avatar.png"}
                        alt="Profile"
                        className="size-48 rounded-full object-cover border-4 border-[var(--wa-sidebar-bg)] shadow-md"
                    />
                    <label
                        htmlFor="profile-upload"
                        className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white flex-col gap-2"
                    >
                        <CameraIcon className="size-8" />
                        <span className="text-xs uppercase text-center w-24">Change Profile Photo</span>
                    </label>
                    <input
                        type="file"
                        id="profile-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isCompiling}
                    />
                </div>

                {/* Name Section */}
                <div className="mb-8">
                    <div className="text-[#00a884] text-sm mb-4">Your name</div>
                    {isEditingName ? (
                        <div className="flex items-center gap-2 border-b-2 border-[#00a884] pb-1">
                            <input
                                type="text"
                                className="bg-transparent text-[#e9edef] text-[17px] outline-none w-full"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => e.key === "Enter" && handleUpdateName()}
                            />
                            <Check className="size-5 text-[#00a884] cursor-pointer" onClick={handleUpdateName} />
                        </div>
                    ) : (
                        <div
                            className="flex items-center justify-between text-[#e9edef] border-b-2 border-transparent hover:border-gray-600 pb-2 transition-colors cursor-pointer group"
                            onClick={() => setIsEditingName(true)}
                        >
                            <span className="text-[17px]">{authUser.fullName}</span>
                            <Edit2 className="size-5 text-[var(--wa-gray)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    )}
                    <p className="text-[var(--wa-gray)] text-xs mt-4">
                        This is not your username or pin. This name will be visible to your PingMe contacts.
                    </p>
                </div>

                {/* About Section */}
                <div className="mb-8">
                    <div className="text-[#00a884] text-sm mb-4">About</div>
                    {isEditingAbout ? (
                        <div className="flex items-center gap-2 border-b-2 border-[#00a884] pb-1">
                            <input
                                type="text"
                                className="bg-transparent text-[#e9edef] text-[17px] outline-none w-full"
                                value={about}
                                onChange={(e) => setAbout(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => e.key === "Enter" && handleUpdateAbout()}
                            />
                            <Check className="size-5 text-[#00a884] cursor-pointer" onClick={handleUpdateAbout} />
                        </div>
                    ) : (
                        <div
                            className="flex items-center justify-between text-[#e9edef] border-b-2 border-transparent hover:border-gray-600 pb-2 transition-colors cursor-pointer group"
                            onClick={() => setIsEditingAbout(true)}
                        >
                            <span className="text-[17px]">{authUser.about || "Hey there! I am using PingMe."}</span>
                            <Edit2 className="size-5 text-[var(--wa-gray)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    )}
                </div>

                {/* Phone Section */}
                <div className="mb-8">
                    <div className="text-[#00a884] text-sm mb-4">Phone</div>
                    {isEditingPhone ? (
                        <div className="flex items-center gap-2 border-b-2 border-[#00a884] pb-1">
                            <input
                                type="text"
                                className="bg-transparent text-[#e9edef] text-[17px] outline-none w-full"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => e.key === "Enter" && handleUpdatePhone()}
                            />
                            <Check className="size-5 text-[#00a884] cursor-pointer" onClick={handleUpdatePhone} />
                        </div>
                    ) : (
                        <div
                            className="flex items-center justify-between text-[#e9edef] border-b-2 border-transparent hover:border-gray-600 pb-2 transition-colors cursor-pointer group"
                            onClick={() => setIsEditingPhone(true)}
                        >
                            <span className="text-[17px]">{authUser.phone || "Add phone number"}</span>
                            <Edit2 className="size-5 text-[var(--wa-gray)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    )}
                </div>

                {/* Thank You Message */}
                <div className="mt-12 mb-8 text-center px-4">
                    <h3 className="text-[#00a884] text-xl font-bold italic opacity-80 mb-2">Thank you for using PingMe!</h3>
                    <p className="text-[var(--wa-gray)] text-xs">Your support keeps us going 💚</p>
                </div>

            </div>
        </div>
    );
};
export default ProfileSettings;
