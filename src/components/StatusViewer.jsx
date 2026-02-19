import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Eye, Users, Send } from "lucide-react";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const StatusViewer = ({ statusItem, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [showViewers, setShowViewers] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isSendingReply, setIsSendingReply] = useState(false);

    const { viewStatus, sendMessage } = useChatStore();
    const { authUser } = useAuthStore();
    const currentStatus = statusItem.statuses[currentIndex];
    const isOwner = authUser._id === statusItem.user._id;

    useEffect(() => {
        setProgress(0);
        const duration = 5000;
        const interval = 50;
        const step = (interval / duration) * 100;

        // Record view if not owner
        if (!isOwner) {
            viewStatus(currentStatus._id);
        }

        const timer = setInterval(() => {
            if (showViewers || replyText) return; // Pause when viewing viewers OR typing reply

            setProgress((prev) => {
                if (prev >= 100) {
                    handleNext();
                    return 0;
                }
                return prev + step;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [currentIndex, showViewers]);

    const handleNext = () => {
        if (currentIndex < statusItem.statuses.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black flex flex-col items-center justify-center p-4">
            {/* Progress Bars */}
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
                {statusItem.statuses.map((_, idx) => (
                    <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-75 ease-linear"
                            style={{
                                width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%'
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                    <img src={statusItem.user.profilePic || "/avatar.png"} className="size-10 rounded-full border border-white/20 object-cover" alt="" />
                    <div>
                        <h3 className="text-white font-medium">{statusItem.user.fullName}</h3>
                        <p className="text-xs text-white/60">{new Date(currentStatus.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-white/80 hover:text-white p-2">
                    <X className="size-6" />
                </button>
            </div>

            {/* Main Content */}
            <div className="relative w-full max-w-lg aspect-[9/16] bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center">
                {currentStatus.type === "image" ? (
                    <img src={currentStatus.content} className="w-full h-full object-contain" alt="" />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center p-8 text-center"
                        style={{ backgroundColor: currentStatus.backgroundColor || "#111b21" }}
                    >
                        <p className="text-white text-2xl font-medium break-words max-w-full">
                            {currentStatus.content}
                        </p>
                    </div>
                )}

                {/* Navigation Overlays */}
                {!showViewers && (
                    <>
                        <div className="absolute inset-y-0 left-0 w-1/4 cursor-pointer" onClick={handlePrev}></div>
                        <div className="absolute inset-y-0 right-0 w-1/4 cursor-pointer" onClick={handleNext}></div>
                    </>
                )}

                {/* Status Options/Viewers Button for Owner */}
                {isOwner && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                        <button
                            onClick={() => setShowViewers(!showViewers)}
                            className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-white text-sm hover:bg-black/70 transition-all border border-white/10"
                        >
                            <Eye className="size-4" />
                            <span>{currentStatus.views?.length || 0} views</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Viewers Bottom Sheet/Overlay */}
            {showViewers && isOwner && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[120] flex flex-col justify-end">
                    <div className="bg-[#111b21] rounded-t-2xl max-h-[70%] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-[#e9edef] font-medium flex items-center gap-2">
                                <Users className="size-4 text-[var(--wa-teal)]" />
                                Viewed by
                            </h3>
                            <button onClick={() => setShowViewers(false)} className="text-zinc-400 hover:text-white">
                                <X className="size-5" />
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2">
                            {currentStatus.views && currentStatus.views.length > 0 ? (
                                currentStatus.views.map((viewer) => (
                                    <div key={viewer.userId._id || viewer._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5">
                                        <img src={viewer.userId.profilePic || viewer.profilePic || "/avatar.png"} className="size-10 rounded-full object-cover" alt="" />
                                        <div className="flex-1">
                                            <p className="text-[#e9edef] text-[15px] font-medium">{viewer.userId.fullName || viewer.fullName}</p>
                                            {viewer.viewedAt && (
                                                <p className="text-[13px] text-zinc-500">
                                                    {new Date(viewer.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <Eye className="size-10 text-zinc-700 mx-auto mb-2" />
                                    <p className="text-zinc-500 text-sm">No views yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Navigation Buttons */}
            <div className="hidden lg:flex absolute inset-x-10 top-1/2 -translate-y-1/2 justify-between">
                <button
                    onClick={handlePrev}
                    className={`p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors ${currentIndex === 0 ? 'invisible' : ''}`}
                >
                    <ChevronLeft className="size-8" />
                </button>
                <button
                    onClick={handleNext}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                    <ChevronRight className="size-8" />
                </button>
            </div>

            {/* Reply Input for Non-Owners */}
            {!isOwner && (
                <div className="absolute bottom-4 inset-x-4 z-[100] flex flex-col gap-2 animate-in slide-in-from-bottom duration-300">
                    <div className="flex justify-center gap-4 mb-2">
                        {['❤️', '😂', '😮', '😢', '👏', '🔥'].map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => {
                                    sendMessage({
                                        text: emoji,
                                        image: null,
                                        replyToStatusId: currentStatus._id // Assuming backed supports this or just context
                                    });
                                    toast.success("Reaction sent");
                                }}
                                className="text-2xl hover:scale-125 transition-transform bg-white/10 p-2 rounded-full backdrop-blur-sm"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && replyText.trim()) {
                                    sendMessage({
                                        text: replyText,
                                        image: null,
                                        // Context can be added here
                                    });
                                    setReplyText("");
                                    toast.success("Reply sent");
                                }
                            }}
                            placeholder="Type a reply..."
                            className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-3 px-4 text-white placeholder:text-white/60 outline-none focus:bg-white/20 transition-colors"
                        />
                        <button
                            onClick={() => {
                                if (replyText.trim()) {
                                    sendMessage({ text: replyText });
                                    setReplyText("");
                                    toast.success("Reply sent");
                                }
                            }}
                            className="p-3 bg-[#00a884] rounded-full text-white hover:bg-[#00b894] transition-colors"
                        >
                            <Send className="size-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatusViewer;
