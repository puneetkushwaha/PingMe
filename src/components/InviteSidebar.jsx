import { useState } from "react";
import { UserPlus, Search, MessageCircle, Share2 } from "lucide-react";
import toast from "react-hot-toast";

const InviteSidebar = () => {
    const [contacts, setContacts] = useState([]);
    const [isSupported, setIsSupported] = useState('contacts' in navigator);

    const handleGetContacts = async () => {
        if (!('contacts' in navigator)) {
            toast.error("Contact Picker API not supported on this browser.");
            return;
        }

        try {
            const props = ['name', 'tel'];
            const opts = { multiple: true };
            const selection = await navigator.contacts.select(props, opts);

            if (selection && selection.length > 0) {
                setContacts(selection);
                toast.success(`Fetched ${selection.length} contacts!`);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to access contacts.");
        }
    };

    const handleInvite = (contact) => {
        const name = contact.name?.[0] || "Friend";
        const phone = contact.tel?.[0]?.replace(/\s/g, "") || "";
        const message = encodeURIComponent(`Hey ${name}! Join me on PingMe – the ultimate secure chat app! 🚀 Download here: ${window.location.origin}`);

        // WhatsApp URL scheme
        const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
        window.open(whatsappUrl, "_blank");
    };

    return (
        <div className="h-full w-full lg:w-[400px] border-r border-[var(--wa-header-bg)] flex flex-col bg-[var(--wa-sidebar-bg)] transition-all duration-200">
            <div className="p-4 bg-[var(--wa-sidebar-bg)] h-16 flex items-center justify-between shrink-0">
                <h1 className="text-[#e9edef] text-[22px] font-bold">Invite Friends</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Hero Section */}
                <div className="text-center space-y-4">
                    <div className="size-20 bg-[#00a884]/10 rounded-full flex items-center justify-center mx-auto">
                        <UserPlus className="size-10 text-[#00a884]" />
                    </div>
                    <div>
                        <h3 className="text-[#e9edef] text-lg font-medium">Bring your friends to PingMe</h3>
                        <p className="text-[var(--wa-gray)] text-sm mt-2 px-4">
                            Connect with people you know and start chatting securely.
                        </p>
                    </div>

                    <button
                        onClick={handleGetContacts}
                        className="bg-[#00a884] text-[#111b21] px-6 py-2.5 rounded-full font-bold hover:bg-[#06cf9c] transition-colors flex items-center gap-2 mx-auto"
                    >
                        <Search className="size-5" />
                        Access Phone Contacts
                    </button>
                    {!isSupported && (
                        <p className="text-amber-500 text-xs mt-2 italic px-4">
                            Note: Contact access is mainly supported on mobile browsers.
                        </p>
                    )}
                </div>

                {/* Contacts List */}
                <div className="space-y-4">
                    {contacts.length > 0 && (
                        <h4 className="text-[#00a884] text-sm font-medium uppercase px-2">Contacts Ready to Invite</h4>
                    )}
                    <div className="space-y-2">
                        {contacts.map((contact, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-zinc-800 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-zinc-700 rounded-full flex items-center justify-center text-white font-bold">
                                        {contact.name?.[0]?.[0] || "?"}
                                    </div>
                                    <div>
                                        <p className="text-[#e9edef] font-medium text-sm">{contact.name?.[0] || "Unknown"}</p>
                                        <p className="text-[var(--wa-gray)] text-xs">{contact.tel?.[0] || "No number"}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleInvite(contact)}
                                    className="p-2 text-[#00a884] hover:bg-[#00a884]/20 rounded-full transition-colors"
                                    title="Invite via WhatsApp"
                                >
                                    <MessageCircle className="size-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Generic Share */}
                <div className="pt-8 border-t border-zinc-800">
                    <button
                        onClick={() => {
                            navigator.share?.({
                                title: 'PingMe Chat',
                                text: 'Join me on PingMe!',
                                url: window.location.origin
                            }).catch(err => toast.error("Sharing failed"));
                        }}
                        className="w-full flex items-center justify-center gap-2 text-[var(--wa-gray)] hover:text-white transition-colors py-2 border border-dashed border-zinc-700 rounded"
                    >
                        <Share2 className="size-4" />
                        Share Invite Link
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteSidebar;
